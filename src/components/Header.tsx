import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWebsite } from '../contexts/WebsiteContext';

interface Block {
  type: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { website, websiteRecord } = useWebsite();
  const [currentPageBlocks, setCurrentPageBlocks] = useState<Block[]>([]);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (website) {
      loadHeaderData();
    }
  }, [location.pathname, website]);

  const loadHeaderData = () => {
    const publishedPages = website?.pages.filter(p => p.is_published && (p.show_in_menu || p.is_home)) || [];
    setIsMultiPage(publishedPages.length > 1);

    // If single page, load blocks for scroll navigation
    if (publishedPages.length === 1) {
      setCurrentPageBlocks(publishedPages[0].blocks || []);
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
            {websiteRecord?.site_name || 'Salon'}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {isMultiPage ? (
              // Multi-page mode: Router links
              website?.pages
                .filter(p => p.is_published && (p.show_in_menu || p.is_home))
                .sort((a, b) => a.display_order - b.display_order)
                .map((page) => (
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
                  key={`${block.type}-${index}`}
                  onClick={() => scrollToSection(block.type)}
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  {getBlockLabel(block.type)}
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
              website?.pages
                .filter(p => p.is_published && (p.show_in_menu || p.is_home))
                .sort((a, b) => a.display_order - b.display_order)
                .map((page) => (
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
                  key={`${block.type}-${index}`}
                  onClick={() => scrollToSection(block.type)}
                  className="text-slate-600 hover:text-slate-900 transition text-left"
                >
                  {getBlockLabel(block.type)}
                </button>
              ))
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
