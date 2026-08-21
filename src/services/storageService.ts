import { supabase } from '../supabaseClient';

export const SUPABASE_STORAGE_BUCKET = 'app-files';

// In-memory signed URL cache to avoid redundant API calls during component re-renders
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Get current authenticated user ID from Supabase or fallback
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) {
      return data.user.id;
    }
  } catch (err) {
    console.warn('Error fetching auth user for storage:', err);
  }
  return 'anonymous-user';
}

/**
 * Generate a unique file path according to the rule:
 * ${auth.uid()}/${featureName}/${itemId}/${uuid}.${extension}
 */
export function buildStoragePath(
  userId: string,
  featureName: string,
  itemId: string = 'general',
  fileName: string = 'file',
  extension: string = 'jpg'
): string {
  const cleanExt = extension.replace(/^\./, '') || 'jpg';
  const uniqueUuid = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const sanitizedItemId = (itemId || 'general').replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedFeature = (featureName || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${userId}/${sanitizedFeature}/${sanitizedItemId}/${uniqueUuid}.${cleanExt}`;
}

/**
 * Convert Data URI (base64) or URL to Blob
 */
async function dataUriToBlob(dataUri: string): Promise<{ blob: Blob; mimeType: string; ext: string }> {
  if (dataUri.startsWith('data:')) {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mimeType.split('/')[1] || 'jpg';
    return { blob: new Blob([u8arr], { type: mimeType }), mimeType, ext };
  } else {
    const res = await fetch(dataUri);
    const blob = await res.blob();
    const mimeType = blob.type || 'image/jpeg';
    const ext = mimeType.split('/')[1] || 'jpg';
    return { blob, mimeType, ext };
  }
}

export interface UploadOptions {
  featureName: string; // e.g. 'avatars', 'circulars', 'dispatches', 'gate-passes', 'academic', 'inquiries', 'properties', 'onboarding'
  itemId?: string; // e.g. record ID, student ID, circular ID, or 'draft'
  fileName?: string;
  userId?: string;
  expiresInSeconds?: number; // default: 7 days
}

export interface UploadResult {
  success: boolean;
  filePath: string;
  signedUrl: string;
  error?: string;
}

/**
 * Upload a File, Blob, or Data URL to the private 'app-files' bucket in Supabase Storage.
 * Generates and returns both the private file path (saved in DB) and a signed URL for display.
 */
export async function uploadToSupabaseStorage(
  fileInput: File | Blob | string,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const userId = options.userId || (await getCurrentUserId());
    let blob: Blob;
    let contentType = 'image/jpeg';
    let fileExtension = 'jpg';

    if (typeof fileInput === 'string') {
      if (!fileInput.startsWith('data:') && !fileInput.startsWith('blob:')) {
        // If it's already an existing URL or storage path, return as is
        return {
          success: true,
          filePath: fileInput,
          signedUrl: await getSignedFileUrl(fileInput, options.expiresInSeconds)
        };
      }
      const converted = await dataUriToBlob(fileInput);
      blob = converted.blob;
      contentType = converted.mimeType;
      fileExtension = converted.ext;
    } else if (fileInput instanceof File) {
      blob = fileInput;
      contentType = fileInput.type || 'application/octet-stream';
      const nameParts = fileInput.name.split('.');
      if (nameParts.length > 1) {
        fileExtension = nameParts.pop() || 'bin';
      }
    } else {
      blob = fileInput;
      contentType = fileInput.type || 'image/jpeg';
      fileExtension = contentType.split('/')[1] || 'jpg';
    }

    // Structure: ${auth.uid()}/${featureName}/${itemId}/${uuid}.${extension}
    const storagePath = buildStoragePath(
      userId,
      options.featureName,
      options.itemId || 'general',
      options.fileName || 'upload',
      fileExtension
    );

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, blob, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError);
      // If upload fails, create temporary fallback signed/data URL
      const fallbackUrl = typeof fileInput === 'string' ? fileInput : URL.createObjectURL(blob);
      return {
        success: false,
        filePath: storagePath,
        signedUrl: fallbackUrl,
        error: uploadError.message
      };
    }

    // Generate signed URL for private bucket viewing (default 7 days = 604800s)
    const expiresIn = options.expiresInSeconds || 60 * 60 * 24 * 7;
    const { data: signedData, error: signError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    const signedUrl = (!signError && signedData?.signedUrl) ? signedData.signedUrl : storagePath;

    // Cache the signed URL
    signedUrlCache.set(storagePath, {
      url: signedUrl,
      expiresAt: Date.now() + (expiresIn - 60) * 1000
    });

    return {
      success: true,
      filePath: storagePath,
      signedUrl
    };
  } catch (err: any) {
    console.error('Unexpected error uploading to Supabase Storage:', err);
    return {
      success: false,
      filePath: '',
      signedUrl: typeof fileInput === 'string' ? fileInput : '',
      error: err?.message || 'Storage upload error.'
    };
  }
}

/**
 * Get a signed URL for a file stored in the private 'app-files' bucket.
 * Handles existing full HTTP URLs gracefully.
 */
export async function getSignedFileUrl(
  filePathOrUrl?: string | null,
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days default
): Promise<string> {
  if (!filePathOrUrl) return '';

  // If already a full http(s) URL with token or third-party image, return directly
  if (
    filePathOrUrl.startsWith('data:') ||
    filePathOrUrl.startsWith('blob:') ||
    filePathOrUrl.includes('unsplash.com') ||
    filePathOrUrl.includes('dicebear.com') ||
    filePathOrUrl.includes('token=')
  ) {
    return filePathOrUrl;
  }

  // Check cache
  const cached = signedUrlCache.get(filePathOrUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(filePathOrUrl, expiresInSeconds);

    if (error || !data?.signedUrl) {
      // If createSignedUrl fails because it might be a full URL without token, return as is
      return filePathOrUrl;
    }

    signedUrlCache.set(filePathOrUrl, {
      url: data.signedUrl,
      expiresAt: Date.now() + (expiresInSeconds - 60) * 1000
    });

    return data.signedUrl;
  } catch (err) {
    console.warn('Error obtaining signed URL from Supabase Storage:', err);
    return filePathOrUrl;
  }
}

/**
 * Delete a file from the private 'app-files' Supabase Storage bucket
 */
export async function deleteFileFromStorage(filePath?: string | null): Promise<{ success: boolean; error?: string }> {
  if (!filePath) return { success: true };

  // If it's an external url or base64, nothing to delete from Supabase storage
  if (filePath.startsWith('data:') || filePath.startsWith('blob:') || filePath.includes('unsplash.com') || filePath.includes('dicebear.com')) {
    return { success: true };
  }

  try {
    // Extract relative storage path if full URL was provided
    let cleanPath = filePath;
    if (cleanPath.includes(`${SUPABASE_STORAGE_BUCKET}/`)) {
      cleanPath = cleanPath.split(`${SUPABASE_STORAGE_BUCKET}/`)[1].split('?')[0];
    }

    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .remove([cleanPath]);

    if (error) {
      console.warn('Supabase storage file deletion error:', error.message);
      return { success: false, error: error.message };
    }

    signedUrlCache.delete(filePath);
    signedUrlCache.delete(cleanPath);
    return { success: true };
  } catch (err: any) {
    console.warn('Unexpected error deleting file from Supabase storage:', err);
    return { success: false, error: err?.message || 'Deletion error' };
  }
}
