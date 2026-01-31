import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Trash2, Download, Upload, Plus, ArrowLeft } from 'lucide-react';
import { createDefaultWebsiteContent } from '../../lib/defaultTemplate';
import JSZip from 'jszip';
import { Modal } from '../admin/Modal';

interface WebsiteRecord {
  id: string; // UUID
  customer_id: string; // 6-digit ID
  site_name: string;
  is_published: boolean;
  created_at: string;
  content: any; // The big JSON
  domain?: string | null;
}

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<WebsiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create User State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [creating, setCreating] = useState(false);

  // Restore State
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreCustomerId, setRestoreCustomerId] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');

  // Localhost selection
  const [localhostCustomerId, setLocalhostCustomerId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      
      // Find which user has localhost domain
      const localhostUser = data?.find(u => u.domain === 'localhost');
      setLocalhostCustomerId(localhostUser?.customer_id || null);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSetLocalhost = async (customerId: string) => {
    try {
      // 1. Clear localhost from all websites
      const { error: clearError } = await supabase
        .from('websites')
        .update({ domain: null })
        .eq('domain', 'localhost');

      if (clearError) {
        console.error('Clear error:', clearError);
        throw clearError;
      }

      // 2. Set localhost for selected website
      const { error } = await supabase
        .from('websites')
        .update({ domain: 'localhost' })
        .eq('customer_id', customerId);

      if (error) throw error;

      setLocalhostCustomerId(customerId);
    } catch (error: any) {
      console.error('Error setting localhost:', error);
      alert('Fehler beim Setzen von localhost: ' + (error?.message || error?.code || 'Unknown error. Check if "domain" column exists in websites table.'));
    }
  };

  const openCreateModal = () => {
    setNewCustomerId(generateRandomId());
    setNewSiteName('');
    setIsCreateOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newCustomerId || !newSiteName) {
      alert('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      setCreating(true);
      const content = createDefaultWebsiteContent(newSiteName);
      
      const { error } = await supabase.from('websites').insert({
        customer_id: newCustomerId,
        site_name: newSiteName,
        content: content,
        is_published: false
      });

      if (error) throw error;

      setIsCreateOpen(false);
      loadUsers();
      alert('Benutzer erfolgreich angelegt!');
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('Fehler beim Erstellen: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id: string, customerId: string) => {
    if (!window.confirm(`Möchten Sie den Benutzer ${customerId} wirklich löschen? Dies kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      // 1. Delete website record
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 2. Cleanup Storage? (Optional but recommended)
      // This is complex as we need to list all files. Skipping for 'MVP' as prompt says "Delete Page" (website record).
      
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleExport = async (user: WebsiteRecord) => {
    try {
      const zip = new JSZip();
      
      // 1. Add website.json
      zip.file("website.json", JSON.stringify(user.content, null, 2));
      zip.file("site_info.json", JSON.stringify({
        customer_id: user.customer_id,
        site_name: user.site_name,
        created_at: user.created_at
      }, null, 2));

      const imagesFolder = zip.folder("images");
      let count = 0;
      const downloadedUrls = new Set<string>();

      // Helper function to download image by URL
      const downloadImageByUrl = async (url: string, filename?: string) => {
        if (!url || downloadedUrls.has(url)) return;
        downloadedUrls.add(url);
        
        try {
          // Extract filename from URL if not provided
          if (!filename) {
            const urlParts = url.split('/');
            filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
          }
          
          // Fetch the image
          const response = await fetch(url);
          if (!response.ok) return;
          
          const blob = await response.blob();
          if (imagesFolder && blob.size > 0) {
            imagesFolder.file(filename, blob);
            count++;
          }
        } catch (err) {
          console.warn('Could not download:', url, err);
        }
      };

      // 2. Extract all image URLs from website JSON content
      const extractImageUrls = (obj: any): string[] => {
        const urls: string[] = [];
        
        const traverse = (item: any) => {
          if (!item) return;
          
          if (typeof item === 'string') {
            // Check if it looks like an image URL
            if (item.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || 
                item.includes('/storage/v1/object/')) {
              urls.push(item);
            }
          } else if (Array.isArray(item)) {
            item.forEach(traverse);
          } else if (typeof item === 'object') {
            // Check common image properties
            if (item.url) traverse(item.url);
            if (item.image_url) traverse(item.image_url);
            if (item.imageUrl) traverse(item.imageUrl);
            if (item.src) traverse(item.src);
            if (item.image) traverse(item.image);
            if (item.backgroundImage) traverse(item.backgroundImage);
            if (item.logo) traverse(item.logo);
            if (item.avatar) traverse(item.avatar);
            if (item.photo) traverse(item.photo);
            
            // Recurse into all values
            Object.values(item).forEach(traverse);
          }
        };
        
        traverse(obj);
        return [...new Set(urls)]; // Dedupe
      };

      // Get all image URLs from the website content
      const contentImageUrls = extractImageUrls(user.content);
      console.log(`Found ${contentImageUrls.length} image URLs in content`);

      // Download all images from content (JSON is the source of truth)
      for (const url of contentImageUrls) {
        await downloadImageByUrl(url);
      }
      
      console.log(`Exported ${count} files from JSON content`);

      // Generate Zip
      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger Download
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${user.customer_id}_${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export fehlgeschlagen');
    }
  };

  // Sync uploaded files to media_files database (for documentation/browsing)
  const syncMediaToDatabase = async (customerId: string, uploadedFiles: { filename: string, storagePath: string, mimeType: string, size: number }[]) => {
    const { data: categories } = await supabase.from('media_categories').select('*');
    if (!categories) return;

    // Ensure folders exist for this customer
    const folderMap: Record<string, string> = {};

    for (const cat of categories) {
        if (['stockphotos', 'icons'].includes(cat.name)) continue; 

        const path = `${customerId}/${cat.name}`;
     
        let { data: folder } = await supabase
            .from('media_folders')
            .select('id')
            .eq('path', path)
            .eq('customer_id', customerId)
            .single();

        if (!folder) {
            const { data: newFolder } = await supabase
                .from('media_folders')
                .insert({
                    category_id: cat.id,
                    customer_id: customerId,
                    name: cat.display_name, 
                    path: path
                })
                .select()
                .single();
            if (newFolder) folder = newFolder;
        }
        
        if (folder) folderMap[cat.name] = folder.id;
    }

    // Register uploaded files in database
    for (const file of uploadedFiles) {
        let catName = 'images';
        if (file.mimeType.startsWith('video/')) catName = 'videos';
        if (file.mimeType === 'application/pdf' || file.mimeType.includes('document')) catName = 'documents';
        
        const folderId = folderMap[catName];
        const categoryId = categories.find(c => c.name === catName)?.id;
        
        if (folderId && categoryId) {
             // Check if already exists
             const { data: existing } = await supabase.from('media_files')
                 .select('id')
                 .eq('storage_path', file.storagePath)
                 .single();
                 
             if (!existing) {
                 await supabase.from('media_files').insert({
                     folder_id: folderId,
                     category_id: categoryId,
                     filename: file.filename,
                     original_filename: file.filename,
                     file_url: supabase.storage.from('media-customer').getPublicUrl(file.storagePath).data.publicUrl,
                     storage_path: file.storagePath,
                     file_type: catName === 'videos' ? 'video' : (catName === 'documents' ? 'document' : 'image'),
                     file_size: file.size,
                     mime_type: file.mimeType
                 });
             }
        }
    }
  };

  const handleRestore = async () => {
    if (!restoreFile || !restoreCustomerId) return;

    try {
      setRestoring(true);
      setRestoreStatus('Entpacke Backup...');
      
      const zip = new JSZip();
      const unzipped = await zip.loadAsync(restoreFile);

      // 1. Read website.json
      if (!unzipped.file("website.json")) {
        throw new Error("Keine website.json im Backup gefunden");
      }
      
      const websiteJsonString = await unzipped.file("website.json")?.async("string");
      if (!websiteJsonString) throw new Error("Konnte website.json nicht lesen");
      
      const websiteContent = JSON.parse(websiteJsonString);

      // 2. Update Website Record
      setRestoreStatus('Aktualisiere Datenbank...');
      
      // Check if user exists, if not create, if yes update
      const { data: existingUser } = await supabase
        .from('websites')
        .select('*')
        .eq('customer_id', restoreCustomerId)
        .single();

      if (existingUser) {
        await supabase
          .from('websites')
          .update({ content: websiteContent })
          .eq('customer_id', restoreCustomerId);
      } else {
         // Create new if strictly restoring to new ID
         await supabase.from('websites').insert({
            customer_id: restoreCustomerId,
            site_name: websiteContent.general?.name || 'Restored Site',
            content: websiteContent,
            is_published: false
         });
      }

      // 3. Restore Images from ZIP and upload to storage
      const imagesFolder = unzipped.folder("images");
      const uploadedFiles: { filename: string, storagePath: string, mimeType: string, size: number }[] = [];
      
      if (imagesFolder) {
        setRestoreStatus('Stelle Bilder wieder her...');

        // Collect all files from zip
        const files: { path: string; fileObj: JSZip.JSZipObject }[] = [];
        imagesFolder.forEach((relativePath, file) => {
          if (!file.dir) {
            files.push({ path: relativePath, fileObj: file });
          }
        });

        for (const { path, fileObj } of files) {
          const blob = await fileObj.async("blob");
          
          // Determine category based on mime type
          let subfolder = 'images';
          if (blob.type.startsWith('video/')) subfolder = 'videos';
          if (blob.type === 'application/pdf') subfolder = 'documents';
          
          const storagePath = `${restoreCustomerId}/${subfolder}/${path}`;
          
          // Upload to storage
          await supabase.storage
            .from('media-customer')
            .upload(storagePath, blob, { upsert: true });
            
          uploadedFiles.push({
            filename: path,
            storagePath,
            mimeType: blob.type || 'image/jpeg',
            size: blob.size
          });
        }

        // Sync to database for documentation
        setRestoreStatus('Synchronisiere Mediathek-Datenbank...');
        await syncMediaToDatabase(restoreCustomerId, uploadedFiles);
      }
      
      // 4. URL Fixup in JSON
      // If we have old ID:
      if (unzipped.file("site_info.json")) {
         const siteInfo = JSON.parse(await unzipped.file("site_info.json")!.async("string"));
         const oldId = siteInfo.customer_id;
         if (oldId && oldId !== restoreCustomerId) {
             setRestoreStatus('Passe Bild-URLs an...');
             // Naive string replace on stringified JSON
             const fixedJsonStr = websiteJsonString.replaceAll(`/${oldId}/`, `/${restoreCustomerId}/`);
             const fixedContent = JSON.parse(fixedJsonStr);
             
             // Update DB again
             await supabase
                .from('websites')
                .update({ content: fixedContent })
                .eq('customer_id', restoreCustomerId);
         }
      }

      setRestoreStatus('Fertig!');
      loadUsers();
      setTimeout(() => {
        setIsRestoreOpen(false);
        setRestoreStatus('');
      }, 1500);

    } catch (error: any) {
      console.error('Restore failed:', error);
      setRestoreStatus('Fehler: ' + error.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/superadmin')} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Localhost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={localhostCustomerId === user.customer_id ? 'bg-green-50' : ''}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="radio"
                      name="localhost-selection"
                      checked={localhostCustomerId === user.customer_id}
                      onChange={() => handleSetLocalhost(user.customer_id)}
                      className="w-4 h-4 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.customer_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.site_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                    <button
                        onClick={() => handleExport(user)}
                        title="Backup/Export"
                        className="text-blue-600 hover:text-blue-900"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            setRestoreCustomerId(user.customer_id);
                            setIsRestoreOpen(true);
                        }}
                        title="Restore"
                        className="text-orange-600 hover:text-orange-900"
                    >
                        <Upload className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDeleteUser(user.id, user.customer_id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-900"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
             <div className="p-8 text-center text-gray-500">No users found.</div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Neuen Benutzer anlegen">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                <input 
                    type="text" 
                    value={newCustomerId} 
                    onChange={e => setNewCustomerId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Site Name</label>
                <input 
                    type="text" 
                    value={newSiteName} 
                    onChange={e => setNewSiteName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button 
                    onClick={handleCreateUser} 
                    disabled={creating}
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50"
                >
                    {creating ? 'Creating...' : 'Create'}
                </button>
            </div>
        </div>
      </Modal>

      {/* Restore Modal */}
      <Modal isOpen={isRestoreOpen} onClose={() => setIsRestoreOpen(false)} title="Website Wiederherstellen / Importieren">
         <div className="space-y-4">
            <p className="text-sm text-gray-600">
               Laden Sie ein Zip-Backup hoch, um die Website für <strong>{restoreCustomerId}</strong> wiederherzustellen.
               Dies überschreibt die aktuelle Konfiguration!
            </p>
            <div>
                <label className="block text-sm font-medium text-gray-700">Ziel Customer ID</label>
                <input 
                    type="text" 
                    value={restoreCustomerId} 
                    onChange={e => setRestoreCustomerId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Backup Zip-Datei</label>
                <input 
                    type="file" 
                    accept=".zip"
                    onChange={e => setRestoreFile(e.target.files?.[0] || null)}
                    className="mt-1 block w-full"
                />
            </div>
            {restoreStatus && (
                <div className="text-sm text-blue-600 font-medium">{restoreStatus}</div>
            )}
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsRestoreOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button 
                    onClick={handleRestore} 
                    disabled={restoring || !restoreFile}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                    {restoring ? 'Restoring...' : 'Restore Website'}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
