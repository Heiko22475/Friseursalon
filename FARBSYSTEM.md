# Farbsystem-Konzept: Design Token System

## 1. Überblick & Bewertung

### Konzeptbewertung
**Sehr gut durchdacht!** Das vorgeschlagene System folgt modernen Design-Token-Prinzipien:

✅ **Stärken:**
- Klare Hierarchie: Palette → Semantik → Verwendung
- Token-Referenzen ermöglichen konsistente Updates
- Automatische Kontrast-Berechnung für Barrierefreiheit
- CSS-Variablen für Performance und Live-Theming
- Zyklus-Erkennung verhindert Fehler

⚠️ **Überlegungen:**
- 5 Primärfarben ist viel für kleine Projekte, aber gut für Flexibilität
- Auto-Akzente sollten konfigurierbar sein (HSL-Shift-Werte)
- Export/Import von Paletten für Backup/Sharing wäre nützlich

## 2. Architektur

### 2.1 Datenmodell

```typescript
// ===== TYPES =====

// Palette: 5 Hauptfarben mit Base-Werten
interface Palette {
  id: string;
  name: string;
  primary1: string;  // HEX: #RRGGBB
  primary2: string;
  primary3: string;
  primary4: string;
  primary5: string;
  created_at: Date;
  updated_at: Date;
}

// ColorValue: Entweder Token-Referenz oder Custom-Hex
type ColorValue = 
  | { kind: 'tokenRef'; ref: string }  // z.B. "palette.primary1.base"
  | { kind: 'custom'; hex: string };   // z.B. #FF5733

// TextMapping: Zuordnung von Hintergrund → Textfarbe
interface TextMapping {
  id: string;
  token: string;           // z.B. "palette.primary1.base"
  mode: 'auto' | 'custom';
  customHex?: string;      // nur wenn mode='custom'
}

// SemanticTokens: Bedeutungsvolle Namen für UI-Elemente
interface SemanticTokens {
  id: string;
  // Navigation & Interaction
  link: ColorValue;
  linkHover: ColorValue;
  focusRing: ColorValue;
  
  // Backgrounds
  pageBg: ColorValue;
  contentBg: ColorValue;
  cardBg: ColorValue;
  
  // Text
  headingText: ColorValue;
  bodyText: ColorValue;
  mutedText: ColorValue;
  
  // Borders
  border: ColorValue;
  borderLight: ColorValue;
  
  // Buttons
  buttonPrimaryBg: ColorValue;
  buttonPrimaryText: ColorValue;
  buttonSecondaryBg: ColorValue;
  buttonSecondaryText: ColorValue;
  
  // States
  success: ColorValue;
  warning: ColorValue;
  error: ColorValue;
  info: ColorValue;
}

// ThemeTokens: Komplettes Theme
interface ThemeTokens {
  id: string;
  name: string;
  palette: Palette;
  semanticTokens: SemanticTokens;
  textMappings: TextMapping[];
  isActive: boolean;
}

// Computed Accents (nicht in DB, nur Runtime)
interface AccentColors {
  accent1: string;  // Hell (z.B. +30% Helligkeit)
  accent2: string;  // Dunkel (z.B. -20% Helligkeit)
  accent3: string;  // Muted (z.B. -30% Sättigung)
}
```

### 2.2 Datenbank-Schema

```sql
-- 1. Paletten (wiederverwendbar, voreinstellbar)
CREATE TABLE color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  primary1 TEXT NOT NULL, -- HEX
  primary2 TEXT NOT NULL,
  primary3 TEXT NOT NULL,
  primary4 TEXT NOT NULL,
  primary5 TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT false, -- Vordefinierte Palette
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Semantische Tokens (pro Theme)
CREATE TABLE semantic_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  
  -- Navigation & Interaction
  link JSONB NOT NULL,
  link_hover JSONB NOT NULL,
  focus_ring JSONB NOT NULL,
  
  -- Backgrounds
  page_bg JSONB NOT NULL,
  content_bg JSONB NOT NULL,
  card_bg JSONB NOT NULL,
  
  -- Text
  heading_text JSONB NOT NULL,
  body_text JSONB NOT NULL,
  muted_text JSONB NOT NULL,
  
  -- Borders
  border JSONB NOT NULL,
  border_light JSONB NOT NULL,
  
  -- Buttons
  button_primary_bg JSONB NOT NULL,
  button_primary_text JSONB NOT NULL,
  button_secondary_bg JSONB NOT NULL,
  button_secondary_text JSONB NOT NULL,
  
  -- States
  success JSONB NOT NULL,
  warning JSONB NOT NULL,
  error JSONB NOT NULL,
  info JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Text-Mappings
CREATE TABLE text_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  token TEXT NOT NULL,           -- z.B. "palette.primary1.base"
  mode TEXT NOT NULL,            -- 'auto' | 'custom'
  custom_hex TEXT,               -- nur bei mode='custom'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(theme_id, token)
);

-- 4. Themes (aktives Design-System)
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  palette_id UUID REFERENCES color_palettes(id),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nur ein aktives Theme erlauben
CREATE UNIQUE INDEX idx_active_theme ON themes(is_active) WHERE is_active = true;
```

### 2.3 Token-Referenzen (String-Format)

```typescript
// Token-Referenz-Syntax:
type TokenRef = 
  // Palette
  | `palette.primary${1|2|3|4|5}.base`
  | `palette.primary${1|2|3|4|5}.accents.accent${1|2|3}`
  
  // Semantik
  | 'semantic.link'
  | 'semantic.linkHover'
  | 'semantic.pageBg'
  | 'semantic.contentBg'
  | 'semantic.cardBg'
  | 'semantic.border'
  | 'semantic.headingText'
  | 'semantic.bodyText'
  | 'semantic.mutedText'
  | 'semantic.buttonPrimaryBg'
  | 'semantic.buttonPrimaryText'
  | 'semantic.buttonSecondaryBg'
  | 'semantic.buttonSecondaryText'
  | 'semantic.focusRing'
  | 'semantic.success'
  | 'semantic.warning'
  | 'semantic.error'
  | 'semantic.info';
```

## 3. Utilities

### 3.1 Color-Utilities

```typescript
// color-utils.ts

// HEX normalisieren (#RGB → #RRGGBB)
export function normalizeHex(hex: string): string;

// Luminanz berechnen (WCAG 2.0)
export function getLuminance(hex: string): number;

// Kontrast-Verhältnis berechnen
export function getContrastRatio(hex1: string, hex2: string): number;

// Beste Textfarbe ermitteln (schwarz/weiß)
export function autoTextColor(bgHex: string): string;

// Akzentfarben generieren
export function generateAccents(baseHex: string): AccentColors;

// HSL-Manipulation
export function adjustHSL(
  hex: string, 
  hueShift?: number, 
  satShift?: number, 
  lightShift?: number
): string;
```

### 3.2 Token-Resolution

```typescript
// token-resolver.ts

// Token zu HEX auflösen
export function resolveColor(
  colorValue: ColorValue, 
  tokenStore: ThemeTokens,
  visited?: Set<string>  // Zyklus-Erkennung
): string | null;

// Semantisches Token auflösen
export function resolveSemanticToken(
  name: string,
  tokenStore: ThemeTokens
): string | null;

// Textfarbe für Token ermitteln
export function resolveTextColor(
  bgToken: string,
  tokenStore: ThemeTokens
): string;

// Alle Tokens zu CSS-Variablen konvertieren
export function generateCSSVariables(theme: ThemeTokens): Record<string, string>;
```

### 3.3 Zyklus-Erkennung

```typescript
// cycle-detection.ts

// Prüfe, ob Token-Referenz Zyklen enthält
export function detectCycle(
  startToken: string,
  tokenStore: ThemeTokens
): string[] | null;  // null = kein Zyklus, sonst Pfad

// Validiere alle Semantic Tokens
export function validateTheme(theme: ThemeTokens): {
  valid: boolean;
  errors: Array<{ token: string; error: string }>;
};
```

## 4. UI-Komponenten

### 4.1 UnifiedColorPicker

**3-Tabbed-Interface:**
- Tab 1: **Semantik** - Liste aller semantic.* Tokens
- Tab 2: **Palette** - 5 Primärfarben + Akzente (3x3 Grid pro Farbe)
- Tab 3: **Custom** - Farbwähler mit Hex-Input

**Props:**
```typescript
interface UnifiedColorPickerProps {
  value: ColorValue;
  onChange: (value: ColorValue) => void;
  label?: string;
  showWarnings?: boolean;  // Kontrast-Warnungen
}
```

### 4.2 PaletteEditor

**Hauptansicht:**
- 5 Spalten (primary1..primary5)
- 3 Zeilen:
  - Zeile 1: Base-Farbe (editierbar mit Color-Picker)
  - Zeile 2: Accent1 (hell, computed) + Text-Preview
  - Zeile 3: Accent2 (dunkel, computed) + Text-Preview

**Features:**
- Preset-Dropdown (lädt vordefinierte Paletten)
- "Speichern als Preset"-Button
- Export/Import (JSON)

### 4.3 TextMappingEditor

**Für jedes Palette-Token:**
- Token-Name (z.B. "primary1.base")
- Farbvorschau
- Radio: Auto / Custom
- Custom-Picker (nur wenn Custom aktiv)
- Kontrast-Anzeige (AA / AAA)

### 4.4 SemanticColorsEditor

**Grid-Layout:**
| Semantic Token | Aktueller Wert | ColorPicker | Preview |
|---|---|---|---|
| link | palette.primary1.base | [Picker] | [Text] |
| linkHover | custom #... | [Picker] | [Text] |
| ... | ... | ... | ... |

**Features:**
- Dependency-Graph-Visualisierung
- Zyklus-Warnungen
- Bulk-Edit (z.B. alle Text-Farben auf bodyText setzen)

### 4.5 ThemePreview

**Live-Preview-Area mit typischen UI-Elementen:**
```
┌─────────────────────────────────────┐
│ [pageBg]                            │
│  ┌───────────────────────────────┐  │
│  │ [contentBg]                   │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ [cardBg] Card Title     │  │  │
│  │  │ Body text lorem ipsum   │  │  │
│  │  │ [link] Link example     │  │  │
│  │  │ [Primary Btn] [Sec Btn] │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Elemente:**
- Typography (H1-H6, body, muted)
- Buttons (Primary, Secondary, states)
- Links (normal, hover)
- Cards mit Borders
- Form-Inputs (mit focus-ring)
- Alert-Boxes (success, warning, error, info)

## 5. Editor-Seitenstruktur

### 5.1 Navigation

```
┌──────────────────────────────────────────────────────┐
│ Theme-Editor                            [Save] [?]   │
├──────────────────────────────────────────────────────┤
│ 🎨 Palette  |  📝 Semantik  |  🖋️ Text  |  👁️ Vorschau │
└──────────────────────────────────────────────────────┘
```

### 5.2 Palette-Tab

```
┌────────────────────────────────────────────────────────────┐
│ Palette laden:  [Dropdown: Presets ▼]  [Neue Palette]     │
├────────────────────────────────────────────────────────────┤
│        Primary 1    Primary 2   Primary 3   Primary 4   P5│
├────────────────────────────────────────────────────────────┤
│ Base   [#FF5733]    [#33C3FF]   [#5AFF33]   [#FFAA33]  ...│
│        Aa Sample    Aa Sample   Aa Sample   Aa Sample      │
├────────────────────────────────────────────────────────────┤
│ Hell   [#FFB399]    [#99E1FF]   [#ADFF99]   [#FFD499]  ...│
│        Aa Sample    Aa Sample   Aa Sample   Aa Sample      │
├────────────────────────────────────────────────────────────┤
│ Dunkel [#CC4629]    [#2899CC]   [#48CC29]   [#CC8829]  ...│
│        Aa Sample    Aa Sample   Aa Sample   Aa Sample      │
└────────────────────────────────────────────────────────────┘

Aktionen:
[Speichern als Preset] [Export JSON] [Import JSON]
```

### 5.3 Semantik-Tab

```
┌────────────────────────────────────────────────────────────┐
│ Semantische Farben                                         │
├────────────────────────────────────────────────────────────┤
│ Navigation & Interaction                                   │
│ • link          [palette.primary1.base ▼]  [Vorschau]     │
│ • linkHover     [custom #... ▼]            [Vorschau]     │
│ • focusRing     [palette.primary1.base ▼]  [Vorschau]     │
│                                                            │
│ Hintergründe                                               │
│ • pageBg        [custom #FFFFFF ▼]          [Vorschau]     │
│ • contentBg     [palette.primary5.accent1 ▼] [Vorschau]   │
│ ...                                                        │
└────────────────────────────────────────────────────────────┘

⚠️ Zyklus-Warnung: link → buttonPrimaryBg → link
```

### 5.4 Text-Tab

```
┌────────────────────────────────────────────────────────────┐
│ Textfarben-Zuordnung                                       │
├────────────────────────────────────────────────────────────┤
│ Token                 Hintergrund  Text-Modus    Kontrast  │
│ palette.primary1.base [#FF5733]    ⦿ Auto   ○ Custom  4.8:1│
│ palette.primary2.base [#33C3FF]    ⦿ Auto   ○ Custom  7.2:1│
│ semantic.cardBg       [#F5F5F5]    ○ Auto   ⦿ Custom  3.1:1│
│                                    └─ [#333333] ⚠️ AA fail │
└────────────────────────────────────────────────────────────┘
```

### 5.5 Vorschau-Tab

```
┌────────────────────────────────────────────────────────────┐
│ Live Theme Preview                                         │
├────────────────────────────────────────────────────────────┤
│ [Seitenbereich mit pageBg]                                 │
│   [Content-Container mit contentBg]                        │
│     [Card mit cardBg und border]                           │
│       Heading (headingText)                                │
│       Body text lorem ipsum... (bodyText)                  │
│       Muted text (mutedText)                               │
│       [Link example] (link + linkHover)                    │
│       [Primary Button] [Secondary Button]                  │
│     [/Card]                                                │
│                                                            │
│     [Success Alert] [Warning] [Error] [Info]               │
│   [/Content]                                               │
│ [/Page]                                                    │
└────────────────────────────────────────────────────────────┘
```

## 6. Defaults (Sinnvolle Startwerte)

### 6.1 Standard-Palette

```typescript
const DEFAULT_PALETTE: Palette = {
  primary1: '#E91E63', // Pink (Akzent)
  primary2: '#2196F3', // Blau (Info)
  primary3: '#4CAF50', // Grün (Success)
  primary4: '#FF9800', // Orange (Warning)
  primary5: '#F5F5F5', // Hellgrau (Neutral)
};
```

### 6.2 Semantik-Defaults

```typescript
const DEFAULT_SEMANTIC: SemanticTokens = {
  // Navigation
  link: { kind: 'tokenRef', ref: 'palette.primary1.base' },
  linkHover: { kind: 'tokenRef', ref: 'palette.primary1.accents.accent2' },
  focusRing: { kind: 'tokenRef', ref: 'palette.primary2.base' },
  
  // Backgrounds
  pageBg: { kind: 'custom', hex: '#FFFFFF' },
  contentBg: { kind: 'tokenRef', ref: 'palette.primary5.base' },
  cardBg: { kind: 'custom', hex: '#FAFAFA' },
  
  // Text
  headingText: { kind: 'custom', hex: '#212121' },
  bodyText: { kind: 'custom', hex: '#424242' },
  mutedText: { kind: 'custom', hex: '#757575' },
  
  // Borders
  border: { kind: 'custom', hex: '#E0E0E0' },
  borderLight: { kind: 'custom', hex: '#F5F5F5' },
  
  // Buttons
  buttonPrimaryBg: { kind: 'tokenRef', ref: 'palette.primary1.base' },
  buttonPrimaryText: { kind: 'custom', hex: '#FFFFFF' },
  buttonSecondaryBg: { kind: 'tokenRef', ref: 'palette.primary5.base' },
  buttonSecondaryText: { kind: 'tokenRef', ref: 'semantic.bodyText' },
  
  // States
  success: { kind: 'tokenRef', ref: 'palette.primary3.base' },
  warning: { kind: 'tokenRef', ref: 'palette.primary4.base' },
  error: { kind: 'custom', hex: '#F44336' },
  info: { kind: 'tokenRef', ref: 'palette.primary2.base' },
};
```

## 7. Tailwind Integration

### 7.1 CSS-Variablen Export

```typescript
// theme-provider.tsx
export function exportThemeToCSS(theme: ThemeTokens): string {
  const vars = generateCSSVariables(theme);
  
  return `:root {
    /* Palette */
    --c-primary-1: ${vars['palette.primary1.base']};
    --c-primary-1-accent1: ${vars['palette.primary1.accents.accent1']};
    --c-primary-1-accent2: ${vars['palette.primary1.accents.accent2']};
    /* ... */
    
    /* Semantic */
    --c-link: ${vars['semantic.link']};
    --c-link-hover: ${vars['semantic.linkHover']};
    --c-page-bg: ${vars['semantic.pageBg']};
    --c-card-bg: ${vars['semantic.cardBg']};
    --c-body-text: ${vars['semantic.bodyText']};
    /* ... */
  }`;
}
```

### 7.2 Tailwind-Nutzung

```tsx
// Komponente
<div className="bg-[var(--c-card-bg)] text-[var(--c-body-text)]">
  <h2 className="text-[var(--c-heading-text)]">Heading</h2>
  <a className="text-[var(--c-link)] hover:text-[var(--c-link-hover)]">
    Link
  </a>
  <button className="bg-[var(--c-button-primary-bg)] text-[var(--c-button-primary-text)]">
    Primary Button
  </button>
</div>
```

### 7.3 Dynamic Theme Loading

```typescript
// ThemeProvider Component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeTokens | null>(null);
  
  useEffect(() => {
    loadActiveTheme().then(theme => {
      setTheme(theme);
      applyCSSVariables(theme);
    });
  }, []);
  
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

function applyCSSVariables(theme: ThemeTokens) {
  const css = exportThemeToCSS(theme);
  const style = document.createElement('style');
  style.id = 'theme-variables';
  style.textContent = css;
  
  const existing = document.getElementById('theme-variables');
  if (existing) existing.remove();
  
  document.head.appendChild(style);
}
```

## 8. Implementierungs-Reihenfolge

### Phase 1: Foundation (Tag 1)
1. ✅ Datenbank-Schema anlegen
2. ✅ Types definieren (ThemeTokens, ColorValue, etc.)
3. ✅ Color-Utilities (normalizeHex, luminance, contrast, autoTextColor)
4. ✅ Accent-Generator

### Phase 2: Token-System (Tag 2)
5. ✅ Token-Resolver mit Zyklus-Erkennung
6. ✅ CSS-Variablen-Export
7. ✅ Default-Paletten & Semantic-Tokens
8. ✅ Theme-Loader Service

### Phase 3: UI-Komponenten (Tag 3-4)
9. ✅ UnifiedColorPicker (3 Tabs)
10. ✅ PaletteEditor (5x3 Grid)
11. ✅ TextMappingEditor
12. ✅ SemanticColorsEditor

### Phase 4: Preview & Integration (Tag 5)
13. ✅ ThemePreview mit Live-Rendering
14. ✅ ThemeProvider + CSS-Injection
15. ✅ Preset-System (laden/speichern)
16. ✅ Export/Import (JSON)

### Phase 5: Testing & Polish (Tag 6)
17. ✅ Kontrast-Validierung & Warnungen
18. ✅ Zyklus-Erkennung testen
19. ✅ UI-Polish & Responsive
20. ✅ Dokumentation

## 9. Offene Fragen / Rückfragen

### ❓ Frage 1: Akzent-Generierung
**Vorschlag:** 
- Accent1 (hell): +40% Helligkeit, -20% Sättigung → Hintergründe
- Accent2 (dunkel): -25% Helligkeit → Hover-States
- Accent3 (muted): -50% Sättigung → Borders

**Alternative:** User kann HSL-Shifts selbst definieren?

Gute Idee - wir könnten einen HSL-Shift zu dem berechneten Wert in der DB speichern.
Also jede Akzent-Farbe per HSL-Shift speichern. 
Auf diese weise können wir bei einem Palettenwechsel gut profitieren. 

### ❓ Frage 2: Text-Auto-Modus Logik
**Vorschlag:** 
- Kontrast ≥ 7:1 → AAA (beste Wahl)
- Kontrast ≥ 4.5:1 → AA (akzeptabel)
- Kontrast < 4.5:1 → ⚠️ Warning, aber trotzdem nehmen

**User kann zwischen schwarz/weiß wählen im Custom-Modus?**

Später kann er mit einem Colorpicker für ein Element das machen. Er soll aber 
vordringlich eben Den Text-Automodus nehmen, geben wir ihm vielleicht noch eine Wert 
zwischen AAA und AA

### ❓ Frage 3: Preset-System
- Vordefinierte Paletten nur einmal in DB oder als SQL-Seeding?
- User kann eigene Presets erstellen und teilen?
- Import/Export als JSON oder CSV?

- Ja, der Benutzer soll eigene Presets auch speichern können. Die gespeicherten 
Presets können dann in der "normalen" JSON-Datei exportiert werden. 
Das Preset-System sollte mit ca. 100 guten Presets vorbefüllt werden. 

### ❓ Frage 4: Migrationskonzept
- Was passiert mit bestehenden hardcoded Farben im Code?
- Schrittweise Migration oder Big-Bang-Umstellung?
- Fallback, wenn Theme nicht geladen werden kann?

Wir nehmen eine Palette mit der Primärfarbe 1 = hell; die SChriften dementsprechend passend.
Ein Standard-Theming (5 Farben, in Pastell gehalten) sollte implementiert werden.  

### ❓ Frage 5: Performance
- CSS-Variablen clientseitig injizieren oder server-side?   -> nimm das einfachere.
- Theme wechseln ohne Reload?
- Caching-Strategie für Themes?

Theme sollte ohne Reload gewechselt werden. Caching benötigen wir nicht 
Das bestehende Theming für die Editor-SEiten 
im Übrigen beibehalten!

## 10. Zusammenfassung

**Dieses System bietet:**
- ✅ Konsistentes Design-Token-Management
- ✅ Barrierefreiheit durch Auto-Kontrast
- ✅ Flexibilität durch 3-Level-Hierarchie (Palette → Semantik → Verwendung)
- ✅ Wartbarkeit durch Token-Referenzen
- ✅ Performance durch CSS-Variablen
- ✅ UX durch Live-Preview

**Nächste Schritte:**
1. Feedback zu Architektur einholen
2. Offene Fragen klären
3. Mit Phase 1 (Foundation) beginnen

---

Weitere Infos: Die Auswahl der Vordefinierten Pallette sollte in einem großen, mehrspaltigem Grid passieren, zwecks übersichtlichkeit. Dort wird die Pallettenfarben 
per zusammenhängenden Rechteck mit 5 Farben dargestellt. 

**Bereit für Implementierung!** 🎨



Ich möchte, dass dieser Bereich: Presets anzeigen, Als Presets speichern, JSON export 
in den Header, zusammen mit der Farbharmonie befördert wird. 
Auf diese Weise sieht man die 3 Buttons auf jeder Tab-Seite. 
Auf der Seite "Farbpalette" sollten die HSL-dropdown-buttons etwas größer sein und den Namen "anpassen" haben. 
Die Snackbars: 
Success



Warning



Error



Info



Können entfallen. Also auch die semantischen FArben dafür. 

Die Seite "Semantische Farben" muss aufgeräumter sein: 
Vorschlag: links eine Tabelle mit den semmantischen Farben

Link
Link Hover, 
...
Button primary
Button secondary

usw. Wenn man auf einen Entrag klickt/fokussiert, können rechts die Farben ausgewählt 
werden. 



