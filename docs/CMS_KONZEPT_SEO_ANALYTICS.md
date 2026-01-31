# BeautifulCMS - SEO, Analytics & Consent

## Übersicht

Dieses Dokument beschreibt alle SEO-Tools, Analytics-Integration und die Cookie-Consent-Implementierung.

---

## Inhaltsverzeichnis

1. [SEO-Tools](#1-seo-tools)
2. [Analytics Integration](#2-analytics-integration)
3. [Cookie-Consent Banner](#3-cookie-consent-banner)
4. [Implementierung](#4-implementierung)

---

## 1. SEO-Tools

### 1.1 Übersicht der SEO-Features

| Feature | Priorität | Beschreibung | Status |
|---------|-----------|--------------|--------|
| Meta Title | HOCH | Seitentitel für Suchmaschinen | ✅ Existiert |
| Meta Description | HOCH | Seitenbeschreibung | ✅ Existiert |
| Open Graph Tags | HOCH | Facebook/LinkedIn Vorschau | ⏳ OFFEN |
| Twitter Cards | MITTEL | Twitter Vorschau | ⏳ OFFEN |
| Schema.org (LocalBusiness) | HOCH | Strukturierte Daten für Google | ⏳ OFFEN |
| Sitemap.xml | HOCH | Automatische Sitemap | ⏳ OFFEN |
| Robots.txt | MITTEL | Crawler-Steuerung | ⏳ OFFEN |
| Canonical URLs | MITTEL | Duplicate Content vermeiden | ⏳ OFFEN |
| Alt-Texte für Bilder | HOCH | Barrierefreiheit & SEO | ⏳ OFFEN |

### 1.2 Meta-Tags (Erweiterung)

**Aktuelle Felder erweitern um:**

```typescript
// src/types/SEO.ts

interface PageSEO {
  // Bereits vorhanden:
  title: string;
  description: string;
  
  // NEU hinzufügen:
  ogTitle?: string;         // Open Graph Title (Fallback: title)
  ogDescription?: string;   // Open Graph Description (Fallback: description)
  ogImage?: string;         // Vorschaubild für Social Media
  ogType?: 'website' | 'article' | 'business.business';
  
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  canonical?: string;       // Canonical URL (Fallback: aktuelle URL)
  noIndex?: boolean;        // Seite von Suchmaschinen ausschließen
  noFollow?: boolean;       // Links nicht folgen
}

interface GlobalSEO {
  siteName: string;
  defaultOgImage: string;
  defaultTwitterCard: 'summary' | 'summary_large_image';
  googleSiteVerification?: string;
  bingSiteVerification?: string;
}
```

### 1.3 SEO-Editor (Admin-Bereich)

**Editor pro Seite:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SEO-Einstellungen: Startseite                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Suchmaschinen                                             [−]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │ Seitentitel: (i)                                                 │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ Friseursalon Beispiel - Ihr Friseur in Musterstadt         │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │ 52/60 Zeichen ✓                                                 │   │
│  │                                                                  │   │
│  │ Beschreibung: (i)                                               │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ Willkommen bei Friseursalon Beispiel! Wir bieten           │ │   │
│  │ │ professionelle Haarschnitte, Färbungen und Styling.        │ │   │
│  │ │ Jetzt Termin vereinbaren!                                   │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │ 142/160 Zeichen ✓                                               │   │
│  │                                                                  │   │
│  │ Google-Vorschau:                                                │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ Friseursalon Beispiel - Ihr Friseur in Musterstadt         │ │   │
│  │ │ www.friseursalon-beispiel.de                                │ │   │
│  │ │ Willkommen bei Friseursalon Beispiel! Wir bieten           │ │   │
│  │ │ professionelle Haarschnitte, Färbungen und Styling...      │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │ [ ] Diese Seite von Suchmaschinen ausschließen (noindex)        │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Social Media Vorschau                                     [−]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │ Vorschaubild: (i)                                               │   │
│  │ ┌────────────────┐                                              │   │
│  │ │                │  [Aus Mediathek wählen]                      │   │
│  │ │   [Bild]       │  Empfohlen: 1200x630px                       │   │
│  │ │                │                                              │   │
│  │ └────────────────┘                                              │   │
│  │                                                                  │   │
│  │ Facebook/LinkedIn-Vorschau:                                     │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ ┌───────────────────────────────────────────────────────┐   │ │   │
│  │ │ │                    [Vorschaubild]                     │   │ │   │
│  │ │ └───────────────────────────────────────────────────────┘   │ │   │
│  │ │ FRISEURSALON-BEISPIEL.DE                                    │ │   │
│  │ │ Friseursalon Beispiel - Ihr Friseur in Musterstadt         │ │   │
│  │ │ Willkommen bei Friseursalon Beispiel! Wir bieten...        │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                               [Abbrechen] [Speichern]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hilfe-Texte für SEO-Felder:**

| Feld | Hilfe-Text (Tooltip) |
|------|---------------------|
| Seitentitel | "Der Titel erscheint in den Suchergebnissen und im Browser-Tab. Empfohlen: 50-60 Zeichen. Verwenden Sie wichtige Suchbegriffe am Anfang." |
| Beschreibung | "Die Beschreibung erscheint unter dem Titel in den Suchergebnissen. Empfohlen: 120-160 Zeichen. Beschreiben Sie kurz, worum es auf der Seite geht." |
| Vorschaubild | "Dieses Bild wird angezeigt, wenn jemand Ihre Seite auf Facebook, LinkedIn oder anderen Plattformen teilt. Empfohlene Größe: 1200x630 Pixel." |
| noindex | "Wenn aktiviert, wird diese Seite nicht in Suchmaschinen wie Google angezeigt. Nützlich für interne Seiten wie das Impressum." |

### 1.4 Schema.org LocalBusiness

**Automatisch generiertes JSON-LD für lokale Unternehmen:**

```typescript
// src/utils/schema.ts

interface LocalBusinessSchema {
  "@context": "https://schema.org";
  "@type": "HairSalon" | "BarberShop" | "BeautySalon" | "LocalBusiness";
  name: string;
  description?: string;
  image?: string;
  telephone?: string;
  email?: string;
  url: string;
  address?: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: {
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }[];
  priceRange?: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

export const generateLocalBusinessSchema = (website: Website): LocalBusinessSchema => {
  const schema: LocalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HairSalon",  // Konfigurierbar machen
    name: website.settings.businessName,
    url: `https://${website.domain_name}`,
  };

  // Kontaktdaten
  if (website.contact) {
    if (website.contact.phone) schema.telephone = website.contact.phone;
    if (website.contact.email) schema.email = website.contact.email;
    
    if (website.contact.address) {
      schema.address = {
        "@type": "PostalAddress",
        streetAddress: website.contact.address.street,
        addressLocality: website.contact.address.city,
        postalCode: website.contact.address.zip,
        addressCountry: "DE"
      };
    }
  }

  // Öffnungszeiten
  if (website.hours && website.hours.length > 0) {
    schema.openingHoursSpecification = website.hours
      .filter(h => !h.closed)
      .map(h => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [h.day],
        opens: h.open,
        closes: h.close
      }));
  }

  // Bewertungen (falls vorhanden)
  if (website.reviews && website.reviews.length > 0) {
    const avgRating = website.reviews.reduce((sum, r) => sum + r.rating, 0) / website.reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(avgRating * 10) / 10,
      reviewCount: website.reviews.length
    };
  }

  return schema;
};
```

**Einbindung im HTML-Head:**

```tsx
// src/components/SEOHead.tsx

export const SEOHead: React.FC<SEOHeadProps> = ({ page, website }) => {
  const schema = generateLocalBusinessSchema(website);
  
  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{page.seo.title}</title>
      <meta name="description" content={page.seo.description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={page.seo.ogTitle || page.seo.title} />
      <meta property="og:description" content={page.seo.ogDescription || page.seo.description} />
      <meta property="og:image" content={page.seo.ogImage || website.seo.defaultOgImage} />
      <meta property="og:type" content={page.seo.ogType || 'website'} />
      <meta property="og:site_name" content={website.seo.siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={page.seo.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={page.seo.twitterTitle || page.seo.title} />
      <meta name="twitter:description" content={page.seo.twitterDescription || page.seo.description} />
      <meta name="twitter:image" content={page.seo.twitterImage || page.seo.ogImage} />
      
      {/* Canonical */}
      <link rel="canonical" href={page.seo.canonical || window.location.href} />
      
      {/* Robots */}
      {(page.seo.noIndex || page.seo.noFollow) && (
        <meta 
          name="robots" 
          content={`${page.seo.noIndex ? 'noindex' : 'index'}, ${page.seo.noFollow ? 'nofollow' : 'follow'}`} 
        />
      )}
      
      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
```

### 1.5 Sitemap.xml Generator

**Automatische Generierung der Sitemap:**

```typescript
// src/utils/sitemap.ts

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (website: Website): string => {
  const baseUrl = `https://${website.domain_name}`;
  const urls: SitemapURL[] = [];

  // Alle veröffentlichten Seiten
  website.pages
    .filter(page => page.is_published && !page.seo?.noIndex)
    .forEach(page => {
      urls.push({
        loc: page.is_home ? baseUrl : `${baseUrl}/${page.slug}`,
        lastmod: page.updated_at?.split('T')[0],
        changefreq: page.is_home ? 'weekly' : 'monthly',
        priority: page.is_home ? 1.0 : 0.8
      });
    });

  // XML generieren
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
};
```

**Vercel API Route für Sitemap:**

```typescript
// api/sitemap.xml.ts (Vercel Serverless Function)

import { createClient } from '@supabase/supabase-js';
import { generateSitemap } from '../src/utils/sitemap';

export default async function handler(req, res) {
  // Website anhand der Domain ermitteln
  const host = req.headers.host;
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('domain_name', host)
    .single();

  if (!website) {
    return res.status(404).send('Website not found');
  }

  const sitemap = generateSitemap(website.data);
  
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h Cache
  res.status(200).send(sitemap);
}
```

### 1.6 Robots.txt

```typescript
// api/robots.txt.ts

export default async function handler(req, res) {
  const host = req.headers.host;
  
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://${host}/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(robotsTxt);
}
```

---

## 2. Analytics Integration

### 2.1 Konfiguration im Admin-Bereich

**Einfache Tracking-Code-Einbindung:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Analytics & Tracking                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Google Analytics / Tag Manager                            [−]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │ (i) Fügen Sie hier Ihren Google Analytics oder Tag Manager      │   │
│  │     Tracking-Code ein. Dieser wird nur geladen, wenn der        │   │
│  │     Besucher in der Cookie-Maske zugestimmt hat.                │   │
│  │                                                                  │   │
│  │ Tracking-Code:                                                   │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ <!-- Google tag (gtag.js) -->                              │ │   │
│  │ │ <script async src="https://www.googletagmanager.com/       │ │   │
│  │ │ gtag/js?id=G-XXXXXXXXXX"></script>                         │ │   │
│  │ │ <script>                                                    │ │   │
│  │ │   window.dataLayer = window.dataLayer || [];                │ │   │
│  │ │   function gtag(){dataLayer.push(arguments);}               │ │   │
│  │ │   gtag('js', new Date());                                   │ │   │
│  │ │   gtag('config', 'G-XXXXXXXXXX');                           │ │   │
│  │ │ </script>                                                   │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │ ⚠️ Wichtig: Der Tracking-Code wird nur ausgeführt, wenn der     │   │
│  │    Besucher "Statistik-Cookies" akzeptiert hat.                 │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                               [Abbrechen] [Speichern]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hilfe-Text:**

```
So erhalten Sie Ihren Tracking-Code:

1. Google Analytics:
   - Gehen Sie zu analytics.google.com
   - Klicken Sie auf "Admin" (Zahnrad unten links)
   - Unter "Datenerhebung" klicken Sie auf "Datenstreams"
   - Wählen Sie Ihren Stream oder erstellen Sie einen neuen
   - Kopieren Sie den Code unter "Tag-Anleitung"

2. Google Tag Manager:
   - Gehen Sie zu tagmanager.google.com
   - Klicken Sie auf "Admin" > "Container installieren"
   - Kopieren Sie beide Code-Snippets

Hinweis: Durch die DSGVO müssen Besucher der Nutzung von Tracking-Cookies 
zustimmen. Das CMS zeigt automatisch einen Cookie-Banner an.
```

### 2.2 Technische Implementierung

```typescript
// src/components/AnalyticsLoader.tsx

interface AnalyticsLoaderProps {
  trackingCode?: string;
}

export const AnalyticsLoader: React.FC<AnalyticsLoaderProps> = ({ trackingCode }) => {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Prüfe Cookie-Consent
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      const parsed = JSON.parse(consent);
      setConsentGiven(parsed.statistics === true);
    }

    // Event-Listener für Consent-Änderungen
    const handleConsentChange = (e: CustomEvent) => {
      setConsentGiven(e.detail.statistics === true);
    };

    window.addEventListener('cookie_consent_changed', handleConsentChange as EventListener);
    return () => {
      window.removeEventListener('cookie_consent_changed', handleConsentChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (consentGiven && trackingCode) {
      // Tracking-Code in den Head einfügen
      const container = document.createElement('div');
      container.innerHTML = trackingCode;
      
      // Scripts extrahieren und ausführen
      container.querySelectorAll('script').forEach(script => {
        const newScript = document.createElement('script');
        
        // Attribute kopieren
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Inhalt kopieren
        newScript.textContent = script.textContent;
        
        document.head.appendChild(newScript);
      });
    }
  }, [consentGiven, trackingCode]);

  return null;
};
```

---

## 3. Cookie-Consent Banner

### 3.1 Konfiguration

```typescript
// src/types/Consent.ts

interface ConsentConfig {
  enabled: boolean;
  position: 'bottom' | 'bottom-left' | 'bottom-right' | 'top';
  style: 'bar' | 'box' | 'modal';
  theme: 'light' | 'dark' | 'custom';
  customColors?: {
    background: string;
    text: string;
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
  };
  texts: {
    title: string;
    description: string;
    acceptAll: string;
    acceptSelected: string;
    rejectAll: string;
    settings: string;
    privacyLink: string;
    privacyUrl: string;
  };
  categories: {
    necessary: ConsentCategory;
    statistics: ConsentCategory;
    marketing: ConsentCategory;
    externalMedia: ConsentCategory;
  };
}

interface ConsentCategory {
  name: string;
  description: string;
  required: boolean;  // true = kann nicht deaktiviert werden
  defaultEnabled: boolean;
  cookies?: {
    name: string;
    provider: string;
    purpose: string;
    expiry: string;
  }[];
}
```

### 3.2 Standard-Texte (Deutsch)

```typescript
const DEFAULT_CONSENT_TEXTS = {
  title: 'Cookie-Einstellungen',
  description: 'Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. Einige Cookies sind für den Betrieb der Website erforderlich, während andere uns helfen, die Website zu verbessern und Ihnen personalisierte Inhalte anzuzeigen.',
  acceptAll: 'Alle akzeptieren',
  acceptSelected: 'Auswahl speichern',
  rejectAll: 'Nur notwendige',
  settings: 'Einstellungen',
  privacyLink: 'Datenschutzerklärung',
  privacyUrl: '/datenschutz'
};

const DEFAULT_CONSENT_CATEGORIES = {
  necessary: {
    name: 'Notwendig',
    description: 'Diese Cookies sind für den Betrieb der Website unbedingt erforderlich. Sie ermöglichen grundlegende Funktionen wie die Seitennavigation und den Zugang zu geschützten Bereichen.',
    required: true,
    defaultEnabled: true,
    cookies: [
      {
        name: 'cookie_consent',
        provider: 'Diese Website',
        purpose: 'Speichert Ihre Cookie-Einstellungen',
        expiry: '1 Jahr'
      }
    ]
  },
  statistics: {
    name: 'Statistik',
    description: 'Statistik-Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln und melden.',
    required: false,
    defaultEnabled: false,
    cookies: [
      {
        name: '_ga, _gid',
        provider: 'Google Analytics',
        purpose: 'Erfasst Statistiken über Besuche auf der Website',
        expiry: '2 Jahre'
      }
    ]
  },
  marketing: {
    name: 'Marketing',
    description: 'Marketing-Cookies werden verwendet, um Besuchern relevante Werbung anzuzeigen. Sie helfen dabei, die Wirksamkeit von Werbekampagnen zu messen.',
    required: false,
    defaultEnabled: false,
    cookies: [
      {
        name: '_fbp',
        provider: 'Facebook',
        purpose: 'Ermöglicht zielgerichtete Werbung auf Facebook',
        expiry: '3 Monate'
      }
    ]
  },
  externalMedia: {
    name: 'Externe Medien',
    description: 'Diese Cookies ermöglichen das Einbetten von Inhalten von externen Plattformen wie YouTube, Google Maps oder Instagram.',
    required: false,
    defaultEnabled: false,
    cookies: [
      {
        name: 'YouTube',
        provider: 'Google',
        purpose: 'Ermöglicht das Abspielen von YouTube-Videos',
        expiry: 'Session'
      },
      {
        name: 'Google Maps',
        provider: 'Google',
        purpose: 'Ermöglicht das Anzeigen von Google Maps',
        expiry: 'Session'
      }
    ]
  }
};
```

### 3.3 Consent-Banner Komponente

```tsx
// src/components/common/ConsentBanner.tsx

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Cookie } from 'lucide-react';

interface ConsentBannerProps {
  config: ConsentConfig;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ config }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selections, setSelections] = useState({
    necessary: true,  // Immer true
    statistics: config.categories.statistics.defaultEnabled,
    marketing: config.categories.marketing.defaultEnabled,
    externalMedia: config.categories.externalMedia.defaultEnabled
  });

  useEffect(() => {
    // Prüfen ob bereits Consent gegeben wurde
    const existingConsent = localStorage.getItem('cookie_consent');
    if (!existingConsent) {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (consent: typeof selections) => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      ...consent,
      timestamp: new Date().toISOString()
    }));
    
    // Custom Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('cookie_consent_changed', { 
      detail: consent 
    }));
    
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      statistics: true,
      marketing: true,
      externalMedia: true
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      statistics: false,
      marketing: false,
      externalMedia: false
    });
  };

  const handleAcceptSelected = () => {
    saveConsent(selections);
  };

  if (!isVisible || !config.enabled) return null;

  const positionClasses = {
    'bottom': 'fixed bottom-0 left-0 right-0',
    'bottom-left': 'fixed bottom-4 left-4 max-w-md',
    'bottom-right': 'fixed bottom-4 right-4 max-w-md',
    'top': 'fixed top-0 left-0 right-0'
  };

  const themeClasses = {
    'light': 'bg-white text-gray-800 border-gray-200',
    'dark': 'bg-gray-900 text-white border-gray-700',
    'custom': ''
  };

  return (
    <div 
      className={`
        ${positionClasses[config.position]}
        ${themeClasses[config.theme]}
        z-[9999] p-6 shadow-2xl border-t
      `}
      style={config.theme === 'custom' ? {
        backgroundColor: config.customColors?.background,
        color: config.customColors?.text
      } : {}}
      role="dialog"
      aria-modal="true"
      aria-label="Cookie-Einstellungen"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Cookie className="w-8 h-8 flex-shrink-0 text-rose-500" />
          <div>
            <h2 className="text-lg font-semibold mb-2">
              {config.texts.title}
            </h2>
            <p className="text-sm opacity-80">
              {config.texts.description}
            </p>
          </div>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium mb-4 hover:underline"
          aria-expanded={showDetails}
        >
          {config.texts.settings}
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Category Details */}
        {showDetails && (
          <div className="grid gap-4 mb-6 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
            {Object.entries(config.categories).map(([key, category]) => (
              <div 
                key={key}
                className="flex items-start gap-4"
              >
                <input
                  type="checkbox"
                  id={`consent-${key}`}
                  checked={selections[key as keyof typeof selections]}
                  disabled={category.required}
                  onChange={(e) => setSelections(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="mt-1 w-5 h-5 rounded"
                />
                <label htmlFor={`consent-${key}`} className="flex-1">
                  <span className="font-medium">
                    {category.name}
                    {category.required && (
                      <span className="ml-2 text-xs opacity-60">(erforderlich)</span>
                    )}
                  </span>
                  <p className="text-sm opacity-70 mt-1">
                    {category.description}
                  </p>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAcceptAll}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition"
          >
            {config.texts.acceptAll}
          </button>
          
          {showDetails && (
            <button
              onClick={handleAcceptSelected}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {config.texts.acceptSelected}
            </button>
          )}
          
          <button
            onClick={handleRejectAll}
            className="px-6 py-2 border border-current rounded-lg font-medium hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            {config.texts.rejectAll}
          </button>
          
          <a
            href={config.texts.privacyUrl}
            className="px-6 py-2 text-sm underline opacity-70 hover:opacity-100"
          >
            {config.texts.privacyLink}
          </a>
        </div>
      </div>
    </div>
  );
};
```

### 3.4 Consent-Editor (Admin-Bereich)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Cookie-Banner Einstellungen                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [✓] Cookie-Banner aktivieren                                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Aussehen                                                  [−]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │ Position:   ● Unten (Leiste)  ○ Unten links  ○ Unten rechts    │   │
│  │                                                                  │   │
│  │ Farbschema: ● Hell  ○ Dunkel  ○ An Theme anpassen              │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Texte                                                     [−]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │ Überschrift:                                                     │   │
│  │ [Cookie-Einstellungen_______________________________________]   │   │
│  │                                                                  │   │
│  │ Beschreibung:                                                    │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │ Wir verwenden Cookies, um Ihnen die bestmögliche...        │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │ Button "Alle akzeptieren": [Alle akzeptieren_______________]   │   │
│  │ Button "Auswahl speichern": [Auswahl speichern_____________]   │   │
│  │ Button "Ablehnen":          [Nur notwendige________________]   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Cookie-Kategorien                                         [−]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │ ▼ Notwendig (kann nicht deaktiviert werden)                     │   │
│  │   Beschreibung: [Diese Cookies sind erforderlich...]           │   │
│  │                                                                  │   │
│  │ ▼ Statistik                                                      │   │
│  │   Beschreibung: [Statistik-Cookies helfen uns...]              │   │
│  │   [ ] Standardmäßig aktiviert                                   │   │
│  │                                                                  │   │
│  │ ▼ Marketing                                                      │   │
│  │   Beschreibung: [Marketing-Cookies werden verwendet...]        │   │
│  │   [ ] Standardmäßig aktiviert                                   │   │
│  │                                                                  │   │
│  │ ▼ Externe Medien                                                 │   │
│  │   Beschreibung: [Diese Cookies ermöglichen das Einbetten...]   │   │
│  │   [ ] Standardmäßig aktiviert                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Vorschau:                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Live-Vorschau des Cookie-Banners]                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                               [Abbrechen] [Speichern]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Consent-Prüfung für externe Inhalte

```tsx
// src/components/common/ConsentRequired.tsx

interface ConsentRequiredProps {
  category: 'statistics' | 'marketing' | 'externalMedia';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  serviceName?: string;  // z.B. "YouTube", "Google Maps"
}

export const ConsentRequired: React.FC<ConsentRequiredProps> = ({ 
  category, 
  children, 
  fallback,
  serviceName 
}) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const consent = localStorage.getItem('cookie_consent');
      if (consent) {
        const parsed = JSON.parse(consent);
        setHasConsent(parsed[category] === true);
      }
    };

    checkConsent();

    window.addEventListener('cookie_consent_changed', checkConsent);
    return () => window.removeEventListener('cookie_consent_changed', checkConsent);
  }, [category]);

  if (hasConsent) {
    return <>{children}</>;
  }

  // Fallback: Platzhalter mit Hinweis
  return fallback || (
    <div className="bg-gray-100 rounded-lg p-8 text-center">
      <p className="text-gray-600 mb-4">
        Um {serviceName || 'diesen Inhalt'} anzuzeigen, müssen Sie 
        "{category === 'externalMedia' ? 'Externe Medien' : 'Marketing'}-Cookies" akzeptieren.
      </p>
      <button
        onClick={() => {
          // Cookie-Banner erneut anzeigen
          window.dispatchEvent(new CustomEvent('show_cookie_banner'));
        }}
        className="px-4 py-2 bg-rose-500 text-white rounded-lg"
      >
        Cookie-Einstellungen ändern
      </button>
    </div>
  );
};

// Verwendung:
<ConsentRequired category="externalMedia" serviceName="Google Maps">
  <GoogleMap address={address} />
</ConsentRequired>

<ConsentRequired category="externalMedia" serviceName="YouTube">
  <YouTubeEmbed videoId={videoId} />
</ConsentRequired>
```

---

## 4. Implementierung

### 4.1 Dateistruktur

```
src/
├── components/
│   ├── admin/
│   │   ├── SEOEditor/
│   │   │   ├── index.tsx
│   │   │   ├── MetaTagsEditor.tsx
│   │   │   ├── OpenGraphEditor.tsx
│   │   │   └── SearchPreview.tsx
│   │   ├── ConsentEditor/
│   │   │   ├── index.tsx
│   │   │   ├── TextsEditor.tsx
│   │   │   └── CategoriesEditor.tsx
│   │   └── AnalyticsEditor.tsx
│   └── common/
│       ├── SEOHead.tsx
│       ├── ConsentBanner.tsx
│       ├── ConsentRequired.tsx
│       └── AnalyticsLoader.tsx
├── utils/
│   ├── schema.ts
│   └── sitemap.ts
└── types/
    ├── SEO.ts
    └── Consent.ts
```

### 4.2 Implementierungs-Reihenfolge

1. **TypeScript-Typen** definieren
2. **SEOHead-Komponente** erweitern (Open Graph, Twitter, Schema)
3. **ConsentBanner** implementieren
4. **ConsentRequired** Wrapper implementieren
5. **AnalyticsLoader** implementieren
6. **SEO-Editor** im Admin erstellen
7. **Consent-Editor** im Admin erstellen
8. **Sitemap-Generator** implementieren
9. **API-Routes** für sitemap.xml und robots.txt

### 4.3 Checkliste

- [ ] Meta-Tags Editor mit Live-Vorschau
- [ ] Open Graph Tags funktionieren
- [ ] Schema.org LocalBusiness wird generiert
- [ ] Sitemap.xml wird automatisch erstellt
- [ ] Robots.txt ist verfügbar
- [ ] Cookie-Banner erscheint beim ersten Besuch
- [ ] Cookie-Einstellungen werden gespeichert
- [ ] Analytics wird nur bei Consent geladen
- [ ] Externe Medien werden nur bei Consent geladen
- [ ] Texte sind im Admin editierbar
- [ ] Barrierefreiheit des Cookie-Banners (ARIA, Keyboard)
