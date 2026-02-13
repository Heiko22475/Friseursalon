import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Download, Upload, Plus, Edit2, Users } from 'lucide-react';
import { createDefaultWebsiteContent } from '../../lib/defaultTemplate';
import JSZip from 'jszip';
import { Modal } from '../admin/Modal';
import { useConfirmDialog } from '../admin/ConfirmDialog';
import { AdminHeader } from '../admin/AdminHeader';

interface WebsiteRecord {
  id: string; // UUID
  customer_id: string; // 6-digit ID
  site_name: string;
  domain_name?: string | null;
  is_published: boolean;
  created_at: string;
  content: any; // The big JSON
  domain?: string | null;
}

export const UserManagement: React.FC = () => {
  const { Dialog, confirm, success: showSuccess, error: showError, alert: showAlert } = useConfirmDialog();
  
  const [users, setUsers] = useState<WebsiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create User State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [newDomainName, setNewDomainName] = useState('');
  const [creating, setCreating] = useState(false);

  // Restore State
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreCustomerId, setRestoreCustomerId] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');

  // Localhost selection
  const [localhostCustomerId, setLocalhostCustomerId] = useState<string | null>(null);

  // Edit User State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<WebsiteRecord | null>(null);
  const [editSiteName, setEditSiteName] = useState('');
  const [editDomainName, setEditDomainName] = useState('');
  const [saving, setSaving] = useState(false);

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
      await showError('Fehler', 'Fehler beim Laden der Benutzer');
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
      await showError('Fehler', 'Fehler beim Setzen von localhost: ' + (error?.message || error?.code || 'Unknown error. Check if "domain" column exists in websites table.'));
    }
  };

  const openCreateModal = () => {
    setNewCustomerId(generateRandomId());
    setNewSiteName('');
    setNewDomainName('');
    setIsCreateOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newCustomerId || !newSiteName) {
      await showAlert('Hinweis', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      setCreating(true);
      const content = createDefaultWebsiteContent(newSiteName);
      
      const { error } = await supabase.from('websites').insert({
        customer_id: newCustomerId,
        site_name: newSiteName,
        domain_name: newDomainName || null,
        content: content,
        is_published: false
      });

      if (error) throw error;

      setIsCreateOpen(false);
      loadUsers();
      await showSuccess('Erfolgreich', 'Benutzer erfolgreich angelegt!');
    } catch (error: any) {
      console.error('Error creating user:', error);
      await showError('Fehler', 'Fehler beim Erstellen: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (user: WebsiteRecord) => {
    setEditingUser(user);
    setEditSiteName(user.site_name);
    setEditDomainName(user.domain_name || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('websites')
        .update({
          site_name: editSiteName,
          domain_name: editDomainName || null
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      setIsEditOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      await showError('Fehler', 'Fehler beim Speichern: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, customerId: string) => {
    await confirm(
      'Benutzer löschen',
      `Möchten Sie den Benutzer ${customerId} wirklich löschen? Dies kann nicht rückgängig gemacht werden.\n\nAlle zugehörigen Medien und Daten werden ebenfalls gelöscht.`,
      async () => {
        try {
          // 1. Delete all media files from storage for this customer
          const { data: storageFiles } = await supabase.storage
            .from('media-customer')
            .list(customerId, { limit: 1000 });
          
          if (storageFiles && storageFiles.length > 0) {
            // Recursively delete all files in customer folder
            const deleteStorageRecursively = async (path: string) => {
              const { data: items } = await supabase.storage
                .from('media-customer')
                .list(path, { limit: 1000 });
              
              if (items) {
                for (const item of items) {
                  const itemPath = `${path}/${item.name}`;
                  if (item.id === null) {
                    // It's a folder, recurse
                    await deleteStorageRecursively(itemPath);
                  } else {
                    // It's a file, delete it
                    await supabase.storage.from('media-customer').remove([itemPath]);
                  }
                }
              }
            };
            
            await deleteStorageRecursively(customerId);
            // Finally remove the customer folder itself
            await supabase.storage.from('media-customer').remove([customerId]);
          }

          // 2. Delete media_files records for this customer
          const { data: customerFolders } = await supabase
            .from('media_folders')
            .select('id')
            .eq('customer_id', customerId);
          
          if (customerFolders && customerFolders.length > 0) {
            const folderIds = customerFolders.map(f => f.id);
            
            // Delete all files in these folders
            await supabase
              .from('media_files')
              .delete()
              .in('folder_id', folderIds);
            
            // Delete the folders
            await supabase
              .from('media_folders')
              .delete()
              .eq('customer_id', customerId);
          }

          // 3. Delete user_media records for this customer
          await supabase
            .from('user_media')
            .delete()
            .eq('customer_id', customerId);

          // 4. Delete website record
          const { error } = await supabase
            .from('websites')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          loadUsers();
          await showSuccess('Erfolgreich gelöscht', `Benutzer ${customerId} wurde erfolgreich gelöscht.`);
        } catch (error) {
          console.error('Error deleting user:', error);
          await showError('Fehler', 'Fehler beim Löschen');
        }
      },
      { isDangerous: true, confirmText: 'Löschen' }
    );
  };

  const handleExport = async (user: WebsiteRecord) => {
    try {
      const zip = new JSZip();
      
      const mediaFolder = zip.folder("media");
      let mediaCount = 0;
      let mediaSizeBytes = 0;
      const downloadedUrls = new Set<string>();
      
      // Count blocks for stats
      const countBlocks = (pages: any[]): number => {
        if (!pages) return 0;
        return pages.reduce((sum, page) => sum + (page.blocks?.length || 0), 0);
      };

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
          if (mediaFolder && blob.size > 0) {
            mediaFolder.file(filename, blob);
            mediaCount++;
            mediaSizeBytes += blob.size;
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
      
      console.log(`Exported ${mediaCount} files from JSON content`);

      // 1. Create backup_info.json with comprehensive metadata
      const backupInfo = {
        backupId: crypto.randomUUID(),
        customerId: user.customer_id,
        domain: user.domain_name || user.domain || undefined,
        createdAt: new Date().toISOString(),
        version: '1.0' as const,
        description: `Superadmin export vom ${new Date().toLocaleDateString('de-DE')}`,
        stats: {
          pageCount: user.content?.pages?.length || 0,
          blockCount: countBlocks(user.content?.pages || []),
          mediaFileCount: mediaCount,
          mediaSizeBytes: mediaSizeBytes,
          hasTheme: !!user.content?.theme,
          hasNavigation: !!user.content?.navigation,
        },
      };
      zip.file("backup_info.json", JSON.stringify(backupInfo, null, 2));

      // 2. Add website.json (same format as admin)
      zip.file("website.json", JSON.stringify({
        customer_id: user.customer_id,
        domain: user.domain_name || user.domain || null,
        created_at: user.created_at,
        content: user.content
      }, null, 2));

      // 3. Generate Zip
      const content = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      
      // 4.
      // Trigger Download
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${user.customer_id}_${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      await showError('Fehler', 'Export fehlgeschlagen');
    }
  };

  const handleExportAll = async () => {
    try {
      if (users.length === 0) {
        await showAlert('Hinweis', 'Keine Benutzer zum Exportieren vorhanden.');
        return;
      }

      await confirm(
        'Alle Websites exportieren',
        `Möchten Sie alle ${users.length} Websites exportieren?\n\nDies kann einige Minuten dauern und wird eine große ZIP-Datei erstellen.`,
        async () => {

      setLoading(true);
      const masterZip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        try {
          console.log(`Exporting ${i + 1}/${users.length}: ${user.customer_id}`);
          
          // Create individual backup ZIP (same logic as handleExport)
          const userZip = new JSZip();
          const mediaFolder = userZip.folder("media");
          let mediaCount = 0;
          let mediaSizeBytes = 0;
          const downloadedUrls = new Set<string>();

          // Count blocks for stats
          const countBlocks = (pages: any[]): number => {
            if (!pages) return 0;
            return pages.reduce((sum, page) => sum + (page.blocks?.length || 0), 0);
          };

          // Helper function to download image by URL
          const downloadImageByUrl = async (url: string, filename?: string) => {
            if (!url || downloadedUrls.has(url)) return;
            downloadedUrls.add(url);
            
            try {
              if (!filename) {
                const urlParts = url.split('/');
                filename = urlParts[urlParts.length - 1].split('?')[0];
              }
              
              const response = await fetch(url);
              if (!response.ok) return;
              
              const blob = await response.blob();
              if (mediaFolder && blob.size > 0) {
                mediaFolder.file(filename, blob);
                mediaCount++;
                mediaSizeBytes += blob.size;
              }
            } catch (err) {
              console.warn('Could not download:', url, err);
            }
          };

          // Extract image URLs
          const extractImageUrls = (obj: any): string[] => {
            const urls: string[] = [];
            
            const traverse = (item: any) => {
              if (!item) return;
              
              if (typeof item === 'string') {
                if (item.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || 
                    item.includes('/storage/v1/object/')) {
                  urls.push(item);
                }
              } else if (Array.isArray(item)) {
                item.forEach(traverse);
              } else if (typeof item === 'object') {
                if (item.url) traverse(item.url);
                if (item.image_url) traverse(item.image_url);
                if (item.imageUrl) traverse(item.imageUrl);
                if (item.src) traverse(item.src);
                if (item.image) traverse(item.image);
                if (item.backgroundImage) traverse(item.backgroundImage);
                if (item.logo) traverse(item.logo);
                if (item.avatar) traverse(item.avatar);
                if (item.photo) traverse(item.photo);
                
                Object.values(item).forEach(traverse);
              }
            };
            
            traverse(obj);
            return [...new Set(urls)];
          };

          const contentImageUrls = extractImageUrls(user.content);
          
          // Download all images
          for (const url of contentImageUrls) {
            await downloadImageByUrl(url);
          }

          // Create backup_info.json
          const backupInfo = {
            backupId: crypto.randomUUID(),
            customerId: user.customer_id,
            domain: user.domain_name || user.domain || undefined,
            createdAt: new Date().toISOString(),
            version: '1.0' as const,
            description: `Bulk export vom ${new Date().toLocaleDateString('de-DE')}`,
            stats: {
              pageCount: user.content?.pages?.length || 0,
              blockCount: countBlocks(user.content?.pages || []),
              mediaFileCount: mediaCount,
              mediaSizeBytes: mediaSizeBytes,
              hasTheme: !!user.content?.theme,
              hasNavigation: !!user.content?.navigation,
            },
          };
          userZip.file("backup_info.json", JSON.stringify(backupInfo, null, 2));

          // Add website.json
          userZip.file("website.json", JSON.stringify({
            customer_id: user.customer_id,
            domain: user.domain_name || user.domain || null,
            created_at: user.created_at,
            content: user.content
          }, null, 2));

          // Generate individual ZIP as blob
          const userZipBlob = await userZip.generateAsync({ 
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
          });

          // Add to master ZIP
          const folderName = `${user.customer_id}_${user.site_name.replace(/[^a-zA-Z0-9]/g, '_')}`;
          masterZip.file(`${folderName}/backup_${user.customer_id}.zip`, userZipBlob);
          
          successCount++;
        } catch (error) {
          console.error(`Failed to export ${user.customer_id}:`, error);
          failCount++;
        }
      }

      // Add README to master ZIP
      const readme = `# BeautifulCMS - Bulk Website Export
Generated: ${new Date().toISOString()}

## Export Summary
- Total websites: ${users.length}
- Successfully exported: ${successCount}
- Failed: ${failCount}

## Structure
Each folder contains a complete website backup:
- backup_info.json: Metadata and statistics
- website.json: Complete website content
- media/: All images and media files

## To Restore
1. Go to SuperAdmin → User Management
2. Click "Import Website" for the target user
3. Upload the individual backup ZIP from this archive

## Notes
- Each backup is a complete, self-contained website export
- Backups can be restored individually
- Media files are included in each backup
`;

      masterZip.file('README.txt', readme);

      // Generate and download master ZIP
      console.log('Generating master ZIP...');
      const masterBlob = await masterZip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      
      const url = window.URL.createObjectURL(masterBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_websites_${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      await showSuccess('Export abgeschlossen', `${successCount} Websites erfolgreich exportiert.${failCount > 0 ? `\n${failCount} Fehler.` : ''}`);
        },
        { confirmText: 'Exportieren' }
      );
      
    } catch (error) {
      console.error('Bulk export failed:', error);
      await showError('Fehler', 'Bulk-Export fehlgeschlagen: ' + (error as Error).message);
    } finally {
      setLoading(false);
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

      // Detect file type: JSON or ZIP
      const isJsonFile = restoreFile.name.toLowerCase().endsWith('.json') || restoreFile.type === 'application/json';

      let websiteContent: any;
      let siteInfo: any = null;
      let websiteJsonString: string | null = null;

      if (isJsonFile) {
        // ── JSON Import (kein ZIP) ──
        setRestoreStatus('Lese JSON-Datei...');
        const text = await restoreFile.text();
        const parsed = JSON.parse(text);

        // Prüfen ob es ein reines Website-Content-JSON ist (pages, header, etc.)
        // oder ein Backup-Wrapper mit customer_id + content
        if (parsed.content && parsed.customer_id) {
          // Backup-Format: { customer_id, content: {...} }
          websiteContent = parsed.content;
          siteInfo = { customer_id: parsed.customer_id, site_name: parsed.content?.general?.name };
        } else if (parsed.pages || parsed.site_settings || parsed.general) {
          // Direktes Website-Content-JSON
          websiteContent = parsed;
        } else {
          throw new Error('Unbekanntes JSON-Format. Erwartet wird ein Website-Content-JSON mit pages, site_settings oder general.');
        }
        websiteJsonString = JSON.stringify(websiteContent);

      } else {
        // ── ZIP Import (bestehender Flow) ──
        setRestoreStatus('Entpacke Backup...');
      
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(restoreFile);

        // 1. Read website.json
        if (!unzipped.file("website.json")) {
          throw new Error("Keine website.json im Backup gefunden");
        }
      
        websiteJsonString = await unzipped.file("website.json")?.async("string") || null;
        if (!websiteJsonString) throw new Error("Konnte website.json nicht lesen");
      
        websiteContent = JSON.parse(websiteJsonString);

        // 2. Read site_info for domain_name
        if (unzipped.file("site_info.json")) {
          siteInfo = JSON.parse(await unzipped.file("site_info.json")!.async("string"));
        }

        // 4. Restore Images from ZIP and upload to storage
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
      }

      // 3. Update Website Record
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
          .update({ 
            content: websiteContent,
            site_name: siteInfo?.site_name || existingUser.site_name,
            domain_name: siteInfo?.domain_name || existingUser.domain_name
          })
          .eq('customer_id', restoreCustomerId);
      } else {
         // Create new if strictly restoring to new ID
         await supabase.from('websites').insert({
            customer_id: restoreCustomerId,
            site_name: siteInfo?.site_name || websiteContent.general?.name || 'Restored Site',
            domain_name: siteInfo?.domain_name || null,
            content: websiteContent,
            is_published: false
         });
      }
      
      // 5. URL Fixup in JSON
      // If we have old ID:
      if (siteInfo?.customer_id && siteInfo.customer_id !== restoreCustomerId && websiteJsonString) {
         setRestoreStatus('Passe Bild-URLs an...');
         // Naive string replace on stringified JSON
         const fixedJsonStr = websiteJsonString.split(`/${siteInfo.customer_id}/`).join(`/${restoreCustomerId}/`);
         const fixedContent = JSON.parse(fixedJsonStr);
         
         // Update DB again
         const { error: fixupError } = await supabase
            .from('websites')
            .update({ content: fixedContent })
            .eq('customer_id', restoreCustomerId);
         if (fixupError) throw fixupError;
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
    <div className="min-h-screen">
      <Dialog />
      <AdminHeader
        title="User Management"
        icon={Users}
        backTo="/superadmin"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAll}
              disabled={loading || users.length === 0}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              title="Alle Websites exportieren"
            >
              <Download className="w-4 h-4" />
              Export All ({users.length})
            </button>
            <button
              onClick={() => {
                setRestoreCustomerId('');
                setRestoreFile(null);
                setRestoreStatus('');
                setIsRestoreOpen(true);
              }}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Upload className="w-4 h-4" />
              Import Website
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
          <table className="min-w-full" style={{ borderColor: 'var(--admin-border)' }}>
            <thead style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider w-20" style={{ color: 'var(--admin-text-muted)' }}>Localhost</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>Site Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderTop: '1px solid var(--admin-border)', backgroundColor: localhostCustomerId === user.customer_id ? 'var(--admin-success-bg)' : undefined }}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="radio"
                      name="localhost-selection"
                      checked={localhostCustomerId === user.customer_id}
                      onChange={() => handleSetLocalhost(user.customer_id)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: 'var(--admin-accent)' }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--admin-text-heading)' }}>{user.customer_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--admin-text-muted)' }}>{user.site_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--admin-text-muted)' }}>{user.domain_name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                    <button
                        onClick={() => openEditModal(user)}
                        title="Bearbeiten"
                        style={{ color: 'var(--admin-accent)' }}
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleExport(user)}
                        title="Backup/Export"
                        style={{ color: 'var(--admin-accent)' }}
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            setRestoreCustomerId(user.customer_id);
                            setIsRestoreOpen(true);
                        }}
                        title="Restore"
                        style={{ color: 'var(--admin-accent)' }}
                    >
                        <Upload className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDeleteUser(user.id, user.customer_id)}
                        title="Delete"
                        style={{ color: 'var(--admin-danger)' }}
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
             <div className="p-8 text-center" style={{ color: 'var(--admin-text-muted)' }}>No users found.</div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Neuen Benutzer anlegen">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Customer ID</label>
                <input 
                    type="text" 
                    value={newCustomerId} 
                    onChange={e => setNewCustomerId(e.target.value)}
                    className="mt-1 block w-full rounded-md p-2"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Site Name</label>
                <input 
                    type="text" 
                    value={newSiteName} 
                    onChange={e => setNewSiteName(e.target.value)}
                    placeholder="z.B. Friseursalon Sarah"
                    className="mt-1 block w-full rounded-md p-2"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Domain Name</label>
                <input 
                    type="text" 
                    value={newDomainName} 
                    onChange={e => setNewDomainName(e.target.value)}
                    placeholder="z.B. www.salon-sarah.de"
                    className="mt-1 block w-full rounded-md p-2"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>Optional - Die Domain unter der die Website erreichbar sein wird</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-md" style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}>Cancel</button>
                <button 
                    onClick={handleCreateUser} 
                    disabled={creating}
                    className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                    style={{ backgroundColor: 'var(--admin-accent)' }}
                >
                    {creating ? 'Creating...' : 'Create'}
                </button>
            </div>
        </div>
      </Modal>

      {/* Restore Modal */}
      <Modal isOpen={isRestoreOpen} onClose={() => setIsRestoreOpen(false)} title="Website Wiederherstellen / Importieren">
         <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
               Laden Sie ein Zip-Backup oder eine JSON-Datei hoch, um die Website für <strong>{restoreCustomerId}</strong> wiederherzustellen.
               Dies überschreibt die aktuelle Konfiguration!
            </p>
            <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Ziel Customer ID</label>
                <input 
                    type="text" 
                    value={restoreCustomerId} 
                    onChange={e => setRestoreCustomerId(e.target.value)}
                    className="mt-1 block w-full rounded-md p-2"
                    style={{ backgroundColor: 'var(--admin-bg-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Backup-Datei (.zip oder .json)</label>
                <input 
                    type="file" 
                    accept=".zip,.json"
                    onChange={e => setRestoreFile(e.target.files?.[0] || null)}
                    className="mt-1 block w-full"
                    style={{ color: 'var(--admin-text)' }}
                />
            </div>
            {restoreStatus && (
                <div className="text-sm font-medium" style={{ color: 'var(--admin-accent)' }}>{restoreStatus}</div>
            )}
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsRestoreOpen(false)} className="px-4 py-2 rounded-md" style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}>Cancel</button>
                <button 
                    onClick={handleRestore} 
                    disabled={restoring || !restoreFile}
                    className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                    style={{ backgroundColor: 'var(--admin-accent)' }}
                >
                    {restoring ? 'Restoring...' : 'Restore Website'}
                </button>
            </div>
        </div>
      </Modal>

      {/* Edit Website Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Website bearbeiten">
        <div className="space-y-4">
            {editingUser && (
              <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
                <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                  <span className="font-medium">Customer ID:</span> {editingUser.customer_id}
                </p>
                <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                  <span className="font-medium">Erstellt:</span> {new Date(editingUser.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Site Name</label>
                <input 
                    type="text" 
                    value={editSiteName} 
                    onChange={e => setEditSiteName(e.target.value)}
                    placeholder="z.B. Friseursalon Sarah"
                    className="mt-1 block w-full rounded-md p-2"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Domain Name</label>
                <input 
                    type="text" 
                    value={editDomainName} 
                    onChange={e => setEditDomainName(e.target.value)}
                    placeholder="z.B. www.salon-sarah.de"
                    className="mt-1 block w-full rounded-md p-2"
                    style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>Die Domain unter der die Website erreichbar sein wird</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-md" style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}>Abbrechen</button>
                <button 
                    onClick={handleSaveEdit} 
                    disabled={saving || !editSiteName}
                    className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                    style={{ backgroundColor: 'var(--admin-accent)' }}
                >
                    {saving ? 'Speichern...' : 'Speichern'}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
