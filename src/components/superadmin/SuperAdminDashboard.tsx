import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Modal } from '../admin/Modal';
import JSZip from 'jszip';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreCustomerId, setRestoreCustomerId] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');

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
      
      let websiteJsonString = await unzipped.file("website.json")?.async("string");
      if (!websiteJsonString) throw new Error("Konnte website.json nicht lesen");
      
      const websiteContent = JSON.parse(websiteJsonString);

      // 2. Get old customer ID from site_info if available
      let oldCustomerId: string | null = null;
      if (unzipped.file("site_info.json")) {
         const siteInfo = JSON.parse(await unzipped.file("site_info.json")!.async("string"));
         oldCustomerId = siteInfo.customer_id;
      }

      // 3. Check if user exists, if not create, if yes update
      setRestoreStatus('Aktualisiere Datenbank...');
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
         await supabase.from('websites').insert({
            customer_id: restoreCustomerId,
            site_name: websiteContent.general?.name || 'Restored Site',
            content: websiteContent,
            is_published: false
         });
      }

      // 4. Restore Images from ZIP
      const imagesFolder = unzipped.folder("images");
      if (imagesFolder) {
        setRestoreStatus('Stelle Bilder wieder her...');
        
        const files: { path: string; fileObj: JSZip.JSZipObject }[] = [];
        imagesFolder.forEach((relativePath, file) => {
          if (!file.dir) {
            files.push({ path: relativePath, fileObj: file });
          }
        });

        for (const { path, fileObj } of files) {
          const blob = await fileObj.async("blob");
          
          // Determine subfolder by mime type
          let subfolder = 'images';
          if (blob.type.startsWith('video/')) subfolder = 'videos';
          if (blob.type === 'application/pdf') subfolder = 'documents';
          
          const storagePath = `${restoreCustomerId}/${subfolder}/${path}`;
          
          await supabase.storage
            .from('media-customer')
            .upload(storagePath, blob, { upsert: true });
        }
      }
      
      // 5. URL Fixup in JSON if restoring to different customer
      if (oldCustomerId && oldCustomerId !== restoreCustomerId) {
         setRestoreStatus('Passe Bild-URLs an...');
         const fixedJsonStr = websiteJsonString.replaceAll(`/${oldCustomerId}/`, `/${restoreCustomerId}/`);
         const fixedContent = JSON.parse(fixedJsonStr);
         
         await supabase
            .from('websites')
            .update({ content: fixedContent })
            .eq('customer_id', restoreCustomerId);
      }

      setRestoreStatus('Fertig!');
      setTimeout(() => {
        setIsRestoreOpen(false);
        setRestoreStatus('');
        setRestoreFile(null);
        setRestoreCustomerId('');
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  BeautifulCMS SuperAdmin
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/superadmin/users')}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-violet-100 text-violet-600 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-500">
              Manage customers, websites, export backups, and restore sites.
            </p>
          </button>

          <button
            onClick={() => setIsRestoreOpen(true)}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Restore Website</h3>
            </div>
            <p className="text-gray-500">
              Restore a website from a backup ZIP file.
            </p>
          </button>
        </div>
      </div>

      {/* Restore Modal */}
      <Modal isOpen={isRestoreOpen} onClose={() => setIsRestoreOpen(false)} title="Website Wiederherstellen">
         <div className="space-y-4">
            <p className="text-sm text-gray-600">
               Laden Sie ein Zip-Backup hoch, um eine Website wiederherzustellen oder zu erstellen.
            </p>
            <div>
                <label className="block text-sm font-medium text-gray-700">Ziel Customer ID (6-stellig)</label>
                <input 
                    type="text" 
                    value={restoreCustomerId} 
                    onChange={e => setRestoreCustomerId(e.target.value)}
                    placeholder="123456"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                <button onClick={() => setIsRestoreOpen(false)} className="px-4 py-2 border rounded-md">Abbrechen</button>
                <button 
                    onClick={handleRestore} 
                    disabled={restoring || !restoreFile || !restoreCustomerId}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                    {restoring ? 'Wird wiederhergestellt...' : 'Wiederherstellen'}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
