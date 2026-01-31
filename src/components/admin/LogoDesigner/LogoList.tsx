import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { useWebsite, LogoDesign } from '../../../contexts/WebsiteContext';
import { ConfirmDialog } from '../ConfirmDialog';

export const LogoList: React.FC = () => {
  const navigate = useNavigate();
  const { website, deleteLogo } = useWebsite();
  const logos = website?.logos || [];

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState<string | null>(null);

  const handleDelete = (logoId: string) => {
    setLogoToDelete(logoId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (logoToDelete) {
      await deleteLogo(logoToDelete);
      setLogoToDelete(null);
      setConfirmOpen(false);
    }
  };

  const handleEdit = (logoId: string) => {
    navigate(`/admin/logos/${logoId}`);
  };

  const handleCreate = () => {
    navigate('/admin/logos/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl font-bold text-gray-800">Logo-Designer</h1>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Neues Logo
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {logos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Noch keine Logos erstellt
            </h2>
            <p className="text-gray-500 mb-6">
              Erstellen Sie Ihr erstes Logo mit Bild und Text.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition"
            >
              <Plus className="w-5 h-5" />
              Logo erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {logos.map((logo) => (
              <LogoCard
                key={logo.id}
                logo={logo}
                onEdit={() => handleEdit(logo.id)}
                onDelete={() => handleDelete(logo.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Logo löschen"
        message="Möchten Sie dieses Logo wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setLogoToDelete(null);
        }}
      />
    </div>
  );
};

interface LogoCardProps {
  logo: LogoDesign;
  onEdit: () => void;
  onDelete: () => void;
}

const LogoCard: React.FC<LogoCardProps> = ({ logo, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition">
      {/* Thumbnail Preview */}
      <div 
        className="h-32 flex items-center justify-center p-4 relative"
        style={{ backgroundColor: logo.canvas.backgroundColor || '#f3f4f6' }}
      >
        {logo.thumbnail ? (
          <img 
            src={logo.thumbnail} 
            alt={logo.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <LogoPreview logo={logo} scale={0.5} />
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
          <button
            onClick={onEdit}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
            title="Bearbeiten"
          >
            <Edit2 className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white rounded-full hover:bg-red-50 transition"
            title="Löschen"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3 border-t">
        <h3 className="font-medium text-gray-800 truncate">{logo.name}</h3>
        <p className="text-xs text-gray-400">
          {logo.canvas.width} × {logo.canvas.height} px
        </p>
      </div>
    </div>
  );
};

// Simple inline preview for cards
interface LogoPreviewProps {
  logo: LogoDesign;
  scale?: number;
}

const LogoPreview: React.FC<LogoPreviewProps> = ({ logo, scale = 1 }) => {
  const width = logo.canvas.width * scale;
  const height = logo.canvas.height * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${logo.canvas.width} ${logo.canvas.height}`}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    >
      {/* Background */}
      <rect 
        width={logo.canvas.width} 
        height={logo.canvas.height} 
        fill={logo.canvas.backgroundColor || 'transparent'} 
      />
      
      {/* Image */}
      {logo.image && (
        <image
          href={logo.image.url}
          x={logo.image.x}
          y={logo.image.y}
          width={logo.image.width}
          height={logo.image.height}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      
      {/* Texts */}
      {logo.texts.map((text) => (
        <text
          key={text.id}
          x={text.x}
          y={text.y}
          fontFamily={text.fontFamily}
          fontSize={text.fontSize}
          fontWeight={text.fontWeight}
          fill={text.color}
          letterSpacing={text.letterSpacing}
          dominantBaseline="hanging"
        >
          {text.content}
        </text>
      ))}
    </svg>
  );
};

export default LogoList;
