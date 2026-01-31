# BeautifulCMS - Barrierefreiheit (WCAG 2.1 AA)

## Übersicht

Dieses Dokument beschreibt die Umsetzung der Barrierefreiheit nach WCAG 2.1 Level AA für das CMS. Barrierefreiheit bedeutet, dass die Website auch von Menschen mit Behinderungen genutzt werden kann.

---

## Inhaltsverzeichnis

1. [WCAG 2.1 Grundlagen](#1-wcag-21-grundlagen)
2. [Farbkontraste](#2-farbkontraste)
3. [Tastaturnavigation](#3-tastaturnavigation)
4. [Screenreader-Unterstützung](#4-screenreader-unterstützung)
5. [Formulare](#5-formulare)
6. [Bilder und Medien](#6-bilder-und-medien)
7. [Responsive Design](#7-responsive-design)
8. [Implementierungsbeispiele](#8-implementierungsbeispiele)
9. [Testing-Checkliste](#9-testing-checkliste)

---

## 1. WCAG 2.1 Grundlagen

### 1.1 Die vier Prinzipien (POUR)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WCAG 2.1 PRINZIPIEN                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  P - PERCEIVABLE (Wahrnehmbar)                                         │
│      Informationen müssen für alle Sinne zugänglich sein               │
│      • Alt-Texte für Bilder                                            │
│      • Untertitel für Videos                                           │
│      • Ausreichende Kontraste                                          │
│                                                                         │
│  O - OPERABLE (Bedienbar)                                              │
│      Die Bedienung muss auf verschiedene Arten möglich sein            │
│      • Tastaturnavigation                                              │
│      • Keine Zeitlimits                                                │
│      • Keine blinkenden Inhalte                                        │
│                                                                         │
│  U - UNDERSTANDABLE (Verständlich)                                     │
│      Inhalte und Bedienung müssen verständlich sein                    │
│      • Klare Sprache                                                   │
│      • Konsistente Navigation                                          │
│      • Fehlerhinweise                                                  │
│                                                                         │
│  R - ROBUST (Robust)                                                   │
│      Inhalte müssen von verschiedenen Technologien lesbar sein         │
│      • Valides HTML                                                    │
│      • ARIA-Labels                                                     │
│      • Kompatibilität mit Hilfstechnologien                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Level AA Anforderungen

| Kriterium | Beschreibung | Priorität |
|-----------|--------------|-----------|
| 1.1.1 | Alt-Texte für alle Bilder | Hoch |
| 1.3.1 | Semantisches HTML | Hoch |
| 1.3.2 | Sinnvolle Reihenfolge | Mittel |
| 1.4.3 | Kontrast mind. 4.5:1 | Hoch |
| 1.4.4 | Text bis 200% zoombar | Mittel |
| 2.1.1 | Tastaturzugänglichkeit | Hoch |
| 2.1.2 | Keine Tastaturfallen | Hoch |
| 2.4.1 | Skip-Links | Hoch |
| 2.4.2 | Seitentitel | Mittel |
| 2.4.3 | Fokus-Reihenfolge | Hoch |
| 2.4.4 | Link-Zweck erkennbar | Mittel |
| 2.4.6 | Aussagekräftige Überschriften | Mittel |
| 2.4.7 | Sichtbarer Fokus | Hoch |
| 3.1.1 | Sprache der Seite | Mittel |
| 3.2.1 | Keine unerwarteten Änderungen | Mittel |
| 3.3.1 | Fehlererkennung | Hoch |
| 3.3.2 | Labels für Eingaben | Hoch |
| 4.1.1 | Fehlerfreies Parsing | Hoch |
| 4.1.2 | Name, Rolle, Wert | Hoch |

---

## 2. Farbkontraste

### 2.1 Anforderungen

```
WCAG 2.1 Level AA Kontrastanforderungen:

Text (normal):     mind. 4.5:1
Text (groß):       mind. 3:1
UI-Komponenten:    mind. 3:1
Nicht-Text:        mind. 3:1

"Großer Text" = 18pt (24px) normal ODER 14pt (18.5px) bold
```

### 2.2 Kontrastprüfer-Utility

```typescript
// src/utils/accessibility/contrast.ts

interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
}

/**
 * Berechnet die relative Luminanz einer Farbe
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(channel => {
    const sRGB = channel / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Berechnet das Kontrastverhältnis zwischen zwei Farben
 */
export function getContrastRatio(foreground: string, background: string): number {
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Prüft ob ein Farbkontrast WCAG-konform ist
 */
export function checkContrast(
  foreground: string, 
  background: string
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,      // Normaler Text
    passesAAA: ratio >= 7,       // AAA Level
    passesAALarge: ratio >= 3    // Großer Text / UI
  };
}

/**
 * Findet eine kontrastreichere Version einer Farbe
 */
export function adjustForContrast(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const current = getContrastRatio(foreground, background);
  if (current >= targetRatio) return foreground;
  
  const bgLum = getLuminance(background);
  const isLightBg = bgLum > 0.5;
  
  // Farbe schrittweise dunkler/heller machen
  let adjusted = foreground;
  let attempts = 0;
  
  while (getContrastRatio(adjusted, background) < targetRatio && attempts < 20) {
    const hsl = hexToHsl(adjusted);
    hsl.l = isLightBg 
      ? Math.max(0, hsl.l - 5)    // Dunkler machen
      : Math.min(100, hsl.l + 5); // Heller machen
    adjusted = hslToHex(hsl);
    attempts++;
  }
  
  return adjusted;
}

// Hilfsfunktionen
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
```

### 2.3 Kontrast-Warnung im Editor

```tsx
// src/components/admin/ContrastWarning.tsx

import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { checkContrast } from '@/utils/accessibility/contrast';

interface ContrastWarningProps {
  foreground: string;
  background: string;
  isLargeText?: boolean;
}

export const ContrastWarning: React.FC<ContrastWarningProps> = ({
  foreground,
  background,
  isLargeText = false
}) => {
  const result = checkContrast(foreground, background);
  const passes = isLargeText ? result.passesAALarge : result.passesAA;
  const required = isLargeText ? 3 : 4.5;

  return (
    <div className={`
      flex items-center gap-2 p-3 rounded-lg text-sm
      ${passes 
        ? 'bg-green-50 border border-green-200 text-green-700' 
        : 'bg-red-50 border border-red-200 text-red-700'
      }
    `}>
      {passes ? (
        <Check className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      )}
      
      <div>
        <span className="font-medium">
          Kontrast: {result.ratio}:1
        </span>
        {passes ? (
          <span> – WCAG AA ✓</span>
        ) : (
          <span> – Mindestens {required}:1 erforderlich</span>
        )}
      </div>
      
      {/* Vorschau */}
      <div className="ml-auto flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border"
          style={{ backgroundColor: background }}
        />
        <div 
          className="w-8 h-8 rounded border flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: background, color: foreground }}
        >
          Aa
        </div>
      </div>
    </div>
  );
};
```

### 2.4 Empfohlene Farbkombinationen

```typescript
// src/utils/accessibility/colorPalette.ts

// WCAG AA-konforme Farbkombinationen
export const ACCESSIBLE_COLOR_PAIRS = [
  // Text auf hellem Hintergrund
  { bg: '#FFFFFF', fg: '#1F2937', ratio: 16.09, use: 'Standard-Text' },
  { bg: '#FFFFFF', fg: '#374151', ratio: 10.69, use: 'Sekundär-Text' },
  { bg: '#FFFFFF', fg: '#E11D48', ratio: 4.63, use: 'Primärfarbe' },
  { bg: '#F9FAFB', fg: '#1F2937', ratio: 14.88, use: 'Text auf Grau' },
  
  // Text auf dunklem Hintergrund
  { bg: '#1F2937', fg: '#FFFFFF', ratio: 16.09, use: 'Weiß auf Dunkel' },
  { bg: '#1F2937', fg: '#F9FAFB', ratio: 14.88, use: 'Hell auf Dunkel' },
  { bg: '#E11D48', fg: '#FFFFFF', ratio: 4.63, use: 'Weiß auf Primär' },
  
  // Grautöne
  { bg: '#FFFFFF', fg: '#6B7280', ratio: 5.74, use: 'Placeholder-Text' },
  { bg: '#F3F4F6', fg: '#374151', ratio: 8.59, use: 'Text auf Hellgrau' },
];

// Warnung bei kritischen Kombinationen
export const CRITICAL_COMBINATIONS = [
  { bg: '#FFFFFF', fg: '#9CA3AF', ratio: 2.79, issue: 'Zu wenig Kontrast' },
  { bg: '#FFFFFF', fg: '#D1D5DB', ratio: 1.63, issue: 'Unlesbar' },
  { bg: '#F3F4F6', fg: '#E5E7EB', ratio: 1.15, issue: 'Kaum sichtbar' },
];
```

---

## 3. Tastaturnavigation

### 3.1 Grundprinzipien

```
Tastatur-Navigation muss ermöglichen:

TAB         → Zum nächsten fokussierbaren Element
SHIFT+TAB   → Zum vorherigen fokussierbaren Element
ENTER       → Element aktivieren / Button klicken
SPACE       → Checkbox togglen, Button klicken
ESC         → Modal/Dropdown schließen
PFEILTASTEN → In Listen/Menüs navigieren
HOME/END    → Zum ersten/letzten Element
```

### 3.2 Skip-Links

```tsx
// src/components/accessibility/SkipLinks.tsx

import React from 'react';

export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="
          absolute top-4 left-4 z-[100]
          px-4 py-2 bg-rose-500 text-white rounded-lg
          focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-rose-400
          transform -translate-y-full focus:translate-y-0
          transition-transform
        "
      >
        Zum Hauptinhalt springen
      </a>
      <a
        href="#main-navigation"
        className="
          absolute top-4 left-48 z-[100]
          px-4 py-2 bg-rose-500 text-white rounded-lg
          focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-rose-400
          transform -translate-y-full focus:translate-y-0
          transition-transform
        "
      >
        Zur Navigation springen
      </a>
    </div>
  );
};

// Verwendung im Layout:
// <SkipLinks />
// <header id="main-navigation">...</header>
// <main id="main-content">...</main>
```

### 3.3 Fokus-Management

```tsx
// src/hooks/useFocusTrap.ts

import { useEffect, useRef } from 'react';

/**
 * Hält den Fokus innerhalb eines Elements (z.B. Modal)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Aktuellen Fokus speichern
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Fokussierbare Elemente finden
    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      focusableSelector
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Erstes Element fokussieren
    firstElement?.focus();

    // Tab-Trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Fokus zurücksetzen
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

// Verwendung:
// const trapRef = useFocusTrap(isModalOpen);
// <div ref={trapRef}>...</div>
```

### 3.4 Sichtbarer Fokus-Indikator

```css
/* src/styles/accessibility.css */

/* Standard Fokus-Ring für alle fokussierbaren Elemente */
:focus-visible {
  outline: 2px solid #E11D48;
  outline-offset: 2px;
}

/* Fokus-Ring entfernen wenn nicht via Tastatur */
:focus:not(:focus-visible) {
  outline: none;
}

/* Spezielle Fokus-Styles für verschiedene Elemente */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #E11D48;
  outline-offset: 2px;
  border-radius: 4px;
}

input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: none;
  border-color: #E11D48;
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.2);
}

/* Kontrast-Modus Unterstützung */
@media (prefers-contrast: high) {
  :focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 2px;
  }
}
```

---

## 4. Screenreader-Unterstützung

### 4.1 Semantisches HTML

```tsx
// FALSCH: Divs als Buttons
<div onClick={handleClick} className="button">Klicken</div>

// RICHTIG: Echte Buttons
<button onClick={handleClick} type="button">Klicken</button>

// FALSCH: Keine Struktur
<div className="header">Logo</div>
<div className="nav">Menu</div>
<div className="content">Text</div>

// RICHTIG: Semantische Elemente
<header>Logo</header>
<nav aria-label="Hauptnavigation">Menu</nav>
<main>Text</main>

// FALSCH: Liste als Divs
<div className="list">
  <div className="item">Eins</div>
  <div className="item">Zwei</div>
</div>

// RICHTIG: Echte Listen
<ul>
  <li>Eins</li>
  <li>Zwei</li>
</ul>
```

### 4.2 ARIA-Attribute

```tsx
// src/components/accessibility/AriaExamples.tsx

// Beispiel 1: Button mit Icon (ohne sichtbaren Text)
<button 
  aria-label="Menü öffnen"
  aria-expanded={isOpen}
>
  <MenuIcon aria-hidden="true" />
</button>

// Beispiel 2: Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Bestätigung</h2>
  <p id="modal-description">Möchten Sie fortfahren?</p>
</div>

// Beispiel 3: Tabs
<div role="tablist" aria-label="Produktdetails">
  <button 
    role="tab" 
    aria-selected={activeTab === 0}
    aria-controls="panel-0"
    id="tab-0"
  >
    Beschreibung
  </button>
  <button 
    role="tab" 
    aria-selected={activeTab === 1}
    aria-controls="panel-1"
    id="tab-1"
  >
    Bewertungen
  </button>
</div>
<div 
  role="tabpanel" 
  id="panel-0" 
  aria-labelledby="tab-0"
  hidden={activeTab !== 0}
>
  Inhalt...
</div>

// Beispiel 4: Live-Region für Updates
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  {saveStatus === 'saving' && 'Wird gespeichert...'}
  {saveStatus === 'saved' && 'Gespeichert!'}
</div>

// Beispiel 5: Navigation mit aktueller Seite
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Start</a></li>
    <li><a href="/produkte">Produkte</a></li>
    <li><a href="/produkte/schere" aria-current="page">Schere</a></li>
  </ol>
</nav>

// Beispiel 6: Formular mit Fehler
<div>
  <label htmlFor="email">E-Mail</label>
  <input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? 'email-error' : undefined}
  />
  {hasError && (
    <span id="email-error" role="alert">
      Bitte geben Sie eine gültige E-Mail-Adresse ein
    </span>
  )}
</div>
```

### 4.3 Versteckter, aber zugänglicher Inhalt

```tsx
// src/components/accessibility/VisuallyHidden.tsx

import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Versteckt Inhalt visuell, bleibt aber für Screenreader zugänglich
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ 
  children, 
  as: Component = 'span' 
}) => {
  return (
    <Component
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}
    >
      {children}
    </Component>
  );
};

// Verwendung:
<button>
  <TrashIcon aria-hidden="true" />
  <VisuallyHidden>Element löschen</VisuallyHidden>
</button>

// Oder als Tailwind-Klasse:
<span className="sr-only">Nur für Screenreader</span>
```

### 4.4 Überschriften-Hierarchie

```
WCAG erfordert eine logische Überschriftenstruktur:

<h1> Seitentitel (nur einmal pro Seite)
  <h2> Hauptabschnitt 1
    <h3> Unterabschnitt 1.1
    <h3> Unterabschnitt 1.2
  <h2> Hauptabschnitt 2
    <h3> Unterabschnitt 2.1
      <h4> Detail 2.1.1

KEINE Ebenen überspringen! (h1 → h3 ist falsch)
```

```tsx
// Automatische Überschriften-Ebene basierend auf Kontext
// src/components/accessibility/HeadingLevel.tsx

import React, { createContext, useContext } from 'react';

const HeadingLevelContext = createContext(1);

export const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const level = useContext(HeadingLevelContext);
  return (
    <HeadingLevelContext.Provider value={Math.min(level + 1, 6)}>
      <section>{children}</section>
    </HeadingLevelContext.Provider>
  );
};

export const Heading: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  const level = useContext(HeadingLevelContext);
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return <Tag className={className}>{children}</Tag>;
};

// Verwendung:
<Section>
  <Heading>H2 automatisch</Heading>
  <Section>
    <Heading>H3 automatisch</Heading>
  </Section>
</Section>
```

---

## 5. Formulare

### 5.1 Zugängliches Formular-Beispiel

```tsx
// src/components/accessibility/AccessibleForm.tsx

import React, { useState } from 'react';

export const AccessibleContactForm: React.FC = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validierung...
  };

  return (
    <form 
      onSubmit={handleSubmit}
      noValidate
      aria-label="Kontaktformular"
    >
      {/* Erfolgs-/Fehlermeldung am Anfang */}
      {submitted && (
        <div 
          role="alert" 
          className="p-4 mb-6 bg-green-100 text-green-700 rounded-lg"
        >
          Vielen Dank! Ihre Nachricht wurde gesendet.
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div 
          role="alert" 
          className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg"
        >
          <p className="font-medium">
            Bitte korrigieren Sie folgende Fehler:
          </p>
          <ul className="list-disc list-inside mt-2">
            {Object.values(errors).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label 
          htmlFor="name" 
          className="block font-medium mb-1"
        >
          Name <span aria-hidden="true" className="text-red-500">*</span>
          <span className="sr-only">(Pflichtfeld)</span>
        </label>
        <input
          id="name"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : 'name-hint'}
          className={`
            w-full px-4 py-2 border rounded-lg
            ${errors.name ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-rose-500
          `}
        />
        <p id="name-hint" className="text-sm text-gray-500 mt-1">
          Ihr vollständiger Name
        </p>
        {errors.name && (
          <p id="name-error" role="alert" className="text-sm text-red-500 mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* E-Mail */}
      <div className="mb-4">
        <label htmlFor="email" className="block font-medium mb-1">
          E-Mail <span aria-hidden="true" className="text-red-500">*</span>
          <span className="sr-only">(Pflichtfeld)</span>
        </label>
        <input
          id="email"
          type="email"
          required
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`
            w-full px-4 py-2 border rounded-lg
            ${errors.email ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-rose-500
          `}
          autoComplete="email"
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-red-500 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Betreff (Select) */}
      <div className="mb-4">
        <label htmlFor="subject" className="block font-medium mb-1">
          Betreff
        </label>
        <select
          id="subject"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">Bitte wählen...</option>
          <option value="anfrage">Allgemeine Anfrage</option>
          <option value="termin">Terminanfrage</option>
          <option value="feedback">Feedback</option>
        </select>
      </div>

      {/* Nachricht (Textarea) */}
      <div className="mb-4">
        <label htmlFor="message" className="block font-medium mb-1">
          Nachricht <span aria-hidden="true" className="text-red-500">*</span>
          <span className="sr-only">(Pflichtfeld)</span>
        </label>
        <textarea
          id="message"
          required
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : 'message-counter'}
          rows={5}
          maxLength={1000}
          className={`
            w-full px-4 py-2 border rounded-lg resize-none
            ${errors.message ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-rose-500
          `}
        />
        <p id="message-counter" className="text-sm text-gray-500 mt-1">
          0/1000 Zeichen
        </p>
        {errors.message && (
          <p id="message-error" role="alert" className="text-sm text-red-500 mt-1">
            {errors.message}
          </p>
        )}
      </div>

      {/* Checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            aria-required="true"
            className="mt-1 w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
          <span className="text-sm">
            Ich habe die <a href="/datenschutz" className="text-rose-600 hover:underline">Datenschutzerklärung</a> gelesen 
            und akzeptiere diese. <span aria-hidden="true" className="text-red-500">*</span>
            <span className="sr-only">(Pflichtfeld)</span>
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
      >
        Nachricht senden
      </button>

      <p className="text-sm text-gray-500 mt-4">
        <span aria-hidden="true">*</span> Pflichtfelder
      </p>
    </form>
  );
};
```

---

## 6. Bilder und Medien

### 6.1 Alt-Text-Richtlinien

```typescript
// src/utils/accessibility/altText.ts

/**
 * Richtlinien für gute Alt-Texte
 */
export const ALT_TEXT_GUIDELINES = {
  // Beschreibende Alt-Texte für informative Bilder
  informative: {
    good: [
      'Friseurmeisterin Maria schneidet einer Kundin die Haare',
      'Moderner Friseursalon mit hellen Holzmöbeln und großen Spiegeln',
      'Vorher-Nachher: Balayage-Färbung in Kupfertönen'
    ],
    bad: [
      'Bild',
      'IMG_1234.jpg',
      'Foto',
      'Friseur'
    ]
  },
  
  // Dekorative Bilder: leerer alt=""
  decorative: {
    use: 'alt=""',
    examples: [
      'Hintergrundmuster',
      'Trennlinie',
      'Dekorative Grafik neben Text'
    ]
  },
  
  // Funktionale Bilder (z.B. Links)
  functional: {
    good: [
      'Zur Startseite',
      'Facebook-Seite öffnen',
      'Galerie öffnen'
    ],
    bad: [
      'Logo',
      'Icon',
      'Facebook'
    ]
  }
};

/**
 * Prüft Alt-Text auf typische Probleme
 */
export function validateAltText(alt: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!alt || alt.trim() === '') {
    issues.push('Alt-Text fehlt');
  }
  
  if (alt && alt.length < 5) {
    issues.push('Alt-Text zu kurz (mindestens 5 Zeichen)');
  }
  
  if (alt && alt.length > 125) {
    issues.push('Alt-Text zu lang (maximal 125 Zeichen empfohlen)');
  }
  
  const badPatterns = [
    /^bild/i,
    /^image/i,
    /^foto/i,
    /^img/i,
    /\.jpg$/i,
    /\.png$/i,
    /\.webp$/i
  ];
  
  if (badPatterns.some(p => p.test(alt))) {
    issues.push('Alt-Text nicht beschreibend genug');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
```

### 6.2 Responsive Images

```tsx
// src/components/accessibility/AccessibleImage.tsx

import React from 'react';

interface AccessibleImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  loading = 'lazy',
  className
}) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      loading={loading}
      decoding="async"
      className={className}
      // Verhindert Layout-Shift
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  );
};

// Für Bilder mit Bildunterschrift
export const Figure: React.FC<{
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}> = ({ src, alt, caption, width, height }) => {
  return (
    <figure>
      <AccessibleImage
        src={src}
        alt={alt}
        width={width}
        height={height}
      />
      <figcaption className="text-sm text-gray-600 mt-2 text-center">
        {caption}
      </figcaption>
    </figure>
  );
};
```

### 6.3 Video-Accessibility

```tsx
// src/components/accessibility/AccessibleVideo.tsx

import React from 'react';

interface AccessibleVideoProps {
  src: string;
  poster?: string;
  captions?: {
    src: string;
    lang: string;
    label: string;
  }[];
  transcript?: string;
}

export const AccessibleVideo: React.FC<AccessibleVideoProps> = ({
  src,
  poster,
  captions = [],
  transcript
}) => {
  return (
    <div>
      <video
        src={src}
        poster={poster}
        controls
        preload="metadata"
        className="w-full rounded-lg"
      >
        {/* Untertitel */}
        {captions.map(cap => (
          <track
            key={cap.lang}
            kind="captions"
            src={cap.src}
            srcLang={cap.lang}
            label={cap.label}
          />
        ))}
        
        {/* Fallback */}
        <p>
          Ihr Browser unterstützt keine Videos.{' '}
          <a href={src}>Video herunterladen</a>
        </p>
      </video>
      
      {/* Transkript */}
      {transcript && (
        <details className="mt-4">
          <summary className="cursor-pointer text-rose-600 hover:underline">
            Transkript anzeigen
          </summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
            {transcript}
          </div>
        </details>
      )}
    </div>
  );
};
```

---

## 7. Responsive Design

### 7.1 Touch-Targets

```css
/* Mindestgröße für Touch-Targets: 44x44px */

button,
a,
input[type="checkbox"],
input[type="radio"],
.interactive {
  min-width: 44px;
  min-height: 44px;
}

/* Abstand zwischen Touch-Targets */
.touch-list > * + * {
  margin-top: 8px;
}
```

### 7.2 Zoom-Unterstützung

```css
/* Text muss bis 200% zoombar sein ohne Funktionsverlust */

html {
  /* Verhindert Zoom-Blockierung auf Mobile */
  -webkit-text-size-adjust: 100%;
}

/* Relative Einheiten für Schriftgrößen */
body {
  font-size: 1rem; /* 16px Basis */
}

h1 { font-size: 2rem; }    /* 32px */
h2 { font-size: 1.5rem; }  /* 24px */
h3 { font-size: 1.25rem; } /* 20px */
p { font-size: 1rem; }     /* 16px */
small { font-size: 0.875rem; } /* 14px */

/* Container mit max-width statt fester Breite */
.container {
  max-width: 1200px;
  width: 100%;
  padding: 0 1rem;
}
```

### 7.3 Orientation

```css
/* Unterstützung für verschiedene Orientierungen */
@media (orientation: landscape) {
  .hero {
    min-height: 70vh;
  }
}

@media (orientation: portrait) {
  .hero {
    min-height: 50vh;
  }
}

/* Keine Einschränkung der Orientierung erzwingen */
```

---

## 8. Implementierungsbeispiele

### 8.1 Zugängliche Dropdown-Komponente

```tsx
// src/components/accessibility/AccessibleDropdown.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface AccessibleDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  id: string;
}

export const AccessibleDropdown: React.FC<AccessibleDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${id}-listbox`;

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedIndex = options.findIndex(o => o.value === value);
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, options, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          buttonRef.current?.focus();
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  return (
    <div className="relative">
      <label id={`${id}-label`} className="block text-sm font-medium mb-1">
        {label}
      </label>
      
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label ${id}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
      >
        <span>{selectedOption?.label || 'Bitte wählen...'}</span>
        <ChevronDown 
          className={`w-5 h-5 transition ${isOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={`${id}-label`}
          aria-activedescendant={
            focusedIndex >= 0 ? `${id}-option-${focusedIndex}` : undefined
          }
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
              className={`
                px-4 py-2 cursor-pointer
                ${option.value === value ? 'bg-rose-50 text-rose-700' : ''}
                ${focusedIndex === index ? 'bg-gray-100' : ''}
                hover:bg-gray-50
              `}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 8.2 Zugängliche Accordion-Komponente

```tsx
// src/components/accessibility/AccessibleAccordion.tsx

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccessibleAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export const AccessibleAccordion: React.FC<AccessibleAccordionProps> = ({
  items,
  allowMultiple = false
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % items.length;
        document.getElementById(`accordion-${items[nextIndex].id}`)?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + items.length) % items.length;
        document.getElementById(`accordion-${items[prevIndex].id}`)?.focus();
        break;
      case 'Home':
        e.preventDefault();
        document.getElementById(`accordion-${items[0].id}`)?.focus();
        break;
      case 'End':
        e.preventDefault();
        document.getElementById(`accordion-${items[items.length - 1].id}`)?.focus();
        break;
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isExpanded = expandedItems.has(item.id);
        
        return (
          <div key={item.id} className="border rounded-lg overflow-hidden">
            <h3>
              <button
                id={`accordion-${item.id}`}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`panel-${item.id}`}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500"
              >
                {item.title}
                <ChevronDown 
                  className={`w-5 h-5 transition ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-${item.id}`}
              hidden={!isExpanded}
              className="border-t"
            >
              <div className="p-4">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

---

## 9. Testing-Checkliste

### 9.1 Manuelle Tests

```markdown
## WCAG 2.1 AA Testing-Checkliste

### Tastaturnavigation
- [ ] Alle interaktiven Elemente per Tab erreichbar
- [ ] Fokus-Reihenfolge ist logisch
- [ ] Sichtbarer Fokus-Indikator
- [ ] Keine Tastaturfallen (ESC schließt Modals)
- [ ] Skip-Links funktionieren

### Screenreader (NVDA/VoiceOver)
- [ ] Seitentitel wird vorgelesen
- [ ] Überschriften-Hierarchie korrekt
- [ ] Alt-Texte für alle Bilder
- [ ] Formular-Labels verknüpft
- [ ] Fehlermeldungen werden vorgelesen
- [ ] Live-Regions funktionieren

### Farbkontraste
- [ ] Text: mind. 4.5:1
- [ ] Großer Text: mind. 3:1
- [ ] UI-Komponenten: mind. 3:1
- [ ] Keine Information nur durch Farbe

### Zoom
- [ ] Website bis 200% zoombar
- [ ] Kein horizontales Scrollen bei 320px Breite
- [ ] Text nicht abgeschnitten

### Formulare
- [ ] Alle Felder haben Labels
- [ ] Pflichtfelder gekennzeichnet
- [ ] Fehlermeldungen verständlich
- [ ] Erfolgsmeldungen vorhanden
```

### 9.2 Automatische Tests

```typescript
// src/utils/accessibility/axeTest.ts

import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// In Tests:
describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 9.3 Tools

| Tool | Zweck | Link |
|------|-------|------|
| axe DevTools | Browser-Extension | [deque.com/axe](https://www.deque.com/axe/) |
| WAVE | Accessibility Checker | [wave.webaim.org](https://wave.webaim.org/) |
| Lighthouse | Performance & A11y | Chrome DevTools |
| Contrast Checker | Farbkontraste | [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) |
| NVDA | Screenreader (Windows) | [nvaccess.org](https://www.nvaccess.org/) |
| VoiceOver | Screenreader (macOS) | Eingebaut |

---

## Implementierungs-Checkliste

- [ ] Kontrastprüfer-Utility implementieren
- [ ] ContrastWarning-Komponente im Theme-Editor einbauen
- [ ] Skip-Links in Layout einbauen
- [ ] useFocusTrap Hook für Modals
- [ ] Fokus-Styles in CSS definieren
- [ ] VisuallyHidden-Komponente erstellen
- [ ] Alle Buttons mit aria-labels versehen
- [ ] Formular-Accessibility prüfen
- [ ] Alt-Text-Validator im Bild-Upload
- [ ] Tastatur-Navigation in allen Custom-Komponenten
- [ ] Automatische axe-Tests einrichten
- [ ] Manuelle Tests mit Screenreader durchführen
- [ ] Dokumentation für Content-Autoren erstellen
