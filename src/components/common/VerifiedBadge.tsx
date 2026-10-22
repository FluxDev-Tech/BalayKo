import React from 'react';
import { ShieldCheck, AlertCircle, ShieldAlert, Check } from 'lucide-react';

export interface VerifiedBadgeProps {
  isVerified: boolean;
  variant?: 'badge' | 'pill' | 'compact' | 'detail';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showUnverified?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified,
  variant = 'badge',
  size = 'sm',
  showUnverified = true,
  className = '',
}) => {
  if (!isVerified && !showUnverified) return null;

  const sizeClasses = {
    xs: {
      container: 'text-[9px] px-1.5 py-0.5 gap-1 rounded-md font-bold',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      container: 'text-[11px] px-2 py-0.5 gap-1.5 rounded-lg font-bold shadow-xs',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      container: 'text-xs px-2.5 py-1 gap-1.5 rounded-xl font-bold shadow-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'text-sm px-3.5 py-1.5 gap-2 rounded-xl font-extrabold shadow-md',
      icon: 'w-5 h-5',
    },
  }[size];

  // 1. Detailed Hero Style (Used in Property Details Page header)
  if (variant === 'detail') {
    if (isVerified) {
      return (
        <div 
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-xs transition-colors ${className}`}
          title="Na-verify ng BalayKo ang lokasyon, may-ari, at pamantayan ng boarding house na ito."
        >
          <div className="w-5 h-5 rounded-full bg-[#075E59] text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <div>
            <div className="leading-none text-[11px] font-black uppercase tracking-wider text-[#075E59] dark:text-emerald-400">
              Verified Boarding House
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              Naberipika ang dokumento at lokasyon
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs shadow-xs transition-colors ${className}`}
        title="Hindi pa nabe-verify ng admin ang mga permit at eksaktong pasilidad ng paupahan na ito."
      >
        <div className="w-5 h-5 rounded-full bg-slate-400 dark:bg-slate-600 text-white flex items-center justify-center shrink-0">
          <AlertCircle className="w-3 h-3 stroke-[2.5]" />
        </div>
        <div>
          <div className="leading-none text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Unverified Listing
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Pending admin verification
          </div>
        </div>
      </div>
    );
  }

  // 2. Compact Style (for tight headers or list views)
  if (variant === 'compact') {
    if (isVerified) {
      return (
        <span
          className={`inline-flex items-center ${sizeClasses.container} bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 ${className}`}
          title="Verified Property"
        >
          <ShieldCheck className={`${sizeClasses.icon} text-emerald-600 dark:text-emerald-400 shrink-0`} />
          <span>Verified</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center ${sizeClasses.container} bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${className}`}
        title="Unverified Listing"
      >
        <AlertCircle className={`${sizeClasses.icon} text-slate-400 shrink-0`} />
        <span>Unverified</span>
      </span>
    );
  }

  // 3. Pill Style (subtle pill for filters & summaries)
  if (variant === 'pill') {
    if (isVerified) {
      return (
        <span
          className={`inline-flex items-center ${sizeClasses.container} bg-[#075E59]/10 dark:bg-emerald-950/50 text-[#075E59] dark:text-emerald-400 border border-[#075E59]/25 dark:border-emerald-500/30 ${className}`}
          title="Verified ng BalayKo"
        >
          <ShieldCheck className={`${sizeClasses.icon} text-[#075E59] dark:text-emerald-400 shrink-0`} />
          <span>Verified</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center ${sizeClasses.container} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
        title="Unverified Listing"
      >
        <ShieldAlert className={`${sizeClasses.icon} text-slate-400 shrink-0`} />
        <span>Unverified</span>
      </span>
    );
  }

  // 4. Default 'badge' Style (prominently overlaid on image covers of PropertyCard)
  if (isVerified) {
    return (
      <div
        className={`inline-flex items-center ${sizeClasses.container} bg-[#075E59]/95 text-white backdrop-blur-md border border-emerald-400/30 shadow-md ${className}`}
        title="✓ Naberipika ng BalayKo ang may-ari at lokasyon ng paupahang ito"
      >
        <ShieldCheck className={`${sizeClasses.icon} text-[#F6B52E] shrink-0`} />
        <span>Verified House</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${sizeClasses.container} bg-slate-900/80 text-slate-200 backdrop-blur-md border border-slate-700/60 shadow-md ${className}`}
      title="Unverified Listing: Mag-ingat at kumpirmahing mabuti bago magbayad ng deposito"
    >
      <AlertCircle className={`${sizeClasses.icon} text-amber-400 shrink-0`} />
      <span>Unverified</span>
    </div>
  );
};
