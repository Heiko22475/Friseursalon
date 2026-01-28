import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from './Header';
import Hero from './Hero';
import Services from './Services';
import About from './About';
import Reviews from './Reviews';
import Gallery from './Gallery';
import Pricing from './Pricing';
import Contact from './Contact';
import StaticContent from './StaticContent';
import { Grid } from './Grid';
import Footer from './Footer';

interface PageBlock {
  id: string;
  block_type: string;
  block_instance_id: number;
  is_enabled: boolean;
  display_order: number;
  config: any;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
}

export const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      // Load page info
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug || 'home')
        .eq('is_enabled', true)
        .single();

      if (pageError) throw pageError;
      setPage(pageData);

      // Update page title and meta
      if (pageData) {
        document.title = pageData.title + ' - Friseursalon Sarah Soriano';
        if (pageData.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', pageData.meta_description);
          }
        }
      }

      // Load page blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('is_enabled', true)
        .order('display_order', { ascending: true });

      if (blocksError) throw blocksError;
      setBlocks(blocksData || []);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = (block: PageBlock) => {
    const key = `${block.block_type}-${block.block_instance_id}`;
    const instanceId = block.block_instance_id;
    
    switch (block.block_type) {
      case 'hero':
        return <div key={key} id="hero"><Hero /></div>;
      case 'services':
        return <div key={key} id="services"><Services instanceId={instanceId} /></div>;
      case 'about':
        return <div key={key} id="about"><About /></div>;
      case 'gallery':
        return <div key={key} id="gallery"><Gallery instanceId={instanceId} /></div>;
      case 'reviews':
        return <div key={key} id="reviews"><Reviews instanceId={instanceId} /></div>;
      case 'pricing':
        return <div key={key} id="pricing"><Pricing instanceId={instanceId} /></div>;
      case 'hours':
        return <div key={key} id="hours"><Contact /></div>;
      case 'contact':
        return <div key={key} id="contact"><Contact /></div>;
      case 'static-content':
        return <div key={key} id="static-content"><StaticContent instanceId={instanceId} /></div>;
      case 'grid':
        return <div key={key} id="grid"><Grid instanceId={instanceId} /></div>;
      default:
        return null;
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen">
      <Header />
      {blocks.map((block) => renderBlock(block))}
      <Footer />
    </div>
  );
};
