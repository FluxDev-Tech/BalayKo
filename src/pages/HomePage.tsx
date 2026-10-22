import React, { useState } from 'react';
import { School, Property } from '../types';
import { INITIAL_SCHOOLS } from '../data/schoolsData';
import { CAPIZ_MUNICIPALITIES } from '../data/capizMunicipalities';
import { PropertyCard } from '../components/property/PropertyCard';
import { Search, MapPin, School as SchoolIcon, ArrowRight, ShieldCheck, Footprints, Sparkles, Navigation, Heart, ChevronRight, Phone, CheckCircle2, Building2, Compass } from 'lucide-react';

interface HomePageProps {
  schools: School[];
  properties: Property[];
  onSelectSchool: (school: School) => void;
  onExplore: (schoolId?: string) => void;
  onViewPropertyDetails: (property: Property) => void;
  onGetDirections: (property: Property) => void;
  onContactOwner: (property: Property) => void;
  onBookOrInquire?: (property: Property) => void;
  onToggleFavorite: (propertyId: string) => void;
  onToggleCompare: (propertyId: string) => void;
  favoriteIds: string[];
  compareIds: string[];
  onOpenOwnerAddModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  schools,
  properties,
  onSelectSchool,
  onExplore,
  onViewPropertyDetails,
  onGetDirections,
  onContactOwner,
  onBookOrInquire,
  onToggleFavorite,
  onToggleCompare,
  favoriteIds,
  compareIds,
  onOpenOwnerAddModal,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState('capsu-pilar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('All');

  // Filter approved properties
  const approvedProperties = properties.filter(p => p.status === 'approved');

  // Featured properties (prioritizing CAPSU Pilar listings)
  const pilarProperties = approvedProperties.filter(p => p.nearestSchoolId === 'capsu-pilar' || p.municipality === 'Pilar');
  const otherProperties = approvedProperties.filter(p => p.nearestSchoolId !== 'capsu-pilar' && p.municipality !== 'Pilar');
  const featuredListings = [...pilarProperties, ...otherProperties].slice(0, 4);

  const capsuPilarSchool = schools.find(s => s.id === 'capsu-pilar') || schools[0] || INITIAL_SCHOOLS[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExplore(selectedSchoolId);
  };

  const handleCapsuPilarShortcut = () => {
    onSelectSchool(capsuPilarSchool);
    onExplore('capsu-pilar');
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-[#0b151b] transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#075E59] via-[#064C48] to-[#173747] text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246,181,46,0.12),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto">
          {/* Top Tagline & Headline */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F6B52E] text-xs font-semibold tracking-wide mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#F6B52E]" />
              <span>Ang Imo Sunod nga Balay · Capiz Boarding House Finder</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Find Verified Boarding Houses Near Your College in <span className="text-[#F6B52E]">Capiz</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-200 font-normal max-w-2xl mx-auto leading-relaxed">
              Explore safe, comfortable student accommodations within walking distance to your campus. Real interactive maps, transparent rental rates, verified owners, and route directions.
            </p>

            {/* HIGH PRIORITY SHORTCUT: CAPSU PILAR */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCapsuPilarShortcut}
                className="py-3 px-6 rounded-2xl bg-[#F6B52E] hover:bg-[#e5a420] text-[#173747] font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <SchoolIcon className="w-5 h-5 text-[#173747]" />
                <span>Find Boarding Houses Near CAPSU Pilar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. SEARCH & FILTER CONTAINER */}
          <div className="mt-10 max-w-4xl mx-auto bg-white dark:bg-[#14232d] rounded-3xl p-4 sm:p-6 shadow-2xl text-[#173747] dark:text-slate-100 border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* School Selector (5 cols) */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <SchoolIcon className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Select College or Campus</span>
                  </label>
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-xs sm:text-sm font-medium text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59] focus:bg-white dark:focus:bg-slate-800"
                  >
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} ({school.municipality})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipality / Location (4 cols) */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Municipality in Capiz</span>
                  </label>
                  <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-xs sm:text-sm font-medium text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59] focus:bg-white dark:focus:bg-slate-800"
                  >
                    <option value="All">All Municipalities in Capiz</option>
                    {CAPIZ_MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Action (3 cols) */}
                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Search className="w-4 h-4 text-[#F6B52E]" />
                    <span>Search Houses</span>
                  </button>
                </div>
              </div>

              {/* Quick Filter Radius Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Distance:</span>
                  <button
                    type="button"
                    onClick={() => onExplore(selectedSchoolId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#075E59]/10 dark:hover:bg-[#075E59]/30 text-slate-700 dark:text-slate-300 hover:text-[#075E59] dark:hover:text-emerald-400 font-medium transition-colors"
                  >
                    &lt; 500m (Walking)
                  </button>
                  <button
                    type="button"
                    onClick={() => onExplore(selectedSchoolId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#075E59]/10 dark:hover:bg-[#075E59]/30 text-slate-700 dark:text-slate-300 hover:text-[#075E59] dark:hover:text-emerald-400 font-medium transition-colors"
                  >
                    &lt; 1 km
                  </button>
                  <button
                    type="button"
                    onClick={() => onExplore(selectedSchoolId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#075E59]/10 dark:hover:bg-[#075E59]/30 text-slate-700 dark:text-slate-300 hover:text-[#075E59] dark:hover:text-emerald-400 font-medium transition-colors"
                  >
                    &lt; 2 km
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Strict Capiz coverage</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#075E59] dark:bg-emerald-400"></span>
                  <span className="font-semibold text-[#075E59] dark:text-emerald-400">Verified only</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. CAPSU PILAR SATELLITE COLLEGE SPOTLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-emerald-900 to-[#075E59] rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F6B52E]/20 text-[#F6B52E] font-bold text-xs mb-3">
                <SchoolIcon className="w-4 h-4" />
                <span>Featured Satellite Campus Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Capiz State University — Pilar Satellite College
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                Located in Brgy. Natividad, Pilar, Capiz. Serving hundreds of education, computer, and technology students in eastern Capiz. We have mapped out vetted student rooms and dormitories within 3 to 10 minutes walking radius to campus gates.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCapsuPilarShortcut}
                  className="py-2.5 px-5 rounded-xl bg-[#F6B52E] hover:bg-[#e5a420] text-[#173747] font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View CAPSU Pilar Boarding Houses Map</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="text-xs text-slate-300 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#F6B52E]" />
                  <span>{pilarProperties.length} verified listings in Pilar</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <img
                  src="/src/assets/images/capsu_pilar_college_1791785090434.jpg"
                  alt="CAPSU Pilar Campus"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-xs text-white">
                  <div className="font-bold text-sm">Natividad, Pilar, Capiz</div>
                  <div className="text-slate-300 text-[11px]">Verified Geolocation · Lat 11.4840, Lng 123.0051</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED VERIFIED LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-bold text-[#075E59] uppercase tracking-wider">
              Verified Student Lodgings
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#173747] mt-1">
              Popular Boarding Houses Near Campus
            </h2>
          </div>
          <button
            onClick={() => onExplore()}
            className="text-xs font-bold text-[#075E59] hover:text-[#064C48] flex items-center gap-1 transition-colors"
          >
            <span>Explore All On Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {featuredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-sm max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#075E59] mx-auto flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#173747]">
              Wala Pang Rehistradong Boarding House sa Ngayon
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
              Naka-handa na ang sistema at mapa para sa buong Capiz. Kapag nag-rehistro ang mga may-ari ng boarding house sa kanilang Owner Dashboard, awtomatiko itong lalabas dito at sa kalsada ng mapa!
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onExplore()}
                className="py-2.5 px-4 rounded-xl bg-[#075E59] text-white text-xs font-bold hover:bg-[#064C48] transition-colors"
              >
                Buksan ang Interactive Map
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredListings.map((prop) => (
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
                isFavorite={favoriteIds.includes(prop.id)}
                isInComparison={compareIds.includes(prop.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. POPULAR COLLEGES IN CAPIZ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="text-xs font-bold text-[#075E59] dark:text-emerald-400 uppercase tracking-wider">
            Capiz Higher Education Directory
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#173747] dark:text-slate-100 mt-1">
            Browse Accommodations by College
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified state university satellite campuses and colleges across Capiz province.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schools.slice(0, 8).map((school) => {
            const count = approvedProperties.filter(p => p.nearestSchoolId === school.id).length;
            return (
              <div
                key={school.id}
                onClick={() => {
                  onSelectSchool(school);
                  onExplore(school.id);
                }}
                className="bg-white dark:bg-[#14232d] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 hover:border-[#075E59] dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-[#075E59] group-hover:text-white transition-colors">
                    <SchoolIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100 group-hover:text-[#075E59] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {school.shortName}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{school.name}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{school.municipality}, Capiz</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#075E59] dark:text-emerald-400 tabular-nums">
                    {count} {count === 1 ? 'house' : 'houses'} listed
                  </span>
                  <span className="text-slate-400 group-hover:text-[#075E59] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. HOW BALAYKO WORKS (STUDENT JOURNEY) */}
      <section className="bg-white dark:bg-[#13222d] py-14 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-[#075E59] dark:text-emerald-400 uppercase tracking-wider">
              Simple 5-Step Journey
            </div>
            <h2 className="text-2xl font-extrabold text-[#173747] dark:text-slate-100 mt-1">
              How BalayKo Works for Students
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Find safe, convenient accommodations near your school in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                1
              </div>
              <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100">Choose School</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select CAPSU Pilar or your Capiz college campus.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                2
              </div>
              <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100">Explore On Map</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse pins and verified listings by walking radius.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                3
              </div>
              <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100">Compare Features</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Evaluate rent, utilities, deposit, and curfew policies.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                4
              </div>
              <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100">Contact Owner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chat directly or inquire about room availability.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                5
              </div>
              <h3 className="text-sm font-bold text-[#173747] dark:text-slate-100">Get Real Route</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Navigate with step-by-step walking directions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MAP FINDER CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-[#173747] dark:bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border dark:border-slate-800">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#075E59] text-[#F6B52E] font-bold text-xs mb-2">
              <Compass className="w-4 h-4" />
              <span>Interactive Capiz Campus Map</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Nangita ka sang Boarding House sa Capiz?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Tinguhai ang pinakabag-o nga interactive map para makit-an dayon ang mga aprubado nga balay-abangan, kwarto, kag dorm nga malapit sa imo gina-eskwelahan.
            </p>
          </div>

          <button
            onClick={() => onExplore()}
            className="py-3 px-6 rounded-2xl bg-[#F6B52E] hover:bg-[#e5a420] text-[#173747] font-bold text-sm shadow-lg whitespace-nowrap active:scale-95 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-[#173747]" />
            <span>Buksan ang Map sang Capiz</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>Balay</span>
              <span className="text-[#075E59]">Ko</span>
            </div>
            <div className="text-[11px] text-[#F6B52E] font-medium mt-0.5">
              Ang Imo Sunod nga Balay.
            </div>
            <p className="mt-2 text-slate-400 text-xs leading-relaxed">
              Verified student boarding house locator dedicated to college campuses throughout Capiz, Philippines.
            </p>
          </div>

          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Capiz Campuses
            </div>
            <ul className="space-y-1.5">
              <li><button onClick={handleCapsuPilarShortcut} className="hover:text-white transition-colors">CAPSU Pilar Satellite College</button></li>
              <li><button onClick={() => onExplore('capsu-main')} className="hover:text-white transition-colors">CAPSU Main (Roxas City)</button></li>
              <li><button onClick={() => onExplore('capsu-dayao')} className="hover:text-white transition-colors">CAPSU Dayao Campus</button></li>
              <li><button onClick={() => onExplore('capsu-pontevedra')} className="hover:text-white transition-colors">CAPSU Pontevedra Campus</button></li>
              <li><button onClick={() => onExplore('fcu-roxas')} className="hover:text-white transition-colors">Filamer Christian University</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Student Platform
            </div>
            <ul className="space-y-1.5">
              <li><button onClick={() => onExplore()} className="hover:text-white transition-colors">Interactive Map</button></li>
              <li><button onClick={() => onExplore()} className="hover:text-white transition-colors">Compare Boarding Houses</button></li>
              <li><button onClick={onOpenOwnerAddModal} className="hover:text-white transition-colors">List Your Property</button></li>
              <li><span className="text-slate-500">Security & Privacy Terms</span></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Coverage Notice
            </div>
            <p className="text-[11px] leading-relaxed">
              BalayKo serves Capiz, Philippines only. All published properties require verified coordinates and administrative approval.
            </p>
            <div className="mt-3 text-[10px] text-slate-500">
              © 2026 BalayKo Philippines. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
