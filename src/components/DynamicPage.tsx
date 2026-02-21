// =====================================================
// DYNAMIC PAGE – v2 Format Renderer
// Rendert eine Seite aus dem v2 body Elementbaum.
// Keine blocks[] mehr – alles kommt aus body.children.
// =====================================================

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWebsite, pageIsHome, pageIsPublished } from '../contexts/WebsiteContext';
import type { Page } from '../contexts/WebsiteContext';
import { V2ElementRenderer } from './V2ElementRenderer';
import { EditModeToggle } from './admin/EditModeToggle';
import { useViewport } from '../hooks/useViewport';
import { useEditMode } from '../contexts/EditModeContext';
import { V2EditProvider } from './frontend-editor/V2EditContext';
import { V2SelectionOverlay } from './frontend-editor/V2SelectionOverlay';
import { V2InlineToolbar } from './frontend-editor/V2InlineToolbar';
import { V2StylePanel } from './frontend-editor/V2StylePanel';
import { VEThemeProvider } from '../visual-editor/theme/VEThemeBridge';
import {
  updateSEOHead,
  setLocalBusinessStructuredData,
  clearSEOHead,
} from '../utils/seoHead';

// ===== COMPONENT =====

export const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { website, websiteRecord, loading: websiteLoading } = useWebsite();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const viewport = useViewport();
  const { isEditMode } = useEditMode();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!websiteLoading && website) {
      loadPage();
    }
  }, [slug, website, websiteLoading]);

  const loadPage = () => {
    try {
      const targetSlug = slug || 'home';
      const pages = website?.pages || [];

      let foundPage = pages.find(
        (p) => p.slug === targetSlug && pageIsPublished(p)
      );

      // Fallback: if no 'home' slug found, try first published home page
      if (!foundPage && !slug) {
        foundPage = pages.find((p) => pageIsHome(p) && pageIsPublished(p));
      }

      if (!foundPage) {
        setPage(null);
        setLoading(false);
        return;
      }

      setPage(foundPage);
      updateMeta(foundPage);
      setLoading(false);
    } catch (error) {
      console.error('[DynamicPage] Error loading page:', error);
      setLoading(false);
    }
  };

  const updateMeta = (p: Page) => {
    const siteName = websiteRecord?.site_name || website?.general?.name || '';
    const seoTitle = p.seo?.title || p.seo_title || p.title;
    const seoDescription = p.seo?.description || p.meta_description || '';
    const domain = websiteRecord?.domain_name || window.location.hostname;
    const baseUrl = `${window.location.protocol}//${domain}`;
    const pageUrl = pageIsHome(p) ? baseUrl : `${baseUrl}/${p.slug}`;

    // === Full SEO head tags ===
    updateSEOHead({
      title: seoTitle,
      description: seoDescription || undefined,
      siteName: siteName,
      canonicalUrl: pageUrl,
      locale: 'de_DE',
      type: 'website',
      // image: could be extracted from hero block if available
    });

    // === JSON-LD Structured Data for the business (on home page) ===
    if (pageIsHome(p) && website) {
      const contact = website.contact;
      const general = website.general;
      const socialUrls: string[] = [];

      if (contact?.instagram_url) socialUrls.push(contact.instagram_url);
      if (contact?.facebook_url) socialUrls.push(contact.facebook_url);
      if (contact?.tiktok_url) socialUrls.push(contact.tiktok_url);
      if (contact?.youtube_url) socialUrls.push(contact.youtube_url);
      if (contact?.linkedin_url) socialUrls.push(contact.linkedin_url);

      // Convert business_hours to schema.org format
      const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      const schemaOpeningHours: string[] = [];
      if (website.business_hours) {
        for (const bh of website.business_hours) {
          if (bh.is_open && bh.open_time && bh.close_time) {
            const day = dayNames[bh.day_of_week] || '';
            schemaOpeningHours.push(`${day} ${bh.open_time}-${bh.close_time}`);
          }
        }
      }

      setLocalBusinessStructuredData({
        name: general?.full_name || general?.name || siteName,
        description: general?.description || seoDescription || undefined,
        url: baseUrl,
        phone: contact?.phone || undefined,
        email: contact?.email || undefined,
        street: contact?.street || undefined,
        postalCode: contact?.postal_code || undefined,
        city: contact?.city || undefined,
        country: contact?.country || 'DE',
        priceRange: '€€',
        openingHours: schemaOpeningHours.length ? schemaOpeningHours : undefined,
        sameAs: socialUrls.length ? socialUrls : undefined,
      });
    }
  };

  // Cleanup SEO tags when leaving public pages
  useEffect(() => {
    return () => clearSEOHead();
  }, []);

  // ===== LOADING STATE =====

  if (loading || websiteLoading) {
    return (
      <div className="dynamic-page-loading min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // ===== 404 =====

  if (!page) {
    return (
      <div className="dynamic-page-404 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600">Seite nicht gefunden</p>
        </div>
      </div>
    );
  }

  // ===== RENDER =====

  // Get theme colors from settings for color ref resolution
  const themeColors = website?.settings?.theme?.colors || {};
  const allStyles = website?.styles || {};

  // v2 format: render from body element tree
  if (page.body) {
    return (
      <VEThemeProvider>
        <V2EditProvider>
          <div
            ref={containerRef}
            className={`dynamic-page min-h-screen ${isEditMode ? 'v2-edit-mode' : ''}`}
          >
            <V2ElementRenderer
              element={page.body}
              allStyles={allStyles}
              themeColors={themeColors}
              viewport={viewport}
              pageId={page.id}
            />
            <V2SelectionOverlay
              containerRef={containerRef}
              pageBody={page.body}
            />
            <V2InlineToolbar />
            <V2StylePanel pageId={page.id} />
            <EditModeToggle />
          </div>
        </V2EditProvider>
      </VEThemeProvider>
    );
  }

  // Fallback: empty page
  return (
    <div className="dynamic-page-empty min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <p>Diese Seite hat noch keinen Inhalt.</p>
      </div>
    </div>
  );
};
