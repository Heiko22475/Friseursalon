# 🎴 Generic Card Konzept

## Problem-Analyse

Der bestehende CardServiceEditor verwendet ein **einfaches Textfeld** für das Icon (`<TextInput label="Icon (Lucide Name)" ... />`) anstatt des voll funktionsfähigen **IconPickers**, der bereits existiert.

**Vorhandene Komponenten:**
- ✅ `IconPicker.tsx` - Visueller Icon-Selektor mit Suche und Vorschau
- ✅ `IconEditor.tsx` - Vollständige Icon-Konfiguration (Größe, Farbe, Hintergrund)
- ⚠️ `CardServiceEditor.tsx` - Verwendet nur TextInput für Icon
- ⚠️ `CardTeamEditor.tsx` - Kein Icon-Support
- ⚠️ `CardTestimonialEditor.tsx` - Kein Icon-Support

---

## Lösungskonzept: GenericCard System

### 1. Einheitliche Generic Card Komponente

Eine **GenericCard** soll alle Karten-Typen abdecken können:

```
┌─────────────────────────────────────────────────────────────────┐
│                         EDITOR (links 60%)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📋 Karten-Inhalt                                            ││
│  │   • Titel (Text)                                            ││
│  │   • Beschreibung (Textarea)                                 ││
│  │   • Zusatzfelder je nach Typ                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🖼️ Medien                                                   ││
│  │   • Bild (aus Mediathek)                                    ││
│  │   • ODER Icon (IconPicker!)                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🎨 Karten-Styling                                           ││
│  │   • Hintergrundfarbe                                        ││
│  │   • Rahmenradius                                            ││
│  │   • Schatten                                                ││
│  │   • Padding                                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔤 Typografie                                               ││
│  │   • Titel: Größe, Farbe, Gewicht                           ││
│  │   • Beschreibung: Größe, Farbe                             ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                    LIVE PREVIEW (rechts 40%)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐                      │
│  │         📱 Karten-Vorschau           │                      │
│  │  ┌─────────────────────────────────┐ │                      │
│  │  │        [Icon/Bild]              │ │                      │
│  │  │                                 │ │                      │
│  │  │        Titel                    │ │                      │
│  │  │        Beschreibung...          │ │                      │
│  │  │        [Button]                 │ │                      │
│  │  └─────────────────────────────────┘ │                      │
│  │                                       │                      │
│  │  📐 Desktop | 📱 Tablet | 📱 Mobile  │                      │
│  └───────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Karten-Typen (Card Presets)

| Typ | Icon | Bild | Titel | Beschreibung | Preis | Rating | Button |
|-----|------|------|-------|--------------|-------|--------|--------|
| **Service** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Team** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Testimonial** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Feature** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Pricing** | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Generic** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### 3. Icon-Integration mit IconPicker

**Aktuell (fehlerhaft):**
```tsx
<TextInput
  label="Icon (Lucide Name)"
  value={item.icon || ''}
  onChange={(icon) => update({ icon })}
  placeholder="z.B. Scissors"
/>
```

**Neu (mit IconPicker):**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Icon auswählen
  </label>
  <IconPicker
    value={item.icon || 'Star'}
    onChange={(icon) => update({ icon })}
  />
</div>
```

---

### 4. Live Preview Komponente

Die Preview zeigt die Karte in Echtzeit an, wie sie auf der Website erscheinen wird:

```tsx
<CardPreview 
  config={currentConfig}
  viewport="desktop" | "tablet" | "mobile"
/>
```

**Features:**
- Viewport-Umschalter (Desktop/Tablet/Mobile)
- Echte Rendering-Engine (gleiche wie Frontend)
- Skalierte Darstellung im Editor

---

### 5. Implementierungs-Plan

#### Phase 1: IconPicker in bestehende Editoren integrieren ✅ ERLEDIGT
1. ✅ IconPicker existiert bereits
2. ✅ In CardServiceEditor eingebaut (TextInput → IconPicker)
3. 🔄 Icon-Styling mit IconEditor ermöglichen

#### Phase 2: MediaLibrary Single-Select Mode ✅ ERLEDIGT
1. ✅ `singleSelect` Prop zu MediaLibrary hinzugefügt
2. ✅ Nur ein Bild auswählbar wenn `singleSelect={true}`
3. ✅ "Übernehmen" und "Abbrechen" Buttons im Header
4. ✅ "Alle auswählen" Option ausgeblendet im Single-Select-Mode

#### Phase 3: GenericCardEditor ✅ ERLEDIGT
1. ✅ `GenericCardEditor.tsx` erstellt mit wiederverwendbaren Komponenten:
   - `EditorSection` - Klappbare Abschnitte
   - `ColorPicker` - Farbauswahl
   - `Select` - Dropdown-Auswahl
   - `TextInput` - Texteingabe (einzeilig & mehrzeilig)
   - `NumberInput` - Zahleneingabe
   - `Toggle` - Ein/Aus-Schalter
   - `ImagePicker` - Bildauswahl mit MediaLibrary (Single-Select)
   - `IconPickerField` - Icon-Auswahl mit IconPicker
   - `GenericCardEditorLayout` - Editor mit 60/40 Split und Live-Preview

2. ✅ Vordefinierte Select-Optionen:
   - `BORDER_RADIUS_OPTIONS`
   - `SHADOW_OPTIONS`
   - `SPACING_OPTIONS`
   - `FONT_SIZE_OPTIONS`
   - `FONT_WEIGHT_OPTIONS`
   - `HOVER_EFFECT_OPTIONS`
   - `IMAGE_ASPECT_OPTIONS`
   - `IMAGE_FIT_OPTIONS`

#### Phase 4: Weitere Card-Editoren anpassen 🔄
1. 🔄 CardTeamEditor mit GenericCardEditor-Komponenten
2. 🔄 CardTestimonialEditor mit GenericCardEditor-Komponenten

---

### 6. Verwendung des GenericCardEditorLayout

**Beispiel:**

```tsx
import {
  GenericCardEditorLayout,
  EditorSection,
  TextInput,
  ImagePicker,
  IconPickerField,
  ColorPicker,
  Toggle,
  Select,
  BORDER_RADIUS_OPTIONS
} from './GenericCardEditor';
import { Layout, Palette, Type } from 'lucide-react';

const MyCardEditor: React.FC = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <GenericCardEditorLayout
      title="Service-Karte bearbeiten"
      subtitle="Konfigurieren Sie Ihre Service-Karte"
      onBack={() => navigate('/admin')}
      onSave={handleSave}
      saving={saving}
      hasChanges={hasChanges}
      editorContent={
        <>
          <EditorSection title="Inhalt" icon={<Type className="w-4 h-4" />} defaultExpanded>
            <TextInput
              label="Titel"
              value={config.title}
              onChange={(title) => updateConfig({ title })}
            />
            <TextInput
              label="Beschreibung"
              value={config.description}
              onChange={(description) => updateConfig({ description })}
              multiline
            />
            <IconPickerField
              label="Icon"
              value={config.icon}
              onChange={(icon) => updateConfig({ icon })}
            />
            <ImagePicker
              label="Bild"
              value={config.image}
              onChange={(image) => updateConfig({ image })}
            />
          </EditorSection>

          <EditorSection title="Styling" icon={<Palette className="w-4 h-4" />}>
            <ColorPicker
              label="Hintergrundfarbe"
              value={config.backgroundColor}
              onChange={(backgroundColor) => updateConfig({ backgroundColor })}
            />
            <Select
              label="Rahmenradius"
              value={config.borderRadius}
              options={BORDER_RADIUS_OPTIONS}
              onChange={(borderRadius) => updateConfig({ borderRadius })}
            />
          </EditorSection>
        </>
      }
      previewContent={
        <MyCardPreview config={config} />
      }
    />
  );
};
```

---

## Erledigte Aufgaben

- ✅ IconPicker in CardServiceEditor integriert
- ✅ MediaLibrary um `singleSelect` Prop erweitert
- ✅ GenericCardEditor Komponenten erstellt
- ✅ Build erfolgreich

---

## Nächste Schritte

1. CardTeamEditor und CardTestimonialEditor auf die neuen Komponenten umstellen
2. Preview-Komponenten für jeden Karten-Typ erstellen
3. Einheitliche Card-Preview-Engine entwickeln
