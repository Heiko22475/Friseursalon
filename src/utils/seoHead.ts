// =====================================================
// SEO HEAD MANAGER
// Dynamically manages <head> meta tags for public pages.
// Handles title, description, canonical, Open Graph,
// Twitter Cards, and JSON-LD structured data.
// =====================================================

export interface SEOData {
  /** Page title (will be combined with site name) */
  title: string;
  /** Meta description (max ~160 chars for SERP display) */
  description?: string;
  /** Canonical URL for this page */
  canonicalUrl?: string;
  /** Full site name (e.g. "Salon Rosé") */
  siteName?: string;
  /** Primary image URL for OG/Twitter previews */
  image?: string;
  /** Page type: 'website' or 'article' */
  type?: 'website' | 'article';
  /** Language / locale  */
  locale?: string;
  /** noindex flag for pages that shouldn't be indexed */
  noIndex?: boolean;
}

export interface LocalBusinessData {
  name: string;
  description?: string;
  url: string;
  phone?: string;
  email?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  image?: string;
  /** Price range, e.g. "€€" */
  priceRange?: string;
  /** Opening hours in schema.org format, e.g. ["Mo-Fr 09:00-18:00", "Sa 09:00-14:00"] */
  openingHours?: string[];
  /** Geo coordinates */
  geo?: { lat: number; lng: number };
  /** Social media profile URLs */
  sameAs?: string[];
}

// ===== HELPER – set or create a <meta> tag =====

function setMetaTag(attribute: string, key: string, content: string): void {
  if (!content) return;
  let el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMetaTag(attribute: string, key: string): void {
  const el = document.querySelector(`meta[${attribute}="${key}"]`);
  if (el) el.remove();
}

// ===== HELPER – set or create a <link> tag =====

function setLinkTag(rel: string, href: string): void {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// ===== HELPER – manage JSON-LD script tag =====

const JSONLD_ID = 'seo-jsonld';

function setJsonLd(data: Record<string, unknown> | null): void {
  let el = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = JSONLD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// =====================================================
// PUBLIC API
// =====================================================

/**
 * Update all SEO-relevant <head> tags for the current page.
 * Call on every page navigation.
 */
export function updateSEOHead(seo: SEOData): void {
  // -- Title --
  const fullTitle = seo.siteName
    ? `${seo.title} – ${seo.siteName}`
    : seo.title;
  document.title = fullTitle;

  // -- Meta Description --
  if (seo.description) {
    setMetaTag('name', 'description', seo.description);
  }

  // -- Robots --
  if (seo.noIndex) {
    setMetaTag('name', 'robots', 'noindex, nofollow');
  } else {
    removeMetaTag('name', 'robots');
  }

  // -- Canonical --
  if (seo.canonicalUrl) {
    setLinkTag('canonical', seo.canonicalUrl);
  }

  // -- Open Graph --
  setMetaTag('property', 'og:title', seo.title);
  setMetaTag('property', 'og:site_name', seo.siteName || '');
  setMetaTag('property', 'og:type', seo.type || 'website');
  setMetaTag('property', 'og:locale', seo.locale || 'de_DE');
  if (seo.description) {
    setMetaTag('property', 'og:description', seo.description);
  }
  if (seo.canonicalUrl) {
    setMetaTag('property', 'og:url', seo.canonicalUrl);
  }
  if (seo.image) {
    setMetaTag('property', 'og:image', seo.image);
  }

  // -- Twitter Card --
  setMetaTag('name', 'twitter:card', seo.image ? 'summary_large_image' : 'summary');
  setMetaTag('name', 'twitter:title', seo.title);
  if (seo.description) {
    setMetaTag('name', 'twitter:description', seo.description);
  }
  if (seo.image) {
    setMetaTag('name', 'twitter:image', seo.image);
  }
}

/**
 * Inject JSON-LD structured data for a LocalBusiness (hair salon, beauty salon).
 * Critical for Google Rich Results and local search rankings.
 */
export function setLocalBusinessStructuredData(biz: LocalBusinessData): void {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: biz.name,
    url: biz.url,
  };

  if (biz.description) schema.description = biz.description;
  if (biz.phone) schema.telephone = biz.phone;
  if (biz.email) schema.email = biz.email;
  if (biz.image) schema.image = biz.image;
  if (biz.priceRange) schema.priceRange = biz.priceRange;

  // Address
  if (biz.street || biz.city) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(biz.street && { streetAddress: biz.street }),
      ...(biz.postalCode && { postalCode: biz.postalCode }),
      ...(biz.city && { addressLocality: biz.city }),
      ...(biz.country && { addressCountry: biz.country }),
    };
  }

  // Geo coordinates
  if (biz.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: biz.geo.lat,
      longitude: biz.geo.lng,
    };
  }

  // Opening hours
  if (biz.openingHours?.length) {
    schema.openingHours = biz.openingHours;
  }

  // Social profiles
  if (biz.sameAs?.length) {
    schema.sameAs = biz.sameAs;
  }

  setJsonLd(schema);
}

/**
 * Cleanup: remove all injected SEO tags.
 * Useful when leaving a public page context (e.g. navigating to admin).
 */
export function clearSEOHead(): void {
  removeMetaTag('name', 'description');
  removeMetaTag('name', 'robots');
  removeMetaTag('property', 'og:title');
  removeMetaTag('property', 'og:description');
  removeMetaTag('property', 'og:url');
  removeMetaTag('property', 'og:image');
  removeMetaTag('property', 'og:site_name');
  removeMetaTag('property', 'og:type');
  removeMetaTag('property', 'og:locale');
  removeMetaTag('name', 'twitter:card');
  removeMetaTag('name', 'twitter:title');
  removeMetaTag('name', 'twitter:description');
  removeMetaTag('name', 'twitter:image');
  setJsonLd(null);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.remove();
}
