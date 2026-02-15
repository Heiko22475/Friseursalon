# Anleitung: Website-JSON per KI generieren

Dieses Dokument beschreibt, wie ein valides `website_import.json` für BeautifulCMS erstellt wird.  
**Zielformat:** v2 (Elementbaum + Klassen-System)

---

## 1. Dateistruktur

Die JSON-Datei wird unter `.github_generated/website_import.json` abgelegt.

---

## 2. Grundstruktur

```jsonc
{
  "settings": { /* Theme, Kontakt, etc. */ },
  "styles":   { /* Benannte Klassen */ },
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
        "children": [ /* Elementbaum */ ]
      }
    }
  ]
}
```

> 📖 Für die vollständige Spezifikation aller Felder, Tags und Properties siehe: `WEBSITE_FORMAT_SPEC.md`

---

## 3. Erlaubte Element-Tags

Es gibt **nur diese Tags** – KEINE anderen verwenden!

| `tag`       | Zweck                    | Content-Properties                                 |
|-------------|--------------------------|-----------------------------------------------------|
| `body`      | Wurzelelement (1× pro Seite) | –                                                |
| `section`   | Vollbreiter Seitenbereich | `anchorId?`                                         |
| `container` | Flex/Grid-Gruppierung    | –                                                    |
| `text`      | Text mit HTML            | `html` (z.B. `"<h2>Titel</h2>"`)                   |
| `image`     | Bild                     | `src`, `alt`                                         |
| `button`    | CTA / Button             | `text`, `href`, `newTab?`                            |
| `link`      | Textlink (z.B. Nav)      | `text`, `href`, `newTab?`                            |
| `icon`      | Lucide-Icon              | `icon` (PascalCase), `stroke?`                       |
| `nav`       | Navigation/Header        | `sticky?` (`true` / `"sticky"` / `"fixed"`)          |
| `divider`   | Trennlinie               | `lineStyle?` (`"solid"` / `"dashed"` / `"dotted"`)  |
| `spacer`    | Abstand                  | –                                                    |
| `list`      | Liste                    | `ordered?`                                           |

> ⚠️ **NIEMALS** verwenden: `services`, `gallery`, `reviews`, `pricing`, `contact`, `static-content`, `grid`, `hero`, `generic-card`, `navbar`. Diese sind Legacy-Block-Typen!

---

## 4. Style-Werte – Kurzreferenz

### Größen (Tuples!)

```jsonc
[56, "px"]    // 56px
[100, "%"]    // 100%
[80, "vh"]    // 80vh
"auto"        // auto
```

> ⚠️ **NIEMALS** `{ "value": 56, "unit": "px" }` schreiben! Immer `[56, "px"]`.

### Farben

```jsonc
"#2D2926"              // Custom Hex
{ "ref": "primary" }   // Theme-Referenz
{ "ref": "muted" }     // Theme-Referenz
```

### fontWeight

Reine Zahl: `300`, `400`, `500`, `600`, `700`, `800`.

### lineHeight

Reine Zahl (Multiplikator): `1.1`, `1.5`, `1.8`.

---

## 5. Klassen definieren

Klassen werden im Top-Level `styles`-Objekt definiert. Dies ist die **primäre Styling-Methode** – Inline-Styles nur für Einmal-Overrides.

### Typografie-Klassen

```jsonc
"heading-xl": {
  "fontFamily": "Montserrat, sans-serif",
  "fontWeight": 800,
  "fontSize": [56, "px"],
  "lineHeight": 1.1,
  "letterSpacing": [-0.5, "px"],
  "color": { "ref": "text" },
  "@tablet": { "fontSize": [40, "px"] },
  "@mobile": { "fontSize": [28, "px"] }
},
"heading-lg": {
  "fontFamily": "Montserrat, sans-serif",
  "fontWeight": 700,
  "fontSize": [36, "px"],
  "lineHeight": 1.2,
  "color": { "ref": "text" },
  "@tablet": { "fontSize": [30, "px"] },
  "@mobile": { "fontSize": [24, "px"] }
},
"heading-md": {
  "fontFamily": "Montserrat, sans-serif",
  "fontWeight": 700,
  "fontSize": [22, "px"],
  "lineHeight": 1.3,
  "color": { "ref": "text" }
},
"body-text": {
  "fontFamily": "Montserrat, sans-serif",
  "fontWeight": 400,
  "fontSize": [16, "px"],
  "lineHeight": 1.8,
  "color": { "ref": "text" }
},
"body-light": {
  "fontFamily": "Montserrat, sans-serif",
  "fontWeight": 300,
  "fontSize": [15, "px"],
  "lineHeight": 1.7,
  "color": { "ref": "muted" }
},
"text-muted": {
  "fontFamily": "Montserrat, sans-serif",
  "fontWeight": 400,
  "fontSize": [14, "px"],
  "color": { "ref": "muted" }
},
"pretitle": {
  "fontWeight": 500,
  "fontSize": [12, "px"],
  "color": { "ref": "muted" },
  "letterSpacing": [2, "px"],
  "textTransform": "uppercase"
},
"caption": {
  "fontWeight": 400,
  "fontSize": [12, "px"],
  "color": { "ref": "muted" }
}
```

### Button-Klassen

```jsonc
"btn": {
  "display": "inline-flex",
  "alignItems": "center",
  "justifyContent": "center",
  "fontFamily": "Montserrat, sans-serif",
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
  ":hover": { "backgroundColor": "#1a1a1a", "transform": "translateY(-1px)" }
},
"btn-outline": {
  "_extends": "btn",
  "backgroundColor": "transparent",
  "color": { "ref": "primary" },
  "borderWidth": [1, "px"],
  "borderStyle": "solid",
  "borderColor": { "ref": "primary" },
  "paddingTop": [10, "px"],
  "paddingBottom": [10, "px"],
  "paddingLeft": [20, "px"],
  "paddingRight": [20, "px"],
  ":hover": {
    "backgroundColor": { "ref": "primary" },
    "color": { "ref": "background" },
    "transform": "translateY(-1px)"
  }
}
```

### Layout-Klassen

```jsonc
"section-light": {
  "paddingTop": [100, "px"],
  "paddingBottom": [100, "px"],
  "paddingLeft": [64, "px"],
  "paddingRight": [64, "px"],
  "backgroundColor": { "ref": "background" },
  "@tablet": { "paddingLeft": [24, "px"], "paddingRight": [24, "px"] },
  "@mobile": {
    "paddingTop": [60, "px"],
    "paddingBottom": [60, "px"],
    "paddingLeft": [16, "px"],
    "paddingRight": [16, "px"]
  }
},
"section-sand": {
  "paddingTop": [100, "px"],
  "paddingBottom": [100, "px"],
  "paddingLeft": [64, "px"],
  "paddingRight": [64, "px"],
  "backgroundColor": { "ref": "secondary" },
  "@tablet": { "paddingLeft": [24, "px"], "paddingRight": [24, "px"] },
  "@mobile": {
    "paddingTop": [60, "px"],
    "paddingBottom": [60, "px"],
    "paddingLeft": [16, "px"],
    "paddingRight": [16, "px"]
  }
},
"nav-link": {
  "fontWeight": 500,
  "fontSize": [14, "px"],
  "color": { "ref": "text" },
  "cursor": "pointer",
  "transition": "color 0.3s ease",
  ":hover": { "color": { "ref": "muted" } }
},
"max-width-container": {
  "maxWidth": [1440, "px"],
  "width": [100, "%"],
  "marginLeft": "auto",
  "marginRight": "auto"
}
```

---

## 6. Seitenaufbau-Pattern

Eine typische Friseur-Website besteht aus:

### 6.1 Navigation (`nav`)

```jsonc
{
  "id": "navbar",
  "tag": "nav",
  "sticky": "sticky",
  "styles": {
    "display": "flex",
    "justifyContent": "space-between",
    "alignItems": "center",
    "paddingTop": [16, "px"],
    "paddingBottom": [16, "px"],
    "paddingLeft": [64, "px"],
    "paddingRight": [64, "px"],
    "backgroundColor": { "ref": "background" },
    "borderBottomWidth": [1, "px"],
    "borderStyle": "solid",
    "borderColor": { "ref": "accent" },
    "@tablet": { "paddingLeft": [24, "px"], "paddingRight": [24, "px"] },
    "@mobile": { "paddingLeft": [16, "px"], "paddingRight": [16, "px"] }
  },
  "children": [
    {
      "id": "nav-logo",
      "tag": "text",
      "html": "<p><strong>SALONNAME</strong></p>",
      "styles": {
        "fontWeight": 700,
        "fontSize": [20, "px"],
        "letterSpacing": [2, "px"],
        "whiteSpace": "nowrap"
      }
    },
    {
      "id": "nav-links",
      "tag": "container",
      "visible": { "desktop": true, "tablet": true, "mobile": false },
      "styles": { "display": "flex", "alignItems": "center", "gap": [32, "px"] },
      "children": [
        { "id": "nav-l1", "tag": "link", "text": "Über uns", "href": "#ueber-uns", "class": ["nav-link"] },
        { "id": "nav-l2", "tag": "link", "text": "Leistungen", "href": "#leistungen", "class": ["nav-link"] },
        { "id": "nav-cta", "tag": "button", "text": "Termin buchen", "href": "#", "class": ["btn-primary"],
          "styles": { "paddingTop": [10, "px"], "paddingBottom": [10, "px"], "paddingLeft": [24, "px"], "paddingRight": [24, "px"] }
        }
      ]
    },
    {
      "id": "nav-burger",
      "tag": "icon",
      "icon": "Menu",
      "stroke": 2,
      "visible": { "desktop": false, "tablet": false, "mobile": true },
      "styles": { "width": [24, "px"], "height": [24, "px"], "color": { "ref": "text" }, "cursor": "pointer" }
    }
  ]
}
```

### 6.2 Hero-Section (`section`)

```jsonc
{
  "id": "hero",
  "tag": "section",
  "anchorId": "hero",
  "class": ["section-light"],
  "styles": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "textAlign": "center",
    "minHeight": [80, "vh"],
    "@tablet": { "minHeight": [70, "vh"] },
    "@mobile": { "minHeight": [60, "vh"] }
  },
  "children": [
    {
      "id": "hero-headline",
      "tag": "text",
      "html": "<h1>Headline Text</h1>",
      "class": ["heading-xl"],
      "styles": { "maxWidth": [900, "px"], "marginBottom": [32, "px"] }
    },
    {
      "id": "hero-subline",
      "tag": "text",
      "html": "<p>Subline-Text</p>",
      "class": ["body-light"],
      "styles": { "maxWidth": [600, "px"], "marginBottom": [40, "px"] }
    },
    {
      "id": "hero-cta",
      "tag": "button",
      "text": "Jetzt Termin buchen",
      "href": "#",
      "class": ["btn-primary"],
      "styles": { "fontSize": [16, "px"] }
    }
  ]
}
```

### 6.3 Inhaltssektionen

**Über uns** (Bild + Text nebeneinander):
```jsonc
{
  "id": "about",
  "tag": "section",
  "anchorId": "ueber-uns",
  "class": ["section-sand"],
  "styles": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": [80, "px"],
    "@tablet": { "flexDirection": "column", "gap": [40, "px"] }
  },
  "children": [
    { "id": "about-img", "tag": "image", "src": "", "alt": "Salon",
      "styles": { "width": [50, "%"], "objectFit": "cover", "minHeight": [400, "px"],
        "@tablet": { "width": [100, "%"], "minHeight": [300, "px"] }
      }
    },
    { "id": "about-text", "tag": "container",
      "styles": { "display": "flex", "flexDirection": "column", "gap": [16, "px"], "width": [50, "%"],
        "@tablet": { "width": [100, "%"] }
      },
      "children": [
        { "id": "about-pre", "tag": "text", "html": "<p>ÜBER UNS</p>", "class": ["pretitle"] },
        { "id": "about-h", "tag": "text", "html": "<h2>Headline</h2>", "class": ["heading-lg"] },
        { "id": "about-p", "tag": "text", "html": "<p>Beschreibung...</p>", "class": ["body-text"] }
      ]
    }
  ]
}
```

**Leistungen** (Grid mit Icon-Cards):
```jsonc
{
  "id": "services",
  "tag": "section",
  "anchorId": "leistungen",
  "class": ["section-sand"],
  "styles": { "display": "flex", "flexDirection": "column", "alignItems": "center" },
  "children": [
    { "id": "srv-pre", "tag": "text", "html": "<p>UNSERE LEISTUNGEN</p>", "class": ["pretitle"], "styles": { "marginBottom": [8, "px"] } },
    { "id": "srv-h", "tag": "text", "html": "<h2>Leistungen</h2>", "class": ["heading-lg"], "styles": { "marginBottom": [48, "px"] } },
    {
      "id": "srv-grid", "tag": "container",
      "styles": {
        "display": "grid",
        "gridTemplateColumns": "repeat(4, 1fr)",
        "gap": [32, "px"],
        "width": [100, "%"],
        "maxWidth": [1200, "px"],
        "@tablet": { "gridTemplateColumns": "repeat(2, 1fr)" },
        "@mobile": { "gridTemplateColumns": "1fr" }
      },
      "children": [
        /* Service-Card: container > icon + text + text + text */
      ]
    }
  ]
}
```

**Preisliste** (Zeilen mit Name + Preis):
```jsonc
{
  "id": "pricing",
  "tag": "section",
  "class": ["section-light"],
  "styles": { "display": "flex", "flexDirection": "column", "alignItems": "center" },
  "children": [
    { "id": "price-h", "tag": "text", "html": "<h2>Preisliste</h2>", "class": ["heading-lg"] },
    {
      "id": "price-list", "tag": "container",
      "styles": { "display": "flex", "flexDirection": "column", "width": [100, "%"], "maxWidth": [800, "px"] },
      "children": [
        /* Kategorien als text-Elemente, Preis-Zeilen als container > text + text */
      ]
    }
  ]
}
```

### 6.4 Footer

```jsonc
{
  "id": "footer",
  "tag": "section",
  "styles": { "backgroundColor": { "ref": "secondary" } },
  "children": [
    {
      "id": "footer-grid", "tag": "container",
      "styles": {
        "display": "grid",
        "gridTemplateColumns": "repeat(4, 1fr)",
        "gap": [40, "px"],
        "paddingTop": [60, "px"], "paddingBottom": [60, "px"],
        "paddingLeft": [64, "px"], "paddingRight": [64, "px"],
        "@tablet": { "gridTemplateColumns": "repeat(2, 1fr)" },
        "@mobile": { "gridTemplateColumns": "1fr" }
      },
      "children": [
        /* 4 Spalten: Branding, Öffnungszeiten, Kontakt, Standort */
      ]
    },
    {
      "id": "footer-bottom", "tag": "container",
      "styles": {
        "display": "flex", "justifyContent": "space-between", "alignItems": "center",
        "paddingTop": [16, "px"], "paddingBottom": [16, "px"],
        "paddingLeft": [64, "px"], "paddingRight": [64, "px"],
        "borderTopWidth": [1, "px"], "borderStyle": "solid", "borderColor": { "ref": "accent" },
        "@mobile": { "flexDirection": "column", "gap": [8, "px"] }
      },
      "children": [
        { "id": "copy", "tag": "text", "html": "<p>© 2026 Salon. Alle Rechte vorbehalten.</p>", "class": ["caption"] },
        { "id": "legal", "tag": "container", "styles": { "display": "flex", "gap": [24, "px"] },
          "children": [
            { "id": "impressum", "tag": "link", "text": "Impressum", "href": "/impressum", "class": ["caption"] },
            { "id": "datenschutz", "tag": "link", "text": "Datenschutz", "href": "/datenschutz", "class": ["caption"] }
          ]
        }
      ]
    }
  ]
}
```

---

## 7. Sektions-Abwechslung

Für visuelle Abwechslung die Hintergrundfarbe alternieren:

| # | Sektion       | Klasse           |
|---|---------------|------------------|
| 1 | Navbar        | Inline            |
| 2 | Hero          | `section-light`   |
| 3 | Über uns      | `section-sand`    |
| 4 | Leistungen    | `section-light`   |
| 5 | Preise        | `section-sand`    |
| 6 | Pakete        | `section-light`   |
| 7 | Footer        | `section-sand` oder Dark |

---

## 8. Checkliste

- [ ] Nur erlaubte Tags: `body`, `section`, `container`, `text`, `image`, `button`, `link`, `icon`, `nav`, `divider`, `spacer`, `list`
- [ ] Alle Elemente haben einzigartige `id`-Werte
- [ ] Größen als Tuples: `[56, "px"]`, NICHT `{ "value": 56, "unit": "px" }`
- [ ] Farben: `"#2D2926"` (hex) oder `{ "ref": "primary" }` (theme)
- [ ] `fontWeight` = reine Zahl (`700`), nicht String (`"700"`)
- [ ] `lineHeight` = reine Zahl (`1.5`), nicht Tuple
- [ ] Klassen in `styles`-Objekt definiert, per `class: [...]` referenziert
- [ ] Desktop-First: `@tablet` und `@mobile` nur für Overrides
- [ ] Mobile Navigation: `visible`-Objekt für Show/Hide
- [ ] JSON ist syntaktisch valide (keine trailing commas)
- [ ] `body`-Element hat `tag: "body"` und `id: "body"`
- [ ] Keine Legacy-Block-Typen (`hero`, `generic-card`, `navbar`, etc.)

---

## 9. Häufige Fehler

| ❌ Falsch                                       | ✅ Richtig                                |
|-------------------------------------------------|-------------------------------------------|
| `"fontSize": { "value": 56, "unit": "px" }`    | `"fontSize": [56, "px"]`                 |
| `"fontWeight": "700"` (String)                  | `"fontWeight": 700` (Number)              |
| `"color": "#2D2926"` bei `borderColor`          | `"borderColor": "#2D2926"` ✅             |
| `"type": "hero"` (Legacy)                       | `"tag": "section"` mit Styles            |
| `"type": "navbar"` (Legacy)                     | `"tag": "nav"` mit sticky                |
| `"type": "generic-card"` (Legacy)               | `"tag": "container"` mit Grid/Flex       |
| Element ohne `id`                               | Jedes Element braucht `id`               |
| `lineHeight: [1.5, "em"]`                       | `lineHeight: 1.5` (reine Zahl)           |
