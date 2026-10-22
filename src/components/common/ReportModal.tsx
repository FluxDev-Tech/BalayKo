import React, { useState } from 'react';
import { Property } from '../../types';
import { StorageService } from '../../services/storageService';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, property }) => {
  const [reason, setReason] = useState('Inaccurate Price or Terms');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.submitReport({
      propertyId: property.id,
      propertyName: property.name,
      reporterId: 'student-visitor',
      reporterName: 'Student Visitor',
      reason,
      details: details.trim() || 'Reported for review by student.',
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 bg-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F6B52E]" />
            <h3 className="font-bold text-sm">Report Inaccurate Listing</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-[#173747]">Report Submitted for Moderation</h4>
            <p className="text-xs text-slate-500 mt-1">
              Thank you for keeping BalayKo safe. Our administration team will review this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Listing Name:</span>
              <strong className="text-slate-800 text-sm block">{property.name}</strong>
              <span className="text-[11px] text-slate-400">{property.barangay}, {property.municipality}</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Issue</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              >
                <option value="Inaccurate Price or Terms">Inaccurate Price or Hidden Fees</option>
                <option value="Wrong Map Location">Incorrect Location / Coordinates</option>
                <option value="Suspicious Property / Owner">Suspicious or Unresponsive Host</option>
                <option value="Policies Not Followed">House Rules / Policy Discrepancy</option>
                <option value="Other Issue">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Detailed Explanation</label>
              <textarea
                rows={3}
                required
                placeholder="Explain what was inaccurate or misrepresented..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
