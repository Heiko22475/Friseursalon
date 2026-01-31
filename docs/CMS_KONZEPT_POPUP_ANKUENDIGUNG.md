# BeautifulCMS - Popup & Ankündigungen

## Übersicht

Dieses Dokument beschreibt das Popup-System für Ankündigungen, Aktionen und wichtige Mitteilungen.

---

## Inhaltsverzeichnis

1. [Anwendungsfälle](#1-anwendungsfälle)
2. [Datenstruktur](#2-datenstruktur)
3. [Trigger-System](#3-trigger-system)
4. [Popup-Komponenten](#4-popup-komponenten)
5. [Editor](#5-editor)
6. [Frequenz-Steuerung](#6-frequenz-steuerung)
7. [Design-Optionen](#7-design-optionen)

---

## 1. Anwendungsfälle

### 1.1 Typische Einsatzszenarien

| Szenario | Beispiel | Trigger |
|----------|----------|---------|
| Willkommen | "Neu hier? 10% Rabatt auf den ersten Besuch!" | Nach 5 Sekunden |
| Urlaubsankündigung | "Wir sind vom 24.12. - 02.01. geschlossen" | Sofort |
| Newsletter | "Abonnieren Sie unseren Newsletter" | Beim Scrollen (50%) |
| Exit Intent | "Moment! Vergessen Sie nicht Ihren Termin!" | Beim Verlassen |
| Saisonale Aktion | "Sommerschnitt zum Sonderpreis" | Nach 3 Besuchen |
| Cookie-Hinweis | DSGVO Consent Banner | Sofort (separat) |

### 1.2 Popup-Typen

```
1. MODAL (Zentral)
   ┌─────────────────────────────────────────┐
   │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
   │░░░░░░┌─────────────────────────┐░░░░░░░░│
   │░░░░░░│                         │░░░░░░░░│
   │░░░░░░│       POPUP INHALT      │░░░░░░░░│
   │░░░░░░│                         │░░░░░░░░│
   │░░░░░░└─────────────────────────┘░░░░░░░░│
   │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
   └─────────────────────────────────────────┘
   → Mit Overlay, fokussiert Aufmerksamkeit

2. SLIDE-IN (Seitlich)
   ┌─────────────────────────────────────────┐
   │                              ┌─────────┐│
   │                              │ POPUP   ││
   │                              │ INHALT  ││
   │                              │         ││
   │                              └─────────┘│
   └─────────────────────────────────────────┘
   → Weniger aufdringlich

3. BANNER (Oben/Unten)
   ┌─────────────────────────────────────────┐
   │██████████████████████████████████████████│
   │█████████████ ANKÜNDIGUNG ████████████████│
   │██████████████████████████████████████████│
   │                                         │
   │           SEITENINHALT                   │
   │                                         │
   └─────────────────────────────────────────┘
   → Für wichtige, dringende Mitteilungen

4. TOAST (Ecke)
   ┌─────────────────────────────────────────┐
   │                                ┌───────┐│
   │                                │ Info  ││
   │                                └───────┘│
   │                                         │
   │           SEITENINHALT                   │
   │                                         │
   └─────────────────────────────────────────┘
   → Für dezente Hinweise
```

---

## 2. Datenstruktur

### 2.1 TypeScript-Interfaces

```typescript
// src/types/Popup.ts

export type PopupType = 'modal' | 'slideIn' | 'banner' | 'toast';
export type PopupPosition = 
  | 'center'          // Modal
  | 'left' | 'right'  // SlideIn
  | 'top' | 'bottom'  // Banner
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';  // Toast

export type TriggerType = 
  | 'immediate'       // Sofort anzeigen
  | 'delay'           // Nach X Sekunden
  | 'scroll'          // Nach X% Scroll
  | 'exit'            // Exit Intent
  | 'pageviews';      // Nach X Seitenaufrufen

export interface PopupTrigger {
  type: TriggerType;
  value?: number;      // Sekunden, Prozent oder Anzahl
}

export interface PopupSchedule {
  enabled: boolean;
  startDate?: string;  // ISO-Datum
  endDate?: string;    // ISO-Datum
  startTime?: string;  // "09:00"
  endTime?: string;    // "18:00"
  daysOfWeek?: number[]; // 0=So, 1=Mo, etc.
}

export interface PopupFrequency {
  type: 'always' | 'once' | 'session' | 'days';
  value?: number;       // Anzahl Tage bei 'days'
}

export interface PopupContent {
  headline?: string;
  text?: string;
  image?: {
    src: string;
    alt: string;
    position: 'top' | 'left' | 'right' | 'background';
  };
  cta?: {
    text: string;
    url?: string;
    action?: 'close' | 'link' | 'scroll';
  };
  secondaryCta?: {
    text: string;
    action: 'close' | 'remind-later';
  };
}

export interface PopupStyle {
  width?: 'sm' | 'md' | 'lg' | 'full';
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
  animation: 'fade' | 'slide' | 'scale' | 'bounce';
}

export interface Popup {
  id: string;
  name: string;              // Interner Name für Admin
  active: boolean;
  type: PopupType;
  position: PopupPosition;
  trigger: PopupTrigger;
  schedule: PopupSchedule;
  frequency: PopupFrequency;
  content: PopupContent;
  style: PopupStyle;
  
  // Statistiken
  stats?: {
    views: number;
    clicks: number;
    closedBy: number;
  };
}

// In WebsiteData
interface WebsiteData {
  // ...
  popups: Popup[];
}
```

### 2.2 Datenbank-Schema

```sql
-- Popup-Statistiken (optional für detaillierteres Tracking)
CREATE TABLE popup_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES websites(id),
  popup_id TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'view', 'click', 'close'
  visitor_id TEXT,       -- Anonyme Besucher-ID
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_popup_interactions_website 
ON popup_interactions(website_id, popup_id, created_at);
```

### 2.3 Beispiel-Popup

```json
{
  "id": "popup-1",
  "name": "Sommerschnitt Aktion",
  "active": true,
  "type": "modal",
  "position": "center",
  "trigger": {
    "type": "delay",
    "value": 5
  },
  "schedule": {
    "enabled": true,
    "startDate": "2024-06-01",
    "endDate": "2024-08-31"
  },
  "frequency": {
    "type": "days",
    "value": 7
  },
  "content": {
    "headline": "Sommerschnitt-Aktion! ☀️",
    "text": "Nur noch bis Ende August: Schnitt + Styling zum Sonderpreis!",
    "image": {
      "src": "/images/summer-special.jpg",
      "alt": "Sommer Frisur",
      "position": "top"
    },
    "cta": {
      "text": "Jetzt Termin buchen",
      "url": "/kontakt"
    },
    "secondaryCta": {
      "text": "Später erinnern",
      "action": "remind-later"
    }
  },
  "style": {
    "width": "md",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1F2937",
    "accentColor": "#F43F5E",
    "borderRadius": "lg",
    "overlay": {
      "enabled": true,
      "color": "#000000",
      "opacity": 0.5
    },
    "animation": "scale"
  }
}
```

---

## 3. Trigger-System

### 3.1 PopupTriggerManager

```typescript
// src/lib/PopupTriggerManager.ts

import { Popup, TriggerType } from '@/types/Popup';

type PopupCallback = (popup: Popup) => void;

export class PopupTriggerManager {
  private popups: Popup[];
  private triggeredPopups: Set<string> = new Set();
  private onTrigger: PopupCallback;

  constructor(popups: Popup[], onTrigger: PopupCallback) {
    this.popups = popups.filter(p => p.active && this.isInSchedule(p));
    this.onTrigger = onTrigger;
  }

  // Alle Trigger initialisieren
  public init() {
    this.popups.forEach(popup => {
      if (this.shouldShowByFrequency(popup)) {
        this.setupTrigger(popup);
      }
    });
  }

  // Cleanup bei Unmount
  public destroy() {
    // Event Listener entfernen, etc.
  }

  // Prüfen ob Popup im Zeitplan ist
  private isInSchedule(popup: Popup): boolean {
    const { schedule } = popup;
    if (!schedule.enabled) return true;

    const now = new Date();
    
    // Datums-Check
    if (schedule.startDate) {
      const start = new Date(schedule.startDate);
      if (now < start) return false;
    }
    if (schedule.endDate) {
      const end = new Date(schedule.endDate);
      end.setHours(23, 59, 59);
      if (now > end) return false;
    }

    // Wochentag-Check
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      const dayOfWeek = now.getDay();
      if (!schedule.daysOfWeek.includes(dayOfWeek)) return false;
    }

    // Uhrzeit-Check
    if (schedule.startTime && schedule.endTime) {
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime < schedule.startTime || currentTime > schedule.endTime) return false;
    }

    return true;
  }

  // Frequenz-Prüfung basierend auf LocalStorage
  private shouldShowByFrequency(popup: Popup): boolean {
    const { frequency } = popup;
    const storageKey = `popup_${popup.id}`;
    const lastShown = localStorage.getItem(storageKey);

    switch (frequency.type) {
      case 'always':
        return true;

      case 'once':
        return !lastShown;

      case 'session':
        return !sessionStorage.getItem(storageKey);

      case 'days':
        if (!lastShown) return true;
        const lastDate = new Date(parseInt(lastShown));
        const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= (frequency.value || 1);

      default:
        return true;
    }
  }

  // Trigger einrichten basierend auf Typ
  private setupTrigger(popup: Popup) {
    const { trigger } = popup;

    switch (trigger.type) {
      case 'immediate':
        this.triggerPopup(popup);
        break;

      case 'delay':
        setTimeout(() => {
          this.triggerPopup(popup);
        }, (trigger.value || 5) * 1000);
        break;

      case 'scroll':
        this.setupScrollTrigger(popup, trigger.value || 50);
        break;

      case 'exit':
        this.setupExitIntent(popup);
        break;

      case 'pageviews':
        this.checkPageviews(popup, trigger.value || 3);
        break;
    }
  }

  // Scroll-Trigger
  private setupScrollTrigger(popup: Popup, percentage: number) {
    const handler = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (scrolled >= percentage && !this.triggeredPopups.has(popup.id)) {
        this.triggerPopup(popup);
        window.removeEventListener('scroll', handler);
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
  }

  // Exit Intent (Mouse verlässt Fenster nach oben)
  private setupExitIntent(popup: Popup) {
    const handler = (e: MouseEvent) => {
      // Nur triggern wenn Maus nach oben aus dem Fenster geht
      if (e.clientY <= 0 && !this.triggeredPopups.has(popup.id)) {
        this.triggerPopup(popup);
        document.removeEventListener('mouseout', handler);
      }
    };

    document.addEventListener('mouseout', handler);
  }

  // Seitenaufrufe zählen
  private checkPageviews(popup: Popup, requiredViews: number) {
    const key = 'pageviews_count';
    const count = parseInt(sessionStorage.getItem(key) || '0') + 1;
    sessionStorage.setItem(key, count.toString());

    if (count >= requiredViews) {
      this.triggerPopup(popup);
    }
  }

  // Popup auslösen
  private triggerPopup(popup: Popup) {
    if (this.triggeredPopups.has(popup.id)) return;
    
    this.triggeredPopups.add(popup.id);
    this.markAsShown(popup);
    this.onTrigger(popup);
  }

  // Als gezeigt markieren
  private markAsShown(popup: Popup) {
    const storageKey = `popup_${popup.id}`;
    localStorage.setItem(storageKey, Date.now().toString());
    sessionStorage.setItem(storageKey, 'true');
  }
}
```

### 3.2 React Hook für Trigger

```typescript
// src/hooks/usePopupTrigger.ts

import { useEffect, useState, useCallback } from 'react';
import { Popup } from '@/types/Popup';
import { PopupTriggerManager } from '@/lib/PopupTriggerManager';

export function usePopupTrigger(popups: Popup[]) {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [queue, setQueue] = useState<Popup[]>([]);

  const handleTrigger = useCallback((popup: Popup) => {
    // Wenn bereits ein Popup angezeigt wird, in Queue
    if (activePopup) {
      setQueue(prev => [...prev, popup]);
    } else {
      setActivePopup(popup);
    }
  }, [activePopup]);

  const closePopup = useCallback(() => {
    setActivePopup(null);
    
    // Nächstes aus Queue anzeigen
    if (queue.length > 0) {
      setTimeout(() => {
        const [next, ...rest] = queue;
        setActivePopup(next);
        setQueue(rest);
      }, 500); // Kurze Pause zwischen Popups
    }
  }, [queue]);

  useEffect(() => {
    const manager = new PopupTriggerManager(popups, handleTrigger);
    manager.init();
    
    return () => manager.destroy();
  }, [popups, handleTrigger]);

  return { activePopup, closePopup };
}
```

---

## 4. Popup-Komponenten

### 4.1 Haupt-Popup-Komponente

```tsx
// src/components/website/Popup/Popup.tsx

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Popup as PopupType } from '@/types/Popup';
import { ModalPopup } from './ModalPopup';
import { SlideInPopup } from './SlideInPopup';
import { BannerPopup } from './BannerPopup';
import { ToastPopup } from './ToastPopup';

interface PopupProps {
  popup: PopupType;
  onClose: () => void;
  onCta?: () => void;
}

export const Popup: React.FC<PopupProps> = ({ popup, onClose, onCta }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ESC-Taste zum Schließen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Focus Trap für Modal
  useEffect(() => {
    if (popup.type === 'modal') {
      const focusable = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    }
  }, [popup.type]);

  // CTA-Handler
  const handleCta = () => {
    const { cta } = popup.content;
    if (!cta) return;

    switch (cta.action) {
      case 'close':
        onClose();
        break;
      case 'link':
        if (cta.url) {
          window.location.href = cta.url;
        }
        break;
      case 'scroll':
        // Scroll zu Sektion
        break;
    }
    
    onCta?.();
  };

  // "Später erinnern" Handler
  const handleRemindLater = () => {
    // Popup in 1 Stunde wieder anzeigen
    const remindKey = `popup_remind_${popup.id}`;
    localStorage.setItem(remindKey, (Date.now() + 60 * 60 * 1000).toString());
    onClose();
  };

  // Render basierend auf Typ
  const PopupComponent = {
    modal: ModalPopup,
    slideIn: SlideInPopup,
    banner: BannerPopup,
    toast: ToastPopup
  }[popup.type];

  return (
    <PopupComponent
      ref={containerRef}
      popup={popup}
      onClose={onClose}
      onCta={handleCta}
      onRemindLater={handleRemindLater}
    />
  );
};
```

### 4.2 Modal Popup

```tsx
// src/components/website/Popup/ModalPopup.tsx

import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { Popup } from '@/types/Popup';

interface ModalPopupProps {
  popup: Popup;
  onClose: () => void;
  onCta: () => void;
  onRemindLater: () => void;
}

const WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-4xl'
};

const RADIUS_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl'
};

const ANIMATIONS = {
  fade: 'animate-fadeIn',
  slide: 'animate-slideUp',
  scale: 'animate-scaleIn',
  bounce: 'animate-bounceIn'
};

export const ModalPopup = forwardRef<HTMLDivElement, ModalPopupProps>(
  ({ popup, onClose, onCta, onRemindLater }, ref) => {
    const { content, style } = popup;

    return (
      <>
        {/* Overlay */}
        {style.overlay?.enabled && (
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300"
            style={{
              backgroundColor: style.overlay.color,
              opacity: style.overlay.opacity
            }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Modal */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          className={`
            fixed z-50 w-full mx-4 
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            ${WIDTH_CLASSES[style.width || 'md']}
            ${RADIUS_CLASSES[style.borderRadius]}
            ${ANIMATIONS[style.animation]}
            overflow-hidden shadow-2xl
          `}
          style={{
            backgroundColor: style.backgroundColor,
            color: style.textColor
          }}
        >
          {/* Schließen-Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/10 transition z-10"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>

          {/* Bild oben */}
          {content.image?.position === 'top' && content.image.src && (
            <div className="w-full h-48 overflow-hidden">
              <img
                src={content.image.src}
                alt={content.image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Bild als Hintergrund */}
          {content.image?.position === 'background' && content.image.src && (
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${content.image.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.2
              }}
            />
          )}

          {/* Inhalt */}
          <div className={`
            relative z-10 p-6
            ${content.image?.position === 'left' ? 'flex gap-6' : ''}
            ${content.image?.position === 'right' ? 'flex flex-row-reverse gap-6' : ''}
          `}>
            {/* Bild links/rechts */}
            {(content.image?.position === 'left' || content.image?.position === 'right') && content.image.src && (
              <div className="w-1/3 flex-shrink-0">
                <img
                  src={content.image.src}
                  alt={content.image.alt}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex-1">
              {/* Headline */}
              {content.headline && (
                <h2 
                  id="popup-title"
                  className="text-2xl font-bold mb-3"
                >
                  {content.headline}
                </h2>
              )}

              {/* Text */}
              {content.text && (
                <p className="mb-6 opacity-80 whitespace-pre-line">
                  {content.text}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                {content.cta && (
                  <button
                    onClick={onCta}
                    className="px-6 py-3 font-medium rounded-lg transition hover:opacity-90"
                    style={{
                      backgroundColor: style.accentColor,
                      color: '#FFFFFF'
                    }}
                  >
                    {content.cta.text}
                  </button>
                )}

                {content.secondaryCta && (
                  <button
                    onClick={content.secondaryCta.action === 'remind-later' ? onRemindLater : onClose}
                    className="px-6 py-3 font-medium rounded-lg transition hover:bg-black/5"
                  >
                    {content.secondaryCta.text}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

ModalPopup.displayName = 'ModalPopup';
```

### 4.3 Banner Popup

```tsx
// src/components/website/Popup/BannerPopup.tsx

import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { Popup } from '@/types/Popup';

interface BannerPopupProps {
  popup: Popup;
  onClose: () => void;
  onCta: () => void;
  onRemindLater: () => void;
}

export const BannerPopup = forwardRef<HTMLDivElement, BannerPopupProps>(
  ({ popup, onClose, onCta }, ref) => {
    const { content, style, position } = popup;
    const isTop = position === 'top';

    return (
      <div
        ref={ref}
        role="alert"
        className={`
          fixed left-0 right-0 z-50
          ${isTop ? 'top-0 animate-slideDown' : 'bottom-0 animate-slideUp'}
          shadow-lg
        `}
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Inhalt */}
          <div className="flex-1 flex items-center gap-4">
            {content.headline && (
              <span className="font-bold">{content.headline}</span>
            )}
            {content.text && (
              <span className="opacity-80">{content.text}</span>
            )}
          </div>

          {/* CTA */}
          {content.cta && (
            <button
              onClick={onCta}
              className="px-4 py-2 font-medium rounded-lg whitespace-nowrap"
              style={{
                backgroundColor: style.accentColor,
                color: '#FFFFFF'
              }}
            >
              {content.cta.text}
            </button>
          )}

          {/* Schließen */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-full transition"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }
);

BannerPopup.displayName = 'BannerPopup';
```

### 4.4 Slide-In Popup

```tsx
// src/components/website/Popup/SlideInPopup.tsx

import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { Popup } from '@/types/Popup';

interface SlideInPopupProps {
  popup: Popup;
  onClose: () => void;
  onCta: () => void;
  onRemindLater: () => void;
}

export const SlideInPopup = forwardRef<HTMLDivElement, SlideInPopupProps>(
  ({ popup, onClose, onCta, onRemindLater }, ref) => {
    const { content, style, position } = popup;
    const isLeft = position === 'left';

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={`
          fixed bottom-4 z-50 w-80 max-w-[calc(100vw-2rem)]
          ${isLeft ? 'left-4 animate-slideInLeft' : 'right-4 animate-slideInRight'}
          shadow-2xl overflow-hidden
        `}
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          borderRadius: style.borderRadius === 'none' ? 0 : 
                        style.borderRadius === 'xl' ? 16 : 12
        }}
      >
        {/* Schließen */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full transition"
          aria-label="Schließen"
        >
          <X size={18} />
        </button>

        {/* Bild */}
        {content.image?.position === 'top' && content.image.src && (
          <div className="h-32 overflow-hidden">
            <img
              src={content.image.src}
              alt={content.image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Inhalt */}
        <div className="p-4">
          {content.headline && (
            <h3 className="font-bold mb-2">{content.headline}</h3>
          )}
          {content.text && (
            <p className="text-sm opacity-80 mb-4">{content.text}</p>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            {content.cta && (
              <button
                onClick={onCta}
                className="w-full px-4 py-2 font-medium rounded-lg"
                style={{
                  backgroundColor: style.accentColor,
                  color: '#FFFFFF'
                }}
              >
                {content.cta.text}
              </button>
            )}
            {content.secondaryCta && (
              <button
                onClick={content.secondaryCta.action === 'remind-later' ? onRemindLater : onClose}
                className="w-full px-4 py-2 text-sm hover:bg-black/5 rounded-lg"
              >
                {content.secondaryCta.text}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SlideInPopup.displayName = 'SlideInPopup';
```

### 4.5 Toast Popup

```tsx
// src/components/website/Popup/ToastPopup.tsx

import React, { forwardRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Popup } from '@/types/Popup';

interface ToastPopupProps {
  popup: Popup;
  onClose: () => void;
  onCta: () => void;
  onRemindLater: () => void;
}

const POSITION_CLASSES: Record<string, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4'
};

export const ToastPopup = forwardRef<HTMLDivElement, ToastPopupProps>(
  ({ popup, onClose, onCta }, ref) => {
    const { content, style, position } = popup;
    const [progress, setProgress] = useState(100);
    const autoDismissTime = 8000; // 8 Sekunden

    // Auto-Dismiss mit Progress-Bar
    useEffect(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev - (100 / (autoDismissTime / 100));
          if (next <= 0) {
            onClose();
            return 0;
          }
          return next;
        });
      }, 100);

      return () => clearInterval(interval);
    }, [onClose]);

    return (
      <div
        ref={ref}
        role="alert"
        className={`
          fixed z-50 w-72 shadow-lg overflow-hidden
          ${POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right']}
          animate-fadeIn
        `}
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          borderRadius: 8
        }}
      >
        {/* Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 transition-all"
          style={{ 
            width: `${progress}%`,
            backgroundColor: style.accentColor 
          }}
        />

        <div className="p-4 pr-10">
          {content.headline && (
            <p className="font-bold text-sm">{content.headline}</p>
          )}
          {content.text && (
            <p className="text-sm opacity-80 mt-1">{content.text}</p>
          )}
          
          {content.cta && (
            <button
              onClick={onCta}
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: style.accentColor }}
            >
              {content.cta.text} →
            </button>
          )}
        </div>

        {/* Schließen */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full"
          aria-label="Schließen"
        >
          <X size={16} />
        </button>
      </div>
    );
  }
);

ToastPopup.displayName = 'ToastPopup';
```

### 4.6 CSS Animationen

```css
/* src/styles/animations.css */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  60% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
.animate-slideUp { animation: slideUp 0.3s ease-out; }
.animate-slideDown { animation: slideDown 0.3s ease-out; }
.animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
.animate-slideInRight { animation: slideInRight 0.3s ease-out; }
.animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
.animate-bounceIn { animation: bounceIn 0.5s ease-out; }
```

---

## 5. Editor

### 5.1 Popup Editor Komponente

```tsx
// src/components/admin/PopupEditor.tsx

import React, { useState } from 'react';
import { 
  Plus, Eye, EyeOff, Copy, Trash2, BarChart2,
  Settings, Palette, Clock, Zap, Type
} from 'lucide-react';
import { Popup, PopupType, TriggerType } from '@/types/Popup';

interface PopupEditorProps {
  popups: Popup[];
  onChange: (popups: Popup[]) => void;
}

export const PopupEditor: React.FC<PopupEditorProps> = ({ popups, onChange }) => {
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'trigger' | 'style'>('content');

  // Neues Popup erstellen
  const createPopup = () => {
    const newPopup: Popup = {
      id: `popup-${Date.now()}`,
      name: 'Neues Popup',
      active: false,
      type: 'modal',
      position: 'center',
      trigger: { type: 'delay', value: 5 },
      schedule: { enabled: false },
      frequency: { type: 'session' },
      content: {
        headline: 'Überschrift',
        text: 'Beschreibungstext hier eingeben...',
        cta: { text: 'Mehr erfahren' }
      },
      style: {
        width: 'md',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        accentColor: '#F43F5E',
        borderRadius: 'lg',
        overlay: { enabled: true, color: '#000000', opacity: 0.5 },
        animation: 'scale'
      }
    };
    
    onChange([...popups, newPopup]);
    setSelectedPopup(newPopup);
  };

  // Popup aktualisieren
  const updatePopup = (updates: Partial<Popup>) => {
    if (!selectedPopup) return;
    
    const updated = { ...selectedPopup, ...updates };
    setSelectedPopup(updated);
    onChange(popups.map(p => p.id === updated.id ? updated : p));
  };

  // Popup löschen
  const deletePopup = (id: string) => {
    onChange(popups.filter(p => p.id !== id));
    if (selectedPopup?.id === id) setSelectedPopup(null);
  };

  // Popup duplizieren
  const duplicatePopup = (popup: Popup) => {
    const copy = {
      ...popup,
      id: `popup-${Date.now()}`,
      name: `${popup.name} (Kopie)`,
      active: false
    };
    onChange([...popups, copy]);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar: Popup-Liste */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={createPopup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          >
            <Plus size={20} />
            Neues Popup
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {popups.map(popup => (
            <button
              key={popup.id}
              onClick={() => setSelectedPopup(popup)}
              className={`
                w-full p-4 text-left border-b hover:bg-gray-100
                ${selectedPopup?.id === popup.id ? 'bg-white border-l-4 border-l-rose-500' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{popup.name}</span>
                {popup.active ? (
                  <Eye size={16} className="text-green-500" />
                ) : (
                  <EyeOff size={16} className="text-gray-400" />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {popup.type} • {popup.trigger.type}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main: Editor */}
      {selectedPopup ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <input
              type="text"
              value={selectedPopup.name}
              onChange={(e) => updatePopup({ name: e.target.value })}
              className="text-xl font-bold bg-transparent border-none focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => updatePopup({ active: !selectedPopup.active })}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium
                  ${selectedPopup.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'}
                `}
              >
                {selectedPopup.active ? 'Aktiv' : 'Inaktiv'}
              </button>
              <button
                onClick={() => duplicatePopup(selectedPopup)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Duplizieren"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={() => deletePopup(selectedPopup.id)}
                className="p-2 hover:bg-red-100 text-red-500 rounded"
                title="Löschen"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b px-4">
            <div className="flex gap-4">
              {[
                { id: 'content', label: 'Inhalt', icon: Type },
                { id: 'trigger', label: 'Auslöser', icon: Zap },
                { id: 'style', label: 'Design', icon: Palette }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-b-2 transition
                    ${activeTab === tab.id 
                      ? 'border-rose-500 text-rose-500' 
                      : 'border-transparent text-gray-500'}
                  `}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'content' && (
              <PopupContentEditor 
                popup={selectedPopup} 
                onChange={updatePopup} 
              />
            )}
            {activeTab === 'trigger' && (
              <PopupTriggerEditor 
                popup={selectedPopup} 
                onChange={updatePopup} 
              />
            )}
            {activeTab === 'style' && (
              <PopupStyleEditor 
                popup={selectedPopup} 
                onChange={updatePopup} 
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Settings size={48} className="mx-auto mb-4" />
            <p>Wählen Sie ein Popup aus oder erstellen Sie ein neues</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 5.2 Content Editor Tab

```tsx
// PopupContentEditor.tsx

const PopupContentEditor: React.FC<{
  popup: Popup;
  onChange: (updates: Partial<Popup>) => void;
}> = ({ popup, onChange }) => {
  const updateContent = (updates: Partial<PopupContent>) => {
    onChange({ content: { ...popup.content, ...updates } });
  };

  return (
    <div className="space-y-6">
      {/* Popup-Typ */}
      <div>
        <label className="block font-medium mb-2">Popup-Typ</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { type: 'modal', label: 'Modal', icon: '⬜' },
            { type: 'slideIn', label: 'Slide-In', icon: '◨' },
            { type: 'banner', label: 'Banner', icon: '▭' },
            { type: 'toast', label: 'Toast', icon: '◳' }
          ].map(option => (
            <button
              key={option.type}
              onClick={() => onChange({ type: option.type as PopupType })}
              className={`
                p-4 border-2 rounded-lg text-center transition
                ${popup.type === option.type 
                  ? 'border-rose-500 bg-rose-50' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Überschrift */}
      <div>
        <label className="block font-medium mb-2">Überschrift</label>
        <input
          type="text"
          value={popup.content.headline || ''}
          onChange={(e) => updateContent({ headline: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Ihre Überschrift..."
        />
      </div>

      {/* Text */}
      <div>
        <label className="block font-medium mb-2">Text</label>
        <textarea
          value={popup.content.text || ''}
          onChange={(e) => updateContent({ text: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          rows={4}
          placeholder="Beschreibungstext..."
        />
      </div>

      {/* Bild */}
      <div>
        <label className="block font-medium mb-2">Bild (optional)</label>
        <div className="flex gap-4">
          <input
            type="text"
            value={popup.content.image?.src || ''}
            onChange={(e) => updateContent({ 
              image: { 
                ...popup.content.image, 
                src: e.target.value,
                alt: popup.content.image?.alt || '',
                position: popup.content.image?.position || 'top'
              }
            })}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="Bild-URL oder aus Medienbibliothek..."
          />
          <select
            value={popup.content.image?.position || 'top'}
            onChange={(e) => updateContent({ 
              image: { 
                ...popup.content.image!,
                position: e.target.value as any 
              }
            })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="top">Oben</option>
            <option value="left">Links</option>
            <option value="right">Rechts</option>
            <option value="background">Hintergrund</option>
          </select>
        </div>
      </div>

      {/* Haupt-CTA */}
      <div>
        <label className="block font-medium mb-2">Haupt-Button</label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={popup.content.cta?.text || ''}
            onChange={(e) => updateContent({ 
              cta: { ...popup.content.cta, text: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg"
            placeholder="Button-Text"
          />
          <input
            type="text"
            value={popup.content.cta?.url || ''}
            onChange={(e) => updateContent({ 
              cta: { ...popup.content.cta!, url: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg"
            placeholder="Link-URL (optional)"
          />
        </div>
      </div>

      {/* Sekundär-Button */}
      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={!!popup.content.secondaryCta}
            onChange={(e) => updateContent({ 
              secondaryCta: e.target.checked 
                ? { text: 'Nicht jetzt', action: 'close' }
                : undefined
            })}
            className="rounded"
          />
          <span className="font-medium">Sekundär-Button anzeigen</span>
        </label>
        
        {popup.content.secondaryCta && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <input
              type="text"
              value={popup.content.secondaryCta.text}
              onChange={(e) => updateContent({ 
                secondaryCta: { ...popup.content.secondaryCta!, text: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg"
              placeholder="Button-Text"
            />
            <select
              value={popup.content.secondaryCta.action}
              onChange={(e) => updateContent({ 
                secondaryCta: { ...popup.content.secondaryCta!, action: e.target.value as any }
              })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="close">Schließen</option>
              <option value="remind-later">Später erinnern</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5.3 Trigger Editor Tab

```tsx
// PopupTriggerEditor.tsx

const PopupTriggerEditor: React.FC<{
  popup: Popup;
  onChange: (updates: Partial<Popup>) => void;
}> = ({ popup, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Auslöser */}
      <div>
        <h3 className="font-medium text-lg mb-4">Wann soll das Popup erscheinen?</h3>
        
        <div className="space-y-3">
          {/* Sofort */}
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="trigger"
              checked={popup.trigger.type === 'immediate'}
              onChange={() => onChange({ trigger: { type: 'immediate' } })}
              className="mt-1"
            />
            <div>
              <span className="font-medium">Sofort</span>
              <p className="text-sm text-gray-500">Popup erscheint direkt beim Laden der Seite</p>
            </div>
          </label>

          {/* Nach Zeit */}
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="trigger"
              checked={popup.trigger.type === 'delay'}
              onChange={() => onChange({ trigger: { type: 'delay', value: 5 } })}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="font-medium">Nach Verzögerung</span>
              <p className="text-sm text-gray-500">Popup erscheint nach einer bestimmten Zeit</p>
              {popup.trigger.type === 'delay' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={popup.trigger.value || 5}
                    onChange={(e) => onChange({ 
                      trigger: { ...popup.trigger, value: parseInt(e.target.value) }
                    })}
                    className="w-20 px-3 py-1 border rounded"
                    min={1}
                    max={120}
                  />
                  <span className="text-sm text-gray-500">Sekunden</span>
                </div>
              )}
            </div>
          </label>

          {/* Beim Scrollen */}
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="trigger"
              checked={popup.trigger.type === 'scroll'}
              onChange={() => onChange({ trigger: { type: 'scroll', value: 50 } })}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="font-medium">Beim Scrollen</span>
              <p className="text-sm text-gray-500">Popup erscheint nach einem bestimmten Scroll-Prozentsatz</p>
              {popup.trigger.type === 'scroll' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    value={popup.trigger.value || 50}
                    onChange={(e) => onChange({ 
                      trigger: { ...popup.trigger, value: parseInt(e.target.value) }
                    })}
                    className="flex-1"
                    min={10}
                    max={90}
                    step={10}
                  />
                  <span className="text-sm text-gray-500 w-12">{popup.trigger.value || 50}%</span>
                </div>
              )}
            </div>
          </label>

          {/* Exit Intent */}
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="trigger"
              checked={popup.trigger.type === 'exit'}
              onChange={() => onChange({ trigger: { type: 'exit' } })}
              className="mt-1"
            />
            <div>
              <span className="font-medium">Exit Intent</span>
              <p className="text-sm text-gray-500">Popup erscheint wenn der Besucher die Seite verlassen will</p>
            </div>
          </label>
        </div>
      </div>

      {/* Zeitplan */}
      <div>
        <h3 className="font-medium text-lg mb-4">Zeitplan (optional)</h3>
        
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={popup.schedule.enabled}
            onChange={(e) => onChange({ 
              schedule: { ...popup.schedule, enabled: e.target.checked }
            })}
            className="rounded"
          />
          <span>Zeitplan aktivieren</span>
        </label>

        {popup.schedule.enabled && (
          <div className="space-y-4 pl-6">
            {/* Datumsbereich */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Startdatum</label>
                <input
                  type="date"
                  value={popup.schedule.startDate || ''}
                  onChange={(e) => onChange({ 
                    schedule: { ...popup.schedule, startDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Enddatum</label>
                <input
                  type="date"
                  value={popup.schedule.endDate || ''}
                  onChange={(e) => onChange({ 
                    schedule: { ...popup.schedule, endDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Wochentage */}
            <div>
              <label className="block text-sm mb-2">Wochentage</label>
              <div className="flex gap-2">
                {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const days = popup.schedule.daysOfWeek || [0,1,2,3,4,5,6];
                      onChange({ 
                        schedule: { 
                          ...popup.schedule, 
                          daysOfWeek: days.includes(i) 
                            ? days.filter(d => d !== i)
                            : [...days, i]
                        }
                      });
                    }}
                    className={`
                      w-10 h-10 rounded-full text-sm font-medium
                      ${(popup.schedule.daysOfWeek || [0,1,2,3,4,5,6]).includes(i)
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100'}
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Frequenz */}
      <div>
        <h3 className="font-medium text-lg mb-4">Wie oft anzeigen?</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="frequency"
              checked={popup.frequency.type === 'once'}
              onChange={() => onChange({ frequency: { type: 'once' } })}
            />
            <span>Nur einmal (pro Gerät)</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="frequency"
              checked={popup.frequency.type === 'session'}
              onChange={() => onChange({ frequency: { type: 'session' } })}
            />
            <span>Einmal pro Sitzung</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="frequency"
              checked={popup.frequency.type === 'days'}
              onChange={() => onChange({ frequency: { type: 'days', value: 7 } })}
            />
            <span>Alle</span>
            {popup.frequency.type === 'days' && (
              <>
                <input
                  type="number"
                  value={popup.frequency.value || 7}
                  onChange={(e) => onChange({ 
                    frequency: { ...popup.frequency, value: parseInt(e.target.value) }
                  })}
                  className="w-16 px-2 py-1 border rounded"
                  min={1}
                />
                <span>Tage</span>
              </>
            )}
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="frequency"
              checked={popup.frequency.type === 'always'}
              onChange={() => onChange({ frequency: { type: 'always' } })}
            />
            <span>Bei jedem Besuch</span>
          </label>
        </div>
      </div>
    </div>
  );
};
```

### 5.4 Style Editor Tab

```tsx
// PopupStyleEditor.tsx

const PopupStyleEditor: React.FC<{
  popup: Popup;
  onChange: (updates: Partial<Popup>) => void;
}> = ({ popup, onChange }) => {
  const updateStyle = (updates: Partial<PopupStyle>) => {
    onChange({ style: { ...popup.style, ...updates } });
  };

  return (
    <div className="space-y-6">
      {/* Farben */}
      <div>
        <h3 className="font-medium text-lg mb-4">Farben</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2">Hintergrund</label>
            <input
              type="color"
              value={popup.style.backgroundColor}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Text</label>
            <input
              type="color"
              value={popup.style.textColor}
              onChange={(e) => updateStyle({ textColor: e.target.value })}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Akzent / Button</label>
            <input
              type="color"
              value={popup.style.accentColor}
              onChange={(e) => updateStyle({ accentColor: e.target.value })}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Größe */}
      {popup.type === 'modal' && (
        <div>
          <label className="block font-medium mb-2">Größe</label>
          <div className="flex gap-3">
            {[
              { value: 'sm', label: 'Klein' },
              { value: 'md', label: 'Mittel' },
              { value: 'lg', label: 'Groß' },
              { value: 'full', label: 'Extra Groß' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => updateStyle({ width: option.value as any })}
                className={`
                  px-4 py-2 rounded-lg border
                  ${popup.style.width === option.value 
                    ? 'border-rose-500 bg-rose-50' 
                    : 'border-gray-200'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Eckenradius */}
      <div>
        <label className="block font-medium mb-2">Ecken</label>
        <div className="flex gap-3">
          {[
            { value: 'none', label: 'Eckig' },
            { value: 'sm', label: 'Leicht' },
            { value: 'md', label: 'Mittel' },
            { value: 'lg', label: 'Rund' },
            { value: 'xl', label: 'Sehr rund' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateStyle({ borderRadius: option.value as any })}
              className={`
                px-4 py-2 rounded-lg border
                ${popup.style.borderRadius === option.value 
                  ? 'border-rose-500 bg-rose-50' 
                  : 'border-gray-200'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animation */}
      <div>
        <label className="block font-medium mb-2">Animation</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: 'fade', label: 'Einblenden' },
            { value: 'slide', label: 'Einfahren' },
            { value: 'scale', label: 'Zoomen' },
            { value: 'bounce', label: 'Hüpfen' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateStyle({ animation: option.value as any })}
              className={`
                px-4 py-2 rounded-lg border
                ${popup.style.animation === option.value 
                  ? 'border-rose-500 bg-rose-50' 
                  : 'border-gray-200'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {popup.type === 'modal' && (
        <div>
          <h3 className="font-medium text-lg mb-4">Hintergrund-Overlay</h3>
          
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={popup.style.overlay?.enabled}
              onChange={(e) => updateStyle({ 
                overlay: { ...popup.style.overlay!, enabled: e.target.checked }
              })}
              className="rounded"
            />
            <span>Overlay anzeigen</span>
          </label>

          {popup.style.overlay?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Overlay-Farbe</label>
                <input
                  type="color"
                  value={popup.style.overlay.color}
                  onChange={(e) => updateStyle({ 
                    overlay: { ...popup.style.overlay!, color: e.target.value }
                  })}
                  className="w-full h-10 rounded border cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  Transparenz: {Math.round(popup.style.overlay.opacity * 100)}%
                </label>
                <input
                  type="range"
                  value={popup.style.overlay.opacity}
                  onChange={(e) => updateStyle({ 
                    overlay: { ...popup.style.overlay!, opacity: parseFloat(e.target.value) }
                  })}
                  min={0}
                  max={0.9}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live-Vorschau */}
      <div className="border-t pt-6">
        <h3 className="font-medium text-lg mb-4">Vorschau</h3>
        <div className="relative bg-gray-200 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
          {/* Mini-Vorschau des Popups */}
          <div 
            className="transform scale-75"
            style={{
              backgroundColor: popup.style.backgroundColor,
              color: popup.style.textColor,
              borderRadius: popup.style.borderRadius === 'xl' ? 16 : 
                           popup.style.borderRadius === 'lg' ? 12 : 
                           popup.style.borderRadius === 'md' ? 8 : 4,
              padding: 24,
              maxWidth: 320,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            <h3 className="font-bold text-lg mb-2">
              {popup.content.headline || 'Überschrift'}
            </h3>
            <p className="text-sm opacity-80 mb-4">
              {popup.content.text || 'Beschreibungstext...'}
            </p>
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: popup.style.accentColor,
                color: '#FFFFFF'
              }}
            >
              {popup.content.cta?.text || 'Button'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. Frequenz-Steuerung

### 6.1 LocalStorage-Schema

```typescript
// Popup-Frequenz-Tracking im LocalStorage

// Schlüssel-Format:
// popup_{id} = timestamp (wann zuletzt gezeigt)
// popup_{id}_closed = "true" (wenn dauerhaft geschlossen)
// popup_{id}_cta_clicked = "true" (wenn CTA geklickt)

// Beispiel:
localStorage.getItem('popup_summer2024');  // "1719849600000"
localStorage.getItem('popup_summer2024_closed');  // null (nicht dauerhaft geschlossen)

// Session-basiert (verschwindet beim Schließen des Browsers):
sessionStorage.getItem('popup_summer2024');  // "true"
```

### 6.2 Frequenz-Utility-Funktionen

```typescript
// src/lib/popupFrequency.ts

export const PopupFrequencyUtils = {
  // Prüfen ob Popup angezeigt werden soll
  shouldShow(popupId: string, frequency: PopupFrequency): boolean {
    const storageKey = `popup_${popupId}`;
    const lastShown = localStorage.getItem(storageKey);
    const permanentlyClosed = localStorage.getItem(`${storageKey}_closed`);

    // Dauerhaft geschlossen?
    if (permanentlyClosed === 'true') return false;

    switch (frequency.type) {
      case 'always':
        return true;

      case 'once':
        return !lastShown;

      case 'session':
        return !sessionStorage.getItem(storageKey);

      case 'days':
        if (!lastShown) return true;
        const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        return daysSince >= (frequency.value || 1);

      default:
        return true;
    }
  },

  // Als gezeigt markieren
  markAsShown(popupId: string): void {
    const storageKey = `popup_${popupId}`;
    localStorage.setItem(storageKey, Date.now().toString());
    sessionStorage.setItem(storageKey, 'true');
  },

  // Dauerhaft schließen (z.B. "Nicht mehr anzeigen")
  closePermanently(popupId: string): void {
    localStorage.setItem(`popup_${popupId}_closed`, 'true');
  },

  // CTA-Klick tracken
  trackCtaClick(popupId: string): void {
    localStorage.setItem(`popup_${popupId}_cta_clicked`, 'true');
  },

  // "Später erinnern" - erscheint in 1 Stunde wieder
  remindLater(popupId: string, hoursLater: number = 1): void {
    const remindAt = Date.now() + (hoursLater * 60 * 60 * 1000);
    localStorage.setItem(`popup_${popupId}_remind`, remindAt.toString());
  },

  // Alle Popup-Daten zurücksetzen (für Tests)
  resetAll(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('popup_')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('popup_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};
```

---

## 7. Design-Optionen

### 7.1 Vordefinierte Themes

```typescript
// src/lib/popupThemes.ts

export const POPUP_THEMES = {
  classic: {
    name: 'Klassisch',
    style: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#3B82F6',
      borderRadius: 'md' as const,
      overlay: { enabled: true, color: '#000000', opacity: 0.5 },
      animation: 'fade' as const
    }
  },
  
  dark: {
    name: 'Dunkel',
    style: {
      backgroundColor: '#1F2937',
      textColor: '#FFFFFF',
      accentColor: '#F43F5E',
      borderRadius: 'lg' as const,
      overlay: { enabled: true, color: '#000000', opacity: 0.7 },
      animation: 'scale' as const
    }
  },
  
  minimal: {
    name: 'Minimalistisch',
    style: {
      backgroundColor: '#FAFAFA',
      textColor: '#374151',
      accentColor: '#111827',
      borderRadius: 'sm' as const,
      overlay: { enabled: true, color: '#FFFFFF', opacity: 0.9 },
      animation: 'fade' as const
    }
  },
  
  festive: {
    name: 'Festlich',
    style: {
      backgroundColor: '#FEF3C7',
      textColor: '#92400E',
      accentColor: '#D97706',
      borderRadius: 'xl' as const,
      overlay: { enabled: true, color: '#000000', opacity: 0.4 },
      animation: 'bounce' as const
    }
  },
  
  urgent: {
    name: 'Dringend',
    style: {
      backgroundColor: '#FEE2E2',
      textColor: '#991B1B',
      accentColor: '#DC2626',
      borderRadius: 'md' as const,
      overlay: { enabled: true, color: '#000000', opacity: 0.6 },
      animation: 'scale' as const
    }
  }
};
```

### 7.2 Theme-Vorschau im Editor

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Design-Vorlagen                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  ░░░░░░░░░  │  │  ▓▓▓▓▓▓▓▓▓  │  │  ▒▒▒▒▒▒▒▒▒  │  │  ████████   │    │
│  │  ░ Klassisch░  │  │  ▓ Dunkel ▓  │  │  ▒ Minimal ▒  │  │  █Festlich█   │    │
│  │  ░░░░░░░░░  │  │  ▓▓▓▓▓▓▓▓▓  │  │  ▒▒▒▒▒▒▒▒▒  │  │  ████████   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementierungs-Checkliste

### Phase 1: Grundstruktur
- [ ] TypeScript-Interfaces erstellen
- [ ] Popup-Komponenten erstellen (Modal, Banner, SlideIn, Toast)
- [ ] CSS-Animationen implementieren
- [ ] PopupTriggerManager implementieren

### Phase 2: Trigger-System
- [ ] Delay-Trigger
- [ ] Scroll-Trigger
- [ ] Exit-Intent-Trigger
- [ ] Pageview-Trigger
- [ ] Frequenz-Steuerung mit LocalStorage

### Phase 3: Editor
- [ ] Popup-Editor Hauptkomponente
- [ ] Content-Tab (Text, Bild, Buttons)
- [ ] Trigger-Tab (Auslöser, Zeitplan, Frequenz)
- [ ] Style-Tab (Farben, Größe, Animation)
- [ ] Live-Vorschau

### Phase 4: Integration
- [ ] Popup-Container in Website-Layout einbinden
- [ ] usePopupTrigger Hook implementieren
- [ ] Popup-Queue für mehrere Popups
- [ ] Statistik-Tracking (optional)

### Phase 5: Testing
- [ ] Trigger-Tests (alle Typen)
- [ ] Frequenz-Tests
- [ ] Accessibility-Tests (Fokus, ESC, Screenreader)
- [ ] Mobile-Tests
- [ ] Performance-Tests
