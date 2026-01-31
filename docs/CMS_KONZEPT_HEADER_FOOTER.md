# BeautifulCMS - Header & Footer Varianten

## Übersicht

Dieses Dokument beschreibt alle Header- und Footer-Varianten des CMS mit ihren Konfigurationsoptionen und Implementierungsdetails.

---

## Inhaltsverzeichnis

1. [Header-Varianten](#1-header-varianten)
   - [Classic Header](#11-classic-header)
   - [Centered Header](#12-centered-header)
   - [Hamburger Header](#13-hamburger-header)
   - [Sticky/Transparent Header](#14-stickytransparent-header)
2. [Footer-Varianten](#2-footer-varianten)
   - [Minimal Footer](#21-minimal-footer)
   - [4-Spalten Footer](#22-4-spalten-footer)
   - [Footer mit Karte](#23-footer-mit-karte)
3. [Gemeinsame Komponenten](#3-gemeinsame-komponenten)
4. [Implementierung](#4-implementierung)

---

## 1. Header-Varianten

### 1.0 Gemeinsame Header-Struktur

```typescript
// src/types/Header.ts

interface HeaderConfig {
  variant: HeaderVariant;
  logo: {
    type: 'image' | 'text' | 'logo-designer';
    imageUrl?: string;
    text?: string;
    logoId?: string;      // Referenz auf Logo-Designer
    maxHeight: number;    // in px
  };
  navigation: NavigationItem[];
  cta?: {
    enabled: boolean;
    text: string;
    action: ButtonAction;
    style: ButtonStyle;
  };
  socialMedia: {
    enabled: boolean;
    position: 'left' | 'right' | 'hidden';
  };
  sticky: {
    enabled: boolean;
    showAfter: number;    // px gescrollt
    style: 'solid' | 'blur';
  };
  transparent: {
    enabled: boolean;
    textColorLight: boolean;  // Helle Schrift für dunklen Hintergrund
  };
  mobile: {
    breakpoint: number;   // Ab wann Hamburger (768 oder 1024)
    menuStyle: 'fullscreen' | 'slide-right' | 'dropdown';
  };
  style: {
    backgroundColor: string;
    textColor: string;
    height: number;
    padding: string;
    shadow: 'none' | 'small' | 'medium';
  };
}

interface NavigationItem {
  id: string;
  label: string;
  type: 'link' | 'scroll' | 'dropdown' | 'page';
  target?: string;        // URL, Section-ID oder Page-Slug
  children?: NavigationItem[];  // Für Dropdown
  visible: boolean;
}

type HeaderVariant = 'classic' | 'centered' | 'hamburger';
```

### 1.1 Classic Header

**Beschreibung:** Logo links, Navigation rechts - der Standard für Unternehmenswebsites.

**Priorität:** HOCH (Primäre Variante)

```
Desktop:
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]          Start   Leistungen   Über uns   Galerie   [Kontakt]   │
└─────────────────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                                          [☰]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Editor-Felder:**

| Feld | Typ | Beschreibung | Hilfe-Text |
|------|-----|--------------|------------|
| Logo-Typ | Select | Bild, Text oder Logo-Designer | "Wählen Sie, wie Ihr Logo angezeigt werden soll. 'Logo-Designer' verwendet ein von Ihnen erstelltes Logo." |
| Logo-Bild | MediaPicker | Logo-Datei | "Laden Sie Ihr Logo hoch. Empfohlen: PNG mit transparentem Hintergrund, max. Höhe 60px." |
| Logo-Text | Text | Textlogo | "Falls Sie kein Bild-Logo haben, können Sie Ihren Firmennamen als Text anzeigen." |
| Logo-Höhe | Slider | Max. Höhe 30-80px | "Die maximale Höhe Ihres Logos. Das Logo wird proportional skaliert." |
| Navigation | Liste | Menüpunkte | "Fügen Sie hier Ihre Menüpunkte hinzu. Ziehen Sie sie, um die Reihenfolge zu ändern." |
| CTA-Button | Toggle | Button anzeigen | "Ein auffälliger Button rechts im Header, z.B. 'Termin buchen'." |
| CTA-Text | Text | Button-Text | "Der Text auf dem Button, z.B. 'Jetzt Termin buchen'." |
| Social Media | Toggle | Icons anzeigen | "Zeigt Ihre Social-Media-Icons im Header an (wenn konfiguriert)." |

**Implementierung:**

```typescript
// src/components/blocks/HeaderClassic.tsx

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { SocialIcons } from '../common/SocialIcons';

interface HeaderClassicProps {
  config: HeaderConfig;
}

export const HeaderClassic: React.FC<HeaderClassicProps> = ({ config }) => {
  const { website } = useWebsite();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sticky Header Detection
  useEffect(() => {
    if (!config.sticky.enabled) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > config.sticky.showAfter);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config.sticky]);

  // Determine current styles based on scroll state
  const headerStyles = {
    backgroundColor: config.transparent.enabled && !isScrolled 
      ? 'transparent' 
      : config.style.backgroundColor,
    color: config.transparent.enabled && !isScrolled && config.transparent.textColorLight
      ? '#ffffff'
      : config.style.textColor,
    height: `${config.style.height}px`,
    boxShadow: isScrolled && config.sticky.enabled 
      ? '0 2px 10px rgba(0,0,0,0.1)' 
      : 'none',
    backdropFilter: isScrolled && config.sticky.style === 'blur' 
      ? 'blur(10px)' 
      : 'none',
  };

  return (
    <header
      className={`
        w-full z-50 transition-all duration-300
        ${config.sticky.enabled ? 'fixed top-0' : 'relative'}
      `}
      style={headerStyles}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="flex-shrink-0" aria-label="Zur Startseite">
          {config.logo.type === 'image' && (
            <img 
              src={config.logo.imageUrl} 
              alt={website?.settings?.businessName || 'Logo'}
              style={{ maxHeight: `${config.logo.maxHeight}px` }}
              className="h-auto"
            />
          )}
          {config.logo.type === 'text' && (
            <span className="text-xl font-bold">{config.logo.text}</span>
          )}
          {config.logo.type === 'logo-designer' && (
            <LogoFromDesigner logoId={config.logo.logoId} maxHeight={config.logo.maxHeight} />
          )}
        </a>

        {/* Desktop Navigation */}
        <nav 
          className="hidden lg:flex items-center space-x-8"
          role="navigation"
          aria-label="Hauptnavigation"
        >
          {config.navigation.filter(n => n.visible).map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Right Side: Social + CTA */}
        <div className="hidden lg:flex items-center space-x-4">
          {config.socialMedia.enabled && (
            <SocialIcons size="small" />
          )}
          
          {config.cta?.enabled && (
            <button
              onClick={() => handleButtonAction(config.cta.action)}
              className="px-6 py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: config.cta.style.backgroundColor,
                color: config.cta.style.textColor
              }}
            >
              {config.cta.text}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        config={config}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};
```

### 1.2 Centered Header

**Beschreibung:** Logo zentriert oben, Navigation darunter zentriert - elegant für Salons und Boutiquen.

**Priorität:** HOCH

```
Desktop:
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              [Logo]                                     │
│                                                                         │
│          Start    Leistungen    Über uns    Galerie    Kontakt         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Mobile (gleich wie Classic):
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                                          [☰]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Spezifische Konfiguration:**

```typescript
interface CenteredHeaderConfig extends HeaderConfig {
  variant: 'centered';
  divider: {
    enabled: boolean;
    style: 'line' | 'dots' | 'none';
    color: string;
  };
  spacing: {
    logoMarginBottom: number;
    navItemSpacing: number;
  };
}
```

**Implementierung:**

```typescript
// src/components/blocks/HeaderCentered.tsx

export const HeaderCentered: React.FC<HeaderCenteredProps> = ({ config }) => {
  // ... similar scroll/mobile logic as HeaderClassic

  return (
    <header
      className={`
        w-full z-50 transition-all duration-300
        ${config.sticky.enabled ? 'fixed top-0' : 'relative'}
      `}
      style={headerStyles}
      role="banner"
    >
      {/* Desktop: Centered Layout */}
      <div className="hidden lg:block text-center py-4">
        {/* Logo */}
        <a href="/" className="inline-block" aria-label="Zur Startseite">
          <Logo config={config.logo} />
        </a>

        {/* Divider */}
        {config.divider?.enabled && (
          <div 
            className="w-24 h-px mx-auto my-4"
            style={{ backgroundColor: config.divider.color }}
            aria-hidden="true"
          />
        )}

        {/* Navigation */}
        <nav 
          className="flex justify-center items-center space-x-8"
          role="navigation"
          aria-label="Hauptnavigation"
        >
          {config.navigation.filter(n => n.visible).map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
          
          {config.cta?.enabled && (
            <CTAButton config={config.cta} />
          )}
        </nav>
      </div>

      {/* Mobile: Classic Layout (reuse) */}
      <MobileHeader config={config} />
    </header>
  );
};
```

### 1.3 Hamburger Header

**Beschreibung:** Immer Hamburger-Menü, auch auf Desktop - minimalistisch und modern.

**Priorität:** MITTEL

```
Desktop & Mobile:
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                                          [☰]   │
└─────────────────────────────────────────────────────────────────────────┘

Geöffnetes Menü (Fullscreen):
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                                          [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                              Start                                      │
│                                                                         │
│                           Leistungen                                    │
│                                                                         │
│                            Über uns                                     │
│                                                                         │
│                             Galerie                                     │
│                                                                         │
│                             Kontakt                                     │
│                                                                         │
│                         [f] [in] [ig]                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Spezifische Konfiguration:**

```typescript
interface HamburgerHeaderConfig extends HeaderConfig {
  variant: 'hamburger';
  menu: {
    style: 'fullscreen' | 'slide-right' | 'slide-left';
    backgroundColor: string;
    textColor: string;
    textSize: 'medium' | 'large' | 'xlarge';
    animation: 'fade' | 'slide' | 'scale';
    showSocialMedia: boolean;
    showCTA: boolean;
  };
  hamburgerIcon: {
    style: 'lines' | 'dots' | 'x-rotate';
    color: string;
    size: number;
  };
}
```

### 1.4 Sticky/Transparent Header

**Hinweis:** Dies sind **Optionen**, die mit allen Header-Varianten kombiniert werden können.

**Sticky Header:**
- Header bleibt beim Scrollen oben fixiert
- Optional: Erst nach X Pixeln Scrollen erscheinen
- Optional: Blur-Effekt (Glasmorphism)

**Transparent Header:**
- Header hat zunächst transparenten Hintergrund
- Nützlich wenn Hero dahinter liegt
- Wird solid beim Scrollen (wenn sticky aktiv)
- Option für helle/dunkle Schrift

**Konfiguration:**

```typescript
// Diese Optionen sind in der Basis-HeaderConfig enthalten

sticky: {
  enabled: boolean;
  showAfter: number;      // 0 = sofort, 100 = nach 100px Scroll
  style: 'solid' | 'blur';
};

transparent: {
  enabled: boolean;
  textColorLight: boolean;  // true = weiße Schrift
};
```

---

## 2. Footer-Varianten

### 2.0 Gemeinsame Footer-Struktur

```typescript
// src/types/Footer.ts

interface FooterConfig {
  variant: FooterVariant;
  logo: {
    enabled: boolean;
    type: 'image' | 'text' | 'logo-designer';
    imageUrl?: string;
    text?: string;
    logoId?: string;
  };
  columns: FooterColumn[];
  socialMedia: {
    enabled: boolean;
    title?: string;
  };
  copyright: {
    text: string;          // z.B. "© 2026 Salon Name"
    showYear: boolean;     // Jahr automatisch aktualisieren
  };
  legal: {
    links: {
      label: string;
      url: string;
    }[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
    padding: string;
    dividerColor: string;
  };
  newsletter?: {
    enabled: boolean;
    title: string;
    placeholder: string;
    buttonText: string;
    // Integration separat konfigurieren
  };
}

interface FooterColumn {
  id: string;
  title: string;
  type: 'links' | 'text' | 'contact' | 'hours' | 'custom';
  content: any;  // Je nach Typ
}

type FooterVariant = 'minimal' | 'four-column' | 'with-map';
```

### 2.1 Minimal Footer

**Beschreibung:** Kompakter Footer mit Copyright und wichtigen Links.

**Priorität:** MITTEL

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  © 2026 Friseursalon Beispiel    Impressum · Datenschutz · Kontakt     │
│                                                                         │
│                           [f] [in] [ig]                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Konfiguration:**

```typescript
interface MinimalFooterConfig extends FooterConfig {
  variant: 'minimal';
  layout: 'single-line' | 'stacked';
  alignment: 'left' | 'center' | 'space-between';
}
```

**Implementierung:**

```typescript
// src/components/blocks/FooterMinimal.tsx

export const FooterMinimal: React.FC<FooterMinimalProps> = ({ config }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="w-full py-6"
      style={{ 
        backgroundColor: config.style.backgroundColor,
        color: config.style.textColor 
      }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className={`
          flex flex-col md:flex-row items-center 
          ${config.layout === 'single-line' ? 'justify-between' : 'justify-center text-center'}
          gap-4
        `}>
          
          {/* Copyright */}
          <p className="text-sm">
            {config.copyright.showYear 
              ? config.copyright.text.replace('{year}', currentYear.toString())
              : config.copyright.text
            }
          </p>

          {/* Legal Links */}
          <nav aria-label="Rechtliche Links">
            <ul className="flex items-center gap-4 text-sm">
              {config.legal.links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url}
                    className="hover:underline"
                    style={{ color: config.style.linkColor }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Media */}
          {config.socialMedia.enabled && (
            <SocialIcons size="small" />
          )}
        </div>
      </div>
    </footer>
  );
};
```

### 2.2 4-Spalten Footer

**Beschreibung:** Umfangreicher Footer mit mehreren Inhaltsspalten.

**Priorität:** HOCH

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Logo]              Schnelllinks    Kontakt         Öffnungszeiten     │
│                                                                         │
│  Ihr Partner         • Leistungen    Musterstr. 1    Mo-Fr: 9-18 Uhr    │
│  für schönes         • Preise        12345 Stadt     Sa: 9-14 Uhr       │
│  Haar seit           • Team          Tel: 0123/456   So: geschlossen    │
│  1990.               • Galerie       info@salon.de                      │
│                                                                         │
│  [f] [in] [ig]                                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  © 2026 Salon Name          Impressum · Datenschutz · AGB              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Konfiguration:**

```typescript
interface FourColumnFooterConfig extends FooterConfig {
  variant: 'four-column';
  columns: FooterColumn[];  // Max 4 Spalten
  columnWidths: {
    desktop: string[];      // z.B. ['2fr', '1fr', '1fr', '1fr']
    tablet: string[];       // z.B. ['1fr', '1fr']
    mobile: string[];       // z.B. ['1fr']
  };
}

// Spalten-Typen:
interface FooterLinksColumn {
  type: 'links';
  title: string;
  links: { label: string; url: string; }[];
}

interface FooterTextColumn {
  type: 'text';
  title?: string;
  content: string;  // HTML möglich
  showLogo?: boolean;
  showSocialMedia?: boolean;
}

interface FooterContactColumn {
  type: 'contact';
  title: string;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showMap?: boolean;  // Mini-Map Link
}

interface FooterHoursColumn {
  type: 'hours';
  title: string;
  // Verwendet Öffnungszeiten aus Website-Config
}
```

**Implementierung:**

```typescript
// src/components/blocks/FooterFourColumn.tsx

export const FooterFourColumn: React.FC<FooterFourColumnProps> = ({ config }) => {
  const { website } = useWebsite();
  
  const renderColumn = (column: FooterColumn) => {
    switch (column.type) {
      case 'text':
        return (
          <div>
            {column.showLogo && <Logo config={config.logo} />}
            {column.title && <h3 className="font-semibold mb-4">{column.title}</h3>}
            <div dangerouslySetInnerHTML={{ __html: column.content }} />
            {column.showSocialMedia && <SocialIcons className="mt-4" />}
          </div>
        );
        
      case 'links':
        return (
          <div>
            <h3 className="font-semibold mb-4">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link, i) => (
                <li key={i}>
                  <a 
                    href={link.url} 
                    className="hover:underline"
                    style={{ color: config.style.linkColor }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
        
      case 'contact':
        return (
          <div>
            <h3 className="font-semibold mb-4">{column.title}</h3>
            {column.showAddress && website?.contact?.address && (
              <address className="not-italic mb-2">
                {website.contact.address.street}<br />
                {website.contact.address.zip} {website.contact.address.city}
              </address>
            )}
            {column.showPhone && website?.contact?.phone && (
              <p className="mb-1">
                <a href={`tel:${website.contact.phone}`}>
                  Tel: {website.contact.phone}
                </a>
              </p>
            )}
            {column.showEmail && website?.contact?.email && (
              <p>
                <a href={`mailto:${website.contact.email}`}>
                  {website.contact.email}
                </a>
              </p>
            )}
          </div>
        );
        
      case 'hours':
        return (
          <div>
            <h3 className="font-semibold mb-4">{column.title}</h3>
            <OpeningHoursList compact />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <footer 
      style={{ 
        backgroundColor: config.style.backgroundColor,
        color: config.style.textColor 
      }}
      role="contentinfo"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {config.columns.map((column) => (
            <div key={column.id}>
              {renderColumn(column)}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="border-t py-4"
        style={{ borderColor: config.style.dividerColor }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">{config.copyright.text}</p>
          <nav aria-label="Rechtliche Links">
            <ul className="flex gap-4 text-sm">
              {config.legal.links.map((link, i) => (
                <li key={i}>
                  <a href={link.url} className="hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};
```

### 2.3 Footer mit Karte

**Beschreibung:** Footer mit integrierter Google Maps Karte.

**Priorität:** NIEDRIG

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌───────────────────────┐    Kontakt            Öffnungszeiten         │
│  │                       │                                              │
│  │     [Google Map]      │    Musterstr. 1       Mo-Fr: 9-18 Uhr        │
│  │                       │    12345 Stadt        Sa: 9-14 Uhr           │
│  │                       │    Tel: 0123/456      So: geschlossen        │
│  └───────────────────────┘                                              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  © 2026 Salon Name          Impressum · Datenschutz                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**WICHTIG:** 
- Google Maps nur nach Cookie-Consent laden
- Fallback: Statisches Bild oder Link zu Google Maps

---

## 3. Gemeinsame Komponenten

### 3.1 SocialIcons Komponente

```typescript
// src/components/common/SocialIcons.tsx

interface SocialIconsProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'icons-only' | 'with-background' | 'with-border';
  className?: string;
}

const SOCIAL_PLATFORMS = [
  { key: 'facebook', icon: Facebook, label: 'Facebook', color: '#1877F2' },
  { key: 'instagram', icon: Instagram, label: 'Instagram', color: '#E4405F' },
  { key: 'tiktok', icon: Music, label: 'TikTok', color: '#000000' },
  { key: 'youtube', icon: Youtube, label: 'YouTube', color: '#FF0000' },
  { key: 'twitter', icon: Twitter, label: 'Twitter/X', color: '#1DA1F2' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: '#0A66C2' },
  { key: 'pinterest', icon: Pin, label: 'Pinterest', color: '#BD081C' },
  { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: '#25D366' },
  { key: 'telegram', icon: Send, label: 'Telegram', color: '#0088CC' },
  { key: 'yelp', icon: Star, label: 'Yelp', color: '#D32323' },
  { key: 'googleBusiness', icon: MapPin, label: 'Google Business', color: '#4285F4' },
];

export const SocialIcons: React.FC<SocialIconsProps> = ({ 
  size = 'medium', 
  variant = 'icons-only',
  className 
}) => {
  const { website } = useWebsite();
  const socialLinks = website?.socialMedia || {};

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const activePlatforms = SOCIAL_PLATFORMS.filter(
    platform => socialLinks[platform.key]
  );

  if (activePlatforms.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {activePlatforms.map(platform => {
        const Icon = platform.icon;
        return (
          <a
            key={platform.key}
            href={socialLinks[platform.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Besuchen Sie uns auf ${platform.label}`}
            className={`
              transition-colors hover:opacity-80
              ${variant === 'with-background' ? 'p-2 rounded-full' : ''}
              ${variant === 'with-border' ? 'p-2 border rounded-full' : ''}
            `}
            style={variant === 'with-background' ? { backgroundColor: platform.color, color: '#fff' } : {}}
          >
            <Icon className={sizeClasses[size]} />
          </a>
        );
      })}
    </div>
  );
};
```

### 3.2 Logo Komponente

```typescript
// src/components/common/Logo.tsx

interface LogoProps {
  config: HeaderConfig['logo'];
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ config, className }) => {
  const { website } = useWebsite();

  if (config.type === 'image' && config.imageUrl) {
    return (
      <img 
        src={config.imageUrl}
        alt={website?.settings?.businessName || 'Logo'}
        style={{ maxHeight: `${config.maxHeight}px` }}
        className={`h-auto ${className}`}
      />
    );
  }

  if (config.type === 'text') {
    return (
      <span className={`text-xl font-bold ${className}`}>
        {config.text || website?.settings?.businessName}
      </span>
    );
  }

  if (config.type === 'logo-designer' && config.logoId) {
    const logo = website?.logos?.find(l => l.id === config.logoId);
    if (logo) {
      return <LogoSvg logo={logo} maxHeight={config.maxHeight} />;
    }
  }

  return null;
};
```

### 3.3 Mobile Menu Komponente

```typescript
// src/components/common/MobileMenu.tsx

interface MobileMenuProps {
  isOpen: boolean;
  config: HeaderConfig;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, config, onClose }) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuStyles = {
    fullscreen: 'fixed inset-0 bg-white flex flex-col',
    'slide-right': 'fixed top-0 right-0 h-full w-80 bg-white shadow-xl',
    'slide-left': 'fixed top-0 left-0 h-full w-80 bg-white shadow-xl',
    dropdown: 'absolute top-full left-0 right-0 bg-white shadow-lg'
  };

  return (
    <div
      id="mobile-menu"
      className={`
        lg:hidden z-50 transition-all duration-300
        ${menuStyles[config.mobile.menuStyle]}
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      style={{ 
        backgroundColor: config.style.backgroundColor,
        color: config.style.textColor
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Navigationsmenü"
    >
      {/* Close Button (for fullscreen/slide) */}
      {config.mobile.menuStyle !== 'dropdown' && (
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            aria-label="Menü schließen"
            className="p-2"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center justify-center">
        <ul className="space-y-6 text-center">
          {config.navigation.filter(n => n.visible).map((item) => (
            <li key={item.id}>
              <a
                href={item.target}
                onClick={onClose}
                className="text-xl font-medium hover:opacity-70 transition"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: Social + CTA */}
      <div className="p-6 text-center space-y-4">
        {config.cta?.enabled && (
          <button
            onClick={() => {
              handleButtonAction(config.cta.action);
              onClose();
            }}
            className="w-full px-6 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: config.cta.style.backgroundColor,
              color: config.cta.style.textColor
            }}
          >
            {config.cta.text}
          </button>
        )}
        
        {config.socialMedia.enabled && (
          <SocialIcons size="medium" className="justify-center" />
        )}
      </div>
    </div>
  );
};
```

---

## 4. Implementierung

### 4.1 Header-Editor

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header bearbeiten                                           [Vorschau] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Variante auswählen:                                                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  ┌─────────┐  │  │  ┌─────────┐  │  │  ┌─────────┐  │               │
│  │  │Logo  Nav│  │  │  │  Logo   │  │  │  │Logo  ☰ │  │               │
│  │  └─────────┘  │  │  │   Nav   │  │  │  └─────────┘  │               │
│  │   Classic     │  │  │  └─────┘  │  │  │  Hamburger   │               │
│  │      ●        │  │  │ Centered │  │  │      ○        │               │
│  │               │  │  │    ○     │  │  │               │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Logo                                                      [−]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ Typ:        ○ Bild  ● Logo-Designer  ○ Text                     │   │
│  │ Logo:       [Salon Logo ▼]           [Logo-Designer öffnen]     │   │
│  │ Max-Höhe:   [====●============] 50px                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Navigation                                              [−]     │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  ☰ │ Start           │ Typ: Scroll │ Ziel: #hero    │ [👁] [🗑] │   │
│  │  ☰ │ Leistungen      │ Typ: Scroll │ Ziel: #services│ [👁] [🗑] │   │
│  │  ☰ │ Über uns        │ Typ: Seite  │ Ziel: /about   │ [👁] [🗑] │   │
│  │  ☰ │ Galerie         │ Typ: Scroll │ Ziel: #gallery │ [👁] [🗑] │   │
│  │  ☰ │ Kontakt         │ Typ: Scroll │ Ziel: #contact │ [👁] [🗑] │   │
│  │                                              [+ Menüpunkt]      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Call-to-Action Button                                   [−]     │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ [✓] Button anzeigen                                             │   │
│  │ Text:       [Termin buchen________________]                      │   │
│  │ Aktion:     [Telefon anrufen ▼]                                  │   │
│  │ Wert:       [+49 123 456789_______________]                      │   │
│  │ Stil:       [Theme Primary ▼]                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Verhalten                                               [−]     │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ [✓] Sticky Header (bleibt beim Scrollen sichtbar)               │   │
│  │     Erscheint nach: [====●========] 100px Scroll                │   │
│  │     Stil: ● Solid  ○ Glaseffekt (Blur)                          │   │
│  │                                                                  │   │
│  │ [ ] Transparenter Header (über Hero)                            │   │
│  │     [ ] Helle Schrift (für dunkle Hintergründe)                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Farben & Stil                                           [−]     │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ Hintergrund:    [#FFFFFF] [🎨]                                  │   │
│  │ Text:           [#1F2937] [🎨]                                  │   │
│  │ Höhe:           [====●========] 80px                            │   │
│  │ Schatten:       ○ Keiner  ● Klein  ○ Mittel                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                           [Abbrechen] [Speichern]      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Dateistruktur

```
src/
├── components/
│   ├── admin/
│   │   ├── HeaderEditor/
│   │   │   ├── index.tsx           # Haupt-Editor
│   │   │   ├── VariantSelector.tsx # Varianten-Auswahl
│   │   │   ├── LogoConfig.tsx      # Logo-Einstellungen
│   │   │   ├── NavigationEditor.tsx# Menüpunkte bearbeiten
│   │   │   ├── CTAConfig.tsx       # Button-Einstellungen
│   │   │   └── BehaviorConfig.tsx  # Sticky/Transparent
│   │   └── FooterEditor/
│   │       ├── index.tsx
│   │       ├── VariantSelector.tsx
│   │       ├── ColumnEditor.tsx
│   │       └── LegalLinksEditor.tsx
│   ├── blocks/
│   │   ├── HeaderClassic.tsx
│   │   ├── HeaderCentered.tsx
│   │   ├── HeaderHamburger.tsx
│   │   ├── FooterMinimal.tsx
│   │   ├── FooterFourColumn.tsx
│   │   └── FooterWithMap.tsx
│   └── common/
│       ├── Logo.tsx
│       ├── SocialIcons.tsx
│       ├── MobileMenu.tsx
│       └── NavItem.tsx
└── types/
    ├── Header.ts
    └── Footer.ts
```

### 4.3 Implementierungs-Reihenfolge

1. **TypeScript-Typen** definieren (`Header.ts`, `Footer.ts`)
2. **Gemeinsame Komponenten** erstellen (`Logo`, `SocialIcons`, `MobileMenu`)
3. **HeaderClassic** implementieren (Basis für alle)
4. **HeaderCentered** implementieren
5. **HeaderHamburger** implementieren
6. **Header-Editor** erstellen
7. **FooterFourColumn** implementieren
8. **FooterMinimal** implementieren
9. **Footer-Editor** erstellen
10. **FooterWithMap** implementieren (niedrige Prio)

### 4.4 Checkliste für Header/Footer

- [ ] TypeScript-Typen vollständig
- [ ] Responsive auf allen Viewports
- [ ] Barrierefreiheit (ARIA, Keyboard-Navigation)
- [ ] Sticky-Verhalten funktioniert
- [ ] Transparent-Modus funktioniert
- [ ] Mobile-Menü funktioniert
- [ ] Social-Icons korrekt verlinkt
- [ ] CTA-Button Aktionen funktionieren
- [ ] Logo-Designer Integration
- [ ] Editor vollständig
- [ ] Hilfe-Texte geschrieben
