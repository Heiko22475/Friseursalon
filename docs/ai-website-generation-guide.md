# AI Website Generation Guide für BeautifulCMS

## Übersicht

Dieses Dokument dient als Referenz für die AI-gestützte Generierung kompletter Website-Strukturen im JSON-Format. Es enthält alle notwendigen Informationen über verfügbare Block-Typen, deren Konfiguration, Stock Photos und Best Practices.

---

## 1. Website JSON-Struktur

### 1.1 Root-Struktur

```json
{
  "pages": [
    {
      "id": "home",
      "name": "Startseite",
      "route": "/",
      "blocks": [],
      "header": {
        "variant": "transparent",
        "logoPosition": "left"
      },
      "footer": {
        "variant": "simple"
      }
    }
  ],
  "theme": {
    "colors": {
      "primary": "#e11d48",
      "secondary": "#0ea5e9",
      "accent": "#f59e0b"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  },
  "navigation": {
    "logo": {
      "type": "text",
      "text": "Brand Name"
    },
    "items": [
      {
        "label": "Home",
        "link": "/",
        "type": "internal"
      }
    ]
  }
}
```

---

## 2. Verfügbare Block-Typen

### 2.1 Hero Block (HeroV2)

**Verwendung**: Eindrucksvoller Einstieg mit großem Hintergrundbild, Text und CTA-Buttons.

**Block-Struktur**:
```json
{
  "id": "hero-1",
  "type": "HeroV2",
  "config": {
    "backgroundImage": "URL_TO_STOCK_PHOTO",
    "height": "screen",
    "overlay": {
      "enabled": true,
      "color": "#000000",
      "opacity": 40
    },
    "elements": [
      {
        "id": "logo",
        "type": "logo",
        "position": { "x": 50, "y": 20 },
        "size": { "width": 120, "height": 60 },
        "logoUrl": "URL_TO_LOGO"
      },
      {
        "id": "heading",
        "type": "text",
        "content": "Willkommen bei [Business Name]",
        "position": { "x": 50, "y": 45 },
        "fontSize": { "desktop": 56, "tablet": 40, "mobile": 32 },
        "fontWeight": "700",
        "color": "#ffffff",
        "textAlign": "center"
      },
      {
        "id": "subheading",
        "type": "text",
        "content": "Ihr Experte für...",
        "position": { "x": 50, "y": 55 },
        "fontSize": { "desktop": 20, "tablet": 18, "mobile": 16 },
        "color": "#ffffff",
        "textAlign": "center"
      },
      {
        "id": "cta",
        "type": "button",
        "text": "Jetzt Termin buchen",
        "link": "/kontakt",
        "position": { "x": 50, "y": 70 },
        "variant": "primary"
      }
    ]
  }
}
```

**Best Practices**:
- Verwende hero-category Stock Photos
- Overlay bei dunklen Bildern: 30-40% opacity
- Overlay bei hellen Bildern: 50-60% opacity
- Heading max 6-8 Wörter
- CTA sollte klare Aktion beschreiben

---

### 2.2 Generic Cards Block

**Verwendung**: Flexible Kartendarstellung für Services, Produkte, Team, etc.

**Block-Struktur**:
```json
{
  "id": "services-1",
  "type": "GenericCard",
  "config": {
    "layout": "grid",
    "cardVariant": "vertical",
    "grid": {
      "columns": {
        "desktop": 3,
        "tablet": 2,
        "mobile": 1
      },
      "gap": "large"
    },
    "sectionStyle": {
      "showHeader": true,
      "title": "Unsere Services",
      "subtitle": "Was wir für Sie tun können",
      "alignment": "center",
      "backgroundColor": null,
      "paddingY": "large"
    },
    "cardStyle": {
      "shadow": "medium",
      "borderRadius": "large",
      "hoverEffect": "lift",
      "backgroundColor": { "kind": "custom", "hex": "#ffffff" }
    },
    "imageElementStyle": {
      "aspectRatio": "16/9",
      "objectFit": "cover",
      "position": "top"
    },
    "typography": {
      "overline": {
        "fontSize": { "desktop": 12, "tablet": 11, "mobile": 10 },
        "fontWeight": "600",
        "textTransform": "uppercase",
        "letterSpacing": 1.5
      },
      "title": {
        "fontSize": { "desktop": 24, "tablet": 20, "mobile": 18 },
        "fontWeight": "700"
      },
      "subtitle": {
        "fontSize": { "desktop": 16, "tablet": 15, "mobile": 14 },
        "fontWeight": "500"
      },
      "description": {
        "fontSize": { "desktop": 14, "tablet": 13, "mobile": 12 }
      }
    },
    "buttonStyle": {
      "variant": "primary",
      "size": "medium",
      "fullWidth": false
    },
    "items": [
      {
        "id": "service-1",
        "title": "Haarschnitt",
        "subtitle": "Klassisch bis Modern",
        "description": "Professioneller Haarschnitt nach Ihren Wünschen.",
        "image": "URL_TO_SERVICE_PHOTO",
        "price": 35,
        "priceUnit": "ab",
        "ctaText": "Mehr erfahren",
        "ctaUrl": "/services/haarschnitt",
        "order": 0
      }
    ]
  }
}
```

**Layout-Optionen**:
- `grid`: Raster-Layout (Standard)
- `list`: Untereinander
- `masonry`: Pinterest-Style

**Card-Varianten**:
- `vertical`: Bild oben, Text unten
- `horizontal`: Bild links, Text rechts
- `minimal`: Nur Text mit Icon
- `overlay`: Text über Bild

**Einsatzbereiche**:
- **Services**: 3 Spalten, vertical, mit Preisen
- **Team**: 4 Spalten, vertical, mit Social Links
- **Portfolio**: masonry, overlay mit Titeln
- **Testimonials**: 2 Spalten, minimal, mit Ratings
- **Produkte**: 3-4 Spalten, vertical, mit Preisen

---

### 2.3 Static Text Block

**Verwendung**: Einfache Textabschnitte, Überschriften, Absätze.

```json
{
  "id": "about-1",
  "type": "StaticText",
  "config": {
    "content": "<h2>Über uns</h2><p>Wir sind ein familiengeführter Friseursalon...</p>",
    "textAlign": "left",
    "maxWidth": "800px",
    "padding": {
      "top": "large",
      "bottom": "large"
    }
  }
}
```

---

### 2.4 Gallery Block

**Verwendung**: Bildgalerien für Portfolio, Referenzen, Impressionen.

```json
{
  "id": "gallery-1",
  "type": "Gallery",
  "config": {
    "title": "Unsere Arbeiten",
    "layout": "masonry",
    "columns": {
      "desktop": 4,
      "tablet": 3,
      "mobile": 2
    },
    "images": [
      {
        "url": "URL_TO_GALLERY_PHOTO_1",
        "alt": "Frisur Beispiel 1",
        "caption": "Moderne Bob-Frisur"
      }
    ],
    "lightbox": true
  }
}
```

**Layout-Optionen**:
- `masonry`: Unterschiedliche Höhen
- `grid`: Einheitliche Höhen
- `carousel`: Slider

---

### 2.5 Grid Container Block

**Verwendung**: Mehrspaltige Layouts mit verschachtelten Blöcken.

```json
{
  "id": "grid-1",
  "type": "GridContainer",
  "config": {
    "columns": {
      "desktop": 2,
      "tablet": 1,
      "mobile": 1
    },
    "gap": "large",
    "children": [
      {
        "type": "StaticText",
        "config": { "content": "<h3>Linke Spalte</h3>" }
      },
      {
        "type": "StaticText",
        "config": { "content": "<h3>Rechte Spalte</h3>" }
      }
    ]
  }
}
```

---

## 3. Stock Photo Katalog

### 3.1 Kategorien und Verwendung

Die App verwendet Stock Photos aus der `stock_photos` Tabelle. Jedes Foto hat eine Kategorie:

#### **Hero-Kategorie** (`category: 'hero'`)
Verwendung: Hintergrundbilder für Hero-Blöcke
- Hohe Auflösung
- Querformat
- Emotionale, einladende Motive

**Typische Motive für Beauty/Hair Salons**:
- Salon-Interior mit guter Beleuchtung
- Professionelle Friseur-Arbeitsplätze
- Glückliche Kunden nach der Behandlung
- Elegante Produkt-Arrangements

#### **Service-Kategorie** (`category: 'service'`)
Verwendung: Service/Product Cards
- Quadratisch oder 16:9
- Fokus auf Details
- Professionell und ansprechend

**Typische Motive**:
- Nahaufnahmen von Treatments
- Produktdetails
- Werkzeuge und Equipment
- Before/After-Szenen

#### **Team-Kategorie** (`category: 'team'`)
Verwendung: Team-Member Cards
- Portraits
- Professionell aber freundlich
- Einheitlicher Stil

**Typische Motive**:
- Professionelle Portraits
- Team-Arbeit
- Freundliche Gesichter

#### **Gallery-Kategorie** (`category: 'gallery'`)
Verwendung: Portfolio/Galerie-Blöcke
- Vielfältige Formate
- Zeigt Ergebnisse und Arbeiten

**Typische Motive**:
- Verschiedene Frisuren
- Styling-Ergebnisse
- Detailaufnahmen
- Kreative Arbeiten

---

### 3.2 Stock Photo Auswahl-Strategie

**Bei Hero-Block Generierung**:
```
1. Wähle hero-category Foto passend zum Business-Typ
2. Bevorzuge moderne, helle Bilder
3. Achte auf genug Raum für Text-Overlay
```

**Bei Service Cards**:
```
1. Wähle service-category Fotos
2. Pro Service-Karte ein passendes Foto
3. Vermeide Wiederholungen
4. Achte auf thematische Konsistenz
```

**Bei Team Cards**:
```
1. Wähle team-category Fotos
2. Ähnlicher Stil für alle Team-Member
3. Professionell aber zugänglich
```

**Bei Gallery**:
```
1. Wähle gallery-category Fotos
2. Min. 6-12 Bilder
3. Vielfältige Motive
4. Zeige verschiedene Aspekte
```

---

## 4. Typische Website-Strukturen

### 4.1 Standard Friseursalon

**Pages**: Home, Services, Team, Galerie, Kontakt

**Home**:
1. Hero (salon-hero-image)
2. Intro Text
3. Service Cards (3 Hauptservices)
4. CTA (Termin buchen)

**Services**:
1. Hero (klein)
2. Service Cards (alle Services mit Preisen)
3. CTA

**Team**:
1. Hero oder Header
2. Team Cards (alle Mitarbeiter)
3. Optional: Öffnungszeiten

**Galerie**:
1. Gallery Block (12-20 Bilder)

**Kontakt**:
1. Kontaktformular
2. Adresse/Map
3. Öffnungszeiten

---

### 4.2 Beauty Salon / Spa

**Pages**: Home, Treatments, Preise, Über uns, Kontakt

**Home**:
1. Hero (spa-ambiance)
2. USPs (3 Cards)
3. Featured Treatments (4 Cards)
4. Testimonials (3 Cards)
5. CTA

**Treatments**:
1. Treatment Categories (6-8 Cards mit Preisen)
2. Hinweis zu Beratung

**Preise**:
1. Pricing Tables / Cards
2. Packages

---

### 4.3 Yoga Studio

**Pages**: Home, Klassen, Lehrer, Studio, Kontakt

**Home**:
1. Hero (yoga-practice-image)
2. Studio-Intro
3. Klassen-Übersicht (4 Cards)
4. Lehrer-Preview (2-3 Cards)

**Klassen**:
1. Alle Klassen mit Details (Cards)
2. Stundenplan

**Lehrer**:
1. Team Cards mit Spezialisierungen

---

## 5. Generierungs-Anleitung

### 5.1 Schritt-für-Schritt Prozess

**Input**: Business-Beschreibung (Prompt)

**Beispiel-Prompt**:
```
"Erstelle eine Website für Friseursalon 'Haar & Style' in München. 
Moderner Salon mit 4 Stylisten, spezialisiert auf Damen- und Herrenfrisuren. 
5 Seiten: Home, Services, Team, Galerie, Kontakt."
```

**Schritte**:

1. **Analysiere den Prompt**
   - Business-Typ identifizieren
   - Seiten extrahieren
   - Tonalität bestimmen (modern, elegant, verspielt, etc.)
   - Farbschema ableiten

2. **Erstelle Navigation**
   ```json
   {
     "logo": { "type": "text", "text": "Haar & Style" },
     "items": [
       { "label": "Home", "link": "/", "type": "internal" },
       { "label": "Services", "link": "/services", "type": "internal" },
       { "label": "Team", "link": "/team", "type": "internal" },
       { "label": "Galerie", "link": "/galerie", "type": "internal" },
       { "label": "Kontakt", "link": "/kontakt", "type": "internal" }
     ]
   }
   ```

3. **Generiere Pages**
   - Pro Page: ID, Name, Route, Blocks
   - Passende Block-Typen wählen
   - Stock Photos zuordnen

4. **Erstelle Blocks**
   - Hero für Startseite (immer!)
   - Services als GenericCard
   - Team als GenericCard
   - Gallery für Portfolio
   - StaticText für Zwischentexte

5. **Weise Stock Photos zu**
   - 1 Hero-Image pro Hero-Block
   - 1 Service-Image pro Service-Card
   - 1 Team-Image pro Team-Member
   - 8-12 Gallery-Images für Galerie-Block

6. **Definiere Theme**
   - Primärfarbe: Aus Prompt oder Standard (#e11d48)
   - Sekundärfarbe: Komplementär
   - Fonts: Passend zum Stil

7. **Validiere JSON**
   - Alle IDs einzigartig
   - Alle URLs vorhanden
   - Struktur korrekt

---

### 5.2 JSON-Generierungs-Template

```json
{
  "pages": [
    {
      "id": "home",
      "name": "Startseite",
      "route": "/",
      "blocks": [
        {
          "id": "hero-home",
          "type": "HeroV2",
          "config": {
            "backgroundImage": "STOCK_PHOTO_URL_HERO_1",
            "height": "screen",
            "overlay": { "enabled": true, "color": "#000000", "opacity": 40 },
            "elements": [
              {
                "id": "heading",
                "type": "text",
                "content": "BUSINESS_NAME",
                "position": { "x": 50, "y": 45 },
                "fontSize": { "desktop": 56, "tablet": 40, "mobile": 32 },
                "fontWeight": "700",
                "color": "#ffffff",
                "textAlign": "center"
              },
              {
                "id": "subheading",
                "type": "text",
                "content": "TAGLINE",
                "position": { "x": 50, "y": 55 },
                "fontSize": { "desktop": 20, "tablet": 18, "mobile": 16 },
                "color": "#ffffff",
                "textAlign": "center"
              },
              {
                "id": "cta",
                "type": "button",
                "text": "CTA_TEXT",
                "link": "/kontakt",
                "position": { "x": 50, "y": 70 },
                "variant": "primary"
              }
            ]
          }
        },
        {
          "id": "services-preview",
          "type": "GenericCard",
          "config": {
            "layout": "grid",
            "cardVariant": "vertical",
            "grid": {
              "columns": { "desktop": 3, "tablet": 2, "mobile": 1 },
              "gap": "large"
            },
            "sectionStyle": {
              "showHeader": true,
              "title": "Unsere Services",
              "subtitle": "",
              "alignment": "center",
              "paddingY": "large"
            },
            "items": [
              {
                "id": "service-1",
                "title": "SERVICE_NAME_1",
                "description": "SERVICE_DESCRIPTION_1",
                "image": "STOCK_PHOTO_URL_SERVICE_1",
                "price": 35,
                "priceUnit": "ab",
                "ctaText": "Mehr erfahren",
                "order": 0
              }
            ]
          }
        }
      ]
    }
  ],
  "theme": {
    "colors": {
      "primary": "#e11d48",
      "secondary": "#0ea5e9",
      "accent": "#f59e0b"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  },
  "navigation": {
    "logo": { "type": "text", "text": "BUSINESS_NAME" },
    "items": []
  }
}
```

---

## 6. Best Practices

### 6.1 Content-Regeln

**Headlines**:
- Max. 6-8 Wörter
- Aktiv, einladend
- Keine Phrasen

**Descriptions**:
- 1-2 Sätze
- Nutzen-orientiert
- Klar und prägnant

**CTAs**:
- Aktionswort + Nutzen
- Beispiele: "Termin buchen", "Jetzt anfragen", "Mehr erfahren"

---

### 6.2 Design-Regeln

**Farben**:
- Primär: Hauptfarbe des Brands
- Sekundär: Akzentfarbe
- Neutral: Grau-Töne

**Spacing**:
- Großzügig zwischen Blocks
- Konsistent innerhalb Blocks
- Mobile: Weniger Padding

**Typography**:
- Max. 2 Schriftarten
- Heading: Serif oder Display
- Body: Sans-Serif

---

### 6.3 Block-Reihenfolge

**Startseite (typisch)**:
1. Hero
2. Intro/USPs (Text oder Cards)
3. Main Services (3-6 Cards)
4. Social Proof (Testimonials optional)
5. CTA

**Service-Seite**:
1. Header/Small Hero
2. All Services (Cards mit Preisen)
3. CTA

**Team-Seite**:
1. Header
2. Team Cards
3. Optional: Öffnungszeiten/Kontakt

---

## 7. Validierung

### 7.1 Checklist

- [ ] Alle Block-IDs einzigartig
- [ ] Alle Stock Photo URLs vorhanden
- [ ] Navigation vollständig
- [ ] Alle Pages haben mindestens 1 Block
- [ ] Hero auf Startseite vorhanden
- [ ] Theme definiert
- [ ] JSON ist valide
- [ ] Keine defekten Links
- [ ] Responsive-Werte gesetzt
- [ ] Preise in Services (wenn relevant)

---

## 8. Beispiel: Complete Website JSON

```json
{
  "pages": [
    {
      "id": "home",
      "name": "Startseite",
      "route": "/",
      "blocks": [
        {
          "id": "hero-home",
          "type": "HeroV2",
          "config": {
            "backgroundImage": "https://example.com/stock/hero-salon-1.jpg",
            "height": "screen",
            "overlay": {
              "enabled": true,
              "color": "#000000",
              "opacity": 40
            },
            "elements": [
              {
                "id": "heading",
                "type": "text",
                "content": "Haar & Style München",
                "position": { "x": 50, "y": 45 },
                "fontSize": { "desktop": 56, "tablet": 40, "mobile": 32 },
                "fontWeight": "700",
                "color": "#ffffff",
                "textAlign": "center"
              },
              {
                "id": "subheading",
                "type": "text",
                "content": "Ihr Experte für moderne Frisuren",
                "position": { "x": 50, "y": 55 },
                "fontSize": { "desktop": 20, "tablet": 18, "mobile": 16 },
                "color": "#ffffff",
                "textAlign": "center"
              },
              {
                "id": "cta",
                "type": "button",
                "text": "Termin buchen",
                "link": "/kontakt",
                "position": { "x": 50, "y": 70 },
                "variant": "primary"
              }
            ]
          }
        },
        {
          "id": "services-home",
          "type": "GenericCard",
          "config": {
            "layout": "grid",
            "cardVariant": "vertical",
            "grid": {
              "columns": { "desktop": 3, "tablet": 2, "mobile": 1 },
              "gap": "large"
            },
            "sectionStyle": {
              "showHeader": true,
              "title": "Unsere Services",
              "alignment": "center",
              "paddingY": "large"
            },
            "cardStyle": {
              "shadow": "medium",
              "borderRadius": "large",
              "hoverEffect": "lift"
            },
            "imageElementStyle": {
              "aspectRatio": "4/3",
              "objectFit": "cover"
            },
            "items": [
              {
                "id": "service-1",
                "title": "Damen Haarschnitt",
                "description": "Professioneller Schnitt mit Styling",
                "image": "https://example.com/stock/service-1.jpg",
                "price": 45,
                "priceUnit": "ab",
                "ctaText": "Buchen",
                "ctaUrl": "/kontakt",
                "order": 0
              },
              {
                "id": "service-2",
                "title": "Herren Haarschnitt",
                "description": "Moderner Schnitt nach Ihren Wünschen",
                "image": "https://example.com/stock/service-2.jpg",
                "price": 35,
                "priceUnit": "ab",
                "ctaText": "Buchen",
                "ctaUrl": "/kontakt",
                "order": 1
              },
              {
                "id": "service-3",
                "title": "Färbung & Strähnchen",
                "description": "Natürliche bis kreative Farben",
                "image": "https://example.com/stock/service-3.jpg",
                "price": 65,
                "priceUnit": "ab",
                "ctaText": "Buchen",
                "ctaUrl": "/kontakt",
                "order": 2
              }
            ]
          }
        }
      ]
    },
    {
      "id": "services",
      "name": "Services",
      "route": "/services",
      "blocks": [
        {
          "id": "services-all",
          "type": "GenericCard",
          "config": {
            "layout": "grid",
            "cardVariant": "vertical",
            "grid": {
              "columns": { "desktop": 3, "tablet": 2, "mobile": 1 },
              "gap": "large"
            },
            "sectionStyle": {
              "showHeader": true,
              "title": "Alle Services",
              "alignment": "center",
              "paddingY": "large"
            },
            "items": []
          }
        }
      ]
    }
  ],
  "theme": {
    "colors": {
      "primary": "#e11d48",
      "secondary": "#0ea5e9",
      "accent": "#f59e0b"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  },
  "navigation": {
    "logo": {
      "type": "text",
      "text": "Haar & Style"
    },
    "items": [
      {
        "label": "Home",
        "link": "/",
        "type": "internal"
      },
      {
        "label": "Services",
        "link": "/services",
        "type": "internal"
      },
      {
        "label": "Kontakt",
        "link": "/kontakt",
        "type": "internal"
      }
    ]
  }
}
```

---

## 9. Copilot Prompting

### 9.1 Beispiel-Prompt für Copilot

```
Erstelle eine vollständige Website-JSON-Struktur für:

Business: "Elegance Beauty Spa" in Berlin
Typ: Beauty Salon / Day Spa
Seiten: Home, Treatments, Team, Kontakt
Stil: Luxuriös, elegant, beruhigend
Farben: Rosegold als Primärfarbe

Die Website soll enthalten:
- Hero auf Startseite mit Spa-Ambiente
- 6 Treatment-Cards (Gesichtsbehandlung, Massage, etc.) mit Preisen
- 3 Team-Member-Cards
- Kontaktformular

Verwende Stock Photos aus den verfügbaren Kategorien.
Generiere realistischen, professionellen Content.
```

### 9.2 Erwartete Antwort

Copilot sollte ein vollständiges JSON gemäß der Struktur oben generieren mit:
- 4 Pages (home, treatments, team, kontakt)
- Hero-Block auf Home mit Spa-Bild
- GenericCard-Block mit 6 Treatment-Items
- GenericCard-Block mit 3 Team-Items
- Passende Stock Photo URLs
- Theme mit Rosegold-Farben
- Vollständige Navigation

---

## 10. Troubleshooting

### 10.1 Häufige Fehler

**Problem**: Block-IDs nicht einzigartig
**Lösung**: Jede ID muss unique sein, auch über Pages hinweg

**Problem**: Stock Photo URL fehlt
**Lösung**: Überprüfe Kategorie-Zuordnung

**Problem**: JSON nicht valide
**Lösung**: Validiere mit JSON Linter

**Problem**: Responsive-Werte fehlen
**Lösung**: Alle fontSize/columns brauchen desktop/tablet/mobile

---

## 11. Erweiterungen (Future)

- Template-Varianten für verschiedene Branchen
- AI-Bild-Generierung statt Stock Photos
- Multi-Language Support
- SEO-Optimierung automatisch
- A/B-Test Varianten

---

**Version**: 1.0  
**Datum**: 2026-02-07  
**Status**: Phase 1 - Mock/Testing
