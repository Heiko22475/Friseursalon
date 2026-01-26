import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Download, Upload, Database } from 'lucide-react';

export const DataExport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Liste aller Tabellen, die exportiert werden sollen
  const tables = [
    'general',
    'contact',
    'hours',
    'services',
    'reviews',
    'about',
    'pricing',
    'gallery',
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold text-gray-900">Daten Export/Import</h1>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('Fehler')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* Export Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Daten exportieren</h2>
              <p className="text-gray-600 mb-6">
                Exportieren Sie alle Daten aus der Datenbank als JSON-Datei. Dies ist nützlich für
                Backups oder den Umzug zu einer anderen Datenbank.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Exportierte Tabellen:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {tables.map((table) => (
                    <li key={table}>• {table}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={exportData}
                disabled={loading}
                className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {loading ? 'Exportiere...' : 'Jetzt exportieren'}
              </button>
            </div>

            {/* Import Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Daten importieren</h2>
              <p className="text-gray-600 mb-6">
                Importieren Sie Daten aus einer zuvor exportierten JSON-Datei. Bestehende Daten
                bleiben erhalten, neue Einträge werden hinzugefügt.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Wichtig:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
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
                  className={`flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition cursor-pointer inline-flex ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
