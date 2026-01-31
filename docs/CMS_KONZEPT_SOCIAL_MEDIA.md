# BeautifulCMS - Social Media Integration

## Übersicht

Dieses Dokument beschreibt die Integration von Social Media Icons und Links im CMS.

---

## Inhaltsverzeichnis

1. [Unterstützte Plattformen](#1-unterstützte-plattformen)
2. [Datenstruktur](#2-datenstruktur)
3. [Icon-Komponente](#3-icon-komponente)
4. [Platzierung](#4-platzierung)
5. [Editor](#5-editor)
6. [Styling-Optionen](#6-styling-optionen)

---

## 1. Unterstützte Plattformen

### 1.1 Primäre Plattformen

| Plattform | Icon | URL-Format | Farbe |
|-----------|------|------------|-------|
| Facebook | `<Facebook />` | facebook.com/USERNAME | #1877F2 |
| Instagram | `<Instagram />` | instagram.com/USERNAME | #E4405F |
| Twitter/X | `<Twitter />` | twitter.com/USERNAME | #1DA1F2 |
| LinkedIn | `<Linkedin />` | linkedin.com/in/USERNAME | #0A66C2 |
| YouTube | `<Youtube />` | youtube.com/@USERNAME | #FF0000 |
| TikTok | `<TikTok />` | tiktok.com/@USERNAME | #000000 |

### 1.2 Sekundäre Plattformen

| Plattform | Icon | URL-Format | Farbe |
|-----------|------|------------|-------|
| Pinterest | `<Pinterest />` | pinterest.de/USERNAME | #BD081C |
| WhatsApp | `<MessageCircle />` | wa.me/TELEFONNUMMER | #25D366 |
| Telegram | `<Send />` | t.me/USERNAME | #0088CC |
| Yelp | `<Star />` | yelp.de/biz/NAME | #D32323 |
| Google Business | `<MapPin />` | g.page/NAME | #4285F4 |

### 1.3 Icon-Bibliothek

Verwendung von **Lucide React** für alle Icons (bereits im Projekt):

```bash
npm install lucide-react
# Bereits installiert
```

---

## 2. Datenstruktur

### 2.1 TypeScript-Interface

```typescript
// src/types/SocialMedia.ts

export type SocialPlatform = 
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'pinterest'
  | 'whatsapp'
  | 'telegram'
  | 'yelp'
  | 'googleBusiness';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label?: string;  // Für Screenreader
}

export interface SocialMediaConfig {
  links: SocialLink[];
  style: {
    variant: 'filled' | 'outline' | 'ghost';
    size: 'sm' | 'md' | 'lg';
    color: 'brand' | 'monochrome' | 'theme';
    shape: 'circle' | 'rounded' | 'square';
  };
  showLabels?: boolean;
  openInNewTab?: boolean;
}

// Plattform-Metadaten
export const SOCIAL_PLATFORMS: Record<SocialPlatform, {
  name: string;
  icon: string;          // Lucide Icon Name
  color: string;         // Brand-Farbe
  placeholder: string;   // Beispiel-URL
}> = {
  facebook: {
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    placeholder: 'https://facebook.com/IhrProfil'
  },
  instagram: {
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    placeholder: 'https://instagram.com/IhrProfil'
  },
  twitter: {
    name: 'Twitter / X',
    icon: 'Twitter',
    color: '#1DA1F2',
    placeholder: 'https://twitter.com/IhrProfil'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0A66C2',
    placeholder: 'https://linkedin.com/in/IhrProfil'
  },
  youtube: {
    name: 'YouTube',
    icon: 'Youtube',
    color: '#FF0000',
    placeholder: 'https://youtube.com/@IhrKanal'
  },
  tiktok: {
    name: 'TikTok',
    icon: 'Music2',  // Lucide hat kein TikTok-Icon
    color: '#000000',
    placeholder: 'https://tiktok.com/@IhrProfil'
  },
  pinterest: {
    name: 'Pinterest',
    icon: 'Pin',
    color: '#BD081C',
    placeholder: 'https://pinterest.de/IhrProfil'
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: 'MessageCircle',
    color: '#25D366',
    placeholder: 'https://wa.me/491234567890'
  },
  telegram: {
    name: 'Telegram',
    icon: 'Send',
    color: '#0088CC',
    placeholder: 'https://t.me/IhrProfil'
  },
  yelp: {
    name: 'Yelp',
    icon: 'Star',
    color: '#D32323',
    placeholder: 'https://yelp.de/biz/IhrGeschaeft'
  },
  googleBusiness: {
    name: 'Google Business',
    icon: 'MapPin',
    color: '#4285F4',
    placeholder: 'https://g.page/IhrGeschaeft'
  }
};
```

### 2.2 In Website-JSON

```typescript
// websites.data.settings.social

interface WebsiteSettings {
  // ... andere Einstellungen
  
  social: SocialMediaConfig;
}

// Beispiel-Daten:
{
  "social": {
    "links": [
      { "platform": "facebook", "url": "https://facebook.com/friseursalon.beispiel" },
      { "platform": "instagram", "url": "https://instagram.com/salon_beispiel" },
      { "platform": "whatsapp", "url": "https://wa.me/491234567890" }
    ],
    "style": {
      "variant": "filled",
      "size": "md",
      "color": "brand",
      "shape": "circle"
    },
    "openInNewTab": true
  }
}
```

---

## 3. Icon-Komponente

### 3.1 SocialIcon Komponente

```tsx
// src/components/website/SocialMedia/SocialIcon.tsx

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { SocialPlatform, SOCIAL_PLATFORMS } from '@/types/SocialMedia';

interface SocialIconProps {
  platform: SocialPlatform;
  url: string;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'monochrome' | 'theme';
  shape?: 'circle' | 'rounded' | 'square';
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: { icon: 16, button: 32 },
  md: { icon: 20, button: 40 },
  lg: { icon: 24, button: 48 }
};

export const SocialIcon: React.FC<SocialIconProps> = ({
  platform,
  url,
  variant = 'filled',
  size = 'md',
  color = 'brand',
  shape = 'circle',
  showLabel = false,
  className = ''
}) => {
  const platformData = SOCIAL_PLATFORMS[platform];
  if (!platformData) return null;

  // Icon-Komponente dynamisch laden
  const IconComponent = (LucideIcons as any)[platformData.icon] || LucideIcons.Link;

  // Farbe bestimmen
  const getColor = () => {
    switch (color) {
      case 'brand':
        return platformData.color;
      case 'monochrome':
        return variant === 'filled' ? '#FFFFFF' : '#374151';
      case 'theme':
        return 'currentColor';  // Erbt vom Parent
      default:
        return platformData.color;
    }
  };

  // Hintergrund bestimmen
  const getBackground = () => {
    if (variant === 'ghost') return 'transparent';
    if (variant === 'outline') return 'transparent';
    if (color === 'brand') return platformData.color;
    if (color === 'monochrome') return '#374151';
    return 'currentColor';
  };

  // Border-Radius bestimmen
  const getBorderRadius = () => {
    switch (shape) {
      case 'circle': return '9999px';
      case 'rounded': return '8px';
      case 'square': return '0';
      default: return '9999px';
    }
  };

  const sizeConfig = SIZES[size];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${platformData.name} besuchen`}
      className={`
        inline-flex items-center justify-center transition-all duration-200
        hover:opacity-80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${className}
      `}
      style={{
        width: showLabel ? 'auto' : sizeConfig.button,
        height: sizeConfig.button,
        padding: showLabel ? '0 16px' : 0,
        backgroundColor: getBackground(),
        borderRadius: getBorderRadius(),
        border: variant === 'outline' ? `2px solid ${getColor()}` : 'none',
        color: variant === 'filled' && color === 'brand' ? '#FFFFFF' : getColor()
      }}
    >
      <IconComponent 
        size={sizeConfig.icon} 
        style={{ 
          color: variant === 'filled' && color === 'brand' ? '#FFFFFF' : getColor()
        }}
      />
      {showLabel && (
        <span className="ml-2 font-medium" style={{ fontSize: size === 'sm' ? 12 : 14 }}>
          {platformData.name}
        </span>
      )}
    </a>
  );
};
```

### 3.2 SocialIcons Container

```tsx
// src/components/website/SocialMedia/SocialIcons.tsx

import React from 'react';
import { SocialIcon } from './SocialIcon';
import { SocialMediaConfig, SocialLink } from '@/types/SocialMedia';

interface SocialIconsProps {
  config: SocialMediaConfig;
  className?: string;
}

export const SocialIcons: React.FC<SocialIconsProps> = ({ config, className = '' }) => {
  if (!config.links || config.links.length === 0) {
    return null;
  }

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      role="navigation"
      aria-label="Social Media Links"
    >
      {config.links.map((link, index) => (
        <SocialIcon
          key={`${link.platform}-${index}`}
          platform={link.platform}
          url={link.url}
          variant={config.style.variant}
          size={config.style.size}
          color={config.style.color}
          shape={config.style.shape}
          showLabel={config.showLabels}
        />
      ))}
    </div>
  );
};
```

### 3.3 TikTok Custom Icon (da Lucide keins hat)

```tsx
// src/components/icons/TikTokIcon.tsx

import React from 'react';

interface TikTokIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const TikTokIcon: React.FC<TikTokIconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  className = ''
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={color}
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
```

---

## 4. Platzierung

### 4.1 Header-Integration

```tsx
// In HeaderClassic.tsx, HeaderCentered.tsx, etc.

import { SocialIcons } from '@/components/website/SocialMedia/SocialIcons';

// Im Header (meist oben rechts oder in der mobilen Navigation)
<div className="hidden md:flex items-center gap-4">
  <SocialIcons 
    config={{
      ...websiteData.settings.social,
      style: {
        ...websiteData.settings.social.style,
        size: 'sm',       // Kleiner im Header
        variant: 'ghost'  // Dezenter im Header
      }
    }} 
  />
</div>
```

### 4.2 Footer-Integration

```tsx
// In Footer-Komponenten

<footer className="bg-gray-900 text-white py-12">
  <div className="max-w-6xl mx-auto px-4">
    {/* Andere Footer-Inhalte */}
    
    {/* Social Media Section */}
    <div className="border-t border-gray-700 pt-8 mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400">Folgen Sie uns:</p>
        <SocialIcons 
          config={websiteData.settings.social}
        />
      </div>
    </div>
  </div>
</footer>
```

### 4.3 Als eigenständiger Baustein

```tsx
// src/components/website/Blocks/SocialMediaBlock.tsx

import React from 'react';
import { SocialIcons } from '@/components/website/SocialMedia/SocialIcons';

interface SocialMediaBlockConfig {
  title?: string;
  subtitle?: string;
  social: SocialMediaConfig;
  alignment: 'left' | 'center' | 'right';
  background: 'transparent' | 'light' | 'dark';
}

export const SocialMediaBlock: React.FC<{ config: SocialMediaBlockConfig }> = ({ config }) => {
  return (
    <section className={`
      py-12
      ${config.background === 'light' ? 'bg-gray-50' : ''}
      ${config.background === 'dark' ? 'bg-gray-900 text-white' : ''}
    `}>
      <div className={`
        max-w-4xl mx-auto px-4
        ${config.alignment === 'center' ? 'text-center' : ''}
        ${config.alignment === 'right' ? 'text-right' : ''}
      `}>
        {config.title && (
          <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
        )}
        {config.subtitle && (
          <p className="text-gray-600 mb-6">{config.subtitle}</p>
        )}
        <div className={`
          flex gap-4
          ${config.alignment === 'center' ? 'justify-center' : ''}
          ${config.alignment === 'right' ? 'justify-end' : ''}
        `}>
          <SocialIcons config={config.social} />
        </div>
      </div>
    </section>
  );
};
```

---

## 5. Editor

### 5.1 Social Media Editor

```tsx
// src/components/admin/SocialMediaEditor.tsx

import React, { useState } from 'react';
import { 
  Plus, GripVertical, Trash2, ExternalLink,
  Facebook, Instagram, Twitter, Linkedin, Youtube
} from 'lucide-react';
import { SocialMediaConfig, SocialLink, SOCIAL_PLATFORMS, SocialPlatform } from '@/types/SocialMedia';

interface SocialMediaEditorProps {
  config: SocialMediaConfig;
  onChange: (config: SocialMediaConfig) => void;
}

export const SocialMediaEditor: React.FC<SocialMediaEditorProps> = ({ config, onChange }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addLink = (platform: SocialPlatform) => {
    onChange({
      ...config,
      links: [
        ...config.links,
        { platform, url: '' }
      ]
    });
    setShowAddMenu(false);
  };

  const updateLink = (index: number, updates: Partial<SocialLink>) => {
    const newLinks = [...config.links];
    newLinks[index] = { ...newLinks[index], ...updates };
    onChange({ ...config, links: newLinks });
  };

  const removeLink = (index: number) => {
    onChange({
      ...config,
      links: config.links.filter((_, i) => i !== index)
    });
  };

  const moveLink = (from: number, to: number) => {
    const newLinks = [...config.links];
    const [removed] = newLinks.splice(from, 1);
    newLinks.splice(to, 0, removed);
    onChange({ ...config, links: newLinks });
  };

  // Verfügbare Plattformen (die noch nicht hinzugefügt wurden)
  const availablePlatforms = Object.keys(SOCIAL_PLATFORMS).filter(
    p => !config.links.some(l => l.platform === p)
  ) as SocialPlatform[];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Social Media Links</h3>

      {/* Bestehende Links */}
      <div className="space-y-3">
        {config.links.map((link, index) => {
          const platform = SOCIAL_PLATFORMS[link.platform];
          
          return (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Drag Handle */}
              <button 
                className="cursor-move text-gray-400 hover:text-gray-600"
                aria-label="Verschieben"
              >
                <GripVertical className="w-5 h-5" />
              </button>

              {/* Platform Icon & Name */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: platform.color }}
              >
                <PlatformIcon platform={link.platform} color="white" size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium mb-1">
                  {platform.name}
                </label>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, { url: e.target.value })}
                  placeholder={platform.placeholder}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg"
                />
              </div>

              {/* Test-Link */}
              {link.url && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-500"
                  aria-label="Link testen"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}

              {/* Löschen */}
              <button
                onClick={() => removeLink(index)}
                className="p-2 text-gray-400 hover:text-red-500"
                aria-label="Entfernen"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Hinzufügen-Button */}
      {availablePlatforms.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-rose-300 hover:text-rose-500 transition w-full justify-center"
          >
            <Plus className="w-5 h-5" />
            Social Media hinzufügen
          </button>

          {/* Dropdown-Menü */}
          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {availablePlatforms.map(platform => {
                const data = SOCIAL_PLATFORMS[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => addLink(platform)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: data.color }}
                    >
                      <PlatformIcon platform={platform} color="white" size={16} />
                    </div>
                    <span>{data.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Styling-Optionen */}
      <div className="border-t pt-6 mt-6">
        <h4 className="font-medium mb-4">Darstellung</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Variante */}
          <div>
            <label className="block text-sm font-medium mb-2">Stil</label>
            <select
              value={config.style.variant}
              onChange={(e) => onChange({
                ...config,
                style: { ...config.style, variant: e.target.value as any }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="filled">Gefüllt</option>
              <option value="outline">Umrandet</option>
              <option value="ghost">Dezent</option>
            </select>
          </div>

          {/* Größe */}
          <div>
            <label className="block text-sm font-medium mb-2">Größe</label>
            <select
              value={config.style.size}
              onChange={(e) => onChange({
                ...config,
                style: { ...config.style, size: e.target.value as any }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="sm">Klein</option>
              <option value="md">Mittel</option>
              <option value="lg">Groß</option>
            </select>
          </div>

          {/* Farbe */}
          <div>
            <label className="block text-sm font-medium mb-2">Farbe</label>
            <select
              value={config.style.color}
              onChange={(e) => onChange({
                ...config,
                style: { ...config.style, color: e.target.value as any }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="brand">Markenfarben</option>
              <option value="monochrome">Einfarbig</option>
              <option value="theme">Theme-Farbe</option>
            </select>
          </div>

          {/* Form */}
          <div>
            <label className="block text-sm font-medium mb-2">Form</label>
            <select
              value={config.style.shape}
              onChange={(e) => onChange({
                ...config,
                style: { ...config.style, shape: e.target.value as any }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="circle">Rund</option>
              <option value="rounded">Abgerundet</option>
              <option value="square">Eckig</option>
            </select>
          </div>
        </div>

        {/* Optionen */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showLabels}
              onChange={(e) => onChange({ ...config, showLabels: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-rose-500"
            />
            <span className="text-sm">Namen anzeigen</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.openInNewTab}
              onChange={(e) => onChange({ ...config, openInNewTab: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-rose-500"
            />
            <span className="text-sm">In neuem Tab öffnen</span>
          </label>
        </div>
      </div>

      {/* Live-Vorschau */}
      <div className="border-t pt-6 mt-6">
        <h4 className="font-medium mb-4">Vorschau</h4>
        <div className="p-6 bg-gray-100 rounded-lg flex justify-center">
          <SocialIcons config={config} />
        </div>
      </div>
    </div>
  );
};

// Hilfsfunktion für Platform Icons
const PlatformIcon: React.FC<{ platform: SocialPlatform; color?: string; size?: number }> = ({
  platform, color = 'currentColor', size = 24
}) => {
  const icons: Record<SocialPlatform, React.ReactNode> = {
    facebook: <Facebook size={size} color={color} />,
    instagram: <Instagram size={size} color={color} />,
    twitter: <Twitter size={size} color={color} />,
    linkedin: <Linkedin size={size} color={color} />,
    youtube: <Youtube size={size} color={color} />,
    // ... weitere Icons
  };
  return icons[platform] || null;
};
```

### 5.2 Editor UI-Mockup

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Social Media Links                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ☰ │ [FB] Facebook                                                  │ │
│  │   │ [https://facebook.com/friseursalon________________] [↗] [🗑] │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ [IG] Instagram                                                 │ │
│  │   │ [https://instagram.com/salon_beispiel_____________] [↗] [🗑] │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ [WA] WhatsApp                                                  │ │
│  │   │ [https://wa.me/491234567890_______________________] [↗] [🗑] │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  + Social Media hinzufügen                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Darstellung                                                           │
│                                                                         │
│  Stil:            Größe:           Farbe:            Form:             │
│  [Gefüllt ▼]      [Mittel ▼]       [Markenfarben ▼]  [Rund ▼]          │
│                                                                         │
│  [✓] In neuem Tab öffnen                                               │
│  [ ] Namen anzeigen                                                    │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Vorschau                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │              [FB]  [IG]  [WA]                                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Styling-Optionen

### 6.1 Varianten-Übersicht

```
VARIANTE: FILLED (gefüllt)
┌───────────────────────────────────────┐
│  ████  ████  ████  ████  ████        │
│  █FB█  █IG█  █TW█  █LI█  █YT█        │
│  ████  ████  ████  ████  ████        │
└───────────────────────────────────────┘
→ Farbiger Hintergrund, weißes Icon

VARIANTE: OUTLINE (umrandet)
┌───────────────────────────────────────┐
│  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐        │
│  │FB│  │IG│  │TW│  │LI│  │YT│        │
│  └──┘  └──┘  └──┘  └──┘  └──┘        │
└───────────────────────────────────────┘
→ Farbiger Rand, farbiges Icon, transparenter Hintergrund

VARIANTE: GHOST (dezent)
┌───────────────────────────────────────┐
│   FB    IG    TW    LI    YT         │
└───────────────────────────────────────┘
→ Nur Icon, kein Hintergrund/Rand
```

### 6.2 Größen-Übersicht

```
GRÖSSE: SMALL (sm)
Icon: 16px, Button: 32px

GRÖSSE: MEDIUM (md)  
Icon: 20px, Button: 40px

GRÖSSE: LARGE (lg)
Icon: 24px, Button: 48px
```

### 6.3 Farb-Optionen

```
FARBE: BRAND (Markenfarben)
Jedes Icon in seiner offiziellen Markenfarbe
Facebook: #1877F2, Instagram: #E4405F, etc.

FARBE: MONOCHROME (Einfarbig)
Alle Icons in einer einheitlichen Farbe
Filled: Dunkelgrau mit weißen Icons
Outline/Ghost: Dunkelgraue Icons

FARBE: THEME (Theme-Farbe)
Alle Icons in der Primärfarbe des Themes
```

---

## Implementierungs-Checkliste

- [ ] TypeScript-Interfaces für Social Media erstellen
- [ ] SOCIAL_PLATFORMS Konstante definieren
- [ ] SocialIcon Komponente erstellen
- [ ] SocialIcons Container erstellen
- [ ] TikTok Custom Icon erstellen
- [ ] Social Media in Header integrieren
- [ ] Social Media in Footer integrieren
- [ ] SocialMediaBlock als Baustein erstellen
- [ ] SocialMediaEditor erstellen
- [ ] Drag & Drop für Reihenfolge
- [ ] URL-Validierung implementieren
- [ ] Live-Vorschau im Editor
- [ ] Responsives Verhalten testen
- [ ] Accessibility (aria-labels) prüfen
