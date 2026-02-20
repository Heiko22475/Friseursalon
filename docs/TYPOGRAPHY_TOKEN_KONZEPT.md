# Typography Token System – Konzept & Implementierungsplan (v2)

**Datum:** 2026-02-20  
**Status:** Konzept / Entwurf  
**Betrifft:** Visual Editor + Website-JSON

---

## 1. Problem

Derzeit liegen `fontSize`, `fontFamily`, `lineHeight`, `letterSpacing` und `textTransform`
direkt als Inline-Styles auf jedem einzelnen Element — ca. **90× redundant** im JSON.
Ändert man einen Schriftstil, muss man alle Elemente einzeln anfassen.

---

## 2. Ziele (aktualisiert)

| # | Ziel |
|---|------|
| 1 | **Font-Tokens**: Benannte Schriftarten (`font-title`, `font-text`, `font-helper`) als eigene Ebene |
| 2 | **Typography-Tokens**: Dynamische Anzahl (keine feste Obergrenze) – KI befüllt diese vor dem Website-Build |
| 3 | **4-Ebenen-Hierarchie**: Font-Token → Typography-Token → Class/Style → Element-Inline |
| 4 | **Hover-Styles** direkt an Tokens und Klassen (Links, Buttons, Nav-Items) |
| 5 | **Delete-Protection**: Token nur löschbar, wenn nichts darauf verweist |
| 6 | **UX-First**: Klickt der User ein Text-Element an → primär Typography-Picker, nicht CSS-Panel |
| 7 | **KI-Workflow**: KI definiert Tokens zuerst, nutzt nur diese beim Website-Aufbau |

---

## 3. Die 4-Ebenen-Hierarchie

```
┌──────────────────────────────────────────────────────────┐
│  Ebene 1: FONT-TOKENS          content.fontTokens         │
│  font-title = "Playfair Display"                          │
│  font-text  = "Inter"                                     │
│  font-ui    = "Inter"                                     │
│           ↓  referenziert von                             │
│  Ebene 2: TYPOGRAPHY-TOKENS    content.typographyTokens   │
│  titel-1   → font-title, 3rem, 700, 1.1lh                │
│  text-normal → font-text,  1rem, 400, 1.6lh              │
│  label-sm  → font-ui,   0.875rem, 600, UPPERCASE         │
│           ↓  referenziert von                             │
│  Ebene 3: KLASSEN              content.styles             │
│  .hero-title → _typo: "titel-1" + color-override         │
│  .nav-link   → _typo: "label-sm" + hover: color          │
│           ↓  override by                                  │
│  Ebene 4: ELEMENT (Inline)     element.styles             │
│  Sonderfälle, explizite Ausnahmen                         │
└──────────────────────────────────────────────────────────┘
```

**Auflösungsreihenfolge** (niedrig = Basis → hoch = überschreibt):

```
Font-Token (fontFamily-Basis)
  → Typography-Token (vollständige Schriftstil-Basis)
    → Typography-Token Hover (optionale Hover-Variante)
      → Class Override (einzelne Properties)
        → Class Pseudo-Styles (hover/focus/active auf Klassen-Ebene)
          → Element Inline (Sonderfälle)
```

---

## 4. JSON-Struktur

### 4.1 `content.fontTokens` – Ebene 1

```jsonc
{
  "fontTokens": {
    "font-title": {
      "label": "Überschriften-Schrift",
      "fontFamily": "playfair-display",
      "description": "Für alle Titel und Überschriften",
      "standard": false
    },
    "font-text": {
      "label": "Fließtext-Schrift",
      "fontFamily": "inter",
      "description": "Für Absätze, Listen, Beschreibungen",
      "standard": true
    },
    "font-ui": {
      "label": "UI-Schrift",
      "fontFamily": "inter",
      "description": "Buttons, Labels, Navigation, Tags",
      "standard": false
    },
    "font-accent": {
      "label": "Akzent-Schrift",
      "fontFamily": "dancing-script",
      "description": "Zitate, Hervorhebungen (optional)",
      "standard": false
    }
  }
}
```

**Regeln:**
- Schlüssel beginnen mit `font-` (Konvention, nicht erzwungen)
- `fontFamily` ist ein Font-ID aus dem globalen Font-Katalog
- Dynamische Anzahl (1–n, keine Obergrenze)
- Genau **ein** Font-Token muss `"standard": true` haben (Fallback/Default)
- Löschen eines Font-Tokens in Benutzung → Dialog bietet an, alle Referenzen auf den Standard-Font umzustellen
- Der Standard-Font selbst kann nicht gelöscht werden (nur umbenannt/geändert)

---

### 4.2 `content.typographyTokens` – Ebene 2

```jsonc
{
  "typographyTokens": {
    "titel-1": {
      "label": "Titel 1 (Display)",
      "fontToken": "font-title",
      "fontSize": { "desktop": "3.5rem", "tablet": "2.75rem", "mobile": "2rem" },
      "fontWeight": 700,
      "lineHeight": { "desktop": "1.1", "tablet": "1.15", "mobile": "1.2" },
      "letterSpacing": "-0.02em",
      "textTransform": "none",
      "color": { "kind": "tokenRef", "ref": "semantic.headingColor" },
      "hover": null
    },
    "titel-2": {
      "label": "Titel 2 (Section)",
      "fontToken": "font-title",
      "fontSize": { "desktop": "2.25rem", "tablet": "1.875rem", "mobile": "1.5rem" },
      "fontWeight": 700,
      "lineHeight": { "desktop": "1.2", "tablet": "1.25", "mobile": "1.3" },
      "letterSpacing": "-0.01em",
      "textTransform": "none",
      "color": { "kind": "tokenRef", "ref": "semantic.headingColor" },
      "hover": null
    },
    "titel-3": {
      "label": "Titel 3 (Card/Block)",
      "fontToken": "font-title",
      "fontSize": { "desktop": "1.5rem", "tablet": "1.375rem", "mobile": "1.25rem" },
      "fontWeight": 600,
      "lineHeight": { "desktop": "1.3", "tablet": "1.3", "mobile": "1.35" },
      "letterSpacing": "0",
      "textTransform": "none",
      "color": { "kind": "tokenRef", "ref": "semantic.headingColor" },
      "hover": null
    },
    "text-xl": {
      "label": "Text XL (Lead/Intro)",
      "fontToken": "font-text",
      "fontSize": { "desktop": "1.25rem", "tablet": "1.125rem", "mobile": "1.0625rem" },
      "fontWeight": 400,
      "lineHeight": { "desktop": "1.6", "tablet": "1.6", "mobile": "1.6" },
      "letterSpacing": "0",
      "textTransform": "none",
      "color": { "kind": "tokenRef", "ref": "semantic.bodyColor" },
      "hover": null
    },
    "text-normal": {
      "label": "Text Normal",
      "fontToken": "font-text",
      "fontSize": { "desktop": "1rem", "tablet": "1rem", "mobile": "0.9375rem" },
      "fontWeight": 400,
      "lineHeight": { "desktop": "1.65", "tablet": "1.65", "mobile": "1.65" },
      "letterSpacing": "0",
      "textTransform": "none",
      "color": { "kind": "tokenRef", "ref": "semantic.bodyColor" },
      "hover": null
    },
    "text-sm": {
      "label": "Text Klein (Caption)",
      "fontToken": "font-text",
      "fontSize": { "desktop": "0.875rem", "tablet": "0.875rem", "mobile": "0.8125rem" },
      "fontWeight": 400,
      "lineHeight": { "desktop": "1.5", "tablet": "1.5", "mobile": "1.5" },
      "letterSpacing": "0",
      "textTransform": "none",
      "color": { "kind": "tokenRef", "ref": "semantic.mutedColor" },
      "hover": null
    },
    "label-normal": {
      "label": "Label (Button/Tag)",
      "fontToken": "font-ui",
      "fontSize": { "desktop": "0.9375rem", "tablet": "0.9375rem", "mobile": "0.875rem" },
      "fontWeight": 600,
      "lineHeight": { "desktop": "1", "tablet": "1", "mobile": "1" },
      "letterSpacing": "0.04em",
      "textTransform": "none",
      "color": null,
      "hover": null
    },
    "label-caps": {
      "label": "Label Caps (Nav/Tag)",
      "fontToken": "font-ui",
      "fontSize": { "desktop": "0.8125rem", "tablet": "0.8125rem", "mobile": "0.8125rem" },
      "fontWeight": 600,
      "lineHeight": { "desktop": "1", "tablet": "1", "mobile": "1" },
      "letterSpacing": "0.1em",
      "textTransform": "uppercase",
      "color": null,
      "hover": {
        "color": { "kind": "tokenRef", "ref": "semantic.primary" },
        "textDecoration": "none"
      }
    },
    "link": {
      "label": "Link (Fließtext)",
      "fontToken": "font-text",
      "fontSize": { "desktop": "1rem", "tablet": "1rem", "mobile": "0.9375rem" },
      "fontWeight": 400,
      "lineHeight": { "desktop": "1.65", "tablet": "1.65", "mobile": "1.65" },
      "letterSpacing": "0",
      "textTransform": "none",
      "color": { "kind": "tokenRef", "ref": "semantic.primary" },
      "hover": {
        "color": { "kind": "tokenRef", "ref": "semantic.primaryDark" },
        "textDecoration": "underline"
      }
    }
  }
}
```

**Regeln:**
- `fontToken` referenziert einen Key aus `fontTokens`
- `fontSize` und `lineHeight` sind responsive CSS-Strings
- `color: null` → Farbe wird vom Parent-Container geerbt (sinnvoll für Buttons)
- `hover: null` → kein Hover-Effekt auf Token-Ebene
- **Dynamische Anzahl** – keine feste Obergrenze; KI entscheidet wie viele Tokens sinnvoll sind
- Genau **ein** Typography-Token muss `"standard": true` haben (Fallback/Default)
- Löschen eines Typography-Tokens in Benutzung → Dialog bietet an, alle `_typo`-Referenzen auf den Standard-Token umzustellen
- Der Standard-Token selbst kann nicht gelöscht werden

---

### 4.3 `content.styles` – Ebene 3 (Klassen)

```typescript
// Erweiterung NamedStyle:
interface NamedStyle {
  desktop: Partial<StyleProperties>;
  tablet?: Partial<StyleProperties>;
  mobile?: Partial<StyleProperties>;
  pseudoStyles?: Partial<Record<PseudoState, PseudoStateStyles>>;
  _extends?: string;        // bestehend: Klassen-Vererbung
  _typo?: string;           // NEU: Referenz auf typographyTokens-Key
}
```

```jsonc
"styles": {
  "hero-title": {
    "_typo": "titel-1",
    "desktop": { "color": { "kind": "custom", "hex": "#FFFFFF" } }
  },
  "nav-link": {
    "_typo": "label-caps",
    "desktop": {},
    "pseudoStyles": {
      "hover": {
        "desktop": { "color": { "kind": "tokenRef", "ref": "semantic.primary" } }
      }
    }
  },
  "btn-primary": {
    "_typo": "label-normal",
    "desktop": {
      "backgroundColor": { "kind": "tokenRef", "ref": "semantic.primary" },
      "color": { "kind": "custom", "hex": "#FFFFFF" },
      "paddingTop": { "value": 12, "unit": "px" },
      "paddingBottom": { "value": 12, "unit": "px" }
    },
    "pseudoStyles": {
      "hover": {
        "desktop": {
          "backgroundColor": { "kind": "tokenRef", "ref": "semantic.primaryDark" },
          "transform": "translateY(-2px)"
        }
      }
    }
  }
}
```

---

## 5. TypeScript-Typen

### 5.1 `src/visual-editor/types/typographyTokens.ts` (neue Datei)

```typescript
import type { ColorValue } from '../../types/theme';

// ===== FONT TOKENS (Ebene 1) =====

export interface FontToken {
  /** Anzeigename im Editor */
  label: string;
  /** Font-ID aus dem globalen Font-Katalog (z.B. 'inter', 'playfair-display') */
  fontFamily: string;
  /** Optionale Beschreibung für den Editor */
  description?: string;
  /** Genau ein FontToken muss standard=true haben (Fallback bei Löschung) */
  standard?: boolean;
}

/** Map: font-token-key → FontToken */
export type FontTokenMap = Record<string, FontToken>;

// ===== TYPOGRAPHY TOKENS (Ebene 2) =====

export interface ResponsiveStringValue {
  desktop: string;
  tablet?: string;
  mobile?: string;
}

/** Erlaubte Properties im Token-Hover-Overlay */
export interface TypographyTokenHover {
  color?: ColorValue;
  textDecoration?: 'none' | 'underline' | 'line-through';
  letterSpacing?: string;
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
}

export interface TypographyToken {
  /** Anzeigename */
  label: string;
  /** Referenz auf einen FontToken-Key */
  fontToken: string;
  /** Responsive CSS-String fontSize (z.B. '1.5rem', '24px') */
  fontSize: ResponsiveStringValue;
  /** CSS fontWeight */
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /** Responsive CSS-String lineHeight (z.B. '1.5', '24px') */
  lineHeight: ResponsiveStringValue;
  /** CSS letterSpacing (z.B. '-0.02em', '0') */
  letterSpacing: string;
  /** CSS textTransform */
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Standard-Farbe (null = erbt vom Parent) */
  color: ColorValue | null;
  /** Hover-Overlay (null = kein Hover-Effekt) */
  hover: TypographyTokenHover | null;
  /** Genau ein TypographyToken muss standard=true haben (Fallback bei Löschung) */
  standard?: boolean;
}

/** Map: token-key → TypographyToken */
export type TypographyTokenMap = Record<string, TypographyToken>;

// ===== DEFAULTS =====

export const DEFAULT_FONT_TOKEN: FontToken = {
  label: 'Neue Schriftart',
  fontFamily: 'inter',
  description: '',
};

export const DEFAULT_TYPOGRAPHY_TOKEN: TypographyToken = {
  label: 'Neuer Stil',
  fontToken: '',          // muss vom Editor ausgefüllt werden
  fontSize: { desktop: '1rem', tablet: '1rem', mobile: '1rem' },
  fontWeight: 400,
  lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
  letterSpacing: '0',
  textTransform: 'none',
  color: null,
  hover: null,
};

// ===== REFERENZPRÜFUNG (Delete-Protection) =====

/** Gibt alle TypographyToken-Keys zurück, die den angegebenen FontToken-Key nutzen */
export function getTypoTokensUsingFontToken(
  typoTokens: TypographyTokenMap,
  fontTokenKey: string
): string[] {
  return Object.entries(typoTokens)
    .filter(([, t]) => t.fontToken === fontTokenKey)
    .map(([k]) => k);
}

/** Gibt alle Klassen-Keys zurück, die den angegebenen TypoToken-Key nutzen */
export function getStylesUsingTypoToken(
  styles: Record<string, { _typo?: string }>,
  typoKey: string
): string[] {
  return Object.entries(styles)
    .filter(([, s]) => s._typo === typoKey)
    .map(([k]) => k);
}
```

### 5.2 Erweiterung `NamedStyle` in `styles.ts`

```typescript
export interface NamedStyle {
  desktop: Partial<StyleProperties>;
  tablet?: Partial<StyleProperties>;
  mobile?: Partial<StyleProperties>;
  pseudoStyles?: Partial<Record<PseudoState, PseudoStateStyles>>;
  _extends?: string;
  _typo?: string;   // ← NEU: Referenz auf typographyTokens-Key
}
```

### 5.3 Erweiterung `EditorState`

```typescript
interface EditorState {
  // ...bestehende Felder...
  globalStyles: GlobalStyles;
  fontTokens: FontTokenMap;             // ← NEU (Ebene 1)
  typographyTokens: TypographyTokenMap; // ← NEU (Ebene 2)
}
```

---

## 6. KI-Workflow: Token-First Website-Build

### 6.1 Ablauf

```
KI bekommt Briefing (Branche, Stil, Farbschema)
        ↓
Schritt 1: KI definiert fontTokens (2–4 Schriften)
        ↓
Schritt 2: KI definiert typographyTokens (5–12 Stile)
           → benutzt ausschließlich die definierten fontTokens
        ↓
Schritt 3: KI baut Seitenstruktur
           → Klassen referenzieren ausschließlich definierte typographyTokens
           → Kein Inline-fontSize, kein Inline-fontFamily
        ↓
Schritt 4: Feinjustierung durch User im Editor
```

### 6.2 KI-Anweisung (Prompt-Template für AI-Generation)

```
TYPOGRAPHY CONSTRAINTS:
- Du darfst NUR die definierten typographyTokens verwenden
- Kein Element darf fontSize, fontFamily, fontWeight als Inline-Style haben
- Klassen mit Schriftstilen müssen _typo auf einen der definierten Token-Keys setzen
- fontTokens: MUST be defined FIRST before typographyTokens
- typographyTokens: MUST be defined BEFORE pages/elements
- Responsive fontSize/lineHeight: immer alle drei Viewports angeben
- Anzahl Tokens: so viele wie nötig – typischerweise 5–12 für normale Sites

WORKFLOW:
1. content.fontTokens → 2–4 Einträge (font-title, font-text, ggf. font-ui, font-accent)
2. content.typographyTokens → 5–12 Einträge, alle fontToken-Referenzen valide
3. content.styles → Klassen mit _typo-Referenzen (keine typographie-Inline-Styles)
4. pages → Elemente mit classNames (keine Typographie als Inline-Style)
```

### 6.3 Validierungsregel im Converter/Loader

```typescript
function validateTypographyIntegrity(content: WebsiteContent): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // 1. Alle TypoToken-fontToken-Referenzen valide?
  for (const [key, token] of Object.entries(content.typographyTokens ?? {})) {
    if (token.fontToken && !content.fontTokens?.[token.fontToken]) {
      warnings.push({
        level: 'error',
        message: `TypoToken "${key}": fontToken "${token.fontToken}" nicht gefunden`
      });
    }
  }

  // 2. Alle _typo-Referenzen in Klassen valide?
  for (const [cls, style] of Object.entries(content.styles ?? {})) {
    if (style._typo && !content.typographyTokens?.[style._typo]) {
      warnings.push({
        level: 'warning',
        message: `Klasse "${cls}": _typo "${style._typo}" nicht gefunden`
      });
    }
  }

  return warnings;
}
```

---

## 7. Style-Auflösung (styleResolver.ts)

```typescript
// 4-Ebenen-Auflösung: FontToken → TypoToken → Class → Element
function resolveTypographyToken(
  token: TypographyToken,
  fontTokens: FontTokenMap,
  viewport: VEViewport,
  pseudo?: 'hover'
): Partial<StyleProperties> {
  // Ebene 1: fontFamily aus dem FontToken
  const fontFamily = fontTokens[token.fontToken]?.fontFamily ?? token.fontToken;

  const base: Partial<StyleProperties> = {
    fontFamily,
    fontSize: parseCssString(token.fontSize[viewport] ?? token.fontSize.desktop),
    fontWeight: token.fontWeight,
    lineHeight: parseCssString(token.lineHeight[viewport] ?? token.lineHeight.desktop),
    letterSpacing: token.letterSpacing ? parseLs(token.letterSpacing) : undefined,
    textTransform: token.textTransform,
    ...(token.color ? { color: token.color } : {}),
  };

  if (pseudo === 'hover' && token.hover) {
    return {
      ...base,
      ...(token.hover.color        ? { color: token.hover.color } : {}),
      ...(token.hover.textDecoration ? { textDecoration: token.hover.textDecoration } : {}),
      ...(token.hover.letterSpacing  ? { letterSpacing: parseLs(token.hover.letterSpacing) } : {}),
      ...(token.hover.fontWeight     ? { fontWeight: token.hover.fontWeight } : {}),
    };
  }

  return base;
}

// Auflösung einer NamedStyle-Klasse mit Token-Support
function resolveNamedStyle(
  style: NamedStyle,
  viewport: VEViewport,
  typoTokens: TypographyTokenMap,
  fontTokens: FontTokenMap,
  pseudo?: PseudoState
): Partial<StyleProperties> {
  const token = style._typo ? typoTokens[style._typo] : null;

  // Ebene 2: Typography-Token Basis
  const tokenBase = token
    ? resolveTypographyToken(token, fontTokens, viewport)
    : {};

  // Ebene 2: Token-Hover (wenn pseudo=hover)
  const tokenHover = pseudo === 'hover' && token?.hover
    ? resolveTypographyToken(token, fontTokens, viewport, 'hover')
    : {};

  // Ebene 3a: Klassen-eigene Properties
  const classPros = { ...style.desktop, ...(viewport !== 'desktop' ? (style[viewport] ?? {}) : {}) };

  // Ebene 3b: Klassen-Pseudo-Styles
  const classPseudo = pseudo && style.pseudoStyles?.[pseudo]
    ? { ...style.pseudoStyles[pseudo]!.desktop, ...(style.pseudoStyles[pseudo]![viewport] ?? {}) }
    : {};

  return { ...tokenBase, ...tokenHover, ...classPros, ...classPseudo };
}
```

---

## 8. Editor-UI

### 8.1 Typography-Panel (linke Seitenleiste, eigener Tab)

```
[ Pages ]  [ Elements ]  [ Styles ]  [🅣 Typography]  [ Assets ]

┌───────────────────────────────────────────────────┐
│  🅣 Typography                     [+ Font] [+ Stil] │
├───────────────────────────────────────────────────┤
│  ▸ SCHRIFTARTEN (Font-Tokens)                     │
│                                                   │
│  ● font-title  "Playfair Display"                 │
│    Überschriften-Schrift              [✏️]  [🗑]  │
│  ★ font-text   "Inter"             ← STANDARD     │
│    Fließtext-Schrift                  [✏️]  [🔒]  │
│  ● font-ui     "Inter"                            │
│    UI-Schrift                         [✏️]  [🗑]  │
│    🔒 = Standard, nicht löschbar                  │
│  [+ Schriftart hinzufügen]                        │
│                                                   │
├───────────────────────────────────────────────────┤
│  ▸ TEXTSTILE (Typography-Tokens)                  │
│                                                   │
│  ● titel-1     "Titel 1 (Display)"                │
│    Playfair Display · 3.5rem · 700   [✏️]  [🗑]  │
│  ● titel-2     "Titel 2"                          │
│    Playfair Display · 2.25rem · 700  [✏️]  [🗑]  │
│  ★ text-normal "Text Normal"      ← STANDARD     │
│    Inter · 1rem · 400                [✏️]  [🔒]  │
│  ● label-caps  "Label Caps"                       │
│    Inter · 0.8rem · 600 · CAPS · 🖱  [✏️]  [🗑]  │
│  [+ Textstil hinzufügen]                          │
└───────────────────────────────────────────────────┘
```

### 8.2 Font-Token Editor (Flyout)

```
┌──────────────────────────────────────────┐
│  ✏️ font-title bearbeiten                       │
├──────────────────────────────────────────┤
│  Anzeigename:  [Überschriften-Schrift  ]          │
│  Schriftart:   [Playfair Display     ▼]           │
│                (Font-Picker Dropdown)             │
│  Beschreibung: [Für alle Titel...      ]          │
│                                                   │
│  ── Standard-Schriftart ──────────────────  │
│  Als Standard-Font festlegen     [ ]◇              │
│  (◇ = Checkbox; Standard-Font = Fallback           │
│    bei Löschung anderer Fonts)                    │
│                                                   │
│  Benutzt von:  titel-1, titel-2, titel-3          │
│                                                   │
│  [ Abbrechen ]        [ Speichern ]                │
└──────────────────────────────────────────┘
```

### 8.3 Typography-Token Editor (Flyout)

```
┌──────────────────────────────────────────┐
│  ✏️ titel-1 bearbeiten                   │
├──────────────────────────────────────────┤
│  Anzeigename:  [Titel 1 (Display)      ] │
│  Schriftart:   [font-title ▼]            │
│                = Playfair Display        │
│  Gewicht:      [700 ▼]                   │
│                                          │
│  ── Größe (responsive) ─────────────── │
│  🖥 Desktop: [3.5rem] 📱 Tablet: [2.75rem] │
│  📲 Mobile:  [2rem  ]                    │
│                                          │
│  ── Zeilenabstand (responsive) ──────── │
│  🖥 [1.1  ]  📱 [1.15 ]  📲 [1.2  ]    │
│                                          │
│  Buchstabenabstand: [-0.02em ]           │
│  Schreibweise:      [Normal       ▼]     │
│  Farbe:             [▓ Heading Color ▼]  │
│                                          │
│  ── Hover-State ────────────────────── │
│  Hover aktivieren            [OFF → ON]  │
│  (wenn ON:)                              │
│  Farbe:      [▓ Primary ▼]              │
│  Dekoration: [Unterstrichen ▼]          │
│                                          │
│  ── Live-Vorschau ─────────────────── │
│  Beispiel-Überschrift                    │
│  (rendert im Token-Stil, hover simuliert)│
│                                          │
│  ── Standard-Textstil ───────────────── │
│  Als Standard-Textstil festlegen   [ ]◇  │
│  (◇ = Checkbox; Standard = Fallback bei  │
│   Löschung anderer Textstile)            │
│                                          │
│  Benutzt von: .hero-title, .page-title  │
│                                          │
│  [ Abbrechen ]        [ Speichern ]      │
└──────────────────────────────────────────┘
```

### 8.4 Klassen-Editor: Token-Referenz + Overrides

```
┌─────────────────────────────────────────────┐
│  🅣 Textstil                                 │
│  [titel-1 ▼]  "Titel 1 (Display)"           │
│  → Schrift, Größe, Gewicht aus Token         │
├─────────────────────────────────────────────┤
│  Overrides (überschreiben Token):            │
│  Farbe:   [▓ Weiß #FFFFFF ▼]                │
│  Gewicht: [ – kein Override – ]              │
├─────────────────────────────────────────────┤
│  🖱 Hover-Styles (Klassen-Ebene)             │
│  [ + Hover-Style hinzufügen ]               │
│  Farbe:       [▓ Primary ▼]                 │
│  Hintergrund: [▓ Keiner ▼]                  │
│  Transform:   [translateY(-2px)    ]         │
│  Dekoration:  [Unterstrichen ▼]             │
├─────────────────────────────────────────────┤
│  🖱 Focus / Active ...                       │
└─────────────────────────────────────────────┘
```

---

### 8.5 Text-Element-Picker: primäre UX bei Textauswahl ← KERN-FEATURE

Wenn der User ein **Text-Element** im Canvas **einfach anklickt**, öffnet sich
ein **Floating Typography-Picker** — nicht das technische CSS-Panel.

```
┌─────────────────────────────────────────────┐
│  🅣 Textstil wählen              [×]          │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Titel 1  │  │ Titel 2  │  │ Titel 3  │  │
│  │ Playfair │  │ Playfair │  │ Playfair │  │
│  │ 3.5rem   │  │ 2.25rem  │  │ 1.5rem   │  │
│  │ 700      │  │ 700      │  │ 600      │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Text XL  │  │ Text     │  │ Text SM  │  │
│  │ Inter    │  │ Normal   │  │ Caption  │  │
│  │ 1.25rem  │  │ 1rem     │  │ 0.875rem │  │
│  │ 400      │  │ 400      │  │ 400      │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐               │
│  │  Label   │  │  Label   │               │
│  │  Normal  │  │   Caps   │               │
│  │ 0.94rem  │  │ 0.81rem  │               │
│  │ 600      │  │ 600 CAPS │               │
│  └──────────┘  └──────────┘               │
│                                             │
│  ✓ Aktuell: text-normal                    │
│                                             │
│  [Erweiterte Einstellungen →]               │
└─────────────────────────────────────────────┘
```

**Verhalten:**
- Jede Karte: Live-Vorschau im echten Font + echter Größe des Tokens
- Aktuell aktiver Token: hervorgehoben (blauer Rahmen)
- Klick übernimmt den Token → setzt `_typo` auf der primären Klasse des Elements
- `[Erweiterte Einstellungen →]` öffnet das vollständige Properties-Panel
- Positionierung: Floating neben/unter dem selektierten Element im Canvas
- Schließt sich wenn ein anderes Element selektiert wird oder `[×]` geklickt wird

**Klick-Gesten:**
| Geste | Aktion |
|-------|--------|
| Einfachklick auf Text-Element | Typography-Picker öffnen |
| Doppelklick auf Text-Element | TipTap-Texteditor öffnen |
| Klick auf andere Element-Typen | Properties-Panel (kein Typography-Picker) |

---

## 9. Delete-Verhalten (mit Standard-Ersetzung)

### Standard-Token kann nicht gelöscht werden

```
User klickt [🗑] auf "font-text" (= Standard-Font)
    ↓
Hinweis:
──────────────────────────────────────
"font-text" ist der Standard-Font und kann nicht
gelöscht werden. Wähle zuerst einen anderen Font
als Standard, bevor du diesen löschst.
──────────────────────────────────────
[ OK ]
```

### Font-Token löschen (in Benutzung, nicht Standard)

```
User klickt [🗑] auf "font-title"
    ↓
Prüfung: getTypoTokensUsingFontToken(tokens, "font-title")
    → ["titel-1", "titel-2", "titel-3"]
    ↓
Standard-Font = "font-text" (Inter)
    ↓
Dialog:
──────────────────────────────────────
"font-title" löschen?
Folgende Textstile verwenden diese Schriftart:
  • titel-1 – Titel 1 (Display)
  • titel-2 – Titel 2 (Section)
  • titel-3 – Titel 3 (Card)

Diese werden auf den Standard-Font "font-text"
(Inter) umgestellt. Du kannst anschließend im
Visual Editor die betroffenen Stellen anpassen.
──────────────────────────────────────
[ Abbrechen ]  [ Löschen & ersetzen ]
```

→ Aktion bei "Löschen & ersetzen":
1. Alle TypoTokens mit `fontToken: "font-title"` → `fontToken: "font-text"`
2. Font-Token `"font-title"` wird gelöscht

### Typography-Token löschen (in Benutzung, nicht Standard)

```
User klickt [🗑] auf "label-caps"
    ↓
Prüfung: getStylesUsingTypoToken(globalStyles, "label-caps")
    → ["nav-link", "footer-link", "btn-ghost"]
    ↓
Standard-Typo = "text-normal" (Text Normal)
    ↓
Dialog:
──────────────────────────────────────
"label-caps" löschen?
Folgende Klassen verwenden diesen Textstil:
  • nav-link
  • footer-link
  • btn-ghost

Diese werden auf den Standard-Textstil "text-normal"
(Text Normal) umgestellt. Du kannst anschließend im
Visual Editor die betroffenen Stellen anpassen.
──────────────────────────────────────
[ Abbrechen ]  [ Löschen & ersetzen ]
```

→ Aktion bei "Löschen & ersetzen":
1. Alle Klassen mit `_typo: "label-caps"` → `_typo: "text-normal"`
2. Typography-Token `"label-caps"` wird gelöscht

### Löschen wenn nicht in Benutzung (und nicht Standard)

```
Prüfung ergibt leere Liste → einfacher Bestätigungsdialog:
──────────────────────────────────────
"titel-1" wirklich löschen?
Dieser Textstil wird von keiner Klasse verwendet.
──────────────────────────────────────
[ Abbrechen ]  [ Löschen ]
```

---

## 10. Reducer-Actions

```typescript
type EditorAction =
  // ...bestehende Actions...

  // Font-Tokens (Ebene 1)
  | { type: 'SET_FONT_TOKEN'; key: string; token: FontToken }
  | { type: 'SET_STANDARD_FONT_TOKEN'; key: string }      // setzt standard=true, alle anderen auf false
  | { type: 'DELETE_FONT_TOKEN'; key: string; replaceWith: string } // ersetzt Referenzen mit Standard-Font

  // Typography-Tokens (Ebene 2)
  | { type: 'SET_TYPOGRAPHY_TOKEN'; key: string; token: TypographyToken }
  | { type: 'SET_STANDARD_TYPOGRAPHY_TOKEN'; key: string } // setzt standard=true, alle anderen auf false
  | { type: 'DELETE_TYPOGRAPHY_TOKEN'; key: string; replaceWith: string } // ersetzt _typo-Refs mit Standard-Token
  | { type: 'RENAME_TYPOGRAPHY_TOKEN'; oldKey: string; newKey: string } // migriert alle _typo-Refs

  // Klassen-Erweiterungen (Ebene 3)
  | { type: 'SET_CLASS_TYPO'; className: string; typo: string | null }
  | { type: 'SET_CLASS_PSEUDO_STYLE'; className: string; pseudo: PseudoState; viewport: VEViewport; styles: Partial<StyleProperties> }
  | { type: 'CLEAR_CLASS_PSEUDO_STYLE'; className: string; pseudo: PseudoState }

  // UI
  | { type: 'OPEN_TYPOGRAPHY_PICKER' }
  | { type: 'CLOSE_TYPOGRAPHY_PICKER' };
```

---

## 11. Implementierungsplan

### Phase 1 – Typen & Converter (kein UI)
| # | Datei | Aufgabe |
|---|-------|---------|
| 1.1 | `types/typographyTokens.ts` (neu) | `FontToken`, `TypographyToken`, Helper-Funktionen |
| 1.2 | `visual-editor/types/styles.ts` | `_typo?: string` in `NamedStyle` |
| 1.3 | `visual-editor/state/EditorContext.tsx` | `fontTokens`+`typographyTokens` in State + alle Reducers |
| 1.4 | `visual-editor/utils/styleResolver.ts` | 4-Ebenen-Auflösung einbauen |
| 1.5 | `visual-editor/converters/v2Converter.ts` | `fontTokens`+`typographyTokens` lesen/schreiben/validieren |

### Phase 2 – Typography-Panel
| # | Datei | Aufgabe |
|---|-------|---------|
| 2.1 | `shell/TypographyPanel.tsx` (neu) | Liste FontTokens + TypoTokens mit Delete-Protection |
| 2.2 | `shell/FontTokenEditor.tsx` (neu) | Font-Picker Flyout |
| 2.3 | `shell/TypographyTokenEditor.tsx` (neu) | Vollständiger Token-Editor inkl. Hover + Preview |
| 2.4 | `shell/Navigator.tsx` | Tab "Typography" einfügen |

### Phase 3 – Klassen-Editor
| # | Datei | Aufgabe |
|---|-------|---------|
| 3.1 | `properties/TypographySection.tsx` | Token-Dropdown + Override-Only-Modus wenn Token aktiv |
| 3.2 | `properties/PseudoStylesSection.tsx` (neu) | Hover/Focus/Active Editor für Klassen |
| 3.3 | `shell/StylesPanel.tsx` | Token-Badge (e.g. `🅣 titel-1`) an Klassen-Einträgen |

### Phase 4 – Text-Element-Picker
| # | Datei | Aufgabe |
|---|-------|---------|
| 4.1 | `shell/TypographyPickerDialog.tsx` (neu) | Floating Grid-Dialog mit Token-Karten als Live-Preview |
| 4.2 | Canvas-Klick-Handler | Einfachklick auf Text → Picker; Doppelklick → TipTap |
| 4.3 | `state/EditorContext.tsx` | `typographyPickerOpen` UI-State |

### Phase 5 – Validierung
| # | Aufgabe |
|---|---------|
| 5.1 | `validateTypographyIntegrity()` im Converter – Warnungen bei ungültigen Referenzen im Editor anzeigen |

---

## 12. JSON: Vorher / Nachher

### Vorher (90× redundante Inline-Typographie):
```jsonc
{ "styles": {
  "hero-title":    { "desktop": { "fontFamily": "playfair-display", "fontSize": { "value": 56, "unit": "px" }, "fontWeight": 700 } },
  "section-title": { "desktop": { "fontFamily": "playfair-display", "fontSize": { "value": 36, "unit": "px" }, "fontWeight": 700 } },
  "card-title":    { "desktop": { "fontFamily": "playfair-display", "fontSize": { "value": 24, "unit": "px" }, "fontWeight": 600 } },
  "body-text":     { "desktop": { "fontFamily": "inter",            "fontSize": { "value": 16, "unit": "px" }, "fontWeight": 400 } }
}}
```

### Nachher (zentral, wartbar, KI-freundlich):
```jsonc
{
  "fontTokens": {
    "font-title": { "label": "Überschriften", "fontFamily": "playfair-display" },
    "font-text":  { "label": "Fließtext",     "fontFamily": "inter" }
  },
  "typographyTokens": {
    "titel-1":     { "label": "Titel 1",    "fontToken": "font-title", "fontSize": { "desktop": "3.5rem", "tablet": "2.75rem", "mobile": "2rem"     }, "fontWeight": 700, "lineHeight": { "desktop": "1.1", "tablet": "1.15", "mobile": "1.2" }, "letterSpacing": "-0.02em", "color": null, "hover": null },
    "titel-2":     { "label": "Titel 2",    "fontToken": "font-title", "fontSize": { "desktop": "2.25rem","tablet": "1.875rem","mobile": "1.5rem"    }, "fontWeight": 700, "lineHeight": { "desktop": "1.2", "tablet": "1.25", "mobile": "1.3" }, "letterSpacing": "-0.01em", "color": null, "hover": null },
    "titel-3":     { "label": "Titel 3",    "fontToken": "font-title", "fontSize": { "desktop": "1.5rem", "tablet": "1.375rem","mobile": "1.25rem"   }, "fontWeight": 600, "lineHeight": { "desktop": "1.3", "tablet": "1.3",  "mobile": "1.35"}, "letterSpacing": "0",       "color": null, "hover": null },
    "text-normal": { "label": "Text Normal","fontToken": "font-text",  "fontSize": { "desktop": "1rem",   "tablet": "1rem",    "mobile": "0.9375rem" }, "fontWeight": 400, "lineHeight": { "desktop": "1.65","tablet": "1.65", "mobile": "1.65"}, "letterSpacing": "0",       "color": null, "hover": null }
  },
  "styles": {
    "hero-title":    { "_typo": "titel-1",    "desktop": { "color": { "kind": "custom", "hex": "#fff" } } },
    "section-title": { "_typo": "titel-2",    "desktop": {} },
    "card-title":    { "_typo": "titel-3",    "desktop": {} },
    "body-text":     { "_typo": "text-normal","desktop": {} }
  }
}
```

**Änderung der Schrift für alle Überschriften:** 1 Stelle (`fontTokens.font-title.fontFamily`).  
**Größe von Titel 2 überall anpassen:** 1 Stelle (`typographyTokens.titel-2.fontSize`).

---

## 13. Hover-Styles: vollständiges Konzept

### Was wo definiert wird

| Ebene | Wo | Properties | Beispiel |
|-------|----|-----------|---------|
| Token-Hover | `typographyTokens[key].hover` | color, textDecoration, letterSpacing, fontWeight | Link-Farbe global |
| Klassen-Hover | `styles[class].pseudoStyles.hover` | alle StyleProperties | btn-hover: bg + transform |
| Automatisch | `styleResolver` | `transition` | smooth ohne Nutzer-Input |

### CSS-Transition (automatisch)

```typescript
if (hasAnyPseudoStyle(element) || classHasHover(element.classNames, globalStyles)) {
  baseCSS['transition'] =
    'color 0.2s ease, background-color 0.2s ease, ' +
    'border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease';
}
```

---

## 14. Designentscheidungen

| Entscheidung | Begründung |
|---|---|
| **Keine feste Obergrenze** | KI entscheidet je nach Site-Komplexität (5 für simple, 15 für komplexe Sites) |
| **Font-Token-Schlüssel `font-*`** | Konvention zur Lesbarkeit — nicht technisch erzwungen |
| **TypoToken-Key semantisch** (`titel-1`, `text-normal`) | Stabil, KI-lesbar, lang-lebig |
| **`color: null` im Token möglich** | Button-Labels erben Farbe vom Parent-Container |
| **Key ≠ Label** | Umbenennen des Labels ändert Key nicht — alle Referenzen bleiben gültig |
| **`RENAME_TYPOGRAPHY_TOKEN`** | Migriert automatisch alle `_typo`-Referenzen in Klassen |
| **Standard-Font & Standard-Typografie** | Je genau einer ist Standard — dient als Fallback beim Löschen anderer Tokens |
| **Löschen mit Standard-Ersetzung** | In-Use-Tokens nicht blockiert, sondern Referenzen werden auf Standard umgestellt; User passt manuell an |
| **Standard nicht löschbar** | Standard-Token muss man zuerst auf einen anderen Token übertragen, bevor man ihn löscht |
| **Einfachklick → Picker, Doppelklick → TipTap** | Schriftstil-Wahl ist häufiger als Textbearbeitung bei bestehenden Seiten |
| **Transition automatisch** | Hover-Effekte brauchen immer Transition — kein manueller Aufwand für User |
