# Supabase Storage Buckets Setup

## Buckets erstellen

Führen Sie folgende Schritte in Supabase Dashboard aus:

### 1. Bucket: `media-customer`
- **Name**: `media-customer`
- **Public**: ✅ Yes
- **File Size Limit**: 52 MB (für Videos)
- **Allowed MIME types**: Alle erlauben

**Storage Policies:**
```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-customer');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media-customer');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media-customer');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media-customer');
```

### 2. Bucket: `media-stock`
- **Name**: `media-stock`
- **Public**: ✅ Yes
- **File Size Limit**: 10 MB
- **Allowed MIME types**: Nur Bilder

**Storage Policies:**
```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-stock');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media-stock');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media-stock');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media-stock');
```

## Ordnerstruktur

Die Ordnerstruktur wird automatisch erstellt, wenn Dateien hochgeladen werden:

### media-customer/
```
<customerid>/
├── images/
├── videos/
└── docs/
```

### media-stock/
```
stock/
├── images/
├── videos/
└── docs/
```

## CLI Commands (Optional)

Falls Sie die Supabase CLI verwenden:

```bash
# Create buckets
supabase storage create media-customer --public
supabase storage create media-stock --public

# Set size limits
supabase storage update media-customer --file-size-limit 52428800
supabase storage update media-stock --file-size-limit 10485760
```
