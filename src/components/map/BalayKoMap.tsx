import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Property, School } from '../../types';
import { Locate, Compass, School as SchoolIcon, ChevronDown } from 'lucide-react';

interface BalayKoMapProps {
  center: [number, number];
  zoom?: number;
  properties: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty: (property: Property) => void;
  activeSchool?: School | null;
  schools?: School[];
  onSelectSchool?: (school: School) => void;
  radiusKm?: number;
  userLocation?: [number, number] | null;
  onRequestUserLocation?: () => void;
  isLocating?: boolean;
  className?: string;
  onOpenCampusSelector?: () => void;
  isLoading?: boolean;
}

export const BalayKoMap: React.FC<BalayKoMapProps> = ({
  center,
  zoom = 14,
  properties,
  selectedPropertyId,
  onSelectProperty,
  activeSchool,
  schools = [],
  onSelectSchool,
  radiusKm = 2,
  userLocation,
  onRequestUserLocation,
  isLocating = false,
  className = 'h-full w-full',
  onOpenCampusSelector,
  isLoading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const campusMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Smooth Campus Transition Animation State & Ref
  const prevSchoolIdRef = useRef<string | null>(activeSchool?.id || null);
  const [isTransitioningCampus, setIsTransitioningCampus] = useState(false);
  const [isTilesLoading, setIsTilesLoading] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
      });

      tileLayerGroupRef.current = L.layerGroup().addTo(map);

      // Clean OpenStreetMap Tile Layer with loading listeners
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      tileLayer.on('loading', () => setIsTilesLoading(true));
      tileLayer.on('load', () => setIsTilesLoading(false));
      tileLayer.addTo(tileLayerGroupRef.current);

      // Safety timer so loading skeleton fades out smoothly
      const initialTimer = setTimeout(() => {
        setIsTilesLoading(false);
      }, 600);

      // Standard Zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layers for campus pins and property markers
      campusMarkersLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      return () => {
        clearTimeout(initialTimer);
      };
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Smooth Transition Animation when switching campuses (Leaflet Cinematic flyTo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeSchool) return;

    // Detect if campus actually changed
    if (prevSchoolIdRef.current && prevSchoolIdRef.current !== activeSchool.id) {
      setIsTransitioningCampus(true);
      setIsTilesLoading(true);

      // Fly camera smoothly to the destination campus coordinates
      map.flyTo([activeSchool.lat, activeSchool.lng], 15, {
        duration: 1.6,
        easeLinearity: 0.25,
      });

      const timer = setTimeout(() => {
        setIsTransitioningCampus(false);
        setIsTilesLoading(false);
      }, 1600);

      prevSchoolIdRef.current = activeSchool.id;
      return () => clearTimeout(timer);
    } else {
      prevSchoolIdRef.current = activeSchool.id;
    }
  }, [activeSchool]);

  // Update Center smoothly for non-campus switch updates (e.g. selection or reset)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isTransitioningCampus) return;

    map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, isTransitioningCampus]);

  // Render Clean Minimalist Campus Pins (NO bulky floating billboards over the map)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const campusGroup = campusMarkersLayerRef.current;
    if (!map || !campusGroup) return;

    campusGroup.clearLayers();

    const listToRender = schools && schools.length > 0 ? schools : (activeSchool ? [activeSchool] : []);

    listToRender.forEach((school) => {
      const isActive = activeSchool && activeSchool.id === school.id;

      // Clean round icon pin with graduation cap
      const campusHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background-color: ${isActive ? '#075E59' : '#ffffff'}; 
            color: ${isActive ? '#F6B52E' : '#075E59'}; 
            width: ${isActive ? '34px' : '28px'}; 
            height: ${isActive ? '34px' : '28px'}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 3px 10px rgba(0,0,0,0.25); 
            border: 2px solid ${isActive ? '#F6B52E' : '#075E59'};
            transition: transform 0.15s ease;
          " title="${school.name}">
            <svg width="${isActive ? '18' : '15'}" height="${isActive ? '18' : '15'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
        </div>
      `;

      const campusIcon = L.divIcon({
        html: campusHtml,
        className: `custom-campus-pin-${school.id}`,
        iconSize: isActive ? [34, 34] : [28, 28],
        iconAnchor: isActive ? [17, 17] : [14, 14],
      });

      const marker = L.marker([school.lat, school.lng], {
        icon: campusIcon,
        zIndexOffset: isActive ? 1000 : 700,
      });

      marker.bindPopup(`
        <div style="padding: 10px 12px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 190px;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #075E59; letter-spacing: 0.5px;">
            ${isActive ? '★ Active Selected Campus' : 'Capiz College Campus'}
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #173747; margin-top: 3px; line-height: 1.3;">
            ${school.name}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 3px;">
            📍 ${school.address}
          </div>
          <div style="margin-top: 8px;">
            <button 
              id="btn-select-campus-${school.id}" 
              style="width: 100%; min-height: 32px; background: #075E59; color: #ffffff; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; padding: 5px 10px; display: flex; align-items: center; justify-content: center;"
            >
              <span>Piliin ang Campus na Ito</span>
            </button>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-campus-${school.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectSchool) onSelectSchool(school);
            map.closePopup();
            map.setView([school.lat, school.lng], 16, { animate: true });
          };
        }
      });

      marker.on('click', () => {
        if (onSelectSchool) onSelectSchool(school);
      });

      marker.addTo(campusGroup);
    });
  }, [schools, activeSchool, onSelectSchool]);

  // Radius Circle around Active School (Subtle and Clean)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (activeSchool && radiusKm && radiusKm > 0) {
      const radiusMeters = radiusKm * 1000;
      const circle = L.circle([activeSchool.lat, activeSchool.lng], {
        radius: radiusMeters,
        color: '#087F78',
        fillColor: '#087F78',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      radiusCircleRef.current = circle;
    }
  }, [activeSchool, radiusKm]);

  // Render Clean Property Markers with Verified & Unverified Badges
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    properties.forEach((prop) => {
      const isSelected = prop.id === selectedPropertyId;
      const isVerified = Boolean(prop.isVerifiedListing ?? prop.isOwnerVerified);
      const photoSize = isSelected ? 44 : 36;

      const markerHtml = `
        <div class="${isSelected ? 'selected-pin-pulse' : ''}" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s ease;">
          <div style="
            position: relative;
            width: ${photoSize}px;
            height: ${photoSize}px;
            border-radius: 12px;
            overflow: visible;
            box-shadow: ${isVerified ? '0 4px 14px rgba(7,94,89,0.35)' : '0 3px 10px rgba(0,0,0,0.18)'};
          ">
            <div style="
              width: 100%;
              height: 100%;
              border-radius: 12px;
              overflow: hidden;
              border: ${isSelected ? '3px solid #F6B52E' : isVerified ? '2px solid #075E59' : '2px dashed #94A3B8'};
              background: #ffffff;
            ">
              <img 
                src="${prop.coverImage}" 
                alt="${prop.name}" 
                style="width: 100%; height: 100%; object-fit: cover;" 
                onerror="this.onerror=null; this.src='/src/assets/images/boarding_house_villa_1791785104679.jpg';"
              />
            </div>

            <!-- Verified / Unverified Marker Badge Tag -->
            ${isVerified ? `
              <div style="
                position: absolute; 
                top: -5px; 
                right: -5px; 
                background: #075E59; 
                color: #ffffff; 
                border-radius: 9999px; 
                padding: 1px 4px; 
                display: flex; 
                align-items: center; 
                gap: 2px; 
                border: 1.5px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                font-size: 7.5px;
                font-weight: 800;
                line-height: 1;
                z-index: 10;
              " title="Verified Boarding House">
                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#F6B52E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span>VERIFIED</span>
              </div>
            ` : `
              <div style="
                position: absolute; 
                top: -5px; 
                right: -5px; 
                background: #475569; 
                color: #f1f5f9; 
                border-radius: 9999px; 
                padding: 1px 4px; 
                display: flex; 
                align-items: center; 
                gap: 2px; 
                border: 1.5px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                font-size: 7.5px;
                font-weight: 700;
                line-height: 1;
                z-index: 10;
              " title="Unverified Listing">
                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>UNVERIFIED</span>
              </div>
            `}
          </div>

          <div style="
            margin-top: -5px;
            background-color: ${isSelected ? '#F6B52E' : isVerified ? '#075E59' : '#475569'};
            color: ${isSelected ? '#173747' : '#ffffff'};
            padding: 2px 6px;
            border-radius: 9999px;
            font-size: 9.5px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 2px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            border: 1.5px solid #ffffff;
            white-space: nowrap;
            z-index: 2;
          ">
            ${isVerified ? `
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#173747' : '#F6B52E'}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            ` : ''}
            <span>₱${prop.monthlyRent.toLocaleString()}</span>
          </div>

          <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 4px solid ${isSelected ? '#F6B52E' : isVerified ? '#075E59' : '#475569'};
            margin-top: -1px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-property-pin',
        iconSize: [64, photoSize + 22],
        iconAnchor: [32, photoSize + 22],
      });

      const marker = L.marker([prop.lat, prop.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 900 : isVerified ? 600 : 400,
      });

      marker.bindPopup(`
        <div style="width: 220px; font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; border-radius: 12px;">
          <div style="position: relative; width: 100%; height: 100px; background: #e2e8f0;">
            <img 
              src="${prop.coverImage}" 
              alt="${prop.name}" 
              style="width: 100%; height: 100%; object-fit: cover;" 
              onerror="this.onerror=null; this.src='/src/assets/images/boarding_house_villa_1791785104679.jpg';"
            />
            <div style="position: absolute; bottom: 5px; left: 5px; background: rgba(23, 55, 71, 0.92); color: #F6B52E; font-weight: 800; font-size: 11px; padding: 2px 6px; border-radius: 6px;">
              ₱${prop.monthlyRent.toLocaleString()} / mo
            </div>
            ${isVerified ? `
              <div style="position: absolute; top: 5px; left: 5px; background: #075E59; color: #ffffff; font-weight: 800; font-size: 9px; padding: 2px 6px; border-radius: 6px; display: flex; align-items: center; gap: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#F6B52E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span>Verified House</span>
              </div>
            ` : `
              <div style="position: absolute; top: 5px; left: 5px; background: rgba(30, 41, 59, 0.9); color: #f1f5f9; font-weight: 700; font-size: 9px; padding: 2px 6px; border-radius: 6px; display: flex; align-items: center; gap: 3px;">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Unverified</span>
              </div>
            `}
          </div>

          <div style="padding: 10px; background: #ffffff;">
            <div style="font-weight: 800; font-size: 13px; color: #173747; line-height: 1.3;">
              ${prop.name}
            </div>
            <div style="font-size: 10.5px; color: #64748B; margin-top: 2px;">
              ${prop.roomType} · ${prop.genderPolicy}
            </div>
            <div style="font-size: 10.5px; color: #075E59; font-weight: 700; margin-top: 3px;">
              📍 ${prop.barangay}, ${prop.municipality} (${prop.distanceToSchoolKm} km)
            </div>

            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <button 
                id="btn-select-prop-${prop.id}" 
                style="flex: 1; min-height: 32px; background: #075E59; color: #ffffff; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; padding: 4px 8px; display: flex; align-items: center; justify-content: center;"
              >
                Tingnan Details
              </button>
            </div>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-prop-${prop.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectProperty(prop);
          };
        }
      });

      marker.on('click', () => {
        onSelectProperty(prop);
      });

      marker.addTo(markersGroup);
    });
  }, [properties, selectedPropertyId, onSelectProperty]);

  // Center on Selected Property
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPropertyId) return;

    const prop = properties.find((p) => p.id === selectedPropertyId);
    if (prop) {
      map.panTo([prop.lat, prop.lng], { animate: true, duration: 0.5 });
    }
  }, [selectedPropertyId, properties]);

  return (
    <div id="explore-map-container" className={`relative ${className} bg-slate-100 dark:bg-slate-900 overflow-hidden`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Subtle Map Tile Loading Skeleton Overlay */}
      <div 
        className={`absolute inset-0 z-[300] pointer-events-none transition-opacity duration-300 flex items-center justify-center ${
          isTilesLoading || isLoading ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-slate-100/40 dark:bg-[#0b151b]/40 backdrop-blur-[1px]" />
        {(isTilesLoading || isLoading) && !isTransitioningCampus && (
          <div className="relative z-10 bg-white/95 dark:bg-[#14232d]/95 border border-slate-200/90 dark:border-slate-700/80 shadow-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-pulse">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#075E59] border-t-transparent animate-spin" />
            <span className="text-[11px]">Nilo-load ang mapa ng Capiz...</span>
          </div>
        )}
      </div>

      {/* Campus Selector Floating Trigger (Top-Left of Map) */}
      {onOpenCampusSelector && activeSchool && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[400]">
          <button
            type="button"
            onClick={onOpenCampusSelector}
            className="h-9 px-3 bg-white/95 dark:bg-[#14232d]/95 backdrop-blur-md text-[#173747] dark:text-slate-100 hover:text-[#075E59] dark:hover:text-emerald-400 rounded-xl shadow-md border border-slate-200/90 dark:border-slate-700 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-xs font-bold cursor-pointer"
            title="Pumili ng ibang Capiz Campus"
          >
            <div className="w-5 h-5 rounded-lg bg-[#075E59]/10 text-[#075E59] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <SchoolIcon className="w-3 h-3" />
            </div>
            <span className="truncate max-w-[130px] sm:max-w-[200px]">{activeSchool.shortName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* Smooth Flying Transition Indicator */}
      {isTransitioningCampus && activeSchool && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[450] bg-white/95 dark:bg-[#14232d]/95 backdrop-blur-md text-[#075E59] dark:text-emerald-400 border border-[#075E59]/25 shadow-xl px-4 py-2 rounded-2xl flex items-center gap-2.5 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="w-5 h-5 rounded-full bg-[#075E59] text-white flex items-center justify-center animate-spin">
            <Compass className="w-3.5 h-3.5 text-[#F6B52E]" />
          </div>
          <div className="text-xs font-bold tracking-tight text-[#173747] dark:text-slate-100 flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Lilipat sa:</span>
            <span className="text-[#075E59] dark:text-emerald-400 font-black">{activeSchool.shortName}</span>
            <span className="text-[10px] text-slate-400 font-normal">({activeSchool.municipality})</span>
          </div>
        </div>
      )}

      {/* Clean, Unobtrusive GPS Trigger */}
      {onRequestUserLocation && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[400]">
          <button
            type="button"
            onClick={onRequestUserLocation}
            title="Gamitin ang Aking Lokasyon (GPS)"
            aria-label="Use My Location"
            disabled={isLocating}
            className="w-10 h-10 bg-white/95 dark:bg-[#14232d]/95 backdrop-blur-md text-[#173747] dark:text-slate-100 hover:text-[#075E59] dark:hover:text-emerald-400 rounded-xl shadow-md border border-slate-200/90 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin text-[#075E59]' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};
