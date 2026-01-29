# Building Block Background Color Feature

## Overview
This feature allows administrators to set a custom background color for each building block instance directly from the editor interface.

## Implementation Details

### 1. Database Structure
- **Table**: `page_blocks`
- **Field**: `config` (JSONB)
- **Storage**: `{ "backgroundColor": "#FFFFFF" }`

The background color is stored in the existing `config` JSON field of the `page_blocks` table. No schema migration is required.

### 2. Component Structure

#### BackgroundColorPicker.tsx
Located at: `src/components/admin/BackgroundColorPicker.tsx`

**Features:**
- Visual color swatch button in top-right corner
- Dropdown color picker with:
  - Quick color presets (White, Gray, Black, etc.)
  - Theme palette colors (all primary colors + accents)
  - Custom color picker (hex input + color wheel)
  - Transparent/Clear option

**Props:**
```typescript
interface BackgroundColorPickerProps {
  value: string;           // Current color value
  onChange: (color: string) => void;  // Callback when color changes
  className?: string;      // Optional CSS classes
}
```

### 3. Integration Steps

For each building block editor, follow these steps:

#### Step 1: Import the Component
```typescript
import { BackgroundColorPicker } from './BackgroundColorPicker';
```

#### Step 2: Load Background Color from Config
```typescript
const [backgroundColor, setBackgroundColor] = useState<string>('');

// In your loadData/loadConfig function:
const loadBlockConfig = async () => {
  const { data, error } = await supabase
    .from('page_blocks')
    .select('config')
    .eq('page_id', pageId)
    .eq('block_type', 'your-block-type')
    .eq('block_instance_id', instanceId)
    .single();

  if (data?.config?.backgroundColor) {
    setBackgroundColor(data.config.backgroundColor);
  }
};
```

#### Step 3: Save Background Color
```typescript
const saveBackgroundColor = async (color: string) => {
  try {
    setBackgroundColor(color);
    
    const { error } = await supabase
      .from('page_blocks')
      .update({
        config: { backgroundColor: color },
        updated_at: new Date().toISOString()
      })
      .eq('page_id', pageId)
      .eq('block_type', 'your-block-type')
      .eq('block_instance_id', instanceId);

    if (error) throw error;
    
    setMessage('Hintergrundfarbe gespeichert!');
  } catch (error) {
    console.error('Error saving background color:', error);
    setMessage('Fehler beim Speichern!');
  }
};
```

#### Step 4: Add UI to Editor
Place this in the top-right corner of your editor layout:

```typescript
<div className="mb-6 flex justify-between items-center">
  {/* Left side - Back button */}
  <button
    onClick={() => navigate('/admin')}
    className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
  >
    <ArrowLeft className="w-4 h-4" />
    Zurück zum Dashboard
  </button>

  {/* Right side - Background Color Picker */}
  <BackgroundColorPicker
    value={backgroundColor}
    onChange={saveBackgroundColor}
  />
</div>
```

### 4. Frontend Rendering

In your frontend component (e.g., `Services.tsx`, `About.tsx`), apply the background color:

```typescript
const [backgroundColor, setBackgroundColor] = useState<string>('');

useEffect(() => {
  const loadConfig = async () => {
    const { data } = await supabase
      .from('page_blocks')
      .select('config')
      .eq('block_type', 'services')
      .eq('block_instance_id', instanceId)
      .single();

    if (data?.config?.backgroundColor) {
      setBackgroundColor(data.config.backgroundColor);
    }
  };
  
  loadConfig();
}, [instanceId]);

return (
  <section 
    id="services" 
    className="py-16"
    style={{ backgroundColor: backgroundColor || 'transparent' }}
  >
    {/* Your component content */}
  </section>
);
```

### 5. Example Integration - ServicesEditor

See the complete example below for integrating into `ServicesEditor.tsx`:

**Key changes:**
1. Add state for backgroundColor
2. Load backgroundColor from page_blocks.config on component mount
3. Add BackgroundColorPicker in header (top-right)
4. Save backgroundColor when changed

### 6. Block Types to Update

Apply this feature to all block editors:
- [ ] ServicesEditor
- [ ] AboutEditor
- [ ] GalleryEditor
- [ ] ReviewsEditor
- [ ] PricingEditor
- [ ] ContactEditor
- [ ] HoursEditor
- [ ] StaticContentEditor
- [ ] GridEditor
- [ ] Hero (via GeneralEditor)

### 7. Alternate Approaches

#### Option A: Per-Editor Setting (Current)
Each editor independently loads and saves its background color from `page_blocks.config`.

**Pros:**
- Simple implementation
- No additional API calls
- Direct control in each editor

**Cons:**
- Requires updating each editor individually
- Duplicated logic across editors

#### Option B: Centralized BlockSettings Component
Create a reusable settings panel that handles common block configurations:

```typescript
<BlockSettingsPanel
  pageId={pageId}
  blockType="services"
  instanceId={instanceId}
  onBackgroundColorChange={(color) => /* refresh preview */}
/>
```

**Pros:**
- Reusable across all editors
- Consistent UI/UX
- Easier to add more settings later (padding, margins, etc.)

**Cons:**
- More complex initial setup
- Requires refactoring existing editors

### 8. Future Enhancements

Consider adding these settings in the future:
- **Padding Control**: Top/Bottom padding for the section
- **Margin Control**: Spacing between blocks
- **Text Color Override**: Custom text color for the block
- **Background Image**: Upload/select background image
- **Background Gradient**: Multi-color gradient backgrounds
- **Opacity Control**: Transparency level
- **Dark Mode Toggle**: Separate colors for dark mode

## Testing Checklist

- [ ] Background color picker opens/closes correctly
- [ ] Quick colors apply immediately
- [ ] Theme palette colors are visible and selectable
- [ ] Custom color picker works (hex input + color wheel)
- [ ] Clear/Transparent option removes background
- [ ] Background color persists after page reload
- [ ] Background color displays correctly on frontend
- [ ] Multiple instances of same block can have different colors
- [ ] Works with all block types
