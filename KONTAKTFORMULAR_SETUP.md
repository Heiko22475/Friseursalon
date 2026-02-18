# Kontaktformular einrichten – meinauftrittonline.de
**Stack: Vite + React + Vercel + Resend**

---

## Übersicht

Das Kontaktformular sendet E-Mails über **Resend** (Transactional Email Service).
Die E-Mail-Logik läuft als **Vercel Serverless Function** (kein eigener Server nötig).

```
Besucher füllt Formular aus
        ↓
React-Frontend sendet POST-Request
        ↓
Vercel Function /api/contact (serverless)
        ↓
Resend API → E-Mail an dich
```

---

## Schritt 1 – Resend-Konto & API-Key

1. Gehe zu [resend.com](https://resend.com) und logge dich ein
2. **Domains** → Domain `meinauftrittonline.de` verifizieren (falls noch nicht erledigt)
3. **API Keys** → „Create API Key"
   - Name: `meinauftrittonline-contact`
   - Permission: **Sending access**
   - Domain: `meinauftrittonline.de`
4. Den Key kopieren → sieht aus wie `re_xxxxxxxxxxxx`

---

## Schritt 2 – DNS-Einträge bei IONOS (Resend-Verifizierung)

Falls die Domain noch nicht bei Resend verifiziert ist, folgende DNS-Einträge bei IONOS eintragen:

| Typ | Hostname | Wert |
|-----|----------|------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN...` (dein DKIM-Key) |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |

> ⚠️ IONOS hängt automatisch `.meinauftrittonline.de` an — du trägst nur den Präfix ein (z.B. `resend._domainkey`).

Danach im Resend-Dashboard auf **Verify** klicken. DNS kann bis zu 24h brauchen.

---

## Schritt 3 – Resend SDK installieren

```bash
npm install resend
```

---

## Schritt 4 – Vercel Serverless Function erstellen

Vite-Projekte auf Vercel unterstützen API-Routes über das Verzeichnis `/api` im Projektstamm.

**Datei erstellen: `api/contact.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  // Einfache Validierung
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
  }

  // E-Mail-Format prüfen
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Kontaktformular <kontakt@meinauftrittonline.de>',
      to: ['deine-email@meinauftrittonline.de'],   // <-- deine Empfänger-Adresse
      replyTo: email,
      subject: `Neue Anfrage von ${name}`,
      html: `
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (error) {
      console.error('[Resend Error]', error);
      return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden.' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Interner Fehler.' });
  }
}
```

---

## Schritt 5 – Typen für Vercel Node installieren

```bash
npm install --save-dev @vercel/node
```

---

## Schritt 6 – Umgebungsvariable setzen

### Lokal (für Entwicklung)

Datei `.env.local` im Projektstamm anlegen:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

> Diese Datei **nie committen** – sie steht (hoffentlich) schon in `.gitignore` unter `*.local`.

### Bei Vercel (Produktion)

1. [vercel.com/dashboard](https://vercel.com/dashboard) → Projekt `web-design-website`
2. **Settings** → **Environment Variables**
3. Neue Variable:
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxxxxxxxxx`
   - Environment: **Production** + **Preview**
4. **Save** → nächster Deploy übernimmt sie automatisch

---

## Schritt 7 – React-Komponente (Kontaktformular)

**Datei: `src/components/ContactForm.tsx`**

```tsx
import React, { useState } from 'react';

interface FormState {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || 'Unbekannter Fehler.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setErrorMsg('Verbindungsfehler. Bitte versuche es später erneut.');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Dein Name"
        />
      </div>

      <div>
        <label htmlFor="email">E-Mail *</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="deine@email.de"
        />
      </div>

      <div>
        <label htmlFor="message">Nachricht *</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Wie kann ich dir helfen?"
        />
      </div>

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Wird gesendet…' : 'Nachricht senden'}
      </button>

      {status === 'success' && (
        <p style={{ color: 'green' }}>✓ Nachricht erfolgreich gesendet! Ich melde mich bald.</p>
      )}
      {status === 'error' && (
        <p style={{ color: 'red' }}>✗ {errorMsg}</p>
      )}
    </form>
  );
};
```

---

## Schritt 8 – Formular einbinden

In der gewünschten Seite einfach importieren:

```tsx
import { ContactForm } from '../components/ContactForm';

// In der Seite:
<section id="kontakt">
  <h2>Kontakt</h2>
  <ContactForm />
</section>
```

---

## Schritt 9 – Lokal testen

```bash
# Vercel CLI installieren (einmalig)
npm install -g vercel

# Projekt mit Vercel verknüpfen (einmalig)
vercel link

# Lokalen Dev-Server mit Vercel Functions starten
vercel dev
```

> `vercel dev` startet Vite **und** die API-Routen unter `localhost:3000/api/contact`.
> `npm run dev` allein reicht **nicht** – die API-Functions laufen damit nicht.

---

## Schritt 10 – Deployen

```bash
git add .
git commit -m "feat: Kontaktformular mit Resend"
git push
```

Vercel deployed automatisch bei jedem Push auf den Hauptbranch.

---

## Testen ob alles klappt

Nach dem Deploy:
1. Formular ausfüllen und absenden
2. Im Resend-Dashboard unter **Emails** → E-Mail sollte dort erscheinen
3. In deinem Postfach nachschauen

Falls etwas schiefläuft:
- Vercel-Dashboard → Projekt → **Functions** → Logs anschauen
- Resend-Dashboard → **Emails** → Status prüfen (Failed / Delivered)
- Sicherstellen dass `RESEND_API_KEY` in Vercel gesetzt ist

---

## Spam-Schutz (optional, empfohlen)

Einfacher Honeypot gegen Bots – unsichtbares Feld, das echte Nutzer nie ausfüllen:

**Im Formular:**
```tsx
{/* Honeypot – versteckt für echte Nutzer */}
<input
  name="website"
  type="text"
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
  value={form.website || ''}
  onChange={handleChange}
/>
```

**In der API:**
```typescript
const { name, email, message, website } = req.body;

// Bot-Erkennung: Honeypot-Feld wurde ausgefüllt
if (website) {
  return res.status(200).json({ success: true }); // Stille Verweigerung
}
```

---

## Kurzübersicht: Was wo einzutragen ist

| Was | Wo | Wert |
|-----|-----|------|
| API Key | Vercel → Environment Variables | `RESEND_API_KEY=re_xxx` |
| Absender-Adresse | `api/contact.ts` → `from:` | `kontakt@meinauftrittonline.de` |
| Empfänger-Adresse | `api/contact.ts` → `to:` | deine persönliche E-Mail |
| DKIM | IONOS DNS → TXT | `resend._domainkey` |
| SPF | IONOS DNS → TXT auf `send` | `v=spf1 include:amazonses.com ~all` |
| MX | IONOS DNS → MX auf `send` | `feedback-smtp.eu-west-1.amazonses.com` |
