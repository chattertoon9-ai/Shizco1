import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations } from '../utils/translations';
import { NotificationCenter } from './NotificationCenter';
import { 
  Building2, 
  Kanban, 
  CalendarRange, 
  ClipboardList, 
  Package, 
  AlertCircle, 
  Github, 
  Plus, 
  Languages, 
  Download, 
  Upload, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn,
  Sparkles,
  MapPin,
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
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenSiteAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNewTask, 
  onOpenNewProject,
  onOpenSiteAssistant 
}) => {
  const { 
    activeTab, 
    setActiveTab, 
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
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

  // Primary Navigation items (Modules Hub, Attendance & Salary, Invoices & RFQ, Projects, Tasks, Accounts)
  const primaryNavItems = [
    { 
      id: 'home' as const, 
      label: language === 'ur' ? 'تمام ٹیبس' : 'Modules Hub', 
      icon: Home, 
      matchTabs: ['home'], 
      adminOnly: false 
    },
    { 
      id: 'manpower' as const, 
      label: language === 'ur' ? 'حاضری و تنخواہ' : 'Attendance & Salary', 
      icon: HardHat, 
      matchTabs: ['manpower'], 
      adminOnly: false 
    },
    { 
      id: 'tax_compliance' as const, 
      label: language === 'ur' ? 'انوائسز و آر ایف کیو' : 'Invoices & RFQ', 
      icon: Scale, 
      matchTabs: ['tax_compliance', 'invoices_rfq'], 
      adminOnly: false 
    },
    { 
      id: 'projects' as const, 
      label: language === 'ur' ? 'پروجیکٹس' : 'Projects', 
      icon: Briefcase, 
      matchTabs: ['projects'], 
      adminOnly: false 
    },
    { 
      id: 'tasks' as const, 
      label: language === 'ur' ? 'ٹاسکس' : 'Tasks', 
      icon: Kanban, 
      matchTabs: ['tasks'], 
      adminOnly: false 
    },
    { 
      id: 'accounts' as const, 
      label: language === 'ur' ? 'اکاؤنٹس' : 'Accounts', 
      icon: Wallet, 
      matchTabs: ['accounts'], 
      adminOnly: false 
    }
  ];

  const secondaryNavItems = [
    { 
      id: 'overview' as const, 
      label: language === 'ur' ? 'ایگزیکٹو رپورٹ' : 'Executive Overview', 
      icon: BarChart3,
      adminOnly: false
    },
    { id: 'gantt' as const, label: t.timeline, icon: CalendarRange, adminOnly: false },
    { id: 'daily_logs' as const, label: t.dailyLog, icon: ClipboardList, adminOnly: false },
    { id: 'materials' as const, label: t.materialsBudget, icon: Package, adminOnly: false },
    { id: 'snags' as const, label: t.snags, icon: AlertCircle, adminOnly: false },
    { id: 'users' as const, label: t.users, icon: Users, adminOnly: true },
    { id: 'github_guide' as const, label: t.githubGuide, icon: Github, adminOnly: true },
  ];

  // Secondary items filtered by admin privileges
  const filteredSecondaryNavItems = secondaryNavItems.filter(item => !item.adminOnly || isAdmin);

  // Combined deduplicated nav items list for safe rendering (excluding admin tabs for regular users)
  const allUniqueNavItems = Array.from(
    new Map([...primaryNavItems, ...secondaryNavItems].map(item => [item.id, item])).values()
  ).filter(item => !item.adminOnly || isAdmin);

  const isSecondaryActive = filteredSecondaryNavItems.some(item => item.id === activeTab);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-blue-900/30 text-slate-100 shadow-md shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar: 3 zones */}
          <div className="flex items-center justify-between gap-4 lg:gap-6 h-16">
            
            {/* Zone 1: Brand Wordmark with Al Asad Constructors Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <a 
                href="#home" 
                onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-700/40 bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/30 group-hover:border-blue-400 transition-colors p-0.5">
                  <img 
                    src="/logo.jpg" 
                    alt="Al Asad Constructors" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors leading-tight whitespace-nowrap">
                    {language === 'ur' ? 'الاسد کنسٹرکٹرز' : 'Al Asad Constructors'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase leading-none mt-0.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                    {language === 'ur' ? 'سول انجینئرنگ پورٹل' : 'Civil Engineering Portal'}
                  </span>
                </div>
              </a>
            </div>

            {/* Zone 2: Primary Navigation Tabs (Home, Project, Task, Manpower, Accounts) + More Dropdown */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium text-slate-400">
              {primaryNavItems.map((item) => {
                const isActive = (item.matchTabs as readonly string[]).includes(activeTab);
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all py-1.5 px-2.5 rounded-lg border cursor-pointer ${
                      isActive 
                        ? 'text-white bg-blue-600/20 border-blue-500/50 font-bold shadow-sm shadow-blue-900/20' 
                        : 'border-transparent hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.adminOnly && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}

              {/* More / Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={`flex items-center gap-1 whitespace-nowrap shrink-0 transition-all py-1.5 px-2.5 rounded-lg border cursor-pointer text-xs ${
                    isSecondaryActive 
                      ? 'text-emerald-300 bg-emerald-950/40 border-emerald-600/40 font-semibold' 
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{language === 'ur' ? 'مزید ٹولز' : 'More'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isMoreMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-fadeIn">
                      {filteredSecondaryNavItems.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMoreMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                              isActive 
                                ? 'bg-blue-600/20 text-blue-400 font-semibold' 
                                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <item.icon className="w-4 h-4 text-slate-400" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Zone 3: Actions (Notifications, Site AI, Role Switcher, Language, Primary CTA) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Offline Access & Cloud Sync Center Indicator */}
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition cursor-pointer ${
                  !isOnline
                    ? 'bg-amber-950/70 border-amber-600/70 text-amber-300 animate-pulse'
                    : pendingSyncCount > 0
                    ? 'bg-blue-950/70 border-blue-600/70 text-blue-300'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
                title={language === 'ur' ? 'آف لائن کیشے و سنک سینٹر' : 'Offline Access & Sync Center'}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                ) : !isOnline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
                <span className="hidden md:inline">
                  {isSyncing ? 'Syncing...' : !isOnline ? 'Offline' : 'Online'}
                </span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {pendingSyncCount}
                  </span>
                )}
              </button>

              {/* In-App Notification Center Bell */}
              <button
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
                title={language === 'ur' ? 'نوٹیفیکیشن و الرٹس' : 'Deadlines & Snag Alerts'}
              >
                <Bell className="w-4 h-4 text-slate-300 hover:text-white" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950 animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Site AI Assistant Launcher */}
              <button
                onClick={onOpenSiteAssistant}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 rounded-lg border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                title="Open Gemini AI Site Intelligence with Maps Grounding"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">AI Site Intelligence</span>
                <span className="md:hidden">AI</span>
              </button>

              {/* Language Switch */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer"
                title="Toggle Urdu / English"
              >
                <Languages className="w-3.5 h-3.5 text-blue-400" />
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
                className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer"
                title="Download JSON data file for backup"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Backup</span>
              </button>

              <button
                onClick={() => fileInputRef?.click()}
                className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer"
                title="Restore data from JSON file"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Restore</span>
              </button>

              {/* User Profile & Role Display (User Switcher restricted to Admin) */}
              {currentUser ? (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-1.5">
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
                        <div className="text-[11px] font-bold text-white truncate max-w-[90px] leading-tight">
                          {language === 'ur' && currentUser.nameUrdu ? currentUser.nameUrdu : currentUser.name}
                        </div>
                        <div className="text-[9px] font-mono tracking-wider font-bold text-blue-400">
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
                        <div className="text-[11px] font-bold text-white truncate max-w-[90px] leading-tight">
                          {language === 'ur' && currentUser.nameUrdu ? currentUser.nameUrdu : currentUser.name}
                        </div>
                        <div className="text-[9px] font-mono tracking-wider font-bold text-emerald-400">
                          USER
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors ml-0.5 cursor-pointer"
                    title={t.logout}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
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

          {/* Mobile secondary tab strip */}
          <div className="flex lg:hidden overflow-x-auto gap-2 py-2 border-t border-slate-800/80 text-xs text-slate-400 no-scrollbar">
            {allUniqueNavItems.map((item: any) => {
              const isActive = item.matchTabs 
                ? item.matchTabs.includes(activeTab) 
                : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 whitespace-nowrap py-1 px-2.5 rounded-lg font-medium cursor-pointer ${
                    isActive ? 'text-white bg-blue-600/30 border border-blue-500/50 font-bold' : 'hover:text-slate-200 bg-slate-900/60'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            {currentUser && (
              <button
                onClick={logout}
                className="flex items-center gap-1 whitespace-nowrap py-1 px-2.5 rounded-lg font-medium text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.logout}</span>
              </button>
            )}
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
