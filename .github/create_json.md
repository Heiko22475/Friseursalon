# Anleitung: Website-JSON per KI generieren

Dieses Dokument beschreibt die Struktur, Regeln und Best Practices, um ein valides `website_import.json` für BeautifulCMS zu erstellen.

---

## 1. Dateistruktur

Die JSON-Datei wird unter `.github_generated/website_import.json` abgelegt.  
Der zugehörige Prompt liegt unter `.github_prompt/prompt_<kundenname>_website.txt`.

---

## 2. Grundstruktur (Root-Objekt)

```jsonc
{
  "site_settings": {
    "theme": {
      "primary_color": "#HEX",     // Hauptfarbe (Buttons, Akzente)
      "font_family": "font-id"     // z.B. "montserrat", "poppins", "inter"
    }
  },
  "general": {
    "name": "Salonname",
    "full_name": "Vollständiger Name mit Tagline",
    "tagline": "Kurzer Slogan",
    "motto": "Motto / Claim",
    "description": "SEO-Beschreibung (1-2 Sätze)"
  },
  "pages": [ /* ... */ ]
}
```

---

## 3. Erlaubte Block-Typen

Es gibt **nur 3 erlaubte Block-Typen** – keine Legacy-Typen verwenden!

| Typ | Zweck | Anwendungsfälle |
|-----|-------|-----------------|
| `navbar` | Navigation/Header | Sticky Header mit Logo, Links, CTA-Button |
| `hero` | Hero-Sektion | Vollbild-Bild mit Headline, Subline, Button |
| `generic-card` | Alles andere | Über-uns, Services, Preise, Portfolio, Footer, Team, FAQ |

> ⚠️ **NIEMALS** verwenden: `services`, `gallery`, `reviews`, `pricing`, `contact`, `static-content`, `grid`. Diese sind Legacy und werden im Visual Editor nicht unterstützt.

---

## 4. Block: `navbar`

Der Navbar-Block ist der Header der Seite. Er ist immer Position `0`.

### Navbar-Config-Struktur

```jsonc
{
  "id": "block-navbar-main",
  "type": "navbar",
  "position": 0,
  "config": {
    "stickyMode": "always",           // "always" | "scroll-up" | "none"
    "mobileBreakpoint": 768,          // px-Wert für Hamburger-Menü
    "borderBottom": {                  // Optionale untere Trennlinie
      "width": 1,
      "style": "solid",
      "color": { "kind": "custom", "hex": "#DED9D0" }
    },
    "children": [ /* Navbar-Kinder */ ]
  },
  "content": {}
}
```

### Navbar-Kinder (children)

Jedes Kind-Element hat eine feste Struktur:

#### Text-Element (Logo, Nav-Link)
```jsonc
{
  "id": "nav-logo",
  "type": "Text",                     // Großbuchstabe!
  "label": "Logo",
  "content": "SALONNAME",
  "textStyle": "h4",                  // "h1"-"h6", "body", "body-sm"
  "style": {
    "desktop": {
      "fontWeight": 700,
      "fontSize": { "value": 20, "unit": "px" },
      "color": { "kind": "custom", "hex": "#2D2926" },
      "letterSpacing": { "value": 2, "unit": "px" },
      "whiteSpace": "nowrap"
    }
  }
}
```

#### Container-Element (Gruppierung)
```jsonc
{
  "id": "nav-links",
  "type": "Container",
  "label": "Navigation Links",
  "style": {
    "desktop": {
      "display": "flex",
      "alignItems": "center",
      "gap": { "value": 32, "unit": "px" }
    }
  },
  "children": [ /* Weitere Text/Button-Elemente */ ]
}
```

#### Button-Element (CTA)
```jsonc
{
  "id": "nav-cta",
  "type": "Button",
  "label": "Termin buchen",
  "content": {
    "text": "Termin buchen",
    "link": "#termin"
  },
  "style": {
    "desktop": {
      "backgroundColor": { "kind": "custom", "hex": "transparent" },
      "color": { "kind": "custom", "hex": "#2D2926" },
      "borderWidth": { "value": 1, "unit": "px" },
      "borderStyle": "solid",
      "borderColor": { "kind": "custom", "hex": "#2D2926" },
      "borderRadius": { "value": 4, "unit": "px" },
      "paddingTop": { "value": 8, "unit": "px" },
      "paddingBottom": { "value": 8, "unit": "px" },
      "paddingLeft": { "value": 20, "unit": "px" },
      "paddingRight": { "value": 20, "unit": "px" },
      "fontSize": { "value": 13, "unit": "px" },
      "fontWeight": 500,
      "cursor": "pointer",
      "whiteSpace": "nowrap"
    }
  }
}
```

### Style-Werte (SizeValue)

Alle dimensionalen Werte (fontSize, padding, gap, borderWidth, etc.) werden als Objekt geschrieben:

```jsonc
{ "value": 16, "unit": "px" }    // 16px
{ "value": 2, "unit": "rem" }    // 2rem
{ "value": 50, "unit": "%" }     // 50%
```

Ausnahme: `fontWeight` ist immer eine reine Zahl (300, 400, 500, 600, 700, 800).

### Farb-Werte (ColorValue)

```jsonc
{ "kind": "custom", "hex": "#2D2926" }           // Benutzerdefinierte Farbe
{ "kind": "tokenRef", "ref": "semantic.primary" } // Theme-Token (selten in JSON)
```

---

## 5. Block: `hero`

Der Hero-Block zeigt ein großes Bild mit überlagerten Texten und Buttons.

### Hero-Config-Struktur

```jsonc
{
  "id": "block-hero",
  "type": "hero",
  "position": 1,
  "config": {
    "backgroundImage": "https://...",     // URL zum Hintergrundbild
    "backgroundPosition": { "x": 50, "y": 40 },  // 0-100 Prozent
    "overlay": {
      "enabled": true,
      "color": "#2D2926",                 // HEX-String (kein ColorValue!)
      "opacity": 35                       // 0-100
    },
    "height": {
      "desktop": "90vh",                  // CSS-Höhenwert
      "tablet": "70vh",
      "mobile": "60vh"
    },
    "logos": [],
    "texts": [ /* HeroText-Elemente */ ],
    "buttons": [ /* HeroButton-Elemente */ ]
  },
  "content": {}
}
```

### Hero-Text

```jsonc
{
  "id": "hero-headline",
  "content": "Headline-Text mit<br/>Zeilenumbrüchen",
  "fontFamily": "montserrat",            // Font-ID (lowercase, mit Bindestrich)
  "fontSize": { "desktop": 52, "tablet": 38, "mobile": 28 },  // nur Zahlen, kein unit!
  "fontWeight": "700",                   // String!
  "color": "#F9F7F2",                    // HEX-String (kein ColorValue!)
  "position": {
    "desktop": {
      "horizontal": "center",            // left | left-center | center | right-center | right
      "vertical": "middle",              // top | top-center | middle | bottom-center | bottom
      "offsetX": 0,                      // -20 bis +20 (Prozent)
      "offsetY": -8                      // -20 bis +20 (Prozent)
    }
  },
  "visible": { "desktop": true, "tablet": true, "mobile": true }
}
```

### Hero-Button

```jsonc
{
  "id": "hero-cta",
  "text": "Termin buchen",
  "action": { "type": "link", "value": "#termin" },  // link | scroll | phone | email
  "style": {
    "variant": "custom",                 // primary | secondary | outline | custom
    "size": "large",                     // small | medium | large
    "borderRadius": "small",             // none | small | medium | large | pill
    "backgroundColor": "#F9F7F2",        // HEX-Strings!
    "textColor": "#2D2926",
    "borderColor": "#F9F7F2"
  },
  "position": {
    "desktop": {
      "horizontal": "center",
      "vertical": "bottom",
      "offsetX": 0,
      "offsetY": -5
    }
  },
  "visible": { "desktop": true, "tablet": true, "mobile": true }
}
```

> ⚠️ **Achtung**: Im Hero-Block werden Farben als reine HEX-Strings geschrieben, NICHT als ColorValue-Objekte! Das ist ein Unterschied zu allen anderen Blöcken.

---

## 6. Block: `generic-card`

Der Generic-Card-Block ist das universelle Layout-Element. Er wird für ALLES außer Navigation und Hero verwendet.

### Grundstruktur

```jsonc
{
  "id": "block-<sektions-name>",
  "type": "generic-card",
  "position": 2,                         // Aufsteigend ab 2
  "config": {
    "items": [ /* Card-Items */ ],
    "layout": "grid",                    // grid | carousel | list | masonry
    "cardLayoutVariant": "vertical",     // vertical | horizontal | overlay | minimal
    "grid": { /* Grid-Config */ },
    "typography": { /* Typo-Config */ },
    "cardStyle": { /* Base-Style */ },
    "imageStyle": { /* Bild-Style */ },
    "showImage": true,
    "imageElementStyle": { /* ... */ },
    "iconStyle": { /* Icon-Config */ },
    "overlineStyle": { /* ... */ },
    "titleStyle": { /* ... */ },
    "subtitleStyle": { /* ... */ },
    "descriptionStyle": { /* ... */ },
    "textStyle": { /* Legacy-Text */ },
    "showSubtitle": true,
    "showDescription": true,
    "priceStyle": { /* Preis-Config */ },
    "ratingStyle": { /* Bewertungs-Config */ },
    "featuresStyle": { /* Feature-Liste */ },
    "socialStyle": { /* Social-Links */ },
    "buttonStyle": { /* Button-Style */ },
    "showButton": false,
    "sectionStyle": { /* Sektions-Rahmen */ }
  },
  "content": {}
}
```

### Card-Item

```jsonc
{
  "id": "unique-item-id",
  "overline": "Kategorie",              // Klein, über dem Titel
  "title": "Titel",                      // Pflichtfeld!
  "subtitle": "Untertitel",
  "description": "Beschreibungstext (HTML erlaubt: <br/>, <a>, <strong>)",
  "image": "https://...",                // Bild-URL
  "icon": "Scissors",                    // Lucide-Icon-Name (PascalCase)
  "price": 45,                           // Zahl
  "priceUnit": "ab €",                   // Darstellungsformat
  "originalPrice": 60,                   // Für Streichpreise
  "features": ["Feature 1", "Feature 2"],
  "ctaText": "Mehr erfahren",
  "ctaUrl": "#link",
  "socialLinks": [
    { "type": "instagram", "url": "https://..." },
    { "type": "facebook", "url": "https://..." }
  ],
  "order": 0                             // Reihenfolge (0-basiert)
}
```

### Grid-Config

```jsonc
{
  "columns": { "desktop": 3, "tablet": 2, "mobile": 1 },
  "gap": "lg"                            // none | xs | sm | md | lg | xl | 2xl
}
```

### Section-Style (Sektions-Wrapper)

```jsonc
{
  "showHeader": true,                    // Zeige Sektions-Titel?
  "title": "Sektions-Titel",
  "subtitle": "Untertitel",
  "headerAlign": "center",              // left | center | right
  "titleColor": { "kind": "custom", "hex": "#2D2926" },
  "subtitleColor": { "kind": "custom", "hex": "#8C8279" },
  "backgroundColor": { "kind": "custom", "hex": "#F9F7F2" },
  "paddingY": "2xl",                    // Vertikales Padding
  "paddingX": "xl"                      // Horizontales Padding
}
```

### Alle `enabled`-Felder setzen!

Jeder Style-Block hat ein `enabled`-Feld. Nicht benötigte Features MÜSSEN explizit `"enabled": false` gesetzt werden:

```jsonc
"priceStyle": { "enabled": false, ... },
"ratingStyle": { "enabled": false, ... },
"featuresStyle": { "enabled": false, ... },
"socialStyle": { "enabled": false, ... }
```

---

## 7. Sektions-Rezepte

### Über-uns-Sektion
- `cardLayoutVariant`: `"horizontal"` (Bild links, Text rechts)
- `grid.columns.desktop`: `1` (volle Breite)
- `showImage`: `true`, `showSubtitle`: `true`, `showDescription`: `true`
- Hintergrund: Primary Background
- 2 Items mit alternierenden Bildern

### Service-/Leistungs-Sektion
- `cardLayoutVariant`: `"vertical"` (Bild/Icon oben, Text unten)
- `grid.columns.desktop`: `3` oder `4`
- `iconStyle.enabled`: `true` mit Lucide-Icons
- `overlineStyle.enabled`: `true` für Kategorie-Labels
- Hintergrund: Secondary Background
- `cardStyle.hoverEffect`: `"lift"`

### Preisliste
- `cardLayoutVariant`: `"vertical"`
- `grid.columns.desktop`: `3`
- `showImage`: `false`
- `priceStyle.enabled`: `true`, `priceStyle.position`: `"below-title"`
- `featuresStyle.enabled`: `true`, `featuresStyle.icon`: `"Check"`
- `cardStyle.hoverEffect`: `"lift"`

### Portfolio
- `cardLayoutVariant`: `"overlay"` (Text über Bild)
- `showImage`: `true`
- `imageStyle.overlay.enabled`: `true`
- `showButton`: `true`
- `cardStyle.hoverEffect`: `"scale"`

### Footer
- `cardLayoutVariant`: `"minimal"` (nur Text, kein Bild)
- `grid.columns.desktop`: `4`
- `showImage`: `false`
- `sectionStyle.showHeader`: `false`
- Block-ID MUSS "footer" enthalten (z.B. `"block-footer"`)
- `socialStyle.enabled`: `true` bei der Branding-Spalte

---

## 8. Checkliste vor dem Speichern

- [ ] Nur erlaubte Block-Typen: `navbar`, `hero`, `generic-card`
- [ ] Alle Blocks haben unique `id`-Werte
- [ ] Alle Items haben unique `id`-Werte und korrekte `order`-Werte (0-basiert)
- [ ] `position`-Werte sind lückenlos aufsteigend (0, 1, 2, 3, ...)
- [ ] Navbar ist immer Position 0, Hero Position 1
- [ ] Footer-Block-ID enthält "footer" (damit DynamicPage den Legacy-Footer nicht rendert)
- [ ] Alle ColorValue-Objekte haben `{ "kind": "custom", "hex": "#..." }`
- [ ] Im Hero-Block: Farben sind HEX-Strings, KEINE ColorValue-Objekte
- [ ] Im Navbar-Block: Größen sind SizeValue-Objekte `{ "value": N, "unit": "px" }`
- [ ] Alle `enabled`-Felder explizit gesetzt (true/false)
- [ ] Sinnvolle `sectionStyle.backgroundColor`-Abwechslung (z.B. #F9F7F2 ↔ #EFEBE3)
- [ ] `content: {}` bei jedem Block vorhanden
- [ ] JSON ist syntaktisch valide (keine trailing commas, korrekte Verschachtelung)

---

## 9. Farbpalette-Pattern

Für eine konsistente Optik sollten Sektionen abwechselnd den Primary und Secondary Background verwenden:

| Position | Block | Background |
|----------|-------|-----------|
| 0 | Navbar | Transparent / #F9F7F2 (90% Opazität) |
| 1 | Hero | Bild mit Overlay |
| 2 | Über uns | `#F9F7F2` (Primary) |
| 3 | Services | `#EFEBE3` (Secondary) |
| 4 | Preise | `#F9F7F2` (Primary) |
| 5 | Portfolio | `#EFEBE3` (Secondary) |
| 6 | Footer | `#EFEBE3` (Secondary) oder `#2D2926` (Dark) |

---

## 10. Font-IDs

| Font-ID | Anzeigename | Empfohlen für |
|---------|-------------|---------------|
| `montserrat` | Montserrat | Überschriften + Body |
| `poppins` | Poppins | Modern, freundlich |
| `inter` | Inter | Sauber, technisch |
| `open-sans` | Open Sans | Lesbar, neutral |
| `playfair-display` | Playfair Display | Elegant, serif |
| `lora` | Lora | Magazin-Charakter |

---

## 11. Lucide-Icon-Namen (häufig verwendet)

| Icon | Name |
|------|------|
| ✂️ | `Scissors` |
| 🎨 | `Palette` |
| 🖌️ | `Paintbrush` |
| ✨ | `Sparkles` |
| 👤 | `User` |
| 📞 | `Phone` |
| 📧 | `Mail` |
| 📍 | `MapPin` |
| ⭐ | `Star` |
| ✅ | `Check` |
| ❤️ | `Heart` |
| 🕐 | `Clock` |
| 📸 | `Camera` |

---

## 12. Häufige Fehler

| Fehler | Korrekt |
|--------|---------|
| `"color": "#2D2926"` in generic-card | `"color": { "kind": "custom", "hex": "#2D2926" }` |
| `"fontSize": 14` in Navbar | `"fontSize": { "value": 14, "unit": "px" }` |
| `"fontSize": { "value": 52, "unit": "px" }` in Hero-Text | `"fontSize": { "desktop": 52, "tablet": 38, "mobile": 28 }` |
| `"fontWeight": 700` in Hero-Text | `"fontWeight": "700"` (String!) |
| `"type": "text"` in Navbar | `"type": "Text"` (Großbuchstabe!) |
| Block ohne `"content": {}` | Immer `"content": {}` anhängen |
| Footer-ID ohne "footer" | `"id": "block-footer"` (damit Legacy-Footer unterdrückt wird) |
| Legacy Block-Typ `"type": "services"` | `"type": "generic-card"` verwenden |

---

## 13. Navbar: Vollständige Style-Properties-Referenz

Navbar-, Container-, Text-, Button- und Image-Elemente nutzen das gleiche Style-System des Visual Editors.
Hier alle unterstützten Felder in `style.desktop` (sowie `style.tablet` / `style.mobile` für Overrides):

### Layout

| Property | Typ | Beispiel |
|----------|-----|---------|
| `display` | `"block"` \| `"flex"` \| `"grid"` \| `"inline"` \| `"inline-block"` \| `"inline-flex"` \| `"none"` | `"flex"` |
| `flexDirection` | `"row"` \| `"column"` \| `"row-reverse"` \| `"column-reverse"` | `"row"` |
| `justifyContent` | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"space-between"` \| `"space-around"` \| `"space-evenly"` | `"space-between"` |
| `alignItems` | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"stretch"` \| `"baseline"` | `"center"` |
| `flexWrap` | `"nowrap"` \| `"wrap"` \| `"wrap-reverse"` | `"nowrap"` |
| `gap` | SizeValue | `{ "value": 16, "unit": "px" }` |
| `rowGap` | SizeValue | `{ "value": 8, "unit": "px" }` |
| `columnGap` | SizeValue | `{ "value": 24, "unit": "px" }` |
| `alignSelf` | `"auto"` \| `"flex-start"` \| `"center"` \| `"flex-end"` \| `"stretch"` \| `"baseline"` | `"center"` |
| `flexGrow` | number | `1` |
| `flexShrink` | number | `0` |

### Grid (Parent)

| Property | Typ | Beispiel |
|----------|-----|---------|
| `gridTemplateColumns` | string | `"1fr 1fr 1fr"` |
| `gridTemplateRows` | string | `"auto 1fr"` |
| `gridColumn` | string (Child) | `"1 / 3"` |
| `gridRow` | string (Child) | `"1 / 2"` |

### Größe

| Property | Typ | Beispiel |
|----------|-----|---------|
| `width` | SizeValueOrAuto | `{ "value": 100, "unit": "%" }` oder `"auto"` |
| `height` | SizeValueOrAuto | `{ "value": 400, "unit": "px" }` |
| `minWidth` | SizeValue | `{ "value": 200, "unit": "px" }` |
| `maxWidth` | SizeValue | `{ "value": 1200, "unit": "px" }` |
| `minHeight` | SizeValue | `{ "value": 40, "unit": "px" }` |
| `maxHeight` | SizeValue | `{ "value": 800, "unit": "px" }` |

### Spacing

| Property | Typ | Beispiel |
|----------|-----|---------|
| `paddingTop` | SizeValue | `{ "value": 16, "unit": "px" }` |
| `paddingRight` | SizeValue | `{ "value": 24, "unit": "px" }` |
| `paddingBottom` | SizeValue | `{ "value": 16, "unit": "px" }` |
| `paddingLeft` | SizeValue | `{ "value": 24, "unit": "px" }` |
| `marginTop` | SizeValueOrAuto | `{ "value": 0, "unit": "px" }` oder `"auto"` |
| `marginRight` | SizeValueOrAuto | `"auto"` |
| `marginBottom` | SizeValueOrAuto | `{ "value": 32, "unit": "px" }` |
| `marginLeft` | SizeValueOrAuto | `"auto"` |

### Typografie

| Property | Typ | Beispiel |
|----------|-----|---------|
| `fontFamily` | string (Font-ID) | `"montserrat"` |
| `fontSize` | SizeValue | `{ "value": 16, "unit": "px" }` |
| `fontWeight` | number | `700` |
| `lineHeight` | SizeValue | `{ "value": 1.5, "unit": "em" }` |
| `letterSpacing` | SizeValue | `{ "value": 2, "unit": "px" }` |
| `textAlign` | `"left"` \| `"center"` \| `"right"` \| `"justify"` | `"center"` |
| `textTransform` | `"none"` \| `"uppercase"` \| `"lowercase"` \| `"capitalize"` | `"uppercase"` |
| `textDecoration` | `"none"` \| `"underline"` \| `"line-through"` | `"none"` |
| `whiteSpace` | `"normal"` \| `"nowrap"` \| `"pre"` \| `"pre-wrap"` | `"nowrap"` |
| `color` | ColorValue | `{ "kind": "custom", "hex": "#2D2926" }` |

### Hintergrund

| Property | Typ | Beispiel |
|----------|-----|---------|
| `backgroundColor` | ColorValue | `{ "kind": "custom", "hex": "#F9F7F2" }` |
| `backgroundImage` | string (URL) | `"url(https://...)"` |
| `backgroundSize` | `"cover"` \| `"contain"` \| `"auto"` | `"cover"` |
| `backgroundPosition` | string | `"center center"` |
| `backgroundRepeat` | `"no-repeat"` \| `"repeat"` \| `"repeat-x"` \| `"repeat-y"` | `"no-repeat"` |

### Border

| Property | Typ | Beispiel |
|----------|-----|---------|
| `borderWidth` | SizeValue | `{ "value": 1, "unit": "px" }` |
| `borderStyle` | `"none"` \| `"solid"` \| `"dashed"` \| `"dotted"` | `"solid"` |
| `borderColor` | ColorValue | `{ "kind": "custom", "hex": "#DED9D0" }` |
| `borderRadius` | SizeValue | `{ "value": 8, "unit": "px" }` |
| `borderTopWidth` | SizeValue | `{ "value": 1, "unit": "px" }` |
| `borderRightWidth` | SizeValue | `{ "value": 0, "unit": "px" }` |
| `borderBottomWidth` | SizeValue | `{ "value": 1, "unit": "px" }` |
| `borderLeftWidth` | SizeValue | `{ "value": 0, "unit": "px" }` |
| `borderTopLeftRadius` | SizeValue | `{ "value": 8, "unit": "px" }` |
| `borderTopRightRadius` | SizeValue | `{ "value": 0, "unit": "px" }` |
| `borderBottomRightRadius` | SizeValue | `{ "value": 8, "unit": "px" }` |
| `borderBottomLeftRadius` | SizeValue | `{ "value": 0, "unit": "px" }` |

### Effekte & Position

| Property | Typ | Beispiel |
|----------|-----|---------|
| `opacity` | number (0-1) | `0.9` |
| `boxShadow` | string | `"0 4px 12px rgba(0,0,0,0.08)"` |
| `overflow` | `"visible"` \| `"hidden"` \| `"scroll"` \| `"auto"` | `"hidden"` |
| `overflowX` | same as overflow | `"hidden"` |
| `overflowY` | same as overflow | `"auto"` |
| `position` | `"static"` \| `"relative"` \| `"absolute"` \| `"fixed"` \| `"sticky"` | `"relative"` |
| `top` | SizeValueOrAuto | `{ "value": 0, "unit": "px" }` |
| `right` | SizeValueOrAuto | `"auto"` |
| `bottom` | SizeValueOrAuto | `"auto"` |
| `left` | SizeValueOrAuto | `{ "value": 0, "unit": "px" }` |
| `zIndex` | number | `100` |
| `cursor` | string | `"pointer"` |
| `transform` | string | `"translateY(-50%)"` |
| `objectFit` | `"contain"` \| `"cover"` \| `"fill"` \| `"none"` \| `"scale-down"` | `"cover"` |
| `objectPosition` | string | `"center center"` |

---

## 14. Weiterführende Dokumente

| Dokument | Pfad | Inhalt |
|----------|------|--------|
| Webflow-Migrations-Plan | `.github_prompt/webflow_migration_plan.md` | Geplante Features, fehlende Elemente & Style-Properties vs. Webflow |
| Copilot Instructions | `.github/copilot-instructions.md` | Projekt-Überblick, Architektur, Coding-Guidelines |
| VE Style-Types | `src/visual-editor/types/styles.ts` | TypeScript-Definitionen aller Style-Properties |
| VE Element-Types | `src/visual-editor/types/elements.ts` | TypeScript-Definitionen aller VE-Elemente |
