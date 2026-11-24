import React from 'react';
import { useProject } from '../context/ProjectContext';
import { formatCurrency } from '../utils/translations';
import { ActiveTab, TaxSection, ManpowerSection } from '../types';
import {
  Users,
  Briefcase,
  Kanban,
  Wallet,
  ClipboardList,
  Package,
  CalendarRange,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  HardHat,
  Scale,
  LogOut,
  Sparkles,
  UserCheck,
  Banknote,
  Receipt,
  FileText,
  BookOpen,
  Calculator,
  UserPlus,
  KeyRound
} from 'lucide-react';

interface GroupSubItem {
  id: ActiveTab;
  labelEn: string;
  labelUr: string;
  icon: React.ElementType;
  taxSection?: TaxSection;
  manpowerSection?: ManpowerSection;
}

interface GroupCard {
  key: string;
  titleEn: string;
  titleUr: string;
  badgeEn: string;
  badgeUr: string;
  subtitleEn: string;
  subtitleUr: string;
  icon: React.ElementType;
  iconTile: string;
  defaultTab: ActiveTab;
  defaultTaxSection?: TaxSection;
  defaultManpowerSection?: ManpowerSection;
  adminOnly?: boolean;
  items: GroupSubItem[];
}

// Six main groups — every old module lives one click inside its group.
// GitHub Guide is intentionally NOT shown here (file kept, link removed).
const GROUPS: GroupCard[] = [
  {
    key: 'hr',
    titleEn: 'HR — Attendance, Salary & Manpower',
    titleUr: 'ایچ آر — حاضری، تنخواہ و افرادی قوت',
    badgeEn: 'Workforce & Daily Wages',
    badgeUr: 'حاضری مسٹر رول و اجرت',
    subtitleEn: 'Daily site attendance, overtime hours, salary slips and manpower headcount — all in one place.',
    subtitleUr: 'سائٹ پر روزانہ حاضری، اوور ٹائم، تنخواہ کی پرچی اور افرادی قوت — سب ایک جگہ۔',
    icon: HardHat,
    iconTile: 'bg-amber-100 text-amber-700',
    defaultTab: 'manpower',
    defaultManpowerSection: 'all',
    items: [
      { id: 'manpower', labelEn: 'Attendance', labelUr: 'حاضری', icon: UserCheck, manpowerSection: 'attendance' },
      { id: 'manpower', labelEn: 'Salary', labelUr: 'تنخواہ', icon: Banknote, manpowerSection: 'salary' },
      { id: 'manpower', labelEn: 'Manpower', labelUr: 'افرادی قوت', icon: Users, manpowerSection: 'all' }
    ]
  },
  {
    key: 'accounts',
    titleEn: 'ACCOUNTS — Invoices, RFQ & Ledger',
    titleUr: 'اکاؤنٹس — انوائس، آر ایف کیو و لیجر',
    badgeEn: 'Cash Flow & Vouchers',
    badgeUr: 'مالیات و اخراجات کیش',
    subtitleEn: 'Tax invoices, RFQ tenders with quotation comparison, and the site accounts & expense ledger.',
    subtitleUr: 'ٹیکس انوائسز، آر ایف کیو کوٹیشن موازنہ، اور سائٹ کے اخراجات کا لیجر۔',
    icon: Wallet,
    iconTile: 'bg-emerald-100 text-emerald-700',
    defaultTab: 'invoices_rfq',
    defaultTaxSection: 'invoices',
    items: [
      { id: 'invoices_rfq', labelEn: 'Invoice', labelUr: 'انوائس', icon: Receipt, taxSection: 'invoices' },
      { id: 'invoices_rfq', labelEn: 'RFQ', labelUr: 'آر ایف کیو', icon: FileText, taxSection: 'rfqs' },
      { id: 'accounts', labelEn: 'Accounts Ledger', labelUr: 'اکاؤنٹس لیجر', icon: BookOpen }
    ]
  },
  {
    key: 'sitework',
    titleEn: 'Site Work — Projects & Daily Progress',
    titleUr: 'سائٹ ورک — پروجیکٹس و روزانہ پیش رفت',
    badgeEn: 'Active Job Sites',
    badgeUr: 'فعال تعمیراتی سائٹس',
    subtitleEn: 'Projects, executive overview, Gantt timeline, daily site log, tasks and quality snags.',
    subtitleUr: 'پروجیکٹس، ایگزیکٹو رپورٹ، گانٹ ٹائم لائن، روزنامچہ، ٹاسکس اور کوالٹی نقائص۔',
    icon: Briefcase,
    iconTile: 'bg-blue-100 text-blue-700',
    defaultTab: 'projects',
    items: [
      { id: 'projects', labelEn: 'Projects', labelUr: 'پروجیکٹس', icon: Briefcase },
      { id: 'overview', labelEn: 'Executive Overview', labelUr: 'ایگزیکٹو رپورٹ', icon: BarChart3 },
      { id: 'gantt', labelEn: 'Timeline (Gantt)', labelUr: 'ٹائم لائن', icon: CalendarRange },
      { id: 'daily_logs', labelEn: 'Daily Log', labelUr: 'روزنامچہ', icon: ClipboardList },
      { id: 'tasks', labelEn: 'Tasks', labelUr: 'ٹاسکس', icon: Kanban },
      { id: 'snags', labelEn: 'Snags', labelUr: 'نقائص', icon: AlertCircle }
    ]
  },
  {
    key: 'logistics',
    titleEn: 'Logistics — Materials Inventory',
    titleUr: 'لوجسٹکس — میٹریل انوینٹری',
    badgeEn: 'Rebar, Cement & Aggregates',
    badgeUr: 'سریا، سیمنٹ، ریت و بجری',
    subtitleEn: 'Steel bar receipts, cement bags, bricks and aggregate dispatch, usage and remaining stock.',
    subtitleUr: 'سریا، سیمنٹ بوریوں، اینٹوں اور ریت بجری کی ترسیل، استعمال اور بقایا اسٹاک۔',
    icon: Package,
    iconTile: 'bg-orange-100 text-orange-700',
    defaultTab: 'materials',
    items: [
      { id: 'materials', labelEn: 'Materials Inventory', labelUr: 'میٹریل انوینٹری', icon: Package }
    ]
  },
  {
    key: 'fbr',
    titleEn: 'FBR — Taxes',
    titleUr: 'ایف بی آر — ٹیکسز',
    badgeEn: 'GST, SST & WHT',
    badgeUr: 'جی ایس ٹی، سروس ٹیکس و ودہولڈنگ',
    subtitleEn: 'FBR GST 18%, SRB 13%, Section 153 WHT and the tax rate calculator.',
    subtitleUr: 'ایف بی آر جی ایس ٹی 18٪، ایس آر بی 13٪، سیکشن 153 ودہولڈنگ ٹیکس اور ٹیکس کیلکولیٹر۔',
    icon: Scale,
    iconTile: 'bg-indigo-100 text-indigo-700',
    defaultTab: 'tax_compliance',
    defaultTaxSection: 'calculator',
    items: [
      { id: 'tax_compliance', labelEn: 'Taxes', labelUr: 'ٹیکسز', icon: Calculator, taxSection: 'calculator' }
    ]
  },
  {
    key: 'users',
    titleEn: 'User Management & Security',
    titleUr: 'صارفین، رولز و سیکیورٹی',
    badgeEn: 'Role-Based Access Control',
    badgeUr: 'صارفین کی رسائی و اختیارات',
    subtitleEn: 'Create new users and assign rights — engineers, project managers, accountants and site supervisors.',
    subtitleUr: 'نئے صارف بنائیں اور اختیارات دیں — انجینئرز، پروجیکٹ مینیجرز، اکاؤنٹنٹس اور سپروائزرز۔',
    icon: ShieldCheck,
    iconTile: 'bg-slate-200 text-slate-700',
    defaultTab: 'users',
    adminOnly: true,
    items: [
      { id: 'users', labelEn: 'New User', labelUr: 'نیا صارف', icon: UserPlus },
      { id: 'users', labelEn: 'Rights & Roles', labelUr: 'اختیارات و رولز', icon: KeyRound }
    ]
  }
];

export const ModulesPortalView: React.FC = () => {
  const {
    setActiveTab,
    setTaxSection,
    setManpowerSection,
    language,
    projects,
    tasks,
    labor,
    snags,
    currentUser,
    logout,
    activeProjectId,
    setActiveProjectId,
    isAdmin,
    isDemoMode
  } = useProject();

  const goTo = (
    tab: ActiveTab,
    taxSection?: TaxSection,
    manpowerSection?: ManpowerSection
  ) => {
    if (taxSection) setTaxSection(taxSection);
    if (manpowerSection) setManpowerSection(manpowerSection);
    setActiveTab(tab);
  };

  const visibleGroups = GROUPS.filter(group => !group.adminOnly || isAdmin || isDemoMode);

  // Executive Summary — the same key numbers as the Executive Overview,
  // honouring the site filter above (all sites, or the one site selected).
  const summaryProjects = activeProjectId === 'all' ? projects : projects.filter(p => p.id === activeProjectId);
  const summaryTasks = activeProjectId === 'all' ? tasks : tasks.filter(t => t.projectId === activeProjectId);
  const summaryLabor = activeProjectId === 'all' ? labor : labor.filter(l => l.projectId === activeProjectId);
  const summarySnags = activeProjectId === 'all' ? snags : snags.filter(s => s.projectId === activeProjectId);
  const summaryBudget = summaryProjects.reduce((s, p) => s + p.budget, 0);
  const summarySpent = summaryProjects.reduce((s, p) => s + p.spent, 0);
  const summaryUtilization = summaryBudget > 0 ? Math.round((summarySpent / summaryBudget) * 100) : 0;
  const summaryDone = summaryTasks.filter(t => t.status === 'completed').length;
  const summaryDelayed = summaryTasks.filter(t => t.status === 'delayed').length;
  const summaryActive = summaryTasks.filter(t => t.status === 'in_progress').length;
  const summaryTaskPct = summaryTasks.length > 0 ? Math.round((summaryDone / summaryTasks.length) * 100) : 0;
  const summaryWorkers = summaryLabor.reduce((s, l) => s + l.headcount, 0);
  const summaryWages = summaryLabor.reduce((s, l) => s + (l.totalWage || (l.headcount * l.dailyWageRate)), 0);
  const summaryOpenSnags = summarySnags.filter(s => s.status !== 'resolved').length;
  const summaryScope = activeProjectId === 'all' ? null : projects.find(p => p.id === activeProjectId);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner: light, matching the landing redesign */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {language === 'ur' ? 'مرکزی ٹیبس ڈیش بورڈ' : 'System Navigation Tabs'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-medium">
                {language === 'ur' ? `خوش آمدید: ${currentUser?.name || 'صارف'}` : `Welcome: ${currentUser?.name || 'User'}`}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 text-blue-700 border border-slate-200">
                {currentUser?.role || 'authorized'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'ur'
                ? 'الاسد کنسٹرکٹرز — سسٹم ٹیبس'
                : 'Al Asad Constructors — System Tabs Portal'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {language === 'ur'
                ? 'کام شروع کرنے کے لیے نیچے دیے گئے کسی بھی گروپ پر کلک کریں:'
                : 'Login successful. Pick a group below to open that part of the system:'}
            </p>
          </div>

          {/* Quick Site Filter & Direct Logout */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer font-medium shadow-sm"
            >
              <option value="all">{language === 'ur' ? 'تمام پروجیکٹ سائٹس (All Sites)' : 'All Active Sites'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name}
                </option>
              ))}
            </select>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
              title={language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Quick Group Pills: tap a group to open its main view */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {visibleGroups.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.key}
                  onClick={() => goTo(group.defaultTab, group.defaultTaxSection, group.defaultManpowerSection)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 border-slate-200 shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? group.titleUr.split('—')[0].trim() : group.titleEn.split('—')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Executive Summary — key numbers from the Executive Overview */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex flex-wrap items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'ur' ? 'ایگزیکٹو خلاصہ' : 'Executive Summary'}</span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 normal-case font-sans font-semibold">
              {summaryScope ? summaryScope.code : (language === 'ur' ? 'تمام سائٹس' : 'All Sites')}
            </span>
            {summaryOpenSnags > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 normal-case font-sans font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {summaryOpenSnags} {language === 'ur' ? 'کھلے نقائص' : 'open snags'}
              </span>
            )}
          </h2>
          <button
            onClick={() => goTo('overview')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <span>{language === 'ur' ? 'مکمل ایگزیکٹو رپورٹ دیکھیں' : 'View Full Executive Overview'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projects */}
          <button
            onClick={() => goTo('projects')}
            className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {summaryProjects.length} {language === 'ur' ? 'سائٹس' : 'Sites'}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {formatCurrency(summaryBudget, language)}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {language === 'ur' ? 'کل بجٹ — پروجیکٹس' : 'Total Budget — Projects'}
            </p>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              {summaryProjects.filter(p => p.status === 'in_progress').length} {language === 'ur' ? 'جاری' : 'In Progress'} · {summaryProjects.filter(p => p.status === 'completed').length} {language === 'ur' ? 'مکمل' : 'Completed'}
            </p>
          </button>

          {/* Budget / Accounts */}
          <button
            onClick={() => goTo('accounts')}
            className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                {summaryUtilization}% {language === 'ur' ? 'خرچ' : 'Spent'}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {formatCurrency(summarySpent, language)}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {language === 'ur' ? 'اب تک کا خرچ' : 'Spent So Far'}
            </p>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, summaryUtilization)}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {language === 'ur' ? 'بقایا:' : 'Balance:'} {formatCurrency(Math.max(0, summaryBudget - summarySpent), language)}
              </p>
            </div>
          </button>

          {/* Tasks / Progress */}
          <button
            onClick={() => goTo('tasks')}
            className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Kanban className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                {summaryTaskPct}% {language === 'ur' ? 'مکمل' : 'Complete'}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {summaryDone} / {summaryTasks.length}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {language === 'ur' ? 'ٹاسکس مکمل' : 'Tasks Completed'}
            </p>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${summaryTaskPct}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {summaryActive} {language === 'ur' ? 'فعال' : 'Active'} / {summaryDelayed} {language === 'ur' ? 'تاخیر' : 'Delayed'}
              </p>
            </div>
          </button>

          {/* Manpower */}
          <button
            onClick={() => goTo('manpower', undefined, 'all')}
            className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {summaryWorkers} {language === 'ur' ? 'موجود' : 'Present'}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {formatCurrency(summaryWages, language)}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {language === 'ur' ? 'یومیہ اجرت (تخمینہ)' : 'Est. Daily Wages'}
            </p>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              {language === 'ur' ? 'افرادی قوت — حاضری و تنخواہ' : 'Manpower — attendance & salary'}
            </p>
          </button>
        </div>
      </div>

      {/* Main Groups Section */}
      <div>
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'ur' ? 'اہم گروپس — کھولنے کے لیے کلک کریں:' : 'Main Groups — Click to Open:'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.key}
                className="group text-left relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 hover:border-blue-300"
              >
                {/* Top Row: Icon + Badge */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${group.iconTile} flex items-center justify-center transition-all shadow-sm group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                      {language === 'ur' ? group.badgeUr : group.badgeEn}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {language === 'ur' ? group.titleUr : group.titleEn}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {language === 'ur' ? group.subtitleUr : group.subtitleEn}
                  </p>

                  {/* Sub-items: tap one to open that exact section */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={`${item.id}-${item.labelEn}`}
                          onClick={() => goTo(item.id, item.taxSection, item.manpowerSection)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition cursor-pointer"
                        >
                          <ItemIcon className="w-3.5 h-3.5" />
                          <span>{language === 'ur' ? item.labelUr : item.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Row: Open group */}
                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {language === 'ur' ? 'کھولنے کے لیے کلک کریں' : 'Click to Open'}
                  </span>

                  <button
                    onClick={() => goTo(group.defaultTab, group.defaultTaxSection, group.defaultManpowerSection)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <span>{language === 'ur' ? 'اوپن کریں' : 'Open'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center pt-8 border-t border-slate-200 text-xs text-slate-500 font-mono">
        <p>Al Asad Constructors (Pvt) Ltd · Integrated Construction Operations System</p>
        <p className="mt-1 text-slate-400">copyright @ 2026, ShizCon · All Rights Reserved</p>
      </div>
    </div>
  );
};
