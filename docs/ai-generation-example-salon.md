# AI Website Generation - Beispiel: Friseursalon

## Prompt

```
Erstelle eine Website für den Friseursalon "Schnitt & Stil" in Hamburg.

Business-Details:
- Moderner Friseursalon
- 4 Stylisten (2 Damen, 2 Herren)
- Spezialisiert auf Damen- und Herrenfrisuren
- Zusätzlich: Färbungen, Strähnchen, Styling
- Modern, freundlich, professionell

Seiten:
1. Startseite
2. Services (mit Preisen)
3. Team
4. Galerie (Portfolio)
5. Kontakt

Design:
- Farbe: Warm-Rosa/Rosegold (#e11d48)
- Modern und einladend
- Professionell aber zugänglich
```

---

## Generierte Website-Struktur

### 1. Übersicht

**Pages**:
- Home (Hero, Service-Preview, CTA)
- Services (Alle Services mit Preisen)
- Team (4 Team-Member)
- Galerie (12 Portfolio-Bilder)
- Kontakt (Kontaktinfo)

**Theme**:
- Primary: #e11d48 (Rose)
- Secondary: #0ea5e9 (Sky Blue)
- Accent: #f59e0b (Amber)
- Fonts: Playfair Display (Headings), Inter (Body)

---

## 2. Complete JSON

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
            "backgroundImage": "{{STOCK_PHOTO_HERO_SALON_1}}",
            "height": "screen",
            "overlay": {
              "enabled": true,
              "color": "#000000",
              "opacity": 35
            },
            "elements": [
              {
                "id": "logo",
                "type": "logo",
                "position": { "x": 50, "y": 15 },
                "size": { "width": 100, "height": 50 },
                "logoUrl": null
              },
              {
                "id": "heading",
                "type": "text",
                "content": "Schnitt & Stil Hamburg",
                "position": { "x": 50, "y": 45 },
                "fontSize": { "desktop": 64, "tablet": 48, "mobile": 36 },
                "fontWeight": "700",
                "color": "#ffffff",
                "textAlign": "center",
                "fontFamily": "Playfair Display"
              },
              {
                "id": "subheading",
                "type": "text",
                "content": "Ihr Experte für moderne Frisuren und Styling",
                "position": { "x": 50, "y": 55 },
                "fontSize": { "desktop": 22, "tablet": 18, "mobile": 16 },
                "fontWeight": "400",
                "color": "#ffffff",
                "textAlign": "center",
                "fontFamily": "Inter"
              },
              {
                "id": "cta-primary",
                "type": "button",
                "text": "Jetzt Termin buchen",
                "link": "/kontakt",
                "position": { "x": 50, "y": 72 },
                "variant": "primary",
                "size": "large"
              }
            ]
          }
        },
        {
          "id": "intro-text",
          "type": "StaticText",
          "config": {
            "content": "<h2 style='text-align: center; font-size: 36px; margin-bottom: 16px;'>Willkommen bei Schnitt & Stil</h2><p style='text-align: center; font-size: 18px; max-width: 800px; margin: 0 auto;'>Seit 2015 verwöhnen wir unsere Kunden mit professionellen Haarschnitten, kreativen Färbungen und individuellem Styling. Unser erfahrenes Team freut sich auf Ihren Besuch!</p>",
            "padding": {
              "top": "80px",
              "bottom": "40px"
            }
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
              "title": "Unsere Top Services",
              "subtitle": "Was wir für Sie tun können",
              "alignment": "center",
              "backgroundColor": null,
              "paddingY": "large",
              "paddingX": "medium"
            },
            "cardStyle": {
              "shadow": "medium",
              "borderRadius": "large",
              "hoverEffect": "lift",
              "backgroundColor": { "kind": "custom", "hex": "#ffffff" },
              "padding": "large"
            },
            "imageElementStyle": {
              "aspectRatio": "4/3",
              "objectFit": "cover",
              "borderRadius": "medium"
            },
            "typography": {
              "title": {
                "fontSize": { "desktop": 24, "tablet": 22, "mobile": 20 },
                "fontWeight": "700",
                "fontFamily": "Playfair Display"
              },
              "description": {
                "fontSize": { "desktop": 15, "tablet": 14, "mobile": 14 }
              }
            },
            "priceStyle": {
              "fontSize": { "desktop": 28, "tablet": 24, "mobile": 22 },
              "fontWeight": "700",
              "color": { "kind": "tokenRef", "ref": "semantic.body_text" }
            },
            "buttonStyle": {
              "variant": "primary",
              "size": "medium",
              "fullWidth": true
            },
            "items": [
              {
                "id": "service-1",
                "title": "Damen Haarschnitt",
                "description": "Professioneller Haarschnitt mit Waschen, Schneiden und Föhnen. Individuell auf Ihre Wünsche abgestimmt.",
                "image": "{{STOCK_PHOTO_SERVICE_1}}",
                "price": 48,
                "priceUnit": "ab",
                "ctaText": "Jetzt buchen",
                "ctaUrl": "/kontakt",
                "order": 0
              },
              {
                "id": "service-2",
                "title": "Herren Haarschnitt",
                "description": "Moderner Herrenschnitt mit Konturenschnitt und Styling. Klassisch bis trendig.",
                "image": "{{STOCK_PHOTO_SERVICE_2}}",
                "price": 38,
                "priceUnit": "ab",
                "ctaText": "Jetzt buchen",
                "ctaUrl": "/kontakt",
                "order": 1
              },
              {
                "id": "service-3",
                "title": "Färbung & Strähnchen",
                "description": "Vollständige Färbung oder kreative Strähnchen-Techniken. Mit Beratung und Pflege.",
                "image": "{{STOCK_PHOTO_SERVICE_3}}",
                "price": 75,
                "priceUnit": "ab",
                "ctaText": "Jetzt buchen",
                "ctaUrl": "/kontakt",
                "order": 2
              }
            ]
          }
        },
        {
          "id": "cta-section",
          "type": "StaticText",
          "config": {
            "content": "<div style='background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 60px 20px; text-align: center; border-radius: 16px; margin: 80px 0;'><h2 style='color: white; font-size: 32px; margin-bottom: 16px;'>Bereit für eine neue Frisur?</h2><p style='color: white; font-size: 18px; margin-bottom: 32px;'>Vereinbaren Sie jetzt Ihren Wunschtermin</p><a href='/kontakt' style='display: inline-block; background: white; color: #e11d48; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px;'>Termin buchen</a></div>",
            "padding": {
              "top": "40px",
              "bottom": "80px"
            }
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
          "id": "services-hero",
          "type": "StaticText",
          "config": {
            "content": "<h1 style='text-align: center; font-size: 48px; margin-bottom: 16px;'>Unsere Services</h1><p style='text-align: center; font-size: 18px; color: #6b7280;'>Professionelle Dienstleistungen für Damen und Herren</p>",
            "padding": {
              "top": "120px",
              "bottom": "60px"
            }
          }
        },
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
              "showHeader": false,
              "paddingY": "medium"
            },
            "cardStyle": {
              "shadow": "medium",
              "borderRadius": "large",
              "hoverEffect": "lift",
              "backgroundColor": { "kind": "custom", "hex": "#ffffff" },
              "padding": "large"
            },
            "imageElementStyle": {
              "aspectRatio": "4/3",
              "objectFit": "cover",
              "borderRadius": "medium"
            },
            "typography": {
              "title": {
                "fontSize": { "desktop": 22, "tablet": 20, "mobile": 18 },
                "fontWeight": "700"
              },
              "description": {
                "fontSize": { "desktop": 14, "tablet": 14, "mobile": 13 }
              }
            },
            "priceStyle": {
              "fontSize": { "desktop": 24, "tablet": 22, "mobile": 20 },
              "fontWeight": "700"
            },
            "buttonStyle": {
              "variant": "outline",
              "size": "small",
              "fullWidth": false
            },
            "items": [
              {
                "id": "service-full-1",
                "title": "Damen Haarschnitt",
                "description": "Waschen, Schneiden, Föhnen",
                "image": "{{STOCK_PHOTO_SERVICE_1}}",
                "price": 48,
                "priceUnit": "ab",
                "order": 0
              },
              {
                "id": "service-full-2",
                "title": "Herren Haarschnitt",
                "description": "Schneiden, Konturenschnitt, Styling",
                "image": "{{STOCK_PHOTO_SERVICE_2}}",
                "price": 38,
                "priceUnit": "ab",
                "order": 1
              },
              {
                "id": "service-full-3",
                "title": "Färbung komplett",
                "description": "Vollständige Coloration mit Pflege",
                "image": "{{STOCK_PHOTO_SERVICE_3}}",
                "price": 75,
                "priceUnit": "ab",
                "order": 2
              },
              {
                "id": "service-full-4",
                "title": "Strähnchen",
                "description": "Balayage, Highlights oder Lowlights",
                "image": "{{STOCK_PHOTO_SERVICE_4}}",
                "price": 85,
                "priceUnit": "ab",
                "order": 3
              },
              {
                "id": "service-full-5",
                "title": "Styling & Hochsteckfrisur",
                "description": "Für besondere Anlässe",
                "image": "{{STOCK_PHOTO_SERVICE_5}}",
                "price": 55,
                "priceUnit": "ab",
                "order": 4
              },
              {
                "id": "service-full-6",
                "title": "Bartpflege",
                "description": "Trimmen, Rasieren, Konturieren",
                "image": "{{STOCK_PHOTO_SERVICE_6}}",
                "price": 25,
                "priceUnit": "ab",
                "order": 5
              }
            ]
          }
        }
      ]
    },
    {
      "id": "team",
      "name": "Unser Team",
      "route": "/team",
      "blocks": [
        {
          "id": "team-hero",
          "type": "StaticText",
          "config": {
            "content": "<h1 style='text-align: center; font-size: 48px; margin-bottom: 16px;'>Unser Team</h1><p style='text-align: center; font-size: 18px; color: #6b7280;'>Lernen Sie unsere Experten kennen</p>",
            "padding": {
              "top": "120px",
              "bottom": "60px"
            }
          }
        },
        {
          "id": "team-cards",
          "type": "GenericCard",
          "config": {
            "layout": "grid",
            "cardVariant": "vertical",
            "grid": {
              "columns": { "desktop": 4, "tablet": 2, "mobile": 1 },
              "gap": "large"
            },
            "sectionStyle": {
              "showHeader": false,
              "paddingY": "medium"
            },
            "cardStyle": {
              "shadow": "medium",
              "borderRadius": "large",
              "hoverEffect": "lift",
              "backgroundColor": { "kind": "custom", "hex": "#ffffff" },
              "padding": "large"
            },
            "imageElementStyle": {
              "aspectRatio": "1/1",
              "objectFit": "cover",
              "borderRadius": "full"
            },
            "typography": {
              "title": {
                "fontSize": { "desktop": 20, "tablet": 18, "mobile": 18 },
                "fontWeight": "700",
                "textAlign": "center"
              },
              "subtitle": {
                "fontSize": { "desktop": 14, "tablet": 13, "mobile": 13 },
                "textAlign": "center"
              },
              "description": {
                "fontSize": { "desktop": 14, "tablet": 13, "mobile": 13 },
                "textAlign": "center"
              }
            },
            "socialStyle": {
              "position": "bottom",
              "iconSize": "medium",
              "spacing": "medium"
            },
            "items": [
              {
                "id": "team-1",
                "title": "Sarah Müller",
                "subtitle": "Salon-Inhaberin & Master Stylist",
                "description": "15 Jahre Erfahrung, spezialisiert auf Damen-Colorationen",
                "image": "{{STOCK_PHOTO_TEAM_1}}",
                "socialLinks": [
                  { "type": "instagram", "url": "https://instagram.com/schnittundstil" }
                ],
                "order": 0
              },
              {
                "id": "team-2",
                "title": "Michael Schmidt",
                "subtitle": "Senior Stylist",
                "description": "Spezialist für Herrenschnitte und moderne Trends",
                "image": "{{STOCK_PHOTO_TEAM_2}}",
                "socialLinks": [
                  { "type": "instagram", "url": "https://instagram.com/schnittundstil" }
                ],
                "order": 1
              },
              {
                "id": "team-3",
                "title": "Lisa Wagner",
                "subtitle": "Stylist & Color Expert",
                "description": "Kreative Färbetechniken und Balayage-Spezialistin",
                "image": "{{STOCK_PHOTO_TEAM_3}}",
                "socialLinks": [
                  { "type": "instagram", "url": "https://instagram.com/schnittundstil" }
                ],
                "order": 2
              },
              {
                "id": "team-4",
                "title": "Tom Becker",
                "subtitle": "Stylist",
                "description": "Jung, kreativ und immer am Puls der Zeit",
                "image": "{{STOCK_PHOTO_TEAM_4}}",
                "socialLinks": [
                  { "type": "instagram", "url": "https://instagram.com/schnittundstil" }
                ],
                "order": 3
              }
            ]
          }
        }
      ]
    },
    {
      "id": "galerie",
      "name": "Galerie",
      "route": "/galerie",
      "blocks": [
        {
          "id": "gallery-hero",
          "type": "StaticText",
          "config": {
            "content": "<h1 style='text-align: center; font-size: 48px; margin-bottom: 16px;'>Unsere Arbeiten</h1><p style='text-align: center; font-size: 18px; color: #6b7280;'>Lassen Sie sich inspirieren</p>",
            "padding": {
              "top": "120px",
              "bottom": "60px"
            }
          }
        },
        {
          "id": "gallery-main",
          "type": "Gallery",
          "config": {
            "layout": "masonry",
            "columns": {
              "desktop": 4,
              "tablet": 3,
              "mobile": 2
            },
            "gap": "medium",
            "lightbox": true,
            "images": [
              { "url": "{{STOCK_PHOTO_GALLERY_1}}", "alt": "Frisur Portfolio 1" },
              { "url": "{{STOCK_PHOTO_GALLERY_2}}", "alt": "Frisur Portfolio 2" },
              { "url": "{{STOCK_PHOTO_GALLERY_3}}", "alt": "Frisur Portfolio 3" },
              { "url": "{{STOCK_PHOTO_GALLERY_4}}", "alt": "Frisur Portfolio 4" },
              { "url": "{{STOCK_PHOTO_GALLERY_5}}", "alt": "Frisur Portfolio 5" },
              { "url": "{{STOCK_PHOTO_GALLERY_6}}", "alt": "Frisur Portfolio 6" },
              { "url": "{{STOCK_PHOTO_GALLERY_7}}", "alt": "Frisur Portfolio 7" },
              { "url": "{{STOCK_PHOTO_GALLERY_8}}", "alt": "Frisur Portfolio 8" },
              { "url": "{{STOCK_PHOTO_GALLERY_9}}", "alt": "Frisur Portfolio 9" },
              { "url": "{{STOCK_PHOTO_GALLERY_10}}", "alt": "Frisur Portfolio 10" },
              { "url": "{{STOCK_PHOTO_GALLERY_11}}", "alt": "Frisur Portfolio 11" },
              { "url": "{{STOCK_PHOTO_GALLERY_12}}", "alt": "Frisur Portfolio 12" }
            ]
          }
        }
      ]
    },
    {
      "id": "kontakt",
      "name": "Kontakt",
      "route": "/kontakt",
      "blocks": [
        {
          "id": "kontakt-hero",
          "type": "StaticText",
          "config": {
            "content": "<h1 style='text-align: center; font-size: 48px; margin-bottom: 16px;'>Kontakt</h1><p style='text-align: center; font-size: 18px; color: #6b7280;'>Wir freuen uns auf Ihren Besuch</p>",
            "padding": {
              "top": "120px",
              "bottom": "60px"
            }
          }
        },
        {
          "id": "kontakt-info",
          "type": "GridContainer",
          "config": {
            "columns": {
              "desktop": 2,
              "tablet": 1,
              "mobile": 1
            },
            "gap": "large",
            "padding": {
              "top": "medium",
              "bottom": "large"
            },
            "children": [
              {
                "type": "StaticText",
                "config": {
                  "content": "<h2 style='font-size: 28px; margin-bottom: 24px;'>Öffnungszeiten</h2><p style='font-size: 16px; line-height: 1.8;'><strong>Mo-Fr:</strong> 9:00 - 19:00 Uhr<br><strong>Sa:</strong> 9:00 - 16:00 Uhr<br><strong>So:</strong> Geschlossen</p><h2 style='font-size: 28px; margin-top: 32px; margin-bottom: 24px;'>Adresse</h2><p style='font-size: 16px; line-height: 1.8;'>Schnitt & Stil<br>Musterstraße 123<br>20095 Hamburg</p><p style='font-size: 16px; margin-top: 16px;'><strong>Tel:</strong> 040 12345678<br><strong>Email:</strong> info@schnittundstil.de</p>"
                }
              },
              {
                "type": "StaticText",
                "config": {
                  "content": "<h2 style='font-size: 28px; margin-bottom: 24px;'>Termin vereinbaren</h2><p style='font-size: 16px; margin-bottom: 24px;'>Rufen Sie uns an oder schreiben Sie eine E-Mail. Wir melden uns schnellstmöglich bei Ihnen!</p><a href='tel:04012345678' style='display: inline-block; background: #e11d48; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 16px;'>Anrufen</a><a href='mailto:info@schnittundstil.de' style='display: inline-block; border: 2px solid #e11d48; color: #e11d48; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;'>E-Mail senden</a>"
                }
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
    "logo": {
      "type": "text",
      "text": "Schnitt & Stil"
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
        "label": "Team",
        "link": "/team",
        "type": "internal"
      },
      {
        "label": "Galerie",
        "link": "/galerie",
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

## 3. Stock Photo Mapping

**Placeholders im JSON**:
- `{{STOCK_PHOTO_HERO_SALON_1}}` → Hero-Kategorie Foto
- `{{STOCK_PHOTO_SERVICE_1}}` bis `{{STOCK_PHOTO_SERVICE_6}}` → Service-Kategorie Fotos
- `{{STOCK_PHOTO_TEAM_1}}` bis `{{STOCK_PHOTO_TEAM_4}}` → Team-Kategorie Fotos
- `{{STOCK_PHOTO_GALLERY_1}}` bis `{{STOCK_PHOTO_GALLERY_12}}` → Gallery-Kategorie Fotos

**Auswahl-Kriterien**:
- Hero: Helles, einladendes Salon-Interior
- Services: Detailaufnahmen passend zum Service (Schnitt, Färbung, etc.)
- Team: Professionelle Portraits, ähnlicher Stil
- Gallery: Vielfältiges Portfolio verschiedener Frisuren

---

## 4. Testing-Schritte

1. **JSON validieren**: Mit JSON Linter prüfen
2. **Stock Photos ersetzen**: Platzhalter durch echte URLs ersetzen
3. **Import testen**: In Restore-Funktion importieren
4. **Preview checken**: Alle Seiten im Browser durchgehen
5. **Responsive testen**: Desktop, Tablet, Mobile
6. **Links prüfen**: Navigation, CTA-Buttons
7. **Content anpassen**: Texte personalisieren

---

## 5. Nächste Schritte

**Phase 1A - Manual Testing**:
- [ ] Dieses JSON manuell importieren
- [ ] Stock Photos zuordnen
- [ ] Alle Seiten testen
- [ ] Feedback sammeln

**Phase 1B - Copilot Testing**:
- [ ] Copilot mit Guide füttern
- [ ] Verschiedene Prompts testen
- [ ] Qualität evaluieren
- [ ] Guide verbessern

**Phase 2 - Integration**:
- [ ] UI im Admin-Bereich
- [ ] API-Integration (Claude/GPT)
- [ ] Stock Photo Auto-Matching
- [ ] JSON-Validierung

---

**Version**: 1.0  
**Beispiel**: Friseursalon "Schnitt & Stil"  
**Datum**: 2026-02-07
