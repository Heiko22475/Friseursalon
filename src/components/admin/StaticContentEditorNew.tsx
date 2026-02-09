import React, { useState } from 'react';
import { Save, FileText } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { useWebsite } from '../../contexts/WebsiteContext';

export const StaticContentEditorNew: React.FC = () => {
  const { website, loading, updateStaticContent } = useWebsite();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Local state for form
  const [formData, setFormData] = useState({
    imprint: website?.static_content?.imprint || '',
    privacy: website?.static_content?.privacy || '',
    terms: website?.static_content?.terms || '',
  });

  // Update form data when website context loads
  React.useEffect(() => {
    if (website?.static_content) {
      setFormData({
        imprint: website.static_content.imprint || '',
        privacy: website.static_content.privacy || '',
        terms: website.static_content.terms || '',
      });
    }
  }, [website?.static_content]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await updateStaticContent(formData);
      
      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage('Fehler beim Speichern!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Rechtliche Seiten"
        subtitle="Bearbeiten Sie hier die Inhalte für Impressum, Datenschutz und AGB."
        icon={FileText}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            {/* Impressum */}
            <div>
              <label className="block text-lg font-semibold mb-2" style={{ color: 'var(--admin-text-heading)' }}>
                Impressum
              </label>
              <p className="text-sm mb-3" style={{ color: 'var(--admin-text-secondary)' }}>
                Pflichtangaben gemäß §5 TMG (Name, Adresse, Kontakt, etc.)
              </p>
              <textarea
                value={formData.imprint}
                onChange={(e) => setFormData({ ...formData, imprint: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 rounded-lg font-mono text-sm"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                placeholder="Angaben gemäß § 5 TMG

[Firmenname / Name]
[Straße Hausnummer]
[PLZ Ort]

Kontakt:
Telefon: [Telefonnummer]
E-Mail: [E-Mail-Adresse]

Umsatzsteuer-ID: [falls vorhanden]"
              />
            </div>

            {/* Datenschutzerklärung */}
            <div>
              <label className="block text-lg font-semibold mb-2" style={{ color: 'var(--admin-text-heading)' }}>
                Datenschutzerklärung
              </label>
              <p className="text-sm mb-3" style={{ color: 'var(--admin-text-secondary)' }}>
                Informationen zur Datenverarbeitung gemäß DSGVO
              </p>
              <textarea
                value={formData.privacy}
                onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                rows={16}
                className="w-full px-4 py-3 rounded-lg font-mono text-sm"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                placeholder="Datenschutzerklärung

1. Verantwortlicher
[Name und Kontaktdaten]

2. Erhebung und Speicherung personenbezogener Daten
[Beschreibung der Datenverarbeitung]

3. Cookies
[Cookie-Informationen]

4. Ihre Rechte
- Auskunftsrecht
- Recht auf Berichtigung
- Recht auf Löschung
..."
              />
            </div>

            {/* AGB / Nutzungsbedingungen */}
            <div>
              <label className="block text-lg font-semibold mb-2" style={{ color: 'var(--admin-text-heading)' }}>
                AGB / Nutzungsbedingungen
              </label>
              <p className="text-sm mb-3" style={{ color: 'var(--admin-text-secondary)' }}>
                Allgemeine Geschäftsbedingungen (falls zutreffend)
              </p>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 rounded-lg font-mono text-sm"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                placeholder="Allgemeine Geschäftsbedingungen

1. Geltungsbereich
[Beschreibung]

2. Vertragsschluss
[Beschreibung]

3. Leistungen
[Beschreibung]

4. Preise und Zahlung
[Beschreibung]
..."
              />
            </div>

            <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid var(--admin-border)' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--admin-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Save className="w-5 h-5" />
                {saving ? 'Speichern...' : 'Alle Änderungen speichern'}
              </button>

              <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                💡 Tipp: Verwenden Sie einen Datenschutz-Generator für rechtssichere Texte
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg p-6" style={{ backgroundColor: 'var(--admin-accent-bg)', border: '1px solid var(--admin-border)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--admin-text-heading)' }}>
            ⚖️ Rechtliche Hinweise
          </h3>
          <ul className="text-sm space-y-1" style={{ color: 'var(--admin-text-secondary)' }}>
            <li>• Impressum ist in Deutschland für geschäftliche Websites Pflicht (§5 TMG)</li>
            <li>• Datenschutzerklärung ist gemäß DSGVO erforderlich</li>
            <li>• Konsultieren Sie einen Rechtsanwalt für rechtssichere Texte</li>
            <li>• Generatoren wie eRecht24 oder Impressum-Generator können helfen</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
