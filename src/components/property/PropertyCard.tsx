import React from 'react';
import { Property, School } from '../../types';
import { Heart, Navigation, Eye, Check, MessageSquare, ShieldCheck, Footprints, Car, Calendar, Image as ImageIcon, Star } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface PropertyCardProps {
  property: Property;
  activeSchool?: School | null;
  isSelected?: boolean;
  onSelect?: (property: Property) => void;
  onViewDetails: (property: Property) => void;
  onGetDirections: (property: Property) => void;
  onContactOwner: (property: Property) => void;
  onBookOrInquire?: (property: Property) => void;
  onToggleFavorite?: (propertyId: string) => void;
  onToggleCompare?: (propertyId: string) => void;
  isFavorite?: boolean;
  isInComparison?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  activeSchool,
  isSelected = false,
  onSelect,
  onViewDetails,
  onGetDirections,
  onContactOwner,
  onBookOrInquire,
  onToggleFavorite,
  onToggleCompare,
  isFavorite = false,
  isInComparison = false,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property.id);
    } else {
      StorageService.toggleFavorite(property.id);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(property.id);
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(property)}
      className={`group relative bg-white dark:bg-[#14232d] rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isSelected
          ? 'border-[#075E59] dark:border-emerald-400 shadow-md ring-2 ring-[#075E59]/20 dark:ring-emerald-400/20'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      }`}
    >
      {/* Property Cover Image Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={property.coverImage}
          alt={property.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // CSS/SVG fallback container if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-rose-500 shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'
            }`}
          />
        </button>

        {/* Verified / Unverified Badge */}
        <div className="absolute top-3 left-3 z-10">
          <VerifiedBadge
            isVerified={Boolean(property.isVerifiedListing ?? property.isOwnerVerified)}
            variant="badge"
            size="sm"
            showUnverified={true}
          />
        </div>

        {/* Price Tag in Image Bottom */}
        <div className="absolute bottom-3 left-3 bg-[#173747]/90 dark:bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-md flex items-baseline gap-1">
          <span className="text-base font-bold tabular-nums text-[#F6B52E]">
            ₱{property.monthlyRent.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-300">/ month</span>
        </div>
        {/* Photo count indicator */}
        {property.galleryImages && property.galleryImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
            <ImageIcon className="w-3 h-3" />
            <span>{property.galleryImages.length} photos</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata & Star Rating */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>{property.propertyType}</span>
              <span aria-hidden="true">·</span>
              <span>{property.roomType}</span>
              <span aria-hidden="true">·</span>
              <span>{property.genderPolicy}</span>
            </div>

            {/* Star Rating Badge */}
            <div 
              className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 shrink-0 font-sans"
              title={property.averageRating ? `${property.averageRating} stars out of 5 (${property.totalReviews || 0} reviews)` : 'Bagong listing, wala pang review'}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-black">
                {property.averageRating ? property.averageRating.toFixed(1) : 'Bago'}
              </span>
              {property.totalReviews ? (
                <span className="text-[10px] text-amber-600/90 dark:text-amber-400/90 font-medium">({property.totalReviews})</span>
              ) : null}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-[#173747] dark:text-slate-100 group-hover:text-[#075E59] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {property.name}
          </h3>

          {/* Location */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {property.barangay}, {property.municipality}, Capiz
          </p>

          {/* Distance and Travel ETA */}
          {property.distanceToSchoolKm !== undefined && (
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-2.5 py-1.5 px-2 bg-slate-50 dark:bg-slate-850/80 rounded-lg border border-transparent dark:border-slate-800">
              <div className="flex items-center gap-1 font-medium text-[#075E59] dark:text-emerald-400">
                <Footprints className="w-3.5 h-3.5" />
                <span className="tabular-nums">{property.walkingMinutes} min walk</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Car className="w-3.5 h-3.5" />
                <span className="tabular-nums">{property.drivingMinutes} min ride</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-200">
                {property.distanceToSchoolKm} km from {activeSchool ? activeSchool.shortName : 'campus'}
              </span>
            </div>
          )}

          {/* Amenity preview tags (unboxed text) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-3">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <React.Fragment key={amenity}>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Check className="w-3 h-3 text-[#075E59] dark:text-emerald-400" />
                  <span>{amenity}</span>
                </span>
                {idx < Math.min(property.amenities.length, 3) - 1 && (
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
          {/* Quick Reserve/Inquire Button */}
          {onBookOrInquire && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookOrInquire(property);
              }}
              className="py-1.5 px-2.5 rounded-lg bg-[#075E59]/10 dark:bg-emerald-950/40 hover:bg-[#075E59]/20 text-[#075E59] dark:text-emerald-400 text-xs font-bold border border-[#075E59]/30 transition-all flex items-center gap-1 active:scale-95"
              title="Magpareserba o mag-inquire sa may-ari"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F6B52E]" />
              <span>Magpareserba</span>
            </button>
          )}

          {/* Directions button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onGetDirections(property);
            }}
            className="px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#075E59] dark:hover:text-emerald-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
            title="Tingnan ang ruta mula sa campus"
          >
            <Navigation className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
            <span className="hidden sm:inline">Ruta</span>
          </button>

          {/* Compare toggle */}
          <button
            type="button"
            onClick={handleCompareClick}
            className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              isInComparison
                ? 'bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 border-[#075E59] dark:border-emerald-600'
                : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            title="I-compare hanggang 3 bahay"
          >
            <span>{isInComparison ? 'Comparing' : '+ Compare'}</span>
          </button>

          {/* View Details button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property);
            }}
            className="ml-auto px-3 py-1.5 text-xs font-bold text-white bg-[#075E59] hover:bg-[#064C48] rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
