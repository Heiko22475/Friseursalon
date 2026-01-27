import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Page {
  id: string;
  slug: string;
  title: string;
  display_order: number;
}

interface Block {
  block_type: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [salonName, setSalonName] = useState('Salon');
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageBlocks, setCurrentPageBlocks] = useState<Block[]>([]);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const location = useLocation();

  useEffect(() => {
    loadHeaderData();
  }, [location.pathname]);

  const loadHeaderData = async () => {
    // Load salon name
    const { data: generalData } = await supabase
      .from('general')
      .select('name')
      .single();

    if (generalData) setSalonName(generalData.name);

    // Load all enabled pages
    const { data: pagesData } = await supabase
      .from('pages')
      .select('id, slug, title, display_order')
      .eq('is_enabled', true)
      .order('display_order', { ascending: true });

    if (pagesData) {
      setPages(pagesData);
      setIsMultiPage(pagesData.length > 1);

      // If single page, load blocks for scroll navigation
      if (pagesData.length === 1) {
        const { data: blocksData } = await supabase
          .from('page_blocks')
          .select('block_type')
          .eq('page_id', pagesData[0].id)
          .eq('is_enabled', true)
          .order('display_order', { ascending: true });

        if (blocksData) setCurrentPageBlocks(blocksData);
      }
    }
  };

  const scrollToSection = (blockType: string) => {
    const element = document.getElementById(blockType);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const getBlockLabel = (blockType: string): string => {
    const labels: Record<string, string> = {
      hero: 'Home',
      services: 'Services',
      about: 'About',
      gallery: 'Gallery',
      reviews: 'Reviews',
      pricing: 'Pricing',
      hours: 'Hours',
      contact: 'Contact',
    };
    return labels[blockType] || blockType;
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-800">
            {salonName}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {isMultiPage ? (
              // Multi-page mode: Router links
              pages.map((page) => (
                <Link
                  key={page.id}
                  to={page.slug === 'home' ? '/' : `/${page.slug}`}
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  {page.title}
                </Link>
              ))
            ) : (
              // Single-page mode: Scroll navigation
              currentPageBlocks.map((block, index) => (
                <button
                  key={`${block.block_type}-${index}`}
                  onClick={() => scrollToSection(block.block_type)}
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  {getBlockLabel(block.block_type)}
                </button>
              ))
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col space-y-3">
            {isMultiPage ? (
              // Multi-page mode: Router links
              pages.map((page) => (
                <Link
                  key={page.id}
                  to={page.slug === 'home' ? '/' : `/${page.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-600 hover:text-slate-900 transition text-left"
                >
                  {page.title}
                </Link>
              ))
            ) : (
              // Single-page mode: Scroll navigation
              currentPageBlocks.map((block, index) => (
                <button
                  key={`${block.block_type}-${index}`}
                  onClick={() => scrollToSection(block.block_type)}
                  className="text-slate-600 hover:text-slate-900 transition text-left"
                >
                  {getBlockLabel(block.block_type)}
                </button>
              ))
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
