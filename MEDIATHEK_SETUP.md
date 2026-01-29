# 🎉 Mediathek - Setup Anleitung

Die Mediathek Phase 1 MVP ist jetzt fertig implementiert! Hier ist die Schritt-für-Schritt Anleitung zur Einrichtung:

## ✅ Was wurde implementiert?

### React-Komponenten:
- ✅ **MediaLibrary** - Haupt-Komponente mit Kategorie-Sidebar und File-Grid
- ✅ **MediaUpload** - Drag & Drop Upload mit Fortschrittsanzeigen
- ✅ **MediaGrid** - File-Grid mit Thumbnails und Lightbox
- ✅ **Modal** - Reusable Modal-Komponente
- ✅ **Routing** - `/admin/media` Route in App.tsx
- ✅ **Dashboard** - Mediathek-Karte im AdminDashboard

### Dependencies:
- ✅ `react-dropzone` installiert

## 📋 Setup-Schritte

### 1. Customer ID konfigurieren (falls nicht bereits geschehen)

```sql
-- In Supabase SQL Editor ausführen:
-- Datei: supabase-customer-id.sql
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS customer_id VARCHAR(6) 
CHECK (customer_id ~ '^[0-9]{6}$') DEFAULT '123456';
```

Dann in `/admin/settings` die richtige Customer ID eingeben (6 Ziffern).

### 2. Datenbank-Schema erstellen

```sql
-- In Supabase SQL Editor ausführen:
-- Datei: supabase-mediathek.sql
-- GESAMTE DATEI KOPIEREN UND AUSFÜHREN (176 Zeilen)
```

Das Schema erstellt:
- ✅ 3 Tabellen: `media_categories`, `media_folders`, `media_files`
- ✅ 4 vordefinierte Kategorien: Bilder, Videos, Stockfotos, Dokumente
- ✅ Vordefinierte Ordner-Struktur für Ihre Customer ID
- ✅ Indexes für Performance
- ✅ Row Level Security (Public Read, Authenticated Manage)

### 3. Storage Buckets erstellen

**Entweder per Supabase UI:**

1. Gehen Sie zu: `Storage` → `New bucket`
2. Erstellen Sie 2 Buckets:

**Bucket 1: media-customer**
- Name: `media-customer`
- Public: ✅ Yes (Public bucket)

**Bucket 2: media-stock**
- Name: `media-stock`  
- Public: ✅ Yes (Public bucket)

**Oder per SQL:**

```sql
-- Siehe STORAGE_SETUP.md für detaillierte SQL-Befehle
```

### 4. Storage Policies einrichten

```sql
-- In Supabase SQL Editor ausführen:
-- Siehe STORAGE_SETUP.md für vollständige Policies

-- Beispiel für media-customer:
CREATE POLICY "Allow public read" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'media-customer');

CREATE POLICY "Allow authenticated upload" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media-customer');

-- ... weitere Policies in STORAGE_SETUP.md
```

## 🚀 Verwendung

### Upload:

1. Gehen Sie zu `/admin/media`
2. Wählen Sie eine Kategorie (Bilder, Videos, Stockfotos, Dokumente)
3. Wählen Sie einen Ordner
4. Klicken Sie auf **"Upload"**
5. Ziehen Sie Dateien in die Drop-Zone (oder klicken)
6. Optional: Titel und Alt-Text eingeben
7. Klicken Sie auf **"X Dateien hochladen"**

### Features:

- ✅ Drag & Drop Multi-File Upload (max 30 Dateien)
- ✅ Dateigrößen-Limits: 10MB (Bilder/Docs), 50MB (Videos)
- ✅ MIME-Type Validierung
- ✅ Fortschrittsanzeigen beim Upload
- ✅ Thumbnail-Preview im Grid
- ✅ Lightbox für Bilder (Klick auf Thumbnail)
- ✅ Download-Button
- ✅ Löschen mit Bestätigung
- ✅ Responsive Grid (2-4 Spalten)

## 📁 Dateinamens-Konvention

### Customer Media (media-customer Bucket):
```
Format: <customerid>_<title-slug>_<random>.jpg
Beispiel: 123456_friseur-logo_a8c3e9.jpg

Storage Path: 123456/images/123456_friseur-logo_a8c3e9.jpg
```

### Stock Media (media-stock Bucket):
```
Format: <category>_<random>.jpg
Beispiel: stockphotos_k2m9f1.jpg

Storage Path: stock/stockphotos/stockphotos_k2m9f1.jpg
```

## 🗂️ Ordner-Struktur

**Customer Media:**
```
images/
  - Logo & Branding
  - Team-Fotos
  - Salon-Fotos
  - Produkte

videos/
  - Tutorials
  - Vorher-Nachher
  - Testimonials

documents/
  - Preislisten
  - Flyer
  - Formulare
```

**Stock Media:**
```
stockphotos/
  - Friseur-Szenen
  - Beauty-Produkte
  - Hintergründe
```

## 🔧 Technische Details

### Komponenten-Struktur:
```
src/components/admin/
├── MediaLibrary.tsx      (Main, 300+ Zeilen)
├── MediaUpload.tsx       (Upload, 350+ Zeilen)
├── MediaGrid.tsx         (Grid, 200+ Zeilen)
└── Modal.tsx             (Utility)
```

### State Management:
- React useState für lokalen State
- Supabase für Daten-Persistenz
- Echtzeit-Updates nach Upload/Delete

### Styling:
- TailwindCSS für alle Styles
- Responsive Grid mit @container queries
- Lucide React Icons

## ⚠️ Wichtige Hinweise

1. **Customer ID**: Muss ZUERST in `/admin/settings` konfiguriert werden (6 Ziffern)
2. **Storage Buckets**: Müssen PUBLIC sein für öffentlichen Zugriff auf Bilder
3. **File Limits**: Werden clientseitig UND per Supabase Storage validiert
4. **Thumbnail Generation**: Aktuell wird das Original-Bild verwendet (Phase 2: Auto-Thumbnails)

## 🎯 Phase 1 MVP - Scope

### ✅ Enthalten:
- 4 Kategorien (Bilder, Videos, Stockfotos, Dokumente)
- 1-Level Ordner-Struktur (vordefiniert)
- Upload mit Drag & Drop (max 30 Dateien)
- File Grid mit Thumbnails
- Lightbox für Bilder
- Download & Löschen
- Optional: Titel & Alt-Text beim Upload

### ❌ Nicht enthalten (Phase 2+):
- Unbegrenzte Ordner-Tiefe
- Ordner erstellen/umbenennen
- Drag & Drop Datei-Verschiebung
- Automatische Thumbnail-Generierung
- Erweiterte Metadaten (Beschreibung, Tags)
- Suche & Filter
- MediaPicker Integration in Editoren
- Usage Tracking

## 🐛 Troubleshooting

**Problem: "Fehler beim Hochladen"**
- Prüfen Sie: Storage Buckets existieren?
- Prüfen Sie: Storage Policies korrekt?
- Prüfen Sie: Dateiformat erlaubt?

**Problem: "Thumbnails werden nicht angezeigt"**
- Prüfen Sie: Bucket ist PUBLIC?
- Prüfen Sie: RLS Policies erlauben SELECT?

**Problem: "Ordner leer nach Upload"**
- Prüfen Sie: Browser-Konsole für Fehler
- Prüfen Sie: Supabase Dashboard → Storage → Dateien vorhanden?

## 📊 Testing

1. Upload testen:
   - Drag & Drop einzelne Datei
   - Multi-File Upload (5+ Dateien)
   - Datei zu groß (sollte abgelehnt werden)
   - Falscher MIME-Type (sollte abgelehnt werden)

2. Grid testen:
   - Thumbnails werden angezeigt
   - Lightbox öffnet bei Klick
   - Download funktioniert
   - Löschen funktioniert (mit Bestätigung)

3. Navigation testen:
   - Kategorie wechseln
   - Ordner wechseln
   - Zurück zum Dashboard

## 🎉 Fertig!

Die Mediathek ist jetzt einsatzbereit. Viel Spaß beim Organisieren Ihrer Medien!

Bei Fragen oder Problemen: Siehe Supabase Logs oder Browser-Konsole für Details.
