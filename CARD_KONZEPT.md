# 🎴 Generic Card Konzept

## Problem-Analyse

Der bestehende CardServiceEditor verwendet ein **einfaches Textfeld** für das Icon (`<TextInput label="Icon (Lucide Name)" ... />`) anstatt des voll funktionsfähigen **IconPickers**, der bereits existiert.

**Vorhandene Komponenten:**
- ✅ `IconPicker.tsx` - Visueller Icon-Selektor mit Suche und Vorschau
- ✅ `IconEditor.tsx` - Vollständige Icon-Konfiguration (Größe, Farbe, Hintergrund)
- ⚠️ `CardServiceEditor.tsx` - Verwendet nur TextInput für Icon
- ⚠️ `CardTeamEditor.tsx` - Kein Icon-Support
- ⚠️ `CardTestimonialEditor.tsx` - Kein Icon-Support

---

## Lösungskonzept: GenericCard System

### 1. Einheitliche Generic Card Komponente

Eine **GenericCard** soll alle Karten-Typen abdecken können:

```
┌─────────────────────────────────────────────────────────────────┐
│                         EDITOR (links 60%)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📋 Karten-Inhalt                                            ││
│  │   • Titel (Text)                                            ││
│  │   • Beschreibung (Textarea)                                 ││
│  │   • Zusatzfelder je nach Typ                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🖼️ Medien                                                   ││
│  │   • Bild (aus Mediathek)                                    ││
│  │   • ODER Icon (IconPicker!)                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🎨 Karten-Styling                                           ││
│  │   • Hintergrundfarbe                                        ││
│  │   • Rahmenradius                                            ││
│  │   • Schatten                                                ││
│  │   • Padding                                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔤 Typografie                                               ││
│  │   • Titel: Größe, Farbe, Gewicht                           ││
│  │   • Beschreibung: Größe, Farbe                             ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                    LIVE PREVIEW (rechts 40%)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐                      │
│  │         📱 Karten-Vorschau           │                      │
│  │  ┌─────────────────────────────────┐ │                      │
│  │  │        [Icon/Bild]              │ │                      │
│  │  │                                 │ │                      │
│  │  │        Titel                    │ │                      │
│  │  │        Beschreibung...          │ │                      │
│  │  │        [Button]                 │ │                      │
│  │  └─────────────────────────────────┘ │                      │
│  │                                       │                      │
│  │  📐 Desktop | 📱 Tablet | 📱 Mobile  │                      │
│  └───────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Karten-Typen (Card Presets)

| Typ | Icon | Bild | Titel | Beschreibung | Preis | Rating | Button |
|-----|------|------|-------|--------------|-------|--------|--------|
| **Service** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Team** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Testimonial** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Feature** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Pricing** | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Generic** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### 3. Icon-Integration mit IconPicker

**Aktuell (fehlerhaft):**
```tsx
<TextInput
  label="Icon (Lucide Name)"
  value={item.icon || ''}
  onChange={(icon) => update({ icon })}
  placeholder="z.B. Scissors"
/>
```

**Neu (mit IconPicker):**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Icon auswählen
  </label>
  <IconPicker
    value={item.icon || 'Star'}
    onChange={(icon) => update({ icon })}
  />
</div>
```

---

### 4. Live Preview Komponente

Die Preview zeigt die Karte in Echtzeit an, wie sie auf der Website erscheinen wird:

```tsx
<CardPreview 
  config={currentConfig}
  viewport="desktop" | "tablet" | "mobile"
/>
```

**Features:**
- Viewport-Umschalter (Desktop/Tablet/Mobile)
- Echte Rendering-Engine (gleiche wie Frontend)
- Skalierte Darstellung im Editor

---

### 5. Implementierungs-Plan

#### Phase 1: IconPicker in bestehende Editoren integrieren ✅ ERLEDIGT
1. ✅ IconPicker existiert bereits
2. ✅ In CardServiceEditor eingebaut (TextInput → IconPicker)
3. 🔄 Icon-Styling mit IconEditor ermöglichen

#### Phase 2: MediaLibrary Single-Select Mode ✅ ERLEDIGT
1. ✅ `singleSelect` Prop zu MediaLibrary hinzugefügt
2. ✅ Nur ein Bild auswählbar wenn `singleSelect={true}`
3. ✅ "Übernehmen" und "Abbrechen" Buttons im Header
4. ✅ "Alle auswählen" Option ausgeblendet im Single-Select-Mode

#### Phase 3: GenericCardEditor ✅ ERLEDIGT
1. ✅ `GenericCardEditor.tsx` erstellt mit wiederverwendbaren Komponenten:
   - `EditorSection` - Klappbare Abschnitte
   - `ColorPicker` - Farbauswahl
   - `Select` - Dropdown-Auswahl
   - `TextInput` - Texteingabe (einzeilig & mehrzeilig)
   - `NumberInput` - Zahleneingabe
   - `Toggle` - Ein/Aus-Schalter
   - `ImagePicker` - Bildauswahl mit MediaLibrary (Single-Select)
   - `IconPickerField` - Icon-Auswahl mit IconPicker
   - `GenericCardEditorLayout` - Editor mit 60/40 Split und Live-Preview

2. ✅ Vordefinierte Select-Optionen:
   - `BORDER_RADIUS_OPTIONS`
   - `SHADOW_OPTIONS`
   - `SPACING_OPTIONS`
   - `FONT_SIZE_OPTIONS`
   - `FONT_WEIGHT_OPTIONS`
   - `HOVER_EFFECT_OPTIONS`
   - `IMAGE_ASPECT_OPTIONS`
   - `IMAGE_FIT_OPTIONS`

#### Phase 4: Weitere Card-Editoren anpassen 🔄
1. 🔄 CardTeamEditor mit GenericCardEditor-Komponenten
2. 🔄 CardTestimonialEditor mit GenericCardEditor-Komponenten

---

### 6. Verwendung des GenericCardEditorLayout

**Beispiel:**

```tsx
import {
  GenericCardEditorLayout,
  EditorSection,
  TextInput,
  ImagePicker,
  IconPickerField,
  ColorPicker,
  Toggle,
  Select,
  BORDER_RADIUS_OPTIONS
} from './GenericCardEditor';
import { Layout, Palette, Type } from 'lucide-react';

const MyCardEditor: React.FC = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <GenericCardEditorLayout
      title="Service-Karte bearbeiten"
      subtitle="Konfigurieren Sie Ihre Service-Karte"
      onBack={() => navigate('/admin')}
      onSave={handleSave}
      saving={saving}
      hasChanges={hasChanges}
      editorContent={
        <>
          <EditorSection title="Inhalt" icon={<Type className="w-4 h-4" />} defaultExpanded>
            <TextInput
              label="Titel"
              value={config.title}
              onChange={(title) => updateConfig({ title })}
            />
            <TextInput
              label="Beschreibung"
              value={config.description}
              onChange={(description) => updateConfig({ description })}
              multiline
            />
            <IconPickerField
              label="Icon"
              value={config.icon}
              onChange={(icon) => updateConfig({ icon })}
            />
            <ImagePicker
              label="Bild"
              value={config.image}
              onChange={(image) => updateConfig({ image })}
            />
          </EditorSection>

          <EditorSection title="Styling" icon={<Palette className="w-4 h-4" />}>
            <ColorPicker
              label="Hintergrundfarbe"
              value={config.backgroundColor}
              onChange={(backgroundColor) => updateConfig({ backgroundColor })}
            />
            <Select
              label="Rahmenradius"
              value={config.borderRadius}
              options={BORDER_RADIUS_OPTIONS}
              onChange={(borderRadius) => updateConfig({ borderRadius })}
            />
          </EditorSection>
        </>
      }
      previewContent={
        <MyCardPreview config={config} />
      }
    />
  );
};
```

---

## Erledigte Aufgaben

### Phase 1-3: Grundlegende Implementierung ✅
- ✅ IconPicker in CardServiceEditor integriert
- ✅ MediaLibrary um `singleSelect` Prop erweitert
- ✅ GenericCardEditor Komponenten erstellt
- ✅ Build erfolgreich

### Phase 4: Generic Card System - Vollständige Implementierung ✅

#### 4.1 Generic Card Datenmodell ✅
- ✅ **GenericCardItem Interface** mit allen Feldern:
  - Content: title, subtitle, description, overline
  - Media: image, icon
  - Pricing: price, originalPrice, priceUnit
  - Features: features[], tags[]
  - CTA: ctaText, ctaUrl
  - Social: socialLinks[]
  - Meta: highlighted, order

- ✅ **Styling Interfaces**:
  - `IconStyle` - Icon-Größe, Farbe, Hintergrund (Kreis/Abgerundet/Quadrat), Padding
  - `PriceStyle` - Position, Größe, Farben, Badge-Support
  - `RatingStyle` - Sterne/Zahlen/Herzen, Farben
  - `FeaturesStyle` - Icon, Layout (Liste/Inline/Grid)
  - `SocialStyle` - Icon-Stil (gefüllt/outline/ghost), Größe, Layout

- ✅ **Layout Variants**:
  - `vertical` - Bild/Icon oben, Content unten
  - `horizontal` - Bild/Icon links, Content rechts
  - `overlay` - Content über Bild
  - `minimal` - Nur Content, keine Medien

#### 4.2 Advanced Styling Features ✅
- ✅ **Typografie-Editor** mit FontPicker-Integration
  - Titel-Schrift, Body-Schrift, Gewichte konfigurierbar
  - Bereichsweite Typografie-Einstellung

- ✅ **Element-spezifisches Styling**:
  - `OverlineStyle` - Farbe, Größe, Margin, Font
  - `TitleStyle` - Farbe, Größe, Gewicht, Margin, Font
  - `SubtitleStyle` - Farbe, Größe, Margin, Font
  - `DescriptionStyle` - Farbe, Größe, Line-Clamp, Margin, Font
  
- ✅ **Bild-Styling**:
  - `ImageElementStyle` mit padding und marginBottom
  - Aspect-Ratio-Support (16:9, 4:3, 1:1, etc.)
  - Object-Fit-Optionen (cover, contain, fill)
  - Border-Radius mit intelligenter Logik:
    - **padding=0**: Border-Radius entspricht Karten-Border-Radius oben
    - **padding>0**: Eigener Border-Radius + berechneter Margin

- ✅ **Icon-Background-Styling**:
  - Hintergrund aktivierbar (ja/nein)
  - Form: Kreis, Quadrat, Abgerundet
  - Farbe: Theme-Color-Picker
  - Padding: 5px, 10px, 15px, 20px

- ✅ **Karten-Styling**:
  - Theme-basierte Farbauswahl (backgroundColor, borderColor)
  - Border-Width konfigurierbar (Standard: 0px)
  - Schatten, Hover-Effekte, Transitions

#### 4.3 Layout & Grid Configuration ✅
- ✅ **CardGridConfig**:
  - Responsive Spalten (Desktop/Tablet/Mobil)
  - Gap-Einstellungen (none, xs, sm, md, lg, xl)
  - Align-Items (start, center, end, stretch)
  - **maxWidth** - Maximale Container-Breite (Standard: 1200px)

- ✅ **Flexible Grid-Anordnung**:
  - Grid, Liste, Karussell, Masonry
  - Responsive Column-Control

#### 4.4 Editor-Komponenten ✅
- ✅ **CardConfigEditor** (Wiederverwendbar):
  - Bereich-Einstellungen (Header, Hintergrund, Typografie)
  - Layout-Einstellungen (Grid-Spalten, Abstand, Max-Breite)
  - Styling-Optionen (Collapsible Group):
    - Karten-Styling (Farben, Rahmen, Schatten)
    - Bild-Styling (Aspect Ratio, Fit, Padding, Margin)
    - Overline-Styling (Font, Größe, Farbe, Margin)
    - Titel-Styling (Font, Größe, Gewicht, Farbe, Margin)
    - Untertitel-Styling (Font, Größe, Farbe, Margin)
    - Beschreibung-Styling (Font, Größe, Farbe, Line-Clamp, Margin)
    - Icon-Styling (Größe, Farbe, Hintergrund-Form/Farbe/Padding)
    - Button-Styling (Farben, Größe, Border)
  - Karten-Liste mit Drag & Drop (planned)
  - Live-Preview Integration

- ✅ **RichTextInput** mit TipTap:
  - Alle Textfelder verwenden TipTap-Editor
  - Formatierungsoptionen: Bold, Italic, etc.

- ✅ **ThemeColorPicker**:
  - Theme-Farben mit Abstufungen
  - "Keine Farbe"-Option (`allowNoColor`)
  - Farbvorschau mit Checkmark

#### 4.5 Editor-Seiten ✅
- ✅ **GenericCardEditorPage** (Admin):
  - 55/45 Split-Layout (Editor links, Preview rechts)
  - Sticky Preview mit automatischer Aktualisierung
  - Vollständige CardConfigEditor-Integration
  - MediaLibrary-Integration mit stockOnly=false

- ✅ **CardTemplateEditorPage** (SuperAdmin):
  - 3-Tab-System: Settings / Visual / JSON
  - **Settings-Tab**: Name, Beschreibung, Kategorie, is_active
  - **Visual-Tab**: CardConfigEditor mit Live-Preview
  - **JSON-Tab**: Direktes JSON-Editing mit Copy/Reset
  - Template-Factory: `createTemplateCardConfig()` mit 3 Beispiel-Karten
  - Datenbank-Integration: `card_templates` Tabelle

#### 4.6 SuperAdmin Stockphotos-Integration ✅
- ✅ **MediaLibrary stockOnly-Modus**:
  - `stockOnly={true}` zeigt nur Stockfotos
  - Automatische Kategoriefilterung auf "stockphotos"
  - customer_id='stock' für Stockphoto-Ordner
  - SuperAdmin kann Stockphotos verwalten

- ❌ **StockPhotoSelector (verworfen)**:
  - Ursprünglich separate Komponente erstellt
  - Rückgängig gemacht zugunsten einheitlicher MediaLibrary
  - Vorteil: Gleiche UX für Admin und SuperAdmin

#### 4.7 Responsive Preview System ✅
- ✅ **CardPreviewModal Komponente**:
  - Vollbild-Modal für responsive Vorschau
  - 3 Viewport-Buttons: Desktop / Tablet / Mobil
  - **Desktop**: Verwendet maxWidth aus Grid-Config
  - **Tablet**: 1023px Breite
  - **Mobil**: 360px Breite (iPhone SE)
  - Smooth Transitions zwischen Viewports
  - Live-Rendering der aktuellen Config

- ✅ **Integration in Editoren**:
  - GenericCardEditorPage: "Responsive Vorschau"-Button im Header
  - CardTemplateEditorPage: "Responsive Vorschau"-Button im Header
  - Modal öffnet sich mit Maximize2-Icon

#### 4.8 Frontend Rendering ✅
- ✅ **GenericCard.tsx Komponente**:
  - Vollständiges Rendering aller Styling-Optionen
  - Responsive Grid mit maxWidth-Container
  - Intelligente Bild-Margin-Berechnung bei padding>0
  - Border-Radius-Logik für nahtlose Karten-Integration
  - Icon-Background mit Theme-Colors
  - Layout-Varianten (vertical, horizontal, overlay, minimal)
  - Price-Badge-Support (top-right Position)
  - Social-Links-Rendering

---

## Aktuelle Features

### Bild-Padding-Logik 🎯 NEU
**Problem**: Wenn Bild-Padding 0 oder klein ist, soll das Bild nahtlos an die Karte angrenzen.

**Lösung**:
- **padding = 0**: 
  - Negative Margin = Card-Padding (Bild geht bis zu den Kartenrändern)
  - Border-Radius oben = Karten-Border-Radius
  
- **padding > 0** (z.B. padding = 1):
  - Margin = `calc(-cardPadding + imagePadding)`
  - Beispiel: Card-Padding 16px, Image-Padding 1px → Margin = -15px
  - Bild ist exakt 1px vom Kartenrand entfernt
  - Border-Radius = eigener Wert

### Grid Max-Width 🎯 NEU
- Konfigurierbar im Layout-Editor
- Standard: `1200px`
- Akzeptiert beliebige CSS-Werte: `1200px`, `80rem`, `100%`
- Responsive Container mit auto-Margin für Zentrierung

### Theme-basierte Farbauswahl 🎨
- Alle ColorPicker verwenden ThemeColorPicker
- Theme-Farben mit Abstufungen (50-900)
- "Keine Farbe"-Option verfügbar
- Konsistente UX in allen Editoren

---

## Datenbank-Schema

### card_templates (SuperAdmin) ✅
```sql
CREATE TABLE card_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  preview_image TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies**:
- Authenticated users: Manage (CRUD)
- Public: Read active templates

**Initial Templates**:
- Service-Karte (3 columns)
- Product-Karte (4 columns)
- Team-Karte (horizontal layout)

---

## Nächste Schritte

### Geplante Erweiterungen
1. 🔄 Drag & Drop für Karten-Reihenfolge
2. 🔄 Template-Import/Export
3. 🔄 Karten-Duplikation
4. 🔄 Masonry-Layout-Support
5. 🔄 Karussell-Modus mit Swiper
6. 🔄 Animation-Presets (Fade-In, Slide-In, etc.)
7. 🔄 Conditional Visibility (z.B. nur auf Mobile anzeigen)

### Optimierungen
1. 🔄 Performance: Virtualisierung bei vielen Karten
2. 🔄 A11y: ARIA-Labels und Keyboard-Navigation
3. 🔄 SEO: Structured Data für Cards
4. 🔄 Analytics: Click-Tracking per Karte

---

## Komponenten-Übersicht

```
src/
├── types/
│   ├── GenericCard.ts          # Alle Interfaces & Types
│   └── Cards.ts                # Basis Card-Types
├── components/
│   ├── blocks/
│   │   └── GenericCard.tsx     # Frontend Rendering
│   └── admin/
│       ├── CardConfigEditor.tsx         # Wiederverwendbarer Editor
│       ├── CardPreviewModal.tsx         # Responsive Preview Modal
│       ├── GenericCardEditorPage.tsx    # Admin Editor
│       ├── IconPicker.tsx               # Icon-Auswahl
│       ├── RichTextInput.tsx            # TipTap-Editor
│       ├── ThemeColorPicker.tsx         # Theme-Farben
│       ├── FontPicker.tsx               # Font-Auswahl
│       ├── FontPickerWithSize.tsx       # Font + Größe
│       └── MediaLibrary.tsx             # Bild-/Medienauswahl
└── pages/
    └── superadmin/
        ├── CardTemplateEditorPage.tsx   # Template-Editor
        └── CardTemplatesPage.tsx        # Template-Liste
```

---

## Verwendungsbeispiele

### 1. Admin: Karten-Block bearbeiten
```tsx
// User navigiert zu: /admin/pages/{pageId}/blocks/{blockId}/edit
<GenericCardEditorPage />
// → CardConfigEditor mit voller Funktionalität
// → MediaLibrary zeigt User-Medien
```

### 2. SuperAdmin: Template erstellen
```tsx
// User navigiert zu: /superadmin/card-templates/new
<CardTemplateEditorPage />
// → 3 Tabs: Settings / Visual / JSON
// → MediaLibrary mit stockOnly={true}
// → Template in DB speichern
```

### 3. Frontend: Karten anzeigen
```tsx
<GenericCard 
  config={blockConfig} 
  instanceId="services-section"
/>
// → Responsive Grid mit maxWidth
// → Theme-basierte Farben
// → Alle Styling-Optionen aktiv
```

---

## Technische Details

### Responsive Breakpoints
- **Desktop**: maxWidth aus Config (default 1200px)
- **Tablet**: 1023px
- **Mobile**: 360px (iPhone SE)

### CSS-Werte-Mapping
```typescript
SPACING_VALUES = { none: '0', xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' }
BORDER_RADIUS_VALUES = { none: '0', sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px' }
SHADOW_VALUES = { none: 'none', sm: '0 1px 2px...', md: '0 4px 6px...', ... }
FONT_SIZE_VALUES = { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px', '2xl': '24px' }
```

### Theme-Color-Format
```typescript
ColorValue = 
  | { kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' }
  | { kind: 'custom', hex: '#FF0000' }
  | { kind: 'transparent' }
```

---

## Status: ✅ Production Ready

Alle Kern-Features implementiert und getestet.
Bereit für User-Testing und Feedback.
