# Supabase Database Backup Guide

## Option 1: Using Supabase Dashboard (Easiest)
1. Go to https://supabase.com/dashboard/project/bcboebhicfsscxrqumyk
2. Navigate to Database → Backups
3. Click "Create Backup" or download existing backups

## Option 2: Using In-App Export (For Users)
- Already implemented in Admin Dashboard → "Daten Export/Import"
- Exports all data to JSON file
- Users can backup and restore their content

## Option 3: Using Supabase CLI (For Developers)

### Install Supabase CLI:

**Windows (using Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Windows (using Chocolatey):**
```bash
choco install supabase
```

**Windows (using winget):**
```bash
winget install Supabase.cli
```

**Or use npx (no installation needed):**
```bash
npx supabase@latest --help
```

### Login:
```bash
supabase login
# Or with npx:
npx supabase login
```

### Link to your project:
```bash
supabase link --project-ref bcboebhicfsscxrqumyk
# Or with npx:
npx supabase link --project-ref bcboebhicfsscxrqumyk
```

### Export Schema Only:
```bash
supabase db dump --schema public > schema.sql
# Or with npx:
npx supabase db dump --schema public > schema.sql
```

### Export Data Only:
```bash
supabase db dump --data-only > data.sql
# Or with npx:
npx supabase db dump --data-only > dat (Recommended for full backups)

**Get your database password first:**
1. Go to https://supabase.com/dashboard/project/bcboebhicfsscxrqumyk/settings/database
2. Copy password from "Database password" field

**Windows - Full backup:**
```powershell
# Set password as environment variable (replace YOUR_PASSWORD)
$env:PGPASSWORD="YOUR_PASSWORD"

# Full backup
pg_dump -h db.bcboebhicfsscxrqumyk.supabase.co -U postgres -d postgres -f backup.sql
```

**Schema only:**
```powershell
pg_dump -h db.bcboebhicfsscxrqumyk.supabase.co -U postgres -d postgres --schema-only -f schema.sql
```

**Data only:**
```powershell
pg_dump -h db.bcboebhicfsscxrqumyk.supabase.co -U postgres -d postgres --data-only -f data.sql
```

**Compressed backup:**
```powershell
pg_dump -h db.bcboebhicfsscxrqumyk.supabase.co -U postgres -d postgres -F c -f backup.dump
```

*Note: You need PostgreSQL client tools installed. Download from https://www.postgresql.org/download/windows/*

## Option 4: Direct PostgreSQL pg_dump

You can also use PostgreSQL's pg_dump directly:

```bash
pg_dump -h db.bcboebhicfsscxrqumyk.supabase.co -U postgres -d postgres > backup.sql
```

(You'll need the database password from Supabase settings)

## Automated Backups in App

The DataExport component has been updated to export:
- All old tables (general, contact, hours, services, reviews, about, pricing, gallery)
- New multi-page system tables (pages, page_blocks, building_blocks, site_settings)
- Static content (static_content, services_section)

Users can download a complete JSON backup through the admin interface.
