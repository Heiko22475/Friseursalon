# Visual Editor – Implementierungs-Protokoll

**Erstellt:** 09.02.2026  
**Letzte Aktualisierung:** 09.02.2026  
**Basis:** [VISUAL_EDITOR_KONZEPT.md](VISUAL_EDITOR_KONZEPT.md)

---

## Übersicht: Phasen-Status

| Phase | Beschreibung | Status |
|-------|-------------|--------|
| Phase 1 | Foundation (Types, Schema, Renderer) | ✅ Abgeschlossen |
| Phase 2 | Editor Shell (3-Panel Layout, Navigation) | ✅ Abgeschlossen |
| Phase 3 | Selection & Properties | ✅ Abgeschlossen |
| Phase 4 | Inline Editing & Content | ✅ Weitgehend abgeschlossen |
| Phase 5 | Cards System | ⚠️ Teilweise |
| Phase 6 | Components (Symbols) | ❌ Offen |
| Phase 7 | Polish & Integration | ⚠️ Teilweise |

---

## Detaillierter Status pro Phase

### Phase 1: Foundation ✅

| Feature | Status | Datei |
|---------|--------|-------|
| TypeScript Types (VEPage, VEElement, etc.) | ✅ | `types/elements.ts` |
| StyleProperties, SizeValue, ElementStyles | ✅ | `types/styles.ts` |
| CardTemplate Types | ✅ | `types/cards.ts` |
| JSON-Schema Seitenstruktur | ✅ | `types/elements.ts` |
| Basis-Renderer (Body → Section → Container → Text/Image/Button) | ✅ | `renderer/*.tsx` |
| Style-Resolution (Desktop + Responsive Overrides) | ✅ | `utils/styleResolver.ts` |
| SizeValue → CSS Konvertierung | ✅ | `utils/sizeValue.ts` |
| Demo-Page als JSON | ✅ | `data/demoPage.ts` (4 Seiten) |

### Phase 2: Editor Shell ✅

| Feature | Status | Datei |
|---------|--------|-------|
| Editor-Route `/admin/visual-editor` | ✅ | `App.tsx` (lazy load) |
| 3-Panel-Layout (Navigator / Canvas / Properties) | ✅ | `VisualEditorPage.tsx` |
| Top-Bar (Page-Dropdown, Breakpoint-Switch, Save, Exit) | ✅ | `shell/TopBar.tsx` |
| Breadcrumbs (klickbar) | ✅ | `shell/TopBar.tsx` |
| Navigator Icon-Leiste + Flyout | ✅ | `shell/Navigator.tsx` |
| Elements Tree (rekursiv, DnD) | ✅ | `shell/ElementsTree.tsx` |
| Pages Panel (CRUD, Sort, Publish) | ✅ | `shell/PagesPanel.tsx` |
| Add Element Panel | ✅ | `shell/AddElementPanel.tsx` |
| Canvas mit Page-Rendering | ✅ | `renderer/CanvasRenderer.tsx` |
| EditorContext (State Management) | ✅ | `state/EditorContext.tsx` |
| Undo/Redo | ✅ | `state/EditorContext.tsx` |
| Keyboard Shortcuts (Ctrl+Z/Y/C/V/D, Del, Esc, Arrows) | ✅ | `state/EditorContext.tsx` |

### Phase 3: Selection & Properties ✅

| Feature | Status | Datei |
|---------|--------|-------|
| Click-to-Select auf Canvas | ✅ | Alle Renderer |
| Selection Highlight (CSS Klasse `.ve-selected`) | ✅ | `styles/editor.css` |
| Hover Highlight (CSS Klasse `.ve-hovered`) | ✅ | `styles/editor.css` |
| Selection Badge (Typ-Label) | ✅ | `styles/editor.css` |
| Navigator ↔ Canvas Sync | ✅ | ElementsTree + Renderer |
| Properties Panel Shell (Accordions) | ✅ | `shell/PropertiesPanel.tsx` |
| Layout Section (Display, Flex, Grid) | ✅ | `properties/LayoutSection.tsx` |
| Spacing Section (Visual Box Model) | ✅ | `components/SpacingBox.tsx` |
| Size Section | ✅ | `properties/SizeSection.tsx` |
| Typography Section (Font, Size, Weight, Color, Align) | ✅ | `properties/TypographySection.tsx` |
| Background Section (Color, Image) | ✅ | `properties/BackgroundSection.tsx` |
| Border Section | ✅ | `properties/BorderSection.tsx` |
| Effects Section (Shadow, Position, Opacity) | ✅ | `properties/EffectsSection.tsx` |
| Unit-Switch (px, %, em, rem, vw, vh) | ✅ | `components/UnitInput.tsx` |
| Breakpoint-aware Property Editing | ✅ | PropertiesPanel viewport-aware |
| Context Menu (Rechtsklick) | ✅ | `components/ContextMenu.tsx` |
| Copy / Paste / Duplicate | ✅ | EditorContext |
| Move Up/Down/First/Last | ✅ | ContextMenu + EditorContext |
| Wrap in Container / Unwrap | ✅ | ContextMenu + EditorContext |
| Reset Styles | ✅ | ContextMenu + EditorContext |
| Toggle Visibility | ✅ | ContextMenu + EditorContext |

### Phase 4: Inline Editing & Content ✅

| Feature | Status | Datei |
|---------|--------|-------|
| TipTap Inline-Editing für Text | ✅ | `renderer/TextRenderer.tsx` |
| Mini-Toolbar (Bold, Italic, Underline) | ✅ | `renderer/TextRenderer.tsx` |
| Content Section (Text, Image, Button Properties) | ✅ | `properties/ContentSection.tsx` |
| Rich Text Editor (WYSIWYG) | ✅ | `components/VERichTextEditor.tsx` |
| Image-Auswahl (Media Picker) | ✅ | `components/VEMediaPicker.tsx` |
| Button-Text + Link editieren | ✅ | `properties/ContentSection.tsx` |
| Label-Editing in Navigator (Doppelklick) | ✅ | `shell/ElementsTree.tsx` |
| Add/Delete Element | ✅ | AddElementPanel + Context |
| Duplicate Element | ✅ | Context Menu + Keyboard |
| Color Picker (Theme-integriert) | ✅ | `components/VEColorPicker.tsx` |
| Theme Bridge (CSS Custom Properties) | ✅ | `theme/VEThemeBridge.tsx` |

### Phase 5: Cards System ⚠️

| Feature | Status | Datei |
|---------|--------|-------|
| Cards-Block Renderer (Grid) | ✅ | `renderer/CardsRenderer.tsx` |
| Built-in Card Templates (4 Stück) | ✅ | `types/cards.ts` |
| Card-Element-Typen Rendering | ✅ | `renderer/CardsRenderer.tsx` |
| Cards Properties Panel | ✅ | `properties/CardsProperties.tsx` |
| Template-Auswahl (Picker Popup) | ✅ | `shell/AddElementPanel.tsx` |
| Responsive Columns (Desktop/Tablet/Mobile) | ✅ | `renderer/CardsRenderer.tsx` |
| Card-Template-Editor (Popup) | ❌ | Nicht implementiert |
| Badge-Positionierung (absolute, px/%) | ❌ | Nur statische Badge |
| Template-Wechsel mit Warnung | ✅ | `properties/CardsProperties.tsx` |
| Karten umsortieren (Up/Down) | ✅ | `properties/CardsProperties.tsx` |
| Eigene Vorlagen erstellen | ❌ | Nicht implementiert |
| Add/Delete einzelne Karten | ✅ | `properties/CardsProperties.tsx` |
| Card-Elemente editieren (inline) | ❌ | Nicht implementiert |

### Phase 6: Components (Symbols) ❌

| Feature | Status | Datei |
|---------|--------|-------|
| Component-Definition speichern | ❌ | — |
| ComponentInstance-Rendering | ⚠️ Platzhalter | `renderer/ElementRenderer.tsx` |
| Component Isolations-Modus | ❌ | — |
| Globale Änderungen | ❌ | — |
| Components Tab im Navigator | ❌ | — |

### Phase 7: Polish & Integration ⚠️

| Feature | Status | Datei |
|---------|--------|-------|
| Save/Load JSON ↔ Supabase | ❌ | TODO in TopBar |
| Legacy-Block Kompatibilität | ⚠️ | Header/Footer via existing blocks |
| Keyboard Shortcuts (inkl. Ctrl+S) | ✅ | EditorContext |
| Responsive Preview | ✅ | Canvas Viewport Switch |
| Performance-Optimierung | ⚠️ | Undo debounce vorhanden |
| Error Handling (ErrorBoundary) | ✅ | `components/VEErrorBoundary.tsx` |
| Assets Panel (Mediathek) | ✅ | `shell/AssetsPanel.tsx` |
| UX Polish (Tooltips, Transitions) | ⚠️ | Teilweise |

---

## Zusätzliche Features (über Konzept hinaus)

Diese Features wurden implementiert, waren aber nicht explizit im Konzept:

| Feature | Datei |
|---------|-------|
| Header-Block Integration (HeaderBlock) | `renderer/HeaderRenderer.tsx` |
| Footer-Block Integration (FooterBlock) | `renderer/FooterRenderer.tsx` |
| Header Properties Editor | `properties/HeaderProperties.tsx` |
| Footer Properties Editor | `properties/FooterProperties.tsx` |
| Multi-Page Support (4 Demo-Seiten) | `data/demoPage.ts` |
| Page CRUD (Add, Delete, Duplicate, Move) | `state/EditorContext.tsx` |
| Page Publish/Unpublish | `shell/PagesPanel.tsx` |
| Drag & Drop Reordering im ElementsTree | `shell/ElementsTree.tsx` |
| Clipboard (Copy/Paste) | `state/EditorContext.tsx` |
| Wrap/Unwrap Container | `state/EditorContext.tsx` |
| Debounced Undo (für Slider) | `state/EditorContext.tsx` |
| Ctrl+S Save-Shortcut | `state/EditorContext.tsx` |
| Template-Wechsel Warnung (Datenverlust) | `properties/CardsProperties.tsx` |
| Karten umsortieren (Up/Down) | `properties/CardsProperties.tsx` |
| Error Boundary | `components/VEErrorBoundary.tsx` |
| Assets Panel (Mediathek-Browser) | `shell/AssetsPanel.tsx` |

---

## Nächste Schritte (Prioritäten)

### Priorität 1: Save/Load (Phase 7)
- [ ] JSON ↔ Supabase Integration (`websites.content`)
- [ ] Save-Button funktional machen
- [ ] Beim Öffnen: Website-Daten laden statt Demo-Daten

### Priorität 2: Cards System vervollständigen (Phase 5)
- [x] ~~Template-Wechsel mit Warnung bei Datenverlust~~ ✅
- [x] ~~Karten umsortieren (Up/Down)~~ ✅
- [ ] Card-Elemente inline editierbar machen
- [ ] Card-Template-Editor (Popup für eigene Templates)
- [ ] Badge-Positionierung (absolute px/%)

### Priorität 3: Components (Phase 6)
- [ ] Component-Definition (VEComponent Type)
- [ ] ComponentInstance Renderer  
- [ ] Components Tab im Navigator
- [ ] Isolations-Modus

### Priorität 4: Weiteres Polish
- [x] ~~Admin Dashboard Button zum Visual Editor~~ ✅ (bereits vorhanden)
- [x] ~~Error Boundaries~~ ✅
- [x] ~~Ctrl+S Save-Shortcut~~ ✅
- [x] ~~Assets Panel (Mediathek im Navigator)~~ ✅
- [ ] Loading States
- [ ] Drag-and-Drop von Add-Panel auf Canvas
- [ ] Tooltips und Transitions

---

## Dateistruktur (aktuell)

```
src/visual-editor/
├── VisualEditorPage.tsx          ← Hauptseite (3-Panel Layout)
├── index.ts                      ← Module Index
├── components/
│   ├── ContextMenu.tsx           ← Rechtsklick-Menü
│   ├── SpacingBox.tsx            ← Box-Model Visualisierung
│   ├── UnitInput.tsx             ← Input mit Unit-Switch
│   ├── VEColorPicker.tsx         ← Color Picker (Theme-integriert)
│   ├── VEErrorBoundary.tsx       ← Error Boundary (NEU)
│   ├── VEMediaPicker.tsx         ← Media Picker
│   └── VERichTextEditor.tsx      ← TipTap WYSIWYG Editor
├── data/
│   └── demoPage.ts               ← 4 Demo-Seiten
├── properties/
│   ├── BackgroundSection.tsx     ← Hintergrund Properties
│   ├── BorderSection.tsx         ← Rahmen Properties
│   ├── CardsProperties.tsx       ← Karten Properties
│   ├── ContentSection.tsx        ← Inhalt (Text/Image/Button)
│   ├── EffectsSection.tsx        ← Shadow, Position, Opacity
│   ├── FooterProperties.tsx      ← Footer Config
│   ├── HeaderProperties.tsx      ← Header Config
│   ├── LayoutSection.tsx         ← Display, Flex, Grid
│   ├── SizeSection.tsx           ← Width, Height, Min/Max
│   └── TypographySection.tsx     ← Font, Size, Weight, Color
├── renderer/
│   ├── BodyRenderer.tsx
│   ├── ButtonRenderer.tsx
│   ├── CanvasRenderer.tsx
│   ├── CardsRenderer.tsx
│   ├── ContainerRenderer.tsx
│   ├── ElementRenderer.tsx       ← Zentraler Dispatcher
│   ├── FooterRenderer.tsx
│   ├── HeaderRenderer.tsx
│   ├── ImageRenderer.tsx
│   ├── SectionRenderer.tsx
│   ├── TextRenderer.tsx
│   └── index.ts
├── shell/
│   ├── AddElementPanel.tsx       ← Element hinzufügen
│   ├── AssetsPanel.tsx            ← Mediathek-Browser (NEU)
│   ├── ElementsTree.tsx          ← Hierarchischer Baum (DnD)
│   ├── JsonImportDialog.tsx       ← JSON-Import Dialog (NEU)
│   ├── Navigator.tsx             ← Linke Sidebar
│   ├── PagesPanel.tsx            ← Seitenverwaltung
│   ├── PropertiesPanel.tsx       ← Rechte Sidebar
│   └── TopBar.tsx                ← Obere Leiste + Import-Button
├── state/
│   └── EditorContext.tsx         ← State Management + Reducer
├── styles/
│   └── editor.css                ← Canvas Selection Styles
├── theme/
│   └── VEThemeBridge.tsx         ← Theme-Integration
├── types/
│   ├── cards.ts                  ← Card Template Types
│   ├── elements.ts               ← Element Types
│   ├── index.ts
│   └── styles.ts                 ← Style Types
└── utils/
    ├── elementHelpers.ts         ← Baum-Traversierung + Factories
    ├── index.ts
    ├── sizeValue.ts              ← SizeValue Helpers
    └── styleResolver.ts          ← Responsive Style Resolution
```

---

## TypeScript Errors

Keine TypeScript-Fehler. CSS-Lint-Hinweis (leere Ruleset) wurde behoben.

---

## Änderungslog

### Session 09.02.2026
- ✅ Vollständiger Audit aller 40+ Quelldateien gegen Konzeptdokument
- ✅ Status-Protokoll erstellt (`docs/VISUAL_EDITOR_STATUS.md`)
- ✅ **Ctrl+S Shortcut**: Save-Keyboard-Shortcut hinzugefügt (`EditorContext.tsx`)
- ✅ **Template-Wechsel Warnung**: Dialog warnt vor Datenverlust beim Template-Wechsel (`CardsProperties.tsx`)
- ✅ **CSS-Lint Fix**: Leere Ruleset in `editor.css` behoben
- ✅ **Karten umsortieren**: Move Up/Down Buttons für Karten in Cards Properties (`CardsProperties.tsx`)
- ✅ **Error Boundary**: React Error Boundary mit Fallback-UI (`VEErrorBoundary.tsx` + Integration in `VisualEditorPage.tsx`)
- ✅ **Assets Panel**: Mediathek-Browser als Navigator-Tab mit Supabase-Anbindung, Suche, Drag-Support (`AssetsPanel.tsx` + `Navigator.tsx` + `EditorContext.tsx`)
- ✅ **Content-History Tabelle**: SQL-Migration für Versionierung (`supabase-content-history.sql`) – Separate Tabelle mit Auto-Backup-Trigger bei jedem Content-Update
- ✅ **JSON-Import Dialog**: Superadmin-Feature zum Import von KI-generiertem JSON in beliebige Kunden-Websites (`JsonImportDialog.tsx`) – Kundenauswahl, JSON-Validierung, Import-Modus (vollständig / nur Seiten), History-Ansicht mit Restore-Funktion
- ✅ **Import-Button in TopBar**: Neuer „Import"-Button in der oberen Leiste (`TopBar.tsx`)
