import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, Edit, Layers } from 'lucide-react';
import { Modal } from './Modal';
import { AdminHeader } from './AdminHeader';
import { Hero } from '../blocks/Hero';
import { GenericCard } from '../blocks/GenericCard';
import { CardTemplateSelectionDialog } from './CardTemplateSelectionDialog';
import type { CardTemplate } from './CardTemplateSelectionDialog';

interface PageBlock {
  id: string;
  type: string;
  position: number;
  config: Record<string, any>;
  content: Record<string, any>;
  created_at?: string;
}

// Available block types
const AVAILABLE_BLOCKS = [
  { block_type: 'hero', block_name: 'Hero-Banner', can_repeat: true },
  { block_type: 'navbar', block_name: 'Navigation', can_repeat: false },
  { block_type: 'generic-card', block_name: 'Flexible Karten', can_repeat: true },
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
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

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

      // For generic-card blocks, show template selection dialog
      if (selectedBlockType === 'generic-card') {
        setIsModalOpen(false);
        setShowTemplateDialog(true);
        return;
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

  const handleTemplateSelect = async (template: CardTemplate | null) => {
    if (!page || !pages) return;

    try {
      // Get next position
      const nextPosition = pageBlocks.length > 0
        ? Math.max(...pageBlocks.map(pb => pb.position)) + 1
        : 0;

      // Create new block with template data
      const newBlock: PageBlock = {
        id: crypto.randomUUID(),
        type: 'generic-card',
        position: nextPosition,
        config: template ? template.config : {},
        content: {},
        // Add template metadata if template was selected
        ...(template && {
          templateId: template.id,
          templateName: template.name,
          templateCategory: template.category,
          customized: false,
        }),
        // Mark as customized if no template (started from scratch)
        ...(!template && {
          customized: true,
        }),
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

      showMessage(template 
        ? `Baustein mit Vorlage "${template.name}" erfolgreich hinzugefügt!`
        : 'Baustein erfolgreich hinzugefügt!'
      );
      setShowTemplateDialog(false);
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
        return <Hero config={block.config as any} instanceId={instanceId} />;
      case 'generic-card':
        return <GenericCard config={block.config as any} instanceId={instanceId} />;
      default:
        return <div className="p-8 text-center" style={{ color: 'var(--admin-text-muted)' }}>Keine Vorschau verfügbar</div>;
    }
  };

  const getBlockEditor = (block: PageBlock) => {
    // Hero blocks with pageId and blockId
    if (block.type === 'hero') {
      return `/admin/hero/${pageId}/${block.id}`;
    }
    
    if (block.type === 'generic-card') {
      return `/admin/generic-card/${pageId}/${block.id}`;
    }
    
    return null;
  };

  const getBlockName = (type: string) => {
    return AVAILABLE_BLOCKS.find(b => b.block_type === type)?.block_name || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>Seite nicht gefunden</h2>
          <button
            onClick={() => navigate('/admin/pages')}
            className="hover:underline"
            style={{ color: 'var(--admin-accent)' }}
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
        title="Bausteine"
        subtitle={`Seite: ${page.title} (/${page.slug})`}
        icon={Layers}
        backTo="/admin/pages"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-xl p-8 mb-6" style={{ backgroundColor: 'var(--admin-bg-card)' }}>

          {message && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: message.includes('Fehler') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                color: message.includes('Fehler') ? 'var(--admin-danger)' : '#16a34a',
              }}
            >
              {message}
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition mb-6"
            style={{ backgroundColor: 'var(--admin-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus className="w-5 h-5" />
            Baustein hinzufügen
          </button>

          {/* Blocks List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Aktive Bausteine</h2>
            {pageBlocks.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)' }}>Noch keine Bausteine hinzugefügt.</p>
            ) : (
              <div className="grid gap-4">
                {pageBlocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="flex items-start justify-between p-4 rounded-lg border-2"
                    style={{ backgroundColor: 'var(--admin-bg-surface)', borderColor: 'var(--admin-border)' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold" style={{ color: 'var(--admin-text-heading)' }}>
                          {getBlockName(block.type)}
                        </h3>
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--admin-text-secondary)' }}>Typ: {block.type} | Position: {block.position}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg transition"
                        style={{
                          color: index === 0 ? 'var(--admin-text-faint)' : 'var(--admin-text-secondary)',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                        }}
                        title="Nach oben"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === pageBlocks.length - 1}
                        className="p-2 rounded-lg transition"
                        style={{
                          color: index === pageBlocks.length - 1 ? 'var(--admin-text-faint)' : 'var(--admin-text-secondary)',
                          cursor: index === pageBlocks.length - 1 ? 'not-allowed' : 'pointer',
                        }}
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
                        className="p-2 rounded-lg transition"
                        style={{ color: 'var(--admin-danger)' }}
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                Baustein-Typ auswählen
              </label>
              <select
                value={selectedBlockType}
                onChange={(e) => setSelectedBlockType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
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
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition"
                style={{
                  backgroundColor: !selectedBlockType ? 'var(--admin-bg-surface)' : 'var(--admin-accent)',
                  color: !selectedBlockType ? 'var(--admin-text-muted)' : '#fff',
                  cursor: !selectedBlockType ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (selectedBlockType) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <Plus className="w-5 h-5" />
                Hinzufügen
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedBlockType('');
                }}
                className="px-6 py-2 rounded-lg font-semibold transition"
                style={{ backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text)' }}
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
            <div className="rounded-lg overflow-auto" style={{ maxHeight: '70vh', backgroundColor: 'var(--admin-bg-surface)' }}>
              {renderBlockPreview(previewBlock)}
            </div>
          </Modal>
        )}

        {/* Template Selection Dialog */}
        <CardTemplateSelectionDialog
          isOpen={showTemplateDialog}
          onClose={() => {
            setShowTemplateDialog(false);
            setSelectedBlockType('');
          }}
          onSelect={handleTemplateSelect}
        />
      </div>
    </div>
  );
};
