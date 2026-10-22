import React, { useState, useEffect } from 'react';
import { Property, User, PropertyReview } from '../../types';
import { StorageService } from '../../services/storageService';
import { StarRating } from '../common/StarRating';
import { 
  X, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Smile, 
  Tag, 
  CheckCircle2, 
  Building2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  currentUser: User | null;
  onRequireAuth: () => void;
  onReviewSubmitted?: (review: PropertyReview) => void;
  existingReview?: PropertyReview | null;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  property,
  currentUser,
  onRequireAuth,
  onReviewSubmitted,
  existingReview,
}) => {
  if (!isOpen) return null;

  // Form State
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(existingReview?.cleanlinessRating || 5);
  const [safetyRating, setSafetyRating] = useState<number>(existingReview?.safetyRating || 5);
  const [landlordRating, setLandlordRating] = useState<number>(existingReview?.landlordRating || 5);
  const [valueRating, setValueRating] = useState<number>(existingReview?.valueRating || 5);
  const [stayDuration, setStayDuration] = useState<string>(existingReview?.stayDuration || '1st Semester 2026');
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state if existing review updates
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setCleanlinessRating(existingReview.cleanlinessRating || 5);
      setSafetyRating(existingReview.safetyRating || 5);
      setLandlordRating(existingReview.landlordRating || 5);
      setValueRating(existingReview.valueRating || 5);
      setStayDuration(existingReview.stayDuration || '1st Semester 2026');
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  // If user is not logged in, prompt to login
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white dark:bg-[#14232d] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center mb-4">
            <Star className="w-7 h-7 fill-amber-400" />
          </div>
          <h2 className="text-lg font-black text-[#173747] dark:text-slate-100 mb-2">
            Mag-login upang Mag-iwan ng Review
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Ang mga verified student lamang ang pwedeng mag-rate at mag-review ng mga boarding house sa BalayKo upang mapanatiling totoo at mapagkakatiwalaan ang mga ratings.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Kanselahin
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#075E59] text-white text-xs font-bold hover:bg-[#064C48] shadow-md"
            >
              Mag-login / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is owner or admin
  if (currentUser.role !== 'student') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white dark:bg-[#14232d] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-[#173747] dark:text-slate-100 mb-2">
            Student Reviews Only
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Ang pag-iwan ng review ay nakalaan para sa mga verified student boarders upang mapanatili ang patas at mapagkakatiwalaang feedback para sa lahat.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Naiintindihan ko
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!rating || rating < 1) {
      setErrorMessage('Pumili ng 1 hanggang 5 bituin para sa iyong kabuuang karanasan.');
      return;
    }

    if (comment.trim().length < 8) {
      setErrorMessage('Maglagay ng mas detalyadong pagsusuri (kahit 8 letra man lang) upang makatulong sa kapwa estudyante.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = StorageService.submitReview({
        propertyId: property.id,
        propertyName: property.name,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentSchool: currentUser.preferredSchoolId,
        rating,
        cleanlinessRating,
        safetyRating,
        landlordRating,
        valueRating,
        stayDuration,
        comment: comment.trim(),
      });

      setIsSubmitting(false);

      if (res.success && res.review) {
        setIsSuccess(true);
        if (onReviewSubmitted) {
          onReviewSubmitted(res.review);
        }
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1800);
      } else {
        setErrorMessage(res.error || 'Nagkaroon ng problema sa pag-save ng review.');
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'May error na naganap.');
    }
  };

  const quickPhrases = [
    'Mabait at maunawain ang landlord.',
    'Mabilis at stable ang WiFi connection.',
    'Malinis ang banyo at kusina.',
    'Tahimik mag-aral kapag gabi.',
    'Malapit lang lakarin papuntang gate ng campus.',
    'Maliwanag ang kalsada at ligtas uwian.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-[#14232d] rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#173747] dark:text-slate-100">
                {existingReview ? 'I-update ang Iyong Review' : 'Mag-iwan ng Review & Star Rating'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {property.name} · {property.barangay}, {property.municipality}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-[#173747] dark:text-slate-100">
              Salamat sa Iyong Review!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Matagumpay na naitala ang iyong {rating}-star rating para sa {property.name}. Malaking tulong ito sa mga kapwa estudyante sa Capiz!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Main Overall Star Rating */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-center space-y-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block">
                Kabuuang Rating (Overall Rating)
              </span>
              <div className="flex justify-center">
                <StarRating
                  rating={rating}
                  size="xl"
                  interactive={true}
                  onChange={(val) => setRating(val)}
                />
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/80">
                I-click ang bituin mula 1 hanggang 5 ayon sa naging karanasan mo sa tirahan na ito.
              </p>
            </div>

            {/* 2. Specific Sub-Categories Ratings */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Detalyadong Marka sa mga Aspekto:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Cleanliness */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Kalinisan</span>
                      <span className="text-[10px] text-slate-400">Banyo, kwarto, kusina</span>
                    </div>
                  </div>
                  <StarRating
                    rating={cleanlinessRating}
                    size="sm"
                    interactive={true}
                    onChange={(val) => setCleanlinessRating(val)}
                  />
                </div>

                {/* Safety */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Kaligtasan</span>
                      <span className="text-[10px] text-slate-400">Gate lock, ilaw, CCTV</span>
                    </div>
                  </div>
                  <StarRating
                    rating={safetyRating}
                    size="sm"
                    interactive={true}
                    onChange={(val) => setSafetyRating(val)}
                  />
                </div>

                {/* Landlord friendliness */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">May-ari (Host)</span>
                      <span className="text-[10px] text-slate-400">Pakikitungo & tulong</span>
                    </div>
                  </div>
                  <StarRating
                    rating={landlordRating}
                    size="sm"
                    interactive={true}
                    onChange={(val) => setLandlordRating(val)}
                  />
                </div>

                {/* Value for money */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Halaga ng Upa</span>
                      <span className="text-[10px] text-slate-400">Sulit ba ang monthly rent?</span>
                    </div>
                  </div>
                  <StarRating
                    rating={valueRating}
                    size="sm"
                    interactive={true}
                    onChange={(val) => setValueRating(val)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Duration of Stay */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                <span>Kailan ka tumira dito? (Tagal ng Pananatili)</span>
              </label>
              <select
                value={stayDuration}
                onChange={(e) => setStayDuration(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
              >
                <option value="Kasalukuyang Nakatira">Kasalukuyang Nakatira (Current Boarder)</option>
                <option value="1st Semester (2026-2027)">1st Semester (2026-2027)</option>
                <option value="2nd Semester (2025-2026)">2nd Semester (2025-2026)</option>
                <option value="1 Taon o higit pa">1 Taon o higit pa</option>
                <option value="Midyear / Summer Class">Midyear / Summer Class</option>
                <option value="Dating Nangupahan (Past Boarder)">Dating Nangupahan (Past Boarder)</option>
              </select>
            </div>

            {/* 4. Written Review Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Iyong Komento at Pagsusuri</span>
                <span className="text-[10px] text-slate-400 font-normal">Kahit 8 letra pataas</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ibahagi ang iyong tapat na karanasan: Kumusta ang tubig at kuryente? Tahimik ba mag-aral? Madali ba makipag-usap sa landlord?"
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59] placeholder:text-slate-400"
              />

              {/* Quick Suggestion Pills */}
              <div className="mt-2">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Mabilisang Pindot:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPhrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setComment((prev) => (prev ? `${prev} ${phrase}` : phrase));
                      }}
                      className="text-[10px] py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      + {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified Student Notice */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Ipa-publish ang review bilang <strong>{currentUser.name}</strong> (Verified Student).
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Kanselahin
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>{isSubmitting ? 'Isinusumite...' : existingReview ? 'I-save ang Pagbabago' : 'I-post ang Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
