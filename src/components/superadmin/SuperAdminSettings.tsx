import React, { useEffect, useState } from 'react';
import { Settings, RefreshCw, Save, Info, ExternalLink } from 'lucide-react';
import { AdminHeader } from '../admin/AdminHeader';
import { supabase } from '../../lib/supabase';

// =====================================================
// SUPERADMIN SYSTEM SETTINGS
//
// HINWEIS: Dafür muss die Tabelle `system_settings`
// in Supabase angelegt sein. SQL: supabase-system-settings.sql
// =====================================================

interface SystemSettings {
  prerender_wait_ms: string;
  prerender_selector_timeout_ms: string;
  sitemap_changefreq: string;
  vercel_deploy_hook: string;
}

const DEFAULTS: SystemSettings = {
  prerender_wait_ms: '1000',
  prerender_selector_timeout_ms: '10000',
  sitemap_changefreq: 'weekly',
  vercel_deploy_hook: '',
};

export const SuperAdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ===== LOAD =====
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');

      if (error) {
        console.error('system_settings nicht gefunden:', error.message);
        setLoading(false);
        return;
      }

      const map: Partial<SystemSettings> = {};
      (data ?? []).forEach(({ key, value }) => {
        (map as Record<string, string>)[key] = value;
      });

      setSettings({ ...DEFAULTS, ...map });
      setLoading(false);
    })();
  }, []);

  // ===== SAVE =====
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));

    const { error } = await supabase
      .from('system_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      setMessage({ text: `Fehler beim Speichern: ${error.message}`, type: 'error' });
    } else {
      setMessage({ text: 'Gespeichert.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  };

  // ===== TRIGGER REDEPLOY =====
  const handleTriggerDeploy = async () => {
    if (!settings.vercel_deploy_hook) {
      setMessage({ text: 'Kein Deploy Hook konfiguriert.', type: 'error' });
      return;
    }
    setTriggering(true);
    setMessage(null);
    try {
      const res = await fetch(settings.vercel_deploy_hook, { method: 'POST' });
      if (res.ok) {
        setMessage({ text: '✅ Deployment wurde ausgelöst. Vercel baut jetzt neu.', type: 'success' });
      } else {
        setMessage({ text: `Deploy Hook antwortete mit Status ${res.status}.`, type: 'error' });
      }
    } catch (e) {
      setMessage({ text: `Netzwerkfehler: ${(e as Error).message}`, type: 'error' });
    }
    setTriggering(false);
  };

  const set = (key: keyof SystemSettings) => (value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="System-Einstellungen" icon={Settings} backTo="/superadmin" />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Architecture info box */}
        <div className="rounded-lg p-4 flex gap-3" style={{ backgroundColor: 'var(--admin-accent-bg)', border: '1px solid var(--admin-border)' }}>
          <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--admin-accent)' }} />
          <div className="text-sm space-y-1" style={{ color: 'var(--admin-text-secondary)' }}>
            <p><strong style={{ color: 'var(--admin-text)' }}>Wie funktioniert das Re-Rendering?</strong></p>
            <p>
              Diese Anwendung ist eine statische SPA. Seiten werden <em>einmalig beim Deployment</em> durch
              Puppeteer gerendert (<code>npm run build:prerender</code>). Es gibt kein laufendes Re-Rendering
              pro Nutzeranfrage.
            </p>
            <p>
              Um Inhalte nach einer Änderung zu aktualisieren, muss ein neues Deployment ausgelöst werden –
              entweder manuell über den Button unten oder automatisch (z. B. per Vercel Cron / GitHub Action).
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{
            backgroundColor: message.type === 'success' ? 'var(--admin-success-bg, #f0fdf4)' : 'var(--admin-danger-bg, #fef2f2)',
            color: message.type === 'success' ? 'var(--admin-success, #16a34a)' : 'var(--admin-danger, #dc2626)',
            border: `1px solid ${message.type === 'success' ? 'var(--admin-success, #16a34a)' : 'var(--admin-danger, #dc2626)'}`,
          }}>
            {message.text}
          </div>
        )}

        {/* === DEPLOY HOOK === */}
        <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--admin-text-heading)' }}>
            Deployment-Trigger (Vercel Deploy Hook)
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
              Deploy Hook URL
            </label>
            <input
              type="url"
              placeholder="https://api.vercel.com/v1/integrations/deploy/..."
              value={settings.vercel_deploy_hook}
              onChange={e => set('vercel_deploy_hook')(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              Vercel → Projekteinstellungen → Git → Deploy Hooks → Neuen Hook erstellen.{' '}
              <a
                href="https://vercel.com/docs/deployments/deploy-hooks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline"
                style={{ color: 'var(--admin-accent)' }}
              >
                Dokumentation <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <button
            onClick={handleTriggerDeploy}
            disabled={triggering || !settings.vercel_deploy_hook}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ backgroundColor: 'var(--admin-accent)' }}
          >
            <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
            {triggering ? 'Wird ausgelöst…' : 'Jetzt neu rendern (Deploy auslösen)'}
          </button>
        </div>

        {/* === PRERENDER CONFIG === */}
        <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--admin-text-heading)' }}>
            Prerender-Parameter
          </h2>
          <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
            Diese Werte werden vom Prerender-Script (<code>scripts/prerender.js</code>) beim nächsten Build aus Supabase gelesen.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Wartezeit nach Seitenload (ms)
              </label>
              <input
                type="number"
                min={0}
                max={10000}
                step={100}
                value={settings.prerender_wait_ms}
                onChange={e => set('prerender_wait_ms')(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                Zeit (ms) nach <code>networkidle0</code>, bevor HTML gespeichert wird. Standard: 1000
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Selector-Timeout (ms)
              </label>
              <input
                type="number"
                min={1000}
                max={60000}
                step={1000}
                value={settings.prerender_selector_timeout_ms}
                onChange={e => set('prerender_selector_timeout_ms')(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                Maximale Zeit (ms) auf <code>.dynamic-page</code>-Container zu warten. Standard: 10000
              </p>
            </div>
          </div>
        </div>

        {/* === SITEMAP === */}
        <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--admin-text-heading)' }}>
            Sitemap
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
              Crawl-Frequenz (<code>changefreq</code>)
            </label>
            <select
              value={settings.sitemap_changefreq}
              onChange={e => set('sitemap_changefreq')(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
            >
              <option value="always">always – bei jeder Anfrage</option>
              <option value="hourly">hourly – stündlich</option>
              <option value="daily">daily – täglich</option>
              <option value="weekly">weekly – wöchentlich</option>
              <option value="monthly">monthly – monatlich</option>
              <option value="yearly">yearly – jährlich</option>
            </select>
            <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              Hinweis an Suchmaschinen, wie oft sie die Seiten neu crawlen sollen. Wirkt sich nur auf die
              generierte <code>sitemap.xml</code> aus.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ backgroundColor: 'var(--admin-accent)' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichern…' : 'Einstellungen speichern'}
          </button>
        </div>
      </div>
    </div>
  );
};
