// =====================================================
// V2 FORMAT CONVERTER
// Converts between v2 JSON format (DB storage)
// and VE internal types (editor runtime).
//
// v2 JSON: tag, html, [value,"unit"], "#hex", {ref:"..."}
// VE internal: type, content, {value,unit}, {kind,hex}
// =====================================================

import type {
  VEElement, VEBody, VESection, VEContainer, VEText,
  VEImage, VEButton, VEIcon, VENavbar, VEDivider,
  VESpacer, VEList, VEListItem, VEPage,
} from '../types/elements';
import type {
  ElementStyles, StyleProperties, SizeValue,
  SizeValueOrAuto,
} from '../types/styles';
import type { ColorValue } from '../../types/theme';

// =====================================================
// V2 JSON TYPES (what's stored in the DB)
// =====================================================

export interface V2Element {
  id: string;
  tag: string;
  class?: string[];
  visible?: { desktop?: boolean; tablet?: boolean; mobile?: boolean };
  attrs?: Record<string, string>;
  styles?: Record<string, any>;
  children?: V2Element[];
  // Tag-specific content (flat on element)
  html?: string;
  src?: string;
  alt?: string;
  text?: string;
  href?: string;
  newTab?: boolean;
  icon?: string;
  stroke?: number;
  sticky?: boolean | string;
  anchorId?: string;
  lineStyle?: string;
  ordered?: boolean;
  [key: string]: any;
}

export interface V2Page {
  id: string;
  title: string;
  slug: string;
  isHome?: boolean;
  isPublished?: boolean;
  showInMenu?: boolean;
  seo?: { title?: string; description?: string };
  body: V2Element;
}

export interface V2Content {
  settings: any;
  styles: Record<string, any>;
  components: Record<string, any>;
  pages: V2Page[];
}

// =====================================================
// PROPERTY CLASSIFICATION
// =====================================================

/** Properties that use [value, "unit"] tuples in v2 / SizeValue in VE */
const SIZE_PROPS = new Set([
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontSize', 'letterSpacing',
  'gap', 'rowGap', 'columnGap', 'flexBasis',
  'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'top', 'right', 'bottom', 'left',
]);

/** Properties that are ColorValue in VE */
const COLOR_PROPS = new Set(['color', 'backgroundColor', 'borderColor']);

/** Special: lineHeight can be SizeValue OR plain number */
const LINEHEIGHT_PROP = 'lineHeight';

// =====================================================
// STYLE VALUE CONVERSION: v2 → VE
// =====================================================

function v2SizeToVE(val: any): SizeValueOrAuto | undefined {
  if (val === undefined || val === null) return undefined;
  if (val === 'auto') return 'auto';
  if (Array.isArray(val) && val.length === 2) {
    return { value: val[0], unit: val[1] };
  }
  // Already VE format
  if (typeof val === 'object' && 'value' in val && 'unit' in val) return val;
  return undefined;
}

function v2ColorToVE(val: any): ColorValue | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'string' && val.startsWith('#')) {
    return { kind: 'custom', hex: val };
  }
  if (typeof val === 'object' && 'ref' in val) {
    return { kind: 'tokenRef', ref: val.ref };
  }
  // Already VE format
  if (typeof val === 'object' && 'kind' in val) return val;
  return undefined;
}

function v2LineHeightToVE(val: any): SizeValue | number | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') return val; // plain multiplier
  if (Array.isArray(val) && val.length === 2) {
    return { value: val[0], unit: val[1] };
  }
  if (typeof val === 'object' && 'value' in val) return val;
  return undefined;
}

// =====================================================
// STYLE VALUE CONVERSION: VE → v2
// =====================================================

function veSizeToV2(val: SizeValueOrAuto | undefined): any {
  if (val === undefined || val === null) return undefined;
  if (val === 'auto') return 'auto';
  if (typeof val === 'object' && 'value' in val) {
    return [val.value, val.unit];
  }
  return undefined;
}

function veColorToV2(val: ColorValue | undefined | null): any {
  if (val === undefined || val === null) return undefined;
  if (val.kind === 'custom') return val.hex;
  if (val.kind === 'tokenRef') return { ref: val.ref };
  return undefined;
}

function veLineHeightToV2(val: SizeValue | number | undefined): any {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') return val;
  if (typeof val === 'object' && 'value' in val) return [val.value, val.unit];
  return undefined;
}

// =====================================================
// STYLE PROPERTIES CONVERSION
// =====================================================

/**
 * Convert a flat v2 style properties object to VE StyleProperties.
 * Handles tuples → SizeValue, "#hex" → ColorValue, etc.
 */
function v2PropsToVE(v2: Record<string, any>): Partial<StyleProperties> {
  const ve: any = {};
  for (const [key, val] of Object.entries(v2)) {
    // Skip breakpoint/pseudo overrides
    if (key.startsWith('@') || key.startsWith(':') || key === '_extends') continue;
    if (key === 'transition' || key === 'transitions') {
      // Pass through as-is for now
      continue;
    }
    if (SIZE_PROPS.has(key)) {
      ve[key] = v2SizeToVE(val);
    } else if (COLOR_PROPS.has(key)) {
      ve[key] = v2ColorToVE(val);
    } else if (key === LINEHEIGHT_PROP) {
      ve[key] = v2LineHeightToVE(val);
    } else {
      // Pass through: strings, numbers, enums, objects
      ve[key] = val;
    }
  }
  return ve;
}

/**
 * Convert VE StyleProperties back to v2 flat style object.
 */
function vePropsToV2(ve: Partial<StyleProperties>): Record<string, any> {
  const v2: any = {};
  for (const [key, val] of Object.entries(ve)) {
    if (val === undefined || val === null) continue;
    if (SIZE_PROPS.has(key)) {
      v2[key] = veSizeToV2(val as SizeValueOrAuto);
    } else if (COLOR_PROPS.has(key)) {
      v2[key] = veColorToV2(val as ColorValue);
    } else if (key === LINEHEIGHT_PROP) {
      v2[key] = veLineHeightToV2(val as SizeValue | number);
    } else {
      v2[key] = val;
    }
  }
  return v2;
}

// =====================================================
// NAMED STYLES (CLASS) RESOLUTION
// =====================================================

/**
 * Resolve a named style definition, handling _extends chains.
 * Returns flat v2 style props (still in v2 value format).
 */
function resolveNamedStyle(
  name: string,
  allStyles: Record<string, any>,
  visited = new Set<string>(),
): Record<string, any> {
  if (visited.has(name)) return {}; // prevent circular
  visited.add(name);
  const def = allStyles[name];
  if (!def) return {};

  let resolved: Record<string, any> = {};
  if (def._extends) {
    resolved = resolveNamedStyle(def._extends, allStyles, visited);
  }
  // Merge own props (overwrite parent)
  for (const [key, val] of Object.entries(def)) {
    if (key === '_extends') continue;
    resolved[key] = val;
  }
  return resolved;
}

/**
 * Resolve class[] + inline styles → VE ElementStyles.
 * Merges named styles left-to-right, then inline overrides.
 * Splits @tablet/@mobile into responsive buckets.
 */
function resolveV2Styles(
  classes: string[] | undefined,
  inlineStyles: Record<string, any> | undefined,
  allStyles: Record<string, any>,
): ElementStyles | undefined {
  // Merge from classes
  let merged: Record<string, any> = {};

  if (classes) {
    for (const cls of classes) {
      const resolved = resolveNamedStyle(cls, allStyles);
      // Merge desktop-level props
      for (const [key, val] of Object.entries(resolved)) {
        merged[key] = val;
      }
    }
  }

  // Merge inline overrides
  if (inlineStyles) {
    for (const [key, val] of Object.entries(inlineStyles)) {
      merged[key] = val;
    }
  }

  // Nothing → no styles
  if (Object.keys(merged).length === 0) return undefined;

  // Split into desktop / tablet / mobile
  const desktopRaw: Record<string, any> = {};
  const tabletRaw: Record<string, any> = {};
  const mobileRaw: Record<string, any> = {};

  for (const [key, val] of Object.entries(merged)) {
    if (key === '@tablet' && typeof val === 'object') {
      Object.assign(tabletRaw, val);
    } else if (key === '@mobile' && typeof val === 'object') {
      Object.assign(mobileRaw, val);
    } else if (key.startsWith(':') || key === '_extends' || key === 'transition' || key === 'transitions') {
      // Pseudo-states & transitions: skip for now (VE doesn't support them on elements yet)
      continue;
    } else {
      desktopRaw[key] = val;
    }
  }

  const result: ElementStyles = {
    desktop: v2PropsToVE(desktopRaw),
  };
  if (Object.keys(tabletRaw).length > 0) {
    result.tablet = v2PropsToVE(tabletRaw);
  }
  if (Object.keys(mobileRaw).length > 0) {
    result.mobile = v2PropsToVE(mobileRaw);
  }

  return result;
}

// =====================================================
// ELEMENT CONVERSION: v2 → VE
// =====================================================

/**
 * Convert a single v2 element to VE element.
 * Recursively converts children.
 */
function v2ElementToVE(
  el: V2Element,
  allStyles: Record<string, any>,
): VEElement {
  const styles = resolveV2Styles(el.class, el.styles, allStyles);
  const children = el.children?.map(c => v2ElementToVE(c, allStyles)) || [];

  // Store visible + class info in the VE element for round-tripping
  const base: any = {
    id: el.id,
    styles,
    children,
  };

  // Preserve class & visible for round-trip
  if (el.class) base._v2class = el.class;
  if (el.visible) base._v2visible = el.visible;
  if (el.attrs) base._v2attrs = el.attrs;

  switch (el.tag) {
    case 'body':
      return {
        ...base,
        type: 'Body' as const,
        label: 'Body',
      } as VEBody;

    case 'section':
      return {
        ...base,
        type: 'Section' as const,
        label: el.anchorId || 'Section',
      } as VESection;

    case 'container':
      return {
        ...base,
        type: 'Container' as const,
        label: el.id,
      } as VEContainer;

    case 'text':
      return {
        ...base,
        type: 'Text' as const,
        content: el.html || '',
      } as VEText;

    case 'image':
      return {
        ...base,
        type: 'Image' as const,
        content: { src: el.src || '', alt: el.alt || '' },
      } as VEImage;

    case 'button':
      return {
        ...base,
        type: 'Button' as const,
        content: {
          text: el.text || '',
          link: el.href || '#',
          openInNewTab: el.newTab ?? false,
        },
      } as VEButton;

    case 'link':
      // Map link → Button (semantically similar in VE)
      return {
        ...base,
        type: 'Button' as const,
        content: {
          text: el.text || '',
          link: el.href || '#',
          openInNewTab: el.newTab ?? false,
        },
        _v2tag: 'link', // remember original tag for save round-trip
      } as any;

    case 'icon':
      return {
        ...base,
        type: 'Icon' as const,
        content: {
          iconName: el.icon || 'Circle',
          size: 24,
          sizeUnit: 'px' as const,
          color: styles?.desktop?.color || { kind: 'custom' as const, hex: '#000000' },
          strokeWidth: el.stroke ?? 2,
          containerBg: null,
          containerBorderRadius: 0,
        },
      } as VEIcon;

    case 'nav':
      return {
        ...base,
        type: 'Navbar' as const,
        mobileBreakpoint: 478,
        stickyMode: (el.sticky === true || el.sticky === 'sticky') ? 'sticky'
          : el.sticky === 'fixed' ? 'fixed' : 'none',
      } as VENavbar;

    case 'divider':
      return {
        ...base,
        type: 'Divider' as const,
        content: {
          lineStyle: (el.lineStyle as any) || 'solid',
          thickness: 1,
          color: { kind: 'custom' as const, hex: '#e5e7eb' },
          width: '100%',
        },
      } as VEDivider;

    case 'spacer':
      return {
        ...base,
        type: 'Spacer' as const,
        content: { height: 40 },
      } as VESpacer;

    case 'list':
      return {
        ...base,
        type: 'List' as const,
        content: { listType: el.ordered ? 'ordered' as const : 'unordered' as const },
      } as VEList;

    default:
      // Fallback: treat as container
      console.warn(`[v2Converter] Unknown tag "${el.tag}", treating as Container`);
      return {
        ...base,
        type: 'Container' as const,
        label: `${el.tag}:${el.id}`,
      } as VEContainer;
  }
}

// =====================================================
// ELEMENT CONVERSION: VE → v2
// =====================================================

/**
 * Convert VE ElementStyles back to v2 flat styles with @breakpoints.
 */
function veStylesToV2(styles: ElementStyles | undefined): Record<string, any> | undefined {
  if (!styles) return undefined;

  const result: Record<string, any> = {};

  // Desktop (base)
  if (styles.desktop) {
    Object.assign(result, vePropsToV2(styles.desktop));
  }

  // Tablet overrides
  if (styles.tablet && Object.keys(styles.tablet).length > 0) {
    result['@tablet'] = vePropsToV2(styles.tablet);
  }

  // Mobile overrides
  if (styles.mobile && Object.keys(styles.mobile).length > 0) {
    result['@mobile'] = vePropsToV2(styles.mobile);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Convert a VE element back to v2 JSON element.
 */
function veElementToV2(el: VEElement): V2Element {
  const v2: V2Element = {
    id: el.id,
    tag: '', // will be set below
  };

  // Restore class, visible, attrs from round-trip data
  const extra = el as any;
  if (extra._v2class) v2.class = extra._v2class;
  if (extra._v2visible) v2.visible = extra._v2visible;
  if (extra._v2attrs) v2.attrs = extra._v2attrs;

  // Styles
  const styles = veStylesToV2(el.styles);
  if (styles) v2.styles = styles;

  // Children
  if (el.children && el.children.length > 0) {
    v2.children = el.children.map(c => veElementToV2(c));
  }

  switch (el.type) {
    case 'Body':
      v2.tag = 'body';
      break;

    case 'Section':
      v2.tag = 'section';
      break;

    case 'Container':
      v2.tag = 'container';
      break;

    case 'Text':
      v2.tag = 'text';
      v2.html = (el as VEText).content;
      break;

    case 'Image':
      v2.tag = 'image';
      v2.src = (el as VEImage).content.src;
      v2.alt = (el as VEImage).content.alt;
      break;

    case 'Button':
      // Check if it was originally a 'link' tag
      v2.tag = extra._v2tag === 'link' ? 'link' : 'button';
      v2.text = (el as VEButton).content.text;
      v2.href = (el as VEButton).content.link;
      if ((el as VEButton).content.openInNewTab) {
        v2.newTab = true;
      }
      break;

    case 'Icon':
      v2.tag = 'icon';
      v2.icon = (el as VEIcon).content.iconName;
      v2.stroke = (el as VEIcon).content.strokeWidth;
      break;

    case 'Navbar':
      v2.tag = 'nav';
      const navbar = el as VENavbar;
      if (navbar.stickyMode && navbar.stickyMode !== 'none') {
        v2.sticky = navbar.stickyMode;
      }
      break;

    case 'Divider':
      v2.tag = 'divider';
      const divider = el as VEDivider;
      if (divider.content.lineStyle !== 'solid') {
        v2.lineStyle = divider.content.lineStyle;
      }
      break;

    case 'Spacer':
      v2.tag = 'spacer';
      break;

    case 'List':
      v2.tag = 'list';
      if ((el as VEList).content.listType === 'ordered') {
        v2.ordered = true;
      }
      break;

    case 'ListItem':
      v2.tag = 'text'; // list items become text in v2
      v2.html = (el as VEListItem).content.text;
      break;

    default:
      v2.tag = 'container';
      console.warn(`[v2Converter] Unknown VE type "${el.type}", saving as container`);
  }

  return v2;
}

// =====================================================
// PAGE CONVERSION: v2 → VE
// =====================================================

/**
 * Convert v2 content JSON to VE pages.
 * This is the main entry point for loading.
 */
export function v2ContentToVEPages(content: any): VEPage[] {
  if (!content?.pages || !Array.isArray(content.pages)) return [];

  const allStyles = content.styles || {};
  const pages: VEPage[] = [];

  for (const page of content.pages as V2Page[]) {
    if (page.body) {
      const veBody = v2ElementToVE(page.body, allStyles) as VEBody;
      pages.push({
        id: page.id,
        name: page.title || 'Seite',
        route: page.slug === 'home' ? '/' : `/${page.slug}`,
        body: veBody,
        isVisualEditor: true,
        isPublished: page.isPublished ?? true,
      });
    } else {
      // No body → create empty page
      console.warn(`[v2Converter] Page "${page.title || page.id}" has no body – creating empty`);
      pages.push({
        id: page.id,
        name: page.title || 'Seite',
        route: page.slug === 'home' ? '/' : `/${page.slug}`,
        body: {
          id: `body-${page.id}`,
          type: 'Body',
          label: 'Body',
          styles: { desktop: { backgroundColor: { kind: 'custom', hex: '#ffffff' } } },
          children: [],
        },
        isVisualEditor: true,
        isPublished: page.isPublished ?? true,
      });
    }
  }

  return pages;
}

// =====================================================
// PAGE CONVERSION: VE → v2
// =====================================================

/**
 * Convert a VE page back to v2 JSON page format for saving.
 */
export function vePageToV2Page(vePage: VEPage): V2Page {
  return {
    id: vePage.id,
    title: vePage.name || 'Seite',
    slug: (vePage.route || '/').replace(/^\//, '') || 'home',
    isHome: vePage.route === '/',
    isPublished: vePage.isPublished ?? true,
    showInMenu: true,
    body: veElementToV2(vePage.body),
  };
}

/**
 * Convert VE pages to v2 page array for merging into content JSON.
 */
export function vePagesTov2Pages(
  vePages: VEPage[],
  originalPages: any[] = [],
): any[] {
  return vePages.map((vePage) => {
    // Find original page to preserve non-VE fields (seo, display_order, etc.)
    const originalPage = originalPages.find((p: any) => p.id === vePage.id);
    const v2Page = vePageToV2Page(vePage);

    return {
      ...(originalPage || {}),
      ...v2Page,
    };
  });
}

// =====================================================
// FRONTEND STYLE RESOLVER
// Converts v2 style values directly to CSS strings
// for use in DynamicPage (no VE types needed).
// =====================================================

/**
 * Resolve a v2 style value to a CSS string.
 */
function v2ValueToCSS(key: string, val: any, themeColors?: Record<string, string>): string | undefined {
  if (val === undefined || val === null) return undefined;

  // Size value: [56, "px"]
  if (SIZE_PROPS.has(key)) {
    if (val === 'auto') return 'auto';
    if (Array.isArray(val) && val.length === 2) return `${val[0]}${val[1]}`;
    return undefined;
  }

  // Color value
  if (COLOR_PROPS.has(key)) {
    if (typeof val === 'string' && val.startsWith('#')) return val;
    if (typeof val === 'object' && 'ref' in val) {
      return themeColors?.[val.ref] || `var(--color-${val.ref})`;
    }
    return undefined;
  }

  // lineHeight
  if (key === LINEHEIGHT_PROP) {
    if (typeof val === 'number') return `${val}`;
    if (Array.isArray(val) && val.length === 2) return `${val[0]}${val[1]}`;
    return undefined;
  }

  // Everything else: pass as-is
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return `${val}`;

  return undefined;
}

/**
 * Resolve a v2 styles object (one breakpoint level) to React.CSSProperties.
 * Used by the frontend renderer.
 */
export function v2StylesToCSS(
  v2Styles: Record<string, any>,
  themeColors?: Record<string, string>,
): React.CSSProperties {
  const css: Record<string, any> = {};

  for (const [key, val] of Object.entries(v2Styles)) {
    // Skip breakpoint/pseudo overrides
    if (key.startsWith('@') || key.startsWith(':') || key === '_extends') continue;
    if (key === 'transition') {
      css.transition = val;
      continue;
    }
    if (key === 'transitions') continue; // skip structured transitions

    const resolved = v2ValueToCSS(key, val, themeColors);
    if (resolved !== undefined) {
      css[key] = resolved;
    }
  }

  return css as React.CSSProperties;
}

/**
 * Resolve v2 styles with responsive merge for a given viewport.
 * Merges base + @tablet/@mobile into a single CSS object.
 */
export function resolveV2ResponsiveStyles(
  v2Styles: Record<string, any> | undefined,
  viewport: 'desktop' | 'tablet' | 'mobile',
  themeColors?: Record<string, string>,
): React.CSSProperties {
  if (!v2Styles) return {};

  // Start with base (desktop) styles
  const base: Record<string, any> = {};
  for (const [key, val] of Object.entries(v2Styles)) {
    if (!key.startsWith('@') && !key.startsWith(':') && key !== '_extends') {
      base[key] = val;
    }
  }

  // Apply viewport override
  if (viewport === 'tablet' || viewport === 'mobile') {
    const tabletOverride = v2Styles['@tablet'];
    if (tabletOverride) Object.assign(base, tabletOverride);
  }
  if (viewport === 'mobile') {
    const mobileOverride = v2Styles['@mobile'];
    if (mobileOverride) Object.assign(base, mobileOverride);
  }

  return v2StylesToCSS(base, themeColors);
}

/**
 * Resolve named class styles merged with inline for frontend rendering.
 */
export function resolveV2ElementStyles(
  classes: string[] | undefined,
  inlineStyles: Record<string, any> | undefined,
  allStyles: Record<string, any>,
  viewport: 'desktop' | 'tablet' | 'mobile',
  themeColors?: Record<string, string>,
): React.CSSProperties {
  // Merge from classes
  let merged: Record<string, any> = {};

  if (classes) {
    for (const cls of classes) {
      const resolved = resolveNamedStyle(cls, allStyles);
      for (const [key, val] of Object.entries(resolved)) {
        merged[key] = val;
      }
    }
  }

  // Merge inline overrides
  if (inlineStyles) {
    for (const [key, val] of Object.entries(inlineStyles)) {
      // Handle @tablet/@mobile merging properly
      if (key === '@tablet' || key === '@mobile') {
        merged[key] = { ...(merged[key] || {}), ...val };
      } else {
        merged[key] = val;
      }
    }
  }

  return resolveV2ResponsiveStyles(merged, viewport, themeColors);
}

/**
 * Check if a v2 element is visible at the given viewport.
 */
export function isV2ElementVisible(
  visible: { desktop?: boolean; tablet?: boolean; mobile?: boolean } | undefined,
  viewport: 'desktop' | 'tablet' | 'mobile',
): boolean {
  if (!visible) return true; // visible on all if not specified
  return visible[viewport] !== false;
}
