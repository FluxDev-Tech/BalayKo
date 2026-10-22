import React, { useState } from 'react';
import { Property, School, User, PropertyReview } from '../types';
import { StorageService } from '../services/storageService';
import { StarRating } from '../components/common/StarRating';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { ReviewModal } from '../components/property/ReviewModal';
import { 
  ArrowLeft, 
  Heart, 
  Navigation, 
  MessageSquare, 
  ShieldCheck, 
  Check, 
  Footprints, 
  Car, 
  Phone, 
  Share2, 
  AlertTriangle, 
  Scale, 
  Eye, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles,
  Star,
  Smile,
  Tag,
  Trash2,
  Edit3,
  ThumbsUp,
  User as UserIcon
} from 'lucide-react';
import { BalayKoMap } from '../components/map/BalayKoMap';

interface PropertyDetailsPageProps {
  property: Property;
  activeSchool: School | null;
  currentUser?: User | null;
  onRequireAuth?: () => void;
  onBack: () => void;
  onGetDirections: (property: Property) => void;
  onContactOwner: (property: Property, initialMessage?: string) => void;
  onBookOrInquire?: (property: Property) => void;
  onToggleFavorite: (propertyId: string) => void;
  onToggleCompare: (propertyId: string) => void;
  isFavorite: boolean;
  isInComparison: boolean;
  onReportListing: (property: Property) => void;
  onPropertyUpdated?: () => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  property,
  activeSchool,
  currentUser,
  onRequireAuth = () => {},
  onBack,
  onGetDirections,
  onContactOwner,
  onBookOrInquire,
  onToggleFavorite,
  onToggleCompare,
  isFavorite,
  isInComparison,
  onReportListing,
  onPropertyUpdated,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState<PropertyReview[]>(() =>
    StorageService.getPropertyReviews(property.id)
  );
  const [ratingSummary, setRatingSummary] = useState(() =>
    StorageService.calculateRatingSummary(property.id)
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Check if current user already reviewed this property
  const myReview = currentUser && currentUser.role === 'student'
    ? reviews.find((r) => r.studentId === currentUser.id)
    : null;

  const handleRefreshReviews = () => {
    setReviews(StorageService.getPropertyReviews(property.id));
    setRatingSummary(StorageService.calculateRatingSummary(property.id));
    if (onPropertyUpdated) {
      onPropertyUpdated();
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!currentUser) return;
    if (window.confirm('Sigurado ka bang nais mong tanggalin ang iyong review?')) {
      StorageService.deleteReview(reviewId, currentUser.id);
      handleRefreshReviews();
    }
  };

  const images = property.galleryImages.length > 0 ? property.galleryImages : [property.coverImage];

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-[#0b151b] text-[#173747] dark:text-slate-100 pb-28 md:pb-16 transition-colors">
      {/* Top sticky navigation bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#13222d]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#075E59] dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bumalik sa Map at Listings</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Compare toggle */}
            <button
              onClick={() => onToggleCompare(property.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isInComparison
                  ? 'bg-[#075E59]/10 text-[#075E59] dark:text-emerald-400 border-[#075E59] dark:border-emerald-500'
                  : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isInComparison ? 'In Comparison' : 'Compare'}</span>
            </button>

            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(property.id)}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-500'
                  : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from saved' : 'Save property'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Report Button */}
            <button
              onClick={() => onReportListing(property)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              title="I-report ang listing na ito"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Grid: Gallery (7 cols) + Quick Info & Booking (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 bg-slate-900">
              <img
                src={images[activeImageIndex]}
                alt={property.name}
                className="w-full h-full object-cover"
              />

              {/* Verified / Unverified Listing Badge */}
              <div className="absolute top-4 left-4 z-10">
                <VerifiedBadge
                  isVerified={Boolean(property.isVerifiedListing ?? property.isOwnerVerified)}
                  variant="badge"
                  size="md"
                  showUnverified={true}
                />
              </div>

              {/* Views Counter */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                <Eye className="w-3.5 h-3.5 text-slate-300" />
                <span className="tabular-nums">{property.viewsCount || 0} views</span>
              </div>
            </div>

            {/* Thumbnail carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === index
                        ? 'border-[#075E59] scale-102 ring-2 ring-[#075E59]/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info & Inquiry Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-white dark:bg-[#14232d] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md">
              {/* Top metadata & Star Rating shortcut */}
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>{property.propertyType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{property.roomType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{property.genderPolicy}</span>
                </div>

                {/* Rating Shortcut Link to Reviews Section */}
                <a
                  href="#reviews-section"
                  className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors shrink-0"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-xs">
                    {ratingSummary.total > 0 ? ratingSummary.average.toFixed(1) : 'Bago'}
                  </span>
                  <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
                    ({ratingSummary.total})
                  </span>
                </a>
              </div>

              <h1 className="text-2xl font-extrabold text-[#173747] dark:text-slate-100">{property.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400 shrink-0" />
                <span>{property.streetAddress}, {property.barangay}, {property.municipality}, Capiz</span>
              </p>

              {/* Verified Badge Detail Banner */}
              <div className="mt-3">
                <VerifiedBadge
                  isVerified={Boolean(property.isVerifiedListing ?? property.isOwnerVerified)}
                  variant="detail"
                  showUnverified={true}
                  className="w-full justify-start"
                />
              </div>

              {/* Price Banner */}
              <div className="my-5 p-4 rounded-2xl bg-[#075E59]/5 dark:bg-[#075E59]/15 border border-[#075E59]/15 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-[#075E59] dark:text-emerald-400 tabular-nums">
                    ₱{property.monthlyRent.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                </div>
                {property.depositFee ? (
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    <div>Deposit: <strong className="text-slate-700 dark:text-slate-200">₱{property.depositFee.toLocaleString()}</strong></div>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    No Deposit Promo
                  </span>
                )}
              </div>

              {/* Campus Distance & Walking ETA */}
              {property.distanceToSchoolKm !== undefined && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span>Distance from {activeSchool ? activeSchool.shortName : 'Campus'}:</span>
                    <span className="text-[#075E59] dark:text-emerald-400 font-bold">{property.distanceToSchoolKm} km</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Footprints className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
                      <span>{property.walkingMinutes} mins walk</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Car className="w-4 h-4 text-slate-400" />
                      <span>{property.drivingMinutes} mins ride</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 space-y-2.5">
                {onBookOrInquire && (
                  <button
                    type="button"
                    onClick={() => onBookOrInquire(property)}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Calendar className="w-4 h-4 text-[#F6B52E]" />
                    <span>Magpareserba / Reserve Slot Online</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onGetDirections(property)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#173747] dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
                  <span>Get Directions from Campus Gate</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Call Landlord</span>
                  </a>
                  <a
                    href={`sms:${property.ownerPhone.replace(/\s+/g, '')}?body=Good day! Nag-inquire po ako sa ${encodeURIComponent(property.name)} malapit sa ${encodeURIComponent(activeSchool?.shortName || 'campus')}.`}
                    className="py-2.5 px-3 rounded-xl bg-[#075E59]/10 dark:bg-emerald-950/40 hover:bg-[#075E59]/20 text-[#075E59] dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#075E59]/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Send SMS</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Owner Contact Card */}
            <div className="bg-white dark:bg-[#14232d] rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {property.ownerName.charAt(0)}
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Boarding House Host / Owner</div>
                  <div className="text-sm font-bold text-[#173747] dark:text-slate-100">{property.ownerName}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <a href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`} className="hover:text-[#075E59] hover:underline">
                      {property.ownerPhone}
                    </a>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                className="py-2 px-3.5 rounded-xl bg-[#075E59] text-white text-xs font-bold hover:bg-[#064C48] shadow-xs transition-colors flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#F6B52E]" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>

        {/* Detailed Sections: Description, Specs, Amenities, Mini-Map */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-[#14232d] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-[#173747] dark:text-slate-100 mb-3">About This Boarding House</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Specifications & Policies Grid */}
            <div className="bg-white dark:bg-[#14232d] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-[#173747] dark:text-slate-100 mb-4">Rental Policies & Inclusions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Water Supply</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{property.waterArrangement}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Electricity</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{property.electricArrangement}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Bathroom</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{property.bathroomType}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Curfew Time</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{property.curfewTime || 'No Curfew'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Kitchen Cooking</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{property.kitchenAccess ? 'Allowed' : 'Not Allowed'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Laundry Washing</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{property.laundryAccess ? 'Allowed' : 'Not Allowed'}</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white dark:bg-[#14232d] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-[#173747] dark:text-slate-100 mb-4">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-[#075E59]/10 text-[#075E59] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STAR-RATING & STUDENT REVIEWS SECTION */}
            <div id="reviews-section" className="bg-white dark:bg-[#14232d] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>Ratings & Student Feedback</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#173747] dark:text-slate-100 mt-0.5">
                    Mga Review ng mga Estudyante
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tunay na karanasan mula sa mga verified boarder na tumira sa {property.name}.
                  </p>
                </div>

                {/* Write / Edit Review CTA Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      onRequireAuth();
                    } else {
                      setIsReviewModalOpen(true);
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>
                    {!currentUser
                      ? 'Mag-login upang Mag-review'
                      : myReview
                      ? 'I-edit ang Aking Review'
                      : 'Sumulat ng Review'}
                  </span>
                </button>
              </div>

              {/* Rating Summary Metrics Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/70 dark:border-slate-800">
                {/* Big Score (4 cols) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 sm:border-r border-slate-200/70 dark:border-slate-800">
                  <div className="text-4xl sm:text-5xl font-black text-[#173747] dark:text-slate-100 tabular-nums">
                    {ratingSummary.total > 0 ? ratingSummary.average.toFixed(1) : '—'}
                  </div>
                  <div className="mt-2">
                    <StarRating
                      rating={ratingSummary.average}
                      size="md"
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                    {ratingSummary.total > 0
                      ? `Batay sa ${ratingSummary.total} ${ratingSummary.total === 1 ? 'review' : 'reviews'}`
                      : 'Wala pang rating'}
                  </div>
                </div>

                {/* Star Distribution Bars (5 cols) */}
                <div className="md:col-span-5 space-y-1.5 justify-center flex flex-col">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = ratingSummary.distribution[starNum] || 0;
                    const pct = ratingSummary.percentages[starNum] || 0;
                    return (
                      <div key={starNum} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-right font-bold text-slate-600 dark:text-slate-300">
                          {starNum}★
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-[11px] text-slate-400 tabular-nums text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-criteria Averages (3 cols) */}
                <div className="md:col-span-3 space-y-2 text-xs justify-center flex flex-col border-t md:border-t-0 md:border-l border-slate-200/70 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>Kalinisan:</span>
                    </span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {ratingSummary.categories.cleanliness > 0 ? `${ratingSummary.categories.cleanliness}★` : '—'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      <span>Kaligtasan:</span>
                    </span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {ratingSummary.categories.safety > 0 ? `${ratingSummary.categories.safety}★` : '—'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Smile className="w-3 h-3 text-amber-500" />
                      <span>May-ari:</span>
                    </span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {ratingSummary.categories.landlord > 0 ? `${ratingSummary.categories.landlord}★` : '—'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-purple-500" />
                      <span>Sulit:</span>
                    </span>
                    <strong className="text-slate-700 dark:text-slate-200">
                      {ratingSummary.categories.value > 0 ? `${ratingSummary.categories.value}★` : '—'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Star className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Wala pang review ang boarding house na ito
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Naranasan mo na bang tumira o bumisita rito? Maging una sa pag-iwan ng review upang matulungan ang kapwa mag-aaral sa Capiz!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        onRequireAuth();
                      } else {
                        setIsReviewModalOpen(true);
                      }
                    }}
                    className="mt-4 py-2 px-4 rounded-xl bg-[#075E59] text-white text-xs font-bold shadow-xs hover:bg-[#064C48] inline-flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>Mag-iwan ng Unang Review</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    const isMyOwn = currentUser?.id === rev.studentId;
                    const dateFormatted = new Date(rev.createdAt).toLocaleDateString('fil-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={rev.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isMyOwn
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 ring-1 ring-emerald-500/20'
                            : 'bg-white dark:bg-[#14232d] border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#075E59] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                              {rev.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-[#173747] dark:text-slate-100">
                                  {rev.studentName}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Verified Student</span>
                                </span>
                                {isMyOwn && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#075E59] text-white">
                                    Iyong Review
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>{dateFormatted}</span>
                                {rev.stayDuration && (
                                  <>
                                    <span>·</span>
                                    <span className="text-slate-500 dark:text-slate-300 font-medium">
                                      {rev.stayDuration}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Star Rating Badge */}
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-black">{rev.rating}</span>
                            <span className="text-[10px] text-amber-600/70 font-normal">/ 5</span>
                          </div>
                        </div>

                        {/* Review Body */}
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-3 leading-relaxed whitespace-pre-line">
                          {rev.comment}
                        </p>

                        {/* Sub ratings tags */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-3 flex-wrap">
                            {rev.cleanlinessRating && (
                              <span>Kalinisan: <strong className="text-slate-700 dark:text-slate-200">{rev.cleanlinessRating}★</strong></span>
                            )}
                            {rev.safetyRating && (
                              <span>Kaligtasan: <strong className="text-slate-700 dark:text-slate-200">{rev.safetyRating}★</strong></span>
                            )}
                            {rev.landlordRating && (
                              <span>May-ari: <strong className="text-slate-700 dark:text-slate-200">{rev.landlordRating}★</strong></span>
                            )}
                            {rev.valueRating && (
                              <span>Sulit: <strong className="text-slate-700 dark:text-slate-200">{rev.valueRating}★</strong></span>
                            )}
                          </div>

                          {/* Author Actions (Edit / Delete) */}
                          {isMyOwn && (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setIsReviewModalOpen(true)}
                                className="text-xs font-semibold text-[#075E59] dark:text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>I-edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>I-delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mini Interactive Map (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#14232d] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[380px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100">Property Map Location</h3>
                <span className="text-[10px] font-semibold text-[#075E59] dark:text-emerald-400 bg-[#075E59]/10 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Capiz Coordinates
                </span>
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 min-h-[260px]">
                <BalayKoMap
                  center={[property.lat, property.lng]}
                  zoom={16}
                  properties={[property]}
                  selectedPropertyId={property.id}
                  onSelectProperty={() => {}}
                  activeSchool={activeSchool}
                />
              </div>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Lat: {property.lat.toFixed(4)}, Lng: {property.lng.toFixed(4)}</span>
                <button
                  type="button"
                  onClick={() => onGetDirections(property)}
                  className="text-xs font-bold text-[#075E59] dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#13222d]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 p-3 md:hidden flex items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Buwanang Upa</span>
            {ratingSummary.total > 0 && (
              <span className="font-bold text-amber-500 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                <span>{ratingSummary.average}</span>
              </span>
            )}
          </div>
          <div className="text-base font-black text-[#075E59] dark:text-emerald-400 tabular-nums">
            ₱{property.monthlyRent.toLocaleString()}
            <span className="text-[10px] font-normal text-slate-500"> /buwan</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700"
            title="Tawagan ang Landlord"
          >
            <Phone className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
          </a>

          {onBookOrInquire && (
            <button
              type="button"
              onClick={() => onBookOrInquire(property)}
              className="py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Calendar className="w-4 h-4 text-[#F6B52E]" />
              <span>Magpareserba</span>
            </button>
          )}
        </div>
      </div>

      {/* Review & Star Rating Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        property={property}
        currentUser={currentUser || null}
        onRequireAuth={onRequireAuth}
        existingReview={myReview}
        onReviewSubmitted={() => {
          handleRefreshReviews();
        }}
      />
    </div>
  );
};
