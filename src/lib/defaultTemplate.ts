// src/lib/defaultTemplate.ts
// Default website template in v2 format
import { Website } from '../contexts/WebsiteContext';

export const createDefaultWebsiteContent = (siteName: string): Website => {
  return {
    settings: {
      theme: {
        colors: {
          primary: '#e11d48',
          secondary: '#1e293b',
          accent: '#f59e0b',
        },
        fonts: {
          heading: 'inter',
          body: 'inter',
        },
      },
    },
    styles: {},
    components: {},
    pages: [
      {
        id: crypto.randomUUID(),
        title: 'Home',
        slug: 'home',
        isHome: true,
        isPublished: true,
        showInMenu: true,
        seo: {
          title: 'Home | ' + siteName,
          description: 'Welcome to our homepage',
        },
        body: {
          id: crypto.randomUUID(),
          tag: 'body',
          styles: {
            fontFamily: 'Inter, sans-serif',
            color: '#1e293b',
            margin: '0',
          },
          children: [
            {
              id: crypto.randomUUID(),
              tag: 'section',
              styles: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: [80, 'vh'],
                padding: [48, 'px'],
                textAlign: 'center',
                backgroundColor: '#f8fafc',
              },
              children: [
                {
                  id: crypto.randomUUID(),
                  tag: 'text',
                  html: `<h1>Welcome to ${siteName}</h1>`,
                  styles: {
                    fontSize: [48, 'px'],
                    fontWeight: '700',
                    marginBottom: [16, 'px'],
                    color: '#0f172a',
                    '@mobile': {
                      fontSize: [32, 'px'],
                    },
                  },
                },
                {
                  id: crypto.randomUUID(),
                  tag: 'text',
                  html: '<p>We provide excellent service.</p>',
                  styles: {
                    fontSize: [18, 'px'],
                    color: '#64748b',
                    marginBottom: [32, 'px'],
                  },
                },
                {
                  id: crypto.randomUUID(),
                  tag: 'button',
                  text: 'Get Started',
                  href: '#contact',
                  styles: {
                    display: 'inline-block',
                    padding: [12, 'px'],
                    paddingLeft: [32, 'px'],
                    paddingRight: [32, 'px'],
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    borderRadius: [8, 'px'],
                    fontWeight: '600',
                    fontSize: [16, 'px'],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        id: crypto.randomUUID(),
        title: 'Datenschutz',
        slug: 'datenschutz',
        isHome: false,
        isPublished: true,
        showInMenu: false,
        seo: {
          title: 'Datenschutz | ' + siteName,
          description: 'Datenschutzerklärung',
        },
        body: {
          id: crypto.randomUUID(),
          tag: 'body',
          children: [
            {
              id: crypto.randomUUID(),
              tag: 'section',
              styles: {
                maxWidth: [800, 'px'],
                margin: '0 auto',
                padding: [32, 'px'],
              },
              children: [
                {
                  id: crypto.randomUUID(),
                  tag: 'text',
                  html: '<h1>Datenschutzerklärung</h1><p>Verantwortlicher...</p>',
                },
              ],
            },
          ],
        },
      },
      {
        id: crypto.randomUUID(),
        title: 'Impressum',
        slug: 'impressum',
        isHome: false,
        isPublished: true,
        showInMenu: false,
        seo: {
          title: 'Impressum | ' + siteName,
          description: 'Impressum',
        },
        body: {
          id: crypto.randomUUID(),
          tag: 'body',
          children: [
            {
              id: crypto.randomUUID(),
              tag: 'section',
              styles: {
                maxWidth: [800, 'px'],
                margin: '0 auto',
                padding: [32, 'px'],
              },
              children: [
                {
                  id: crypto.randomUUID(),
                  tag: 'text',
                  html: '<h1>Impressum</h1><p>Angaben gemäß § 5 TMG...</p>',
                },
              ],
            },
          ],
        },
      },
    ],
    // Legacy fields kept for backward compat – can be removed later
    general: {
      name: siteName,
      full_name: siteName,
      tagline: 'Your New Website',
      motto: 'Quality and Style',
      description: 'Welcome to your new website.',
    },
    services: [],
    contact: {
      phone: '',
      email: '',
      street: '',
      postal_code: '',
      city: '',
      country: 'Deutschland',
      instagram: null,
      facebook_url: null,
      instagram_url: null,
      google_maps_url: null,
    },
    hours: {
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
    },
    business_hours: [],
    reviews: [],
    about: {
      title: 'About Us',
      content: 'Write something about your business here.',
      team_title: 'Our Team',
      team: [],
    },
    gallery: {
      images: [],
    },
    static_content: {
      imprint: '<h1>Impressum</h1><p>Angaben gemäß § 5 TMG...</p>',
      privacy: '<h1>Datenschutz</h1><p>Verantwortlicher...</p>',
      terms: '<h1>AGB</h1><p>Allgemeine Geschäftsbedingungen...</p>',
    },
  };
};
