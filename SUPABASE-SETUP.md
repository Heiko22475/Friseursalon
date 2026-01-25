# Supabase CMS - Setup Anleitung

## 🚀 Supabase Integration erfolgreich eingebaut!

### Was wurde implementiert:

✅ **Supabase Client** - Verbindung zur Datenbank  
✅ **Authentifizierung** - Login/Logout System  
✅ **Admin Dashboard** - Zentrale Verwaltung  
✅ **Content-Editoren** - Für alle Bereiche  
✅ **Geschützte Routen** - Nur für angemeldete Benutzer  
✅ **React Router** - Routing für Admin-Bereich

---

## 📋 Nächste Schritte

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Konto
2. Erstelle ein neues Projekt
3. Warte ~2 Minuten bis das Projekt bereit ist

---

### 2. Datenbank-Tabellen erstellen

1. Öffne dein Supabase-Projekt
2. Gehe zu **SQL Editor** (linke Sidebar)
3. Erstelle eine neue Query
4. Kopiere den kompletten Inhalt aus `supabase-schema.sql`
5. Füge ihn in den SQL Editor ein
6. Klicke auf **Run** (oder drücke `Ctrl+Enter`)

✅ Alle Tabellen, Policies und Trigger werden automatisch erstellt!

---

### 3. Supabase Zugangsdaten konfigurieren

1. Gehe in deinem Supabase-Projekt zu:  
   **Settings** → **API**

2. Kopiere diese Werte:
   - **Project URL** (z.B. `https://abcdefgh.supabase.co`)
   - **anon public** Key (der lange String unter "Project API keys")

3. Erstelle eine `.env.local` Datei im Projekt-Root:

```bash
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
```

---

### 4. Admin-Benutzer erstellen

1. Gehe in Supabase zu **Authentication** → **Users**
2. Klicke auf **Add user** → **Create new user**
3. Gib E-Mail und Passwort ein
4. ✅ Aktiviere "Auto Confirm User"
5. Klicke auf **Create user**

**Wichtig:** Dieser Benutzer kann sich im CMS anmelden!

---

### 5. Anwendung starten

```bash
npm run dev
```

---

## 🔐 CMS Zugriff

### Login-Seite:
```
http://localhost:5173/login
```

### Admin Dashboard:
```
http://localhost:5173/admin
```

**Zugangsdaten:** Die E-Mail und das Passwort, das du in Supabase erstellt hast.

---

## 📁 Verfügbare Admin-Bereiche

Nach dem Login hast du Zugriff auf:

- ✅ **Allgemeine Informationen** - `/admin/general`
- ✅ **Dienstleistungen** - `/admin/services`
- 🔜 **Kontaktdaten** - (kann noch erstellt werden)
- 🔜 **Öffnungszeiten** - (kann noch erstellt werden)
- 🔜 **Bewertungen** - (kann noch erstellt werden)
- 🔜 **Preise** - (kann noch erstellt werden)

---

## 🎨 Frontend anpassen

Um die Website-Komponenten anzupassen, damit sie Daten von Supabase laden:

### Beispiel für Services-Komponente:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('display_order');
    
    if (data) setServices(data);
  };

  // Rest der Komponente...
};
```

---

## 🔒 Sicherheit

- ✅ Row Level Security (RLS) ist aktiviert
- ✅ Jeder kann lesen (öffentliche Website)
- ✅ Nur authentifizierte Benutzer können schreiben
- ✅ Passwörter werden sicher von Supabase verwaltet

---

## 🆘 Troubleshooting

### Fehler: "Invalid API key"
- Prüfe, ob `.env.local` existiert und die richtigen Werte enthält
- Dev-Server nach Änderung an `.env.local` neu starten: `Ctrl+C` → `npm run dev`

### Login funktioniert nicht
- Prüfe, ob der Benutzer in Supabase erstellt wurde
- Prüfe, ob "Auto Confirm User" aktiviert war
- Prüfe die Browser-Konsole auf Fehler

### Daten werden nicht geladen
- Prüfe, ob das SQL-Schema erfolgreich ausgeführt wurde
- Gehe zu **Table Editor** in Supabase und prüfe, ob die Tabellen existieren
- Füge Testdaten manuell über den Table Editor ein

---

## 📚 Weitere Editoren erstellen

Du kannst weitere Editoren nach dem Muster von `GeneralEditor.tsx` und `ServicesEditor.tsx` erstellen:

1. Kopiere eine der Dateien
2. Passe Tabellennamen und Felder an
3. Füge die Route in `App.tsx` hinzu
4. Fertig!

---

## 🎉 Das war's!

Dein CMS ist jetzt einsatzbereit. Du kannst:
- Inhalte über `/admin` bearbeiten
- Die Website unter `/` anzeigen
- Beliebig viele Admin-Benutzer erstellen

**Viel Erfolg! 🚀**
