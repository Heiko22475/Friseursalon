# BeautifulCMS – Website JSON Format Specification

> **Version:** 2.1  
> **Letzte Aktualisierung:** 2026-02  
> **Format:** v2 (Elementbaum + Klassen-System)

---

## Inhaltsverzeichnis

1. [Designprinzipien](#1-designprinzipien)
2. [Gesamtstruktur](#2-gesamtstruktur)
3. [Elementformat](#3-elementformat)
4. [Style-System](#4-style-system)
5. [Benannte Styles / Klassen](#5-benannte-styles--klassen)
6. [Responsive Breakpoints](#6-responsive-breakpoints)
7. [Sichtbarkeit pro Breakpoint](#7-sichtbarkeit-pro-breakpoint)
8. [Vollständige CSS-Property-Liste](#8-vollständige-css-property-liste)
9. [Theme-Farbnamen](#9-theme-farbnamen)
10. [Lucide-Icon-Namen](#10-lucide-icon-namen)
11. [Font-IDs](#11-font-ids)

---

## 1. Designprinzipien

1. **Ein Elementbaum pro Seite:** Jede Seite hat genau ein `body`-Wurzelelement mit Kindern. Kein `blocks[]`, kein `veBody`.
2. **Strukturierte Werte:** Style-Werte als `[value, "unit"]`-Tuples, Farben als `"#hex"` oder `{ "ref": "name" }`.
3. **Desktop-First Responsive:** Basis-Werte = Desktop. `@tablet` und `@mobile` überschreiben nur was sich ändert.
4. **Klassen-System:** Benannte Styles im Top-Level `styles`-Objekt verhindern Duplikation. Elemente referenzieren per `class: [...]`.
5. **Keine Editor-Interna:** Labels, Selection-State, Undo-History gehören NICHT in die JSON.

---

## 2. Gesamtstruktur

```jsonc
{
  "settings": {
    "name": "Salonname",
    "domain": "example.de",
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
    "contact": { ... },
    "hours": [ ... ],
    "breakpoints": { "tablet": 992, "mobile": 478 }
  },

  "styles": { /* Benannte Klassen → Abschnitt 5 */ },

  "components": {},

  "pages": [
    {
      "id": "page-home",
      "title": "Startseite",
      "slug": "home",
      "isHome": true,
      "isPublished": true,
      "showInMenu": true,
      "seo": { "title": "...", "description": "..." },
      "body": {
        "id": "body",
        "tag": "body",
        "children": [ /* ... */ ]
      }
    }
  ]
}
```

### 2.1 Top-Level-Felder

| Feld         | Typ    | Pflicht | Beschreibung                                     |
|--------------|--------|---------|--------------------------------------------------|
| `settings`   | object | ✅      | Globale Konfiguration: Name, Domain, Theme       |
| `styles`     | object | ✅      | Benannte Style-Klassen (= CSS-Klassen)           |
| `components` | object | —       | Wiederverwendbare Elementbäume (leer = `{}`)     |
| `pages`      | array  | ✅      | Seiten mit jeweils einem `body`-Elementbaum      |

### 2.2 Felder pro Seite

| Feld          | Typ     | Pflicht | Beschreibung                          |
|---------------|---------|---------|---------------------------------------|
| `id`          | string  | ✅      | Eindeutige Seiten-ID                  |
| `title`       | string  | ✅      | Anzeigename                           |
| `slug`        | string  | ✅      | URL-Pfad (`"home"`, `"kontakt"`)      |
| `isHome`      | boolean | —       | Startseite?                           |
| `isPublished` | boolean | —       | Veröffentlicht?                       |
| `showInMenu`  | boolean | —       | In Navigation anzeigen?               |
| `seo`         | object  | —       | `{ title, description }`             |
| `body`        | Element | ✅      | Wurzelelement (`tag: "body"`)         |

---

## 3. Elementformat

### 3.1 Grundstruktur

```jsonc
{
  "id": "unique-element-id",
  "tag": "text",                 // Element-Typ (siehe 3.2)
  "class": ["heading-xl"],       // Referenzen auf benannte Styles (optional)
  "visible": {                   // Sichtbarkeit pro Breakpoint (optional)
    "desktop": true,
    "tablet": true,
    "mobile": false
  },
  "styles": { /* ... */ },       // Inline-Styles (optional, überschreiben class)
  "children": [ /* ... */ ]      // Kind-Elemente (nur bei Container-Tags)
  // + tag-spezifische Properties (html, src, text, href, icon, ...)
}
```

### 3.2 Element-Tags

| `tag`       | Beschreibung           | Tag-spezifische Properties                            |
|-------------|------------------------|-------------------------------------------------------|
| `body`      | Wurzelelement          | –                                                     |
| `section`   | Vollbreiter Abschnitt  | `anchorId?`: string                                   |
| `container` | Flex/Grid-Container    | –                                                     |
| `text`      | Text (HTML-String)     | `html`: string                                        |
| `image`     | Bild                   | `src`: string, `alt`: string                          |
| `button`    | Button/CTA             | `text`: string, `href`: string, `newTab?`: boolean    |
| `link`      | Textlink               | `text`: string, `href`: string, `newTab?`: boolean    |
| `icon`      | Lucide-Icon            | `icon`: string (PascalCase), `stroke?`: number        |
| `nav`       | Navigationsleiste      | `sticky?`: boolean \| `"sticky"` \| `"fixed"`         |
| `divider`   | Trennlinie             | `lineStyle?`: `"solid"` \| `"dashed"` \| `"dotted"`  |
| `spacer`    | Abstandshalter         | –                                                     |
| `list`      | Liste (ul/ol)          | `ordered?`: boolean                                   |

### 3.3 Tag-spezifische Beispiele

#### `text`
```jsonc
{
  "id": "headline",
  "tag": "text",
  "html": "<h2>Willkommen</h2>",
  "class": ["heading-lg"]
}
```
- `html`: HTML-String. Erlaubt: `<h1>`–`<h6>`, `<p>`, `<br>`, `<strong>`, `<em>`, `<a>`, `<span>`.
- Semantik: Das äußere HTML-Tag (`<h1>`, `<p>`, etc.) bestimmt die Semantik.

#### `image`
```jsonc
{
  "id": "hero-bg",
  "tag": "image",
  "src": "/media/salon.jpg",
  "alt": "Salon-Interior",
  "styles": { "objectFit": "cover", "width": [100, "%"], "height": [400, "px"] }
}
```

#### `button`
```jsonc
{
  "id": "cta",
  "tag": "button",
  "text": "Jetzt buchen",
  "href": "#termin",
  "class": ["btn-primary"]
}
```

#### `link`
```jsonc
{
  "id": "nav-link-1",
  "tag": "link",
  "text": "Leistungen",
  "href": "#leistungen",
  "class": ["nav-link"]
}
```
- `link` wird intern wie `button` behandelt, aber als `<a>` gerendert. Round-trip sicher.

#### `icon`
```jsonc
{
  "id": "icon-phone",
  "tag": "icon",
  "icon": "Phone",
  "stroke": 1.5,
  "styles": { "width": [24, "px"], "height": [24, "px"], "color": "#2D2926" }
}
```

#### `nav`
```jsonc
{
  "id": "navbar",
  "tag": "nav",
  "sticky": "sticky",
  "styles": { "display": "flex", "justifyContent": "space-between", "alignItems": "center" },
  "children": [ /* Logo, Nav-Links, CTA */ ]
}
```

---

## 4. Style-System

### 4.1 Wertformate

| Typ                    | v2-JSON-Format                 | Beispiel                                          |
|------------------------|--------------------------------|---------------------------------------------------|
| Größe mit Einheit      | `[value, "unit"]`              | `[56, "px"]`, `[100, "%"]`, `[80, "vh"]`         |
| Auto-Wert              | `"auto"`                       | `"auto"`                                          |
| Reine Zahl             | `number`                       | `1.5` (lineHeight), `0.8` (opacity), `700` (fontWeight) |
| Farbe – Theme-Ref      | `{ "ref": "name" }`           | `{ "ref": "primary" }`, `{ "ref": "muted" }`     |
| Farbe – Custom Hex     | `"#RRGGBB"`                   | `"#2D2926"`, `"#F9F7F2"`                          |
| Unitless String        | `string`                       | `"repeat(4, 1fr)"`, `"cover"`, `"pointer"`       |

> ⚠️ **NIEMALS** Größen-Werte als Objekte `{ "value": 56, "unit": "px" }` schreiben! Immer Tuples: `[56, "px"]`. Die Objekt-Form ist die VE-interne Repräsentation und wird automatisch konvertiert.

### 4.2 Inline-Styles auf Elementen

Desktop-First mit `@tablet`/`@mobile` Overrides:

```jsonc
{
  "styles": {
    "fontSize": [56, "px"],
    "paddingTop": [120, "px"],
    "paddingLeft": [64, "px"],
    "paddingRight": [64, "px"],

    "@tablet": {
      "fontSize": [40, "px"],
      "paddingLeft": [24, "px"],
      "paddingRight": [24, "px"]
    },
    "@mobile": {
      "fontSize": [28, "px"],
      "paddingLeft": [16, "px"],
      "paddingRight": [16, "px"]
    }
  }
}
```

### 4.3 Pseudo-States

`:hover`, `:focus`, `:active` im styles-Objekt:

```jsonc
{
  "styles": {
    "backgroundColor": "#2D2926",
    "transition": "all 0.2s ease",

    ":hover": {
      "backgroundColor": "#1a1a1a",
      "transform": "translateY(-2px)"
    }
  }
}
```

States + Breakpoints kombiniert:
```jsonc
{
  "styles": {
    ":hover": { "transform": "scale(1.05)" },
    "@mobile": {
      ":hover": { "transform": "none" }
    }
  }
}
```

### 4.4 Farbwerte im v2-Format

| Was                    | v2-JSON                        | VE-intern (auto-konvertiert)                     |
|------------------------|--------------------------------|--------------------------------------------------|
| Custom Hex             | `"#2D2926"`                    | `{ kind: "custom", hex: "#2D2926" }`             |
| Theme-Referenz         | `{ "ref": "primary" }`        | `{ kind: "tokenRef", ref: "primary" }`           |

---

## 5. Benannte Styles / Klassen

Benannte Styles (≈ CSS-Klassen ≈ Webflow-Classes) werden im Top-Level `styles`-Objekt definiert.

### 5.1 Definition

```jsonc
{
  "styles": {
    "btn": {
      "display": "inline-flex",
      "alignItems": "center",
      "justifyContent": "center",
      "fontWeight": 500,
      "fontSize": [14, "px"],
      "borderRadius": [4, "px"],
      "cursor": "pointer",
      "transition": "all 0.2s ease",
      ":hover": { "transform": "translateY(-1px)" }
    },

    "btn-primary": {
      "_extends": "btn",
      "backgroundColor": { "ref": "primary" },
      "color": { "ref": "background" },
      "paddingTop": [16, "px"],
      "paddingBottom": [16, "px"],
      "paddingLeft": [32, "px"],
      "paddingRight": [32, "px"],
      ":hover": { "backgroundColor": "#1a1a1a" }
    }
  }
}
```

### 5.2 Vererbung mit `_extends`

- `"_extends": "btn"` → `btn-primary` erbt alle Props von `btn`
- Kettenvererbung möglich (z.B. `btn-primary` → `btn` → `base-interactive`)
- Zirkuläre Vererbung wird erkannt und ignoriert

### 5.3 Responsive Overrides in Klassen

```jsonc
{
  "heading-xl": {
    "fontWeight": 800,
    "fontSize": [56, "px"],
    "lineHeight": 1.1,
    "@tablet": { "fontSize": [40, "px"] },
    "@mobile": { "fontSize": [28, "px"] }
  }
}
```

### 5.4 Verwendung auf Elementen

```jsonc
{
  "id": "hero-cta",
  "tag": "button",
  "text": "Buchen",
  "href": "#",
  "class": ["btn-primary"],
  "styles": { "fontSize": [16, "px"] }
}
```

**Auflösungsreihenfolge** (live, zur Renderzeit):
1. `_extends`-Kette
2. `class[]` links-nach-rechts
3. Inline `styles` überschreiben alles

### 5.5 Combo-Klassen

```jsonc
{ "class": ["btn", "btn-large", "btn-primary"] }
```

---

## 6. Responsive Breakpoints

### 6.1 Standard-Werte

```jsonc
{ "breakpoints": { "tablet": 992, "mobile": 478 } }
```

### 6.2 Desktop-First Prinzip

- Basis-Werte = Desktop
- `@tablet` überschreibt ab ≤ 992px
- `@mobile` überschreibt ab ≤ 478px
- Nur geänderte Properties angeben!

---

## 7. Sichtbarkeit pro Breakpoint

```jsonc
{
  "id": "desktop-nav",
  "tag": "container",
  "visible": { "desktop": true, "tablet": true, "mobile": false },
  "children": [ /* ... */ ]
}
```

| Situation                 | Verhalten                                  |
|---------------------------|--------------------------------------------|
| `visible` nicht angegeben | Sichtbar auf allen Breakpoints             |
| Breakpoint fehlt          | Wird als `true` behandelt                  |

---

## 8. Vollständige CSS-Property-Liste

### Properties mit `[value, "unit"]` Tuples

```
width, height, minWidth, maxWidth, minHeight, maxHeight,
marginTop, marginRight, marginBottom, marginLeft,
paddingTop, paddingRight, paddingBottom, paddingLeft,
fontSize, letterSpacing, gap, rowGap, columnGap, flexBasis,
borderWidth, borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth,
borderRadius, borderTopLeftRadius, borderTopRightRadius,
borderBottomLeftRadius, borderBottomRightRadius,
top, right, bottom, left
```

### Farb-Properties (`"#hex"` oder `{ "ref": "..." }`)

```
color, backgroundColor, borderColor
```

### Reine Zahlen

```
fontWeight (100–900), lineHeight (z.B. 1.5), opacity (0–1),
flexGrow, flexShrink, order, zIndex
```

### Enum-Strings

```
display: "block" | "flex" | "grid" | "inline" | "inline-block" | "inline-flex" | "none"
flexDirection: "row" | "column" | "row-reverse" | "column-reverse"
flexWrap: "nowrap" | "wrap" | "wrap-reverse"
justifyContent: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly"
alignItems: "flex-start" | "center" | "flex-end" | "stretch" | "baseline"
textAlign: "left" | "center" | "right" | "justify"
textTransform: "none" | "uppercase" | "lowercase" | "capitalize"
textDecoration: "none" | "underline" | "line-through"
whiteSpace: "normal" | "nowrap" | "pre" | "pre-wrap"
borderStyle: "none" | "solid" | "dashed" | "dotted"
position: "static" | "relative" | "absolute" | "fixed" | "sticky"
overflow / overflowX / overflowY: "visible" | "hidden" | "scroll" | "auto"
objectFit: "cover" | "contain" | "fill" | "none" | "scale-down"
cursor: "pointer" | "default" | "text" | "move" | "not-allowed"
```

### Freie Strings

```
fontFamily, gridTemplateColumns, gridTemplateRows, gridColumn, gridRow,
backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat,
objectPosition, transform, transformOrigin, aspectRatio, boxShadow, transition
```

---

## 9. Theme-Farbnamen

Für `{ "ref": "..." }` verfügbare Referenzen (aus `settings.theme.colors`):

| Ref-Name      | Typ              | Beispiel    |
|---------------|------------------|-------------|
| `primary`     | Hauptfarbe       | `#2D2926`   |
| `secondary`   | Sekundärfarbe    | `#EFEBE3`   |
| `accent`      | Akzentfarbe      | `#DED9D0`   |
| `background`  | Hintergrund      | `#F9F7F2`   |
| `text`        | Textfarbe        | `#2D2926`   |
| `muted`       | Dezente Elemente | `#8C8279`   |

---

## 10. Lucide-Icon-Namen

Häufig in Friseur-Websites:

| Icon | Name          |
|------|---------------|
| ✂️    | `Scissors`    |
| 🎨    | `Palette`     |
| 🖌️    | `Paintbrush`  |
| ✨    | `Sparkles`    |
| 📞    | `Phone`       |
| 📧    | `Mail`        |
| 📍    | `MapPin`      |
| ⭐    | `Star`        |
| ✅    | `Check`       |
| 🕐    | `Clock`       |
| 📸    | `Camera`      |
| 👤    | `User`        |
| ❤️    | `Heart`       |
| ☰    | `Menu`        |

---

## 11. Font-IDs

| Font-ID            | Anzeigename      |
|--------------------|-------------------|
| `montserrat`       | Montserrat        |
| `poppins`          | Poppins           |
| `inter`            | Inter             |
| `open-sans`        | Open Sans         |
| `playfair-display` | Playfair Display  |
| `lora`             | Lora              |
