// =====================================================
// VISUAL EDITOR – ELEMENT HELPERS
// Traversierung, Suche, Mutation von Element-Bäumen
// =====================================================

import type { VEElement, VEBody, VEPage, VEElementType, VEHeader, VEFooter, VECards } from '../types/elements';
import type { ElementStyles, StyleProperties } from '../types/styles';
import { createDefaultHeaderClassicConfig } from '../../types/Header';
import { createDefaultFooterMinimalConfig } from '../../types/Footer';
import type { CardTemplate } from '../types/cards';
import { BUILT_IN_CARD_TEMPLATES } from '../types/cards';

// ===== UUID =====

let _counter = 0;
export function generateId(): string {
  _counter++;
  return `ve-${Date.now().toString(36)}-${_counter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ===== FIND =====

/**
 * Sucht ein Element anhand seiner ID im gesamten Baum (rekursiv)
 */
export function findElementById(root: VEElement, id: string): VEElement | null {
  if (root.id === id) return root;
  const children = getChildren(root);
  for (const child of children) {
    const found = findElementById(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * Findet das Eltern-Element eines Elements
 */
export function findParent(root: VEElement, childId: string): VEElement | null {
  const children = getChildren(root);
  for (const child of children) {
    if (child.id === childId) return root;
    const found = findParent(child, childId);
    if (found) return found;
  }
  return null;
}

/**
 * Gibt den Breadcrumb-Pfad vom Root zum Element zurück
 */
export function getBreadcrumbPath(root: VEElement, targetId: string): VEElement[] {
  const path: VEElement[] = [];

  function walk(el: VEElement): boolean {
    path.push(el);
    if (el.id === targetId) return true;
    for (const child of getChildren(el)) {
      if (walk(child)) return true;
    }
    path.pop();
    return false;
  }

  walk(root);
  return path;
}

// ===== CHILDREN ACCESS =====

/**
 * Gibt die Kinder eines Elements zurück (leer wenn keine)
 */
export function getChildren(el: VEElement): VEElement[] {
  if ('children' in el && Array.isArray(el.children)) {
    return el.children;
  }
  return [];
}

/**
 * Prüft ob ein Element Kinder haben kann (Container-Typ)
 */
export function isContainer(type: VEElementType): boolean {
  return type === 'Body' || type === 'Section' || type === 'Container' || type === 'Cards';
}

/**
 * Prüft ob ein Element in einem bestimmten Eltern-Typ erlaubt ist
 */
export function canContain(parentType: VEElementType, childType: VEElementType): boolean {
  if (childType === 'Body') return false; // Body kann nie Kind sein

  const allowed: Record<string, VEElementType[]> = {
    Body: ['Section', 'Header', 'Footer', 'WebsiteBlock'],
    Section: ['Container', 'Text', 'Image', 'Button', 'Cards', 'ComponentInstance'],
    Container: ['Container', 'Text', 'Image', 'Button', 'Cards', 'ComponentInstance'],
    Cards: ['Container', 'Text', 'Image', 'Button'],
  };

  const list = allowed[parentType];
  return list ? list.includes(childType) : false;
}

// ===== TREE MUTATION (immutable – gibt neuen Baum zurück) =====

/**
 * Ersetzt ein Element im Baum (immutable)
 */
export function replaceElement(root: VEElement, id: string, newElement: VEElement): VEElement {
  if (root.id === id) return newElement;

  const children = getChildren(root);
  if (children.length === 0) return root;

  const newChildren = children.map(child => replaceElement(child, id, newElement));
  const changed = newChildren.some((c, i) => c !== children[i]);
  if (!changed) return root;

  return { ...root, children: newChildren } as VEElement;
}

/**
 * Fügt ein Kind-Element an einer bestimmten Position ein
 */
export function insertChild(
  root: VEElement,
  parentId: string,
  child: VEElement,
  index?: number
): VEElement {
  if (root.id === parentId) {
    const children = getChildren(root);
    const newChildren = [...children];
    if (index !== undefined && index >= 0 && index <= newChildren.length) {
      newChildren.splice(index, 0, child);
    } else {
      newChildren.push(child);
    }
    return { ...root, children: newChildren } as VEElement;
  }

  const children = getChildren(root);
  if (children.length === 0) return root;

  const newChildren = children.map(c => insertChild(c, parentId, child, index));
  const changed = newChildren.some((c, i) => c !== children[i]);
  if (!changed) return root;

  return { ...root, children: newChildren } as VEElement;
}

/**
 * Fügt ein Element nach einem bestimmten Geschwister-Element ein
 */
export function insertAfter(root: VEElement, afterId: string, newElement: VEElement): VEElement {
  const parent = findParent(root, afterId);
  if (!parent) return root;

  const children = getChildren(parent);
  const idx = children.findIndex(c => c.id === afterId);
  if (idx === -1) return root;

  return insertChild(root, parent.id, newElement, idx + 1);
}

/**
 * Entfernt ein Element aus dem Baum
 */
export function removeElement(root: VEElement, id: string): VEElement {
  // Body kann nicht entfernt werden
  if (root.id === id) return root;

  const children = getChildren(root);
  if (children.length === 0) return root;

  const filtered = children.filter(c => c.id !== id);
  if (filtered.length !== children.length) {
    return { ...root, children: filtered } as VEElement;
  }

  const newChildren = children.map(c => removeElement(c, id));
  const changed = newChildren.some((c, i) => c !== children[i]);
  if (!changed) return root;

  return { ...root, children: newChildren } as VEElement;
}

/**
 * Dupliziert ein Element (mit neuen IDs)
 */
export function duplicateElement(root: VEElement, id: string): VEElement {
  const parent = findParent(root, id);
  if (!parent) return root;

  const original = findElementById(root, id);
  if (!original) return root;

  const clone = deepCloneWithNewIds(original);
  return insertAfter(root, id, clone);
}

/**
 * Verschiebt ein Element an eine neue Position
 */
export function moveElement(
  root: VEElement,
  elementId: string,
  newParentId: string,
  newIndex?: number
): VEElement {
  const element = findElementById(root, elementId);
  if (!element) return root;

  // Erst entfernen, dann einfügen
  let tree = removeElement(root, elementId);
  tree = insertChild(tree, newParentId, element, newIndex);
  return tree;
}

// ===== STYLE UPDATE =====

/**
 * Aktualisiert Styles eines Elements (partial merge)
 */
export function updateElementStyles(
  root: VEElement,
  id: string,
  viewport: 'desktop' | 'tablet' | 'mobile',
  styleUpdates: Partial<StyleProperties>
): VEElement {
  const element = findElementById(root, id);
  if (!element) return root;

  const currentStyles: ElementStyles = element.styles || { desktop: {} };
  const currentViewport = currentStyles[viewport] || {};

  const newStyles: ElementStyles = {
    ...currentStyles,
    [viewport]: { ...currentViewport, ...styleUpdates },
  };

  return replaceElement(root, id, { ...element, styles: newStyles });
}

/**
 * Aktualisiert den Content eines Elements
 */
export function updateElementContent<T extends VEElement>(
  root: VEElement,
  id: string,
  contentUpdate: Partial<T>
): VEElement {
  const element = findElementById(root, id);
  if (!element) return root;

  return replaceElement(root, id, { ...element, ...contentUpdate });
}

// ===== DEEP CLONE =====

/**
 * Klont einen Element-Baum mit komplett neuen IDs
 */
export function deepCloneWithNewIds(el: VEElement): VEElement {
  const newId = generateId();
  const children = getChildren(el);

  if (children.length > 0) {
    const newChildren = children.map(c => deepCloneWithNewIds(c));
    return { ...el, id: newId, children: newChildren } as VEElement;
  }

  return { ...el, id: newId } as VEElement;
}

// ===== TRAVERSAL =====

/**
 * Führt eine Funktion für jedes Element im Baum aus
 */
export function walkTree(root: VEElement, fn: (el: VEElement, depth: number) => void, depth = 0): void {
  fn(root, depth);
  for (const child of getChildren(root)) {
    walkTree(child, fn, depth + 1);
  }
}

/**
 * Sammelt alle Element-IDs im Baum
 */
export function collectAllIds(root: VEElement): string[] {
  const ids: string[] = [];
  walkTree(root, el => ids.push(el.id));
  return ids;
}

/**
 * Zählt die Gesamtzahl der Elemente im Baum
 */
export function countElements(root: VEElement): number {
  let count = 0;
  walkTree(root, () => count++);
  return count;
}

// ===== FACTORY HELPERS =====

/**
 * Erstellt eine leere Section
 */
export function createSection(label?: string): VEElement {
  return {
    id: generateId(),
    type: 'Section',
    label: label || 'Section',
    styles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: { value: 80, unit: 'px' },
        paddingBottom: { value: 80, unit: 'px' },
        paddingLeft: { value: 24, unit: 'px' },
        paddingRight: { value: 24, unit: 'px' },
      },
    },
    children: [],
  } as VEElement;
}

/**
 * Erstellt einen leeren Container
 */
export function createContainer(label?: string): VEElement {
  return {
    id: generateId(),
    type: 'Container',
    label: label || 'Container',
    styles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: { value: 1200, unit: 'px' },
        width: { value: 100, unit: '%' },
      },
    },
    children: [],
  } as VEElement;
}

/**
 * Erstellt ein Text-Element
 */
export function createText(
  content = 'Neuer Text',
  textStyle: import('../types/elements').TextStylePreset = 'body'
): VEElement {
  return {
    id: generateId(),
    type: 'Text',
    label: textStyle === 'body' ? 'Text' : textStyle.toUpperCase(),
    content,
    textStyle,
    styles: { desktop: {} },
  } as VEElement;
}

/**
 * Erstellt ein Image-Element
 */
export function createImage(src = '', alt = 'Bild'): VEElement {
  return {
    id: generateId(),
    type: 'Image',
    label: 'Bild',
    content: { src, alt },
    styles: {
      desktop: {
        width: { value: 100, unit: '%' },
        height: 'auto' as any,
        objectFit: 'cover',
      },
    },
  } as VEElement;
}

/**
 * Erstellt ein Button-Element
 */
export function createButton(text = 'Button', link = '#'): VEElement {
  return {
    id: generateId(),
    type: 'Button',
    label: text,
    content: { text, link, openInNewTab: false },
    styles: {
      desktop: {
        paddingTop: { value: 12, unit: 'px' },
        paddingBottom: { value: 12, unit: 'px' },
        paddingLeft: { value: 24, unit: 'px' },
        paddingRight: { value: 24, unit: 'px' },
        borderRadius: { value: 6, unit: 'px' },
        fontSize: { value: 16, unit: 'px' },
        fontWeight: 600,
        cursor: 'pointer',
      },
    },
  } as VEElement;
}

/**
 * Erstellt eine leere VEPage
 */
export function createPage(name: string, route: string): VEPage {
  return {
    id: generateId(),
    name,
    route,
    isVisualEditor: true,
    body: {
      id: generateId(),
      type: 'Body',
      label: 'Body',
      styles: { desktop: {} },
      children: [],
    } as VEBody,
  };
}

/**
 * Erstellt ein Header-Element mit Default-Konfiguration
 */
export function createHeader(label?: string): VEElement {
  return {
    id: generateId(),
    type: 'Header',
    label: label || 'Header',
    styles: { desktop: {} },
    config: createDefaultHeaderClassicConfig(),
  } as VEHeader;
}

/**
 * Erstellt ein Footer-Element mit Default-Konfiguration
 */
export function createFooter(label?: string): VEElement {
  return {
    id: generateId(),
    type: 'Footer',
    label: label || 'Footer',
    styles: { desktop: {} },
    config: createDefaultFooterMinimalConfig(),
  } as VEFooter;
}

// ===== CARDS HELPERS =====

/**
 * Erstellt eine einzelne Karte (VEContainer) anhand eines Templates.
 * Jede Karte ist ein generischer Container mit echten VEText/VEImage/VEButton-Kindern.
 */
export function createCardFromTemplate(template: CardTemplate): VEElement {
  const children: VEElement[] = template.elements.map(tplEl => {
    switch (tplEl.type) {
      case 'CardImage':
        return {
          id: generateId(),
          type: 'Image',
          label: tplEl.label,
          content: tplEl.defaultContent || { src: '', alt: tplEl.label },
          styles: tplEl.styles || {
            desktop: {
              width: { value: 100, unit: 'px' as const },
              objectFit: 'cover',
            },
          },
        } as VEElement;

      case 'CardText':
        return {
          id: generateId(),
          type: 'Text',
          label: tplEl.label,
          content: tplEl.defaultContent || tplEl.label,
          textStyle: (tplEl.textStyle || 'body') as import('../types/elements').TextStylePreset,
          styles: tplEl.styles || { desktop: {} },
        } as VEElement;

      case 'CardButton':
        return {
          id: generateId(),
          type: 'Button',
          label: tplEl.label,
          content: tplEl.defaultContent || { text: 'Button', link: '#' },
          styles: tplEl.styles || {
            desktop: {
              paddingTop: { value: 8, unit: 'px' },
              paddingBottom: { value: 8, unit: 'px' },
              paddingLeft: { value: 20, unit: 'px' },
              paddingRight: { value: 20, unit: 'px' },
              borderRadius: { value: 6, unit: 'px' },
              fontSize: { value: 13, unit: 'px' },
              fontWeight: 600,
            },
          },
        } as VEElement;

      case 'CardBadge':
        return {
          id: generateId(),
          type: 'Text',
          label: tplEl.label,
          content: typeof tplEl.defaultContent === 'object' ? tplEl.defaultContent?.text || 'Badge' : tplEl.defaultContent || 'Badge',
          textStyle: 'label' as import('../types/elements').TextStylePreset,
          styles: tplEl.styles || {
            desktop: {
              fontSize: { value: 11, unit: 'px' },
              fontWeight: 600,
            },
          },
        } as VEElement;

      case 'CardRating':
        // Render rating as text (e.g. "★★★★★")
        const ratingValue = tplEl.defaultContent?.value ?? 5;
        const maxStars = tplEl.defaultContent?.maxStars ?? 5;
        const stars = '★'.repeat(ratingValue) + '☆'.repeat(maxStars - ratingValue);
        return {
          id: generateId(),
          type: 'Text',
          label: tplEl.label,
          content: stars,
          textStyle: 'body' as import('../types/elements').TextStylePreset,
          styles: tplEl.styles || {
            desktop: {
              fontSize: { value: 18, unit: 'px' },
              color: { kind: 'custom', hex: '#f59e0b' },
            },
          },
        } as VEElement;

      case 'CardIcon':
        return {
          id: generateId(),
          type: 'Text',
          label: tplEl.label,
          content: tplEl.defaultContent?.icon || '⭐',
          textStyle: 'body' as import('../types/elements').TextStylePreset,
          styles: tplEl.styles || {
            desktop: {
              fontSize: { value: 24, unit: 'px' },
            },
          },
        } as VEElement;

      default:
        return {
          id: generateId(),
          type: 'Text',
          label: tplEl.label,
          content: tplEl.defaultContent || tplEl.label,
          textStyle: 'body' as import('../types/elements').TextStylePreset,
          styles: { desktop: {} },
        } as VEElement;
    }
  });

  // Return a Container representing one card
  return {
    id: generateId(),
    type: 'Container',
    label: 'Karte',
    children,
    styles: template.cardStyles || {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: { kind: 'custom', hex: '#ffffff' },
        borderRadius: { value: 8, unit: 'px' },
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      },
    },
  } as VEElement;
}

/**
 * Erstellt ein Cards-Element mit Template und Beispielkarten.
 * Jede Karte ist ein VEContainer mit echten VEElement-Kindern.
 */
export function createCards(templateId?: string, initialCardCount = 3): VEElement {
  const template = BUILT_IN_CARD_TEMPLATES.find(t => t.id === templateId)
    ?? BUILT_IN_CARD_TEMPLATES[0];

  const cardContainers: VEElement[] = [];
  for (let i = 0; i < initialCardCount; i++) {
    cardContainers.push(createCardFromTemplate(template));
  }

  return {
    id: generateId(),
    type: 'Cards',
    label: template.name || 'Cards',
    templateId: template.id,
    layout: {
      desktop: { columns: 3, gap: { value: 24, unit: 'px' } },
      tablet: { columns: 2, gap: { value: 16, unit: 'px' } },
      mobile: { columns: 1, gap: { value: 16, unit: 'px' } },
    },
    children: cardContainers,
    styles: {
      desktop: {
        width: { value: 100, unit: '%' },
      },
    },
  } as VECards;
}
