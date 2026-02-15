# Formatvorschlag v2: Unified Website JSON

> **v2-Update:** Überarbeitet nach Webflow-Kompatibilitätsprüfung.
> Der erste Entwurf hatte drei kritische Lücken:
> 1. CSS-Strings (`"56px"`) sind ungeeignet für einen visuellen Editor mit Unit-Switch
> 2. Keine Hover/Focus-States, Transitions, Animations, Filter
> 3. Kein Class/Style-System für wiederverwendbare Styles
>
> Dieser Vorschlag behebt alle drei.

---

## 1. Problem heute

```
Page
├── blocks[]          ← Block-System (DynamicPage-Renderer)
└── veBody            ← VE-Elementbaum (Visual Editor)
```

**Probleme:**
1. Inhalt in `blocks[]` UND `veBody` doppelt
2. Drei Responsive-Systeme (Hero, Cards, VE)
3. Zwei Farbsysteme (plain string vs. `ColorValue`)
4. VE-Interna (`label`, `textStyle`) in den Website-Daten
5. Fehlende Webflow-Features (Hover, Transitions, Classes, Filters)

---

## 2. Gesamtstruktur

```jsonc
{
  "settings": {
    "name": "K1 Friseure",
    "domain": "k1-friseure.de",
    "language": "de",
    "theme": {
      "colors": {
        "primary":    "#2D2926",
        "secondary":  "#EFEBE3",
        "accent":     "#DED9D0",
        "background": "#F9F7F2",
        "text":       "#2D2926",
        "muted":      "#8C8279"
      },
      "fonts": {
        "heading": "Montserrat",
        "body": "Montserrat"
      }
    },
    "contact": {
      "phone": "069 123 456 78",
      "email": "info@k1-friseure.de",
      "address": { "street": "Glauburgstraße 38", "zip": "60318", "city": "Frankfurt am Main" }
    },
    "hours": [
      { "days": "Mo – Fr", "time": "09:00 – 19:00" },
      { "days": "Sa",      "time": "09:00 – 15:00" },
      { "days": "So",      "time": "Geschlossen" }
    ]
  },

  // Wiederverwendbare Styles (wie Webflow-Klassen)
  "styles": { /* → Abschnitt 4 */ },

  // Wiederverwendbare Komponenten (wie Webflow-Symbols)
  "components": { /* → Abschnitt 7 */ },

  // Seiten
  "pages": [
    {
      "id": "page-home",
      "title": "Startseite",
      "slug": "home",
      "isHome": true,
      "isPublished": true,
      "showInMenu": true,
      "seo": {
        "title": "K1 Friseure | Ihr Salon in Frankfurt",
        "description": "Premium-Friseursalon in Frankfurt..."
      },

      // DER Elementbaum – einzige Datenquelle
      "body": { /* → Abschnitt 3 */ }
    }
  ]
}
```

---

## 3. Elementformat

### 3.1 Grundstruktur

```jsonc
{
  "id": "hero-headline",         // Eindeutige ID
  "tag": "text",                  // Element-Typ
  "class": ["heading-xl"],        // Referenz auf benannte Styles (optional)
  "styles": { /* ... */ },        // Inline-Styles (überschreiben class)
  "children": [],                 // Kinder (bei Containern)
  // + tag-spezifische Content-Properties
}
```

### 3.2 Elementtypen (`tag`)

| `tag`        | Beschreibung              | Content-Properties                                    |
|--------------|---------------------------|-------------------------------------------------------|
| `body`       | Wurzelelement             | –                                                     |
| `section`    | Vollbreiter Abschnitt     | `anchorId?`: string                                   |
| `container`  | Flex/Grid-Container       | –                                                     |
| `text`       | Text (HTML)               | `html`: string                                        |
| `image`      | Bild                      | `src`: string, `alt`: string                          |
| `button`     | Klickbarer Button         | `text`: string, `href`: string, `newTab?`: boolean    |
| `icon`       | Lucide-Icon               | `icon`: string, `stroke?`: number                     |
| `link`       | Textlink / Wrapper        | `href`: string, `newTab?`: boolean                    |
| `divider`    | Horizontale Linie         | `lineStyle?`: solid/dashed/dotted                     |
| `spacer`     | Abstandshalter            | –                                                     |
| `nav`        | Navigation-Bar            | `sticky?`: boolean/fixed                              |
| `list`       | Liste (ul/ol)             | `ordered?`: boolean                                   |
| `video`      | Video-Embed               | `src`: string, `poster?`: string, `autoplay?`: bool   |
| `form`       | Kontaktformular           | `fields`: FormField[], `action`: string               |
| `component`  | Komponenteninstanz        | `ref`: string (→ components.id)                       |
| `cards`      | Kartenliste               | `template`: string, `items`: CardItem[]               |

> Erweiterbar: Neue Tags hinzufügen ohne bestehende zu brechen.

### 3.3 Benutzerdefinierte Attribute

Jedes Element kann beliebige HTML-Attribute tragen (Barrierefreiheit, SEO, Tracking):

```jsonc
{
  "id": "nav",
  "tag": "nav",
  "attrs": {
    "role": "navigation",
    "aria-label": "Hauptnavigation",
    "data-tracking": "main-nav"
  }
}
```

---

## 4. Style-System

### 4.1 Warum NICHT CSS-Strings

Im v1-Vorschlag stand `"fontSize": "56px"`. Das ist **falsch** für einen visuellen Editor:

| Problem                    | CSS-String `"56px"` | Objekt `{ v: 56, u: "px" }` |
|----------------------------|---------------------|------------------------------|
| Unit-Switch Dropdown       | ❌ Muss parsen      | ✅ Direkt zugänglich         |
| Slider für Wert            | ❌ Muss parsen      | ✅ `v` direkt bindbar        |
| Shorthand `"120px 64px"`   | ❌ 4 Seiten parsen  | ✅ Einzelne Properties       |
| Typensicherheit            | ❌ Alles `string`   | ✅ `number` + Enum           |
| Auto-Wert vs. Zahl         | ❌ Sonderbehandlung | ✅ Union-Type                |

**Entscheidung:** Style-Werte bleiben strukturiert, aber vereinfacht.

### 4.2 Wertformat

```jsonc
// Numerisch mit Unit:
[56, "px"]              // Kurzform für { value: 56, unit: "px" }

// Auto-Wert:
"auto"

// Reine Zahl (z.B. lineHeight, opacity, flexGrow):
1.5

// Farbe – Theme-Referenz:
{ "ref": "primary" }

// Farbe – Custom:
"#2D2926"

// Unitless Strings (z.B. gridTemplateColumns, transform):
"repeat(4, 1fr)"
```

**Vereinfachung gegenüber heute:** `[56, "px"]` statt `{ "value": 56, "unit": "px" }` – 40% kürzer, trotzdem strukturiert.

### 4.3 Responsive Breakpoints

```jsonc
{
  "styles": {
    // Desktop (= Basis)
    "fontSize": [56, "px"],
    "padding": [[120, "px"], [64, "px"], [100, "px"], [64, "px"]],

    // Tablet-Overrides
    "@tablet": {
      "fontSize": [40, "px"],
      "padding": [[80, "px"], [24, "px"], [60, "px"], [24, "px"]]
    },

    // Mobile-Overrides
    "@mobile": {
      "fontSize": [28, "px"],
      "padding": [[60, "px"], [16, "px"], [40, "px"], [16, "px"]]
    }
  }
}
```

Desktop-first: Basis-Werte gelten, Tablet/Mobile überschreiben nur was sich ändert.

### 4.4 Pseudo-States (Hover, Focus, etc.)

Webflow ermöglicht Styles pro State. Das Format muss das unterstützen:

```jsonc
{
  "styles": {
    "backgroundColor": "#2D2926",
    "color": "#F9F7F2",
    "transition": "all 0.2s ease",

    // Hover-State
    ":hover": {
      "backgroundColor": "#1a1a1a",
      "transform": "translateY(-2px)",
      "boxShadow": "0 4px 12px rgba(0,0,0,0.15)"
    },

    // Focus-State (Barrierefreiheit)
    ":focus": {
      "outline": "2px solid #4299e1",
      "outlineOffset": [2, "px"]
    },

    // Active-State
    ":active": {
      "transform": "translateY(0)"
    }
  }
}
```

States können auch pro Breakpoint variieren:

```jsonc
{
  "styles": {
    ":hover": { "transform": "scale(1.05)" },
    "@mobile": {
      ":hover": { "transform": "none" }  // Kein Hover auf Touch
    }
  }
}
```

### 4.5 Transitions & Animations

```jsonc
{
  "styles": {
    // Einfache Transition
    "transition": "all 0.3s ease",

    // Oder detailliert
    "transitions": [
      { "property": "background-color", "duration": 200, "easing": "ease", "delay": 0 },
      { "property": "transform",        "duration": 300, "easing": "ease-out" }
    ]
  }
}
```

Keyframe-Animationen (für Scroll-Reveal etc.):

```jsonc
{
  "styles": {
    "animation": {
      "name": "fadeInUp",
      "duration": 600,
      "easing": "ease-out",
      "delay": 0,
      "fillMode": "both",
      "trigger": "scroll-in-view"   // oder "page-load", "hover", "click"
    }
  }
}
```

Globale Keyframes in `settings`:

```jsonc
{
  "settings": {
    "keyframes": {
      "fadeInUp": {
        "from": { "opacity": 0, "transform": "translateY(20px)" },
        "to":   { "opacity": 1, "transform": "translateY(0)" }
      }
    }
  }
}
```

### 4.6 Filter & Backdrop

```jsonc
{
  "styles": {
    // CSS Filters
    "filter": {
      "blur": [0, "px"],
      "brightness": 1.0,
      "contrast": 1.0,
      "grayscale": 0,
      "saturate": 1.0
    },

    // Backdrop Filter (Frosted Glass)
    "backdropFilter": {
      "blur": [10, "px"],
      "brightness": 1.1
    },

    // Blend Mode
    "mixBlendMode": "normal"
  }
}
```

### 4.7 Erweiterte CSS-Properties (Vollständige Liste)

```
LAYOUT:          display, flexDirection, flexWrap, justifyContent, alignItems,
                 alignSelf, flexGrow, flexShrink, flexBasis, order, gap, rowGap, columnGap
GRID:            gridTemplateColumns, gridTemplateRows, gridAutoFlow, gridAutoColumns,
                 gridAutoRows, justifyItems, alignContent, gridColumn, gridRow, justifySelf
SIZE:            width, height, minWidth, maxWidth, minHeight, maxHeight
SPACING:         marginTop/Right/Bottom/Left, paddingTop/Right/Bottom/Left
TYPOGRAPHY:      fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textAlign,
                 color, fontStyle, textTransform, textDecoration, whiteSpace
BACKGROUND:      backgroundColor, backgroundImage, backgroundSize, backgroundPosition,
                 backgroundRepeat, backgroundGradient
BORDER:          borderWidth (+ sides), borderStyle, borderColor, borderRadius (+ corners)
SHADOW:          boxShadow, textShadow
POSITION:        position, top, right, bottom, left, zIndex
VISIBILITY:      opacity, overflow, overflowX, overflowY
OBJECT:          objectFit, objectPosition
TRANSFORM:       transform, transformOrigin
ASPECT:          aspectRatio
FILTER:          filter, backdropFilter, mixBlendMode
TRANSITION:      transition, transitions[]
ANIMATION:       animation
OUTLINE:         outline, outlineOffset, outlineColor
CURSOR:          cursor
STATES:          :hover, :focus, :active, :focus-visible
RESPONSIVE:      @tablet, @mobile
```

---

## 5. Benannte Styles (Webflow-Klassen)

Das wichtigste fehlende Feature im v1-Vorschlag. Ohne Klassen bedeuten 20 identische Buttons 20× dieselben Inline-Styles.

### 5.1 Definition in `styles` (Top-Level)

```jsonc
{
  "styles": {
    "btn": {
      "display": "inline-flex",
      "alignItems": "center",
      "justifyContent": "center",
      "padding": [[12, "px"], [24, "px"]],
      "borderRadius": [4, "px"],
      "fontWeight": 500,
      "fontSize": [14, "px"],
      "cursor": "pointer",
      "transition": "all 0.2s ease",
      ":hover": { "transform": "translateY(-1px)" }
    },

    "btn-primary": {
      "_extends": "btn",
      "backgroundColor": { "ref": "primary" },
      "color": { "ref": "background" },
      ":hover": { "backgroundColor": "#1a1a1a" }
    },

    "btn-outline": {
      "_extends": "btn",
      "backgroundColor": "transparent",
      "color": { "ref": "primary" },
      "borderWidth": [1, "px"],
      "borderStyle": "solid",
      "borderColor": { "ref": "primary" },
      ":hover": {
        "backgroundColor": { "ref": "primary" },
        "color": { "ref": "background" }
      }
    },

    "section-padding": {
      "paddingTop": [100, "px"],
      "paddingBottom": [100, "px"],
      "paddingLeft": [64, "px"],
      "paddingRight": [64, "px"],
      "@tablet": { "paddingLeft": [24, "px"], "paddingRight": [24, "px"] },
      "@mobile": {
        "paddingTop": [60, "px"],
        "paddingBottom": [60, "px"],
        "paddingLeft": [16, "px"],
        "paddingRight": [16, "px"]
      }
    },

    "heading-xl": {
      "fontWeight": 800,
      "fontSize": [56, "px"],
      "lineHeight": 1.1,
      "letterSpacing": [-0.5, "px"],
      "color": { "ref": "text" },
      "@tablet": { "fontSize": [40, "px"] },
      "@mobile": { "fontSize": [28, "px"] }
    },

    "text-muted": {
      "color": { "ref": "muted" },
      "fontSize": [14, "px"],
      "fontWeight": 400
    }
  }
}
```

### 5.2 Verwendung auf Elementen

```jsonc
{
  "id": "hero-cta",
  "tag": "button",
  "text": "Jetzt Termin buchen",
  "href": "#",
  "class": ["btn-primary"],
  "styles": {
    // Inline-Overrides (optional, überschreiben class)
    "fontSize": [16, "px"],
    "padding": [[16, "px"], [32, "px"]]
  }
}
```

### 5.3 Combo-Klassen (wie Webflow)

```jsonc
{
  "class": ["btn", "btn-large", "btn-primary"]
}
```

Werden von links nach rechts gemergt: `btn` → `btn-large` → `btn-primary` → inline `styles`.

### 5.4 `_extends` für Vererbung

```jsonc
{
  "styles": {
    "btn": { /* Basis */ },
    "btn-primary": {
      "_extends": "btn",    // Erbt alles von "btn"
      "backgroundColor": { "ref": "primary" }
    }
  }
}
```

Unterschied: `_extends` ist eine **Definition-Zeit**-Vererbung (Klasse erbt von Klasse).
`class: ["btn", "btn-primary"]` ist eine **Anwendungs-Zeit**-Komposition (Element kombiniert Klassen).

---

## 6. Responsive: Breakpoint-Konfiguration

```jsonc
{
  "settings": {
    "breakpoints": {
      "tablet": 992,
      "mobile": 478
    }
  }
}
```

Standard: Tablet ≤ 992px, Mobile ≤ 478px. Konfigurierbar pro Website.

Webflow hat 5 Breakpoints (1920+, 1280+, 992, 768, 478). Wir starten mit 3, können auf 5 erweitern:

```jsonc
// Zukünftig möglich:
{
  "breakpoints": {
    "large": 1440,
    "tablet": 992,
    "landscape": 768,
    "mobile": 478
  }
}
```

---

## 7. Komponenten (Symbols)

Wiederverwendbare Elementbäume mit optionalen Overrides:

```jsonc
{
  "components": {
    "cta-block": {
      "tag": "container",
      "styles": {
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "gap": [16, "px"],
        "padding": [[40, "px"], [24, "px"]]
      },
      "children": [
        {
          "id": "cta-title",
          "tag": "text",
          "html": "<h3>Bereit für deinen neuen Look?</h3>",
          "class": ["heading-md"]
        },
        {
          "id": "cta-button",
          "tag": "button",
          "text": "Termin buchen",
          "href": "#",
          "class": ["btn-primary"]
        }
      ]
    }
  }
}
```

Instanziierung mit Overrides:

```jsonc
{
  "id": "footer-cta",
  "tag": "component",
  "ref": "cta-block",
  "overrides": {
    "cta-title": { "html": "<h3>Noch Fragen?</h3>" },
    "cta-button": { "text": "Kontakt aufnehmen", "href": "/kontakt" }
  }
}
```

---

## 8. Vollständiges Beispiel: Hero-Section

### Vorher (heute – doppelt + Overhead):
```jsonc
// blocks[] + veBody = ~3.200 Zeichen, 80 Properties, alles doppelt
```

### Nachher (v2):

```jsonc
{
  "id": "hero",
  "tag": "section",
  "class": ["section-padding"],
  "styles": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "textAlign": "center",
    "minHeight": [80, "vh"],
    "backgroundColor": { "ref": "background" },
    "@tablet": { "minHeight": [70, "vh"] },
    "@mobile": { "minHeight": [60, "vh"] }
  },
  "children": [
    {
      "id": "hero-headline",
      "tag": "text",
      "html": "<h1>Wir hören zu, analysieren<br>deinen Typ – und kreieren<br>Farbe &amp; Schnitt, die wirklich<br>zu dir passen.</h1>",
      "class": ["heading-xl"],
      "styles": {
        "maxWidth": [900, "px"],
        "marginBottom": [32, "px"]
      }
    },
    {
      "id": "hero-subline",
      "tag": "text",
      "html": "<p>Balayage · AirTouch · Colorationen · Haarschnitte<br>Ihr Premium-Friseursalon in Frankfurt</p>",
      "class": ["text-muted"],
      "styles": {
        "fontSize": [18, "px"],
        "fontWeight": 300,
        "lineHeight": 1.7,
        "maxWidth": [600, "px"],
        "marginBottom": [40, "px"],
        "@tablet": { "fontSize": [16, "px"] },
        "@mobile": { "fontSize": [14, "px"] }
      }
    },
    {
      "id": "hero-cta",
      "tag": "button",
      "text": "Jetzt Termin buchen",
      "href": "#",
      "class": ["btn-primary"],
      "styles": {
        "fontSize": [16, "px"],
        "padding": [[16, "px"], [32, "px"]]
      }
    },
    {
      "id": "hero-subtext",
      "tag": "text",
      "html": "<p>in 2 Minuten online</p>",
      "styles": {
        "fontSize": [13, "px"],
        "color": { "ref": "muted" },
        "marginTop": [8, "px"]
      }
    }
  ]
}
```

**Mit Klassen:** Buttons und Headings referenzieren wiederverwendbare Styles statt alles inline zu wiederholen.

---

## 9. Webflow-Kompatibilitätsprüfung

| Webflow Feature                | v1 (alter Vorschlag) | v2 (dieser Vorschlag) | Anmerkung |
|--------------------------------|----------------------|-----------------------|-----------|
| Elementbaum (DOM-Hierarchie)   | ✅                   | ✅                    |           |
| Flexbox                        | ✅                   | ✅                    |           |
| CSS Grid                       | ✅                   | ✅                    |           |
| Responsive Breakpoints         | ✅ (3)               | ✅ (3, erweiterbar)   |           |
| CSS Classes / Combo Classes    | ❌                   | ✅                    | `class` + `_extends` |
| Hover / Focus / Active States  | ❌                   | ✅                    | `:hover`, `:focus`, `:active` |
| Transitions                    | ❌                   | ✅                    | `transition` + `transitions[]` |
| Animations / Interactions      | ❌                   | ✅                    | `animation` + `keyframes` |
| CSS Filters                    | ❌                   | ✅                    | `filter`, `backdropFilter` |
| Blend Modes                    | ❌                   | ✅                    | `mixBlendMode` |
| Text Shadow                    | ❌                   | ✅                    | `textShadow` |
| Outline (Barrierefreiheit)     | ❌                   | ✅                    | `outline`, `outlineOffset` |
| Custom Attributes              | ❌                   | ✅                    | `attrs` Objekt |
| Components / Symbols           | ❌                   | ✅                    | `components` + `ref` + `overrides` |
| Gradient Backgrounds           | ✅                   | ✅                    | `backgroundGradient` |
| Box Shadow                     | ✅                   | ✅                    |           |
| Opacity                        | ✅                   | ✅                    |           |
| Overflow                       | ✅                   | ✅                    |           |
| Transform                      | ✅                   | ✅                    |           |
| Aspect Ratio                   | ✅                   | ✅                    |           |
| Position (sticky/fixed/abs)    | ✅                   | ✅                    |           |
| Unit-Switch im Editor          | ❌ (CSS Strings)     | ✅ ([v, "u"] Tuples)  |           |
| SEO Attributes                 | ~                    | ✅                    | `seo` + `attrs` |
| CMS / Dynamic Content          | ❌                   | 🔮 Erweiterbar        | Nicht in v1 |

---

## 10. Was NICHT in der Website-JSON gehört

| Bedarf                  | Wo stattdessen                                      |
|-------------------------|-----------------------------------------------------|
| Element-Labels im Baum  | Editor-State (oder aus `tag` + `id` ableiten)       |
| textStyle-Presets (h1…) | Editor-Feature: wendet `class: ["heading-xl"]` an   |
| Ausgewähltes Element    | React Context (Editor-State)                        |
| Undo/Redo History       | React Context (Editor-State)                        |
| Pro-Mode Toggle         | localStorage (Editor-Setting)                       |
| Drag & Drop Zustand     | React Context                                       |
| mobileBreakpoint        | `settings.breakpoints` (global, nicht pro Element)  |
| `label` auf Elementen   | Editor-State oder automatisch ableiten              |

---

## 11. Migration

| Aktuell                              | Neu                                    |
|--------------------------------------|----------------------------------------|
| `page.blocks[]`                      | ❌ entfällt                            |
| `page.veBody`                        | → `page.body`                          |
| `page.isVisualEditor`                | ❌ entfällt (immer true)               |
| `VEElement.type` ("Text")            | → `element.tag` ("text")              |
| `VEElement.label`                    | ❌ entfällt (Editor-State)             |
| `VEText.content` (HTML)              | → `element.html`                       |
| `VEText.textStyle`                   | → `element.class: ["heading-xl"]`      |
| `VEButton.content.text/link`         | → `element.text`, `element.href`       |
| `VEImage.content.src/alt`            | → `element.src`, `element.alt`         |
| `VEIcon.content.*`                   | → `element.icon`, `element.stroke`     |
| `VENavbar.stickyMode`                | → `element.sticky`                     |
| `VENavbar.mobileBreakpoint`          | → `settings.breakpoints` (global)      |
| `{value:56, unit:"px"}`             | → `[56, "px"]`                         |
| `styles.desktop.X / tablet / mobile` | → `styles.X` + `@tablet` + `@mobile`  |
| `{kind:"custom", hex:"#..."}`       | → `"#..."`                             |
| `{kind:"tokenRef", ref:"..."}`      | → `{"ref":"..."}`                      |
| Inline styles everywhere             | → `class` + inline overrides           |

---

## 12. Zusammenfassung

| Aspekt                | Heute                    | v2 Vorschlag                     |
|-----------------------|--------------------------|----------------------------------|
| Datenquellen          | `blocks[]` + `veBody`    | `body` (eine)                    |
| Farbformat            | 2 verschiedene           | 1 (`"#hex"` oder `{ref}`)        |
| Responsive            | 3 verschiedene Systeme   | 1 (`@tablet`, `@mobile`)         |
| Style-Werte           | `{value, unit}` verbose  | `[value, "unit"]` kompakt        |
| Hover/States          | ❌ nicht möglich         | ✅ `:hover`, `:focus`, `:active` |
| Transitions           | ❌ nicht möglich         | ✅ `transition`, `transitions[]` |
| Animations            | ❌ nicht möglich         | ✅ `animation` + `keyframes`     |
| Filters               | ❌ nicht möglich         | ✅ `filter`, `backdropFilter`    |
| Wiederverwendbarkeit  | ❌ alles inline          | ✅ `styles` + `class` + `_extends` |
| Komponenten           | ❌ nicht implementiert   | ✅ `components` + `ref` + `overrides` |
| VE-Interna in JSON    | ✅ (`label`, `textStyle`) | ❌ nur im Editor-State           |
| TypeScript            | `veBody` untypisiert     | `body` voll typisiert            |
| JSON-Größe            | ~2× dupliziert           | ~60% kleiner (Klassen!)          |
| Webflow-kompatibel    | ~40%                     | ~90%                             |

---

## 13. Nächste Schritte

1. **Entscheidung**: Format v2 so übernehmen? Anpassungen?
2. **TypeScript-Interfaces**: `Element`, `Styles`, `Page`, `Website` neu definieren
3. **Style-Resolver**: Klassen-Auflösung + State-Handling + Breakpoints
4. **Renderer**: Liest `body`, löst `class` auf, rendert mit CSS
5. **Editor**: Properties Panel um States/Transitions erweitern
6. **Migration**: Bestehende Daten konvertieren
7. **Import-JSON**: Direkt im Website-Format (kein Konverter nötig)
