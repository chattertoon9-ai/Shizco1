import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { UserRole } from '../types';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  KeyRound,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
  UserPlus
} from 'lucide-react';

// Shared login-screen support forms, used by BOTH the landing login page
// (light variant) and the in-app LoginModal (dark variant).
//
// Honest limit, shown in the UI: this is a static app with no email server,
// so nothing is sent automatically. A forgot-password request is only
// RECORDED for the Owner (User Management), and the requester is offered a
// prefilled "Email the Owner" mailto. A new-account request is likewise
// recorded for the Owner to Approve/Reject.

type Variant = 'light' | 'dark';

const styles: Record<Variant, {
  panel: string;
  heading: string;
  sub: string;
  label: string;
  input: string;
  note: string;
  noteBorder: string;
  successBox: string;
  successText: string;
  link: string;
  primaryBtn: string;
  secondaryBtn: string;
}> = {
  light: {
    panel: 'text-slate-900',
    heading: 'text-xl sm:text-2xl font-extrabold text-slate-900',
    sub: 'text-sm text-slate-600',
    label: 'block text-slate-700 font-semibold mb-1.5 text-sm',
    input: 'w-full bg-white border border-slate-300 rounded-xl px-3 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition text-sm font-medium',
    note: 'bg-amber-50 border-amber-200 text-amber-800',
    noteBorder: 'border',
    successBox: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    successText: 'text-sm text-emerald-800',
    link: 'font-semibold text-blue-700 hover:text-blue-800 hover:underline',
    primaryBtn: 'w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2',
    secondaryBtn: 'w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-semibold cursor-pointer transition flex items-center justify-center gap-2'
  },
  dark: {
    panel: 'text-white',
    heading: 'text-base font-bold text-white',
    sub: 'text-xs text-slate-400',
    label: 'block text-slate-400 font-semibold mb-1 text-xs',
    input: 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm',
    note: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
    noteBorder: 'border',
    successBox: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
    successText: 'text-xs text-emerald-300',
    link: 'font-semibold text-blue-400 hover:text-blue-300 hover:underline',
    primaryBtn: 'w-full py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/30 text-sm',
    secondaryBtn: 'w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-2'
  }
};

interface PanelProps {
  variant: Variant;
  onBack: () => void;
}

export const ForgotPasswordPanel: React.FC<PanelProps> = ({ variant, onBack }) => {
  const { requestPasswordReset, language } = useProject();
  const s = styles[variant];
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [doneEmail, setDoneEmail] = useState<string | null>(null);
  const [doneNote, setDoneNote] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = requestPasswordReset(email);
    if (!res.success) {
      setError(res.message || (language === 'ur' ? 'درخواست نہیں بھیجی جا سکی۔' : 'Could not send the request.'));
      return;
    }
    setDoneNote(res.message || null);
    setDoneEmail(email.trim());
  };

  const mailto = doneEmail
    ? `mailto:info@alasadconstructors.com?subject=${encodeURIComponent('Password reset request — Shizco1 portal')}&body=${encodeURIComponent(`Hello,\n\nPlease reset the password for ${doneEmail}.\nRequested on ${new Date().toISOString().split('T')[0]}.\n\n— Shizco1 portal`)}`
    : 'mailto:info@alasadconstructors.com';

  return (
    <div className={s.panel}>
      <button type="button" onClick={onBack} className={`${s.link} text-xs flex items-center gap-1 mb-4 cursor-pointer`}>
        <ArrowLeft className="w-3.5 h-3.5" />
        {language === 'ur' ? 'سائن ان پر واپس' : 'Back to sign in'}
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 text-blue-600 flex items-center justify-center shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <h2 className={s.heading}>{language === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}</h2>
      </div>
      <p className={`${s.sub} mb-4`}>
        {language === 'ur'
          ? 'اپنا رجسٹرڈ ای میل درج کریں — درخواست Owner کے پاس محفوظ ہو جائے گی اور وہ آپ کا نیا پاس ورڈ مقرر کرے گا۔'
          : 'Enter your registered email — the request is saved for the Owner, who will set a new password for you.'}
      </p>

      {doneEmail ? (
        <div className="space-y-4">
          <div className={`p-3.5 rounded-xl border ${s.successBox} flex items-start gap-2.5`}>
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                {language === 'ur' ? 'درخواست محفوظ ہو گئی' : 'Request recorded'}
              </div>
              <p className={`${s.successText} mt-1 leading-relaxed`}>
                {doneNote || (language === 'ur'
                  ? `Owner کو آپ کی درخواست مل گئی ہے (${doneEmail}) — نیا پاس ورڈ ملتے ہی وہ آپ کو بتا دے گا۔`
                  : `The Owner has your request (${doneEmail}) — they will let you know once a new password is set.`)}
              </p>
            </div>
          </div>

          <a href={mailto} className={s.secondaryBtn}>
            <Send className="w-4 h-4" />
            {language === 'ur' ? 'Owner کو ای میل بھیجیں' : 'Email the Owner'}
          </a>

          <div className={`p-3 rounded-xl border ${s.note} text-xs leading-relaxed`}>
            {language === 'ur'
              ? 'نوٹ: یہ ایپ خود بخود ای میل نہیں بھیجتی (کوئی سرور نہیں ہے) — اوپر والا بٹن آپ کی ای میل ایپ کھول کر پہلے سے لکھی درخواست بھیجتا ہے۔'
              : 'Note: this app does not send email automatically (there is no server) — the button above opens your email app with a pre-written request.'}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`p-3 rounded-xl border ${variant === 'light' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-rose-950/40 border-rose-900 text-rose-300'} text-xs`}>
              {error}
            </div>
          )}
          <div>
            <label className={s.label}>{language === 'ur' ? 'رجسٹرڈ ای میل ایڈریس' : 'Registered email address'}</label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="email"
                required
                placeholder="e.g. engineer@alasad.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${s.input} pl-9`}
              />
            </div>
          </div>
          <button type="submit" className={s.primaryBtn}>
            <KeyRound className="w-4 h-4" />
            {language === 'ur' ? 'ری سیٹ کی درخواست بھیجیں' : 'Send reset request'}
          </button>
          <div className={`p-3 rounded-xl border ${s.note} text-xs leading-relaxed`}>
            {language === 'ur'
              ? 'نوٹ: یہ ایپ خود بخود ای میل نہیں بھیجتی (کوئی سرور نہیں ہے) — درخواست Owner کے پاس محفوظ ہوتی ہے۔'
              : 'Note: this app does not send email automatically (there is no server) — the request is saved for the Owner.'}
          </div>
        </form>
      )}
    </div>
  );
};

export const AccountRequestPanel: React.FC<PanelProps> = ({ variant, onBack }) => {
  const { submitAccountRequest, language, isDemoMode } = useProject();
  const s = styles[variant];
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedRole, setRequestedRole] = useState<UserRole>('user');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = submitAccountRequest({
      fullName,
      email,
      company,
      phone,
      requestedRole,
      message
    });
    if (!res.success) {
      setError(res.message || (language === 'ur' ? 'درخواست نہیں بھیجی جا سکی۔' : 'Could not send the request.'));
      return;
    }
    setDone(true);
  };

  return (
    <div className={s.panel}>
      <button type="button" onClick={onBack} className={`${s.link} text-xs flex items-center gap-1 mb-4 cursor-pointer`}>
        <ArrowLeft className="w-3.5 h-3.5" />
        {language === 'ur' ? 'سائن ان پر واپس' : 'Back to sign in'}
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/30 text-emerald-600 flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5" />
        </div>
        <h2 className={s.heading}>{language === 'ur' ? 'نئے اکاؤنٹ کی درخواست' : 'Request a new account'}</h2>
      </div>
      <p className={`${s.sub} mb-4`}>
        {language === 'ur'
          ? 'اپنی تفصیل بھیجیں — Owner درخواست دیکھ کر اکاؤنٹ بنائے گا اور پاس ورڈ بتا دے گا۔'
          : 'Send your details — the Owner reviews the request, creates the account and shares the password with you.'}
      </p>

      {done ? (
        <div className="space-y-4">
          <div className={`p-3.5 rounded-xl border ${s.successBox} flex items-start gap-2.5`}>
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                {language === 'ur' ? 'درخواست بھیج دی گئی' : 'Request sent'}
              </div>
              <p className={`${s.successText} mt-1 leading-relaxed`}>
                {language === 'ur'
                  ? 'آپ کی درخواست Owner کے پاس محفوظ ہو گئی ہے۔ منظوری ملتے ہی آپ کو ای میل اور پاس ورڈ بتا دیا جائے گا۔'
                  : 'Your request is saved for the Owner. Once approved, you will be told your email and password.'}
              </p>
            </div>
          </div>
          {isDemoMode && (
            <div className={`p-3 rounded-xl border ${s.note} text-xs leading-relaxed`}>
              {language === 'ur'
                ? 'ڈیمو موڈ: یہ درخواست صرف ڈیمو ڈیٹا میں محفوظ ہوئی ہے — اصل کمپنی کے ریکارڈ سے مکمل الگ۔'
                : 'Demo mode: this request is saved only in the demo data — completely separate from the real company records.'}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`p-3 rounded-xl border ${variant === 'light' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-rose-950/40 border-rose-900 text-rose-300'} text-xs`}>
              {error}
            </div>
          )}

          <div>
            <label className={s.label}>{language === 'ur' ? 'مکمل نام *' : 'Full name *'}</label>
            <div className="relative">
              <User className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                required
                placeholder="e.g. Sub-Engr. Bilal Aslam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`${s.input} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={s.label}>{language === 'ur' ? 'ای میل ایڈریس *' : 'Email address *'}</label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="email"
                required
                placeholder="e.g. engineer@alasad.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${s.input} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={s.label}>{language === 'ur' ? 'کمپنی / ادارہ *' : 'Company / organisation *'}</label>
            <div className="relative">
              <Building2 className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                required
                placeholder="e.g. Al Asad Constructors"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={`${s.input} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={s.label}>{language === 'ur' ? 'فون (اختیاری)' : 'Phone (optional)'}</label>
            <div className="relative">
              <Phone className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="tel"
                placeholder="e.g. 0333-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${s.input} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={s.label}>{language === 'ur' ? 'کون سا کردار چاہیے؟ *' : 'Role requested *'}</label>
            <select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value as UserRole)}
              className={`${s.input} cursor-pointer`}
            >
              <option value="user">{language === 'ur' ? 'سائٹ یوزر (Site User)' : 'Site User'}</option>
              <option value="admin">{language === 'ur' ? 'ایڈمنسٹریٹر (Administrator)' : 'Administrator'}</option>
            </select>
          </div>

          <div>
            <label className={s.label}>{language === 'ur' ? 'پیغام (اختیاری)' : 'Short message (optional)'}</label>
            <div className="relative">
              <MessageSquare className={`w-4 h-4 absolute left-3 top-3 ${variant === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              <textarea
                rows={3}
                placeholder={language === 'ur' ? 'مثال: میں سائٹ انجینئر ہوں، مجھے ٹاسک اور لاگ دیکھنے کے لیے اکاؤنٹ چاہیے۔' : 'e.g. I am a site engineer and need an account to view tasks and logs.'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${s.input} pl-9 resize-none`}
              />
            </div>
          </div>

          <button type="submit" className={s.primaryBtn}>
            <Send className="w-4 h-4" />
            {language === 'ur' ? 'درخواست بھیجیں' : 'Send request'}
          </button>

          <div className={`p-3 rounded-xl border ${s.note} text-xs leading-relaxed`}>
            {language === 'ur'
              ? 'نوٹ: منظوری صرف Owner دیتا ہے — درخواست User Management میں محفوظ ہوتی ہے، خود بخود اکاؤنٹ نہیں بنتا۔'
              : 'Note: only the Owner approves — the request is saved in User Management; no account is created automatically.'}
          </div>
        </form>
      )}
    </div>
  );
};
