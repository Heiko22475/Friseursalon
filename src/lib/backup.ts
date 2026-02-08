/**
 * Backup & Restore Core Library
 * Handles export and import of website backups as ZIP files
 */

import JSZip from 'jszip';
import { supabase } from './supabase';
import { extractImageUrls, getFilenameFromUrl } from './mediaExtractor';
import { 
  downloadFileAsBlob
} from './mediaUploader';
import type {
  BackupInfo,
  BackupStats,
  WebsiteBackupData,
  BackupExportResult,
  BackupImportResult,
  BackupProgress,
  BackupValidationResult,
} from '../types/backup';

/**
 * Exports a complete website backup as a ZIP file
 * 
 * @param customerId - Customer ID to export
 * @param description - Optional backup description
 * @param onProgress - Progress callback
 * @returns Export result with blob and metadata
 */
export async function exportBackup(
  customerId: string,
  description?: string,
  onProgress?: (progress: BackupProgress) => void
): Promise<BackupExportResult> {
  try {
    onProgress?.({
      step: 'preparing',
      percentage: 0,
      message: 'Bereite Backup vor...',
    });

    // 1. Fetch website data from Supabase
    const { data: websiteData, error: fetchError } = await supabase
      .from('websites')
      .select('id, customer_id, domain, content')
      .eq('customer_id', customerId)
      .single();

    if (fetchError || !websiteData) {
      throw new Error('Website-Daten konnten nicht geladen werden');
    }

    const content: WebsiteBackupData = websiteData.content || {};

    onProgress?.({
      step: 'extracting_images',
      percentage: 10,
      message: 'Extrahiere Bild-URLs...',
    });

    // 2. Extract all image URLs from the JSON
    const imageUrls = extractImageUrls(content);

    onProgress?.({
      step: 'downloading_media',
      percentage: 20,
      message: `Lade ${imageUrls.length} Medien-Dateien herunter...`,
      totalItems: imageUrls.length,
      processedItems: 0,
    });

    // 3. Download all media files as blobs
    const mediaBlobs = new Map<string, Blob>();
    let mediaSizeBytes = 0;

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      try {
        const blob = await downloadFileAsBlob(url);
        mediaBlobs.set(url, blob);
        mediaSizeBytes += blob.size;

        onProgress?.({
          step: 'downloading_media',
          percentage: 20 + (i + 1) / imageUrls.length * 60,
          message: `Lade Medien-Dateien herunter... (${i + 1}/${imageUrls.length})`,
          currentItem: getFilenameFromUrl(url),
          totalItems: imageUrls.length,
          processedItems: i + 1,
        });
      } catch (error) {
        console.error(`Failed to download ${url}:`, error);
        // Continue with other files
      }
    }

    onProgress?.({
      step: 'creating_zip',
      percentage: 80,
      message: 'Erstelle ZIP-Archiv...',
    });

    // 4. Create backup info
    const backupInfo: BackupInfo = {
      backupId: crypto.randomUUID(),
      customerId,
      domain: websiteData.domain || undefined,
      createdAt: new Date().toISOString(),
      version: '1.0',
      description,
      stats: calculateBackupStats(content, imageUrls.length, mediaSizeBytes),
    };

    // 5. Create ZIP file
    const zip = new JSZip();

    // Add backup info
    zip.file('backup_info.json', JSON.stringify(backupInfo, null, 2));

    // Add website data
    zip.file('website.json', JSON.stringify(content, null, 2));

    // Add media files in media/ folder
    const mediaFolder = zip.folder('media');
    if (mediaFolder) {
      for (const [url, blob] of mediaBlobs.entries()) {
        const filename = getFilenameFromUrl(url);
        mediaFolder.file(filename, blob);
      }
    }

    onProgress?.({
      step: 'creating_zip',
      percentage: 95,
      message: 'Finalisiere ZIP-Archiv...',
    });

    // 6. Generate ZIP blob
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // 7. Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `backup_${customerId}_${timestamp}.zip`;

    onProgress?.({
      step: 'complete',
      percentage: 100,
      message: 'Backup erfolgreich erstellt!',
    });

    return {
      success: true,
      blob,
      filename,
      backupInfo,
    };
  } catch (error) {
    console.error('Backup export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    };
  }
}

/**
 * Validates a backup ZIP file before import
 * 
 * @param file - ZIP file to validate
 * @param expectedCustomerId - Customer ID to validate against
 * @returns Validation result
 */
export async function validateBackup(
  file: File,
  expectedCustomerId: string
): Promise<BackupValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Load ZIP
    const zip = await JSZip.loadAsync(file);

    // Check required files
    if (!zip.file('backup_info.json')) {
      errors.push('backup_info.json fehlt');
    }
    if (!zip.file('website.json')) {
      errors.push('website.json fehlt');
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Parse backup info
    const infoFile = zip.file('backup_info.json');
    const infoContent = await infoFile!.async('string');
    const backupInfo: BackupInfo = JSON.parse(infoContent);

    // Validate backup info structure
    if (!backupInfo.backupId) errors.push('Backup-ID fehlt');
    if (!backupInfo.customerId) errors.push('Customer-ID fehlt');
    if (!backupInfo.version) errors.push('Version fehlt');

    // Check customer ID match
    const customerIdMatch = backupInfo.customerId === expectedCustomerId;
    if (!customerIdMatch) {
      warnings.push(
        `Customer-ID stimmt nicht überein (Backup: ${backupInfo.customerId}, Aktuell: ${expectedCustomerId})`
      );
    }

    // Check website.json structure
    const websiteFile = zip.file('website.json');
    const websiteContent = await websiteFile!.async('string');
    const websiteData = JSON.parse(websiteContent);

    if (!websiteData.pages) {
      warnings.push('Keine Seiten im Backup gefunden');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      backupInfo,
      customerIdMatch,
    };
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : 'Fehler beim Lesen der Backup-Datei'
    );
    return { isValid: false, errors, warnings };
  }
}

/**
 * Imports a backup ZIP file and restores the website
 * 
 * @param file - ZIP file to import
 * @param customerId - Customer ID to import to
 * @param onProgress - Progress callback
 * @returns Import result
 */
export async function importBackup(
  file: File,
  customerId: string,
  onProgress?: (progress: BackupProgress) => void
): Promise<BackupImportResult> {
  try {
    onProgress?.({
      step: 'preparing',
      percentage: 0,
      message: 'Validiere Backup...',
    });

    // 1. Validate backup
    const validation = await validateBackup(file, customerId);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Backup-Validation fehlgeschlagen: ${validation.errors.join(', ')}`,
      };
    }

    onProgress?.({
      step: 'extracting_images',
      percentage: 10,
      message: 'Extrahiere Backup-Dateien...',
    });

    // 2. Load ZIP
    const zip = await JSZip.loadAsync(file);

    // 3. Extract backup info
    const infoFile = zip.file('backup_info.json')!;
    const infoContent = await infoFile.async('string');
    const backupInfo: BackupInfo = JSON.parse(infoContent);

    // 4. Extract website data
    const websiteFile = zip.file('website.json')!;
    const websiteContent = await websiteFile.async('string');
    let websiteData: WebsiteBackupData = JSON.parse(websiteContent);

    onProgress?.({
      step: 'uploading_media',
      percentage: 20,
      message: 'Lade Medien-Dateien hoch...',
    });

    // 5. Extract and upload media files
    const mediaFolder = zip.folder('media');
    const urlMap = new Map<string, string>();
    
    if (mediaFolder) {
      const mediaFiles = Object.keys(mediaFolder.files).filter(
        name => !mediaFolder.files[name].dir
      );

      for (let i = 0; i < mediaFiles.length; i++) {
        const filename = mediaFiles[i].replace('media/', '');
        const file = mediaFolder.files[mediaFiles[i]];
        
        try {
          const blob = await file.async('blob');
          
          // Upload to Supabase storage
          const storagePath = `${customerId}/restored/${Date.now()}_${filename}`;
          const { data, error } = await supabase.storage
            .from('user-media')
            .upload(storagePath, blob, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) throw error;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('user-media')
            .getPublicUrl(data.path);

          // Map old filename to new URL
          // Note: We need to reconstruct the old URL from the backup
          // This is a simplified approach - in practice, you might need to store
          // the original URLs in the backup or use a different mapping strategy
          urlMap.set(filename, urlData.publicUrl);

          onProgress?.({
            step: 'uploading_media',
            percentage: 20 + (i + 1) / mediaFiles.length * 60,
            message: `Lade Medien-Dateien hoch... (${i + 1}/${mediaFiles.length})`,
            currentItem: filename,
            totalItems: mediaFiles.length,
            processedItems: i + 1,
          });
        } catch (error) {
          console.error(`Failed to upload ${filename}:`, error);
        }
      }
    }

    onProgress?.({
      step: 'updating_database',
      percentage: 85,
      message: 'Aktualisiere Website-Daten...',
    });

    // 6. Update image URLs in website data
    // Note: This is complex because we need to match old URLs to filenames
    // For MVP, we'll preserve the URLs as-is and let the admin fix them manually
    // In Phase 2, we could implement intelligent URL mapping

    // 7. Update database
    const { error: updateError } = await supabase
      .from('websites')
      .update({ content: websiteData })
      .eq('customer_id', customerId);

    if (updateError) {
      throw new Error(`Datenbank-Update fehlgeschlagen: ${updateError.message}`);
    }

    onProgress?.({
      step: 'complete',
      percentage: 100,
      message: 'Import erfolgreich abgeschlossen!',
    });

    return {
      success: true,
      backupInfo,
      mediaFilesRestored: urlMap.size,
      warnings: validation.warnings,
    };
  } catch (error) {
    console.error('Backup import failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    };
  }
}

/**
 * Calculates statistics for backup metadata
 */
function calculateBackupStats(
  content: WebsiteBackupData,
  mediaFileCount: number,
  mediaSizeBytes: number
): BackupStats {
  const pages = content.pages || [];
  let blockCount = 0;

  for (const page of pages) {
    if (page.blocks && Array.isArray(page.blocks)) {
      blockCount += page.blocks.length;
    }
  }

  return {
    pageCount: pages.length,
    blockCount,
    mediaFileCount,
    mediaSizeBytes,
    hasTheme: !!content.theme,
    hasNavigation: !!content.navigation,
  };
}
