# 📝 Inline Text Editor Konzept

## Vision

**Live-Editing auf der Webseite**: Administratoren können Texte direkt auf der Live-Webseite bearbeiten, ohne den Admin-Bereich öffnen zu müssen. Änderungen werden sofort in der Datenbank gespeichert und sind live sichtbar.

---

## Problem-Analyse

### Aktuelle Situation
- ❌ Benutzer muss zum Admin-Bereich navigieren
- ❌ Block-Editor öffnen
- ❌ Textfeld finden und bearbeiten
- ❌ Speichern und zurück zur Webseite
- ❌ Seite neu laden, um Änderungen zu sehen
- ❌ **5+ Klicks** für eine einfache Textänderung

### Ziel-Situation
- ✅ Benutzer ist auf der Live-Webseite
- ✅ Aktiviert "Edit-Modus"
- ✅ Klickt auf Text → Text wird editierbar
- ✅ Bearbeitet direkt inline
- ✅ Speichert mit einem Klick
- ✅ **2 Klicks** für Textänderung

---

## Konzept-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                    LIVE WEBSEITE (Frontend)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔧 Edit-Modus Toggle (nur für eingeloggte Admins)         │ │
│  │    [Edit-Modus: AUS] ←→ [Edit-Modus: EIN]                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Edit-Modus AUS (Normale Ansicht):                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Willkommen bei Salon Haarfein                             │ │
│  │  Ihr Experte für moderne Haarschnitte                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Edit-Modus EIN (Editierbare Ansicht):                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Willkommen bei Salon Haarfein [✏️ Edit]                  │ │
│  │  Ihr Experte für moderne Haarschnitte [✏️ Edit]           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Bei Klick auf [✏️ Edit]:                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ [Inline Editor erscheint]                            │  │ │
│  │  │                                                       │  │ │
│  │  │ Willkommen bei Salon Haarfein_                       │  │ │
│  │  │                                                       │  │ │
│  │  │ [B] [I] [U] [🎨]  [Speichern] [Abbrechen]           │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technische Architektur

### 1. Edit-Modus State

```typescript
// Globaler Kontext für Edit-Modus
interface EditModeContext {
  isEditMode: boolean;
  isAdmin: boolean;
  activeEditingId: string | null;
  
  // Methoden
  toggleEditMode: () => void;
  startEditing: (id: string) => void;
  stopEditing: () => void;
  saveChanges: (id: string, content: string) => Promise<void>;
}

// React Context Provider
const EditModeProvider: React.FC = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const { isAdmin } = useAuth(); // Von Supabase Auth
  
  // ... Implementierung
};
```

### 2. Editierbare Text-Komponente

```typescript
interface EditableTextProps {
  // Identifikation
  blockId: string;          // ID des Blocks
  fieldPath: string;        // Pfad im JSON: "title", "subtitle", "items[0].title"
  
  // Content
  value: string;
  
  // Styling (optional)
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  
  // Callbacks
  onSave?: (newValue: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({
  blockId,
  fieldPath,
  value,
  as: Component = 'div',
  className,
  onSave
}) => {
  const { isEditMode, activeEditingId, startEditing, stopEditing } = useEditMode();
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  
  const editId = `${blockId}:${fieldPath}`;
  const isEditing = activeEditingId === editId;
  
  const handleSave = async () => {
    setIsSaving(true);
    
    // API Call
    await updateBlockField(blockId, fieldPath, localValue);
    
    stopEditing();
    onSave?.(localValue);
    setIsSaving(false);
  };
  
  if (!isEditMode) {
    // Normale Ansicht
    return <Component className={className}>{value}</Component>;
  }
  
  if (isEditing) {
    // Edit-Ansicht mit Inline-Editor
    return (
      <div className="relative inline-edit-container">
        <TipTapEditor
          value={localValue}
          onChange={setLocalValue}
          compact
        />
        <div className="edit-actions">
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Speichert...' : 'Speichern'}
          </button>
          <button onClick={stopEditing}>Abbrechen</button>
        </div>
      </div>
    );
  }
  
  // Edit-Modus, aber nicht aktiv editiert
  return (
    <div className="relative editable-highlight">
      <Component className={className}>{value}</Component>
      <button
        onClick={() => startEditing(editId)}
        className="edit-indicator"
        title="Text bearbeiten"
      >
        <Edit2 className="w-3 h-3" />
      </button>
    </div>
  );
};
```

### 3. API Endpoint

```typescript
// Supabase Function oder API Route
async function updateBlockField(
  blockId: string,
  fieldPath: string,
  newValue: string
): Promise<void> {
  // 1. Block aus DB laden
  const { data: block } = await supabase
    .from('blocks')
    .select('config, page_id')
    .eq('id', blockId)
    .single();
  
  // 2. Config aktualisieren (mit lodash set)
  const updatedConfig = _.set({ ...block.config }, fieldPath, newValue);
  
  // 3. Zurück in DB schreiben
  await supabase
    .from('blocks')
    .update({ 
      config: updatedConfig,
      updated_at: new Date().toISOString()
    })
    .eq('id', blockId);
  
  // 4. Cache invalidieren (optional)
  await invalidatePageCache(block.page_id);
}
```

---

## UI/UX Design

### Edit-Modus Toggle (Floating Button)

```tsx
const EditModeToggle: React.FC = () => {
  const { isEditMode, toggleEditMode, isAdmin } = useEditMode();
  
  if (!isAdmin) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleEditMode}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
          transition-all duration-300 font-medium
          ${isEditMode 
            ? 'bg-rose-500 text-white hover:bg-rose-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
          }
        `}
      >
        {isEditMode ? (
          <>
            <Check className="w-5 h-5" />
            Edit-Modus aktiv
          </>
        ) : (
          <>
            <Edit2 className="w-5 h-5" />
            Edit-Modus
          </>
        )}
      </button>
      
      {/* Info-Tooltip bei aktivem Edit-Modus */}
      {isEditMode && (
        <div className="mt-2 p-3 bg-white rounded-lg shadow-lg text-sm text-gray-600">
          <p className="font-medium mb-1">✏️ Edit-Modus aktiv</p>
          <p>Klicken Sie auf beliebige Texte, um sie zu bearbeiten</p>
        </div>
      )}
    </div>
  );
};
```

### Inline Editor (kompakt)

```tsx
const InlineEditor: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Color,
      TextStyle,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  
  return (
    <div className="inline-editor-wrapper border-2 border-rose-500 rounded-lg bg-white shadow-xl p-2">
      {/* Toolbar */}
      <div className="flex gap-1 mb-2 pb-2 border-b">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'active' : ''}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'active' : ''}
        >
          <Italic className="w-4 h-4" />
        </button>
        {/* ... weitere Buttons */}
      </div>
      
      {/* Editor Content */}
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  );
};
```

### Visual Indicators

```css
/* Editable Elements im Edit-Modus */
.editable-highlight {
  position: relative;
  outline: 2px dashed transparent;
  transition: outline 0.2s;
  cursor: pointer;
}

.editable-highlight:hover {
  outline-color: #f43f5e; /* rose-500 */
  background-color: rgba(244, 63, 94, 0.05);
}

/* Edit-Icon Indicator */
.edit-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f43f5e;
  color: white;
  padding: 4px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.editable-highlight:hover .edit-indicator {
  opacity: 1;
}

/* Aktiver Edit-Container */
.inline-edit-container {
  position: relative;
  z-index: 100;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Implementierungs-Schritte

### Phase 1: Basis-Infrastruktur ✨
1. **EditModeContext erstellen**
   - `src/contexts/EditModeContext.tsx`
   - State-Management für Edit-Modus
   - Admin-Check via Supabase Auth

2. **EditableText Komponente**
   - `src/components/EditableText.tsx`
   - Inline-Editing-Logik
   - TipTap-Integration (kompakt)

3. **EditModeToggle Button**
   - Floating Button (bottom-right)
   - Nur für Admins sichtbar
   - Persistenz im localStorage (optional)

### Phase 2: API & Datenbank 🔌
1. **Supabase Function: `update_block_field`**
   ```sql
   CREATE OR REPLACE FUNCTION update_block_field(
     p_block_id UUID,
     p_field_path TEXT,
     p_new_value TEXT
   ) RETURNS VOID AS $$
   DECLARE
     v_config JSONB;
   BEGIN
     -- Config laden
     SELECT config INTO v_config
     FROM blocks
     WHERE id = p_block_id;
     
     -- Feld aktualisieren (mit jsonb_set)
     v_config := jsonb_set(
       v_config,
       string_to_array(p_field_path, '.'),
       to_jsonb(p_new_value)
     );
     
     -- Zurückschreiben
     UPDATE blocks
     SET config = v_config,
         updated_at = NOW()
     WHERE id = p_block_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

2. **RLS Policies anpassen**
   ```sql
   -- Nur Admins dürfen Blöcke via inline-edit ändern
   CREATE POLICY "Admins can update blocks inline"
   ON blocks
   FOR UPDATE
   TO authenticated
   USING (
     -- User muss Admin sein (check in user metadata)
     (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
   );
   ```

### Phase 3: Integration in bestehende Blöcke 🧩
1. **Hero-Block**
   ```tsx
   <EditableText
     blockId={block.id}
     fieldPath="title"
     value={config.title}
     as="h1"
     className="text-5xl font-bold"
   />
   
   <EditableText
     blockId={block.id}
     fieldPath="subtitle"
     value={config.subtitle}
     as="p"
     className="text-xl"
   />
   ```

2. **StaticText-Block**
   ```tsx
   <EditableText
     blockId={block.id}
     fieldPath="content"
     value={config.content}
     as="div"
     className="prose"
   />
   ```

3. **GenericCard-Block**
   ```tsx
   {config.items.map((item, index) => (
     <div key={item.id}>
       <EditableText
         blockId={block.id}
         fieldPath={`items[${index}].title`}
         value={item.title}
         as="h3"
       />
       <EditableText
         blockId={block.id}
         fieldPath={`items[${index}].description`}
         value={item.description}
         as="p"
       />
     </div>
   ))}
   ```

### Phase 4: UX-Verbesserungen 🎨
1. **Keyboard Shortcuts**
   - `Cmd/Ctrl + E` → Toggle Edit-Modus
   - `Cmd/Ctrl + S` → Speichern (im Editor)
   - `Esc` → Abbrechen

2. **Undo/Redo Support**
   - TipTap hat Built-in Undo/Redo
   - History-Stack in EditModeContext

3. **Optimistic Updates**
   - Änderungen sofort im UI anzeigen
   - Bei Fehler zurückrollen

4. **Auto-Save (optional)**
   - Nach 2 Sekunden Inaktivität
   - Mit Debouncing

### Phase 5: Edge Cases & Polish 🛡️
1. **Concurrency Handling**
   - Optimistic Locking mit `updated_at`
   - Warnung bei gleichzeitiger Bearbeitung

2. **Validation**
   - Max-Length für Felder
   - HTML-Sanitization (XSS-Schutz)

3. **Responsive Design**
   - Inline-Editor passt sich an Viewport an
   - Touch-Optimierung für Mobile

4. **Fehlermeldungen**
   - Toast-Notifications bei Speicher-Fehlern
   - Retry-Mechanismus

---

## Sicherheits-Konzept 🔒

### 1. Authentifizierung
```typescript
// Nur eingeloggte Admins dürfen Edit-Modus sehen
const { isAdmin } = useAuth();

// RLS auf Datenbankebene
CREATE POLICY "Only admins can update"
ON blocks FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');
```

### 2. Authorization
```typescript
// Prüfen ob User zu Customer gehört
const canEdit = (blockId: string, userId: string): boolean => {
  // Block → Page → Website → Customer
  // User muss Customer des Blocks sein
  return block.website.customer_id === user.customer_id;
};
```

### 3. Input Validation
```typescript
// Server-seitige Validierung
const validateFieldUpdate = (fieldPath: string, value: string): boolean => {
  // 1. Allowed Fields Check
  const allowedFields = ['title', 'subtitle', 'description', 'content'];
  if (!allowedFields.some(f => fieldPath.startsWith(f))) {
    throw new Error('Field not allowed for inline editing');
  }
  
  // 2. Length Check
  if (value.length > 10000) {
    throw new Error('Content too long');
  }
  
  // 3. HTML Sanitization
  const sanitized = DOMPurify.sanitize(value);
  
  return true;
};
```

### 4. Rate Limiting
```typescript
// Max 30 Updates pro Minute pro User
const rateLimiter = new RateLimit({
  windowMs: 60000,
  max: 30,
  keyGenerator: (req) => req.user.id
});

app.post('/api/blocks/:id/field', rateLimiter, updateHandler);
```

---

## Datenfluss-Diagramm

```
┌──────────┐
│  Admin   │ klickt auf Text
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ EditableText     │ startEditing(editId)
│ Component        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ TipTap Editor    │ Benutzer bearbeitet Text
│ (Inline)         │
└────┬─────────────┘
     │ Speichern-Klick
     ▼
┌──────────────────┐
│ updateBlockField │ API Call
│ Function         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Supabase         │ UPDATE blocks SET config = ...
│ Database         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ React Query      │ Invalidate & Refetch
│ Cache            │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ UI Update        │ Neue Daten anzeigen
│ (Re-render)      │
└──────────────────┘
```

---

## Erweiterte Features (Optional)

### 1. Multi-Language Support 🌍
```typescript
<EditableText
  blockId={block.id}
  fieldPath="title"
  value={config.title}
  language="de" // Sprache angeben
/>

// In DB: config.title_de, config.title_en, etc.
```

### 2. Version History 📜
```typescript
interface BlockVersion {
  id: string;
  block_id: string;
  config: JSONB;
  changed_by: string;
  changed_at: timestamp;
  change_description: string;
}

// "Änderungen anzeigen" Button
// Rollback zu früherer Version
```

### 3. Live Collaboration 👥
```typescript
// Mit Supabase Realtime
const subscription = supabase
  .from('blocks')
  .on('UPDATE', (payload) => {
    if (payload.new.id === currentBlockId) {
      // Andere Person hat bearbeitet
      showNotification('Block wurde von jemand anderem geändert');
    }
  })
  .subscribe();
```

### 4. Preview Mode 👁️
```typescript
// Änderungen preview ohne speichern
const [previewChanges, setPreviewChanges] = useState<Map<string, string>>();

// "Vorschau"-Button → Ändert nur lokales State
// "Veröffentlichen"-Button → Speichert in DB
```

### 5. Bulk Edit 📦
```typescript
// Mehrere Felder gleichzeitig bearbeiten
const [selectedFields, setSelectedFields] = useState<string[]>();

// "Alle Titel ändern"-Funktion
// "Find & Replace"-Dialog
```

---

## Testing-Strategie 🧪

### Unit Tests
```typescript
describe('EditableText', () => {
  it('renders normal text when edit mode is off', () => {
    render(<EditableText value="Hello" isEditMode={false} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('shows edit indicator when edit mode is on', () => {
    render(<EditableText value="Hello" isEditMode={true} />);
    expect(screen.getByTitle('Text bearbeiten')).toBeInTheDocument();
  });
  
  it('saves changes on save button click', async () => {
    const onSave = jest.fn();
    render(<EditableText value="Hello" onSave={onSave} />);
    
    // Aktiviere Edit
    fireEvent.click(screen.getByTitle('Text bearbeiten'));
    
    // Ändere Text
    fireEvent.change(screen.getByRole('textbox'), { 
      target: { value: 'World' } 
    });
    
    // Speichere
    fireEvent.click(screen.getByText('Speichern'));
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('World');
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
test('inline editing workflow', async ({ page }) => {
  // 1. Login als Admin
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // 2. Zur Webseite navigieren
  await page.goto('/');
  
  // 3. Edit-Modus aktivieren
  await page.click('button:has-text("Edit-Modus")');
  
  // 4. Text bearbeiten
  await page.click('.editable-highlight:has-text("Willkommen")');
  await page.fill('[contenteditable]', 'Neuer Titel');
  await page.click('button:has-text("Speichern")');
  
  // 5. Verifizieren
  await page.waitForSelector('text="Neuer Titel"');
  
  // 6. Seite neu laden und prüfen ob gespeichert
  await page.reload();
  expect(await page.textContent('h1')).toBe('Neuer Titel');
});
```

---

## Performance-Optimierung ⚡

### 1. Lazy Loading des Editors
```typescript
const TipTapEditor = lazy(() => import('./TipTapEditor'));

// Nur laden wenn Edit-Modus aktiv
{isEditMode && (
  <Suspense fallback={<Spinner />}>
    <TipTapEditor />
  </Suspense>
)}
```

### 2. Debounced Auto-Save
```typescript
const debouncedSave = useMemo(
  () => debounce((value: string) => {
    saveToDatabase(value);
  }, 2000),
  []
);
```

### 3. Optimistic Updates
```typescript
// Sofort im UI anzeigen
setLocalValue(newValue);

// Dann speichern
try {
  await saveToDatabase(newValue);
} catch (error) {
  // Rollback bei Fehler
  setLocalValue(oldValue);
  showError('Speichern fehlgeschlagen');
}
```

---

## Deployment-Checkliste ✅

- [ ] EditModeContext implementiert
- [ ] EditableText Komponente erstellt
- [ ] EditModeToggle Button hinzugefügt
- [ ] Supabase Function deployed
- [ ] RLS Policies aktualisiert
- [ ] Hero-Block integriert
- [ ] StaticText-Block integriert
- [ ] GenericCard-Block integriert
- [ ] Keyboard Shortcuts implementiert
- [ ] Error Handling getestet
- [ ] Security Audit durchgeführt
- [ ] Performance getestet
- [ ] E2E Tests geschrieben
- [ ] Dokumentation aktualisiert
- [ ] User-Training-Material erstellt

---

## Roadmap

### MVP (Week 1-2) 🎯
- ✅ EditModeContext
- ✅ EditableText Komponente
- ✅ Basic Inline Editor (TipTap)
- ✅ API Endpoint
- ✅ Hero-Block Integration

### V1.0 (Week 3-4) 🚀
- ✅ Alle Block-Typen integriert
- ✅ Keyboard Shortcuts
- ✅ Optimistic Updates
- ✅ Error Handling
- ✅ Security Audit

### V1.1 (Week 5-6) ⭐
- 🔄 Auto-Save
- 🔄 Version History
- 🔄 Undo/Redo Stack
- 🔄 Preview Mode

### V2.0 (Future) 🌟
- 🔮 Multi-Language Support
- 🔮 Live Collaboration
- 🔮 Bulk Edit
- 🔮 AI-Powered Suggestions

---

## Häufige Fragen (FAQ)

**Q: Was passiert, wenn zwei Admins gleichzeitig bearbeiten?**
A: Last-Write-Wins-Strategie mit Warnung. Optional: Optimistic Locking mit Konflikt-Auflösung.

**Q: Funktioniert es auf Mobile?**
A: Ja, Touch-optimiert. Editor passt sich an kleine Screens an.

**Q: Kann man den Edit-Modus versehentlich aktivieren?**
A: Nein, nur eingeloggte Admins sehen den Button. Zusätzlich Bestätigungs-Dialog möglich.

**Q: Was ist mit SEO?**
A: Inline-Editing ändert nur Datenbank-Inhalte. SSR/SSG bleibt unverändert. Google sieht aktualisierte Inhalte.

**Q: Performance-Impact?**
A: Minimal. Edit-Features werden nur für Admins geladen. Normale User merken keinen Unterschied.

---

## Status: 📋 Konzept-Phase

Bereit für Implementierung nach Freigabe.

**Geschätzter Aufwand**: 2-3 Wochen für MVP
**Risiko**: Niedrig (etablierte Technologien)
**Business Value**: Hoch (massiv bessere UX für Content-Editing)
