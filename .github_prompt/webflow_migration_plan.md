# Webflow Feature-Migration – Masterplan

Dieser Plan dokumentiert alle Webflow-Features, die im Visual Editor (VE) noch fehlen, und priorisiert deren Implementierung in Phasen.

---

## Bestandsaufnahme: IST vs. SOLL

### Aktueller Stand der VE-Elemente

| Element | Webflow | VE | Status |
|---------|---------|-----|--------|
| **Section** | ✅ | ✅ Section | ✅ Vorhanden |
| **Container** | ✅ | ✅ Container | ✅ Vorhanden |
| **Div Block** | ✅ | ✅ Container | ✅ = Container |
| **Navbar** | ✅ | ✅ Navbar | ✅ Vorhanden |
| **Text (Heading)** | ✅ | ✅ Text (h1-h6) | ✅ Vorhanden |
| **Text (Paragraph)** | ✅ | ✅ Text (body) | ✅ Vorhanden |
| **Button / Link** | ✅ | ✅ Button | ✅ Vorhanden |
| **Image** | ✅ | ✅ Image | ✅ Vorhanden |
| **Cards** | ✅ | ✅ Cards | ✅ Vorhanden |
| **Columns** | ✅ | ❌ | 🔴 Phase 1 |
| **Grid** | ✅ | ⚠️ CSS vorhanden, kein visueller Builder | 🟡 Phase 1 |
| **List / List Item** | ✅ | ❌ | 🟡 Phase 2 |
| **Link Block** | ✅ | ❌ | 🟡 Phase 2 |
| **Rich Text** | ✅ | ⚠️ TipTap Editor vorhanden | 🟡 Phase 2 |
| **Video** | ✅ | ❌ | 🔴 Phase 3 |
| **Embed (HTML/iFrame)** | ✅ | ❌ | 🔴 Phase 3 |
| **Form** | ✅ | ❌ | 🔴 Phase 4 |
| **Input / Textarea / Select** | ✅ | ❌ | 🔴 Phase 4 |
| **Map** | ✅ | ❌ | 🔴 Phase 4 |
| **Divider / Spacer** | ✅ | ❌ | 🟡 Phase 2 |
| **Icon (SVG)** | ✅ | ❌ | 🟡 Phase 2 |
| **Background Video** | ✅ | ❌ | 🔴 Phase 5 |
| **Lightbox** | ✅ | ❌ | 🔴 Phase 5 |
| **Tabs** | ✅ | ❌ | 🔴 Phase 5 |
| **Slider / Carousel** | ✅ | ❌ | 🔴 Phase 5 |
| **Accordion** | ✅ | ❌ | 🔴 Phase 5 |

### Aktueller Stand der Style-Properties

| Style-Bereich | Webflow | VE Types | VE UI-Panel | Status |
|---------------|---------|----------|-------------|--------|
| **Display** | block, flex, grid, inline-block, none | ✅ Alle 6 | ✅ 5 (inline fehlt) | ✅ |
| **Flex Parent** | direction, justify, align, wrap, gap | ✅ | ✅ | ✅ |
| **Flex Child** | grow, shrink, alignSelf, order | ⚠️ grow, shrink, alignSelf | ❌ Kein UI | 🔴 Phase 1 |
| **Grid Parent** | columns, rows, gap, template areas | ⚠️ columns, rows, gap | ⚠️ Text-Input | 🔴 Phase 1 |
| **Grid Child** | column span, row span, area | ⚠️ gridColumn, gridRow | ❌ Kein UI | 🔴 Phase 1 |
| **Spacing** | Margin (4) + Padding (4) | ✅ | ✅ SpacingBox | ✅ |
| **Size** | W, H, minW, maxW, minH, maxH | ✅ | ✅ SizeSection | ✅ |
| **Typography** | font, weight, size, height, spacing, align, color, transform, decoration | ✅ | ✅ | ✅ |
| **Font Style (italic)** | ✅ | ❌ | ❌ | 🔴 Phase 1 |
| **Background Color** | ✅ | ✅ | ✅ | ✅ |
| **Background Image** | ✅ size, position, repeat, attachment | ✅ size, pos, repeat | ✅ | ✅ |
| **Background Gradient** | linear, radial, conic | ❌ | ❌ | 🟡 Phase 2 |
| **Multiple Backgrounds** | ✅ Stacking | ❌ | ❌ | 🔴 Phase 3 |
| **Border** | width (4), style, color, radius (4) | ✅ | ✅ | ✅ |
| **Per-Side Border Style/Color** | ✅ | ❌ | ❌ | 🟡 Phase 3 |
| **Box Shadow** | ✅ Multi-shadow, visual builder | ⚠️ String-Presets | ⚠️ Presets + Text | 🟡 Phase 2 |
| **Text Shadow** | ✅ | ❌ | ❌ | 🟡 Phase 3 |
| **Position** | static, relative, absolute, fixed, sticky | ✅ | ✅ | ✅ |
| **Opacity** | ✅ Slider 0-100% | ✅ Type | ❌ Kein UI | 🔴 Phase 1 |
| **Overflow** | visible, hidden, scroll, auto | ✅ | ✅ | ✅ |
| **Transform** | translate, rotate, scale, skew | ⚠️ Raw String | ❌ Kein UI | 🟡 Phase 2 |
| **Transitions** | property, duration, easing, delay | ❌ | ❌ | 🟡 Phase 3 |
| **CSS Filters** | blur, brightness, contrast, etc. | ❌ | ❌ | 🟡 Phase 3 |
| **Backdrop Filter** | blur, etc. (Glassmorphism) | ❌ | ❌ | 🟡 Phase 3 |
| **Blend Modes** | mix-blend-mode, bg-blend-mode | ❌ | ❌ | 🔴 Phase 4 |
| **Hover/Focus States** | ✅ Pseudo-Klassen | ❌ | ❌ | 🔴 Phase 3 |
| **Aspect Ratio** | ✅ | ❌ | ❌ | 🟡 Phase 2 |
| **Cursor** | ✅ | ✅ | ✅ | ✅ |
| **Classes / Combo Classes** | ✅ | ❌ | ❌ | 🔴 Phase 5 |
| **Interactions / Animations** | ✅ Scroll, hover, click triggers | ❌ | ❌ | 🔴 Phase 5 |

---

## Phase 1 – Layout & Grundlagen (Priorität: HOCH)

Ziel: Vollständige Layout-Kontrolle wie in Webflow. Der Nutzer kann alle gängigen Layouts bauen.

### 1.1 Grid – Visueller Builder

**Webflow-Referenz:** Grid-Element mit visuellem Column/Row-Editor, Drag-Resize, Gap-Controls, Area-Naming.

**Zu implementieren:**

#### Typ-Erweiterungen (`styles.ts`)
Bereits vorhanden, aber UI fehlt:
```typescript
// Bereits in StyleProperties:
gridTemplateColumns?: string;   // z.B. "1fr 1fr 1fr"
gridTemplateRows?: string;      // z.B. "auto 1fr"
gridColumn?: string;            // z.B. "1 / 3" (Child-Prop)
gridRow?: string;               // z.B. "1 / 2" (Child-Prop)
```

Neu hinzuzufügen:
```typescript
gridTemplateAreas?: string;     // z.B. '"header header" "sidebar main"'
gridArea?: string;              // z.B. "header" (Child-Prop)
gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
gridAutoColumns?: string;       // z.B. "minmax(100px, 1fr)"
gridAutoRows?: string;          // z.B. "minmax(50px, auto)"
```

#### UI-Panel (`LayoutSection.tsx`)
Wenn `display === 'grid'`:
- **Columns**: Visueller Spalten-Editor mit +/- Buttons, Drag-Resize der Spaltenbreiten
- **Rows**: Analog zu Columns
- **Gap**: Einheitlich oder getrennt (rowGap / columnGap)
- **Align/Justify Items**: Icon-Button-Grid (wie Flex)
- **Align/Justify Content**: Icon-Button-Grid
- **Auto Flow**: Dropdown (row / column / dense)

#### UI für Grid-Kinder
Wenn das übergeordnete Element `display: grid` hat:
- **Column Span**: Start / End Inputs oder Span-Dropdown
- **Row Span**: Analog
- **Grid Area**: Text-Input (bei benannten Areas)

**Webflow-Eigenschaften:**
| Eigenschaft | Webflow | Typ |
|-------------|---------|-----|
| Grid Template Columns | Visueller Builder (Tracks mit fr, px, %, auto, minmax) | string |
| Grid Template Rows | Visueller Builder | string |
| Column Gap | Slider + Input | SizeValue |
| Row Gap | Slider + Input | SizeValue |
| Align Items | 5 Buttons (start, center, end, stretch, baseline) | string |
| Justify Items | 5 Buttons | string |
| Align Content | 6 Buttons (+space-between/around/evenly) | string |
| Justify Content | 6 Buttons | string |
| Grid Auto Flow | Dropdown (row, column, dense) | string |
| Grid Auto Columns | Input | string |
| Grid Auto Rows | Input | string |

**Grid-Kind-Eigenschaften:**
| Eigenschaft | Webflow | Typ |
|-------------|---------|-----|
| Column Start | Number Input | number |
| Column End / Span | Number Input oder "span N" | string |
| Row Start | Number Input | number |
| Row End / Span | Number Input | string |
| Grid Area | Text Input | string |
| Align Self | 5 Buttons | string |
| Justify Self | 5 Buttons | string |

---

### 1.2 Columns-Element (Convenience)

**Webflow-Referenz:** Vorgefertigtes Element mit wählbaren Spalten-Presets (2 gleich, 3 gleich, 1/3+2/3, 2/3+1/3, 1/4+3/4, etc.)

**Implementierung:**
- Neuer Element-Typ `Columns` in `elements.ts`
- Ist technisch ein Container mit `display: grid` + `gridTemplateColumns`-Preset
- Presets: `1fr 1fr`, `1fr 1fr 1fr`, `1fr 2fr`, `2fr 1fr`, `1fr 1fr 1fr 1fr`, `1fr 3fr`, `3fr 1fr`
- Kinder sind automatisch Container (eine pro Spalte)
- UI: Preset-Auswahl als Icon-Grid (wie Webflow)

**Element-Definition:**
```typescript
interface VEColumnsElement extends VEBaseElement {
  type: 'Columns';
  preset: '2-equal' | '3-equal' | '4-equal' | '1-2' | '2-1' | '1-3' | '3-1';
  children: VEElement[];
}
```

---

### 1.3 Flex-Child-Controls

**Webflow-Referenz:** Wenn ein Element Kind eines Flex-Containers ist, zeigt Webflow zusätzliche Controls.

**Zu implementieren (UI, Types vorhanden):**

| Eigenschaft | Webflow | VE Types | UI nötig |
|-------------|---------|----------|----------|
| Flex Grow | Number Input (0, 1, 2...) | ✅ `flexGrow` | ✅ |
| Flex Shrink | Number Input (0, 1, 2...) | ✅ `flexShrink` | ✅ |
| Flex Basis | Size Input (auto, px, %) | ❌ fehlt | ✅ |
| Align Self | 6 Buttons (auto, start, center, end, stretch, baseline) | ✅ `alignSelf` | ✅ |
| Order | Number Input | ❌ fehlt | ✅ |

**Neue Types:**
```typescript
// In StyleProperties hinzufügen:
flexBasis?: SizeValueOrAuto;
order?: number;
```

**UI:** Eigene Section "Flex-Kind" im PropertiesPanel, nur sichtbar wenn Parent `display: flex` hat.

---

### 1.4 Opacity-Control (UI fehlt)

**Webflow:** Slider 0% – 100% im "Effects"-Panel.

**Status:** `opacity` ist in `StyleProperties` und im `styleResolver` vorhanden, aber es gibt KEIN UI-Control.

**Implementierung:** Slider + Numberfield im EffectsSection-Panel hinzufügen.

---

### 1.5 Font Style (Italic)

**Webflow:** Italic-Toggle neben Bold in der Typography-Section.

**Status:** Komplett fehlend – nicht in Types, nicht im Resolver, nicht im UI.

**Implementierung:**
```typescript
// In StyleProperties hinzufügen:
fontStyle?: 'normal' | 'italic';
```
- `styleResolver.ts`: `if (props.fontStyle) css.fontStyle = props.fontStyle;`
- UI: Italic-Toggle-Button (I) in der TypographySection neben dem Underline-Toggle

---

## Phase 2 – Erweiterte Styles & Neue Elemente (Priorität: MITTEL)

### 2.1 Transform-Builder (UI fehlt)

**Webflow-Referenz:** Visueller Transform-Editor mit einzelnen Controls für:

| Eigenschaft | Webflow-Control | CSS |
|-------------|-----------------|-----|
| Move (Translate) | X/Y/Z Slider + Input (px, %, vw) | `translateX()`, `translateY()`, `translateZ()` |
| Scale | X/Y Slider (0-2, default 1) | `scaleX()`, `scaleY()` |
| Rotate | Slider + Input (deg) | `rotate()`, `rotateX()`, `rotateY()` |
| Skew | X/Y Slider + Input (deg) | `skewX()`, `skewY()` |
| Transform Origin | 9-Punkt-Grid (wie backgroundPosition) | `transform-origin` |
| Perspective | Slider + Input (px) | `perspective` |

**Status:** `transform` existiert als Raw-String in Types + Resolver. Kein UI.

**Implementierung:**

Neue Types (für strukturierte Eingabe, intern zu CSS-String kompiliert):
```typescript
interface TransformConfig {
  translateX?: SizeValue;
  translateY?: SizeValue;
  translateZ?: SizeValue;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;      // degrees
  rotateX?: number;
  rotateY?: number;
  skewX?: number;       // degrees
  skewY?: number;
}

// In StyleProperties:
transformOrigin?: string;   // z.B. "center center", "top left"
perspective?: SizeValue;
```

UI: Collapsible Section "Transform" im Properties Panel mit Accordion-Rows pro Achse.

---

### 2.2 Box-Shadow-Builder

**Webflow:** Visueller Shadow-Editor mit:
| Eigenschaft | Control |
|-------------|---------|
| X Offset | Slider + Input (px) |
| Y Offset | Slider + Input (px) |
| Blur | Slider + Input (px) |
| Spread | Slider + Input (px) |
| Color | Color Picker (mit Opacity) |
| Inset | Toggle |
| Multiple Shadows | + Button zum Hinzufügen |

**Status:** `boxShadow` ist ein Raw-String mit 7 Presets (Keine, XS–2XL) + freie Texteingabe.

**Implementierung:** Strukturiertes Shadow-Modell:
```typescript
interface BoxShadowValue {
  offsetX: number;    // px
  offsetY: number;    // px
  blur: number;       // px
  spread: number;     // px
  color: string;      // rgba()
  inset: boolean;
}
// boxShadow bleibt String, aber UI baut/parsed ihn strukturiert
```

---

### 2.3 Background-Gradient-Builder

**Webflow:** Gradient-Editor mit:
| Eigenschaft | Control |
|-------------|---------|
| Type | Toggle: Linear / Radial / Conic |
| Angle (Linear) | Slider 0-360° oder Richtungs-Presets |
| Color Stops | Farb-Leiste mit draggbaren Stops |
| Stop Position | Slider 0-100% pro Stop |
| Repeat | Toggle |

**Implementierung:** Neues Feld oder Erweiterung von `backgroundImage`:
```typescript
interface GradientStop {
  color: string;        // HEX oder rgba
  position: number;     // 0-100 (%)
}

interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  angle?: number;       // für linear (0-360)
  stops: GradientStop[];
}

// In StyleProperties:
backgroundGradient?: GradientConfig;  // Wird zu backgroundImage CSS kompiliert
```

---

### 2.4 Aspect Ratio

**Webflow:** Dropdown mit Presets + Custom Input.

```typescript
// In StyleProperties hinzufügen:
aspectRatio?: string;  // z.B. "16/9", "4/3", "1/1", "auto"
```

Presets: `auto`, `1/1`, `4/3`, `16/9`, `3/2`, `2/1`, `9/16`

---

### 2.5 Divider-Element

**Webflow:** Horizontale Linie (`<hr>`).

```typescript
interface VEDividerElement extends VEBaseElement {
  type: 'Divider';
  // Styling über styles: borderTopWidth, borderTopColor, borderTopStyle
  // Oder: height, backgroundColor für gefüllte Divider
}
```

**Eigenschaften:**
| Eigenschaft | Typ | Default |
|-------------|-----|---------|
| Dicke | SizeValue | 1px |
| Farbe | ColorValue | border-color |
| Stil | solid / dashed / dotted | solid |
| Breite | SizeValue (%, px) | 100% |
| Margin (oben/unten) | SizeValue | 16px / 16px |

---

### 2.6 Spacer-Element

**Webflow:** Unsichtbarer Abstandshalter.

```typescript
interface VESpacerElement extends VEBaseElement {
  type: 'Spacer';
  // Größe wird über styles.height definiert
}
```

---

### 2.7 Icon-Element

**Webflow:** SVG-Icon aus einer Bibliothek.

```typescript
interface VEIconElement extends VEBaseElement {
  type: 'Icon';
  iconName: string;     // Lucide Icon Name (PascalCase)
  // Styling: size (width/height), color über styles
}
```

**Eigenschaften:**
| Eigenschaft | Typ | Webflow |
|-------------|-----|---------|
| Icon Name | string (Lucide) | Icon-Picker |
| Size | SizeValue | width/height |
| Color | ColorValue | fill / stroke |
| Stroke Width | number | stroke-width |

---

### 2.8 List / List-Item-Element

**Webflow:** `<ul>`, `<ol>`, `<li>` mit Styling-Controls.

```typescript
interface VEListElement extends VEBaseElement {
  type: 'List';
  listType: 'unordered' | 'ordered';
  children: VEListItemElement[];
}

interface VEListItemElement extends VEBaseElement {
  type: 'ListItem';
  children: VEElement[];  // Kann Text, Image, Container etc. enthalten
}
```

**Eigenschaften:**
| Eigenschaft | Typ | Webflow |
|-------------|-----|---------|
| List Style Type | disc / circle / square / decimal / none | Dropdown |
| List Style Position | inside / outside | Toggle |
| Marker Color | ColorValue | Color Picker |
| Gap zwischen Items | SizeValue | Spacing |

---

## Phase 3 – Erweiterte Effekte & States (Priorität: MITTEL-NIEDRIG)

### 3.1 Hover / Focus / Active States

**Webflow:** Dropdown im Style Panel zum Wechseln des aktuellen State.

**Implementierung:**
```typescript
interface ElementStyles {
  desktop: Partial<StyleProperties>;
  tablet?: Partial<StyleProperties>;
  mobile?: Partial<StyleProperties>;
  // NEU:
  hover?: Partial<StyleProperties>;
  focus?: Partial<StyleProperties>;
  active?: Partial<StyleProperties>;
}
```

**Webflow-Unterstützte States:**
| State | CSS Pseudo | Anwendung |
|-------|-----------|-----------|
| None (Normal) | – | Standard-Styles |
| Hover | `:hover` | Mouse-Over |
| Pressed | `:active` | Klick-Moment |
| Focused | `:focus` | Tab-Navigation |
| Visited | `:visited` | Besuchte Links |
| Placeholder | `::placeholder` | Form-Inputs |

**Zu lösendes Problem:** Inline-Styles können keine Pseudo-Klassen setzen. Lösung: Dynamisches `<style>`-Tag pro Element mit generierten Klassennamen.

---

### 3.2 Transitions

**Webflow:** Pro Property definierbar mit Duration, Easing, Delay.

```typescript
interface TransitionConfig {
  property: string;       // "all", "opacity", "transform", "background-color", etc.
  duration: number;       // ms
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | string;
  delay: number;          // ms
}

// In StyleProperties:
transitions?: TransitionConfig[];
```

**Webflow-Eigenschaften:**
| Eigenschaft | Control |
|-------------|---------|
| Property | Dropdown (all / opacity / transform / bgColor / color / boxShadow / filter / custom) |
| Duration | Slider 0–2000ms |
| Easing | Preset-Buttons + Custom Bezier-Editor |
| Delay | Slider 0–2000ms |

---

### 3.3 CSS Filters

**Webflow:** Visuelle Filter-Controls.

```typescript
interface FilterConfig {
  blur?: number;          // px
  brightness?: number;    // 0-200 (%)
  contrast?: number;      // 0-200 (%)
  grayscale?: number;     // 0-100 (%)
  hueRotate?: number;     // 0-360 (deg)
  invert?: number;        // 0-100 (%)
  saturate?: number;      // 0-200 (%)
  sepia?: number;         // 0-100 (%)
}

// In StyleProperties:
filter?: string;           // Kompiliert aus FilterConfig
backdropFilter?: string;   // Für Glassmorphism
```

---

### 3.4 Text Shadow

```typescript
interface TextShadowValue {
  offsetX: number;    // px
  offsetY: number;    // px
  blur: number;       // px
  color: string;      // rgba
}

// In StyleProperties:
textShadow?: string;  // UI baut/parsed strukturiert
```

---

### 3.5 Per-Side Border Colors & Styles

```typescript
// In StyleProperties hinzufügen:
borderTopColor?: ColorValue;
borderRightColor?: ColorValue;
borderBottomColor?: ColorValue;
borderLeftColor?: ColorValue;
borderTopStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
borderRightStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
borderBottomStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
borderLeftStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
```

---

## Phase 4 – Formular- & Media-Elemente (Priorität: NIEDRIG)

### 4.1 Video-Element

```typescript
interface VEVideoElement extends VEBaseElement {
  type: 'Video';
  src: string;              // URL (YouTube, Vimeo, MP4)
  provider: 'youtube' | 'vimeo' | 'self-hosted';
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  poster?: string;          // Vorschaubild-URL
}
```

### 4.2 Embed-Element (iFrame / HTML)

```typescript
interface VEEmbedElement extends VEBaseElement {
  type: 'Embed';
  embedType: 'iframe' | 'html';
  src?: string;             // für iframe
  html?: string;            // für custom HTML
  allowFullscreen: boolean;
  sandbox?: string;
}
```

### 4.3 Map-Element

```typescript
interface VEMapElement extends VEBaseElement {
  type: 'Map';
  address: string;
  lat?: number;
  lng?: number;
  zoom: number;             // 1-20
  mapStyle: 'standard' | 'grayscale' | 'dark' | 'custom';
}
```

### 4.4 Form-Elemente

```typescript
interface VEFormElement extends VEBaseElement {
  type: 'Form';
  action: string;
  method: 'POST' | 'GET';
  children: VEElement[];    // Form-Kinder
}

interface VEInputElement extends VEBaseElement {
  type: 'Input';
  inputType: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url';
  name: string;
  label?: string;
  placeholder?: string;
  required: boolean;
}

interface VETextareaElement extends VEBaseElement {
  type: 'Textarea';
  name: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  rows: number;
}

interface VESelectElement extends VEBaseElement {
  type: 'Select';
  name: string;
  label?: string;
  required: boolean;
  options: { value: string; label: string }[];
}

interface VECheckboxElement extends VEBaseElement {
  type: 'Checkbox';
  name: string;
  label: string;
  required: boolean;
}
```

---

## Phase 5 – Advanced Features (Priorität: ZUKUNFT)

### 5.1 Klassen-System (Combo Classes)
Wiederverwendbare Style-Klassen wie in Webflow. Ersetzt Inline-Styles durch benannte Klassen.

### 5.2 Interactions & Animations
Scroll-basierte Animationen, Hover-Trigger, Klick-Trigger, Timeline-Editor.

### 5.3 Tabs-Element
Tab-Navigation mit wechselnden Content-Panels.

### 5.4 Accordion-Element
Aufklappbare Panels (FAQ-Stil).

### 5.5 Slider / Carousel
Bild- und Content-Slider mit Autoplay, Dots, Arrows.

### 5.6 Lightbox
Bild-Galerie mit Vollbild-Overlay.

### 5.7 Background Video
Video als Hintergrund eines Containers/Sections.

### 5.8 Component Variants
Symbol-ähnliche wiederverwendbare Komponenten mit Varianten (like Webflow Symbols).

---

## Phasen-Übersicht & Reihenfolge

| Phase | Umfang | Aufwand | Priorität |
|-------|--------|---------|-----------|
| **Phase 1** | Grid Builder, Columns, Flex-Child, Opacity UI, Font-Italic | ~3-5 Tage | 🔴 HOCH |
| **Phase 2** | Transform Builder, Shadow Builder, Gradient, Aspect-Ratio, Divider, Spacer, Icon, List | ~5-8 Tage | 🟡 MITTEL |
| **Phase 3** | Hover States, Transitions, Filters, Text-Shadow, Per-Side Borders | ~5-8 Tage | 🟡 MITTEL |
| **Phase 4** | Video, Embed, Map, Form-Elemente | ~5-7 Tage | 🟠 NIEDRIG |
| **Phase 5** | Klassen, Animations, Tabs, Accordion, Slider, Lightbox | ~10+ Tage | ⚪ ZUKUNFT |

---

## Dateien die pro Feature betroffen sind

| Bereich | Dateien |
|---------|---------|
| **Types** | `src/visual-editor/types/styles.ts`, `src/visual-editor/types/elements.ts` |
| **Resolver** | `src/visual-editor/utils/styleResolver.ts` |
| **UI Panels** | `src/visual-editor/properties/LayoutSection.tsx`, `src/visual-editor/shell/PropertiesPanel.tsx`, neue Section-Dateien |
| **Renderers** | `src/visual-editor/renderers/` (neue Renderer pro Element) |
| **Element-Palette** | Element-Auswahl-Panel (neues Element hinzufügen) |
| **Converter** | `src/visual-editor/converters/websiteToVE.ts` (Website→VE Mapping) |
| **Frontend** | `src/components/blocks/` (Frontend-Renderer für Website-Darstellung) |
| **JSON Spec** | `.github/create_json.md` (Dokumentation aktualisieren) |
