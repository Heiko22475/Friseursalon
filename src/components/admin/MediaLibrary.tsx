import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useWebsite } from '../../contexts/WebsiteContext';
import { 
  ArrowLeft, Upload, Image, Video, Palette, FileText, 
  LayoutGrid, List as ListIcon, FolderPlus, Folder, Trash2, 
  Scissors, Clipboard, XSquare, CheckSquare
} from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { MediaGrid } from './MediaGrid';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

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
  parent_folder_id?: string | null;
  media_files?: { count: number }[];
}

export interface MediaFile {
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

interface MediaLibraryProps {
  mode?: 'admin' | 'select';
  onSelect?: (files: MediaFile[]) => void;
  onCancel?: () => void;
  stockOnly?: boolean;
  isSuperAdmin?: boolean; // New prop to distinguish superadmin editing stockphotos
  singleSelect?: boolean; // When true, clicking an image immediately calls onSelect with that image
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  mode = 'admin', 
  onSelect,
  onCancel,
  stockOnly = false,
  isSuperAdmin = false,
  singleSelect = false
}) => {
  const navigate = useNavigate();
  const { customerId } = useWebsite();
  
  // For stockOnly mode (superadmin editing stockphotos), use 'stock' as customer_id
  const effectiveCustomerId = (stockOnly && isSuperAdmin) ? 'stock' : customerId;
  
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | null>(null);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<MediaFolder | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  
  // New Features States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ action: 'cut' | 'copy', fileIds: string[] } | null>(null);
  
  // Dialog States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => Promise<void> | void>(() => {});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory && customerId) {
      loadFolders(selectedCategory.id);
      setSelectedFolder(null); // Reset folder selection when category changes
      setSelectedIds([]); // Reset selection on category change
    }
  }, [selectedCategory, customerId]);

  useEffect(() => {
    if (selectedFolder) {
      loadFiles(selectedFolder.id);
      setSelectedIds([]); // Reset selection on folder change
    } else {
        setFiles([]);
    }
  }, [selectedFolder]);

  const loadData = async () => {
    try {
      // Load categories
      const { data: cats, error: catsError } = await supabase
        .from('media_categories')
        .select('*')
        .order('display_name');

      if (catsError) throw catsError;
      setCategories(cats || []);
      
      // Select category: stockphotos if stockOnly mode, otherwise first category
      if (cats && cats.length > 0) {
        if (stockOnly) {
          const stockCategory = cats.find(c => c.name === 'stockphotos');
          setSelectedCategory(stockCategory || cats[0]);
        } else {
          setSelectedCategory(cats[0]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async (categoryId: string) => {
    try {
      // For stockphotos category, only load 'stock' customer folders
      // For other categories, load user's folders
      const isStockCategory = categories.find(c => c.id === categoryId)?.name === 'stockphotos';
      
      let query = supabase
        .from('media_folders')
        .select(`
          *,
          media_files:media_files(count)
        `)
        .eq('category_id', categoryId);
      
      if (isStockCategory) {
        // Stockphotos are always from 'stock' customer
        query = query.eq('customer_id', 'stock');
      } else if (stockOnly && isSuperAdmin) {
        // Superadmin editing stockphotos uses 'stock' customer
        query = query.eq('customer_id', 'stock');
      } else {
        // Normal user sees their own folders
        query = query.eq('customer_id', effectiveCustomerId);
      }
      
      const { data, error } = await query.order('display_order');

      if (error) throw error;
      setFolders(data || []);
      
      // Auto-select first folder if available
      if (data && data.length > 0 && !selectedFolder) {
        setSelectedFolder(data[0]);
      } else if (!data || data.length === 0) {
        setSelectedFolder(null);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadFiles = async (folderId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setIsUploadOpen(false);
    if (selectedFolder) {
      loadFiles(selectedFolder.id);
    }
    // Reload folders to update file counts
    if (selectedCategory) {
      loadFolders(selectedCategory.id);
    }
  };

  const handleAddFolder = async () => {
    if (!selectedCategory) return;
    
    // Check if this is a stockphotos category - only superadmin can add folders
    const isStockCategory = selectedCategory.name === 'stockphotos';
    if (isStockCategory && !isSuperAdmin) {
      alert('Stockphoto-Ordner können nur vom Superadmin erstellt werden.');
      return;
    }
    
    const name = window.prompt("Name des neuen Ordners:");
    if (!name) return;

    try {
      // Use 'stock' for stockphotos category, otherwise use effectiveCustomerId
      const folderCustomerId = isStockCategory ? 'stock' : effectiveCustomerId;
      
      const newFolder = {
        category_id: selectedCategory.id,
        customer_id: folderCustomerId,
        name: name,
        path: `${folderCustomerId}/${selectedCategory.name}/${name}`, 
        display_order: folders.length
      };

      const { data, error } = await supabase
        .from('media_folders')
        .insert([newFolder])
        .select()
        .single();

      if (error) throw error;
      
      setFolders([...folders, data]);
      setSelectedFolder(data); 
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Fehler beim Erstellen des Ordners');
    }
  };

  const handleDeleteFolder = async (folder: MediaFolder) => {
    // Check if this is stockphotos category - only superadmin can delete folders
    const isStockCategory = selectedCategory?.name === 'stockphotos';
    if (isStockCategory && !isSuperAdmin) {
      alert('Stockphoto-Ordner können nur vom Superadmin gelöscht werden.');
      return;
    }
    
    setConfirmTitle('Ordner löschen');
    setConfirmMessage(`Möchten Sie den Ordner "${folder.name}" und alle enthaltenen Dateien löschen?`);
    setConfirmAction(() => async () => {
      try {
        // Files should be deleted via cascade in DB, but we need to clean Storage!
        const { data: filesToDelete } = await supabase
          .from('media_files')
          .select('storage_path')
          .eq('folder_id', folder.id);
        
        if (filesToDelete && filesToDelete.length > 0 && selectedCategory) {
          const paths = filesToDelete.map(f => f.storage_path);
          await supabase.storage.from(selectedCategory.bucket_name).remove(paths);
        }

        const { error } = await supabase
          .from('media_folders')
          .delete()
          .eq('id', folder.id);

        if (error) throw error;

        setFolders(folders.filter(f => f.id !== folder.id));
        if (selectedFolder?.id === folder.id) {
          setSelectedFolder(folders.length > 1 ? folders.find(f => f.id !== folder.id) || null : null);
        }
        setConfirmOpen(false);
      } catch (error) {
        console.error('Error deleting folder:', error);
        alert('Fehler beim Löschen des Ordners');
      }
    });
    setConfirmOpen(true);
  };

  const handleToggleSelect = (id: string) => {
    // In single select mode, only allow one selection at a time
    if (singleSelect) {
      setSelectedIds(prev => prev.includes(id) ? [] : [id]);
    } else {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  const handleSelectAll = (select: boolean) => {
    // Don't allow select all in single select mode
    if (singleSelect) return;
    
    if (select) {
      setSelectedIds(files.map(f => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCutFiles = () => {
    if (selectedIds.length === 0) return;
    setClipboard({ action: 'cut', fileIds: [...selectedIds] });
    setSelectedIds([]);
  };

  const handlePasteFiles = async () => {
    if (!clipboard || !selectedFolder) return;
    
    try {
      const { error } = await supabase
        .from('media_files')
        .update({ folder_id: selectedFolder.id })
        .in('id', clipboard.fileIds);

      if (error) throw error;

      loadFiles(selectedFolder.id);
      if (selectedCategory) loadFolders(selectedCategory.id);
      setClipboard(null);
    } catch (error) {
      console.error('Error moving files:', error);
      alert('Fehler beim Verschieben der Dateien');
    }
  };

  const handleDeleteFiles = async (fileIds: string[]) => {
    const idsToDelete = fileIds.length > 0 ? fileIds : selectedIds;
    if (idsToDelete.length === 0) return;

    // Check if this is stockphotos category - only superadmin can delete
    const isStockCategory = selectedCategory?.name === 'stockphotos';
    if (isStockCategory && !isSuperAdmin) {
      alert('Stockphotos können nur vom Superadmin gelöscht werden.');
      return;
    }

    setConfirmTitle(idsToDelete.length > 1 ? 'Dateien löschen' : 'Datei löschen');
    setConfirmMessage(`Möchten Sie ${idsToDelete.length} Datei(en) wirklich löschen?`);
    setConfirmAction(() => async () => {
      try {
        const { data: filesData } = await supabase
          .from('media_files')
          .select('storage_path')
          .in('id', idsToDelete);
        
        if (filesData && filesData.length > 0 && selectedCategory) {
          const paths = filesData.map(f => f.storage_path);
          await supabase.storage.from(selectedCategory.bucket_name).remove(paths);
        }

        const { error } = await supabase
          .from('media_files')
          .delete()
          .in('id', idsToDelete);

        if (error) throw error;

        if (selectedFolder) loadFiles(selectedFolder.id);
        if (selectedCategory) loadFolders(selectedCategory.id);
        setSelectedIds([]);
        setConfirmOpen(false);
      } catch (error) {
        console.error('Error deleting files:', error);
        alert('Fehler beim Löschen der Dateien');
      }
    });
    setConfirmOpen(true);
  };
  
  const handleDeleteSingle = (fileId: string, _storagePath: string) => {
     handleDeleteFiles([fileId]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--admin-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--admin-bg)' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--admin-bg-surface)', borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center gap-4">
          {/* Single Select Mode: Show cancel button with text */}
          {singleSelect && mode === 'select' ? (
            <button 
              onClick={onCancel} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
              style={{ color: 'var(--admin-text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
            >
              <XSquare className="w-5 h-5" />
              <span>Abbrechen</span>
            </button>
          ) : mode === 'admin' ? (
            <button onClick={() => navigate(stockOnly ? '/superadmin' : '/admin')} className="p-2 rounded-full" onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--admin-text-secondary)' }} />
            </button>
          ) : (
            <button onClick={onCancel} className="p-2 rounded-full" onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
              <XSquare className="w-5 h-5" style={{ color: 'var(--admin-text-secondary)' }} />
            </button>
          )}
          <h1 className="text-xl font-bold" style={{ color: 'var(--admin-text-heading)' }}>
            {mode === 'select' 
              ? (singleSelect ? 'Bild auswählen' : 'Bilder auswählen') 
              : (stockOnly ? 'Stockphotos' : 'Mediathek')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
            {/* Selection Confirmation for Picker Mode (Multi-select only) */}
            {mode === 'select' && !singleSelect && selectedIds.length > 0 && onSelect && (
              <button
                onClick={() => {
                   const selectedFiles = files.filter(f => selectedIds.includes(f.id));
                   onSelect(selectedFiles);
                }}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm font-medium"
              >
                 <CheckSquare className="w-4 h-4" />
                 {selectedIds.length} übernehmen
              </button>
            )}
            
            {/* Single Select: Show selected image preview and confirm button */}
            {mode === 'select' && singleSelect && selectedIds.length > 0 && onSelect && (
              <button
                onClick={() => {
                   const selectedFiles = files.filter(f => selectedIds.includes(f.id));
                   onSelect(selectedFiles);
                }}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm font-medium"
              >
                 <CheckSquare className="w-4 h-4" />
                 Übernehmen
              </button>
            )}

            {/* View Toggle */}
            <div className="p-1 rounded-lg flex border" style={{ backgroundColor: 'var(--admin-bg-input)', borderColor: 'var(--admin-border-strong)' }}>
                <button 
                  onClick={() => setViewMode('grid')}
                  className="p-2 rounded"
                  style={viewMode === 'grid' ? { backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow)', color: 'var(--admin-accent-text)' } : { color: 'var(--admin-text-muted)' }}
                  onMouseEnter={e => { if (viewMode !== 'grid') e.currentTarget.style.color = 'var(--admin-text)'; }}
                  onMouseLeave={e => { if (viewMode !== 'grid') e.currentTarget.style.color = 'var(--admin-text-muted)'; }}
                  title="Rasteransicht"
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className="p-2 rounded"
                  style={viewMode === 'list' ? { backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow)', color: 'var(--admin-accent-text)' } : { color: 'var(--admin-text-muted)' }}
                  onMouseEnter={e => { if (viewMode !== 'list') e.currentTarget.style.color = 'var(--admin-text)'; }}
                  onMouseLeave={e => { if (viewMode !== 'list') e.currentTarget.style.color = 'var(--admin-text-muted)'; }}
                  title="Listenansicht"
                >
                    <ListIcon size={18} />
                </button>
            </div>

            {/* Actions for Selection (Admin Mode) - Hide delete/cut for stockphotos unless superadmin */}
            {mode === 'admin' && selectedIds.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                   <span className="text-sm font-medium text-blue-400 mr-2">{selectedIds.length} ausgewählt</span>
                   {(selectedCategory?.name !== 'stockphotos' || isSuperAdmin) && (
                     <>
                       <button 
                         onClick={handleCutFiles}
                         className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded"
                         title="Ausschneiden"
                       >
                         <Scissors size={18} />
                       </button>
                       <button 
                         onClick={() => handleDeleteFiles(selectedIds)}
                         className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded"
                         title="Löschen"
                       >
                         <Trash2 size={18} />
                       </button>
                     </>
                   )}
                   <button 
                     onClick={() => handleSelectAll(false)}
                     className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded"
                     title="Auswahl aufheben"
                   >
                     <XSquare size={18} />
                   </button>
                </div>
            )}

            {/* Clipboard Actions */}
            {clipboard && (
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                    <span className="text-sm font-medium text-blue-400 mr-2">
                        {clipboard.fileIds.length} Datei(en) in Zwischenablage
                    </span>
                    <button 
                     onClick={handlePasteFiles}
                     className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                     title="Einfügen"
                    >
                     <Clipboard size={14} /> Einfügen
                    </button>
                    <button 
                     onClick={() => setClipboard(null)}
                     className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                     title="Abbrechen"
                    >
                     <XSquare size={18} />
                    </button>
                </div>
            )}

          {/* Show upload button: 
              - Not for stockphotos category unless superadmin
              - Or when stockOnly is true (superadmin stockphotos page)
          */}
          {((selectedCategory?.name !== 'stockphotos') || (stockOnly && isSuperAdmin)) && (
            <button
              onClick={() => {
                setUploadKey(k => k + 1);
                setIsUploadOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r flex flex-col overflow-y-auto" style={{ backgroundColor: 'var(--admin-bg-surface)', borderColor: 'var(--admin-border)' }}>
          {/* Categories */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--admin-text-muted)' }}>
              Bereiche
            </h3>
            <div className="space-y-1">
              {categories
                .filter(cat => stockOnly ? cat.name === 'stockphotos' : true)
                .map((cat) => {
                const isActive = selectedCategory?.id === cat.id;
                // Icon mapping
                let Icon = Image;
                if (cat.name === 'videos') Icon = Video;
                if (cat.name === 'stockphotos') Icon = Palette;
                if (cat.name === 'documents') Icon = FileText;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      isActive 
                        ? 'bg-blue-500/15 text-blue-400' 
                        : ''
                    }`}
                    style={!isActive ? { color: 'var(--admin-text-secondary)' } : undefined}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{cat.display_name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Folders */}
          <div className="flex-1 p-4">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>
                  Ordner
                </h3>
                {/* Hide folder creation for stockphotos unless superadmin */}
                {(selectedCategory?.name !== 'stockphotos' || isSuperAdmin) && (
                  <button 
                    onClick={handleAddFolder}
                    className="p-1 hover:text-blue-400 transition"
                    style={{ color: 'var(--admin-text-muted)' }}
                    title="Neuer Ordner"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                )}
             </div>
            
            <div className="space-y-1">
              {folders.map((folder) => {
                const isActive = selectedFolder?.id === folder.id;
                return (
                  <div 
                    key={folder.id}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg transition"
                    style={isActive ? { backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text-heading)' } : { color: 'var(--admin-text-secondary)' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <button
                        onClick={() => setSelectedFolder(folder)}
                        className="flex items-center gap-2 flex-1 text-left truncate"
                    >
                        <Folder className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} style={!isActive ? { color: 'var(--admin-text-muted)' } : undefined} />
                        <span className="truncate">
                          {folder.name} 
                          <span className="text-xs ml-1" style={{ color: 'var(--admin-text-muted)' }}>
                            ({folder.media_files?.[0]?.count || 0})
                          </span>
                        </span>
                    </button>
                    {/* Hide delete button for stockphotos folders unless superadmin */}
                    {(selectedCategory?.name !== 'stockphotos' || isSuperAdmin) && (
                      <button
                          onClick={() => handleDeleteFolder(folder)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                          style={{ color: 'var(--admin-text-muted)' }}
                          title="Ordner löschen"
                      >
                          <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
              {folders.length === 0 && (
                <p className="text-sm italic px-2" style={{ color: 'var(--admin-text-muted)' }}>Keine Ordner angelegt</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedFolder ? (
            <>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--admin-text-heading)' }}>
                        <Folder className="w-5 h-5" style={{ color: 'var(--admin-text-muted)' }} />
                        {selectedFolder.name}
                        <span className="text-sm font-normal ml-2" style={{ color: 'var(--admin-text-muted)' }}>
                            {files.length} Dateien
                        </span>
                    </h2>
                    {/* Hide "Select all" in single select mode */}
                    {!singleSelect && (
                      <div className="flex items-center gap-2">
                          <button 
                             onClick={() => handleSelectAll(true)}
                             className="text-sm text-blue-400 hover:text-blue-300"
                          >
                              Alle auswählen
                          </button>
                      </div>
                    )}
                </div>

                <MediaGrid
                  files={files}
                  onDelete={handleDeleteSingle}
                  category={selectedCategory}
                  viewMode={viewMode}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  readOnly={selectedCategory?.name === 'stockphotos' && !isSuperAdmin}
                  onSelect={(file: MediaFile) => {
                     if (mode === 'select' && onSelect) {
                        onSelect([file]);
                     }
                  }}
                />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--admin-text-muted)' }}>
              <Folder className="w-16 h-16 mb-4" style={{ color: 'var(--admin-bg-input)' }} />
              <p className="text-lg">Wählen Sie einen Ordner aus</p>
              <button 
                onClick={handleAddFolder}
                className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
              >
                + Ersten Ordner erstellen
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={`Upload → ${selectedCategory?.display_name || ''} / ${selectedFolder?.name || ''}`}
        maxWidth="max-w-3xl"
      >
        {selectedFolder && selectedCategory && isUploadOpen ? (
          <MediaUpload
            key={`upload-${uploadKey}`}
            folderId={selectedFolder.id}
            category={selectedCategory}
            customerId={customerId}
            onComplete={handleUploadComplete}
          />
        ) : (
             <div className="p-4 text-center" style={{ color: 'var(--admin-text-muted)' }}>
                Bitte wählen Sie zuerst einen Ordner aus.
             </div>
        )}
      </Modal>
      
      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={async () => {
             await confirmAction();
        }}
        onCancel={() => setConfirmOpen(false)}
        variant="danger"
        confirmText="Löschen"
      />
    </div>
  );
};
