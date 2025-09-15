import db, { media } from '@db';
import { inArray } from 'drizzle-orm';

/**
 * Get media for properties and group by property ID
 * Reusable utility to avoid code duplication across property APIs
 */
export async function getMediaForProperties(propertyIds: string[]) {
  if (propertyIds.length === 0) {
    return {};
  }

  const allMedia = await db
    .select()
    .from(media)
    .where(inArray(media.propertyId, propertyIds))
    .orderBy(media.displayOrder, media.uploadedAt);

  // Group media by property ID
  return allMedia.reduce<Record<string, typeof allMedia>>((acc, mediaItem) => {
    if (!acc[mediaItem.propertyId]) {
      acc[mediaItem.propertyId] = [];
    }
    acc[mediaItem.propertyId].push(mediaItem);
    return acc;
  }, {});
}

/**
 * Add media to properties
 */
export function addMediaToProperties<T extends { id: string }>(
  properties: T[],
  mediaByPropertyId: Record<string, unknown[]>,
): (T & { media: unknown[] })[] {
  return properties.map((property) => ({
    ...property,
    media: mediaByPropertyId[property.id] || [],
  }));
}
