# Template Thumbnail System

Komponenten für die Anzeige von verkleinerten Template-Vorschauen im Visual Editor.

## Komponenten

### `TemplateThumbnail`

Rendert eine skalierte Miniatur eines VE-Elements (Section, Container, etc.).

**Features:**
- Skalierte Darstellung mit CSS `transform: scale()`
- Konfigurierbare Breite (Default: 100px)
- Optionales Label
- Selection State
- Hover Effects
- Click Handler

**Props:**
```typescript
interface TemplateThumbnailProps {
  element: VEElement;              // Das zu rendernde Element
  globalStyles?: GlobalStyles;     // Klassen-Definitionen
  themeColors?: Record<string, string>;
  width?: number;                  // Breite in px (Default: 100)
  height?: number;                 // Höhe in px (Default: auto, max 80)
  originalWidth?: number;          // Original-Breite für Scale (Default: 1200)
  label?: string;                  // Name/Titel
  onClick?: () => void;
  isSelected?: boolean;
}
```

**Beispiel:**
```tsx
import { TemplateThumbnail } from './components/TemplateThumbnail';
import { createSection, createText } from './utils/elementHelpers';

const heroSection = createSection({
  styles: {
    desktop: {
      padding: [80, 'px'],
      backgroundColor: '#f9f7f2',
    },
  },
  children: [
    createText({ content: '<h1>Hero Title</h1>' }),
  ],
});

<TemplateThumbnail
  element={heroSection}
  width={120}
  label="Hero Zentriert"
  onClick={() => console.log('Selected')}
  isSelected={false}
/>
```

---

### `TemplateGallery`

Beispiel-Komponente für eine Template-Auswahl mit Kategorien.

**Features:**
- Grid-Layout
- Kategorisierung
- Selection State Management
- Scrollbare Container

**Beispiel:**
```tsx
import { TemplateGallery, createExampleTemplates } from './components/TemplateGallery';

const templates = createExampleTemplates();

<TemplateGallery
  templates={templates}
  onSelect={(template) => {
    console.log('Selected:', template.name);
    // Füge Template zur Seite hinzu
  }}
/>
```

---

## Integration in den Visual Editor

### 1. Template Library Panel

Erstelle ein neues Panel für Template-Auswahl:

```tsx
// In Navigator.tsx oder als neues Flyout-Panel
const TemplateLibraryPanel: React.FC = () => {
  const { dispatch } = useEditor();

  const handleSelectTemplate = (template: TemplateItem) => {
    // Füge Template als neue Section hinzu
    dispatch({
      type: 'ADD_ELEMENT',
      parentId: state.page.body.id,
      element: template.element,
      index: -1, // Am Ende einfügen
    });
  };

  return (
    <div style={{ padding: '12px' }}>
      <h3>Section Templates</h3>
      <TemplateGallery
        templates={createExampleTemplates()}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
};
```

### 2. Context Menu Integration

Füge "Insert Template" Option hinzu:

```tsx
// In ContextMenu.tsx
{
  label: 'Template einfügen',
  icon: LayoutTemplate,
  onClick: () => {
    // Öffne Template-Auswahl-Modal
    openTemplateModal(element.id);
  },
}
```

### 3. Drag & Drop (optional)

```tsx
<TemplateThumbnail
  element={template}
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('ve-template', JSON.stringify(template));
  }}
/>
```

---

## Template-Datenbank erweitern

Erstelle eigene Template-Factories:

```typescript
// templates/heroTemplates.ts
export function createHeroCenteredTemplate(): VEElement {
  return createSection({
    styles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: [80, 'vh'],
        backgroundColor: '#f9f7f2',
      },
    },
    children: [
      createText({
        content: '<h1>Ihre Überschrift</h1>',
        styles: {
          desktop: {
            fontSize: [56, 'px'],
            fontWeight: 700,
          },
        },
      }),
      createButton({
        text: 'Call to Action',
        styles: {
          desktop: {
            marginTop: [32, 'px'],
            padding: [16, 'px', 32, 'px'],
            backgroundColor: '#2563eb',
            color: '#ffffff',
          },
        },
      }),
    ],
  });
}

// templates/serviceTemplates.ts
export function createServicesGrid4(): VEElement { ... }
export function createServicesGrid3(): VEElement { ... }
export function createServicesList(): VEElement { ... }
```

### Template-Registry

```typescript
// templates/index.ts
export const TEMPLATE_REGISTRY: TemplateItem[] = [
  {
    id: 'hero-centered',
    name: 'Hero Zentriert',
    category: 'Hero',
    element: createHeroCenteredTemplate(),
  },
  {
    id: 'services-4col',
    name: '4-Spalten Services',
    category: 'Services',
    element: createServicesGrid4(),
  },
  // ... mehr Templates
];
```

---

## Styling & Anpassung

### Custom Thumbnail Size

```tsx
<TemplateThumbnail
  element={element}
  width={150}        // Größere Vorschau
  height={100}       // Feste Höhe
  originalWidth={1400} // Andere Original-Breite
/>
```

### Custom Label Styling

Überschreibe das Label mit eigenem Style:

```tsx
<div style={{ position: 'relative' }}>
  <TemplateThumbnail element={element} />
  <div className="custom-label">Mein Template</div>
</div>
```

### Grid Layouts

```tsx
{/* 3-Spalten Grid */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
}}>
  {templates.map(t => (
    <TemplateThumbnail key={t.id} element={t.element} width={100} />
  ))}
</div>

{/* Auto-Fill Grid (responsive) */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: '12px',
}}>
  {templates.map(t => (
    <TemplateThumbnail key={t.id} element={t.element} />
  ))}
</div>
```

---

## Performance Notes

- **CSS Transform**: Nutzt GPU-Beschleunigung für smooth scaling
- **Pointer Events**: Deaktiviert in der Miniatur → keine Event-Handler aktiv
- **Lazy Rendering**: Überlege IntersectionObserver für große Listen
- **Memoization**: Nutze `React.memo()` für Template-Items

```tsx
const MemoizedThumbnail = React.memo(TemplateThumbnail);
```

---

## TODO / Erweiterungen

- [ ] Screenshot-basierte Thumbnails (PNG export)
- [ ] Lazy Loading mit IntersectionObserver
- [ ] Drag & Drop Integration
- [ ] Template-Tags/Filtering
- [ ] Favoriten-System
- [ ] User-eigene Templates speichern
- [ ] Template-Import/Export
- [ ] Responsive Preview Toggle (Desktop/Tablet/Mobile)
