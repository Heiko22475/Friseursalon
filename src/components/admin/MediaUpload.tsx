import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface MediaCategory {
  id: string;
  name: string;
  display_name: string;
  bucket_name: string;
  max_file_size: number;
  allowed_mime_types: string[];
}

interface MediaUploadProps {
  folderId: string;
  category: MediaCategory;
  customerId: string;
  onComplete: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  title: string;
  altText: string;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'duplicate';
  progress: number;
  error?: string;
  hash?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  folderId,
  category,
  customerId,
  onComplete,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadCountRef = React.useRef({ total: 0, completed: 0 });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Max 30 files
      const totalFiles = files.length + acceptedFiles.length;
      if (totalFiles > 30) {
        alert('Maximal 30 Dateien pro Upload!');
        return;
      }

      // Validate file size and type
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > category.max_file_size) {
          alert(
            `${file.name}: Datei zu groß! Max ${Math.round(
              category.max_file_size / (1024 * 1024)
            )}MB`
          );
          return false;
        }

        if (!category.allowed_mime_types.includes(file.type)) {
          alert(`${file.name}: Dateityp nicht erlaubt!`);
          return false;
        }

        return true;
      });

      const newFiles: UploadFile[] = validFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substring(7),
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        altText: '',
        status: 'pending',
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files, category]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: category.allowed_mime_types.reduce(
      (acc, mimeType) => ({ ...acc, [mimeType]: [] }),
      {}
    ),
    maxFiles: 30,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const generateFilename = (title: string, extension: string): string => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const random = Math.random().toString(36).substring(2, 8);
    
    // Customer media: <customerid>_<title-slug>_<random>.ext
    // Stock media: <category>_<random>.ext (for stock bucket)
    if (category.bucket_name === 'media-customer') {
      return `${customerId}_${slug}_${random}${extension}`;
    } else {
      return `${category.name}_${random}${extension}`;
    }
  };

  // Calculate SHA-256 hash of a file
  const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  // Check for duplicate files in the same folder
  const checkForDuplicates = async () => {
    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      const uploadFile = updatedFiles[i];
      
      try {
        // Calculate hash
        const hash = await calculateFileHash(uploadFile.file);
        uploadFile.hash = hash;

        // Check if file with same name AND hash exists in this folder
        const { data: existingFiles, error } = await supabase
          .from('media_files')
          .select('id, original_filename, file_hash')
          .eq('folder_id', folderId)
          .eq('original_filename', uploadFile.file.name)
          .eq('file_hash', hash);

        if (error) throw error;

        if (existingFiles && existingFiles.length > 0) {
          // Duplicate found
          uploadFile.status = 'duplicate';
          uploadFile.error = 'Datei existiert bereits in diesem Ordner';
        }
      } catch (error) {
        console.error('Error checking duplicate:', error);
      }
    }

    setFiles(updatedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0 || isUploading) return;

    // First check for duplicates
    await checkForDuplicates();

    // Check if there are any non-duplicate files to upload
    const filesToUpload = files.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) {
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    
    // Count files to upload (exclude duplicates)
    const toUpload = files.filter(f => f.status !== 'duplicate');
    uploadCountRef.current = { total: toUpload.length, completed: 0 };

    for (const uploadFile of files) {
      // Skip duplicates
      if (uploadFile.status === 'duplicate') {
        continue;
      }

      try {
        updateFile(uploadFile.id, { status: 'uploading', progress: 0 });

        const file = uploadFile.file;
        const extension = '.' + file.name.split('.').pop();
        const filename = generateFilename(uploadFile.title, extension);

        // Determine storage path based on category and bucket
        let storagePath: string;
        if (category.bucket_name === 'media-customer') {
          // media-customer/<customerid>/{images|videos|docs}/<filename>
          const subFolder = category.name; // 'images', 'videos', 'documents'
          storagePath = `${customerId}/${subFolder}/${filename}`;
        } else {
          // media-stock/stock/{images|videos|docs}/<filename>
          const subFolder = category.name;
          storagePath = `stock/${subFolder}/${filename}`;
        }

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(category.bucket_name)
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        updateFile(uploadFile.id, { progress: 50 });

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(category.bucket_name)
          .getPublicUrl(storagePath);

        // Get image dimensions if it's an image
        let width: number | null = null;
        let height: number | null = null;

        if (file.type.startsWith('image/')) {
          const img = await createImageBitmap(file);
          width = img.width;
          height = img.height;
        }

        updateFile(uploadFile.id, { progress: 75 });

        // Insert into database with hash
        const { error: dbError } = await supabase.from('media_files').insert({
          folder_id: folderId,
          category_id: category.id,
          filename: filename,
          original_filename: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type.split('/')[0], // 'image', 'video', etc.
          file_size: file.size,
          mime_type: file.type,
          title: uploadFile.title || null,
          alt_text: uploadFile.altText || null,
          width,
          height,
          storage_path: storagePath,
          file_hash: uploadFile.hash, // Store hash for duplicate detection
        });

        if (dbError) throw dbError;

        updateFile(uploadFile.id, {
          status: 'success',
          progress: 100,
        });
        uploadCountRef.current.completed++;
      } catch (error: any) {
        console.error('Upload error:', error);
        updateFile(uploadFile.id, {
          status: 'error',
          error: error.message || 'Upload fehlgeschlagen',
        });
        uploadCountRef.current.completed++;
      }
    }

    setIsUploading(false);

    // All uploads finished - clear list and notify parent
    setTimeout(() => {
      setFiles([]);
      onComplete();
    }, 1000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      {!isUploading && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'hover:border-blue-400'
          }`}
          style={!isDragActive ? { borderColor: 'var(--admin-border-strong)' } : undefined}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--admin-text-muted)' }} />
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
            {isDragActive
              ? 'Dateien hier ablegen...'
              : 'Dateien hierher ziehen oder klicken'}
          </p>
          <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            Max {Math.round(category.max_file_size / (1024 * 1024))}MB pro Datei
            • Max 30 Dateien
          </p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold" style={{ color: 'var(--admin-text-heading)' }}>
            Dateien ({files.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="rounded-lg p-4 space-y-3"
                style={{ backgroundColor: 'var(--admin-bg-input)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate" style={{ color: 'var(--admin-text-heading)' }}>
                        {uploadFile.file.name}
                      </p>
                      {uploadFile.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      {uploadFile.status === 'duplicate' && (
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                      {uploadFile.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                  {(uploadFile.status === 'pending' || uploadFile.status === 'duplicate') && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="hover:text-red-400 transition"
                      style={{ color: 'var(--admin-text-muted)' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Metadata Inputs */}
                {uploadFile.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={uploadFile.title}
                      onChange={(e) =>
                        updateFile(uploadFile.id, { title: e.target.value })
                      }
                      placeholder="Titel (optional)"
                      className="px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none"
                      style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-card)', color: 'var(--admin-text)' }}
                    />
                    <input
                      type="text"
                      value={uploadFile.altText}
                      onChange={(e) =>
                        updateFile(uploadFile.id, { altText: e.target.value })
                      }
                      placeholder="Alt-Text (optional)"
                      className="px-3 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none"
                      style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-card)', color: 'var(--admin-text)' }}
                    />
                  </div>
                )}

                {/* Progress Bar */}
                {uploadFile.status === 'uploading' && (
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadFile.progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Error/Duplicate Message */}
                {uploadFile.status === 'error' && (
                  <p className="text-sm text-red-400">{uploadFile.error}</p>
                )}
                {uploadFile.status === 'duplicate' && (
                  <div className="text-sm">
                    <p className="text-orange-400 font-medium">⚠️ Duplikat gefunden</p>
                    <p style={{ color: 'var(--admin-text-secondary)' }}>Diese Datei existiert bereits in diesem Ordner</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !isUploading && (
        <button
          onClick={handleUpload}
          disabled={files.filter(f => f.status === 'pending').length === 0}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5" />
          {files.filter(f => f.status === 'pending').length} {files.filter(f => f.status === 'pending').length === 1 ? 'Datei' : 'Dateien'} hochladen
        </button>
      )}

      {/* Uploading Info */}
      {isUploading && (
        <div className="text-center py-4">
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-400 animate-spin" />
          <p style={{ color: 'var(--admin-text-secondary)' }}>Upload läuft...</p>
        </div>
      )}
    </div>
  );
};
