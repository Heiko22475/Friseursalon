import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Eye } from 'lucide-react';
import { GridLayoutSelector, GridLayout, getColumnCount } from './GridLayoutSelector';
import { BlockList, BlockItem } from './BlockList';
import { Modal } from './Modal';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';
import Services from '../Services';
import Gallery from '../Gallery';
import Reviews from '../Reviews';
import Pricing from '../Pricing';
import Contact from '../Contact';
import StaticContent from '../StaticContent';

interface GridConfig {
  id?: string;
  grid_instance_id: number;
  layout_type: GridLayout;
  gap: number;
  padding_top: number;
  padding_bottom: number;
  margin_left: number;
  margin_right: number;
}

interface GridBlock {
  id: string;
  grid_instance_id: number;
  child_block_type: string;
  child_block_instance_id: number;
  grid_position: number;
  is_enabled: boolean;
  display_order: number;
  building_block?: {
    block_name: string;
  };
}

interface BuildingBlock {
  block_type: string;
  block_name: string;
  is_available: boolean;
}

export const GridEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instanceId = parseInt(searchParams.get('instance') || '1');

  const [config, setConfig] = useState<GridConfig>({
    grid_instance_id: instanceId,
    layout_type: '50-50',
    gap: 16,
    padding_top: 0,
    padding_bottom: 0,
    margin_left: 0,
    margin_right: 0,
  });

  const [gridBlocks, setGridBlocks] = useState<GridBlock[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<BuildingBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ blockType: 'grid', instanceId });

  useEffect(() => {
    loadData();
  }, [instanceId]);

  const loadData = async () => {
    try {
      // Load grid config
      const { data: configData, error: configError } = await supabase
        .from('grid_config')
        .select('*')
        .eq('grid_instance_id', instanceId)
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;
      if (configData) setConfig(configData);

      // Load available building blocks (exclude grid itself to prevent nesting)
      const { data: availData, error: availError } = await supabase
        .from('building_blocks')
        .select('*')
        .eq('is_available', true)
        .neq('block_type', 'grid')
        .order('block_name');

      if (availError) throw availError;
      setAvailableBlocks(availData || []);

      // Load grid blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('grid_blocks')
        .select('*')
        .eq('grid_instance_id', instanceId)
        .order('display_order', { ascending: true });

      if (blocksError) throw blocksError;

      // Join with building_blocks for names
      const blocksWithDetails = (blocksData || []).map((block) => ({
        ...block,
        building_block: availData?.find((bb) => bb.block_type === block.child_block_type),
      }));

      setGridBlocks(blocksWithDetails);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Fehler beim Laden der Daten!');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (config.id) {
        // Update existing config
        const { error } = await supabase
          .from('grid_config')
          .update({
            layout_type: config.layout_type,
            gap: config.gap,
            padding_top: config.padding_top,
            padding_bottom: config.padding_bottom,
            margin_left: config.margin_left,
            margin_right: config.margin_right,
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('grid_config')
          .insert([config])
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      setMessage('Grid-Konfiguration gespeichert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving:', error);
      setMessage(error.message || 'Fehler beim Speichern!');
    }
  };

  const handleAddBlock = async () => {
    if (!selectedBlockType) return;

    try {
      // Get next instance_id for this block type GLOBALLY
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
      const nextOrder = gridBlocks.length > 0
        ? Math.max(...gridBlocks.map((gb) => gb.display_order)) + 1
        : 0;

      const { error } = await supabase.from('grid_blocks').insert([
        {
          grid_instance_id: instanceId,
          child_block_type: selectedBlockType,
          child_block_instance_id: nextInstanceId,
          grid_position: 0,
          is_enabled: true,
          display_order: nextOrder,
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
    if (!confirm('Möchten Sie diesen Baustein wirklich aus dem Grid entfernen?')) return;

    try {
      const { error } = await supabase.from('grid_blocks').delete().eq('id', id);
      if (error) throw error;

      setMessage('Baustein entfernt!');
      setTimeout(() => setMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage('Fehler beim Entfernen!');
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const newBlocks = [...gridBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];

    try {
      await Promise.all([
        supabase
          .from('grid_blocks')
          .update({ display_order: index - 1 })
          .eq('id', newBlocks[index - 1].id),
        supabase
          .from('grid_blocks')
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
    if (index === gridBlocks.length - 1) return;

    const newBlocks = [...gridBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];

    try {
      await Promise.all([
        supabase
          .from('grid_blocks')
          .update({ display_order: index })
          .eq('id', newBlocks[index].id),
        supabase
          .from('grid_blocks')
          .update({ display_order: index + 1 })
          .eq('id', newBlocks[index + 1].id),
      ]);

      loadData();
    } catch (error) {
      console.error('Error moving:', error);
      setMessage('Fehler beim Verschieben!');
    }
  };

  const toggleEnabled = async (block: BlockItem) => {
    try {
      const { error } = await supabase
        .from('grid_blocks')
        .update({ is_enabled: !block.is_enabled })
        .eq('id', block.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling:', error);
      setMessage('Fehler beim Umschalten!');
    }
  };

  const getBlockEditor = (blockType: string, instanceId: number): string | null => {
    const editorMap: Record<string, string> = {
      'services': `/admin/services?instance=${instanceId}`,
      'gallery': `/admin/gallery?instance=${instanceId}`,
      'reviews': `/admin/reviews?instance=${instanceId}`,
      'pricing': `/admin/pricing?instance=${instanceId}`,
      'contact': `/admin/contact?instance=${instanceId}`,
      'static-content': `/admin/static-content?instance=${instanceId}`,
    };
    return editorMap[blockType] || null;
  };

  // Convert GridBlocks to BlockItems for BlockList
  const blockItems: BlockItem[] = gridBlocks.map((gb) => ({
    id: gb.id,
    block_type: gb.child_block_type,
    block_instance_id: gb.child_block_instance_id,
    is_enabled: gb.is_enabled,
    display_order: gb.display_order,
    block_name: gb.building_block?.block_name,
  }));

  // Calculate which blocks are visible in grid
  const columnCount = getColumnCount(config.layout_type);
  const visibleBlocks = blockItems.filter((b) => b.is_enabled).slice(0, columnCount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Grid Layout Editor</h1>
            <p className="text-gray-600 mt-1">Instanz #{instanceId}</p>
          </div>
          <BackgroundColorPicker
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            <Eye className="w-5 h-5" />
            Vorschau
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            <Save className="w-5 h-5" />
            Speichern
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes('Fehler')
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* Layout Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Layout-Konfiguration</h2>
          
          <div className="space-y-6">
            {/* Layout Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spalten-Layout
              </label>
              <GridLayoutSelector
                value={config.layout_type}
                onChange={(layout) => setConfig({ ...config, layout_type: layout })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Es werden nur die ersten {columnCount} aktivierten Bausteine angezeigt
              </p>
            </div>

            {/* Gap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abstand zwischen Spalten (Gap): {config.gap}px
              </label>
              <input
                type="range"
                min="0"
                max="64"
                step="4"
                value={config.gap}
                onChange={(e) => setConfig({ ...config, gap: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Padding Top/Bottom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Innenabstand Oben: {config.padding_top}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="8"
                  value={config.padding_top}
                  onChange={(e) => setConfig({ ...config, padding_top: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Innenabstand Unten: {config.padding_bottom}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="8"
                  value={config.padding_bottom}
                  onChange={(e) => setConfig({ ...config, padding_bottom: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Margin Left/Right */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Außenabstand Links: {config.margin_left}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="8"
                  value={config.margin_left}
                  onChange={(e) => setConfig({ ...config, margin_left: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Außenabstand Rechts: {config.margin_right}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="8"
                  value={config.margin_right}
                  onChange={(e) => setConfig({ ...config, margin_right: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Blocks Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bausteine im Grid</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-600 transition"
            >
              <Plus className="w-5 h-5" />
              Baustein hinzufügen
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Sichtbar im Grid:</strong> {visibleBlocks.length} / {columnCount} Spalten
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Fügen Sie beliebig viele Bausteine hinzu. Die ersten {columnCount} aktivierten Bausteine werden im Grid angezeigt.
            </p>
          </div>

          <BlockList
            blocks={blockItems}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onToggleEnabled={toggleEnabled}
            onDelete={handleDelete}
            getEditUrl={getBlockEditor}
            emptyMessage="Noch keine Bausteine im Grid. Fügen Sie Bausteine hinzu!"
          />
        </div>

        {/* Add Block Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBlockType('');
          }}
          title="Baustein zum Grid hinzufügen"
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
                {availableBlocks.map((block) => (
                  <option key={block.block_type} value={block.block_type}>
                    {block.block_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Der Baustein wird mit einer neuen Instanz-ID erstellt und kann später auch außerhalb des Grids verwendet werden.
              </p>
            </div>

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

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Grid Vorschau - Responsive"
          maxWidth="max-w-[1400px]"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 font-semibold mb-2">📱 Responsive Verhalten:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Mobile (&lt; 768px):</strong> 1 Spalte (alle Bausteine untereinander)</li>
              <li>• <strong>Tablet (768px - 1023px):</strong> {columnCount > 2 ? '2 Spalten (50:50)' : '2 Spalten (50:50 für bessere Lesbarkeit)'}</li>
              <li>• <strong>Desktop (&gt; 1024px):</strong> Volles {columnCount}-Spalten Layout ({config.layout_type})</li>
            </ul>
          </div>
          <div
            style={{
              maxWidth: '1300px',
              width: '100%',
              margin: '0 auto',
              paddingTop: `${config.padding_top}px`,
              paddingBottom: `${config.padding_bottom}px`,
              paddingLeft: `${config.margin_left}px`,
              paddingRight: `${config.margin_right}px`,
              backgroundColor: backgroundColor || undefined,
            }}
          >
            <div
              className="grid-preview-container"
              style={{
                display: 'grid',
                gap: `${config.gap}px`,
              }}
            >
              {visibleBlocks.map((block) => (
                <div key={block.id} style={{ minWidth: '280px', containerType: 'inline-size' }}>
                  {renderBlockPreview(block.block_type, block.block_instance_id)}
                </div>
              ))}
            </div>
            <style>{`
              .grid-preview-container {
                grid-template-columns: 1fr;
              }
              @media (min-width: 768px) and (max-width: 1023px) {
                .grid-preview-container {
                  grid-template-columns: ${columnCount > 2 ? '1fr 1fr' : '1fr 1fr'};
                }
              }
              @media (min-width: 1024px) {
                .grid-preview-container {
                  grid-template-columns: ${getGridTemplateColumns(config.layout_type)};
                }
              }
            `}</style>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Render actual block preview
const renderBlockPreview = (blockType: string, instanceId: number) => {
  switch (blockType) {
    case 'services':
      return <Services instanceId={instanceId} />;
    case 'gallery':
      return <Gallery instanceId={instanceId} />;
    case 'reviews':
      return <Reviews instanceId={instanceId} />;
    case 'pricing':
      return <Pricing instanceId={instanceId} />;
    case 'contact':
      return <Contact />;
    case 'static-content':
      return <StaticContent instanceId={instanceId} />;
    default:
      return (
        <div className="p-8 bg-gray-100 rounded-lg text-center text-gray-500">
          Baustein-Typ: {blockType}
        </div>
      );
  }
};

// Helper function to get CSS grid-template-columns
const getGridTemplateColumns = (layout: GridLayout): string => {
  switch (layout) {
    case '50-50':
      return '1fr 1fr';
    case '60-40':
      return '3fr 2fr';
    case '40-60':
      return '2fr 3fr';
    case '70-30':
      return '7fr 3fr';
    case '30-70':
      return '3fr 7fr';
    case '25-75':
      return '1fr 3fr';
    case '75-25':
      return '3fr 1fr';
    case '66-33':
      return '2fr 1fr';
    case '33-66':
      return '1fr 2fr';
    case '33-33-33':
      return '1fr 1fr 1fr';
    case '25-25-25-25':
      return '1fr 1fr 1fr 1fr';
    default:
      return '1fr 1fr';
  }
};
