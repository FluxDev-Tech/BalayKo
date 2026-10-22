import React, { useState } from 'react';
import { Property, User, ReservationRequest } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Building2, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface BookingInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  currentUser: User | null;
  onRequireAuth?: () => void;
  onSuccess?: (reservation: ReservationRequest) => void;
}

export const BookingInquiryModal: React.FC<BookingInquiryModalProps> = ({
  isOpen,
  onClose,
  property,
  currentUser,
  onRequireAuth,
  onSuccess,
}) => {
  if (!isOpen || !property) return null;

  // Form State
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');
  const [studentPhone, setStudentPhone] = useState(currentUser?.phone || '');
  
  // Default target date (30 days from today)
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [targetMoveInDate, setTargetMoveInDate] = useState(defaultDate);
  const [targetSemester, setTargetSemester] = useState('1st Semester (2026-2027)');
  const [stayDuration, setStayDuration] = useState('1 Semester (5 Months)');
  const [preferredRoomType, setPreferredRoomType] = useState<string>(property.roomType || 'Single Room');
  const [occupantsCount, setOccupantsCount] = useState(1);
  const [notes, setNotes] = useState('Magandang araw po! Nais ko pong magpareserba ng slot para sa darating na semester.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<ReservationRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const semesterOptions = [
    '1st Semester (2026-2027)',
    '2nd Semester (2026-2027)',
    'Midyear / Summer Class',
    'Immediate Move-in (Within 2 Weeks)',
  ];

  const durationOptions = [
    '1 Semester (5 Months)',
    '1 Full Academic Year (10 Months)',
    'Monthly Rolling / Transient',
    'Custom Term',
  ];

  const quickMessages = [
    'Magandang araw po! Nais ko pong magpareserba ng slot para sa darating na semester.',
    'Pwede po ba mag-schedule ng actual viewing sa darating na Sabado o Linggo?',
    'Kasama na po ba ang Wi-Fi at tubig sa monthly rent na ₱' + property.monthlyRent.toLocaleString() + '?',
    'Solo po ako na mag-aaral sa CAPSU, may sariling CR po ba ang available unit?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentName.trim()) {
      setErrorMessage('Pakilagay ang iyong kumpletong pangalan.');
      return;
    }

    if (!studentPhone.trim() && !studentEmail.trim()) {
      setErrorMessage('Pakilagay ang iyong numero ng cellphone o email para ma-contact ka ng may-ari.');
      return;
    }

    setIsSubmitting(true);

    try {
      const studentId = currentUser?.id || `guest-student-${Date.now()}`;
      const res = StorageService.createReservation({
        propertyId: property.id,
        propertyName: property.name,
        propertyAddress: `${property.streetAddress}, ${property.barangay}, ${property.municipality}`,
        ownerId: property.ownerId,
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone,
        studentId,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || 'student@capiz.edu.ph',
        studentPhone: studentPhone.trim() || property.ownerPhone,
        targetMoveInDate,
        targetSemester,
        stayDuration,
        preferredRoomType,
        occupantsCount,
        notes: notes.trim(),
      });

      setCreatedReservation(res);
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(res);
      }
    } catch {
      setErrorMessage('Nagkaroon ng problema sa pagpasa. Pakisubukang muli.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setCreatedReservation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#14232d] w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-[#101b22]/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#075E59]/10 dark:bg-emerald-950/40 text-[#075E59] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#075E59]/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#075E59] dark:text-emerald-400 uppercase tracking-wide">
                <span>Magpareserba / Booking Inquiry</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#173747] dark:text-slate-100 line-clamp-1">
                {property.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#075E59]" />
                <span className="line-clamp-1">{property.barangay}, {property.municipality}, Capiz</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors shrink-0"
            aria-label="Isara"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {isSubmitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#173747] dark:text-slate-100">
                  Naipasa ang Iyong Reservation Request!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                  Naitala na ang iyong kahilingan para sa <strong>{property.name}</strong>. Matatanggap ito ng may-ari (<strong className="text-[#075E59] dark:text-emerald-400">{property.ownerName}</strong>) sa kanyang dashboard.
                </p>
              </div>

              {/* Reservation summary box */}
              {createdReservation && (
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Target Move-in:</span>
                    <strong className="text-[#173747] dark:text-slate-200">{createdReservation.targetMoveInDate}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Semester:</span>
                    <strong className="text-[#173747] dark:text-slate-200">{createdReservation.targetSemester}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Buwanang Upa:</span>
                    <strong className="text-[#075E59] dark:text-emerald-400">₱{property.monthlyRent.toLocaleString()} / buwan</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Status:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                      Pending Owner Approval
                    </span>
                  </div>
                </div>
              )}

              {/* Instant Call / SMS Quick Options */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Gusto mo ba ng agarang tugon mula sa may-ari?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <a
                    href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                    className="py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#F6B52E]" />
                    <span>Tawagan si {property.ownerName}</span>
                  </a>

                  <a
                    href={`sms:${property.ownerPhone.replace(/\s+/g, '')}?body=Kumusta po! Nag-submit ako ng reservation request sa ${encodeURIComponent(property.name)} via BalayKo.`}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Mag-text sa SMS</span>
                  </a>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-2 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  I-close ang Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property Snapshot Banner */}
              <div className="p-3 bg-[#075E59]/5 dark:bg-[#075E59]/15 rounded-2xl border border-[#075E59]/15 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Buwanang Upa</div>
                  <div className="text-lg font-black text-[#075E59] dark:text-emerald-400 tabular-nums">
                    ₱{property.monthlyRent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ buwan</span>
                  </div>
                </div>
                {property.depositFee ? (
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Security Deposit</div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      ₱{property.depositFee.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      No Deposit Promo
                    </span>
                  </div>
                )}
              </div>

              {/* SECTION 1: DATES & SEMESTER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Target Move-in Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={targetMoveInDate}
                    onChange={(e) => setTargetMoveInDate(e.target.value)}
                    className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Panahon / Semester</span>
                  </label>
                  <select
                    value={targetSemester}
                    onChange={(e) => setTargetSemester(e.target.value)}
                    className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  >
                    {semesterOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 2: ROOM PREFERENCE & OCCUPANTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Uri ng Kwarto</span>
                  </label>
                  <select
                    value={preferredRoomType}
                    onChange={(e) => setPreferredRoomType(e.target.value)}
                    className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  >
                    <option value="Single Room">Solo / Single Room</option>
                    <option value="Shared Room (2-3)">Shared Room (2-3 Tao)</option>
                    <option value="Bedspace (4+)">Bedspace</option>
                    <option value="Studio Unit">Studio Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Bilang ng Titira (Occupants)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setOccupantsCount(num)}
                        className={`flex-1 h-11 rounded-xl text-xs font-bold border transition-all ${
                          occupantsCount === num
                            ? 'bg-[#075E59] text-white border-[#075E59] shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {num} {num === 1 ? 'Solo' : 'Tao'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: STUDENT CONTACT INFO */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Impormasyon ng Estudyante</span>
                  {currentUser ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Naka-login bilang {currentUser.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Mag-fill up o mag-login
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Buong Pangalan *"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Cellphone No. (e.g. 0912 345 6789) *"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: QUICK INQUIRY MESSAGE & NOTES */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#075E59] dark:text-emerald-400" />
                    <span>Mensahe o Katanungan sa May-ari</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">Pumili ng template sa ibaba</span>
                </label>

                {/* Quick message chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {quickMessages.map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNotes(msg)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-left transition-colors truncate max-w-full"
                    >
                      "{msg.slice(0, 42)}..."
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Isulat ang iyong mensahe o mga katanungan sa may-ari..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4 text-[#F6B52E]" />
                  <span>{isSubmitting ? 'Ipinapasa...' : 'Ipasa ang Reservation Request sa Owner'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Walang agarang bayad. Makikipag-ugnayan ang may-ari (<span className="font-semibold">{property.ownerName}</span>) para kumpirmahin ang slot.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
