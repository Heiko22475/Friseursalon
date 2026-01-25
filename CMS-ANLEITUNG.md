# 📝 Content Management System (CMS) - Anleitung

## ✨ Für Nicht-Technische Benutzer

Mit Netlify CMS können Sie alle Website-Inhalte über eine benutzerfreundliche Oberfläche bearbeiten - **ohne Code zu schreiben**!

---

## 🚀 Zugriff auf das CMS

### Nach dem Deployment auf Netlify:

1. **Öffnen Sie Ihren Browser**
2. **Gehen Sie zu:** `https://ihre-website.netlify.app/admin/`
3. **Melden Sie sich an** mit Ihrem Netlify-Account

---

## 🎯 Was können Sie bearbeiten?

### 1. **Allgemeine Informationen**
- Salon Name
- Motto & Tagline
- Beschreibung

### 2. **Kontaktdaten**
- Adresse
- Telefonnummer
- E-Mail
- Social Media Links

### 3. **Öffnungszeiten**
- Für jeden Wochentag einzeln

### 4. **Dienstleistungen**
- Services hinzufügen/entfernen
- Beschreibungen bearbeiten
- Features aktualisieren

### 5. **Bewertungen**
- Bewertungszahl aktualisieren
- Kundenstimmen bearbeiten
- Neue Testimonials hinzufügen

### 6. **Über Uns**
- Texte anpassen
- Highlights bearbeiten

### 7. **Preise**
- Preispakete hinzufügen/entfernen
- Preise aktualisieren
- Features bearbeiten

---

## 📖 Schritt-für-Schritt: Inhalte ändern

### Beispiel: Telefonnummer ändern

1. Gehen Sie zu `/admin/`
2. Klicken Sie auf **"Kontaktdaten"**
3. Ändern Sie das Feld **"Telefon"**
4. Klicken Sie auf **"Speichern"**
5. Klicken Sie auf **"Publish"**
6. ✅ Fertig! Die Website wird automatisch aktualisiert (dauert 1-2 Minuten)

---

## 🔧 Setup auf Netlify (Einmalig)

### Schritt 1: Repository auf GitHub/GitLab

```bash
# Erstellen Sie ein Git-Repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IhrUsername/salon-website.git
git push -u origin main
```

### Schritt 2: Netlify Deployment

1. Gehen Sie zu [netlify.com](https://netlify.com)
2. Klicken Sie auf **"Add new site"** → **"Import an existing project"**
3. Wählen Sie Ihr Repository
4. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Klicken Sie auf **"Deploy site"**

### Schritt 3: Identity & Git Gateway aktivieren

1. Gehen Sie zu Ihren **Site Settings**
2. Klicken Sie auf **"Identity"** → **"Enable Identity"**
3. Scrollen Sie zu **"Services"** → **"Git Gateway"** → **"Enable Git Gateway"**
4. Unter **"Registration preferences"** → Wählen Sie **"Invite only"**
5. Laden Sie Benutzer ein: **"Identity"** → **"Invite users"**

### Schritt 4: CMS testen

1. Öffnen Sie `https://ihre-website.netlify.app/admin/`
2. Akzeptieren Sie die Einladung per E-Mail
3. Melden Sie sich an
4. ✅ Sie können jetzt Inhalte bearbeiten!

---

## 🎨 Admin-Interface Funktionen

### Editor-Oberfläche:
- **Rich Text Editor** für formatierte Texte
- **Drag & Drop** für Bilder
- **Listen-Editor** für Services, Preise, etc.
- **Preview-Modus** zum Ansehen vor Veröffentlichung

### Workflow:
1. **Draft** - Änderungen als Entwurf speichern
2. **In Review** - Zur Überprüfung freigeben (optional)
3. **Ready** - Bereit zur Veröffentlichung
4. **Published** - Live auf der Website

---

## 🔐 Benutzer-Verwaltung

### Neue Benutzer hinzufügen:

1. Netlify Dashboard → Ihre Site
2. **Identity** → **Invite users**
3. E-Mail-Adresse eingeben
4. Benutzer erhält Einladung
5. Nach Bestätigung kann Benutzer ins CMS

### Rollen:
- **Admin**: Voller Zugriff
- **Editor**: Kann Inhalte bearbeiten

---

## 📱 Mobile Nutzung

Das CMS funktioniert auch auf Tablets und Smartphones - ideal für schnelle Aktualisierungen unterwegs!

---

## 🆘 Häufige Fragen (FAQ)

### Q: Wie lange dauert es, bis Änderungen live sind?
**A:** Ca. 1-2 Minuten nach dem Veröffentlichen.

### Q: Kann ich Änderungen rückgängig machen?
**A:** Ja! Jede Änderung wird in Git gespeichert. Sie können in Netlify zu vorherigen Versionen zurückkehren.

### Q: Was passiert, wenn ich versehentlich etwas lösche?
**A:** Sie können über Git zur vorherigen Version zurückkehren oder aus dem Backup wiederherstellen.

### Q: Muss ich Code schreiben?
**A:** Nein! Das CMS ist komplett visuell - kein Code nötig.

### Q: Kann ich Bilder hochladen?
**A:** Ja! Im Gallery-Bereich können Sie Bilder hochladen (in der aktuellen Version sind Platzhalter).

---

## 🎯 Vorteile von Netlify CMS

✅ **Kostenlos** - Keine monatlichen Gebühren  
✅ **Git-basiert** - Alle Änderungen versioniert  
✅ **Einfach** - Keine technischen Kenntnisse erforderlich  
✅ **Sicher** - Netlify Identity für Authentifizierung  
✅ **Schnell** - Automatische Builds und Deployments  
✅ **Offline-fähig** - Entwürfe auch offline bearbeiten  

---

## 📞 Support

Bei technischen Problemen oder Fragen zum CMS:
- Kontaktieren Sie Ihren Web-Entwickler
- [Netlify CMS Dokumentation](https://www.netlifycms.org/docs/)
- [Netlify Support](https://www.netlify.com/support/)

---

## 🎓 Video-Tutorials

Empfohlene Tutorials:
- [Netlify CMS Basics](https://www.youtube.com/results?search_query=netlify+cms+tutorial)
- [Content bearbeiten](https://www.youtube.com/results?search_query=netlify+cms+editing)

---

**✨ Viel Erfolg mit Ihrem neuen Content Management System!**
