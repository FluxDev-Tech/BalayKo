import React from 'react';
import { 
  Heart, 
  Scale, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  Building2, 
  Sun, 
  Moon,
  Search,
  X
} from 'lucide-react';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onOpenSaved: () => void;
  onOpenCompare: () => void;
  savedCount: number;
  compareCount: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onLogout: () => void;
  currentTab: string;
  onNavigateExplore: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  onOpenSaved,
  onOpenCompare,
  savedCount,
  compareCount,
  currentUser,
  onOpenAuth,
  onOpenDashboard,
  onLogout,
  currentTab,
  onNavigateExplore,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#13222d]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Left: Brand Logo & Title */}
        <button
          type="button"
          onClick={onNavigateExplore}
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-left focus:outline-none group cursor-pointer"
          title="BalayKo - Capiz Student Boarding Finder"
        >
          <div className="w-28 h-10 sm:w-32 sm:h-12 rounded-xl bg-[#075E59] flex items-center justify-center shadow-xs border border-[#087F78] group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/assets/images/BalayKo.png"
              alt="BalayKo - Ang Imo Sunod nga Balay"
              className="w-full h-full object-cover"
            />
          </div>
        </button>

        {/* Center: Search Bar in Navbar (Top-Level Search) */}
        {onSearchChange && (
          <div className="flex-1 min-w-0 max-w-md mx-1 sm:mx-4">
            <div className="relative">
              <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search houses, WiFi, street..."
                className="w-full h-8 sm:h-9 pl-7 sm:pl-9 pr-7 sm:pr-8 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#173747] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#075E59] focus:bg-white dark:focus:bg-slate-850 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  title="I-clear ang search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right: Actions Toolbar & User Auth Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center active:scale-95 shadow-2xs cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Lumipat sa Light Mode' : 'Lumipat sa Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Saved Houses Button (shown if > 0) */}
          {savedCount > 0 && (
            <button
              type="button"
              onClick={onOpenSaved}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Saved Boarding Houses"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span className="hidden md:inline">Saved</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                ({savedCount})
              </span>
            </button>
          )}

          {/* Compare Button (shown if > 0) */}
          {compareCount > 0 && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="hidden sm:flex py-1.5 px-2.5 rounded-xl border border-[#075E59]/40 dark:border-emerald-500/40 bg-[#075E59]/5 dark:bg-emerald-950/30 text-[#075E59] dark:text-emerald-300 text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Compare Boarding Houses"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Compare</span>
              <span className="text-[11px] font-bold tabular-nums">({compareCount}/3)</span>
            </button>
          )}

          {/* User Account / Login / Register Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onOpenDashboard}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-[#173747] dark:bg-slate-800 text-white'
                    : currentUser.role === 'admin'
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : currentUser.role === 'owner'
                    ? 'bg-[#075E59] text-white hover:bg-[#064C48]'
                    : 'bg-[#075E59]/10 dark:bg-emerald-950/50 text-[#075E59] dark:text-emerald-300 hover:bg-[#075E59]/20'
                }`}
                title={`Buksan ang ${currentUser.role.toUpperCase()} Dashboard`}
              >
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                ) : currentUser.role === 'owner' ? (
                  <Building2 className="w-3.5 h-3.5 text-[#F6B52E]" />
                ) : (
                  <LayoutDashboard className="w-3.5 h-3.5" />
                )}
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {currentUser.role === 'admin'
                    ? 'Admin'
                    : currentUser.role === 'owner'
                    ? 'Owner'
                    : 'Student'}
                </span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center cursor-pointer"
                title="Mag-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Login / Register</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
