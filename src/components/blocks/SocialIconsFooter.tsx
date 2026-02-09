// =====================================================
// SOCIAL ICONS FOOTER COMPONENT
// Reusable Social Media Icons for Footer blocks
// Uses same data source as SocialIconsHeader but with
// footer-specific styling options
// =====================================================

import React from 'react';
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MapPin,
  Star,
  LucideIcon
} from 'lucide-react';
import { useWebsite, Contact } from '../../contexts/WebsiteContext';
import { SocialIconSize, SocialIconVariant } from '../../types/Footer';

// =====================================================
// CUSTOM ICONS (same as SocialIconsHeader)
// =====================================================

const TikTokIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// =====================================================
// TYPES
// =====================================================

type IconComponent = LucideIcon | React.FC<{ size?: number }>;

interface SocialPlatform {
  key: string;
  icon: IconComponent;
  label: string;
  brandColor: string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: 'instagram', icon: Instagram, label: 'Instagram', brandColor: '#E4405F' },
  { key: 'facebook', icon: Facebook, label: 'Facebook', brandColor: '#1877F2' },
  { key: 'tiktok', icon: TikTokIcon, label: 'TikTok', brandColor: '#000000' },
  { key: 'youtube', icon: Youtube, label: 'YouTube', brandColor: '#FF0000' },
  { key: 'twitter', icon: Twitter, label: 'Twitter/X', brandColor: '#1DA1F2' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', brandColor: '#0A66C2' },
  { key: 'whatsapp', icon: WhatsAppIcon, label: 'WhatsApp', brandColor: '#25D366' },
  { key: 'googleBusiness', icon: MapPin, label: 'Google Business', brandColor: '#4285F4' },
  { key: 'yelp', icon: Star, label: 'Yelp', brandColor: '#D32323' },
];

// =====================================================
// PROPS
// =====================================================

export interface SocialIconsFooterProps {
  size?: SocialIconSize;
  variant?: SocialIconVariant;
  color?: string;
  className?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export const SocialIconsFooter: React.FC<SocialIconsFooterProps> = ({
  size = 'medium',
  variant = 'icons-only',
  color,
  className = '',
}) => {
  const { website } = useWebsite();

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  // Map contact fields to platform keys
  const contact = (website?.contact || {}) as Partial<Contact>;
  const socialUrls: Record<string, string | null | undefined> = {
    instagram: contact.instagram_url,
    facebook: contact.facebook_url,
    tiktok: contact.tiktok_url,
    youtube: contact.youtube_url,
    twitter: contact.twitter_url,
    linkedin: contact.linkedin_url,
    whatsapp: contact.whatsapp
      ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`
      : null,
    googleBusiness: contact.google_maps_url,
  };

  const activePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => socialUrls[p.key]
  );

  if (activePlatforms.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {activePlatforms.map(({ key, icon: IconComp, label, brandColor }) => {
        const url = socialUrls[key]!;
        const iconSize = iconSizes[size];

        const baseClasses = 'transition-all duration-200 hover:scale-110 inline-flex items-center justify-center';
        const variantClasses =
          variant === 'with-background'
            ? 'p-2 rounded-full'
            : variant === 'with-border'
            ? 'p-2 border rounded-full'
            : '';

        const variantStyle: React.CSSProperties =
          variant === 'with-background'
            ? { backgroundColor: brandColor, color: '#fff' }
            : variant === 'with-border'
            ? { borderColor: color || 'currentColor', color: color || 'currentColor' }
            : { color: color || 'currentColor' };

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClasses} ${variantClasses}`}
            style={variantStyle}
            aria-label={`Besuchen Sie uns auf ${label}`}
            title={label}
          >
            <IconComp size={iconSize} />
          </a>
        );
      })}
    </div>
  );
};

export default SocialIconsFooter;
