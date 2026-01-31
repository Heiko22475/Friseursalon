# BeautifulCMS - Kontaktformular & E-Mail

## Übersicht

Dieses Dokument beschreibt die Implementierung des Kontaktformulars mit SMTP-Konfiguration, Spam-Schutz (Honeypot) und E-Mail-Versand.

---

## Inhaltsverzeichnis

1. [Kontaktformular-Konzept](#1-kontaktformular-konzept)
2. [Formular-Konfiguration](#2-formular-konfiguration)
3. [Spam-Schutz (Honeypot)](#3-spam-schutz-honeypot)
4. [SMTP-Konfiguration](#4-smtp-konfiguration)
5. [E-Mail-Versand](#5-e-mail-versand)
6. [Formular-Editor](#6-formular-editor)
7. [Validierung](#7-validierung)

---

## 1. Kontaktformular-Konzept

### 1.1 Funktionalität

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      KONTAKTFORMULAR-WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. BESUCHER                                                            │
│     ┌──────────────────────────────────────┐                           │
│     │ • Füllt Formular aus                 │                           │
│     │ • Name, E-Mail, Betreff, Nachricht   │                           │
│     │ • Akzeptiert Datenschutz             │                           │
│     │ • Klickt "Absenden"                  │                           │
│     └──────────────────────────────────────┘                           │
│                         │                                               │
│                         ▼                                               │
│  2. VALIDIERUNG                                                         │
│     ┌──────────────────────────────────────┐                           │
│     │ • Pflichtfelder prüfen               │                           │
│     │ • E-Mail-Format prüfen               │                           │
│     │ • Honeypot prüfen (Spam?)            │                           │
│     │ • Rate-Limiting prüfen               │                           │
│     └──────────────────────────────────────┘                           │
│                         │                                               │
│                         ▼                                               │
│  3. E-MAIL VERSAND                                                      │
│     ┌──────────────────────────────────────┐                           │
│     │ • SMTP-Verbindung aufbauen           │                           │
│     │ • E-Mail an Website-Besitzer senden  │                           │
│     │ • Optional: Bestätigung an Absender  │                           │
│     └──────────────────────────────────────┘                           │
│                         │                                               │
│                         ▼                                               │
│  4. ERFOLGSSEITE                                                        │
│     ┌──────────────────────────────────────┐                           │
│     │ • Erfolgsmeldung anzeigen            │                           │
│     │ • Formular zurücksetzen              │                           │
│     └──────────────────────────────────────┘                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Formular-Felder

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| Name | Text | Ja | Vollständiger Name |
| E-Mail | Email | Ja | Kontakt-E-Mail |
| Telefon | Tel | Nein | Rückrufnummer |
| Betreff | Select/Text | Nein | Vordefinierte oder freie Auswahl |
| Nachricht | Textarea | Ja | Die eigentliche Nachricht |
| Datenschutz | Checkbox | Ja | DSGVO-Zustimmung |

---

## 2. Formular-Konfiguration

### 2.1 Datenstruktur

```typescript
// src/types/ContactForm.ts

export interface ContactFormConfig {
  // Empfänger
  recipientEmail: string;
  recipientName?: string;
  
  // Felder
  fields: ContactFormField[];
  
  // E-Mail-Einstellungen
  emailSubjectPrefix?: string;  // z.B. "[Kontaktanfrage]"
  sendCopyToSender?: boolean;
  
  // Texte
  texts: {
    title: string;
    subtitle?: string;
    submitButton: string;
    successMessage: string;
    errorMessage: string;
    privacyText: string;
    privacyLink: string;
  };
  
  // Styling
  style: {
    layout: 'single-column' | 'two-column';
    labelPosition: 'above' | 'floating';
    buttonStyle: 'full-width' | 'inline';
    buttonColor: 'primary' | 'secondary' | 'custom';
  };
}

export interface ContactFormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];  // Für Select
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  width?: 'full' | 'half';
}

// Standard-Konfiguration
export const DEFAULT_CONTACT_FORM_CONFIG: ContactFormConfig = {
  recipientEmail: '',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'Name',
      placeholder: 'Ihr vollständiger Name',
      required: true,
      width: 'half'
    },
    {
      id: 'email',
      type: 'email',
      label: 'E-Mail',
      placeholder: 'ihre@email.de',
      required: true,
      width: 'half'
    },
    {
      id: 'phone',
      type: 'tel',
      label: 'Telefon',
      placeholder: '+49 123 456789',
      required: false,
      width: 'half'
    },
    {
      id: 'subject',
      type: 'select',
      label: 'Betreff',
      required: false,
      options: [
        'Allgemeine Anfrage',
        'Terminanfrage',
        'Preisanfrage',
        'Feedback',
        'Sonstiges'
      ],
      width: 'half'
    },
    {
      id: 'message',
      type: 'textarea',
      label: 'Nachricht',
      placeholder: 'Ihre Nachricht an uns...',
      required: true,
      validation: {
        minLength: 10,
        maxLength: 2000
      },
      width: 'full'
    },
    {
      id: 'privacy',
      type: 'checkbox',
      label: 'Ich habe die Datenschutzerklärung gelesen und akzeptiere diese.',
      required: true,
      width: 'full'
    }
  ],
  texts: {
    title: 'Kontaktieren Sie uns',
    subtitle: 'Wir freuen uns auf Ihre Nachricht',
    submitButton: 'Nachricht senden',
    successMessage: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns schnellstmöglich bei Ihnen.',
    errorMessage: 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.',
    privacyText: 'Datenschutzerklärung',
    privacyLink: '/datenschutz'
  },
  style: {
    layout: 'two-column',
    labelPosition: 'above',
    buttonStyle: 'full-width',
    buttonColor: 'primary'
  }
};
```

### 2.2 In Website-JSON speichern

```typescript
// In websites.data.settings

interface WebsiteSettings {
  // ... andere Einstellungen
  
  contact: {
    form: ContactFormConfig;
    email: string;           // Kontakt-E-Mail
    phone?: string;
    address?: string;
  };
  
  smtp?: SMTPConfig;
}
```

---

## 3. Spam-Schutz (Honeypot)

### 3.1 Konzept

```
HONEYPOT-TECHNIK
────────────────────────────────────────

Ein Honeypot ist ein verstecktes Formularfeld, das für Menschen
unsichtbar ist, aber von Bots automatisch ausgefüllt wird.

Mensch:
┌─────────────────────────────────────┐
│ Name: [Max Mustermann           ]   │
│ E-Mail: [max@example.de         ]   │
│ [verstecktes Feld bleibt leer]      │  ← Mensch sieht/füllt nicht aus
│ Nachricht: [Hallo...            ]   │
└─────────────────────────────────────┘
→ GÜLTIG ✓

Bot:
┌─────────────────────────────────────┐
│ Name: [Buy cheap pills          ]   │
│ E-Mail: [spam@bot.com           ]   │
│ [website: http://spam.com       ]   │  ← Bot füllt alle Felder aus
│ Nachricht: [Buy now!!!          ]   │
└─────────────────────────────────────┘
→ SPAM! ✗
```

### 3.2 Implementierung

```tsx
// src/components/website/ContactForm/ContactFormWithHoneypot.tsx

import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  privacy: boolean;
  // Honeypot-Felder (nicht für Menschen)
  website: string;  // Klassischer Honeypot
  _gotcha: string;  // Alternative Benennung
}

export const ContactFormWithHoneypot: React.FC<{
  config: ContactFormConfig;
  websiteId: string;
}> = ({ config, websiteId }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacy: false,
    website: '',   // Honeypot
    _gotcha: ''    // Honeypot
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitTime, setSubmitTime] = useState<number>(0);

  // Zeitstempel beim Laden setzen (für Timing-Check)
  React.useEffect(() => {
    setSubmitTime(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Honeypot-Check
    if (formData.website !== '' || formData._gotcha !== '') {
      // Stille Ablehnung - Bot denkt es hat funktioniert
      console.log('Spam detected via honeypot');
      setStatus('success'); // Fake-Erfolg für Bot
      return;
    }

    // 2. Timing-Check (zu schnell = Bot)
    const timeTaken = Date.now() - submitTime;
    if (timeTaken < 3000) { // Weniger als 3 Sekunden
      console.log('Spam detected via timing');
      setStatus('success'); // Fake-Erfolg für Bot
      return;
    }

    // 3. Formular absenden
    setStatus('loading');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          formData: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message
          },
          // Meta-Daten für serverseitige Prüfung
          _meta: {
            timestamp: submitTime,
            duration: timeTaken
          }
        })
      });

      if (response.ok) {
        setStatus('success');
        // Formular zurücksetzen
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          privacy: false,
          website: '',
          _gotcha: ''
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sichtbare Felder */}
      <div className={config.style.layout === 'two-column' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
        {/* Name */}
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            autoComplete="name"
          />
        </div>

        {/* E-Mail */}
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium mb-1">
            E-Mail <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            autoComplete="email"
          />
        </div>

        {/* ... weitere sichtbare Felder ... */}
      </div>

      {/* ============================================ */}
      {/* HONEYPOT-FELDER - für Menschen versteckt!   */}
      {/* ============================================ */}
      
      {/* 
        Methode 1: CSS visibility:hidden 
        Bots ignorieren CSS oft und füllen alles aus
      */}
      <div 
        style={{ 
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          height: 0,
          overflow: 'hidden'
        }}
        aria-hidden="true"
        tabIndex={-1}
      >
        <label htmlFor="contact-website">
          Bitte leer lassen (Website - Spam-Schutz)
        </label>
        <input
          id="contact-website"
          type="text"
          name="website"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* 
        Methode 2: Anderer Feldname als Backup
      */}
      <input
        type="text"
        name="_gotcha"
        value={formData._gotcha}
        onChange={(e) => setFormData({ ...formData, _gotcha: e.target.value })}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* ============================================ */}
      
      {/* Datenschutz */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.privacy}
            onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
            required
            className="mt-1 w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
          <span className="text-sm">
            Ich habe die{' '}
            <a href={config.texts.privacyLink} className="text-rose-600 hover:underline">
              {config.texts.privacyText}
            </a>{' '}
            gelesen und akzeptiere diese. <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* Status-Meldungen */}
      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {config.texts.successMessage}
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {config.texts.errorMessage}
        </div>
      )}

      {/* Submit-Button */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className={`
          ${config.style.buttonStyle === 'full-width' ? 'w-full' : 'px-8'}
          py-3 bg-rose-500 text-white rounded-lg font-medium
          hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Wird gesendet...
          </span>
        ) : config.texts.submitButton}
      </button>
    </form>
  );
};
```

---

## 4. SMTP-Konfiguration

### 4.1 Datenstruktur

```typescript
// src/types/Email.ts

export interface SMTPConfig {
  host: string;         // z.B. smtp.gmail.com
  port: number;         // z.B. 587
  secure: boolean;      // true für Port 465
  auth: {
    user: string;       // E-Mail-Adresse
    pass: string;       // Passwort oder App-Passwort
  };
  from: {
    name: string;       // z.B. "Friseursalon Beispiel"
    email: string;      // z.B. "kontakt@salon-beispiel.de"
  };
}

// In Datenbank speichern (verschlüsselt!)
interface WebsiteSMTPSettings {
  websiteId: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassEncrypted: string;  // AES-256 verschlüsselt
  fromName: string;
  fromEmail: string;
  isConfigured: boolean;
  lastTestedAt?: string;
  testResult?: 'success' | 'failed';
}
```

### 4.2 SMTP-Einstellungen im Admin

```
┌─────────────────────────────────────────────────────────────────────────┐
│  E-Mail-Einstellungen                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SMTP-Server konfigurieren                                             │
│  ─────────────────────────────                                         │
│                                                                         │
│  Server:                                                                │
│  [smtp.gmail.com____________________________________]                  │
│  ℹ️ SMTP-Server Ihres E-Mail-Anbieters                                 │
│                                                                         │
│  Port:              Verschlüsselung:                                   │
│  [587____]          (●) STARTTLS (Port 587)                            │
│                     ( ) SSL/TLS (Port 465)                              │
│                                                                         │
│  Benutzername:                                                         │
│  [kontakt@salon-beispiel.de_________________________]                  │
│  ℹ️ Meist Ihre E-Mail-Adresse                                          │
│                                                                         │
│  Passwort:                                                             │
│  [••••••••••••______________________________________]                  │
│  ℹ️ Bei Gmail: App-Passwort erforderlich                               │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Absender-Informationen                                                │
│  ────────────────────────                                              │
│                                                                         │
│  Absender-Name:                                                        │
│  [Friseursalon Beispiel_____________________________]                  │
│                                                                         │
│  Absender-E-Mail:                                                      │
│  [kontakt@salon-beispiel.de_________________________]                  │
│                                                                         │
│  Kontakt-E-Mail (Empfänger für Anfragen):                              │
│  [kontakt@salon-beispiel.de_________________________]                  │
│                                                                         │
│  [✓] Kopie an Absender senden (Bestätigungsmail)                       │
│                                                                         │
│                    [Verbindung testen]  [Speichern]                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

// Test erfolgreich:
┌─────────────────────────────────────────────────────────────────────────┐
│  ✅ Verbindung erfolgreich!                                            │
│  Eine Test-E-Mail wurde an kontakt@salon-beispiel.de gesendet.        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 SMTP-Config-Editor

```tsx
// src/components/admin/SMTPConfigEditor.tsx

import React, { useState } from 'react';
import { Mail, Server, Lock, Send, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

const COMMON_SMTP_PROVIDERS = [
  { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
  { name: 'Outlook/Office365', host: 'smtp.office365.com', port: 587, secure: false },
  { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  { name: 'IONOS', host: 'smtp.ionos.de', port: 587, secure: false },
  { name: 'Strato', host: 'smtp.strato.de', port: 587, secure: false },
  { name: 'All-Inkl', host: 'smtp.all-inkl.com', port: 587, secure: false },
  { name: 'Benutzerdefiniert', host: '', port: 587, secure: false },
];

export const SMTPConfigEditor: React.FC<{
  websiteId: string;
  initialConfig?: SMTPConfig;
}> = ({ websiteId, initialConfig }) => {
  const [config, setConfig] = useState<SMTPConfig>(initialConfig || {
    host: '',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    from: { name: '', email: '' }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleProviderSelect = (provider: typeof COMMON_SMTP_PROVIDERS[0]) => {
    if (provider.name !== 'Benutzerdefiniert') {
      setConfig({
        ...config,
        host: provider.host,
        port: provider.port,
        secure: provider.secure
      });
    }
  };

  const handleTest = async () => {
    setTestStatus('testing');
    setTestError('');

    try {
      const response = await fetch('/api/admin/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, config })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestError(result.error || 'Verbindung fehlgeschlagen');
      }
    } catch (error) {
      setTestStatus('error');
      setTestError('Netzwerkfehler - bitte versuchen Sie es erneut');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await fetch('/api/admin/smtp/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, config })
      });
      
      // Erfolg anzeigen
    } catch (error) {
      // Fehler anzeigen
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Mail className="w-6 h-6" />
        E-Mail-Einstellungen
      </h2>

      {/* Provider-Schnellauswahl */}
      <div>
        <label className="block text-sm font-medium mb-2">
          E-Mail-Anbieter (Schnellauswahl)
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_SMTP_PROVIDERS.map(provider => (
            <button
              key={provider.name}
              type="button"
              onClick={() => handleProviderSelect(provider)}
              className={`
                px-3 py-1.5 rounded-lg text-sm border transition
                ${config.host === provider.host 
                  ? 'bg-rose-50 border-rose-300 text-rose-700' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      {/* SMTP-Server */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            SMTP-Server
          </label>
          <div className="relative">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="smtp.example.com"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Port
          </label>
          <select
            value={config.port}
            onChange={(e) => setConfig({ 
              ...config, 
              port: parseInt(e.target.value),
              secure: parseInt(e.target.value) === 465
            })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value={587}>587 (STARTTLS - empfohlen)</option>
            <option value={465}>465 (SSL/TLS)</option>
            <option value={25}>25 (Unverschlüsselt - nicht empfohlen)</option>
          </select>
        </div>
      </div>

      {/* Authentifizierung */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Benutzername
          </label>
          <input
            type="email"
            value={config.auth.user}
            onChange={(e) => setConfig({ 
              ...config, 
              auth: { ...config.auth, user: e.target.value }
            })}
            placeholder="ihre@email.de"
            className="w-full px-4 py-2 border rounded-lg"
            autoComplete="username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Passwort
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={config.auth.pass}
              onChange={(e) => setConfig({ 
                ...config, 
                auth: { ...config.auth, pass: e.target.value }
              })}
              placeholder="••••••••"
              className="w-full px-4 pr-10 py-2 border rounded-lg"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Gmail-Hinweis */}
      {config.host === 'smtp.gmail.com' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-medium text-blue-800">Hinweis für Gmail-Nutzer:</p>
          <ol className="text-blue-700 mt-2 space-y-1 list-decimal list-inside">
            <li>Aktivieren Sie die 2-Faktor-Authentifizierung in Ihrem Google-Konto</li>
            <li>Erstellen Sie ein "App-Passwort" unter Google-Konto → Sicherheit → App-Passwörter</li>
            <li>Verwenden Sie das App-Passwort (nicht Ihr normales Passwort) hier</li>
          </ol>
        </div>
      )}

      {/* Absender */}
      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <label className="block text-sm font-medium mb-1">
            Absender-Name
          </label>
          <input
            type="text"
            value={config.from.name}
            onChange={(e) => setConfig({ 
              ...config, 
              from: { ...config.from, name: e.target.value }
            })}
            placeholder="Friseursalon Beispiel"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Absender-E-Mail
          </label>
          <input
            type="email"
            value={config.from.email}
            onChange={(e) => setConfig({ 
              ...config, 
              from: { ...config.from, email: e.target.value }
            })}
            placeholder="kontakt@salon-beispiel.de"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Test-Status */}
      {testStatus !== 'idle' && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3
          ${testStatus === 'success' ? 'bg-green-50 border border-green-200' : ''}
          ${testStatus === 'error' ? 'bg-red-50 border border-red-200' : ''}
          ${testStatus === 'testing' ? 'bg-gray-50 border border-gray-200' : ''}
        `}>
          {testStatus === 'testing' && (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Verbindung wird getestet...</span>
            </>
          )}
          {testStatus === 'success' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">
                Verbindung erfolgreich! Eine Test-E-Mail wurde gesendet.
              </span>
            </>
          )}
          {testStatus === 'error' && (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{testError}</span>
            </>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleTest}
          disabled={!config.host || !config.auth.user || !config.auth.pass}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          Verbindung testen
        </button>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50"
        >
          {isSaving ? 'Wird gespeichert...' : 'Speichern'}
        </button>
      </div>
    </div>
  );
};
```

---

## 5. E-Mail-Versand

### 5.1 E-Mail-Service

```typescript
// src/services/email/EmailService.ts

import nodemailer from 'nodemailer';
import { SMTPConfig } from '@/types/Email';

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: SMTPConfig;

  constructor(config: SMTPConfig) {
    this.config = config;
  }

  /**
   * SMTP-Verbindung initialisieren
   */
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass
        }
      });
    }
    return this.transporter;
  }

  /**
   * Verbindung testen
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  /**
   * E-Mail senden
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      
      const result = await transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  /**
   * Kontaktformular-E-Mail senden
   */
  async sendContactEmail(data: {
    recipientEmail: string;
    senderName: string;
    senderEmail: string;
    senderPhone?: string;
    subject: string;
    message: string;
    businessName: string;
  }): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Neue Kontaktanfrage</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333; margin-top: 0;">Neue Kontaktanfrage</h1>
          <p style="color: #666;">Sie haben eine neue Nachricht über das Kontaktformular Ihrer Website erhalten.</p>
        </div>
        
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${this.escapeHtml(data.senderName)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">E-Mail:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <a href="mailto:${this.escapeHtml(data.senderEmail)}">${this.escapeHtml(data.senderEmail)}</a>
            </td>
          </tr>
          ${data.senderPhone ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Telefon:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <a href="tel:${this.escapeHtml(data.senderPhone)}">${this.escapeHtml(data.senderPhone)}</a>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Betreff:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${this.escapeHtml(data.subject)}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">Nachricht:</h3>
          <p style="white-space: pre-wrap; color: #333;">${this.escapeHtml(data.message)}</p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #999; font-size: 12px;">
          Diese E-Mail wurde automatisch über das Kontaktformular von ${this.escapeHtml(data.businessName)} gesendet.
        </p>
      </body>
      </html>
    `;

    const text = `
Neue Kontaktanfrage

Name: ${data.senderName}
E-Mail: ${data.senderEmail}
${data.senderPhone ? `Telefon: ${data.senderPhone}\n` : ''}Betreff: ${data.subject}

Nachricht:
${data.message}

---
Diese E-Mail wurde automatisch über das Kontaktformular von ${data.businessName} gesendet.
    `;

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `[Kontaktanfrage] ${data.subject} - von ${data.senderName}`,
      text,
      html,
      replyTo: data.senderEmail
    });
  }

  /**
   * Bestätigungs-E-Mail an Absender
   */
  async sendConfirmationEmail(data: {
    recipientEmail: string;
    recipientName: string;
    businessName: string;
    message: string;
  }): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ihre Nachricht wurde empfangen</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Vielen Dank für Ihre Nachricht!</h1>
        
        <p>Guten Tag ${this.escapeHtml(data.recipientName)},</p>
        
        <p>
          wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.
        </p>
        
        <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin-top: 0;">Ihre Nachricht:</h3>
          <p style="white-space: pre-wrap;">${this.escapeHtml(data.message)}</p>
        </div>
        
        <p>Mit freundlichen Grüßen,<br>${this.escapeHtml(data.businessName)}</p>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `Ihre Nachricht an ${data.businessName}`,
      text: `Vielen Dank für Ihre Nachricht!\n\nWir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.\n\nMit freundlichen Grüßen,\n${data.businessName}`,
      html
    });
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
```

### 5.2 API-Route für Kontaktformular

```typescript
// src/app/api/contact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from '@/services/email/EmailService';
import { decryptSMTPPassword } from '@/utils/encryption';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteId, formData, _meta } = body;

    // 1. Rate-Limiting prüfen (optional)
    // ...

    // 2. Website und SMTP-Config laden
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: website } = await supabase
      .from('websites')
      .select('data')
      .eq('id', websiteId)
      .single();

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    const settings = website.data.settings;
    const smtpConfig = settings.smtp;

    if (!smtpConfig || !smtpConfig.host) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    // Passwort entschlüsseln
    const decryptedConfig = {
      ...smtpConfig,
      auth: {
        ...smtpConfig.auth,
        pass: await decryptSMTPPassword(smtpConfig.auth.passEncrypted)
      }
    };

    // 3. E-Mail senden
    const emailService = new EmailService(decryptedConfig);

    // An Website-Besitzer
    const sendResult = await emailService.sendContactEmail({
      recipientEmail: settings.contact.email,
      senderName: formData.name,
      senderEmail: formData.email,
      senderPhone: formData.phone,
      subject: formData.subject || 'Kontaktanfrage',
      message: formData.message,
      businessName: website.data.name || 'Website'
    });

    if (!sendResult.success) {
      console.error('Failed to send contact email:', sendResult.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // 4. Optional: Bestätigung an Absender
    if (settings.contact.form.sendCopyToSender) {
      await emailService.sendConfirmationEmail({
        recipientEmail: formData.email,
        recipientName: formData.name,
        businessName: website.data.name || 'Website',
        message: formData.message
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 6. Formular-Editor

### 6.1 UI-Mockup

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Kontaktformular bearbeiten                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Felder] [Texte] [Design] [Vorschau]                                  │
│  ═══════                                                                │
│                                                                         │
│  Formular-Felder                                        [+ Feld hinzu] │
│  ────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ☰ │ Name           │ Text    │ Pflicht ✓ │ Halbe Breite │ [✎][🗑] │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ E-Mail         │ Email   │ Pflicht ✓ │ Halbe Breite │ [✎][🗑] │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ Telefon        │ Tel     │ Optional  │ Halbe Breite │ [✎][🗑] │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ Betreff        │ Select  │ Optional  │ Halbe Breite │ [✎][🗑] │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ Nachricht      │ Textarea│ Pflicht ✓ │ Volle Breite │ [✎][🗑] │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ Datenschutz    │ Checkbox│ Pflicht ✓ │ Volle Breite │ [✎][🗑] │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Empfänger-E-Mail:                                                     │
│  [kontakt@salon-beispiel.de_________________________________________] │
│                                                                         │
│  [✓] Kopie der Nachricht an Absender senden                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Validierung

### 7.1 Client-seitige Validierung

```typescript
// src/utils/validation/contactForm.ts

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateContactForm(
  formData: Record<string, any>,
  fields: ContactFormField[]
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = formData[field.id];

    // Pflichtfeld-Prüfung
    if (field.required) {
      if (field.type === 'checkbox' && !value) {
        errors[field.id] = 'Dieses Feld ist erforderlich';
        continue;
      }
      if (typeof value === 'string' && !value.trim()) {
        errors[field.id] = 'Dieses Feld ist erforderlich';
        continue;
      }
    }

    // Typ-spezifische Validierung
    if (value && field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.id] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      }
    }

    if (value && field.type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]{6,}$/;
      if (!phoneRegex.test(value)) {
        errors[field.id] = 'Bitte geben Sie eine gültige Telefonnummer ein';
      }
    }

    // Längen-Validierung
    if (value && field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        errors[field.id] = `Mindestens ${field.validation.minLength} Zeichen erforderlich`;
      }
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        errors[field.id] = `Maximal ${field.validation.maxLength} Zeichen erlaubt`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
```

---

## Implementierungs-Checkliste

- [ ] ContactFormConfig TypeScript-Interface erstellen
- [ ] Honeypot-Felder im Formular einbauen
- [ ] Timing-Check implementieren
- [ ] SMTPConfig Datenstruktur erstellen
- [ ] SMTP-Passwort-Verschlüsselung implementieren
- [ ] EmailService mit nodemailer erstellen
- [ ] Kontakt-E-Mail-Template erstellen
- [ ] Bestätigungs-E-Mail-Template erstellen
- [ ] API-Route für Kontaktformular erstellen
- [ ] API-Route für SMTP-Test erstellen
- [ ] SMTP-Editor im Admin erstellen
- [ ] Formular-Editor im Admin erstellen
- [ ] Client-seitige Validierung implementieren
- [ ] Server-seitige Validierung implementieren
- [ ] E2E-Tests für Formular erstellen
