import React, { useState, useMemo, useEffect } from 'react';
import { School, Property } from '../types';
import { INITIAL_SCHOOLS } from '../data/schoolsData';
import { StorageService } from '../services/storageService';
import { BalayKoMap } from '../components/map/BalayKoMap';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyListSkeleton } from '../components/property/PropertyCardSkeleton';
import { CAPIZ_MUNICIPALITIES, calculateDistanceKm } from '../data/capizMunicipalities';
import { Search, Filter, School as SchoolIcon, MapPin, SlidersHorizontal, Map as MapIcon, List, X, Sparkles, Navigation, Eye, CheckCircle2, Phone, Calendar, ArrowUpDown, Star, RefreshCw, ChevronDown } from 'lucide-react';

interface ExplorePageProps {
  schools: School[];
  properties: Property[];
  activeSchool: School | null;
  onSelectSchool: (school: School) => void;
  onViewPropertyDetails: (property: Property) => void;
  onGetDirections: (property: Property) => void;
  onContactOwner: (property: Property) => void;
  onBookOrInquire?: (property: Property) => void;
  onToggleFavorite: (propertyId: string) => void;
  onToggleCompare: (propertyId: string) => void;
  favoriteIds: string[];
  compareIds: string[];
  selectedPropertyId?: string | null;
  onSelectPropertyId?: (id: string | null) => void;
  onRefreshProperties?: () => void;
  onOpenCampusSelector?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  schools,
  properties,
  activeSchool,
  onSelectSchool,
  onViewPropertyDetails,
  onGetDirections,
  onContactOwner,
  onBookOrInquire,
  onToggleFavorite,
  onToggleCompare,
  favoriteIds,
  compareIds,
  selectedPropertyId: externalSelectedPropertyId,
  onSelectPropertyId: externalOnSelectPropertyId,
  onRefreshProperties,
  onOpenCampusSelector,
  searchQuery: externalSearchQuery = '',
  onSearchChange: externalOnSearchChange,
}) => {
  // Mobile view mode: 'map' or 'list'
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Selected school with bulletproof default fallback to CAPSU Pilar
  const currentSchool = activeSchool || schools.find(s => s.id === 'capsu-pilar') || schools[0] || INITIAL_SCHOOLS[0];

  // Filters
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const setSearchQuery = (val: string) => {
    setLocalSearchQuery(val);
    if (externalOnSearchChange) {
      externalOnSearchChange(val);
    }
  };

  const [selectedMunicipality, setSelectedMunicipality] = useState('All');
  const [radiusKm, setRadiusKm] = useState<number>(2); // 0.5, 1, 2, 5
  const [maxRent, setMaxRent] = useState<number>(5000);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'price_desc' | 'rating_desc'>('distance');
  const [priceQuickFilter, setPriceQuickFilter] = useState<'all' | 'under1500' | '1500to2500' | 'above2500'>('all');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Subtle Loading Skeleton State
  const [isFetchingProperties, setIsFetchingProperties] = useState(false);

  useEffect(() => {
    setIsFetchingProperties(true);
    const timer = setTimeout(() => {
      setIsFetchingProperties(false);
    }, 380);
    return () => clearTimeout(timer);
  }, [currentSchool?.id, selectedMunicipality, maxRent, priceQuickFilter, selectedRoomType, selectedGender, radiusKm, sortBy]);

  // Internal selected property state synced with external
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const selectedPropertyId = externalSelectedPropertyId !== undefined ? externalSelectedPropertyId : internalSelectedId;

  const setSelectedPropertyId = (id: string | null) => {
    setInternalSelectedId(id);
    if (externalOnSelectPropertyId) {
      externalOnSelectPropertyId(id);
    }
  };

  // User GPS location
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Map center defaults to active school coordinates or selected property
  const mapCenter: [number, number] = useMemo(() => {
    if (selectedPropertyId) {
      const prop = properties.find(p => p.id === selectedPropertyId);
      if (prop) return [prop.lat, prop.lng];
    }
    return [currentSchool?.lat ?? 11.4840, currentSchool?.lng ?? 123.0051];
  }, [currentSchool, selectedPropertyId, properties]);

  // Request browser geolocation
  const handleRequestUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        setIsLocating(false);
        alert(`Location permission denied or unavailable (${err.message}). You can still select campuses manually.`);
      },
      { timeout: 10000 }
    );
  };

  // Filter and sort approved properties
  const filteredProperties = useMemo(() => {
    const schoolLat = currentSchool?.lat ?? 11.4883;
    const schoolLng = currentSchool?.lng ?? 122.9961;

    const list = properties.filter((prop) => {
      // Must be approved listing
      if (prop.status !== 'approved') return false;

      // Municipality filter
      if (selectedMunicipality !== 'All' && prop.municipality !== selectedMunicipality) {
        return false;
      }

      // Rent filter
      if (prop.monthlyRent > maxRent) return false;

      // Price quick filter
      if (priceQuickFilter === 'under1500' && prop.monthlyRent >= 1500) return false;
      if (priceQuickFilter === '1500to2500' && (prop.monthlyRent < 1500 || prop.monthlyRent > 2500)) return false;
      if (priceQuickFilter === 'above2500' && prop.monthlyRent <= 2500) return false;

      // Room type filter
      if (selectedRoomType !== 'All' && prop.roomType !== selectedRoomType) return false;

      // Gender filter
      if (selectedGender !== 'All' && prop.genderPolicy !== selectedGender) return false;

      // Search query (matches name, street, barangay, or amenities)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prop.name.toLowerCase().includes(q);
        const matchesAddress = prop.streetAddress.toLowerCase().includes(q);
        const matchesBrgy = prop.barangay.toLowerCase().includes(q);
        const matchesAmenity = prop.amenities.some(a => a.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesBrgy && !matchesAmenity) return false;
      }

      // Distance from current school
      const dist = calculateDistanceKm(prop.lat, prop.lng, schoolLat, schoolLng);
      if (radiusKm && dist > radiusKm) {
        return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'rating_desc') {
        const ratingA = a.averageRating ?? 0;
        const ratingB = b.averageRating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.totalReviews ?? 0) - (a.totalReviews ?? 0);
      }
      if (sortBy === 'price_asc') {
        return a.monthlyRent - b.monthlyRent;
      }
      if (sortBy === 'price_desc') {
        return b.monthlyRent - a.monthlyRent;
      }
      const distA = calculateDistanceKm(a.lat, a.lng, schoolLat, schoolLng);
      const distB = calculateDistanceKm(b.lat, b.lng, schoolLat, schoolLng);
      return distA - distB;
    });
  }, [properties, selectedMunicipality, maxRent, priceQuickFilter, selectedRoomType, selectedGender, searchQuery, currentSchool, radiusKm, sortBy]);

  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId);
  }, [properties, selectedPropertyId]);

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)] sm:h-[calc(100dvh-4rem-4rem)] md:h-[calc(100dvh-4rem)] overflow-hidden bg-[#F6F8F7] dark:bg-[#0b151b] transition-colors">
      {/* MAIN VIEWPORT: SPLIT SCREEN (DESKTOP) / TAB TOGGLED (MOBILE) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE: RESULTS LIST (VISIBLE ON DESKTOP OR WHEN LIST TAB ACTIVE ON MOBILE) */}
        <div
          className={`w-full md:w-[420px] lg:w-[480px] xl:w-[520px] h-full overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13222d] flex flex-col shrink-0 transition-colors ${
            mobileView === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Clean Results Header with Campus Selector, Filters, and Sort */}
          <div className="p-2.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex flex-col gap-2 shrink-0 transition-colors">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {/* Sleek Campus Selector Dropdown Trigger Button */}
              {onOpenCampusSelector ? (
                <button
                  type="button"
                  onClick={onOpenCampusSelector}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700 text-[#173747] dark:text-slate-100 text-xs font-bold transition-all group shadow-2xs cursor-pointer min-w-0"
                  title="Pumili ng ibang Capiz Campus"
                >
                  <div className="w-5 h-5 rounded-lg bg-[#075E59] text-[#F6B52E] flex items-center justify-center shrink-0">
                    <SchoolIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px]">{currentSchool.shortName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#075E59] transition-colors shrink-0" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-[#173747] dark:text-slate-100 truncate">
                  <SchoolIcon className="w-4 h-4 text-[#075E59] shrink-0" />
                  <span className="truncate">{currentSchool.shortName}</span>
                </div>
              )}

              {/* Right Controls: Filters Drawer Button & Mobile Map Toggle */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                    (priceQuickFilter !== 'all' || selectedRoomType !== 'All' || selectedGender !== 'All' || radiusKm !== 2)
                      ? 'bg-[#075E59] text-white border-[#075E59]'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                  }`}
                  title="Buksan ang mga Filter (Presyo, Kwarto, Radius)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>

                {/* Mobile View Toggle Switch (Map vs List) */}
                <div className="md:hidden flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMobileView('map')}
                    className={`py-1 px-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      mobileView === 'map' ? 'bg-white dark:bg-slate-700 text-[#075E59] dark:text-emerald-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className={`py-1 px-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      mobileView === 'list' ? 'bg-white dark:bg-slate-700 text-[#075E59] dark:text-emerald-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-header: Count and Quick Sort */}
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80">
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                {isFetchingProperties
                  ? 'Nilo-load ang mga boarding houses...'
                  : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'Boarding House' : 'Boarding Houses'} (${radiusKm}km)`}
              </span>

              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                >
                  <option value="distance">Pinakamalapit sa Campus</option>
                  <option value="price_asc">Mababang Upa</option>
                  <option value="price_desc">Mataas na Upa</option>
                  <option value="rating_desc">Mataas na Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Content: Skeletons or Property Cards */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-20 md:pb-6 space-y-3 sm:space-y-4 overscroll-contain">
            {isFetchingProperties ? (
              <PropertyListSkeleton count={4} />
            ) : filteredProperties.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100">Wala Pang Boarding House sa Filter na Ito</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Maaari mong luwagan ang radius filter o i-load ang mga sample boarding houses (Verified & Unverified) para sa Capiz campuses.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRadiusKm(5);
                      setMaxRent(5000);
                      setSelectedMunicipality('All');
                      setSelectedRoomType('All');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      StorageService.resetDemoData();
                      if (onRefreshProperties) onRefreshProperties();
                      setRadiusKm(5);
                      setMaxRent(5000);
                      setSelectedMunicipality('All');
                      setSelectedRoomType('All');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F6B52E]" />
                    <span>I-load Sample Listings</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  activeSchool={currentSchool}
                  isSelected={property.id === selectedPropertyId}
                  onSelect={(p) => setSelectedPropertyId(p.id)}
                  onViewDetails={onViewPropertyDetails}
                  onGetDirections={onGetDirections}
                  onContactOwner={onContactOwner}
                  onBookOrInquire={onBookOrInquire}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  isFavorite={favoriteIds.includes(property.id)}
                  isInComparison={compareIds.includes(property.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANE: REAL INTERACTIVE MAP */}
        <div
          className={`flex-1 h-full relative ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <BalayKoMap
            center={mapCenter}
            zoom={15}
            properties={filteredProperties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={(p) => setSelectedPropertyId(p.id)}
            activeSchool={currentSchool}
            schools={schools}
            onSelectSchool={(s) => {
              onSelectSchool(s);
              setSelectedPropertyId(null);
            }}
            radiusKm={radiusKm}
            userLocation={userLocation}
            onRequestUserLocation={handleRequestUserLocation}
            isLocating={isLocating}
            onOpenCampusSelector={onOpenCampusSelector}
            isLoading={isFetchingProperties}
          />

          {/* Mobile Floating List Toggle Button when viewing Map */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-[400]">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className="px-4 py-2.5 rounded-full bg-[#173747] text-white shadow-xl flex items-center gap-2 text-xs font-bold active:scale-95 transition-all border border-slate-700 cursor-pointer"
            >
              <List className="w-3.5 h-3.5 text-[#F6B52E]" />
              <span>Tingnan ang Listahan ({filteredProperties.length})</span>
            </button>
          </div>

          {/* Selected Property Preview Popup / Bottom Sheet on Map (Mobile & Desktop) */}
          {selectedProperty && (
            <div className="absolute bottom-4 md:bottom-6 left-2.5 right-2.5 md:left-auto md:right-6 md:w-96 z-[450] animate-slide-up">
              <div className="bg-white dark:bg-[#14232d] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[75vh] overflow-y-auto">
                <div className="relative aspect-[16/9] max-h-36 sm:max-h-48 w-full shrink-0">
                  <img
                    src={selectedProperty.coverImage}
                    alt={selectedProperty.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedPropertyId(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Isara ang preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-[#075E59] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    ₱{selectedProperty.monthlyRent.toLocaleString()} / mo
                  </div>
                </div>

                <div className="p-3.5 space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {selectedProperty.roomType} · {selectedProperty.genderPolicy}
                    </div>
                    <h4 className="text-sm font-bold text-[#173747] dark:text-slate-100 line-clamp-1 mt-0.5">
                      {selectedProperty.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {selectedProperty.barangay}, {selectedProperty.municipality} ({selectedProperty.distanceToSchoolKm} km from campus)
                    </p>
                  </div>

                  {/* Actions for Map Preview: Quick Book/Inquire, Directions, Details */}
                  <div className="space-y-2">
                    {onBookOrInquire && (
                      <button
                        type="button"
                        onClick={() => onBookOrInquire(selectedProperty)}
                        className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
                      >
                        <Calendar className="w-4 h-4 text-[#F6B52E]" />
                        <span>Magpareserba / Inquire sa Owner</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onGetDirections(selectedProperty)}
                        className="min-h-[38px] py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                        <span>Directions</span>
                      </button>

                      <button
                        onClick={() => onViewPropertyDetails(selectedProperty)}
                        className="min-h-[38px] py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                        <span>Full Details</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Host: <strong className="text-slate-700 dark:text-slate-200">{selectedProperty.ownerName}</strong>
                    </span>
                    <a
                      href={`tel:${selectedProperty.ownerPhone.replace(/\s+/g, '')}`}
                      className="text-[#075E59] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{selectedProperty.ownerPhone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER DRAWER MODAL */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#14232d] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-[#075E59] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#F6B52E]" />
                <h3 className="font-bold text-sm">Refine Search Filters</h3>
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              {/* Municipality */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Capiz Municipality</label>
                <select
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100"
                >
                  <option value="All">All Municipalities in Capiz</option>
                  {CAPIZ_MUNICIPALITIES.map(m => (
                    <option key={m.name} value={m.name}>{m.name} ({m.type})</option>
                  ))}
                </select>
              </div>

              {/* Max Rent */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max Monthly Rent</label>
                  <span className="font-bold text-[#075E59] dark:text-emerald-400 tabular-nums">₱{maxRent.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={6000}
                  step={200}
                  value={maxRent}
                  onChange={(e) => setMaxRent(Number(e.target.value))}
                  className="w-full accent-[#075E59]"
                />
              </div>

              {/* Room Setup */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Room Setup</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100"
                >
                  <option value="All">Any Room Setup</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Shared Room (2-3)">Shared Room (2-3)</option>
                  <option value="Bedspace (4+)">Bedspace (4+)</option>
                  <option value="Studio Unit">Studio Unit</option>
                </select>
              </div>

              {/* Distance Radius */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Distance Radius from Campus</label>
                  <span className="font-bold text-[#075E59] dark:text-emerald-400 tabular-nums">
                    {radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm} km`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.5, 1, 2, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadiusKm(r)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        radiusKm === r
                          ? 'bg-[#075E59] text-white border-[#075E59]'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r < 1 ? '500m' : `${r}km`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Policy */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gender Policy</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100"
                >
                  <option value="All">Any Policy / Co-ed</option>
                  <option value="Female Only">Female Only</option>
                  <option value="Male Only">Male Only</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedMunicipality('All');
                  setMaxRent(5000);
                  setSelectedRoomType('All');
                  setSelectedGender('All');
                  setRadiusKm(2);
                  setPriceQuickFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#075E59] text-white text-xs font-bold shadow-xs hover:bg-[#064C48]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
