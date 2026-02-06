# Browser Alert Replacement Guide

## Übersicht

Dieser Guide zeigt, wie `alert()` und `window.confirm()` durch den neuen `ConfirmDialog` ersetzt werden.

## Pattern: Verwendung des useConfirmDialog Hook

### 1. Import hinzufügen

```tsx
import { useConfirmDialog } from './admin/ConfirmDialog';
```

### 2. Hook initialisieren

```tsx
const { Dialog, confirm, alert, success, error, warning } = useConfirmDialog();
```

### 3. Dialog-Komponente rendern

```tsx
return (
  <div>
    <Dialog />
    {/* Rest of component */}
  </div>
);
```

### 4. Alte Alerts ersetzen

#### Einfaches Alert

**Vorher:**
```tsx
alert('Benutzer erfolgreich angelegt!');
```

**Nachher:**
```tsx
await success('Erfolg', 'Benutzer erfolgreich angelegt!');
```

#### Error Alert

**Vorher:**
```tsx
alert('Fehler beim Laden der Benutzer');
```

**Nachher:**
```tsx
await error('Fehler', 'Fehler beim Laden der Benutzer');
```

#### Confirm Dialog

**Vorher:**
```tsx
if (!window.confirm('Möchten Sie wirklich löschen?')) {
  return;
}
// Aktion ausführen
```

**Nachher:**
```tsx
await confirm(
  'Löschen bestätigen',
  'Möchten Sie wirklich löschen? Dies kann nicht rückgängig gemacht werden.',
  async () => {
    // Aktion ausführen
  },
  { isDangerous: true }
);
```

#### Confirm mit destructiver Operation

**Vorher:**
```tsx
if (!window.confirm(`Möchten Sie den Benutzer ${customerId} wirklich löschen?`)) {
  return;
}
await deleteUser();
```

**Nachher:**
```tsx
await confirm(
  'Benutzer löschen',
  `Möchten Sie den Benutzer ${customerId} wirklich löschen? Dies kann nicht rückgängig gemacht werden.`,
  async () => {
    await deleteUser();
  },
  { 
    confirmText: 'Löschen',
    cancelText: 'Abbrechen',
    isDangerous: true 
  }
);
```

## Betroffene Dateien

Die folgenden Dateien enthalten `alert()` oder `window.confirm()` und sollten aktualisiert werden:

### Superadmin
- [x] `src/components/superadmin/UserManagement.tsx` (11 Aufrufe)

### Admin
- [ ] `src/components/admin/LogoDesigner/LogoEditor.tsx` (1 Aufruf)
- [ ] `src/components/admin/GenericCardEditorPage.tsx` (4 Aufrufe)
- [ ] `src/components/ThemeManager.tsx` (6 Aufrufe)

### Superadmin Pages
- [ ] `src/pages/superadmin/CardTemplatesPage.tsx` (4 Aufrufe)
- [ ] `src/pages/superadmin/CardTemplateEditorPage.tsx` (5 Aufrufe)

## Vorteile des neuen Systems

1. **Konsistentes Design**: Alle Dialoge folgen dem App-Design
2. **Bessere UX**: Icons, Farben, klare Hierarchie
3. **Flexibilität**: ReactNode als Message (HTML-Formatierung möglich)
4. **Typsicherheit**: TypeScript-Support
5. **Non-Blocking**: Async/Await statt blocking alert()
6. **Wiederverwendbar**: Ein Hook für alle Dialoge

## Beispiel: Vollständige Komponente

```tsx
import React, { useState } from 'react';
import { useConfirmDialog } from './admin/ConfirmDialog';

export const MyComponent: React.FC = () => {
  const { Dialog, confirm, success, error } = useConfirmDialog();
  const [data, setData] = useState(null);

  const handleDelete = async (id: string) => {
    await confirm(
      'Löschen bestätigen',
      'Möchten Sie diesen Eintrag wirklich löschen?',
      async () => {
        try {
          await deleteItem(id);
          await success('Erfolgreich gelöscht', 'Der Eintrag wurde entfernt.');
          loadData();
        } catch (err) {
          await error('Fehler', 'Der Eintrag konnte nicht gelöscht werden.');
        }
      },
      { isDangerous: true }
    );
  };

  return (
    <div>
      <Dialog />
      
      <button onClick={() => handleDelete('123')}>
        Löschen
      </button>
    </div>
  );
};
```

## Migration Checklist

Für jede Datei:

1. [ ] Import `useConfirmDialog` hinzufügen
2. [ ] Hook initialisieren
3. [ ] `<Dialog />` Komponente rendern
4. [ ] Alle `alert()` durch `success()`, `error()` oder `warning()` ersetzen
5. [ ] Alle `window.confirm()` durch `confirm()` ersetzen
6. [ ] Callbacks in `async () => {}` wrappen bei confirm()
7. [ ] `isDangerous: true` bei destructiven Operationen setzen
8. [ ] Testen der Dialoge

## Notes

- Dialog-Funktionen sind `async` und können mit `await` verwendet werden
- Der Dialog schließt sich automatisch nach Bestätigung
- Bei `confirm()` muss die Aktion im Callback statt inline passieren
- `isDangerous` färbt den Dialog rot für destruktive Operationen
- ReactNode als `message` ermöglicht HTML-Formatierung:
  ```tsx
  message: (
    <div>
      <p>Erste Zeile</p>
      <ul>
        <li>Punkt 1</li>
        <li>Punkt 2</li>
      </ul>
    </div>
  )
  ```
