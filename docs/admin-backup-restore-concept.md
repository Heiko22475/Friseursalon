# Admin Backup & Restore - Konzept

## Überblick

Dieses Konzept beschreibt die Erweiterung der Admin-Datenexport/-import-Seite, um Admins die Möglichkeit zu geben, vollständige Backups ihrer Website zu erstellen und wiederherzustellen - analog zur bestehenden Superadmin-Funktionalität.

**Datum:** Februar 2026  
**Status:** Konzept  
**Zielgruppe:** Admin-Benutzer (Salon-Betreiber)

---

## Aktuelle Situation

### Was existiert bereits?

#### Admin (DataExport.tsx)
- ✅ Export aller Tabellendaten als JSON
- ✅ Export des Datenbankschemas
- ✅ Basic Import von JSON-Daten
- ❌ **Keine Bilder im Export**
- ❌ **Kein customer-spezifischer Filter**
- ❌ **Keine Website-JSON Struktur**
- ❌ **Keine vollständige Restore-Funktion**

#### Superadmin (UserManagement.tsx)
- ✅ Export als ZIP mit website.json + Bildern
- ✅ Intelligente Bild-Extraktion aus JSON (JSON = Source of Truth)
- ✅ Import von ZIP-Archiven mit automatischem Upload
- ✅ Customer-spezifische Backups
- ✅ Vollständige Wiederherstellung

### Problem

Die aktuelle Admin-Seite exportiert:
- Rohe Tabellendaten (nicht customer-gefiltert!)
- Keine Medien
- Kein strukturiertes website.json Format

**→ Ein Admin kann kein vollständiges, wiederherstellbares Backup seiner Website erstellen!**

---

## Anforderungen

### Funktionale Anforderungen

#### Must-Have (Phase 1)
1. **Backup erstellen (Export)**
   - Export der eigenen Website als ZIP-Archiv
   - Enthält: website.json + alle Medien
   - Nur Daten des eingeloggten Admins (customer_id gefiltert)
   - Dateiname: `backup_<websitename>_2026-02-06.zip`

2. **Backup wiederherstellen (Import)**
   - Upload eines ZIP-Backups
   - Vollständige Wiederherstellung von:
     - Website-Content (pages, blocks, config)
     - Alle Medien (automatischer Upload)
   - Bestätigungsdialog mit Warnhinweis

3. **Sicherheitsmechanismen**
   - Nur eigene Backups können importiert werden
   - Validierung der customer_id
   - Überschreibschutz (Bestätigung erforderlich)

#### Should-Have (Phase 2)
4. **Backup-Historie**
   - Liste der letzten 5 manuellen Backups
   - Anzeige: Datum, Größe, Anzahl Seiten
   - Download alter Backups

5. **Automatische Backups**
   - Wöchentliches Auto-Backup
   - Speicherung in Supabase Storage
   - Retention: 4 Wochen

6. **Backup-Vorschau**
   - Inhalt des Backups vor Import anzeigen
   - Anzahl Seiten, Blöcke, Medien
   - Datum des Backups

#### Nice-to-Have (Phase 3)
7. **Selektive Wiederherstellung**
   - Nur bestimmte Seiten importieren
   - Nur Medien importieren
   - Nur Theme-Einstellungen importieren

8. **Backup-Vergleich**
   - Unterschiede zwischen aktuellem Stand und Backup anzeigen
   - "Was würde überschrieben werden?"

9. **Export-Optionen**
   - Mit/ohne Medien
   - Nur Struktur (keine Inhalte)
   - Template-Export (für andere Instanzen)

---

## Datenstruktur

### Export-Format (ZIP-Archiv)

```
backup_mein-salon_2026-02-06.zip
├── backup_info.json          # Metadaten
├── website.json               # Haupt-Content (JSON = Source of Truth)
└── media/                     # Alle Medien
    ├── gallery/
    │   ├── image1.jpg
    │   └── image2.jpg
    ├── team/
    │   └── portrait1.jpg
    ├── hero/
    │   └── banner.jpg
    └── logos/
        └── logo.svg
```

### backup_info.json

```json
{
  "version": "1.0",
  "created_at": "2026-02-06T14:30:00Z",
  "customer_id": "mein-salon",
  "site_name": "Mein Friseursalon",
  "domain": "www.mein-salon.de",
  "app_version": "2.5.0",
  "stats": {
    "pages_count": 5,
    "blocks_count": 23,
    "media_count": 47,
    "media_size_mb": 12.5
  },
  "export_type": "full",
  "exported_by": "admin",
  "notes": "Backup vor größeren Änderungen"
}
```

### website.json

```json
{
  "customer_id": "mein-salon",
  "domain": "www.mein-salon.de",
  "created_at": "2024-01-15T10:00:00Z",
  "content": {
    "pages": [...],
    "theme": {...},
    "contact": {...},
    "hours": {...},
    "logos": [...],
    "seo": {...}
  }
}
```

**Wichtig:** JSON ist die "Source of Truth" - alle Bild-URLs werden aus dem JSON extrahiert!

---

## UI/UX Design

### Neue Seite: "Backup & Wiederherstellung"

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Zurück      Backup & Wiederherstellung                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📦 Backup erstellen                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Erstellen Sie ein vollständiges Backup Ihrer    │   │
│  │ Website inkl. aller Inhalte und Medien.         │   │
│  │                                                   │   │
│  │ Enthält:                                          │   │
│  │ ✓ Alle Seiten und Inhalte                       │   │
│  │ ✓ Theme und Design-Einstellungen                │   │
│  │ ✓ Alle hochgeladenen Bilder und Medien          │   │
│  │ ✓ Kontaktdaten und Öffnungszeiten               │   │
│  │                                                   │   │
│  │ [📥 Backup jetzt erstellen]                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  🔄 Backup wiederherstellen                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Stellen Sie ein zuvor erstelltes Backup         │   │
│  │ wieder her.                                       │   │
│  │                                                   │   │
│  │ ⚠️ Achtung: Der aktuelle Stand wird             │   │
│  │    überschrieben!                                 │   │
│  │                                                   │   │
│  │ [📤 Backup-Datei auswählen...]                   │   │
│  │                                                   │   │
│  │ Unterstützt: .zip Dateien                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  📋 Letzte Backups (optional)                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 06.02.2026 14:30  │ 12.5 MB │ 5 Seiten │ [⬇]   │   │
│  │ 30.01.2026 09:15  │ 11.8 MB │ 5 Seiten │ [⬇]   │   │
│  │ 23.01.2026 16:45  │ 10.2 MB │ 4 Seiten │ [⬇]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

#### Komponenten-Struktur

```tsx
<BackupAndRestore>
  <Header />
  
  <ExportSection>
    <InfoCard icon="📦" title="Backup erstellen">
      <FeatureList />
      <ExportButton onClick={handleExport} loading={exporting} />
    </InfoCard>
  </ExportSection>

  <ImportSection>
    <InfoCard icon="🔄" title="Backup wiederherstellen">
      <WarningBanner />
      <FileUpload onChange={handleFileSelect} accept=".zip" />
      <ImportButton onClick={handleImport} disabled={!selectedFile} />
    </InfoCard>
  </ImportSection>

  <BackupHistorySection> {/* Phase 2 */}
    <BackupList backups={backups} onDownload={handleDownload} />
  </BackupHistorySection>
</BackupAndRestore>
```

### Dialoge

#### Export-Fortschritt

```
┌─────────────────────────────────────────┐
│ Backup wird erstellt...                 │
├─────────────────────────────────────────┤
│                                          │
│ ⏳ Daten werden gesammelt...            │
│ [████████████░░░░░░░░] 65%              │
│                                          │
│ Aktuell: Medien werden heruntergeladen  │
│ (23 von 47 Dateien)                     │
│                                          │
│ [Abbrechen]                              │
└─────────────────────────────────────────┘
```

#### Import-Bestätigung

```
┌─────────────────────────────────────────┐
│ ⚠️ Backup wiederherstellen?             │
├─────────────────────────────────────────┤
│                                          │
│ Sie sind dabei, ein Backup vom          │
│ 06.02.2026 14:30 Uhr einzuspielen.      │
│                                          │
│ Das Backup enthält:                      │
│ • 5 Seiten                               │
│ • 23 Inhaltsblöcke                       │
│ • 47 Medien (12.5 MB)                    │
│                                          │
│ ⚠️ ACHTUNG:                              │
│ Alle aktuellen Inhalte werden            │
│ ÜBERSCHRIEBEN und können nicht           │
│ wiederhergestellt werden!                │
│                                          │
│ Möchten Sie vorher ein Backup des       │
│ aktuellen Stands erstellen?              │
│                                          │
│ [Erst Backup erstellen]  [Fortfahren]   │
│                          [Abbrechen]     │
└─────────────────────────────────────────┘
```

#### Import-Fortschritt

```
┌─────────────────────────────────────────┐
│ Backup wird wiederhergestellt...        │
├─────────────────────────────────────────┤
│                                          │
│ ✓ Backup validiert                      │
│ ✓ Medien hochgeladen (47/47)            │
│ ⏳ Website-Daten werden importiert...   │
│ [████████████████████] 90%              │
│                                          │
│ Bitte schließen Sie dieses Fenster      │
│ nicht!                                   │
│                                          │
└─────────────────────────────────────────┘
```

#### Erfolg

```
┌─────────────────────────────────────────┐
│ ✅ Backup erfolgreich wiederhergestellt │
├─────────────────────────────────────────┤
│                                          │
│ Ihr Backup wurde erfolgreich            │
│ wiederhergestellt:                       │
│                                          │
│ • 5 Seiten importiert                    │
│ • 23 Blöcke wiederhergestellt            │
│ • 47 Medien hochgeladen                  │
│                                          │
│ Die Seite wird neu geladen...            │
│                                          │
│ [OK]                                     │
└─────────────────────────────────────────┘
```

---

## Technische Implementierung

### Phase 1: Basis-Funktionalität

#### 1. Export-Funktion

```typescript
async function handleExport() {
  const { website } = useWebsite();
  const customerId = website.customer_id;
  
  // 1. Create ZIP
  const zip = new JSZip();
  
  // 2. Add backup_info.json
  const backupInfo = {
    version: "1.0",
    created_at: new Date().toISOString(),
    customer_id: customerId,
    site_name: website.content.general?.name,
    domain: website.domain,
    stats: {
      pages_count: website.content.pages?.length || 0,
      blocks_count: countTotalBlocks(website.content.pages),
      media_count: 0, // will be updated
      media_size_mb: 0
    }
  };
  zip.file("backup_info.json", JSON.stringify(backupInfo, null, 2));
  
  // 3. Add website.json (main content)
  zip.file("website.json", JSON.stringify({
    customer_id: customerId,
    domain: website.domain,
    created_at: website.created_at,
    content: website.content
  }, null, 2));
  
  // 4. Extract all image URLs from JSON (JSON = Source of Truth)
  const imageUrls = extractImageUrls(website.content);
  
  // 5. Download and add all images
  const mediaFolder = zip.folder("media");
  let mediaCount = 0;
  
  for (const url of imageUrls) {
    try {
      const { blob, filename, folder } = await downloadImage(url);
      const subFolder = mediaFolder.folder(folder); // gallery, team, hero, etc.
      subFolder.file(filename, blob);
      mediaCount++;
    } catch (err) {
      console.warn('Could not download:', url);
    }
  }
  
  // 6. Update stats
  backupInfo.stats.media_count = mediaCount;
  zip.file("backup_info.json", JSON.stringify(backupInfo, null, 2));
  
  // 7. Generate and download ZIP
  const blob = await zip.generateAsync({ 
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_${customerId}_${formatDate(new Date())}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
```

#### 2. Import-Funktion

```typescript
async function handleImport(file: File) {
  const { updatePages } = useWebsite();
  
  // 1. Read ZIP
  const zip = await JSZip.loadAsync(file);
  
  // 2. Read and validate backup_info.json
  const backupInfoText = await zip.file("backup_info.json")?.async("text");
  if (!backupInfoText) throw new Error("Invalid backup: missing backup_info.json");
  
  const backupInfo = JSON.parse(backupInfoText);
  
  // 3. Validate customer_id
  const { website } = useWebsite();
  if (backupInfo.customer_id !== website.customer_id) {
    throw new Error("Backup gehört zu einer anderen Website!");
  }
  
  // 4. Show confirmation dialog
  const confirmed = await confirmRestore(backupInfo);
  if (!confirmed) return;
  
  // 5. Read website.json
  const websiteText = await zip.file("website.json")?.async("text");
  if (!websiteText) throw new Error("Invalid backup: missing website.json");
  
  const websiteData = JSON.parse(websiteText);
  
  // 6. Upload all media files
  const mediaFolder = zip.folder("media");
  const uploadedMediaMap = new Map<string, string>(); // old URL -> new URL
  
  if (mediaFolder) {
    for (const [path, file] of Object.entries(mediaFolder.files)) {
      if (file.dir) continue;
      
      const blob = await file.async("blob");
      const filename = path.split('/').pop();
      const folder = path.split('/').slice(1, -1).join('/'); // remove "media/" prefix
      
      // Upload to Supabase Storage
      const newUrl = await uploadMediaFile(blob, filename, folder, website.customer_id);
      
      // We'll need to replace URLs in the JSON
      uploadedMediaMap.set(filename, newUrl);
    }
  }
  
  // 7. Replace old image URLs with new ones in websiteData.content
  const updatedContent = replaceImageUrls(websiteData.content, uploadedMediaMap);
  
  // 8. Update website in database (single updatePages call)
  await updatePages(updatedContent.pages);
  
  // 9. Update other content (theme, contact, etc.)
  await updateWebsiteContent(updatedContent);
  
  // 10. Sync media to user_media table
  await syncMediaToDatabase(website.customer_id, uploadedMediaMap);
  
  // 11. Reload page
  window.location.reload();
}
```

#### 3. Hilfs-Funktionen

```typescript
// Extract all image URLs from JSON structure
function extractImageUrls(obj: any): string[] {
  const urls: string[] = [];
  
  const traverse = (item: any) => {
    if (!item) return;
    
    if (typeof item === 'string') {
      // Check if it's an image URL
      if (item.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || 
          item.includes('/storage/v1/object/')) {
        urls.push(item);
      }
    } else if (Array.isArray(item)) {
      item.forEach(traverse);
    } else if (typeof item === 'object') {
      // Check common image properties
      ['url', 'image_url', 'imageUrl', 'src', 'image', 
       'backgroundImage', 'logo', 'avatar', 'photo'].forEach(prop => {
        if (item[prop]) traverse(item[prop]);
      });
      
      // Recurse into all values
      Object.values(item).forEach(traverse);
    }
  };
  
  traverse(obj);
  return [...new Set(urls)]; // Deduplicate
}

// Download image and determine folder structure
async function downloadImage(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Download failed');
  
  const blob = await response.blob();
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1].split('?')[0];
  
  // Determine folder from URL structure
  let folder = 'other';
  if (url.includes('/gallery/')) folder = 'gallery';
  else if (url.includes('/team/')) folder = 'team';
  else if (url.includes('/hero/')) folder = 'hero';
  else if (url.includes('/logos/')) folder = 'logos';
  else if (url.includes('/services/')) folder = 'services';
  
  return { blob, filename, folder };
}

// Upload media file to Supabase Storage
async function uploadMediaFile(
  blob: Blob, 
  filename: string, 
  folder: string, 
  customerId: string
): Promise<string> {
  const path = `${customerId}/${folder}/${filename}`;
  
  const { data, error } = await supabase.storage
    .from('media')
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(path);
  
  return publicUrl;
}

// Replace old URLs with new ones
function replaceImageUrls(
  content: any, 
  urlMap: Map<string, string>
): any {
  const replace = (obj: any): any => {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      // Check if this string is in our map (by filename)
      for (const [oldFilename, newUrl] of urlMap) {
        if (obj.includes(oldFilename)) {
          return newUrl;
        }
      }
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map(replace);
    } else if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replace(value);
      }
      return result;
    }
    return obj;
  };
  
  return replace(content);
}
```

### Dateistruktur

```
src/
├── components/
│   └── admin/
│       ├── BackupAndRestore.tsx       # Neue Hauptkomponente
│       ├── ExportSection.tsx          # Export UI
│       ├── ImportSection.tsx          # Import UI
│       ├── BackupHistoryList.tsx      # Phase 2
│       └── DataExport.tsx             # Alt (deprecated)
├── lib/
│   ├── backup.ts                      # Export/Import Logic
│   ├── mediaExtractor.ts              # Image URL extraction
│   └── mediaUploader.ts               # Media upload helper
└── types/
    └── backup.ts                      # TypeScript interfaces
```

---

## Sicherheit & Validierung

### Export-Sicherheit

1. **Customer-ID Filterung**
   - Nur Daten des eingeloggten Admins exportieren
   - Keine Möglichkeit, andere Websites zu exportieren

2. **Daten-Sanitization**
   - Entfernung von sensiblen Daten (falls vorhanden)
   - API-Keys und Secrets nicht exportieren

### Import-Sicherheit

1. **Backup-Validierung**
   ```typescript
   function validateBackup(backup: any): boolean {
     // Check structure
     if (!backup.backup_info || !backup.website) return false;
     
     // Check version compatibility
     if (backup.backup_info.version !== "1.0") return false;
     
     // Check customer_id match
     const currentCustomerId = getCurrentCustomerId();
     if (backup.backup_info.customer_id !== currentCustomerId) return false;
     
     // Check required fields
     if (!backup.website.content || !backup.website.content.pages) return false;
     
     return true;
   }
   ```

2. **Überschreibschutz**
   - Explizite Bestätigung erforderlich
   - Option: Backup vor Import erstellen
   - Keine versehentliche Überschreibung möglich

3. **Fehlerbehandlung**
   - Transaktionsähnliches Verhalten (alles oder nichts)
   - Bei Fehler: Rollback-Mechanismus
   - Detaillierte Fehlermeldungen

### Rate Limiting

- Max. 5 Exporte pro Stunde
- Max. 2 Importe pro Stunde
- Größenlimit: 100 MB pro Backup

---

## Implementierungsplan

### Phase 1: MVP (Woche 1-2)

**Ziel:** Basis Export/Import funktioniert

1. **Tag 1-2: Export-Funktion**
   - [ ] BackupAndRestore.tsx erstellen
   - [ ] Export-Button und UI
   - [ ] ZIP-Generierung mit website.json
   - [ ] Bild-Extraktion aus JSON
   - [ ] Bild-Download und Einbettung

2. **Tag 3-4: Import-Funktion**
   - [ ] File-Upload UI
   - [ ] ZIP-Parsing
   - [ ] Backup-Validierung
   - [ ] Bestätigungsdialog

3. **Tag 5-7: Import-Logik**
   - [ ] Media-Upload zu Supabase Storage
   - [ ] URL-Ersetzung im JSON
   - [ ] Website-Content Update
   - [ ] Sync mit user_media Tabelle

4. **Tag 8-10: Testing & Polish**
   - [ ] Fortschrittsanzeigen
   - [ ] Fehlerbehandlung
   - [ ] User-Feedback (Toasts, Modals)
   - [ ] Integration in Admin-Menü

### Phase 2: Historie & Auto-Backup (Woche 3)

5. **Backup-Historie**
   - [ ] Tabelle: backup_history
   - [ ] Speicherung in Supabase Storage
   - [ ] Liste der letzten Backups
   - [ ] Download alter Backups

6. **Automatische Backups**
   - [ ] Supabase Edge Function für wöchentliche Backups
   - [ ] Cron-Job Setup
   - [ ] Email-Benachrichtigung

### Phase 3: Advanced Features (Woche 4+)

7. **Selektive Wiederherstellung**
   - [ ] Backup-Vorschau
   - [ ] Auswahl: Seiten, Medien, Theme
   - [ ] Partial Import

8. **Backup-Vergleich**
   - [ ] Diff-Ansicht
   - [ ] "Was würde sich ändern?"

---

## Alternative Ansätze

### Option 1: Nur JSON (ohne Medien)

**Pro:**
- Schneller Export/Import
- Kleinere Dateigröße
- Einfachere Implementierung

**Contra:**
- Unvollständiges Backup
- Medien fehlen bei Restore
- Nicht nutzbar für echte Wiederherstellung

**Empfehlung:** ❌ Nicht empfohlen - Medien sind essentiell

### Option 2: Database-Dump statt JSON

**Pro:**
- Direktes SQL-Backup
- Schneller Import
- Konsistent mit Datenbankstruktur

**Contra:**
- Weniger portabel
- Customer-Filterung komplizierter
- Keine Kontrolle über Struktur

**Empfehlung:** ❌ Nicht empfohlen - JSON ist flexibler

### Option 3: Nur Medien in Cloud (Referenzen im JSON)

**Pro:**
- Kleinere Backup-Dateien
- Medien bleiben in Storage
- Schnellerer Import

**Contra:**
- Abhängigkeit von Storage
- Backup unvollständig bei Storage-Problemen
- Nicht offline nutzbar

**Empfehlung:** ❌ Nicht empfohlen - Backup sollte self-contained sein

### Empfohlener Ansatz: **Vollständiges ZIP mit JSON + Medien**

**Pro:**
- ✅ Vollständig unabhängig
- ✅ Offline nutzbar
- ✅ Portabel zwischen Instanzen
- ✅ JSON als Source of Truth
- ✅ Konsistent mit Superadmin-Lösung

**Contra:**
- ⚠️ Größere Dateien (aber akzeptabel)
- ⚠️ Längere Export/Import-Zeit (aber mit Progress)

---

## Datenbank-Anpassungen

### Neue Tabelle: backup_history (Phase 2)

```sql
CREATE TABLE backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  backup_date TIMESTAMP DEFAULT NOW(),
  backup_type TEXT DEFAULT 'manual', -- manual, auto
  file_size_bytes BIGINT,
  storage_path TEXT, -- Supabase Storage path
  stats JSONB, -- pages_count, blocks_count, media_count
  created_by TEXT, -- 'admin' or 'system'
  notes TEXT,
  
  CONSTRAINT fk_customer
    FOREIGN KEY (customer_id)
    REFERENCES websites(customer_id)
    ON DELETE CASCADE
);

-- Index für schnelle Abfragen
CREATE INDEX idx_backup_customer_date 
ON backup_history(customer_id, backup_date DESC);

-- RLS Policy
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own backups"
ON backup_history
FOR ALL
USING (customer_id = current_setting('app.current_customer_id', true));
```

### Storage Bucket: backups (Phase 2)

```sql
-- Create bucket for automatic backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false);

-- RLS Policy: Users can only access their own backups
CREATE POLICY "Users can access own backups"
ON storage.objects FOR ALL
USING (
  bucket_id = 'backups' 
  AND (storage.foldername(name))[1] = current_setting('app.current_customer_id', true)
);
```

---

## Testing

### Test-Szenarien

1. **Export-Tests**
   - [ ] Export mit 0 Medien
   - [ ] Export mit 1 Medium
   - [ ] Export mit 50+ Medien
   - [ ] Export mit großen Bildern (>10 MB)
   - [ ] Export mit vielen Seiten (>20)
   - [ ] Export-Abbruch (Cancel-Button)

2. **Import-Tests**
   - [ ] Import eigenes Backup
   - [ ] Import fremdes Backup (sollte fehlschlagen)
   - [ ] Import beschädigtes ZIP
   - [ ] Import ohne website.json
   - [ ] Import mit fehlenden Medien
   - [ ] Import-Abbruch während Upload

3. **Edge Cases**
   - [ ] Leere Website exportieren
   - [ ] Sehr große Website (100+ MB)
   - [ ] Langsame Netzwerkverbindung
   - [ ] Parallele Exports
   - [ ] Backup während anderer User editiert

### Performance-Ziele

- Export: < 30 Sekunden für typische Website (~50 MB)
- Import: < 60 Sekunden für typische Website
- Progress Updates: Alle 500ms
- ZIP-Kompression: Level 6 (Balance zwischen Größe und Geschwindigkeit)

---

## Benutzer-Dokumentation

### Help-Text in der UI

```markdown
## Backup erstellen

Ein Backup enthält:
- Alle Seiten und deren Inhalte
- Theme- und Design-Einstellungen
- Alle hochgeladenen Bilder und Medien
- Kontaktdaten und Öffnungszeiten
- Logos und Branding

Das Backup wird als ZIP-Datei heruntergeladen und kann 
jederzeit wiederhergestellt werden.

**Empfehlung:** Erstellen Sie ein Backup vor größeren 
Änderungen an Ihrer Website.

## Backup wiederherstellen

⚠️ **Wichtig:** Beim Wiederherstellen eines Backups werden 
alle aktuellen Inhalte überschrieben!

Wir empfehlen, vorher ein Backup des aktuellen Stands zu 
erstellen.

Das Wiederherstellen kann einige Minuten dauern, abhängig 
von der Anzahl der Medien.
```

---

## FAQ

**Q: Wie oft sollte ich ein Backup erstellen?**  
A: Vor jeder größeren Änderung. Ab Phase 2 gibt es automatische wöchentliche Backups.

**Q: Wie groß wird ein Backup?**  
A: Typischerweise 10-50 MB, abhängig von der Anzahl und Größe der Bilder.

**Q: Kann ich ein Backup auf einer anderen Website importieren?**  
A: Nein, aus Sicherheitsgründen können Backups nur auf der Website importiert werden, von der sie erstellt wurden.

**Q: Was passiert mit den alten Daten beim Import?**  
A: Sie werden vollständig überschrieben. Erstellen Sie vorher ein Backup!

**Q: Werden auch die Medien wiederhergestellt?**  
A: Ja, alle Medien werden automatisch hochgeladen und die URLs aktualisiert.

**Q: Wie lange dauert ein Export/Import?**  
A: Export: 10-30 Sekunden, Import: 30-60 Sekunden (abhängig von Größe und Anzahl der Medien).

---

## Zusammenfassung & Empfehlung

### Empfohlener Ansatz

**Phase 1 (MVP):** Vollständiger Export/Import mit ZIP + JSON + Medien
- Orientiert an Superadmin-Implementierung
- JSON als Source of Truth
- Self-contained Backups
- Einfache, klare UI

**Phase 2:** Historie und Auto-Backup
- Backup-Historie in Supabase
- Wöchentliche automatische Backups
- Email-Benachrichtigungen

**Phase 3:** Advanced Features
- Selektive Wiederherstellung
- Backup-Vergleich
- Export-Optionen

### Vorteile dieser Lösung

✅ Konsistent mit bestehender Superadmin-Lösung  
✅ Vollständige, unabhängige Backups  
✅ Einfache Bedienung für Nicht-Techniker  
✅ Sichere Customer-Isolation  
✅ Erweiterbar für zukünftige Features  

### Nächste Schritte

1. ✅ Konzept Review & Approval
2. ⏳ Phase 1 Implementation (2 Wochen)
3. ⏳ Testing & Bugfixes (3-4 Tage)
4. ⏳ Deployment & User-Feedback
5. ⏳ Phase 2 Planning

---

**Ende des Konzepts**
