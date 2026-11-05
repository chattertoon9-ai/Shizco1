import React from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  ShieldCheck, 
  Home, 
  LogIn,
  CheckCircle2, 
  ArrowRight, 
  Languages,
  Lock
} from 'lucide-react';

interface UserLogoutPageProps {
  onReturnToLogin: () => void;
}

export const UserLogoutPage: React.FC<UserLogoutPageProps> = ({ onReturnToLogin }) => {
  const { language, setLanguage } = useProject();

  return (
    <div className="min-h-screen w-full bg-[#050811] flex flex-col justify-between text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-600/40 bg-slate-900 flex items-center justify-center p-0.5 shadow-lg shadow-blue-900/40">
            <img 
              src="/logo.jpg" 
              alt="Al Asad Constructors" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight leading-tight block">
              {language === 'ur' ? 'الاسد کنسٹرکٹرز' : 'Al Asad Constructors'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase leading-none flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Karachi · Sindh · Pakistan
            </span>
          </div>
        </div>

        {/* Language Switch */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-sm"
        >
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'en' ? 'اردو' : 'English'}</span>
        </button>
      </header>

      {/* Main Center Content: Clean, Secure Logout without any personal user data */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900/95 border border-blue-900/50 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-blue-950/60 relative overflow-hidden backdrop-blur-xl animate-fadeIn text-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          {/* Success Status Emblem */}
          <div className="space-y-4 mb-8">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600/20 via-emerald-600/20 to-slate-900 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {language === 'ur' ? 'لاگ آؤٹ مکمل' : 'Logged Out Successfully'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {language === 'ur' ? 'آپ لاگ آؤٹ ہو چکے ہیں' : 'You Have Been Logged Out'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                {language === 'ur'
                  ? 'سیشن بحفاظت ختم ہو گیا ہے۔ براؤزر کیشے محفوظ ہے اور تمام تبدیلیاں ریکارڈ ہو چکی ہیں۔'
                  : 'Your active session has been securely closed. All job site records and data remain safe.'}
              </p>
            </div>
          </div>

          {/* Security Clearance Strip */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2 mb-6">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Session Secured · Tokens Invalidated</span>
          </div>

          {/* Primary Action Button: Return to Home Page / Login Page */}
          <div className="space-y-3">
            <button
              onClick={onReturnToLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs tracking-wide shadow-xl shadow-blue-600/30 border border-blue-400/40 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>{language === 'ur' ? 'ہوم پیج پر جائیں' : 'Go to Home Page'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onReturnToLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'ur' ? 'دوبارہ لاگ ان کریں' : 'Sign In with Credentials'}</span>
            </button>
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
