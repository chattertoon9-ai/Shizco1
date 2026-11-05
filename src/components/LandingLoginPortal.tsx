import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  Scale, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Layers,
  Activity,
  FileCheck2,
  CalendarClock
} from 'lucide-react';

interface LandingLoginPortalProps {
  onLoginSuccess?: () => void;
}

export const LandingLoginPortal: React.FC<LandingLoginPortalProps> = ({ onLoginSuccess }) => {
  const { login, language, setLanguage } = useProject();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMessage(res.message || (language === 'ur' ? 'غلط ای میل یا پاس ورڈ ہے۔' : 'Invalid email or password.'));
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#050811] flex flex-col justify-between text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Strip */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-blue-600/40 bg-slate-900 flex items-center justify-center p-0.5 shadow-xl shadow-blue-950/60 shrink-0">
            <img 
              src="/logo.jpg" 
              alt="Al Asad Constructors" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none">
                {language === 'ur' ? 'الاسد کنسٹرکٹرز' : 'Al Asad Constructors'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PEC C-3
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase leading-none flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{language === 'ur' ? 'کراچی، سندھ، پاکستان' : 'Karachi · Sindh · Pakistan'}</span>
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold cursor-pointer transition shadow-sm flex items-center gap-1.5"
          >
            <span>{language === 'en' ? 'اردو پورٹل' : 'English View'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area - Split Hero on Desktop, Focused Card on Mobile */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Column (Desktop Overview & Live Telemetry) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'ur' ? 'انٹرپرائز سول انجینئرنگ و کنسٹرکشن مینجمنٹ پورٹل' : 'Civil Engineering & Job Site Operations Hub'}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-white tracking-tight leading-tight">
                {language === 'ur' ? (
                  <>
                    محفوظ لاگ ان <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">الاسد کنسٹرکٹرز</span> پورٹل
                  </>
                ) : (
                  <>
                    Executive Access to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">Al Asad Constructors</span> Operations
                  </>
                )}
              </h1>
              <p className="text-sm xl:text-base text-slate-400 max-w-xl leading-relaxed">
                {language === 'ur'
                  ? 'پروجیکٹ ڈیڈلائنز، سنَیگ لسٹ پنچ بورڈ، مٹیریلز اور افرادی قوت لیجر، FBR 18% GST و SRB 13% سیلز ٹیکس انوائسز اور وینڈر RFQ ٹینڈرنگ کا مکمل کنٹرول روم۔'
                  : 'Mission-critical job site telemetry, task burndown schedules, muster roll accounts, FBR & SRB tax compliance, and automated vendor RFQ tendering.'}
              </p>
            </div>

            {/* Visual Highlights Grid */}
            <div className="grid grid-cols-2 gap-3.5 max-w-xl pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-blue-900/40 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">
                  {language === 'ur' ? 'رول بیسڈ سب یوزرز' : 'Role-Based Sub-Users'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ur' ? 'ایڈمن اور سائٹ انجینئر کے الگ اختیارات' : 'Admin & Site Engineer granular rights'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-900/40 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">
                  {language === 'ur' ? 'FBR و SRB ٹیکسیشن' : 'FBR & SRB Compliance'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ur' ? '18% GST، 13% SST و WHT کٹوتی' : '18% GST, 13% SST, Sec 153 WHT & RFQs'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-900/40 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">
                  {language === 'ur' ? 'ڈیڈلائنز و نوٹیفیکیشن' : 'Milestones & Snags'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ur' ? 'خودکار الرٹ سنٹر اور سائٹ لاگز' : 'Live deadline alerts & QA punch-lists'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center mb-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white">
                  {language === 'ur' ? 'سندھ ریجن سائٹ آپریشنز' : 'Sindh Job Sites'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ur' ? 'کراچی، کلفٹن، گلبرگ کمرشل پلازہ' : 'Karachi, Clifton Villa, Logistics Shed'}
                </div>
              </div>
            </div>

            {/* Site Construction Image Badge */}
            <div className="relative rounded-2xl overflow-hidden border border-blue-900/40 shadow-2xl max-w-xl group">
              <img 
                src="/src/assets/images/construction_commercial_site_1793460327058.jpg" 
                alt="Active Construction Site" 
                className="w-full h-36 object-cover opacity-60 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-semibold text-white">
                      {language === 'ur' ? 'لائیو سائٹس فعال: ۳ جاری منصوبے' : 'Active Projects: 3 Sites Ongoing'}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Karachi · Clifton · Lahore
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md bg-slate-900/95 border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/70 relative overflow-hidden backdrop-blur-xl">
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

              {/* Mobile Header with Logo */}
              <div className="text-center space-y-2 mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-slate-950 p-1 shadow-xl shadow-blue-900/40 flex items-center justify-center">
                  <img 
                    src="/logo.jpg" 
                    alt="Al Asad Constructors" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {language === 'ur' ? 'سائن ان — لاگ ان پیج' : 'Sign In to Portal'}
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'ur'
                    ? 'الاسد کنسٹرکٹرز کے ڈیش بورڈ تک رسائی کے لیے لاگ ان کریں'
                    : 'Enter your credentials to access your job sites and dashboard'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    {language === 'ur' ? 'ای میل ایڈریس' : 'Corporate Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={language === 'ur' ? 'ای میل ایڈریس درج کریں' : 'Enter corporate email'}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    {language === 'ur' ? 'پاس ورڈ' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={language === 'ur' ? 'پاس ورڈ درج کریں' : 'Enter password'}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Help */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <span>{language === 'ur' ? 'مجھے یاد رکھیں' : 'Remember session'}</span>
                  </label>
                  <span className="text-slate-500 font-mono text-[10px]">
                    PEC Registered Portal
                  </span>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs tracking-wide shadow-xl shadow-blue-600/30 border border-blue-400/40 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-3"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>{language === 'ur' ? 'تصدیق ہو رہی ہے...' : 'Authenticating...'}</span>
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{language === 'ur' ? 'لاگ ان کریں اور ہوم پیج کھولیں' : 'Sign In & Enter Dashboard'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Copyright */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 text-center font-mono">
                copyright @ 2026, ShizCon
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-800/60 flex items-center justify-center text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-400">copyright @ 2026, ShizCon</span>
      </footer>
    </div>
  );
};
