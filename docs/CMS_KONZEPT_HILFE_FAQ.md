# BeautifulCMS - Hilfe-System & FAQ

## Übersicht

Dieses Dokument beschreibt das Hilfe-System für das CMS, bestehend aus Tooltips, Hilfe-Panel, FAQ-Bereich im Admin und FAQ als Baustein für die Website.

---

## Inhaltsverzeichnis

1. [Hilfe-System Konzept](#1-hilfe-system-konzept)
2. [Tooltip-Komponente](#2-tooltip-komponente)
3. [Hilfe-Panel](#3-hilfe-panel)
4. [FAQ-Bereich im Admin](#4-faq-bereich-im-admin)
5. [FAQ-Baustein für Website](#5-faq-baustein-für-website)
6. [FAQ-Inhalte (vordefiniert)](#6-faq-inhalte-vordefiniert)

---

## 1. Hilfe-System Konzept

### 1.1 Drei Ebenen der Hilfe

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HILFE-SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Ebene 1: TOOLTIPS (schnelle Hilfe)                                    │
│  ─────────────────────────────────                                     │
│  • (i) Icon neben jedem Feld                                           │
│  • Kurzer Text bei Hover/Klick                                         │
│  • Max. 2-3 Sätze                                                      │
│                                                                         │
│  Ebene 2: HILFE-PANEL (ausführliche Hilfe)                             │
│  ─────────────────────────────────────────                             │
│  • (?) Button oben rechts auf jeder Seite                              │
│  • Seitliches Panel mit ausführlicher Erklärung                        │
│  • Screenshots und Schritt-für-Schritt-Anleitungen                     │
│                                                                         │
│  Ebene 3: FAQ-BEREICH (Wissensdatenbank)                               │
│  ───────────────────────────────────────                               │
│  • Eigene Seite im Admin-Bereich                                       │
│  • Durchsuchbar                                                         │
│  • Kategorisiert                                                        │
│  • Von SuperAdmin pflegbar                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Hilfe-Kontext Mapping

```typescript
// src/types/Help.ts

interface HelpContent {
  id: string;
  tooltip: string;          // Kurzer Tooltip-Text
  title: string;            // Titel für Panel
  description: string;      // Ausführliche Beschreibung (HTML)
  steps?: string[];         // Schritt-für-Schritt
  tips?: string[];          // Tipps und Best Practices
  relatedFaqs?: string[];   // IDs von verwandten FAQs
}

// Hilfe-Inhalte pro Feld/Bereich
const HELP_CONTENT: Record<string, HelpContent> = {
  'seo.title': {
    id: 'seo.title',
    tooltip: 'Der Seitentitel erscheint in Suchergebnissen und im Browser-Tab. 50-60 Zeichen empfohlen.',
    title: 'Seitentitel (Meta Title)',
    description: `
      <p>Der Seitentitel ist einer der wichtigsten SEO-Faktoren. Er erscheint:</p>
      <ul>
        <li>In den Google-Suchergebnissen als blaue Überschrift</li>
        <li>Im Browser-Tab</li>
        <li>Wenn jemand Ihre Seite als Lesezeichen speichert</li>
      </ul>
    `,
    steps: [
      'Verwenden Sie wichtige Suchbegriffe am Anfang',
      'Halten Sie den Titel unter 60 Zeichen',
      'Machen Sie den Titel einzigartig für jede Seite',
      'Fügen Sie Ihren Firmennamen am Ende hinzu'
    ],
    tips: [
      'Gutes Beispiel: "Damenhaarschnitt ab 35€ | Friseursalon Beispiel"',
      'Schlechtes Beispiel: "Startseite" oder "Willkommen"'
    ],
    relatedFaqs: ['seo-basics', 'google-ranking']
  },
  // ... weitere Hilfe-Inhalte
};
```

---

## 2. Tooltip-Komponente

### 2.1 Implementierung

```tsx
// src/components/admin/HelpSystem/HelpTooltip.tsx

import React, { useState, useRef } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  helpId: string;
  variant?: 'icon' | 'inline';
  children?: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  helpId, 
  variant = 'icon',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  const helpContent = HELP_CONTENT[helpId];
  if (!helpContent) return null;

  const showTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        className="inline-flex items-center text-gray-400 hover:text-gray-600 transition"
        aria-label="Hilfe anzeigen"
        aria-describedby={isVisible ? `tooltip-${helpId}` : undefined}
      >
        {variant === 'icon' ? (
          <Info className="w-4 h-4" />
        ) : (
          <span className="flex items-center gap-1">
            {children}
            <HelpCircle className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Tooltip Popup */}
      {isVisible && (
        <div
          id={`tooltip-${helpId}`}
          role="tooltip"
          className="fixed z-50 max-w-sm p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl"
          style={{ top: position.top, left: position.left }}
        >
          {helpContent.tooltip}
          
          {/* Link zu mehr Hilfe */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open_help_panel', { 
              detail: { helpId } 
            }))}
            className="block mt-2 text-rose-300 hover:text-rose-200 text-xs"
          >
            Mehr erfahren →
          </button>
          
          {/* Pfeil */}
          <div 
            className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 transform rotate-45"
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
};
```

### 2.2 Verwendung

```tsx
// Beispiel: Im SEO-Editor

<div className="space-y-4">
  <label className="flex items-center gap-2 text-sm font-medium">
    Seitentitel
    <HelpTooltip helpId="seo.title" />
  </label>
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full px-3 py-2 border rounded-lg"
  />
</div>
```

---

## 3. Hilfe-Panel

### 3.1 Implementierung

```tsx
// src/components/admin/HelpSystem/HelpPanel.tsx

import React, { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react';

interface HelpPanelProps {
  pageContext?: string;  // z.B. 'seo-editor', 'gallery-editor'
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ pageContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<HelpContent | null>(null);

  // Listener für Tooltip "Mehr erfahren" Links
  useEffect(() => {
    const handleOpenPanel = (e: CustomEvent) => {
      const helpId = e.detail.helpId;
      if (HELP_CONTENT[helpId]) {
        setActiveContent(HELP_CONTENT[helpId]);
        setIsOpen(true);
      }
    };

    window.addEventListener('open_help_panel', handleOpenPanel as EventListener);
    return () => {
      window.removeEventListener('open_help_panel', handleOpenPanel as EventListener);
    };
  }, []);

  // Kontextbezogene Hilfe laden
  useEffect(() => {
    if (pageContext && PAGE_HELP[pageContext]) {
      setActiveContent(PAGE_HELP[pageContext]);
    }
  }, [pageContext]);

  return (
    <>
      {/* Hilfe-Button (oben rechts) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition"
        aria-label="Hilfe öffnen"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Hilfe</span>
      </button>

      {/* Seitliches Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Hilfe-Panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Hilfe
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-200 rounded-lg"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          {activeContent ? (
            <div className="space-y-6">
              {/* Titel */}
              <h3 className="text-xl font-semibold">
                {activeContent.title}
              </h3>
              
              {/* Beschreibung */}
              <div 
                className="prose prose-sm"
                dangerouslySetInnerHTML={{ __html: activeContent.description }}
              />
              
              {/* Schritt-für-Schritt */}
              {activeContent.steps && activeContent.steps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">So geht's:</h4>
                  <ol className="space-y-2">
                    {activeContent.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* Tipps */}
              {activeContent.tips && activeContent.tips.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">💡 Tipps</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    {activeContent.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Verwandte FAQs */}
              {activeContent.relatedFaqs && activeContent.relatedFaqs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Verwandte Artikel</h4>
                  <ul className="space-y-2">
                    {activeContent.relatedFaqs.map(faqId => {
                      const faq = FAQ_DATABASE.find(f => f.id === faqId);
                      if (!faq) return null;
                      return (
                        <li key={faqId}>
                          <a
                            href={`/admin/faq#${faqId}`}
                            className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                          >
                            <ChevronRight className="w-4 h-4" />
                            {faq.question}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Klicken Sie auf ein (i) Symbol für kontextbezogene Hilfe.</p>
              <a
                href="/admin/faq"
                className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
              >
                Alle FAQ anzeigen
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
```

---

## 4. FAQ-Bereich im Admin

### 4.1 Datenstruktur

```typescript
// src/types/FAQ.ts

interface FAQItem {
  id: string;
  question: string;
  answer: string;        // HTML
  category: string;
  tags: string[];
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: string;          // Lucide Icon Name
  order: number;
}

// Datenbank-Tabelle für SuperAdmin
CREATE TABLE faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 FAQ-Seite im Admin

```tsx
// src/components/admin/FAQPage.tsx

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'getting-started', name: 'Erste Schritte', icon: 'Rocket', order: 1 },
  { id: 'pages', name: 'Seiten & Bausteine', icon: 'Layout', order: 2 },
  { id: 'design', name: 'Design & Theme', icon: 'Palette', order: 3 },
  { id: 'media', name: 'Bilder & Medien', icon: 'Image', order: 4 },
  { id: 'seo', name: 'SEO & Marketing', icon: 'Search', order: 5 },
  { id: 'contact', name: 'Kontakt & Formulare', icon: 'Mail', order: 6 },
  { id: 'advanced', name: 'Erweiterte Funktionen', icon: 'Settings', order: 7 },
];

export const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    // FAQs aus Datenbank laden
    const { data } = await supabase
      .from('faq_items')
      .select('*')
      .eq('is_published', true)
      .order('order_index');
    
    if (data) setFaqs(data);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-blue-500" />
            Hilfe & FAQ
          </h1>
          <p className="text-gray-600 mt-1">
            Finden Sie Antworten auf häufig gestellte Fragen
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Suche */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Suchen Sie nach einem Thema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Kategorien */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              !activeCategory 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            Alle
          </button>
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeCategory === cat.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ Liste */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Ergebnisse gefunden</p>
              <p className="text-sm mt-1">Versuchen Sie andere Suchbegriffe</p>
            </div>
          ) : (
            filteredFaqs.map(faq => (
              <div 
                key={faq.id}
                className="bg-white rounded-xl border overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                  aria-expanded={expandedItems.has(faq.id)}
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  {expandedItems.has(faq.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {expandedItems.has(faq.id) && (
                  <div className="px-4 pb-4 border-t bg-gray-50">
                    <div 
                      className="prose prose-sm max-w-none pt-4"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                    
                    {/* Tags */}
                    {faq.tags.length > 0 && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        {faq.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-gray-200 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
```

### 4.3 FAQ-Editor im SuperAdmin

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FAQ verwalten                                        [+ Neuer Eintrag] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Kategorie: [Alle ▼]        Suche: [_____________________]              │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ☰ │ Wie ändere ich mein Logo?              │ Erste Schritte │ [✎][🗑]│
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ Wie füge ich eine neue Seite hinzu?    │ Seiten         │ [✎][🗑]│
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ Wie ändere ich die Farben?             │ Design         │ [✎][🗑]│
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ ☰ │ Wie lade ich Bilder hoch?              │ Medien         │ [✎][🗑]│
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Seite 1 von 5                                      [<] [1] [2] ... [>] │
└─────────────────────────────────────────────────────────────────────────┘

// Bearbeitungs-Dialog:
┌─────────────────────────────────────────────────────────────────────────┐
│  FAQ bearbeiten                                                   [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frage:                                                                 │
│  [Wie ändere ich mein Logo?________________________________________]   │
│                                                                         │
│  Antwort:                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [B] [I] [U] [Link] [Liste] [Code]                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ So ändern Sie Ihr Logo:                                         │   │
│  │                                                                  │   │
│  │ 1. Gehen Sie zu "Einstellungen" im Admin-Bereich               │   │
│  │ 2. Klicken Sie auf "Logo ändern"                                │   │
│  │ 3. Wählen Sie ein Bild aus der Mediathek oder laden Sie...     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Kategorie: [Erste Schritte ▼]                                         │
│                                                                         │
│  Tags: [logo] [einstellungen] [+]                                      │
│                                                                         │
│  [✓] Veröffentlicht                                                    │
│                                                                         │
│                                           [Abbrechen] [Speichern]       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. FAQ-Baustein für Website

### 5.1 Beschreibung

Der FAQ-Baustein ermöglicht es Website-Besuchern, häufig gestellte Fragen auf der öffentlichen Website zu sehen. Er wird im JSON der Website gespeichert (nicht in der Datenbank-Tabelle).

### 5.2 Konfiguration

```typescript
// Bereits in CMS_KONZEPT_BAUSTEINE.md definiert

interface FAQBlockConfig {
  title?: string;
  subtitle?: string;
  items: FAQItem[];  // Lokale FAQs, im JSON gespeichert
  style: {
    variant: 'simple' | 'bordered' | 'card';
    allowMultiple: boolean;
    iconPosition: 'left' | 'right';
    iconStyle: 'plus' | 'arrow' | 'chevron';
  };
  schema: boolean;  // Schema.org generieren?
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  expanded?: boolean;
}
```

### 5.3 Unterschied: Admin-FAQ vs. Website-FAQ

| Aspekt | Admin-FAQ | Website-FAQ (Baustein) |
|--------|-----------|------------------------|
| Speicherort | Datenbank (faq_items) | JSON (Website-Daten) |
| Verwaltung | SuperAdmin | Website-Besitzer |
| Zweck | CMS-Hilfe | Besucher-Fragen |
| Suche | Ja | Nein |
| Schema.org | Nein | Optional |

---

## 6. FAQ-Inhalte (vordefiniert)

### 6.1 Kategorie: Erste Schritte

```typescript
const GETTING_STARTED_FAQS: FAQItem[] = [
  {
    id: 'gs-login',
    question: 'Wie melde ich mich im Admin-Bereich an?',
    answer: `
      <p>So gelangen Sie in den Admin-Bereich Ihrer Website:</p>
      <ol>
        <li>Öffnen Sie Ihre Website im Browser</li>
        <li>Fügen Sie <code>/admin</code> an die URL an (z.B. www.ihre-domain.de/admin)</li>
        <li>Geben Sie Ihre Kundennummer ein</li>
        <li>Sie werden automatisch eingeloggt</li>
      </ol>
      <p><strong>Tipp:</strong> Speichern Sie sich die Admin-URL als Lesezeichen!</p>
    `,
    category: 'getting-started',
    tags: ['login', 'anmeldung', 'admin', 'zugang']
  },
  {
    id: 'gs-overview',
    question: 'Was kann ich im Admin-Bereich alles machen?',
    answer: `
      <p>Im Admin-Bereich können Sie Ihre gesamte Website verwalten:</p>
      <ul>
        <li><strong>Seiten:</strong> Neue Seiten erstellen, bearbeiten, löschen</li>
        <li><strong>Bausteine:</strong> Inhalte auf Ihren Seiten anordnen</li>
        <li><strong>Medien:</strong> Bilder hochladen und verwalten</li>
        <li><strong>Design:</strong> Farben und Schriften anpassen</li>
        <li><strong>Einstellungen:</strong> Kontaktdaten, Öffnungszeiten, etc.</li>
        <li><strong>SEO:</strong> Ihre Website für Suchmaschinen optimieren</li>
      </ul>
    `,
    category: 'getting-started',
    tags: ['übersicht', 'funktionen', 'admin']
  },
  {
    id: 'gs-save',
    question: 'Wie speichere ich meine Änderungen?',
    answer: `
      <p>Ihre Änderungen werden gespeichert, wenn Sie auf den <strong>"Speichern"</strong>-Button klicken.</p>
      <p><strong>Wichtig:</strong></p>
      <ul>
        <li>Änderungen werden erst nach dem Speichern auf der Website sichtbar</li>
        <li>Wenn Sie die Seite verlassen ohne zu speichern, gehen Ihre Änderungen verloren</li>
        <li>Eine Bestätigung erscheint, wenn das Speichern erfolgreich war</li>
      </ul>
    `,
    category: 'getting-started',
    tags: ['speichern', 'änderungen']
  },
  {
    id: 'gs-preview',
    question: 'Wie kann ich meine Änderungen vor dem Speichern ansehen?',
    answer: `
      <p>In den meisten Editoren gibt es einen <strong>"Vorschau"</strong>-Button oben rechts.</p>
      <p>Klicken Sie darauf, um eine Live-Vorschau Ihrer Änderungen zu sehen, ohne sie zu speichern.</p>
      <p><strong>Tipp:</strong> Nutzen Sie die Vorschau regelmäßig, um sicherzustellen, dass alles so aussieht wie gewünscht.</p>
    `,
    category: 'getting-started',
    tags: ['vorschau', 'preview']
  }
];
```

### 6.2 Kategorie: Seiten & Bausteine

```typescript
const PAGES_FAQS: FAQItem[] = [
  {
    id: 'pages-add',
    question: 'Wie erstelle ich eine neue Seite?',
    answer: `
      <p>So erstellen Sie eine neue Seite:</p>
      <ol>
        <li>Gehen Sie zu <strong>"Seiten"</strong> im Admin-Menü</li>
        <li>Klicken Sie auf <strong>"+ Neue Seite"</strong></li>
        <li>Geben Sie einen Titel ein (z.B. "Über uns")</li>
        <li>Die URL wird automatisch generiert (z.B. /ueber-uns)</li>
        <li>Klicken Sie auf <strong>"Erstellen"</strong></li>
      </ol>
      <p>Danach können Sie der Seite Bausteine hinzufügen.</p>
    `,
    category: 'pages',
    tags: ['seite', 'neu', 'erstellen']
  },
  {
    id: 'pages-blocks',
    question: 'Was sind Bausteine und wie verwende ich sie?',
    answer: `
      <p>Bausteine sind die Inhaltsblöcke, aus denen Ihre Seite besteht. Beispiele:</p>
      <ul>
        <li><strong>Hero:</strong> Großes Bild mit Text am Seitenanfang</li>
        <li><strong>Text:</strong> Fließtext mit Überschriften</li>
        <li><strong>Galerie:</strong> Bildergalerie</li>
        <li><strong>Kontakt:</strong> Kontaktformular und -informationen</li>
        <li><strong>Öffnungszeiten:</strong> Ihre Geschäftszeiten</li>
      </ul>
      <p>Klicken Sie auf <strong>"+ Baustein hinzufügen"</strong>, um einen neuen Baustein auf Ihrer Seite einzufügen.</p>
    `,
    category: 'pages',
    tags: ['bausteine', 'blocks', 'inhalte']
  },
  {
    id: 'pages-order',
    question: 'Wie ändere ich die Reihenfolge der Bausteine?',
    answer: `
      <p>Die Reihenfolge ändern Sie per Drag & Drop:</p>
      <ol>
        <li>Gehen Sie zur Seitenverwaltung</li>
        <li>Klicken Sie auf das ☰ Symbol links neben einem Baustein</li>
        <li>Halten Sie gedrückt und ziehen Sie nach oben oder unten</li>
        <li>Lassen Sie los, um die neue Position zu bestätigen</li>
        <li>Klicken Sie auf <strong>"Speichern"</strong></li>
      </ol>
    `,
    category: 'pages',
    tags: ['reihenfolge', 'sortieren', 'verschieben']
  },
  {
    id: 'pages-hide',
    question: 'Kann ich eine Seite vorübergehend ausblenden?',
    answer: `
      <p>Ja! So blenden Sie eine Seite aus:</p>
      <ol>
        <li>Gehen Sie zu <strong>"Seiten"</strong></li>
        <li>Finden Sie die Seite in der Liste</li>
        <li>Klicken Sie auf das Auge-Symbol (👁) um sie auszublenden</li>
        <li>Ein durchgestrichenes Auge bedeutet: Seite ist nicht sichtbar</li>
      </ol>
      <p><strong>Hinweis:</strong> Ausgeblendete Seiten sind für Besucher nicht erreichbar, aber Sie können sie im Admin-Bereich weiter bearbeiten.</p>
    `,
    category: 'pages',
    tags: ['ausblenden', 'verstecken', 'unsichtbar']
  }
];
```

### 6.3 Kategorie: Design & Theme

```typescript
const DESIGN_FAQS: FAQItem[] = [
  {
    id: 'design-colors',
    question: 'Wie ändere ich die Farben meiner Website?',
    answer: `
      <p>So passen Sie die Farben an:</p>
      <ol>
        <li>Gehen Sie zu <strong>"Design"</strong> > <strong>"Theme"</strong></li>
        <li>Sie sehen drei Hauptfarben:
          <ul>
            <li><strong>Primärfarbe:</strong> Hauptakzentfarbe (Buttons, Links)</li>
            <li><strong>Sekundärfarbe:</strong> Für Hintergründe und Text</li>
            <li><strong>Akzentfarbe:</strong> Für besondere Hervorhebungen</li>
          </ul>
        </li>
        <li>Klicken Sie auf eine Farbe, um den Farbwähler zu öffnen</li>
        <li>Wählen Sie eine neue Farbe oder geben Sie einen Hex-Code ein</li>
        <li>Speichern Sie Ihre Änderungen</li>
      </ol>
      <p><strong>Tipp:</strong> Klicken Sie auf "Presets anzeigen" für vorgefertigte Farbkombinationen!</p>
    `,
    category: 'design',
    tags: ['farben', 'theme', 'design', 'anpassen']
  },
  {
    id: 'design-logo',
    question: 'Wie ändere ich mein Logo?',
    answer: `
      <p>Es gibt zwei Möglichkeiten:</p>
      <h4>Option 1: Eigenes Logo hochladen</h4>
      <ol>
        <li>Gehen Sie zu <strong>"Einstellungen"</strong></li>
        <li>Klicken Sie auf "Logo ändern"</li>
        <li>Wählen Sie ein Bild aus der Mediathek oder laden Sie ein neues hoch</li>
        <li>Empfohlen: PNG mit transparentem Hintergrund</li>
      </ol>
      <h4>Option 2: Logo selbst gestalten</h4>
      <ol>
        <li>Gehen Sie zu <strong>"Logo-Designer"</strong></li>
        <li>Kombinieren Sie ein Bild mit Text</li>
        <li>Passen Sie Schrift, Farben und Position an</li>
        <li>Speichern Sie Ihr Logo</li>
      </ol>
    `,
    category: 'design',
    tags: ['logo', 'branding', 'bild']
  },
  {
    id: 'design-fonts',
    question: 'Kann ich die Schriftart ändern?',
    answer: `
      <p>Die Schriftarten können an verschiedenen Stellen angepasst werden:</p>
      <ul>
        <li><strong>Überschriften:</strong> Im jeweiligen Baustein-Editor</li>
        <li><strong>Fließtext:</strong> Im Text-Editor</li>
        <li><strong>Logo:</strong> Im Logo-Designer</li>
      </ul>
      <p>Verfügbare Schriftarten werden automatisch von Google Fonts geladen.</p>
      <p><strong>Tipp:</strong> Verwenden Sie nicht mehr als 2-3 verschiedene Schriftarten für ein professionelles Erscheinungsbild.</p>
    `,
    category: 'design',
    tags: ['schrift', 'font', 'typografie']
  }
];
```

### 6.4 Kategorie: Bilder & Medien

```typescript
const MEDIA_FAQS: FAQItem[] = [
  {
    id: 'media-upload',
    question: 'Wie lade ich Bilder hoch?',
    answer: `
      <p>So laden Sie Bilder in die Mediathek hoch:</p>
      <ol>
        <li>Gehen Sie zu <strong>"Mediathek"</strong></li>
        <li>Klicken Sie auf <strong>"Hochladen"</strong></li>
        <li>Wählen Sie eine oder mehrere Dateien von Ihrem Computer</li>
        <li>Warten Sie, bis der Upload abgeschlossen ist</li>
      </ol>
      <p><strong>Unterstützte Formate:</strong> JPG, PNG, GIF, WebP</p>
      <p><strong>Empfohlene Bildgröße:</strong> Max. 2000px Breite, unter 2MB</p>
    `,
    category: 'media',
    tags: ['bilder', 'upload', 'hochladen', 'mediathek']
  },
  {
    id: 'media-folders',
    question: 'Wie organisiere ich meine Bilder in Ordnern?',
    answer: `
      <p>Ordner helfen Ihnen, den Überblick zu behalten:</p>
      <ol>
        <li>In der Mediathek sehen Sie links die Ordnerliste</li>
        <li>Klicken Sie auf <strong>"+ Neuer Ordner"</strong></li>
        <li>Geben Sie einen Namen ein (z.B. "Team-Fotos")</li>
        <li>Um Bilder zu verschieben: Wählen Sie Bilder aus und klicken Sie auf "Verschieben"</li>
      </ol>
    `,
    category: 'media',
    tags: ['ordner', 'organisation', 'mediathek']
  },
  {
    id: 'media-optimize',
    question: 'Meine Bilder laden langsam - was kann ich tun?',
    answer: `
      <p>Große Bilder können Ihre Website verlangsamen. Tipps:</p>
      <ul>
        <li><strong>Bildgröße reduzieren:</strong> Bilder sollten nicht breiter als 2000px sein</li>
        <li><strong>Komprimieren:</strong> Nutzen Sie Tools wie tinypng.com vor dem Upload</li>
        <li><strong>Richtiges Format:</strong> JPG für Fotos, PNG für Grafiken mit Transparenz</li>
        <li><strong>WebP nutzen:</strong> Modernes Format mit besserer Kompression</li>
      </ul>
      <p><strong>Ideal:</strong> Bilder unter 500KB bei voller Qualität</p>
    `,
    category: 'media',
    tags: ['performance', 'optimierung', 'langsam', 'ladezeit']
  },
  {
    id: 'media-alt',
    question: 'Was sind Alt-Texte und warum sind sie wichtig?',
    answer: `
      <p>Alt-Texte (Alternativtexte) beschreiben den Inhalt eines Bildes mit Worten.</p>
      <p><strong>Warum sind sie wichtig?</strong></p>
      <ul>
        <li><strong>Barrierefreiheit:</strong> Screenreader lesen sie für sehbehinderte Nutzer vor</li>
        <li><strong>SEO:</strong> Suchmaschinen verstehen so den Bildinhalt</li>
        <li><strong>Fallback:</strong> Wird angezeigt, wenn ein Bild nicht lädt</li>
      </ul>
      <p><strong>Beispiel:</strong></p>
      <ul>
        <li>Schlecht: "IMG_1234.jpg"</li>
        <li>Gut: "Friseurmeisterin Maria schneidet einer Kundin die Haare"</li>
      </ul>
    `,
    category: 'media',
    tags: ['alt-text', 'barrierefreiheit', 'seo', 'bilder']
  }
];
```

### 6.5 Kategorie: SEO & Marketing

```typescript
const SEO_FAQS: FAQItem[] = [
  {
    id: 'seo-basics',
    question: 'Was ist SEO und warum ist es wichtig?',
    answer: `
      <p><strong>SEO</strong> steht für "Search Engine Optimization" (Suchmaschinenoptimierung).</p>
      <p>Gutes SEO hilft dabei, dass Ihre Website in Google besser gefunden wird, wenn potenzielle Kunden nach Ihren Dienstleistungen suchen.</p>
      <p><strong>Beispiel:</strong> Wenn jemand "Friseur Hamburg" googelt, erscheinen gut optimierte Websites weiter oben.</p>
      <p>Die wichtigsten SEO-Faktoren:</p>
      <ul>
        <li>Aussagekräftige Seitentitel</li>
        <li>Gute Beschreibungen</li>
        <li>Schnelle Ladezeiten</li>
        <li>Mobile Optimierung</li>
        <li>Qualitativ hochwertige Inhalte</li>
      </ul>
    `,
    category: 'seo',
    tags: ['seo', 'grundlagen', 'google', 'suchmaschine']
  },
  {
    id: 'seo-title',
    question: 'Wie schreibe ich einen guten Seitentitel?',
    answer: `
      <p>Der Seitentitel erscheint in den Google-Suchergebnissen und im Browser-Tab.</p>
      <p><strong>Regeln für gute Seitentitel:</strong></p>
      <ol>
        <li>Wichtige Suchbegriffe an den Anfang</li>
        <li>50-60 Zeichen (länger wird abgeschnitten)</li>
        <li>Einzigartig für jede Seite</li>
        <li>Firmenname am Ende</li>
      </ol>
      <p><strong>Beispiele:</strong></p>
      <ul>
        <li>✅ Gut: "Damenhaarschnitt ab 35€ | Friseursalon Beispiel Hamburg"</li>
        <li>❌ Schlecht: "Willkommen auf unserer Website"</li>
        <li>❌ Schlecht: "Startseite"</li>
      </ul>
    `,
    category: 'seo',
    tags: ['seo', 'titel', 'meta', 'google']
  },
  {
    id: 'seo-description',
    question: 'Was ist eine Meta-Beschreibung?',
    answer: `
      <p>Die Meta-Beschreibung ist der kurze Text, der in Google unter dem Titel erscheint.</p>
      <p><strong>Tipps für gute Beschreibungen:</strong></p>
      <ul>
        <li>120-160 Zeichen</li>
        <li>Beschreiben Sie, was Besucher auf der Seite finden</li>
        <li>Fügen Sie eine Handlungsaufforderung ein (z.B. "Jetzt Termin buchen")</li>
        <li>Verwenden Sie relevante Suchbegriffe natürlich</li>
      </ul>
      <p><strong>Beispiel:</strong></p>
      <p>"Professionelle Haarschnitte und Colorationen in Hamburg-Altona. ✓ Über 15 Jahre Erfahrung ✓ Ohne Termin möglich ✓ Jetzt online buchen!"</p>
    `,
    category: 'seo',
    tags: ['seo', 'beschreibung', 'meta', 'google']
  },
  {
    id: 'seo-local',
    question: 'Wie werde ich lokal besser gefunden?',
    answer: `
      <p>Für lokale Unternehmen ist <strong>Local SEO</strong> besonders wichtig:</p>
      <ol>
        <li><strong>Google Business Profil:</strong> Erstellen Sie einen kostenlosen Eintrag auf google.com/business</li>
        <li><strong>Adresse überall gleich:</strong> Verwenden Sie auf der Website dieselbe Adresse wie bei Google</li>
        <li><strong>Öffnungszeiten aktuell halten:</strong> Sowohl auf der Website als auch bei Google</li>
        <li><strong>Bewertungen sammeln:</strong> Bitten Sie zufriedene Kunden um Google-Bewertungen</li>
        <li><strong>Lokale Suchbegriffe:</strong> Verwenden Sie "Friseur Hamburg" statt nur "Friseur"</li>
      </ol>
    `,
    category: 'seo',
    tags: ['seo', 'lokal', 'google business', 'maps']
  }
];
```

### 6.6 Kategorie: Kontakt & Formulare

```typescript
const CONTACT_FAQS: FAQItem[] = [
  {
    id: 'contact-receive',
    question: 'Wo finde ich die Nachrichten vom Kontaktformular?',
    answer: `
      <p>Nachrichten vom Kontaktformular werden an die E-Mail-Adresse gesendet, die Sie in den Einstellungen hinterlegt haben.</p>
      <p><strong>E-Mail-Adresse ändern:</strong></p>
      <ol>
        <li>Gehen Sie zu <strong>"Einstellungen"</strong></li>
        <li>Finden Sie das Feld "Kontakt-E-Mail"</li>
        <li>Geben Sie Ihre gewünschte E-Mail-Adresse ein</li>
        <li>Speichern Sie</li>
      </ol>
      <p><strong>Tipp:</strong> Prüfen Sie auch Ihren Spam-Ordner, falls Nachrichten nicht ankommen.</p>
    `,
    category: 'contact',
    tags: ['kontakt', 'formular', 'email', 'nachrichten']
  },
  {
    id: 'contact-smtp',
    question: 'Wie richte ich den E-Mail-Versand ein?',
    answer: `
      <p>Für den E-Mail-Versand benötigen Sie SMTP-Zugangsdaten. Diese erhalten Sie von Ihrem E-Mail-Anbieter.</p>
      <p><strong>Einrichtung:</strong></p>
      <ol>
        <li>Gehen Sie zu <strong>"Einstellungen"</strong> > <strong>"E-Mail"</strong></li>
        <li>Geben Sie die SMTP-Daten ein:
          <ul>
            <li>Server: z.B. smtp.gmail.com</li>
            <li>Port: meist 587</li>
            <li>Benutzername: Ihre E-Mail-Adresse</li>
            <li>Passwort: Ihr E-Mail-Passwort oder App-Passwort</li>
          </ul>
        </li>
        <li>Testen Sie die Verbindung</li>
        <li>Speichern Sie</li>
      </ol>
      <p><strong>Hinweis:</strong> Bei Gmail müssen Sie ein "App-Passwort" erstellen.</p>
    `,
    category: 'contact',
    tags: ['email', 'smtp', 'einrichtung']
  },
  {
    id: 'contact-spam',
    question: 'Wie verhindere ich Spam über das Kontaktformular?',
    answer: `
      <p>Das Kontaktformular hat einen eingebauten Spam-Schutz (Honeypot), der die meisten Bots blockiert, ohne dass Ihre Besucher etwas davon merken.</p>
      <p><strong>Zusätzliche Tipps:</strong></p>
      <ul>
        <li>Die Honeypot-Technik ist automatisch aktiv</li>
        <li>Echte Besucher sehen keinen Unterschied</li>
        <li>Bots werden automatisch blockiert</li>
      </ul>
      <p>Falls Sie dennoch viel Spam erhalten, kontaktieren Sie den Support.</p>
    `,
    category: 'contact',
    tags: ['spam', 'schutz', 'formular', 'sicherheit']
  }
];
```

### 6.7 Alle FAQs zusammenführen

```typescript
export const FAQ_DATABASE: FAQItem[] = [
  ...GETTING_STARTED_FAQS,
  ...PAGES_FAQS,
  ...DESIGN_FAQS,
  ...MEDIA_FAQS,
  ...SEO_FAQS,
  ...CONTACT_FAQS,
];
```

---

## Implementierungs-Checkliste

- [ ] TypeScript-Typen für Help und FAQ definieren
- [ ] HelpTooltip-Komponente erstellen
- [ ] HelpPanel-Komponente erstellen
- [ ] Alle HELP_CONTENT Einträge schreiben
- [ ] FAQ-Seite im Admin erstellen
- [ ] FAQ-Editor im SuperAdmin erstellen
- [ ] Alle FAQ_DATABASE Einträge in Datenbank migrieren
- [ ] FAQ-Baustein für Website erstellen
- [ ] Suche in FAQ implementieren
- [ ] ARIA und Keyboard-Navigation testen
