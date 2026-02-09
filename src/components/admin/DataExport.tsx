import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Upload, Database, FileArchive } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import JSZip from 'jszip';

export const DataExport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Liste aller Tabellen, die exportiert werden sollen
  const tables = [
    'general',
    'contact',
    'hours',
    'services',
    'services_section',
    'reviews',
    'about',
    'pricing',
    'gallery',
    'pages',
    'page_blocks',
    'building_blocks',
    'site_settings',
    'static_content',
  ];

  const exportData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const exportData: Record<string, any> = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {},
      };

      // Alle Tabellen durchgehen und Daten abrufen
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: true });

          if (error) {
            console.warn(`Warnung bei Tabelle ${table}:`, error);
            exportData.data[table] = [];
          } else {
            exportData.data[table] = data || [];
          }
        } catch (err) {
          console.warn(`Fehler bei Tabelle ${table}:`, err);
          exportData.data[table] = [];
        }
      }

      // JSON-Datei erstellen und herunterladen
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salon-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('Export erfolgreich! Datei wurde heruntergeladen.');
    } catch (error) {
      console.error('Fehler beim Export:', error);
      setMessage('Fehler beim Export der Daten!');
    } finally {
      setLoading(false);
    }
  };

  const exportSchema = async () => {
    setLoading(true);
    setMessage('');

    try {
      const zip = new JSZip();

      // Get all table names from our known tables
      const allTables = [
        'general', 'contact', 'hours', 'services', 'services_section',
        'reviews', 'about', 'pricing', 'gallery', 'pages', 'page_blocks',
        'building_blocks', 'site_settings', 'static_content'
      ];

      // Create a comprehensive schema documentation
      const schemaInfo = [];
      
      for (const tableName of allTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            schemaInfo.push({
              table_name: tableName,
              columns: columns.join(', '),
              column_count: columns.length
            });
          } else if (!error) {
            // Empty table but exists
            schemaInfo.push({
              table_name: tableName,
              columns: 'Table exists but is empty',
              column_count: 0
            });
          }
        } catch (err) {
          console.warn(`Could not read table ${tableName}:`, err);
        }
      }

      // Convert to CSV
      if (schemaInfo.length > 0) {
        const csv = convertToCSV(schemaInfo);
        zip.file('tables_overview.csv', csv);
      }

      // Create comprehensive README
      const readme = `# Database Schema Export
Generated: ${new Date().toISOString()}

## Contents:
- tables_overview.csv: Overview of all tables and their columns

## Your Tables:
${allTables.map(t => `- ${t}`).join('\n')}

## Complete Schema Backup:
Your complete schema is stored in these SQL files (already in your project):

1. supabase-building-blocks-schema.sql
   - Main tables: pages, building_blocks, page_blocks, site_settings
   
2. supabase-instance-support.sql
   - Instance ID support for repeatable blocks
   
3. supabase-static-content.sql
   - Static content table and block type
   
4. supabase-legal-pages.sql
   - Impressum and Datenschutz pages with system_page flag
   
5. supabase-update-can-repeat.sql
   - Updates to make all blocks repeatable
   
6. supabase-fix-services-section-rls.sql
   - RLS policies for services_section

## To Restore Database:
1. Create new Supabase project
2. Run the SQL files above in order
3. Import your data JSON using "Daten importieren"

## For Complete Schema Export (indexes, policies, constraints):
Run these queries in Supabase SQL Editor and export results:

Query 1 - Table Structure:
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

Query 2 - Indexes:
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

Query 3 - RLS Policies:
SELECT tablename, policyname, cmd, roles::text, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

Query 4 - Foreign Keys:
SELECT tc.table_name, tc.constraint_name, kcu.column_name, 
       ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
`;

      zip.file('README.txt', readme);

      // Add SQL files info
      const sqlFilesInfo = `SQL Files Checklist for Complete Restore:

☐ supabase-building-blocks-schema.sql (MUST RUN FIRST)
☐ supabase-instance-support.sql
☐ supabase-static-content.sql  
☐ supabase-legal-pages.sql
☐ supabase-update-can-repeat.sql
☐ supabase-fix-services-section-rls.sql

After running all SQL files, import your data JSON.
`;

      zip.file('SQL_FILES_ORDER.txt', sqlFilesInfo);

      // Generate ZIP and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schema-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage(`Schema erfolgreich exportiert! ${schemaInfo.length} Tabellen dokumentiert.`);
    } catch (error) {
      console.error('Fehler beim Schema-Export:', error);
      setMessage('Fehler beim Schema-Export!');
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.data) {
        throw new Error('Ungültiges Datenformat');
      }

      let successCount = 0;
      let errorCount = 0;

      // Warnung anzeigen
      if (
        !confirm(
          'Achtung: Beim Import werden bestehende Daten NICHT gelöscht, sondern neue Einträge hinzugefügt. Möchten Sie fortfahren?'
        )
      ) {
        setLoading(false);
        return;
      }

      // Alle Tabellen durchgehen und Daten importieren
      for (const table of tables) {
        if (importData.data[table] && Array.isArray(importData.data[table])) {
          try {
            // IDs entfernen, damit neue generiert werden
            const dataToInsert = importData.data[table].map((item: any) => {
              const { id, created_at, updated_at, ...rest } = item;
              return rest;
            });

            if (dataToInsert.length > 0) {
              const { error } = await supabase.from(table).insert(dataToInsert);

              if (error) {
                console.error(`Fehler beim Import von ${table}:`, error);
                errorCount++;
              } else {
                successCount++;
              }
            }
          } catch (err) {
            console.error(`Fehler bei Tabelle ${table}:`, err);
            errorCount++;
          }
        }
      }

      setMessage(
        `Import abgeschlossen! ${successCount} Tabellen erfolgreich, ${errorCount} Fehler.`
      );
    } catch (error) {
      console.error('Fehler beim Import:', error);
      setMessage('Fehler beim Import der Daten!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Daten Export/Import"
        icon={Database}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--admin-bg-card)' }}>

          {message && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: message.includes('Fehler') ? 'var(--admin-danger-bg)' : 'var(--admin-success-bg)',
                color: message.includes('Fehler') ? 'var(--admin-danger)' : 'var(--admin-success)'
              }}
            >
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* Export Section */}
            <div style={{ borderBottom: '1px solid var(--admin-border)' }} className="pb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Daten exportieren</h2>
              <p className="mb-6" style={{ color: 'var(--admin-text-secondary)' }}>
                Exportieren Sie alle Daten aus der Datenbank als JSON-Datei. Dies ist nützlich für
                Backups oder den Umzug zu einer anderen Datenbank.
              </p>

              <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'var(--admin-accent-bg)', border: '1px solid var(--admin-border)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--admin-text-heading)' }}>Exportierte Tabellen:</h3>
                <ul className="text-sm space-y-1" style={{ color: 'var(--admin-text-secondary)' }}>
                  {tables.map((table) => (
                    <li key={table}>• {table}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={exportData}
                disabled={loading}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--admin-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Download className="w-5 h-5" />
                {loading ? 'Exportiere...' : 'Jetzt exportieren'}
              </button>
            </div>

            {/* Schema Export Section */}
            <div style={{ borderBottom: '1px solid var(--admin-border)' }} className="pb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Schema exportieren</h2>
              <p className="mb-6" style={{ color: 'var(--admin-text-secondary)' }}>
                Exportieren Sie die komplette Datenbankstruktur (Tabellen, Indizes, Policies, Foreign Keys) als ZIP mit CSV-Dateien.
              </p>

              <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'var(--admin-accent-bg)', border: '1px solid var(--admin-border)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--admin-text-heading)' }}>Exportierte Dateien:</h3>
                <ul className="text-sm space-y-1" style={{ color: 'var(--admin-text-secondary)' }}>
                  <li>• tables.csv - Alle Tabellen mit Spalten und Datentypen</li>
                  <li>• indexes.csv - Alle Indizes</li>
                  <li>• policies.csv - Alle RLS Policies</li>
                  <li>• foreign_keys.csv - Alle Foreign Key Constraints</li>
                </ul>
              </div>

              <button
                onClick={exportSchema}
                disabled={loading}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--admin-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <FileArchive className="w-5 h-5" />
                {loading ? 'Exportiere Schema...' : 'Schema als ZIP exportieren'}
              </button>
            </div>

            {/* Import Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>Daten importieren</h2>
              <p className="mb-6" style={{ color: 'var(--admin-text-secondary)' }}>
                Importieren Sie Daten aus einer zuvor exportierten JSON-Datei. Bestehende Daten
                bleiben erhalten, neue Einträge werden hinzugefügt.
              </p>

              <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'var(--admin-danger-bg)', border: '1px solid var(--admin-border)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--admin-danger)' }}>⚠️ Wichtig:</h3>
                <ul className="text-sm space-y-1" style={{ color: 'var(--admin-text-secondary)' }}>
                  <li>• Bestehende Daten werden NICHT gelöscht</li>
                  <li>• Neue Einträge werden hinzugefügt</li>
                  <li>• Duplikate können entstehen</li>
                  <li>• Erstellen Sie vorher ein Backup!</li>
                </ul>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={loading}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer inline-flex ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ backgroundColor: 'var(--admin-accent)' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Upload className="w-5 h-5" />
                  {loading ? 'Importiere...' : 'JSON-Datei auswählen'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
