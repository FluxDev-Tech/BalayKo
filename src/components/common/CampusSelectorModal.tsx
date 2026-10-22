import React, { useState, useMemo } from 'react';
import { School, Property } from '../../types';
import { 
  X, 
  Search, 
  School as SchoolIcon, 
  MapPin, 
  Check, 
  Building2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface CampusSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  activeSchool: School | null;
  onSelectSchool: (school: School) => void;
  properties?: Property[];
}

export const CampusSelectorModal: React.FC<CampusSelectorModalProps> = ({
  isOpen,
  onClose,
  schools,
  activeSchool,
  onSelectSchool,
  properties = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('Lahat');

  // Municipalities for filter pills
  const municipalities = useMemo(() => {
    const list = Array.from(new Set(schools.map((s) => s.municipality))).filter(Boolean);
    return ['Lahat', ...list.sort()];
  }, [schools]);

  // Filter campuses
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Municipality filter
      if (selectedMunicipality !== 'Lahat' && school.municipality !== selectedMunicipality) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = school.name.toLowerCase().includes(q);
        const matchesShort = school.shortName.toLowerCase().includes(q);
        const matchesMuni = school.municipality.toLowerCase().includes(q);
        const matchesAddress = school.address.toLowerCase().includes(q);
        if (!matchesName && !matchesShort && !matchesMuni && !matchesAddress) {
          return false;
        }
      }

      return true;
    });
  }, [schools, selectedMunicipality, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (school: School) => {
    onSelectSchool(school);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#14232d] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#075E59] text-white flex items-center justify-center shadow-xs">
              <SchoolIcon className="w-5 h-5 text-[#F6B52E]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#173747] dark:text-slate-100 leading-tight">
                Pumili ng Kampus sa Capiz
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Awtomatikong ililipat ang mapa sa paligid ng napiling paaralan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Isara"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Quick Switchers */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-[#14232d]">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Maghanap ng campus (CAPSU Pilar, Roxas City, Pontevedra, FCU, CPC)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-[#173747] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E59] focus:bg-white dark:focus:bg-slate-850 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Municipality Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {municipalities.map((muni) => {
              const isSelected = selectedMunicipality === muni;
              return (
                <button
                  key={muni}
                  type="button"
                  onClick={() => setSelectedMunicipality(muni)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#075E59] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {muni === 'Lahat' ? 'Lahat ng Bayan' : muni}
                </button>
              );
            })}
          </div>
        </div>

        {/* Campuses List Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {filteredSchools.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <SchoolIcon className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Walang nahanap na campus sa "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMunicipality('Lahat');
                }}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                I-reset ang Search
              </button>
            </div>
          ) : (
            filteredSchools.map((school) => {
              const isSelected = activeSchool?.id === school.id;
              const nearbyCount = properties.filter(
                (p) => p.status === 'approved' && p.nearestSchoolId === school.id
              ).length;

              return (
                <div
                  key={school.id}
                  onClick={() => handleSelect(school)}
                  className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-[#075E59] dark:border-emerald-500 shadow-xs ring-1 ring-[#075E59]/20'
                      : 'bg-white dark:bg-[#14232d] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Campus Icon */}
                    <div className="w-11 h-11 rounded-xl bg-[#075E59]/10 dark:bg-emerald-950/60 text-[#075E59] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#075E59]/20 group-hover:bg-[#075E59] group-hover:text-white transition-colors">
                      <SchoolIcon className="w-5 h-5" />
                    </div>

                    {/* Campus Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#173747] dark:text-slate-100 group-hover:text-[#075E59] dark:group-hover:text-emerald-400 transition-colors">
                          {school.shortName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {school.municipality}
                        </span>
                        {school.id === 'capsu-pilar' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Pilar Campus</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {school.name}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#075E59] dark:text-emerald-400" />
                          <span className="truncate max-w-[220px]">{school.address}</span>
                        </span>
                        <span>·</span>
                        <span className="text-[#075E59] dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{nearbyCount} {nearbyCount === 1 ? 'boarding house' : 'boarding houses'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#075E59] text-white text-xs font-bold shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span className="hidden sm:inline">Aktibo</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#075E59] group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{filteredSchools.length} campus sa buong Capiz</span>
          <span className="font-medium text-[#075E59] dark:text-emerald-400">
            I-click ang napiling campus upang ilipat ang mapa
          </span>
        </div>
      </div>
    </div>
  );
};
