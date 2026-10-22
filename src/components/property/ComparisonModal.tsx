import React from 'react';
import { Property, School } from '../../types';
import { X, Check, Trash2, ShieldCheck, Eye, Footprints, ExternalLink } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  activeSchool: School | null;
  onRemoveFromComparison: (propertyId: string) => void;
  onClearComparison: () => void;
  onViewDetails: (property: Property) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  properties,
  activeSchool,
  onRemoveFromComparison,
  onClearComparison,
  onViewDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-[#075E59] text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Compare Boarding Houses ({properties.length}/3)</h2>
            <p className="text-xs text-slate-200 mt-0.5">
              Side-by-side comparison near {activeSchool ? activeSchool.shortName : 'Capiz Campuses'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {properties.length > 0 && (
              <button
                onClick={onClearComparison}
                className="text-xs text-rose-200 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        {properties.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500">No properties selected for comparison yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click the "+ Compare" button on any boarding house card in the Explore or Home page to compare up to 3 options side-by-side!
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto p-4 sm:p-6">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr>
                  <th className="p-3 text-slate-500 font-semibold w-40 min-w-[140px] bg-slate-50/80 rounded-l-xl">
                    Feature
                  </th>
                  {properties.map((prop) => (
                    <th key={prop.id} className="p-3 min-w-[200px] align-top bg-slate-50/80 last:rounded-r-xl">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <img
                            src={prop.coverImage}
                            alt={prop.name}
                            className="w-full h-24 object-cover rounded-xl mb-2 border border-slate-200"
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
                      <button
                        onClick={() => {
                          onClose();
                          onViewDetails(prop);
                        }}
                        className="mt-2 w-full py-1.5 px-2 bg-[#075E59] text-white text-xs font-semibold rounded-lg hover:bg-[#064C48] transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Monthly Rent */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Monthly Rent</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 font-bold text-base text-[#075E59] tabular-nums">
                      ₱{prop.monthlyRent.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                    </td>
                  ))}
                </tr>

                {/* Distance & Walking Time */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Distance to Campus</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3">
                      <div className="font-bold text-[#173747] tabular-nums">
                        {prop.distanceToSchoolKm} km
                      </div>
                      <div className="text-slate-500 flex items-center gap-1 text-[11px] mt-0.5">
                        <Footprints className="w-3.5 h-3.5 text-[#075E59]" />
                        <span>~{prop.walkingMinutes} min walk</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Property & Room Type */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Accommodation Type</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 text-slate-700">
                      <div className="font-medium">{prop.propertyType}</div>
                      <div className="text-slate-500 text-[11px]">{prop.roomType}</div>
                    </td>
                  ))}
                </tr>

                {/* Gender Policy */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Gender Policy</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 font-medium text-slate-700">
                      {prop.genderPolicy}
                    </td>
                  ))}
                </tr>

                {/* Utilities Arrangement */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Water & Electricity</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 text-slate-600 text-[11px] space-y-1">
                      <div><strong className="text-slate-700">Water:</strong> {prop.waterArrangement}</div>
                      <div><strong className="text-slate-700">Power:</strong> {prop.electricArrangement}</div>
                    </td>
                  ))}
                </tr>

                {/* Deposit */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Deposit Required</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 tabular-nums font-medium text-slate-700">
                      {prop.depositFee ? `₱${prop.depositFee.toLocaleString()}` : 'None'}
                    </td>
                  ))}
                </tr>

                {/* Bathroom Type */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Bathroom</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 text-slate-700">
                      {prop.bathroomType}
                    </td>
                  ))}
                </tr>

                {/* Curfew */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Curfew Policy</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 text-slate-700">
                      {prop.curfewTime || 'No Curfew'}
                    </td>
                  ))}
                </tr>

                {/* Key Amenities */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Key Amenities</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3 text-[11px] text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {prop.amenities.map(a => (
                          <span key={a} className="inline-flex items-center gap-1 text-slate-700 mr-2 mb-1">
                            <Check className="w-3 h-3 text-[#075E59]" />
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Owner Verification */}
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/40">Owner Verification</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="p-3">
                      {prop.isOwnerVerified ? (
                        <span className="text-[#075E59] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-[#F6B52E]" />
                          <span>Verified Owner</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
