# Visual Editor – Technisches Konzept

## 1. Übersicht

Ein Webflow‑inspirierter Visual Editor für BeautifulCMS. Admins können Seiten
visuell bearbeiten: Navigator links, Canvas in der Mitte, Properties rechts.

**Einstieg:** Button im Admin‑Dashboard → `/admin/visual-editor`

---

## 2. UI‑Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Top Bar                                                                 │
│ [Breadcrumbs: Body > Section > Container]    [Page ▼] [🖥 📱 📲] [Save]│
├────────┬────────────────────────────────────────────────┬───────────────┤
│  Nav   │                                                │  Properties  │
│  (48px)│              Canvas                            │  (~320px)    │
│        │              (volle Seite)                      │              │
│  🗂    │                                                │  Layout      │
│  📄    │   ┌──────────────────────┐                     │  Spacing     │
│  🖼    │   │  Section             │                     │  Size        │
│  🧩    │   │  ┌────────────────┐  │                     │  Typography  │
│        │   │  │  Container     │  │                     │  Background  │
│        │   │  │  [Badge: Card] │  │                     │  Border      │
│        │   │  └────────────────┘  │                     │  Position    │
│        │   └──────────────────────┘                     │              │
├────────┴────────────────────────────────────────────────┴───────────────┤
│ Status Bar (optional)                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Top Bar
- **Links:** Breadcrumbs (Body > Section > Container > Text)
- **Mitte:** Page‑Dropdown (Quick Switch zwischen Seiten)
- **Mitte‑Rechts:** Breakpoint‑Switch (Desktop / Tablet / Mobile)
- **Rechts:** Save‑Button, Exit‑Button

### 2.2 Navigator (Links, ~48px breit, nur Icons)
Vier Icon‑Tabs mit Tooltips:
1. 📄 **Pages** – Seitenliste
2. 🗂 **Elements** – Hierarchischer Elementbaum
3. 🖼 **Assets** – Medien‑Bibliothek
4. 🧩 **Components** – Wiederverwendbare Komponenten

Klick auf Icon öffnet ein **Flyout‑Panel** (~240px) neben der Icon‑Leiste.

### 2.3 Canvas (Mitte)
- Zeigt die volle Seite
- Hover → Element wird highlighted (hellblaue Border)
- Klick → Element wird selektiert (blaue Border + Badge)
- **Selection Badge:** kleines Label links unten am Element (z. B. „Section", „Text", „Card")
- Inline‑Text‑Editing per Doppelklick (TipTap)

### 2.4 Properties Panel (Rechts, ~320px)
Accordion‑Sections, abhängig vom selektierten Element:
- Layout
- Spacing
- Size
- Typography
- Background
- Border
- Position
- Element‑spezifisch (z. B. Card‑Template‑Auswahl)

---

## 3. Block‑Typen (Element‑Hierarchie)

### 3.1 Hierarchie
```
Body (root, 1 pro Page)
 └─ Section
     └─ Container
         └─ Text | Image | Button | Cards | ComponentInstance
             └─ (Cards enthält Card[])
                 └─ CardElement[] (Titel, Subtitle, Badge, Rating, Image, Button)
```

### 3.2 Typ‑Definitionen

#### Body
- Root‑Element jeder Seite
- Properties: Background, Padding, Typography Defaults

#### Section
- Vollbreiter horizontaler Abschnitt
- Properties: Background, Padding, Max‑Width, Alignment

#### Container
- Begrenzter Inhaltsbereich innerhalb einer Section
- Properties: Width, Max‑Width, Padding, Margin, Background, Border, Radius
- Kann Grid‑Layout haben

#### Text
- WYSIWYG‑Text (TipTap)
- Properties: Typography (Font, Size, Weight, Line‑Height, Color, Align)
- Style‑Auswahl aus dem bestehenden Typografie‑System (H1–H6, Body, Small)
- Label editierbar (z. B. „Titel", „Beschreibung")

#### Image
- Einzelbild
- Properties: Width, Height, Object‑Fit, Border, Radius, Padding

#### Button
- Klickbares Element
- Properties: Text, Link, Typography, Background, Border, Radius, Padding

#### Cards
- Container für eine Liste von Karten
- Properties: Columns (responsive), Gap, Padding
- Enthält: Card[] (gleicher Typ/Template)
- UI: „+ Karte hinzufügen" / „Karte löschen"
- Template‑Auswahl mit Warnung bei Typwechsel

#### ComponentInstance
- Referenz auf eine global definierte Komponente
- Änderungen an der Komponente wirken überall

---

## 4. Style‑System

### 4.1 Responsive Styles
```typescript
interface ElementStyles {
  desktop: StyleProperties;
  tablet?: Partial<StyleProperties>;   // Override
  mobile?: Partial<StyleProperties>;   // Override
}
```

Desktop ist führend. Tablet/Mobile erben von Desktop, können aber
einzelne Properties überschreiben.

### 4.2 Style Properties
```typescript
interface StyleProperties {
  // Layout
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  gap?: SizeValue;

  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;

  // Size
  width?: SizeValue;
  height?: SizeValue;
  minWidth?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  maxHeight?: SizeValue;

  // Spacing
  marginTop?: SizeValue;
  marginRight?: SizeValue;
  marginBottom?: SizeValue;
  marginLeft?: SizeValue;
  paddingTop?: SizeValue;
  paddingRight?: SizeValue;
  paddingBottom?: SizeValue;
  paddingLeft?: SizeValue;

  // Typography
  fontFamily?: string;       // Font‑ID aus unserem System
  fontSize?: SizeValue;
  fontWeight?: number | string;
  lineHeight?: SizeValue;
  letterSpacing?: SizeValue;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: ColorValue;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Background
  backgroundColor?: ColorValue;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';

  // Border
  borderWidth?: SizeValue;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor?: ColorValue;
  borderRadius?: SizeValue;
  borderTopLeftRadius?: SizeValue;
  borderTopRightRadius?: SizeValue;
  borderBottomLeftRadius?: SizeValue;
  borderBottomRightRadius?: SizeValue;

  // Shadow
  boxShadow?: string;

  // Position
  position?: 'static' | 'relative' | 'absolute';
  top?: SizeValue;
  right?: SizeValue;
  bottom?: SizeValue;
  left?: SizeValue;
  zIndex?: number;

  // Visibility
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Object (Images)
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  objectPosition?: string;
}
```

### 4.3 Size Value (mit Unit‑Switch)
```typescript
interface SizeValue {
  value: number;
  unit: 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'auto';
}
```
Im Properties‑Panel: Eingabefeld + Unit‑Dropdown (wie Webflow).

### 4.4 Color Value
Nutzt das bestehende `ColorValue`‑System:
```typescript
type ColorValue =
  | { kind: 'tokenRef'; ref: string }   // Theme‑Token
  | { kind: 'custom'; hex: string }     // Custom Hex
  | null;
```

---

## 5. JSON‑Schema (Speicherstruktur)

### 5.1 Page (erweitert)
```json
{
  "id": "page-1",
  "name": "Startseite",
  "route": "/",
  "body": {
    "id": "body-1",
    "type": "Body",
    "styles": {
      "desktop": {
        "backgroundColor": { "kind": "tokenRef", "ref": "semantic.pageBg" },
        "paddingTop": { "value": 0, "unit": "px" },
        "paddingBottom": { "value": 0, "unit": "px" }
      }
    },
    "children": [
      {
        "id": "section-1",
        "type": "Section",
        "label": "Hero Bereich",
        "styles": {
          "desktop": {
            "paddingTop": { "value": 80, "unit": "px" },
            "paddingBottom": { "value": 80, "unit": "px" },
            "backgroundColor": { "kind": "custom", "hex": "#1a1a2e" }
          },
          "mobile": {
            "paddingTop": { "value": 40, "unit": "px" },
            "paddingBottom": { "value": 40, "unit": "px" }
          }
        },
        "children": [
          {
            "id": "container-1",
            "type": "Container",
            "styles": {
              "desktop": {
                "maxWidth": { "value": 1200, "unit": "px" },
                "marginLeft": { "value": 0, "unit": "auto" },
                "marginRight": { "value": 0, "unit": "auto" }
              }
            },
            "children": [
              {
                "id": "text-1",
                "type": "Text",
                "label": "Überschrift",
                "content": "<h1>Willkommen</h1>",
                "textStyle": "h1",
                "styles": {
                  "desktop": {
                    "color": { "kind": "custom", "hex": "#ffffff" },
                    "textAlign": "center",
                    "marginBottom": { "value": 24, "unit": "px" }
                  }
                }
              },
              {
                "id": "btn-1",
                "type": "Button",
                "label": "CTA Button",
                "content": { "text": "Termin buchen", "link": "/kontakt" },
                "styles": {
                  "desktop": {
                    "backgroundColor": { "kind": "tokenRef", "ref": "primary" },
                    "color": { "kind": "custom", "hex": "#ffffff" },
                    "paddingTop": { "value": 12, "unit": "px" },
                    "paddingBottom": { "value": 12, "unit": "px" },
                    "paddingLeft": { "value": 32, "unit": "px" },
                    "paddingRight": { "value": 32, "unit": "px" },
                    "borderRadius": { "value": 8, "unit": "px" }
                  }
                }
              }
            ]
          }
        ]
      },
      {
        "id": "section-2",
        "type": "Section",
        "label": "Unsere Services",
        "children": [
          {
            "id": "text-2",
            "type": "Text",
            "label": "Section Titel",
            "content": "<h2>Unsere Services</h2>",
            "textStyle": "h2"
          },
          {
            "id": "cards-1",
            "type": "Cards",
            "label": "Service Karten",
            "template": "service-card-v1",
            "layout": {
              "desktop": { "columns": 3, "gap": { "value": 24, "unit": "px" } },
              "tablet": { "columns": 2 },
              "mobile": { "columns": 1 }
            },
            "cards": [
              {
                "id": "card-1",
                "elements": [
                  {
                    "id": "card-1-img",
                    "type": "CardImage",
                    "label": "Bild",
                    "content": { "src": "/images/service1.jpg", "alt": "Haarschnitt" },
                    "imageLayout": "top-full"
                  },
                  {
                    "id": "card-1-badge",
                    "type": "CardBadge",
                    "label": "Badge",
                    "content": { "text": "Beliebt" },
                    "styles": {
                      "desktop": {
                        "position": "absolute",
                        "top": { "value": 12, "unit": "px" },
                        "right": { "value": 12, "unit": "px" }
                      }
                    }
                  },
                  {
                    "id": "card-1-title",
                    "type": "CardText",
                    "label": "Titel",
                    "content": "Haarschnitt",
                    "textStyle": "h3"
                  },
                  {
                    "id": "card-1-desc",
                    "type": "CardText",
                    "label": "Beschreibung",
                    "content": "Moderner Schnitt für jeden Anlass"
                  },
                  {
                    "id": "card-1-price",
                    "type": "CardText",
                    "label": "Preis",
                    "content": "ab 35 €",
                    "textStyle": "price"
                  },
                  {
                    "id": "card-1-rating",
                    "type": "CardRating",
                    "label": "Bewertung",
                    "content": { "value": 4.8, "maxStars": 5 }
                  }
                ]
              }
            ]
          },
          {
            "id": "text-3",
            "type": "Text",
            "label": "Hinweis",
            "content": "<p>Alle Preise inkl. MwSt.</p>"
          }
        ]
      }
    ]
  }
}
```

---

## 6. Karten‑System (Detail)

### 6.1 Card‑Templates
- Vordefinierte Vorlagen (z. B. Service‑Card, Team‑Card, Produkt‑Card)
- Jedes Template definiert: welche CardElement‑Typen, welches Layout
- Templates sind editierbar und auch neu erstellbar

### 6.2 Card‑Element‑Typen
| Typ           | Beschreibung                          | Positionierbar |
|---------------|---------------------------------------|----------------|
| `CardImage`   | Bild (top/full-bleed/padded)          | Nein (flow)    |
| `CardText`    | Text mit Label + textStyle            | Nein (flow)    |
| `CardBadge`   | Badge (absolut positionierbar)        | Ja (px/%)      |
| `CardRating`  | Sternebewertung                       | Optional       |
| `CardButton`  | Button innerhalb der Karte            | Nein (flow)    |
| `CardIcon`    | Icon‑Element                          | Optional       |

### 6.3 Image‑Layout‑Optionen
- `top-full`: Bild oben, volle Breite
- `top-padded`: Bild oben, mit Padding
- `background`: Bild als Card‑Hintergrund (Overlay‑Stil)

### 6.4 Template‑Wechsel
- Dropdown im Properties‑Panel
- Warnung: „Beim Wechsel des Templates können Daten verloren gehen. Fortfahren?"
- Mapping: bekannte Felder werden übernommen, unbekannte gehen verloren

### 6.5 Card‑Editor (Popup)
- Öffnet sich bei „Vorlage bearbeiten" oder „Neue Vorlage"
- Zeigt Card‑Preview + Element‑Liste
- Elemente hinzufügen/entfernen/umsortieren
- Styles pro Element editieren
- Speichert als Template (global oder lokal)

---

## 7. Komponenten‑System (Symbols)

### 7.1 Definition
```json
{
  "id": "comp-header-1",
  "name": "Main Header",
  "type": "Component",
  "children": [ ... ],
  "styles": { ... }
}
```

### 7.2 Instanz
```json
{
  "id": "inst-1",
  "type": "ComponentInstance",
  "componentId": "comp-header-1"
}
```

### 7.3 Bearbeitung
- Doppelklick auf Instanz → öffnet Component im Isolations‑Modus
- Änderungen werden global übernommen
- Breadcrumbs zeigen: Body > Section > [Component: Main Header]

---

## 8. Properties Panel (Detail)

### 8.1 Accordion‑Sections (Webflow‑Reihenfolge)

**8.1.1 Layout**
```
Display:    [Block ▼] [Flex] [Grid]
Direction:  [→] [←] [↓] [↑]        (nur bei Flex)
Justify:    [Start] [Center] [End] [Between] [Around]
Align:      [Start] [Center] [End] [Stretch]
Wrap:       [No Wrap] [Wrap]
Gap:        [___] [px ▼]
```

**8.1.2 Spacing (Visual Box Model)**
```
        ┌─ Margin ──────────────┐
        │    [mt]                │
        │ [ml]  ┌─ Padding ─┐ [mr]
        │       │   [pt]     │  │
        │       │[pl]    [pr]│  │
        │       │   [pb]     │  │
        │       └────────────┘  │
        │    [mb]                │
        └───────────────────────┘
```
Interaktive Box (wie Webflow), Klick auf Seite → Wert editieren.

**8.1.3 Size**
```
Width:      [___] [px ▼]     Height:   [___] [px ▼]
Min W:      [___] [px ▼]     Min H:    [___] [px ▼]
Max W:      [___] [px ▼]     Max H:    [___] [px ▼]
Overflow:   [Visible ▼]
```

**8.1.4 Typography**
```
Font:       [Inter ▼]
Weight:     [Regular ▼]
Size:       [___] [px ▼]
Height:     [___] [px ▼]
Spacing:    [___] [px ▼]
Color:      [■ #333] (Color Picker)
Align:      [◀] [▬] [▶] [☰]
Transform:  [None ▼]
Style:      [H1 ▼] (aus Theme)
```

**8.1.5 Background**
```
Type:       [Color] [Image] [None]
Color:      [■ #fff] (ThemeColorPicker)
Image:      [📷 Auswählen...]
Size:       [Cover ▼]
Position:   [Center ▼]
```

**8.1.6 Border**
```
Width:      [___] [px ▼]    (4 Seiten einzeln oder alle)
Style:      [Solid ▼]
Color:      [■ #ddd]
Radius:     [___] [px ▼]    (4 Ecken einzeln oder alle)
```

**8.1.7 Shadow**
```
X:          [___] px
Y:          [___] px
Blur:       [___] px
Spread:     [___] px
Color:      [■ rgba(0,0,0,0.1)]
```

**8.1.8 Position**
```
Type:       [Static] [Relative] [Absolute]
Top:        [___] [px ▼]
Right:      [___] [px ▼]
Bottom:     [___] [px ▼]
Left:       [___] [px ▼]
Z-Index:    [___]
```

### 8.2 Element‑spezifische Sections
- **Text:** Style‑Auswahl (H1–H6, Body), WYSIWYG‑Toggle
- **Image:** Src, Alt, Object‑Fit
- **Button:** Text, Link, Hover‑Style (später)
- **Cards:** Template‑Auswahl, Columns, Gap, Card‑Liste
- **Badge:** Position‑Controls prominent

### 8.3 Breakpoint‑Indikator
Properties zeigen an, welcher Breakpoint aktiv ist:
- Desktop‑Werte: normal angezeigt
- Tablet/Mobile Overrides: markiert mit 📱 Icon
- Wert löschen → fällt auf Desktop‑Default zurück

---

## 9. Canvas‑Interaktion

### 9.1 Selection
- Hover: hellblaue Border (1px dashed)
- Selected: blaue Border (2px solid) + Badge links unten

### 9.2 Selection Badge
```
┌──────────────────────┐
│                      │
│     Element          │
│                      │
├──────────┐           │
│ Section  │           │
└──────────┘───────────┘
```
- Kleines Label (z. B. „Section", „Text", „Card")
- Hintergrund: Blau (#4299e1)
- Text: Weiß, 11px

### 9.3 Breadcrumbs (Top‑Left)
```
Body > Hero Bereich > Container > Überschrift
```
- Klickbar: springt zur jeweiligen Ebene
- Zeigt `label` falls vorhanden, sonst `type`

### 9.4 Inline Editing
- Doppelklick auf Text → TipTap aktivieren
- Escape oder Klick außerhalb → beenden
- Änderungen sofort im JSON

---

## 10. Navigator (Detail)

### 10.1 Elements Tree
```
▼ Body
  ▼ Section „Hero Bereich"
    ▼ Container
      ├ Text „Überschrift"
      └ Button „CTA Button"
  ▼ Section „Services"
    ├ Text „Section Titel"
    ▼ Cards „Service Karten"
    │ ├ Card 1
    │ ├ Card 2
    │ └ Card 3
    └ Text „Hinweis"
```

### 10.2 Features
- Klick → selektiert Element (sync mit Canvas)
- Hover → Highlight auf Canvas
- Rechtsklick → Kontextmenü (Duplicate, Delete, Add Child)
- Labels editierbar (Doppelklick)
- Icons pro Typ (📄 Section, 📦 Container, 📝 Text, 🖼 Image, 🔘 Button, 🃏 Cards)

### 10.3 Pages Tab
- Liste aller Seiten
- Klick → wechselt Seite (auch über Top‑Bar Dropdown)
- Status‑Badge (Draft/Published)

### 10.4 Assets Tab
- Bestehendes Media‑Library Flyout
- Bilder/Medien durchsuchen

### 10.5 Components Tab
- Liste globaler Komponenten
- Klick → öffnet Component im Isolations‑Modus
- „+ Neue Komponente"

---

## 11. Editor State Management

### 11.1 Context
```typescript
interface VisualEditorState {
  // Page
  currentPageId: string;
  pageData: VEPage;

  // Selection
  selectedElementId: string | null;
  hoveredElementId: string | null;
  breadcrumbs: BreadcrumbItem[];

  // Viewport
  viewport: 'desktop' | 'tablet' | 'mobile';

  // UI
  activeNavTab: 'pages' | 'elements' | 'assets' | 'components';
  navFlyoutOpen: boolean;

  // Editing
  inlineEditingId: string | null;

  // Components
  components: VEComponent[];

  // Card Templates
  cardTemplates: CardTemplate[];
}
```

### 11.2 Actions
```typescript
type EditorAction =
  | { type: 'SELECT_ELEMENT'; id: string }
  | { type: 'HOVER_ELEMENT'; id: string | null }
  | { type: 'SET_VIEWPORT'; viewport: 'desktop' | 'tablet' | 'mobile' }
  | { type: 'SWITCH_PAGE'; pageId: string }
  | { type: 'UPDATE_STYLE'; elementId: string; viewport: string; property: string; value: any }
  | { type: 'UPDATE_CONTENT'; elementId: string; content: any }
  | { type: 'ADD_ELEMENT'; parentId: string; element: VEElement; position?: number }
  | { type: 'DELETE_ELEMENT'; elementId: string }
  | { type: 'DUPLICATE_ELEMENT'; elementId: string }
  | { type: 'SET_LABEL'; elementId: string; label: string }
  | { type: 'START_INLINE_EDIT'; elementId: string }
  | { type: 'STOP_INLINE_EDIT' }
  | { type: 'ADD_CARD'; cardsId: string }
  | { type: 'DELETE_CARD'; cardsId: string; cardId: string }
  | { type: 'SWITCH_CARD_TEMPLATE'; cardsId: string; templateId: string };
```

---

## 12. Rendering Engine

### 12.1 Canvas Renderer
Rekursiver Renderer: liest JSON, rendert React‑Komponenten.

```
VEPage → VEBodyRenderer
  → VESectionRenderer
    → VEContainerRenderer
      → VETextRenderer | VEImageRenderer | VEButtonRenderer | VECardsRenderer
        → VECardRenderer
          → VECardElementRenderer (Text/Badge/Rating/Image/Button)
```

### 12.2 Style Resolution
```typescript
function resolveStyles(
  styles: ElementStyles,
  viewport: 'desktop' | 'tablet' | 'mobile'
): React.CSSProperties {
  const base = styles.desktop || {};
  const override = viewport !== 'desktop' ? styles[viewport] || {} : {};
  const merged = { ...base, ...override };
  return convertToCSSProperties(merged);
}
```

### 12.3 SizeValue → CSS
```typescript
function sizeValueToCSS(sv: SizeValue): string {
  if (sv.unit === 'auto') return 'auto';
  return `${sv.value}${sv.unit}`;
}
```

---

## 13. Fahrplan (Implementierungs‑Phasen)

### Phase 1: Foundation (Woche 1–2)
**Ziel:** Types + JSON‑Schema + Basis‑Renderer

- [ ] TypeScript Types definieren (VEPage, VEElement, StyleProperties, SizeValue, etc.)
- [ ] JSON‑Schema für neue Seitenstruktur
- [ ] Basis‑Renderer (Body → Section → Container → Text/Image/Button)
- [ ] Style‑Resolution (Desktop + Responsive Overrides)
- [ ] SizeValue → CSS Konvertierung
- [ ] Demo‑Page als JSON anlegen

### Phase 2: Editor Shell (Woche 3–4)
**Ziel:** 3‑Panel‑Layout steht, Navigation funktioniert

- [ ] Editor‑Route `/admin/visual-editor`
- [ ] Button im Admin‑Dashboard
- [ ] Top‑Bar (Page‑Dropdown, Breakpoint‑Switch, Save, Exit)
- [ ] Breadcrumbs
- [ ] Navigator Icon‑Leiste + Flyout
- [ ] Elements Tree (rekursiv)
- [ ] Canvas mit Page‑Rendering
- [ ] EditorContext (State Management)

### Phase 3: Selection & Properties (Woche 5–7)
**Ziel:** Elemente selektieren und stylen

- [ ] Click‑to‑Select auf Canvas
- [ ] Selection Highlight + Badge
- [ ] Hover Highlight
- [ ] Navigator ↔ Canvas Sync
- [ ] Properties Panel Shell (Accordions)
- [ ] Layout Section (Display, Flex, Grid)
- [ ] Spacing Section (Visual Box Model)
- [ ] Size Section
- [ ] Typography Section (mit Style‑Auswahl)
- [ ] Background Section
- [ ] Border Section
- [ ] Shadow Section
- [ ] Position Section
- [ ] Unit‑Switch (px/%)
- [ ] Breakpoint‑aware Property Editing

### Phase 4: Inline Editing & Content (Woche 8–9)
**Ziel:** Inhalte direkt bearbeiten

- [ ] TipTap Inline‑Editing für Text
- [ ] Image‑Auswahl (Media Picker)
- [ ] Button‑Text + Link editieren
- [ ] Label‑Editing in Navigator
- [ ] Add/Delete Element (Kontextmenü)
- [ ] Duplicate Element

### Phase 5: Cards System (Woche 10–12)
**Ziel:** Karten‑System vollständig

- [ ] Cards‑Block mit Template‑Auswahl
- [ ] Card‑Element‑Typen (Text, Image, Badge, Rating, Button)
- [ ] Card‑Template‑Editor (Popup)
- [ ] Badge‑Positionierung (absolute, px/%)
- [ ] Add/Delete Card
- [ ] Template‑Wechsel mit Warnung
- [ ] Eigene Vorlagen erstellen

### Phase 6: Components (Woche 13–14)
**Ziel:** Wiederverwendbare Komponenten

- [ ] Component‑Definition speichern
- [ ] ComponentInstance‑Rendering
- [ ] Component Isolations‑Modus
- [ ] Globale Änderungen
- [ ] Components Tab im Navigator

### Phase 7: Polish & Integration (Woche 15–16)
**Ziel:** Produktionsreif

- [ ] Save/Load JSON ↔ Supabase
- [ ] Legacy‑Block Kompatibilität
- [ ] Keyboard Shortcuts (Delete, Escape, Ctrl+S)
- [ ] Responsive Preview testen
- [ ] Performance‑Optimierung
- [ ] Error Handling
- [ ] UX Polish (Tooltips, Transitions, Hover‑States)

---

## 14. Datei‑Struktur (geplant)

```
src/
├── visual-editor/
│   ├── types/
│   │   ├── elements.ts          # VEElement, VEPage, VEBody, etc.
│   │   ├── styles.ts            # StyleProperties, SizeValue, ElementStyles
│   │   ├── cards.ts             # Card, CardElement, CardTemplate
│   │   └── components.ts        # VEComponent, ComponentInstance
│   ├── context/
│   │   ├── EditorContext.tsx     # State Management
│   │   └── EditorReducer.ts     # Actions + Reducer
│   ├── renderer/
│   │   ├── CanvasRenderer.tsx    # Rekursiver Renderer
│   │   ├── BodyRenderer.tsx
│   │   ├── SectionRenderer.tsx
│   │   ├── ContainerRenderer.tsx
│   │   ├── TextRenderer.tsx
│   │   ├── ImageRenderer.tsx
│   │   ├── ButtonRenderer.tsx
│   │   ├── CardsRenderer.tsx
│   │   └── ComponentRenderer.tsx
│   ├── panels/
│   │   ├── TopBar.tsx
│   │   ├── Navigator.tsx
│   │   ├── ElementsTree.tsx
│   │   ├── PagesPanel.tsx
│   │   ├── AssetsPanel.tsx
│   │   ├── ComponentsPanel.tsx
│   │   └── properties/
│   │       ├── PropertiesPanel.tsx
│   │       ├── LayoutSection.tsx
│   │       ├── SpacingSection.tsx
│   │       ├── SizeSection.tsx
│   │       ├── TypographySection.tsx
│   │       ├── BackgroundSection.tsx
│   │       ├── BorderSection.tsx
│   │       ├── ShadowSection.tsx
│   │       ├── PositionSection.tsx
│   │       └── CardsSection.tsx
│   ├── components/
│   │   ├── SelectionOverlay.tsx
│   │   ├── BreadcrumbBar.tsx
│   │   ├── UnitInput.tsx         # Input mit Unit‑Switch
│   │   ├── SpacingBox.tsx        # Visual Box Model
│   │   └── CardTemplateEditor.tsx
│   ├── utils/
│   │   ├── styleResolver.ts     # Responsive Style Resolution
│   │   ├── sizeValue.ts         # SizeValue Helpers
│   │   └── elementHelpers.ts    # Find, traverse, mutate
│   └── VisualEditorPage.tsx     # Hauptseite
```

---

## 15. Abgrenzung Legacy

- **Legacy‑Blöcke** (Hero, GenericCard, etc.) bleiben erhalten
- **DynamicPage.tsx** rendert weiterhin Legacy‑Blöcke
- **Neue Seiten** können mit Visual Editor erstellt werden
- **Migration** optional: Tool zum Konvertieren von Legacy → VE‑Format
- **Koexistenz:** Eine Page kann Legacy ODER VE‑Format sein (Flag im JSON)

---

## 16. Technische Abhängigkeiten

- **React 19** (vorhanden)
- **TipTap** (vorhanden, für Inline‑Editing)
- **Tailwind** (vorhanden, für Editor‑UI)
- **Supabase** (vorhanden, für Save/Load)
- **Lucide Icons** (vorhanden, für Navigator‑Icons)
- **Keine neuen Dependencies** nötig für Phase 1–4
