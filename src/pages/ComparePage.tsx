import React from 'react';
import { Property, School } from '../types';
import { X, Check, Eye, Footprints, Scale, Compass, ArrowRight, Navigation, Phone } from 'lucide-react';

interface ComparePageProps {
  properties: Property[];
  compareIds: string[];
  activeSchool: School | null;
  onRemoveFromComparison: (propertyId: string) => void;
  onClearComparison: () => void;
  onViewDetails: (property: Property) => void;
  onGetDirections: (property: Property) => void;
  onExplore: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  properties,
  compareIds,
  activeSchool,
  onRemoveFromComparison,
  onClearComparison,
  onViewDetails,
  onGetDirections,
  onExplore,
}) => {
  const comparedProperties = properties.filter((p) => compareIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F6F8F7] py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#075E59] uppercase tracking-wider">
              <Scale className="w-4 h-4 text-[#075E59]" />
              <span>Pagtandi sang mga Boarding House</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173747] mt-1">
              Side-by-Side Comparison ({comparedProperties.length}/3)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Itandi ang presyo, kalayuon sa {activeSchool?.shortName || 'skwelahan'}, mga pasilidad, kag curfew.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {comparedProperties.length > 0 && (
              <button
                onClick={onClearComparison}
                className="py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onExplore}
              className="py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#F6B52E]" />
              <span>Mag-explore pa sang Map</span>
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        {comparedProperties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-[#075E59]/10 text-[#075E59] mx-auto flex items-center justify-center mb-4">
              <Scale className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#173747]">Wala pa sang napili nga i-compare</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Pinduta ang "+ Compare" button sa bisan diin nga boarding house card sa map para makumpara ang tubtob 3 ka balay-abangan.
            </p>
            <button
              onClick={onExplore}
              className="mt-6 py-2.5 px-6 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
            >
              <span>Buksan ang Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr>
                    <th className="p-3 text-slate-500 font-semibold w-40 min-w-[140px] bg-slate-50/80 rounded-l-xl">
                      Pasilidad / Detalye
                    </th>
                    {comparedProperties.map((prop) => (
                      <th key={prop.id} className="p-3 min-w-[220px] align-top bg-slate-50/80 last:rounded-r-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <img
                              src={prop.coverImage}
                              alt={prop.name}
                              className="w-full h-28 object-cover rounded-xl mb-2 border border-slate-200"
                            />
                            <div className="font-bold text-sm text-[#173747] line-clamp-1">{prop.name}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{prop.barangay}, {prop.municipality}</div>
                          </div>
                          <button
                            onClick={() => onRemoveFromComparison(prop.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onViewDetails(prop)}
                            className="py-1.5 px-2 bg-[#075E59] text-white text-xs font-semibold rounded-lg hover:bg-[#064C48] transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => onGetDirections(prop)}
                            className="py-1.5 px-2 bg-slate-100 text-[#075E59] text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Route</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Monthly Rent */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Plite kada Bulan (Rent)</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3 font-bold text-base text-[#075E59] tabular-nums">
                        ₱{prop.monthlyRent.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                      </td>
                    ))}
                  </tr>

                  {/* Distance & Walking Time */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Kalayuon sa Skwelahan</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3">
                        <div className="font-bold text-[#173747] tabular-nums">
                          {prop.distanceToSchoolKm} km gikan campus
                        </div>
                        <div className="text-slate-600 flex items-center gap-1 text-[11px] mt-0.5 font-medium">
                          <Footprints className="w-3.5 h-3.5 text-[#075E59]" />
                          <span>~{prop.walkingMinutes} min lakat</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Room Setup */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Klase sang Kwarto</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3 text-slate-700 font-medium">
                        <div>{prop.roomType}</div>
                        <div className="text-slate-500 text-[11px] font-normal">{prop.propertyType}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Gender Policy */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Patakaran sa Kasarian</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3 font-medium text-slate-700">
                        {prop.genderPolicy}
                      </td>
                    ))}
                  </tr>

                  {/* Utilities */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Tubig kag Kuryente</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3 text-slate-600 text-[11px] space-y-1">
                        <div><strong>Tubig:</strong> {prop.waterArrangement}</div>
                        <div><strong>Kuryente:</strong> {prop.electricArrangement}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Deposit */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Deposit / Advance</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3 tabular-nums font-medium text-slate-700">
                        {prop.depositFee ? `₱${prop.depositFee.toLocaleString()}` : 'Wala Deposit'}
                      </td>
                    ))}
                  </tr>

                  {/* Bathroom */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Banyo (CR)</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3 text-slate-700">
                        {prop.bathroomType}
                      </td>
                    ))}
                  </tr>

                  {/* Curfew */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Curfew Policy</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3 text-slate-700">
                        {prop.curfewTime || 'No Curfew'}
                      </td>
                    ))}
                  </tr>

                  {/* Landlord Contact */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Contact Number sang Host</td>
                    {comparedProperties.map((prop) => (
                      <td key={prop.id} className="p-3">
                        <a
                          href={`tel:${prop.ownerPhone.replace(/\s+/g, '')}`}
                          className="font-bold text-[#075E59] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{prop.ownerPhone}</span>
                        </a>
                        <div className="text-[11px] text-slate-500">{prop.ownerName}</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
