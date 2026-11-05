import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations } from '../utils/translations';
import { UserRole, AuthUser } from '../types';
import { 
  X, 
  ShieldCheck, 
  User, 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  HardHat,
  Sparkles,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { 
    login, 
    loginAsDemo, 
    language, 
    currentUser, 
    isAdmin,
    users, 
    setActiveTab 
  } = useProject();
  
  const t = translations[language];

  const [activeTab, setActiveTabLocal] = useState<'profiles' | 'custom'>('profiles');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError(language === 'ur' ? 'برائے مہربانی ای میل درج کریں۔' : 'Please enter an email address.');
      return;
    }

    const res = login(email, password);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || (language === 'ur' ? 'لاگ ان ناکام رہا۔' : 'Sign in failed.'));
    }
  };

  const handleQuickSelectUser = (user: AuthUser) => {
    setError(null);
    const res = login(user.email, user.password);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Login error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border border-blue-900/50 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-blue-700/50 bg-slate-900 flex items-center justify-center shrink-0 shadow-lg p-0.5">
              <img 
                src="/logo.jpg" 
                alt="Al Asad Constructors" 
                className="w-full h-full object-cover rounded-lg" 
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {language === 'ur' ? 'الاسد کنسٹرکٹرز - سائن ان' : 'Al Asad Constructors Portal'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'ایڈمن اور تفویض کردہ سب یوزر لاگ ان' : 'Role-Based Access: Admin & Managed Sub-Users'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 text-xs">
          <button
            onClick={() => { setActiveTabLocal('profiles'); setError(null); }}
            className={`flex-1 py-2 text-center font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'profiles'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ur' ? 'رجسٹرڈ پروفائلز (Admin & Sub-Users)' : 'Registered User Accounts'}
          </button>
          <button
            onClick={() => { setActiveTabLocal('custom'); setError(null); }}
            className={`flex-1 py-2 text-center font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ur' ? 'ای میل و پاس ورڈ سے سائن ان' : 'Sign in with Password'}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {activeTab === 'profiles' ? (
            /* Accounts List (both Admin and all Sub-Users created by Admin) */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {language === 'ur' 
                    ? 'فوری سائن ان کے لیے کسی بھی اکاؤنٹ پر کلک کریں:' 
                    : 'Click any configured profile to test their assigned rights:'}
                </span>
                <span className="font-mono text-emerald-400">
                  {users.length} {language === 'ur' ? 'اکاؤنٹس' : 'accounts'}
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {users.map((user) => {
                  const isCurrent = currentUser?.id === user.id;

                  return (
                    <div 
                      key={user.id}
                      onClick={() => handleQuickSelectUser(user)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                        isCurrent
                          ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/40'
                          : user.role === 'admin'
                            ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/60'
                            : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/60'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl ${user.role === 'admin' ? 'bg-gradient-to-tr from-blue-700 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-500'} text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0 mt-0.5`}>
                          {user.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                              {language === 'ur' && user.nameUrdu ? user.nameUrdu : user.name}
                            </h4>
                            <span className={`px-1.5 py-0.2 text-[9px] font-bold font-mono tracking-wider rounded ${
                              user.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {user.designation}
                          </div>

                          <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                            <span>{user.email}</span>
                            <span>·</span>
                            <span className="text-slate-400">Pass: <strong className="text-blue-300">{user.password}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-1">
                        {isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Link to Admin Users Management (Admin Only) */}
              {isAdmin && (
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-500">
                    {language === 'ur' ? 'مزید سب یوزرز بنانے کے لیے:' : 'Need to add or edit sub-users?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('users');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{language === 'ur' ? 'یوزرز و اختیارات پینل کھولیں' : 'Open Users & Rights Panel'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Custom Credentials Form */
            <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
              <p className="text-slate-400">
                {language === 'ur'
                  ? 'ایڈمن یا سب یوزر کا ای میل اور پاس ورڈ درج کریں:'
                  : 'Enter the username/email and password assigned by the Administrator:'}
              </p>

              {/* Email */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Email Address / Username *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@alasad.com or engineer@alasad.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-10 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {language === 'ur' ? 'پاس ورڈ ایڈمنسٹریٹر کی طرف سے جاری کیا گیا ہے۔' : 'Password is configured by the Administrator in the Users tab.'}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 mt-3 cursor-pointer shadow-md shadow-blue-600/30"
              >
                <span>{language === 'ur' ? 'سائن ان کریں' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{language === 'ur' ? 'الاسد کنسٹرکٹرز - محفوظ رسائی' : 'Al Asad Constructors Access Control'}</span>
          <span className="font-mono text-emerald-400">Portal v2.0</span>
        </div>

      </div>
    </div>
  );
};
