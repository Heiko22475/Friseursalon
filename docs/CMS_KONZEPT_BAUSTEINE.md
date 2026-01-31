# BeautifulCMS - Bausteine (Building Blocks)

## Übersicht

Dieses Dokument beschreibt alle verfügbaren Bausteine (Building Blocks) des CMS, ihre Varianten, Konfigurationsoptionen und Implementierungsdetails.

---

## Inhaltsverzeichnis

1. [Block-Kategorien](#1-block-kategorien)
2. [Hero-Blöcke](#2-hero-blöcke)
3. [Card-Blöcke](#3-card-blöcke)
4. [Galerie-Blöcke](#4-galerie-blöcke)
5. [Text-Blöcke](#5-text-blöcke)
6. [FAQ-Block](#6-faq-block)
7. [Statistik/Zahlen-Block](#7-statistikzahlen-block)
8. [Timeline-Block](#8-timeline-block)
9. [Video-Block](#9-video-block)
10. [Maps-Block](#10-maps-block)
11. [Call-to-Action-Block](#11-call-to-action-block)
12. [Countdown-Block](#12-countdown-block)
13. [Grid-Container-Block](#13-grid-container-block)

---

## 1. Block-Kategorien

### 1.1 Kategorisierung für Block-Auswahl

```typescript
const BLOCK_CATEGORIES = [
  {
    id: 'hero',
    name: 'Hero & Banner',
    icon: 'Image',
    description: 'Große Bilderbereiche für den Seitenstart',
    blocks: ['hero-v2']
  },
  {
    id: 'content',
    name: 'Inhalt & Text',
    icon: 'FileText',
    description: 'Textinhalte und statische Bereiche',
    blocks: ['static-content', 'about', 'faq']
  },
  {
    id: 'cards',
    name: 'Karten & Listen',
    icon: 'LayoutGrid',
    description: 'Karten-Layouts für Teams, Services, etc.',
    blocks: ['card-team', 'card-service', 'card-testimonial', 'card-feature', 'card-pricing', 'card-blog']
  },
  {
    id: 'gallery',
    name: 'Galerien & Medien',
    icon: 'Images',
    description: 'Bildergalerien in verschiedenen Layouts',
    blocks: ['gallery-grid', 'gallery-masonry', 'gallery-slider', 'gallery-lightbox', 'gallery-video']
  },
  {
    id: 'interactive',
    name: 'Interaktiv',
    icon: 'MousePointer',
    description: 'Interaktive Elemente und Formulare',
    blocks: ['contact-form', 'countdown', 'cta']
  },
  {
    id: 'info',
    name: 'Informationen',
    icon: 'Info',
    description: 'Öffnungszeiten, Kontakt, etc.',
    blocks: ['hours', 'contact', 'map', 'statistics', 'timeline']
  },
  {
    id: 'layout',
    name: 'Layout & Struktur',
    icon: 'Layout',
    description: 'Container und Grid-Layouts',
    blocks: ['grid']
  }
];
```

### 1.2 Block-Auswahl-Dialog mit Vorschaubildern

```
┌─────────────────────────────────────────────────────────────────┐
│  Block hinzufügen                                         [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Hero & Banner] [Inhalt] [Karten] [Galerien] [Interaktiv] ... │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │ │
│  │  │ [Preview] │  │  │  │ [Preview] │  │  │  │ [Preview] │  │ │
│  │  │   Bild    │  │  │  │   Bild    │  │  │  │   Bild    │  │ │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │ │
│  │  Hero V2        │  │  Team-Cards     │  │  Galerie Grid   │ │
│  │  ────────────── │  │  ────────────── │  │  ────────────── │ │
│  │  Großes Banner  │  │  Mitarbeiter    │  │  Bildergalerie  │ │
│  │  mit Overlay    │  │  vorstellen     │  │  als Raster     │ │
│  │  [Hinzufügen]   │  │  [Hinzufügen]   │  │  [Hinzufügen]   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Implementierung Block-Auswahl:**

```typescript
// src/components/admin/BlockSelector.tsx

interface BlockDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;  // URL zum Vorschaubild
  canRepeat: boolean;
  defaultConfig: any;
}

const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    id: 'hero-v2',
    name: 'Hero V2',
    description: 'Großes Banner mit Hintergrundbild, Overlay, Logos, Texten und Buttons. Vollständig responsive.',
    category: 'hero',
    previewImage: '/images/blocks/hero-v2-preview.png',
    canRepeat: true,
    defaultConfig: createDefaultHeroV2Config()
  },
  {
    id: 'card-team',
    name: 'Team-Karten',
    description: 'Stellen Sie Ihr Team vor mit Fotos, Namen, Positionen und Social-Media-Links.',
    category: 'cards',
    previewImage: '/images/blocks/card-team-preview.png',
    canRepeat: true,
    defaultConfig: createDefaultTeamCardConfig()
  },
  // ... weitere Blöcke
];
```

---

## 2. Hero-Blöcke

### 2.1 Hero V2 (✅ IMPLEMENTIERT)

**Status:** Fertig implementiert in `src/components/blocks/HeroV2.tsx`

**Funktionen:**
- Vollflächiges Hintergrundbild
- Positionierbares Bild (X/Y %)
- Overlay mit Farbe und Transparenz
- Responsive Höhe pro Viewport
- Logos aus Logo-Designer (skalierbar, positionierbar)
- Mehrzeilige Texte (Font, Größe, Farbe, Position)
- Buttons mit 4 Action-Typen (Link, Scroll, Telefon, Email)
- Viewport-Vererbung (Desktop → Tablet → Mobile)
- Elemente können "below image" angezeigt werden

**Dateien:**
- `src/types/HeroV2.ts` - TypeScript-Definitionen
- `src/components/admin/HeroV2Editor.tsx` - Editor
- `src/components/blocks/HeroV2.tsx` - Renderer

---

## 3. Card-Blöcke

### 3.1 Gemeinsame Card-Struktur

Alle Card-Typen teilen eine gemeinsame Basis-Struktur:

```typescript
// src/types/Card.ts

interface CardBase {
  id: string;
  visible: boolean;
  order: number;
}

interface CardBlockConfig {
  variant: CardVariant;
  columns: ResponsiveNumber;  // 1-4 Spalten
  gap: ResponsiveNumber;      // Abstand in px
  cards: CardItem[];
  style: CardStyle;
}

interface CardStyle {
  backgroundColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  shadow: 'none' | 'small' | 'medium' | 'large';
  padding: 'small' | 'medium' | 'large';
  hoverEffect: 'none' | 'lift' | 'scale' | 'glow';
}

type CardVariant = 'team' | 'service' | 'testimonial' | 'feature' | 'pricing' | 'blog';
```

### 3.2 Team-Cards

**Verwendung:** Mitarbeiter/Team vorstellen

```typescript
interface TeamCard extends CardBase {
  image: string;           // Profilbild
  name: string;            // Name
  position: string;        // Position/Rolle
  description?: string;    // Kurze Bio (optional)
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
}
```

**Visuelles Layout:**

```
┌──────────────────────┐
│   ┌──────────────┐   │
│   │              │   │
│   │    [Foto]    │   │
│   │              │   │
│   └──────────────┘   │
│                      │
│    Maria Müller      │  ← Name (fett)
│    Friseurmeisterin  │  ← Position (kleiner)
│                      │
│    Spezialisiert auf │  ← Beschreibung (optional)
│    Balayage und...   │
│                      │
│    [f] [in] [📧]     │  ← Social Icons
└──────────────────────┘
```

**Editor-Felder:**

| Feld | Typ | Beschreibung | Hilfe-Text |
|------|-----|--------------|------------|
| Bild | MediaPicker | Profilbild auswählen | "Wählen Sie ein professionelles Foto. Empfohlenes Format: Quadratisch, mindestens 400x400px." |
| Name | Text | Vollständiger Name | "Der Name, wie er angezeigt werden soll." |
| Position | Text | Berufsbezeichnung | "z.B. 'Friseurmeisterin', 'Junior Stylist'" |
| Beschreibung | Textarea | Kurze Bio | "Optional: Eine kurze Beschreibung der Person (max. 150 Zeichen empfohlen)." |
| Facebook | URL | Facebook-Profil | "Link zum Facebook-Profil (optional)" |
| Instagram | URL | Instagram-Profil | "Link zum Instagram-Profil (optional)" |
| LinkedIn | URL | LinkedIn-Profil | "Link zum LinkedIn-Profil (optional)" |
| E-Mail | Email | E-Mail-Adresse | "E-Mail-Adresse für direkten Kontakt (optional)" |

### 3.3 Service-Cards

**Verwendung:** Dienstleistungen präsentieren

```typescript
interface ServiceCard extends CardBase {
  icon: IconConfig;        // Lucide Icon
  title: string;           // Titel
  description: string;     // Beschreibung
  price?: string;          // Preis (optional)
  duration?: string;       // Dauer (optional)
  button?: {
    text: string;
    action: ButtonAction;
  };
}
```

**Visuelles Layout:**

```
┌──────────────────────┐
│                      │
│        [Icon]        │  ← Lucide Icon mit Hintergrund
│                      │
│     Damenhaarschnitt │  ← Titel
│     ─────────────────│
│     Waschen, Schneiden│  ← Beschreibung
│     und Föhnen für   │
│     alle Haarlängen  │
│                      │
│     ab 35€ · 45 Min  │  ← Preis & Dauer
│                      │
│   [  Termin buchen  ]│  ← Button (optional)
└──────────────────────┘
```

### 3.4 Testimonial-Cards

**Verwendung:** Kundenbewertungen anzeigen

```typescript
interface TestimonialCard extends CardBase {
  quote: string;           // Zitat
  authorName: string;      // Name des Kunden
  authorTitle?: string;    // z.B. "Stammkundin seit 2020"
  authorImage?: string;    // Bild (optional)
  rating: number;          // 1-5 Sterne
  date?: string;           // Datum der Bewertung
  source?: 'google' | 'facebook' | 'yelp' | 'manual';
}
```

**Visuelles Layout:**

```
┌──────────────────────┐
│                      │
│  ★★★★★              │  ← Sternebewertung
│                      │
│  "Ich komme seit     │  ← Zitat
│  Jahren hierher und  │
│  bin immer begeistert│
│  von den Ergebnissen"│
│                      │
│  ┌──┐                │
│  │👤│ Anna Schmidt   │  ← Autor mit Bild
│  └──┘ Stammkundin    │
│       seit 2020      │
│                      │
│  📍 Google Review    │  ← Quelle (optional)
└──────────────────────┘
```

### 3.5 Feature-Cards

**Verwendung:** Vorteile/Features hervorheben

```typescript
interface FeatureCard extends CardBase {
  icon: IconConfig;
  title: string;
  description: string;
  highlight?: boolean;  // Hervorgehoben?
}
```

**Visuelles Layout:**

```
┌──────────────────────┐
│                      │
│     [Icon]           │
│                      │
│  Kostenlose Beratung │  ← Titel
│  ─────────────────── │
│  Wir nehmen uns Zeit │  ← Beschreibung
│  für eine ausführliche│
│  Typberatung vor     │
│  jedem Termin.       │
│                      │
└──────────────────────┘
```

### 3.6 Pricing-Cards

**Verwendung:** Preislisten/Pakete anzeigen

```typescript
interface PricingCard extends CardBase {
  title: string;           // Paketname
  subtitle?: string;       // z.B. "Am beliebtesten"
  price: string;           // z.B. "49€" oder "ab 35€"
  priceUnit?: string;      // z.B. "/Monat" oder ""
  features: {
    text: string;
    included: boolean;
  }[];
  highlighted: boolean;    // Hervorgehoben?
  button: {
    text: string;
    action: ButtonAction;
  };
}
```

**Visuelles Layout:**

```
┌──────────────────────┐
│   ⭐ Am beliebtesten │  ← Highlight-Badge
├──────────────────────┤
│                      │
│    Premium-Paket     │  ← Titel
│                      │
│       89€            │  ← Preis
│     einmalig         │
│                      │
│  ✓ Waschen           │  ← Features
│  ✓ Schneiden         │
│  ✓ Föhnen            │
│  ✓ Styling           │
│  ✗ Färben            │  ← Nicht enthalten
│                      │
│  [    Buchen    ]    │  ← Button
└──────────────────────┘
```

### 3.7 Blog-Cards

**Verwendung:** Blogbeiträge/Neuigkeiten

```typescript
interface BlogCard extends CardBase {
  image: string;
  title: string;
  excerpt: string;         // Kurzer Auszug
  date: string;
  author?: string;
  category?: string;
  readMoreLink: string;
}
```

**Visuelles Layout:**

```
┌──────────────────────┐
│ ┌──────────────────┐ │
│ │                  │ │
│ │   [Titelbild]    │ │
│ │                  │ │
│ └──────────────────┘ │
│  Haarpflege-Tipps    │  ← Kategorie
│                      │
│  5 Tipps für         │  ← Titel
│  glänzendes Haar     │
│  ──────────────────  │
│  Entdecken Sie       │  ← Auszug
│  unsere besten...    │
│                      │
│  📅 15.01.2026       │  ← Datum
│                      │
│  [  Weiterlesen  ]   │  ← Button
└──────────────────────┘
```

### 3.8 Card-Block Editor

**Editor-Struktur:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Card-Block bearbeiten                               [Vorschau] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Variante: [Team-Cards ▼]                                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Layout                                            [−]   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Spalten:    [Desktop: 4 ▼] [Tablet: 2 ▼] [Mobile: 1 ▼] │   │
│  │ Abstand:    [24px ▼]                                    │   │
│  │ Ausrichtung:[Zentriert ▼]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Stil                                              [−]   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Hintergrund:   [#FFFFFF] [Farbwähler]                   │   │
│  │ Ecken:         ○ Keine ○ Klein ● Mittel ○ Groß          │   │
│  │ Schatten:      ○ Keine ○ Klein ● Mittel ○ Groß          │   │
│  │ Hover-Effekt:  [Anheben ▼]                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Karten (4)                                  [+ Hinzufügen]│  │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ☰ │ 👤 Maria Müller - Friseurmeisterin    [👁] [✎] [🗑]│   │
│  │  ☰ │ 👤 Tom Schmidt - Senior Stylist       [👁] [✎] [🗑]│   │
│  │  ☰ │ 👤 Lisa Weber - Coloristin            [👁] [✎] [🗑]│   │
│  │  ☰ │ 👤 Jan Becker - Azubi                 [👁] [✎] [🗑]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                           [Abbrechen] [Speichern]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Galerie-Blöcke

### 4.1 Gemeinsame Galerie-Struktur

```typescript
// src/types/Gallery.ts

interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  alt: string;           // WICHTIG für Barrierefreiheit!
  title?: string;
  description?: string;
  order: number;
}

interface GalleryBlockConfig {
  variant: GalleryVariant;
  images: GalleryImage[];
  style: GalleryStyle;
  lightbox: boolean;     // Großansicht beim Klick?
}

type GalleryVariant = 'grid' | 'masonry' | 'slider' | 'lightbox' | 'video';
```

### 4.2 Grid-Galerie (✅ EXISTIERT - erweitern)

**Beschreibung:** Gleichmäßiges Raster mit identischen Bildgrößen

```typescript
interface GridGalleryConfig extends GalleryBlockConfig {
  variant: 'grid';
  columns: ResponsiveNumber;  // 2-6 Spalten
  aspectRatio: '1:1' | '4:3' | '16:9' | '3:4';
  gap: number;
}
```

**Layout:**

```
┌─────┬─────┬─────┬─────┐
│     │     │     │     │
│  1  │  2  │  3  │  4  │
│     │     │     │     │
├─────┼─────┼─────┼─────┤
│     │     │     │     │
│  5  │  6  │  7  │  8  │
│     │     │     │     │
└─────┴─────┴─────┴─────┘
```

### 4.3 Masonry-Galerie

**Beschreibung:** Pinterest-artiges Layout mit unterschiedlichen Höhen

```typescript
interface MasonryGalleryConfig extends GalleryBlockConfig {
  variant: 'masonry';
  columns: ResponsiveNumber;  // 2-5 Spalten
  gap: number;
}
```

**Layout:**

```
┌─────┬─────┬─────┐
│     │     │     │
│  1  │  2  │     │
│     │     │  3  │
├─────┤     │     │
│     ├─────┤     │
│  4  │     ├─────┤
│     │  5  │     │
├─────┤     │  6  │
│  7  │     │     │
└─────┴─────┴─────┘
```

**Implementierung:**

```typescript
// Verwendung von CSS columns oder einer Library wie react-masonry-css

import Masonry from 'react-masonry-css';

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ config }) => {
  const breakpointColumns = {
    default: config.columns.desktop,
    1024: config.columns.tablet,
    768: config.columns.mobile
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-column"
    >
      {config.images.map((image) => (
        <div key={image.id} className="mb-4">
          <img
            src={image.url}
            alt={image.alt}
            className="w-full rounded-lg"
            loading="lazy"
          />
        </div>
      ))}
    </Masonry>
  );
};
```

### 4.4 Slider-Galerie

**Beschreibung:** Horizontales Karussell zum Durchblättern

```typescript
interface SliderGalleryConfig extends GalleryBlockConfig {
  variant: 'slider';
  autoplay: boolean;
  autoplaySpeed: number;  // ms
  showArrows: boolean;
  showDots: boolean;
  slidesToShow: ResponsiveNumber;
  infinite: boolean;
}
```

**Layout:**

```
          ┌─────────────────────────────────────────┐
          │                                         │
    [<]   │   [Bild 1]   [Bild 2]   [Bild 3]       │   [>]
          │                                         │
          └─────────────────────────────────────────┘
                        ● ○ ○ ○ ○
```

**Implementierung:**

```typescript
// Verwendung von Swiper oder einer ähnlichen Library

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const SliderGallery: React.FC<SliderGalleryProps> = ({ config }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation={config.showArrows}
      pagination={config.showDots ? { clickable: true } : false}
      autoplay={config.autoplay ? { delay: config.autoplaySpeed } : false}
      loop={config.infinite}
      slidesPerView={config.slidesToShow.mobile}
      breakpoints={{
        768: { slidesPerView: config.slidesToShow.tablet },
        1024: { slidesPerView: config.slidesToShow.desktop }
      }}
    >
      {config.images.map((image) => (
        <SwiperSlide key={image.id}>
          <img src={image.url} alt={image.alt} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
```

### 4.5 Lightbox-Galerie

**Beschreibung:** Thumbnails mit Vollbild-Ansicht beim Klick

```typescript
interface LightboxGalleryConfig extends GalleryBlockConfig {
  variant: 'lightbox';
  thumbnailColumns: ResponsiveNumber;
  thumbnailAspectRatio: '1:1' | '4:3';
  showCaptions: boolean;
  enableZoom: boolean;
  enableSlideshow: boolean;
}
```

**Implementierung:**

```typescript
// Verwendung von yet-another-react-lightbox oder ähnlich

import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Captions from 'yet-another-react-lightbox/plugins/captions';

const LightboxGallery: React.FC<LightboxGalleryProps> = ({ config }) => {
  const [index, setIndex] = useState(-1);
  
  const slides = config.images.map(img => ({
    src: img.url,
    alt: img.alt,
    title: img.title,
    description: img.description
  }));

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-4">
        {config.images.map((image, i) => (
          <button
            key={image.id}
            onClick={() => setIndex(i)}
            className="cursor-pointer"
            aria-label={`${image.alt} - Klicken zum Vergrößern`}
          >
            <img src={image.thumbnail || image.url} alt={image.alt} />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[
          ...(config.enableZoom ? [Zoom] : []),
          ...(config.enableSlideshow ? [Slideshow] : []),
          ...(config.showCaptions ? [Captions] : [])
        ]}
      />
    </>
  );
};
```

### 4.6 Video-Galerie

**Beschreibung:** YouTube/Vimeo Videos einbetten

```typescript
interface VideoItem {
  id: string;
  type: 'youtube' | 'vimeo';
  videoId: string;        // YouTube/Vimeo Video-ID
  title: string;
  thumbnail?: string;     // Custom Thumbnail (optional)
  description?: string;
}

interface VideoGalleryConfig extends GalleryBlockConfig {
  variant: 'video';
  videos: VideoItem[];
  columns: ResponsiveNumber;
  aspectRatio: '16:9' | '4:3';
  showTitles: boolean;
}
```

**Layout:**

```
┌─────────────────────┐  ┌─────────────────────┐
│  ┌───────────────┐  │  │  ┌───────────────┐  │
│  │               │  │  │  │               │  │
│  │   [▶ Play]    │  │  │  │   [▶ Play]    │  │
│  │               │  │  │  │               │  │
│  └───────────────┘  │  │  └───────────────┘  │
│  Salon-Rundgang     │  │  Styling-Tutorial   │
└─────────────────────┘  └─────────────────────┘
```

**WICHTIG für Barrierefreiheit:**
- Videos müssen mit dem Cookie-Consent verknüpft sein (externe Medien)
- Vor dem Laden des iframes muss die Zustimmung eingeholt werden
- Fallback: Link zum Video auf YouTube/Vimeo anzeigen

---

## 5. Text-Blöcke

### 5.1 Static Content (✅ EXISTIERT)

Bereits implementiert. Rich-Text-Editor für freie Inhalte.

### 5.2 About-Block (✅ EXISTIERT)

Bereits implementiert. Über-uns Sektion mit Bild und Text.

---

## 6. FAQ-Block

### 6.1 Beschreibung

Häufig gestellte Fragen als Akkordeon (aufklappbar).

### 6.2 TypeScript-Definition

```typescript
// src/types/FAQ.ts

interface FAQItem {
  id: string;
  question: string;
  answer: string;  // HTML erlaubt
  order: number;
  expanded?: boolean;  // Default-Zustand
}

interface FAQBlockConfig {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  style: {
    variant: 'simple' | 'bordered' | 'card';
    allowMultiple: boolean;  // Mehrere gleichzeitig offen?
    iconPosition: 'left' | 'right';
    iconStyle: 'plus' | 'arrow' | 'chevron';
  };
  schema: boolean;  // Schema.org FAQ Markup generieren?
}
```

### 6.3 Visuelles Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                 Häufig gestellte Fragen                     │
│                 ─────────────────────────                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ▼  Brauche ich einen Termin?                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │    Ja, wir empfehlen eine vorherige Terminverein-   │   │
│  │    barung. So können wir sicherstellen, dass wir    │   │
│  │    genug Zeit für Sie haben.                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ▶  Wie lange dauert ein Haarschnitt?                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ▶  Welche Zahlungsmethoden akzeptieren Sie?         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Implementierung

```typescript
// src/components/blocks/FAQAccordion.tsx

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';

const FAQAccordion: React.FC<FAQAccordionProps> = ({ config }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(config.items.filter(i => i.expanded).map(i => i.id))
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!config.style.allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  const Icon = config.style.iconStyle === 'plus' 
    ? (open: boolean) => open ? <Minus /> : <Plus />
    : (open: boolean) => open ? <ChevronDown /> : <ChevronRight />;

  return (
    <section aria-label="Häufig gestellte Fragen">
      {config.title && <h2>{config.title}</h2>}
      
      <div className="space-y-2">
        {config.items.map((item) => {
          const isOpen = openItems.has(item.id);
          return (
            <div key={item.id} className="border rounded-lg">
              <button
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium">{item.question}</span>
                {Icon(isOpen)}
              </button>
              
              <div
                id={`faq-answer-${item.id}`}
                role="region"
                aria-labelledby={`faq-question-${item.id}`}
                hidden={!isOpen}
                className="px-4 pb-4"
              >
                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Schema.org Markup für SEO */}
      {config.schema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": config.items.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer.replace(/<[^>]*>/g, '')  // HTML entfernen
              }
            }))
          })}
        </script>
      )}
    </section>
  );
};
```

---

## 7. Statistik/Zahlen-Block

### 7.1 Beschreibung

Animierte Zahlen zur Darstellung von Erfolgen/Statistiken.

### 7.2 TypeScript-Definition

```typescript
interface StatisticItem {
  id: string;
  value: number;
  suffix?: string;      // z.B. "+", "%", "€"
  prefix?: string;      // z.B. ">" 
  label: string;        // z.B. "Zufriedene Kunden"
  icon?: IconConfig;
}

interface StatisticsBlockConfig {
  title?: string;
  items: StatisticItem[];
  style: {
    columns: ResponsiveNumber;
    animate: boolean;      // Counter-Animation?
    animationDuration: number;
    showIcon: boolean;
    variant: 'simple' | 'card' | 'icon-top' | 'icon-left';
  };
}
```

### 7.3 Visuelles Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│        ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐│
│        │  500+  │    │   15   │    │  100%  │    │   4.9  ││
│        │ Kunden │    │ Jahre  │    │Zufrieden│    │ ★★★★★ ││
│        └────────┘    └────────┘    └────────┘    └────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Timeline-Block

### 8.1 Beschreibung

Zeitleiste für Geschichte, Meilensteine, Prozessschritte.

### 8.2 TypeScript-Definition

```typescript
interface TimelineItem {
  id: string;
  year?: string;         // z.B. "2010"
  title: string;
  description: string;
  image?: string;
  icon?: IconConfig;
}

interface TimelineBlockConfig {
  title?: string;
  items: TimelineItem[];
  style: {
    variant: 'vertical' | 'horizontal';
    lineColor: string;
    dotColor: string;
    alternating: boolean;  // Links/Rechts wechselnd
  };
}
```

### 8.3 Visuelles Layout (Vertikal)

```
       2010                      2015                      2020
         │                         │                         │
    ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
    │         │               │         │               │         │
    │ Gründung│               │ Umzug   │               │ Erweite-│
    │         │               │         │               │  rung   │
    └─────────┘               └─────────┘               └─────────┘
```

---

## 9. Video-Block

### 9.1 Beschreibung

Einzelnes Video einbetten (YouTube/Vimeo).

### 9.2 TypeScript-Definition

```typescript
interface VideoBlockConfig {
  type: 'youtube' | 'vimeo' | 'local';
  videoId?: string;       // für YouTube/Vimeo
  videoUrl?: string;      // für lokale Videos
  poster?: string;        // Vorschaubild
  title: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  aspectRatio: '16:9' | '4:3' | '21:9';
  maxWidth?: string;      // z.B. "800px"
}
```

**WICHTIG:** Consent-Prüfung vor dem Laden externer Videos!

---

## 10. Maps-Block

### 10.1 Beschreibung

Google Maps Standort anzeigen.

### 10.2 TypeScript-Definition

```typescript
interface MapsBlockConfig {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zoom: number;           // 10-18
  height: ResponsiveString;
  style: 'roadmap' | 'satellite' | 'hybrid';
  showMarker: boolean;
  markerTitle?: string;
}
```

**WICHTIG:** Consent-Prüfung vor dem Laden von Google Maps!

---

## 11. Call-to-Action-Block

### 11.1 Beschreibung

Auffälliger Bereich mit Handlungsaufforderung.

### 11.2 TypeScript-Definition

```typescript
interface CTABlockConfig {
  title: string;
  subtitle?: string;
  buttons: HeroButton[];   // Gleiche Button-Struktur wie Hero V2
  background: {
    type: 'color' | 'gradient' | 'image';
    color?: string;
    gradient?: {
      from: string;
      to: string;
      direction: 'to-right' | 'to-bottom' | 'to-br';
    };
    image?: string;
    overlay?: {
      color: string;
      opacity: number;
    };
  };
  alignment: 'left' | 'center' | 'right';
  padding: ResponsiveString;
}
```

### 11.3 Visuelles Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░  Bereit für Ihren neuen Look?  ░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░  [Termin vereinbaren] [Kontakt]  ░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Countdown-Block

### 12.1 Beschreibung

Countdown für Events, Eröffnungen, Aktionen.

### 12.2 TypeScript-Definition

```typescript
interface CountdownBlockConfig {
  targetDate: string;      // ISO Date
  title?: string;
  subtitle?: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  expiredMessage: string;  // Text nach Ablauf
  style: {
    variant: 'simple' | 'flip' | 'circle';
    size: 'small' | 'medium' | 'large';
  };
}
```

### 12.3 Visuelles Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🎉 Große Neueröffnung in:                      │
│                                                             │
│      ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐             │
│      │ 12  │    │ 05  │    │ 32  │    │ 48  │             │
│      │Tage │    │ Std │    │ Min │    │ Sek │             │
│      └─────┘    └─────┘    └─────┘    └─────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Grid-Container-Block (✅ EXISTIERT)

Bereits implementiert. Container für andere Blöcke in Spalten-Layout.

---

## Implementierungs-Reihenfolge

1. **Card-Block** (alle 6 Varianten)
2. **Galerie-Varianten** (Masonry, Slider, Lightbox, Video)
3. **FAQ-Block**
4. **CTA-Block**
5. **Statistik-Block**
6. **Timeline-Block**
7. **Video-Block**
8. **Maps-Block**
9. **Countdown-Block**

---

## Checkliste für jeden Block

- [ ] TypeScript-Typen definieren
- [ ] Editor-Komponente erstellen
- [ ] Renderer-Komponente erstellen
- [ ] Block in Registry registrieren
- [ ] Route in App.tsx hinzufügen
- [ ] Vorschaubild erstellen
- [ ] Hilfe-Texte schreiben
- [ ] Barrierefreiheit prüfen (WCAG 2.1 AA)
- [ ] Responsive testen (Desktop, Tablet, Mobile)
