// =====================================================
// GENERIC CARD EDITOR
// Wiederverwendbarer Editor für alle Karten-Typen
// Mit Live-Preview und verbesserter MediaLibrary-Integration
// =====================================================

import React, { useState, ReactNode } from 'react';
import {
  ChevronDown, ChevronUp, Image as ImageIcon, X
} from 'lucide-react';
import { MediaLibrary, MediaFile } from './MediaLibrary';
import { IconPicker } from './IconPicker';
import { ColorValue } from '../../types/theme';

// ===== SECTION COMPONENT =====

interface EditorSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const EditorSection: React.FC<EditorSectionProps> = ({ 
  title, 
  icon, 
  defaultExpanded = false,
  children 
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 font-medium text-gray-700">
          {icon}
          {title}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      {expanded && <div className="p-4 space-y-4 border-t">{children}</div>}
    </div>
  );
};

// ===== COLOR PICKER =====

interface ColorPickerProps {
  label: string;
  value: ColorValue;
  onChange: (value: ColorValue) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const currentColor = value.kind === 'custom' ? value.hex : '#000000';

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onChange({ kind: 'custom', hex: e.target.value })}
          className="w-10 h-10 rounded border cursor-pointer"
        />
        <input
          type="text"
          value={currentColor}
          onChange={(e) => onChange({ kind: 'custom', hex: e.target.value })}
          className="flex-1 px-2 py-1 border rounded text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// ===== SELECT COMPONENT =====

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ===== TEXT INPUT =====

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  multiline = false,
  rows = 3
}) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
      />
    )}
  </div>
);

// ===== NUMBER INPUT =====

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  label, 
  value, 
  onChange, 
  min,
  max,
  step = 1,
  suffix
}) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
      />
      {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
    </div>
  </div>
);

// ===== TOGGLE =====

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, value, onChange, description }) => (
  <div className="flex items-center justify-between">
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        value ? 'bg-rose-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// ===== IMAGE PICKER =====

interface ImagePickerProps {
  label: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  aspectRatio?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ 
  label, 
  value, 
  onChange,
  aspectRatio = '16:9'
}) => {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const handleSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      onChange(files[0].file_url);
    }
    setShowMediaLibrary(false);
  };

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Ausgewähltes Bild"
            className="w-full h-32 object-cover rounded-lg border"
            style={{ aspectRatio }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
            <button
              type="button"
              onClick={() => setShowMediaLibrary(true)}
              className="px-3 py-1 bg-white text-gray-800 rounded text-sm font-medium hover:bg-gray-100"
            >
              Ändern
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowMediaLibrary(true)}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-rose-500 hover:bg-rose-50 transition"
        >
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-500">Bild auswählen</span>
        </button>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden">
            <MediaLibrary
              mode="select"
              singleSelect={true}
              onSelect={handleSelect}
              onCancel={() => setShowMediaLibrary(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ===== ICON PICKER FIELD =====

interface IconPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const IconPickerField: React.FC<IconPickerFieldProps> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <IconPicker value={value} onChange={onChange} />
  </div>
);

// ===== GENERIC CARD EDITOR LAYOUT =====

interface GenericCardEditorLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onSave: () => void;
  saving?: boolean;
  hasChanges?: boolean;
  editorContent: ReactNode;
  previewContent: ReactNode;
  headerActions?: ReactNode;
}

export const GenericCardEditorLayout: React.FC<GenericCardEditorLayoutProps> = ({
  title,
  subtitle,
  onBack,
  onSave,
  saving = false,
  hasChanges = false,
  editorContent,
  previewContent,
  headerActions
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronDown className="w-5 h-5 transform rotate-90" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {headerActions}
            <button
              onClick={onSave}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                hasChanges && !saving
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Editor and Preview */}
      <div className="pt-20 pb-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
            {/* Editor Panel - 60% */}
            <div className="w-3/5 space-y-4">
              {editorContent}
            </div>

            {/* Preview Panel - 40% */}
            <div className="w-2/5">
              <div className="sticky top-24 bg-white rounded-xl shadow-lg border overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">Live-Vorschau</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Aktualisiert automatisch
                  </span>
                </div>
                <div className="p-4 bg-gray-50 min-h-[400px] max-h-[calc(100vh-200px)] overflow-y-auto">
                  {previewContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMMON SELECT OPTIONS =====

export const BORDER_RADIUS_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'Keine' },
  { value: 'sm', label: 'Klein' },
  { value: 'md', label: 'Mittel' },
  { value: 'lg', label: 'Groß' },
  { value: 'xl', label: 'Sehr groß' },
  { value: '2xl', label: 'Extra groß' },
  { value: 'full', label: 'Vollständig rund' },
];

export const SHADOW_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'Kein Schatten' },
  { value: 'sm', label: 'Klein' },
  { value: 'md', label: 'Mittel' },
  { value: 'lg', label: 'Groß' },
  { value: 'xl', label: 'Sehr groß' },
  { value: '2xl', label: 'Extra groß' },
];

export const SPACING_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'Keine' },
  { value: 'xs', label: 'Extra klein' },
  { value: 'sm', label: 'Klein' },
  { value: 'md', label: 'Mittel' },
  { value: 'lg', label: 'Groß' },
  { value: 'xl', label: 'Sehr groß' },
  { value: '2xl', label: 'Extra groß' },
];

export const FONT_SIZE_OPTIONS: SelectOption[] = [
  { value: 'xs', label: 'Extra klein' },
  { value: 'sm', label: 'Klein' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Groß' },
  { value: 'xl', label: 'Sehr groß' },
  { value: '2xl', label: 'Extra groß' },
  { value: '3xl', label: 'XXL' },
];

export const FONT_WEIGHT_OPTIONS: SelectOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Mittel' },
  { value: 'semibold', label: 'Halbfett' },
  { value: 'bold', label: 'Fett' },
  { value: 'extrabold', label: 'Extra fett' },
  { value: 'black', label: 'Schwarz' },
];

export const HOVER_EFFECT_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'Kein Effekt' },
  { value: 'lift', label: 'Anheben' },
  { value: 'glow', label: 'Leuchten' },
  { value: 'scale', label: 'Vergrößern' },
  { value: 'border', label: 'Rahmen' },
];

export const IMAGE_ASPECT_OPTIONS: SelectOption[] = [
  { value: '1:1', label: 'Quadratisch (1:1)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:2', label: 'Foto (3:2)' },
  { value: '16:9', label: 'Breitbild (16:9)' },
  { value: '2:1', label: 'Ultra-Breit (2:1)' },
  { value: 'auto', label: 'Automatisch' },
];

export const IMAGE_FIT_OPTIONS: SelectOption[] = [
  { value: 'cover', label: 'Ausfüllen (cover)' },
  { value: 'contain', label: 'Einpassen (contain)' },
  { value: 'fill', label: 'Strecken (fill)' },
];

// ===== EXPORT ALL =====

export default {
  EditorSection,
  ColorPicker,
  Select,
  TextInput,
  NumberInput,
  Toggle,
  ImagePicker,
  IconPickerField,
  GenericCardEditorLayout,
  // Options
  BORDER_RADIUS_OPTIONS,
  SHADOW_OPTIONS,
  SPACING_OPTIONS,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  HOVER_EFFECT_OPTIONS,
  IMAGE_ASPECT_OPTIONS,
  IMAGE_FIT_OPTIONS,
};
