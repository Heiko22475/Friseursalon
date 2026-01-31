# BeautifulCMS - Onboarding & Kundenportal

## Übersicht

Dieses Dokument beschreibt den Onboarding-Prozess für neue CMS-Kunden. Kunden können über eine Kundennummer auf ein Portal zugreifen und dort ihre Inhalte (Bilder, Texte, Logo) hochladen.

---

## Inhaltsverzeichnis

1. [Konzept-Übersicht](#1-konzept-übersicht)
2. [Datenstruktur](#2-datenstruktur)
3. [Kundenportal](#3-kundenportal)
4. [SuperAdmin: Kunden anlegen](#4-superadmin-kunden-anlegen)
5. [Inhalts-Uploads](#5-inhalts-uploads)
6. [Onboarding-Status](#6-onboarding-status)
7. [E-Mail-Benachrichtigungen](#7-e-mail-benachrichtigungen)

---

## 1. Konzept-Übersicht

### 1.1 Der Onboarding-Prozess

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ONBOARDING-WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. SUPERADMIN                                                          │
│     ┌──────────────────────────────────────┐                           │
│     │ • Erstellt neuen Kunden              │                           │
│     │ • Generiert 6-stellige Kundennummer  │                           │
│     │ • Sendet Zugangsdaten per E-Mail     │                           │
│     └──────────────────────────────────────┘                           │
│                         │                                               │
│                         ▼                                               │
│  2. KUNDE (erhält E-Mail)                                              │
│     ┌──────────────────────────────────────┐                           │
│     │ • Öffnet Portal-Link                 │                           │
│     │ • Gibt Kundennummer ein              │                           │
│     │ • Landet im Onboarding-Portal        │                           │
│     └──────────────────────────────────────┘                           │
│                         │                                               │
│                         ▼                                               │
│  3. ONBOARDING-PORTAL                                                   │
│     ┌──────────────────────────────────────┐                           │
│     │ • Logo hochladen                     │                           │
│     │ • Texte eingeben                     │                           │
│     │ • Bilder hochladen                   │                           │
│     │ • Öffnungszeiten                     │                           │
│     │ • Kontaktdaten                       │                           │
│     └──────────────────────────────────────┘                           │
│                         │                                               │
│                         ▼                                               │
│  4. SUPERADMIN (erhält Benachrichtigung)                               │
│     ┌──────────────────────────────────────┐                           │
│     │ • Prüft hochgeladene Inhalte         │                           │
│     │ • Erstellt Website mit Template      │                           │
│     │ • Passt Inhalte an                   │                           │
│     │ • Gibt Website frei                  │                           │
│     └──────────────────────────────────────┘                           │
│                         │                                               │
│                         ▼                                               │
│  5. KUNDE (erhält E-Mail)                                              │
│     ┌──────────────────────────────────────┐                           │
│     │ • Erhält Zugang zum Admin-Bereich    │                           │
│     │ • Kann Website selbst verwalten      │                           │
│     └──────────────────────────────────────┘                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Warum dieses System?

- **Einfach für Kunden**: Keine Registrierung, nur Kundennummer eingeben
- **Strukturierte Datensammlung**: Alle benötigten Inhalte an einem Ort
- **Qualitätskontrolle**: SuperAdmin prüft Inhalte vor Veröffentlichung
- **Keine technischen Hürden**: Kunden müssen nichts über CMS wissen

---

## 2. Datenstruktur

### 2.1 Datenbank-Tabellen

```sql
-- Kunden-Tabelle
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_number VARCHAR(6) UNIQUE NOT NULL,  -- 6-stellige Nummer
  email VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Onboarding-Status
  onboarding_status VARCHAR(50) DEFAULT 'invited',
  onboarding_started_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Website-Verknüpfung (später)
  website_id UUID REFERENCES websites(id),
  
  -- Metadaten
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding-Status Enum
-- 'invited'     = E-Mail wurde gesendet, noch nicht gestartet
-- 'in_progress' = Kunde hat begonnen, Inhalte hochzuladen
-- 'completed'   = Kunde hat alle Inhalte eingereicht
-- 'processed'   = SuperAdmin hat Website erstellt
-- 'active'      = Website ist live

-- Onboarding-Inhalte
CREATE TABLE onboarding_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Logo
  logo_url TEXT,
  logo_alt TEXT,
  
  -- Texte
  about_text TEXT,
  welcome_text TEXT,
  slogan TEXT,
  
  -- Kontakt
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  
  -- Öffnungszeiten (JSON)
  opening_hours JSONB DEFAULT '{}',
  
  -- Social Media
  social_links JSONB DEFAULT '{}',
  
  -- Zusätzliche Angaben
  services TEXT[],              -- Liste der Dienstleistungen
  team_members JSONB DEFAULT '[]',  -- Team-Mitglieder
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding-Bilder
CREATE TABLE onboarding_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(50),
  
  category VARCHAR(50),  -- 'logo', 'gallery', 'team', 'header'
  alt_text TEXT,
  description TEXT,
  
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes
CREATE INDEX idx_customers_number ON customers(customer_number);
CREATE INDEX idx_onboarding_content_customer ON onboarding_content(customer_id);
CREATE INDEX idx_onboarding_images_customer ON onboarding_images(customer_id);
```

### 2.2 TypeScript-Interfaces

```typescript
// src/types/Onboarding.ts

export type OnboardingStatus = 
  | 'invited' 
  | 'in_progress' 
  | 'completed' 
  | 'processed' 
  | 'active';

export interface Customer {
  id: string;
  customerNumber: string;
  email: string;
  businessName: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  
  onboardingStatus: OnboardingStatus;
  onboardingStartedAt?: string;
  onboardingCompletedAt?: string;
  
  websiteId?: string;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
}

export interface OnboardingContent {
  id: string;
  customerId: string;
  
  logoUrl?: string;
  logoAlt?: string;
  
  aboutText?: string;
  welcomeText?: string;
  slogan?: string;
  
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  
  openingHours: OpeningHours;
  socialLinks: SocialLinks;
  
  services: string[];
  teamMembers: TeamMember[];
  
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingImage {
  id: string;
  customerId: string;
  
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  
  category: 'logo' | 'gallery' | 'team' | 'header';
  altText?: string;
  description?: string;
  
  orderIndex: number;
  createdAt: string;
}
```

---

## 3. Kundenportal

### 3.1 Login-Seite

```tsx
// src/pages/onboarding/OnboardingLogin.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, AlertCircle } from 'lucide-react';

export const OnboardingLogin: React.FC = () => {
  const [customerNumber, setCustomerNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Prüfen ob Kundennummer existiert
      const { data, error: dbError } = await supabase
        .from('customers')
        .select('id, customer_number, business_name, onboarding_status')
        .eq('customer_number', customerNumber.toUpperCase())
        .single();

      if (dbError || !data) {
        setError('Ungültige Kundennummer. Bitte überprüfen Sie Ihre Eingabe.');
        return;
      }

      // Status prüfen
      if (data.onboarding_status === 'active') {
        setError('Ihre Website ist bereits aktiv. Bitte nutzen Sie den Admin-Bereich.');
        return;
      }

      // In Session speichern
      sessionStorage.setItem('onboarding_customer_id', data.id);
      sessionStorage.setItem('onboarding_customer_number', data.customer_number);
      
      // Weiterleiten
      navigate('/onboarding/portal');
      
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Willkommen zum Onboarding
          </h1>
          <p className="text-gray-600 mt-2">
            Geben Sie Ihre Kundennummer ein, um zu beginnen
          </p>
        </div>

        {/* Login-Formular */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="customerNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kundennummer
              </label>
              <input
                id="customerNumber"
                type="text"
                value={customerNumber}
                onChange={(e) => {
                  // Nur Zahlen und Buchstaben, max 6 Zeichen
                  const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                  if (value.length <= 6) {
                    setCustomerNumber(value);
                  }
                }}
                placeholder="Z.B. ABC123"
                className="w-full px-4 py-3 text-2xl text-center tracking-widest font-mono border-2 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition"
                maxLength={6}
                autoComplete="off"
                required
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Die Kundennummer finden Sie in der E-Mail von uns
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={customerNumber.length !== 6 || isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Weiter
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Noch keine Kundennummer?{' '}
          <a href="/kontakt" className="text-rose-600 hover:underline">
            Kontaktieren Sie uns
          </a>
        </p>
      </div>
    </div>
  );
};
```

### 3.2 Onboarding-Portal (Hauptansicht)

```tsx
// src/pages/onboarding/OnboardingPortal.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Circle, Image, FileText, Clock, 
  Users, Mail, ArrowRight, Upload
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
  component: React.ReactNode;
}

export const OnboardingPortal: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [content, setContent] = useState<OnboardingContent | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    const customerId = sessionStorage.getItem('onboarding_customer_id');
    if (!customerId) {
      navigate('/onboarding');
      return;
    }

    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerData) {
      setCustomer(customerData);
      
      // Onboarding-Status aktualisieren
      if (customerData.onboarding_status === 'invited') {
        await supabase
          .from('customers')
          .update({ 
            onboarding_status: 'in_progress',
            onboarding_started_at: new Date().toISOString()
          })
          .eq('id', customerId);
      }
    }

    // Bestehende Inhalte laden oder erstellen
    let { data: contentData } = await supabase
      .from('onboarding_content')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (!contentData) {
      const { data: newContent } = await supabase
        .from('onboarding_content')
        .insert({ customer_id: customerId })
        .select()
        .single();
      contentData = newContent;
    }

    setContent(contentData);
    setIsLoading(false);
  };

  const steps: Step[] = [
    {
      id: 'logo',
      title: 'Logo hochladen',
      description: 'Ihr Firmenlogo für die Website',
      icon: <Image className="w-5 h-5" />,
      isComplete: !!content?.logoUrl,
      component: <LogoUploadStep content={content} onUpdate={handleContentUpdate} />
    },
    {
      id: 'texts',
      title: 'Texte eingeben',
      description: 'Über uns, Willkommenstext, Slogan',
      icon: <FileText className="w-5 h-5" />,
      isComplete: !!(content?.aboutText && content?.welcomeText),
      component: <TextsStep content={content} onUpdate={handleContentUpdate} />
    },
    {
      id: 'images',
      title: 'Bilder hochladen',
      description: 'Fotos für Galerie und Header',
      icon: <Upload className="w-5 h-5" />,
      isComplete: false, // Wird separat geprüft
      component: <ImagesUploadStep customerId={customer?.id} />
    },
    {
      id: 'hours',
      title: 'Öffnungszeiten',
      description: 'Wann ist Ihr Geschäft geöffnet?',
      icon: <Clock className="w-5 h-5" />,
      isComplete: content?.openingHours && Object.keys(content.openingHours).length > 0,
      component: <OpeningHoursStep content={content} onUpdate={handleContentUpdate} />
    },
    {
      id: 'team',
      title: 'Team vorstellen',
      description: 'Optional: Ihre Mitarbeiter',
      icon: <Users className="w-5 h-5" />,
      isComplete: true, // Optional
      component: <TeamStep content={content} onUpdate={handleContentUpdate} />
    },
    {
      id: 'contact',
      title: 'Kontaktdaten',
      description: 'E-Mail, Telefon, Adresse',
      icon: <Mail className="w-5 h-5" />,
      isComplete: !!(content?.contactEmail && content?.contactPhone),
      component: <ContactStep content={content} onUpdate={handleContentUpdate} />
    }
  ];

  const handleContentUpdate = async (updates: Partial<OnboardingContent>) => {
    const { data } = await supabase
      .from('onboarding_content')
      .update(updates)
      .eq('customer_id', customer?.id)
      .select()
      .single();
    
    if (data) setContent(data);
  };

  const handleComplete = async () => {
    await supabase
      .from('customers')
      .update({ 
        onboarding_status: 'completed',
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', customer?.id);

    // TODO: Benachrichtigung an SuperAdmin senden

    navigate('/onboarding/success');
  };

  if (isLoading) {
    return <OnboardingLoader />;
  }

  const completedSteps = steps.filter(s => s.isComplete).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{customer?.businessName}</h1>
            <p className="text-sm text-gray-500">
              Kundennummer: {customer?.customerNumber}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Fortschritt</div>
            <div className="text-2xl font-bold text-rose-500">{progress}%</div>
          </div>
        </div>
        
        {/* Fortschrittsbalken */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar mit Schritten */}
          <nav className="w-72 flex-shrink-0">
            <ul className="space-y-2">
              {steps.map((step, index) => (
                <li key={step.id}>
                  <button
                    onClick={() => setActiveStep(index)}
                    className={`
                      w-full flex items-start gap-3 p-3 rounded-xl text-left transition
                      ${activeStep === index 
                        ? 'bg-rose-50 border-2 border-rose-200' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${step.isComplete 
                        ? 'bg-green-100 text-green-600' 
                        : activeStep === index 
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {step.isComplete ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${
                        activeStep === index ? 'text-rose-600' : ''
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {step.description}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Abschließen-Button */}
            {completedSteps >= 4 && ( // Mindestens Logo, Texte, Öffnungszeiten, Kontakt
              <button
                onClick={handleComplete}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition"
              >
                Onboarding abschließen
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </nav>

          {/* Hauptinhalt */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              {steps[activeStep].component}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
```

### 3.3 Einzelne Schritte

```tsx
// src/pages/onboarding/steps/LogoUploadStep.tsx

import React, { useState } from 'react';
import { Upload, X, Image } from 'lucide-react';

export const LogoUploadStep: React.FC<StepProps> = ({ content, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    
    // Upload zu Supabase Storage
    const fileName = `logos/${content.customerId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from('onboarding')
      .upload(fileName, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('onboarding')
        .getPublicUrl(fileName);
      
      await onUpdate({ logoUrl: publicUrl });
    }
    
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Ihr Logo hochladen</h2>
        <p className="text-gray-600 mt-1">
          Das Logo erscheint im Header Ihrer Website und als Favicon.
        </p>
      </div>

      {content?.logoUrl ? (
        <div className="relative inline-block">
          <img 
            src={content.logoUrl} 
            alt="Ihr Logo"
            className="max-w-xs max-h-32 object-contain border rounded-lg"
          />
          <button
            onClick={() => onUpdate({ logoUrl: null })}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-rose-400 hover:bg-rose-50 transition">
            {isUploading ? (
              <div className="animate-pulse">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <p>Wird hochgeladen...</p>
              </div>
            ) : (
              <>
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">Klicken Sie hier oder ziehen Sie Ihr Logo hierher</p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG oder JPG, max. 2MB
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
      )}

      {/* Tipps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800">💡 Tipps für das perfekte Logo</h4>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• PNG-Format mit transparentem Hintergrund empfohlen</li>
          <li>• Mindestens 200px breit für gute Qualität</li>
          <li>• Gut lesbar auch in kleiner Größe</li>
        </ul>
      </div>

      {/* Alt-Text */}
      {content?.logoUrl && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Beschreibung (für Suchmaschinen)
          </label>
          <input
            type="text"
            value={content.logoAlt || ''}
            onChange={(e) => onUpdate({ logoAlt: e.target.value })}
            placeholder="z.B. Logo Friseursalon Beispiel"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
```

```tsx
// src/pages/onboarding/steps/TextsStep.tsx

export const TextsStep: React.FC<StepProps> = ({ content, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Texte für Ihre Website</h2>
        <p className="text-gray-600 mt-1">
          Erzählen Sie Ihren Besuchern von Ihrem Geschäft.
        </p>
      </div>

      {/* Slogan */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Slogan / Tagline
          <span className="text-gray-400 font-normal ml-2">(optional)</span>
        </label>
        <input
          type="text"
          value={content?.slogan || ''}
          onChange={(e) => onUpdate({ slogan: e.target.value })}
          placeholder="z.B. Ihr Friseur des Vertrauens seit 1995"
          className="w-full px-4 py-2 border rounded-lg"
          maxLength={100}
        />
        <p className="text-sm text-gray-500 mt-1">
          Ein kurzer Satz, der unter Ihrem Logo erscheint
        </p>
      </div>

      {/* Willkommenstext */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Willkommenstext (Startseite)
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={content?.welcomeText || ''}
          onChange={(e) => onUpdate({ welcomeText: e.target.value })}
          placeholder="z.B. Herzlich willkommen bei Friseursalon Beispiel! Seit über 25 Jahren sind wir Ihr kompetenter Partner für Haarschnitte, Colorationen und Styling..."
          className="w-full px-4 py-3 border rounded-lg resize-none h-32"
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {(content?.welcomeText?.length || 0)}/500 Zeichen
        </p>
      </div>

      {/* Über uns */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Über uns
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={content?.aboutText || ''}
          onChange={(e) => onUpdate({ aboutText: e.target.value })}
          placeholder="Erzählen Sie die Geschichte Ihres Unternehmens, Ihre Philosophie, was Sie besonders macht..."
          className="w-full px-4 py-3 border rounded-lg resize-none h-48"
          maxLength={1500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {(content?.aboutText?.length || 0)}/1500 Zeichen
        </p>
      </div>

      {/* Tipps */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800">✍️ Schreibtipps</h4>
        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
          <li>• Schreiben Sie persönlich und authentisch</li>
          <li>• Erwähnen Sie, was Sie besonders macht</li>
          <li>• Kurze Sätze sind leichter zu lesen</li>
          <li>• Nennen Sie konkrete Vorteile für Ihre Kunden</li>
        </ul>
      </div>
    </div>
  );
};
```

```tsx
// src/pages/onboarding/steps/OpeningHoursStep.tsx

const DAYS = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' },
];

export const OpeningHoursStep: React.FC<StepProps> = ({ content, onUpdate }) => {
  const hours = content?.openingHours || {};

  const updateDay = (day: string, updates: Partial<{ open: string; close: string; closed: boolean }>) => {
    onUpdate({
      openingHours: {
        ...hours,
        [day]: { ...hours[day], ...updates }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Öffnungszeiten</h2>
        <p className="text-gray-600 mt-1">
          Wann können Kunden Sie besuchen?
        </p>
      </div>

      <div className="space-y-3">
        {DAYS.map(day => {
          const dayData = hours[day.key] || { open: '09:00', close: '18:00', closed: false };
          
          return (
            <div 
              key={day.key}
              className={`
                flex items-center gap-4 p-3 rounded-lg border
                ${dayData.closed ? 'bg-gray-50' : ''}
              `}
            >
              <div className="w-28 font-medium">{day.label}</div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dayData.closed}
                  onChange={(e) => updateDay(day.key, { closed: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-sm text-gray-600">Geschlossen</span>
              </label>
              
              {!dayData.closed && (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="time"
                    value={dayData.open}
                    onChange={(e) => updateDay(day.key, { open: e.target.value })}
                    className="px-3 py-1.5 border rounded-lg text-sm"
                  />
                  <span className="text-gray-400">bis</span>
                  <input
                    type="time"
                    value={dayData.close}
                    onChange={(e) => updateDay(day.key, { close: e.target.value })}
                    className="px-3 py-1.5 border rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Zusatzinfos */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Zusätzliche Hinweise
          <span className="text-gray-400 font-normal ml-2">(optional)</span>
        </label>
        <textarea
          value={content?.openingHoursNote || ''}
          onChange={(e) => onUpdate({ openingHoursNote: e.target.value })}
          placeholder="z.B. An Feiertagen geschlossen, Termine nach Vereinbarung möglich"
          className="w-full px-4 py-2 border rounded-lg resize-none h-20"
        />
      </div>
    </div>
  );
};
```

---

## 4. SuperAdmin: Kunden anlegen

### 4.1 Kundennummer generieren

```typescript
// src/utils/customerNumber.ts

export function generateCustomerNumber(): string {
  // Format: 3 Buchstaben + 3 Zahlen (z.B. ABC123)
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Ohne I und O (Verwechslungsgefahr)
  const numbers = '0123456789';
  
  let result = '';
  
  // 3 Buchstaben
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 3 Zahlen
  for (let i = 0; i < 3; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return result;
}

export async function createUniqueCustomerNumber(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const number = generateCustomerNumber();
    
    // Prüfen ob bereits vergeben
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('customer_number', number)
      .single();
    
    if (!data) {
      return number;
    }
    
    attempts++;
  }
  
  throw new Error('Konnte keine eindeutige Kundennummer generieren');
}
```

### 4.2 Kunde-anlegen-Formular

```tsx
// src/pages/superadmin/CustomerCreate.tsx

import React, { useState } from 'react';
import { Plus, Send, Copy, Check } from 'lucide-react';

export const CustomerCreate: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    businessName: '',
    contactPerson: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const customerNumber = await createUniqueCustomerNumber();
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_number: customerNumber,
          email: formData.email,
          business_name: formData.businessName,
          contact_person: formData.contactPerson,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
          onboarding_status: 'invited'
        })
        .select()
        .single();

      if (error) throw error;
      
      setCreatedCustomer(data);
      
    } catch (err) {
      console.error('Fehler beim Erstellen:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!createdCustomer) return;
    
    // E-Mail mit Resend oder anderem Provider senden
    await fetch('/api/send-onboarding-email', {
      method: 'POST',
      body: JSON.stringify({
        email: createdCustomer.email,
        customerNumber: createdCustomer.customerNumber,
        businessName: createdCustomer.businessName
      })
    });
    
    // Status aktualisieren
    await supabase
      .from('customers')
      .update({ onboarding_email_sent_at: new Date().toISOString() })
      .eq('id', createdCustomer.id);
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(createdCustomer?.customerNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Neuen Kunden anlegen</h1>

      {!createdCustomer ? (
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Firmenname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                E-Mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ansprechpartner
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg resize-none h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg resize-none h-20"
              placeholder="Interne Notizen..."
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50"
          >
            {isCreating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            Kunde anlegen
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 text-green-700">
            <Check className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-lg">Kunde erfolgreich angelegt!</h2>
              <p>{createdCustomer.businessName}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <label className="block text-sm text-gray-500 mb-1">Kundennummer</label>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-bold tracking-widest">
                {createdCustomer.customerNumber}
              </span>
              <button
                onClick={copyNumber}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Send className="w-5 h-5" />
              Einladungs-E-Mail senden
            </button>
            <button
              onClick={() => {
                setCreatedCustomer(null);
                setFormData({
                  email: '',
                  businessName: '',
                  contactPerson: '',
                  phone: '',
                  address: '',
                  notes: ''
                });
              }}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Weiteren Kunden anlegen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 5. Inhalts-Uploads

### 5.1 Bilder-Upload-Schritt

```tsx
// src/pages/onboarding/steps/ImagesUploadStep.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, GripVertical, Check } from 'lucide-react';

interface ImageCategory {
  id: string;
  label: string;
  description: string;
  minCount: number;
  maxCount: number;
}

const IMAGE_CATEGORIES: ImageCategory[] = [
  {
    id: 'header',
    label: 'Header-Bild',
    description: 'Ein großes Bild für den Kopfbereich der Startseite',
    minCount: 1,
    maxCount: 1
  },
  {
    id: 'gallery',
    label: 'Galerie-Bilder',
    description: 'Bilder von Ihrem Salon, Ihrer Arbeit, etc.',
    minCount: 3,
    maxCount: 20
  },
  {
    id: 'team',
    label: 'Team-Fotos',
    description: 'Fotos Ihrer Mitarbeiter (optional)',
    minCount: 0,
    maxCount: 10
  }
];

export const ImagesUploadStep: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [images, setImages] = useState<OnboardingImage[]>([]);
  const [activeCategory, setActiveCategory] = useState('header');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const { data } = await supabase
      .from('onboarding_images')
      .select('*')
      .eq('customer_id', customerId)
      .order('category, order_index');
    
    if (data) setImages(data);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    for (const file of acceptedFiles) {
      const fileName = `${customerId}/${activeCategory}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('onboarding')
        .upload(fileName, file);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('onboarding')
          .getPublicUrl(fileName);
        
        await supabase
          .from('onboarding_images')
          .insert({
            customer_id: customerId,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            category: activeCategory,
            order_index: images.filter(i => i.category === activeCategory).length
          });
      }
    }
    
    await loadImages();
    setIsUploading(false);
  }, [customerId, activeCategory, images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const deleteImage = async (imageId: string, fileUrl: string) => {
    // Aus Storage löschen
    const path = fileUrl.split('/').slice(-3).join('/');
    await supabase.storage.from('onboarding').remove([path]);
    
    // Aus DB löschen
    await supabase.from('onboarding_images').delete().eq('id', imageId);
    
    setImages(images.filter(i => i.id !== imageId));
  };

  const currentCategory = IMAGE_CATEGORIES.find(c => c.id === activeCategory)!;
  const categoryImages = images.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Bilder hochladen</h2>
        <p className="text-gray-600 mt-1">
          Laden Sie Bilder für Ihre Website hoch
        </p>
      </div>

      {/* Kategorie-Tabs */}
      <div className="flex gap-2 border-b">
        {IMAGE_CATEGORIES.map(cat => {
          const count = images.filter(i => i.category === cat.id).length;
          const isComplete = count >= cat.minCount;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2 border-b-2 -mb-px transition
                ${activeCategory === cat.id 
                  ? 'border-rose-500 text-rose-600' 
                  : 'border-transparent hover:border-gray-300'
                }
              `}
            >
              {cat.label}
              <span className={`
                px-1.5 py-0.5 rounded text-xs
                ${isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100'}
              `}>
                {count}/{cat.minCount === 0 ? cat.maxCount : cat.minCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Upload-Bereich */}
      <div 
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
          ${isDragActive ? 'border-rose-400 bg-rose-50' : 'border-gray-300 hover:border-gray-400'}
          ${categoryImages.length >= currentCategory.maxCount ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="animate-pulse">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p>Wird hochgeladen...</p>
          </div>
        ) : categoryImages.length >= currentCategory.maxCount ? (
          <p className="text-gray-500">Maximale Anzahl erreicht</p>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">
              {isDragActive ? 'Hier ablegen...' : 'Bilder hierher ziehen'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              oder klicken zum Auswählen
            </p>
            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG, WebP • Max. 5MB pro Bild
            </p>
          </>
        )}
      </div>

      {/* Beschreibung */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">{currentCategory.description}</p>
        <p className="text-sm text-blue-600 mt-1">
          {currentCategory.minCount > 0 
            ? `Mindestens ${currentCategory.minCount} Bild(er) erforderlich`
            : 'Optional'
          }
        </p>
      </div>

      {/* Hochgeladene Bilder */}
      {categoryImages.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {categoryImages.map((image, index) => (
            <div 
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={image.fileUrl}
                alt={image.altText || ''}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  onClick={() => deleteImage(image.id, image.fileUrl)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Nummer */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 6. Onboarding-Status

### 6.1 Status-Übersicht für SuperAdmin

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Onboarding-Übersicht                             [+ Neuer Kunde]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Filter: [Alle ▼]  [_____________] 🔍                                  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Status │ Nummer │ Geschäft          │ Fortschritt │ Erstellt     │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 🟡     │ ABC123 │ Salon Beispiel    │ ████████░░ 80% │ vor 2 Std │ │
│  │        │        │                   │ [Details]      │            │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 🟢     │ XYZ789 │ Friseur Müller    │ ██████████ 100%│ vor 1 Tag │ │
│  │        │        │                   │ [Bearbeiten]   │            │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 🔵     │ DEF456 │ Hair & Style      │ ░░░░░░░░░░ 0%  │ vor 3 Tag │ │
│  │        │        │                   │ [Erinnerung]   │            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Legende: 🔵 Eingeladen  🟡 In Bearbeitung  🟢 Abgeschlossen           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Status-Komponente

```tsx
// src/components/superadmin/OnboardingStatusBadge.tsx

const STATUS_CONFIG: Record<OnboardingStatus, { label: string; color: string; icon: string }> = {
  invited: {
    label: 'Eingeladen',
    color: 'bg-blue-100 text-blue-700',
    icon: 'Mail'
  },
  in_progress: {
    label: 'In Bearbeitung',
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'Clock'
  },
  completed: {
    label: 'Abgeschlossen',
    color: 'bg-green-100 text-green-700',
    icon: 'Check'
  },
  processed: {
    label: 'Website erstellt',
    color: 'bg-purple-100 text-purple-700',
    icon: 'Globe'
  },
  active: {
    label: 'Aktiv',
    color: 'bg-emerald-100 text-emerald-700',
    icon: 'CheckCircle2'
  }
};

export const OnboardingStatusBadge: React.FC<{ status: OnboardingStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  const Icon = Icons[config.icon];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
};
```

---

## 7. E-Mail-Benachrichtigungen

### 7.1 Einladungs-E-Mail

```typescript
// src/emails/OnboardingInvitation.tsx

export const OnboardingInvitationEmail = ({
  businessName,
  customerNumber,
  portalUrl
}: {
  businessName: string;
  customerNumber: string;
  portalUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Willkommen bei BeautifulCMS</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #e11d48;">Willkommen bei BeautifulCMS!</h1>
  
  <p>Guten Tag,</p>
  
  <p>
    wir freuen uns, Sie als neuen Kunden begrüßen zu dürfen! 
    Um Ihre Website für <strong>${businessName}</strong> zu erstellen, 
    benötigen wir einige Informationen und Materialien von Ihnen.
  </p>
  
  <p>Ihre Kundennummer lautet:</p>
  
  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
    <span style="font-size: 32px; font-family: monospace; letter-spacing: 0.2em; font-weight: bold;">
      ${customerNumber}
    </span>
  </div>
  
  <p>
    <a href="${portalUrl}" 
       style="display: inline-block; background: #e11d48; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
      Zum Onboarding-Portal →
    </a>
  </p>
  
  <h3>Was wir von Ihnen benötigen:</h3>
  <ul>
    <li>Ihr Logo</li>
    <li>Texte über Ihr Unternehmen</li>
    <li>Bilder (Salon, Arbeit, Team)</li>
    <li>Öffnungszeiten</li>
    <li>Kontaktdaten</li>
  </ul>
  
  <p>
    Der gesamte Prozess dauert nur 10-15 Minuten. 
    Sie können jederzeit unterbrechen und später weitermachen.
  </p>
  
  <p>
    Bei Fragen stehen wir Ihnen gerne zur Verfügung!
  </p>
  
  <p>Mit freundlichen Grüßen,<br>Ihr BeautifulCMS-Team</p>
</body>
</html>
`;
```

### 7.2 Abschluss-Benachrichtigung

```typescript
// E-Mail an SuperAdmin wenn Kunde fertig ist

export const OnboardingCompletedEmail = ({
  customerNumber,
  businessName,
  adminUrl
}: {
  customerNumber: string;
  businessName: string;
  adminUrl: string;
}) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">Onboarding abgeschlossen!</h1>
  
  <p>
    Der Kunde <strong>${businessName}</strong> (${customerNumber}) 
    hat das Onboarding abgeschlossen.
  </p>
  
  <p>Hochgeladene Inhalte:</p>
  <ul>
    <li>✅ Logo</li>
    <li>✅ Texte</li>
    <li>✅ Bilder</li>
    <li>✅ Öffnungszeiten</li>
    <li>✅ Kontaktdaten</li>
  </ul>
  
  <p>
    <a href="${adminUrl}" 
       style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
      Inhalte prüfen →
    </a>
  </p>
</body>
</html>
`;
```

---

## Implementierungs-Checkliste

- [ ] Datenbank-Tabellen erstellen (customers, onboarding_content, onboarding_images)
- [ ] Kundennummer-Generator implementieren
- [ ] Login-Seite für Onboarding erstellen
- [ ] Onboarding-Portal mit allen Schritten erstellen
- [ ] Logo-Upload implementieren
- [ ] Texte-Eingabe implementieren
- [ ] Bilder-Upload mit Kategorien implementieren
- [ ] Öffnungszeiten-Editor implementieren
- [ ] Team-Eingabe implementieren
- [ ] Kontaktdaten-Eingabe implementieren
- [ ] SuperAdmin: Kunden-Verwaltung erstellen
- [ ] SuperAdmin: Status-Dashboard erstellen
- [ ] E-Mail-Templates erstellen
- [ ] E-Mail-Versand implementieren (Resend oder SMTP)
- [ ] Erfolgsseite nach Abschluss erstellen
