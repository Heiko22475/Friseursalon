# 📝 Typographie-System Konzept

## Übersicht

Ein flexibles Typographie-System für das CMS, das:
- Responsive Schriftgrößen (Desktop/Tablet/Mobil) unterstützt
- Eine Auswahl an lizenzfreien Schriften bietet (Google Fonts)
- Ähnlich wie der Theme-Editor funktioniert
- Typographie-Presets ermöglicht

---

## 1. Datenstruktur

### 1.1 Schriften-Bibliothek (Font Library)

```typescript
interface FontFamily {
  id: string;
  name: string;               // "Inter", "Playfair Display"
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  weights: number[];          // [300, 400, 500, 600, 700]
  italics: boolean;           // Hat Kursiv-Varianten
  googleFontsUrl?: string;    // Google Fonts Import URL
  isSystem: boolean;          // System-Font oder Web-Font
  preview: string;            // Beispieltext für Vorschau
}
```

### 1.2 Typographie-Stil (Typography Style)

```typescript
interface TypographyStyle {
  fontFamily: string;         // Font-Family ID oder CSS-Stack
  fontSize: ResponsiveSize;   // { desktop: '1rem', tablet: '0.875rem', mobile: '0.875rem' }
  fontWeight: number;         // 400, 500, 600, 700
  lineHeight: ResponsiveSize; // { desktop: '1.5', tablet: '1.4', mobile: '1.4' }
  letterSpacing: string;      // '-0.02em', '0.05em'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

interface ResponsiveSize {
  desktop: string;
  tablet: string;
  mobile: string;
}
```

### 1.3 Typographie-Konfiguration (Typography Config)

```typescript
interface TypographyConfig {
  id: string;
  name: string;               // "Modern Clean", "Elegant Classic"
  
  // Schriften
  headingFont: string;        // Font-Family ID für Überschriften
  bodyFont: string;           // Font-Family ID für Fließtext
  accentFont?: string;        // Optional: Akzent-Font (z.B. für Zitate)
  
  // Überschriften (H1-H6)
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
  
  // Fließtext
  body: TypographyStyle;
  bodyLarge: TypographyStyle;
  bodySmall: TypographyStyle;
  
  // Spezielle Elemente
  caption: TypographyStyle;
  overline: TypographyStyle;
  quote: TypographyStyle;
  button: TypographyStyle;
  
  // Meta
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Lizenzfreie Schriften (Google Fonts)

### 2.1 Empfohlene Sans-Serif Schriften

| Name | Gewichte | Stil | Verwendung |
|------|----------|------|------------|
| **Inter** | 300-900 | Modern, neutral | Body, UI |
| **Poppins** | 100-900 | Geometrisch, freundlich | Headings, Body |
| **Open Sans** | 300-800 | Klassisch, lesbar | Body |
| **Nunito** | 200-900 | Weich, rund | Body, Headings |
| **Montserrat** | 100-900 | Elegant, modern | Headings |
| **Lato** | 100-900 | Warm, professionell | Body |
| **Roboto** | 100-900 | Google-Standard | Body, UI |
| **Work Sans** | 100-900 | Modern, clean | Body, Headings |
| **DM Sans** | 400-700 | Minimalistisch | Body, UI |
| **Plus Jakarta Sans** | 200-800 | Modern, freundlich | Body, Headings |

### 2.2 Empfohlene Serif Schriften

| Name | Gewichte | Stil | Verwendung |
|------|----------|------|------------|
| **Playfair Display** | 400-900 | Elegant, klassisch | Headings |
| **Lora** | 400-700 | Klassisch, lesbar | Body, Headings |
| **Merriweather** | 300-900 | Modern Serif | Body |
| **Source Serif Pro** | 200-900 | Adobe, neutral | Body |
| **Crimson Pro** | 200-900 | Buchstil | Body |
| **Cormorant** | 300-700 | Elegant, dünn | Headings |
| **Libre Baskerville** | 400-700 | Klassisch | Body |

### 2.3 Display & Akzent Schriften

| Name | Gewichte | Stil | Verwendung |
|------|----------|------|------------|
| **Bebas Neue** | 400 | Bold, Condensed | Headlines |
| **Oswald** | 200-700 | Condensed | Headlines |
| **Dancing Script** | 400-700 | Handschrift | Akzente |
| **Pacifico** | 400 | Script | Akzente |
| **Abril Fatface** | 400 | Display | Headlines |

---

## 3. Typographie-Presets

### 3.1 "Modern Clean"
```
Headings: Inter (600-700)
Body: Inter (400)
Stil: Minimalistisch, neutral
```

### 3.2 "Elegant Serif"
```
Headings: Playfair Display (600)
Body: Lora (400)
Stil: Klassisch, elegant
```

### 3.3 "Professional"
```
Headings: Montserrat (600)
Body: Open Sans (400)
Stil: Professionell, seriös
```

### 3.4 "Friendly Rounded"
```
Headings: Nunito (700)
Body: Nunito (400)
Stil: Freundlich, einladend
```

### 3.5 "Bold Statement"
```
Headings: Bebas Neue (400)
Body: Work Sans (400)
Stil: Auffällig, mutig
```

---

## 4. UI-Komponenten

### 4.1 Typography Manager (Hauptseite)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Typography Editor                           [Save] [Reset]│
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│ SCHRIFTEN      │  LIVE-VORSCHAU                            │
│                │                                            │
│ Überschriften  │  ┌──────────────────────────────────────┐ │
│ [Playfair ▼]   │  │ H1: Willkommen                       │ │
│                │  │ H2: Über uns                          │ │
│ Fließtext      │  │ H3: Unsere Leistungen                │ │
│ [Inter ▼]      │  │                                       │ │
│                │  │ Body: Lorem ipsum dolor sit amet,     │ │
│ ───────────────│  │ consectetur adipiscing elit. Sed do   │ │
│                │  │ eiusmod tempor incididunt ut labore.  │ │
│ PRESETS        │  │                                       │ │
│                │  │ Caption: Bildunterschrift             │ │
│ ○ Modern Clean │  │                                       │ │
│ ● Elegant Serif│  │ [Button Text]                         │ │
│ ○ Professional │  └──────────────────────────────────────┘ │
│ ○ Friendly     │                                            │
│ ○ Bold         │  Viewport: [Desktop] [Tablet] [Mobile]    │
│                │                                            │
├────────────────┴────────────────────────────────────────────┤
│ FEINEINSTELLUNGEN                            [▼ Einblenden] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ H1 Überschrift                                              │
│ ┌───────────┬───────────┬───────────┐                      │
│ │ Desktop   │ Tablet    │ Mobile    │                      │
│ ├───────────┼───────────┼───────────┤                      │
│ │ 3.5rem    │ 2.5rem    │ 2rem      │  Schriftgröße       │
│ │ 700       │ 700       │ 700       │  Gewicht            │
│ │ 1.1       │ 1.2       │ 1.3       │  Zeilenhöhe         │
│ │ -0.02em   │ -0.01em   │ 0         │  Zeichenabstand     │
│ └───────────┴───────────┴───────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Font Picker

```
┌─────────────────────────────────────────────┐
│ Schrift auswählen                     [×]   │
├─────────────────────────────────────────────┤
│ 🔍 [Suchen...]                              │
├─────────────────────────────────────────────┤
│ ▼ Sans-Serif                                │
│   ┌─────────────────────────────────────┐   │
│   │ Inter           The quick brown fox │   │
│   │ Poppins         The quick brown fox │   │
│   │ Open Sans       The quick brown fox │   │
│   │ Montserrat      The quick brown fox │   │
│   └─────────────────────────────────────┘   │
│                                             │
│ ▼ Serif                                     │
│   ┌─────────────────────────────────────┐   │
│   │ Playfair Display The quick brown fox│   │
│   │ Lora             The quick brown fox│   │
│   │ Merriweather     The quick brown fox│   │
│   └─────────────────────────────────────┘   │
│                                             │
│ ▼ Display                                   │
│   ┌─────────────────────────────────────┐   │
│   │ Bebas Neue      THE QUICK BROWN FOX │   │
│   │ Oswald          The quick brown fox │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 5. Implementierungsplan

### Phase 1: Typen & Daten
1. [ ] `src/types/typography.ts` - Typdefinitionen
2. [ ] `src/data/fonts.ts` - Schriften-Bibliothek
3. [ ] `src/data/typography-presets.ts` - Vordefinierte Presets

### Phase 2: Services
4. [ ] `src/services/typography-service.ts` - CRUD für Typographie
5. [ ] `src/utils/font-loader.ts` - Google Fonts laden
6. [ ] `src/utils/typography-resolver.ts` - CSS-Variablen generieren

### Phase 3: UI-Komponenten
7. [ ] `src/components/admin/FontPicker.tsx` - Schriftauswahl
8. [ ] `src/components/admin/TypographyEditor.tsx` - Haupteditor
9. [ ] `src/components/admin/TypographyPreview.tsx` - Live-Vorschau

### Phase 4: Integration
10. [ ] In ThemeManager integrieren oder als eigenen Tab
11. [ ] CSS-Variablen global anwenden
12. [ ] In Komponenten verwendbar machen

---

## 6. CSS-Variablen Ausgabe

```css
:root {
  /* Font Families */
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-accent: 'Dancing Script', cursive;
  
  /* H1 */
  --h1-size-desktop: 3.5rem;
  --h1-size-tablet: 2.5rem;
  --h1-size-mobile: 2rem;
  --h1-weight: 700;
  --h1-line-height: 1.1;
  --h1-letter-spacing: -0.02em;
  
  /* H2 */
  --h2-size-desktop: 2.5rem;
  --h2-size-tablet: 2rem;
  --h2-size-mobile: 1.75rem;
  --h2-weight: 600;
  --h2-line-height: 1.2;
  --h2-letter-spacing: -0.01em;
  
  /* Body */
  --body-size-desktop: 1rem;
  --body-size-tablet: 0.9375rem;
  --body-size-mobile: 0.9375rem;
  --body-weight: 400;
  --body-line-height: 1.6;
  --body-letter-spacing: 0;
}

/* Responsive Application */
h1 {
  font-family: var(--font-heading);
  font-size: var(--h1-size-mobile);
  font-weight: var(--h1-weight);
  line-height: var(--h1-line-height);
  letter-spacing: var(--h1-letter-spacing);
}

@media (min-width: 768px) {
  h1 { font-size: var(--h1-size-tablet); }
}

@media (min-width: 1024px) {
  h1 { font-size: var(--h1-size-desktop); }
}
```

---

## 7. Datenbank-Struktur (Supabase)

```sql
-- Typographie-Konfigurationen
CREATE TABLE typography_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  heading_font TEXT NOT NULL,
  body_font TEXT NOT NULL,
  accent_font TEXT,
  styles JSONB NOT NULL,  -- Alle TypographyStyle-Objekte
  is_active BOOLEAN DEFAULT false,
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnellen Zugriff
CREATE INDEX idx_typography_customer ON typography_configs(customer_id);
CREATE INDEX idx_typography_active ON typography_configs(customer_id, is_active);
```

---

## Nächste Schritte

Soll ich mit der Implementierung beginnen? Ich würde vorschlagen:

1. **Typdefinitionen erstellen** (`src/types/typography.ts`)
2. **Schriften-Bibliothek definieren** (`src/data/fonts.ts`)
3. **Typography Editor UI bauen**
4. **Integration mit Theme-System**

Was ist Ihre Priorität?
