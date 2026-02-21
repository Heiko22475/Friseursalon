import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { syncGalleryToUserMedia, syncTeamToUserMedia } from '../lib/mediaSync';

// =====================================================
// TYPES
// =====================================================

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  category: string;
  is_featured: boolean;
  display_order: number;
}

export interface Block {
  id: string;
  type: string;
  position: number;
  config: Record<string, any>;
  content: Record<string, any>;
  created_at?: string;
  // Template reference (for generic-card blocks)
  templateId?: string;
  templateName?: string;
  templateCategory?: string;
  customized?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  // v2 field names (preferred)
  isHome?: boolean;
  isPublished?: boolean;
  showInMenu?: boolean;
  body?: any;
  seo?: { title?: string; description?: string };
  // v1 field names (backward compat)
  is_home?: boolean;
  is_published?: boolean;
  show_in_menu?: boolean;
  blocks?: Block[];
  meta_description?: string | null;
  seo_title?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// ===== PAGE FIELD HELPERS (v1/v2 compat) =====

export function pageIsHome(p: Page): boolean {
  return p.isHome ?? p.is_home ?? false;
}
export function pageIsPublished(p: Page): boolean {
  return p.isPublished ?? p.is_published ?? true;
}
export function pageShowInMenu(p: Page): boolean {
  return p.showInMenu ?? p.show_in_menu ?? true;
}

export interface Contact {
  phone: string;
  email: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  instagram: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  google_maps_url: string | null;
  // Additional social media URLs
  tiktok_url?: string | null;
  youtube_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  whatsapp?: string | null;
}

export interface BusinessHour {
  id: string;
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

export interface Hours {
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  is_featured: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string | null;
  display_order: number;
}

export interface About {
  title: string;
  content: string;
  team_title: string;
  team: TeamMember[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt_text: string;
  caption: string | null;
  display_order: number;
}

export interface Gallery {
  images: GalleryImage[];
}

export interface StaticContent {
  imprint: string;
  privacy: string;
  terms: string;
}

// =====================================================
// LOGO DESIGNER TYPES
// =====================================================

export interface LogoText {
  id: string;
  content: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800';
  color: string;
  letterSpacing?: number;
}

export interface LogoDesign {
  id: string;
  name: string;
  createdAt: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  image?: {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  texts: LogoText[];
  thumbnail?: string;
}

export interface SiteSettings {
  header_type: 'simple' | 'centered' | 'split';
  theme: {
    primary_color: string;
    font_family: string;
  };
}

export interface Website {
  // v2 top-level fields
  settings?: any;
  styles?: Record<string, any>;
  components?: Record<string, any>;

  // v1 legacy fields (optional for backward compat)
  site_settings?: SiteSettings;
  pages: Page[];
  services?: Service[];
  contact?: Contact;
  hours?: Hours;
  business_hours?: BusinessHour[];
  reviews?: Review[];
  about?: About;
  gallery?: Gallery;
  static_content?: StaticContent;
  general?: GeneralInfo;
  logos?: LogoDesign[];
  typography?: import('../types/typography').TypographyConfig;
  header?: import('../types/Header').HeaderConfig;
  footer?: import('../types/Footer').FooterConfig;
}

export interface GeneralInfo {
  name: string;
  full_name: string;
  tagline: string;
  motto: string;
  description: string;
}

export interface WebsiteRecord {
  id: string;
  customer_id: string;
  site_name: string;
  domain_name?: string | null;
  is_published: boolean;
  content: Website;
  created_at: string;
  updated_at: string;
  last_build_at?: string | null;
}

// =====================================================
// CONTEXT
// =====================================================

interface WebsiteContextType {
  website: Website | null;
  websiteRecord: WebsiteRecord | null;
  loading: boolean;
  error: string | null;
  customerId: string;
  
  // Generic update
  updateWebsite: (updates: Partial<Website>) => Promise<void>;
  
  // Specific updates
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  updatePages: (pages: Page[]) => Promise<void>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  addPage: (page: Omit<Page, 'id'>) => Promise<string>;
  deletePage: (pageId: string) => Promise<void>;
  
  updateServices: (services: Service[]) => Promise<void>;
  updateService: (serviceId: string, updates: Partial<Service>) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<string>;
  deleteService: (serviceId: string) => Promise<void>;
  
  updateContact: (contact: Partial<Contact>) => Promise<void>;
  updateHours: (hours: Partial<Hours>) => Promise<void>;
  updateBusinessHours: (hours: BusinessHour[]) => Promise<void>;
  updateReviews: (reviews: Review[]) => Promise<void>;
  updateAbout: (about: About) => Promise<void>;
  updateGallery: (gallery: Gallery) => Promise<void>;
  updateStaticContent: (content: Partial<StaticContent>) => Promise<void>;
  updateGeneralInfo: (info: GeneralInfo, siteName?: string) => Promise<void>;
  
  // Logo methods
  updateLogos: (logos: LogoDesign[]) => Promise<void>;
  addLogo: (logo: LogoDesign) => Promise<void>;
  updateLogo: (logoId: string, updates: Partial<LogoDesign>) => Promise<void>;
  deleteLogo: (logoId: string) => Promise<void>;
  
  // Reload from DB
  reload: () => Promise<void>;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

interface WebsiteProviderProps {
  customerId: string;
  children: React.ReactNode;
}

export const WebsiteProvider: React.FC<WebsiteProviderProps> = ({ customerId, children }) => {
  const [websiteRecord, setWebsiteRecord] = useState<WebsiteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWebsite = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('websites')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (fetchError) throw fetchError;
      
      setWebsiteRecord(data);

      // Check if a deploy is needed (works for any visitor — public or admin)
      if (data) {
        import('../utils/deployHook').then(m =>
          m.checkAndTriggerDeploy(data.id, data.updated_at, data.last_build_at ?? null)
        ).catch(() => {});
      }
    } catch (err: any) {
      console.error('Error loading website:', err);
      setError(err.message || 'Failed to load website');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadWebsite();
  }, [loadWebsite]);

  // Generic update function
  const updateWebsite = async (updates: Partial<Website>) => {
    if (!websiteRecord) return;

    const newContent = { ...websiteRecord.content, ...updates };

    try {
      const { error: updateError } = await supabase
        .from('websites')
        .update({ content: newContent })
        .eq('customer_id', customerId);

      if (updateError) throw updateError;

      // Optimistic update
      setWebsiteRecord({ ...websiteRecord, content: newContent });
    } catch (err: any) {
      console.error('Error updating website:', err);
      throw err;
    }
  };

  // Specific update functions
  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    if (!websiteRecord) return;
    await updateWebsite({
      site_settings: { ...(websiteRecord.content.site_settings || { header_type: 'simple', theme: { primary_color: '#e11d48', font_family: 'sans' } }), ...settings },
    });
  };

  const updatePages = async (pages: Page[]) => {
    await updateWebsite({ pages });
  };

  const updatePage = async (pageId: string, updates: Partial<Page>) => {
    if (!websiteRecord) return;
    const newPages = websiteRecord.content.pages.map((p) =>
      p.id === pageId ? { ...p, ...updates } : p
    );
    await updatePages(newPages);
  };

  const addPage = async (page: Omit<Page, 'id'>): Promise<string> => {
    if (!websiteRecord) throw new Error('No website loaded');
    // Validate slug against reserved system routes
    const { isReservedSlug, getReservedSlugError } = await import('../utils/reservedSlugs');
    if (isReservedSlug(page.slug)) {
      throw new Error(getReservedSlugError(page.slug));
    }
    const newId = crypto.randomUUID();
    const newPage: Page = { ...page, id: newId };
    await updatePages([...websiteRecord.content.pages, newPage]);
    return newId;
  };

  const deletePage = async (pageId: string) => {
    if (!websiteRecord) return;
    const newPages = websiteRecord.content.pages.filter((p) => p.id !== pageId);
    await updatePages(newPages);
  };

  const updateServices = async (services: Service[]) => {
    await updateWebsite({ services });
  };

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    if (!websiteRecord) return;
    const newServices = (websiteRecord.content.services || []).map((s) =>
      s.id === serviceId ? { ...s, ...updates } : s
    );
    await updateServices(newServices);
  };

  const addService = async (service: Omit<Service, 'id'>): Promise<string> => {
    if (!websiteRecord) throw new Error('No website loaded');
    const newId = crypto.randomUUID();
    const newService: Service = { ...service, id: newId };
    await updateServices([...(websiteRecord.content.services || []), newService]);
    return newId;
  };

  const deleteService = async (serviceId: string) => {
    if (!websiteRecord) return;
    const newServices = (websiteRecord.content.services || []).filter((s) => s.id !== serviceId);
    await updateServices(newServices);
  };

  const updateContact = async (contact: Partial<Contact>) => {
    if (!websiteRecord) return;
    await updateWebsite({ 
      contact: { ...(websiteRecord.content.contact || { phone: '', email: '', street: '', postal_code: '', city: '', country: 'Deutschland', instagram: null, facebook_url: null, instagram_url: null, google_maps_url: null }), ...contact } as Contact
    });
  };

  const updateHours = async (hours: Partial<Hours>) => {
    if (!websiteRecord) return;
    await updateWebsite({ 
      hours: { ...(websiteRecord.content.hours || { tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' }), ...hours } as Hours
    });
  };

  const updateBusinessHours = async (hours: BusinessHour[]) => {
    await updateWebsite({ business_hours: hours });
  };

  const updateReviews = async (reviews: Review[]) => {
    await updateWebsite({ reviews });
  };

  const updateAbout = async (about: About) => {
    await updateWebsite({ about });
    
    // Sync team photos to user_media
    try {
      await syncTeamToUserMedia(customerId, about.team);
    } catch (error) {
      console.error('Failed to sync team photos to user_media:', error);
    }
  };

  const updateGallery = async (gallery: Gallery) => {
    await updateWebsite({ gallery });
    
    // Sync gallery images to user_media
    try {
      await syncGalleryToUserMedia(customerId, gallery.images);
    } catch (error) {
      console.error('Failed to sync gallery to user_media:', error);
    }
  };

  const updateStaticContent = async (content: Partial<StaticContent>) => {
    if (!websiteRecord) return;
    await updateWebsite({
      static_content: { ...(websiteRecord.content.static_content || { imprint: '', privacy: '', terms: '' }), ...content } as StaticContent,
    });
  };

  const updateGeneralInfo = async (info: GeneralInfo, siteName?: string) => {
    if (!websiteRecord) return;
    
    const newContent = { ...websiteRecord.content, general: info };
    const updates: any = {
      content: newContent
    };
    
    if (siteName) {
      updates.site_name = siteName;
    }

    try {
      const { error: updateError } = await supabase
        .from('websites')
        .update(updates)
        .eq('customer_id', customerId);

      if (updateError) throw updateError;

      // Optimistic update
      setWebsiteRecord({ 
        ...websiteRecord, 
        content: newContent,
        site_name: siteName || websiteRecord.site_name
      });
    } catch (err: any) {
      console.error('Error updating general info:', err);
      throw err;
    }
  };

  // =====================================================
  // LOGO METHODS
  // =====================================================

  const updateLogos = async (logos: LogoDesign[]) => {
    await updateWebsite({ logos });
  };

  const addLogo = async (logo: LogoDesign) => {
    if (!websiteRecord) return;
    const currentLogos = websiteRecord.content.logos || [];
    await updateWebsite({ logos: [...currentLogos, logo] });
  };

  const updateLogo = async (logoId: string, updates: Partial<LogoDesign>) => {
    if (!websiteRecord) return;
    const currentLogos = websiteRecord.content.logos || [];
    const updatedLogos = currentLogos.map(logo => 
      logo.id === logoId ? { ...logo, ...updates } : logo
    );
    await updateWebsite({ logos: updatedLogos });
  };

  const deleteLogo = async (logoId: string) => {
    if (!websiteRecord) return;
    const currentLogos = websiteRecord.content.logos || [];
    await updateWebsite({ logos: currentLogos.filter(l => l.id !== logoId) });
  };

  const value: WebsiteContextType = {
    website: websiteRecord?.content || null,
    websiteRecord,
    loading,
    error,
    customerId,
    updateWebsite,
    updateSiteSettings,
    updatePages,
    updatePage,
    addPage,
    deletePage,
    updateServices,
    updateService,
    addService,
    deleteService,
    updateContact,
    updateHours,
    updateBusinessHours,
    updateReviews,
    updateAbout,
    updateGallery,
    updateStaticContent,
    updateGeneralInfo,
    updateLogos,
    addLogo,
    updateLogo,
    deleteLogo,
    reload: loadWebsite,
  };

  return <WebsiteContext.Provider value={value}>{children}</WebsiteContext.Provider>;
};

// =====================================================
// HOOK
// =====================================================

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
};
