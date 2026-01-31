# BeautifulCMS - Backup & Google Cloud Setup

## Übersicht

Dieses Dokument beschreibt die Einrichtung und Konfiguration von automatischen Backups mit Google Cloud Storage für das CMS.

---

## Inhaltsverzeichnis

1. [Backup-Strategie](#1-backup-strategie)
2. [Google Cloud Projekt erstellen](#2-google-cloud-projekt-erstellen)
3. [Cloud Storage einrichten](#3-cloud-storage-einrichten)
4. [Service Account erstellen](#4-service-account-erstellen)
5. [Backup-Implementierung](#5-backup-implementierung)
6. [Automatisierung](#6-automatisierung)
7. [Wiederherstellung](#7-wiederherstellung)
8. [Monitoring](#8-monitoring)

---

## 1. Backup-Strategie

### 1.1 Was wird gesichert?

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKUP-UMFANG                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. DATENBANK (Supabase PostgreSQL)                                    │
│     ├─ websites (Website-Konfigurationen)                              │
│     ├─ customers (Kundendaten)                                         │
│     ├─ faq_items (FAQ-Einträge)                                        │
│     ├─ onboarding_content (Onboarding-Daten)                           │
│     └─ Alle weiteren Tabellen                                          │
│                                                                         │
│  2. DATEIEN (Supabase Storage)                                         │
│     ├─ media/ (Hochgeladene Bilder)                                    │
│     ├─ logos/ (Kundenlogos)                                            │
│     └─ onboarding/ (Onboarding-Uploads)                                │
│                                                                         │
│  3. KONFIGURATION                                                       │
│     ├─ Umgebungsvariablen (verschlüsselt)                              │
│     └─ Deployment-Einstellungen                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Backup-Zeitplan

| Typ | Häufigkeit | Aufbewahrung | Beschreibung |
|-----|------------|--------------|--------------|
| Täglich | Jeden Tag 03:00 UTC | 30 Tage | Vollständiges Backup |
| Wöchentlich | Sonntag 04:00 UTC | 12 Wochen | Langzeit-Backup |
| Monatlich | 1. des Monats 05:00 UTC | 12 Monate | Archiv |

### 1.3 Backup-Benennung

```
Namensschema: {projekt}_{typ}_{datum}_{zeit}.{format}

Beispiele:
- beautifulcms_db_daily_2024-01-15_030000.sql.gz
- beautifulcms_storage_daily_2024-01-15_030000.tar.gz
- beautifulcms_db_weekly_2024-01-14_040000.sql.gz
```

---

## 2. Google Cloud Projekt erstellen

### 2.1 Schritt-für-Schritt Anleitung

```
SCHRITT 1: Google Cloud Console öffnen
────────────────────────────────────────
1. Gehen Sie zu: https://console.cloud.google.com
2. Melden Sie sich mit Ihrem Google-Account an
3. Akzeptieren Sie die Nutzungsbedingungen (falls nötig)
```

```
SCHRITT 2: Neues Projekt erstellen
────────────────────────────────────────
1. Klicken Sie oben links auf das Projekt-Dropdown
2. Klicken Sie auf "Neues Projekt"
3. Geben Sie folgende Daten ein:
   - Projektname: beautifulcms-backup
   - Organisations: (Ihre Organisation oder "Keine Organisation")
   - Standort: (Optional)
4. Klicken Sie auf "Erstellen"
5. Warten Sie, bis das Projekt erstellt wurde (~30 Sekunden)
6. Wählen Sie das neue Projekt aus
```

```
SCHRITT 3: Abrechnung aktivieren
────────────────────────────────────────
1. Gehen Sie zu: Navigation Menu > Abrechnung
2. Verknüpfen Sie ein Rechnungskonto
   - Neues Konto erstellen ODER
   - Bestehendes Konto auswählen
3. Bestätigen Sie die Verknüpfung

HINWEIS: Google Cloud bietet ein kostenloses Kontingent:
- 5 GB Cloud Storage (Standard)
- Kostenlose Datenabrufe innerhalb derselben Region
```

### 2.2 APIs aktivieren

```
SCHRITT 4: Cloud Storage API aktivieren
────────────────────────────────────────
1. Gehen Sie zu: Navigation Menu > APIs & Dienste > Bibliothek
2. Suchen Sie nach "Cloud Storage"
3. Klicken Sie auf "Cloud Storage API"
4. Klicken Sie auf "Aktivieren"
5. Warten Sie auf die Bestätigung
```

---

## 3. Cloud Storage einrichten

### 3.1 Bucket erstellen

```
SCHRITT 5: Storage Bucket erstellen
────────────────────────────────────────
1. Gehen Sie zu: Navigation Menu > Cloud Storage > Buckets
2. Klicken Sie auf "+ Erstellen"
3. Bucket konfigurieren:

   Name: beautifulcms-backups
   (Muss weltweit eindeutig sein!)
   
   Standort:
   - Typ: Region
   - Region: europe-west3 (Frankfurt)
   
   Speicherklasse:
   - Standard (für häufigen Zugriff)
   
   Zugriffssteuerung:
   - Einheitlich (empfohlen)
   
   Erweiterte Einstellungen:
   - Verschlüsselung: Google-verwaltet (Standard)
   
4. Klicken Sie auf "Erstellen"
```

### 3.2 Lebenszyklusregeln einrichten

```
SCHRITT 6: Automatische Löschung alter Backups
────────────────────────────────────────
1. Öffnen Sie den erstellten Bucket
2. Gehen Sie zu Tab "Lebenszyklus"
3. Klicken Sie auf "Regel hinzufügen"

Regel 1: Tägliche Backups nach 30 Tagen löschen
- Aktion: Löschen
- Bedingungen:
  - Alter: 30 Tage
  - Übereinstimmungen mit Präfix: daily_
  
Regel 2: Wöchentliche Backups nach 84 Tagen löschen
- Aktion: Löschen
- Bedingungen:
  - Alter: 84 Tage
  - Übereinstimmungen mit Präfix: weekly_

Regel 3: Monatliche Backups nach 365 Tagen löschen
- Aktion: Löschen
- Bedingungen:
  - Alter: 365 Tage
  - Übereinstimmungen mit Präfix: monthly_
```

### 3.3 Ordnerstruktur

```
beautifulcms-backups/
├── database/
│   ├── daily/
│   │   ├── beautifulcms_db_daily_2024-01-15.sql.gz
│   │   └── ...
│   ├── weekly/
│   │   └── ...
│   └── monthly/
│       └── ...
├── storage/
│   ├── daily/
│   │   ├── beautifulcms_storage_daily_2024-01-15.tar.gz
│   │   └── ...
│   ├── weekly/
│   │   └── ...
│   └── monthly/
│       └── ...
└── logs/
    └── backup_log_2024-01.json
```

---

## 4. Service Account erstellen

### 4.1 Service Account anlegen

```
SCHRITT 7: Service Account erstellen
────────────────────────────────────────
1. Gehen Sie zu: Navigation Menu > IAM & Verwaltung > Dienstkonten
2. Klicken Sie auf "+ Dienstkonto erstellen"
3. Dienstkonto-Details:
   - Name: beautifulcms-backup-service
   - ID: beautifulcms-backup-service (automatisch)
   - Beschreibung: Service Account für CMS Backups
4. Klicken Sie auf "Erstellen und fortfahren"
```

```
SCHRITT 8: Berechtigungen zuweisen
────────────────────────────────────────
1. Im Schritt "Diesem Dienstkonto Zugriff gewähren":
2. Rolle hinzufügen: "Storage-Objekt-Administrator"
   (roles/storage.objectAdmin)
3. Klicken Sie auf "Fortfahren"
4. Optional: Nutzer hinzufügen die das Konto verwalten dürfen
5. Klicken Sie auf "Fertig"
```

### 4.2 JSON-Schlüssel erstellen

```
SCHRITT 9: Schlüssel erstellen
────────────────────────────────────────
1. Klicken Sie auf das erstellte Dienstkonto
2. Gehen Sie zu Tab "Schlüssel"
3. Klicken Sie auf "Schlüssel hinzufügen" > "Neuen Schlüssel erstellen"
4. Schlüsseltyp: JSON
5. Klicken Sie auf "Erstellen"
6. Die JSON-Datei wird automatisch heruntergeladen

WICHTIG: 
- Speichern Sie diese Datei sicher!
- Nie in Git committen!
- Nie öffentlich teilen!
```

### 4.3 Schlüssel-Struktur

```json
// Beispiel: beautifulcms-backup-service-abc123.json
{
  "type": "service_account",
  "project_id": "beautifulcms-backup",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "beautifulcms-backup-service@beautifulcms-backup.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 5. Backup-Implementierung

### 5.1 Umgebungsvariablen

```env
# .env.local (NICHT committen!)

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=beautifulcms-backup
GOOGLE_CLOUD_BUCKET_NAME=beautifulcms-backups
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account","project_id":"beautifulcms-backup",...}

# Oder als Dateipfad
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Supabase (für Backup-Zugriff)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5.2 Backup-Service

```typescript
// src/services/backup/BackupService.ts

import { Storage } from '@google-cloud/storage';
import { createClient } from '@supabase/supabase-js';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

interface BackupOptions {
  type: 'daily' | 'weekly' | 'monthly';
  includeStorage?: boolean;
}

interface BackupResult {
  success: boolean;
  databaseUrl?: string;
  storageUrl?: string;
  error?: string;
  duration: number;
}

export class BackupService {
  private storage: Storage;
  private supabase: ReturnType<typeof createClient>;
  private bucketName: string;

  constructor() {
    // Google Cloud Storage initialisieren
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}')
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
    
    // Supabase mit Service Role (Admin-Zugriff)
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Führt ein vollständiges Backup durch
   */
  async performBackup(options: BackupOptions): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = this.getTimestamp();
    
    try {
      // 1. Datenbank-Backup
      const dbBackupUrl = await this.backupDatabase(options.type, timestamp);
      
      // 2. Storage-Backup (optional)
      let storageBackupUrl: string | undefined;
      if (options.includeStorage) {
        storageBackupUrl = await this.backupStorage(options.type, timestamp);
      }
      
      // 3. Backup-Log schreiben
      await this.logBackup({
        type: options.type,
        timestamp,
        databaseUrl: dbBackupUrl,
        storageUrl: storageBackupUrl,
        success: true
      });
      
      return {
        success: true,
        databaseUrl: dbBackupUrl,
        storageUrl: storageBackupUrl,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('Backup failed:', error);
      
      await this.logBackup({
        type: options.type,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Erstellt ein Datenbank-Backup
   */
  private async backupDatabase(type: string, timestamp: string): Promise<string> {
    // Alle Tabellen exportieren
    const tables = ['websites', 'customers', 'faq_items', 'onboarding_content', 'onboarding_images'];
    const exportData: Record<string, any[]> = {};
    
    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('*');
      
      if (error) throw new Error(`Export ${table} failed: ${error.message}`);
      exportData[table] = data || [];
    }
    
    // JSON erstellen und komprimieren
    const jsonData = JSON.stringify(exportData, null, 2);
    const compressed = await gzipAsync(Buffer.from(jsonData));
    
    // Zu Google Cloud hochladen
    const fileName = `database/${type}/beautifulcms_db_${type}_${timestamp}.json.gz`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);
    
    await file.save(compressed, {
      metadata: {
        contentType: 'application/gzip',
        metadata: {
          backupType: type,
          timestamp,
          tables: tables.join(',')
        }
      }
    });
    
    return `gs://${this.bucketName}/${fileName}`;
  }

  /**
   * Erstellt ein Storage-Backup
   */
  private async backupStorage(type: string, timestamp: string): Promise<string> {
    const storageBuckets = ['media', 'logos', 'onboarding'];
    const allFiles: { bucket: string; path: string; data: Buffer }[] = [];
    
    for (const storageBucket of storageBuckets) {
      const { data: files, error } = await this.supabase.storage
        .from(storageBucket)
        .list('', { limit: 10000 });
      
      if (error) continue;
      
      for (const file of files || []) {
        const { data } = await this.supabase.storage
          .from(storageBucket)
          .download(file.name);
        
        if (data) {
          allFiles.push({
            bucket: storageBucket,
            path: file.name,
            data: Buffer.from(await data.arrayBuffer())
          });
        }
      }
    }
    
    // Als JSON mit Base64-Daten speichern
    const storageData = allFiles.map(f => ({
      bucket: f.bucket,
      path: f.path,
      data: f.data.toString('base64')
    }));
    
    const jsonData = JSON.stringify(storageData);
    const compressed = await gzipAsync(Buffer.from(jsonData));
    
    const fileName = `storage/${type}/beautifulcms_storage_${type}_${timestamp}.json.gz`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);
    
    await file.save(compressed, {
      metadata: {
        contentType: 'application/gzip',
        metadata: {
          backupType: type,
          timestamp,
          fileCount: allFiles.length.toString()
        }
      }
    });
    
    return `gs://${this.bucketName}/${fileName}`;
  }

  /**
   * Backup-Log schreiben
   */
  private async logBackup(log: {
    type: string;
    timestamp: string;
    databaseUrl?: string;
    storageUrl?: string;
    success: boolean;
    error?: string;
  }): Promise<void> {
    const month = log.timestamp.slice(0, 7);
    const fileName = `logs/backup_log_${month}.json`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);
    
    // Bestehende Logs laden
    let logs: any[] = [];
    try {
      const [content] = await file.download();
      logs = JSON.parse(content.toString());
    } catch {
      // Datei existiert noch nicht
    }
    
    logs.push({
      ...log,
      createdAt: new Date().toISOString()
    });
    
    await file.save(JSON.stringify(logs, null, 2), {
      metadata: { contentType: 'application/json' }
    });
  }

  /**
   * Timestamp generieren
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '_')
      .slice(0, 15);
  }
}
```

### 5.3 API-Route für Backups

```typescript
// src/app/api/backup/route.ts (Next.js App Router)

import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/services/backup/BackupService';

// Geheimer Token für Cron-Jobs
const BACKUP_SECRET = process.env.BACKUP_SECRET;

export async function POST(request: NextRequest) {
  // Authentifizierung prüfen
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${BACKUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type = 'daily', includeStorage = true } = body;

    const backupService = new BackupService();
    const result = await backupService.performBackup({
      type,
      includeStorage
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} backup completed`,
        databaseUrl: result.databaseUrl,
        storageUrl: result.storageUrl,
        duration: `${result.duration}ms`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET für Status-Abfrage
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${BACKUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Letzten Backup-Status abrufen
  const backupService = new BackupService();
  // ... Status-Logik

  return NextResponse.json({
    lastBackup: '2024-01-15T03:00:00Z',
    status: 'healthy',
    nextBackup: '2024-01-16T03:00:00Z'
  });
}
```

---

## 6. Automatisierung

### 6.1 Vercel Cron Jobs

```json
// vercel.json

{
  "crons": [
    {
      "path": "/api/backup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

```typescript
// src/app/api/backup/route.ts

// Für Vercel Cron: GET statt POST
export async function GET(request: NextRequest) {
  // Vercel Cron sendet speziellen Header
  const cronSecret = request.headers.get('x-vercel-cron-auth');
  
  // Bestimme Backup-Typ basierend auf Tag
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const dayOfMonth = now.getUTCDate();
  
  let type: 'daily' | 'weekly' | 'monthly' = 'daily';
  if (dayOfMonth === 1) {
    type = 'monthly';
  } else if (dayOfWeek === 0) {
    type = 'weekly';
  }

  const backupService = new BackupService();
  const result = await backupService.performBackup({
    type,
    includeStorage: type !== 'daily' // Storage nur bei weekly/monthly
  });

  return NextResponse.json(result);
}
```

### 6.2 Alternative: GitHub Actions

```yaml
# .github/workflows/backup.yml

name: Scheduled Backup

on:
  schedule:
    # Täglich um 03:00 UTC
    - cron: '0 3 * * *'
  workflow_dispatch:
    inputs:
      type:
        description: 'Backup Type'
        required: true
        default: 'daily'
        type: choice
        options:
          - daily
          - weekly
          - monthly

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger Backup
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.BACKUP_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"type": "${{ github.event.inputs.type || 'daily' }}"}' \
            ${{ secrets.BACKUP_API_URL }}

      - name: Notify on Failure
        if: failure()
        run: |
          # E-Mail oder Slack-Benachrichtigung
          echo "Backup failed!"
```

---

## 7. Wiederherstellung

### 7.1 Restore-Service

```typescript
// src/services/backup/RestoreService.ts

import { Storage } from '@google-cloud/storage';
import { createClient } from '@supabase/supabase-js';
import { gunzip } from 'zlib';
import { promisify } from 'util';

const gunzipAsync = promisify(gunzip);

interface RestoreOptions {
  databaseBackupPath?: string;
  storageBackupPath?: string;
  dryRun?: boolean;  // Nur prüfen, nicht überschreiben
}

export class RestoreService {
  private storage: Storage;
  private supabase: ReturnType<typeof createClient>;
  private bucketName: string;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}')
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Liste aller verfügbaren Backups
   */
  async listBackups(): Promise<{
    database: { name: string; date: Date; size: number }[];
    storage: { name: string; date: Date; size: number }[];
  }> {
    const bucket = this.storage.bucket(this.bucketName);
    
    const [dbFiles] = await bucket.getFiles({ prefix: 'database/' });
    const [storageFiles] = await bucket.getFiles({ prefix: 'storage/' });

    return {
      database: dbFiles.map(f => ({
        name: f.name,
        date: new Date(f.metadata.timeCreated!),
        size: parseInt(f.metadata.size as string)
      })),
      storage: storageFiles.map(f => ({
        name: f.name,
        date: new Date(f.metadata.timeCreated!),
        size: parseInt(f.metadata.size as string)
      }))
    };
  }

  /**
   * Datenbank wiederherstellen
   */
  async restoreDatabase(backupPath: string, dryRun = false): Promise<{
    success: boolean;
    restoredTables: string[];
    recordCounts: Record<string, number>;
  }> {
    // Backup herunterladen
    const bucket = this.storage.bucket(this.bucketName);
    const [compressed] = await bucket.file(backupPath).download();
    
    // Dekomprimieren
    const decompressed = await gunzipAsync(compressed);
    const data = JSON.parse(decompressed.toString()) as Record<string, any[]>;
    
    const restoredTables: string[] = [];
    const recordCounts: Record<string, number> = {};

    for (const [table, records] of Object.entries(data)) {
      recordCounts[table] = records.length;
      
      if (dryRun) {
        restoredTables.push(`${table} (${records.length} records - DRY RUN)`);
        continue;
      }

      // WICHTIG: Bestehende Daten löschen
      const { error: deleteError } = await this.supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Löscht alle
      
      if (deleteError) {
        console.error(`Delete ${table} failed:`, deleteError);
        continue;
      }

      // Neue Daten einfügen (in Batches von 1000)
      const batchSize = 1000;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error: insertError } = await this.supabase
          .from(table)
          .insert(batch);
        
        if (insertError) {
          console.error(`Insert ${table} failed:`, insertError);
        }
      }
      
      restoredTables.push(table);
    }

    return {
      success: true,
      restoredTables,
      recordCounts
    };
  }

  /**
   * Storage wiederherstellen
   */
  async restoreStorage(backupPath: string, dryRun = false): Promise<{
    success: boolean;
    restoredFiles: number;
  }> {
    const bucket = this.storage.bucket(this.bucketName);
    const [compressed] = await bucket.file(backupPath).download();
    
    const decompressed = await gunzipAsync(compressed);
    const files = JSON.parse(decompressed.toString()) as {
      bucket: string;
      path: string;
      data: string;
    }[];

    let restoredCount = 0;

    for (const file of files) {
      if (dryRun) {
        console.log(`Would restore: ${file.bucket}/${file.path}`);
        restoredCount++;
        continue;
      }

      const fileData = Buffer.from(file.data, 'base64');
      
      const { error } = await this.supabase.storage
        .from(file.bucket)
        .upload(file.path, fileData, { upsert: true });
      
      if (!error) {
        restoredCount++;
      }
    }

    return {
      success: true,
      restoredFiles: restoredCount
    };
  }
}
```

### 7.2 Restore-API

```typescript
// src/app/api/restore/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { RestoreService } from '@/services/backup/RestoreService';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.BACKUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const restoreService = new RestoreService();
  const backups = await restoreService.listBackups();

  return NextResponse.json(backups);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.BACKUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { databaseBackup, storageBackup, dryRun = true } = await request.json();

  const restoreService = new RestoreService();
  const results: any = {};

  if (databaseBackup) {
    results.database = await restoreService.restoreDatabase(databaseBackup, dryRun);
  }

  if (storageBackup) {
    results.storage = await restoreService.restoreStorage(storageBackup, dryRun);
  }

  return NextResponse.json({
    dryRun,
    results
  });
}
```

---

## 8. Monitoring

### 8.1 Backup-Dashboard im SuperAdmin

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Backup-Status                                            [Backup jetzt]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Letztes Backup: 15.01.2024 03:00:00 ✅                                │
│  Nächstes Backup: 16.01.2024 03:00:00                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Letzte 7 Tage                                                   │   │
│  │                                                                  │   │
│  │  Mo   Di   Mi   Do   Fr   Sa   So                               │   │
│  │  ✅   ✅   ✅   ✅   ✅   ✅   ✅                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Speicherverbrauch: 2.3 GB von 5 GB (46%)                              │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                         │
│  Verfügbare Backups:                                                   │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Typ     │ Datum       │ Größe  │ Status │ Aktionen             │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ Täglich │ 15.01.2024  │ 45 MB  │ ✅     │ [Herunterladen] [↺]  │    │
│  │ Täglich │ 14.01.2024  │ 44 MB  │ ✅     │ [Herunterladen] [↺]  │    │
│  │ Wöchent │ 14.01.2024  │ 320 MB │ ✅     │ [Herunterladen] [↺]  │    │
│  │ Monatl. │ 01.01.2024  │ 310 MB │ ✅     │ [Herunterladen] [↺]  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  [↺] = Wiederherstellen                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Alert-System

```typescript
// src/services/backup/BackupMonitor.ts

interface BackupAlert {
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export class BackupMonitor {
  /**
   * Prüft Backup-Gesundheit
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    alerts: BackupAlert[];
  }> {
    const alerts: BackupAlert[] = [];
    const restoreService = new RestoreService();
    const backups = await restoreService.listBackups();

    // 1. Prüfen ob tägliches Backup existiert
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const recentDbBackup = backups.database.find(
      b => new Date(b.date) > yesterday
    );
    
    if (!recentDbBackup) {
      alerts.push({
        type: 'error',
        message: 'Kein Datenbank-Backup in den letzten 24 Stunden!',
        timestamp: new Date()
      });
    }

    // 2. Speicherplatz prüfen
    const totalSize = [...backups.database, ...backups.storage]
      .reduce((sum, b) => sum + b.size, 0);
    
    const maxSize = 5 * 1024 * 1024 * 1024; // 5 GB
    const usagePercent = (totalSize / maxSize) * 100;
    
    if (usagePercent > 80) {
      alerts.push({
        type: 'warning',
        message: `Speicherplatz bei ${usagePercent.toFixed(1)}% - bitte alte Backups prüfen`,
        timestamp: new Date()
      });
    }

    // 3. Prüfen ob wöchentliches Backup existiert
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyBackup = backups.database.find(
      b => b.name.includes('weekly') && new Date(b.date) > oneWeekAgo
    );
    
    if (!weeklyBackup) {
      alerts.push({
        type: 'warning',
        message: 'Kein wöchentliches Backup in der letzten Woche',
        timestamp: new Date()
      });
    }

    return {
      healthy: alerts.filter(a => a.type === 'error').length === 0,
      alerts
    };
  }

  /**
   * Sendet E-Mail bei Problemen
   */
  async sendAlertEmail(alerts: BackupAlert[]): Promise<void> {
    if (alerts.length === 0) return;

    const errorAlerts = alerts.filter(a => a.type === 'error');
    if (errorAlerts.length === 0) return;

    // E-Mail senden (z.B. mit Resend)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'backups@beautifulcms.de',
        to: process.env.ADMIN_EMAIL,
        subject: '⚠️ BeautifulCMS Backup-Warnung',
        html: `
          <h1>Backup-Probleme erkannt</h1>
          <ul>
            ${errorAlerts.map(a => `<li>${a.message}</li>`).join('')}
          </ul>
          <p>Bitte prüfen Sie den Backup-Status.</p>
        `
      })
    });
  }
}
```

---

## Implementierungs-Checkliste

- [ ] Google Cloud Projekt erstellen
- [ ] Cloud Storage Bucket erstellen
- [ ] Lebenszyklusregeln einrichten
- [ ] Service Account erstellen
- [ ] JSON-Schlüssel sicher speichern
- [ ] Umgebungsvariablen konfigurieren
- [ ] BackupService implementieren
- [ ] RestoreService implementieren
- [ ] API-Routes erstellen
- [ ] Vercel Cron Jobs einrichten
- [ ] Monitoring-Dashboard erstellen
- [ ] Alert-E-Mails einrichten
- [ ] Erste Backups manuell testen
- [ ] Restore-Prozess testen (!)
- [ ] Dokumentation für Team erstellen
