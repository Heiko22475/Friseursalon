import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Upload, Image, Video, Palette, FileText } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { MediaGrid } from './MediaGrid';
import { Modal } from './Modal';

interface MediaCategory {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  bucket_name: string;
  max_file_size: number;
  allowed_mime_types: string[];
}

interface MediaFolder {
  id: string;
  category_id: string;
  name: string;
  path: string;
  display_order: number;
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
  created_at: string;
}

export const MediaLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | null>(null);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<MediaFolder | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>('000000');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadFolders(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedFolder) {
      loadFiles(selectedFolder.id);
    }
  }, [selectedFolder]);

  const loadData = async () => {
    try {
      // Load customer ID
      const { data: settings } = await supabase
        .from('site_settings')
        .select('customer_id')
        .single();
      
      if (settings?.customer_id) {
        setCustomerId(settings.customer_id);
      }

      // Load categories
      const { data: cats, error: catsError } = await supabase
        .from('media_categories')
        .select('*')
        .order('display_name');

      if (catsError) throw catsError;
      setCategories(cats || []);
      
      // Select first category by default
      if (cats && cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('media_folders')
        .select('*')
        .eq('category_id', categoryId)
        .is('parent_folder_id', null) // Phase 1: nur Root-Ordner
        .order('display_order');

      if (error) throw error;
      setFolders(data || []);
      
      // Select first folder by default
      if (data && data.length > 0) {
        setSelectedFolder(data[0]);
      } else {
        setSelectedFolder(null);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadFiles = async (folderId: string) => {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleUploadComplete = () => {
    setIsUploadOpen(false);
    if (selectedFolder) {
      loadFiles(selectedFolder.id);
    }
  };

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    if (!confirm('Datei wirklich löschen?')) return;

    try {
      // Get file info to determine bucket
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      const category = categories.find(c => c.id === file.category_id);
      if (!category) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(category.bucket_name)
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Reload files
      if (selectedFolder) {
        loadFiles(selectedFolder.id);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Fehler beim Löschen!');
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.FC<{ className?: string }>> = {
      'Image': Image,
      'Video': Video,
      'Palette': Palette,
      'FileText': FileText,
    };
    return icons[iconName] || FileText;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mediathek</h1>
              <p className="text-sm text-gray-600">
                {selectedCategory?.display_name} {selectedFolder && `→ ${selectedFolder.name}`}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsUploadOpen(true)}
            disabled={!selectedFolder}
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            Upload
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar: Categories & Folders */}
          <div className="col-span-3 space-y-4">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Bereiche
              </h2>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.icon);
                  const isSelected = selectedCategory?.id === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                        isSelected
                          ? 'bg-rose-50 text-rose-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{category.display_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Folders */}
            {selectedCategory && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Ordner
                  </h2>
                  {/* TODO: Folder creation in Phase 2 */}
                </div>
                <div className="space-y-1">
                  {folders.map((folder) => {
                    const isSelected = selectedFolder?.id === folder.id;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          isSelected
                            ? 'bg-rose-50 text-rose-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {folder.name}
                      </button>
                    );
                  })}
                  {folders.length === 0 && (
                    <p className="text-sm text-gray-500 px-3 py-2">
                      Keine Ordner vorhanden
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Area: File Grid */}
          <div className="col-span-9">
            {selectedFolder ? (
              <MediaGrid
                files={files}
                onDelete={handleDeleteFile}
                category={selectedCategory}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">
                  Wählen Sie einen Ordner aus, um Dateien anzuzeigen
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={`Upload → ${selectedCategory?.display_name} / ${selectedFolder?.name}`}
        maxWidth="max-w-3xl"
      >
        {selectedFolder && selectedCategory && (
          <MediaUpload
            folderId={selectedFolder.id}
            category={selectedCategory}
            customerId={customerId}
            onComplete={handleUploadComplete}
          />
        )}
      </Modal>
    </div>
  );
};
