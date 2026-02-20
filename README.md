# Friseursalon Sarah Soriano - Website

Eine moderne, responsive Website für Friseursalons mit integriertem Content Management System (CMS).

## 🎯 Projekt-Übersicht

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **CMS:** Decap CMS (für Content-Verwaltung)
- **Hosting:** Netlify (empfohlen)

---

# Supabase

Supabase-Postgres-passwort für Friseursalon: 
#Raphaelsupabase
Dashboard: https://supabase.com/dashboard/project/bcboebhicfsscxrqumyk

Supabase-Postgres-passwort für WebseiteLernen: 
#Raphaelsupabase
Dashboard: https://supabase.com/dashboard/project/tdxvsruunslksdznivrb


gmail: 
salon.sarahsorano.gmail.com
#Raphaelgo7

Aber wie, mit Github eingeloggt? 

Webflow test: 
https://heiko-site.design.webflow.com/?locale=en&pageId=6988f2a186df2b3487478c83&workflow=canvas


77 Style Salon, Bad Hersfeld, Badestube 6a


Passwort Für diese Webseite: 
heiko.scheffler@gmx.de   supabase
Dieses Passwort ist irgendwo in Supabase gespeichert.


Namenssuche: 
forgecms.io
rendercms.com
shellcms.com
getforgecms.com
fabriccms.com
versioncms.com
portablecms.com
hostlesscms.com
cloudlesscms.com
octocms.com
panthercms.com
shadecms.com
entrycms.com
logiccms.com
volcanocms.com
raefy.com
raefix.com
rafixo.com
enchantix.com
mysticae.com
koalacms.com
compasscms.com
hedgehogcms.com
berrycms.com
dovecms.com
kabacms.com
raphaelcms.com
rahelcms.com
heikocms.com
aloycms.com
kaycms.com





## Ressourcen für images: 
https://de.freepik.com/vektoren-kostenlos/frau-frisur-design_1068949.htm#fromView=search&page=1&position=1&uuid=32c7ebeb-1544-4bd9-b103-e171bfb92b0e&query=damenfrisure+svg+schnittdateien


Friseurläden ausfindig machen: 
Gemini: 
Ermittle 20 Friseurläden in Frankfurt und Umgebung, die eine gute Google-Bewertung 
haben, aber kein Website haben und auch keine starke Social-Media Präsenz als
Webseiten-Ersatz. 


## 📋 Voraussetzungen

### Accounts (kostenlos)

1. **GitHub Account**
   - Registrierung: [github.com](https://github.com/signup)
   - Wird benötigt für: Code-Versionierung und Netlify-Integration




2. **Netlify Account**
   - Registrierung: [netlify.com](https://app.netlify.com/signup)
   - Am besten mit GitHub-Account verknüpfen
   - Wird benötigt für: Hosting und CMS-Authentifizierung

hscheffler22047@googlemail.com
Heiko and Raphael

### Software

- **Node.js** (v18 oder höher)
  - Download: [nodejs.org](https://nodejs.org/)
  - Prüfen: `node --version`
- **Git**
  - Download: [git-scm.com](https://git-scm.com/)
  - Prüfen: `git --version`

---

## 🚀 Setup - Schritt für Schritt

### 1. Projekt klonen / herunterladen

```bash
cd C:\Projekte
git clone https://github.com/IhrUsername/salon-website.git
cd salon-website
```

### 2. Dependencies installieren

```bash
npm install --legacy-peer-deps
```

> **Hinweis:** `--legacy-peer-deps` ist nötig wegen Kompatibilität zwischen React 19 und Decap CMS.

### 3. Lokale Entwicklung starten

```bash
npm run dev
```

- Website: `http://localhost:5173`
- CMS (Test-Modus): `http://localhost:5173/admin/index.html`

---

## 📦 Deployment auf Netlify

### Schritt 1: Git Repository erstellen

```bash
# Im Projekt-Verzeichnis
git init
git add .
git commit -m "Initial commit"
```

### Schritt 2: Zu GitHub pushen

1. **Erstellen Sie ein neues Repository auf GitHub:**
   - Gehen Sie zu [github.com/new](https://github.com/new)
   - Repository Name: z.B. `salon-sarah-soriano`
   - Visibility: Private oder Public
   - **NICHT** initialisieren mit README, .gitignore oder License
   - Klicken Sie auf "Create repository"

2. **Lokales Repository mit GitHub verbinden:**

```bash
git remote add origin https://github.com/IhrUsername/salon-sarah-soriano.git
git branch -M main
git push -u origin main
```

### Schritt 3: Netlify Deployment

1. **Gehen Sie zu [app.netlify.com](https://app.netlify.com)**
2. Klicken Sie auf **"Add new site"** → **"Import an existing project"**
3. Wählen Sie **"GitHub"** und autorisieren Sie Netlify
4. Wählen Sie Ihr Repository: `salon-sarah-soriano`
5. **Build Settings:**
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click **"Show advanced"** → **"Add environment variable"**
     - Key: `NODE_VERSION`, Value: `18`
6. Klicken Sie auf **"Deploy site"**

⏳ **Warten Sie 2-3 Minuten** - Netlify baut Ihre Website!

### Schritt 4: Custom Domain (Optional)

1. In Netlify → **"Domain settings"**
2. Klicken Sie auf **"Add custom domain"**
3. Geben Sie Ihre Domain ein (z.B. `sarah-soriano.de`)
4. Folgen Sie den Anweisungen zur DNS-Konfiguration

---

## 🔐 CMS einrichten (Netlify Identity + Git Gateway)

### Schritt 1: Identity aktivieren

1. Gehen Sie zu Ihrer Site in Netlify
2. Klicken Sie auf **"Identity"** im Menü
3. Klicken Sie auf **"Enable Identity"**

### Schritt 2: Git Gateway aktivieren

1. Unter **"Identity"** → scrollen zu **"Services"**
2. Klicken Sie bei **"Git Gateway"** auf **"Enable Git Gateway"**

### Schritt 3: Registration Preferences

1. Unter **"Identity"** → **"Settings and usage"**
2. Bei **"Registration preferences"** → wählen Sie **"Invite only"**
3. Optional: **"External providers"** aktivieren (Google, GitHub Login)

### Schritt 4: Benutzer einladen

1. Gehen Sie zu **"Identity"** Tab
2. Klicken Sie auf **"Invite users"**
3. Geben Sie E-Mail-Adressen ein (kommagetrennt)
4. Benutzer erhalten Einladungs-E-Mail
5. Nach Bestätigung können sie sich unter `ihre-website.netlify.app/admin/` anmelden

### Schritt 5: CMS-Konfiguration für Produktion

Ändern Sie in [public/admin/config.yml](public/admin/config.yml):

```yaml
# Für Produktion:
backend:
  name: git-gateway
  branch: main

# Für lokale Entwicklung (auskommentieren für Produktion):
# backend:
#   name: test-repo
```

Commit und push:

```bash
git add .
git commit -m "Activate Git Gateway for production"
git push
```

---

## 🎨 Inhalte bearbeiten

### Option 1: Über das CMS (Empfohlen für Nicht-Techniker)

1. Öffnen Sie `https://ihre-website.netlify.app/admin/`
2. Melden Sie sich an
3. Bearbeiten Sie Inhalte über die grafische Oberfläche
4. Klicken Sie auf "Publish"
5. Website wird automatisch neu gebaut (1-2 Minuten)

📖 **Detaillierte Anleitung:** Siehe [CMS-ANLEITUNG.md](CMS-ANLEITUNG.md)

### Option 2: JSON-Dateien direkt bearbeiten

Bearbeiten Sie die Dateien in `src/content/`:
- [general.json](src/content/general.json) - Allgemeine Informationen
- [contact.json](src/content/contact.json) - Kontaktdaten
- [hours.json](src/content/hours.json) - Öffnungszeiten
- [services.json](src/content/services.json) - Dienstleistungen
- [reviews.json](src/content/reviews.json) - Bewertungen
- [about.json](src/content/about.json) - Über uns
- [pricing.json](src/content/pricing.json) - Preise

Commit und push nach Änderungen:

```bash
git add src/content/
git commit -m "Update content"
git push
```

📖 **Detaillierte Anleitung:** Siehe [DATENPFLEGE.md](DATENPFLEGE.md)

---

## 📁 Projektstruktur

```
├── public/
│   ├── admin/              # CMS Admin Interface
│   │   ├── config.yml      # CMS Konfiguration
│   │   └── index.html      # CMS Entry Point
│   └── vite.svg
├── src/
│   ├── components/         # React Komponenten
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── About.tsx
│   │   ├── Reviews.tsx
│   │   ├── Gallery.tsx
│   │   ├── Pricing.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── content/            # JSON Content-Dateien (CMS-editierbar)
│   │   ├── general.json
│   │   ├── contact.json
│   │   ├── hours.json
│   │   ├── services.json
│   │   ├── reviews.json
│   │   ├── about.json
│   │   └── pricing.json
│   ├── data/
│   │   └── salonData.ts    # Zentrale Daten-Aggregation
│   ├── App.tsx             # Haupt-App Komponente
│   ├── main.tsx            # React Entry Point
│   └── index.css           # Globale Styles + Tailwind
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── README.md               # Diese Datei
├── CMS-ANLEITUNG.md        # CMS Benutzer-Anleitung
└── DATENPFLEGE.md          # JSON Datenpflege-Anleitung
```

---

## 🛠️ Verfügbare Commands

```bash
# Development Server starten
npm run dev

# Production Build erstellen
npm run build

# Build lokal testen
npm run preview

# Linting
npm run lint
```

---

## 🔄 Updates deployen

Nach Änderungen am Code oder Content:

```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Netlify baut die Website automatisch neu (dauert 1-2 Minuten).

---

## 🆘 Troubleshooting

### Build schlägt fehl auf Netlify

**Problem:** `Module not found` oder `Cannot resolve`

**Lösung:**
1. Prüfen Sie die Build Logs in Netlify
2. Stellen Sie sicher, dass `NODE_VERSION` Environment Variable auf `18` gesetzt ist
3. Lokalen Build testen: `npm run build`

### CMS lädt keine Daten

**Problem:** Felder im CMS sind leer

**Lösung:**
- Im Test-Modus (`backend: test-repo`) werden keine existierenden Daten geladen
- Für echte Daten: Git Gateway aktivieren und auf Netlify deployen

### npm install Fehler

**Problem:** Peer dependency conflicts

**Lösung:**
```bash
npm install --legacy-peer-deps
```

### CMS Admin-Seite nicht erreichbar

**Lösung:**
- Prüfen Sie: `http://localhost:5173/admin/index.html` (mit `/index.html`)
- Prüfen Sie ob `public/admin/index.html` existiert
- Dev-Server neu starten

---

## 📚 Dokumentation

- **[CMS-ANLEITUNG.md](CMS-ANLEITUNG.md)** - Vollständige CMS-Anleitung für Endbenutzer
- **[DATENPFLEGE.md](DATENPFLEGE.md)** - Anleitung zur direkten JSON-Bearbeitung
- **[Decap CMS Docs](https://decapcms.org/docs/)** - Offizielle CMS-Dokumentation
- **[Netlify Docs](https://docs.netlify.com/)** - Netlify-Dokumentation
- **[Vite Docs](https://vitejs.dev/)** - Vite Build-Tool Dokumentation

---

## 🔗 Wichtige Links

- **Live-Website:** `https://ihre-website.netlify.app`
- **CMS Admin:** `https://ihre-website.netlify.app/admin/`
- **Netlify Dashboard:** `https://app.netlify.com/sites/ihre-site`
- **GitHub Repository:** `https://github.com/IhrUsername/salon-website`

---

## 📝 Checkliste für Produktiv-Schaltung

- [ ] GitHub Repository erstellt
- [ ] Code gepusht
- [ ] Netlify Site erstellt
- [ ] Build erfolgreich
- [ ] Custom Domain konfiguriert (optional)
- [ ] Netlify Identity aktiviert
- [ ] Git Gateway aktiviert
- [ ] Benutzer eingeladen
- [ ] CMS getestet (Content ändern)
- [ ] Website auf allen Geräten getestet
- [ ] SSL-Zertifikat aktiv (automatisch von Netlify)

---

## 👥 Team & Support

Bei Fragen oder Problemen:
- **Technische Fragen:** GitHub Issues erstellen
- **CMS-Fragen:** [CMS-ANLEITUNG.md](CMS-ANLEITUNG.md) konsultieren
- **Content-Änderungen:** [DATENPFLEGE.md](DATENPFLEGE.md) konsultieren

---

## 📄 Lizenz

Dieses Projekt wurde für Friseursalon Sarah Soriano entwickelt.

---

**🎉 Viel Erfolg mit Ihrer neuen Website!**
