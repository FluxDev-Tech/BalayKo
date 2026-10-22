import React from 'react';
import { Property, School } from '../types';
import { PropertyCard } from '../components/property/PropertyCard';
import { Heart, Scale, Compass, ArrowRight } from 'lucide-react';

interface FavoritesPageProps {
  properties: Property[];
  favoriteIds: string[];
  compareIds: string[];
  schools: School[];
  onViewPropertyDetails: (property: Property) => void;
  onGetDirections: (property: Property) => void;
  onContactOwner: (property: Property) => void;
  onBookOrInquire?: (property: Property) => void;
  onToggleFavorite: (propertyId: string) => void;
  onToggleCompare: (propertyId: string) => void;
  onOpenCompareModal: () => void;
  onExplore: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  properties,
  favoriteIds,
  compareIds,
  schools,
  onViewPropertyDetails,
  onGetDirections,
  onContactOwner,
  onBookOrInquire,
  onToggleFavorite,
  onToggleCompare,
  onOpenCompareModal,
  onExplore,
}) => {
  const favoriteProperties = properties.filter(p => favoriteIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-[#0b141b] py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 pb-24 md:pb-12 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#075E59] dark:text-emerald-400 uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Student Saved List</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173747] dark:text-slate-100 mt-1">
              Saved Boarding Houses ({favoriteProperties.length})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ang iyong mga paboritong boarding house sa paligid ng Capiz campuses para sa madaling paghambing at pag-inquire.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {compareIds.length > 0 && (
              <button
                onClick={onOpenCompareModal}
                className="py-2.5 px-4 rounded-xl bg-white dark:bg-[#14232d] border border-[#075E59] dark:border-emerald-500/50 text-[#075E59] dark:text-emerald-400 hover:bg-[#075E59]/5 text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>Paghambingin ({compareIds.length}/3)</span>
              </button>
            )}

            <button
              onClick={onExplore}
              className="py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#F6B52E]" />
              <span>Mag-explore sa Mapa</span>
            </button>
          </div>
        </div>

        {/* Saved List or Empty State */}
        {favoriteProperties.length === 0 ? (
          <div className="bg-white dark:bg-[#14232d] rounded-3xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-sm max-w-lg mx-auto my-8 transition-colors">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#173747] dark:text-slate-100">Wala Pang Naka-save na BH</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Habang nagba-browse ng mga boarding house malapit sa CAPSU o alinmang campus sa Capiz, i-click ang heart icon upang itabi rito para sa mabilisang pagpareserba.
            </p>
            <button
              onClick={onExplore}
              className="mt-6 py-2.5 px-6 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md inline-flex items-center gap-2 active:scale-95"
            >
              <span>Mag-browse sa Map Finder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favoriteProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                activeSchool={schools.find(s => s.id === prop.nearestSchoolId)}
                onViewDetails={onViewPropertyDetails}
                onGetDirections={onGetDirections}
                onContactOwner={onContactOwner}
                onBookOrInquire={onBookOrInquire}
                onToggleFavorite={onToggleFavorite}
                onToggleCompare={onToggleCompare}
                isFavorite={true}
                isInComparison={compareIds.includes(prop.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
