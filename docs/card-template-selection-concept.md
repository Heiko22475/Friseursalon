# Konzept: Kartenvorlagen-Auswahl im Admin-Bereich

## Überblick

Wenn ein Admin-Benutzer einen "Flexible Karte" (Generic Card) Baustein auf einer Seite hinzufügt, soll er zunächst eine Kartenvorlage aus den vom Superadmin erstellten Templates auswählen können.

---

## Anforderungen

### 1. Ablauf beim Hinzufügen eines Bausteins

**Aktueller Ablauf:**
1. Admin klickt auf "Baustein hinzufügen"
2. Wählt "Flexible Karte" aus
3. Baustein wird mit Standard-Konfiguration erstellt
4. Admin kann dann den Baustein bearbeiten

**Neuer Ablauf:**
1. Admin klickt auf "Baustein hinzufügen"
2. Wählt "Flexible Karte" aus
3. **Vorlagen-Auswahl-Dialog öffnet sich**
4. Admin wählt eine Vorlage aus
5. Baustein wird mit der gewählten Vorlage erstellt
6. Baustein speichert Referenz zur verwendeten Vorlage
7. Admin kann dann den Baustein bearbeiten

---

## Technische Implementierung

### 1. Datenstruktur

**Erweiterung der Block-Daten (im JSON):**
```typescript
interface GenericCardBlock {
  id: string;
  type: 'generic-card';
  config: GenericCardConfig;
  templateId?: string;          // NEU: Referenz zur Vorlage
  templateName?: string;         // NEU: Name der Vorlage (für Display)
  templateCategory?: string;     // NEU: Kategorie (optional)
  customized: boolean;           // NEU: Wurde nach Auswahl bearbeitet?
  order: number;
}
```

### 2. Komponenten

**Neue Komponente: `CardTemplateSelectionDialog.tsx`**
```
Zweck: Modal-Dialog zur Auswahl einer Kartenvorlage
Location: src/components/admin/CardTemplateSelectionDialog.tsx

Features:
- Lädt card_templates aus Datenbank
- Filterfunktionen nach Kategorie
- Suchfunktion
- Live-Vorschau der Karten
- Grid-Layout (ähnlich wie CardTemplatesPage)
- Button "Ohne Vorlage starten" (leere Karte)
```

**Erweiterung: `DynamicPage.tsx` oder Block-Management**
```
- Prüft beim Hinzufügen eines generic-card Blocks
- Öffnet CardTemplateSelectionDialog
- Wartet auf Auswahl
- Erstellt Block mit gewählter Vorlage
```

### 3. Workflow-Details

**Schritt 1: Vorlage laden**
```typescript
// In CardTemplateSelectionDialog
const loadTemplates = async () => {
  const { data, error } = await supabase
    .from('card_templates')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });
  
  return data;
};
```

**Schritt 2: Block mit Vorlage erstellen**
```typescript
const createBlockFromTemplate = (template: CardTemplate) => {
  const newBlock: GenericCardBlock = {
    id: crypto.randomUUID(),
    type: 'generic-card',
    config: template.config, // Kopiere Vorlage-Config
    templateId: template.id,
    templateName: template.name,
    templateCategory: template.category,
    customized: false,
    order: blocks.length,
  };
  
  // Speichere Block im JSON
  updateWebsiteBlocks([...blocks, newBlock]);
};
```

**Schritt 3: Markierung bei Bearbeitung**
```typescript
// In GenericCardEditorPage
const handleConfigChange = (newConfig: GenericCardConfig) => {
  setBlock({
    ...block,
    config: newConfig,
    customized: true, // Markiere als angepasst
  });
};
```

---

## UI/UX Design

### Dialog-Layout

```
┌─────────────────────────────────────────────────────┐
│  Kartenvorlage auswählen                      [X]   │
├─────────────────────────────────────────────────────┤
│  [Suche...] [Alle Kategorien ▼] [Filter]          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Preview  │  │ Preview  │  │ Preview  │         │
│  │  Card 1  │  │  Card 2  │  │  Card 3  │         │
│  │          │  │          │  │          │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│  Services       Team          Products             │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Preview  │  │ Preview  │  │ Preview  │         │
│  │  Card 4  │  │  Card 5  │  │  Card 6  │         │
│  │          │  │          │  │          │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│  General        Business      Team                 │
│                                                      │
├─────────────────────────────────────────────────────┤
│  [Ohne Vorlage starten]            [Abbrechen]     │
└─────────────────────────────────────────────────────┘
```

### Vorlage-Karte (Preview Item)

```
┌─────────────────────┐
│                     │
│   [Card Preview]    │  ← Kleine Vorschau der Karte
│                     │
├─────────────────────┤
│ Vorlage-Name        │
│ 📁 Kategorie        │
│                     │
│ [Auswählen]         │
└─────────────────────┘
```

### Bestätigungs-Info nach Auswahl

```
✓ Baustein mit Vorlage "Dienstleistungs-Karte" erstellt
  Sie können die Karte jetzt bearbeiten.
```

---

## Zusätzliche Features

### 1. Vorlagen-Info im Editor

**Im GenericCardEditorPage Header:**
```
┌─────────────────────────────────────────────────┐
│ ← Zurück    Flexible Karte bearbeiten          │
│                                                  │
│ 📋 Basiert auf Vorlage: "Dienstleistungen"     │
│    [Zur Vorlage zurücksetzen]                  │
└─────────────────────────────────────────────────┘
```

### 2. Zurücksetzen zur Vorlage

- Button "Zur Vorlage zurücksetzen" im Editor
- Lädt Original-Config der Vorlage neu
- Warnung: "Alle Änderungen gehen verloren"
- Setzt `customized` auf `false`

### 3. Vorlage aktualisieren (Optional, Zukunft)

Wenn der Superadmin eine Vorlage aktualisiert:
- Admin erhält Benachrichtigung
- Option: "Vorlage wurde aktualisiert. Übernehmen?"
- Nur wenn `customized === false`

### 4. "Ohne Vorlage" Option

- Erstellt leere Generic Card mit Standardwerten
- Keine templateId
- customized = true (von Anfang an)

---

## Implementierungs-Schritte

### Phase 1: Basis-Implementierung
1. ✅ Datenstruktur erweitern (Block-Interface)
2. ✅ CardTemplateSelectionDialog erstellen
3. ✅ Integration in Block-Hinzufügen-Flow
4. ✅ Vorlage-Referenz im Block speichern

### Phase 2: Editor-Integration
1. ✅ Vorlage-Info im Editor anzeigen
2. ✅ "Zur Vorlage zurücksetzen" Button
3. ✅ customized-Flag setzen bei Änderungen

### Phase 3: UX-Verbesserungen
1. ⏳ Vorlage-Kategorien
2. ⏳ Suchfunktion
3. ⏳ Bessere Vorschau-Darstellung
4. ⏳ Keyboard-Navigation (Pfeiltasten, Enter)

### Phase 4: Erweiterte Features (Optional)
1. ⏳ Vorlage-Update-Benachrichtigungen
2. ⏳ Vorlage-Versionierung
3. ⏳ "Favoriten" markieren
4. ⏳ Letzte verwendete Vorlagen

---

## Datenbankänderungen

**Keine Änderungen an bestehenden Tabellen nötig!**

Die Vorlage-Referenz wird im JSON gespeichert:
```json
{
  "pages": [
    {
      "id": "...",
      "blocks": [
        {
          "id": "abc123",
          "type": "generic-card",
          "templateId": "template-uuid-here",
          "templateName": "Dienstleistungen",
          "templateCategory": "service",
          "customized": false,
          "config": { /* GenericCardConfig */ }
        }
      ]
    }
  ]
}
```

---

## Beispiel-Code

### CardTemplateSelectionDialog (Skelett)

```tsx
interface CardTemplateSelectionDialogProps {
  onSelect: (template: CardTemplate | null) => void;
  onCancel: () => void;
}

export const CardTemplateSelectionDialog: React.FC<CardTemplateSelectionDialogProps> = ({ 
  onSelect, 
  onCancel 
}) => {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('card_templates')
      .select('*')
      .eq('is_active', true);
    setTemplates(data || []);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Kartenvorlage auswählen</h2>
          {/* Search & Filters */}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="border rounded-lg p-4">
                {/* Preview */}
                <div className="h-48 mb-4">
                  <GenericCard config={template.config} />
                </div>
                
                {/* Info */}
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.category}</p>
                
                {/* Button */}
                <button
                  onClick={() => onSelect(template)}
                  className="mt-4 w-full px-4 py-2 bg-rose-500 text-white rounded-lg"
                >
                  Auswählen
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <button onClick={() => onSelect(null)}>
            Ohne Vorlage starten
          </button>
          <button onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## Offene Fragen

1. **Vorlage-Updates**: Wie soll mit Updates von Vorlagen umgegangen werden?
   - Automatisch übernehmen (wenn nicht customized)?
   - Benachrichtigung mit Opt-in?
   - Ignorieren?

2. **Mehrfachverwendung**: Kann eine Vorlage mehrfach auf einer Seite verwendet werden?
   - Ja (empfohlen)
   - Jede Instanz hat eigene customized-Flag

3. **Migration**: Wie werden bestehende Generic Card Blöcke behandelt?
   - templateId bleibt leer
   - customized = true (da bereits bearbeitet)
   - Funktioniert normal weiter

4. **Vorlage löschen**: Was passiert, wenn eine Vorlage gelöscht wird?
   - Block funktioniert weiter (hat eigene config-Kopie)
   - templateId zeigt auf nicht existierende Vorlage
   - Info im Editor: "Vorlage nicht mehr verfügbar"

---

## Vorteile dieser Lösung

✅ **Für Admins:**
- Schneller Start mit professionellen Vorlagen
- Konsistentes Design über mehrere Karten
- Einfache Anpassung nach Auswahl

✅ **Für Superadmin:**
- Zentrale Vorlage-Verwaltung
- Kann Vorlagen für verschiedene Branchen erstellen
- Kann beliebte Vorlagen tracken (via templateId)

✅ **Technisch:**
- Keine Datenbankänderungen nötig
- Backward-kompatibel (bestehende Blöcke funktionieren)
- Flexibel erweiterbar
- JSON bleibt Source of Truth

---

## Nächste Schritte

1. Feedback zu diesem Konzept einholen
2. UI-Mockups erstellen
3. CardTemplateSelectionDialog implementieren
4. Block-Interface erweitern
5. Integration in Block-Hinzufügen-Flow
6. Testing mit mehreren Vorlagen
7. Dokumentation aktualisieren
