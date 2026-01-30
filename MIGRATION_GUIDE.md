# Hybrid-Architektur Migration - Anleitung

## ✅ Was wurde erstellt:

### 1. **SQL Migration** ([supabase-website-hybrid.sql](supabase-website-hybrid.sql))
- Neue Tabelle `websites` mit customer_id, site_name, content (JSONB)
- Automatische Migration aller bestehenden Daten ins JSONB-Format
- Media Files bleiben in separaten Tabellen

### 2. **WebsiteContext** ([src/contexts/WebsiteContext.tsx](src/contexts/WebsiteContext.tsx))
- Zentrales State Management für alle Website-Daten
- TypeScript Types für alle Entitäten
- Helper-Funktionen für Updates (updateService, updatePage, etc.)
- Optimistic Updates

## 📋 Migrations-Schritte:

### Schritt 1: SQL ausführen

```bash
# In Supabase SQL Editor ausführen:
# Datei: supabase-website-hybrid.sql
```

Das Script:
- ✅ Erstellt `websites` Tabelle
- ✅ Migriert alle Daten von alten Tabellen ins JSONB
- ✅ Setzt RLS Policies
- ✅ Alte Tabellen bleiben erhalten (für Rollback)

### Schritt 2: Customer ID laden

Erstelle einen Hook zum Laden der Customer ID:

```typescript
// src/hooks/useCustomerId.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCustomerId = () => {
  const [customerId, setCustomerId] = useState<string>('000000');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerId = async () => {
      const { data } = await supabase
        .from('websites')
        .select('customer_id')
        .single();
      
      if (data?.customer_id) {
        setCustomerId(data.customer_id);
      }
      setLoading(false);
    };

    loadCustomerId();
  }, []);

  return { customerId, loading };
};
```

### Schritt 3: App.tsx erweitern

```typescript
import { WebsiteProvider } from './contexts/WebsiteContext';
import { useCustomerId } from './hooks/useCustomerId';

function AppContent() {
  const { customerId, loading } = useCustomerId();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <WebsiteProvider customerId={customerId}>
      <Router>
        <Routes>
          {/* ... bestehende Routes */}
        </Routes>
      </Router>
    </WebsiteProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

### Schritt 4: Komponenten migrieren (Beispiel)

#### Alt (Direkter Supabase-Zugriff):

```typescript
// ServicesEditor.tsx - ALT
const ServicesEditor = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('display_order');
    setServices(data || []);
  };

  const handleUpdate = async (id: string, updates: Partial<Service>) => {
    await supabase
      .from('services')
      .update(updates)
      .eq('id', id);
    loadServices();
  };

  // ...
};
```

#### Neu (WebsiteContext):

```typescript
// ServicesEditor.tsx - NEU
import { useWebsite } from '../../contexts/WebsiteContext';

const ServicesEditor = () => {
  const { website, updateService, addService, deleteService } = useWebsite();
  
  // Services sind direkt verfügbar
  const services = website?.services || [];

  const handleUpdate = async (id: string, updates: Partial<Service>) => {
    await updateService(id, updates);
    // Kein reload nötig - optimistic update!
  };

  const handleAdd = async (service: Omit<Service, 'id'>) => {
    const newId = await addService(service);
    console.log('Created service:', newId);
  };

  const handleDelete = async (id: string) => {
    await deleteService(id);
  };

  // ...
};
```

## 🎯 Vorteile der neuen Architektur:

### 1. **Weniger Code**
```typescript
// ALT: 3 Zeilen
const { data } = await supabase.from('services').select('*');
setServices(data);
await supabase.from('services').update(updates).eq('id', id);

// NEU: 1 Zeile
await updateService(id, updates);
```

### 2. **Optimistic Updates**
```typescript
// Sofortige UI-Updates, kein Flickern
await updateService(id, { name: 'Neuer Name' });
// UI ist sofort aktualisiert, kein reload nötig
```

### 3. **Type Safety**
```typescript
// Alle Typen sind definiert
const services: Service[] = website?.services || [];
const pages: Page[] = website?.pages || [];
```

### 4. **Ein Query für alles**
```typescript
// ALT: Viele Queries
const services = await supabase.from('services').select('*');
const pages = await supabase.from('pages').select('*');
const contact = await supabase.from('contact').select('*');

// NEU: Ein Query
const { website } = useWebsite();
// Alle Daten sind verfügbar
```

## 📦 Komponenten-Migration Priorität:

### Phase 1 (Einfach):
1. ✅ **ServicesEditor** - Liste mit CRUD
2. ✅ **ContactEditor** - Einzelnes Objekt
3. ✅ **HoursEditor** - Liste mit fester Struktur
4. ✅ **ReviewsEditor** - Liste mit CRUD
5. ✅ **SettingsEditor** - site_settings Updates

### Phase 2 (Mittel):
6. **AboutEditor** - Nested data (team members)
7. **GalleryEditor** - Image Management
8. **StaticContentEditor** - Imprint, Privacy, Terms

### Phase 3 (Komplex):
9. **PageManager** - Pages Liste
10. **BlockManager** - Nested Blocks mit verschiedenen Typen
11. **DynamicPage** - Frontend-Rendering

## 🔄 Beispiel: ServicesEditor Migration

### Datei erstellen: `src/components/admin/ServicesEditorNew.tsx`

```typescript
import React, { useState } from 'react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { Service } from '../../contexts/WebsiteContext';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export const ServicesEditorNew: React.FC = () => {
  const { website, updateServices, updateService, addService, deleteService } = useWebsite();
  const [editingId, setEditingId] = useState<string | null>(null);

  const services = website?.services || [];

  const handleAdd = async () => {
    const newService: Omit<Service, 'id'> = {
      name: 'Neue Leistung',
      description: '',
      price: '0',
      duration: 30,
      category: 'Allgemein',
      is_featured: false,
      display_order: services.length,
    };

    await addService(newService);
  };

  const handleUpdate = async (id: string, field: keyof Service, value: any) => {
    await updateService(id, { [field]: value });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Leistung wirklich löschen?')) {
      await deleteService(id);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...services];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    
    // Update display_order
    const updated = reordered.map((s, i) => ({ ...s, display_order: i }));
    await updateServices(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leistungen</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Neue Leistung
        </button>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
              
              <div className="flex-1 grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => handleUpdate(service.id, 'name', e.target.value)}
                  className="border rounded px-3 py-2"
                  placeholder="Name"
                />
                
                <input
                  type="text"
                  value={service.price}
                  onChange={(e) => handleUpdate(service.id, 'price', e.target.value)}
                  className="border rounded px-3 py-2"
                  placeholder="Preis"
                />
                
                <textarea
                  value={service.description}
                  onChange={(e) => handleUpdate(service.id, 'description', e.target.value)}
                  className="border rounded px-3 py-2 col-span-2"
                  placeholder="Beschreibung"
                  rows={2}
                />
              </div>

              <button
                onClick={() => handleDelete(service.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🧪 Testing:

```bash
# 1. SQL ausführen
# 2. Dev-Server starten
npm run dev

# 3. Login ins Admin
# 4. Services Editor öffnen
# 5. Service bearbeiten → sollte sofort gespeichert werden
# 6. In Supabase prüfen: websites.content.services
```

## 🔍 Debugging:

```typescript
// WebsiteContext content prüfen
const { website } = useWebsite();
console.log('All website data:', website);
console.log('Services:', website?.services);
console.log('Pages:', website?.pages);

// In Supabase SQL Editor:
SELECT content->'services' FROM websites WHERE customer_id = '123456';
```

## 📊 Migration Tracking:

- [ ] SQL Migration ausgeführt
- [ ] useCustomerId Hook erstellt
- [ ] App.tsx mit WebsiteProvider erweitert
- [ ] ServicesEditor migriert
- [ ] ContactEditor migriert
- [ ] HoursEditor migriert
- [ ] ReviewsEditor migriert
- [ ] SettingsEditor migriert
- [ ] AboutEditor migriert
- [ ] GalleryEditor migriert
- [ ] StaticContentEditor migriert
- [ ] PageManager migriert
- [ ] BlockManager migriert
- [ ] DynamicPage migriert

## 🚀 Nächste Schritte:

1. **Jetzt**: SQL ausführen, Customer ID Hook erstellen
2. **Dann**: App.tsx mit WebsiteProvider erweitern
3. **Danach**: Eine Komponente nach der anderen migrieren
4. **Testen**: Nach jeder Migration testen

Soll ich mit Schritt 1 (useCustomerId Hook) beginnen?
