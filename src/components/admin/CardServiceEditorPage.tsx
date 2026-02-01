// =====================================================
// CARD SERVICE EDITOR PAGE
// Wrapper-Seite für CardServiceEditor mit Navigation
// =====================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { CardServiceEditor } from './CardServiceEditor';
import { CardService } from '../blocks/CardService';
import { CardServiceConfig, createDefaultCardServiceConfig } from '../../types/Cards';
import { Modal } from './Modal';

export const CardServiceEditorPage: React.FC = () => {
  const { pageId, blockId } = useParams<{ pageId: string; blockId: string }>();
  const navigate = useNavigate();
  const { website, updatePages, loading: websiteLoading } = useWebsite();

  const [config, setConfig] = useState<CardServiceConfig | null>(null);
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
        ? block.config as CardServiceConfig 
        : createDefaultCardServiceConfig());
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!page || !block) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Block nicht gefunden</h2>
          <button
            onClick={() => navigate('/admin/pages')}
            className="text-rose-500 hover:underline"
          >
            Zurück zu Seiten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate(`/admin/blocks/${pageId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zu Bausteinen
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <Eye className="w-4 h-4" />
              Vorschau
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Speichern
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service-Karten bearbeiten</h1>
          <p className="text-gray-600 mb-6">
            Seite: <span className="font-semibold">{page.title}</span>
          </p>

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
          <CardServiceEditor config={config} onChange={setConfig} />
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Vorschau: Service-Karten"
        >
          <div className="bg-gray-50 rounded-lg overflow-auto" style={{ maxHeight: '70vh' }}>
            <CardService config={config} />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CardServiceEditorPage;
