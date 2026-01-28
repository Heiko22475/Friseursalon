import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Edit } from 'lucide-react';

export interface BlockItem {
  id: string;
  block_type: string;
  block_instance_id: number;
  is_enabled: boolean;
  display_order: number;
  block_name?: string;
}

interface BlockListProps {
  blocks: BlockItem[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleEnabled: (block: BlockItem) => void;
  onDelete: (id: string) => void;
  onEdit?: (blockType: string, instanceId: number) => void;
  getEditUrl?: (blockType: string, instanceId: number) => string | null;
  showInstanceBadge?: boolean;
  emptyMessage?: string;
}

export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
  onDelete,
  onEdit,
  getEditUrl,
  showInstanceBadge = true,
  emptyMessage = 'Noch keine Bausteine vorhanden.',
}) => {
  const navigate = useNavigate();

  const handleEdit = (block: BlockItem) => {
    if (onEdit) {
      onEdit(block.block_type, block.block_instance_id);
    } else if (getEditUrl) {
      const url = getEditUrl(block.block_type, block.block_instance_id);
      if (url) navigate(url);
    }
  };

  const hasEditFunction = onEdit || getEditUrl;

  if (blocks.length === 0) {
    return <p className="text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4">
      {blocks.map((block, index) => (
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
                {block.block_name || block.block_type}
              </h3>
              {showInstanceBadge && block.block_instance_id > 1 && (
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
              onClick={() => onMoveUp(index)}
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
              onClick={() => onMoveDown(index)}
              disabled={index === blocks.length - 1}
              className={`p-2 rounded-lg transition ${
                index === blocks.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Nach unten"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => onToggleEnabled(block)}
              className={`p-2 rounded-lg transition ${
                block.is_enabled
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-200'
              }`}
              title={block.is_enabled ? 'Deaktivieren' : 'Aktivieren'}
            >
              {block.is_enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            {hasEditFunction && (
              <button
                onClick={() => handleEdit(block)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Inhalt bearbeiten"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onDelete(block.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Löschen"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
