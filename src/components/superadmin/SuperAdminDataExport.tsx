/**
 * SuperAdmin Data Export/Import
 * Export and import system data like templates, stock photos, etc.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Download, Upload, Database, FileArchive, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

export const SuperAdminDataExport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // SuperAdmin tables to export
  const superAdminTables = [
    'card_templates',
    'stock_photos',
    // Add more system tables here as needed
  ];

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
  };

  const exportSuperAdminData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const zip = new JSZip();

      const exportData: Record<string, any> = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'superadmin',
        data: {},
      };

      // Export each table
      for (const table of superAdminTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: true });

          if (error) {
            console.warn(`Warning for table ${table}:`, error);
            exportData.data[table] = [];
          } else {
            exportData.data[table] = data || [];
            console.log(`Exported ${data?.length || 0} records from ${table}`);
          }
        } catch (err) {
          console.warn(`Error with table ${table}:`, err);
          exportData.data[table] = [];
        }
      }

      // Download and add stock photos to media folder
      const mediaFolder = zip.folder('media');
      let mediaCount = 0;
      let mediaSizeBytes = 0;

      if (exportData.data.stock_photos && Array.isArray(exportData.data.stock_photos)) {
        showMessage('Lade Stock Photos herunter...', 'info');
        
        for (const photo of exportData.data.stock_photos) {
          try {
            if (photo.url) {
              const response = await fetch(photo.url);
              if (response.ok) {
                const blob = await response.blob();
                const filename = photo.url.split('/').pop() || `photo-${photo.id}.jpg`;
                mediaFolder?.file(filename, blob);
                mediaCount++;
                mediaSizeBytes += blob.size;
                console.log(`Downloaded: ${filename} (${blob.size} bytes)`);
              }
            }
          } catch (err) {
            console.warn(`Failed to download ${photo.url}:`, err);
          }
        }
      }

      // Generate CSV files for database schema
      const csvFolder = zip.folder('schema');
      for (const table of superAdminTables) {
        const records = exportData.data[table];
        if (records && records.length > 0) {
          // Generate CSV header
          const columns = Object.keys(records[0]);
          const csvHeader = columns.join(',');
          
          // Generate CSV rows
          const csvRows = records.map((record: any) => {
            return columns.map(col => {
              const value = record[col];
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
              return String(value).replace(/"/g, '""');
            }).map(v => `"${v}"`).join(',');
          });
          
          const csv = [csvHeader, ...csvRows].join('\n');
          csvFolder?.file(`${table}.csv`, csv);
        }
      }

      // Add data.json to ZIP
      zip.file('superadmin_data.json', JSON.stringify(exportData, null, 2));

      // Add README
      const readme = `# SuperAdmin Data Export
Generated: ${new Date().toISOString()}

## Contents:
- superadmin_data.json: All system data (templates, stock photos, etc.)
- media/: ${mediaCount} stock photo files (${(mediaSizeBytes / 1024 / 1024).toFixed(2)} MB)
- schema/: Database schema CSV files (for documentation only, not imported)

## Tables Included:
${superAdminTables.map(t => `- ${t} (${exportData.data[t]?.length || 0} records)`).join('\n')}

## To Import:
1. Go to SuperAdmin Dashboard → Data Export/Import
2. Upload this ZIP file
3. Confirm import (will DELETE all existing data and media!)

## Notes:
- This export contains SYSTEM-WIDE data
- Import will DELETE and REPLACE all existing stock photos and templates
- Media files are included and will be uploaded to Supabase Storage
- CSV files in schema/ folder are for reference only
- Make a backup before importing!
`;

      zip.file('README.txt', readme);

      // Generate and download ZIP
      showMessage('Erstelle ZIP-Archiv...', 'info');
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `superadmin-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const totalRecords = Object.values(exportData.data).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0);
      showMessage(
        `Export erfolgreich! ${totalRecords} Datensätze aus ${superAdminTables.length} Tabellen und ${mediaCount} Medien-Dateien (${(mediaSizeBytes / 1024 / 1024).toFixed(2)} MB) exportiert.`,
        'success'
      );
    } catch (error) {
      console.error('Export error:', error);
      showMessage('Fehler beim Export der Daten!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      // Read ZIP file
      const zip = await JSZip.loadAsync(file);
      
      // Get data.json
      const dataFile = zip.file('superadmin_data.json');
      if (!dataFile) {
        showMessage('Ungültige Datei: superadmin_data.json fehlt!', 'error');
        setLoading(false);
        return;
      }

      const dataText = await dataFile.async('text');
      const importData = JSON.parse(dataText);

      if (importData.type !== 'superadmin') {
        showMessage('Ungültige Datei: Kein SuperAdmin-Export!', 'error');
        setLoading(false);
        return;
      }

      // Confirm import
      const mediaFiles = Object.keys(zip.files).filter(f => f.startsWith('media/') && !f.endsWith('/'));
      const mediaSize = mediaFiles.reduce((sum, f) => {
        const file = zip.files[f];
        return sum + (file._data ? file._data.uncompressedSize : 0);
      }, 0);

      const confirmed = window.confirm(
        `⚠️ WARNUNG: SuperAdmin-Daten Import\n\n` +
        `Dies wird ALLE bestehenden System-Daten LÖSCHEN und durch die Import-Daten ersetzen:\n\n` +
        superAdminTables.map(t => `- ${t}: ${importData.data[t]?.length || 0} Datensätze`).join('\n') +
        `\n- Medien: ${mediaFiles.length} Dateien (${(mediaSize / 1024 / 1024).toFixed(2)} MB)\n\n` +
        `Alle bestehenden Stock Photos und Vorlagen werden UNWIDERRUFLICH GELÖSCHT!\n\n` +
        `Haben Sie ein Backup erstellt?\n\n` +
        `FORTFAHREN?`
      );

      if (!confirmed) {
        setLoading(false);
        return;
      }

      let totalImported = 0;
      let totalMediaUploaded = 0;

      // First: Delete all existing stock photos from storage
      showMessage('Lösche bestehende Stock Photos...', 'info');
      try {
        const { data: existingPhotos } = await supabase.from('stock_photos').select('url');
        if (existingPhotos && existingPhotos.length > 0) {
          for (const photo of existingPhotos) {
            if (photo.url) {
              const path = photo.url.split('/storage/v1/object/public/user-media/')[1];
              if (path) {
                await supabase.storage.from('user-media').remove([path]);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error deleting old stock photos:', err);
      }

      // Import each table
      for (const table of superAdminTables) {
        const records = importData.data[table];
        if (!records || records.length === 0) continue;

        try {
          showMessage(`Importiere ${table}...`, 'info');
          
          // Delete existing data (clean import)
          await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');

          // Insert new data
          const { error } = await supabase.from(table).insert(records);

          if (error) {
            console.error(`Error importing ${table}:`, error);
            showMessage(`Fehler beim Import von ${table}: ${error.message}`, 'error');
            return;
          }

          totalImported += records.length;
          console.log(`Imported ${records.length} records to ${table}`);
        } catch (err) {
          console.error(`Error with table ${table}:`, err);
          showMessage(`Fehler beim Import von ${table}`, 'error');
          return;
        }
      }

      // Upload media files
      const mediaFilesToUpload = Object.keys(zip.files).filter(f => f.startsWith('media/') && !f.endsWith('/'));
      if (mediaFilesToUpload.length > 0) {
        showMessage(`Lade ${mediaFilesToUpload.length} Medien-Dateien hoch...`, 'info');
        
        for (const filePath of mediaFilesToUpload) {
          try {
            const file = zip.files[filePath];
            const blob = await file.async('blob');
            const filename = filePath.split('/').pop();
            
            if (filename) {
              // Upload to Supabase Storage
              const storagePath = `stock/${filename}`;
              const { error: uploadError } = await supabase.storage
                .from('user-media')
                .upload(storagePath, blob, { 
                  upsert: true,
                  contentType: blob.type || 'image/jpeg'
                });

              if (uploadError) {
                console.warn(`Failed to upload ${filename}:`, uploadError);
              } else {
                totalMediaUploaded++;
                
                // Update stock_photos URL to new uploaded file
                const { data: { publicUrl } } = supabase.storage
                  .from('user-media')
                  .getPublicUrl(storagePath);
                
                // Find and update the stock_photo record with matching filename
                await supabase
                  .from('stock_photos')
                  .update({ url: publicUrl })
                  .ilike('url', `%${filename}`);
              }
            }
          } catch (err) {
            console.warn(`Error uploading ${filePath}:`, err);
          }
        }
      }

      showMessage(
        `Import erfolgreich! ${totalImported} Datensätze und ${totalMediaUploaded} Medien-Dateien importiert.`,
        'success'
      );

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      showMessage('Fehler beim Import der Daten!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/superadmin')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SuperAdmin Data Export/Import</h1>
              <p className="text-sm text-gray-600 mt-1">
                Export und Import von System-Daten (Vorlagen, Stockphotos, etc.)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">⚠️ Achtung: System-Daten</p>
            <p>
              Diese Seite verwaltet SYSTEM-WEITE Daten, die für alle Kunden verfügbar sind.
              Änderungen betreffen alle Websites!
            </p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-900'
                : messageType === 'error'
                ? 'bg-red-50 border border-red-200 text-red-900'
                : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-6">
          {/* Export Section */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Daten exportieren</h2>
                <p className="text-gray-600 mb-4">
                  Exportiert alle SuperAdmin-Daten als ZIP-Archiv.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                  <p className="font-semibold text-gray-900 mb-2">Enthält:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Karten-Vorlagen (card_templates)</li>
                    <li>✓ Stockphotos-Metadaten (stock_photos)</li>
                    <li>✓ Alle Medien-Dateien (media/)</li>
                    <li>✓ Datenbank-Schema als CSV (schema/, nur zur Dokumentation)</li>
                  </ul>
                </div>
                <button
                  onClick={exportSuperAdminData}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Exportiere...
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-5 h-5" />
                      Jetzt exportieren
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Import Section */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Daten importieren</h2>
                <p className="text-gray-600 mb-4">
                  Lädt SuperAdmin-Daten aus einem ZIP-Export hoch.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-900 font-semibold mb-2">
                    ⚠️ WARNUNG: DESTRUKTIVE OPERATION!
                  </p>
                  <p className="text-sm text-red-900">
                    Der Import löscht ALLE bestehenden System-Daten unwiderruflich:
                  </p>
                  <ul className="text-sm text-red-900 mt-2 space-y-1 list-disc list-inside">
                    <li>Alle Karten-Vorlagen werden gelöscht</li>
                    <li>Alle Stock Photos werden aus dem Storage gelöscht</li>
                    <li>Alle Metadaten werden überschrieben</li>
                  </ul>
                  <p className="text-sm text-red-900 mt-2 font-semibold">
                    Erstellen Sie vorher unbedingt einen Export als Backup!
                  </p>
                </div>

                <input
                  type="file"
                  accept=".zip"
                  onChange={handleImport}
                  disabled={loading}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2 disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          {/* Info Section */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-3">
              <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Hinweise zum Daten-Export/Import:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Export erstellt ein ZIP mit JSON-Daten, Medien-Dateien und CSV-Schema</li>
                  <li>CSV-Dateien im schema/-Ordner dienen nur der Dokumentation</li>
                  <li>Import löscht ALLE bestehenden Daten und Medien (unwiderruflich!)</li>
                  <li>Vorher unbedingt Export als Backup erstellen!</li>
                  <li>Stock Photos werden als Dateien exportiert und hochgeladen</li>
                  <li>Card Templates enthalten vollständige Konfigurationen</li>
                  <li>Import kann mehrere Minuten dauern bei vielen Medien</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
