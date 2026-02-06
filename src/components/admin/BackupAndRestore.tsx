/**
 * Backup & Restore Component
 * Admin interface for exporting and importing complete website backups
 */

import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Info, Loader } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { exportBackup, importBackup, validateBackup } from '../../lib/backup';
import { useConfirmDialog } from './ConfirmDialog';
import type { BackupProgress, BackupInfo } from '../../types/backup';

export const BackupAndRestore: React.FC = () => {
  const { customerId, reload } = useWebsite();
  const { Dialog, confirm, success, error: showError, warning } = useConfirmDialog();

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<BackupProgress | null>(null);
  const [lastExportInfo, setLastExportInfo] = useState<BackupInfo | null>(null);

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<BackupProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  /**
   * Handle backup export
   */
  const handleExport = async () => {
    if (!customerId) {
      await showError('Fehler', 'Keine Customer-ID gefunden');
      return;
    }

    // Confirm export
    await confirm(
      'Backup erstellen?',
      'Ein vollständiges Backup Ihrer Website wird als ZIP-Datei heruntergeladen. Dies kann einige Minuten dauern.',
      async () => {
        setIsExporting(true);
        setExportProgress(null);

        try {
          const result = await exportBackup(
            customerId,
            `Manuelles Backup vom ${new Date().toLocaleDateString('de-DE')}`,
            (progress) => setExportProgress(progress)
          );

          if (result.success && result.blob && result.filename) {
            // Trigger download
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            a.click();
            URL.revokeObjectURL(url);

            // Track backup date for reminder system
            localStorage.setItem('lastBackupDate', new Date().toISOString());

            setLastExportInfo(result.backupInfo || null);
            await success('Backup erstellt', 'Das Backup wurde erfolgreich heruntergeladen.');
          } else {
            await showError('Fehler', result.error || 'Backup konnte nicht erstellt werden');
          }
        } catch (err) {
          console.error('Export error:', err);
          await showError('Fehler', 'Ein unerwarteter Fehler ist aufgetreten');
        } finally {
          setIsExporting(false);
          setExportProgress(null);
        }
      },
      { confirmText: 'Backup erstellen' }
    );
  };

  /**
   * Handle file selection for import
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationResult(null);

    // Validate file
    if (!customerId) return;

    const validation = await validateBackup(file, customerId);
    setValidationResult(validation);

    if (!validation.isValid) {
      await showError(
        'Ungültige Backup-Datei',
        <div>
          <p className="mb-2">Die ausgewählte Datei ist kein gültiges Backup:</p>
          <ul className="list-disc list-inside">
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      );
    } else if (validation.warnings.length > 0) {
      await warning(
        'Warnung',
        <div>
          <p className="mb-2">Das Backup wurde mit Warnungen validiert:</p>
          <ul className="list-disc list-inside">
            {validation.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  /**
   * Handle backup import
   */
  const handleImport = async () => {
    if (!selectedFile || !customerId || !validationResult?.isValid) return;

    // Confirm destructive operation
    await confirm(
      'Backup wiederherstellen?',
      <div>
        <p className="font-bold text-red-600 mb-2">⚠️ WARNUNG: Alle aktuellen Daten werden überschrieben!</p>
        <p>Diese Aktion kann nicht rückgängig gemacht werden. Stellen Sie sicher, dass Sie ein aktuelles Backup haben.</p>
        {validationResult.backupInfo && (
          <div className="mt-3 p-3 bg-gray-100 rounded">
            <p className="text-sm"><strong>Backup-ID:</strong> {validationResult.backupInfo.backupId}</p>
            <p className="text-sm"><strong>Erstellt:</strong> {new Date(validationResult.backupInfo.createdAt).toLocaleString('de-DE')}</p>
            {validationResult.backupInfo.description && (
              <p className="text-sm"><strong>Beschreibung:</strong> {validationResult.backupInfo.description}</p>
            )}
          </div>
        )}
      </div>,
      async () => {
        setIsImporting(true);
        setImportProgress(null);

        try {
          const result = await importBackup(
            selectedFile,
            customerId,
            (progress) => setImportProgress(progress)
          );

          if (result.success) {
            await success(
              'Backup wiederhergestellt',
              <div>
                <p className="mb-2">Das Backup wurde erfolgreich importiert!</p>
                {result.mediaFilesRestored && (
                  <p className="text-sm">📁 {result.mediaFilesRestored} Medien-Dateien wiederhergestellt</p>
                )}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Warnungen:</p>
                    <ul className="list-disc list-inside text-sm">
                      {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            );

            // Refresh website data
            await reload();

            // Reset form
            setSelectedFile(null);
            setValidationResult(null);
          } else {
            await showError('Fehler', result.error || 'Import fehlgeschlagen');
          }
        } catch (err) {
          console.error('Import error:', err);
          await showError('Fehler', 'Ein unerwarteter Fehler ist aufgetreten');
        } finally {
          setIsImporting(false);
          setImportProgress(null);
        }
      },
      { confirmText: 'Jetzt wiederherstellen', isDangerous: true }
    );
  };

  /**
   * Render progress indicator
   */
  const renderProgress = (progress: BackupProgress) => (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <Loader className="w-5 h-5 animate-spin text-blue-600" />
        <span className="font-medium text-blue-900">{progress.message}</span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      {progress.currentItem && (
        <p className="text-sm text-blue-700 mt-2">
          {progress.processedItems} / {progress.totalItems}: {progress.currentItem}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Dialog />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backup & Wiederherstellung</h1>
        <p className="text-gray-600">
          Sichern Sie Ihre Website-Daten oder stellen Sie ein früheres Backup wieder her.
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Was ist im Backup enthalten?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Alle Seiten und Inhalte</li>
            <li>Design und Theme-Einstellungen</li>
            <li>Navigation und Footer</li>
            <li>Alle Bilder und Medien-Dateien</li>
          </ul>
        </div>
      </div>

      {/* Export Section */}
      <section className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Backup erstellen</h2>
            <p className="text-gray-600">
              Laden Sie ein vollständiges Backup Ihrer Website als ZIP-Datei herunter.
            </p>
          </div>
        </div>

        {lastExportInfo && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-semibold">Letztes Backup erstellt:</p>
              <p>{new Date(lastExportInfo.createdAt).toLocaleString('de-DE')}</p>
              <p className="text-xs mt-1">
                📄 {lastExportInfo.stats.pageCount} Seiten • 
                🧩 {lastExportInfo.stats.blockCount} Blöcke • 
                📁 {lastExportInfo.stats.mediaFileCount} Medien-Dateien
              </p>
            </div>
          </div>
        )}

        {exportProgress && renderProgress(exportProgress)}

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Backup wird erstellt...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Jetzt Backup erstellen
            </>
          )}
        </button>
      </section>

      {/* Import Section */}
      <section className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Upload className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Backup wiederherstellen</h2>
            <p className="text-gray-600">
              Laden Sie eine Backup-ZIP-Datei hoch, um Ihre Website wiederherzustellen.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <p className="font-semibold">Achtung:</p>
            <p>Beim Wiederherstellen werden alle aktuellen Daten überschrieben. Erstellen Sie vorher ein Backup!</p>
          </div>
        </div>

        {/* File Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Backup-Datei auswählen (.zip)
          </label>
          <input
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            disabled={isImporting}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
          />
        </div>

        {/* Validation Result */}
        {validationResult && validationResult.isValid && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Gültige Backup-Datei</span>
            </div>
            {validationResult.backupInfo && (
              <div className="text-sm text-green-900 space-y-1">
                <p><strong>Backup-ID:</strong> {validationResult.backupInfo.backupId}</p>
                <p><strong>Erstellt:</strong> {new Date(validationResult.backupInfo.createdAt).toLocaleString('de-DE')}</p>
                <p><strong>Customer-ID:</strong> {validationResult.backupInfo.customerId}</p>
                {validationResult.backupInfo.description && (
                  <p><strong>Beschreibung:</strong> {validationResult.backupInfo.description}</p>
                )}
                <p className="text-xs mt-2">
                  📄 {validationResult.backupInfo.stats.pageCount} Seiten • 
                  🧩 {validationResult.backupInfo.stats.blockCount} Blöcke • 
                  📁 {validationResult.backupInfo.stats.mediaFileCount} Medien ({(validationResult.backupInfo.stats.mediaSizeBytes / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>
        )}

        {importProgress && renderProgress(importProgress)}

        <button
          onClick={handleImport}
          disabled={!selectedFile || !validationResult?.isValid || isImporting}
          className="w-full mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          {isImporting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Backup wird wiederhergestellt...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Backup wiederherstellen
            </>
          )}
        </button>
      </section>
    </div>
  );
};
