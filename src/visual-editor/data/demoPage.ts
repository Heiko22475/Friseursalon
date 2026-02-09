// =====================================================
// VISUAL EDITOR – DEMO PAGES
// Beispielseiten zum Testen der Seitenverwaltung
// =====================================================

import type { VEPage, VEHeader, VEFooter, VECards } from '../types/elements';
import { createDefaultHeaderClassicConfig } from '../../types/Header';
import { createDefaultFooterMinimalConfig } from '../../types/Footer';

export const demoPage: VEPage = {
  id: 'demo-page-1',
  name: 'Startseite',
  route: '/',
  isVisualEditor: true,
  body: {
    id: 'body-1',
    type: 'Body',
    label: 'Body',
    styles: {
      desktop: {
        backgroundColor: { kind: 'custom', hex: '#ffffff' },
      },
    },
    children: [
      // ===== HERO SECTION =====
      {
        id: 'section-hero',
        type: 'Section',
        label: 'Hero',
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: { value: 120, unit: 'px' },
            paddingBottom: { value: 120, unit: 'px' },
            paddingLeft: { value: 24, unit: 'px' },
            paddingRight: { value: 24, unit: 'px' },
            backgroundColor: { kind: 'custom', hex: '#0f172a' },
          },
          tablet: {
            paddingTop: { value: 80, unit: 'px' },
            paddingBottom: { value: 80, unit: 'px' },
          },
          mobile: {
            paddingTop: { value: 60, unit: 'px' },
            paddingBottom: { value: 60, unit: 'px' },
          },
        },
        children: [
          {
            id: 'container-hero',
            type: 'Container',
            label: 'Hero Content',
            styles: {
              desktop: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { value: 24, unit: 'px' },
                maxWidth: { value: 800, unit: 'px' },
                width: { value: 100, unit: '%' },
              },
            },
            children: [
              {
                id: 'text-hero-title',
                type: 'Text',
                label: 'Hero Titel',
                content: 'Willkommen bei Salon Beautiful',
                textStyle: 'h1' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#ffffff' },
                    textAlign: 'center',
                  },
                },
              },
              {
                id: 'text-hero-subtitle',
                type: 'Text',
                label: 'Hero Untertitel',
                content: 'Ihr Friseur in der Innenstadt – seit 1995 für Sie da.',
                textStyle: 'body' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#94a3b8' },
                    textAlign: 'center',
                    fontSize: { value: 20, unit: 'px' },
                  },
                  mobile: {
                    fontSize: { value: 16, unit: 'px' },
                  },
                },
              },
              {
                id: 'button-hero-cta',
                type: 'Button',
                label: 'CTA Button',
                content: {
                  text: 'Termin buchen',
                  link: '/kontakt',
                  openInNewTab: false,
                },
                styles: {
                  desktop: {
                    paddingTop: { value: 14, unit: 'px' },
                    paddingBottom: { value: 14, unit: 'px' },
                    paddingLeft: { value: 32, unit: 'px' },
                    paddingRight: { value: 32, unit: 'px' },
                    backgroundColor: { kind: 'custom', hex: '#3b82f6' },
                    color: { kind: 'custom', hex: '#ffffff' },
                    borderRadius: { value: 8, unit: 'px' },
                    fontSize: { value: 18, unit: 'px' },
                    fontWeight: 600,
                  },
                },
              },
            ],
          },
        ],
      },

      // ===== ABOUT SECTION =====
      {
        id: 'section-about',
        type: 'Section',
        label: 'Über uns',
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: { value: 80, unit: 'px' },
            paddingBottom: { value: 80, unit: 'px' },
            paddingLeft: { value: 24, unit: 'px' },
            paddingRight: { value: 24, unit: 'px' },
            backgroundColor: { kind: 'custom', hex: '#f8fafc' },
          },
        },
        children: [
          {
            id: 'container-about',
            type: 'Container',
            label: 'About Content',
            styles: {
              desktop: {
                display: 'flex',
                flexDirection: 'row',
                gap: { value: 48, unit: 'px' },
                maxWidth: { value: 1100, unit: 'px' },
                width: { value: 100, unit: '%' },
                alignItems: 'center',
              },
              mobile: {
                flexDirection: 'column',
                gap: { value: 24, unit: 'px' },
              },
            },
            children: [
              {
                id: 'image-about',
                type: 'Image',
                label: 'Salon Bild',
                content: {
                  src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
                  alt: 'Unser Salon',
                },
                styles: {
                  desktop: {
                    width: { value: 50, unit: '%' },
                    borderRadius: { value: 12, unit: 'px' },
                    overflow: 'hidden',
                  },
                  mobile: {
                    width: { value: 100, unit: '%' },
                  },
                },
              },
              {
                id: 'container-about-text',
                type: 'Container',
                label: 'About Text',
                styles: {
                  desktop: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { value: 16, unit: 'px' },
                    width: { value: 50, unit: '%' },
                  },
                  mobile: {
                    width: { value: 100, unit: '%' },
                  },
                },
                children: [
                  {
                    id: 'text-about-overline',
                    type: 'Text',
                    label: 'Überzeile',
                    content: 'Über uns',
                    textStyle: 'label' as const,
                    styles: {
                      desktop: {
                        color: { kind: 'custom', hex: '#3b82f6' },
                      },
                    },
                  },
                  {
                    id: 'text-about-title',
                    type: 'Text',
                    label: 'Titel',
                    content: 'Ihr Wohlfühlort',
                    textStyle: 'h2' as const,
                    styles: {
                      desktop: {
                        color: { kind: 'custom', hex: '#0f172a' },
                      },
                    },
                  },
                  {
                    id: 'text-about-body',
                    type: 'Text',
                    label: 'Beschreibung',
                    content: 'Unser Salon bietet Ihnen eine entspannte Atmosphäre, in der Sie sich rundum verwöhnen lassen können. Mit jahrelanger Erfahrung und den neuesten Trends sorgen wir dafür, dass Sie sich bei uns wohlfühlen.',
                    textStyle: 'body' as const,
                    styles: {
                      desktop: {
                        color: { kind: 'custom', hex: '#475569' },
                        lineHeight: 1.7,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },

      // ===== CTA SECTION =====
      {
        id: 'section-cta',
        type: 'Section',
        label: 'CTA',
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: { value: 60, unit: 'px' },
            paddingBottom: { value: 60, unit: 'px' },
            paddingLeft: { value: 24, unit: 'px' },
            paddingRight: { value: 24, unit: 'px' },
            backgroundColor: { kind: 'custom', hex: '#1e293b' },
          },
        },
        children: [
          {
            id: 'container-cta',
            type: 'Container',
            label: 'CTA Content',
            styles: {
              desktop: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { value: 16, unit: 'px' },
                maxWidth: { value: 600, unit: 'px' },
              },
            },
            children: [
              {
                id: 'text-cta-title',
                type: 'Text',
                label: 'CTA Titel',
                content: 'Bereit für einen neuen Look?',
                textStyle: 'h3' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#ffffff' },
                    textAlign: 'center',
                  },
                },
              },
              {
                id: 'button-cta',
                type: 'Button',
                label: 'CTA Button',
                content: {
                  text: 'Jetzt Termin vereinbaren',
                  link: '/kontakt',
                  openInNewTab: false,
                },
                styles: {
                  desktop: {
                    paddingTop: { value: 12, unit: 'px' },
                    paddingBottom: { value: 12, unit: 'px' },
                    paddingLeft: { value: 28, unit: 'px' },
                    paddingRight: { value: 28, unit: 'px' },
                    backgroundColor: { kind: 'custom', hex: '#f59e0b' },
                    color: { kind: 'custom', hex: '#0f172a' },
                    borderRadius: { value: 8, unit: 'px' },
                    fontSize: { value: 16, unit: 'px' },
                    fontWeight: 700,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

// ===== ADDITIONAL DEMO PAGES =====

export const demoPageLeistungen: VEPage = {
  id: 'demo-page-2',
  name: 'Leistungen',
  route: '/leistungen',
  isVisualEditor: true,
  isPublished: true,
  body: {
    id: 'body-2',
    type: 'Body',
    label: 'Body',
    styles: {
      desktop: {
        backgroundColor: { kind: 'custom', hex: '#ffffff' },
      },
    },
    children: [
      {
        id: 'section-leistungen-hero',
        type: 'Section',
        label: 'Leistungen Header',
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: { value: 80, unit: 'px' },
            paddingBottom: { value: 80, unit: 'px' },
            paddingLeft: { value: 24, unit: 'px' },
            paddingRight: { value: 24, unit: 'px' },
            backgroundColor: { kind: 'custom', hex: '#f8fafc' },
          },
        },
        children: [
          {
            id: 'container-leistungen',
            type: 'Container',
            label: 'Content',
            styles: {
              desktop: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { value: 16, unit: 'px' },
                maxWidth: { value: 800, unit: 'px' },
              },
            },
            children: [
              {
                id: 'text-leistungen-overline',
                type: 'Text',
                label: 'Überzeile',
                content: 'Was wir bieten',
                textStyle: 'label' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#3b82f6' },
                    textAlign: 'center',
                  },
                },
              },
              {
                id: 'text-leistungen-title',
                type: 'Text',
                label: 'Titel',
                content: 'Unsere Leistungen',
                textStyle: 'h1' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#0f172a' },
                    textAlign: 'center',
                  },
                },
              },
              {
                id: 'text-leistungen-desc',
                type: 'Text',
                label: 'Beschreibung',
                content: 'Von klassischen Haarschnitten bis zu modernen Färbetechniken – wir bieten Ihnen ein breites Spektrum an professionellen Leistungen.',
                textStyle: 'body' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#64748b' },
                    textAlign: 'center',
                    maxWidth: { value: 600, unit: 'px' },
                  },
                },
              },
            ],
          },
        ],
      },
      // ===== SERVICE CARDS =====
      {
        id: 'section-service-cards',
        type: 'Section',
        label: 'Service-Karten',
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: { value: 60, unit: 'px' },
            paddingBottom: { value: 80, unit: 'px' },
            paddingLeft: { value: 24, unit: 'px' },
            paddingRight: { value: 24, unit: 'px' },
            backgroundColor: { kind: 'custom', hex: '#ffffff' },
          },
        },
        children: [
          {
            id: 'cards-services',
            type: 'Cards',
            label: 'Leistungen Cards',
            templateId: 'service-card-v1',
            layout: {
              desktop: { columns: 3, gap: { value: 24, unit: 'px' } },
              tablet: { columns: 2, gap: { value: 16, unit: 'px' } },
              mobile: { columns: 1, gap: { value: 16, unit: 'px' } },
            },
            styles: {
              desktop: {
                maxWidth: { value: 1100, unit: 'px' },
                width: { value: 100, unit: '%' },
              },
            },
            cards: [
              {
                id: 'card-s1',
                elements: [
                  { id: 'card-s1-img', type: 'CardImage', label: 'Bild', content: { src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop', alt: 'Haarschnitt' } },
                  { id: 'card-s1-title', type: 'CardText', label: 'Titel', textStyle: 'h3', content: 'Haarschnitt' },
                  { id: 'card-s1-desc', type: 'CardText', label: 'Beschreibung', textStyle: 'body', content: 'Professioneller Schnitt für Damen und Herren' },
                  { id: 'card-s1-price', type: 'CardText', label: 'Preis', textStyle: 'price', content: 'ab 35 €' },
                ],
              },
              {
                id: 'card-s2',
                elements: [
                  { id: 'card-s2-img', type: 'CardImage', label: 'Bild', content: { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=250&fit=crop', alt: 'Färben' } },
                  { id: 'card-s2-title', type: 'CardText', label: 'Titel', textStyle: 'h3', content: 'Färben & Strähnen' },
                  { id: 'card-s2-desc', type: 'CardText', label: 'Beschreibung', textStyle: 'body', content: 'Balayage, Highlights und klassische Colorationen' },
                  { id: 'card-s2-price', type: 'CardText', label: 'Preis', textStyle: 'price', content: 'ab 65 €' },
                ],
              },
              {
                id: 'card-s3',
                elements: [
                  { id: 'card-s3-img', type: 'CardImage', label: 'Bild', content: { src: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=250&fit=crop', alt: 'Styling' } },
                  { id: 'card-s3-title', type: 'CardText', label: 'Titel', textStyle: 'h3', content: 'Styling & Pflege' },
                  { id: 'card-s3-desc', type: 'CardText', label: 'Beschreibung', textStyle: 'body', content: 'Haarpflege-Treatments und professionelles Styling' },
                  { id: 'card-s3-price', type: 'CardText', label: 'Preis', textStyle: 'price', content: 'ab 25 €' },
                ],
              },
            ],
          } as VECards,
        ],
      },
    ],
  },
};

export const demoPageKontakt: VEPage = {
  id: 'demo-page-3',
  name: 'Kontakt',
  route: '/kontakt',
  isVisualEditor: true,
  isPublished: true,
  body: {
    id: 'body-3',
    type: 'Body',
    label: 'Body',
    styles: {
      desktop: {
        backgroundColor: { kind: 'custom', hex: '#ffffff' },
      },
    },
    children: [
      {
        id: 'section-kontakt',
        type: 'Section',
        label: 'Kontakt',
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: { value: 80, unit: 'px' },
            paddingBottom: { value: 80, unit: 'px' },
            paddingLeft: { value: 24, unit: 'px' },
            paddingRight: { value: 24, unit: 'px' },
          },
        },
        children: [
          {
            id: 'container-kontakt',
            type: 'Container',
            label: 'Content',
            styles: {
              desktop: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { value: 24, unit: 'px' },
                maxWidth: { value: 600, unit: 'px' },
                width: { value: 100, unit: '%' },
              },
            },
            children: [
              {
                id: 'text-kontakt-title',
                type: 'Text',
                label: 'Titel',
                content: 'Kontaktieren Sie uns',
                textStyle: 'h1' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#0f172a' },
                    textAlign: 'center',
                  },
                },
              },
              {
                id: 'text-kontakt-info',
                type: 'Text',
                label: 'Kontaktinfo',
                content: 'Wir freuen uns auf Ihren Besuch! Rufen Sie uns an oder kommen Sie einfach vorbei.',
                textStyle: 'body' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#64748b' },
                    textAlign: 'center',
                  },
                },
              },
              {
                id: 'button-kontakt-phone',
                type: 'Button',
                label: 'Anrufen Button',
                content: {
                  text: '☎ Jetzt anrufen',
                  link: 'tel:+491234567890',
                  openInNewTab: false,
                },
                styles: {
                  desktop: {
                    paddingTop: { value: 14, unit: 'px' },
                    paddingBottom: { value: 14, unit: 'px' },
                    paddingLeft: { value: 32, unit: 'px' },
                    paddingRight: { value: 32, unit: 'px' },
                    backgroundColor: { kind: 'custom', hex: '#16a34a' },
                    color: { kind: 'custom', hex: '#ffffff' },
                    borderRadius: { value: 8, unit: 'px' },
                    fontSize: { value: 16, unit: 'px' },
                    fontWeight: 600,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const demoPageImpressum: VEPage = {
  id: 'demo-page-4',
  name: 'Impressum',
  route: '/impressum',
  isVisualEditor: true,
  isPublished: false,
  body: {
    id: 'body-4',
    type: 'Body',
    label: 'Body',
    styles: {
      desktop: {
        backgroundColor: { kind: 'custom', hex: '#ffffff' },
      },
    },
    children: [
      {
        id: 'section-impressum',
        type: 'Section',
        label: 'Impressum',
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            paddingTop: { value: 60, unit: 'px' },
            paddingBottom: { value: 60, unit: 'px' },
            paddingLeft: { value: 24, unit: 'px' },
            paddingRight: { value: 24, unit: 'px' },
            alignItems: 'center',
          },
        },
        children: [
          {
            id: 'container-impressum',
            type: 'Container',
            label: 'Content',
            styles: {
              desktop: {
                maxWidth: { value: 700, unit: 'px' },
                width: { value: 100, unit: '%' },
                display: 'flex',
                flexDirection: 'column',
                gap: { value: 16, unit: 'px' },
              },
            },
            children: [
              {
                id: 'text-impressum-title',
                type: 'Text',
                label: 'Titel',
                content: 'Impressum',
                textStyle: 'h1' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#0f172a' },
                  },
                },
              },
              {
                id: 'text-impressum-body',
                type: 'Text',
                label: 'Inhalt',
                content: 'Angaben gemäß § 5 TMG\n\nSalon Beautiful\nMusterstraße 1\n12345 Musterstadt\n\nTelefon: 01234 567890\nE-Mail: info@salon-beautiful.de',
                textStyle: 'body' as const,
                styles: {
                  desktop: {
                    color: { kind: 'custom', hex: '#475569' },
                    lineHeight: 1.8,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

// ===== HEADER & FOOTER ELEMENTS FOR DEMO PAGES =====

const demoHeader: VEHeader = {
  id: 'demo-header',
  type: 'Header',
  label: 'Header',
  styles: { desktop: {} },
  config: createDefaultHeaderClassicConfig(),
};

const demoFooter: VEFooter = {
  id: 'demo-footer',
  type: 'Footer',
  label: 'Footer',
  styles: { desktop: {} },
  config: createDefaultFooterMinimalConfig(),
};

/** Inject header/footer into a demo page */
function withHeaderFooter(page: VEPage): VEPage {
  return {
    ...page,
    body: {
      ...page.body,
      children: [
        { ...demoHeader, id: `header-${page.id}` },
        ...page.body.children,
        { ...demoFooter, id: `footer-${page.id}` },
      ],
    },
  };
}

/** Alle Demo-Seiten als Array */
export const demoPages: VEPage[] = [
  withHeaderFooter(demoPage),
  withHeaderFooter(demoPageLeistungen),
  withHeaderFooter(demoPageKontakt),
  withHeaderFooter(demoPageImpressum),
];
