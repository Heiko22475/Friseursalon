import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GridLayout } from './admin/GridLayoutSelector';

// Import all block components
import Services from './Services';
import Gallery from './Gallery';
import Reviews from './Reviews';
import Pricing from './Pricing';
import Contact from './Contact';
import StaticContent from './StaticContent';

interface GridProps {
  instanceId: number;
}

interface GridConfig {
  layout_type: GridLayout;
  gap: number;
  padding_top: number;
  padding_bottom: number;
  margin_left: number;
  margin_right: number;
}

interface GridBlock {
  child_block_type: string;
  child_block_instance_id: number;
  grid_position: number;
  is_enabled: boolean;
  display_order: number;
}

export const Grid: React.FC<GridProps> = ({ instanceId }) => {
  const [config, setConfig] = useState<GridConfig | null>(null);
  const [blocks, setBlocks] = useState<GridBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGridData();
  }, [instanceId]);

  const loadGridData = async () => {
    try {
      // Load grid config
      const { data: configData, error: configError } = await supabase
        .from('grid_config')
        .select('*')
        .eq('grid_instance_id', instanceId)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Error loading grid config:', configError);
        setLoading(false);
        return;
      }

      setConfig(configData || {
        layout_type: '50-50',
        gap: 16,
        padding_top: 0,
        padding_bottom: 0,
        margin_left: 0,
        margin_right: 0,
      });

      // Load grid blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('grid_blocks')
        .select('*')
        .eq('grid_instance_id', instanceId)
        .eq('is_enabled', true)
        .order('display_order', { ascending: true });

      if (blocksError) {
        console.error('Error loading grid blocks:', blocksError);
        setLoading(false);
        return;
      }

      setBlocks(blocksData || []);
    } catch (error) {
      console.error('Error loading grid:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = (blockType: string, instanceId: number) => {
    const blockMap: Record<string, React.ComponentType<any>> = {
      'services': Services,
      'gallery': Gallery,
      'reviews': Reviews,
      'pricing': Pricing,
      'contact': Contact,
      'static-content': StaticContent,
    };

    const BlockComponent = blockMap[blockType];
    
    if (!BlockComponent) {
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
          Unbekannter Baustein-Typ: {blockType}
        </div>
      );
    }

    return <BlockComponent instanceId={instanceId} />;
  };

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

  const getColumnCount = (layout: GridLayout): number => {
    switch (layout) {
      case '33-33-33':
        return 3;
      case '25-25-25-25':
        return 4;
      default:
        return 2;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  // Limit blocks to the number of columns
  const columnCount = getColumnCount(config.layout_type);
  const visibleBlocks = blocks.slice(0, columnCount);

  if (visibleBlocks.length === 0) {
    return null; // Don't render empty grid
  }

  const gridId = `grid-${instanceId}`;

  return (
    <div
      style={{
        paddingTop: `${config.padding_top}px`,
        paddingBottom: `${config.padding_bottom}px`,
        marginLeft: `${config.margin_left}px`,
        marginRight: `${config.margin_right}px`,
      }}
    >
      <div
        className={gridId}
        style={{
          display: 'grid',
          gap: `${config.gap}px`,
          containerType: 'inline-size',
        }}
      >
        {visibleBlocks.map((block) => (
          <div 
            key={`${block.child_block_type}-${block.child_block_instance_id}`}
            style={{ minWidth: '280px', containerType: 'inline-size' }}
          >
            {renderBlock(block.child_block_type, block.child_block_instance_id)}
          </div>
        ))}
      </div>
      <style>{`
        .${gridId} {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .${gridId} {
            grid-template-columns: ${columnCount > 2 ? '1fr 1fr' : '1fr 1fr'};
          }
        }
        @media (min-width: 1024px) {
          .${gridId} {
            grid-template-columns: ${getGridTemplateColumns(config.layout_type)};
          }
        }
      `}</style>
    </div>
  );
};
