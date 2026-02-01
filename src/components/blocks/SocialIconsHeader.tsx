// =====================================================
// SOCIAL ICONS HEADER COMPONENT
// Social Media Icons für den Header
// =====================================================

import React from 'react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  LucideIcon
} from 'lucide-react';
import { useWebsite, Contact } from '../../contexts/WebsiteContext';

// Custom TikTok Icon (nicht in Lucide)
const TikTokIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

// WhatsApp Icon
const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// =====================================================
// PROPS
// =====================================================

interface SocialIconsHeaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabels?: boolean;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export const SocialIconsHeader: React.FC<SocialIconsHeaderProps> = ({
  size = 'md',
  color,
  showLabels = false,
  direction = 'horizontal',
  className = ''
}) => {
  const { website } = useWebsite();
  
  // Icon sizes
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Get social links from website contact data
  const contact = (website?.contact || {}) as Partial<Contact>;
  const socialMedia = {
    instagram: contact.instagram_url,
    facebook: contact.facebook_url,
    tiktok: contact.tiktok_url,
    youtube: contact.youtube_url,
    twitter: contact.twitter_url,
    linkedin: contact.linkedin_url,
    whatsapp: contact.whatsapp
  };

// Custom icon type for both Lucide and custom icons
type IconComponent = LucideIcon | React.FC<{ size?: number }>;

  // Define available social links with their icons
  const socialLinks: Array<{
    key: string;
    icon: IconComponent;
    label: string;
    url: string | null | undefined;
    hoverColor: string;
  }> = [
    { 
      key: 'instagram', 
      icon: Instagram, 
      label: 'Instagram',
      url: socialMedia.instagram,
      hoverColor: '#E4405F'
    },
    { 
      key: 'facebook', 
      icon: Facebook, 
      label: 'Facebook',
      url: socialMedia.facebook,
      hoverColor: '#1877F2'
    },
    { 
      key: 'tiktok', 
      icon: TikTokIcon, 
      label: 'TikTok',
      url: socialMedia.tiktok,
      hoverColor: '#000000'
    },
    { 
      key: 'youtube', 
      icon: Youtube, 
      label: 'YouTube',
      url: socialMedia.youtube,
      hoverColor: '#FF0000'
    },
    { 
      key: 'twitter', 
      icon: Twitter, 
      label: 'Twitter',
      url: socialMedia.twitter,
      hoverColor: '#1DA1F2'
    },
    { 
      key: 'linkedin', 
      icon: Linkedin, 
      label: 'LinkedIn',
      url: socialMedia.linkedin,
      hoverColor: '#0A66C2'
    },
    { 
      key: 'whatsapp', 
      icon: WhatsAppIcon, 
      label: 'WhatsApp',
      url: socialMedia.whatsapp ? `https://wa.me/${socialMedia.whatsapp.replace(/\D/g, '')}` : null,
      hoverColor: '#25D366'
    }
  ];

  // Filter only links that have URLs
  const activeLinks = socialLinks.filter(link => link.url);

  if (activeLinks.length === 0) {
    return null;
  }

  return (
    <div 
      className={`
        flex items-center
        ${direction === 'vertical' ? 'flex-col space-y-3' : 'flex-row space-x-3'}
        ${className}
      `}
    >
      {activeLinks.map(({ key, icon: IconComp, label, url, hoverColor }) => (
        <a
          key={key}
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full transition-all duration-200 hover:scale-110"
          style={{ color: color || 'currentColor' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = color || 'currentColor';
          }}
          aria-label={label}
          title={label}
        >
          <IconComp size={iconSizes[size]} />
          {showLabels && (
            <span className="ml-2 text-sm">{label}</span>
          )}
        </a>
      ))}
    </div>
  );
};

export default SocialIconsHeader;
