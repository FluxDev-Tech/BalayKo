/**
 * Verified Geographic Reference for Capiz, Philippines
 * 1 City (Roxas City) and 16 Municipalities
 */

export interface CapizMunicipality {
  name: string;
  type: 'City' | 'Municipality';
  postalCode: string;
  lat: number;
  lng: number;
  barangays: string[];
}

export const CAPIZ_BOUNDING_BOX = {
  minLat: 11.10,
  maxLat: 11.75,
  minLng: 122.30,
  maxLng: 123.15,
};

export const CAPIZ_MUNICIPALITIES: CapizMunicipality[] = [
  {
    name: 'Pilar',
    type: 'Municipality',
    postalCode: '5804',
    lat: 11.4840,
    lng: 123.0051,
    barangays: ['Natividad (Poblacion)', 'Dulangan', 'San Ramon', 'San Fernando', 'Blasco', 'Casanayan', 'Monteflor', 'Olalo', 'Yating', 'Binaobawan']
  },
  {
    name: 'Roxas City',
    type: 'City',
    postalCode: '5800',
    lat: 11.5853,
    lng: 122.7511,
    barangays: ['Tanque', 'Dayao', 'Bañica', 'Baybay', 'Tiza', 'Inzo Arnaldo', 'Punta Tabuc', 'Culasi', 'Lawa-an', 'Dinginan', 'Sibaguan']
  },
  {
    name: 'Pontevedra',
    type: 'Municipality',
    postalCode: '5802',
    lat: 11.4828,
    lng: 122.8422,
    barangays: ['Bailan', 'Poblacion', 'Binuntucan', 'Rizal', 'Lantangan', 'Sublangon', 'Malocloc Norte', 'Malocloc Sur']
  },
  {
    name: 'Panay',
    type: 'Municipality',
    postalCode: '5801',
    lat: 11.5583,
    lng: 122.7933,
    barangays: ['Poblacion', 'Bago Chiquito', 'Bago Grande', 'Bahit', 'Candual', 'Linambasan', 'Navitas']
  },
  {
    name: 'President Roxas',
    type: 'Municipality',
    postalCode: '5803',
    lat: 11.4422,
    lng: 122.9286,
    barangays: ['Poblacion', 'Bayuyan', 'Cabugao', 'Carmencita', 'Marita', 'Pantalan', 'Pinamihagan']
  },
  {
    name: 'Mambusao',
    type: 'Municipality',
    postalCode: '5807',
    lat: 11.4320,
    lng: 122.6025,
    barangays: ['Burias', 'Poblacion Proper', 'Atiplo', 'Balat-an', 'Bungsuan', 'Cala-agus', 'Najus-an']
  },
  {
    name: 'Sigma',
    type: 'Municipality',
    postalCode: '5816',
    lat: 11.4300,
    lng: 122.6710,
    barangays: ['Poblacion Norte', 'Poblacion Sur', 'Acuna', 'Amaga', 'Cogon', 'Mangoso', 'Oyonsing']
  },
  {
    name: 'Dao',
    type: 'Municipality',
    postalCode: '5810',
    lat: 11.3931,
    lng: 122.6844,
    barangays: ['Poblacion Ilawod', 'Poblacion Ilaya', 'Aganan', 'Balucuan', 'Dap-dap', 'Malonoy', 'Nasunogan']
  },
  {
    name: 'Dumarao',
    type: 'Municipality',
    postalCode: '5812',
    lat: 11.2640,
    lng: 122.6970,
    barangays: ['Poblacion', 'Agcalaga', 'Agcaning', 'Astorga', 'Calapawan', 'Jumagit', 'Salcedo']
  },
  {
    name: 'Dumalag',
    type: 'Municipality',
    postalCode: '5813',
    lat: 11.3000,
    lng: 122.6167,
    barangays: ['Poblacion', 'Concepcion', 'Dolores', 'San Agustin', 'San Jose', 'San Martin', 'San Roque']
  },
  {
    name: 'Tapaz',
    type: 'Municipality',
    postalCode: '5814',
    lat: 11.2612,
    lng: 122.5312,
    barangays: ['Poblacion', 'Acuna', 'Artuz', 'Bagacay', 'Camburanan', 'Daan Banwa', 'San Nicolas']
  },
  {
    name: 'Jamindan',
    type: 'Municipality',
    postalCode: '5808',
    lat: 11.3853,
    lng: 122.4844,
    barangays: ['Poblacion', 'Agambulong', 'Agwalo', 'Camp General Macario Peralta', 'Esperanza', 'Jaena Norte']
  },
  {
    name: 'Sapian',
    type: 'Municipality',
    postalCode: '5806',
    lat: 11.4989,
    lng: 122.6042,
    barangays: ['Poblacion', 'Agsilid', 'Bilao', 'Damayan', 'Dapdapan', 'Lonoy', 'Majanlud']
  },
  {
    name: 'Ivisan',
    type: 'Municipality',
    postalCode: '5805',
    lat: 11.5244,
    lng: 122.6922,
    barangays: ['Poblacion Norte', 'Poblacion Sur', 'Agmalobo', 'Balaring', 'Basiao', 'Cudian', 'Mianay']
  },
  {
    name: 'Panitan',
    type: 'Municipality',
    postalCode: '5815',
    lat: 11.4589,
    lng: 122.7564,
    barangays: ['Poblacion', 'Agbalogo', 'Agkilo', 'Ameligan', 'Bailan', 'Cabugao', 'Tabun-ac']
  },
  {
    name: 'Ma-Ayon',
    type: 'Municipality',
    postalCode: '5809',
    lat: 11.3831,
    lng: 122.7831,
    barangays: ['Poblacion', 'Agbalogo', 'Batiano', 'Cabugao', 'Canapian', 'Indayagan', 'Tuburan']
  },
  {
    name: 'Cuartero',
    type: 'Municipality',
    postalCode: '5811',
    lat: 11.3417,
    lng: 122.6736,
    barangays: ['Poblacion Ilawod', 'Poblacion Ilaya', 'Agcabugao', 'Bito-on Ilawod', 'Carataya', 'Maindang']
  }
];

/**
 * Geographic validation: Returns true only if coordinates are inside Capiz boundaries.
 */
export function isCoordinateWithinCapiz(lat: number, lng: number): boolean {
  return (
    lat >= CAPIZ_BOUNDING_BOX.minLat &&
    lat <= CAPIZ_BOUNDING_BOX.maxLat &&
    lng >= CAPIZ_BOUNDING_BOX.minLng &&
    lng <= CAPIZ_BOUNDING_BOX.maxLng
  );
}

/**
 * Returns distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Formats distance in readable meters or kilometers
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates walking and driving minutes based on Capiz road factors
 */
export function estimateTravelTime(distanceKm: number) {
  // Walking avg speed ~ 4.5 km/h with residential street detour factor 1.25
  const walkingMin = Math.max(1, Math.round((distanceKm * 1.25 / 4.5) * 60));
  // Driving/Tricycle avg speed ~ 25 km/h with town traffic detour factor 1.3
  const drivingMin = Math.max(1, Math.round((distanceKm * 1.3 / 25) * 60));
  return {
    walkingMin,
    drivingMin
  };
}
