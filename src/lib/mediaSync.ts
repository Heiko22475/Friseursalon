// =====================================================
// MEDIA SYNC: Synchronisiert user_media Tabelle mit JSON
// =====================================================

import { supabase } from './supabase';

// =====================================================
// TYPES
// =====================================================

export type MediaType = 'gallery_image' | 'team_photo' | 'hero_image' | 'service_image';

export interface UserMedia {
  id: string;
  customer_id: string;
  media_type: MediaType;
  url: string;
  storage_path?: string;
  caption?: string;
  alt_text?: string;
  title?: string;
  display_order: number;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StockPhoto {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: 'gallery' | 'hero' | 'team' | 'service';
  tags?: string[];
  thumbnail_url?: string;
  width?: number;
  height?: number;
  created_at: string;
}

export interface GalleryImageData {
  id: string;
  url: string;
  alt_text: string;
  caption: string | null;
  display_order: number;
}

// =====================================================
// GALLERY SYNC FUNCTIONS
// =====================================================

/**
 * Synchronisiert Gallery-Bilder vom JSON in die user_media Tabelle
 * Wird nach jedem Gallery-Update aufgerufen
 */
export async function syncGalleryToUserMedia(
  customerId: string,
  galleryImages: GalleryImageData[]
): Promise<void> {
  try {
    // 1. Hole alle existierenden gallery_image Einträge
    const { data: existingMedia, error: fetchError } = await supabase
      .from('user_media')
      .select('*')
      .eq('customer_id', customerId)
      .eq('media_type', 'gallery_image');

    if (fetchError) throw fetchError;

    const existingUrls = new Set(existingMedia?.map(m => m.url) || []);
    const currentUrls = new Set(galleryImages.map(img => img.url));

    // 2. Lösche Bilder die nicht mehr im JSON sind
    const urlsToDelete = [...existingUrls].filter(url => !currentUrls.has(url));
    if (urlsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_media')
        .delete()
        .eq('customer_id', customerId)
        .eq('media_type', 'gallery_image')
        .in('url', urlsToDelete);

      if (deleteError) throw deleteError;
    }

    // 3. Insert oder Update für jedes Bild im JSON
    for (const image of galleryImages) {
      const existing = existingMedia?.find(m => m.url === image.url);

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('user_media')
          .update({
            caption: image.caption || '',
            alt_text: image.alt_text || '',
            display_order: image.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('user_media')
          .insert({
            customer_id: customerId,
            media_type: 'gallery_image',
            url: image.url,
            caption: image.caption || '',
            alt_text: image.alt_text || '',
            display_order: image.display_order,
            is_active: true
          });

        if (insertError) throw insertError;
      }
    }

    console.log(`Gallery sync completed: ${galleryImages.length} images`);
  } catch (error) {
    console.error('Error syncing gallery to user_media:', error);
    throw error;
  }
}

/**
 * Lädt Gallery-Bilder aus user_media (Backup/Recovery)
 */
export async function loadGalleryFromUserMedia(customerId: string): Promise<GalleryImageData[]> {
  try {
    const { data, error } = await supabase
      .from('user_media')
      .select('*')
      .eq('customer_id', customerId)
      .eq('media_type', 'gallery_image')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return (data || []).map(media => ({
      id: media.id,
      url: media.url,
      alt_text: media.alt_text || '',
      caption: media.caption || null,
      display_order: media.display_order
    }));
  } catch (error) {
    console.error('Error loading gallery from user_media:', error);
    throw error;
  }
}

// =====================================================
// TEAM SYNC FUNCTIONS
// =====================================================

export interface TeamMemberData {
  id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string | null;
  display_order: number;
}

/**
 * Synchronisiert Team-Fotos vom JSON in die user_media Tabelle
 */
export async function syncTeamToUserMedia(
  customerId: string,
  teamMembers: TeamMemberData[]
): Promise<void> {
  try {
    // Hole existierende team_photo Einträge
    const { data: existingMedia, error: fetchError } = await supabase
      .from('user_media')
      .select('*')
      .eq('customer_id', customerId)
      .eq('media_type', 'team_photo');

    if (fetchError) throw fetchError;

    const existingByMemberId = new Map(
      existingMedia?.map(m => [m.metadata?.member_id, m]) || []
    );

    // Delete old team photos
    const currentMemberIds = new Set(teamMembers.map(m => m.id));
    const toDelete = existingMedia?.filter(m => !currentMemberIds.has(m.metadata?.member_id)) || [];
    
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_media')
        .delete()
        .in('id', toDelete.map(m => m.id));

      if (deleteError) throw deleteError;
    }

    // Insert or update team photos
    for (const member of teamMembers) {
      if (!member.image_url) continue;

      const existing = existingByMemberId.get(member.id);

      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from('user_media')
          .update({
            url: member.image_url,
            title: member.name,
            alt_text: `${member.name} - ${member.position}`,
            display_order: member.display_order,
            metadata: { member_id: member.id, position: member.position },
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('user_media')
          .insert({
            customer_id: customerId,
            media_type: 'team_photo',
            url: member.image_url,
            title: member.name,
            alt_text: `${member.name} - ${member.position}`,
            display_order: member.display_order,
            is_active: true,
            metadata: { member_id: member.id, position: member.position }
          });

        if (insertError) throw insertError;
      }
    }

    console.log(`Team sync completed: ${teamMembers.length} members`);
  } catch (error) {
    console.error('Error syncing team to user_media:', error);
    throw error;
  }
}

// =====================================================
// STOCK PHOTOS FUNCTIONS
// =====================================================

/**
 * Lädt Stock-Photos nach Kategorie
 */
export async function loadStockPhotos(category?: string): Promise<StockPhoto[]> {
  try {
    let query = supabase.from('stock_photos').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error loading stock photos:', error);
    throw error;
  }
}

/**
 * Sucht Stock-Photos nach Tags
 */
export async function searchStockPhotos(tags: string[]): Promise<StockPhoto[]> {
  try {
    const { data, error } = await supabase
      .from('stock_photos')
      .select('*')
      .overlaps('tags', tags)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching stock photos:', error);
    throw error;
  }
}

/**
 * Erstellt neues Stock-Photo (Admin-Funktion)
 */
export async function createStockPhoto(photo: Omit<StockPhoto, 'id' | 'created_at'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('stock_photos')
      .insert(photo)
      .select()
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error creating stock photo:', error);
    throw error;
  }
}

// =====================================================
// GENERAL USER MEDIA FUNCTIONS
// =====================================================

/**
 * Lädt alle User-Medien eines Kunden
 */
export async function loadAllUserMedia(customerId: string): Promise<UserMedia[]> {
  try {
    const { data, error } = await supabase
      .from('user_media')
      .select('*')
      .eq('customer_id', customerId)
      .eq('is_active', true)
      .order('media_type', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error loading user media:', error);
    throw error;
  }
}

/**
 * Lädt User-Medien nach Typ
 */
export async function loadUserMediaByType(
  customerId: string,
  mediaType: MediaType
): Promise<UserMedia[]> {
  try {
    const { data, error } = await supabase
      .from('user_media')
      .select('*')
      .eq('customer_id', customerId)
      .eq('media_type', mediaType)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error loading user media by type:', error);
    throw error;
  }
}

/**
 * Löscht ein User-Media (soft delete)
 */
export async function deleteUserMedia(mediaId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_media')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', mediaId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user media:', error);
    throw error;
  }
}

/**
 * Löscht User-Media permanent (hard delete)
 */
export async function deleteUserMediaPermanent(mediaId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_media')
      .delete()
      .eq('id', mediaId);

    if (error) throw error;
  } catch (error) {
    console.error('Error permanently deleting user media:', error);
    throw error;
  }
}
