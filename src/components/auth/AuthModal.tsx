import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  School as SchoolIcon, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { School, User } from '../../types';
import { StorageService } from '../../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'student' | 'owner';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  schools,
  onAuthSuccess,
  initialMode = 'login',
  initialRole = 'student',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'student' | 'owner'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPreferredSchoolId, setRegPreferredSchoolId] = useState(schools[0]?.id || 'capsu-pilar');
  const [regBusinessName, setRegBusinessName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const res = StorageService.login(loginEmail.trim(), loginPassword);
    if (res.success && res.user) {
      setSuccessMsg(`Maligayang pagbabalik, ${res.user.name}!`);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 400);
    } else {
      setError(res.error || 'Maling email o password. Pakisuri muli.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setError('Pakilagay ang iyong buong pangalan.');
      return;
    }

    if (!regEmail.trim()) {
      setError('Pakilagay ang iyong email address.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Ang password ay dapat hindi bababa sa 6 characters.');
      return;
    }

    const res = StorageService.registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: role,
      phone: regPhone.trim() || undefined,
      preferredSchoolId: role === 'student' ? regPreferredSchoolId : undefined,
      businessName: role === 'owner' ? regBusinessName.trim() : undefined,
    });

    if (res.success && res.user) {
      setSuccessMsg(`Matagumpay na nagawa ang iyong account! Maligayang pagdating, ${res.user.name}.`);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 450);
    } else {
      setError(res.error || 'Hindi natuloy ang registration. Subukan muli.');
    }
  };

  // Quick Demo Auto-fills for fast testing
  const handleQuickLoginStudent = () => {
    setMode('login');
    setLoginEmail('hannah.bernales@student.capsu.edu.ph');
    setLoginPassword('student123');
    setError(null);
  };

  const handleQuickLoginOwner = () => {
    setMode('login');
    setLoginEmail('elena.celino@pilar-villa.ph');
    setLoginPassword('owner123');
    setError(null);
  };

  const handleQuickLoginAdmin = () => {
    setMode('login');
    setLoginEmail('admin@board.com');
    setLoginPassword('admin123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#14232d] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        
        {/* Header Banner */}
        <div className="bg-[#075E59] text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#F6B52E] flex items-center justify-center border border-white/20 shadow-xs">
                {role === 'owner' ? (
                  <Building2 className="w-5 h-5 text-[#F6B52E]" />
                ) : (
                  <UserIcon className="w-5 h-5 text-[#F6B52E]" />
                )}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  {mode === 'login' ? 'Mag-Login sa BalayKo' : 'Gumawa ng Bagong Account'}
                </h2>
                <p className="text-[11px] text-emerald-100/90 mt-0.5">
                  {mode === 'login'
                    ? 'Mag-sign in para sa reviews, reservations, at dashboard'
                    : 'Pumili kung ikaw ay Estudyante o Boarding House Owner'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Isara"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Register) */}
          <div className="mt-4 p-1 rounded-2xl bg-black/20 grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#075E59] shadow-xs font-black'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#075E59] shadow-xs font-black'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Register (Bago)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Selector (visible in Register mode) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Pumili ng Uri ng Account:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    role === 'student'
                      ? 'border-[#075E59] bg-[#075E59]/10 text-[#075E59] dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <SchoolIcon className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold leading-none">Estudyante</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Maghahanap ng BH</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    role === 'owner'
                      ? 'border-[#075E59] bg-[#075E59]/10 text-[#075E59] dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#075E59] dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold leading-none">BH Owner</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Mag-lilista ng BH</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@email.com o owner@email.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E59] focus:bg-white dark:focus:bg-slate-850 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ilagay ang password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E59] focus:bg-white dark:focus:bg-slate-850 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>Mag-Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Fast 1-Click Demo Accounts */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Mabilisang Demo Logins:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={handleQuickLoginStudent}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#075E59]/10 text-slate-700 dark:text-slate-300 hover:text-[#075E59] dark:hover:text-emerald-400 text-[11px] font-bold transition-all text-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickLoginOwner}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#075E59]/10 text-slate-700 dark:text-slate-300 hover:text-[#075E59] dark:hover:text-emerald-400 text-[11px] font-bold transition-all text-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    🏠 Landlord
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickLoginAdmin}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#075E59]/10 text-slate-700 dark:text-slate-300 hover:text-[#075E59] dark:hover:text-emerald-400 text-[11px] font-bold transition-all text-center border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* MODE 2: REGISTER */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                  Buong Pangalan *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="hal. Juan Dela Cruz"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                  Password (6+ characters) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Gumawa ng secured password"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                  Cellphone Number (Opsyonal)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0917-XXX-XXXX"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                    Kolehiyo / Campus sa Capiz
                  </label>
                  <select
                    value={regPreferredSchoolId}
                    onChange={(e) => setRegPreferredSchoolId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  >
                    {schools.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.shortName} — {sch.municipality}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'owner' && (
                <div>
                  <label className="block text-xs font-bold text-[#173747] dark:text-slate-200 mb-1">
                    Pangalan ng Boarding House / Dorm
                  </label>
                  <input
                    type="text"
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    placeholder="hal. Villa Pilar Dormitory"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#173747] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#075E59]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#075E59] hover:bg-[#064C48] text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>Gumawa ng Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
