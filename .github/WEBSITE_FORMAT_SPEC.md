# BeautifulCMS – Website JSON Format Specification

> **Status: DRAFT**
> Dieses Format kann sich noch anpassen, je nach Implementierungsfortschritt.
> Breaking Changes werden hier dokumentiert.
>
> **Version:** 2.0-draft
> **Letzte Aktualisierung:** 2025-01
> **Basiert auf:** `docs/FORMAT_VORSCHLAG.md` v2

---

## Inhaltsverzeichnis

1. [Designprinzipien](#1-designprinzipien)
2. [Gesamtstruktur](#2-gesamtstruktur)
3. [Elementformat](#3-elementformat)
4. [Style-System](#4-style-system)
5. [Benannte Styles (Klassen)](#5-benannte-styles-klassen)
6. [Responsive Breakpoints](#6-responsive-breakpoints)
7. [Sichtbarkeit pro Breakpoint](#7-sichtbarkeit-pro-breakpoint)
8. [Komponenten (Symbols)](#8-komponenten-symbols)
9. [Vollständige CSS-Property-Liste](#9-vollständige-css-property-liste)
10. [Was NICHT in die JSON gehört](#10-was-nicht-in-die-json-gehört)
11. [Migration von v1](#11-migration-von-v1)
12. [Webflow-Kompatibilität](#12-webflow-kompatibilität)
13. [Erweiterungen (geplant)](#13-erweiterungen-geplant)
14. [Changelog](#14-changelog)

---

## 1. Designprinzipien

1. **Eine Datenquelle:** Jede Seite hat genau einen Elementbaum (`body`). Kein `blocks[]`, kein `veBody`.
2. **Keine Editor-Interna:** Labels, Selection-State, Undo-History, Pro-Mode-Toggle gehören in den Editor-State, nicht in die JSON.
3. **Strukturierte Werte:** Style-Werte als `[value, "unit"]`-Tuples, nicht als CSS-Strings. Ermöglicht Unit-Switch und Slider im Editor.
4. **Desktop-First Responsive:** Basis-Werte gelten für Desktop. `@tablet` und `@mobile` überschreiben nur was sich ändert.
5. **Wiederverwendbarkeit:** Benannte Styles (`styles`) und Komponenten (`components`) vermeiden Duplikation.
6. **Erweiterbar:** Neue Tags, Properties und Breakpoints hinzufügen, ohne bestehende Strukturen zu brechen.

---

## 2. Gesamtstruktur

```jsonc
{
  // Globale Einstellungen
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
      "address": {
        "street": "Glauburgstraße 38",
        "zip": "60318",
        "city": "Frankfurt am Main"
      }
    },

    "hours": [
      { "days": "Mo – Fr", "time": "09:00 – 19:00" },
      { "days": "Sa",      "time": "09:00 – 15:00" },
      { "days": "So",      "time": "Geschlossen" }
    ],

    "breakpoints": {
      "tablet": 992,
      "mobile": 478
    },

    "keyframes": {
      "fadeInUp": {
        "from": { "opacity": 0, "transform": "translateY(20px)" },
        "to":   { "opacity": 1, "transform": "translateY(0)" }
      }
    }
  },

  // Wiederverwendbare Styles (→ Abschnitt 5)
  "styles": { },

  // Wiederverwendbare Komponenten (→ Abschnitt 8)
  "components": { },

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

      // Der einzige Elementbaum – einzige Datenquelle
      "body": {
        "id": "body",
        "tag": "body",
        "children": [ /* ... */ ]
      }
    }
  ]
}
```

### 2.1 Felder der Gesamtstruktur

| Feld         | Typ      | Pflicht | Beschreibung                                      |
|--------------|----------|---------|---------------------------------------------------|
| `settings`   | object   | ✅      | Globale Konfiguration: Name, Domain, Theme, etc.  |
| `styles`     | object   | ✅      | Benannte Style-Definitionen (CSS-Klassen)         |
| `components` | object   | —       | Wiederverwendbare Elementbäume (Symbols)           |
| `pages`      | array    | ✅      | Seiten-Array mit jeweils einem `body`-Elementbaum |

### 2.2 Felder pro Seite

| Feld          | Typ     | Pflicht | Beschreibung                          |
|---------------|---------|---------|---------------------------------------|
| `id`          | string  | ✅      | Eindeutige Seiten-ID                  |
| `title`       | string  | ✅      | Anzeigename der Seite                 |
| `slug`        | string  | ✅      | URL-Pfad (z.B. `"home"`, `"kontakt"`) |
| `isHome`      | boolean | —       | Ist dies die Startseite?              |
| `isPublished` | boolean | —       | Ist die Seite veröffentlicht?         |
| `showInMenu`  | boolean | —       | In der Navigation anzeigen?           |
| `seo`         | object  | —       | SEO-Metadaten (title, description)    |
| `body`        | Element | ✅      | Wurzelelement der Seite (tag: body)   |

---

## 3. Elementformat

### 3.1 Grundstruktur

Jedes Element im Baum hat folgende Form:

```jsonc
{
  "id": "hero-headline",         // Eindeutige ID (innerhalb der Seite)
  "tag": "text",                  // Element-Typ (siehe 3.2)
  "class": ["heading-xl"],        // Referenzen auf benannte Styles (optional)
  "visible": {                    // Sichtbarkeit pro Breakpoint (optional, → Abschnitt 7)
    "desktop": true,
    "tablet": true,
    "mobile": false
  },
  "attrs": {                      // Benutzerdefinierte HTML-Attribute (optional)
    "role": "navigation",
    "aria-label": "Hauptmenü"
  },
  "styles": { /* ... */ },        // Inline-Styles, überschreiben class (optional)
  "children": [ /* ... */ ]       // Kind-Elemente (bei Container-Tags)
  // + tag-spezifische Content-Properties (siehe 3.3)
}
```

### 3.2 Element-Tags

| `tag`        | Beschreibung              | Tag-spezifische Properties                            |
|--------------|---------------------------|-------------------------------------------------------|
| `body`       | Wurzelelement der Seite   | –                                                     |
| `section`    | Vollbreiter Abschnitt     | `anchorId?`: string                                   |
| `container`  | Flex/Grid-Container       | –                                                     |
| `text`       | Text (HTML-Inhalt)        | `html`: string                                        |
| `image`      | Bild                      | `src`: string, `alt`: string                          |
| `button`     | Klickbarer Button         | `text`: string, `href`: string, `newTab?`: boolean    |
| `icon`       | Lucide-Icon               | `icon`: string, `stroke?`: number                     |
| `link`       | Textlink / Wrapper        | `href`: string, `newTab?`: boolean                    |
| `divider`    | Horizontale Trennlinie    | `lineStyle?`: `"solid"` \| `"dashed"` \| `"dotted"`  |
| `spacer`     | Abstandshalter            | –                                                     |
| `nav`        | Navigationsleiste         | `sticky?`: boolean \| `"fixed"`                       |
| `list`       | Liste (ul/ol)             | `ordered?`: boolean                                   |
| `video`      | Video-Embed               | `src`: string, `poster?`: string, `autoplay?`: bool   |
| `form`       | Kontaktformular           | `fields`: FormField[], `action`: string               |
| `component`  | Komponenteninstanz        | `ref`: string, `overrides?`: object                   |
| `cards`      | Kartenliste               | `template`: string, `items`: CardItem[]               |

> **Erweiterbar:** Neue Tags (z.B. `tabs`, `accordion`, `slider`, `modal`, `embed`, `map`) können später hinzugefügt werden, ohne bestehende Strukturen zu brechen.

### 3.3 Tag-spezifische Properties im Detail

#### `text`
```jsonc
{
  "id": "intro-text",
  "tag": "text",
  "html": "<h2>Willkommen bei K1</h2>",
  "class": ["heading-lg"]
}
```
- `html` enthält den HTML-String. Erlaubt: `<h1>`–`<h6>`, `<p>`, `<br>`, `<strong>`, `<em>`, `<a>`, `<span>`.
- Block-Level-Tag (`h1`, `p`, etc.) bestimmt die Semantik.

#### `image`
```jsonc
{
  "id": "hero-bg",
  "tag": "image",
  "src": "/media/salon-interior.jpg",
  "alt": "Salon-Innenansicht",
  "styles": { "objectFit": "cover", "width": [100, "%"], "height": [400, "px"] }
}
```

#### `button`
```jsonc
{
  "id": "cta-btn",
  "tag": "button",
  "text": "Jetzt Termin buchen",
  "href": "https://booking.example.com",
  "newTab": true,
  "class": ["btn-primary"]
}
```

#### `icon`
```jsonc
{
  "id": "phone-icon",
  "tag": "icon",
  "icon": "Phone",
  "stroke": 2,
  "styles": { "width": [24, "px"], "height": [24, "px"], "color": { "ref": "primary" } }
}
```
- `icon`: Name des Lucide-Icons.
- `stroke`: Strichstärke (Standard: 2).

#### `component`
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
- `ref`: Verweis auf `components[id]`.
- `overrides`: Objekt mit Element-IDs als Keys, Content-Properties als Values.

#### `cards`
```jsonc
{
  "id": "services-cards",
  "tag": "cards",
  "template": "service-card",
  "items": [
    { "title": "Balayage", "description": "Natürliche Farbverläufe...", "image": "/media/balayage.jpg" },
    { "title": "Haarschnitt", "description": "Präzise Schnitte...", "image": "/media/haircut.jpg" }
  ]
}
```

### 3.4 Benutzerdefinierte Attribute (`attrs`)

Jedes Element kann beliebige HTML-Attribute tragen für Barrierefreiheit, SEO und Tracking:

```jsonc
{
  "id": "main-nav",
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

### 4.1 Wertformate

Alle Style-Werte verwenden strukturierte Formate, die im Editor direkt an UI-Controls (Slider, Unit-Switch, Color-Picker) gebunden werden können.

| Typ                       | Format                         | Beispiel                                              |
|---------------------------|--------------------------------|-------------------------------------------------------|
| Numerisch mit Unit        | `[value, "unit"]`              | `[56, "px"]`, `[100, "%"]`, `[80, "vh"]`             |
| Auto-Wert                 | `"auto"`                       | `"auto"`                                              |
| Reine Zahl                | `number`                       | `1.5` (lineHeight), `0.8` (opacity), `2` (flexGrow)  |
| Farbe – Theme-Referenz    | `{ "ref": "name" }`           | `{ "ref": "primary" }`, `{ "ref": "background" }`    |
| Farbe – Custom Hex        | `"#RRGGBB"` oder `"#RRGGBBAA"`| `"#2D2926"`, `"#00000080"`                            |
| Unitless String           | `string`                       | `"repeat(4, 1fr)"`, `"translateY(-2px)"`              |
| Shorthand (4 Seiten)      | `[top, right, bottom, left]`   | `[[120,"px"],[64,"px"],[100,"px"],[64,"px"]]`         |

**Warum Tuples statt CSS-Strings:**

| Anforderung            | CSS-String `"56px"` | Tuple `[56, "px"]` |
|------------------------|---------------------|---------------------|
| Unit-Switch Dropdown   | ❌ Muss parsen       | ✅ Direkt zugänglich |
| Slider für Wert        | ❌ Muss parsen       | ✅ `[0]` bindbar     |
| Shorthand parsen       | ❌ Komplex           | ✅ Array-Zugriff     |
| Typensicherheit        | ❌ Alles `string`    | ✅ `number` + Enum   |
| JSON-Größe             | ~gleich              | ~gleich              |

### 4.2 Responsive Overrides

Desktop-First: Basis-Werte gelten für Desktop. Breakpoint-Overrides überschreiben nur Properties, die sich ändern.

```jsonc
{
  "styles": {
    "fontSize": [56, "px"],
    "padding": [[120, "px"], [64, "px"], [100, "px"], [64, "px"]],

    "@tablet": {
      "fontSize": [40, "px"],
      "padding": [[80, "px"], [24, "px"], [60, "px"], [24, "px"]]
    },

    "@mobile": {
      "fontSize": [28, "px"],
      "padding": [[60, "px"], [16, "px"], [40, "px"], [16, "px"]]
    }
  }
}
```

### 4.3 Pseudo-States

Hover, Focus und Active States werden als verschachtelte Objekte innerhalb von `styles` definiert:

```jsonc
{
  "styles": {
    "backgroundColor": "#2D2926",
    "color": "#F9F7F2",
    "transition": "all 0.2s ease",

    ":hover": {
      "backgroundColor": "#1a1a1a",
      "transform": "translateY(-2px)",
      "boxShadow": "0 4px 12px rgba(0,0,0,0.15)"
    },

    ":focus": {
      "outline": "2px solid #4299e1",
      "outlineOffset": [2, "px"]
    },

    ":active": {
      "transform": "translateY(0)"
    }
  }
}
```

**States + Breakpoints kombiniert:**

```jsonc
{
  "styles": {
    ":hover": { "transform": "scale(1.05)" },
    "@mobile": {
      ":hover": { "transform": "none" }  // Kein Hover auf Touch-Geräten
    }
  }
}
```

### 4.4 Transitions

```jsonc
{
  "styles": {
    // Kurzform (CSS-String):
    "transition": "all 0.3s ease",

    // Oder detailliert (Array):
    "transitions": [
      { "property": "background-color", "duration": 200, "easing": "ease", "delay": 0 },
      { "property": "transform",        "duration": 300, "easing": "ease-out" }
    ]
  }
}
```

- `transition`: CSS-Kurzform als String.
- `transitions`: Array mit strukturierten Transition-Objekten (bevorzugt für Editor-Binding).
- Wenn beides angegeben, hat `transitions` Vorrang.

### 4.5 Animations

```jsonc
{
  "styles": {
    "animation": {
      "name": "fadeInUp",            // Referenz auf settings.keyframes
      "duration": 600,               // ms
      "easing": "ease-out",
      "delay": 0,                    // ms
      "fillMode": "both",           // "none" | "forwards" | "backwards" | "both"
      "trigger": "scroll-in-view"    // "page-load" | "scroll-in-view" | "hover" | "click"
    }
  }
}
```

Keyframes werden global in `settings.keyframes` definiert:

```jsonc
{
  "settings": {
    "keyframes": {
      "fadeInUp": {
        "from": { "opacity": 0, "transform": "translateY(20px)" },
        "to":   { "opacity": 1, "transform": "translateY(0)" }
      },
      "slideInLeft": {
        "0%":   { "opacity": 0, "transform": "translateX(-40px)" },
        "100%": { "opacity": 1, "transform": "translateX(0)" }
      }
    }
  }
}
```

### 4.6 Filter & Backdrop

```jsonc
{
  "styles": {
    "filter": {
      "blur": [0, "px"],
      "brightness": 1.0,
      "contrast": 1.0,
      "grayscale": 0,
      "saturate": 1.0
    },

    "backdropFilter": {
      "blur": [10, "px"],
      "brightness": 1.1
    },

    "mixBlendMode": "normal"
  }
}
```

- `filter` / `backdropFilter`: Strukturierte Objekte mit einzelnen Filterfunktionen.
- `mixBlendMode`: CSS-Blend-Mode als String (`"normal"`, `"multiply"`, `"screen"`, `"overlay"`, etc.).

---

## 5. Benannte Styles (Klassen)

Benannte Styles sind das Äquivalent zu Webflow-Klassen. Sie verhindern Duplikation und ermöglichen konsistentes Styling.

### 5.1 Definition im Top-Level `styles`-Objekt

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
    // Inline-Overrides (optional, überschreiben class-Werte)
    "fontSize": [16, "px"],
    "padding": [[16, "px"], [32, "px"]]
  }
}
```

### 5.3 Combo-Klassen

Mehrere Klassen werden von links nach rechts gemergt:

```jsonc
{ "class": ["btn", "btn-large", "btn-primary"] }
```

Auflösungsreihenfolge: `btn` → `btn-large` → `btn-primary` → inline `styles`.

### 5.4 Vererbung mit `_extends`

```jsonc
{
  "styles": {
    "btn": { /* Basis-Styles */ },
    "btn-primary": {
      "_extends": "btn",
      "backgroundColor": { "ref": "primary" }
    }
  }
}
```

- `_extends` ist **Definitionszeit-Vererbung** (eine Klasse erbt von einer anderen Klasse).
- `class: ["btn", "btn-primary"]` ist **Anwendungszeit-Komposition** (ein Element kombiniert mehrere Klassen).
- Beides kann koexistieren.

---

## 6. Responsive Breakpoints

### 6.1 Konfiguration

Breakpoints werden global in `settings.breakpoints` konfiguriert:

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

Standard: Tablet ≤ 992px, Mobile ≤ 478px.

### 6.2 Erweiterbarkeit

Das System startet mit 3 Breakpoints (Desktop + Tablet + Mobile) und kann auf 5 erweitert werden:

```jsonc
{
  "breakpoints": {
    "large": 1440,
    "tablet": 992,
    "landscape": 768,
    "mobile": 478
  }
}
```

Jeder Breakpoint erzeugt einen `@`-Modifier in den Styles (z.B. `@large`, `@landscape`).

### 6.3 Desktop-First Prinzip

- Basis-Werte = Desktop
- `@tablet` überschreibt Basis ab ≤ 992px
- `@mobile` überschreibt Basis + Tablet ab ≤ 478px

Es werden nur Properties überschrieben, die sich tatsächlich ändern.

---

## 7. Sichtbarkeit pro Breakpoint

Jedes Element kann pro Breakpoint ein-/ausgeblendet werden. Dies ist essentiell für responsive Layouts (z.B. Desktop-Navigation vs. Mobile-Burger-Menu).

### 7.1 Format

```jsonc
{
  "id": "desktop-nav",
  "tag": "nav",
  "visible": {
    "desktop": true,
    "tablet": true,
    "mobile": false
  },
  "children": [ /* Desktop-Navigation */ ]
}
```

```jsonc
{
  "id": "mobile-nav",
  "tag": "nav",
  "visible": {
    "desktop": false,
    "tablet": false,
    "mobile": true
  },
  "children": [ /* Burger-Menu */ ]
}
```

### 7.2 Regeln

| Situation                 | Verhalten                                     |
|---------------------------|-----------------------------------------------|
| `visible` nicht angegeben | Element ist auf allen Breakpoints sichtbar    |
| Breakpoint fehlt im Objekt| Wird als `true` behandelt (sichtbar)          |
| `visible: { mobile: false }` | Nur auf Mobile versteckt, sonst sichtbar   |

### 7.3 Rendering

- Im **Renderer** wird `visible` in `display: none` übersetzt, gesteuert über Media Queries.
- Im **Editor** werden ausgeblendete Elemente halbtransparent angezeigt (nicht entfernt), damit sie weiter bearbeitbar sind.

### 7.4 Zusammenspiel mit Styles

`visible` ist unabhängig von `styles.display`. Ein Element kann `visible: { mobile: false }` haben und trotzdem `styles.display: "flex"` – auf Mobile wird es per `display: none` (aus `visible`) ausgeblendet, auf Desktop gilt `display: flex`.

---

## 8. Komponenten (Symbols)

Wiederverwendbare Elementbäume mit optionalen Overrides.

### 8.1 Definition

Komponenten werden im Top-Level `components`-Objekt definiert:

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

### 8.2 Instanziierung

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

- `ref`: Verweis auf den Komponentennamen in `components`.
- `overrides`: Objekt mit Element-IDs als Keys. Nur Content-Properties können überschrieben werden (html, text, href, src, alt, etc.), keine Styles.

---

## 9. Vollständige CSS-Property-Liste

```
LAYOUT:          display, flexDirection, flexWrap, justifyContent, alignItems,
                 alignSelf, flexGrow, flexShrink, flexBasis, order, gap, rowGap, columnGap

GRID:            gridTemplateColumns, gridTemplateRows, gridAutoFlow, gridAutoColumns,
                 gridAutoRows, justifyItems, alignContent, gridColumn, gridRow, justifySelf

SIZE:            width, height, minWidth, maxWidth, minHeight, maxHeight

SPACING:         marginTop, marginRight, marginBottom, marginLeft,
                 paddingTop, paddingRight, paddingBottom, paddingLeft

TYPOGRAPHY:      fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textAlign,
                 color, fontStyle, textTransform, textDecoration, whiteSpace, wordBreak

BACKGROUND:      backgroundColor, backgroundImage, backgroundSize, backgroundPosition,
                 backgroundRepeat, backgroundGradient

BORDER:          borderWidth, borderTopWidth, borderRightWidth, borderBottomWidth,
                 borderLeftWidth, borderStyle, borderColor,
                 borderRadius, borderTopLeftRadius, borderTopRightRadius,
                 borderBottomLeftRadius, borderBottomRightRadius

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

PSEUDO-STATES:   :hover, :focus, :active, :focus-visible

RESPONSIVE:      @tablet, @mobile (+ weitere konfigurierte Breakpoints)
```

---

## 10. Was NICHT in die JSON gehört

| Bedarf                      | Wo stattdessen                                   |
|-----------------------------|--------------------------------------------------|
| Element-Labels im Baum      | Editor-State (oder aus `tag` + `id` ableiten)    |
| textStyle-Presets (h1, h2…) | Editor: wendet `class: ["heading-xl"]` an         |
| Ausgewähltes Element        | React Context (Editor-State)                      |
| Undo/Redo History           | React Context (Editor-State)                      |
| Pro-Mode Toggle             | localStorage (Editor-Setting)                     |
| Drag & Drop Zustand         | React Context                                     |
| Breakpoint-Pixel-Werte      | `settings.breakpoints` (global, nicht pro Element)|
| `label` auf Elementen       | Editor-State oder automatisch ableiten            |

---

## 11. Migration von v1

| v1 (aktuell)                         | v2 (dieses Format)                     |
|---------------------------------------|----------------------------------------|
| `page.blocks[]`                       | ❌ Entfällt                             |
| `page.veBody`                         | → `page.body`                          |
| `page.isVisualEditor`                 | ❌ Entfällt (immer VE)                  |
| `VEElement.type` (`"Text"`)           | → `element.tag` (`"text"`)             |
| `VEElement.label`                     | ❌ Entfällt (Editor-State)              |
| `VEText.content` (HTML)              | → `element.html`                        |
| `VEText.textStyle`                    | → `element.class: ["heading-xl"]`       |
| `VEButton.content.text/link`          | → `element.text`, `element.href`       |
| `VEImage.content.src/alt`             | → `element.src`, `element.alt`         |
| `VEIcon.content.*`                    | → `element.icon`, `element.stroke`     |
| `VENavbar.stickyMode`                 | → `element.sticky`                     |
| `VENavbar.mobileBreakpoint`           | → `settings.breakpoints` (global)      |
| `{ value: 56, unit: "px" }`           | → `[56, "px"]`                         |
| `styles.desktop.X / tablet / mobile`  | → `styles.X` + `@tablet` + `@mobile`  |
| `{ kind: "custom", hex: "#..." }`     | → `"#..."`                             |
| `{ kind: "tokenRef", ref: "..." }`    | → `{ "ref": "..." }`                   |
| Alles Inline-Styles                   | → `class` + Inline-Overrides           |

---

## 12. Webflow-Kompatibilität

| Webflow Feature                | v1          | v2 (dieses Format) | Anmerkung                          |
|--------------------------------|-------------|---------------------|------------------------------------|
| Elementbaum (DOM-Hierarchie)   | ✅          | ✅                  |                                    |
| Flexbox                        | ✅          | ✅                  |                                    |
| CSS Grid                       | ✅          | ✅                  |                                    |
| Responsive Breakpoints         | ✅ (3)      | ✅ (3, erweiterbar) |                                    |
| CSS Classes / Combo Classes    | ❌          | ✅                  | `class` + `_extends`               |
| Hover / Focus / Active States  | ❌          | ✅                  | `:hover`, `:focus`, `:active`      |
| Transitions                    | ❌          | ✅                  | `transition` + `transitions[]`     |
| Animations / Keyframes         | ❌          | ✅                  | `animation` + `settings.keyframes` |
| CSS Filters                    | ❌          | ✅                  | `filter`, `backdropFilter`         |
| Blend Modes                    | ❌          | ✅                  | `mixBlendMode`                     |
| Text Shadow                    | ❌          | ✅                  | `textShadow`                       |
| Outline (Barrierefreiheit)     | ❌          | ✅                  | `outline`, `outlineOffset`         |
| Custom Attributes              | ❌          | ✅                  | `attrs` Objekt                     |
| Components / Symbols           | ❌          | ✅                  | `components` + `ref` + `overrides` |
| Visibility per Breakpoint      | ❌          | ✅                  | `visible` Objekt                   |
| Gradient Backgrounds           | ✅          | ✅                  | `backgroundGradient`               |
| Box Shadow                     | ✅          | ✅                  |                                    |
| Opacity                        | ✅          | ✅                  |                                    |
| Overflow                       | ✅          | ✅                  |                                    |
| Transform                      | ✅          | ✅                  |                                    |
| Aspect Ratio                   | ✅          | ✅                  |                                    |
| Position (sticky/fixed/abs)    | ✅          | ✅                  |                                    |
| Unit-Switch im Editor          | ❌ (Strings)| ✅ (Tuples)         |                                    |
| SEO Attributes                 | ~           | ✅                  | `seo` + `attrs`                    |

### Noch nicht abgedeckt (geplant)

- Interactions 2.0 (komplexe Scroll-basierte Animationen)
- Interactive Widgets (Tabs, Accordion, Slider, Modal, Lightbox)
- 3D Transforms
- Background Video
- Custom Code Embed
- CMS Collections / Dynamic Content

---

## 13. Erweiterungen (geplant)

Folgende Features können später hinzugefügt werden, ohne das bestehende Format zu brechen:

| Feature                | Priorität | Umsetzung                                    |
|------------------------|-----------|-----------------------------------------------|
| Tabs                   | Hoch      | Neuer Tag `tabs` mit `items[]`                |
| Slider / Carousel      | Hoch      | Neuer Tag `slider` mit `slides[]`             |
| Accordion / FAQ        | Hoch      | Neuer Tag `accordion` mit `items[]`           |
| Lightbox               | Hoch      | Neuer Tag `lightbox` oder Attribut auf `image`|
| Scroll-Animationen     | Mittel    | Erweiterte `animation.trigger`-Optionen       |
| Embed (Custom Code)    | Mittel    | Neuer Tag `embed` mit `code`: string          |
| Map                    | Niedrig   | Neuer Tag `map` mit Koordinaten               |
| 3D Transforms          | Niedrig   | Erweiterte `transform`-Werte                  |
| Background Video       | Niedrig   | Neues Property auf `section`/`container`      |
| Lottie-Animationen     | Niedrig   | Neuer Tag `lottie` mit `src`                  |

---

## 14. Changelog

| Datum      | Version    | Änderung                                              |
|------------|------------|-------------------------------------------------------|
| 2025-01    | 2.0-draft  | Initiale Spezifikation basierend auf FORMAT_VORSCHLAG v2. Hinzugefügt: `visible` pro Breakpoint. |

---

> ⚠️ **Hinweis:** Dieses Format ist ein Draft und kann sich im Laufe der Implementierung ändern.
> Änderungen werden im [Changelog](#14-changelog) dokumentiert.
> Bei Fragen oder Anpassungswünschen bitte im Projekt-Repository ein Issue erstellen.
