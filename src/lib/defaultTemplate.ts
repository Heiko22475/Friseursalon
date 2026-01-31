// src/lib/defaultTemplate.ts
import { Website } from '../contexts/WebsiteContext';

export const createDefaultWebsiteContent = (siteName: string): Website => {
  return {
    site_settings: {
      header_type: 'simple',
      theme: {
        primary_color: '#e11d48', // rose-600 default
        font_family: 'sans',
      },
    },
    general: {
      name: siteName,
      full_name: siteName,
      tagline: 'Your New Website',
      motto: 'Quality and Style',
      description: 'Welcome to your new website.',
    },
    pages: [
      {
        id: crypto.randomUUID(),
        title: 'Home',
        slug: 'home',
        is_home: true,
        is_published: true,
        show_in_menu: true,
        meta_description: 'Welcome to our homepage',
        seo_title: 'Home | ' + siteName,
        display_order: 0,
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'hero',
            position: 0,
            config: {},
            content: {
              title: 'Welcome to ' + siteName,
              subtitle: 'We provide excellent service.',
              buttonText: 'Get Started',
              buttonLink: '#contact'
            },
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: 'Datenschutz',
        slug: 'datenschutz',
        is_home: false,
        is_published: true,
        show_in_menu: false, // Usually in footer
        meta_description: 'Datenschutzerklärung',
        seo_title: 'Datenschutz | ' + siteName,
        display_order: 1,
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'static_content',
            position: 0,
            config: { type: 'privacy' },
            content: {},
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: 'Impressum',
        slug: 'impressum',
        is_home: false,
        is_published: true,
        show_in_menu: false,
        meta_description: 'Impressum',
        seo_title: 'Impressum | ' + siteName,
        display_order: 2,
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'static_content',
            position: 0,
            config: { type: 'imprint' },
            content: {},
          },
        ],
      },
    ],
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
