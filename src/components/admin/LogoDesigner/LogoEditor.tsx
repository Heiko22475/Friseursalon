import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, Image, Type, Trash2, Move, Palette
} from 'lucide-react';
import { useWebsite, LogoDesign, LogoText } from '../../../contexts/WebsiteContext';
import { MediaLibrary, MediaFile } from '../MediaLibrary';

// Available fonts for the logo designer
const AVAILABLE_FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Dancing Script', value: 'Dancing Script, cursive' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
];

const FONT_WEIGHTS = [
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
];

type DragTarget = 'image' | 'text' | null;
type ResizeTarget = 'image' | 'canvas' | 'text' | null;
type ResizeHandle = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 'n' | 's' | null;

export const LogoEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';
  const { website, addLogo, updateLogo } = useWebsite();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Logo state
  const [logoName, setLogoName] = useState('Neues Logo');
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(150);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  const [logoImage, setLogoImage] = useState<LogoDesign['image']>(undefined);
  const [texts, setTexts] = useState<LogoText[]>([]);
  const [selectedElement, setSelectedElement] = useState<{ type: 'image' | 'text'; id?: string } | null>(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragTextId, setDragTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeTarget, setResizeTarget] = useState<ResizeTarget>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elemX: 0, elemY: 0, fontSize: 0 });
  const [resizeTextId, setResizeTextId] = useState<string | null>(null);

  // Load existing logo
  useEffect(() => {
    if (!isNew && id && website?.logos) {
      const existingLogo = website.logos.find(l => l.id === id);
      if (existingLogo) {
        setLogoName(existingLogo.name);
        setCanvasWidth(existingLogo.canvas.width);
        setCanvasHeight(existingLogo.canvas.height);
        setBackgroundColor(existingLogo.canvas.backgroundColor);
        setLogoImage(existingLogo.image);
        setTexts(existingLogo.texts);
      }
    }
  }, [id, isNew, website?.logos]);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle image selection from MediaLibrary
  const handleImageSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      const url = files[0].file_url;
      setLogoImage({
        url,
        x: 20,
        y: canvasHeight / 2 - 40,
        width: 80,
        height: 80
      });
      setShowMediaLibrary(false);
      setSelectedElement({ type: 'image' });
    }
  };

  // Add text element
  const handleAddText = () => {
    const newText: LogoText = {
      id: generateId(),
      content: 'Text',
      x: 120,
      y: 40 + texts.length * 40,
      fontFamily: 'Inter, sans-serif',
      fontSize: 28,
      fontWeight: '600',
      color: '#1f2937',
      letterSpacing: 0
    };
    setTexts([...texts, newText]);
    setSelectedElement({ type: 'text', id: newText.id });
  };

  // Update text
  const updateText = (textId: string, updates: Partial<LogoText>) => {
    setTexts(texts.map(t => t.id === textId ? { ...t, ...updates } : t));
  };

  // Delete text
  const deleteText = (textId: string) => {
    setTexts(texts.filter(t => t.id !== textId));
    if (selectedElement?.type === 'text' && selectedElement.id === textId) {
      setSelectedElement(null);
    }
  };

  // Delete image
  const deleteImage = () => {
    setLogoImage(undefined);
    if (selectedElement?.type === 'image') {
      setSelectedElement(null);
    }
  };

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent, target: DragTarget, textId?: string) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasWidth / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    
    setIsDragging(true);
    setDragTarget(target);
    setDragTextId(textId || null);
    
    if (target === 'image' && logoImage) {
      setDragOffset({ x: x - logoImage.x, y: y - logoImage.y });
      setSelectedElement({ type: 'image' });
    } else if (target === 'text' && textId) {
      const text = texts.find(t => t.id === textId);
      if (text) {
        setDragOffset({ x: x - text.x, y: y - text.y });
        setSelectedElement({ type: 'text', id: textId });
      }
    }
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasWidth / rect.width;
    const x = Math.max(0, Math.min(canvasWidth, (e.clientX - rect.left) * scale));
    const y = Math.max(0, Math.min(canvasHeight, (e.clientY - rect.top) * scale));
    
    if (dragTarget === 'image' && logoImage) {
      setLogoImage({
        ...logoImage,
        x: Math.round(x - dragOffset.x),
        y: Math.round(y - dragOffset.y)
      });
    } else if (dragTarget === 'text' && dragTextId) {
      setTexts(texts.map(t => 
        t.id === dragTextId 
          ? { ...t, x: Math.round(x - dragOffset.x), y: Math.round(y - dragOffset.y) }
          : t
      ));
    }
  }, [isDragging, dragTarget, dragTextId, dragOffset, logoImage, texts, canvasWidth, canvasHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragTarget(null);
    setDragTextId(null);
    setIsResizing(false);
    setResizeTarget(null);
    setResizeHandle(null);
    setResizeTextId(null);
  }, []);

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, target: ResizeTarget, handle: ResizeHandle, textId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeTarget(target);
    setResizeHandle(handle);
    setResizeTextId(textId || null);
    
    if (target === 'image' && logoImage) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: logoImage.width,
        height: logoImage.height,
        elemX: logoImage.x,
        elemY: logoImage.y,
        fontSize: 0
      });
      setSelectedElement({ type: 'image' });
    } else if (target === 'text' && textId) {
      const text = texts.find(t => t.id === textId);
      if (text) {
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: 0,
          height: 0,
          elemX: text.x,
          elemY: text.y,
          fontSize: text.fontSize
        });
        setSelectedElement({ type: 'text', id: textId });
      }
    } else if (target === 'canvas') {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: canvasWidth,
        height: canvasHeight,
        elemX: 0,
        elemY: 0,
        fontSize: 0
      });
    }
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    if (resizeTarget === 'image' && logoImage) {
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.elemX;
      let newY = resizeStart.elemY;
      
      // Calculate new dimensions based on handle
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(20, resizeStart.width + deltaX);
      }
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(20, resizeStart.width - deltaX);
        newX = resizeStart.elemX + (resizeStart.width - newWidth);
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(20, resizeStart.height + deltaY);
      }
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(20, resizeStart.height - deltaY);
        newY = resizeStart.elemY + (resizeStart.height - newHeight);
      }
      
      setLogoImage({
        ...logoImage,
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newWidth),
        height: Math.round(newHeight)
      });
    } else if (resizeTarget === 'text' && resizeTextId) {
      // For text, we resize by changing font size based on diagonal drag
      const diagonal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const sign = (deltaX + deltaY) > 0 ? 1 : -1;
      const newFontSize = Math.max(8, Math.min(200, resizeStart.fontSize + sign * diagonal * 0.5));
      
      setTexts(texts.map(t => 
        t.id === resizeTextId 
          ? { ...t, fontSize: Math.round(newFontSize) }
          : t
      ));
    } else if (resizeTarget === 'canvas') {
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      if (resizeHandle.includes('e') || resizeHandle === 'se' || resizeHandle === 'ne') {
        newWidth = Math.max(100, resizeStart.width + deltaX);
      }
      if (resizeHandle.includes('s') || resizeHandle === 'se' || resizeHandle === 'sw') {
        newHeight = Math.max(50, resizeStart.height + deltaY);
      }
      
      setCanvasWidth(Math.round(newWidth));
      setCanvasHeight(Math.round(newHeight));
    }
  }, [isResizing, resizeTarget, resizeHandle, resizeStart, logoImage, resizeTextId, texts]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleResizeMove, handleMouseUp]);

  // Save logo
  const handleSave = async () => {
    setSaving(true);
    try {
      const logoData: LogoDesign = {
        id: isNew ? generateId() : id!,
        name: logoName,
        createdAt: isNew ? new Date().toISOString() : (website?.logos?.find(l => l.id === id)?.createdAt || new Date().toISOString()),
        canvas: {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor
        },
        image: logoImage,
        texts,
        thumbnail: undefined // Could generate a data URL here
      };

      if (isNew) {
        await addLogo(logoData);
      } else {
        await updateLogo(id!, logoData);
      }
      
      navigate('/admin/logos');
    } catch (error) {
      console.error('Error saving logo:', error);
      alert('Fehler beim Speichern des Logos');
    } finally {
      setSaving(false);
    }
  };

  // Get selected text
  const selectedText = selectedElement?.type === 'text' && selectedElement.id 
    ? texts.find(t => t.id === selectedElement.id)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={logoName}
            onChange={(e) => setLogoName(e.target.value)}
            className="text-lg font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-rose-200 rounded px-2 py-1"
            placeholder="Logo-Name"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/logos')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2 rounded-lg hover:bg-rose-600 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar Left */}
        <div className="w-16 bg-white border-r flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => setShowMediaLibrary(true)}
            className="p-3 hover:bg-gray-100 rounded-lg transition group"
            title="Bild hinzufügen"
          >
            <Image className="w-5 h-5 text-gray-600 group-hover:text-rose-500" />
          </button>
          <button
            onClick={handleAddText}
            className="p-3 hover:bg-gray-100 rounded-lg transition group"
            title="Text hinzufügen"
          >
            <Type className="w-5 h-5 text-gray-600 group-hover:text-rose-500" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div 
            ref={canvasWrapperRef}
            className="relative"
          >
            <div 
              ref={canvasRef}
              className={`relative cursor-crosshair ${backgroundColor === 'transparent' ? '' : 'shadow-xl'}`}
              style={{
                width: canvasWidth,
                height: canvasHeight,
                backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
              }}
              onClick={(e) => {
                // Only deselect if clicking directly on canvas, not on children
                if (e.target === e.currentTarget) {
                  setSelectedElement(null);
                }
              }}
            >
              {/* Image Element */}
              {logoImage && (
                <div
                  className={`absolute ${selectedElement?.type === 'image' ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: logoImage.x,
                    top: logoImage.y,
                    width: logoImage.width,
                    height: logoImage.height
                  }}
                >
                  <div 
                    className="w-full h-full cursor-move"
                    onMouseDown={(e) => handleMouseDown(e, 'image')}
                  >
                    <img
                      src={logoImage.url}
                      alt="Logo"
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  </div>
                  {/* Image Resize Handles */}
                  {selectedElement?.type === 'image' && (
                    <>
                      {/* Corner handles */}
                      <div 
                        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 'nw')}
                      />
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 'ne')}
                      />
                      <div 
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 'sw')}
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 'se')}
                      />
                      {/* Edge handles */}
                      <div 
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-n-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 'n')}
                      />
                      <div 
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-s-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 's')}
                      />
                      <div 
                        className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-w-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 'w')}
                      />
                      <div 
                        className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-e-resize z-10"
                        onMouseDown={(e) => handleResizeStart(e, 'image', 'e')}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Text Elements */}
              {texts.map((text) => (
                <div
                  key={text.id}
                  className={`absolute ${
                    selectedElement?.type === 'text' && selectedElement.id === text.id 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}
                  style={{
                    left: text.x,
                    top: text.y,
                  }}
                >
                  <div
                    className="cursor-move whitespace-nowrap"
                    style={{
                      fontFamily: text.fontFamily,
                      fontSize: text.fontSize,
                      fontWeight: text.fontWeight,
                      color: text.color,
                      letterSpacing: text.letterSpacing
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'text', text.id)}
                  >
                    {text.content}
                  </div>
                  {/* Text Resize Handle */}
                  {selectedElement?.type === 'text' && selectedElement.id === text.id && (
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white cursor-se-resize z-10 rounded-sm"
                      onMouseDown={(e) => handleResizeStart(e, 'text', 'se', text.id)}
                      title="Schriftgröße ändern"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Canvas Resize Handles */}
            <div 
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-rose-500 border-2 border-white cursor-se-resize rounded-sm shadow-md z-20"
              onMouseDown={(e) => handleResizeStart(e, 'canvas', 'se')}
              title="Canvas-Größe ändern"
            />
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-500 border-2 border-white cursor-s-resize rounded-sm shadow-md z-20"
              onMouseDown={(e) => handleResizeStart(e, 'canvas', 's')}
              title="Höhe ändern"
            />
            <div 
              className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-rose-500 border-2 border-white cursor-e-resize rounded-sm shadow-md z-20"
              onMouseDown={(e) => handleResizeStart(e, 'canvas', 'e')}
              title="Breite ändern"
            />
          </div>
        </div>

        {/* Properties Panel Right */}
        <div className="w-72 bg-white border-l overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Canvas Settings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Canvas
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Breite</label>
                    <input
                      type="number"
                      value={canvasWidth}
                      onChange={(e) => setCanvasWidth(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                      min={100}
                      max={1000}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Höhe</label>
                    <input
                      type="number"
                      value={canvasHeight}
                      onChange={(e) => setCanvasHeight(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                      min={50}
                      max={500}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Hintergrund</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-8 rounded border cursor-pointer"
                      disabled={backgroundColor === 'transparent'}
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-2 py-1.5 border rounded text-sm font-mono"
                      placeholder="#ffffff oder transparent"
                    />
                  </div>
                  <button
                    onClick={() => setBackgroundColor(backgroundColor === 'transparent' ? '#ffffff' : 'transparent')}
                    className={`mt-2 w-full px-3 py-1.5 text-xs rounded border transition ${
                      backgroundColor === 'transparent' 
                        ? 'bg-rose-50 border-rose-300 text-rose-700' 
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {backgroundColor === 'transparent' ? '✓ Transparent' : 'Transparent machen'}
                  </button>
                </div>
              </div>
            </div>

            {/* Image Settings */}
            {selectedElement?.type === 'image' && logoImage && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Bild
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">X</label>
                      <input
                        type="number"
                        value={logoImage.x}
                        onChange={(e) => setLogoImage({ ...logoImage, x: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Y</label>
                      <input
                        type="number"
                        value={logoImage.y}
                        onChange={(e) => setLogoImage({ ...logoImage, y: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Breite</label>
                      <input
                        type="number"
                        value={logoImage.width}
                        onChange={(e) => setLogoImage({ ...logoImage, width: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                        min={10}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Höhe</label>
                      <input
                        type="number"
                        value={logoImage.height}
                        onChange={(e) => setLogoImage({ ...logoImage, height: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                        min={10}
                      />
                    </div>
                  </div>
                  <button
                    onClick={deleteImage}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Bild entfernen
                  </button>
                </div>
              </div>
            )}

            {/* Text Settings */}
            {selectedText && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Inhalt</label>
                    <input
                      type="text"
                      value={selectedText.content}
                      onChange={(e) => updateText(selectedText.id, { content: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Schriftart</label>
                    <select
                      value={selectedText.fontFamily}
                      onChange={(e) => updateText(selectedText.id, { fontFamily: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Größe</label>
                      <input
                        type="number"
                        value={selectedText.fontSize}
                        onChange={(e) => updateText(selectedText.id, { fontSize: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                        min={8}
                        max={200}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Stärke</label>
                      <select
                        value={selectedText.fontWeight}
                        onChange={(e) => updateText(selectedText.id, { fontWeight: e.target.value as LogoText['fontWeight'] })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      >
                        {FONT_WEIGHTS.map((weight) => (
                          <option key={weight.value} value={weight.value}>
                            {weight.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Farbe</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedText.color}
                        onChange={(e) => updateText(selectedText.id, { color: e.target.value })}
                        className="w-10 h-8 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedText.color}
                        onChange={(e) => updateText(selectedText.id, { color: e.target.value })}
                        className="flex-1 px-2 py-1.5 border rounded text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Zeichenabstand</label>
                    <input
                      type="number"
                      value={selectedText.letterSpacing}
                      onChange={(e) => updateText(selectedText.id, { letterSpacing: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                      min={-10}
                      max={50}
                      step={0.5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">X</label>
                      <input
                        type="number"
                        value={selectedText.x}
                        onChange={(e) => updateText(selectedText.id, { x: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Y</label>
                      <input
                        type="number"
                        value={selectedText.y}
                        onChange={(e) => updateText(selectedText.id, { y: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteText(selectedText.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Text entfernen
                  </button>
                </div>
              </div>
            )}

            {/* No selection hint */}
            {!selectedElement && (
              <div className="text-center text-gray-400 text-sm py-8">
                <Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Klicken Sie auf ein Element,<br/>um es zu bearbeiten</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bild auswählen</h2>
              <button 
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <MediaLibrary
                mode="select"
                onSelect={handleImageSelect}
                onCancel={() => setShowMediaLibrary(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoEditor;
