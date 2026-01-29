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
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  folderId,
  category,
  customerId,
  onComplete,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);

    for (const uploadFile of files) {
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

        // Insert into database
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
        });

        if (dbError) throw dbError;

        updateFile(uploadFile.id, {
          status: 'success',
          progress: 100,
        });
      } catch (error: any) {
        console.error('Upload error:', error);
        updateFile(uploadFile.id, {
          status: 'error',
          error: error.message || 'Upload fehlgeschlagen',
        });
      }
    }

    setIsUploading(false);

    // Check if all successful
    const allSuccess = files.every(
      (f) => f.status === 'success' || f.status === 'error'
    );
    if (allSuccess) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
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
              ? 'border-rose-500 bg-rose-50'
              : 'border-gray-300 hover:border-rose-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive
              ? 'Dateien hier ablegen...'
              : 'Dateien hierher ziehen oder klicken'}
          </p>
          <p className="text-sm text-gray-500">
            Max {Math.round(category.max_file_size / (1024 * 1024))}MB pro Datei
            • Max 30 Dateien
          </p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">
            Dateien ({files.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="bg-gray-50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      {uploadFile.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      {uploadFile.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-rose-500 animate-spin flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                  {uploadFile.status === 'pending' && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="text-gray-400 hover:text-red-500 transition"
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
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={uploadFile.altText}
                      onChange={(e) =>
                        updateFile(uploadFile.id, { altText: e.target.value })
                      }
                      placeholder="Alt-Text (optional)"
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                )}

                {/* Progress Bar */}
                {uploadFile.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadFile.progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Error Message */}
                {uploadFile.status === 'error' && (
                  <p className="text-sm text-red-600">{uploadFile.error}</p>
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
          className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          {files.length} {files.length === 1 ? 'Datei' : 'Dateien'} hochladen
        </button>
      )}

      {/* Uploading Info */}
      {isUploading && (
        <div className="text-center py-4">
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-rose-500 animate-spin" />
          <p className="text-gray-600">Upload läuft...</p>
        </div>
      )}
    </div>
  );
};
