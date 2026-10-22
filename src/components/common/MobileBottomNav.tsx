import React from 'react';
import { 
  Compass, 
  School as SchoolIcon, 
  Heart, 
  Scale,
  LayoutDashboard, 
  User as UserIcon 
} from 'lucide-react';
import { User } from '../../types';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  savedCount: number;
  compareCount: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenCampusSelector?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  savedCount,
  compareCount,
  currentUser,
  onOpenAuth,
  onOpenCampusSelector,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#13222d]/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-colors">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        
        {/* 1. Map Finder (Default Core View) */}
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'explore' 
              ? 'text-[#075E59] dark:text-emerald-400 font-black' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
          aria-label="Map Finder"
        >
          <Compass className={`w-5 h-5 ${currentTab === 'explore' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold tracking-tight mt-1">Map Finder</span>
        </button>

        {/* 2. Choose Campus Trigger (Best UI/UX modal) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenCampusSelector) {
              onOpenCampusSelector();
            } else {
              onNavigate('explore');
            }
          }}
          className="min-h-[44px] flex flex-col items-center justify-center transition-colors text-slate-500 dark:text-slate-400 hover:text-[#075E59] dark:hover:text-emerald-400"
          aria-label="Pumili ng Campus"
        >
          <div className="relative">
            <SchoolIcon className="w-5 h-5 stroke-2" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-1">Campuses</span>
        </button>

        {/* 3. Saved Favorites */}
        <button
          type="button"
          onClick={() => onNavigate('favorites')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            currentTab === 'favorites' 
              ? 'text-[#075E59] dark:text-emerald-400 font-black' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
          aria-label="Saved Houses"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${currentTab === 'favorites' ? 'fill-[#075E59] dark:fill-emerald-400 stroke-[2.5]' : 'stroke-2'}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-1">Saved</span>
        </button>

        {/* 4. Compare Houses */}
        <button
          type="button"
          onClick={() => onNavigate('compare')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            currentTab === 'compare' 
              ? 'text-[#075E59] dark:text-emerald-400 font-black' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
          aria-label="Compare"
        >
          <div className="relative">
            <Scale className={`w-5 h-5 ${currentTab === 'compare' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {compareCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#075E59] dark:bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                {compareCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-1">Compare</span>
        </button>

        {/* 5. Dashboard or Login */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              currentTab === 'dashboard' 
                ? 'text-[#075E59] dark:text-emerald-400 font-black' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
            aria-label="Dashboard"
          >
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold tracking-tight mt-1 truncate max-w-[58px]">
              {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'owner' ? 'Owner' : 'Student'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="min-h-[44px] flex flex-col items-center justify-center transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800"
            aria-label="Login"
          >
            <UserIcon className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Login</span>
          </button>
        )}
      </div>
    </nav>
  );
};
