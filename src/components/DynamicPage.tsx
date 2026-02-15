// =====================================================
// DYNAMIC PAGE – v2 Format Renderer
// Rendert eine Seite aus dem v2 body Elementbaum.
// Keine blocks[] mehr – alles kommt aus body.children.
// =====================================================

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWebsite, pageIsHome, pageIsPublished } from '../contexts/WebsiteContext';
import type { Page } from '../contexts/WebsiteContext';
import { V2ElementRenderer } from './V2ElementRenderer';
import { EditModeToggle } from './admin/EditModeToggle';
import { useViewport } from '../hooks/useViewport';

// ===== COMPONENT =====

export const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { website, websiteRecord, loading: websiteLoading } = useWebsite();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const viewport = useViewport();

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
    const seoTitle = p.seo?.title || p.seo_title;
    document.title = seoTitle || (p.title + (siteName ? ` – ${siteName}` : ''));

    const metaDesc = p.seo?.description || p.meta_description;
    if (metaDesc) {
      const metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) {
        metaEl.setAttribute('content', metaDesc);
      }
    }
  };

  // ===== LOADING STATE =====

  if (loading || websiteLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // ===== 404 =====

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen">
        <V2ElementRenderer
          element={page.body}
          allStyles={allStyles}
          themeColors={themeColors}
          viewport={viewport}
        />
        <EditModeToggle />
      </div>
    );
  }

  // Fallback: empty page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <p>Diese Seite hat noch keinen Inhalt.</p>
      </div>
    </div>
  );
};
