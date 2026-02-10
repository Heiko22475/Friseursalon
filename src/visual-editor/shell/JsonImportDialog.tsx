// =====================================================
// VISUAL EDITOR – JSON IMPORT DIALOG
// Superadmin: JSON aus Datei lesen → Kunde wählen → in DB speichern
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, AlertTriangle, Check, Search, FileJson, RefreshCw, History, ChevronDown, ChevronRight, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface WebsiteRow {
  id: string;
  customer_id: string;
  site_name: string;
  domain_name?: string | null;
  is_published: boolean;
  updated_at: string;
}

interface HistoryEntry {
  id: string;
  version_label: string | null;
  source: string;
  created_at: string;
}

interface JsonImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const JsonImportDialog: React.FC<JsonImportDialogProps> = ({ open, onClose }) => {
  // State
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [jsonValid, setJsonValid] = useState<boolean | null>(null);
  const [jsonError, setJsonError] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [versionLabel, setVersionLabel] = useState('AI-generierte Website');
  const [importMode, setImportMode] = useState<'full' | 'pages-only'>('full');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [generatedFileLoading, setGeneratedFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generierte JSON-Datei laden (.github_generated/website_import.json)
  const loadGeneratedFile = async () => {
    setGeneratedFileLoading(true);
    setSaveResult(null);
    try {
      // Vite importiert JSON-Dateien direkt als Module
      const module = await import('../../../.github_generated/website_import.json');
      const data = module.default || module;
      const text = JSON.stringify(data, null, 2);
      setJsonContent(text);
      validateJson(text);
    } catch (err: any) {
      setJsonValid(false);
      setJsonError('Datei nicht gefunden oder ungültig. Stelle sicher, dass .github_generated/website_import.json existiert.');
      setParsedJson(null);
      setJsonContent('');
    } finally {
      setGeneratedFileLoading(false);
    }
  };

  // Kunden laden
  useEffect(() => {
    if (!open) return;
    loadWebsites();
  }, [open]);

  // History laden wenn Kunde gewählt
  useEffect(() => {
    if (selectedCustomerId && historyOpen) {
      loadHistory(selectedCustomerId);
    }
  }, [selectedCustomerId, historyOpen]);

  const loadWebsites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('websites')
      .select('id, customer_id, site_name, domain_name, is_published, updated_at')
      .order('site_name');
    if (!error && data) {
      setWebsites(data);
    }
    setLoading(false);
  };

  const loadHistory = async (customerId: string) => {
    setHistoryLoading(true);
    const { data } = await supabase
      .from('website_content_history')
      .select('id, version_label, source, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
    setHistoryLoading(false);
  };

  // JSON-Datei einlesen
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJsonContent(text);
      validateJson(text);
    };
    reader.readAsText(file);
  };

  // JSON validieren
  const validateJson = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      setParsedJson(parsed);
      setJsonValid(true);
      setJsonError('');

      // Prüfen ob es eine vollständige Website oder nur Seiten sind
      if (parsed.pages && parsed.site_settings) {
        setImportMode('full');
      } else if (Array.isArray(parsed) && parsed[0]?.body) {
        setImportMode('pages-only');
      }
    } catch (err: any) {
      setJsonValid(false);
      setJsonError(err.message);
      setParsedJson(null);
    }
  };

  // Textarea-Eingabe
  const handleTextareaChange = (text: string) => {
    setJsonContent(text);
    if (text.trim()) {
      validateJson(text);
    } else {
      setJsonValid(null);
      setJsonError('');
      setParsedJson(null);
    }
  };

  // In DB speichern
  const handleSave = async () => {
    if (!selectedCustomerId || !parsedJson) return;

    setSaving(true);
    setSaveResult(null);

    try {
      // Website-Record laden
      const { data: website, error: fetchErr } = await supabase
        .from('websites')
        .select('id, content')
        .eq('customer_id', selectedCustomerId)
        .single();

      if (fetchErr || !website) {
        throw new Error(`Website für Kunde ${selectedCustomerId} nicht gefunden`);
      }

      // Manuelles History-Backup erstellen (zusätzlich zum Trigger)
      // Das Label beschreibt was als Nächstes passiert
      await supabase.from('website_content_history').insert({
        website_id: website.id,
        customer_id: selectedCustomerId,
        content: website.content,
        version_label: `Backup vor: ${versionLabel}`,
        source: 'ai-import',
      });

      // Neuen Content bestimmen
      let newContent: any;

      if (importMode === 'full') {
        // Komplettes Überschreiben – aber vorhandene Felder beibehalten die nicht im Import sind
        newContent = { ...website.content, ...parsedJson };
      } else {
        // Nur Seiten ersetzen
        newContent = { ...website.content, pages: parsedJson };
      }

      // In DB speichern
      const { error: updateErr } = await supabase
        .from('websites')
        .update({ content: newContent })
        .eq('customer_id', selectedCustomerId);

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      setSaveResult({
        success: true,
        message: `Content für Kunde ${selectedCustomerId} erfolgreich gespeichert! (${importMode === 'full' ? 'Vollständig' : 'Nur Seiten'})`,
      });

      // History neu laden
      if (historyOpen) {
        loadHistory(selectedCustomerId);
      }
    } catch (err: any) {
      setSaveResult({
        success: false,
        message: err.message || 'Fehler beim Speichern',
      });
    } finally {
      setSaving(false);
    }
  };

  // History-Version wiederherstellen
  const handleRestoreVersion = async (historyId: string) => {
    if (!selectedCustomerId) return;
    if (!window.confirm('Diese Version wiederherstellen? Der aktuelle Inhalt wird überschrieben (ein Backup wird automatisch erstellt).')) return;

    setSaving(true);
    try {
      // History-Eintrag laden
      const { data: histEntry } = await supabase
        .from('website_content_history')
        .select('content')
        .eq('id', historyId)
        .single();

      if (!histEntry) throw new Error('Version nicht gefunden');

      // Content überschreiben (Trigger erstellt automatisches Backup)
      const { error } = await supabase
        .from('websites')
        .update({ content: histEntry.content })
        .eq('customer_id', selectedCustomerId);

      if (error) throw error;

      setSaveResult({ success: true, message: 'Version erfolgreich wiederhergestellt!' });
      loadHistory(selectedCustomerId);
    } catch (err: any) {
      setSaveResult({ success: false, message: err.message });
    } finally {
      setSaving(false);
    }
  };

  // History-Eintrag löschen
  const handleDeleteHistoryEntry = async (historyId: string) => {
    if (!window.confirm('Diese Version endgültig löschen?')) return;
    await supabase.from('website_content_history').delete().eq('id', historyId);
    if (selectedCustomerId) loadHistory(selectedCustomerId);
  };

  // Gefilterte Kunden
  const filteredWebsites = websites.filter(w => {
    const search = searchTerm.toLowerCase();
    return (
      w.customer_id.includes(search) ||
      w.site_name.toLowerCase().includes(search) ||
      (w.domain_name || '').toLowerCase().includes(search)
    );
  });

  // JSON-Vorschau
  const jsonPreview = parsedJson ? {
    keys: Object.keys(parsedJson),
    pageCount: parsedJson.pages?.length ?? (Array.isArray(parsedJson) ? parsedJson.length : 0),
    hasSettings: !!parsedJson.site_settings,
    hasServices: !!parsedJson.services,
    hasContact: !!parsedJson.contact,
    hasTypography: !!parsedJson.typography,
  } : null;

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '900px',
          maxHeight: '85vh',
          backgroundColor: '#1e1e2e',
          borderRadius: '12px',
          border: '1px solid #3d3d4d',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #2d2d3d',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              backgroundColor: '#3b82f620',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileJson size={20} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#e0e0e0' }}>
                JSON Import
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Website-Content aus JSON-Datei importieren
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#6b7280',
              cursor: 'pointer', padding: '4px', borderRadius: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Kunden-Liste */}
          <div style={{
            width: '280px',
            borderRight: '1px solid #2d2d3d',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #2d2d3d' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 10px',
                backgroundColor: '#2d2d3d',
                borderRadius: '6px',
                border: '1px solid #3d3d4d',
              }}>
                <Search size={14} style={{ color: '#6b7280' }} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kunde suchen..."
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: '#e0e0e0', fontSize: '12px',
                  }}
                />
              </div>
            </div>
            <div style={{
              flex: 1, overflowY: 'auto', padding: '4px',
            }} className="ve-nav-scroll">
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                  Lade Kunden...
                </div>
              ) : filteredWebsites.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                  Keine Kunden gefunden
                </div>
              ) : (
                filteredWebsites.map(w => (
                  <button
                    key={w.customer_id}
                    onClick={() => {
                      setSelectedCustomerId(w.customer_id);
                      setSaveResult(null);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedCustomerId === w.customer_id ? '#3b82f620' : 'transparent',
                      color: selectedCustomerId === w.customer_id ? '#60a5fa' : '#c0c0c0',
                      cursor: 'pointer',
                      marginBottom: '2px',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      fontWeight: selectedCustomerId === w.customer_id ? 600 : 400,
                      fontSize: '13px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {w.site_name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      fontFamily: 'monospace',
                      marginTop: '2px',
                    }}>
                      ID: {w.customer_id}
                      {w.domain_name && ` · ${w.domain_name}`}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: JSON Input + Optionen */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* JSON Input */}
            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }} className="ve-props-scroll">
              {/* AI-generierte Datei laden */}
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={loadGeneratedFile}
                  disabled={generatedFileLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: '#7c3aed18',
                    border: '1px solid #7c3aed40',
                    borderRadius: '8px',
                    color: '#a78bfa',
                    cursor: generatedFileLoading ? 'wait' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    width: '100%',
                    transition: 'all 0.15s',
                  }}
                >
                  {generatedFileLoading ? (
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div>AI-generiertes JSON laden</div>
                    <div style={{ fontSize: '10px', fontWeight: 400, color: '#6b7280', marginTop: '2px' }}>
                      .github_generated/website_import.json
                    </div>
                  </div>
                </button>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '16px', color: '#4a4a5a', fontSize: '11px',
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#2d2d3d' }} />
                <span>oder</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#2d2d3d' }} />
              </div>

              {/* Datei auswählen */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
                  JSON-Datei hochladen
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#2d2d3d',
                    border: '1px dashed #4d4d5d',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%',
                    justifyContent: 'center',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <Upload size={16} />
                  JSON-Datei auswählen oder hierher ziehen
                </button>
              </div>

              {/* Oder Textarea */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
                  Oder JSON direkt einfügen
                </label>
                <textarea
                  value={jsonContent}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  placeholder='{"site_settings": {...}, "pages": [...], ...}'
                  style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#12121e',
                    border: `1px solid ${jsonValid === false ? '#ef4444' : jsonValid === true ? '#22c55e' : '#3d3d4d'}`,
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#d1d5db',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                />
              </div>

              {/* Validierungs-Status */}
              {jsonValid === false && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '10px 12px',
                  backgroundColor: '#ef444420',
                  border: '1px solid #ef444440',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}>
                  <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                  <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                    <strong>Ungültiges JSON:</strong> {jsonError}
                  </div>
                </div>
              )}

              {jsonValid && jsonPreview && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#22c55e15',
                  border: '1px solid #22c55e30',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Check size={14} style={{ color: '#22c55e' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#86efac' }}>
                      JSON valide
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.6' }}>
                    <div>Top-Level Keys: <code style={{ color: '#60a5fa' }}>{jsonPreview.keys.join(', ')}</code></div>
                    {jsonPreview.pageCount > 0 && <div>Seiten: <strong>{jsonPreview.pageCount}</strong></div>}
                    {jsonPreview.hasSettings && <div>✓ Site Settings</div>}
                    {jsonPreview.hasServices && <div>✓ Services</div>}
                    {jsonPreview.hasContact && <div>✓ Kontakt</div>}
                    {jsonPreview.hasTypography && <div>✓ Typographie</div>}
                  </div>
                </div>
              )}

              {/* Import-Modus */}
              {jsonValid && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
                    Import-Modus
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['full', 'pages-only'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setImportMode(mode)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: `1px solid ${importMode === mode ? '#3b82f6' : '#3d3d4d'}`,
                          backgroundColor: importMode === mode ? '#3b82f620' : '#2d2d3d',
                          color: importMode === mode ? '#60a5fa' : '#9ca3af',
                          cursor: 'pointer',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {mode === 'full' ? 'Vollständig' : 'Nur Seiten'}
                        </div>
                        <div style={{ fontSize: '10px', marginTop: '2px', color: '#6b7280' }}>
                          {mode === 'full' ? 'Ersetzt gesamten Content' : 'Ersetzt nur pages[]'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Version Label */}
              {jsonValid && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
                    Versions-Bezeichnung (für History)
                  </label>
                  <input
                    value={versionLabel}
                    onChange={(e) => setVersionLabel(e.target.value)}
                    className="ve-input"
                    style={{ width: '100%' }}
                    placeholder="z.B. AI-generierte Website"
                  />
                </div>
              )}

              {/* History-Bereich */}
              {selectedCustomerId && (
                <div style={{
                  borderTop: '1px solid #2d2d3d',
                  paddingTop: '12px',
                  marginTop: '12px',
                }}>
                  <button
                    onClick={() => setHistoryOpen(!historyOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: 'none', color: '#9ca3af',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      padding: '4px 0',
                    }}
                  >
                    {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <History size={14} />
                    Content-History
                  </button>

                  {historyOpen && (
                    <div style={{ marginTop: '8px' }}>
                      {historyLoading ? (
                        <div style={{ fontSize: '11px', color: '#6b7280', padding: '8px 0' }}>Lade...</div>
                      ) : history.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#6b7280', padding: '8px 0' }}>
                          Keine History-Einträge vorhanden.
                          {' '}Tipp: Führe zuerst das SQL-Skript <code style={{ color: '#60a5fa' }}>supabase-content-history.sql</code> aus.
                        </div>
                      ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="ve-nav-scroll">
                          {history.map(h => (
                            <div
                              key={h.id}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#2d2d3d',
                                marginBottom: '4px',
                                fontSize: '11px',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: '#c0c0c0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {h.version_label || h.source}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '10px' }}>
                                  {new Date(h.created_at).toLocaleString('de-DE')} · {h.source}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                                <button
                                  onClick={() => handleRestoreVersion(h.id)}
                                  style={{
                                    padding: '3px 8px', borderRadius: '4px', border: '1px solid #3b82f640',
                                    backgroundColor: '#3b82f615', color: '#60a5fa', cursor: 'pointer',
                                    fontSize: '10px', fontWeight: 600,
                                  }}
                                  title="Diese Version wiederherstellen"
                                >
                                  <RefreshCw size={10} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHistoryEntry(h.id)}
                                  style={{
                                    padding: '3px 6px', borderRadius: '4px', border: '1px solid #ef444440',
                                    backgroundColor: '#ef444415', color: '#fca5a5', cursor: 'pointer',
                                    fontSize: '10px',
                                  }}
                                  title="Löschen"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Ergebnis-Meldung */}
              {saveResult && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '10px 12px',
                  backgroundColor: saveResult.success ? '#22c55e15' : '#ef444420',
                  border: `1px solid ${saveResult.success ? '#22c55e30' : '#ef444440'}`,
                  borderRadius: '8px',
                  marginTop: '12px',
                }}>
                  {saveResult.success ? (
                    <Check size={16} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                  ) : (
                    <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                  )}
                  <div style={{ fontSize: '12px', color: saveResult.success ? '#86efac' : '#fca5a5' }}>
                    {saveResult.message}
                  </div>
                </div>
              )}
            </div>

            {/* Footer mit Aktions-Buttons */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #2d2d3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {selectedCustomerId
                  ? `Ziel: ${websites.find(w => w.customer_id === selectedCustomerId)?.site_name} (${selectedCustomerId})`
                  : 'Bitte einen Kunden auswählen'}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '8px 16px', borderRadius: '6px',
                    border: '1px solid #3d3d4d', backgroundColor: 'transparent',
                    color: '#9ca3af', cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedCustomerId || !jsonValid || saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 20px', borderRadius: '6px', border: 'none',
                    backgroundColor: (!selectedCustomerId || !jsonValid || saving) ? '#2d2d3d' : '#3b82f6',
                    color: (!selectedCustomerId || !jsonValid || saving) ? '#6b7280' : '#ffffff',
                    cursor: (!selectedCustomerId || !jsonValid || saving) ? 'default' : 'pointer',
                    fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Speichert...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Importieren
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
