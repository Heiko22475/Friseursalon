# 📚 Mediathek - Konzept & Rückfragen

## Überblick
Eine zentrale Medienverwaltung mit drei Hauptbereichen für Bilder, Stockfotos und Dokumente. Ähnlich wie die Gallery-Upload-Komponente, aber mit erweiterten Organisations- und Verwaltungsfunktionen.

---

## 🎯 Hauptfunktionen

### 1. **Drei Medienbereiche**
- **Bilder**: Eigene hochgeladene Fotos (z.B. vom Salon)
- **Stockfotos**: Lizenzierte oder kostenlose Stock-Bilder
- **Dokumente**: PDFs, Word-Dokumente, etc.

### 2. **Ordnerstruktur**
- Ordner und Unterordner in beliebiger Tiefe
- Drag & Drop zum Verschieben zwischen Ordnern
- Ordner erstellen, umbenennen, löschen

### 3. **Medien-Management**
- Upload (einzeln oder mehrere Dateien)
- Verschieben zwischen Ordnern
- Löschen mit Bestätigung
- Metadaten (Titel, Alt-Text, Beschreibung, Tags)

---

## 🗄️ Datenbank-Schema (Vorschlag)

```sql
-- Medienbereiche (Bilder, Stockfotos, Dokumente)
CREATE TABLE media_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'images', 'stockphotos', 'documents'
  display_name TEXT NOT NULL, -- 'Bilder', 'Stockfotos', 'Dokumente'
  icon TEXT, -- Lucide icon name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ordner-Struktur
CREATE TABLE media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES media_categories(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE, -- NULL = Root-Ordner
  name TEXT NOT NULL,
  path TEXT, -- Voller Pfad für schnelle Abfragen (z.B. "/Salon/Außenansicht")
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medien-Dateien
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_type TEXT, -- 'image/jpeg', 'application/pdf', etc.
  file_size INTEGER, -- in Bytes
  mime_type TEXT,
  
  -- Metadaten
  title TEXT,
  alt_text TEXT,
  description TEXT,
  tags TEXT[], -- Array für Suche/Filterung
  
  -- Bild-spezifisch
  width INTEGER,
  height INTEGER,
  thumbnail_url TEXT,
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für Performance
CREATE INDEX idx_media_folders_category ON media_folders(category_id);
CREATE INDEX idx_media_folders_parent ON media_folders(parent_folder_id);
CREATE INDEX idx_media_files_folder ON media_files(folder_id);
CREATE INDEX idx_media_files_tags ON media_files USING GIN(tags);
```

---

## 🎨 UI/UX Konzept

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ [← Zurück] Mediathek                    [+ Upload]      │
├──────────┬──────────────────────────────────────────────┤
│ Bereiche │ Ordner & Dateien                             │
│          │                                              │
│ 📷 Bilder│ 📁 Salon                    [+ Ordner]      │
│ 🎨 Stock │   ├─ 📁 Außenansicht       (3 Dateien)     │
│ 📄 Doks. │   ├─ 📁 Innenbereich       (12 Dateien)    │
│          │   └─ 📁 Team               (5 Dateien)     │
│          │                                              │
│          │ 🖼️ [Bild1.jpg] 🖼️ [Bild2.jpg] 🖼️ [Bild3.jpg]│
│          │ 1.2 MB         2.3 MB         890 KB        │
│          │ [✏️ Bearbeiten] [🗑️ Löschen] [↗️ Verschieben]│
└──────────┴──────────────────────────────────────────────┘
```

### Features pro Ansicht

#### **Ordner-Ansicht**
- Breadcrumb-Navigation (Home > Salon > Außenansicht)
- Grid-Ansicht mit Vorschau-Thumbnails
- Listen-Ansicht mit Details
- Drag & Drop zum Verschieben
- Rechtsklick-Menü (Umbenennen, Löschen, Eigenschaften)

#### **Datei-Details**
- Modal oder Sidebar mit:
  - Vorschau (für Bilder)
  - Metadaten bearbeiten
  - Download-Button
  - Direkt-Link kopieren
  - Verwendungsstellen (wo wird das Bild genutzt?)

#### **Upload-Dialog**
- Drag & Drop Bereich
- Mehrfach-Upload
- Upload-Fortschritt
- Automatische Thumbnail-Generierung (für Bilder)
- Metadaten während Upload eingeben

---

## 🔄 Integration mit bestehenden Komponenten

### Gallery-Baustein
Aktuell: Upload direkt in Gallery-Tabelle
**Neu**: Auswahl aus Mediathek oder direkter Upload

```tsx
// Im Gallery-Editor:
<MediaPicker 
  category="images"
  onSelect={(file) => addToGallery(file)}
  allowUpload={true}
/>
```

### Static Content / Rich Text Editor
- Bilder aus Mediathek einfügen
- Link zu Dokumenten setzen

### Hero / About / Services
- Background-Images aus Mediathek wählen
- Icons aus Stockfotos auswählen

---

## 🚀 Umsetzung in Phasen

### **Phase 1: Basis-Struktur** (Essential)
- ✅ Datenbank-Schema erstellen
- ✅ Drei Hauptbereiche (Bilder, Stock, Dokumente)
- ✅ Einfache Ordner-Struktur (nur 1 Ebene)
- ✅ Upload-Funktionalität
- ✅ Anzeige als Grid mit Thumbnails
- ✅ Löschen-Funktion

### **Phase 2: Ordner-Management** (Important)
- 📋 Unbegrenzte Ordner-Tiefe
- 📋 Ordner erstellen/umbenennen/löschen
- 📋 Breadcrumb-Navigation
- 📋 Verschieben via Drag & Drop

### **Phase 3: Erweiterte Features** (Nice-to-have)
- 📋 Metadaten-Editor (Titel, Alt-Text, Tags)
- 📋 Suchfunktion (Name, Tags)
- 📋 Filter (Dateityp, Datum, Größe)
- 📋 Listen-Ansicht vs. Grid-Ansicht
- 📋 Sortierung (Name, Datum, Größe)

### **Phase 4: Integration** (Future)
- 📋 MediaPicker-Komponente für andere Editoren
- 📋 Verwendungsstellen anzeigen
- 📋 Massen-Operationen (Mehrfach-Upload, Mehrfach-Löschen)
- 📋 Bildbearbeitung (Zuschneiden, Resize)

---

## ❓ Rückfragen

### 1. **Scope & Priorität**
- **Sollen wir mit Phase 1 starten?** (Basis ohne Unterordner)
- **Oder direkt volle Ordner-Hierarchie** (mehr Aufwand)?
- **Welche Features sind Must-Have vs. Nice-to-have?**

PHase 1

### 2. **Dateitypen & Limits**
- **Welche Dokumentformate erlauben?** 
  - PDFs ✓
  - Word/Excel (docx, xlsx)?
  - Text-Dateien (txt, md)?
  Filme (mp4)
- **Maximale Dateigröße?** (z.B. 10 MB pro Datei)
- **Maximale Anzahl Dateien pro Upload?** (z.B. 10 gleichzeitig)

Images: 10Mb pro Datei, Filme 50mb pro Datei. Dateien 
gleichzeitig pro Upload: 30

### 3. **Stockfotos-Bereich**
- **Haben Sie bereits Stock-Bilder?** (Unsplash, Pixabay, etc.)?
- **Soll es eine Integration zu Stock-APIs geben?** (z.B. Unsplash API)
- **Oder nur manueller Upload gekaufter/lizenzierter Bilder?**

nur manueller Upload. 

### 4. **Metadaten**
- **Welche Metadaten sind wichtig?**
  - Titel ✓
  - Alt-Text (für SEO) ✓
  - Beschreibung ✓
  - Tags/Schlagwörter ✓
  - Copyright-Info?
  - Lizenz-Typ?
  - Verwendungsbeschränkungen?

Vielleicht kann man die Felder Vorsehen. Später ist ja der Titel und ggf. der Alt-Text wichtig. Beim Upload soll man den 
Titel und den Alt-Text eingeben können optional. 

### 5. **Ordner-Struktur**
- **Vordefinierte Ordner-Struktur** beim ersten Start?
  ```
  Bilder/
    ├─ Salon
    ├─ Team
    ├─ Vorher-Nachher
    └─ Events
  
  Stockfotos/
    ├─ Hintergründe
    ├─ Salon
    └─ Icons
       Logos
       Frisuren
  
  Dokumente/
    ├─ Preislisten


  ```
- **Oder komplett leer starten?**

### 6. **Berechtigungen & Sicherheit**
- **Öffentlicher Zugriff auf Medien?** ja
- **Sollen Dokumente geschützt sein?** (nur für eingeloggte User?)

### 7. **Migration bestehender Daten**
- **Gallery-Bilder in Mediathek migrieren?**
  - Automatisch in "Bilder/Gallery" Ordner verschieben?
  - Oder parallel laufen lassen?

### 8. **Storage Backend**
- **Supabase Storage verwenden?** (wie bei Gallery)
- **Bucket-Struktur:**
  - Ein Bucket pro Kategorie? (`media-images`, `media-stock`, `media-docs`)
  - Oder ein Bucket mit Unterordnern? (`media/images/...`)

### 9. **Performance & Thumbnails**
- **Automatische Thumbnail-Generierung?**
  - Beim Upload ✓
  - Mehrere Größen (klein/mittel/groß)? -> mittel
- **Lazy Loading für große Ordner?** (erst 50 Dateien laden) -> erstmal nicht. 

### 10. **UI-Präferenz**
- **Windows Explorer-Stil** (klassisch mit Sidebar)?
- **Google Drive-Stil** (modern mit Grid/Liste Toggle)?
- **macOS Finder-Stil** (mit Vorschau-Bereich)?

Google-Drive-Stil

---

## 💡 Empfehlung

**Mein Vorschlag für den Start:**

### **Minimal Viable Product (MVP)**
1. **Datenbank-Schema** anlegen (siehe oben)
2. **Phase 1 implementieren**:
   - Drei Kategorien mit je einem Root-Ordner
   - Upload (mit Fortschrittsanzeige)
   - Grid-Ansicht mit Thumbnails
   - Löschen-Funktion
   - Basis-Metadaten (Titel, Alt-Text)
3. **Route**: `/admin/media`
4. **Storage**: Supabase mit drei Buckets
5. **UI**: Google Drive-Style (clean & modern)

### **Dann iterativ erweitern**:
- Ordner-Hierarchie hinzufügen
- Verschieben-Funktion
- MediaPicker-Integration in Editoren
- Erweiterte Metadaten & Suche

**Vorteil**: Schnell nutzbar, dann schrittweise ausbauen ✨

---

## 📦 Technische Dependencies

```json
{
  "react-dropzone": "^14.2.3",      // Drag & Drop Upload
  "react-beautiful-dnd": "^13.1.1", // Drag & Drop Verschieben
  "lucide-react": "^0.263.1",       // Icons (bereits vorhanden)
  "react-image-lightbox": "^5.1.4", // Bild-Vorschau (optional)
  "mime-types": "^2.1.35"           // MIME-Type Detection
}
```

---

## 🎬 Nächste Schritte

**Bitte beantworten Sie die Rückfragen oben, dann kann ich:**
1. Das finale Datenbankschema erstellen
2. Die Mediathek-Komponente implementieren
3. Die Integration vorbereiten

**Oder soll ich direkt mit dem MVP (Phase 1) starten?** 🚀



Dokumente: 10mb; Ja, 4. Kategorie, bestehende Gallery-Bilder belassen. 
W_ir benutzen ab jetzt nur noch die Mediathek. Die Funktion des Galleriebausteins muss geändert werden (später). 

Noch etwas: Speichern der Files mit <CustomerId>_<Titel (slug) wenn vorhanden>_<Random_number>.Dateiendung. Speichern der StockPhotos: <Kategorie>_Random_number. 

Arbeite noch etwas ein: Speichern der Dokumente und Kunden-Bilder/Filme under media/<CustomerId>/images

Ordnerstruktur

1 Bucket: media-customer/
        folder: 
            <customerid>/images
                        /videos
                        /docs

2 Bucket media-stock
            folder: 
            /images
            /videos
            /docs





