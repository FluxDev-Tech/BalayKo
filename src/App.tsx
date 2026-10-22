import React, { useState, useEffect } from 'react';
import { Property, School, User } from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/common/Header';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { DirectionsModal } from './components/directions/DirectionsModal';
import { ReportModal } from './components/common/ReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { CampusSelectorModal } from './components/common/CampusSelectorModal';
import { BookingInquiryModal } from './components/property/BookingInquiryModal';
import { ExplorePage } from './pages/ExplorePage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ComparePage } from './pages/ComparePage';
import { StudentDashboard } from './pages/StudentDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  // Navigation tab state: 'explore' (default map-first), 'details', 'favorites', 'compare', 'dashboard'
  const [currentTab, setCurrentTab] = useState<string>('explore');

  // Campus Selector Modal state
  const [campusModalOpen, setCampusModalOpen] = useState(false);

  // Core Data
  const [schools, setSchools] = useState<School[]>(() => StorageService.getSchools());
  const [properties, setProperties] = useState<Property[]>(() => StorageService.getProperties());
  const [activeSchool, setActiveSchool] = useState<School | null>(() => {
    const s = StorageService.getSchools();
    return s.find((sch) => sch.id === 'capsu-pilar') || s[0] || null;
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'student' | 'owner'>('student');

  // User list states (favorites & compare)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => StorageService.getFavorites());
  const [compareIds, setCompareIds] = useState<string[]>(() => StorageService.getComparisons());

  // Search query state for top navbar
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);
  const [directionsProperty, setDirectionsProperty] = useState<Property | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingProperty, setReportingProperty] = useState<Property | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);

  // Load initial data and keep updated
  useEffect(() => {
    const s = StorageService.getSchools();
    const p = StorageService.getProperties();
    const f = StorageService.getFavorites();
    const c = StorageService.getComparisons();
    const u = StorageService.getCurrentUser();

    setSchools(s);
    setProperties(p);
    setFavoriteIds(f);
    setCompareIds(c);
    setCurrentUser(u);

    setActiveSchool((prev) => {
      if (prev) return prev;
      return s.find((sch) => sch.id === 'capsu-pilar') || s[0] || null;
    });
  }, []);

  const handleRefreshProperties = () => {
    const freshProps = StorageService.getProperties();
    setProperties(freshProps);
  };

  // Handlers
  const handleSelectSchool = (school: School) => {
    setActiveSchool(school);
  };

  const handleExplore = (schoolId?: string) => {
    if (schoolId) {
      const found = schools.find((s) => s.id === schoolId);
      if (found) setActiveSchool(found);
    }
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPropertyDetails = (property: Property) => {
    const updatedViews = StorageService.incrementPropertyViews(property.id);
    const updatedProp = { ...property, viewsCount: updatedViews };
    setSelectedProperty(updatedProp);
    setProperties(StorageService.getProperties());
    setCurrentTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetDirections = (property: Property) => {
    setDirectionsProperty(property);
    setDirectionsModalOpen(true);
  };

  const handleFocusOnMainMap = (property: Property) => {
    const school = schools.find((s) => s.id === property.nearestSchoolId);
    if (school) {
      setActiveSchool(school);
    }
    setSelectedPropertyId(property.id);
    setCurrentTab('explore');
    setDirectionsModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (propertyId: string) => {
    StorageService.toggleFavorite(propertyId);
    setFavoriteIds(StorageService.getFavorites());
  };

  const handleToggleCompare = (propertyId: string) => {
    const res = StorageService.toggleComparison(propertyId);
    if (res.message) {
      alert(res.message);
    }
    setCompareIds(StorageService.getComparisons());
  };

  const handleRemoveFromComparison = (propertyId: string) => {
    StorageService.toggleComparison(propertyId);
    setCompareIds(StorageService.getComparisons());
  };

  const handleClearComparison = () => {
    StorageService.clearComparisons();
    setCompareIds([]);
  };

  const handleOpenReportModal = (property: Property) => {
    setReportingProperty(property);
    setReportModalOpen(true);
  };

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role: 'student' | 'owner' = 'student') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'student' && user.preferredSchoolId) {
      const sch = schools.find((s) => s.id === user.preferredSchoolId);
      if (sch) setActiveSchool(sch);
    }
    setCurrentTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDashboard = () => {
    if (!currentUser) {
      handleOpenAuth('login');
    } else {
      setCurrentTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactOwner = (property: Property) => {
    if (!currentUser) {
      handleOpenAuth('login', 'student');
      return;
    }
    if (currentUser.role === 'student') {
      StorageService.startOrGetConversation(
        property,
        currentUser,
        `Hello po, mag-inquire po ako sa ${property.name} para sa darating na semester.`
      );
      setCurrentTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(`Landlord Contact: ${property.ownerPhone} (${property.ownerName})`);
    }
  };

  const handleBookOrInquire = (property: Property) => {
    setBookingProperty(property);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F7] text-[#173747] overflow-x-hidden">
      {/* 1. Header (Top Search, Saved & Compare count, Auth & Dashboard links) */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSaved={() => setCurrentTab('favorites')}
        onOpenCompare={() => setCurrentTab('compare')}
        savedCount={favoriteIds.length}
        compareCount={compareIds.length}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenDashboard={handleOpenDashboard}
        onLogout={handleLogout}
        currentTab={currentTab}
        onNavigateExplore={() => setCurrentTab('explore')}
      />

      {/* 2. Main Content Views (Direct Map-First UX) */}
      <main className={`flex-1 min-h-0 flex flex-col ${currentTab === 'explore' ? 'overflow-hidden' : 'pb-20 md:pb-8'}`}>
        {/* VIEW A: INTERACTIVE MAP FINDER (CORE MAIN VIEW) */}
        {currentTab === 'explore' && (
          <ExplorePage
            schools={schools}
            properties={properties}
            activeSchool={activeSchool}
            onSelectSchool={handleSelectSchool}
            onViewPropertyDetails={handleViewPropertyDetails}
            onGetDirections={handleGetDirections}
            onContactOwner={handleContactOwner}
            onBookOrInquire={handleBookOrInquire}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
            favoriteIds={favoriteIds}
            compareIds={compareIds}
            selectedPropertyId={selectedPropertyId}
            onSelectPropertyId={(id) => setSelectedPropertyId(id)}
            onRefreshProperties={handleRefreshProperties}
            onOpenCampusSelector={() => setCampusModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* VIEW B: FULL PROPERTY DETAILS */}
        {currentTab === 'details' && selectedProperty && (
          <PropertyDetailsPage
            property={selectedProperty}
            activeSchool={activeSchool}
            currentUser={currentUser}
            onRequireAuth={() => handleOpenAuth('login', 'student')}
            onBack={() => setCurrentTab('explore')}
            onGetDirections={handleGetDirections}
            onContactOwner={() => handleContactOwner(selectedProperty)}
            onBookOrInquire={handleBookOrInquire}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
            isFavorite={favoriteIds.includes(selectedProperty.id)}
            isInComparison={compareIds.includes(selectedProperty.id)}
            onReportListing={handleOpenReportModal}
            onPropertyUpdated={handleRefreshProperties}
          />
        )}

        {/* VIEW C: SAVED BOARDING HOUSES */}
        {currentTab === 'favorites' && (
          <FavoritesPage
            properties={properties}
            favoriteIds={favoriteIds}
            compareIds={compareIds}
            schools={schools}
            onViewPropertyDetails={handleViewPropertyDetails}
            onGetDirections={handleGetDirections}
            onContactOwner={handleContactOwner}
            onBookOrInquire={handleBookOrInquire}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
            onOpenCompareModal={() => setCurrentTab('compare')}
            onExplore={() => handleExplore()}
          />
        )}

        {/* VIEW D: SIDE-BY-SIDE COMPARE */}
        {currentTab === 'compare' && (
          <ComparePage
            properties={properties}
            compareIds={compareIds}
            activeSchool={activeSchool}
            onRemoveFromComparison={handleRemoveFromComparison}
            onClearComparison={handleClearComparison}
            onViewDetails={handleViewPropertyDetails}
            onGetDirections={handleGetDirections}
            onExplore={() => handleExplore()}
          />
        )}

        {/* VIEW E: ROLE-SPECIFIC DASHBOARDS */}
        {currentTab === 'dashboard' && currentUser && (
          <>
            {currentUser.role === 'student' && (
              <StudentDashboard
                user={currentUser}
                schools={schools}
                properties={properties}
                onSelectSchool={handleSelectSchool}
                onExploreMap={handleExplore}
                onViewPropertyDetails={handleViewPropertyDetails}
                onGetDirections={handleGetDirections}
                onToggleFavorite={handleToggleFavorite}
                onToggleCompare={handleToggleCompare}
                onBookOrInquire={handleBookOrInquire}
                favoriteIds={favoriteIds}
                compareIds={compareIds}
                onUpdateUser={(updated) => setCurrentUser(updated)}
              />
            )}

            {currentUser.role === 'owner' && (
              <OwnerDashboard
                user={currentUser}
                schools={schools}
                properties={properties}
                onRefreshProperties={handleRefreshProperties}
                onExploreMap={handleExplore}
                onViewPropertyDetails={handleViewPropertyDetails}
              />
            )}

            {currentUser.role === 'admin' && (
              <AdminDashboard
                user={currentUser}
                schools={schools}
                properties={properties}
                onRefreshProperties={handleRefreshProperties}
                onExploreMap={handleExplore}
                onViewPropertyDetails={handleViewPropertyDetails}
              />
            )}
          </>
        )}

        {/* Fallback if user navigates to dashboard but not logged in */}
        {currentTab === 'dashboard' && !currentUser && (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-2">Kinakailangan mag-login</h2>
            <p className="text-xs text-slate-500 mb-5">
              Mangyaring mag-login o mag-rehistro upang ma-access ang iyong dashboard.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAuth('login')}
              className="py-2.5 px-5 rounded-xl bg-[#075E59] text-white text-xs font-bold shadow-md hover:bg-[#064C48]"
            >
              Buksan ang Login Form
            </button>
          </div>
        )}
      </main>

      {/* 3. Mobile Bottom Navigation (Map Finder, Campuses, Saved, Compare, Dashboard/Login) */}
      <MobileBottomNav
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        savedCount={favoriteIds.length}
        compareCount={compareIds.length}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenCampusSelector={() => setCampusModalOpen(true)}
      />

      {/* 4. Directions & Navigation Modal */}
      <DirectionsModal
        isOpen={directionsModalOpen}
        onClose={() => setDirectionsModalOpen(false)}
        property={directionsProperty}
        activeSchool={activeSchool}
        onFocusOnMainMap={handleFocusOnMainMap}
      />

      {/* 5. Report Listing Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        property={reportingProperty}
      />

      {/* 6. Auth Modal (Login / Register for Student, BH Owner & Admin) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        schools={schools}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        initialRole={authModalRole}
      />

      {/* 7. Best Campus Selector Modal */}
      <CampusSelectorModal
        isOpen={campusModalOpen}
        onClose={() => setCampusModalOpen(false)}
        schools={schools}
        activeSchool={activeSchool}
        onSelectSchool={handleSelectSchool}
        properties={properties}
      />

      {/* 8. Booking Inquiry & Reservation Modal */}
      <BookingInquiryModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        property={bookingProperty}
        currentUser={currentUser}
        onRequireAuth={() => handleOpenAuth('login', 'student')}
      />
    </div>
  );
}
