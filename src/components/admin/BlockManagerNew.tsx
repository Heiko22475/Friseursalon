import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Edit } from 'lucide-react';
import { Modal } from './Modal';
import Hero from '../Hero';
import Services from '../Services';
import About from '../About';
import Gallery from '../Gallery';
import Reviews from '../Reviews';
import Pricing from '../Pricing';
import Contact from '../Contact';
import StaticContent from '../StaticContent';
import { Grid } from '../Grid';

interface PageBlock {
  id: string;
  type: string;
  position: number;
  config?: any;
  content?: any;
  created_at?: string;
}

// Available block types
const AVAILABLE_BLOCKS = [
  { block_type: 'hero', block_name: 'Hero-Banner', can_repeat: false },
  { block_type: 'services', block_name: 'Leistungen', can_repeat: true },
  { block_type: 'about', block_name: 'Über uns', can_repeat: false },
  { block_type: 'gallery', block_name: 'Galerie', can_repeat: true },
  { block_type: 'reviews', block_name: 'Bewertungen', can_repeat: true },
  { block_type: 'pricing', block_name: 'Preise', can_repeat: true },
  { block_type: 'contact', block_name: 'Kontakt', can_repeat: false },
  { block_type: 'hours', block_name: 'Öffnungszeiten', can_repeat: false },
  { block_type: 'static-content', block_name: 'Statischer Inhalt', can_repeat: true },
  { block_type: 'grid', block_name: 'Raster/Grid', can_repeat: true },
];

export const BlockManagerNew: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { website, updatePages, loading } = useWebsite();
  
  const pages = website?.pages || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState('');
  const [message, setMessage] = useState('');
  const [previewBlock, setPreviewBlock] = useState<PageBlock | null>(null);

  // Find the current page
  const page = useMemo(() => {
    if (!pages || !pageId) return null;
    const foundPage = pages.find(p => p.id === pageId);
    console.log('Found page:', foundPage);
    console.log('Page blocks:', foundPage?.blocks);
    return foundPage;
  }, [pages, pageId]);

  // Get page blocks
  const pageBlocks = useMemo(() => {
    const blocks = page?.blocks || [];
    console.log('pageBlocks:', blocks);
    return blocks;
  }, [page]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddBlock = async () => {
    if (!selectedBlockType || !page || !pages) return;

    try {
      const blockType = AVAILABLE_BLOCKS.find(b => b.block_type === selectedBlockType);
      if (!blockType) return;

      // Check if block can repeat
      if (!blockType.can_repeat) {
        const exists = pageBlocks.some(pb => pb.type === selectedBlockType);
        if (exists) {
          showMessage('Dieser Baustein kann nicht mehrfach hinzugefügt werden!');
          return;
        }
      }

      // Get next position
      const nextPosition = pageBlocks.length > 0
        ? Math.max(...pageBlocks.map(pb => pb.position)) + 1
        : 0;

      // Create new block
      const newBlock: PageBlock = {
        id: crypto.randomUUID(),
        type: selectedBlockType,
        position: nextPosition,
        config: {},
        content: {},
      };

      // Update the page with the new block
      const updatedPages = pages.map(p => {
        if (p.id === pageId) {
          return {
            ...p,
            blocks: [...(p.blocks || []), newBlock],
          };
        }
        return p;
      });

      await updatePages(updatedPages);

      showMessage('Baustein erfolgreich hinzugefügt!');
      setIsModalOpen(false);
      setSelectedBlockType('');
    } catch (error: any) {
      console.error('Error adding block:', error);
      showMessage(error.message || 'Fehler beim Hinzufügen!');
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!confirm('Möchten Sie diesen Baustein wirklich löschen?') || !page || !pages) return;

    try {
      const updatedBlocks = pageBlocks.filter(b => b.id !== blockId);
      
      const updatedPages = pages.map(p => {
        if (p.id === pageId) {
          return { ...p, blocks: updatedBlocks };
        }
        return p;
      });

      await updatePages(updatedPages);
      showMessage('Baustein erfolgreich gelöscht!');
    } catch (error) {
      console.error('Error deleting:', error);
      showMessage('Fehler beim Löschen!');
    }
  };

  const moveBlock = async (index: number, direction: 'up' | 'down') => {
    if (!page || !pages) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pageBlocks.length) return;

    const newBlocks = [...pageBlocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    
    // Update position
    newBlocks.forEach((block, i) => {
      block.position = i;
    });

    const updatedPages = pages.map(p => {
      if (p.id === pageId) {
        return { ...p, blocks: newBlocks };
      }
      return p;
    });

    try {
      await updatePages(updatedPages);
    } catch (error) {
      console.error('Error moving:', error);
      showMessage('Fehler beim Verschieben!');
    }
  };



  const renderBlockPreview = (block: PageBlock) => {
    // Use block ID hash for instanceId to ensure uniqueness
    const instanceId = Math.abs(block.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
    
    switch (block.type) {
      case 'hero':
        return <Hero />;
      case 'services':
        return <Services instanceId={instanceId} />;
      case 'about':
        return <About />;
      case 'gallery':
        return <Gallery instanceId={instanceId} />;
      case 'reviews':
        return <Reviews instanceId={instanceId} />;
      case 'pricing':
        return <Pricing instanceId={instanceId} />;
      case 'hours':
      case 'contact':
        return <Contact />;
      case 'static-content':
        return <StaticContent instanceId={instanceId} />;
      case 'grid':
        return <Grid instanceId={instanceId} />;
      default:
        return <div className="p-8 text-center text-gray-500">Keine Vorschau verfügbar</div>;
    }
  };

  const getBlockEditor = (block: PageBlock) => {
    const editorMap: { [key: string]: string } = {
      hero: 'general',
      services: 'services',
      about: 'about',
      gallery: 'gallery',
      reviews: 'reviews',
      pricing: 'pricing',
      hours: 'hours',
      contact: 'contact',
      'static-content': 'static-content',
      'grid': 'grid',
    };

    const editorPath = editorMap[block.type];
    if (editorPath) {
      return `/admin/${editorPath}`;
    }
    return null;
  };

  const getBlockName = (type: string) => {
    return AVAILABLE_BLOCKS.find(b => b.block_type === type)?.block_name || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Seite nicht gefunden</h2>
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin/pages')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zu Seiten
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bausteine</h1>
          <p className="text-gray-600 mb-6">
            Seite: <span className="font-semibold">{page.title}</span> (/{page.slug})
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition mb-6"
          >
            <Plus className="w-5 h-5" />
            Baustein hinzufügen
          </button>

          {/* Blocks List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Aktive Bausteine</h2>
            {pageBlocks.length === 0 ? (
              <p className="text-gray-500">Noch keine Bausteine hinzugefügt.</p>
            ) : (
              <div className="grid gap-4">
                {pageBlocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="flex items-start justify-between p-4 rounded-lg border-2 bg-gray-50 border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {getBlockName(block.type)}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Typ: {block.type} | Position: {block.position}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition ${
                          index === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Nach oben"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === pageBlocks.length - 1}
                        className={`p-2 rounded-lg transition ${
                          index === pageBlocks.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Nach unten"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setPreviewBlock(block)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Vorschau"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {getBlockEditor(block) && (
                        <button
                          onClick={() => navigate(getBlockEditor(block)!)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Inhalt bearbeiten"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Löschen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Block Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBlockType('');
          }}
          title="Baustein hinzufügen"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baustein-Typ auswählen
              </label>
              <select
                value={selectedBlockType}
                onChange={(e) => setSelectedBlockType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">-- Bitte wählen --</option>
                {AVAILABLE_BLOCKS.map((block) => {
                  const alreadyUsed = pageBlocks.some(pb => pb.type === block.block_type);
                  const canAdd = block.can_repeat || !alreadyUsed;
                  return (
                    <option key={block.block_type} value={block.block_type} disabled={!canAdd}>
                      {block.block_name} {!canAdd ? '(bereits verwendet)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedBlockType && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {AVAILABLE_BLOCKS.find(b => b.block_type === selectedBlockType)?.can_repeat
                    ? 'Dieser Baustein kann mehrfach hinzugefügt werden. Jede Instanz hat ihre eigenen, unabhängigen Daten.'
                    : 'Dieser Baustein kann nur einmal pro Seite verwendet werden.'}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleAddBlock}
                disabled={!selectedBlockType}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
                  !selectedBlockType
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                <Plus className="w-5 h-5" />
                Hinzufügen
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedBlockType('');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </Modal>

        {/* Preview Modal */}
        {previewBlock && (
          <Modal
            isOpen={!!previewBlock}
            onClose={() => setPreviewBlock(null)}
            title={`Vorschau: ${getBlockName(previewBlock.type)}`}
          >
            <div className="bg-gray-50 rounded-lg overflow-auto" style={{ maxHeight: '70vh' }}>
              {renderBlockPreview(previewBlock)}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
