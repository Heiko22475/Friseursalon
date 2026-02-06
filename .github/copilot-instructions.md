# BeautifulCMS - Copilot Instructions

## Project Overview

**BeautifulCMS** (also known as "Beautiful") is a SaaS CMS application designed specifically for beauty salons, hair salons, and similar businesses. It allows multiple customers to manage their own websites through a centralized platform.

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Styling: TailwindCSS
- Backend: Supabase (PostgreSQL)
- Deployment: Vercel (planned)
- Routing: React Router
- Rich Text: TipTap

**Domain Structure:**
- Each customer has their own domain pointing to this app
- The app routes to the correct website based on the domain
- Admins access via `/admin` route
- Superadmin access via `/superadmin` route

---

## Architecture

### User Roles
1. **Superadmin**: Manages all customer websites, templates, stock photos, FAQ content
2. **Admin/Customer**: Manages their own website content (each customer = 1 website)
3. **End Users**: Visit the customer websites

### Data Storage
- **Primary Source**: JSON stored in `websites.content` (JSONB column)
- **Database Tables**: Used for media tracking, templates, and reference data
- **Important**: JSON is the source of truth; database should be consistent with JSON

### Page Structure
Websites consist of:
- **Pages**: Multiple pages with routes (e.g., `/`, `/services`, `/contact`)
- **Blocks**: Building blocks that make up pages (Hero, Cards, Gallery, etc.)
- **Headers & Footers**: Selectable variants per page

---

## Key Features

### 1. Block System
Pages are built from modular blocks:
- **Hero Block**: Full-width background images with positioned text/buttons/logos
- **Generic Cards**: Flexible card system with templates
- **Gallery**: Image galleries synced with media library
- **Static Text**: Simple text content
- **Grid Container**: 2-4 column layouts containing other blocks

### 2. Generic Card System
Highly configurable card component supporting:
- **Multiple Layouts**: Grid, list, horizontal, vertical, overlay
- **Card Variants**: Vertical, horizontal, minimal, overlay
- **Responsive**: Viewport-specific column counts (desktop/tablet/mobile)
- **Styling**: Icons, images, overlines, titles, subtitles, descriptions, prices, ratings, buttons
- **Templates**: Superadmin can create card templates for customers
- **Live Editing**: Inline text editing for authenticated users (EditableText component)

**Template Management**: 
- Stored in `card_templates` table
- Preview system with 3-column grid
- Category-based organization (general, service, product, team, business)

### 3. Media Management
- **User Media**: Customer-specific images organized in folders
- **Stock Photos**: Superadmin-managed, shared across all customers
- **DSGVO Compliant**: Locally hosted fonts
- **Media Library Component**: Grid/list view, folder management, move/delete operations

### 4. Theming System
- **3-Color System**: Primary, secondary, accent colors
- **Typography**: Font selection with viewport-specific sizes
- **Predefined Presets**: Superadmin creates theme presets
- **User Themes**: Stored in website JSON (not database)

### 5. Inline Editing
- **EditableText Component**: Portal-based inline editor
- **WYSIWYG**: TipTap integration for rich text
- **Edit Mode Toggle**: Floating button (bottom-right) for admins
- **Block-Level Editing**: Update specific fields within blocks

---

## Database Schema

### Core Tables
```
websites
├── id (uuid, PK)
├── customer_id (text, unique)
├── domain (text)
├── content (jsonb) ← Main data storage
└── created_at (timestamp)

user_media
├── id (uuid, PK)
├── customer_id (text)
├── url (text)
├── folder (text)
├── media_type (text)
└── metadata (jsonb)

stock_photos
├── id (uuid, PK)
├── url (text)
├── category (text: 'gallery', 'hero', 'team', 'service')
├── tags (text[])
└── created_at (timestamp)

card_templates
├── id (uuid, PK)
├── name (text)
├── description (text)
├── config (jsonb) ← GenericCardConfig
├── category (text)
├── is_active (boolean)
└── created_at (timestamp)
```

---

## File Structure

```
src/
├── components/
│   ├── blocks/           # Page building blocks
│   │   ├── GenericCard.tsx    # Main card component
│   │   ├── Hero.tsx           # Hero section (deprecated V1)
│   │   └── HeroV2.tsx         # New hero with positioning
│   ├── admin/            # Admin UI components
│   │   ├── EditableText.tsx       # Inline editor with portal
│   │   ├── CardConfigEditor.tsx   # Card configuration UI
│   │   ├── MediaLibrary.tsx       # Media management
│   │   ├── ThemeEditor.tsx        # Theme customization
│   │   └── FontPickerWithSize.tsx # Font selector with responsive sizes
│   └── superadmin/       # Superadmin components
├── pages/
│   ├── admin/            # Customer admin pages
│   │   └── GenericCardEditorPage.tsx
│   └── superadmin/       # Superadmin pages
│       ├── CardTemplatesPage.tsx
│       └── CardTemplateEditorPage.tsx
├── types/
│   ├── GenericCard.ts    # Card type definitions
│   ├── Cards.ts          # Shared card utilities
│   ├── theme.ts          # Theme types
│   └── typography.ts     # Typography types
├── data/
│   └── fonts.ts          # Font library (Inter, Poppins, etc.)
├── hooks/
│   └── useViewport.ts    # Responsive viewport detection
├── contexts/
│   ├── WebsiteContext.tsx    # Website data management
│   └── EditModeContext.tsx   # Edit mode state
└── lib/
    ├── supabase.ts       # Supabase client
    └── mediaSync.ts      # Media synchronization functions
```

---

## Important Patterns

### 1. Color Values
Colors use `ColorValue` type supporting:
- **Token Reference**: `{ kind: 'tokenRef', ref: 'semantic.buttonPrimaryBg' }`
- **Custom Hex**: `{ kind: 'custom', hex: '#FF0000' }`
- **No Color**: `null` or `undefined`

Components: `ThemeColorPicker` for color selection with theme integration

### 2. Responsive Values
Many properties support viewport-specific values:
```typescript
interface ResponsiveValue<T> {
  desktop?: T;
  tablet?: T;
  mobile?: T;
}
```

Use `getResponsiveValue(value, viewport)` to resolve based on current viewport.

### 3. Font System
- **Font IDs**: lowercase-with-dashes (e.g., `'inter'`, `'open-sans'`)
- **Font Names**: Proper case (e.g., `'Inter'`, `'Open Sans'`)
- **Helper**: `getFontById(id)` returns `FontFamily` with name and fallback
- **Conversion**: Use `getFontName(fontId)` to get CSS font-family string

### 4. Viewport Override
For preview modes, use `ViewportProvider`:
```tsx
<ViewportProvider value="mobile">
  <GenericCard config={config} />
</ViewportProvider>
```

### 5. Block Editing
When blocks support inline editing:
- Pass `blockId` prop to components
- Use `EditableText` for editable fields
- EditableText uses `createPortal` to render outside DOM hierarchy
- Updates save to `websites.content.pages[].blocks[]`

---

## Current Implementation Status

### ✅ Completed Features
- Block-based page builder
- Generic card system with templates
- Inline editing with WYSIWYG
- Media library with folders
- Theme editor with presets
- Card template management (superadmin)
- Responsive preview modal
- Icon styling (size, color, background, alignment)
- Font system with viewport-specific sizes
- Stock photo management

### 🚧 Planned Features
- Media picker as popup (createPortal)
- FAQ system (admin + superadmin)
- Contact form with spam protection
- Google Analytics integration
- Consent management
- SEO tools and sitemap generation
- Accessibility features
- Multi-language support

### ⚠️ Known Issues
- Some header components missing (HeaderClassic, HeaderCentered, etc.)
- CardTemplateEditorPage import error in App.tsx

---

## Development Guidelines

### When Adding New Features
1. **Types First**: Define TypeScript interfaces in `src/types/`
2. **Default Factories**: Create `createDefault*()` functions for new configs
3. **Responsive**: Consider desktop/tablet/mobile from the start
4. **Edit Mode**: Support inline editing where text is displayed
5. **Theme Integration**: Use `ColorValue` for all colors
6. **Fonts**: Use font IDs, convert to names with `getFontName()`

### When Modifying Cards
- Update both `GenericCard.tsx` (display) and `CardConfigEditor.tsx` (editor)
- Ensure `SingleCard` component receives all style props
- Test in all viewports (desktop, tablet, mobile)
- Check live preview modal functionality

### When Working with Media
- User media queries: Filter by `customer_id`
- Stock photos: No customer_id filter
- Always sync media changes to JSON (primary source)
- Use `mediaSync.ts` functions for consistency

### Code Style
- Use TypeScript strictly
- Prefer functional components with hooks
- Use TailwindCSS for styling
- Keep components modular and reusable
- Document complex logic with comments

---

## Common Tasks

### Add a New Block Type
1. Create interface in `src/types/`
2. Create component in `src/components/blocks/`
3. Add to `DynamicPage.tsx` switch statement
4. Create editor page in `src/pages/admin/`
5. Add to block list in page management

### Create Card Template
1. Navigate to `/superadmin/card-templates`
2. Click "Neue Vorlage"
3. Configure card using CardConfigEditor
4. Save with name, description, and category
5. Template auto-loads with first stock photo

### Enable Inline Editing
1. Wrap editable text with `<EditableText>`
2. Pass `blockId` and `fieldPath`
3. Specify `as` prop (h1, h2, p, div, etc.)
4. Set `multiline={true}` for rich text
5. EditableText handles save to JSON automatically

---

## Testing Checklist

### Before Committing
- [ ] No TypeScript errors
- [ ] All viewports tested (desktop/tablet/mobile)
- [ ] Inline editing works (if applicable)
- [ ] Preview modal displays correctly
- [ ] Database queries optimized
- [ ] No console errors/warnings
- [ ] Responsive behavior verified
- [ ] Theme colors apply correctly
- [ ] Fonts load and display

### For Card Changes
- [ ] Template preview shows correct layout
- [ ] All style options apply in preview
- [ ] Viewport-specific columns work
- [ ] Icon alignment options work
- [ ] Font changes apply immediately
- [ ] Color picker includes theme colors

---

## Helpful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Format code
npm run format
```

---

## Notes for AI Assistants

- **Always read existing types** before creating new interfaces
- **Check for existing utilities** before writing helper functions
- **Maintain consistency** with established patterns (ColorValue, ResponsiveValue, etc.)
- **Test responsive behavior** - many properties are viewport-specific
- **JSON is source of truth** - database is for querying/reference only
- **Use multi_replace_string_in_file** for multiple independent edits
- **Include 3-5 lines of context** when using replace_string_in_file
- **Never create summary markdown files** unless explicitly requested

---

## Contact & Resources

- Project: BeautifulCMS
- Language: German (UI), English (code/comments)
- Target Users: German beauty/hair salons
- Focus: Simple, visual, non-technical user experience
