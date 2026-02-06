# Template Selection Feature - Implementation Summary

## ✅ Completed Implementation

This document summarizes the implementation of the card template selection feature based on the concept in `card-template-selection-concept.md`.

---

## Overview

The template selection feature allows admins to:
- Choose from predefined card templates when adding a Generic Card block
- Start with a template or from scratch
- See which template a card is based on
- Track if a card has been customized
- Reset customized cards back to their original template

---

## Files Modified/Created

### 1. **CardTemplateSelectionDialog.tsx** (NEW)
**Location:** `src/components/admin/CardTemplateSelectionDialog.tsx`

**Purpose:** Modal dialog for selecting card templates

**Features:**
- Loads active templates from `card_templates` table
- Search functionality across template name and description
- Category filter dropdown (11 categories)
- Grid layout with live preview cards (scaled 0.8, single card mode)
- Template metadata display (name, description, category badge)
- "Auswählen" button on each template card
- "Ohne Vorlage starten" option
- "Abbrechen" button
- Responsive grid (1/2/3 columns)

**Props:**
```typescript
interface CardTemplateSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: CardTemplate | null) => void;
}
```

**Exports:**
```typescript
export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  config: GenericCardConfig;
  category: string;
  is_active: boolean;
}
```

---

### 2. **WebsiteContext.tsx** (MODIFIED)
**Location:** `src/contexts/WebsiteContext.tsx`

**Changes:** Extended `Block` interface with template metadata

```typescript
export interface Block {
  id: string;
  type: string;
  position: number;
  config: Record<string, any>;
  content: Record<string, any>;
  created_at?: string;
  // Template reference (for generic-card blocks)
  templateId?: string;
  templateName?: string;
  templateCategory?: string;
  customized?: boolean;
}
```

**Fields:**
- `templateId`: Database ID of the template
- `templateName`: Display name of the template
- `templateCategory`: Category (service, product, team, etc.)
- `customized`: `false` = unchanged template, `true` = user made changes

---

### 3. **BlockManagerNew.tsx** (MODIFIED)
**Location:** `src/components/admin/BlockManagerNew.tsx`

**Changes:** Integrated template selection dialog into block creation flow

**New Imports:**
```typescript
import { CardTemplateSelectionDialog } from './CardTemplateSelectionDialog';
import type { CardTemplate } from './CardTemplateSelectionDialog';
```

**New State:**
```typescript
const [showTemplateDialog, setShowTemplateDialog] = useState(false);
```

**Modified `handleAddBlock`:**
- Detects when `generic-card` block is being added
- Shows template selection dialog instead of immediately creating block
- Other block types work as before

**New `handleTemplateSelect` Handler:**
```typescript
const handleTemplateSelect = async (template: CardTemplate | null) => {
  // Creates new block with:
  // - template.config if template selected
  // - empty config if null (no template)
  // - template metadata fields
  // - customized flag (false for template, true for no template)
  
  // Success message includes template name if applicable
}
```

**Dialog Rendering:**
```tsx
<CardTemplateSelectionDialog
  isOpen={showTemplateDialog}
  onClose={() => {
    setShowTemplateDialog(false);
    setSelectedBlockType('');
  }}
  onSelect={handleTemplateSelect}
/>
```

---

### 4. **GenericCardEditorPage.tsx** (MODIFIED)
**Location:** `src/components/admin/GenericCardEditorPage.tsx`

**Changes:** Added template info banner and reset functionality

**New Imports:**
```typescript
import { Info, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
```

**New State:**
```typescript
const [templateInfo, setTemplateInfo] = useState<{
  id: string;
  name: string;
  category: string;
} | null>(null);
const [customized, setCustomized] = useState(false);
const [resetting, setResetting] = useState(false);
```

**Enhanced Config Loading:**
- Loads template metadata from block
- Sets `templateInfo` if `templateId` and `templateName` exist
- Sets `customized` flag based on block data

**New `handleResetToTemplate` Function:**
- Shows confirmation dialog
- Fetches template from database by `templateId`
- Replaces block config with template config
- Sets `customized` flag to `false`
- Resets local state

**Modified `handleSave` Function:**
- Marks block as `customized: true` if template exists and changes are saved
- Updates local `customized` state after successful save

**Template Info Banner (UI):**
Located below header, above editor panels

**Two States:**

1. **Unchanged Template** (Blue):
   - Shows: "Basiert auf Vorlage"
   - Displays: Template name + category
   - Message: Card uses template without changes
   - No reset button

2. **Customized Template** (Amber/Yellow):
   - Shows: "Angepasste Karte"
   - Displays: Template name + category
   - Message: Card was modified, can reset
   - Button: "Zur Vorlage zurücksetzen" with spinner when resetting

**Banner Code Structure:**
```tsx
{templateInfo && (
  <div className={customized ? 'amber colors' : 'blue colors'}>
    <Info icon />
    <div>
      <span>{customized ? 'Angepasste Karte' : 'Basiert auf Vorlage'}</span>
      <span>{templateInfo.name}</span>
      <span>({templateInfo.category})</span>
      <p>{contextual message}</p>
    </div>
    {customized && (
      <button onClick={handleResetToTemplate}>
        Zur Vorlage zurücksetzen
      </button>
    )}
  </div>
)}
```

---

## Workflow

### Adding a New Generic Card Block

1. User navigates to page block manager
2. Clicks "Baustein hinzufügen"
3. Selects "Flexible Karten" (generic-card)
4. **Template selection dialog opens**
5. User can:
   - Search templates
   - Filter by category
   - Preview templates (scaled GenericCard component)
   - Click "Auswählen" on a template
   - Click "Ohne Vorlage starten" (null template)
   - Click "Abbrechen" to cancel
6. Block is created with:
   - Template config + metadata (if template selected)
   - Empty config + `customized: true` (if no template)
7. User is redirected to editor

---

### Editing a Template-Based Card

#### Scenario A: Card Not Modified Yet
- **Banner:** Blue, "Basiert auf Vorlage"
- **Message:** Using template without changes
- **Action:** User makes edits and saves
- **Result:** `customized` flag set to `true`, banner turns amber

#### Scenario B: Card Already Modified
- **Banner:** Amber, "Angepasste Karte"
- **Message:** Card was modified, can reset
- **Button:** "Zur Vorlage zurücksetzen" visible
- **Action:** User clicks reset button
- **Confirmation:** "Möchten Sie alle Änderungen verwerfen..."
- **Result:** 
  - Template config fetched from database
  - Block config replaced with template config
  - `customized` flag set to `false`
  - Banner turns blue

#### Scenario C: Card Without Template
- **Banner:** Not displayed
- **No Template Info:** Block created from scratch

---

## Data Flow

### Template Selection
```
User clicks "Flexible Karten"
  ↓
BlockManagerNew detects type === 'generic-card'
  ↓
Shows CardTemplateSelectionDialog
  ↓
User selects template OR clicks "Ohne Vorlage"
  ↓
handleTemplateSelect(template | null) called
  ↓
Creates block with:
  - config: template?.config || {}
  - templateId: template?.id
  - templateName: template?.name
  - templateCategory: template?.category
  - customized: template ? false : true
  ↓
Block added to page, updatePages() called
```

### Edit & Save
```
GenericCardEditorPage loads
  ↓
Reads block.templateId, block.templateName, block.customized
  ↓
Sets templateInfo state (if available)
Sets customized state
  ↓
User makes changes to config
  ↓
User clicks "Speichern"
  ↓
handleSave() updates:
  - block.config (new config)
  - block.customized = true (if templateInfo exists)
  ↓
Banner turns amber (if was blue)
```

### Reset to Template
```
User clicks "Zur Vorlage zurücksetzen"
  ↓
Confirmation dialog
  ↓
handleResetToTemplate() fetches template from database
  ↓
Replaces block.config with template.config
Sets block.customized = false
  ↓
updatePages() called
  ↓
Local state updated: customized = false
Banner turns blue
```

---

## Database Integration

### Tables Used

#### `card_templates`
- **Select:** Load templates in dialog (filtered by `is_active = true`)
- **Select:** Fetch specific template by `id` for reset functionality
- **Columns Used:**
  - `id`: Primary key, stored in `Block.templateId`
  - `name`: Display name, stored in `Block.templateName`
  - `category`: Category, stored in `Block.templateCategory`
  - `config`: JSONB GenericCardConfig, copied to `Block.config`
  - `description`: Shown in selection dialog
  - `is_active`: Filter condition

#### `websites.content.pages[].blocks[]` (JSONB)
- **Primary storage** for block data (JSON is source of truth)
- **Block fields:**
  - `id`, `type`, `position`, `config`, `content` (existing)
  - `templateId`, `templateName`, `templateCategory`, `customized` (new)

---

## Categories

All 11 categories supported:
1. `general` - Allgemein (gray)
2. `service` - Services (blue)
3. `product` - Produkte (green)
4. `team` - Team (purple)
5. `business` - Business (orange)
6. `testimonial` - Bewertungen (yellow)
7. `portfolio` - Portfolio (indigo)
8. `pricing` - Preise (rose)
9. `feature` - Features (teal)
10. `offer` - Angebote (red)
11. (General fallback)

Color mapping implemented in `getCategoryColor()` in CardTemplateSelectionDialog.tsx

---

## UI/UX Details

### CardTemplateSelectionDialog
- **Modal:** Full-screen overlay with centered dialog
- **Max Width:** 7xl (1280px)
- **Max Height:** 90vh
- **Header:**
  - Title: "Kartenvorlage auswählen"
  - Close button (X icon)
- **Filters:**
  - Search input (left): "Vorlagen durchsuchen..."
  - Category dropdown (right): "Alle Kategorien", "Services", etc.
- **Grid:**
  - Responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
  - Gap: 6 (1.5rem)
  - Overflow: Scrollable content area
- **Template Card:**
  - Border: 2px gray-200
  - Hover: Shadow + gray-50 background
  - Preview: GenericCard scaled 0.8, single card mode
  - Name: font-semibold, gray-900
  - Description: text-sm, gray-600, 2-line clamp
  - Category Badge: rounded pill, category color
  - Button: "Auswählen", full-width, rose-500
- **Footer:**
  - "Ohne Vorlage starten" button (left)
  - Template count (center)
  - "Abbrechen" button (right)

### GenericCardEditorPage Banner
- **Position:** Below header, above editor panels
- **Margin:** mb-4 (1rem)
- **Padding:** p-4 (1rem)
- **Border:** 2px, rounded-lg
- **Icon:** Info (5x5), aligned top, margin-top 0.5
- **Colors:**
  - Unchanged: bg-blue-50, border-blue-300, text-blue-900/700
  - Customized: bg-amber-50, border-amber-300, text-amber-900/700
- **Content:**
  - Status label (bold)
  - Template name badge (colored pill)
  - Category label (gray-500, smaller)
  - Description paragraph
- **Button (customized only):**
  - bg-amber-600, text-white
  - Icon: RefreshCw (3.5x3.5)
  - Text: "Zur Vorlage zurücksetzen"
  - Loading state: spinner + "Zurücksetzen..."

---

## Testing Checklist

### Template Selection
- [ ] Dialog opens when adding generic-card block
- [ ] All active templates load and display
- [ ] Search filters templates by name and description
- [ ] Category filter works correctly
- [ ] Template preview renders correctly (scaled 0.8)
- [ ] "Auswählen" button creates block with template config
- [ ] "Ohne Vorlage starten" creates block without template
- [ ] "Abbrechen" closes dialog without creating block
- [ ] Block receives all template metadata fields

### Template Info Display
- [ ] Banner shows for template-based cards
- [ ] Banner hidden for non-template cards
- [ ] Blue banner for unchanged template (customized = false)
- [ ] Amber banner for modified template (customized = true)
- [ ] Template name and category display correctly
- [ ] Reset button only shows for customized cards

### Editing & Saving
- [ ] Making changes keeps banner blue until save
- [ ] Saving changes turns banner amber
- [ ] customized flag set to true after first save
- [ ] Subsequent saves keep banner amber

### Reset Functionality
- [ ] Reset button shows confirmation dialog
- [ ] Canceling confirmation keeps current config
- [ ] Confirming reset fetches template from database
- [ ] Config replaced with template config
- [ ] customized flag set to false
- [ ] Banner turns blue after reset
- [ ] Success message displays

### Edge Cases
- [ ] Blocks created before feature (no templateId) work correctly
- [ ] Invalid templateId (deleted template) handled gracefully
- [ ] Database errors during reset handled with user feedback
- [ ] Multiple template-based blocks on same page work independently

---

## Future Enhancements (Not Implemented)

Based on concept document, potential future additions:

1. **Template Version Tracking**
   - Add `templateVersion` field to blocks
   - Show "Template has been updated" notification
   - Allow updating to latest template version

2. **Template Comparison**
   - Show diff between current config and template config
   - Highlight customized fields in editor

3. **Template Categories Enhancement**
   - Add custom categories (superadmin)
   - Category icons and colors in database

4. **Template Preview Enhancements**
   - Multiple preview styles (list view)
   - Larger preview modal on click
   - Favorite templates

5. **Block Cloning**
   - "Save as Template" button for customized cards
   - Create new template from existing block

---

## Migration Notes

**No database migration required** - All changes are additive:
- New optional fields added to Block interface
- Existing blocks without template fields work as before
- JSON structure remains backward compatible

**Recommended actions:**
- Test with existing websites
- Verify existing generic-card blocks still load correctly
- Confirm blocks without templateId show no banner

---

## Conclusion

All 5 tasks from the concept document have been successfully implemented:

1. ✅ CardTemplateSelectionDialog component created
2. ✅ Block interface extended with template fields
3. ✅ Template selection integrated into block creation flow
4. ✅ Template info banner added to GenericCardEditorPage
5. ✅ Reset to template functionality implemented

The feature is fully functional and ready for testing.
