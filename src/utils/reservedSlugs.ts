// =====================================================
// RESERVED SLUGS
// Slugs that must not be used for customer pages because
// they collide with application routes.
// =====================================================

/**
 * Reserved slug strings (without leading slash).
 * These are used by app routing and must not be taken by tenant pages.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'admin',
  'superadmin',
  'login',
  'api',
  'auth',
  'callback',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
]);

/**
 * Check whether a slug is reserved.
 * Strips leading slashes before comparing.
 */
export function isReservedSlug(slug: string): boolean {
  const normalized = slug.replace(/^\/+/, '').toLowerCase().split('/')[0];
  return RESERVED_SLUGS.has(normalized);
}

/**
 * German-language error message for reserved slugs.
 */
export function getReservedSlugError(slug: string): string {
  const normalized = slug.replace(/^\/+/, '').toLowerCase().split('/')[0];
  return `"${normalized}" ist ein reservierter Systemname und kann nicht als Seitenroute verwendet werden.`;
}
