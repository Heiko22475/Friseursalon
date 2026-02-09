// =====================================================
// CARD TESTIMONIAL EDITOR PAGE
// Wrapper-Seite für CardTestimonialEditor mit Navigation
// =====================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, Loader2, Star } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { CardTestimonialEditor } from './CardTestimonialEditor';
import { CardTestimonial } from '../blocks/CardTestimonial';
import { CardTestimonialConfig, createDefaultCardTestimonialConfig } from '../../types/Cards';
import { Modal } from './Modal';
import { AdminHeader } from './AdminHeader';

export const CardTestimonialEditorPage: React.FC = () => {
  const { pageId, blockId } = useParams<{ pageId: string; blockId: string }>();
  const navigate = useNavigate();
  const { website, updatePages, loading: websiteLoading } = useWebsite();

  const [config, setConfig] = useState<CardTestimonialConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const pages = website?.pages || [];

  // Find the current page and block
  const { page, block } = useMemo(() => {
    if (!pages || !pageId) return { page: null, block: null };
    const foundPage = pages.find(p => p.id === pageId);
    if (!foundPage) return { page: null, block: null };
    const foundBlock = foundPage.blocks?.find(b => b.id === blockId);
    return { page: foundPage, block: foundBlock };
  }, [pages, pageId, blockId]);

  // Initialize config from block or default
  useEffect(() => {
    if (block) {
      setConfig(block.config && Object.keys(block.config).length > 0 
        ? block.config as CardTestimonialConfig 
        : createDefaultCardTestimonialConfig());
    }
  }, [block]);

  const showMessage = (msg: string, _isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    if (!config || !page || !pages || !blockId) return;

    setIsSaving(true);
    try {
      const updatedPages = pages.map(p => {
        if (p.id === pageId) {
          return {
            ...p,
            blocks: (p.blocks || []).map(b => 
              b.id === blockId 
                ? { ...b, config } 
                : b
            )
          };
        }
        return p;
      });

      await updatePages(updatedPages);
      showMessage('Änderungen gespeichert!');
    } catch (error) {
      console.error('Error saving:', error);
      showMessage('Fehler beim Speichern!');
    } finally {
      setIsSaving(false);
    }
  };

  if (websiteLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  if (!page || !block) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text-secondary)' }}>Block nicht gefunden</h2>
          <button
            onClick={() => navigate('/admin/pages')}
            className="hover:underline"
            style={{ color: 'var(--admin-accent-text)' }}
          >
            Zurück zu Seiten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Bewertungs-Karten bearbeiten"
        subtitle={`Seite: ${page.title}`}
        icon={Star}
        backTo={`/admin/blocks/${pageId}`}
        backLabel="Zurück zu Bausteinen"
        actions={
          <>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text-secondary)' }}
            >
              <Eye className="w-4 h-4" />
              Vorschau
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--admin-accent)' }}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Speichern
            </button>
          </>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Card */}
        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow)' }}>

          {/* Message */}
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

          {/* Editor */}
          <CardTestimonialEditor config={config} onChange={setConfig} />
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Vorschau: Bewertungs-Karten"
        >
          <div className="rounded-lg overflow-auto" style={{ maxHeight: '70vh', backgroundColor: 'var(--admin-bg-input)' }}>
            <CardTestimonial config={config} />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CardTestimonialEditorPage;
