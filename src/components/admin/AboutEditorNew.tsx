import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Award, Heart, Star } from 'lucide-react';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import { getAdaptiveTextColors } from '../../utils/color-utils';
import { useWebsite } from '../../contexts/WebsiteContext';

export const AboutEditorNew: React.FC = () => {
  const navigate = useNavigate();
  const { website, loading, updateAbout } = useWebsite();
  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ 
    blockType: 'about', 
    instanceId: 1 
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Local state for form
  const [formData, setFormData] = useState({
    title: website?.about?.title || '',
    content: website?.about?.content || '',
    team_title: website?.about?.team_title || '',
  });

  // Update form data when website context loads
  React.useEffect(() => {
    if (website?.about) {
      setFormData({
        title: website.about.title || '',
        content: website.about.content || '',
        team_title: website.about.team_title || '',
      });
    }
  }, [website?.about]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await updateAbout({
        ...formData,
        team: website?.about?.team || [],
      });
      
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
          <div className="flex items-center gap-3">
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              <Eye className="w-5 h-5" />
              Vorschau
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Über uns</h1>

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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Titel</label>
              <input
                type="text"
                value={formData.team_title}
                onChange={(e) => setFormData({ ...formData, team_title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Unser Team"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Vorschau: About Sektion"
          maxWidth="w-[1024px]"
        >
          {(() => {
            const customProps = backgroundColor ? getAdaptiveTextColors(backgroundColor) : {};
            
            return (
              <section 
                className="py-20 bg-slate-50"
                style={{ 
                  backgroundColor: backgroundColor || undefined,
                  ...customProps as React.CSSProperties
                }}
              >
                <div className="container mx-auto px-4">
                  <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div>
                        <h2 
                          className="text-4xl md:text-5xl font-bold mb-6"
                          style={{ color: 'var(--text-primary, #1e293b)' }}
                        >
                          {formData.title || 'Ihr Titel hier'}
                        </h2>
                        <p 
                          className="text-lg mb-6 leading-relaxed whitespace-pre-wrap"
                          style={{ color: 'var(--text-secondary, #475569)' }}
                        >
                          {formData.content || 'Ihre Beschreibung wird hier angezeigt...'}
                        </p>
                      </div>
                      
                      <div>
                        <div className="grid grid-cols-2 gap-6">
                          {[
                            { icon: Award, title: "15+ Years", text: "Experience" },
                            { icon: Star, title: "500+", text: "Happy Clients" },
                            { icon: Heart, title: "Premium", text: "Products" },
                            { icon: Award, title: "Certified", text: "Stylists" }
                          ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                              <div key={index} className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition">
                                <Icon className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-slate-800 mb-1">{item.title}</div>
                                <div className="text-slate-600">{item.text}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}
        </Modal>
      </div>
    </div>
  );
};
