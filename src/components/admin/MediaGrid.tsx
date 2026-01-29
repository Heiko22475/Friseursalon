import React, { useState } from 'react';
import { Trash2, Download, Image as ImageIcon, FileText, Film } from 'lucide-react';

interface MediaCategory {
  id: string;
  name: string;
  display_name: string;
  bucket_name: string;
}

interface MediaFile {
  id: string;
  folder_id: string;
  category_id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  title: string | null;
  alt_text: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  thumbnail_url: string | null;
  storage_path: string;
  created_at: string;
}

interface MediaGridProps {
  files: MediaFile[];
  onDelete: (fileId: string, storagePath: string) => void;
  category: MediaCategory | null;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  files,
  onDelete,
}) => {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getFileIcon = (file: MediaFile) => {
    if (file.file_type === 'image') return ImageIcon;
    if (file.file_type === 'video') return Film;
    return FileText;
  };

  const handleDownload = (file: MediaFile) => {
    window.open(file.file_url, '_blank');
  };

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500 mb-4">Noch keine Dateien in diesem Ordner</p>
        <p className="text-sm text-gray-400">
          Klicken Sie auf "Upload", um Dateien hinzuzufügen
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => {
          const Icon = getFileIcon(file);
          const isImage = file.file_type === 'image';
          
          return (
            <div
              key={file.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition"
            >
              {/* Thumbnail */}
              <div
                className="aspect-square bg-gray-100 relative cursor-pointer"
                onClick={() => isImage && setSelectedFile(file)}
              >
                {isImage ? (
                  <img
                    src={file.thumbnail_url || file.file_url}
                    alt={file.alt_text || file.title || file.original_filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                    title="Herunterladen"
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file.id, file.storage_path);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-gray-900 text-sm truncate mb-1">
                  {file.title || file.original_filename}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
                {file.width && file.height && (
                  <p className="text-xs text-gray-400 mt-1">
                    {file.width} × {file.height}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox for Images */}
      {selectedFile && selectedFile.file_type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={selectedFile.file_url}
              alt={
                selectedFile.alt_text ||
                selectedFile.title ||
                selectedFile.original_filename
              }
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
            >
              <span className="sr-only">Schließen</span>
              ✕
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-4 text-white">
              <p className="font-medium mb-1">
                {selectedFile.title || selectedFile.original_filename}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>{formatFileSize(selectedFile.file_size)}</span>
                {selectedFile.width && selectedFile.height && (
                  <span>
                    {selectedFile.width} × {selectedFile.height}
                  </span>
                )}
                <span>{formatDate(selectedFile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
