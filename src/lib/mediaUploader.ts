/**
 * Media Uploader
 * Handles uploading media files to Supabase storage during backup restore
 */

import { supabase } from './supabase';
import { getFilenameFromUrl } from './mediaExtractor';

/**
 * Uploads a media file blob to Supabase storage
 * 
 * @param blob - File blob to upload
 * @param customerId - Customer ID for organizing files
 * @param originalUrl - Original URL (for extracting path/filename)
 * @param onProgress - Optional progress callback
 * @returns New Supabase storage URL
 */
export async function uploadMediaFile(
  blob: Blob,
  customerId: string,
  originalUrl: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Extract filename from original URL
  const filename = getFilenameFromUrl(originalUrl);
  
  // Construct storage path: customer-id/restored/filename
  const storagePath = `${customerId}/restored/${Date.now()}_${filename}`;

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('user-media')
    .upload(storagePath, blob, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload ${filename}: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('user-media')
    .getPublicUrl(data.path);

  onProgress?.(100);
  return urlData.publicUrl;
}

/**
 * Batch uploads multiple media files
 * 
 * @param files - Array of { blob, originalUrl } objects
 * @param customerId - Customer ID
 * @param onProgress - Progress callback with (current, total)
 * @returns Map of original URLs to new URLs
 */
export async function batchUploadMediaFiles(
  files: Array<{ blob: Blob; originalUrl: string }>,
  customerId: string,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  let completed = 0;

  for (const file of files) {
    try {
      const newUrl = await uploadMediaFile(
        file.blob,
        customerId,
        file.originalUrl
      );
      urlMap.set(file.originalUrl, newUrl);
    } catch (error) {
      console.error(`Failed to upload ${file.originalUrl}:`, error);
      // Continue with other files even if one fails
    }

    completed++;
    onProgress?.(completed, files.length);
  }

  return urlMap;
}

/**
 * Downloads a file from a URL as a Blob
 * 
 * @param url - URL to download from
 * @returns File blob
 */
export async function downloadFileAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Updates all image URLs in JSON data with new URLs
 * Recursively traverses and replaces old URLs with new ones
 * 
 * @param data - Website data object to update
 * @param urlMap - Map of old URLs to new URLs
 * @returns Updated data object
 */
export function replaceImageUrls(
  data: any,
  urlMap: Map<string, string>
): any {
  if (!data || typeof data !== 'object') return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => replaceImageUrls(item, urlMap));
  }

  // Handle objects
  const updated: any = {};
  for (const key in data) {
    const value = data[key];

    // If it's a string that matches an old URL, replace it
    if (typeof value === 'string' && urlMap.has(value)) {
      updated[key] = urlMap.get(value);
    } 
    // If it's an object, recursively update it
    else if (typeof value === 'object' && value !== null) {
      updated[key] = replaceImageUrls(value, urlMap);
    } 
    // Otherwise keep the value as-is
    else {
      updated[key] = value;
    }
  }

  return updated;
}

/**
 * Creates a user_media database entry for tracking uploaded files
 * 
 * @param url - Public URL of the uploaded file
 * @param customerId - Customer ID
 * @param folder - Folder name (default: "restored")
 */
export async function createMediaDatabaseEntry(
  url: string,
  customerId: string,
  folder: string = 'restored'
): Promise<void> {
  const filename = getFilenameFromUrl(url);

  // Determine media type from file extension
  const extension = filename.split('.').pop()?.toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
  const mediaType = imageExtensions.includes(extension || '') ? 'image' : 'file';

  const { error } = await supabase.from('user_media').insert({
    customer_id: customerId,
    url,
    folder,
    media_type: mediaType,
    metadata: {
      filename,
      source: 'backup_restore',
      uploaded_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error('Failed to create media database entry:', error);
    // Non-fatal error - file is uploaded, just not tracked in DB
  }
}

/**
 * Batch creates user_media database entries
 * 
 * @param urls - Array of { url, customerId, folder } objects
 */
export async function batchCreateMediaDatabaseEntries(
  entries: Array<{ url: string; customerId: string; folder?: string }>
): Promise<void> {
  const records = entries.map(({ url, customerId, folder = 'restored' }) => {
    const filename = getFilenameFromUrl(url);
    const extension = filename.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
    const mediaType = imageExtensions.includes(extension || '') ? 'image' : 'file';

    return {
      customer_id: customerId,
      url,
      folder,
      media_type: mediaType,
      metadata: {
        filename,
        source: 'backup_restore',
        uploaded_at: new Date().toISOString(),
      },
    };
  });

  const { error } = await supabase.from('user_media').insert(records);

  if (error) {
    console.error('Failed to create media database entries:', error);
    // Non-fatal error
  }
}
