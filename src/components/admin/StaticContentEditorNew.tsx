import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';

export const StaticContentEditorNew: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
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
            <FileText className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Rechtliche Seiten
            </h1>
          </div>

          <p className="text-gray-600 mb-8">
            Bearbeiten Sie hier die Inhalte für Impressum, Datenschutz und AGB.
            Diese Seiten sind für eine rechtskonforme Website erforderlich.
          </p>

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
            {/* Impressum */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Impressum
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Pflichtangaben gemäß §5 TMG (Name, Adresse, Kontakt, etc.)
              </p>
              <textarea
                value={formData.imprint}
                onChange={(e) => setFormData({ ...formData, imprint: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
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
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Datenschutzerklärung
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Informationen zur Datenverarbeitung gemäß DSGVO
              </p>
              <textarea
                value={formData.privacy}
                onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                rows={16}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
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
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                AGB / Nutzungsbedingungen
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Allgemeine Geschäftsbedingungen (falls zutreffend)
              </p>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
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

            <div className="flex items-center gap-4 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Speichern...' : 'Alle Änderungen speichern'}
              </button>

              <div className="text-sm text-gray-500">
                💡 Tipp: Verwenden Sie einen Datenschutz-Generator für rechtssichere Texte
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            ⚖️ Rechtliche Hinweise
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
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
