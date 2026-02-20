// =====================================================
// TEMPLATE GALLERY (Beispiel)
// Zeigt wie TemplateThumbnail für Template-Auswahl genutzt wird
// =====================================================

import React, { useState } from 'react';
import { TemplateThumbnail } from './TemplateThumbnail';
import type { VEElement } from '../types/elements';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  element: VEElement;
}

/**
 * Beispiel: Template-Auswahl-Gallery
 * Zeigt verschiedene Section-Templates als Miniaturen
 */
export const TemplateGallery: React.FC<{
  templates: TemplateItem[];
  onSelect: (template: TemplateItem) => void;
}> = ({ templates, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (template: TemplateItem) => {
    setSelectedId(template.id);
    onSelect(template);
  };

  // Gruppiere nach Kategorie
  const grouped = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, TemplateItem[]>);

  return (
    <div
      className="template-gallery"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '16px',
        backgroundColor: 'var(--admin-bg)',
        borderRadius: '8px',
        maxHeight: '600px',
        overflowY: 'auto',
      }}
    >
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          {/* Category Header */}
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--admin-text-icon)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
            }}
          >
            {category}
          </h3>

          {/* Template Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            {items.map((template) => (
              <TemplateThumbnail
                key={template.id}
                element={template.element}
                width={100}
                label={template.name}
                onClick={() => handleSelect(template)}
                isSelected={selectedId === template.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== BEISPIEL-TEMPLATES =====

/**
 * Factory: Erstellt Beispiel-Templates für die Gallery
 * 
 * HINWEIS: Diese Templates sind manuell erstellt.
 * In einer echten Implementierung würdest du diese aus einer
 * Datenbank laden oder über Factory-Funktionen generieren.
 */
export function createExampleTemplates(): TemplateItem[] {
  // Beispiel: Hero Section (manuell erstellt)
  const heroSection: VEElement = {
    id: 'hero-template-1',
    type: 'Section',
    label: 'Hero Section',
    classNames: [],
    styles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: [80, 'px'],
        paddingBottom: [80, 'px'],
        backgroundColor: '#f9f7f2',
      },
    },
    children: [
      {
        id: 'hero-text-1',
        type: 'Text',
        label: 'Hero Title',
        classNames: [],
        content: '<h1>Willkommen</h1>',
        styles: {
          desktop: {
            fontSize: [48, 'px'],
            fontWeight: 700,
            marginBottom: [16, 'px'],
          },
        },
        children: [],
      },
      {
        id: 'hero-text-2',
        type: 'Text',
        label: 'Hero Subtitle',
        classNames: [],
        content: '<p>Ihre Überschrift hier</p>',
        styles: {
          desktop: {
            fontSize: [18, 'px'],
            color: '#666',
          },
        },
        children: [],
      },
    ],
  };

  // Beispiel: Services-Grid (vereinfacht)
  const servicesSection: VEElement = {
    id: 'services-template-1',
    type: 'Section',
    label: 'Services Section',
    classNames: [],
    styles: {
      desktop: {
        paddingTop: [60, 'px'],
        paddingBottom: [60, 'px'],
        backgroundColor: '#ffffff',
      },
    },
    children: [
      {
        id: 'services-grid-1',
        type: 'Container',
        label: 'Services Grid',
        classNames: [],
        styles: {
          desktop: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: [24, 'px'],
            maxWidth: [1200, 'px'],
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
        children: [
          // Service Card 1
          {
            id: 'service-card-1',
            type: 'Container',
            label: 'Service Card',
            classNames: [],
            styles: {
              desktop: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: [24, 'px'],
                backgroundColor: '#f9f9f9',
                borderRadius: [8, 'px'],
              },
            },
            children: [
              {
                id: 'service-icon-1',
                type: 'Icon',
                label: 'Icon',
                classNames: [],
                content: { iconName: 'Star', size: [32, 'px'], color: null, strokeWidth: 2 },
                styles: {},
                children: [],
              },
              {
                id: 'service-title-1',
                type: 'Text',
                label: 'Service Title',
                classNames: [],
                content: '<h3>Service 1</h3>',
                styles: {
                  desktop: {
                    fontSize: [18, 'px'],
                    fontWeight: 600,
                    marginTop: [12, 'px'],
                  },
                },
                children: [],
              },
            ],
          },
          // Service Card 2 (vereinfacht)
          {
            id: 'service-card-2',
            type: 'Container',
            label: 'Service Card',
            classNames: [],
            styles: {
              desktop: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: [24, 'px'],
                backgroundColor: '#f9f9f9',
                borderRadius: [8, 'px'],
              },
            },
            children: [
              {
                id: 'service-icon-2',
                type: 'Icon',
                label: 'Icon',
                classNames: [],
                content: { iconName: 'Zap', size: [32, 'px'], color: null, strokeWidth: 2 },
                styles: {},
                children: [],
              },
              {
                id: 'service-title-2',
                type: 'Text',
                label: 'Service Title',
                classNames: [],
                content: '<h3>Service 2</h3>',
                styles: {
                  desktop: {
                    fontSize: [18, 'px'],
                    fontWeight: 600,
                    marginTop: [12, 'px'],
                  },
                },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  return [
    {
      id: 'hero-centered',
      name: 'Hero Zentriert',
      category: 'Hero Sections',
      element: heroSection,
    },
    {
      id: 'services-4col',
      name: '4er Services',
      category: 'Service Sections',
      element: servicesSection,
    },
  ];
}
