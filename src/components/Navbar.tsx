import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations } from '../utils/translations';
import { NotificationCenter } from './NotificationCenter';
import { ActiveTab, TaxSection, ManpowerSection } from '../types';
import {
  Kanban,
  CalendarRange,
  ClipboardList,
  Package,
  AlertCircle,
  Plus,
  Languages,
  Download,
  Upload,
  ShieldCheck,
  LogOut,
  LogIn,
  Sparkles,
  Bell,
  Users,
  Home,
  Briefcase,
  Wallet,
  BarChart3,
  HardHat,
  ChevronDown,
  Scale,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  Banknote,
  Receipt,
  FileText,
  BookOpen
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenSiteAssistant?: () => void;
}

interface GroupSubItem {
  id: ActiveTab;
  labelEn: string;
  labelUr: string;
  icon: LucideIcon;
  taxSection?: TaxSection;
  manpowerSection?: ManpowerSection;
}

interface NavGroup {
  key: string;
  labelEn: string;
  labelUr: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  defaultTab: ActiveTab;
  defaultTaxSection?: TaxSection;
  defaultManpowerSection?: ManpowerSection;
  matchTabs: ActiveTab[];
  items?: GroupSubItem[];
}

// Grouped navigation — 7 main groups instead of 13 separate tabs.
// Every old tab still exists one click inside its group; nothing was deleted.
// GitHub Guide is intentionally NOT in the nav (file kept, link removed).
const NAV_GROUPS: NavGroup[] = [
  {
    key: 'hub',
    labelEn: 'Module Hub',
    labelUr: 'ماڈیول ہب',
    icon: Home,
    defaultTab: 'home',
    matchTabs: ['home']
  },
  {
    key: 'hr',
    labelEn: 'HR',
    labelUr: 'ایچ آر',
    icon: HardHat,
    defaultTab: 'manpower',
    defaultManpowerSection: 'all',
    matchTabs: ['manpower'],
    items: [
      { id: 'manpower', labelEn: 'Attendance', labelUr: 'حاضری', icon: UserCheck, manpowerSection: 'attendance' },
      { id: 'manpower', labelEn: 'Salary', labelUr: 'تنخواہ', icon: Banknote, manpowerSection: 'salary' },
      { id: 'manpower', labelEn: 'Manpower', labelUr: 'افرادی قوت', icon: Users, manpowerSection: 'all' }
    ]
  },
  {
    key: 'accounts',
    labelEn: 'ACCOUNTS',
    labelUr: 'اکاؤنٹس',
    icon: Wallet,
    defaultTab: 'invoices_rfq',
    defaultTaxSection: 'invoices',
    matchTabs: ['invoices_rfq', 'accounts'],
    items: [
      { id: 'invoices_rfq', labelEn: 'Invoice', labelUr: 'انوائس', icon: Receipt, taxSection: 'invoices' },
      { id: 'invoices_rfq', labelEn: 'RFQ', labelUr: 'آر ایف کیو', icon: FileText, taxSection: 'rfqs' },
      { id: 'accounts', labelEn: 'Accounts Ledger', labelUr: 'اکاؤنٹس لیجر', icon: BookOpen }
    ]
  },
  {
    key: 'sitework',
    labelEn: 'Site Work',
    labelUr: 'سائٹ ورک',
    icon: Briefcase,
    defaultTab: 'projects',
    matchTabs: ['projects', 'overview', 'gantt', 'daily_logs', 'tasks', 'snags'],
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
    labelEn: 'Logistics',
    labelUr: 'لوجسٹکس',
    icon: Package,
    defaultTab: 'materials',
    matchTabs: ['materials']
  },
  {
    key: 'fbr',
    labelEn: 'FBR',
    labelUr: 'ایف بی آر',
    icon: Scale,
    defaultTab: 'tax_compliance',
    defaultTaxSection: 'calculator',
    matchTabs: ['tax_compliance']
  },
  {
    key: 'users',
    labelEn: 'User Management',
    labelUr: 'صارفین کا انتظام',
    icon: ShieldCheck,
    adminOnly: true,
    defaultTab: 'users',
    matchTabs: ['users']
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTask,
  onOpenNewProject,
  onOpenSiteAssistant
}) => {
  const {
    activeTab,
    setActiveTab,
    taxSection,
    setTaxSection,
    manpowerSection,
    setManpowerSection,
    language,
    setLanguage,
    exportDataJson,
    importDataJson,
    currentUser,
    isAdmin,
    hasPermission,
    setIsLoginModalOpen,
    logout,
    unreadNotificationsCount,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    isOnline,
    pendingSyncCount,
    isSyncing,
    setIsSyncModalOpen
  } = useProject();

  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const t = translations[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importDataJson(text);
          if (success) {
            alert(language === 'ur' ? 'بیک اپ کامیابی سے امپورٹ ہو گیا!' : 'Backup successfully imported!');
          } else {
            alert(language === 'ur' ? 'فائل درست نہیں ہے' : 'Invalid JSON backup file');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const navigate = (
    tab: ActiveTab,
    taxSectionValue?: TaxSection,
    manpowerSectionValue?: ManpowerSection
  ) => {
    if (taxSectionValue) setTaxSection(taxSectionValue);
    if (manpowerSectionValue) setManpowerSection(manpowerSectionValue);
    setActiveTab(tab);
    setOpenGroup(null);
  };

  const isItemActive = (item: GroupSubItem) => {
    if (item.taxSection) return activeTab === item.id && taxSection === item.taxSection;
    if (item.manpowerSection) return activeTab === item.id && manpowerSection === item.manpowerSection;
    return activeTab === item.id;
  };

  const visibleGroups = NAV_GROUPS.filter(group => !group.adminOnly || isAdmin);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar: 3 zones */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 min-h-16">

            {/* Zone 1: Brand Wordmark with Al Asad Constructors Logo */}
            <div className="flex min-w-0 items-center gap-3">
              <a
                href="#home"
                onClick={(e) => { e.preventDefault(); navigate('home'); }}
                className="flex min-w-0 items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-400 transition-colors p-0.5">
                  <img
                    src="logo.jpg"
                    alt="Al Asad Constructors"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex min-w-0 flex-col text-left">
                  <span className="min-w-0 truncate text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-tight whitespace-nowrap">
                    {language === 'ur' ? 'الاسد کنسٹرکٹرز' : 'Al Asad Constructors'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono tracking-wider uppercase leading-none mt-0.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    {language === 'ur' ? 'سول انجینئرنگ پورٹل' : 'Civil Engineering Portal'}
                  </span>
                </div>
              </a>
            </div>

            {/* Zone 2: Grouped Navigation — 7 main groups with dropdowns */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-medium text-slate-600">
              {visibleGroups.map((group) => {
                const isActive = group.matchTabs.includes(activeTab);
                const isOpen = openGroup === group.key;
                const GroupIcon = group.icon;

                if (!group.items) {
                  return (
                    <button
                      key={group.key}
                      onClick={() => navigate(group.defaultTab, group.defaultTaxSection, group.defaultManpowerSection)}
                      className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all py-2 px-3 rounded-xl border cursor-pointer ${
                        isActive
                          ? 'text-white bg-blue-600 border-blue-600 font-bold shadow-md shadow-blue-600/25'
                          : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <GroupIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{language === 'ur' ? group.labelUr : group.labelEn}</span>
                      {group.adminOnly && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase bg-amber-100 text-amber-700 border border-amber-200 tracking-wider">
                          Admin
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <div key={group.key} className="relative">
                    <button
                      onClick={() => setOpenGroup(isOpen ? null : group.key)}
                      className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all py-2 px-3 rounded-xl border cursor-pointer ${
                        isActive
                          ? 'text-white bg-blue-600 border-blue-600 font-bold shadow-md shadow-blue-600/25'
                          : isOpen
                            ? 'text-slate-900 bg-slate-100 border-slate-200'
                            : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <GroupIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{language === 'ur' ? group.labelUr : group.labelEn}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenGroup(null)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 z-50 text-sm animate-fadeIn">
                          {group.items.map(item => {
                            const active = isItemActive(item);
                            return (
                              <button
                                key={`${item.id}-${item.labelEn}`}
                                onClick={() => navigate(item.id, item.taxSection, item.manpowerSection)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${
                                  active
                                    ? 'bg-blue-50 text-blue-700 font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <item.icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span>{language === 'ur' ? item.labelUr : item.labelEn}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Zone 3: Actions (Notifications, Site AI, Role Switcher, Language, Primary CTA) */}
            <div className="ml-auto flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Offline Access & Cloud Sync Center Indicator */}
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition cursor-pointer ${
                  !isOnline
                    ? 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse'
                    : pendingSyncCount > 0
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title={language === 'ur' ? 'آف لائن کیشے و سنک سینٹر' : 'Offline Access & Sync Center'}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                ) : !isOnline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
                <span className="hidden md:inline">
                  {isSyncing ? 'Syncing...' : !isOnline ? 'Offline' : 'Online'}
                </span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {pendingSyncCount}
                  </span>
                )}
              </button>

              {/* In-App Notification Center Bell */}
              <button
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title={language === 'ur' ? 'نوٹیفیکیشن و الرٹس' : 'Deadlines & Snag Alerts'}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Site AI Assistant Launcher */}
              <button
                onClick={onOpenSiteAssistant}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-all cursor-pointer whitespace-nowrap"
                title="Open Gemini AI Site Intelligence with Maps Grounding"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">AI Site Intelligence</span>
                <span className="md:hidden">AI</span>
              </button>

              {/* Language Switch */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                title="Toggle Urdu / English"
              >
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'en' ? 'اردو' : 'EN'}</span>
              </button>

              {/* Hidden File Input for Import */}
              <input
                type="file"
                accept=".json"
                className="hidden"
                ref={el => setFileInputRef(el)}
                onChange={handleFileUpload}
              />

              {/* Backup Export / Import */}
              <button
                onClick={exportDataJson}
                className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                title="Download JSON data file for backup"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Backup</span>
              </button>

              <button
                onClick={() => fileInputRef?.click()}
                className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                title="Restore data from JSON file"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Restore</span>
              </button>

              {/* User Profile & Role Display (User Switcher restricted to Admin) */}
              {currentUser ? (
                <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 pr-1.5">
                  {isAdmin ? (
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer px-1 py-0.5"
                      title={language === 'ur' ? 'یوزر و رول پینل (صرف ایڈمن)' : 'User & Role Switcher (Admin Only)'}
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                        A
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-[11px] font-bold text-slate-900 truncate max-w-[90px] leading-tight">
                          {language === 'ur' && currentUser.nameUrdu ? currentUser.nameUrdu : currentUser.name}
                        </div>
                        <div className="text-[9px] font-mono tracking-wider font-bold text-blue-600">
                          ADMIN
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-left px-1.5 py-0.5 select-none">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                        U
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-[11px] font-bold text-slate-900 truncate max-w-[90px] leading-tight">
                          {language === 'ur' && currentUser.nameUrdu ? currentUser.nameUrdu : currentUser.name}
                        </div>
                        <div className="text-[9px] font-mono tracking-wider font-bold text-emerald-600">
                          USER
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-200 rounded transition-colors ml-0.5 cursor-pointer"
                    title={t.logout}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-900 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.login}</span>
                </button>
              )}

              {/* Primary Action Button */}
              {hasPermission('canManageTasks') && (
                <button
                  onClick={onOpenNewTask}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-600/30 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">{t.newTask}</span>
                  <span className="sm:hidden">Task</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
};
