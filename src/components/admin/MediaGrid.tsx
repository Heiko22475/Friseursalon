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
  viewMode: 'grid' | 'list';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelect?: (file: MediaFile) => void;
  readOnly?: boolean; // New prop to hide delete buttons
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  files,
  onDelete,
  viewMode,
  selectedIds,
  onToggleSelect,
  onSelect,
  readOnly = false
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
      <div className="border rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}>
        <p className="mb-4" style={{ color: 'var(--admin-text-secondary)' }}>Noch keine Dateien in diesem Ordner</p>
        <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          Klicken Sie auf "Upload", um Dateien hinzuzufügen
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'list' ? (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}>
          <table className="min-w-full" style={{ borderColor: 'var(--admin-border)' }}>
            <thead style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <span className="sr-only">Auswahl</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>
                  Vorschau
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>
                  Größe
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>
                  Datum
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}>
              {files.map((file) => {
                const Icon = getFileIcon(file);
                const isImage = file.file_type === 'image';
                const isSelected = selectedIds.includes(file.id);

                return (
                  <tr 
                    key={file.id} 
                    className="transition cursor-pointer"
                    style={{ backgroundColor: isSelected ? 'var(--admin-bg-selected)' : undefined }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = ''; }}
                    onClick={() => onToggleSelect(file.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(file.id)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 rounded"
                        style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="h-10 w-10 flex-shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelect) {
                              onSelect(file);
                          } else if (isImage) {
                              setSelectedFile(file);
                          }
                        }}
                      >
                        {isImage ? (
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={file.thumbnail_url || file.file_url}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--admin-bg-input)' }}>
                            <Icon className="h-6 w-6" style={{ color: 'var(--admin-text-muted)' }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--admin-text-heading)' }}>
                        {file.title || file.original_filename}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{file.filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                          className="transition"
                          style={{ color: 'var(--admin-text-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--admin-text)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--admin-text-muted)'; }}
                          title="Herunterladen"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {!readOnly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(file.id, file.storage_path);
                            }}
                            className="text-red-400 hover:text-red-300 transition"
                            title="Löschen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => {
            const Icon = getFileIcon(file);
            const isImage = file.file_type === 'image';
            const isSelected = selectedIds.includes(file.id);
            
            return (
              <div
                key={file.id}
                className={`rounded-lg border overflow-hidden group transition relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border-strong)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border)'; }}
                onClick={() => {
                   if (onSelect) {
                       onSelect(file); 
                   } else if (isImage) {
                       setSelectedFile(file);
                   } else {
                       onToggleSelect(file.id);
                   }
                }}
              >
                {/* Selection Checkbox */}
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(file.id)}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 rounded shadow-sm"
                    style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)' }}
                  />
                </div>

                {/* Thumbnail */}
                <div
                  className="aspect-square relative cursor-pointer"
                  style={{ backgroundColor: 'var(--admin-bg)' }}
                >
                  {isImage ? (
                    <img
                      src={file.thumbnail_url || file.file_url}
                      alt={file.alt_text || file.title || file.original_filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-16 h-16" style={{ color: 'var(--admin-text-faint)' }} />
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {onSelect ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(file);
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-sm"
                        >
                            Auswählen
                        </button>
                    ) : (
                        <>
                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file);
                            }}
                            className="p-2 rounded-lg transition border"
                            style={{ backgroundColor: 'var(--admin-bg-input)', borderColor: 'var(--admin-border-strong)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--admin-border-strong)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)'; }}
                            title="Herunterladen"
                            >
                            <Download className="w-5 h-5" style={{ color: 'var(--admin-text)' }} />
                            </button>
                            {!readOnly && (
                              <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(file.id, file.storage_path);
                              }}
                              className="p-2 rounded-lg hover:bg-red-900/30 transition border"
                              style={{ backgroundColor: 'var(--admin-bg-input)', borderColor: 'var(--admin-border-strong)' }}
                              title="Löschen"
                              >
                              <Trash2 className="w-5 h-5 text-red-400" />
                              </button>
                            )}
                        </>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                  <p className="font-medium text-sm truncate mb-1" style={{ color: 'var(--admin-text-heading)' }}>
                    {file.title || file.original_filename}
                  </p>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                  {file.width && file.height && (
                    <p className="text-xs mt-1" style={{ color: 'var(--admin-text-faint)' }}>
                      {file.width} × {file.height}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
