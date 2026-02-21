# Kontaktformular einrichten – meinauftrittonline.de

## Komplette Schritt-für-Schritt-Anleitung für Einsteiger

**Dein Setup:**
- Webseite gebaut mit **Vite** (React + TypeScript)
- Domain **meinauftrittonline.de** registriert bei **IONOS**
- Backend: **Supabase**
- Hosting: **Vercel**
- E-Mail-Versand: **Resend**
- Funktionierende E-Mail-Adresse: **kontakt@meinauftrittonline.de**

---

## Inhaltsverzeichnis

1. [Was passiert eigentlich? (Überblick)](#überblick--was-passiert-eigentlich)
2. [Begriffe einfach erklärt](#begriffe-einfach-erklärt)
3. [Schritt 1 – Resend-Konto erstellen](#schritt-1--resend-konto-erstellen)
4. [Schritt 2 – Domain bei Resend hinzufügen](#schritt-2--domain-bei-resend-hinzufügen)
5. [Schritt 3 – DNS-Einträge bei IONOS setzen](#schritt-3--dns-einträge-bei-ionos-setzen)
6. [Schritt 4 – Domain bei Resend verifizieren](#schritt-4--domain-bei-resend-verifizieren)
7. [Schritt 5 – Resend API-Key erstellen](#schritt-5--resend-api-key-erstellen)
8. [Schritt 6 – Pakete installieren (Terminal)](#schritt-6--pakete-installieren-terminal)
9. [Schritt 7 – Vercel Serverless Function erstellen](#schritt-7--vercel-serverless-function-erstellen)
10. [Schritt 8 – Umgebungsvariablen setzen](#schritt-8--umgebungsvariablen-setzen)
11. [Schritt 9 – React-Kontaktformular erstellen](#schritt-9--react-kontaktformular-erstellen)
12. [Schritt 10 – Formular in deine Seite einbinden](#schritt-10--formular-in-deine-seite-einbinden)
13. [Schritt 11 – Lokal testen](#schritt-11--lokal-testen)
14. [Schritt 12 – Auf Vercel veröffentlichen (Deploy)](#schritt-12--auf-vercel-veröffentlichen-deploy)
15. [Schritt 13 – Live testen](#schritt-13--live-testen)
16. [Bonus: Spam-Schutz einbauen](#bonus-spam-schutz-einbauen-honeypot)
17. [Fehlerbehebung](#fehlerbehebung)
18. [Kurzübersicht: Was wo einzutragen ist](#kurzübersicht-was-wo-einzutragen-ist)

---

## Überblick – Was passiert eigentlich?

Wenn ein Besucher deiner Webseite das Kontaktformular ausfüllt und auf „Senden" klickt, passiert Folgendes:

```
┌─────────────────────────────┐
│  1. Besucher füllt Formular │
│     auf deiner Webseite aus │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  2. Deine Webseite schickt  │
│     die Daten an eine       │
│     Vercel-Funktion         │
│     (eine Art Mini-Server)  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  3. Die Vercel-Funktion     │
│     gibt die Daten an       │
│     Resend weiter           │
│     (den E-Mail-Dienst)     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  4. Resend verschickt eine  │
│     E-Mail an dich mit      │
│     Name, E-Mail und        │
│     Nachricht des Besuchers │
└─────────────────────────────┘
```

**Warum brauchen wir Resend?**
Eine Webseite im Browser kann nicht direkt E-Mails verschicken. Das wäre ein Sicherheitsrisiko. Stattdessen nutzen wir Resend – einen spezialisierten Dienst, der E-Mails für uns verschickt. Resend ist bis **3.000 E-Mails pro Monat kostenlos** – das reicht für ein Kontaktformular locker aus.

**Warum brauchen wir eine Vercel-Funktion?**
Dein Resend-Passwort (API-Key) darf nie im Browser sichtbar sein. Deshalb schicken wir die Formulardaten an eine „Serverless Function" auf Vercel. Das ist ein kleines Programm, das auf dem Vercel-Server läuft (nicht im Browser des Besuchers) und dort sicher den API-Key verwenden kann.

---

## Begriffe einfach erklärt

| Begriff | Erklärung |
|---------|-----------|
| **Vite** | Das Werkzeug, mit dem deine Webseite gebaut wird. Wie ein Bäcker, der den Teig in ein Brot verwandelt. |
| **React** | Die Programmiersprache/das Framework, in dem deine Webseite geschrieben ist. |
| **Vercel** | Der Dienst, der deine Webseite im Internet bereitstellt (Hosting). Wie ein Vermieter, der deiner Webseite einen Platz im Internet gibt. |
| **Supabase** | Dein Backend/Datenbank. Hier werden Daten gespeichert (z.B. Webseiten-Inhalte). |
| **Resend** | Ein E-Mail-Versanddienst. Wie ein digitaler Briefträger, der E-Mails für dich zustellt. |
| **IONOS** | Dein Domain-Anbieter. Hier hast du `meinauftrittonline.de` gemietet. |
| **DNS** | Domain Name System – eine Art Telefonbuch des Internets. Sagt dem Internet, wohin `meinauftrittonline.de` zeigen soll. |
| **DNS-Eintrag** | Ein einzelner Eintrag in diesem Telefonbuch. Z.B. „Wenn jemand Post an diese Domain schickt, gib sie an diesen Server weiter." |
| **API-Key** | Ein geheimes Passwort, mit dem sich deine Anwendung bei Resend anmeldet. Wie ein Schlüssel zu einem Briefkasten. |
| **Serverless Function** | Ein kleines Programm, das auf einem Server läuft, aber du musst dich um den Server nicht selbst kümmern. Vercel stellt ihn automatisch bereit. |
| **Terminal** | Das schwarze Fenster, in dem man Befehle eintippen kann. In VS Code erreichbar über `Strg + Ö` (deutsche Tastatur) oder `Menü → Terminal → Neues Terminal`. |
| **npm** | Ein Paketmanager. Wie ein App Store für Programmier-Bausteine. Mit `npm install xyz` lädst du einen Baustein herunter. |
| **Umgebungsvariable** | Eine geheime Einstellung, die nicht im Code steht, sondern separat gespeichert wird. Wie ein Tresor für Passwörter. |
| **Deploy** | Das Veröffentlichen deiner Webseite. Deine lokalen Änderungen werden auf den Vercel-Server hochgeladen und sind dann für alle sichtbar. |

---

## Schritt 1 – Resend-Konto erstellen

> **Was tun wir hier?** Wir erstellen ein kostenloses Konto bei Resend, dem Dienst, der die E-Mails für uns verschickt.

### 1.1 – Webseite öffnen

1. Öffne deinen Browser (Chrome, Firefox, Edge – egal welcher)
2. Gib in die Adresszeile ein: **https://resend.com**
3. Drücke `Enter`

### 1.2 – Konto anlegen

1. Klicke auf den Button **„Sign Up"** (oben rechts) oder **„Get Started"**
2. Du kannst dich anmelden mit:
   - **GitHub-Konto** (falls du eins hast – empfohlen, da du wahrscheinlich schon eins für Vercel nutzt)
   - **Google-Konto**
   - **E-Mail und Passwort**
3. Folge den Anweisungen auf dem Bildschirm
4. Bestätige ggf. deine E-Mail-Adresse (Resend schickt dir eine Bestätigungs-E-Mail)

### 1.3 – Nach der Anmeldung

Nach dem Login landest du auf dem **Resend-Dashboard**. Das ist deine Steuerzentrale für E-Mails. Hier siehst du später, welche E-Mails verschickt wurden und ob alles funktioniert.

> ✅ **Erledigt!** Du hast jetzt ein Resend-Konto.

---

## Schritt 2 – Domain bei Resend hinzufügen

> **Was tun wir hier?** Wir sagen Resend, dass es E-Mails im Namen von `meinauftrittonline.de` verschicken darf. Ohne diesen Schritt landen E-Mails im Spam oder werden gar nicht zugestellt.

### 2.1 – Domains-Seite öffnen

1. Im Resend-Dashboard: Klicke links im Menü auf **„Domains"**
2. Klicke auf den Button **„Add Domain"** (oben rechts)

### 2.2 – Domain eingeben

1. Im Feld **„Domain"** gibst du ein: `meinauftrittonline.de`
2. Bei **„Region"** wähle: **Europe (EU)** – das ist am schnellsten für deutsche Besucher
3. Klicke auf **„Add"**

### 2.3 – Was jetzt passiert

Resend zeigt dir nun eine Tabelle mit **DNS-Einträgen**. Das sind die Einstellungen, die du bei IONOS eintragen musst, damit Resend beweisen kann, dass du der Besitzer der Domain bist.

**Lass dieses Browser-Fenster offen!** Du brauchst die angezeigten Werte im nächsten Schritt.

Die Tabelle sieht ungefähr so aus (die Werte sind bei dir anders – nutze DEINE Werte!):

| Type | Host | Value | Priority |
|------|------|-------|----------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA...` (langer Text) | – |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | – |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |

> ⚠️ **Wichtig:** Die Werte oben sind nur Beispiele. Kopiere immer die **echten Werte aus deinem Resend-Dashboard**, nicht aus dieser Anleitung!

> ✅ **Erledigt!** Die Domain ist bei Resend hinterlegt. Jetzt müssen wir bei IONOS beweisen, dass sie uns gehört.

---

## Schritt 3 – DNS-Einträge bei IONOS setzen

> **Was tun wir hier?** Wir tragen bei IONOS (deinem Domain-Anbieter) spezielle Einträge ein, damit Resend verifizieren kann, dass `meinauftrittonline.de` wirklich dir gehört und Resend im Namen dieser Domain E-Mails verschicken darf.

### 3.1 – Bei IONOS einloggen

1. Öffne einen **neuen Browser-Tab** (das Resend-Fenster bleibt offen!)
2. Gehe zu: **https://login.ionos.de**
3. Melde dich mit deinen IONOS-Zugangsdaten an
   - Falls du die Zugangsdaten vergessen hast: Klicke auf „Passwort vergessen"

### 3.2 – DNS-Verwaltung finden

1. Nach dem Login: Klicke auf **„Domains & SSL"** (im Menü links oder auf der Startseite)
2. Du siehst deine Domain `meinauftrittonline.de` – klicke darauf
3. Klicke auf den Reiter/Tab **„DNS"**
   - Falls du „DNS" nicht direkt siehst: Suche nach **„DNS-Einstellungen"** oder **„DNS Records"**
   - Alternativ: Klicke auf das **Zahnrad-Symbol** neben der Domain → **„DNS"**

Du siehst jetzt eine Liste aller DNS-Einträge deiner Domain. Hier fügen wir neue hinzu.

### 3.3 – Ersten DNS-Eintrag hinzufügen (DKIM – TXT-Eintrag)

> **Was ist das?** DKIM ist eine digitale Unterschrift. Sie beweist, dass eine E-Mail wirklich von deiner Domain kommt und nicht gefälscht ist.

1. Klicke auf **„Record hinzufügen"** (oder „DNS-Record hinzufügen")
2. Wähle als Typ: **TXT**
3. Fülle die Felder so aus:

| Feld | Was du einträgst |
|------|-----------------|
| **Hostname / Name** | `resend._domainkey` |
| **Wert / Value** | Den langen Text aus der Resend-Tabelle, der mit `p=MIGfMA0GCSq...` anfängt. **Kopiere den kompletten Wert aus Resend!** |
| **TTL** | Lass den Standardwert stehen (meistens `3600` oder `1 Stunde`) |

4. Klicke auf **„Speichern"**

> ⚠️ **Wichtiger Hinweis für IONOS:** IONOS hängt automatisch `.meinauftrittonline.de` an den Hostnamen an. Du trägst also nur `resend._domainkey` ein – **NICHT** `resend._domainkey.meinauftrittonline.de`. IONOS macht daraus automatisch den vollständigen Namen.

### 3.4 – Zweiten DNS-Eintrag hinzufügen (SPF – TXT-Eintrag)

> **Was ist das?** SPF sagt E-Mail-Servern: „Diese Server dürfen im Namen meiner Domain E-Mails verschicken." Ohne SPF landen deine E-Mails im Spam.

1. Klicke erneut auf **„Record hinzufügen"**
2. Wähle als Typ: **TXT**
3. Fülle die Felder so aus:

| Feld | Was du einträgst |
|------|-----------------|
| **Hostname / Name** | `send` |
| **Wert / Value** | `v=spf1 include:amazonses.com ~all` |
| **TTL** | Standardwert lassen |

4. Klicke auf **„Speichern"**

### 3.5 – Dritten DNS-Eintrag hinzufügen (MX-Eintrag)

> **Was ist das?** Ein MX-Eintrag sagt, welcher Server für den E-Mail-Empfang zuständig ist. Resend nutzt dafür Amazon SES (ein E-Mail-Server von Amazon).

1. Klicke erneut auf **„Record hinzufügen"**
2. Wähle als Typ: **MX**
3. Fülle die Felder so aus:

| Feld | Was du einträgst |
|------|-----------------|
| **Hostname / Name** | `send` |
| **Wert / Mail Server** | `feedback-smtp.eu-west-1.amazonses.com` |
| **Priorität / Priority** | `10` |
| **TTL** | Standardwert lassen |

4. Klicke auf **„Speichern"**

### 3.6 – Kontrolle

Deine DNS-Einträge bei IONOS sollten jetzt (unter anderem) diese drei neuen Einträge enthalten:

| Typ | Hostname | Wert |
|-----|----------|------|
| TXT | `resend._domainkey.meinauftrittonline.de` | `p=MIGfMA0GCSq...` (dein DKIM-Schlüssel) |
| TXT | `send.meinauftrittonline.de` | `v=spf1 include:amazonses.com ~all` |
| MX | `send.meinauftrittonline.de` | `feedback-smtp.eu-west-1.amazonses.com` (Priorität 10) |

> ✅ **Erledigt!** Die DNS-Einträge sind gesetzt. Jetzt müssen wir warten und bei Resend verifizieren.

---

## Schritt 4 – Domain bei Resend verifizieren

> **Was tun wir hier?** Wir sagen Resend: „Schau nach, ob die DNS-Einträge korrekt sind." Resend prüft dann, ob alles stimmt.

### 4.1 – Zurück zu Resend

1. Wechsle zum Browser-Tab mit dem **Resend-Dashboard**
2. Gehe zu **„Domains"** (linkes Menü)
3. Du siehst deine Domain `meinauftrittonline.de` mit dem Status **„Pending"** (ausstehend)

### 4.2 – Verifizierung starten

1. Klicke auf die Domain `meinauftrittonline.de`
2. Klicke auf den Button **„Verify DNS Records"** (oder „Verify")
3. Resend prüft jetzt die DNS-Einträge

### 4.3 – Mögliche Ergebnisse

**Fall A – Alles grün ✅:**
- Alle drei Einträge zeigen einen grünen Haken
- Der Domain-Status ändert sich zu **„Verified"**
- Du kannst weitermachen mit Schritt 5!

**Fall B – Noch nicht verifiziert (gelb/rot) ⏳:**
- Das ist **normal!** DNS-Änderungen brauchen Zeit, um sich im Internet zu verbreiten
- Das kann **5 Minuten bis 48 Stunden** dauern (meistens 15–60 Minuten)
- Versuche es einfach später nochmal: Komm zurück zu Resend → Domains → Verify
- **Du musst nichts nochmal eintragen!** Einfach warten und erneut prüfen.

> 💡 **Tipp:** Während du wartest, kannst du bereits mit den Schritten 5–9 weitermachen. Die Programmierschritte hängen nicht von der DNS-Verifizierung ab. Du brauchst die Verifizierung erst, wenn du tatsächlich eine E-Mail versenden willst.

> ✅ **Erledigt!** Deine Domain ist (oder wird bald) bei Resend verifiziert.

---

## Schritt 5 – Resend API-Key erstellen

> **Was tun wir hier?** Wir erstellen ein geheimes Passwort (API-Key), mit dem sich deine Webseite bei Resend anmelden kann, um E-Mails zu verschicken.

### 5.1 – API-Key-Seite öffnen

1. Im Resend-Dashboard: Klicke links im Menü auf **„API Keys"**
2. Klicke auf den Button **„Create API Key"**

### 5.2 – API-Key konfigurieren

Fülle das Formular so aus:

| Feld | Was du einträgst |
|------|-----------------|
| **Name** | `meinauftrittonline-kontakt` (frei wählbar, nur zur Übersicht) |
| **Permission** | **Sending access** (kann nur E-Mails senden, nichts anderes – das ist sicherer) |
| **Domain** | `meinauftrittonline.de` |

Klicke auf **„Create"**.

### 5.3 – API-Key kopieren und sicher aufbewahren

⚠️ **GANZ WICHTIG:** Der API-Key wird dir **nur ein einziges Mal** angezeigt! Danach kannst du ihn nicht mehr sehen.

1. Du siehst jetzt den API-Key – er beginnt mit `re_` und sieht ungefähr so aus: `re_123abc456def789ghi`
2. **Kopiere ihn** (markieren + `Strg+C`)
3. **Speichere ihn sicher** – z.B.:
   - In eine Textdatei auf deinem Computer (die du nicht aus Versehen löschst)
   - In einen Passwort-Manager (z.B. Bitwarden, 1Password, KeePass)
   - **NICHT** in eine E-Mail an dich selbst schicken
   - **NICHT** auf einem Post-it am Monitor kleben
   - **NICHT** in deinen Programmcode schreiben (dazu kommen wir später)

> 💡 Falls du den Key doch verloren hast: Kein Problem. Lösche den alten bei Resend (API Keys → Mülleimer-Symbol) und erstelle einfach einen neuen.

> ✅ **Erledigt!** Du hast jetzt deinen geheimen API-Key. Bewahre ihn gut auf!

---

## Schritt 6 – Pakete installieren (Terminal)

> **Was tun wir hier?** Wir laden zwei Software-Bausteine herunter, die unser Kontaktformular braucht: das Resend-Paket (um E-Mails zu senden) und die Vercel-Typen (damit unser Code die Vercel-Funktionen versteht).

### 6.1 – Terminal öffnen

Das Terminal ist ein Textfenster, in dem man Befehle eintippen kann. So öffnest du es:

1. Öffne **VS Code** (das Programm, in dem du deinen Code bearbeitest)
2. Öffne dein Projekt (den Ordner deiner Webseite)
3. Drücke die Tasten **`Strg` + `Ö`** (gleichzeitig) – das öffnet das Terminal unten in VS Code
   - Alternativ: Klicke im Menü oben auf **Terminal** → **Neues Terminal**
4. Du siehst jetzt ein dunkles Fenster unten in VS Code mit einer blinkenden Eingabezeile

### 6.2 – Überprüfen, dass du im richtigen Ordner bist

Im Terminal siehst du einen Pfad wie z.B.:
```
C:\Users\DeinName\MeinProjekt>
```

Das sollte der Ordner deiner Webseite sein. Falls nicht:
1. Klicke in VS Code auf **Datei** → **Ordner öffnen**
2. Navigiere zum Ordner deiner Webseite
3. Öffne das Terminal erneut

### 6.3 – Resend-Paket installieren

1. Tippe folgenden Befehl ins Terminal ein (oder kopiere ihn mit `Strg+C` und füge ihn mit `Strg+V` ein):

```bash
npm install resend
```

2. Drücke **`Enter`**
3. Warte, bis der Befehl fertig ist (du siehst dann wieder die Eingabezeile)
4. Du siehst Ausgaben wie `added 1 package` oder ähnlich – das ist normal und gut

> **Was macht dieser Befehl?** Er lädt das Resend-Paket aus dem Internet und fügt es deinem Projekt hinzu. Damit kann dein Code mit Resend kommunizieren.

### 6.4 – Vercel-Node-Typen installieren

1. Tippe folgenden Befehl ein:

```bash
npm install --save-dev @vercel/node
```

2. Drücke **`Enter`**
3. Warte, bis der Befehl fertig ist

> **Was macht dieser Befehl?** Er installiert TypeScript-Definitionen für Vercel-Funktionen. `--save-dev` bedeutet, dass dieses Paket nur zum Programmieren gebraucht wird, nicht auf der fertigen Webseite.

### 6.5 – Kontrolle

Öffne die Datei `package.json` in deinem Projekt (einfach im VS Code links im Dateibaum doppelklicken). Du solltest jetzt unter `"dependencies"` den Eintrag `"resend"` sehen und unter `"devDependencies"` den Eintrag `"@vercel/node"`:

```json
{
  "dependencies": {
    "resend": "^x.x.x",

  },
  "devDependencies": {
    "@vercel/node": "^x.x.x",

  }
}
```

(Die genauen Versionsnummern `x.x.x` können bei dir anders sein – das ist egal.)

> ✅ **Erledigt!** Alle nötigen Pakete sind installiert.

---

## Schritt 7 – Vercel Serverless Function erstellen

> **Was tun wir hier?** Wir schreiben ein kleines Programm, das auf dem Vercel-Server läuft. Dieses Programm nimmt die Formulardaten entgegen und schickt sie über Resend als E-Mail an dich. Man nennt das eine „Serverless Function" – ein Mini-Server, um den sich Vercel kümmert.

### 7.1 – Ordner erstellen

1. Gehe in VS Code in den **Dateibaum** (linke Seite)
2. Klicke mit der **rechten Maustaste** auf den **obersten Ordner** deines Projekts (der Hauptordner)
3. Wähle **„Neuer Ordner"**
4. Nenne den Ordner: **`api`**
5. Drücke `Enter`

> **Wichtig:** Der Ordner muss `api` heißen (alles klein!) und direkt im Hauptordner deines Projekts liegen – NICHT in `src/` oder einem anderen Unterordner!

Deine Ordnerstruktur sollte so aussehen:
```
mein-projekt/
├── api/               ← NEU! Hier kommt die Serverless Function rein
├── node_modules/
├── public/
├── src/
├── package.json
├── vite.config.ts
└── ...
```

### 7.2 – Datei erstellen

1. Klicke mit der **rechten Maustaste** auf den neuen `api`-Ordner
2. Wähle **„Neue Datei"**
3. Nenne die Datei: **`contact.ts`**
4. Drücke `Enter`

Die Datei öffnet sich automatisch im Editor (rechte Seite).

### 7.3 – Code einfügen

Kopiere den folgenden Code und füge ihn **komplett** in die leere Datei `api/contact.ts` ein:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Resend-Client mit deinem API-Key initialisieren
// Der Key kommt aus einer Umgebungsvariable (NICHT im Code gespeichert!)
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ─── CORS-Header setzen ────────────────────────────────────────────
  // Damit die Webseite (Frontend) mit dieser Funktion (Backend) sprechen darf.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Browser schicken manchmal eine "Vorab-Anfrage" (OPTIONS). Die beantworten wir einfach.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ─── Nur POST-Anfragen erlauben ────────────────────────────────────
  // Ein Kontaktformular schickt Daten per POST. Alles andere lehnen wir ab.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── Daten aus dem Formular auslesen ───────────────────────────────
  const { name, email, message } = req.body;

  // ─── Prüfen, ob alle Felder ausgefüllt sind ────────────────────────
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Bitte fülle alle Felder aus.' });
  }

  // ─── E-Mail-Format prüfen ─────────────────────────────────────────
  // Einfache Prüfung: Enthält die E-Mail ein @ und einen Punkt?
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
  }

  // ─── E-Mail über Resend verschicken ────────────────────────────────
  try {
    const { data, error } = await resend.emails.send({
      // VON wem die E-Mail kommt (deine Domain!)
      from: 'Kontaktformular <kontakt@meinauftrittonline.de>',

      // AN wen die E-Mail geht (DEINE E-Mail-Adresse, an die du die Anfragen bekommen willst)
      // ┌──────────────────────────────────────────────────────────────┐
      // │  HIER DEINE E-MAIL-ADRESSE EINTRAGEN (zwischen den '')!    │
      // └──────────────────────────────────────────────────────────────┘
      to: ['kontakt@meinauftrittonline.de'],

      // Wenn du auf „Antworten" klickst, geht die Antwort an den Absender
      replyTo: email,

      // Betreffzeile der E-Mail
      subject: `Neue Kontaktanfrage von ${name}`,

      // Inhalt der E-Mail (als HTML formatiert, damit es schön aussieht)
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Neue Kontaktanfrage über meinauftrittonline.de
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555; width: 100px;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">E-Mail:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
            <p style="font-weight: bold; color: #555; margin-top: 0;">Nachricht:</p>
            <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br/>')}</p>
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Diese E-Mail wurde automatisch über das Kontaktformular auf meinauftrittonline.de gesendet.
          </p>
        </div>
      `,
    });

    // Falls Resend einen Fehler meldet
    if (error) {
      console.error('[Resend Error]', error);
      return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.' });
    }

    // Alles gut! E-Mail wurde versendet.
    return res.status(200).json({ success: true, id: data?.id });

  } catch (err) {
    // Falls irgendetwas anderes schiefgeht
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.' });
  }
}
```

### 7.4 – Code anpassen (wichtig!)

Im Code oben steht:
```typescript
to: ['kontakt@meinauftrittonline.de'],
```

Hier musst du **deine E-Mail-Adresse** eintragen, an die die Kontaktanfragen geschickt werden sollen. Da du `kontakt@meinauftrittonline.de` nutzt, passt das bereits. Falls du die Anfragen zusätzlich an eine andere Adresse bekommen willst:

```typescript
to: ['kontakt@meinauftrittonline.de', 'deine-andere@email.de'],
```

### 7.5 – Datei speichern

Drücke **`Strg + S`**, um die Datei zu speichern.

> ✅ **Erledigt!** Die Serverless Function ist erstellt. Sie wartet unter `/api/contact` auf Anfragen.

---

## Schritt 8 – Umgebungsvariablen setzen

> **Was tun wir hier?** Wir speichern den Resend API-Key so, dass unser Code ihn nutzen kann, aber er nirgendwo öffentlich sichtbar ist. Wir machen das an zwei Stellen: einmal lokal auf deinem Computer (zum Testen) und einmal bei Vercel (für die echte Webseite).

### 8.1 – Lokale Umgebungsvariable (für die Entwicklung auf deinem Computer)

1. Klicke in VS Code mit der **rechten Maustaste** auf den **Hauptordner** deines Projekts
2. Wähle **„Neue Datei"**
3. Nenne die Datei: **`.env.local`**
   - ⚠️ Beachte den **Punkt** am Anfang! Die Datei heißt `.env.local`, nicht `env.local`
4. Drücke `Enter`
5. Schreibe in die Datei **genau eine Zeile**:

```env
RESEND_API_KEY=re_HIER_DEINEN_ECHTEN_KEY_EINFÜGEN
```

6. Ersetze `re_HIER_DEINEN_ECHTEN_KEY_EINFÜGEN` mit dem API-Key, den du in Schritt 5 kopiert hast
7. Speichere die Datei (`Strg + S`)

**Beispiel** (dein Key ist anders!):
```env
RESEND_API_KEY=re_abc123def456ghi789
```

> ⚠️ **SICHERHEITSHINWEIS:** Diese Datei darf **NIEMALS** auf GitHub oder ins Internet hochgeladen werden! Prüfe, ob in deinem Projekt eine Datei namens `.gitignore` existiert und ob darin `*.local` oder `.env.local` steht. Falls nicht, öffne `.gitignore` und füge eine neue Zeile hinzu:
> ```
> .env.local
> ```

### 8.2 – Umgebungsvariable bei Vercel setzen (für die echte Webseite)

1. Öffne deinen Browser und gehe zu: **https://vercel.com/dashboard**
2. Melde dich an (falls noch nicht eingeloggt)
3. Klicke auf dein **Projekt** (z.B. `web-design-website` oder wie auch immer es heißt)
4. Klicke oben auf den Reiter **„Settings"** (Einstellungen)
5. Klicke links im Menü auf **„Environment Variables"** (Umgebungsvariablen)
6. Du siehst ein Formular. Fülle es so aus:

| Feld | Was du einträgst |
|------|-----------------|
| **Key** (Name) | `RESEND_API_KEY` |
| **Value** (Wert) | Deinen API-Key (z.B. `re_abc123def456ghi789`) |
| **Environment** | Hake an: **✅ Production**, **✅ Preview**, **✅ Development** |

7. Klicke auf **„Save"** (Speichern)

> 💡 **Warum alle drei Environments?** 
> - **Production** = die echte Webseite unter meinauftrittonline.de
> - **Preview** = automatische Vorschau-Links, die Vercel bei jedem Git-Push erstellt
> - **Development** = lokale Entwicklung mit `vercel dev`

> ⚠️ **Wichtig:** Damit die Variable aktiv wird, muss die Webseite einmal neu deployed werden. Das passiert automatisch beim nächsten `git push` oder du klickst bei Vercel auf **„Redeploy"** (Deployments → drei Punkte beim letzten Deploy → Redeploy).

> ✅ **Erledigt!** Der API-Key ist sicher gespeichert – lokal und bei Vercel.

---

## Schritt 9 – React-Kontaktformular erstellen

> **Was tun wir hier?** Wir erstellen das sichtbare Kontaktformular – das, was die Besucher auf deiner Webseite sehen und ausfüllen können.

### 9.1 – Datei erstellen

1. Navigiere in VS Code zum Ordner `src/components/`
   - Falls der Ordner `components` nicht existiert: Rechtsklick auf `src/` → Neuer Ordner → `components`
2. Rechtsklick auf `components/` → **„Neue Datei"**
3. Nenne die Datei: **`ContactForm.tsx`**
4. Drücke `Enter`

### 9.2 – Code einfügen

Kopiere den folgenden Code komplett in die Datei:

```tsx
import { useState } from 'react';

// ─── Typen für den Formular-Zustand ─────────────────────────────────
// Das beschreibt, welche Felder unser Formular hat.
interface ContactFormState {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  // ─── Zustand (State) ───────────────────────────────────────────────
  // "form" speichert, was der Benutzer in die Felder eingetippt hat.
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    message: '',
  });

  // "status" merkt sich, ob gerade gesendet wird, ob es geklappt hat, etc.
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Falls ein Fehler passiert, speichern wir die Fehlermeldung hier.
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Eingabe-Handler ──────────────────────────────────────────────
  // Wird aufgerufen, wenn der Benutzer etwas in ein Feld eintippt.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── Absende-Handler ──────────────────────────────────────────────
  // Wird aufgerufen, wenn der Benutzer auf "Nachricht senden" klickt.
  const handleSubmit = async (e: React.FormEvent) => {
    // Verhindert, dass die Seite neu lädt (Standardverhalten von Formularen)
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // Daten an unsere Vercel-Funktion schicken
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        // Server hat einen Fehler gemeldet
        setErrorMsg(result.error || 'Ein unbekannter Fehler ist aufgetreten.');
        setStatus('error');
        return;
      }

      // Alles hat geklappt!
      setStatus('success');
      // Formular leeren
      setForm({ name: '', email: '', message: '' });
    } catch {
      // Netzwerkfehler (z.B. kein Internet)
      setErrorMsg(
        'Verbindungsfehler. Bitte prüfe deine Internetverbindung und versuche es erneut.'
      );
      setStatus('error');
    }
  };

  // ─── Formular-Darstellung ─────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '560px',
        width: '100%',
      }}
    >
      {/* ── Name ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="contact-name" style={{ fontWeight: 600 }}>
          Name *
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Dein Name"
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        />
      </div>

      {/* ── E-Mail ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="contact-email" style={{ fontWeight: 600 }}>
          E-Mail *
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="deine@email.de"
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        />
      </div>

      {/* ── Nachricht ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="contact-message" style={{ fontWeight: 600 }}>
          Nachricht *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={handleChange}
          placeholder="Wie kann ich dir helfen?"
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* ── Absende-Button ───────────────────────────────────── */}
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: status === 'loading' ? '#999' : '#333',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {status === 'loading' ? 'Wird gesendet…' : 'Nachricht senden'}
      </button>

      {/* ── Erfolgsmeldung ───────────────────────────────────── */}
      {status === 'success' && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '6px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
          }}
        >
          ✓ Vielen Dank! Deine Nachricht wurde erfolgreich gesendet. Wir melden uns so schnell wie möglich bei dir.
        </div>
      )}

      {/* ── Fehlermeldung ────────────────────────────────────── */}
      {status === 'error' && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
          }}
        >
          ✗ {errorMsg}
        </div>
      )}
    </form>
  );
};
```

### 9.3 – Datei speichern

Drücke **`Strg + S`**.

> 💡 **Anpassungsmöglichkeiten:**
> - **Farben ändern:** Suche nach `backgroundColor` und `color` im Code und ändere die Hex-Werte (z.B. `#333` für Dunkelgrau)
> - **Texte ändern:** Ändere die `placeholder`-Texte oder die Erfolgsmeldung
> - **Falls du TailwindCSS nutzt:** Du kannst die `style={{ ... }}`-Angaben durch Tailwind-Klassen ersetzen (z.B. `className="p-3 rounded-md border border-gray-300"`)

> ✅ **Erledigt!** Das Kontaktformular ist programmiert.

---

## Schritt 10 – Formular in deine Seite einbinden

> **Was tun wir hier?** Wir fügen das Kontaktformular an der richtigen Stelle in deine Webseite ein.

### 10.1 – Datei öffnen, in der das Formular erscheinen soll

Öffne die Datei, in der du das Kontaktformular anzeigen möchtest. Das könnte z.B. sein:
- Eine Kontakt-Seite (`src/pages/Contact.tsx` oder ähnlich)
- Deine Startseite (`src/pages/Home.tsx` oder `src/App.tsx`)
- Ein bestimmter Abschnitt deiner Webseite

### 10.2 – Import hinzufügen

Ganz oben in der Datei (bei den anderen `import`-Zeilen) fügst du diese Zeile hinzu:

```tsx
import { ContactForm } from '../components/ContactForm';
```

> ⚠️ **Der Pfad muss stimmen!** `../components/ContactForm` bedeutet: „Gehe einen Ordner hoch und dann in den Ordner `components` zur Datei `ContactForm`". Falls deine Datei woanders liegt, musst du den Pfad anpassen:
> - Datei liegt in `src/pages/` → Pfad: `'../components/ContactForm'`
> - Datei liegt direkt in `src/` → Pfad: `'./components/ContactForm'`
> - Datei liegt in `src/pages/admin/` → Pfad: `'../../components/ContactForm'`

### 10.3 – Formular an der gewünschten Stelle einsetzen

Suche die Stelle in deinem Code, wo das Kontaktformular erscheinen soll, und füge `<ContactForm />` ein. Zum Beispiel:

```tsx
{/* Irgendwo in deiner Seite: */}
<section id="kontakt" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
  <h2 style={{ marginBottom: '30px' }}>Kontakt</h2>
  <p style={{ marginBottom: '30px', color: '#666' }}>
    Du hast eine Frage oder möchtest einen Termin vereinbaren?
    Schreib mir einfach eine Nachricht!
  </p>
  <ContactForm />
</section>
```

### 10.4 – Datei speichern

Drücke **`Strg + S`**.

> ✅ **Erledigt!** Das Formular ist eingebunden.

---

## Schritt 11 – Lokal testen

> **Was tun wir hier?** Wir starten die Webseite auf deinem Computer, um zu prüfen, ob das Formular funktioniert, bevor wir es auf die echte Webseite hochladen.

### 11.1 – Vercel CLI installieren (einmalig)

> **Was ist das?** Vercel CLI ist ein Werkzeug, das es ermöglicht, Vercel-Funktionen lokal auf deinem Computer zu testen. Ohne dieses Werkzeug kann dein Computer die API-Funktion (`/api/contact`) nicht ausführen.

1. Öffne das Terminal in VS Code (**`Strg + Ö`**)
2. Tippe folgenden Befehl ein:

```bash
npm install -g vercel
```

3. Drücke **`Enter`** und warte, bis die Installation fertig ist

> 💡 Das `-g` bedeutet „global" – das Werkzeug wird einmal installiert und steht dann in allen Projekten zur Verfügung. Du musst diesen Schritt nur **einmalig** machen.

### 11.2 – Projekt mit Vercel verknüpfen (einmalig)

1. Tippe im Terminal ein:

```bash
vercel link
```

2. Drücke **`Enter`**
3. Es werden dir Fragen gestellt – beantworte sie so:
   - **"Set up …?"** → `Y` (für Ja) + `Enter`
   - **"Which scope?"** → Wähle dein Konto/Team + `Enter`
   - **"Link to existing project?"** → `Y` + `Enter`
   - **"What's the name of your project?"** → Tippe den Namen deines Vercel-Projekts ein (z.B. `web-design-website`) + `Enter`

### 11.3 – Lokalen Server starten

1. Tippe im Terminal ein:

```bash
vercel dev
```

2. Drücke **`Enter`**
3. Warte, bis du eine Meldung wie `Ready! Available at http://localhost:3000` siehst

> ⚠️ **Wichtig:** Nutze `vercel dev` statt `npm run dev`! Der normale Vite-Entwicklungsserver (`npm run dev`) kann die API-Funktionen im `api/`-Ordner **nicht** ausführen. Nur `vercel dev` kann beides: die Webseite UND die API-Funktionen.

### 11.4 – Formular testen

1. Öffne deinen Browser
2. Gehe zu: **http://localhost:3000** (oder welchen Port `vercel dev` anzeigt)
3. Navigiere zur Seite mit dem Kontaktformular
4. Fülle das Formular aus:
   - **Name:** Test
   - **E-Mail:** deine-echte@email.de (eine Adresse, bei der du reinschauen kannst)
   - **Nachricht:** Das ist ein Test!
5. Klicke auf **„Nachricht senden"**
6. Du solltest die grüne Erfolgsmeldung sehen
7. Schau in dein E-Mail-Postfach – die Test-E-Mail sollte dort ankommen

### 11.5 – Server stoppen

Wenn du fertig bist:
1. Klicke ins Terminal
2. Drücke **`Strg + C`** – das stoppt den lokalen Server

> ✅ **Erledigt!** Das Formular funktioniert lokal. Jetzt laden wir es auf die echte Webseite hoch.

---

## Schritt 12 – Auf Vercel veröffentlichen (Deploy)

> **Was tun wir hier?** Wir laden alle Änderungen auf GitHub hoch, und Vercel veröffentlicht die neue Version deiner Webseite automatisch.

### 12.1 – Änderungen vorbereiten

1. Öffne das Terminal in VS Code (**`Strg + Ö`**)
2. Tippe ein:

```bash
git add .
```

3. Drücke `Enter`

> **Was macht das?** Es markiert alle geänderten und neuen Dateien für den nächsten „Commit" (Speicherpunkt).

### 12.2 – Änderungen speichern (Commit)

1. Tippe ein:

```bash
git commit -m "Kontaktformular mit Resend hinzugefügt"
```

2. Drücke `Enter`

> **Was macht das?** Es erstellt einen Speicherpunkt mit einer Beschreibung, was sich geändert hat.

### 12.3 – Auf GitHub hochladen (Push)

1. Tippe ein:

```bash
git push
```

2. Drücke `Enter`
3. Warte, bis der Befehl fertig ist

> **Was macht das?** Es lädt die Änderungen auf GitHub hoch. Vercel beobachtet dein GitHub-Repository und startet automatisch einen neuen Deploy, sobald neue Änderungen ankommen.

### 12.4 – Deploy bei Vercel beobachten

1. Öffne: **https://vercel.com/dashboard**
2. Klicke auf dein Projekt
3. Unter **„Deployments"** siehst du den aktuellen Status
4. Warte, bis der Status auf **„Ready"** (grüner Punkt) steht – das dauert normalerweise 1–3 Minuten

> ✅ **Erledigt!** Deine Webseite mit dem neuen Kontaktformular ist live!

---

## Schritt 13 – Live testen

> **Was tun wir hier?** Wir testen, ob das Kontaktformular auf der echten Webseite funktioniert.

### 13.1 – Webseite öffnen

1. Öffne deinen Browser
2. Gehe zu: **https://meinauftrittonline.de** (oder deine Unterseite mit dem Formular)

### 13.2 – Testformular abschicken

1. Fülle das Kontaktformular aus:
   - **Name:** Live-Test
   - **E-Mail:** eine echte E-Mail-Adresse, die du checken kannst
   - **Nachricht:** Test der Live-Webseite
2. Klicke auf **„Nachricht senden"**
3. Du solltest die grüne Erfolgsmeldung sehen

### 13.3 – Kontrolle

Prüfe folgende Stellen:

1. **Dein E-Mail-Postfach** (kontakt@meinauftrittonline.de oder die Adresse, die du im Code eingetragen hast):
   - Du solltest eine E-Mail mit dem Betreff „Neue Kontaktanfrage von Live-Test" erhalten haben
   - Prüfe auch den **Spam-Ordner**!

2. **Resend-Dashboard** → **„Emails"** (linkes Menü):
   - Du siehst die gesendete E-Mail mit Status **„Delivered"** (zugestellt)

3. **Vercel-Dashboard** → Projekt → **„Functions"** (oder „Logs"):
   - Hier siehst du, ob die Funktion aufgerufen wurde und ob es Fehler gab

> ✅ **Erledigt!** Alles funktioniert! Dein Kontaktformular ist einsatzbereit.

---

## Bonus: Spam-Schutz einbauen (Honeypot)

> **Was tun wir hier?** Wir schützen das Formular vor Spam-Bots. Die Idee: Wir fügen ein unsichtbares Feld hinzu. Echte Menschen sehen es nicht und lassen es leer. Bots füllen es automatisch aus → wir erkennen den Bot und ignorieren die Nachricht.

### In der Formular-Komponente (`src/components/ContactForm.tsx`)

Füge im `<form>`-Element ein unsichtbares Feld hinzu, z.B. direkt nach dem `<form>`-Tag:

```tsx
{/* Honeypot – unsichtbar für echte Besucher, aber Bots füllen es aus */}
<div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
  <label htmlFor="website">Website</label>
  <input
    id="website"
    name="website"
    type="text"
    tabIndex={-1}
    autoComplete="off"
    onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
  />
</div>
```

Und erweitere das `ContactFormState`-Interface:

```tsx
interface ContactFormState {
  name: string;
  email: string;
  message: string;
  website?: string;  // ← NEU: Honeypot-Feld
}
```

### In der Vercel-Funktion (`api/contact.ts`)

Füge nach der Zeile `const { name, email, message } = req.body;` diese Prüfung hinzu:

```typescript
const { name, email, message, website } = req.body;

// Honeypot-Prüfung: Wenn das unsichtbare Feld ausgefüllt ist, war es ein Bot
if (website) {
  // Wir tun so, als hätte alles geklappt – der Bot merkt nichts
  return res.status(200).json({ success: true });
}
```

> 💡 **Warum antworten wir mit „success"?** Damit der Bot denkt, seine Spam-Nachricht wurde angenommen. Wenn wir mit einem Fehler antworten würden, könnte der Bot es ohne das Feld nochmal versuchen.

> 💡 **Noch besserer Spam-Schutz:** Für professionellere Lösungen kannst du **Google reCAPTCHA** oder **hCaptcha** einbauen. Das sind diese „Ich bin kein Roboter"-Kästchen. Das erfordert aber mehr Aufwand und ist für die meisten kleinen Webseiten nicht nötig.

---

## Fehlerbehebung

### „E-Mail kommt nicht an"

| Mögliche Ursache | Lösung |
|------------------|--------|
| E-Mail ist im Spam-Ordner | Spam-Ordner prüfen und E-Mail als „Kein Spam" markieren |
| Domain bei Resend nicht verifiziert | Resend → Domains → Status prüfen. Falls „Pending": DNS-Einträge bei IONOS kontrollieren und 24h warten |
| API-Key nicht gesetzt | Vercel → Settings → Environment Variables → prüfen ob `RESEND_API_KEY` vorhanden ist |
| API-Key falsch kopiert | Neuen Key bei Resend erstellen und bei Vercel aktualisieren |
| Empfänger-Adresse falsch | In `api/contact.ts` die `to:`-Adresse prüfen |

### „Formular zeigt Fehlermeldung"

| Fehlermeldung | Ursache & Lösung |
|---------------|------------------|
| „Bitte fülle alle Felder aus" | Ein oder mehrere Felder sind leer → alle Felder ausfüllen |
| „Bitte gib eine gültige E-Mail-Adresse ein" | E-Mail-Format falsch → prüfe auf Tippfehler (fehlt das @?) |
| „E-Mail konnte nicht gesendet werden" | Problem bei Resend → Dashboard prüfen, Domain verifiziert? API-Key korrekt? |
| „Verbindungsfehler" | Kein Internet oder die API-Funktion ist nicht erreichbar → Internetverbindung prüfen |
| „Ein interner Fehler ist aufgetreten" | Unbekannter Fehler → Vercel Logs prüfen (siehe unten) |

### Vercel-Logs prüfen (wenn etwas nicht klappt)

1. Gehe zu: **https://vercel.com/dashboard**
2. Klicke auf dein Projekt
3. Klicke oben auf **„Logs"** (oder „Functions" → „View Function Logs")
4. Du siehst alle Aufrufe deiner API-Funktion mit Datum, Status und ggf. Fehlermeldungen
5. Suche nach roten Einträgen (Fehler) – die Fehlermeldung gibt meistens einen Hinweis, was schiefgelaufen ist

### Resend-Logs prüfen

1. Gehe zu: **https://resend.com/emails**
2. Du siehst alle E-Mails, die Resend versucht hat zu senden
3. Status-Bedeutungen:
   - **Delivered** ✅ = E-Mail wurde erfolgreich zugestellt
   - **Bounced** ❌ = E-Mail konnte nicht zugestellt werden (falsche Adresse?)
   - **Complained** ⚠️ = Empfänger hat die E-Mail als Spam markiert
   - **Queued** ⏳ = E-Mail wartet noch auf Versand

### „Lokal funktioniert, aber live nicht"

1. Prüfe, ob die `RESEND_API_KEY`-Variable bei Vercel unter **Settings → Environment Variables** korrekt gesetzt ist
2. Prüfe, ob ein neuer Deploy nach dem Setzen der Variable stattgefunden hat → ggf. **Redeploy** auslösen
3. Prüfe den `api/`-Ordner: Er muss im **Stammverzeichnis** des Projekts liegen (nicht in `src/`)

### „Der Befehl npm/vercel wird nicht erkannt"

Das bedeutet, dass Node.js oder die Vercel CLI nicht installiert ist:
- **Node.js installieren:** https://nodejs.org → den LTS-Download starten und der Installation folgen. Danach VS Code neu starten.
- **Vercel CLI installieren:** Terminal öffnen und `npm install -g vercel` eingeben

---

## Kurzübersicht: Was wo einzutragen ist

| Was | Wo | Wert |
|-----|-----|------|
| Resend API-Key (lokal) | `.env.local` im Projektordner | `RESEND_API_KEY=re_dein_key` |
| Resend API-Key (live) | Vercel → Settings → Environment Variables | `RESEND_API_KEY` = `re_dein_key` |
| Absender-Adresse | `api/contact.ts` → Zeile `from:` | `kontakt@meinauftrittonline.de` |
| Empfänger-Adresse | `api/contact.ts` → Zeile `to:` | Deine E-Mail-Adresse(n) |
| DKIM (DNS) | IONOS → DNS → TXT-Eintrag | Hostname: `resend._domainkey` / Wert: aus Resend kopieren |
| SPF (DNS) | IONOS → DNS → TXT-Eintrag | Hostname: `send` / Wert: `v=spf1 include:amazonses.com ~all` |
| MX (DNS) | IONOS → DNS → MX-Eintrag | Hostname: `send` / Wert: `feedback-smtp.eu-west-1.amazonses.com` / Priorität: `10` |

---

## Dateien-Übersicht

Am Ende hast du folgende neue/geänderte Dateien in deinem Projekt:

```
mein-projekt/
├── api/
│   └── contact.ts           ← NEU: Vercel Serverless Function (E-Mail-Versand)
├── src/
│   └── components/
│       └── ContactForm.tsx   ← NEU: Das sichtbare Formular
├── .env.local                ← NEU: Lokaler API-Key (NICHT committen!)
├── package.json              ← GEÄNDERT: neue Pakete (resend, @vercel/node)
└── ...
```

---

## Kosten-Übersicht

| Dienst | Kosten |
|--------|--------|
| **Resend** | Kostenlos bis 3.000 E-Mails / Monat, danach ab $20/Monat |
| **Vercel** | Kostenlos (Hobby-Plan), Serverless Functions inklusive |
| **IONOS Domain** | Du zahlst das sowieso schon für deine Domain |
| **Supabase** | Wird für das Kontaktformular nicht benötigt (nur deine bestehende Nutzung) |

> 💡 Bei 3.000 kostenlosen E-Mails pro Monat müssten dir **100 Leute pro Tag** schreiben, bevor es etwas kostet. Für ein normales Kontaktformular reicht das kostenlose Kontingent auf Jahre.
