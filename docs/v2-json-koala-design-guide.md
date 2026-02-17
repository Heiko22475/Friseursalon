# V2 JSON Design Guide — Koala UI Inspired

Dieses Dokument ist eine vollständige Anleitung für die AI-gestützte Generierung von Website-JSONs im **v2 Body-Tree-Format**. Die Design-Patterns orientieren sich an **Koala UI** (koalaui.com) — einem modernen Design System mit Fokus auf Conversion-Optimierung, konsistente Responsive-Layouts und klares Klassen-System.

---

## 1. Grundprinzipien (Koala UI Design-Philosophie)

### 1.1 Conversion-First

- Jede Seite hat **eine** klare Handlungsaufforderung (CTA)
- Hero-Bereiche kommunizieren den Kernnutzen in ≤ 8 Wörtern
- Social Proof (Bewertungen, Logos) stärkt Vertrauen
- Sektionen folgen einer logischen Leserichtung: Problem → Lösung → Beweis → CTA

### 1.2 Responsive by Default

- Desktop-First mit `@tablet` (≤ 992 px) und `@mobile` (≤ 478 px) Overrides
- Nur **geänderte** Properties in Breakpoints definieren (Cascade)
- Mobile: Spalten auf 1, Schriftgrößen reduzieren, Padding kleiner

### 1.3 Konsistente Klassen (Client-First Naming)

- Semantische Klassennamen: `hero-heading`, `section-title`, `btn-primary`
- Wiederverwendung über Seiten hinweg
- Vererbung via `_extends` für DRY-Styles
- Klassen definieren Typografie; Inline-Styles nur für Einzelanpassungen

### 1.4 Theme-basierte Farben

- **Immer** `{ "ref": "primary" }` statt Hardcoded Hex, wo möglich
- Nur Spezialfarben als `"#rrggbb"` (z.B. Weiß auf Hero-Overlay)
- 6 Kern-Farben: `primary`, `secondary`, `accent`, `background`, `text`, `muted`

---

## 2. V2 Content-Struktur (Komplett)

```jsonc
{
  "settings": {
    "name": "Salonname",
    "domain": "salon-example.de",
    "language": "de",
    "theme": {
      "colors": {
        "primary":    "#2D2926",   // Hauptmarkenfarbe
        "secondary":  "#EFEBE3",   // Helle Akzentfarbe / Hintergrund
        "accent":     "#DED9D0",   // Dezenter Akzent
        "background": "#F9F7F2",   // Seitenhintergrund (Light-Theme)
        "text":       "#2D2926",   // Standard-Textfarbe
        "muted":      "#8C8279"    // Dezente Texte, Beschriftungen
      },
      "fonts": {
        "heading": "Montserrat",   // Display-Schrift für Überschriften
        "body": "Montserrat"       // Lesefreundliche Laufschrift
      }
    },
    "contact": {
      "phone": "+49 69 12345678",
      "email": "info@salon-example.de",
      "address": {
        "street": "Musterstraße 12",
        "postalCode": "60311",
        "city": "Frankfurt am Main"
      }
    },
    "hours": [
      { "day": "Montag",     "open": "09:00", "close": "18:00" },
      { "day": "Dienstag",   "open": "09:00", "close": "19:00" },
      { "day": "Mittwoch",   "open": "09:00", "close": "19:00" },
      { "day": "Donnerstag", "open": "09:00", "close": "20:00" },
      { "day": "Freitag",    "open": "09:00", "close": "18:00" },
      { "day": "Samstag",    "open": "09:00", "close": "14:00" },
      { "day": "Sonntag",    "open": null,    "close": null     }
    ],
    "breakpoints": { "tablet": 992, "mobile": 478 }
  },

  "styles": { /* Benannte Klassen — siehe §4 */ },
  "components": {},

  "pages": [
    {
      "id": "page-home",
      "title": "Startseite",
      "slug": "home",
      "isHome": true,
      "isPublished": true,
      "showInMenu": true,
      "seo": {
        "title": "Salon Example — Ihr Friseur in Frankfurt",
        "description": "Moderner Friseursalon in Frankfurt. Haarschnitte, Färbungen, Styling."
      },
      "body": { /* Root-Element mit tag:"body" — siehe §3 */ }
    }
  ]
}
```

---

## 3. Element-Referenz

### 3.1 Allgemeine Element-Struktur

```jsonc
{
  "id": "unique-id",          // Pflicht — eindeutig pro Seite
  "tag": "container",         // Pflicht — Element-Typ
  "class": ["cls-name"],      // Referenz auf styles-Definitionen
  "styles": {},               // Inline-Overrides (v2-Format)
  "visible": {                // Sichtbarkeit pro Viewport (optional)
    "desktop": true,
    "tablet": true,
    "mobile": false
  },
  "children": []              // Kind-Elemente (nur Container-Tags)
}
```

### 3.2 Verfügbare Tags

| Tag | HTML | Container? | Spezifische Properties |
|-----|------|-----------|----------------------|
| `body` | `<div>` | Ja | — |
| `section` | `<section>` | Ja | `anchorId` |
| `container` | `<div>` | Ja | — |
| `text` | `<div>` | Nein | `html` (HTML-String) |
| `image` | `<img>` | Nein | `src`, `alt` |
| `button` | `<a>` | Nein | `text`, `href`, `newTab` |
| `link` | `<a>` | Ja | `text`, `href`, `newTab` |
| `icon` | `<span>` | Nein | `icon` (PascalCase Lucide), `stroke` |
| `nav` | `<nav>` | Ja | `sticky` (`true` / `"sticky"` / `"fixed"`) |
| `divider` | `<hr>` | Nein | `lineStyle` (`"solid"`, `"dashed"`, `"dotted"`) |
| `spacer` | `<div>` | Nein | — (Höhe über styles) |
| `list` | `<ul>/<ol>` | Ja | `ordered` |
| `video` | `<video>` | Nein | `src`, `poster`, `autoplay` |

### 3.3 Text-Elemente

```jsonc
{
  "id": "hero-heading",
  "tag": "text",
  "html": "<h1>Willkommen bei Salon Example</h1>",
  "class": ["hero-heading"]
}
```

**Erlaubte HTML-Tags im `html`-Feld:**  
`<h1>` – `<h6>`, `<p>`, `<br>`, `<strong>`, `<em>`, `<a>`, `<span>`, `<u>`

> Der äußere HTML-Tag bestimmt die Semantik (h1 = Hauptüberschrift, p = Absatz). Das Element selbst rendert als `<div>` mit `dangerouslySetInnerHTML`.

### 3.4 Bild-Elemente

```jsonc
{
  "id": "about-img",
  "tag": "image",
  "src": "/media/salon-interior.jpg",
  "alt": "Salon Innenansicht",
  "class": ["img-cover"]
}
```

### 3.5 Button-Elemente

```jsonc
{
  "id": "cta-book",
  "tag": "button",
  "text": "Jetzt Termin buchen",
  "href": "/kontakt",
  "newTab": false,
  "class": ["btn-primary"]
}
```

### 3.6 Icon-Elemente

```jsonc
{
  "id": "icon-scissors",
  "tag": "icon",
  "icon": "Scissors",   // Lucide PascalCase
  "stroke": 1.5,
  "class": ["icon-feature"]
}
```

**Häufig verwendete Icons:**  
`Scissors`, `Phone`, `MapPin`, `Clock`, `Star`, `Heart`, `Mail`, `Instagram`, `Facebook`, `Menu`, `X`, `ChevronRight`, `ArrowRight`, `Sparkles`, `Users`, `Calendar`, `Award`

---

## 4. Style-System

### 4.1 Werte-Formate

| Typ | v2-Format | Beispiele |
|-----|-----------|-----------|
| Größe (mit Einheit) | `[wert, "einheit"]` | `[56, "px"]`, `[100, "%"]`, `[80, "vh"]`, `[2, "rem"]` |
| Auto | `"auto"` | `"auto"` |
| Farbe (Hex) | `"#RRGGBB"` | `"#2D2926"` |
| Farbe (Theme-Ref) | `{ "ref": "name" }` | `{ "ref": "primary" }` |
| Zahl | `number` | `1.5` (lineHeight), `700` (fontWeight) |
| Enum/String | `string` | `"flex"`, `"center"`, `"cover"` |
| Freitext | `string` | `"repeat(3, 1fr)"`, `"0 4px 20px rgba(0,0,0,0.1)"` |

### 4.2 Property-Kategorien

**Size-Properties** (verwenden `[wert, "einheit"]`):
```
width, height, minWidth, maxWidth, minHeight, maxHeight,
marginTop, marginRight, marginBottom, marginLeft,
paddingTop, paddingRight, paddingBottom, paddingLeft,
fontSize, letterSpacing, gap, rowGap, columnGap,
borderWidth, borderRadius,
top, right, bottom, left
```

**Color-Properties** (verwenden `"#hex"` oder `{ "ref": "..." }`):
```
color, backgroundColor, borderColor
```

**lineHeight** ist eine reine Zahl (Multiplikator wie `1.5`), KEIN Tupel.

### 4.3 Responsive Breakpoints

Desktop-First. Nur geänderte Werte in Breakpoints:

```jsonc
{
  "fontSize": [56, "px"],            // Desktop (Basis)
  "paddingTop": [120, "px"],

  "@tablet": {                        // ≤ 992 px
    "fontSize": [40, "px"],
    "paddingTop": [80, "px"]
  },

  "@mobile": {                        // ≤ 478 px
    "fontSize": [28, "px"],
    "paddingTop": [48, "px"]
  }
}
```

**Cascade:**  Desktop → + `@tablet` → + `@mobile`

### 4.4 Pseudo-States

```jsonc
{
  "backgroundColor": { "ref": "primary" },
  "transition": "all 0.2s ease",

  ":hover": {
    "backgroundColor": "#1a1a1a",
    "transform": "translateY(-2px)"
  },
  ":active": {
    "transform": "scale(0.98)"
  }
}
```

### 4.5 Sichtbarkeit (Visibility)

```jsonc
{
  "visible": { "desktop": true, "tablet": true, "mobile": false }
}
```

Wenn `visible` fehlt → auf allen Viewports sichtbar.

---

## 5. Klassen-System (Benannte Styles)

### 5.1 Konzept

Klassen werden in `content.styles` definiert und von Elementen via `class: [...]` referenziert. Dies entspricht der **Client-First Strategie** von Koala UI — semantische, wiederverwendbare Klassen für Konsistenz.

### 5.2 Vererbung mit `_extends`

```jsonc
{
  "styles": {
    "btn": {
      "display": "inline-flex",
      "alignItems": "center",
      "justifyContent": "center",
      "fontWeight": 600,
      "fontSize": [14, "px"],
      "borderRadius": [8, "px"],
      "cursor": "pointer",
      "transition": "all 0.2s ease"
    },
    "btn-primary": {
      "_extends": "btn",
      "backgroundColor": { "ref": "primary" },
      "color": "#ffffff",
      "paddingTop": [14, "px"],
      "paddingBottom": [14, "px"],
      "paddingLeft": [28, "px"],
      "paddingRight": [28, "px"],
      ":hover": { "opacity": 0.9, "transform": "translateY(-1px)" }
    },
    "btn-secondary": {
      "_extends": "btn",
      "backgroundColor": "transparent",
      "color": { "ref": "primary" },
      "borderWidth": [1, "px"],
      "borderStyle": "solid",
      "borderColor": { "ref": "primary" },
      "paddingTop": [14, "px"],
      "paddingBottom": [14, "px"],
      "paddingLeft": [28, "px"],
      "paddingRight": [28, "px"],
      ":hover": { "backgroundColor": { "ref": "primary" }, "color": "#ffffff" }
    }
  }
}
```

### 5.3 Mehrere Klassen (Combo Classes)

```jsonc
{ "class": ["btn", "btn-large", "btn-primary"] }
```

Resolution: Links nach rechts gemischt. Die letzte Klasse gewinnt bei Konflikten.

---

## 6. Koala UI Design Patterns — Vollständige Klassen-Bibliothek

Die folgenden Style-Definitionen bilden ein komplettes Koala-UI-inspiriertes Design-System. Kopiere den gesamten `"styles"`-Block in dein JSON.

```jsonc
{
  "styles": {

    // ═══════════════════════════════════════════
    // TYPOGRAPHY — Überschriften
    // ═══════════════════════════════════════════

    "heading-display": {
      "fontWeight": 800,
      "fontSize": [64, "px"],
      "lineHeight": 1.05,
      "letterSpacing": [-1, "px"],
      "color": { "ref": "text" },
      "@tablet": { "fontSize": [48, "px"] },
      "@mobile": { "fontSize": [32, "px"], "letterSpacing": [0, "px"] }
    },

    "heading-xl": {
      "fontWeight": 700,
      "fontSize": [48, "px"],
      "lineHeight": 1.1,
      "letterSpacing": [-0.5, "px"],
      "color": { "ref": "text" },
      "@tablet": { "fontSize": [36, "px"] },
      "@mobile": { "fontSize": [28, "px"], "letterSpacing": [0, "px"] }
    },

    "heading-lg": {
      "fontWeight": 700,
      "fontSize": [36, "px"],
      "lineHeight": 1.2,
      "color": { "ref": "text" },
      "@tablet": { "fontSize": [28, "px"] },
      "@mobile": { "fontSize": [24, "px"] }
    },

    "heading-md": {
      "fontWeight": 600,
      "fontSize": [24, "px"],
      "lineHeight": 1.3,
      "color": { "ref": "text" },
      "@tablet": { "fontSize": [20, "px"] },
      "@mobile": { "fontSize": [18, "px"] }
    },

    "heading-sm": {
      "fontWeight": 600,
      "fontSize": [20, "px"],
      "lineHeight": 1.4,
      "color": { "ref": "text" },
      "@mobile": { "fontSize": [16, "px"] }
    },

    // ═══════════════════════════════════════════
    // TYPOGRAPHY — Fließtext
    // ═══════════════════════════════════════════

    "text-body": {
      "fontWeight": 400,
      "fontSize": [16, "px"],
      "lineHeight": 1.6,
      "color": { "ref": "text" }
    },

    "text-body-lg": {
      "fontWeight": 400,
      "fontSize": [18, "px"],
      "lineHeight": 1.7,
      "color": { "ref": "text" },
      "@mobile": { "fontSize": [16, "px"] }
    },

    "text-small": {
      "fontWeight": 400,
      "fontSize": [14, "px"],
      "lineHeight": 1.5,
      "color": { "ref": "muted" }
    },

    "text-caption": {
      "fontWeight": 500,
      "fontSize": [12, "px"],
      "lineHeight": 1.4,
      "textTransform": "uppercase",
      "letterSpacing": [1.5, "px"],
      "color": { "ref": "muted" }
    },

    "text-hero-sub": {
      "fontWeight": 400,
      "fontSize": [20, "px"],
      "lineHeight": 1.6,
      "color": "#ffffff",
      "opacity": 0.85,
      "@tablet": { "fontSize": [18, "px"] },
      "@mobile": { "fontSize": [16, "px"] }
    },

    // ═══════════════════════════════════════════
    // SECTION TITLE — Konsistente Abschnitts-Kopfzeilen
    // ═══════════════════════════════════════════

    "section-label": {
      "fontWeight": 600,
      "fontSize": [13, "px"],
      "lineHeight": 1.2,
      "textTransform": "uppercase",
      "letterSpacing": [2, "px"],
      "color": { "ref": "primary" },
      "textAlign": "center",
      "marginBottom": [12, "px"]
    },

    "section-title": {
      "_extends": "heading-xl",
      "textAlign": "center",
      "marginBottom": [16, "px"]
    },

    "section-subtitle": {
      "fontWeight": 400,
      "fontSize": [18, "px"],
      "lineHeight": 1.6,
      "color": { "ref": "muted" },
      "textAlign": "center",
      "maxWidth": [640, "px"],
      "@mobile": { "fontSize": [16, "px"] }
    },

    // ═══════════════════════════════════════════
    // BUTTONS — Koala-Style
    // ═══════════════════════════════════════════

    "btn": {
      "display": "inline-flex",
      "alignItems": "center",
      "justifyContent": "center",
      "gap": [8, "px"],
      "fontWeight": 600,
      "fontSize": [14, "px"],
      "lineHeight": 1,
      "borderRadius": [8, "px"],
      "cursor": "pointer",
      "transition": "all 0.2s ease",
      "textDecoration": "none"
    },

    "btn-primary": {
      "_extends": "btn",
      "backgroundColor": { "ref": "primary" },
      "color": "#ffffff",
      "paddingTop": [14, "px"],
      "paddingBottom": [14, "px"],
      "paddingLeft": [28, "px"],
      "paddingRight": [28, "px"],
      ":hover": {
        "opacity": 0.9,
        "transform": "translateY(-1px)",
        "boxShadow": "0 4px 12px rgba(0,0,0,0.15)"
      },
      "@mobile": {
        "paddingLeft": [20, "px"],
        "paddingRight": [20, "px"]
      }
    },

    "btn-secondary": {
      "_extends": "btn",
      "backgroundColor": "transparent",
      "color": { "ref": "primary" },
      "borderWidth": [1.5, "px"],
      "borderStyle": "solid",
      "borderColor": { "ref": "primary" },
      "paddingTop": [13, "px"],
      "paddingBottom": [13, "px"],
      "paddingLeft": [28, "px"],
      "paddingRight": [28, "px"],
      ":hover": {
        "backgroundColor": { "ref": "primary" },
        "color": "#ffffff"
      }
    },

    "btn-ghost": {
      "_extends": "btn",
      "backgroundColor": "transparent",
      "color": { "ref": "text" },
      "paddingTop": [14, "px"],
      "paddingBottom": [14, "px"],
      "paddingLeft": [20, "px"],
      "paddingRight": [20, "px"],
      "textDecoration": "underline",
      ":hover": { "opacity": 0.7 }
    },

    "btn-large": {
      "paddingTop": [18, "px"],
      "paddingBottom": [18, "px"],
      "paddingLeft": [36, "px"],
      "paddingRight": [36, "px"],
      "fontSize": [16, "px"],
      "borderRadius": [12, "px"]
    },

    // ═══════════════════════════════════════════
    // LAYOUT — Sektionen & Container
    // ═══════════════════════════════════════════

    "page-body": {
      "display": "flex",
      "flexDirection": "column",
      "minHeight": [100, "vh"],
      "backgroundColor": { "ref": "background" }
    },

    "section-default": {
      "paddingTop": [96, "px"],
      "paddingBottom": [96, "px"],
      "paddingLeft": [24, "px"],
      "paddingRight": [24, "px"],
      "@tablet": {
        "paddingTop": [72, "px"],
        "paddingBottom": [72, "px"]
      },
      "@mobile": {
        "paddingTop": [48, "px"],
        "paddingBottom": [48, "px"],
        "paddingLeft": [16, "px"],
        "paddingRight": [16, "px"]
      }
    },

    "section-compact": {
      "paddingTop": [56, "px"],
      "paddingBottom": [56, "px"],
      "paddingLeft": [24, "px"],
      "paddingRight": [24, "px"],
      "@mobile": {
        "paddingTop": [32, "px"],
        "paddingBottom": [32, "px"],
        "paddingLeft": [16, "px"],
        "paddingRight": [16, "px"]
      }
    },

    "section-hero": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "justifyContent": "center",
      "minHeight": [90, "vh"],
      "paddingTop": [120, "px"],
      "paddingBottom": [120, "px"],
      "paddingLeft": [24, "px"],
      "paddingRight": [24, "px"],
      "position": "relative",
      "overflow": "hidden",
      "@tablet": {
        "minHeight": [70, "vh"],
        "paddingTop": [80, "px"],
        "paddingBottom": [80, "px"]
      },
      "@mobile": {
        "minHeight": [60, "vh"],
        "paddingTop": [64, "px"],
        "paddingBottom": [64, "px"],
        "paddingLeft": [16, "px"],
        "paddingRight": [16, "px"]
      }
    },

    "container-max": {
      "width": [100, "%"],
      "maxWidth": [1200, "px"],
      "marginLeft": "auto",
      "marginRight": "auto"
    },

    "container-narrow": {
      "width": [100, "%"],
      "maxWidth": [800, "px"],
      "marginLeft": "auto",
      "marginRight": "auto"
    },

    "container-wide": {
      "width": [100, "%"],
      "maxWidth": [1440, "px"],
      "marginLeft": "auto",
      "marginRight": "auto"
    },

    // ═══════════════════════════════════════════
    // FLEXBOX & GRID UTILITIES
    // ═══════════════════════════════════════════

    "flex-center": {
      "display": "flex",
      "alignItems": "center",
      "justifyContent": "center"
    },

    "flex-col-center": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center"
    },

    "flex-between": {
      "display": "flex",
      "alignItems": "center",
      "justifyContent": "space-between"
    },

    "grid-2": {
      "display": "grid",
      "gridTemplateColumns": "repeat(2, 1fr)",
      "gap": [32, "px"],
      "@mobile": {
        "gridTemplateColumns": "1fr",
        "gap": [24, "px"]
      }
    },

    "grid-3": {
      "display": "grid",
      "gridTemplateColumns": "repeat(3, 1fr)",
      "gap": [32, "px"],
      "@tablet": { "gridTemplateColumns": "repeat(2, 1fr)" },
      "@mobile": {
        "gridTemplateColumns": "1fr",
        "gap": [24, "px"]
      }
    },

    "grid-4": {
      "display": "grid",
      "gridTemplateColumns": "repeat(4, 1fr)",
      "gap": [24, "px"],
      "@tablet": { "gridTemplateColumns": "repeat(2, 1fr)" },
      "@mobile": {
        "gridTemplateColumns": "1fr",
        "gap": [20, "px"]
      }
    },

    // ═══════════════════════════════════════════
    // CARDS — Koala-UI-inspiriert
    // ═══════════════════════════════════════════

    "card": {
      "display": "flex",
      "flexDirection": "column",
      "backgroundColor": "#ffffff",
      "borderRadius": [16, "px"],
      "overflow": "hidden",
      "transition": "all 0.3s ease",
      ":hover": {
        "transform": "translateY(-4px)",
        "boxShadow": "0 12px 32px rgba(0,0,0,0.1)"
      }
    },

    "card-elevated": {
      "_extends": "card",
      "boxShadow": "0 2px 16px rgba(0,0,0,0.06)"
    },

    "card-bordered": {
      "_extends": "card",
      "borderWidth": [1, "px"],
      "borderStyle": "solid",
      "borderColor": "#e5e5e5",
      ":hover": {
        "borderColor": { "ref": "primary" },
        "transform": "translateY(-2px)",
        "boxShadow": "0 8px 24px rgba(0,0,0,0.08)"
      }
    },

    "card-body": {
      "paddingTop": [24, "px"],
      "paddingBottom": [24, "px"],
      "paddingLeft": [24, "px"],
      "paddingRight": [24, "px"],
      "display": "flex",
      "flexDirection": "column",
      "gap": [12, "px"],
      "flexGrow": 1
    },

    "card-img": {
      "width": [100, "%"],
      "height": [240, "px"],
      "objectFit": "cover",
      "@mobile": { "height": [200, "px"] }
    },

    // ═══════════════════════════════════════════
    // NAVIGATION — Koala Navbar
    // ═══════════════════════════════════════════

    "navbar": {
      "display": "flex",
      "alignItems": "center",
      "justifyContent": "space-between",
      "paddingTop": [16, "px"],
      "paddingBottom": [16, "px"],
      "paddingLeft": [24, "px"],
      "paddingRight": [24, "px"],
      "backgroundColor": { "ref": "background" },
      "zIndex": 100,
      "@mobile": {
        "paddingLeft": [16, "px"],
        "paddingRight": [16, "px"]
      }
    },

    "nav-logo": {
      "fontWeight": 700,
      "fontSize": [20, "px"],
      "color": { "ref": "text" },
      "letterSpacing": [-0.5, "px"]
    },

    "nav-links": {
      "display": "flex",
      "alignItems": "center",
      "gap": [32, "px"],
      "@tablet": { "gap": [24, "px"] }
    },

    "nav-link": {
      "fontWeight": 500,
      "fontSize": [14, "px"],
      "color": { "ref": "text" },
      "textDecoration": "none",
      "transition": "color 0.2s ease",
      ":hover": { "color": { "ref": "primary" } }
    },

    "nav-cta": {
      "_extends": "btn-primary",
      "fontSize": [13, "px"],
      "paddingTop": [10, "px"],
      "paddingBottom": [10, "px"],
      "paddingLeft": [20, "px"],
      "paddingRight": [20, "px"]
    },

    "nav-burger": {
      "width": [24, "px"],
      "height": [24, "px"],
      "color": { "ref": "text" },
      "cursor": "pointer"
    },

    // ═══════════════════════════════════════════
    // HERO — Varianten
    // ═══════════════════════════════════════════

    "hero-heading": {
      "fontWeight": 800,
      "fontSize": [64, "px"],
      "lineHeight": 1.05,
      "letterSpacing": [-1.5, "px"],
      "color": "#ffffff",
      "textAlign": "center",
      "@tablet": { "fontSize": [48, "px"], "letterSpacing": [-1, "px"] },
      "@mobile": { "fontSize": [32, "px"], "letterSpacing": [0, "px"] }
    },

    "hero-bg-image": {
      "position": "absolute",
      "top": [0, "px"],
      "left": [0, "px"],
      "width": [100, "%"],
      "height": [100, "%"],
      "objectFit": "cover",
      "zIndex": 0
    },

    "hero-overlay": {
      "position": "absolute",
      "top": [0, "px"],
      "left": [0, "px"],
      "width": [100, "%"],
      "height": [100, "%"],
      "backgroundColor": "#000000",
      "opacity": 0.4,
      "zIndex": 1
    },

    "hero-content": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": [24, "px"],
      "position": "relative",
      "zIndex": 2,
      "textAlign": "center",
      "maxWidth": [800, "px"]
    },

    "hero-buttons": {
      "display": "flex",
      "alignItems": "center",
      "gap": [16, "px"],
      "marginTop": [8, "px"],
      "@mobile": {
        "flexDirection": "column",
        "width": [100, "%"]
      }
    },

    // ═══════════════════════════════════════════
    // IMAGES
    // ═══════════════════════════════════════════

    "img-cover": {
      "width": [100, "%"],
      "height": [100, "%"],
      "objectFit": "cover"
    },

    "img-rounded": {
      "borderRadius": [16, "px"],
      "overflow": "hidden"
    },

    "img-circle": {
      "borderRadius": [50, "%"],
      "objectFit": "cover"
    },

    // ═══════════════════════════════════════════
    // ICONS
    // ═══════════════════════════════════════════

    "icon-feature": {
      "width": [48, "px"],
      "height": [48, "px"],
      "color": { "ref": "primary" }
    },

    "icon-small": {
      "width": [20, "px"],
      "height": [20, "px"],
      "color": { "ref": "muted" }
    },

    "icon-badge": {
      "width": [40, "px"],
      "height": [40, "px"],
      "color": { "ref": "primary" },
      "backgroundColor": { "ref": "secondary" },
      "borderRadius": [12, "px"],
      "paddingTop": [10, "px"],
      "paddingBottom": [10, "px"],
      "paddingLeft": [10, "px"],
      "paddingRight": [10, "px"]
    },

    // ═══════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════

    "footer": {
      "backgroundColor": { "ref": "text" },
      "color": "#ffffff",
      "paddingTop": [64, "px"],
      "paddingBottom": [32, "px"],
      "paddingLeft": [24, "px"],
      "paddingRight": [24, "px"],
      "@mobile": {
        "paddingTop": [48, "px"],
        "paddingLeft": [16, "px"],
        "paddingRight": [16, "px"]
      }
    },

    "footer-link": {
      "fontWeight": 400,
      "fontSize": [14, "px"],
      "color": "#ffffff",
      "opacity": 0.7,
      "textDecoration": "none",
      "transition": "opacity 0.2s ease",
      ":hover": { "opacity": 1 }
    },

    "footer-heading": {
      "fontWeight": 600,
      "fontSize": [14, "px"],
      "color": "#ffffff",
      "textTransform": "uppercase",
      "letterSpacing": [1, "px"],
      "marginBottom": [16, "px"]
    },

    // ═══════════════════════════════════════════
    // DIVIDER
    // ═══════════════════════════════════════════

    "divider-subtle": {
      "borderWidth": [1, "px"],
      "borderStyle": "solid",
      "borderColor": "#e5e5e5",
      "marginTop": [32, "px"],
      "marginBottom": [32, "px"]
    },

    // ═══════════════════════════════════════════
    // BADGES / CHIPS
    // ═══════════════════════════════════════════

    "badge": {
      "display": "inline-flex",
      "alignItems": "center",
      "gap": [6, "px"],
      "paddingTop": [6, "px"],
      "paddingBottom": [6, "px"],
      "paddingLeft": [12, "px"],
      "paddingRight": [12, "px"],
      "fontSize": [12, "px"],
      "fontWeight": 600,
      "borderRadius": [100, "px"],
      "backgroundColor": { "ref": "secondary" },
      "color": { "ref": "primary" },
      "textTransform": "uppercase",
      "letterSpacing": [0.5, "px"]
    },

    // ═══════════════════════════════════════════
    // TESTIMONIALS / REVIEWS
    // ═══════════════════════════════════════════

    "testimonial-card": {
      "backgroundColor": "#ffffff",
      "borderRadius": [16, "px"],
      "paddingTop": [32, "px"],
      "paddingBottom": [32, "px"],
      "paddingLeft": [32, "px"],
      "paddingRight": [32, "px"],
      "borderWidth": [1, "px"],
      "borderStyle": "solid",
      "borderColor": "#ebebeb"
    },

    "testimonial-text": {
      "fontWeight": 400,
      "fontSize": [16, "px"],
      "lineHeight": 1.7,
      "fontStyle": "italic",
      "color": { "ref": "text" }
    },

    "testimonial-author": {
      "fontWeight": 600,
      "fontSize": [14, "px"],
      "color": { "ref": "text" }
    },

    "testimonial-role": {
      "fontWeight": 400,
      "fontSize": [13, "px"],
      "color": { "ref": "muted" }
    },

    "stars": {
      "display": "flex",
      "gap": [2, "px"],
      "color": "#f59e0b"
    },

    "star-icon": {
      "width": [18, "px"],
      "height": [18, "px"],
      "color": "#f59e0b"
    }
  }
}
```

---

## 7. Sektions-Vorlagen (Koala UI inspiriert)

### 7.1 Navbar — Sticky, transparent bis solid

```jsonc
{
  "id": "navbar",
  "tag": "nav",
  "sticky": "sticky",
  "class": ["navbar"],
  "children": [
    {
      "id": "nav-logo-text",
      "tag": "text",
      "html": "<p><strong>SALON NAME</strong></p>",
      "class": ["nav-logo"]
    },
    {
      "id": "nav-links-wrap",
      "tag": "container",
      "class": ["nav-links"],
      "visible": { "desktop": true, "tablet": true, "mobile": false },
      "children": [
        { "id": "nl-1", "tag": "link", "text": "Services",  "href": "#services",  "class": ["nav-link"] },
        { "id": "nl-2", "tag": "link", "text": "Über uns",  "href": "#about",     "class": ["nav-link"] },
        { "id": "nl-3", "tag": "link", "text": "Galerie",   "href": "#gallery",   "class": ["nav-link"] },
        { "id": "nl-4", "tag": "button", "text": "Termin buchen", "href": "/kontakt", "class": ["nav-cta"] }
      ]
    },
    {
      "id": "nav-burger",
      "tag": "icon",
      "icon": "Menu",
      "stroke": 2,
      "class": ["nav-burger"],
      "visible": { "desktop": false, "tablet": false, "mobile": true }
    }
  ]
}
```

### 7.2 Hero — Vollbild mit Overlay

```jsonc
{
  "id": "hero-section",
  "tag": "section",
  "class": ["section-hero"],
  "children": [
    {
      "id": "hero-bg",
      "tag": "image",
      "src": "{{STOCK_PHOTO_HERO}}",
      "alt": "Salon Atmosphäre",
      "class": ["hero-bg-image"]
    },
    {
      "id": "hero-overlay",
      "tag": "container",
      "class": ["hero-overlay"]
    },
    {
      "id": "hero-content",
      "tag": "container",
      "class": ["hero-content"],
      "children": [
        {
          "id": "hero-label",
          "tag": "text",
          "html": "<p>Willkommen bei</p>",
          "class": ["section-label"],
          "styles": { "color": "#ffffff", "opacity": 0.8 }
        },
        {
          "id": "hero-h1",
          "tag": "text",
          "html": "<h1>Salon Name</h1>",
          "class": ["hero-heading"]
        },
        {
          "id": "hero-sub",
          "tag": "text",
          "html": "<p>Ihr Experte für moderne Frisuren und individuelles Styling in Frankfurt</p>",
          "class": ["text-hero-sub"]
        },
        {
          "id": "hero-btns",
          "tag": "container",
          "class": ["hero-buttons"],
          "children": [
            {
              "id": "hero-cta-1",
              "tag": "button",
              "text": "Termin buchen",
              "href": "/kontakt",
              "class": ["btn-primary", "btn-large"],
              "styles": { "backgroundColor": "#ffffff", "color": { "ref": "text" } }
            },
            {
              "id": "hero-cta-2",
              "tag": "button",
              "text": "Mehr erfahren",
              "href": "#services",
              "class": ["btn-secondary"],
              "styles": { "borderColor": "#ffffff", "color": "#ffffff" }
            }
          ]
        }
      ]
    }
  ]
}
```

### 7.3 Features / USPs — 3-Spalten Icons + Text

```jsonc
{
  "id": "features",
  "tag": "section",
  "class": ["section-default"],
  "anchorId": "features",
  "children": [
    {
      "id": "feat-header",
      "tag": "container",
      "class": ["flex-col-center"],
      "styles": { "marginBottom": [56, "px"] },
      "children": [
        { "id": "feat-label", "tag": "text", "html": "<p>Warum wir?</p>", "class": ["section-label"] },
        { "id": "feat-title", "tag": "text", "html": "<h2>Ihre Vorteile bei uns</h2>", "class": ["section-title"] },
        { "id": "feat-sub", "tag": "text", "html": "<p>Professionelle Qualität meets persönliche Beratung</p>", "class": ["section-subtitle"] }
      ]
    },
    {
      "id": "feat-grid",
      "tag": "container",
      "class": ["container-max", "grid-3"],
      "children": [
        {
          "id": "feat-1",
          "tag": "container",
          "class": ["flex-col-center"],
          "styles": { "gap": [16, "px"], "textAlign": "center" },
          "children": [
            { "id": "feat-1-icon", "tag": "icon", "icon": "Scissors", "stroke": 1.5, "class": ["icon-badge"] },
            { "id": "feat-1-title", "tag": "text", "html": "<h3>Meisterhafte Schnitte</h3>", "class": ["heading-md"] },
            { "id": "feat-1-desc", "tag": "text", "html": "<p>Unsere Stylisten sind ausgebildete Friseurmeister mit jahrelanger Erfahrung.</p>", "class": ["text-body"], "styles": { "color": { "ref": "muted" } } }
          ]
        },
        {
          "id": "feat-2",
          "tag": "container",
          "class": ["flex-col-center"],
          "styles": { "gap": [16, "px"], "textAlign": "center" },
          "children": [
            { "id": "feat-2-icon", "tag": "icon", "icon": "Sparkles", "stroke": 1.5, "class": ["icon-badge"] },
            { "id": "feat-2-title", "tag": "text", "html": "<h3>Premium Produkte</h3>", "class": ["heading-md"] },
            { "id": "feat-2-desc", "tag": "text", "html": "<p>Wir verwenden ausschließlich hochwertige Pflegeprodukte renommierter Marken.</p>", "class": ["text-body"], "styles": { "color": { "ref": "muted" } } }
          ]
        },
        {
          "id": "feat-3",
          "tag": "container",
          "class": ["flex-col-center"],
          "styles": { "gap": [16, "px"], "textAlign": "center" },
          "children": [
            { "id": "feat-3-icon", "tag": "icon", "icon": "Heart", "stroke": 1.5, "class": ["icon-badge"] },
            { "id": "feat-3-title", "tag": "text", "html": "<h3>Persönliche Beratung</h3>", "class": ["heading-md"] },
            { "id": "feat-3-desc", "tag": "text", "html": "<p>Individuelle Typberatung für jeden Kunden — weil jeder Mensch einzigartig ist.</p>", "class": ["text-body"], "styles": { "color": { "ref": "muted" } } }
          ]
        }
      ]
    }
  ]
}
```

### 7.4 Service Cards — Grid mit Bild, Preis, CTA

```jsonc
{
  "id": "services-section",
  "tag": "section",
  "class": ["section-default"],
  "anchorId": "services",
  "styles": { "backgroundColor": { "ref": "secondary" } },
  "children": [
    {
      "id": "srv-header",
      "tag": "container",
      "class": ["flex-col-center"],
      "styles": { "marginBottom": [48, "px"] },
      "children": [
        { "id": "srv-label", "tag": "text", "html": "<p>Services</p>", "class": ["section-label"] },
        { "id": "srv-title", "tag": "text", "html": "<h2>Unsere Leistungen</h2>", "class": ["section-title"] }
      ]
    },
    {
      "id": "srv-grid",
      "tag": "container",
      "class": ["container-max", "grid-3"],
      "children": [
        {
          "id": "srv-card-1",
          "tag": "container",
          "class": ["card-elevated"],
          "children": [
            { "id": "srv-img-1", "tag": "image", "src": "{{STOCK_SERVICE_1}}", "alt": "Damen Haarschnitt", "class": ["card-img"] },
            {
              "id": "srv-body-1",
              "tag": "container",
              "class": ["card-body"],
              "children": [
                { "id": "srv-price-1", "tag": "text", "html": "<p>ab 48 €</p>", "class": ["text-caption"], "styles": { "color": { "ref": "primary" } } },
                { "id": "srv-name-1", "tag": "text", "html": "<h3>Damen Haarschnitt</h3>", "class": ["heading-md"] },
                { "id": "srv-desc-1", "tag": "text", "html": "<p>Professioneller Schnitt mit Waschen, Beratung und Styling. Individuell abgestimmt.</p>", "class": ["text-body"], "styles": { "color": { "ref": "muted" } } },
                { "id": "srv-cta-1", "tag": "button", "text": "Termin buchen", "href": "/kontakt", "class": ["btn-primary"], "styles": { "marginTop": "auto" } }
              ]
            }
          ]
        },
        {
          "id": "srv-card-2",
          "tag": "container",
          "class": ["card-elevated"],
          "children": [
            { "id": "srv-img-2", "tag": "image", "src": "{{STOCK_SERVICE_2}}", "alt": "Herren Haarschnitt", "class": ["card-img"] },
            {
              "id": "srv-body-2",
              "tag": "container",
              "class": ["card-body"],
              "children": [
                { "id": "srv-price-2", "tag": "text", "html": "<p>ab 35 €</p>", "class": ["text-caption"], "styles": { "color": { "ref": "primary" } } },
                { "id": "srv-name-2", "tag": "text", "html": "<h3>Herren Haarschnitt</h3>", "class": ["heading-md"] },
                { "id": "srv-desc-2", "tag": "text", "html": "<p>Moderner Herrenschnitt mit Konturenschnitt und professionellem Styling.</p>", "class": ["text-body"], "styles": { "color": { "ref": "muted" } } },
                { "id": "srv-cta-2", "tag": "button", "text": "Termin buchen", "href": "/kontakt", "class": ["btn-primary"], "styles": { "marginTop": "auto" } }
              ]
            }
          ]
        },
        {
          "id": "srv-card-3",
          "tag": "container",
          "class": ["card-elevated"],
          "children": [
            { "id": "srv-img-3", "tag": "image", "src": "{{STOCK_SERVICE_3}}", "alt": "Färbung & Strähnchen", "class": ["card-img"] },
            {
              "id": "srv-body-3",
              "tag": "container",
              "class": ["card-body"],
              "children": [
                { "id": "srv-price-3", "tag": "text", "html": "<p>ab 65 €</p>", "class": ["text-caption"], "styles": { "color": { "ref": "primary" } } },
                { "id": "srv-name-3", "tag": "text", "html": "<h3>Färbung & Strähnchen</h3>", "class": ["heading-md"] },
                { "id": "srv-desc-3", "tag": "text", "html": "<p>Vollständige Färbung oder kreative Strähnchen-Techniken mit Beratung.</p>", "class": ["text-body"], "styles": { "color": { "ref": "muted" } } },
                { "id": "srv-cta-3", "tag": "button", "text": "Termin buchen", "href": "/kontakt", "class": ["btn-primary"], "styles": { "marginTop": "auto" } }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 7.5 Team — Portraitkarten im Grid

```jsonc
{
  "id": "team-section",
  "tag": "section",
  "class": ["section-default"],
  "anchorId": "team",
  "children": [
    {
      "id": "team-header",
      "tag": "container",
      "class": ["flex-col-center"],
      "styles": { "marginBottom": [48, "px"] },
      "children": [
        { "id": "team-label", "tag": "text", "html": "<p>Unser Team</p>", "class": ["section-label"] },
        { "id": "team-title", "tag": "text", "html": "<h2>Die Menschen hinter dem Spiegel</h2>", "class": ["section-title"] }
      ]
    },
    {
      "id": "team-grid",
      "tag": "container",
      "class": ["container-max", "grid-4"],
      "children": [
        {
          "id": "team-1",
          "tag": "container",
          "class": ["flex-col-center"],
          "styles": { "gap": [16, "px"], "textAlign": "center" },
          "children": [
            { "id": "team-img-1", "tag": "image", "src": "{{STOCK_TEAM_1}}", "alt": "Anna Müller", "class": ["img-circle"], "styles": { "width": [160, "px"], "height": [160, "px"] } },
            { "id": "team-name-1", "tag": "text", "html": "<h3>Anna Müller</h3>", "class": ["heading-sm"] },
            { "id": "team-role-1", "tag": "text", "html": "<p>Friseurmeisterin & Inhaberin</p>", "class": ["text-small"] }
          ]
        },
        {
          "id": "team-2",
          "tag": "container",
          "class": ["flex-col-center"],
          "styles": { "gap": [16, "px"], "textAlign": "center" },
          "children": [
            { "id": "team-img-2", "tag": "image", "src": "{{STOCK_TEAM_2}}", "alt": "Lisa Schmidt", "class": ["img-circle"], "styles": { "width": [160, "px"], "height": [160, "px"] } },
            { "id": "team-name-2", "tag": "text", "html": "<h3>Lisa Schmidt</h3>", "class": ["heading-sm"] },
            { "id": "team-role-2", "tag": "text", "html": "<p>Stylistin & Coloristin</p>", "class": ["text-small"] }
          ]
        },
        {
          "id": "team-3",
          "tag": "container",
          "class": ["flex-col-center"],
          "styles": { "gap": [16, "px"], "textAlign": "center" },
          "children": [
            { "id": "team-img-3", "tag": "image", "src": "{{STOCK_TEAM_3}}", "alt": "Max Weber", "class": ["img-circle"], "styles": { "width": [160, "px"], "height": [160, "px"] } },
            { "id": "team-name-3", "tag": "text", "html": "<h3>Max Weber</h3>", "class": ["heading-sm"] },
            { "id": "team-role-3", "tag": "text", "html": "<p>Haarstylist</p>", "class": ["text-small"] }
          ]
        },
        {
          "id": "team-4",
          "tag": "container",
          "class": ["flex-col-center"],
          "styles": { "gap": [16, "px"], "textAlign": "center" },
          "children": [
            { "id": "team-img-4", "tag": "image", "src": "{{STOCK_TEAM_4}}", "alt": "Sarah Koch", "class": ["img-circle"], "styles": { "width": [160, "px"], "height": [160, "px"] } },
            { "id": "team-name-4", "tag": "text", "html": "<h3>Sarah Koch</h3>", "class": ["heading-sm"] },
            { "id": "team-role-4", "tag": "text", "html": "<p>Auszubildende</p>", "class": ["text-small"] }
          ]
        }
      ]
    }
  ]
}
```

### 7.6 Testimonials / Bewertungen

```jsonc
{
  "id": "reviews-section",
  "tag": "section",
  "class": ["section-default"],
  "styles": { "backgroundColor": { "ref": "secondary" } },
  "children": [
    {
      "id": "rev-header",
      "tag": "container",
      "class": ["flex-col-center"],
      "styles": { "marginBottom": [48, "px"] },
      "children": [
        { "id": "rev-label", "tag": "text", "html": "<p>Kundenstimmen</p>", "class": ["section-label"] },
        { "id": "rev-title", "tag": "text", "html": "<h2>Was unsere Kunden sagen</h2>", "class": ["section-title"] }
      ]
    },
    {
      "id": "rev-grid",
      "tag": "container",
      "class": ["container-max", "grid-3"],
      "children": [
        {
          "id": "rev-1",
          "tag": "container",
          "class": ["testimonial-card"],
          "children": [
            {
              "id": "rev-1-stars",
              "tag": "container",
              "class": ["stars"],
              "styles": { "marginBottom": [16, "px"] },
              "children": [
                { "id": "s1-1", "tag": "icon", "icon": "Star", "stroke": 0, "class": ["star-icon"] },
                { "id": "s1-2", "tag": "icon", "icon": "Star", "stroke": 0, "class": ["star-icon"] },
                { "id": "s1-3", "tag": "icon", "icon": "Star", "stroke": 0, "class": ["star-icon"] },
                { "id": "s1-4", "tag": "icon", "icon": "Star", "stroke": 0, "class": ["star-icon"] },
                { "id": "s1-5", "tag": "icon", "icon": "Star", "stroke": 0, "class": ["star-icon"] }
              ]
            },
            { "id": "rev-1-text", "tag": "text", "html": "<p>„Bin absolut begeistert! Anna hat genau verstanden, was ich wollte und das Ergebnis war perfekt."</p>", "class": ["testimonial-text"] },
            {
              "id": "rev-1-author-row",
              "tag": "container",
              "styles": { "marginTop": [20, "px"] },
              "children": [
                { "id": "rev-1-author", "tag": "text", "html": "<p>Maria S.</p>", "class": ["testimonial-author"] },
                { "id": "rev-1-sub", "tag": "text", "html": "<p>Kundin seit 2022</p>", "class": ["testimonial-role"] }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 7.7 CTA-Banner — Zentriert mit Kontrastfarbe

```jsonc
{
  "id": "cta-section",
  "tag": "section",
  "class": ["section-default", "flex-col-center"],
  "styles": {
    "backgroundColor": { "ref": "primary" },
    "textAlign": "center"
  },
  "children": [
    {
      "id": "cta-content",
      "tag": "container",
      "class": ["container-narrow", "flex-col-center"],
      "styles": { "gap": [24, "px"] },
      "children": [
        { "id": "cta-title", "tag": "text", "html": "<h2>Bereit für Ihren neuen Look?</h2>", "class": ["heading-xl"], "styles": { "color": "#ffffff" } },
        { "id": "cta-sub", "tag": "text", "html": "<p>Vereinbaren Sie jetzt einen Termin — wir freuen uns auf Sie!</p>", "class": ["text-body-lg"], "styles": { "color": "#ffffff", "opacity": 0.85 } },
        { "id": "cta-btn", "tag": "button", "text": "Jetzt Termin buchen", "href": "/kontakt", "class": ["btn-primary", "btn-large"], "styles": { "backgroundColor": "#ffffff", "color": { "ref": "primary" } } }
      ]
    }
  ]
}
```

### 7.8 Galerie — Masonry-artiges Grid

```jsonc
{
  "id": "gallery-section",
  "tag": "section",
  "class": ["section-default"],
  "anchorId": "gallery",
  "children": [
    {
      "id": "gal-header",
      "tag": "container",
      "class": ["flex-col-center"],
      "styles": { "marginBottom": [48, "px"] },
      "children": [
        { "id": "gal-label", "tag": "text", "html": "<p>Portfolio</p>", "class": ["section-label"] },
        { "id": "gal-title", "tag": "text", "html": "<h2>Unsere Arbeiten</h2>", "class": ["section-title"] }
      ]
    },
    {
      "id": "gal-grid",
      "tag": "container",
      "class": ["container-wide", "grid-4"],
      "children": [
        { "id": "gal-1", "tag": "image", "src": "{{STOCK_GALLERY_1}}", "alt": "Frisur 1", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } },
        { "id": "gal-2", "tag": "image", "src": "{{STOCK_GALLERY_2}}", "alt": "Frisur 2", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } },
        { "id": "gal-3", "tag": "image", "src": "{{STOCK_GALLERY_3}}", "alt": "Frisur 3", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } },
        { "id": "gal-4", "tag": "image", "src": "{{STOCK_GALLERY_4}}", "alt": "Frisur 4", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } },
        { "id": "gal-5", "tag": "image", "src": "{{STOCK_GALLERY_5}}", "alt": "Frisur 5", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } },
        { "id": "gal-6", "tag": "image", "src": "{{STOCK_GALLERY_6}}", "alt": "Frisur 6", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } },
        { "id": "gal-7", "tag": "image", "src": "{{STOCK_GALLERY_7}}", "alt": "Frisur 7", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } },
        { "id": "gal-8", "tag": "image", "src": "{{STOCK_GALLERY_8}}", "alt": "Frisur 8", "class": ["img-cover", "img-rounded"], "styles": { "height": [280, "px"] } }
      ]
    }
  ]
}
```

### 7.9 Footer — 4-spaltiger Footer mit Copyright

```jsonc
{
  "id": "footer-section",
  "tag": "section",
  "class": ["footer"],
  "children": [
    {
      "id": "footer-inner",
      "tag": "container",
      "class": ["container-max", "grid-4"],
      "styles": { "marginBottom": [48, "px"] },
      "@mobile": { "gridTemplateColumns": "1fr 1fr" },
      "children": [
        {
          "id": "footer-brand",
          "tag": "container",
          "styles": { "display": "flex", "flexDirection": "column", "gap": [16, "px"] },
          "children": [
            { "id": "ft-logo", "tag": "text", "html": "<p><strong>SALON NAME</strong></p>", "styles": { "fontWeight": 700, "fontSize": [18, "px"], "color": "#ffffff" } },
            { "id": "ft-desc", "tag": "text", "html": "<p>Ihr Friseur in Frankfurt für moderne Schnitte und individuelle Beratung.</p>", "class": ["footer-link"] }
          ]
        },
        {
          "id": "footer-nav",
          "tag": "container",
          "styles": { "display": "flex", "flexDirection": "column", "gap": [8, "px"] },
          "children": [
            { "id": "ft-h-nav", "tag": "text", "html": "<p>Navigation</p>", "class": ["footer-heading"] },
            { "id": "ft-l1", "tag": "link", "text": "Startseite", "href": "/", "class": ["footer-link"] },
            { "id": "ft-l2", "tag": "link", "text": "Services", "href": "#services", "class": ["footer-link"] },
            { "id": "ft-l3", "tag": "link", "text": "Galerie", "href": "#gallery", "class": ["footer-link"] },
            { "id": "ft-l4", "tag": "link", "text": "Kontakt", "href": "/kontakt", "class": ["footer-link"] }
          ]
        },
        {
          "id": "footer-contact",
          "tag": "container",
          "styles": { "display": "flex", "flexDirection": "column", "gap": [8, "px"] },
          "children": [
            { "id": "ft-h-contact", "tag": "text", "html": "<p>Kontakt</p>", "class": ["footer-heading"] },
            { "id": "ft-addr", "tag": "text", "html": "<p>Musterstraße 12<br>60311 Frankfurt a. M.</p>", "class": ["footer-link"] },
            { "id": "ft-phone", "tag": "text", "html": "<p>+49 69 12345678</p>", "class": ["footer-link"] },
            { "id": "ft-mail", "tag": "link", "text": "info@salon.de", "href": "mailto:info@salon.de", "class": ["footer-link"] }
          ]
        },
        {
          "id": "footer-hours",
          "tag": "container",
          "styles": { "display": "flex", "flexDirection": "column", "gap": [8, "px"] },
          "children": [
            { "id": "ft-h-hours", "tag": "text", "html": "<p>Öffnungszeiten</p>", "class": ["footer-heading"] },
            { "id": "ft-hr1", "tag": "text", "html": "<p>Mo – Fr: 9:00 – 19:00</p>", "class": ["footer-link"] },
            { "id": "ft-hr2", "tag": "text", "html": "<p>Sa: 9:00 – 14:00</p>", "class": ["footer-link"] },
            { "id": "ft-hr3", "tag": "text", "html": "<p>So: geschlossen</p>", "class": ["footer-link"] }
          ]
        }
      ]
    },
    {
      "id": "footer-divider",
      "tag": "divider",
      "lineStyle": "solid",
      "styles": { "borderColor": "rgba(255,255,255,0.15)", "marginTop": [0, "px"], "marginBottom": [24, "px"] }
    },
    {
      "id": "footer-copyright",
      "tag": "container",
      "class": ["container-max", "flex-between"],
      "children": [
        { "id": "ft-copy", "tag": "text", "html": "<p>© 2026 Salon Name. Alle Rechte vorbehalten.</p>", "class": ["footer-link"], "styles": { "fontSize": [13, "px"] } },
        {
          "id": "ft-legal",
          "tag": "container",
          "styles": { "display": "flex", "gap": [16, "px"] },
          "children": [
            { "id": "ft-impr", "tag": "link", "text": "Impressum", "href": "/impressum", "class": ["footer-link"], "styles": { "fontSize": [13, "px"] } },
            { "id": "ft-dsgvo", "tag": "link", "text": "Datenschutz", "href": "/datenschutz", "class": ["footer-link"], "styles": { "fontSize": [13, "px"] } }
          ]
        }
      ]
    }
  ]
}
```

### 7.10 Über-uns — Bild + Text nebeneinander

```jsonc
{
  "id": "about-section",
  "tag": "section",
  "class": ["section-default"],
  "anchorId": "about",
  "children": [
    {
      "id": "about-grid",
      "tag": "container",
      "class": ["container-max", "grid-2"],
      "styles": { "alignItems": "center", "gap": [64, "px"] },
      "children": [
        {
          "id": "about-img",
          "tag": "image",
          "src": "{{STOCK_ABOUT}}",
          "alt": "Unser Salon",
          "class": ["img-cover", "img-rounded"],
          "styles": { "height": [480, "px"] }
        },
        {
          "id": "about-content",
          "tag": "container",
          "styles": { "display": "flex", "flexDirection": "column", "gap": [20, "px"] },
          "children": [
            { "id": "about-label", "tag": "text", "html": "<p>Über uns</p>", "class": ["section-label"], "styles": { "textAlign": "left" } },
            { "id": "about-title", "tag": "text", "html": "<h2>Mit Leidenschaft für Haar seit 2015</h2>", "class": ["heading-xl"], "styles": { "textAlign": "left" } },
            { "id": "about-desc", "tag": "text", "html": "<p>Was als kleiner Traum begann, ist heute ein moderner Salon im Herzen von Frankfurt. Unser Team aus vier erfahrenen Stylisten verbindet handwerkliche Perfektion mit persönlicher Beratung — denn jeder Mensch verdient einen Look, der Selbstvertrauen gibt.</p>", "class": ["text-body-lg"], "styles": { "color": { "ref": "muted" } } },
            { "id": "about-cta", "tag": "button", "text": "Team kennenlernen", "href": "#team", "class": ["btn-secondary"] }
          ]
        }
      ]
    }
  ]
}
```

---

## 8. Theme-Presets (Koala UI inspiriert)

### 8.1 Light Theme (Standard)

```jsonc
{
  "primary": "#2D2926",
  "secondary": "#EFEBE3",
  "accent": "#DED9D0",
  "background": "#F9F7F2",
  "text": "#2D2926",
  "muted": "#8C8279"
}
```

**Charakter:** Warm, elegant, natürlich — perfekt für Beauty-Salons.

### 8.2 Dark Theme

```jsonc
{
  "primary": "#D4A574",
  "secondary": "#1E1E1E",
  "accent": "#333333",
  "background": "#121212",
  "text": "#F5F5F5",
  "muted": "#9E9E9E"
}
```

**Charakter:** Luxuriös, exklusiv — für Premium-Salons.

### 8.3 Cream / Moonlight Theme

```jsonc
{
  "primary": "#6B4E3D",
  "secondary": "#F5F0EB",
  "accent": "#D4C4B0",
  "background": "#FAF7F4",
  "text": "#3D3028",
  "muted": "#9A8B7A"
}
```

**Charakter:** Sanft, einladend — für Spas und Wellness.

### 8.4 Rose / Modern Theme

```jsonc
{
  "primary": "#E11D48",
  "secondary": "#FFF1F2",
  "accent": "#FB7185",
  "background": "#FFFFFF",
  "text": "#1F2937",
  "muted": "#6B7280"
}
```

**Charakter:** Frisch, modern, energetisch — für trendige Salons.

### 8.5 Ocean / Blue Theme

```jsonc
{
  "primary": "#0F766E",
  "secondary": "#F0FDFA",
  "accent": "#2DD4BF",
  "background": "#FFFFFF",
  "text": "#1E293B",
  "muted": "#64748B"
}
```

**Charakter:** Ruhig, professionell — für Wellness und Kosmetik.

---

## 9. Generierungs-Strategie

### 9.1 Schritt-für-Schritt

1. **Business analysieren** → Typ, Stil, Farbe, Zielgruppe
2. **Theme wählen** → Aus Presets (§8) oder Custom
3. **Fonts wählen** → Max. 2 Schriften (1 Display, 1 Body)
4. **Styles kopieren** → Gesamte Klassen-Bibliothek (§6) in `content.styles`
5. **Pages definieren** → Slug, Titel, SEO
6. **Body bauen** → Sektionen zusammensetzen (§7)
7. **Stock Photos zuweisen** → `{{STOCK_*}}` Platzhalter ersetzen
8. **Validieren** → IDs eindeutig, JSON valide, Responsive ok

### 9.2 Seiten-Komposition (Best Practice)

**Startseite (One-Page Salon):**
1. Navbar (sticky)
2. Hero (Vollbild + Overlay)
3. Features / USPs (3er Grid)
4. Services (Cards mit Preis + CTA)
5. Über uns (Bild + Text 2-spaltig)
6. Galerie (4er Grid)
7. Testimonials (3er Grid)
8. CTA-Banner
9. Footer

**Multi-Page Salon:**
- **Home:** Navbar → Hero → USPs → Service-Preview (3 Top-Services) → CTA → Footer
- **Services:** Navbar → Service-Cards (alle, 3er Grid) → CTA → Footer
- **Team:** Navbar → Team-Grid (4er) → Footer
- **Galerie:** Navbar → Gallery-Grid (4er, 8-12 Bilder) → Footer
- **Kontakt:** Navbar → Map/Info + Formular → Öffnungszeiten → Footer

### 9.3 Content-Richtlinien

| Element | Richtlinie |
|---------|------------|
| Hero Headline | ≤ 8 Wörter, klar, einladend |
| Hero Subheadline | 1 Satz, Nutzen kommunizieren |
| CTA Button | Aktionswort: „Termin buchen", „Jetzt anfragen" |
| Service-Titel | Klar, verständlich — kein Fachjargon |
| Service-Beschreibung | 1–2 Sätze, Nutzen betonen |
| Section Label | 1–2 Wörter (Uppercase), z.B. „Services", „Über uns" |
| Section Title | ≤ 10 Wörter, H2-Level |

### 9.4 Design-Regeln

| Regel | Empfehlung |
|-------|------------|
| Border-Radius | Konsistent: `8px` (Buttons), `16px` (Cards), `50%` (Portraits) |
| Shadows | Dezent: `0 2px 16px rgba(0,0,0,0.06)` für Cards |
| Hover-Effects | Subtil: `translateY(-2px)` + Shadow-Verstärkung |
| Spacing zwischen Sektionen | `96px` Desktop, `72px` Tablet, `48px` Mobile |
| Sektionshintergrund | Alternierend: `background` → `secondary` → `background` |
| Max-Width Content | `1200px` Standard, `800px` für reinen Text |
| Fonts | Max 2. Heading = Display/Serif; Body = Sans-Serif |

---

## 10. Validierung-Checklist

- [ ] Alle Element-IDs global eindeutig
- [ ] Hero auf Startseite vorhanden
- [ ] Navbar mit Logo + mindestens 3 Links
- [ ] Footer mit Impressum/Datenschutz Links
- [ ] Alle `{{STOCK_*}}` Platzhalter durch echte URLs ersetzt
- [ ] Theme-Farben definiert (6 Kern-Farben)
- [ ] JSON valide (kein trailing comma, korrekte Verschachtelung)
- [ ] Responsive Breakpoints gesetzt für Headings und Grid
- [ ] Buttons haben `:hover` Pseudo-State + `transition`
- [ ] `visible` für Burger-Icon (mobile-only) gesetzt
- [ ] Sinnvolle `alt`-Texte für alle Bilder
- [ ] SEO-Titel und Description pro Page gesetzt

---

## 11. Beispiel-Prompt für AI-Generierung

```
Erstelle eine vollständige Website im v2 Body-Tree-JSON-Format für:

Business: „Schnitt & Stil" — moderner Friseursalon in Hamburg
Team: 4 Stylisten (2 Damen, 2 Herren)
Services: Damen-Schnitt (48 €), Herren-Schnitt (35 €), Färbung (65 €),
          Strähnchen (80 €), Hochsteckfrisur (55 €), Bartpflege (20 €)
Stil: Modern, warm, einladend
Farben: Rose-Theme (#E11D48 als Primary)
Fonts: Playfair Display (Heading), Inter (Body)

Seiten: One-Page mit Anker-Navigation
Sektionen: Hero → USPs → Services → Über uns → Galerie → Bewertungen → CTA → Footer

Verwende die Koala-UI-Klassen-Bibliothek aus dem v2-json-koala-design-guide.
Verwende Stock Photo Platzhalter {{STOCK_*}}.
Schreibe realistischen, professionellen deutschen Content.
```

---

**Version:** 1.0  
**Datum:** 2026-02-17  
**Basiert auf:** Koala UI v11 Design Patterns, BeautifulCMS v2 Body-Tree Format
