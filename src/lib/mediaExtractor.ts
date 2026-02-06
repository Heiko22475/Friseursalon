/**
 * Media Extractor
 * Extracts all image URLs from website JSON data
 */

import type { WebsiteBackupData } from '../types/backup';

/**
 * Extracts all unique image URLs from the website JSON
 * Recursively traverses the entire JSON structure to find image references
 * 
 * @param websiteData - The website content JSON
 * @returns Array of unique image URLs
 */
export function extractImageUrls(websiteData: WebsiteBackupData): string[] {
  const urls = new Set<string>();

  /**
   * Recursively search through an object for image URLs
   */
  function traverse(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    // Check if this is an array
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }

    // Check all properties of the object
    for (const key in obj) {
      const value = obj[key];

      // Common property names that contain image URLs
      const imagePropertyNames = [
        'url', 'imageUrl', 'image', 'backgroundImage', 
        'src', 'imageSrc', 'logo', 'icon', 'avatar',
        'thumbnail', 'cover', 'banner', 'heroImage'
      ];

      // If the property name suggests it contains an image
      if (imagePropertyNames.includes(key) && typeof value === 'string') {
        // Check if it's a Supabase storage URL
        if (isSupabaseStorageUrl(value)) {
          urls.add(value);
        }
      }

      // Recursively traverse nested objects
      if (typeof value === 'object' && value !== null) {
        traverse(value);
      }
    }
  }

  traverse(websiteData);
  return Array.from(urls);
}

/**
 * Checks if a URL is a Supabase storage URL
 * 
 * @param url - URL string to check
 * @returns True if URL is from Supabase storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for Supabase storage URL pattern
  // Typical pattern: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
  return url.includes('.supabase.co/storage/') || 
         url.includes('/storage/v1/object/public/');
}

/**
 * Gets the filename from a Supabase storage URL
 * 
 * @param url - Supabase storage URL
 * @returns Filename extracted from URL
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract filename from path
    const parts = pathname.split('/');
    return parts[parts.length - 1] || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Gets the storage path from a Supabase storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/user-media/customer123/folder/image.jpg
 * Returns: customer123/folder/image.jpg
 * 
 * @param url - Supabase storage URL
 * @returns Storage path within the bucket
 */
export function getStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Find the bucket name and everything after it
    // Pattern: /storage/v1/object/public/[bucket-name]/[path]
    const match = pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Groups image URLs by their folder structure
 * 
 * @param urls - Array of image URLs
 * @returns Object mapping folder paths to arrays of URLs
 */
export function groupUrlsByFolder(urls: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const url of urls) {
    const path = getStoragePathFromUrl(url);
    if (!path) continue;

    // Extract folder (everything before the last /)
    const lastSlash = path.lastIndexOf('/');
    const folder = lastSlash > 0 ? path.substring(0, lastSlash) : 'root';

    if (!grouped[folder]) {
      grouped[folder] = [];
    }
    grouped[folder].push(url);
  }

  return grouped;
}

/**
 * Validates if all URLs in the array are accessible
 * 
 * @param urls - Array of URLs to validate
 * @returns Object with validation results
 */
export async function validateImageUrls(urls: string[]): Promise<{
  valid: string[];
  invalid: string[];
  errors: Record<string, string>;
}> {
  const valid: string[] = [];
  const invalid: string[] = [];
  const errors: Record<string, string> = {};

  // Check each URL with a HEAD request
  const checks = urls.map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        valid.push(url);
      } else {
        invalid.push(url);
        errors[url] = `HTTP ${response.status}`;
      }
    } catch (error) {
      invalid.push(url);
      errors[url] = error instanceof Error ? error.message : 'Unknown error';
    }
  });

  await Promise.all(checks);

  return { valid, invalid, errors };
}
