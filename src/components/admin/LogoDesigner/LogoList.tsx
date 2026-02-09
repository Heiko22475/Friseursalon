import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { useWebsite, LogoDesign } from '../../../contexts/WebsiteContext';
import { ConfirmDialog } from '../ConfirmDialog';
import { AdminHeader } from '../AdminHeader';

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
    <div className="min-h-screen">
      <AdminHeader
        title="Logo-Designer"
        icon={Sparkles}
        actions={
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition"
            style={{ backgroundColor: 'var(--admin-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus className="w-4 h-4" />
            Neues Logo
          </button>
        }
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {logos.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--admin-text-faint)' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--admin-text)' }}>
              Noch keine Logos erstellt
            </h2>
            <p className="mb-6" style={{ color: 'var(--admin-text-muted)' }}>
              Erstellen Sie Ihr erstes Logo mit Bild und Text.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg transition"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
    <div className="rounded-xl overflow-hidden group transition" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
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
            className="p-2 rounded-full transition"
            style={{ backgroundColor: 'var(--admin-bg-card)' }}
            title="Bearbeiten"
          >
            <Edit2 className="w-5 h-5" style={{ color: 'var(--admin-text)' }} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-full transition"
            style={{ backgroundColor: 'var(--admin-bg-card)' }}
            title="Löschen"
          >
            <Trash2 className="w-5 h-5" style={{ color: 'var(--admin-danger)' }} />
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3" style={{ borderTop: '1px solid var(--admin-border)' }}>
        <h3 className="font-medium truncate" style={{ color: 'var(--admin-text)' }}>{logo.name}</h3>
        <p className="text-xs" style={{ color: 'var(--admin-text-faint)' }}>
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
