import { property, user } from '@db/schemas';

/**
 * Standard property field selection with user info
 * Used across all property APIs for consistency
 */
export const getPropertyWithUserSelection = () => ({
  // Property fields
  id: property.id,
  userId: property.userId,
  agencyId: property.agencyId,
  title: property.title,
  description: property.description,
  propertyType: property.propertyType,
  listingType: property.listingType,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  parkingSpaces: property.parkingSpaces,
  landSize: property.landSize,
  floorArea: property.floorArea,
  hasAirConditioning: property.hasAirConditioning,
  address: property.address,
  country: property.country,
  price: property.price,
  priceType: property.priceType,
  rentFrequency: property.rentFrequency,
  status: property.status,
  availableFrom: property.availableFrom,
  reviewedAt: property.reviewedAt,
  reviewedBy: property.reviewedBy,
  rejectionReason: property.rejectionReason,
  adminNotes: property.adminNotes,
  searchVector: property.searchVector,
  createdAt: property.createdAt,
  updatedAt: property.updatedAt,
  deletedAt: property.deletedAt,
  // User fields (property owner)
  user: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    profilePicture: user.profilePicture,
    agentNumber: user.agentNumber,
  },
});

/**
 * Property field selection without sensitive admin fields
 * Used for public APIs
 */
export const getPublicPropertySelection = () => ({
  // Property fields (excluding admin-only fields)
  id: property.id,
  userId: property.userId,
  title: property.title,
  description: property.description,
  propertyType: property.propertyType,
  listingType: property.listingType,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  parkingSpaces: property.parkingSpaces,
  landSize: property.landSize,
  floorArea: property.floorArea,
  hasAirConditioning: property.hasAirConditioning,
  address: property.address,
  country: property.country,
  price: property.price,
  priceType: property.priceType,
  rentFrequency: property.rentFrequency,
  status: property.status,
  availableFrom: property.availableFrom,
  createdAt: property.createdAt,
  updatedAt: property.updatedAt,
  // User fields (property owner - public info only)
  user: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    profilePicture: user.profilePicture,
    agentNumber: user.agentNumber,
  },
});
