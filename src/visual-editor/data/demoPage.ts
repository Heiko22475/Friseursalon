// =====================================================
// VISUAL EDITOR – DEMO PAGE
// Beispielseite zum Testen der Phase 1 Grundstruktur
// =====================================================

import type { VEPage } from '../types/elements';

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
