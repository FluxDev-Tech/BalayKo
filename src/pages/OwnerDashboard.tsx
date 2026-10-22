import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { User, School, Property, Conversation, Message, PropertyType, RoomType, GenderRestriction, ReservationRequest, PropertyReview } from '../types';
import { StorageService } from '../services/storageService';
import { CAPIZ_MUNICIPALITIES } from '../data/capizMunicipalities';
import { 
  Building2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Eye, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Image as ImageIcon,
  Compass,
  X,
  Upload,
  Crosshair,
  Locate,
  Navigation,
  Calendar,
  Phone,
  UserCheck,
  XCircle,
  Star,
  Sparkles
} from 'lucide-react';

interface OwnerDashboardProps {
  user: User;
  schools: School[];
  properties: Property[];
  onRefreshProperties: () => void;
  onExploreMap: (schoolId?: string) => void;
  onViewPropertyDetails: (property: Property) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  user,
  schools,
  properties,
  onRefreshProperties,
  onExploreMap,
  onViewPropertyDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'reservations' | 'reviews' | 'inbox' | 'profile'>('listings');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // My properties
  const myProperties = properties.filter((p) => p.ownerId === user.id);

  // Reviews for owner's properties
  const ownerReviews = StorageService.getReviews().filter((r) => 
    myProperties.some((p) => p.id === r.propertyId)
  );

  // Reservations state
  const [ownerReservations, setOwnerReservations] = useState<ReservationRequest[]>(() =>
    StorageService.getOwnerReservations(user.id)
  );

  // Messaging state
  const [conversations, setConversations] = useState<Conversation[]>(() => 
    StorageService.getOwnerConversations(user.id)
  );
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  // Form State for Add / Edit Listing
  const [formName, setFormName] = useState('');
  const [formSchoolId, setFormSchoolId] = useState(schools[0]?.id || 'capsu-pilar');
  const [formMunicipality, setFormMunicipality] = useState('Pilar');
  const [formBarangay, setFormBarangay] = useState('Natividad (Poblacion)');
  const [formAddress, setFormAddress] = useState('');
  const [formRent, setFormRent] = useState(1500);
  const [formDeposit, setFormDeposit] = useState(1500);
  const [formPropertyType, setFormPropertyType] = useState<PropertyType>('Boarding House');
  const [formRoomType, setFormRoomType] = useState<RoomType>('Single Room');
  const [formGenderPolicy, setFormGenderPolicy] = useState<GenderRestriction>('Any / Co-ed');
  const [formCurfew, setFormCurfew] = useState('10:00 PM');
  const [formWater, setFormWater] = useState<'Included in Rent' | 'Submetered' | 'Shared Bill'>('Included in Rent');
  const [formElectric, setFormElectric] = useState<'Included in Rent' | 'Submetered' | 'Shared Bill'>('Submetered');
  const [formBathroom, setFormBathroom] = useState<'Private Inside Room' | 'Common / Shared'>('Common / Shared');
  const [formKitchen, setFormKitchen] = useState(true);
  const [formLaundry, setFormLaundry] = useState(true);
  const [formWifiSpeed, setFormWifiSpeed] = useState(50);
  const [formCoverImage, setFormCoverImage] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80');
  
  // Unlimited Gallery Images
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  const [formDescription, setFormDescription] = useState('');
  const [formAmenities, setFormAmenities] = useState<string[]>([
    'High-Speed WiFi',
    'Study Table & Chair',
    'Kitchen Access',
    'CCTV Security',
    'Individual Submeter'
  ]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Exact coordinates on Map / Road
  const [formLat, setFormLat] = useState<number>(11.4842);
  const [formLng, setFormLng] = useState<number>(123.0048);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Leaflet Mini Map Lifecycle for Interactive Pin Placement on Road/Map
  useEffect(() => {
    if (!isAddModalOpen) {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
        miniMarkerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;
      if (!miniMapInstanceRef.current) {
        const map = L.map(miniMapContainerRef.current, {
          center: [formLat, formLng],
          zoom: 16,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const customPin = L.divIcon({
          className: 'custom-bh-marker',
          html: `
            <div style="background-color: #075E59; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid white;">
              <div style="transform: rotate(45deg); font-size: 14px;">🏠</div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([formLat, formLng], {
          icon: customPin,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setFormLat(Number(pos.lat.toFixed(6)));
          setFormLng(Number(pos.lng.toFixed(6)));
        });

        // Click anywhere on map/road to place pin
        map.on('click', (e: L.LeafletMouseEvent) => {
          const lat = Number(e.latlng.lat.toFixed(6));
          const lng = Number(e.latlng.lng.toFixed(6));
          marker.setLatLng([lat, lng]);
          setFormLat(lat);
          setFormLng(lng);
          map.panTo([lat, lng]);
        });

        miniMapInstanceRef.current = map;
        miniMarkerRef.current = marker;
      } else {
        miniMapInstanceRef.current.invalidateSize();
        miniMapInstanceRef.current.setView([formLat, formLng], 16);
        if (miniMarkerRef.current) {
          miniMarkerRef.current.setLatLng([formLat, formLng]);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isAddModalOpen]);

  // Sync mini map view when formLat/formLng changes via select or locate
  useEffect(() => {
    if (miniMapInstanceRef.current && miniMarkerRef.current) {
      miniMarkerRef.current.setLatLng([formLat, formLng]);
      miniMapInstanceRef.current.panTo([formLat, formLng]);
    }
  }, [formLat, formLng]);

  // Available amenities for checklist
  const AMENITY_OPTIONS = [
    'High-Speed WiFi',
    'Study Table & Chair',
    'Kitchen Access',
    'Cooking Allowed',
    'Drinking Water (Free)',
    'Laundry Area',
    'CCTV Security',
    'Individual Submeter',
    'Quiet Study Hours',
    'Motorcycle Parking',
    'Air-Conditioning',
    'Screened Windows'
  ];

  // Preset cover image options for Capiz student houses
  const IMAGE_PRESETS = [
    { label: 'Clean Student Dorm', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Spacious Room & Desk', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' },
    { label: 'Bedspace Residence', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80' },
    { label: 'Modern Apartment Pad', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
  ];

  // Helper: Auto-set coordinates based on school or municipality
  const autoDetectCoords = (schoolId: string, muni: string) => {
    const targetSchool = schools.find((s) => s.id === schoolId);
    if (targetSchool) {
      // Place adjacent along road to the school (0.0012 lat, 0.0008 lng)
      const lat = Number((targetSchool.lat + 0.0012).toFixed(6));
      const lng = Number((targetSchool.lng + 0.0008).toFixed(6));
      setFormLat(lat);
      setFormLng(lng);
      return;
    }
    const muniData = CAPIZ_MUNICIPALITIES.find((m) => m.name === muni);
    if (muniData) {
      setFormLat(muniData.lat);
      setFormLng(muniData.lng);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingProperty(null);
    setFormName('');
    const defaultSchool = schools.find((s) => s.id === 'capsu-pilar') || schools[0];
    const defaultSchoolId = defaultSchool?.id || 'capsu-pilar';
    setFormSchoolId(defaultSchoolId);
    setFormMunicipality('Pilar');
    setFormBarangay('Natividad (Poblacion)');
    setFormAddress('12 Rizal St. (Near CAPSU Pilar Gate), Natividad');
    setFormRent(1600);
    setFormDeposit(1600);
    setFormPropertyType('Boarding House');
    setFormRoomType('Single Room');
    setFormGenderPolicy('Any / Co-ed');
    setFormCurfew('10:00 PM');
    setFormWater('Included in Rent');
    setFormElectric('Submetered');
    setFormBathroom('Common / Shared');
    setFormKitchen(true);
    setFormLaundry(true);
    setFormWifiSpeed(50);
    setFormCoverImage(IMAGE_PRESETS[0].url);
    setFormGalleryImages([IMAGE_PRESETS[0].url]);
    setNewImageUrlInput('');
    setCustomAmenityInput('');
    setFormDescription('Tahimik at ligtas na boarding house para sa mga estudyante. Malapit sa gate ng eskwelahan na may mabilis na internet at maayos na bentilasyon.');
    setFormAmenities(['High-Speed WiFi', 'Study Table & Chair', 'Kitchen Access', 'CCTV Security']);
    
    // Set auto coordinates along road near CAPSU Pilar
    if (defaultSchool) {
      setFormLat(Number((defaultSchool.lat + 0.0012).toFixed(6)));
      setFormLng(Number((defaultSchool.lng + 0.0008).toFixed(6)));
    } else {
      setFormLat(11.4842);
      setFormLng(123.0048);
    }

    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setFormName(prop.name);
    setFormSchoolId(prop.nearestSchoolId);
    setFormMunicipality(prop.municipality);
    setFormBarangay(prop.barangay);
    setFormAddress(prop.streetAddress);
    setFormRent(prop.monthlyRent);
    setFormDeposit(prop.depositFee || prop.monthlyRent);
    setFormPropertyType(prop.propertyType);
    setFormRoomType(prop.roomType);
    setFormGenderPolicy(prop.genderPolicy);
    setFormCurfew(prop.curfewTime || '10:00 PM');
    setFormWater(prop.waterArrangement);
    setFormElectric(prop.electricArrangement);
    setFormBathroom(prop.bathroomType);
    setFormKitchen(prop.kitchenAccess);
    setFormLaundry(prop.laundryAccess);
    setFormWifiSpeed(prop.wifiSpeedMbps || 50);
    const existingGallery = (prop.galleryImages && prop.galleryImages.length > 0)
      ? prop.galleryImages
      : [prop.coverImage];
    setFormGalleryImages(existingGallery);
    setFormCoverImage(prop.coverImage || existingGallery[0]);
    setNewImageUrlInput('');
    setCustomAmenityInput('');
    setFormDescription(prop.description);
    setFormAmenities(prop.amenities || []);
    setFormLat(prop.lat);
    setFormLng(prop.lng);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Handle Multi-Image Upload (No limit)
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setFormError('Pumili lamang ng wastong image file (JPG, PNG, WebP).');
      return;
    }

    let completed = 0;
    const uploadedUrls: string[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          uploadedUrls.push(base64Url);
        }
        completed++;
        if (completed === validFiles.length) {
          setFormGalleryImages((prev) => {
            const updated = [...prev, ...uploadedUrls];
            if (!formCoverImage && updated.length > 0) {
              setFormCoverImage(updated[0]);
            }
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so owner can select more files if desired
    e.target.value = '';
  };

  // Add Image URL to Gallery
  const handleAddImageUrl = () => {
    const trimmed = newImageUrlInput.trim();
    if (!trimmed) return;
    setFormGalleryImages((prev) => [...prev, trimmed]);
    if (!formCoverImage) {
      setFormCoverImage(trimmed);
    }
    setNewImageUrlInput('');
  };

  // Remove Image from Gallery
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormGalleryImages((prev) => {
      const targetUrl = prev[indexToRemove];
      const remaining = prev.filter((_, idx) => idx !== indexToRemove);
      if (formCoverImage === targetUrl) {
        setFormCoverImage(remaining[0] || '');
      }
      return remaining;
    });
  };

  // Set an image as primary cover
  const handleSetCoverImage = (url: string) => {
    setFormCoverImage(url);
  };

  // Add Custom Amenity
  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (!formAmenities.includes(trimmed)) {
      setFormAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenityInput('');
  };

  // Remove Amenity
  const handleRemoveAmenity = (amenityToRemove: string) => {
    setFormAmenities((prev) => prev.filter((a) => a !== amenityToRemove));
  };

  // GPS Locate current owner device
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Hindi suportado ang geolocation sa iyong browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormLat(lat);
        setFormLng(lng);
      },
      (err) => {
        setIsDetectingLocation(false);
        alert(`Hindi nakuha ang GPS: ${err.message}. Maaari mong i-click ang kalsada sa mini map sa ibaba.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit Listing Form
  const handleSubmitListing = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Final validated coordinates
    const lat = formLat;
    const lng = formLng;

    // Determine final primary cover image & gallery
    const fallbackPreset = IMAGE_PRESETS[0].url;
    const finalCoverImage = formCoverImage || formGalleryImages[0] || fallbackPreset;
    const finalGalleryImages = formGalleryImages.length > 0 ? formGalleryImages : [finalCoverImage];

    if (editingProperty) {
      // Update existing
      StorageService.updateProperty(
        editingProperty.id,
        {
          name: formName,
          nearestSchoolId: formSchoolId,
          municipality: formMunicipality,
          barangay: formBarangay,
          streetAddress: formAddress,
          monthlyRent: Number(formRent),
          depositFee: Number(formDeposit),
          propertyType: formPropertyType,
          roomType: formRoomType,
          genderPolicy: formGenderPolicy,
          curfewTime: formCurfew,
          waterArrangement: formWater,
          electricArrangement: formElectric,
          bathroomType: formBathroom,
          kitchenAccess: formKitchen,
          laundryAccess: formLaundry,
          wifiSpeedMbps: Number(formWifiSpeed),
          coverImage: finalCoverImage,
          galleryImages: finalGalleryImages,
          description: formDescription,
          amenities: formAmenities,
          lat,
          lng,
        },
        user
      );
      setFormSuccess('Listing updated successfully!');
    } else {
      // Create new
      const result = StorageService.createProperty({
        name: formName,
        ownerId: user.id,
        ownerName: user.name,
        ownerPhone: user.phone || '0917 123 4567',
        isOwnerVerified: user.isVerifiedOwner || false,
        municipality: formMunicipality,
        barangay: formBarangay,
        streetAddress: formAddress,
        lat,
        lng,
        nearestSchoolId: formSchoolId,
        monthlyRent: Number(formRent),
        depositFee: Number(formDeposit),
        propertyType: formPropertyType,
        roomType: formRoomType,
        genderPolicy: formGenderPolicy,
        curfewTime: formCurfew,
        visitorPolicy: 'Allowed in lobby until 8:00 PM',
        waterArrangement: formWater,
        electricArrangement: formElectric,
        bathroomType: formBathroom,
        kitchenAccess: formKitchen,
        laundryAccess: formLaundry,
        wifiSpeedMbps: Number(formWifiSpeed),
        coverImage: finalCoverImage,
        galleryImages: finalGalleryImages,
        description: formDescription,
        amenities: formAmenities,
        status: 'approved', // instantly approved for real owner
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to create listing.');
        return;
      }
      setFormSuccess('Bagong Boarding House naidagdag at approved na sa Map!');
    }

    onRefreshProperties();
    setTimeout(() => {
      setIsAddModalOpen(false);
      setFormSuccess(null);
    }, 600);
  };

  // Delete Listing
  const handleDeleteListing = (propId: string) => {
    if (confirm('Sigurado ka ba na nais mong burahin ang boarding house listing na ito?')) {
      StorageService.deleteProperty(propId, user);
      onRefreshProperties();
    }
  };

  // Update Student Reservation Request
  const handleUpdateReservation = (resId: string, status: ReservationRequest['status']) => {
    StorageService.updateReservationStatus(resId, status, user);
    setOwnerReservations(StorageService.getOwnerReservations(user.id));
  };

  // Send Message in Inbox
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !replyText.trim()) return;

    StorageService.sendMessage(activeConvId, user, replyText.trim());
    setReplyText('');
    setConversations(StorageService.getOwnerConversations(user.id));
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeMessages = activeConv ? StorageService.getMessages(activeConv.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6 text-[#173747] dark:text-slate-100 transition-colors">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#14232d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-[#087F78] shrink-0">
              <Building2 className="w-7 h-7 text-[#F6B52E]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#173747] dark:text-slate-100 tracking-tight">
                  {user.businessName || `${user.name}'s Boarding Houses`}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.isVerifiedOwner ? 'Verified Landlord' : 'BH Owner'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>May-ari: <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong></span>
                <span className="text-slate-400">·</span>
                <span>Contact: {user.phone || 'Walang contact'}</span>
                <span className="text-slate-400">·</span>
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Mag-post ng Bagong BH</span>
            </button>

            <button
              type="button"
              onClick={() => onExploreMap()}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
              <span className="hidden sm:inline">Tingnan sa Map</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Aking Listings</div>
            <div className="text-xl font-extrabold text-[#173747] dark:text-slate-100 tabular-nums mt-0.5">
              {myProperties.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Paupahan</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Live & Approved</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {myProperties.filter((p) => p.status === 'approved').length}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Reservations</div>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              {ownerReservations.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Request</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Student Inquiries</div>
            <div className="text-xl font-extrabold text-[#075E59] dark:text-emerald-400 tabular-nums mt-0.5">
              {conversations.length}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Kabuuang Views</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">Awtomatiko</span>
            </div>
            <div className="text-xl font-extrabold text-[#075E59] dark:text-emerald-400 tabular-nums mt-0.5">
              {myProperties.reduce((acc, p) => acc + (p.viewsCount || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14232d] rounded-xl p-1.5 shadow-xs gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'listings'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Aking BH ({myProperties.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reservations'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Mga Reservations ({ownerReservations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Mga Reviews ({ownerReviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'inbox'
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
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Profile & Verification</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#173747] dark:text-slate-100">
              Listahan ng Iyong Mga Boarding House sa Capiz
            </h2>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="py-1.5 px-3 rounded-lg bg-[#075E59] text-white text-xs font-bold shadow-xs hover:bg-[#064C48] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Magdagdag</span>
            </button>
          </div>

          {myProperties.length === 0 ? (
            <div className="bg-white dark:bg-[#14232d] rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Wala ka pang nakalista na boarding house</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto mb-5 leading-relaxed">
                Mag-post ng iyong boarding house, dormitory, o bedspace upang madaling makita ng mga estudyante malapit sa kanilang eskwelahan sa Capiz.
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="py-2.5 px-5 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Mag-post ng Unang Listing</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProperties.map((property) => {
                const nearestSchool = schools.find((s) => s.id === property.nearestSchoolId);
                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Image Cover */}
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <img
                        src={property.coverImage}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#075E59] text-white shadow-xs">
                        {property.propertyType}
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{property.status.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#173747] leading-snug line-clamp-1">
                          {property.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#075E59] shrink-0" />
                          <span>{property.barangay}, {property.municipality}</span>
                        </p>

                        <div className="mt-2.5 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                          <span>Near: <strong>{nearestSchool?.shortName || 'Capiz Campus'}</strong></span>
                          <span className="font-bold text-[#075E59]">~{property.distanceToSchoolKm} km</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#075E59] tabular-nums">
                              ₱{property.monthlyRent.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-500">/ buwan</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {property.galleryImages && property.galleryImages.length > 1 && (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                📷 {property.galleryImages.length}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/80">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="tabular-nums font-bold">
                                {property.averageRating ? property.averageRating.toFixed(1) : '—'}
                              </span>
                              {property.totalReviews ? (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">({property.totalReviews})</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                              <Eye className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                              <span className="tabular-nums font-bold text-slate-800 dark:text-slate-100">{property.viewsCount || 0}</span>
                              <span className="text-[10px] text-slate-400 font-normal">views</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onViewPropertyDetails(property)}
                          className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(property)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-[#075E59]"
                            title="Edit Listing"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(property.id)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: RESERVATION REQUESTS FROM STUDENTS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#14232d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-[#173747] dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
                <span>Mga Natanggap na Booking & Reservation Requests ({ownerReservations.length})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mula sa mga estudyanteng nais magpareserba ng kwarto o bedspace para sa darating na semester.
              </p>
            </div>
          </div>

          {ownerReservations.length === 0 ? (
            <div className="bg-white dark:bg-[#14232d] rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Wala pang natatanggap na reservation request</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Dito lalabas ang mga booking request ng mga estudyante na may kasamang target move-in date at uri ng kwarto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerReservations.map((res) => {
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
                            {res.studentName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            Para sa: <strong className="text-slate-700 dark:text-slate-200">{res.propertyName}</strong>
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
                          {res.status === 'accepted' ? '✓ Tinanggap Mo Na' : res.status === 'declined' ? '✗ Tinanggihan' : res.status === 'cancelled' ? 'Kinansela ng Estudyante' : '⏳ Naghihintay ng Pasya'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Target Move-in:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{res.targetMoveInDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Uri ng Kwarto:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{res.preferredRoomType} ({res.occupantsCount} {res.occupantsCount === 1 ? 'Solo' : 'Tao'})</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Email ng Estudyante:</span>
                          <span className="text-slate-600 dark:text-slate-300 truncate block">{res.studentEmail}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Telepono:</span>
                          <a href={`tel:${res.studentPhone.replace(/\s+/g, '')}`} className="font-semibold text-[#075E59] dark:text-emerald-400 hover:underline">
                            {res.studentPhone}
                          </a>
                        </div>
                      </div>

                      {res.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-2.5 bg-slate-50/60 dark:bg-slate-800/60 rounded-xl italic border border-slate-100 dark:border-slate-800">
                          Mensahe: "{res.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Controls for Landlord */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${res.studentPhone.replace(/\s+/g, '')}`}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                          <span>Tawagan</span>
                        </a>

                        <a
                          href={`sms:${res.studentPhone.replace(/\s+/g, '')}?body=Kumusta ${encodeURIComponent(res.studentName)}! Tungkol sa iyong reservation request sa ${encodeURIComponent(res.propertyName)}...`}
                          className="py-1.5 px-3 rounded-lg bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 text-xs font-semibold hover:bg-[#075E59]/20 transition-colors"
                        >
                          Mag-text
                        </a>
                      </div>

                      {res.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateReservation(res.id, 'accepted')}
                            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tanggapin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateReservation(res.id, 'declined')}
                            className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold transition-colors"
                          >
                            Tanggihan
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {res.status === 'accepted' ? 'Naaprubahan na ang reservation' : 'Nasagot na'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: STUDENT REVIEWS & FEEDBACK */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#14232d] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-[#173747] dark:text-slate-100 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Mga Review at Feedback mula sa mga Estudyante ({ownerReviews.length})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Basahin ang mga star ratings at tapat na komento ng mga boarder sa iyong mga paupahan sa Capiz.
              </p>
            </div>
          </div>

          {ownerReviews.length === 0 ? (
            <div className="bg-white dark:bg-[#14232d] rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center mb-3">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Wala pang mga review mula sa mga estudyante
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Kapag nag-iwan ng review ang iyong mga boarder sa kanilang student dashboard o sa details page ng iyong boarding house, dito mo mababasa ang kanilang mga rating at mungkahi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerReviews.map((rev) => {
                const targetProp = myProperties.find((p) => p.id === rev.propertyId);
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
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                Verified Boarder
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {rev.propertyName} · {dateFormatted} {rev.stayDuration ? `(${rev.stayDuration})` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black">{rev.rating}</span>
                          <span className="text-[10px] text-amber-600/70 font-normal">/ 5</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl leading-relaxed border border-slate-100 dark:border-slate-800">
                        "{rev.comment}"
                      </p>

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

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      {targetProp && (
                        <button
                          type="button"
                          onClick={() => onViewPropertyDetails(targetProp)}
                          className="py-1.5 px-3 rounded-lg bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 text-xs font-semibold hover:bg-[#075E59]/20 transition-colors"
                        >
                          Tingnan ang BH
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

      {/* TAB B: INBOX & INQUIRIES */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[460px]">
          {/* Conversation List */}
          <div className="border-r border-slate-200 p-3 space-y-2 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-700 px-2 py-1">
              Mga Tanong ng Estudyante ({conversations.length})
            </div>
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Wala pang mga estudyante na nagpadala ng inquiry. Dito lalabas ang kanilang mga mensahe kapag nag-inquire sila sa iyong listing.
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
                    <span className="text-xs font-bold text-[#173747] truncate">{c.studentName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Re: {c.propertyName}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-1">{c.lastMessageText}</div>
                </button>
              ))
            )}
          </div>

          {/* Conversation Thread */}
          <div className="col-span-2 flex flex-col h-full bg-white">
            {activeConv ? (
              <>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                  <div>
                    <h3 className="text-sm font-bold text-[#173747]">Estudyante: {activeConv.studentName}</h3>
                    <p className="text-xs text-slate-500">Listing: {activeConv.propertyName}</p>
                  </div>
                </div>

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
                            {isMe ? 'Ikaw (Landlord)' : msg.senderName}
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

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Sumulat ng sagot sa estudyante..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Sumagot</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
                Pumili ng conversation sa kaliwa para sumagot sa mga estudyante.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB C: LANDLORD VERIFICATION & PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl mx-auto shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#173747]">Landlord Verification Status</h2>
              <p className="text-xs text-slate-500">Capiz Provincial Boarding House Accreditation</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-700">
                {user.isVerifiedOwner ? 'Verified & Legitimate Landlord' : 'Active Registered Owner'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Business:</span>
              <span className="font-bold text-slate-800">{user.businessName || 'Independent Owner'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Number:</span>
              <span className="font-bold text-slate-800">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-bold text-slate-800">{user.email}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Ang iyong mga boarding house listings ay binibisita ng mga estudyante mula sa iba't ibang campus sa Capiz tulad ng CAPSU Pilar, CAPSU Roxas, at Filamer Christian University. Siguraduhin na updated ang iyong contact number para madaling matawagan.
          </p>
        </div>
      )}

      {/* 4. MODAL: POST / EDIT BOARDING HOUSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#075E59] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#F6B52E]" />
                <h2 className="text-base font-bold">
                  {editingProperty ? 'I-edit ang Boarding House' : 'Mag-post ng Bagong Boarding House'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitListing} className="p-5 overflow-y-auto flex-1 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Property Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pangalan ng Boarding House *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pilar Scholars Academic Dormitory"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#075E59]"
                />
              </div>

              {/* Nearest School & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pinakamalapit na Campus sa Capiz *
                  </label>
                  <select
                    value={formSchoolId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setFormSchoolId(newId);
                      const matched = schools.find((s) => s.id === newId);
                      if (matched) {
                        setFormMunicipality(matched.municipality);
                        autoDetectCoords(newId, matched.municipality);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#173747] focus:ring-2 focus:ring-[#075E59]"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortName} — {s.municipality} ({s.campusName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Munisipyo sa Capiz *
                  </label>
                  <select
                    value={formMunicipality}
                    onChange={(e) => {
                      const newMuni = e.target.value;
                      setFormMunicipality(newMuni);
                      const m = CAPIZ_MUNICIPALITIES.find((item) => item.name === newMuni);
                      if (m && m.barangays[0]) {
                        setFormBarangay(m.barangays[0]);
                      }
                      autoDetectCoords(formSchoolId, newMuni);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#173747] focus:ring-2 focus:ring-[#075E59]"
                  >
                    {CAPIZ_MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Barangay *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBarangay}
                    onChange={(e) => setFormBarangay(e.target.value)}
                    placeholder="e.g. Natividad (Poblacion)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#075E59]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. 15 Rizal St., 200m mula sa Campus Gate"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#075E59]"
                  />
                </div>
              </div>

              {/* AUTOMATIC ROAD / MAP LOCATION DETECTOR & PICKER */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#075E59]">
                      <Crosshair className="w-4 h-4 text-[#F6B52E]" />
                      <span>Eksaktong Lokasyon sa Map & Kalsada (Road Pin)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Kusang inilalagay sa kalsada malapit sa campus. Maaari mo ring i-drag o i-click ang mapa upang itapat sa tapat mismo ng inyong bahay.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => autoDetectCoords(formSchoolId, formMunicipality)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                      title="I-reset at itapat sa kalsada ng napiling campus"
                    >
                      <Navigation className="w-3 h-3 text-[#075E59]" />
                      <span>Auto-Snap sa Kalsada</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isDetectingLocation}
                      className="px-2.5 py-1.5 rounded-lg border border-[#075E59] bg-[#075E59]/10 hover:bg-[#075E59]/20 text-[11px] font-bold text-[#075E59] flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Locate className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      <span>{isDetectingLocation ? 'Hinahanap...' : 'Gamitin ang GPS Ko'}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Mini Leaflet Map Container */}
                <div className="relative rounded-xl overflow-hidden border border-slate-300 h-44 shadow-inner">
                  <div ref={miniMapContainerRef} className="w-full h-full z-0" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-medium text-slate-700 shadow-xs z-1000 border border-slate-200 pointer-events-none">
                    🎯 Click sa mapa o kalsada para ilipat ang pin
                  </div>
                </div>

                {/* Coordinate display */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                  <span>Latitude: <strong className="text-slate-800">{formLat}</strong></span>
                  <span>Longitude: <strong className="text-slate-800">{formLng}</strong></span>
                  <span className="text-emerald-700 font-sans font-semibold">✓ Ready sa Public Map</span>
                </div>
              </div>

              {/* Rent & Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Buwanang Upa (Monthly Rent in PHP) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400 text-xs">₱</span>
                    <input
                      type="number"
                      required
                      min={500}
                      step={50}
                      value={formRent}
                      onChange={(e) => setFormRent(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-[#075E59]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deposit Fee (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400 text-xs">₱</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-[#075E59]"
                    />
                  </div>
                </div>
              </div>

              {/* Types & Restrictions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={formPropertyType}
                    onChange={(e) => setFormPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#075E59]"
                  >
                    <option value="Boarding House">Boarding House</option>
                    <option value="Dormitory">Dormitory</option>
                    <option value="Apartment / Pad">Apartment / Pad</option>
                    <option value="Transient">Transient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room Type
                  </label>
                  <select
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value as RoomType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#075E59]"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Shared Room (2-3)">Shared Room (2-3)</option>
                    <option value="Bedspace (4+)">Bedspace (4+)</option>
                    <option value="Studio Unit">Studio Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender Policy
                  </label>
                  <select
                    value={formGenderPolicy}
                    onChange={(e) => setFormGenderPolicy(e.target.value as GenderRestriction)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#075E59]"
                  >
                    <option value="Any / Co-ed">Any / Co-ed</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Male Only">Male Only</option>
                  </select>
                </div>
              </div>

              {/* Utilities & Arrangements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kuryente (Electricity)</label>
                  <select
                    value={formElectric}
                    onChange={(e) => setFormElectric(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Included in Rent">Included in Rent</option>
                    <option value="Submetered">Submetered</option>
                    <option value="Shared Bill">Shared Bill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tubig (Water)</label>
                  <select
                    value={formWater}
                    onChange={(e) => setFormWater(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Included in Rent">Included in Rent</option>
                    <option value="Submetered">Submetered</option>
                    <option value="Shared Bill">Shared Bill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Curfew</label>
                  <input
                    type="text"
                    value={formCurfew}
                    onChange={(e) => setFormCurfew(e.target.value)}
                    placeholder="10:00 PM o Walang Curfew"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Photos Gallery (WALANG LIMIT) */}
              <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Mga Larawan ng Boarding House *
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Walang Limit ({formGalleryImages.length} larawan)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mag-upload ng sariling mga larawan ng kwarto, CR, kusina, o gate mula sa inyong device o camera.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3.5 rounded-xl border border-[#075E59] bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Larawan mula sa Device / Camera</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleMultipleImageUpload}
                  />
                </div>

                {/* Primary Cover Preview */}
                <div className="relative aspect-[16/9] max-h-52 rounded-xl overflow-hidden border-2 border-[#075E59] bg-slate-100 flex items-center justify-center shadow-xs">
                  <img
                    src={formCoverImage || formGalleryImages[0] || IMAGE_PRESETS[0].url}
                    alt="Active Cover Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#075E59]/90 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F6B52E]" />
                    <span>Pangunahing Cover Photo (Makikita sa Mapa)</span>
                  </div>
                </div>

                {/* Gallery List (All Uploaded Images) */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Naka-upload na mga Larawan sa Gallery:</span>
                    <span className="text-slate-400 font-normal text-[10px]">I-click ang "Gawing Cover" para piliin ang pangunahing larawan</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {formGalleryImages.map((imgUrl, idx) => {
                      const isCover = (formCoverImage === imgUrl) || (!formCoverImage && idx === 0);
                      return (
                        <div
                          key={`${imgUrl}-${idx}`}
                          className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group ${
                            isCover
                              ? 'border-[#075E59] ring-2 ring-[#075E59]/25 shadow-sm'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                          {isCover && (
                            <span className="absolute top-1 left-1 bg-[#075E59] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                              ★ COVER
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(imgUrl)}
                                className="px-2 py-1 rounded-lg bg-[#075E59] text-white text-[10px] font-bold hover:bg-[#064C48] shadow transition-colors"
                              >
                                Gawing Cover
                              </button>
                            )}
                            {formGalleryImages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow transition-colors"
                                title="Alisin ang larawang ito"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add via URL input bar */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">O mag-dagdag ng larawan gamit ang Link/URL:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      placeholder="I-paste ang Image URL (hal. https://...)..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-[#075E59]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-[#075E59] hover:text-white text-slate-800 text-xs font-bold transition-colors shrink-0"
                    >
                      + Idagdag
                    </button>
                  </div>
                </div>

                {/* Quick Presets for convenience */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1">Quick Presets (I-click para idagdag sa gallery):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          if (!formGalleryImages.includes(preset.url)) {
                            setFormGalleryImages(prev => [...prev, preset.url]);
                          }
                        }}
                        className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#075E59] hover:text-[#075E59] transition-colors"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities na Kasama + Custom Amenities Adder */}
              <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Mga Kasamang Amenities *
                    </label>
                    <span className="text-[11px] font-bold text-[#075E59] bg-[#075E59]/10 px-2 py-0.5 rounded-full">
                      {formAmenities.length} napiling amenities
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pumili sa karaniwang listahan o magdagdag ng sariling custom amenities na meron ang inyong bahay.
                  </p>
                </div>

                {/* Standard Amenities Checkbox Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITY_OPTIONS.map((am) => {
                    const checked = formAmenities.includes(am);
                    return (
                      <label
                        key={am}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          checked
                            ? 'bg-[#075E59]/10 border-[#075E59] text-[#075E59] font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setFormAmenities(formAmenities.filter((a) => a !== am));
                            } else {
                              setFormAmenities([...formAmenities, am]);
                            }
                          }}
                          className="rounded text-[#075E59] focus:ring-[#075E59]"
                        />
                        <span>{am}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Amenity Adder Input */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">
                    Mag-dagdag ng Sariling Amenity (Custom):
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customAmenityInput}
                      onChange={(e) => setCustomAmenityInput(e.target.value)}
                      placeholder="Hal: Libreng Bigas, CCTV sa Gate, May Sari-Sari Store, Refrigerator, Study Area..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-[#075E59]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomAmenity();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAmenity}
                      className="px-3.5 py-2 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Idagdag</span>
                    </button>
                  </div>
                </div>

                {/* Currently Active Selected Amenities Pills */}
                {formAmenities.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold mb-1.5">
                      Lahat ng Kasama sa Listing (I-click ang × para tanggalin):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formAmenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#075E59]/10 text-[#075E59] border border-[#075E59]/20"
                        >
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAmenity(amenity)}
                            className="hover:text-rose-600 transition-colors"
                            title={`Alisin ang ${amenity}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsyon para sa mga Estudyante *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ilarawan ang kapaligiran, mga patakaran, at kaginhawaan ng inyong boarding house..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#075E59]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingProperty ? 'I-save ang Pagbabago' : 'I-publish ang Boarding House'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
