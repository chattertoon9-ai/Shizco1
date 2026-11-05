import { Language, ProjectPhase, ProjectStatus, TaskPriority, TaskStatus, WeatherCondition } from '../types';

export const translations = {
  en: {
    appTitle: 'Al Asad Constructors',
    appSubtitle: 'Civil Engineering & Construction Operations Platform',
    home: 'Home',
    project: 'Project',
    task: 'Task',
    manpower: 'Manpower',
    accounts: 'Accounts',
    summary: 'Summary & Overview',
    graphs: 'Graphs & Analytics',
    projects: 'Projects',
    tasks: 'Tasks & Kanban',
    timeline: 'Schedule & Gantt',
    dailyLog: 'Daily Site Log (Roznamcha)',
    materialsBudget: 'Materials & Budget',
    snags: 'Snag & Punch List',
    users: 'Users & Access',
    githubGuide: 'GitHub & Deploy',
    notifications: 'Notifications & Alerts',
    deadlines: 'Project Deadlines',
    pendingSnags: 'Pending Snag Resolutions',
    createSubUser: '+ Create Sub-User',
    manageRights: 'Manage Rights & Passwords',
    
    // Actions
    newProject: '+ New Project',
    newTask: '+ New Task',
    newDailyLog: '+ Log Site Report',
    newMaterial: '+ Add Material Entry',
    newSnag: '+ Record Snag',
    exportData: 'Export Data (JSON)',
    importData: 'Import Backup',
    exportPdf: 'Print / Export Report',
    filterAll: 'All',
    searchPlaceholder: 'Search tasks, contractors, site locations...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    status: 'Status',
    priority: 'Priority',
    contractor: 'Contractor / Subcontractor',
    crewSize: 'Crew Size (Labour)',
    progress: 'Progress',
    dates: 'Timeline Dates',
    cost: 'Cost / Budget',
    notes: 'Site Notes & Specs',
    checklist: 'Quality Checklist',
    addChecklistItem: 'Add checklist step',

    // Auth & Roles
    login: 'Sign In',
    logout: 'Sign Out',
    adminRole: 'Administrator',
    userRole: 'Site Engineer / User',
    switchRole: 'Switch Role',
    adminOnly: 'Admin Access Required',
    adminOnlyDesc: 'Only Administrators have permission to modify or delete project records.',
    loginToContinue: 'Sign In to Al Asad Constructors',
    adminBadge: 'ADMIN',
    userBadge: 'USER',
    quickSwitch: 'Quick Switch Demo Account',

    // Stats
    activeProjects: 'Active Projects',
    completedTasks: 'Completed Tasks',
    overallProgress: 'Overall Schedule Progress',
    totalBudget: 'Total Allocated Budget',
    totalSpent: 'Actual Expenditure to Date',
    budgetVariance: 'Budget Health',
    underBudget: 'Under Budget',
    overBudget: 'Over Budget',
    workersOnSiteToday: 'Workforce On-Site Today',
    openSnags: 'Open Snags / Snagging',

    // Kanban Columns
    colBacklog: 'Backlog / Scheduled',
    colInProgress: 'Active Construction',
    colInspection: 'Quality Inspection',
    colCompleted: 'Completed & Signed Off',
    colDelayed: 'Delayed / Blocked',

    // Phases
    phase_excavation: 'Excavation & Earthwork',
    phase_foundation: 'Substructure & Foundation',
    phase_structure: 'RCC Frame & Structural Slabs',
    phase_masonry: 'Block & Brick Masonry',
    phase_mep: 'MEP (Plumbing, Electrical, HVAC)',
    phase_finishing: 'Finishes, Plaster & Flooring',
    phase_handover: 'Final Snagging & Handover',

    // Statuses
    status_planned: 'Planned',
    status_in_progress: 'In Progress',
    status_on_hold: 'On Hold',
    status_completed: 'Completed',

    // Task Status
    task_backlog: 'Scheduled',
    task_in_progress: 'In Progress',
    task_inspection: 'Inspection Required',
    task_completed: 'Completed',
    task_delayed: 'Delayed',

    // Priority
    priority_critical: 'Critical Path',
    priority_high: 'High Priority',
    priority_medium: 'Medium',
    priority_low: 'Low',

    // Weather
    weather_sunny: 'Clear / Sunny',
    weather_cloudy: 'Partly Cloudy',
    weather_rainy: 'Rain (Concrete Pours Halted)',
    weather_extreme_heat: 'High Heat (Night Curing)',
    weather_dust_storm: 'Dust Storm',

    // Currency
    currencyLabel: 'PKR',
  },
  ur: {
    appTitle: 'الاسد کنسٹرکٹرز',
    appSubtitle: 'تعمیراتی منصوبوں اور سول ورکس کی مکمل نگرانی',
    home: 'ہوم (Home)',
    project: 'منصوبہ (Project)',
    task: 'کام (Task)',
    manpower: 'افرادی قوت (Manpower)',
    accounts: 'اکاؤنٹس (Accounts)',
    summary: 'خلاصہ و سمری',
    graphs: 'گرافس و تجزیہ',
    projects: 'منصوبے (Projects)',
    tasks: 'کام اور کانبان (Tasks)',
    timeline: 'ٹائم لائن و گانٹ چارٹ',
    dailyLog: 'روزنامچہ و سائٹ رپورٹ',
    materialsBudget: 'سامان و اخراجات',
    snags: 'نقص و معائنہ (Punch List)',
    users: 'یوزرز و اختیارات',
    githubGuide: 'گٹ ہب اور ڈپلائے',
    notifications: 'الرٹس و نوٹیفیکیشنز',
    deadlines: 'پروجیکٹ ڈیڈلائنز',
    pendingSnags: 'زیر التواء نقائص',
    createSubUser: '+ نیا سب یوزر بنائیں',
    manageRights: 'اختیارات اور پاس ورڈز کا انتظام',
    
    // Actions
    newProject: '+ نیا منصوبہ',
    newTask: '+ نیا کام شامل کریں',
    newDailyLog: '+ روزنامچہ درج کریں',
    newMaterial: '+ سامان کی انٹری',
    newSnag: '+ خرابی/نقص درج کریں',
    exportData: 'ڈیٹا ایکسپورٹ (JSON)',
    importData: 'بیک اپ امپورٹ',
    exportPdf: 'رپورٹ پرنٹ کریں',
    filterAll: 'تمام',
    searchPlaceholder: 'کام، ٹھیکیدار یا سائٹ تلاش کریں...',
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    delete: 'حذف کریں',
    edit: 'ترمیم',
    status: 'حیثیت',
    priority: 'ترجیح',
    contractor: 'ٹھیکیدار / سب کنٹریکٹر',
    crewSize: 'مزدوروں کی تعداد',
    progress: 'پیش رفت',
    dates: 'تاریخیں',
    cost: 'لاگت و تخمینہ',
    notes: 'سائٹ نوٹس و ہدایات',
    checklist: 'کوالٹی چیک لسٹ',
    addChecklistItem: 'چیک لسٹ کا نکتہ شامل کریں',

    // Auth & Roles
    login: 'لاگ ان کریں',
    logout: 'لاگ آؤٹ',
    adminRole: 'ایڈمنسٹریٹر (Admin)',
    userRole: 'سائٹ انجینئر / یوزر',
    switchRole: 'رول تبدیل کریں',
    adminOnly: 'صرف ایڈمن کی اجازت ہے',
    adminOnlyDesc: 'منصوبہ جات میں ترمیم یا حذف کرنے کی اجازت صرف ایڈمن کو ہے۔',
    loginToContinue: 'الاسد کنسٹرکٹرز سسٹم میں لاگ ان کریں',
    adminBadge: 'ایڈمن',
    userBadge: 'یوزر',
    quickSwitch: 'ڈیمو اکاؤنٹ تبدیل کریں',

    // Stats
    activeProjects: 'جاری منصوبے',
    completedTasks: 'مکمل شدہ کام',
    overallProgress: 'مجموعی پیش رفت',
    totalBudget: 'کل منظور شدہ بجٹ',
    totalSpent: 'اب تک کے اخراجات',
    budgetVariance: 'بجٹ کی صورتحال',
    underBudget: 'بجٹ کے اندر',
    overBudget: 'بجٹ سے تجاوز',
    workersOnSiteToday: 'آج سائٹ پر مزدور',
    openSnags: 'غیر حل شدہ نقائص',

    // Kanban Columns
    colBacklog: 'شیڈول شدہ (Backlog)',
    colInProgress: 'جاری کام (In Progress)',
    colInspection: 'معائنہ و چیکنگ (Inspection)',
    colCompleted: 'مکمل شدہ (Completed)',
    colDelayed: 'تاخیر کا شکار (Delayed)',

    // Phases
    phase_excavation: 'کھدائی اور زمینی کام',
    phase_foundation: 'بنیاد اور فوٹنگ (Foundation)',
    phase_structure: 'ڈھانچہ، سریا اور لینٹر (RCC Structure)',
    phase_masonry: 'اینٹوں اور بلاکس کی چنائی',
    phase_mep: 'بجلی، پلمبنگ اور سینیٹری',
    phase_finishing: 'پلستر، ٹائلز، پینٹ اور فنشنگ',
    phase_handover: 'حتمی معائنہ اور سپردگی',

    // Statuses
    status_planned: 'منصوبہ بندی',
    status_in_progress: 'جاری ہے',
    status_on_hold: 'روکا ہوا ہے',
    status_completed: 'مکمل ہو چکا',

    // Task Status
    task_backlog: 'منظور شدہ',
    task_in_progress: 'کام جاری ہے',
    task_inspection: 'کوالٹی چیکنگ درکار',
    task_completed: 'کامیابی سے مکمل',
    task_delayed: 'تاخیر',

    // Priority
    priority_critical: 'انتہائی اہم (Critical)',
    priority_high: 'اعلیٰ ترجیح',
    priority_medium: 'درمیانی ترجیح',
    priority_low: 'عام ترجیح',

    // Weather
    weather_sunny: 'صاف دھوپ',
    weather_cloudy: 'مطلع ابر آلود',
    weather_rainy: 'بارش (کنکریٹ کا کام بند)',
    weather_extreme_heat: 'شدید گرمی (رات کو ترائی)',
    weather_dust_storm: 'آندھی / گرد آلود',

    // Currency
    currencyLabel: 'روپے',
  }
};

export const formatCurrency = (amount: number, lang: Language = 'en'): string => {
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0
  }).format(amount);
  
  return lang === 'ur' ? `PKR ${formatted}` : `PKR ${formatted}`;
};

export const getPhaseName = (phase: ProjectPhase, lang: Language = 'en'): string => {
  const key = `phase_${phase}` as keyof typeof translations['en'];
  return translations[lang][key] || phase;
};

export const getTaskStatusName = (status: TaskStatus, lang: Language = 'en'): string => {
  const key = `task_${status}` as keyof typeof translations['en'];
  return translations[lang][key] || status;
};

export const getPriorityName = (priority: TaskPriority, lang: Language = 'en'): string => {
  const key = `priority_${priority}` as keyof typeof translations['en'];
  return translations[lang][key] || priority;
};
