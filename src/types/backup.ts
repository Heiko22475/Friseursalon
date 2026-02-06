/**
 * Backup & Restore Type Definitions
 * Defines data structures for the admin backup/restore functionality
 */

/**
 * Backup information metadata
 * Stored as backup_info.json in the ZIP file
 */
export interface BackupInfo {
  /** Unique identifier for this backup */
  backupId: string;
  
  /** Customer/Website ID this backup belongs to */
  customerId: string;
  
  /** Timestamp when backup was created (ISO 8601) */
  createdAt: string;
  
  /** Domain of the website */
  domain?: string;
  
  /** Backup format version for future compatibility */
  version: '1.0';
  
  /** Human-readable backup description/note */
  description?: string;
  
  /** Statistics about the backup contents */
  stats: BackupStats;
}

/**
 * Statistics about backup contents
 */
export interface BackupStats {
  /** Number of pages in the website */
  pageCount: number;
  
  /** Total number of blocks across all pages */
  blockCount: number;
  
  /** Number of media files included */
  mediaFileCount: number;
  
  /** Total size of media files in bytes */
  mediaSizeBytes: number;
  
  /** Whether theme configuration is included */
  hasTheme: boolean;
  
  /** Whether navigation is included */
  hasNavigation: boolean;
}

/**
 * Complete website backup data
 * Stored as website.json in the ZIP file
 * This is essentially the websites.content JSONB column
 */
export interface WebsiteBackupData {
  /** Website pages */
  pages: any[]; // Using any[] to match existing websites.content structure
  
  /** Theme configuration */
  theme?: any;
  
  /** Navigation structure */
  navigation?: any;
  
  /** Footer configuration */
  footer?: any;
  
  /** Additional metadata */
  metadata?: {
    lastModified?: string;
    version?: string;
    [key: string]: any;
  };
}

/**
 * Result of a backup export operation
 */
export interface BackupExportResult {
  /** Whether the export was successful */
  success: boolean;
  
  /** Blob containing the ZIP file */
  blob?: Blob;
  
  /** Suggested filename for download */
  filename?: string;
  
  /** Backup info for reference */
  backupInfo?: BackupInfo;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Result of a backup import operation
 */
export interface BackupImportResult {
  /** Whether the import was successful */
  success: boolean;
  
  /** Backup info from the imported file */
  backupInfo?: BackupInfo;
  
  /** Number of media files restored */
  mediaFilesRestored?: number;
  
  /** Error message if failed */
  error?: string;
  
  /** Validation warnings (non-fatal) */
  warnings?: string[];
}

/**
 * Progress information during backup/restore operations
 */
export interface BackupProgress {
  /** Current step being executed */
  step: 'preparing' | 'extracting_images' | 'downloading_media' | 'creating_zip' | 'uploading_media' | 'updating_database' | 'complete';
  
  /** Progress percentage (0-100) */
  percentage: number;
  
  /** Human-readable message */
  message: string;
  
  /** Current item being processed */
  currentItem?: string;
  
  /** Total items to process */
  totalItems?: number;
  
  /** Processed items so far */
  processedItems?: number;
}

/**
 * Validation result for backup files
 */
export interface BackupValidationResult {
  /** Whether the backup file is valid */
  isValid: boolean;
  
  /** Validation errors (fatal) */
  errors: string[];
  
  /** Validation warnings (non-fatal) */
  warnings: string[];
  
  /** Extracted backup info if valid */
  backupInfo?: BackupInfo;
  
  /** Indicates if customer IDs match */
  customerIdMatch?: boolean;
}
