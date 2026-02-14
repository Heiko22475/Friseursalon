import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWebsite } from '../contexts/WebsiteContext';
import Header from './Header';
import { Hero } from './blocks/Hero';
import Services from './Services';
import Reviews from './Reviews';
import Gallery from './Gallery';
import Pricing from './Pricing';
import Contact from './Contact';
import StaticContent from './StaticContent';
import { Grid } from './Grid';
import { GenericCard } from './blocks/GenericCard';
import { NavbarBlock } from './blocks/NavbarBlock';
import Footer from './Footer';
import { FooterBlock } from './blocks/FooterBlock';
import { HeaderBlock } from './blocks/HeaderBlock';
import { EditModeToggle } from './admin/EditModeToggle';

interface PageBlock {
  id: string;
  type: string;
  position: number;
  config: any;
  content: any;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  blocks: PageBlock[];
}

export const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { website, loading: websiteLoading } = useWebsite();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!websiteLoading && website) {
      loadPage();
    }
  }, [slug, website, websiteLoading]);

  const loadPage = () => {
    try {
      // Find page by slug in JSONB
      const targetSlug = slug || 'home';
      const foundPage = website?.pages.find(
        (p) => p.slug === targetSlug && p.is_published
      );

      if (!foundPage) {
        setPage(null);
        setLoading(false);
        return;
      }

      setPage(foundPage);

      // Update page title and meta
      document.title = foundPage.title + ' - Friseursalon Sarah Soriano';
      if (foundPage.meta_description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', foundPage.meta_description);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading page:', error);
      setLoading(false);
    }
  };

  const renderBlock = (block: PageBlock) => {
    const key = `${block.type}-${block.position}`;
    const instanceId = block.position;
    
    switch (block.type) {
      case 'navbar':
        return <NavbarBlock key={key} config={block.config} />;
      case 'hero':
        return <div key={key} id={`hero-${instanceId}`}><Hero config={block.config} instanceId={instanceId} blockId={block.id} /></div>;
      case 'services':
        return <div key={key} id="services"><Services instanceId={instanceId} /></div>;
      case 'gallery':
        return <div key={key} id="gallery"><Gallery instanceId={instanceId} /></div>;
      case 'reviews':
        return <div key={key} id="reviews"><Reviews instanceId={instanceId} /></div>;
      case 'pricing':
        return <div key={key} id="pricing"><Pricing instanceId={instanceId} /></div>;
      case 'contact':
        return <div key={key} id="contact"><Contact /></div>;
      case 'static-content':
        return <div key={key} id="static-content"><StaticContent instanceId={instanceId} /></div>;
      case 'grid':
        return <div key={key} id="grid"><Grid instanceId={instanceId} /></div>;
      case 'generic-card':
        return <div key={key} id={`generic-card-${instanceId}`}><GenericCard config={block.config} instanceId={instanceId} blockId={block.id} /></div>;
      default:
        return null;
    }
  };

  if (loading || websiteLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

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

  // Check if page blocks contain a navbar (replaces legacy header)
  const hasNavbarBlock = page.blocks.some(b => b.type === 'navbar');
  // Check if page blocks contain a footer block (replaces legacy footer)
  const hasFooterBlock = page.blocks.some(b => b.id?.includes('footer'));

  return (
    <div className="min-h-screen">
      {/* Header: skip if page has navbar block */}
      {!hasNavbarBlock && (
        website?.header ? (
          <HeaderBlock config={website.header} />
        ) : (
          <Header />
        )
      )}

      {page.blocks
        .sort((a, b) => a.position - b.position)
        .map((block) => renderBlock(block))}

      {/* Footer: skip if page has footer block, else use FooterBlock config or legacy Footer */}
      {!hasFooterBlock && (
        website?.footer ? (
          <FooterBlock config={website.footer} />
        ) : (
          <Footer />
        )
      )}
      
      {/* Edit Mode Toggle (nur für Admins) */}
      <EditModeToggle />
    </div>
  );
};
