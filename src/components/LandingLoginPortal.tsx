import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Wallet,
  Bell,
  Play,
} from 'lucide-react';
import commercialSiteImg from '../assets/images/construction_commercial_site_1793460327058.jpg';

interface LandingLoginPortalProps {
  onLoginSuccess?: () => void;
}

export const LandingLoginPortal: React.FC<LandingLoginPortalProps> = ({ onLoginSuccess }) => {
  const { login, loginAsDemo, language, setLanguage } = useProject();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  // One-tap demo login — no password needed. Switches to the demo namespace
  // (sample data, separate from the real company data).
  const handleTryDemo = () => {
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAsDemo();
      setIsLoading(false);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMessage(res.message || (language === 'ur' ? 'ڈیمو لاگ ان ناکام رہا۔' : 'Demo login failed.'));
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Strip */}
      <header className="w-full bg-white border-b border-slate-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0">
              <img
                src="logo.jpg"
                alt="Al Asad Constructors"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  {language === 'ur' ? 'الاسد کنسٹرکٹرز' : 'Al Asad Constructors'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  PEC C-3
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono tracking-wider uppercase leading-none flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{language === 'ur' ? 'کراچی، سندھ، پاکستان' : 'Karachi · Sindh · Pakistan'}</span>
              </span>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold cursor-pointer transition shadow-sm flex items-center gap-1.5"
            >
              <span>اردو / Urdu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Split Hero on Desktop, Short Intro + Sign In on Mobile */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Headline, Benefits & Active Sites */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5 lg:space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {language === 'ur' ? (
                  <>
                    اپنی تعمیراتی سائٹس، مزدوروں، مٹیریل اور ادائیگیوں کا انتظام <span className="text-blue-700">ایک جگہ</span> کریں
                  </>
                ) : (
                  <>
                    Manage your construction sites, workers, materials and payments <span className="text-blue-700">in one place</span>
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                {language === 'ur'
                  ? 'آپ کی ٹیم کے لیے کام، مٹیریل اور ادائیگیوں کی نگرانی کی ایک آسان جگہ۔'
                  : 'One simple place for your team to track work, materials and payments.'}
              </p>
            </div>

            {/* Three Plain Benefits (desktop only) */}
            <div className="hidden lg:grid grid-cols-3 gap-3.5 max-w-2xl pt-1">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {language === 'ur' ? 'سائٹس اور مزدور ایک جگہ' : 'Sites & workers in one place'}
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {language === 'ur' ? 'ہر سائٹ اور ہر مزدور، ایک جگہ پر۔' : 'Every site and every worker, tracked in one place.'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {language === 'ur' ? 'مٹیریل، اخراجات اور ادائیگیاں' : 'Materials, costs and payments'}
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {language === 'ur' ? 'مٹیریل، اخراجات اور ادائیگیوں کی واضح نگرانی۔' : 'Materials, costs and payments, tracked clearly.'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {language === 'ur' ? 'ڈیڈلائنز اور سائٹ کے مسائل' : 'Deadlines and site issues'}
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {language === 'ur' ? 'ڈیڈلائنز اور سائٹ کے مسائل، فوری الرٹس کے ساتھ۔' : 'Deadlines and site issues, with live alerts.'}
                </div>
              </div>
            </div>

            {/* Active Sites Photo Strip (desktop only) */}
            <div className="hidden lg:block relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-w-2xl">
              <img
                src={commercialSiteImg}
                alt="Active Construction Site"
                className="w-full h-36 object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {language === 'ur' ? 'فعال منصوبے: 3 سائٹس جاری ہیں' : 'Active Projects: 3 Sites Ongoing'}
                </span>
                <span className="font-mono text-slate-500 text-xs">
                  Karachi · Clifton · Lahore
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 relative overflow-hidden">
              {/* Mobile Header with Logo */}
              <div className="text-center space-y-2 mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-white p-1 shadow-sm flex items-center justify-center">
                  <img
                    src="logo.jpg"
                    alt="Al Asad Constructors"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {language === 'ur' ? 'سائن ان' : 'Sign in'}
                </h2>
                <p className="text-sm text-slate-600">
                  {language === 'ur'
                    ? 'جاری رکھنے کے لیے اپنا ای میل اور پاس ورڈ درج کریں۔'
                    : 'Enter your email and password to continue.'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 text-sm">
                    {language === 'ur' ? 'ای میل ایڈریس' : 'Email address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={language === 'ur' ? 'اپنا ای میل درج کریں' : 'Enter your email'}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 text-sm">
                    {language === 'ur' ? 'پاس ورڈ' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={language === 'ur' ? 'اپنا پاس ورڈ درج کریں' : 'Enter your password'}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <a
                      href="mailto:info@alasadconstructors.com?subject=Password%20reset%20%E2%80%94%20Shizco1%20portal"
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {language === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
                    </a>
                  </div>
                </div>

                {/* Remember & PEC */}
                <div className="flex items-center justify-between text-sm text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span>{language === 'ur' ? 'مجھے یاد رکھیں' : 'Remember me'}</span>
                  </label>
                  <span className="text-slate-500 font-mono text-xs">
                    PEC Registered Portal
                  </span>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-3"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>{language === 'ur' ? 'سائن ان ہو رہا ہے...' : 'Signing in…'}</span>
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{language === 'ur' ? 'سائن ان' : 'Sign in'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Try Demo — one tap, no password needed */}
              <div className="mt-5">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex-1 h-px bg-slate-200" />
                  <span>{language === 'ur' ? 'یا ڈیمو دیکھیں' : 'or explore the demo'}</span>
                  <span className="flex-1 h-px bg-slate-200" />
                </div>
                <button
                  type="button"
                  onClick={handleTryDemo}
                  disabled={isLoading}
                  className="mt-3 w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{language === 'ur' ? 'ڈیمو آزمائیں — پاس ورڈ کی ضرورت نہیں' : 'Try Demo — no password needed'}</span>
                </button>
                <p className="mt-2 text-center text-xs text-slate-500 leading-relaxed">
                  {language === 'ur' ? 'ڈیمو لاگ ان: ' : 'Demo login: '}
                  <span className="font-mono font-semibold text-slate-700">demo@alasadconstructors.com</span>
                  {' · '}
                  <span className="font-mono font-semibold text-slate-700">Demo@1234</span>
                  <br />
                  {language === 'ur' ? 'صرف نمونہ ڈیٹا — اصل کمپنی کے ڈیٹا سے مکمل الگ' : 'Sample data only — completely separate from the real company data'}
                </p>
              </div>

              {/* Need an account */}
              <div className="mt-5 text-center text-sm text-slate-600">
                {language === 'ur' ? 'اکاؤنٹ چاہیے؟ ' : 'Need an account? '}
                <a
                  href="mailto:info@alasadconstructors.com"
                  className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  {language === 'ur' ? 'دفتر سے رابطہ کریں' : 'Contact the office'}
                </a>
              </div>

              {/* Copyright */}
              <div className="mt-5 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center">
                {language === 'ur'
                  ? '© 2026 الاسد کنسٹرکٹرز۔ جملہ حقوق محفوظ ہیں۔'
                  : '© 2026 Al Asad Constructors. All rights reserved.'}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="w-full bg-white border-t border-slate-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center text-xs text-slate-500">
          <span>
            {language === 'ur'
              ? '© 2026 الاسد کنسٹرکٹرز۔ جملہ حقوق محفوظ ہیں۔'
              : '© 2026 Al Asad Constructors. All rights reserved.'}
          </span>
        </div>
      </footer>
    </div>
  );
};
