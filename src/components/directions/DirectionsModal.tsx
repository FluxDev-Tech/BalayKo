import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property, School } from '../../types';
import { X, Navigation, Footprints, Car, Phone, MapPin, School as SchoolIcon, Compass, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  activeSchool: School | null;
  onFocusOnMainMap?: (property: Property) => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  onClose,
  property,
  activeSchool,
  onFocusOnMainMap,
}) => {
  const [travelMode, setTravelMode] = useState<'walking' | 'driving'>('walking');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const originLat = activeSchool?.lat ?? 11.4840; // CAPSU Pilar
  const originLng = activeSchool?.lng ?? 123.0051;
  const originName = activeSchool ? activeSchool.name : 'CAPSU Campus';
  const originShort = activeSchool ? activeSchool.shortName : 'Campus';

  const destLat = property?.lat ?? 11.4840;
  const destLng = property?.lng ?? 123.0051;
  const destName = property?.name ?? 'Boarding House';

  const straightLineDistance = property?.distanceToSchoolKm ?? 0.2;
  const roadDistance = Math.max(0.1, Math.round(straightLineDistance * 1.2 * 10) / 10);
  const roadMeters = Math.round(roadDistance * 1000);

  const walkingMinutes = property?.walkingMinutes ?? Math.max(1, Math.round((roadDistance / 4.5) * 60));
  const drivingMinutes = property?.drivingMinutes ?? Math.max(1, Math.round((roadDistance / 25) * 60));

  // Step-by-step turn route guidance
  const walkingSteps = [
    {
      title: `Gikan sa Gate sang ${originShort}`,
      instruction: `Lumabas sa main entrance gate sang ${originName} pakadto sa kalsada.`,
      distance: '30m',
      lat: originLat,
      lng: originLng,
    },
    {
      title: 'Lakat subay sa kalsada',
      instruction: `Maglakad sa paved access road sang ${property?.barangay || 'Pilar'} pakadto sa direccion sang ${property?.streetAddress || 'residential area'}.`,
      distance: `${Math.round(roadMeters * 0.7)}m`,
      lat: (originLat + destLat) / 2,
      lng: (originLng + destLng) / 2,
    },
    {
      title: `Abot sa ${destName}`,
      instruction: `Ara na sa imo tuo/wala ang ${destName}. Check ang gate number ukon verified BalayKo sign.`,
      distance: `${Math.round(roadMeters * 0.3)}m`,
      lat: destLat,
      lng: destLng,
    },
  ];

  const drivingSteps = [
    {
      title: `Sakay sang Tricycle sa ${originShort}`,
      instruction: `Magsakay sang tricycle ukon motor gikan sa gate sang ${originShort}. Hambala ang driver: "${property?.streetAddress}, ${property?.barangay}".`,
      distance: '50m',
      lat: originLat,
      lng: originLng,
    },
    {
      title: 'Subay sa Provincial / Barangay Road',
      instruction: `Diretso subay sa kalsada padulong sa ${property?.barangay}, Pilar. Normal fare: ₱15 - ₱20 para sa estudyante.`,
      distance: `${Math.round(roadMeters * 0.8)}m`,
      lat: (originLat + destLat) / 2,
      lng: (originLng + destLng) / 2,
    },
    {
      title: `Nanaog sa ${destName}`,
      instruction: `Nanaog diretso sa atubang sang ${destName}. May parking space para sa motor ukon tricycle.`,
      distance: 'Gate',
      lat: destLat,
      lng: destLng,
    },
  ];

  const activeSteps = travelMode === 'walking' ? walkingSteps : drivingSteps;
  const activeDuration = travelMode === 'walking' ? walkingMinutes : drivingMinutes;

  // Initialize and update the embedded Leaflet route map
  useEffect(() => {
    if (!isOpen || !property || !mapContainerRef.current) return;

    // Small delay to allow modal animation to complete so container dimensions are ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [(originLat + destLat) / 2, (originLng + destLng) / 2],
          zoom: 16,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const routeLayer = L.layerGroup().addTo(map);
        routeLayerRef.current = routeLayer;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const routeLayer = routeLayerRef.current;
      if (!map || !routeLayer) return;

      routeLayer.clearLayers();

      // 1. School Origin Marker
      const schoolHtml = `
        <div style="background-color: #075E59; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(7, 94, 89, 0.45); border: 2.5px solid #F6B52E;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
      `;
      const schoolIcon = L.divIcon({
        html: schoolHtml,
        className: 'origin-school-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const originMarker = L.marker([originLat, originLng], { icon: schoolIcon }).addTo(routeLayer);
      originMarker.bindPopup(`<strong>Gikan diri:</strong><br/>${originName}`);

      // 2. Boarding House Destination Marker (with auto-detected photo)
      const bhHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            position: relative;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            overflow: hidden;
            border: 3px solid #F6B52E;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            background: #ffffff;
          ">
            <img 
              src="${property.coverImage}" 
              alt="${property.name}" 
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.onerror=null; this.src='/src/assets/images/boarding_house_villa_1791785104679.jpg';"
            />
          </div>
          <div style="
            margin-top: -6px;
            background-color: #F6B52E;
            color: #173747;
            padding: 2px 7px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            box-shadow: 0 3px 8px rgba(0,0,0,0.22);
            border: 1.5px solid #ffffff;
            white-space: nowrap;
          ">
            ₱${property.monthlyRent.toLocaleString()}
          </div>
        </div>
      `;
      const bhIcon = L.divIcon({
        html: bhHtml,
        className: 'dest-bh-pin',
        iconSize: [50, 60],
        iconAnchor: [25, 58],
      });
      const destMarker = L.marker([destLat, destLng], { icon: bhIcon }).addTo(routeLayer);
      destMarker.bindPopup(`<strong>Destinasyon:</strong><br/>${property.name}<br/>₱${property.monthlyRent.toLocaleString()}/mo`);

      // 3. Polyline Route connecting origin to destination
      const routePoints: [number, number][] = [
        [originLat, originLng],
        [(originLat + destLat) / 2, (originLng + destLng) / 2],
        [destLat, destLng],
      ];

      const polyline = L.polyline(routePoints, {
        color: '#075E59',
        weight: 5,
        opacity: 0.9,
        dashArray: travelMode === 'walking' ? '8, 8' : undefined,
      }).addTo(routeLayer);

      // Route midpoint badge
      polyline.bindTooltip(
        `${travelMode === 'walking' ? '🚶' : '🛺'} ~${activeDuration} min (${roadMeters < 1000 ? `${roadMeters}m` : `${roadDistance}km`})`,
        {
          permanent: true,
          direction: 'center',
          className: 'bg-[#173747] text-[#F6B52E] font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md border border-[#F6B52E]/40',
        }
      );

      // Auto-fit bounds so both origin, destination, and route are visible
      const bounds = L.latLngBounds([
        [originLat, originLng],
        [destLat, destLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, property, originLat, originLng, destLat, destLng, travelMode, activeDuration, roadDistance, roadMeters, originName]);

  // Clean up map instance when modal closes
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const handleStepClick = (idx: number, step: typeof activeSteps[0]) => {
    setActiveStepIndex(idx);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([step.lat, step.lng], 17, { animate: true });
    }
  };

  const handleFocusMainMap = () => {
    if (onFocusOnMainMap) {
      onFocusOnMainMap(property);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#075E59] text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="pr-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F6B52E]">
              <Compass className="w-4 h-4" />
              <span>Direksyon kag Ruta sa BalayKo</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold mt-1 text-white leading-tight">
              Ruta pakadto sa {property.name}
            </h2>
            <p className="text-xs text-slate-200 mt-0.5">
              Gikan sa <span className="font-semibold text-white">{originShort}</span> ({property.municipality}, Capiz)
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Isara ang modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Travel Mode Toggle & Stats Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setTravelMode('walking');
                setActiveStepIndex(0);
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                travelMode === 'walking'
                  ? 'bg-white text-[#075E59] shadow-sm border border-slate-200 ring-2 ring-[#075E59]/20'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Footprints className="w-4 h-4 text-[#075E59]" />
              <div className="text-left">
                <div className="font-bold">Lakat (Walking)</div>
                <div className="text-[10px] text-slate-500 tabular-nums">~{walkingMinutes} min ({roadMeters}m)</div>
              </div>
            </button>

            <button
              onClick={() => {
                setTravelMode('driving');
                setActiveStepIndex(0);
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                travelMode === 'driving'
                  ? 'bg-white text-[#075E59] shadow-sm border border-slate-200 ring-2 ring-[#075E59]/20'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Car className="w-4 h-4 text-[#075E59]" />
              <div className="text-left">
                <div className="font-bold">Tricycle / Sakay</div>
                <div className="text-[10px] text-slate-500 tabular-nums">~{drivingMinutes} min ride</div>
              </div>
            </button>
          </div>
        </div>

        {/* Interactive In-System Leaflet Map (Pure BalayKo Map - NO External Redirects!) */}
        <div className="relative w-full h-56 sm:h-64 bg-slate-100 border-b border-slate-200 shrink-0 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Quick Map Overlay Tags */}
          <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm text-[11px] font-bold text-[#173747] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#075E59]"></span>
            <span>BalayKo In-App Interactive Map</span>
          </div>

          <div className="absolute bottom-3 right-3 z-[400] bg-[#173747]/90 backdrop-blur-md text-[#F6B52E] px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm">
            {roadMeters < 1000 ? `${roadMeters} metros` : `${roadDistance} km`} kabug-os
          </div>
        </div>

        {/* Step-by-Step Directions Guidance */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            <span>Mga Tikang sa Ruta ({activeSteps.length})</span>
            <span className="text-[11px] text-[#075E59] lowercase font-semibold">i-click ang step para mag-zoom sa mapa</span>
          </div>

          {activeSteps.map((step, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleStepClick(idx, step)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                activeStepIndex === idx
                  ? 'bg-[#075E59]/5 border-[#075E59] shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                  activeStepIndex === idx
                    ? 'bg-[#075E59] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-[#173747] flex items-center justify-between">
                  <span>{step.title}</span>
                  <span className="text-[10px] text-slate-400 font-semibold tabular-nums">{step.distance}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.instruction}</p>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${activeStepIndex === idx ? 'text-[#075E59] translate-x-0.5' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>

        {/* Footer Actions (Direct In-System Navigation & Calling Host) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            {/* Primary Action: Focus directly on the main Explore map */}
            <button
              type="button"
              onClick={handleFocusMainMap}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Navigation className="w-4 h-4 text-[#F6B52E]" />
              <span>I-focus sa BalayKo Map</span>
            </button>

            {/* Direct Call Host Button */}
            <a
              href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
              className="py-3 px-4 rounded-2xl bg-[#F6B52E] hover:bg-[#e5a624] text-[#173747] text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98"
              title={`Tawagan si ${property.ownerName}`}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Tawagan si Host</span>
              <span className="sm:hidden">Tawag</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-200/60 text-xs font-semibold transition-colors"
          >
            Isara
          </button>
        </div>
      </div>
    </div>
  );
};
