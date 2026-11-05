import React from 'react';
import { useProject } from '../context/ProjectContext';
import { ActiveTab } from '../types';
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
  Github, 
  ArrowRight, 
  HardHat, 
  Scale, 
  LogOut,
  Building2,
  Sparkles,
  Layers
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  titleEn: string;
  titleUr: string;
  badgeEn: string;
  badgeUr: string;
  subtitleEn: string;
  subtitleUr: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  isPrimary?: boolean;
  adminOnly?: boolean;
}

export const ModulesPortalView: React.FC = () => {
  const { 
    setActiveTab, 
    language, 
    projects, 
    currentUser,
    logout,
    activeProjectId,
    setActiveProjectId,
    isAdmin
  } = useProject();

  const tabs: TabItem[] = [
    {
      id: 'manpower',
      titleEn: 'Manpower Attendance & Salary',
      titleUr: 'حاضری، افرادی قوت و تنخواہ',
      badgeEn: 'Workforce & Daily Wages',
      badgeUr: 'حاضری مسٹر رول و اجرت',
      subtitleEn: 'Daily site attendance muster roll, labor headcount, overtime hours, and salary & wage slip generation.',
      subtitleUr: 'سائٹ پر مزدوروں و مستریوں کی روزانہ حاضری، اوور ٹائم ٹریکنگ، روزانہ اجرت و تنخواہ کا حساب اور پرچی۔',
      icon: HardHat,
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-500/60 hover:border-amber-400',
      isPrimary: true
    },
    {
      id: 'tax_compliance',
      titleEn: 'Invoices & RFQ (FBR / SRB)',
      titleUr: 'انوائسز اور آر ایف کیو (FBR/SRB)',
      badgeEn: 'Tax Invoices & Tenders',
      badgeUr: 'سیلز ٹیکس انوائسز و ٹینڈر',
      subtitleEn: 'Official tax invoices with FBR 18% GST & SRB 13% SST, Section 153 WHT, and vendor RFQ tendering with quotation comparison.',
      subtitleUr: 'سرکاری و نجی سیلز ٹیکس انوائسز مع 18% FBR جی ایس ٹی اور 13% SRB سروس ٹیکس، ودہولڈنگ ٹیکس اور کوٹیشن موازنہ۔',
      icon: Scale,
      gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
      borderColor: 'border-blue-500/60 hover:border-blue-400',
      isPrimary: true
    },
    {
      id: 'projects',
      titleEn: 'Projects Management',
      titleUr: 'تعمیراتی پروجیکٹس',
      badgeEn: 'Active Job Sites',
      badgeUr: 'فعال تعمیراتی سائٹس',
      subtitleEn: 'Multi-site construction lifecycle management, contract details, client records, and site progression.',
      subtitleUr: 'تمام تعمیراتی سائٹس کی مکمل تفصیلات، فیز کی پیش رفت، کلائنٹ معاہدات اور لوکیشن پر مبنی پروگریس۔',
      icon: Briefcase,
      gradient: 'from-blue-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-blue-500/50'
    },
    {
      id: 'tasks',
      titleEn: 'Tasks & Milestone Board',
      titleUr: 'ٹاسکس و کام کی پیش رفت',
      badgeEn: 'Kanban & Milestones',
      badgeUr: 'کانبان بورڈ و چیک لسٹ',
      subtitleEn: 'Structural, MEP, and finishing work breakdown, sub-contractor trade assignment, and checklist tracking.',
      subtitleUr: 'سول اسٹرکچر، پلمبنگ، الیکٹریکل اور فنشنگ کاموں کی تقسیم، ٹھیکیداروں کی نگرانی اور مرحلہ وار تکمیل۔',
      icon: Kanban,
      gradient: 'from-indigo-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-indigo-500/50'
    },
    {
      id: 'accounts',
      titleEn: 'Accounts & Expense Ledger',
      titleUr: 'اکاؤنٹس و کیش لیجر',
      badgeEn: 'Cash Flow & Vouchers',
      badgeUr: 'مالیات و اخراجات کیش',
      subtitleEn: 'Site financial ledger, vendor disbursements, petty cash vouchers, and bank payment clearances.',
      subtitleUr: 'سائٹ کے تمام یومیہ اخراجات، وینڈر ادائیگیاں، پیٹی کیش واؤچرز اور بینک ریکارڈز کی شفاف تفصیل۔',
      icon: Wallet,
      gradient: 'from-emerald-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-emerald-500/50'
    },
    {
      id: 'daily_logs',
      titleEn: 'Daily Site Log (Roznamcha)',
      titleUr: 'روزنامچہ سائٹ رپورٹ',
      badgeEn: 'Supervisor Field Diary',
      badgeUr: 'سپروائزر یومیہ ڈائری',
      subtitleEn: 'Daily site supervisor logs, weather impact tracking, equipment deployment, and work progress summaries.',
      subtitleUr: 'سائٹ سپروائزر کی روزانہ ڈائری، موسمی اثرات، مشینری کا استعمال اور کوالٹی و حفاظتی مشاہدات۔',
      icon: ClipboardList,
      gradient: 'from-teal-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-teal-500/50'
    },
    {
      id: 'materials',
      titleEn: 'Materials & Stock Inventory',
      titleUr: 'میٹریل و اسٹاک لیجر',
      badgeEn: 'Rebar, Cement & Aggregates',
      badgeUr: 'سریا، سیمنٹ، ریت و بجری',
      subtitleEn: 'Deformed steel bar weight receipts, cement bag usage, aggregate dispatch, and inventory burn tracking.',
      subtitleUr: 'سائٹ پر سریا، سیمنٹ بوریوں، اینٹوں اور ریت بجری کی ترسیل، استعمال اور بقایا اسٹاک کی مانیٹرنگ۔',
      icon: Package,
      gradient: 'from-orange-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-orange-500/50'
    },
    {
      id: 'gantt',
      titleEn: 'Timeline & Gantt Schedule',
      titleUr: 'ٹائم لائن و شیڈول (Gantt)',
      badgeEn: 'Critical Path Planning',
      badgeUr: 'کرٹیکل پاتھ و شیڈول',
      subtitleEn: 'Interactive timeline charts, project phases (Excavation, Foundation, Structure, MEP), and deadline milestones.',
      subtitleUr: 'منصوبہ بندی کے تمام مراحل، ڈیڈلائنز، تاخیر کے الرٹس اور کرٹیکل پاتھ کا بصری جائزہ۔',
      icon: CalendarRange,
      gradient: 'from-purple-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-purple-500/50'
    },
    {
      id: 'snags',
      titleEn: 'Quality Snags & Punchlist',
      titleUr: 'کوالٹی نقائص و پنچ لسٹ',
      badgeEn: 'QA/QC Inspections',
      badgeUr: 'کوالٹی معائنہ و نقائص',
      subtitleEn: 'Site snag identification, architectural and structural defect punchlists, and contractor resolution signoffs.',
      subtitleUr: 'سائٹ پر تعمیراتی نقائص کی نشاندہی، سنگین مسائل کی درجہ بندی اور حل کی تصدیقی منظوری۔',
      icon: AlertCircle,
      gradient: 'from-rose-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-rose-500/50'
    },
    {
      id: 'overview',
      titleEn: 'Executive Overview & PDF Report',
      titleUr: 'ایگزیکٹو ڈیش بورڈ و رپورٹ',
      badgeEn: 'Full Analytics & jsPDF Export',
      badgeUr: 'تجزیاتی رپورٹس و پی ڈی ایف',
      subtitleEn: 'Executive KPI charts, man-hour burndowns, project health metrics, and formal jsPDF report download.',
      subtitleUr: 'اعلیٰ انتظامیہ کے لیے مکمل مالی و تعمیراتی چارٹس، مٹیریل استعمال کی سمری اور ون کلک پی ڈی ایف رپورٹ۔',
      icon: BarChart3,
      gradient: 'from-cyan-500/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-cyan-500/50'
    },
    {
      id: 'users',
      titleEn: 'User Management & Security',
      titleUr: 'صارفین، رولز و سیکیورٹی',
      badgeEn: 'Role-Based Access Control',
      badgeUr: 'صارفین کی رسائی و اختیارات',
      subtitleEn: 'Manage resident engineers, project managers, accountants, and site supervisors with strict role permissions.',
      subtitleUr: 'پروجیکٹ مینیجرز، انجینئرز اور اکاؤنٹنٹس کے لاگ ان اکاؤنٹس، اختیارات اور حفاظتی سیٹنگز کا انتظام۔',
      icon: ShieldCheck,
      gradient: 'from-blue-600/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-blue-500/50',
      adminOnly: true
    },
    {
      id: 'github_guide',
      titleEn: 'GitHub & Deployment Guide',
      titleUr: 'گٹ ہب اور ڈیپلائمنٹ گائیڈ',
      badgeEn: 'Architecture & DevOps',
      badgeUr: 'آرکیٹیکچر و ہدایات',
      subtitleEn: 'Complete documentation for cloning, running locally, configuring environment variables, and deployment.',
      subtitleUr: 'سسٹم کو گٹ ہب سے کلون کرنے، لوکل سرور چلانے اور کلاؤڈ پر ڈیپلائی کرنے کی مرحلہ وار گائیڈ۔',
      icon: Github,
      gradient: 'from-slate-700/15 to-transparent',
      borderColor: 'border-slate-800 hover:border-slate-600',
      adminOnly: true
    }
  ];

  // Only show admin tabs (users, github_guide) to admin users
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner: Login Successful & Tabs Instructions */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border border-blue-900/40 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {language === 'ur' ? 'مرکزی ٹیبس ڈیش بورڈ' : 'System Navigation Tabs'}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-medium">
                {language === 'ur' ? `خوش آمدید: ${currentUser?.name || 'صارف'}` : `Welcome: ${currentUser?.name || 'User'}`}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-blue-300 border border-slate-700">
                {currentUser?.role || 'authorized'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'ur' 
                ? 'الاسد کنسٹرکٹرز — سسٹم ٹیبس' 
                : 'Al Asad Constructors — System Tabs Portal'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ur'
                ? 'کام شروع کرنے کے لیے نیچے دیے گئے کسی بھی ٹیب پر کلک کریں، وہ ٹیب فوری اوپن ہو جائے گا:'
                : 'Login successful. Click on any tab below to open that module directly:'}
            </p>
          </div>

          {/* Quick Site Filter & Direct Logout */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-slate-900/90 border border-blue-800/50 text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer font-medium shadow-inner"
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
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
              title={language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Quick Horizontal Tab Bar: Click any tab pill to open immediately */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    tab.isPrimary 
                      ? 'bg-blue-600/30 hover:bg-blue-600 text-white border-blue-500/60 shadow-md' 
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.isPrimary ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span>{language === 'ur' ? tab.titleUr : tab.titleEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Highlighted Tabs Section: Manpower Attendance & Salary + Invoices & RFQ */}
      <div>
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'ur' ? 'اہم بنیادی ٹیبس (Core Requested Tabs):' : 'Core Focus Tabs — Click to Open:'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tabs.filter(t => t.isPrimary).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group text-left relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border ${tab.borderColor} p-6 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/40 cursor-pointer w-full`}
              >
                {/* Top Row: Icon + Badge */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800">
                      {language === 'ur' ? tab.badgeUr : tab.badgeEn}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {language === 'ur' ? tab.titleUr : tab.titleEn}
                  </h3>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {language === 'ur' ? tab.subtitleUr : tab.subtitleEn}
                  </p>
                </div>

                {/* Bottom Row: Direct Click Indicator */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    {language === 'ur' ? 'کھولنے کے لیے کلک کریں' : 'Click to Open Tab'}
                  </span>

                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all">
                    <span>{language === 'ur' ? 'اوپن کریں' : 'Open Tab'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* All Other System Tabs Section */}
      <div>
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'ur' ? 'دیگر تمام سسٹم ٹیبس (All Other System Tabs):' : 'All System Tabs — Click to Open:'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleTabs.filter(t => !t.isPrimary).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group text-left relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border ${tab.borderColor} p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/50 cursor-pointer w-full`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 truncate max-w-[140px]">
                      {language === 'ur' ? tab.badgeUr : tab.badgeEn}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {language === 'ur' ? tab.titleUr : tab.titleEn}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {language === 'ur' ? tab.subtitleUr : tab.subtitleEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {language === 'ur' ? 'کھولیں' : 'Open'}
                  </span>
                  <div className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 font-semibold text-xs">
                    <span>{language === 'ur' ? 'کلک کریں' : 'Click'}</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center pt-8 border-t border-slate-900 text-xs text-slate-500 font-mono">
        <p>Al Asad Constructors (Pvt) Ltd · Integrated Construction Operations System</p>
        <p className="mt-1 text-slate-600">copyright @ 2026, ShizCon · All Rights Reserved</p>
      </div>
    </div>
  );
};
