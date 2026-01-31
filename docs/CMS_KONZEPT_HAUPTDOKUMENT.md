# BeautifulCMS - Vollständiges Konzeptdokument

## Dokumentenübersicht

Dieses Dokument ist das Hauptdokument für die Entwicklung des BeautifulCMS. Es enthält alle Anforderungen, Spezifikationen und Implementierungsanleitungen für das Content Management System.

**Version:** 1.0  
**Erstellt:** Januar 2026  
**Status:** In Entwicklung

---

## Inhaltsverzeichnis der Konzeptdokumente

| Nr. | Dokument | Beschreibung | Priorität |
|-----|----------|--------------|-----------|
| 1 | [CMS_KONZEPT_BAUSTEINE.md](./CMS_KONZEPT_BAUSTEINE.md) | Alle Building Blocks mit Varianten | HOCH |
| 2 | [CMS_KONZEPT_HEADER_FOOTER.md](./CMS_KONZEPT_HEADER_FOOTER.md) | Header und Footer Varianten | HOCH |
| 3 | [CMS_KONZEPT_SEO_ANALYTICS.md](./CMS_KONZEPT_SEO_ANALYTICS.md) | SEO-Tools, Analytics, Consent | HOCH |
| 4 | [CMS_KONZEPT_HILFE_FAQ.md](./CMS_KONZEPT_HILFE_FAQ.md) | Hilfe-System und FAQ-Bereich | MITTEL |
| 5 | [CMS_KONZEPT_ONBOARDING.md](./CMS_KONZEPT_ONBOARDING.md) | Kunden-Onboarding-Bereich | MITTEL |
| 6 | [CMS_KONZEPT_BARRIEREFREIHEIT.md](./CMS_KONZEPT_BARRIEREFREIHEIT.md) | WCAG 2.1 AA Anforderungen | HOCH |
| 7 | [CMS_KONZEPT_BACKUP_CLOUD.md](./CMS_KONZEPT_BACKUP_CLOUD.md) | Google Cloud Backup | NIEDRIG |
| 8 | [CMS_KONZEPT_KONTAKTFORMULAR.md](./CMS_KONZEPT_KONTAKTFORMULAR.md) | Kontaktformular und E-Mail | MITTEL |
| 9 | [CMS_KONZEPT_SOCIAL_MEDIA.md](./CMS_KONZEPT_SOCIAL_MEDIA.md) | Social Media Integration | NIEDRIG |
| 10 | [CMS_KONZEPT_POPUP_ANKUENDIGUNG.md](./CMS_KONZEPT_POPUP_ANKUENDIGUNG.md) | Popup-Ankündigungen | NIEDRIG |

---

## 1. Projektübersicht

### 1.1 Was ist BeautifulCMS?

BeautifulCMS ist ein **Software-as-a-Service (SaaS) Content Management System**, das es Kleinunternehmern ermöglicht, professionelle Websites ohne technische Kenntnisse zu erstellen und zu pflegen.

### 1.2 Zielgruppe

| Zielgruppe | Beschreibung | Technikkenntnisse |
|------------|--------------|-------------------|
| Primär | Friseursalons, Kosmetikstudios | Keine bis gering |
| Sekundär | Restaurants, Cafés | Keine bis gering |
| Tertiär | Handwerker, Dienstleister | Keine bis gering |
| Erweiterung | Alle Kleinunternehmer | Keine bis gering |

### 1.3 Kernprinzipien

```
EINFACHHEIT > FUNKTIONSUMFANG
- Jede Funktion muss von einem Laien bedienbar sein
- Hilfe-Texte für JEDE Funktion
- Visuelle Auswahl statt Texteingabe wo möglich
- Vorschau vor dem Speichern
```

### 1.4 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL HOSTING                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Domain A   │  │   Domain B   │  │   Domain C          │  │
│  │ haarfein.de │  │ salon-x.de  │  │ friseur-mueller.de │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              REACT FRONTEND (Vite)                     │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Public Site │  │ Admin Panel  │  │ SuperAdmin   │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    SUPABASE                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │  │
│  │  │ Auth     │  │ Database │  │ Storage (Images)   │   │  │
│  │  └──────────┘  └──────────┘  └────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Datenmodell-Übersicht

### 2.1 Haupttabelle: websites

```sql
CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(6) UNIQUE NOT NULL,  -- z.B. "ABC123"
    domain_name VARCHAR(255),                 -- z.B. "haarfein.de"
    
    -- Hauptdaten als JSON
    data JSONB NOT NULL DEFAULT '{}',
    
    -- SMTP-Konfiguration
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_password VARCHAR(255),  -- verschlüsselt
    smtp_from_email VARCHAR(255),
    smtp_from_name VARCHAR(255),
    contact_email VARCHAR(255),  -- Empfänger für Kontaktformular
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 JSON-Struktur (data-Feld)

```json
{
  "settings": {
    "businessName": "Friseursalon Beispiel",
    "tagline": "Ihr Friseur in der Stadt",
    "logo": "/images/logo.png",
    "favicon": "/images/favicon.ico"
  },
  "theme": {
    "primaryColor": "#E11D48",
    "secondaryColor": "#1F2937",
    "accentColor": "#F59E0B",
    "customPresets": []
  },
  "seo": {
    "defaultTitle": "Friseursalon Beispiel",
    "defaultDescription": "Ihr Friseur...",
    "ogImage": "/images/og-image.jpg",
    "googleAnalyticsCode": "<script>...</script>",
    "googleTagManagerCode": "<script>...</script>"
  },
  "consent": {
    "enabled": true,
    "texts": {
      "title": "Cookie-Einstellungen",
      "description": "Wir verwenden Cookies...",
      "acceptAll": "Alle akzeptieren",
      "acceptSelected": "Auswahl speichern",
      "reject": "Ablehnen"
    },
    "categories": {
      "necessary": { "enabled": true, "locked": true },
      "statistics": { "enabled": false },
      "marketing": { "enabled": false },
      "externalMedia": { "enabled": false }
    }
  },
  "socialMedia": {
    "facebook": "https://facebook.com/...",
    "instagram": "https://instagram.com/...",
    "tiktok": "",
    "youtube": "",
    "twitter": "",
    "linkedin": "",
    "pinterest": "",
    "whatsapp": "+49...",
    "telegram": "",
    "yelp": "",
    "googleBusiness": ""
  },
  "announcement": {
    "enabled": false,
    "title": "Wichtige Mitteilung",
    "content": "<p>Wir sind vom...</p>",
    "style": "warning"
  },
  "pages": [...],
  "header": {...},
  "footer": {...},
  "logos": [...],
  "media": [...]
}
```

---

## 3. Entwicklungs-Roadmap

### Phase 1: Grundlagen (Priorität HOCH)

| Nr. | Feature | Dokument | Status |
|-----|---------|----------|--------|
| 1.1 | Hero V2 Block | CMS_KONZEPT_BAUSTEINE.md | ✅ FERTIG |
| 1.2 | Header Varianten | CMS_KONZEPT_HEADER_FOOTER.md | ⏳ OFFEN |
| 1.3 | Footer Varianten | CMS_KONZEPT_HEADER_FOOTER.md | ⏳ OFFEN |
| 1.4 | Consent-Banner | CMS_KONZEPT_SEO_ANALYTICS.md | ⏳ OFFEN |
| 1.5 | Barrierefreiheit | CMS_KONZEPT_BARRIEREFREIHEIT.md | ⏳ OFFEN |

### Phase 2: Content-Blöcke (Priorität HOCH)

| Nr. | Feature | Dokument | Status |
|-----|---------|----------|--------|
| 2.1 | Card-Block (alle Typen) | CMS_KONZEPT_BAUSTEINE.md | ⏳ OFFEN |
| 2.2 | Galerie-Varianten | CMS_KONZEPT_BAUSTEINE.md | ⏳ OFFEN |
| 2.3 | FAQ-Block | CMS_KONZEPT_BAUSTEINE.md | ⏳ OFFEN |
| 2.4 | Kontaktformular | CMS_KONZEPT_KONTAKTFORMULAR.md | ⏳ OFFEN |

### Phase 3: SEO & Analytics (Priorität HOCH)

| Nr. | Feature | Dokument | Status |
|-----|---------|----------|--------|
| 3.1 | Meta-Tags Editor | CMS_KONZEPT_SEO_ANALYTICS.md | ⏳ OFFEN |
| 3.2 | Open Graph Tags | CMS_KONZEPT_SEO_ANALYTICS.md | ⏳ OFFEN |
| 3.3 | Sitemap Generator | CMS_KONZEPT_SEO_ANALYTICS.md | ⏳ OFFEN |
| 3.4 | Analytics Integration | CMS_KONZEPT_SEO_ANALYTICS.md | ⏳ OFFEN |

### Phase 4: Hilfe & Onboarding (Priorität MITTEL)

| Nr. | Feature | Dokument | Status |
|-----|---------|----------|--------|
| 4.1 | Hilfe-Tooltips | CMS_KONZEPT_HILFE_FAQ.md | ⏳ OFFEN |
| 4.2 | FAQ-Bereich Admin | CMS_KONZEPT_HILFE_FAQ.md | ⏳ OFFEN |
| 4.3 | Onboarding-Portal | CMS_KONZEPT_ONBOARDING.md | ⏳ OFFEN |

### Phase 5: Erweiterte Features (Priorität NIEDRIG)

| Nr. | Feature | Dokument | Status |
|-----|---------|----------|--------|
| 5.1 | Popup-Ankündigungen | CMS_KONZEPT_POPUP_ANKUENDIGUNG.md | ⏳ OFFEN |
| 5.2 | Google Cloud Backup | CMS_KONZEPT_BACKUP_CLOUD.md | ⏳ OFFEN |
| 5.3 | Social Media Icons | CMS_KONZEPT_SOCIAL_MEDIA.md | ⏳ OFFEN |

---

## 4. Dateistruktur

```
src/
├── components/
│   ├── admin/                    # Admin-Editoren
│   │   ├── HeaderEditor/         # Header-Varianten-Editor
│   │   ├── FooterEditor/         # Footer-Varianten-Editor
│   │   ├── CardEditor/           # Card-Block-Editor
│   │   ├── GalleryEditor/        # Galerie-Varianten-Editor
│   │   ├── FAQEditor/            # FAQ-Block-Editor
│   │   ├── ContactFormEditor/    # Kontaktformular-Editor
│   │   ├── SEOEditor/            # SEO-Einstellungen
│   │   ├── ConsentEditor/        # Cookie-Banner-Editor
│   │   ├── AnnouncementEditor/   # Popup-Editor
│   │   ├── HelpSystem/           # Hilfe-Komponenten
│   │   │   ├── HelpTooltip.tsx
│   │   │   ├── HelpPanel.tsx
│   │   │   └── FAQSearch.tsx
│   │   └── ...
│   ├── blocks/                   # Öffentliche Block-Renderer
│   │   ├── HeroV2.tsx           # ✅ FERTIG
│   │   ├── HeaderClassic.tsx
│   │   ├── HeaderCentered.tsx
│   │   ├── HeaderHamburger.tsx
│   │   ├── FooterMinimal.tsx
│   │   ├── FooterFourColumn.tsx
│   │   ├── FooterWithMap.tsx
│   │   ├── CardGrid.tsx
│   │   ├── GalleryMasonry.tsx
│   │   ├── GallerySlider.tsx
│   │   ├── GalleryLightbox.tsx
│   │   ├── GalleryVideo.tsx
│   │   ├── FAQAccordion.tsx
│   │   ├── ContactForm.tsx
│   │   └── ...
│   ├── common/                   # Gemeinsame Komponenten
│   │   ├── ConsentBanner.tsx
│   │   ├── AnnouncementPopup.tsx
│   │   ├── SocialIcons.tsx
│   │   └── AccessibleButton.tsx
│   └── ...
├── types/
│   ├── HeroV2.ts                # ✅ FERTIG
│   ├── Header.ts
│   ├── Footer.ts
│   ├── Card.ts
│   ├── Gallery.ts
│   ├── FAQ.ts
│   ├── ContactForm.ts
│   ├── SEO.ts
│   ├── Consent.ts
│   └── ...
└── ...
```

---

## 5. Globale Konventionen

### 5.1 Namenskonventionen

```typescript
// Komponenten: PascalCase
HeroV2Editor.tsx
CardGrid.tsx

// Types/Interfaces: PascalCase mit Suffix
interface HeroV2Config { }
interface CardBlockConfig { }
type GalleryVariant = 'grid' | 'masonry' | 'slider';

// Funktionen: camelCase
function createDefaultConfig() { }
function getResponsiveValue() { }

// Konstanten: UPPER_SNAKE_CASE
const AVAILABLE_BLOCKS = [];
const DEFAULT_COLORS = {};
```

### 5.2 Responsive Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: 0,      // 0px - 767px
  tablet: 768,    // 768px - 1023px
  desktop: 1024   // 1024px+
};

// Tailwind Classes
// Mobile: default (kein Prefix)
// Tablet: md:
// Desktop: lg:
```

### 5.3 Farben aus Theme

```typescript
// Immer Theme-Farben verwenden, nie hardcoded
const themeColors = {
  primary: 'var(--color-primary)',      // Rose/Pink
  secondary: 'var(--color-secondary)',  // Dunkelgrau
  accent: 'var(--color-accent)'         // Gold/Orange
};
```

### 5.4 Barrierefreiheit (in allen Komponenten)

```typescript
// IMMER:
// - aria-labels für interaktive Elemente
// - Fokus-Styles sichtbar
// - Kontrastverhältnis mindestens 4.5:1
// - Keyboard-Navigation möglich
// - Alt-Texte für Bilder

<button
  aria-label="Menü öffnen"
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
```

---

## 6. Nächste Schritte

1. **Lies alle Konzeptdokumente** in der Reihenfolge der Priorität
2. **Implementiere Phase 1** zuerst (Header, Footer, Consent, Barrierefreiheit)
3. **Teste jede Komponente** auf Barrierefreiheit
4. **Dokumentiere Hilfe-Texte** parallel zur Entwicklung

---

## 7. Referenzen

- [WCAG 2.1 Richtlinien](https://www.w3.org/WAI/WCAG21/quickref/)
- [Supabase Dokumentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
