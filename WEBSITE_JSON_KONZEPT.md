# Website-Architektur: JSON-Blob Konzept

## 🎯 Ziel

Umstellung von relationaler Datenbank-Struktur auf Single-Table-Design mit JSON-Blob für alle Website-Daten.

## 📊 Neue Tabellenstruktur

### Tabelle: `websites`

```sql
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(6) UNIQUE NOT NULL CHECK (customer_id ~ '^[0-9]{6}$'),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellen Zugriff per customer_id
CREATE INDEX idx_websites_customer_id ON websites(customer_id);

-- GIN Index für JSONB Queries
CREATE UNIQUE INDEX idx_websites_content ON websites USING GIN (content);

-- Trigger für updated_at
CREATE TRIGGER update_websites_updated_at 
  BEFORE UPDATE ON websites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🗂️ JSON-Schema für `content`-Feld

```json
{
  "site_settings": {
    "site_name": "Salon Beispiel",
    "header_type": "simple",
    "theme": {
      "primary_color": "#e11d48",
      "font_family": "Inter"
    }
  },
  
  "pages": [
    {
      "id": "uuid",
      "title": "Startseite",
      "slug": "",
      "is_home": true,
      "is_published": true,
      "meta_description": "...",
      "seo_title": "...",
      "display_order": 0,
      "blocks": [
        {
          "id": "uuid",
          "type": "hero",
          "position": 0,
          "config": { /* block-specific config */ },
          "content": { /* block-specific content */ }
        },
        {
          "id": "uuid",
          "type": "services",
          "position": 1,
          "config": { "layout": "grid", "columns": 3 },
          "content": {
            "title": "Unsere Leistungen",
            "services": [
              {
                "id": "uuid",
                "name": "Haarschnitt",
                "description": "...",
                "price": "35",
                "duration": 45,
                "display_order": 0
              }
            ]
          }
        },
        {
          "id": "uuid",
          "type": "grid",
          "position": 2,
          "config": { "layout_type": "50-50" },
          "content": {
            "items": [
              {
                "id": "uuid",
                "type": "services",
                "config": { /* nested config */ }
              }
            ]
          }
        }
      ]
    }
  ],
  
  "services": [
    {
      "id": "uuid",
      "name": "Haarschnitt Damen",
      "description": "...",
      "price": "45",
      "duration": 60,
      "category": "Damen",
      "is_featured": true,
      "display_order": 0
    }
  ],
  
  "contact": {
    "phone": "+49...",
    "email": "info@...",
    "address": {
      "street": "...",
      "postal_code": "...",
      "city": "...",
      "country": "Deutschland"
    },
    "social": {
      "facebook": "...",
      "instagram": "..."
    }
  },
  
  "business_hours": [
    {
      "id": "uuid",
      "day_of_week": 1,
      "day_name": "Montag",
      "is_open": true,
      "open_time": "09:00",
      "close_time": "18:00",
      "break_start": "12:00",
      "break_end": "13:00"
    }
  ],
  
  "reviews": [
    {
      "id": "uuid",
      "author_name": "Maria Schmidt",
      "rating": 5,
      "text": "...",
      "date": "2026-01-15",
      "is_featured": true
    }
  ],
  
  "about": {
    "title": "Über uns",
    "content": "<p>HTML Content...</p>",
    "team": [
      {
        "id": "uuid",
        "name": "Anna Müller",
        "position": "Friseurmeisterin",
        "bio": "...",
        "image_url": "..."
      }
    ]
  },
  
  "gallery": {
    "images": [
      {
        "id": "uuid",
        "url": "https://...",
        "alt_text": "...",
        "caption": "...",
        "display_order": 0
      }
    ]
  },
  
  "media": {
    "categories": [
      {
        "id": "uuid",
        "name": "images",
        "display_name": "Bilder",
        "folders": [
          {
            "id": "uuid",
            "name": "Salon",
            "files": [
              {
                "id": "uuid",
                "filename": "123456_salon_a8c3e9.jpg",
                "original_filename": "salon.jpg",
                "file_url": "https://...",
                "storage_path": "123456/images/123456_salon_a8c3e9.jpg",
                "file_type": "image",
                "file_size": 245678,
                "mime_type": "image/jpeg",
                "file_hash": "abc123...",
                "title": "Salon Innenansicht",
                "alt_text": "...",
                "width": 1920,
                "height": 1080,
                "created_at": "2026-01-30T10:00:00Z"
              }
            ]
          }
        ]
      }
    ]
  },
  
  "static_content": {
    "imprint": "<p>HTML...</p>",
    "privacy": "<p>HTML...</p>",
    "terms": "<p>HTML...</p>"
  }
}
```

## ⚖️ Vor- und Nachteile

### ✅ Vorteile:

1. **Einfache Multi-Tenancy**
   - Ein Datensatz = eine komplette Website
   - Perfekt für SaaS mit vielen Kunden
   - Einfaches Backup pro Kunde

2. **Flexible Schema-Evolution**
   - Keine Migrations für neue Felder
   - Kunden können unterschiedliche Features haben
   - A/B-Testing einfacher

3. **Atomic Updates**
   - Gesamte Website in einer Transaction
   - Keine inkonsistenten Zustände durch Partial Updates

4. **Einfaches Export/Import**
   - Ein JSON = komplette Website
   - Copy-Paste für Templates/Duplikate
   - Version Control möglich

5. **Performance**
   - Ein Query statt vieler JOINs
   - Weniger DB-Roundtrips
   - Optimale für Read-Heavy Workloads

### ❌ Nachteile:

1. **Eingeschränkte Queries**
   - Keine einfachen SQL-JOINs
   - Filtern/Sortieren über JSONB schwieriger
   - Aggregationen komplexer

2. **Größere Payload**
   - Immer gesamtes JSON laden (auch wenn nur ein Teil benötigt)
   - Mehr Netzwerk-Traffic
   - Mehr Memory-Verbrauch

3. **Client-Side Komplexität**
   - Mehr Logic im Frontend
   - State Management aufwändiger
   - Validierung komplett im Client

4. **Kein Foreign Key Constraints**
   - Referential Integrity muss im Code sichergestellt werden
   - Keine DB-Level Validierung
   - Orphaned Data möglich

5. **Schwierigere Analysen**
   - Business Intelligence Tools können nicht direkt auf Daten zugreifen
   - Custom ETL notwendig
   - Reporting komplizierter

## 🔄 Migration Strategy

### Phase 1: Neue Struktur vorbereiten

```sql
-- 1. Neue Tabelle erstellen
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(6) UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Daten migrieren
INSERT INTO websites (customer_id, content)
SELECT 
  customer_id,
  jsonb_build_object(
    'site_settings', (SELECT row_to_json(site_settings.*) FROM site_settings LIMIT 1),
    'pages', (SELECT jsonb_agg(row_to_json(p.*)) FROM pages p),
    'services', (SELECT jsonb_agg(row_to_json(s.*)) FROM services s),
    'contact', (SELECT row_to_json(c.*) FROM contact c LIMIT 1),
    'business_hours', (SELECT jsonb_agg(row_to_json(bh.*)) FROM business_hours bh),
    'reviews', (SELECT jsonb_agg(row_to_json(r.*)) FROM reviews r),
    -- ... weitere Daten
  ) as content
FROM site_settings;
```

### Phase 2: Code Umstellung

**Alt (Relational):**
```typescript
const { data: services } = await supabase
  .from('services')
  .select('*')
  .order('display_order');
```

**Neu (JSON-Blob):**
```typescript
const { data: website } = await supabase
  .from('websites')
  .select('content')
  .eq('customer_id', customerId)
  .single();

const services = website?.content?.services || [];
```

### Phase 3: Context Provider

```typescript
// WebsiteContext.tsx
interface WebsiteContextType {
  website: Website | null;
  loading: boolean;
  updateWebsite: (updates: Partial<Website>) => Promise<void>;
  updateServices: (services: Service[]) => Promise<void>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
}

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [website, setWebsite] = useState<Website | null>(null);
  
  useEffect(() => {
    loadWebsite();
  }, []);
  
  const loadWebsite = async () => {
    const { data } = await supabase
      .from('websites')
      .select('content')
      .eq('customer_id', customerId)
      .single();
    
    setWebsite(data?.content);
  };
  
  const updateWebsite = async (updates: Partial<Website>) => {
    const newContent = { ...website, ...updates };
    
    const { error } = await supabase
      .from('websites')
      .update({ content: newContent })
      .eq('customer_id', customerId);
    
    if (!error) setWebsite(newContent);
  };
  
  // Helper für spezifische Updates
  const updateServices = async (services: Service[]) => {
    await updateWebsite({ services });
  };
  
  return (
    <WebsiteContext.Provider value={{ website, updateWebsite, updateServices }}>
      {children}
    </WebsiteContext.Provider>
  );
};
```

## 🔍 JSONB Query Examples

```sql
-- Alle Seiten eines Kunden
SELECT content->'pages' 
FROM websites 
WHERE customer_id = '123456';

-- Bestimmte Page finden
SELECT jsonb_array_elements(content->'pages') as page
FROM websites 
WHERE customer_id = '123456'
AND content->'pages' @> '[{"slug": "kontakt"}]';

-- Service-Namen extrahieren
SELECT 
  customer_id,
  jsonb_array_elements(content->'services')->>'name' as service_name
FROM websites;

-- Alle Kunden mit Instagram
SELECT customer_id
FROM websites
WHERE content->'contact'->'social'->>'instagram' IS NOT NULL;

-- Update einzelnes Feld
UPDATE websites
SET content = jsonb_set(
  content, 
  '{site_settings,site_name}', 
  '"Neuer Name"'
)
WHERE customer_id = '123456';
```

## 🎨 Frontend Pattern

### 1. Global State (Zustand/Redux)

```typescript
// store/websiteSlice.ts
const websiteSlice = createSlice({
  name: 'website',
  initialState: { content: null, loading: false },
  reducers: {
    setWebsite: (state, action) => {
      state.content = action.payload;
    },
    updateServices: (state, action) => {
      state.content.services = action.payload;
    },
    updatePage: (state, action) => {
      const { pageId, updates } = action.payload;
      const page = state.content.pages.find(p => p.id === pageId);
      if (page) Object.assign(page, updates);
    }
  }
});
```

### 2. Optimistic Updates

```typescript
const updateService = async (serviceId: string, updates: Partial<Service>) => {
  // 1. Optimistic Update
  const oldServices = website.services;
  const newServices = oldServices.map(s => 
    s.id === serviceId ? { ...s, ...updates } : s
  );
  setWebsite({ ...website, services: newServices });
  
  // 2. Persist to DB
  try {
    await supabase
      .from('websites')
      .update({ content: { ...website, services: newServices } })
      .eq('customer_id', customerId);
  } catch (error) {
    // 3. Rollback on error
    setWebsite({ ...website, services: oldServices });
    alert('Fehler beim Speichern');
  }
};
```

### 3. Debounced Auto-Save

```typescript
const debouncedSave = useMemo(
  () => debounce((content: Website) => {
    supabase
      .from('websites')
      .update({ content })
      .eq('customer_id', customerId);
  }, 1000),
  []
);

useEffect(() => {
  if (website) debouncedSave(website);
}, [website]);
```

## 🔒 Sicherheit & Validierung

### 1. Row Level Security

```sql
-- Kunden können nur ihre eigene Website sehen/bearbeiten
CREATE POLICY "Users can only access their own website"
ON websites FOR ALL TO authenticated
USING (customer_id = current_setting('app.customer_id', true))
WITH CHECK (customer_id = current_setting('app.customer_id', true));
```

### 2. JSON Schema Validation (Supabase Function)

```sql
CREATE OR REPLACE FUNCTION validate_website_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Prüfe required fields
  IF NOT (NEW.content ? 'site_settings') THEN
    RAISE EXCEPTION 'Missing required field: site_settings';
  END IF;
  
  IF NOT (NEW.content ? 'pages') THEN
    RAISE EXCEPTION 'Missing required field: pages';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_website_content_trigger
BEFORE INSERT OR UPDATE ON websites
FOR EACH ROW EXECUTE FUNCTION validate_website_content();
```

### 3. TypeScript Validation (Zod)

```typescript
import { z } from 'zod';

const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.string(),
  duration: z.number().positive(),
});

const WebsiteSchema = z.object({
  site_settings: z.object({
    site_name: z.string().min(1),
    header_type: z.enum(['simple', 'centered', 'split']),
  }),
  pages: z.array(PageSchema),
  services: z.array(ServiceSchema),
  // ...
});

// Validate before save
const result = WebsiteSchema.safeParse(websiteData);
if (!result.success) {
  console.error(result.error);
}
```

## 📦 Backup & Versioning

### 1. Automatisches Backup

```sql
-- Version History Tabelle
CREATE TABLE website_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  customer_id VARCHAR(6) NOT NULL,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger für automatische Version bei Update
CREATE OR REPLACE FUNCTION create_website_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO website_versions (website_id, customer_id, content, version_number)
  SELECT 
    OLD.id,
    OLD.customer_id,
    OLD.content,
    COALESCE(MAX(version_number), 0) + 1
  FROM website_versions
  WHERE website_id = OLD.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backup_website_on_update
BEFORE UPDATE ON websites
FOR EACH ROW EXECUTE FUNCTION create_website_version();
```

### 2. Manual Snapshots

```typescript
const createSnapshot = async (label: string) => {
  await supabase.from('website_versions').insert({
    website_id: websiteId,
    customer_id: customerId,
    content: website,
    created_by: user.email,
    label,
  });
};
```

## 🚀 Empfehlung

### Hybrid-Ansatz (Best of Both Worlds)

```sql
CREATE TABLE websites (
  id UUID PRIMARY KEY,
  customer_id VARCHAR(6) UNIQUE NOT NULL,
  
  -- Häufig abgefragte Felder als Spalten
  site_name TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  
  -- Rest als JSONB
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ODER: Separate Tabellen für kritische Daten
CREATE TABLE websites (
  id UUID PRIMARY KEY,
  customer_id VARCHAR(6) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Files weiterhin in eigener Tabelle (wegen Storage-Referenzen)
CREATE TABLE media_files (
  id UUID PRIMARY KEY,
  website_id UUID REFERENCES websites(id),
  -- ... rest wie gehabt
);
```

## 📊 Entscheidungsmatrix

| Kriterium | Relational (aktuell) | JSON-Blob | Hybrid |
|-----------|---------------------|-----------|---------|
| Query Performance | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Schema Flexibility | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Multi-Tenancy | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Data Integrity | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Reporting/BI | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Backup/Restore | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Code Complexity | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Fazit

**Empfehlung:** **Hybrid-Ansatz**

- **Core-Daten in Spalten**: customer_id, site_name, is_published
- **Content in JSONB**: Alle konfigurierbaren Inhalte
- **Media Files separate**: Eigene Tabelle wegen Storage-Integration
- **Best Practice**: JSONB nur für Daten ohne komplexe Relationen

**Nächste Schritte:**
1. Entscheidung für Ansatz (Pure JSON vs. Hybrid)
2. JSON-Schema finalisieren
3. Migration-Script erstellen
4. WebsiteContext implementieren
5. Schritt-für-Schritt Migration der Komponenten
