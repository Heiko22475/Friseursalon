// =====================================================
// VISUAL EDITOR – MODULE INDEX
// Haupt-Einstiegspunkt für den Visual Editor
// =====================================================

// Types
export type {
  StyleProperties,
  SizeValue,
  SizeValueOrAuto,
  ElementStyles,
  VEViewport,
} from './types/styles';

export type {
  VEElementType,
  VEElement,
  VEBody,
  VESection,
  VEContainer,
  VEText,
  VEImage,
  VEButton,
  VECards,
  VENavbar,
  NavbarStickyMode,
  VEComponentInstance,
  VEWebsiteBlock,
  VEPage,
  VEComponent,
  TextStylePreset,
} from './types/elements';

// Utils
export {
  sv,
  sizeValueToCSS,
  parseSizeValue,
  isSizeValueSet,
} from './utils/sizeValue';

export {
  resolveStyles,
  mergeStyles,
  stylesToCSS,
} from './utils/styleResolver';

export {
  generateId,
  findElementById,
  findParent,
  getBreadcrumbPath,
  getChildren,
  isContainer,
  canContain,
  insertChild,
  insertAfter,
  removeElement,
  duplicateElement,
  moveElement,
  updateElementStyles,
  updateElementContent,
  deepCloneWithNewIds,
  walkTree,
  collectAllIds,
  countElements,
  createSection,
  createContainer,
  createText,
  createImage,
  createButton,
  createNavbar,
  createPage,
} from './utils/elementHelpers';

// State
export { EditorProvider, useEditor, useEditorKeyboard } from './state/EditorContext';

// Page Component
export { default as VisualEditorPage } from './VisualEditorPage';
