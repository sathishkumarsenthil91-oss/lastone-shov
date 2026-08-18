import { Property, SavedProperty } from '../types';
import { supabase } from './supabase';
import { INITIAL_PROPERTIES } from '../data/mockData';

const LOCAL_STORAGE_PROPERTIES_KEY = 'shov_properties_list';
const LOCAL_STORAGE_SAVED_KEY = 'shov_user_saved_properties';

// Initialize properties in local store if not present
export function getLocalProperties(): Property[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PROPERTIES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading properties from localStorage:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_PROPERTIES_KEY, JSON.stringify(INITIAL_PROPERTIES));
  return INITIAL_PROPERTIES;
}

export function saveLocalProperties(props: Property[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PROPERTIES_KEY, JSON.stringify(props));
  } catch (e) {
    console.warn('Error saving properties to localStorage:', e);
  }
}

// Get user saved IDs map: Record<userId, string[]>
function getLocalSavedMap(): Record<string, string[]> {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading saved properties map:', e);
  }
  // Default demo likes for Aarav (u-student-1)
  const defaultMap: Record<string, string[]> = {
    'u-student-1': ['prop-101', 'prop-102']
  };
  localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(defaultMap));
  return defaultMap;
}

function saveLocalSavedMap(map: Record<string, string[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Error saving saved properties map:', e);
  }
}

/**
 * Fetch all properties from Supabase & fallback cache
 */
export async function fetchAllProperties(currentUserId?: string): Promise<Property[]> {
  let properties: Property[] = getLocalProperties();

  try {
    // Attempt Supabase fetch
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: Property[] = data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        ownerName: row.owner_name || 'Property Owner',
        ownerEmail: row.owner_email || '',
        ownerPhone: row.owner_phone || '',
        title: row.title,
        description: row.description,
        price: Number(row.price),
        pricePeriod: row.price_period || 'month',
        location: row.location,
        propertyType: row.property_type || 'Apartment',
        bedrooms: Number(row.bedrooms || 1),
        bathrooms: Number(row.bathrooms || 1),
        areaSqft: Number(row.area_sqft || 500),
        amenities: Array.isArray(row.amenities) ? row.amenities : [],
        images: Array.isArray(row.images) ? row.images : (row.image_url ? [row.image_url] : []),
        isAvailable: row.is_available ?? true,
        likesCount: Number(row.likes_count || 0),
        createdAt: row.created_at || new Date().toISOString()
      }));

      // Merge Supabase properties with mock items if needed
      const existingIds = new Set(mapped.map(p => p.id));
      const combined = [...mapped];
      for (const p of INITIAL_PROPERTIES) {
        if (!existingIds.has(p.id)) {
          combined.push(p);
        }
      }
      properties = combined;
      saveLocalProperties(properties);
    }
  } catch (err) {
    console.warn('Supabase properties fetch fallback to local cache:', err);
  }

  // Determine user-specific like states
  if (currentUserId) {
    const savedIds = await fetchUserSavedPropertyIds(currentUserId);
    return properties.map(p => ({
      ...p,
      isLiked: savedIds.includes(p.id)
    }));
  }

  return properties.map(p => ({ ...p, isLiked: false }));
}

/**
 * Fetch saved property IDs for a specific user from Supabase
 */
export async function fetchUserSavedPropertyIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .select('property_id')
      .eq('user_id', userId);

    if (!error && data) {
      const ids = data.map((row: any) => row.property_id);
      // Sync local
      const map = getLocalSavedMap();
      map[userId] = ids;
      saveLocalSavedMap(map);
      return ids;
    }
  } catch (err) {
    console.warn('Supabase saved_properties fetch notice:', err);
  }

  const map = getLocalSavedMap();
  return map[userId] || [];
}

/**
 * Save/Like a property in Supabase (Requires Logged-In User)
 */
export async function savePropertyToSupabase(userId: string, propertyId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'Authentication required. Please log in to save properties.' };
  }

  // Update local store immediately for zero-latency UI
  const map = getLocalSavedMap();
  const userSaved = new Set(map[userId] || []);
  userSaved.add(propertyId);
  map[userId] = Array.from(userSaved);
  saveLocalSavedMap(map);

  const allProps = getLocalProperties();
  const target = allProps.find(p => p.id === propertyId);
  if (target) {
    target.likesCount = (target.likesCount || 0) + 1;
    saveLocalProperties(allProps);
  }

  // Sync to Supabase
  try {
    const { error } = await supabase
      .from('saved_properties')
      .insert([
        {
          user_id: userId,
          property_id: propertyId,
          created_at: new Date().toISOString()
        }
      ]);

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.warn('Supabase insert saved_properties notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase network notice:', err?.message);
  }

  return { success: true };
}

/**
 * Remove/Unlike a property from Supabase (Requires Logged-In User)
 */
export async function removeSavedPropertyFromSupabase(userId: string, propertyId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'Authentication required.' };
  }

  // Update local store immediately
  const map = getLocalSavedMap();
  if (map[userId]) {
    map[userId] = map[userId].filter(id => id !== propertyId);
    saveLocalSavedMap(map);
  }

  const allProps = getLocalProperties();
  const target = allProps.find(p => p.id === propertyId);
  if (target && (target.likesCount || 0) > 0) {
    target.likesCount = (target.likesCount || 1) - 1;
    saveLocalProperties(allProps);
  }

  // Sync to Supabase
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) {
      console.warn('Supabase delete saved_properties notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase network notice:', err?.message);
  }

  return { success: true };
}

/**
 * Create/List a new Property in Supabase (Requires Logged-In User)
 */
export async function createPropertyInSupabase(
  payload: Omit<Property, 'id' | 'createdAt' | 'likesCount' | 'isLiked'>,
  userId: string
): Promise<{ success: boolean; property?: Property; error?: string }> {
  if (!userId) {
    return { success: false, error: 'Authentication required. Please sign in to list a property.' };
  }

  const newPropertyId = `prop-${Date.now()}`;
  const now = new Date().toISOString();

  const newProperty: Property = {
    ...payload,
    id: newPropertyId,
    userId,
    likesCount: 0,
    isLiked: false,
    createdAt: now,
    updatedAt: now
  };

  // 1. Save locally
  const allProps = getLocalProperties();
  allProps.unshift(newProperty);
  saveLocalProperties(allProps);

  // 2. Insert into Supabase table `properties`
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([
        {
          id: newPropertyId,
          user_id: userId,
          owner_name: payload.ownerName,
          owner_email: payload.ownerEmail,
          owner_phone: payload.ownerPhone || null,
          title: payload.title,
          description: payload.description,
          price: payload.price,
          price_period: payload.pricePeriod || 'month',
          location: payload.location,
          property_type: payload.propertyType,
          bedrooms: payload.bedrooms,
          bathrooms: payload.bathrooms,
          area_sqft: payload.areaSqft,
          amenities: payload.amenities,
          images: payload.images,
          is_available: payload.isAvailable ?? true,
          created_at: now
        }
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert properties notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase property insert error:', err?.message);
  }

  return { success: true, property: newProperty };
}

/**
 * Delete a property listed by the user
 */
export async function deletePropertyFromSupabase(propertyId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'Authentication required.' };
  }

  // 1. Delete locally
  const allProps = getLocalProperties();
  const filtered = allProps.filter(p => p.id !== propertyId);
  saveLocalProperties(filtered);

  // Also remove from any saved lists
  const map = getLocalSavedMap();
  for (const uid in map) {
    map[uid] = map[uid].filter(id => id !== propertyId);
  }
  saveLocalSavedMap(map);

  // 2. Delete from Supabase
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase delete property notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase delete property error:', err?.message);
  }

  return { success: true };
}

/**
 * Get all properties liked by a specific user
 */
export async function getUserLikedProperties(userId: string): Promise<Property[]> {
  if (!userId) return [];
  const savedIds = await fetchUserSavedPropertyIds(userId);
  const allProps = await fetchAllProperties(userId);
  return allProps.filter(p => savedIds.includes(p.id)).map(p => ({ ...p, isLiked: true }));
}

/**
 * Get all properties listed by a specific user
 */
export async function getUserListedProperties(userId: string): Promise<Property[]> {
  if (!userId) return [];
  const allProps = await fetchAllProperties(userId);
  return allProps.filter(p => p.userId === userId);
}
