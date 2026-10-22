import React, { useState } from 'react';
import { User, School, Property, Conversation, Message, ReservationRequest, PropertyReview } from '../types';
import { StorageService } from '../services/storageService';
import { PropertyCard } from '../components/property/PropertyCard';
import { 
  School as SchoolIcon, 
  Heart, 
  MessageSquare, 
  Compass, 
  MapPin, 
  User as UserIcon, 
  Send, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Building,
  Calendar,
  XCircle,
  AlertCircle,
  Star,
  Trash2
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  schools: School[];
  properties: Property[];
  onSelectSchool: (school: School) => void;
  onExploreMap: (schoolId?: string) => void;
  onViewPropertyDetails: (property: Property) => void;
  onGetDirections: (property: Property) => void;
  onToggleFavorite: (propertyId: string) => void;
  onToggleCompare: (propertyId: string) => void;
  favoriteIds: string[];
  compareIds: string[];
  onBookOrInquire?: (property: Property) => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  schools,
  properties,
  onSelectSchool,
  onExploreMap,
  onViewPropertyDetails,
  onGetDirections,
  onBookOrInquire,
  onToggleFavorite,
  onToggleCompare,
  favoriteIds,
  compareIds,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'nearby' | 'saved' | 'reservations' | 'reviews' | 'messages' | 'profile'>('nearby');
  
  // Student preferred school
  const studentSchool = schools.find((s) => s.id === user.preferredSchoolId) || schools[0];
  const [selectedSchoolId, setSelectedSchoolId] = useState(studentSchool?.id || schools[0]?.id);

  // Reservations state
  const [reservations, setReservations] = useState<ReservationRequest[]>(() =>
    StorageService.getStudentReservations(user.id)
  );

  // Reviews state
  const [myReviews, setMyReviews] = useState<PropertyReview[]>(() =>
    StorageService.getStudentReviews(user.id)
  );

  // Profile edit states
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Messaging state
  const [conversations, setConversations] = useState<Conversation[]>(() => 
    StorageService.getStudentConversations(user.id)
  );
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  // Boarding houses near student's chosen school
  const nearbyProperties = properties
    .filter((p) => p.status === 'approved' && p.nearestSchoolId === selectedSchoolId)
    .sort((a, b) => (a.distanceToSchoolKm ?? 99) - (b.distanceToSchoolKm ?? 99));

  // Saved properties
  const savedProperties = properties.filter((p) => favoriteIds.includes(p.id));

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StorageService.updateUser(user.id, {
      name: editName,
      phone: editPhone,
      preferredSchoolId: selectedSchoolId,
    });
    if (updated) {
      onUpdateUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !replyText.trim()) return;

    StorageService.sendMessage(activeConvId, user, replyText.trim());
    setReplyText('');
    setConversations(StorageService.getStudentConversations(user.id));
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeMessages = activeConv ? StorageService.getMessages(activeConv.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6 text-[#173747] dark:text-slate-100 transition-colors">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#14232d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#075E59]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-[#087F78] shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#173747] dark:text-slate-100 tracking-tight">
                  Kumusta, {user.name}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 border border-[#075E59]/20">
                  Student Account
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <SchoolIcon className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                <span>Preferred Campus:</span>
                <span className="font-bold text-[#173747] dark:text-slate-200">
                  {schools.find((s) => s.id === selectedSchoolId)?.name || 'CAPSU Pilar'}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Action: Open Interactive Map */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onExploreMap(selectedSchoolId)}
              className="py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Compass className="w-4 h-4 text-[#F6B52E]" />
              <span>Buksan ang Map Finder</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Malapit sa Skwelahan</div>
            <div className="text-xl font-extrabold text-[#173747] dark:text-slate-100 tabular-nums mt-0.5">
              {nearbyProperties.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">BHs</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Saved / Favorites</div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
              {favoriteIds.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">BHs</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Mga Reservation</div>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              {reservations.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Active</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Aking Reviews</div>
            <div className="text-xl font-extrabold text-amber-500 dark:text-amber-400 tabular-nums mt-0.5 flex items-center gap-1">
              <span>{myReviews.length}</span>
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Inquiries / Messages</div>
            <div className="text-xl font-extrabold text-[#075E59] dark:text-emerald-400 tabular-nums mt-0.5">
              {conversations.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14232d] rounded-xl p-1.5 shadow-xs gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'nearby'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Malapit ({nearbyProperties.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved ({favoriteIds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reservations'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Reservations ({reservations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Aking Reviews ({myReviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'messages'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Inquiries ({conversations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: NEARBY BOARDING HOUSES */}
      {activeTab === 'nearby' && (
        <div className="space-y-4">
          {/* School Selector Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SchoolIcon className="w-5 h-5 text-[#075E59]" />
              <div>
                <div className="text-xs font-bold text-slate-800">Tingnan ang BHs malapit sa:</div>
                <div className="text-xs text-slate-500">Pumili ng ibang kolehiyo sa buong Capiz</div>
              </div>
            </div>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                const sch = schools.find((s) => s.id === e.target.value);
                if (sch) onSelectSchool(sch);
              }}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#173747] focus:ring-2 focus:ring-[#075E59] focus:bg-white"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortName} — {s.municipality} ({s.campusName})
                </option>
              ))}
            </select>
          </div>

          {nearbyProperties.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">Walang nahanap na boarding house sa paligid</h3>
              <p className="text-xs text-slate-500 mt-1">
                Subukan ang ibang campus sa Capiz tulad ng CAPSU Pilar, CAPSU Roxas Main, o FCU.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbyProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={onViewPropertyDetails}
                  onGetDirections={onGetDirections}
                  onContactOwner={() => {
                    const conv = StorageService.startOrGetConversation(
                      property,
                      user,
                      `Hello po, student po ako sa ${schools.find((s) => s.id === selectedSchoolId)?.shortName}. Available pa po ba ang room?`
                    );
                    setConversations(StorageService.getStudentConversations(user.id));
                    setActiveConvId(conv.id);
                    setActiveTab('messages');
                  }}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  onBookOrInquire={onBookOrInquire}
                  isFavorite={favoriteIds.includes(property.id)}
                  isInComparison={compareIds.includes(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB B: SAVED FAVORITES */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedProperties.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">Wala ka pang naka-save na boarding house</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                I-click ang heart icon sa kahit anong listing para ma-save at madaling mabalikan.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('nearby')}
                className="py-2 px-4 rounded-xl bg-[#075E59] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Mag-browse ng Boarding Houses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={onViewPropertyDetails}
                  onGetDirections={onGetDirections}
                  onContactOwner={() => {
                    const conv = StorageService.startOrGetConversation(
                      property,
                      user,
                      'Hello po, interesado po ako mag-inquire sa boarding house na ito.'
                    );
                    setConversations(StorageService.getStudentConversations(user.id));
                    setActiveConvId(conv.id);
                    setActiveTab('messages');
                  }}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  onBookOrInquire={onBookOrInquire}
                  isFavorite={true}
                  isInComparison={compareIds.includes(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB C: RESERVATION REQUESTS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#14232d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-[#173747] dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
                <span>Aking Mga Reservation & Booking Requests ({reservations.length})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Subaybayan ang estado ng iyong reservation para sa darating na semester o academic year.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onExploreMap(selectedSchoolId)}
              className="py-2 px-3.5 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-transform active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-[#F6B52E]" />
              <span>Maghanap pa sa Mapa</span>
            </button>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white dark:bg-[#14232d] rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Wala ka pang naipasang reservation request</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                Pumili ng boarding house sa mapa o listahan, at i-click ang "Magpareserba" upang magpasa ng reservation date sa may-ari nang direkta.
              </p>
              <button
                type="button"
                onClick={() => onExploreMap(selectedSchoolId)}
                className="py-2.5 px-5 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all"
              >
                <span>Mag-browse ng Boarding Houses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => {
                const targetProp = properties.find((p) => p.id === res.propertyId);
                return (
                  <div
                    key={res.id}
                    className="bg-white dark:bg-[#14232d] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {res.targetSemester}
                          </span>
                          <h3 className="text-base font-bold text-[#173747] dark:text-slate-100 line-clamp-1">
                            {res.propertyName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#075E59] dark:text-emerald-400 shrink-0" />
                            <span>{res.propertyAddress}</span>
                          </p>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                            res.status === 'accepted'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : res.status === 'declined'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : res.status === 'cancelled'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {res.status === 'accepted' ? '✓ Tanggap ng May-ari' : res.status === 'declined' ? '✗ Hindi Tinanggap' : res.status === 'cancelled' ? 'Kinansela' : '⏳ Naghihintay ng Tugon'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Target Move-in:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{res.targetMoveInDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Kwarto / Occupants:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{res.preferredRoomType} ({res.occupantsCount} {res.occupantsCount === 1 ? 'Solo' : 'Tao'})</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">May-ari (Host):</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{res.ownerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Telepono:</span>
                          <a href={`tel:${res.ownerPhone.replace(/\s+/g, '')}`} className="font-semibold text-[#075E59] dark:text-emerald-400 hover:underline">
                            {res.ownerPhone}
                          </a>
                        </div>
                      </div>

                      {res.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-2.5 bg-slate-50/60 dark:bg-slate-800/60 rounded-xl italic border border-slate-100 dark:border-slate-800">
                          "{res.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${res.ownerPhone.replace(/\s+/g, '')}`}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                          <span>Tawagan</span>
                        </a>

                        {targetProp && (
                          <button
                            type="button"
                            onClick={() => onViewPropertyDetails(targetProp)}
                            className="py-1.5 px-3 rounded-lg bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 text-xs font-semibold hover:bg-[#075E59]/20"
                          >
                            Tingnan ang BH
                          </button>
                        )}
                      </div>

                      {res.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Nais mo bang kanselahin ang reservation request na ito?')) {
                              StorageService.updateReservationStatus(res.id, 'cancelled', user);
                              setReservations(StorageService.getStudentReservations(user.id));
                            }
                          }}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors"
                        >
                          I-cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: MY REVIEWS & STAR RATINGS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#14232d] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-[#173747] dark:text-slate-100 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Aking Mga Na-rate at Na-review na Boarding House</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lahat ng iyong feedback at star ratings para sa mga tinirhan mong boarding house sa Capiz.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onExploreMap(selectedSchoolId)}
              className="py-2 px-3.5 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#F6B52E]" />
              <span>Maghanap pa ng BH</span>
            </button>
          </div>

          {myReviews.length === 0 ? (
            <div className="bg-white dark:bg-[#14232d] rounded-2xl p-10 text-center border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center mb-3">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Wala ka pang naisusulat na review
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                Pumili ng boarding house sa mapa o listahan, pumunta sa details nito, at i-click ang "Sumulat ng Review" upang mag-iwan ng star rating para sa may-ari at kapwa estudyante.
              </p>
              <button
                type="button"
                onClick={() => onExploreMap(selectedSchoolId)}
                className="py-2.5 px-5 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all"
              >
                <span>Mag-browse ng Boarding Houses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myReviews.map((rev) => {
                const targetProp = properties.find((p) => p.id === rev.propertyId);
                const dateFormatted = new Date(rev.createdAt).toLocaleDateString('fil-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={rev.id}
                    className="bg-white dark:bg-[#14232d] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {rev.stayDuration || 'Boarder Review'}
                          </span>
                          <h3 className="text-base font-bold text-[#173747] dark:text-slate-100 line-clamp-1">
                            {rev.propertyName}
                          </h3>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Na-review noong {dateFormatted}
                          </span>
                        </div>

                        {/* Star Rating Score Pill */}
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black">{rev.rating}</span>
                          <span className="text-[10px] text-amber-600/70 font-normal">/ 5</span>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl leading-relaxed border border-slate-100 dark:border-slate-800">
                        "{rev.comment}"
                      </p>

                      {/* Sub-ratings */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {rev.cleanlinessRating && (
                          <div className="p-2 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg text-center">
                            <span className="block text-[10px] text-slate-400">Kalinisan</span>
                            <strong className="text-slate-700 dark:text-slate-200">{rev.cleanlinessRating}★</strong>
                          </div>
                        )}
                        {rev.safetyRating && (
                          <div className="p-2 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg text-center">
                            <span className="block text-[10px] text-slate-400">Kaligtasan</span>
                            <strong className="text-slate-700 dark:text-slate-200">{rev.safetyRating}★</strong>
                          </div>
                        )}
                        {rev.landlordRating && (
                          <div className="p-2 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg text-center">
                            <span className="block text-[10px] text-slate-400">May-ari</span>
                            <strong className="text-slate-700 dark:text-slate-200">{rev.landlordRating}★</strong>
                          </div>
                        )}
                        {rev.valueRating && (
                          <div className="p-2 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg text-center">
                            <span className="block text-[10px] text-slate-400">Halaga</span>
                            <strong className="text-slate-700 dark:text-slate-200">{rev.valueRating}★</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      {targetProp ? (
                        <button
                          type="button"
                          onClick={() => onViewPropertyDetails(targetProp)}
                          className="py-1.5 px-3 rounded-lg bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 text-xs font-semibold hover:bg-[#075E59]/20 transition-colors"
                        >
                          Tingnan ang BH
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Nai-post na Review</span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Nais mo bang burahin ang review na ito?')) {
                            StorageService.deleteReview(rev.id, user.id);
                            setMyReviews(StorageService.getStudentReviews(user.id));
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>I-delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB C: INQUIRIES & MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[460px]">
          {/* Conversation List */}
          <div className="border-r border-slate-200 p-3 space-y-2 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-700 px-2 py-1">
              Iyong Mga Inquiries ({conversations.length})
            </div>
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Wala ka pang active inquiries. Mag-click ng "Contact Landlord" sa kahit anong boarding house para mag-umpisa.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    activeConvId === c.id
                      ? 'bg-white border-[#075E59] shadow-xs'
                      : 'border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#173747] truncate">{c.propertyName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Owner: {c.ownerName}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-1">{c.lastMessageText}</div>
                </button>
              ))
            )}
          </div>

          {/* Conversation Message Thread */}
          <div className="col-span-2 flex flex-col h-full bg-white">
            {activeConv ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                  <div>
                    <h3 className="text-sm font-bold text-[#173747]">{activeConv.propertyName}</h3>
                    <p className="text-xs text-slate-500">Kausap: {activeConv.ownerName} (Landlord)</p>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[360px]">
                  {activeMessages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-[#075E59] text-white rounded-tr-none'
                              : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                          }`}
                        >
                          <div className="font-semibold text-[10px] opacity-75 mb-0.5">
                            {isMe ? 'Ikaw' : msg.senderName}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Sumulat ng mensahe sa landlord..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Ipadala</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
                Pumili ng inquiry sa kaliwa para makita ang mga mensahe.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB D: PROFILE & CAMPUS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl mx-auto shadow-xs">
          <h2 className="text-base font-bold text-[#173747] mb-1">Student Profile & Settings</h2>
          <p className="text-xs text-slate-500 mb-5">
            I-update ang iyong profile impormasyon at preferred college campus sa Capiz.
          </p>

          {profileSuccess && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Na-save nang matagumpay ang iyong profile!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pangalan (Full Name)
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#075E59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Permanent)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact / Mobile Number
              </label>
              <input
                type="tel"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="0917 123 4567"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#075E59]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Iyong Eskwelahan sa Capiz
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#173747] focus:ring-2 focus:ring-[#075E59]"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortName} — {s.municipality} ({s.campusName})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Ito ang default campus na gagamitin sa iyong mga searches at route estimates.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I-save ang Profile Changes</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
