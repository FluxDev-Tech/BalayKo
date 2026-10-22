export type UserRole = 'student' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  // Specific to student
  preferredSchoolId?: string;
  // Specific to owner
  isVerifiedOwner?: boolean;
  businessName?: string;
}

export interface School {
  id: string;
  name: string;
  shortName: string;
  campusName: string;
  municipality: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string;
  isVerified: boolean;
  totalNearbyProperties?: number;
}

export type PropertyType = 'Boarding House' | 'Dormitory' | 'Apartment / Pad' | 'Transient';
export type RoomType = 'Single Room' | 'Shared Room (2-3)' | 'Bedspace (4+)' | 'Studio Unit';
export type GenderRestriction = 'Any / Co-ed' | 'Female Only' | 'Male Only';

export interface Amenity {
  id: string;
  label: string;
  category: 'utilities' | 'comfort' | 'security' | 'rules';
  icon: string;
}

export type ListingStatus = 'approved' | 'pending' | 'rejected' | 'suspended';

export interface Property {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  isOwnerVerified: boolean;
  isVerifiedListing?: boolean;
  municipality: string;
  barangay: string;
  streetAddress: string;
  lat: number;
  lng: number;
  nearestSchoolId: string;
  distanceToSchoolKm?: number;
  walkingMinutes?: number;
  drivingMinutes?: number;
  monthlyRent: number;
  depositFee?: number;
  propertyType: PropertyType;
  roomType: RoomType;
  genderPolicy: GenderRestriction;
  curfewTime?: string;
  visitorPolicy?: string;
  waterArrangement: 'Included in Rent' | 'Submetered' | 'Shared Bill';
  electricArrangement: 'Included in Rent' | 'Submetered' | 'Shared Bill';
  bathroomType: 'Private Inside Room' | 'Common / Shared';
  kitchenAccess: boolean;
  laundryAccess: boolean;
  wifiSpeedMbps?: number;
  coverImage: string;
  galleryImages: string[];
  description: string;
  amenities: string[];
  status: ListingStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  inquiriesCount: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  propertyName: string;
  studentId: string;
  studentName: string;
  studentSchool?: string;
  rating: number; // 1 to 5 stars
  cleanlinessRating?: number; // 1 to 5
  safetyRating?: number; // 1 to 5
  landlordRating?: number; // 1 to 5
  valueRating?: number; // 1 to 5
  stayDuration?: string; // e.g., '1st Sem 2026', '1 Year', 'Current Boarder'
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyName: string;
  studentId: string;
  studentName: string;
  ownerId: string;
  ownerName: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCountStudent: number;
  unreadCountOwner: number;
}

export interface ReservationRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  targetMoveInDate: string;
  targetSemester: string;
  stayDuration: string;
  preferredRoomType: string;
  occupantsCount: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyName: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  targetType: 'property' | 'school' | 'user';
  timestamp: string;
  notes?: string;
}

export interface FilterState {
  schoolId: string;
  municipality: string;
  searchQuery: string;
  radiusKm: number; // 0.5, 1, 2, 5, or 10
  minRent: number;
  maxRent: number;
  propertyType: string;
  roomType: string;
  genderPolicy: string;
  amenities: string[];
  sortBy: 'distance' | 'price_asc' | 'price_desc' | 'newest';
}
