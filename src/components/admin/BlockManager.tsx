import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Modal } from './Modal';

interface BuildingBlock {
  block_type: string;
  block_name: string;
  can_repeat: boolean;
  is_available: boolean;
}

interface PageBlock {
  id: string;
  page_id: string;
  block_type: string;
  block_instance_id: number;
  is_enabled: boolean;
  display_order: number;
  config: any;
  building_block?: BuildingBlock;
}

interface Page {
  id: string;
  title: string;
  slug: string;
}

export const BlockManager: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<BuildingBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (pageId) {
      loadData();
    }
  }, [pageId]);

  const loadData = async () => {
    try {
      // Load page info
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;
      setPage(pageData);

      // Load available building blocks first
      const { data: availData, error: availError } = await supabase
        .from('building_blocks')
        .select('*')
        .eq('is_available', true)
        .order('block_name');

      if (availError) throw availError;
      console.log('Available blocks loaded:', availData);
      setAvailableBlocks(availData || []);

      // Load page blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', pageId)
        .order('display_order', { ascending: true });

      if (blocksError) throw blocksError;

      // Manually join the building block data
      const blocksWithDetails = blocksData?.map((block) => ({
        ...block,
        building_block: availData?.find((bb) => bb.block_type === block.block_type),
      })) || [];

      setPageBlocks(blocksWithDetails);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async () => {
    if (!selectedBlockType) return;

    try {
      // Check if block can repeat
      const blockType = availableBlocks.find((b) => b.block_type === selectedBlockType);
      if (!blockType) return;

      if (!blockType.can_repeat) {
        // Check if block already exists on this page
        const exists = pageBlocks.some((pb) => pb.block_type === selectedBlockType);
        if (exists) {
          setMessage('Dieser Baustein kann nicht mehrfach hinzugefügt werden!');
          return;
        }
      }

      // Get next instance_id for this block type GLOBALLY (across all pages)
      const { data: allBlocks } = await supabase
        .from('page_blocks')
        .select('block_instance_id')
        .eq('block_type', selectedBlockType)
        .order('block_instance_id', { ascending: false })
        .limit(1);

      const nextInstanceId = allBlocks && allBlocks.length > 0
        ? allBlocks[0].block_instance_id + 1
        : 1;

      // Get next display_order
      const nextOrder = pageBlocks.length > 0
        ? Math.max(...pageBlocks.map((pb) => pb.display_order)) + 1
        : 0;

      const { error } = await supabase.from('page_blocks').insert([
        {
          page_id: pageId,
          block_type: selectedBlockType,
          block_instance_id: nextInstanceId,
          is_enabled: true,
          display_order: nextOrder,
          config: {},
        },
      ]);

      if (error) throw error;

      setMessage('Baustein erfolgreich hinzugefügt!');
      setTimeout(() => setMessage(''), 3000);
      setIsModalOpen(false);
      setSelectedBlockType('');
      loadData();
    } catch (error: any) {
      console.error('Error adding block:', error);
      setMessage(error.message || 'Fehler beim Hinzufügen!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Baustein wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('page_blocks').delete().eq('id', id);
      if (error) throw error;

      setMessage('Baustein erfolgreich gelöscht!');
      setTimeout(() => setMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage('Fehler beim Löschen!');
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const newBlocks = [...pageBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];

    try {
      await Promise.all([
        supabase
          .from('page_blocks')
          .update({ display_order: index - 1 })
          .eq('id', newBlocks[index - 1].id),
        supabase
          .from('page_blocks')
          .update({ display_order: index })
          .eq('id', newBlocks[index].id),
      ]);

      loadData();
    } catch (error) {
      console.error('Error moving:', error);
      setMessage('Fehler beim Verschieben!');
    }
  };

  const moveDown = async (index: number) => {
    if (index === pageBlocks.length - 1) return;

    const newBlocks = [...pageBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];

    try {
      await Promise.all([
        supabase
          .from('page_blocks')
          .update({ display_order: index })
          .eq('id', newBlocks[index].id),
        supabase
          .from('page_blocks')
          .update({ display_order: index + 1 })
          .eq('id', newBlocks[index + 1].id),
      ]);

      loadData();
    } catch (error) {
      console.error('Error moving:', error);
      setMessage('Fehler beim Verschieben!');
    }
  };

  const toggleEnabled = async (block: PageBlock) => {
    try {
      const { error } = await supabase
        .from('page_blocks')
        .update({ is_enabled: !block.is_enabled })
        .eq('id', block.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling:', error);
    }
  };

  const getBlockEditor = (blockType: string, instanceId: number) => {
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
    };

    const editorPath = editorMap[blockType];
    if (editorPath) {
      return `/admin/${editorPath}?instance=${instanceId}`;
    }
    return null;
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
          {page && (
            <p className="text-gray-600 mb-6">
              Seite: <span className="font-semibold">{page.title}</span> (/{page.slug})
            </p>
          )}

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
                    className={`flex items-start justify-between p-4 rounded-lg border-2 ${
                      block.is_enabled
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-gray-100 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {block.building_block?.block_name || block.block_type}
                        </h3>
                        {block.block_instance_id > 1 && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                            Instanz #{block.block_instance_id}
                          </span>
                        )}
                        {!block.is_enabled && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                            Deaktiviert
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Typ: {block.block_type}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition ${
                          index === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Nach oben"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === pageBlocks.length - 1}
                        className={`p-2 rounded-lg transition ${
                          index === pageBlocks.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Nach unten"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleEnabled(block)}
                        className={`p-2 rounded-lg transition ${
                          block.is_enabled
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-200'
                        }`}
                        title={block.is_enabled ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        {block.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      {getBlockEditor(block.block_type, block.block_instance_id) && (
                        <button
                          onClick={() =>
                            navigate(getBlockEditor(block.block_type, block.block_instance_id)!)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Inhalt bearbeiten"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
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
                {availableBlocks.map((block) => {
                  const alreadyUsed = pageBlocks.some((pb) => pb.block_type === block.block_type);
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
                  {availableBlocks.find((b) => b.block_type === selectedBlockType)?.can_repeat
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
                <Plus className="w-4 h-4" />
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
      </div>
    </div>
  );
};
