import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Property, PropertyType } from '../../types';
import { createPropertyInSupabase } from '../../services/propertyService';
import { uploadToSupabaseStorage, deleteFileFromStorage } from '../../services/storageService';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { 
  X, 
  Home, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Maximize2, 
  Image as ImageIcon, 
  Camera, 
  Plus, 
  Check, 
  Sparkles,
  Building,
  Loader2,
  AlertCircle,
  Upload,
  Trash2
} from 'lucide-react';

interface PropertyListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProperty: Property) => void;
  onRequireLogin: () => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Apartment',
  'Studio',
  'Shared PG / Hostel',
  'Villa',
  'Independent House',
  'Study Room'
];

const DEFAULT_AMENITIES = [
  'High-Speed WiFi',
  '24/7 Power Backup',
  'Furnished Study Desks',
  'AC in Bedrooms',
  'Water Purifier',
  'Bike Parking',
  'Car Parking',
  'CCTV Security',
  'Attached Washroom',
  'Balcony',
  'Mess / Meal Service',
  'Washing Machine',
  'Daily Housekeeping',
  'Geyser / Hot Water',
  'Smart Door Lock'
];

export const PropertyListModal: React.FC<PropertyListModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onRequireLogin
}) => {
  const { user, isAuthenticated, addNotification } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<string>('12000');
  const [pricePeriod, setPricePeriod] = useState<'month' | 'semester' | 'year'>('month');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [areaSqft, setAreaSqft] = useState<number>(650);
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-Speed WiFi',
    'Furnished Study Desks',
    '24/7 Power Backup'
  ]);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Authentication Required
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Only logged-in users with a verified Supabase account can list and manage properties on the campus marketplace.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onRequireLogin();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Log In with Supabase
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const res = await uploadToSupabaseStorage(file, {
      featureName: 'properties',
      itemId: 'listing',
      fileName: file.name,
      userId: user.id,
      expiresInSeconds: 60 * 60 * 24 * 7
    });

    if (res.signedUrl) {
      setImages(prev => [res.signedUrl, ...prev]);
      addNotification('Photo Uploaded', 'Property image saved to Supabase Storage.', 'success');
    }
  };

  const handleAddImageUrl = () => {
    if (customImageUrl.trim()) {
      setImages(prev => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = async (index: number) => {
    const targetUrl = images[index];
    if (targetUrl) {
      await deleteFileFromStorage(targetUrl);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = async (base64Url: string) => {
    setShowCamera(false);
    if (!user?.id) {
      setImages(prev => [base64Url, ...prev]);
      return;
    }

    const res = await uploadToSupabaseStorage(base64Url, {
      featureName: 'properties',
      itemId: 'listing',
      fileName: 'live_shot',
      userId: user.id,
      expiresInSeconds: 60 * 60 * 24 * 7
    });

    if (res.signedUrl) {
      setImages(prev => [res.signedUrl, ...prev]);
    } else {
      setImages(prev => [base64Url, ...prev]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a property title');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please provide a property address / campus proximity');
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      setErrorMsg('Please enter a valid price amount');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('Please attach at least one photo of the property');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createPropertyInSupabase(
        {
          userId: user.id,
          ownerName: user.name,
          ownerEmail: user.email,
          ownerPhone: phone || user.phoneNumber || '',
          title: title.trim(),
          description: description.trim() || `${bedrooms} BHK ${propertyType} located at ${location.trim()}.`,
          price: numPrice,
          pricePeriod,
          location: location.trim(),
          propertyType,
          bedrooms,
          bathrooms,
          areaSqft,
          amenities: selectedAmenities,
          images,
          isAvailable: true
        },
        user.id
      );

      setIsSubmitting(false);

      if (res.success && res.property) {
        addNotification(
          'Property Listed Successfully',
          `"${res.property.title}" is now live and stored in Supabase under your user profile!`,
          'success'
        );
        onSuccess(res.property);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to publish property');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Error creating property listing');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
          
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-tight">
                  List New Property
                </h2>
                <p className="text-xs text-blue-100">
                  Save to Supabase database linked to your account ({user.name})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Property Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Spacious 2BHK Near Campus Gate 2 with High-Speed Wi-Fi"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Property Type & Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Property Category
                </label>
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Rent / Price (₹) *
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="12000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={pricePeriod}
                    onChange={e => setPricePeriod(e.target.value as any)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="month">/ Month</option>
                    <option value="semester">/ Sem</option>
                    <option value="year">/ Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Specs */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Location / Campus Proximity *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Green Valley Enclave, 5 mins walk to Tech Park Block"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Specs Row: Bedrooms, Bathrooms, Sqft */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-blue-500" />
                  <span>Bedrooms</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bedrooms}
                  onChange={e => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Baths</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bathrooms}
                  onChange={e => setBathrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-purple-500" />
                  <span>Area (sq.ft)</span>
                </label>
                <input
                  type="number"
                  step="50"
                  value={areaSqft}
                  onChange={e => setAreaSqft(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Highlight furnished items, study atmosphere, bus route connectivity, security, and meal policies..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Amenities Selectors */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">
                Amenities & Features
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_AMENITIES.map(amenity => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Photos & Live Camera Snapshot */}
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Property Photos ({images.length}) * (Storage: app-files)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 border border-blue-500/20 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Live Photo Shoot</span>
                  </button>
                </div>
              </div>

              {/* Photos Gallery Previews */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
                    <img src={imgUrl} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-all opacity-90 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Image URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={e => setCustomImageUrl(e.target.value)}
                  placeholder="Paste Unsplash / web image URL..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Publish Property</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Live Camera Snapshot Modal */}
      {showCamera && (
        <LiveCameraCaptureModal
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />
      )}
    </>
  );
};
