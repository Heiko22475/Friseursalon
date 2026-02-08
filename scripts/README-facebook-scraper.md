# Facebook Image Scraper

Dieses Skript lädt alle öffentlich sichtbaren Bilder von einer Facebook-Seite herunter und verpackt sie als ZIP-Datei.

## ⚙️ Installation

### 1. Dependencies installieren

```bash
# Im Hauptverzeichnis des Projekts
npm install puppeteer archiver --save-dev
```

### 2. Alternativ: Nur für Scraper installieren

```bash
# Im scripts-Verzeichnis
cd scripts
npm init -y
npm install puppeteer archiver
```

## 🚀 Verwendung

### Basis-Verwendung

```bash
node scripts/facebook-image-scraper.js <facebook-url>
```

**Beispiel:**
```bash
node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/
```

Dies lädt alle Bilder herunter und speichert sie als `Bilder_77stylesalon.zip` im Standardverzeichnis `c:\temp3\`.

### Mit benutzerdefiniertem Output-Verzeichnis

```bash
node scripts/facebook-image-scraper.js <facebook-url> <output-dir>
```

**Beispiele:**
```bash
# Windows
node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/ c:\temp3

# macOS/Linux
node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/ /tmp/images
```

## 📁 Output

Das Skript erstellt:
- Ein temporäres Verzeichnis: `temp_<pagename>/`
- Eine ZIP-Datei: `Bilder_<pagename>.zip`

**Beispiel:**
- URL: `https://www.facebook.com/77stylesalon/`
- Output: `c:\temp3\Bilder_77stylesalon.zip`

## 🎛️ Konfiguration

Im Skript kannst du folgende Parameter anpassen (Zeilen 20-26):

```javascript
const CONFIG = {
  scrollDelay: 2000,        // Zeit zwischen Scroll-Aktionen (ms)
  maxScrolls: 10,           // Maximale Anzahl Scrolls (mehr = mehr Bilder)
  imageTimeout: 30000,      // Timeout für Bild-Download (ms)
  headless: true,           // Browser sichtbar? (false für Debugging)
  defaultOutputDir: 'c:\\temp3'  // Standard Output-Verzeichnis
};
```

### Mehr Bilder laden

Um mehr Bilder zu laden, erhöhe `maxScrolls`:

```javascript
maxScrolls: 20,  // Lädt ca. doppelt so viele Bilder
```

### Browser sichtbar machen (Debugging)

```javascript
headless: false,  // Browser-Fenster wird angezeigt
```

## 🍪 Cookie-Format

Die `cookies.json` sollte ein Array von Cookie-Objekten enthalten:

```json
[
    {
        "domain": ".facebook.com",
        "expirationDate": 1800174987.456201,
        "hostOnly": false,
        "httpOnly": true,
        "name": "datr",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "eSU9aRDLfjXw7vdrBKWqXqxG"
    },
    {
        "domain": ".facebook.com",
        "expirationDate": 1778246721.470873,
        "hostOnly": false,
        "httpOnly": true,
        "name": "fr",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "0PcoqzfC0JlLPLZlU.AWdXddbWyoqv0..."
    },
    {
        "domain": ".facebook.com",
        "expirationDate": 1802006709.042425,
        "hostOnly": false,
        "httpOnly": true,
        "name": "xs",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "41%3AHlzNaAL639FbgA%3A2%3A1770470704..."
    },
    {
        "domain": ".facebook.com",
        "expirationDate": 1802006709.04207,
        "hostOnly": false,
        "httpOnly": false,
        "name": "c_user",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "100012345678901"
    }
]
```

**Wichtige Cookies:**
- `c_user` - User-ID (erforderlich)
- `xs` - Session-Cookie (erforderlich)
- `datr` - Device-Token
- `fr` - Session-Token

**Alternative Formate werden auch unterstützt:**
```json
{
  "cookies": [ ... ]
}
```

## ⚠️ Wichtige Hinweise

### 1. Öffentliche Seiten

Das Skript funktioniert nur mit **öffentlich zugänglichen** Facebook-Seiten (Pages), nicht mit:
- Privaten Profilen
- Geschlossenen Gruppen
- Login-geschützten Inhalten

### 2. Rate Limiting

Facebook kann deine IP-Adresse blockieren, wenn du zu viele Requests machst. Empfehlungen:
- Nicht mehr als 5-10 Seiten pro Stunde scrapen
- Pause zwischen Durchläufen machen
- `scrollDelay` nicht zu niedrig setzen

### 3. Qualität

Das Skript lädt die **höchstmögliche Qualität** herunter, indem es URL-Parameter entfernt. Die tatsächliche Auflösung hängt von dem ab, was Facebook bereitstellt.

### 4. Rechtliches

**WICHTIG:** Stelle sicher, dass du das Recht hast, die Bilder herunterzuladen:
- Bilder von Facebook unterliegen Urheberrecht
- Verwende Bilder nur mit Erlaubnis des Seitenbesitzers
- Beachte Facebooks Terms of Service
- Verwende die Bilder nicht kommerziell ohne Lizenz

## 🔧 Troubleshooting

### Problem: "No images found"

**Mögliche Ursachen:**
1. Seite erfordert Login → Nur öffentliche Seiten funktionieren
2. Seite ist privat → Keine Lösung möglich
3. Zu wenig gescrollt → Erhöhe `maxScrolls`
4. Facebook hat Struktur geändert → Script muss angepasst werden

**Lösung:**
```javascript
// In Zeile ~25 erhöhen
maxScrolls: 20,
```

### Problem: "Browser failed to launch"

**Windows:**
```bash
# Installiere Visual C++ Redistributables
# Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
```

**Linux:**
```bash
# Installiere Browser-Dependencies
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libasound2
```

### Problem: Downloads schlagen fehl

**Lösung:**
```javascript
// Timeout erhöhen (Zeile ~23)
imageTimeout: 60000,  // 60 Sekunden
```

### Problem: Zu wenige Bilder

**Lösung:**
```javascript
// Mehr scrollen und länger warten
scrollDelay: 3000,
maxScrolls: 20,
```

## 🛠️ Erweiterte Nutzung

### Mit Headless=false debuggen

Sieh, was der Browser macht:

```bash
# 1. In facebook-image-scraper.js ändern
headless: false,

# 2. Script ausführen
node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/
```

### Aus eigenem Code aufrufen

```javascript
const { scrapeImages } = require('./scripts/facebook-image-scraper');

async function run() {
  await scrapeImages(
    'https://www.facebook.com/77stylesalon/',
    'c:\\temp3'
  );
}

run();
```

## 📊 Beispiel-Output

```
🚀 Facebook Image Scraper gestartet

📱 Seite: https://www.facebook.com/77stylesalon/
📁 Output: c:\temp3

🌐 Browser wird gestartet...
📄 Lade Facebook-Seite...
⬇️  Scrolle durch die Seite...
🔍 Extrahiere Bild-URLs...

✨ 42 Bilder gefunden!

📥 Lade Bilder herunter...

✓ 42/42

📊 Download abgeschlossen:
   ✅ Erfolgreich: 42
   ❌ Fehlgeschlagen: 0

📦 Erstelle ZIP-Archiv...
✅ ZIP erstellt: c:\temp3\Bilder_77stylesalon.zip (15.32 MB)
🗑️  Räume auf...

✅ Fertig!
📦 ZIP-Datei: c:\temp3\Bilder_77stylesalon.zip
```

## 🔄 Batch-Processing

Für mehrere Seiten:

```bash
# batch-scrape.bat (Windows)
@echo off
node scripts/facebook-image-scraper.js https://www.facebook.com/salon1/ c:\temp3
timeout /t 60
node scripts/facebook-image-scraper.js https://www.facebook.com/salon2/ c:\temp3
timeout /t 60
node scripts/facebook-image-scraper.js https://www.facebook.com/salon3/ c:\temp3
```

```bash
# batch-scrape.sh (Linux/macOS)
#!/bin/bash
node scripts/facebook-image-scraper.js https://www.facebook.com/salon1/ /tmp/images
sleep 60
node scripts/facebook-image-scraper.js https://www.facebook.com/salon2/ /tmp/images
sleep 60
node scripts/facebook-image-scraper.js https://www.facebook.com/salon3/ /tmp/images
```

## 📝 Notizen

- **Chromium Download:** Beim ersten `npm install puppeteer` wird Chromium (~300MB) heruntergeladen
- **Speicherplatz:** ZIP-Dateien können 10-50 MB groß werden (je nach Bildanzahl)
- **Performance:** Ein Durchlauf dauert ca. 30-120 Sekunden
- **Facebook-Änderungen:** Wenn Facebook seine Struktur ändert, muss das Skript angepasst werden

## 🔗 Dependencies

- **[puppeteer](https://pptr.dev/)**: Browser-Automation (Chromium)
- **[archiver](https://www.npmjs.com/package/archiver)**: ZIP-Datei-Erstellung

## 📄 Lizenz

Dieses Skript ist Teil des BeautifulCMS-Projekts.

**WICHTIG:** Die heruntergeladenen Bilder unterliegen dem Urheberrecht ihrer Besitzer!
