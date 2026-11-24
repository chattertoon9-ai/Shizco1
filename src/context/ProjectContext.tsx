import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Project, 
  ConstructionTask, 
  DailySiteLog, 
  MaterialLedgerItem, 
  SnagItem, 
  ActiveTab, 
  Language, 
  TaskStatus, 
  ProjectPhase, 
  TaskPriority,
  AuthUser,
  UserRole,
  UserPermissions,
  NotificationItem,
  NotificationType,
  NotificationSeverity,
  LaborEntry,
  AccountTransaction,
  TaxInvoice,
  RFQDocument,
  PendingSyncItem,
  OfflineSyncActionType,
  TaxSection,
  ManpowerSection
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_DAILY_LOGS, 
  INITIAL_MATERIALS, 
  INITIAL_SNAGS,
  INITIAL_LABOR,
  INITIAL_ACCOUNTS,
  INITIAL_TAX_INVOICES,
  INITIAL_RFQS
} from '../data/initialData';

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  canCreateProjects: true,
  canDeleteProjects: true,
  canEditBudgets: true,
  canManageTasks: true,
  canAddDailyLogs: true,
  canManageMaterials: true,
  canResolveSnags: true,
  canManageUsers: true,
  canManageManpower: true,
  canManageAccounts: true,
  canManageTax: true,
};

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  canCreateProjects: false,
  canDeleteProjects: false,
  canEditBudgets: false,
  canManageTasks: true,
  canAddDailyLogs: true,
  canManageMaterials: true,
  canResolveSnags: true,
  canManageUsers: false,
  canManageManpower: true,
  canManageAccounts: false,
  canManageTax: false,
};

// Demo account: the lowest possible rights — explore the dashboard, but no
// admin/Owner rights, no User Management, no user create/delete, no budgets,
// no accounts, no tax. Used for the public demo on the SHIZCON hub.
export const DEMO_PERMISSIONS: UserPermissions = {
  canCreateProjects: false,
  canDeleteProjects: false,
  canEditBudgets: false,
  canManageTasks: true,
  canAddDailyLogs: true,
  canManageMaterials: true,
  canResolveSnags: true,
  canManageUsers: false,
  canManageManpower: false,
  canManageAccounts: false,
  canManageTax: false,
};

export const DEMO_USER_ID = 'user-demo';
export const DEMO_USER_EMAIL = 'demo@alasadconstructors.com';
export const DEMO_USER_PASSWORD = 'Demo@1234';

export const INITIAL_USERS: AuthUser[] = [
  {
    id: 'user-admin',
    name: 'Al Asad Constructors',
    nameUrdu: 'الاسد کنسٹرکٹرز',
    email: 'info@alasadconstructors.com',
    password: 'Asad@3456',
    role: 'admin',
    designation: 'Owner',
    avatarColor: 'bg-gradient-to-tr from-blue-700 to-indigo-600',
    assignedProjectId: 'all',
    permissions: DEFAULT_ADMIN_PERMISSIONS,
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'user-engineer',
    name: 'Sub-Engr. Bilal Aslam',
    nameUrdu: 'سب انجینئر بلال اسلم',
    email: 'engineer@alasad.com',
    password: 'user123',
    role: 'user',
    designation: 'Site Operations Engineer',
    avatarColor: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
    assignedProjectId: 'all',
    permissions: DEFAULT_USER_PERMISSIONS,
    isActive: true,
    createdAt: '2025-01-15'
  },
  {
    id: 'user-qa',
    name: 'Hammad Raza',
    nameUrdu: 'حماد رضا',
    email: 'qa@alasad.com',
    password: 'qa123',
    role: 'user',
    designation: 'QA / QC & Snag Inspector',
    avatarColor: 'bg-gradient-to-tr from-amber-600 to-orange-500',
    assignedProjectId: 'all',
    permissions: {
      ...DEFAULT_USER_PERMISSIONS,
      canManageMaterials: false,
      canResolveSnags: true,
    },
    isActive: true,
    createdAt: '2025-02-01'
  },
  {
    id: DEMO_USER_ID,
    name: 'Demo User',
    nameUrdu: 'ڈیمو صارف',
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
    role: 'user',
    designation: 'Demo Account — Explore Only',
    avatarColor: 'bg-gradient-to-tr from-sky-600 to-cyan-500',
    assignedProjectId: 'all',
    permissions: DEMO_PERMISSIONS,
    isActive: true,
    createdAt: '2026-11-24'
  }
];

export const DEMO_USERS = INITIAL_USERS;

interface StorageState {
  projects: Project[];
  tasks: ConstructionTask[];
  dailyLogs: DailySiteLog[];
  materials: MaterialLedgerItem[];
  snags: SnagItem[];
  labor?: LaborEntry[];
  accounts?: AccountTransaction[];
  taxInvoices?: TaxInvoice[];
  rfqs?: RFQDocument[];
  language: Language;
  currentUser?: AuthUser | null;
  users?: AuthUser[];
  readNotificationIds?: string[];
  dismissedNotificationIds?: string[];
  customNotifications?: NotificationItem[];
  pendingSyncQueue?: PendingSyncItem[];
}

interface ProjectContextType {
  projects: Project[];
  tasks: ConstructionTask[];
  dailyLogs: DailySiteLog[];
  materials: MaterialLedgerItem[];
  snags: SnagItem[];
  labor: LaborEntry[];
  accounts: AccountTransaction[];
  taxInvoices: TaxInvoice[];
  rfqs: RFQDocument[];
  activeProjectId: string;
  activeProject: Project | undefined;
  activeTab: ActiveTab;
  taxSection: TaxSection;
  manpowerSection: ManpowerSection;
  language: Language;
  searchQuery: string;
  phaseFilter: string;
  priorityFilter: string;
  statusFilter: string;
  
  // Setters
  setActiveProjectId: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setTaxSection: (section: TaxSection) => void;
  setManpowerSection: (section: ManpowerSection) => void;
  setLanguage: (lang: Language) => void;
  setSearchQuery: (query: string) => void;
  setPhaseFilter: (phase: string) => void;
  setPriorityFilter: (priority: string) => void;
  setStatusFilter: (status: string) => void;
  resetFilters: () => void;

  // Actions
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addTask: (task: Omit<ConstructionTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<ConstructionTask>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;

  addDailyLog: (log: Omit<DailySiteLog, 'id'>) => void;
  deleteDailyLog: (id: string) => void;

  addMaterial: (material: Omit<MaterialLedgerItem, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<MaterialLedgerItem>) => void;
  updateMaterialStatus: (id: string, status: MaterialLedgerItem['status']) => void;
  deleteMaterial: (id: string) => void;
  receiveMaterialDelivery: (delivery: {
    materialId?: string;
    projectId: string;
    materialName: string;
    category?: MaterialLedgerItem['category'];
    quantity: number;
    unit?: string;
    ratePerUnit?: number;
    supplier?: string;
    invoiceNo?: string;
    date?: string;
  }) => { success: boolean; isNew: boolean; item: MaterialLedgerItem | null };

  addSnag: (snag: Omit<SnagItem, 'id'>) => void;
  updateSnagStatus: (id: string, status: SnagItem['status']) => void;
  deleteSnag: (id: string) => void;

  // Manpower & Labor Ledger Actions
  addLaborEntry: (entry: Omit<LaborEntry, 'id'>) => void;
  deleteLaborEntry: (id: string) => void;

  // Accounts & Voucher Actions
  addAccountTransaction: (trans: Omit<AccountTransaction, 'id'>) => void;
  updateAccountTransactionStatus: (id: string, status: AccountTransaction['status']) => void;
  deleteAccountTransaction: (id: string) => void;

  // Tax & RFQ Compliance Actions (FBR & SRB)
  addTaxInvoice: (invoice: Omit<TaxInvoice, 'id'>) => void;
  updateTaxInvoiceStatus: (id: string, status: TaxInvoice['status']) => void;
  deleteTaxInvoice: (id: string) => void;

  addRFQ: (rfq: Omit<RFQDocument, 'id'>) => void;
  updateRFQStatus: (id: string, status: RFQDocument['status']) => void;
  addQuotationToRFQ: (rfqId: string, quote: Omit<import('../types').RFQQuotation, 'id'>) => void;
  deleteRFQ: (id: string) => void;

  // Data Import / Export for GitHub & Local Backups
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
  resetToSampleData: () => void;
  // Demo mode: separate storage namespace + demo-only reset
  isDemoMode: boolean;
  resetDemoData: () => void;

  // Auth & Sub-User Management (Admin rights creation)
  currentUser: AuthUser | null;
  users: AuthUser[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (email: string, password?: string, role?: UserRole) => { success: boolean; message?: string };
  loginAsDemo: (role?: UserRole) => { success: boolean; message?: string };
  logout: () => void;
  isLogoutPageActive: boolean;
  setIsLogoutPageActive: (active: boolean) => void;
  lastLoggedOutUser: { user: AuthUser; timestamp: string } | null;
  createUser: (userData: Omit<AuthUser, 'id' | 'createdAt'>) => AuthUser;
  updateUser: (id: string, updates: Partial<AuthUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;

  // In-App Notification Center
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addCustomNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;

  // Offline Access & Cloud Sync Engine
  isOnline: boolean;
  isRawOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  pendingSyncQueue: PendingSyncItem[];
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncPendingChanges: () => Promise<{ success: boolean; syncedCount: number }>;
  clearSyncedQueue: () => void;
  dismissPendingSyncItem: (id: string) => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'alasad_construction_tracker_v2';
const LEGACY_STORAGE_KEY_V1 = 'alasad_construction_tracker_v1';
const LEGACY_STORAGE_KEY_MEIMAR = 'meimar_construction_tracker_v1';
const SYNC_QUEUE_KEY = 'alasad_offline_sync_queue_v1';
const LAST_SYNC_KEY = 'alasad_last_sync_timestamp';
const SESSION_KEY = 'alasad_session_user';

// Demo namespace — completely separate from the real company storage.
// When the demo account is logged in, ONLY these keys are read or written.
const DEMO_STORAGE_KEY = 'alasad_demo_construction_tracker_v2';
const DEMO_SYNC_QUEUE_KEY = 'alasad_demo_offline_sync_queue_v1';
const DEMO_LAST_SYNC_KEY = 'alasad_demo_last_sync_timestamp';
const DEMO_SESSION_KEY = 'alasad_demo_session_user';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo mode is decided by which session key exists: a demo session means
  // the whole provider runs on the demo storage namespace from the first read.
  const readInitialDemoMode = (): boolean => {
    try {
      return !!sessionStorage.getItem(DEMO_SESSION_KEY);
    } catch (e) {
      return false;
    }
  };
  const initialDemoMode = readInitialDemoMode();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(initialDemoMode);

  // Active storage keys for this render — demo keys in demo mode, real keys otherwise.
  const storageKey = isDemoMode ? DEMO_STORAGE_KEY : STORAGE_KEY;
  const syncQueueKey = isDemoMode ? DEMO_SYNC_QUEUE_KEY : SYNC_QUEUE_KEY;
  const lastSyncKey = isDemoMode ? DEMO_LAST_SYNC_KEY : LAST_SYNC_KEY;

  // Read initial cache from the active namespace (legacy keys only for real data)
  const readCachedData = (demo: boolean): StorageState | null => {
    try {
      const key = demo ? DEMO_STORAGE_KEY : STORAGE_KEY;
      const raw = demo
        ? localStorage.getItem(key)
        : localStorage.getItem(key) ||
          localStorage.getItem(LEGACY_STORAGE_KEY_V1) ||
          localStorage.getItem(LEGACY_STORAGE_KEY_MEIMAR);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed reading from localStorage', e);
    }
    return null;
  };

  const cached = readCachedData(initialDemoMode);

  const [projects, setProjects] = useState<Project[]>(cached?.projects || INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<ConstructionTask[]>(cached?.tasks || INITIAL_TASKS);
  const [dailyLogs, setDailyLogs] = useState<DailySiteLog[]>(cached?.dailyLogs || INITIAL_DAILY_LOGS);
  const [materials, setMaterials] = useState<MaterialLedgerItem[]>(cached?.materials || INITIAL_MATERIALS);
  const [snags, setSnags] = useState<SnagItem[]>(cached?.snags || INITIAL_SNAGS);
  const [labor, setLabor] = useState<LaborEntry[]>(cached?.labor || INITIAL_LABOR);
  const [accounts, setAccounts] = useState<AccountTransaction[]>(cached?.accounts || INITIAL_ACCOUNTS);
  const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>(cached?.taxInvoices || INITIAL_TAX_INVOICES);
  const [rfqs, setRfqs] = useState<RFQDocument[]>(cached?.rfqs || INITIAL_RFQS);
  const [language, setLanguage] = useState<Language>(cached?.language || 'en');
  
  // Sub-users list created and managed by Admin
  // Owner login migration: browsers that visited before still hold the old
  // seeded admin user in cache — force it to the company Owner login.
  const migrateOwnerUser = (list: AuthUser[]): AuthUser[] =>
    list.map(u =>
      u.id === 'user-admin'
        ? { ...u, name: 'Al Asad Constructors', nameUrdu: 'الاسد کنسٹرکٹرز', email: 'info@alasadconstructors.com', password: 'Asad@3456', designation: 'Owner' }
        : u
    );
  // Browsers that cached the users list before the demo account existed would
  // otherwise never find it — always keep the demo account in the list.
  const ensureDemoUser = (list: AuthUser[]): AuthUser[] => {
    if (list.some(u => u.id === DEMO_USER_ID)) return list;
    const demo = INITIAL_USERS.find(u => u.id === DEMO_USER_ID);
    return demo ? [...list, demo] : list;
  };
  const [users, setUsers] = useState<AuthUser[]>(ensureDemoUser(migrateOwnerUser(cached?.users || INITIAL_USERS)));
  
  // Dedicated Login Page Gate: Starts as null so every visitor lands directly on the Login Page!
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      // A demo session takes precedence — it also puts the provider in demo mode.
      const demoSession = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (demoSession) return JSON.parse(demoSession);
      const sessionUser = sessionStorage.getItem(SESSION_KEY);
      if (sessionUser) return JSON.parse(sessionUser);
    } catch (e) {}
    return null;
  });

  // Dedicated Logout Page State
  const [isLogoutPageActive, setIsLogoutPageActive] = useState<boolean>(false);
  const [lastLoggedOutUser, setLastLoggedOutUser] = useState<{ user: AuthUser; timestamp: string } | null>(null);

  // Notifications State
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(cached?.readNotificationIds || []);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(cached?.dismissedNotificationIds || []);
  const [customNotifications, setCustomNotifications] = useState<NotificationItem[]>(cached?.customNotifications || []);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [activeProjectId, setActiveProjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [taxSection, setTaxSection] = useState<TaxSection>('invoices');
  const [manpowerSection, setManpowerSection] = useState<ManpowerSection>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Offline Access & Cloud Sync Engine State
  const readInitialQueue = (demo: boolean): PendingSyncItem[] => {
    try {
      const raw = localStorage.getItem(demo ? DEMO_SYNC_QUEUE_KEY : SYNC_QUEUE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed reading offline sync queue', e);
    }
    return [];
  };

  const [isRawOnline, setIsRawOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const isOnline = isRawOnline && !isSimulatedOffline;

  const [pendingSyncQueue, setPendingSyncQueue] = useState<PendingSyncItem[]>(() => readInitialQueue(initialDemoMode));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(initialDemoMode ? DEMO_LAST_SYNC_KEY : LAST_SYNC_KEY);
    } catch (e) {
      return null;
    }
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  const pendingSyncCount = useMemo(() => {
    return pendingSyncQueue.filter(i => i.status === 'pending').length;
  }, [pendingSyncQueue]);

  const persistQueue = (queue: PendingSyncItem[]) => {
    try {
      localStorage.setItem(syncQueueKey, JSON.stringify(queue));
    } catch (e) {}
  };

  const enqueueSyncItem = (itemData: Omit<PendingSyncItem, 'id' | 'timestamp' | 'status'>) => {
    const newItem: PendingSyncItem = {
      ...itemData,
      id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      status: isOnline ? 'synced' : 'pending'
    };
    setPendingSyncQueue(prev => {
      const updated = [newItem, ...prev.slice(0, 99)];
      persistQueue(updated);
      return updated;
    });
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline(prev => {
      const next = !prev;
      if (!next && isRawOnline) {
        setTimeout(() => {
          syncPendingChanges();
        }, 150);
      }
      return next;
    });
  };

  const dismissPendingSyncItem = (id: string) => {
    setPendingSyncQueue(prev => {
      const updated = prev.filter(i => i.id !== id);
      persistQueue(updated);
      return updated;
    });
  };

  const clearSyncedQueue = () => {
    setPendingSyncQueue(prev => {
      const updated = prev.filter(i => i.status === 'pending');
      persistQueue(updated);
      return updated;
    });
  };

  const syncPendingChanges = async (): Promise<{ success: boolean; syncedCount: number }> => {
    const pendingItems = pendingSyncQueue.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    setIsSyncing(true);

    try {
      await new Promise(r => setTimeout(r, 500));

      setPendingSyncQueue(prev => {
        const updated = prev.map(item => item.status === 'pending' ? { ...item, status: 'synced' as const } : item);
        persistQueue(updated);
        return updated;
      });

      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      setLastSyncTime(nowTime);
      try {
        localStorage.setItem(lastSyncKey, nowTime);
      } catch (e) {}

      addCustomNotification({
        title: language === 'ur' ? 'آف لائن ڈیٹا کلاؤڈ پر ہم آہنگ ہو گیا' : 'Offline Changes Synchronized',
        titleUrdu: 'آف لائن ڈیٹا کلاؤڈ پر ہم آہنگ ہو گیا',
        message: `${pendingItems.length} offline task update(s) and site log(s) have been successfully synchronized back to state.`,
        messageUrdu: `${pendingItems.length} آف لائن ٹاسک اور سائٹ لاگز کامیابی سے سسٹم کے ساتھ ہم آہنگ ہو گئے۔`,
        type: 'system',
        severity: 'info',
        targetTab: 'tasks'
      });

      setIsSyncing(false);
      return { success: true, syncedCount: pendingItems.length };
    } catch (err) {
      console.error('Sync failed:', err);
      setIsSyncing(false);
      return { success: false, syncedCount: 0 };
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsRawOnline(true);
      if (!isSimulatedOffline) {
        syncPendingChanges();
      }
    };

    const handleOffline = () => {
      setIsRawOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, pendingSyncQueue]);

  const isAuthenticated = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';

  // Check if current user has a specific permission
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return !!currentUser.permissions?.[permission];
  };

  // Generate dynamic system notifications from current projects, tasks, and snags
  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Projects Deadlines Alerts
    projects.forEach(project => {
      if (project.status === 'completed') return;

      const targetDate = new Date(project.targetEndDate);
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Project Overdue
        list.push({
          id: `deadline-overdue-proj-${project.id}`,
          title: `Project Overdue: ${project.name}`,
          titleUrdu: `منصوبے کی میعاد ختم: ${project.nameUrdu || project.name}`,
          message: `Target completion date was ${project.targetEndDate} (${Math.abs(diffDays)} days overdue). Client: ${project.client}.`,
          messageUrdu: `تکمیل کی تاریخ ${project.targetEndDate} گزر چکی ہے (${Math.abs(diffDays)} دن کی تاخیر)۔ کلائنٹ: ${project.client}`,
          type: 'deadline',
          severity: 'urgent',
          targetTab: 'overview',
          targetProjectId: project.id,
          timestamp: todayStr,
          isRead: readNotificationIds.includes(`deadline-overdue-proj-${project.id}`),
        });
      } else if (diffDays <= 7) {
        // Urgent Deadline <= 7 days
        list.push({
          id: `deadline-urgent-proj-${project.id}`,
          title: `Target Deadline in ${diffDays} days: ${project.name}`,
          titleUrdu: `منصوبے کی آخری تاریخ میں ${diffDays} دن باقی: ${project.nameUrdu || project.name}`,
          message: `Final handover scheduled for ${project.targetEndDate}. Current budget spent: Rs. ${(project.spent / 100000).toFixed(1)} Lakh.`,
          messageUrdu: `سپردگی کی تاریخ ${project.targetEndDate} ہے۔ برائے مہربانی بقیہ کام مکمل کریں۔`,
          type: 'deadline',
          severity: 'warning',
          targetTab: 'overview',
          targetProjectId: project.id,
          timestamp: todayStr,
          isRead: readNotificationIds.includes(`deadline-urgent-proj-${project.id}`),
        });
      } else if (diffDays <= 25) {
        // Upcoming Milestone
        list.push({
          id: `deadline-upcoming-proj-${project.id}`,
          title: `Upcoming Handover Milestone: ${project.name}`,
          titleUrdu: `آئندہ ہینڈ اوور سنگ میل: ${project.nameUrdu || project.name}`,
          message: `Phase: ${project.currentPhase.toUpperCase()} — Scheduled completion by ${project.targetEndDate} (${diffDays} days).`,
          messageUrdu: `مرحلہ: ${project.currentPhase} — تکمیل کی تاریخ ${project.targetEndDate} متوقع ہے۔`,
          type: 'deadline',
          severity: 'info',
          targetTab: 'overview',
          targetProjectId: project.id,
          timestamp: todayStr,
          isRead: readNotificationIds.includes(`deadline-upcoming-proj-${project.id}`),
        });
      }

      // Budget Threshold Alert
      if (project.budget > 0) {
        const threshold = project.budgetAlertThreshold ?? 80;
        const pct = (project.spent / project.budget) * 100;
        if (pct >= threshold) {
          list.push({
            id: `budget-threshold-${project.id}`,
            title: `Budget Alert: ${project.name} (${pct.toFixed(1)}% Spent)`,
            titleUrdu: `بجٹ حد الرٹ: ${project.nameUrdu || project.name} (${pct.toFixed(1)}% خرچ)`,
            message: `Project has consumed ${pct.toFixed(1)}% of its Rs. ${(project.budget / 1000000).toFixed(1)}M budget, exceeding the ${threshold}% alert threshold. Expenditures: Rs. ${(project.spent / 1000000).toFixed(1)}M.`,
            messageUrdu: `منصوبے نے منظور شدہ بجٹ کا ${pct.toFixed(1)}% خرچ کر لیا ہے (حد: ${threshold}%)۔ فوری جائزہ و کارروائی درکار ہے۔`,
            type: 'system',
            severity: pct >= 100 ? 'urgent' : 'warning',
            targetTab: 'accounts',
            targetProjectId: project.id,
            timestamp: todayStr,
            isRead: readNotificationIds.includes(`budget-threshold-${project.id}`),
          });
        }
      }
    });

    // 2. Pending Snag Resolution Alerts
    snags.forEach(snag => {
      if (snag.status === 'resolved') return;

      if (snag.severity === 'critical') {
        list.push({
          id: `snag-critical-${snag.id}`,
          title: `Critical Snag Pending Resolution: ${snag.title}`,
          titleUrdu: `اہم خرابی زیر التواء: ${snag.title}`,
          message: `Location: ${snag.locationDetails}. Assigned contractor: ${snag.assignedContractor}. Reported: ${snag.reportedDate}.`,
          messageUrdu: `مقام: ${snag.locationDetails}۔ ٹھیکیدار: ${snag.assignedContractor}۔ فوری مرمت درکار ہے۔`,
          type: 'snag',
          severity: 'urgent',
          targetTab: 'snags',
          targetProjectId: snag.projectId,
          targetId: snag.id,
          timestamp: snag.reportedDate,
          isRead: readNotificationIds.includes(`snag-critical-${snag.id}`),
        });
      } else if (snag.severity === 'moderate') {
        list.push({
          id: `snag-moderate-${snag.id}`,
          title: `Snag Resolution Required: ${snag.title}`,
          titleUrdu: `معائنہ و درستگی درکار: ${snag.title}`,
          message: `Status: ${snag.status}. Contractor: ${snag.assignedContractor} (${snag.locationDetails}).`,
          messageUrdu: `حیثیت: ${snag.status}۔ ٹھیکیدار: ${snag.assignedContractor}۔`,
          type: 'snag',
          severity: 'warning',
          targetTab: 'snags',
          targetProjectId: snag.projectId,
          targetId: snag.id,
          timestamp: snag.reportedDate,
          isRead: readNotificationIds.includes(`snag-moderate-${snag.id}`),
        });
      }
    });

    // 3. Delayed Tasks
    tasks.forEach(task => {
      if (task.status === 'delayed') {
        list.push({
          id: `task-delayed-${task.id}`,
          title: `Delayed Task: ${task.title}`,
          titleUrdu: `تاخیر کا شکار کام: ${task.titleUrdu || task.title}`,
          message: `Due date was ${task.dueDate}. Assigned to ${task.contractor} (${task.progressPercentage}% completed).`,
          messageUrdu: `مقررہ تاریخ: ${task.dueDate}۔ ٹھیکیدار: ${task.contractor} (${task.progressPercentage}% مکمل)۔`,
          type: 'system',
          severity: 'warning',
          targetTab: 'tasks',
          targetProjectId: task.projectId,
          targetId: task.id,
          timestamp: todayStr,
          isRead: readNotificationIds.includes(`task-delayed-${task.id}`),
        });
      }
    });

    // 4. Custom notifications added programmatically
    customNotifications.forEach(cn => {
      list.push({
        ...cn,
        isRead: readNotificationIds.includes(cn.id),
      });
    });

    // Filter out dismissed notifications and sort by severity
    const active = list.filter(item => !dismissedNotificationIds.includes(item.id));
    const severityOrder = { urgent: 0, warning: 1, info: 2 };
    return active.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [projects, snags, tasks, customNotifications, readNotificationIds, dismissedNotificationIds]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    setReadNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const markAllNotificationsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(Array.from(new Set([...readNotificationIds, ...allIds])));
  };

  const dismissNotification = (id: string) => {
    setDismissedNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setDismissedNotificationIds(Array.from(new Set([...dismissedNotificationIds, ...allIds])));
  };

  const addCustomNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newItem: NotificationItem = {
      ...notif,
      id: `custom-notif-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0],
      isRead: false
    };
    setCustomNotifications(prev => [newItem, ...prev]);
  };

  // Persist State to LocalStorage
  useEffect(() => {
    try {
      const payload: StorageState = {
        projects,
        tasks,
        dailyLogs,
        materials,
        snags,
        labor,
        accounts,
        taxInvoices,
        rfqs,
        language,
        currentUser: null, // Always null in persistent storage to ensure the Login Page is presented on fresh visits
        users,
        readNotificationIds,
        dismissedNotificationIds,
        customNotifications
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed saving state to localStorage', e);
    }
  }, [
    projects, 
    tasks, 
    dailyLogs, 
    materials, 
    snags, 
    labor,
    accounts,
    taxInvoices,
    rfqs,
    language, 
    currentUser, 
    users, 
    readNotificationIds, 
    dismissedNotificationIds, 
    customNotifications,
    isDemoMode
  ]);

  // Load every data slice from one namespace (demo or real). A missing key
  // seeds the built-in sample data, so the demo always looks full.
  const loadNamespaceData = (demo: boolean) => {
    const data = readCachedData(demo);
    setProjects(data?.projects || INITIAL_PROJECTS);
    setTasks(data?.tasks || INITIAL_TASKS);
    setDailyLogs(data?.dailyLogs || INITIAL_DAILY_LOGS);
    setMaterials(data?.materials || INITIAL_MATERIALS);
    setSnags(data?.snags || INITIAL_SNAGS);
    setLabor(data?.labor || INITIAL_LABOR);
    setAccounts(data?.accounts || INITIAL_ACCOUNTS);
    setTaxInvoices(data?.taxInvoices || INITIAL_TAX_INVOICES);
    setRfqs(data?.rfqs || INITIAL_RFQS);
    setLanguage(data?.language || 'en');
    setUsers(ensureDemoUser(migrateOwnerUser(data?.users || INITIAL_USERS)));
    setReadNotificationIds(data?.readNotificationIds || []);
    setDismissedNotificationIds(data?.dismissedNotificationIds || []);
    setCustomNotifications(data?.customNotifications || []);
    setPendingSyncQueue(readInitialQueue(demo));
    try {
      setLastSyncTime(localStorage.getItem(demo ? DEMO_LAST_SYNC_KEY : LAST_SYNC_KEY));
    } catch (e) {
      setLastSyncTime(null);
    }
    setActiveProjectId('all');
  };

  // Auth & Sub-User Management Implementation
  const login = (email: string, password?: string, _role?: UserRole): { success: boolean; message?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check against dynamically managed users
    const matched = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!matched) {
      return { 
        success: false, 
        message: language === 'ur' ? 'یہ ای میل رجسٹرڈ نہیں ہے۔' : 'User not found. Please contact the Administrator.' 
      };
    }

    if (!matched.isActive) {
      return { 
        success: false, 
        message: language === 'ur' ? 'یہ اکاؤنٹ ایڈمنسٹریٹر نے غیر فعال کر رکھا ہے۔' : 'This account has been deactivated by the Administrator.' 
      };
    }

    // Check password if set (strict: only the stored password works)
    if (matched.password && password) {
      const isMatch = matched.password === password;
      if (!isMatch) {
        return { 
          success: false, 
          message: language === 'ur' ? 'غلط پاس ورڈ۔ برائے مہربانی دوبارہ کوشش کریں۔' : 'Incorrect password. Please verify credentials.' 
        };
      }
    }

    // The demo account switches the whole app to the demo storage namespace;
    // every other account switches it back to the real company namespace.
    const targetIsDemo = matched.id === DEMO_USER_ID;
    setIsDemoMode(targetIsDemo);
    loadNamespaceData(targetIsDemo);
    setCurrentUser(matched);
    setIsLogoutPageActive(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      sessionStorage.setItem(targetIsDemo ? DEMO_SESSION_KEY : SESSION_KEY, JSON.stringify(matched));
    } catch (e) {}

    if (matched.assignedProjectId && matched.assignedProjectId !== 'all') {
      setActiveProjectId(matched.assignedProjectId);
    }
    setIsLoginModalOpen(false);
    return { success: true };
  };

  // One-tap demo login (used by the "Try Demo" button): same as typing the
  // demo email + password — switches to the demo namespace.
  const loginAsDemo = (_role?: UserRole) => {
    return login(DEMO_USER_EMAIL, DEMO_USER_PASSWORD);
  };

  const logout = () => {
    if (currentUser) {
      setLastLoggedOutUser({
        user: currentUser,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      setIsLogoutPageActive(true);
    }
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        delete parsed.currentUser;
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      }
    } catch (e) {}
    // Leave demo mode and reload the real company data into memory, so the
    // next login starts clean. Real storage keys were never touched in demo.
    setIsDemoMode(false);
    loadNamespaceData(false);
  };

  // Sub-User creation by Admin
  // The demo account has no User Management rights at all — block any user
  // change while in demo mode (the Users tab is admin-gated too, this is
  // defence in depth so no code path can touch users from a demo session).
  const blockDemoUserMgmt = (): boolean => {
    if (!isDemoMode) return false;
    alert(language === 'ur' ? 'ڈیمو موڈ میں یوزر مینجمنٹ بند ہے۔' : 'User management is disabled in Demo Mode.');
    return true;
  };

  const createUser = (userData: Omit<AuthUser, 'id' | 'createdAt'>): AuthUser => {
    if (blockDemoUserMgmt()) {
      return users.find(u => u.id === DEMO_USER_ID) || users[0];
    }
    const newUser: AuthUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<AuthUser>) => {
    if (blockDemoUserMgmt()) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (id: string) => {
    if (blockDemoUserMgmt()) return;
    if (id === 'user-admin') {
      alert(language === 'ur' ? 'مین ایڈمن اکاؤنٹ حذف نہیں کیا جا سکتا۔' : 'The root Administrator account cannot be deleted.');
      return;
    }
    if (id === DEMO_USER_ID) {
      alert(language === 'ur' ? 'ڈیمو اکاؤنٹ حذف نہیں کیا جا سکتا۔' : 'The demo account cannot be deleted.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(users[0] || null);
    }
  };

  const toggleUserStatus = (id: string) => {
    if (blockDemoUserMgmt()) return;
    if (id === DEMO_USER_ID) {
      alert(language === 'ur' ? 'ڈیمو اکاؤنٹ غیر فعال نہیں کیا جا سکتا۔' : 'The demo account cannot be deactivated.');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    }));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Projects CRUD
  const addProject = (projectData: Omit<Project, 'id'>) => {
    if (!hasPermission('canCreateProjects')) {
      alert(language === 'ur' ? 'آپ کو نیا منصوبہ بنانے کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied: You do not have permission to create new projects.');
      return;
    }
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    if (!hasPermission('canCreateProjects') && !isAdmin) {
      alert(language === 'ur' ? 'آپ کو پروجیکٹ میں ترمیم کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied: Project updates are restricted.');
      return;
    }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    if (!hasPermission('canDeleteProjects') && !isAdmin) {
      alert(language === 'ur' 
        ? 'صرف مجاز ایڈمنسٹریٹر کو پروجیکٹ حذف کرنے کی اجازت ہے۔' 
        : 'Permission Denied: Only users with project deletion rights can delete projects.');
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setDailyLogs(prev => prev.filter(d => d.projectId !== id));
    setMaterials(prev => prev.filter(m => m.projectId !== id));
    setSnags(prev => prev.filter(s => s.projectId !== id));
    if (activeProjectId === id) {
      setActiveProjectId('all');
    }
  };

  // Tasks CRUD
  const addTask = (taskData: Omit<ConstructionTask, 'id'>) => {
    if (!hasPermission('canManageTasks')) {
      alert(language === 'ur' ? 'آپ کو کام شامل کرنے کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied: Task management restricted.');
      return;
    }
    const newTask: ConstructionTask = {
      ...taskData,
      id: `task-${Date.now()}`
    };
    setTasks(prev => [newTask, ...prev]);
    enqueueSyncItem({
      actionType: 'TASK_ADD',
      entityType: 'task',
      entityId: newTask.id,
      projectId: newTask.projectId,
      summary: `Created task "${newTask.title}"`,
      summaryUrdu: `نیا ٹاسک شامل کیا گیا: "${newTask.titleUrdu || newTask.title}"`,
      payload: newTask
    });
  };

  const updateTask = (id: string, updates: Partial<ConstructionTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const targetTask = tasks.find(t => t.id === id);
    enqueueSyncItem({
      actionType: 'TASK_UPDATE',
      entityType: 'task',
      entityId: id,
      projectId: targetTask?.projectId,
      summary: `Updated task details "${targetTask?.title || id}"`,
      summaryUrdu: `ٹاسک کی تفصیلات تبدیل کی گئیں: "${targetTask?.titleUrdu || targetTask?.title || id}"`,
      payload: { id, updates }
    });
  };

  const deleteTask = (id: string) => {
    if (!hasPermission('canManageTasks')) {
      alert(language === 'ur' ? 'آپ کو کام حذف کرنے کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied: Task deletion restricted.');
      return;
    }
    const targetTask = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    enqueueSyncItem({
      actionType: 'TASK_DELETE',
      entityType: 'task',
      entityId: id,
      projectId: targetTask?.projectId,
      summary: `Deleted task "${targetTask?.title || id}"`,
      summaryUrdu: `ٹاسک حذف کیا گیا: "${targetTask?.titleUrdu || targetTask?.title || id}"`,
      payload: { id }
    });
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    let movedTaskTitle = '';
    let targetProjectId = '';
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        movedTaskTitle = t.title;
        targetProjectId = t.projectId;
        const completed = newStatus === 'completed';
        return {
          ...t,
          status: newStatus,
          progressPercentage: completed ? 100 : (newStatus === 'backlog' ? 0 : Math.max(t.progressPercentage, 35)),
          actualEndDate: completed ? new Date().toISOString().split('T')[0] : t.actualEndDate
        };
      }
      return t;
    }));
    enqueueSyncItem({
      actionType: 'TASK_STATUS_MOVE',
      entityType: 'task',
      entityId: taskId,
      projectId: targetProjectId,
      summary: `Moved "${movedTaskTitle || taskId}" to ${newStatus.toUpperCase()}`,
      summaryUrdu: `ٹاسک کا اسٹیٹس تبدیل کیا گیا: "${newStatus}"`,
      payload: { taskId, newStatus }
    });
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    let targetProjectId = '';
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        targetProjectId = t.projectId;
        const updatedChecklist = t.checklist.map(c => 
          c.id === checklistId ? { ...c, completed: !c.completed } : c
        );
        const completedCount = updatedChecklist.filter(c => c.completed).length;
        const total = updatedChecklist.length;
        const progress = total > 0 ? Math.round((completedCount / total) * 100) : t.progressPercentage;
        
        return {
          ...t,
          checklist: updatedChecklist,
          progressPercentage: progress,
          status: progress === 100 ? 'inspection' : t.status
        };
      }
      return t;
    }));
    enqueueSyncItem({
      actionType: 'TASK_CHECKLIST_TOGGLE',
      entityType: 'task',
      entityId: taskId,
      projectId: targetProjectId,
      summary: `Toggled checklist item on task`,
      summaryUrdu: `ٹاسک چیک لسٹ آئٹم مکمل / غیر مکمل کیا گیا`,
      payload: { taskId, checklistId }
    });
  };

  // Daily Logs CRUD
  const addDailyLog = (logData: Omit<DailySiteLog, 'id'>) => {
    if (!hasPermission('canAddDailyLogs')) {
      alert(language === 'ur' ? 'آپ کو روزنامچہ درج کرنے کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied: Daily log submission restricted.');
      return;
    }
    const newLog: DailySiteLog = {
      ...logData,
      id: `log-${Date.now()}`
    };
    setDailyLogs(prev => [newLog, ...prev]);
    enqueueSyncItem({
      actionType: 'LOG_ADD',
      entityType: 'dailyLog',
      entityId: newLog.id,
      projectId: newLog.projectId,
      summary: `Logged Daily Report for ${newLog.date} (${newLog.supervisor})`,
      summaryUrdu: `روزنامچہ درج کیا گیا: ${newLog.date} (${newLog.supervisor})`,
      payload: newLog
    });
  };

  const deleteDailyLog = (id: string) => {
    if (!isAdmin) {
      alert(language === 'ur' ? 'صرف ایڈمن روزنامچہ حذف کر سکتا ہے۔' : 'Permission Denied: Only Admin can delete daily site logs.');
      return;
    }
    const targetLog = dailyLogs.find(l => l.id === id);
    setDailyLogs(prev => prev.filter(l => l.id !== id));
    enqueueSyncItem({
      actionType: 'LOG_DELETE',
      entityType: 'dailyLog',
      entityId: id,
      projectId: targetLog?.projectId,
      summary: `Deleted daily site log for ${targetLog?.date || id}`,
      summaryUrdu: `سائٹ روزنامچہ حذف کیا گیا: ${targetLog?.date || id}`,
      payload: { id }
    });
  };

  // Materials CRUD
  const addMaterial = (matData: Omit<MaterialLedgerItem, 'id'>) => {
    if (!hasPermission('canManageMaterials')) {
      alert(language === 'ur' ? 'آپ کو سامان کی انٹری درج کرنے کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied: Material entries restricted.');
      return;
    }
    const newMat: MaterialLedgerItem = {
      ...matData,
      id: `mat-${Date.now()}`
    };
    setMaterials(prev => [newMat, ...prev]);
  };

  const updateMaterial = (id: string, updates: Partial<MaterialLedgerItem>) => {
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        if (updates.quantity !== undefined || updates.ratePerUnit !== undefined) {
          const qty = updates.quantity !== undefined ? updates.quantity : m.quantity;
          const rate = updates.ratePerUnit !== undefined ? updates.ratePerUnit : m.ratePerUnit;
          updated.totalAmount = Math.round(qty * rate);
        }
        return updated;
      }
      return m;
    }));
  };

  const receiveMaterialDelivery = (delivery: {
    materialId?: string;
    projectId: string;
    materialName: string;
    category?: MaterialLedgerItem['category'];
    quantity: number;
    unit?: string;
    ratePerUnit?: number;
    supplier?: string;
    invoiceNo?: string;
    date?: string;
  }) => {
    let resultingItem: MaterialLedgerItem | null = null;
    let isNewItem = false;
    const nowIso = new Date().toISOString().split('T')[0];

    setMaterials(prev => {
      const existingIdx = prev.findIndex(m => 
        (delivery.materialId && m.id === delivery.materialId) ||
        (m.projectId === delivery.projectId && m.materialName.toLowerCase().trim() === delivery.materialName.toLowerCase().trim())
      );

      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const newQty = existing.quantity + delivery.quantity;
        const rate = delivery.ratePerUnit !== undefined ? delivery.ratePerUnit : existing.ratePerUnit;
        const updated: MaterialLedgerItem = {
          ...existing,
          quantity: newQty,
          ratePerUnit: rate,
          totalAmount: Math.round(newQty * rate),
          status: 'received',
          supplier: delivery.supplier || existing.supplier,
          invoiceNo: delivery.invoiceNo || existing.invoiceNo,
          date: delivery.date || nowIso
        };
        resultingItem = updated;
        const copy = [...prev];
        copy[existingIdx] = updated;
        return copy;
      } else {
        isNewItem = true;
        const rate = delivery.ratePerUnit || 1000;
        const newItem: MaterialLedgerItem = {
          id: delivery.materialId || `mat-${Date.now()}`,
          projectId: delivery.projectId,
          materialName: delivery.materialName,
          category: delivery.category || 'cement',
          quantity: delivery.quantity,
          unit: delivery.unit || 'Units',
          ratePerUnit: rate,
          totalAmount: Math.round(delivery.quantity * rate),
          supplier: delivery.supplier || 'Site Delivery',
          invoiceNo: delivery.invoiceNo || `QR-${Date.now().toString().slice(-5)}`,
          date: delivery.date || nowIso,
          status: 'received'
        };
        resultingItem = newItem;
        return [newItem, ...prev];
      }
    });

    // In-app notification
    const targetProj = projects.find(p => p.id === delivery.projectId);
    const projName = targetProj ? (language === 'ur' && targetProj.nameUrdu ? targetProj.nameUrdu : targetProj.name) : 'Project Site';
    addCustomNotification({
      type: 'system',
      title: language === 'ur' ? 'سامان کی ترسیل موصول (QR اسکین)' : 'Material Delivery Received (QR Scan)',
      message: language === 'ur'
        ? `${delivery.quantity} ${delivery.unit || ''} "${delivery.materialName}" موصول ہو کر ${projName} کے اسٹاک میں کامیابی سے جمع کر دی گئی۔`
        : `Delivered: ${delivery.quantity} ${delivery.unit || ''} of "${delivery.materialName}" verified & added to ${projName} ledger stock.`,
      severity: 'info',
      targetTab: 'materials'
    });

    return {
      success: true,
      isNew: isNewItem,
      item: resultingItem
    };
  };

  const updateMaterialStatus = (id: string, status: MaterialLedgerItem['status']) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const deleteMaterial = (id: string) => {
    if (!hasPermission('canManageMaterials')) {
      alert(language === 'ur' ? 'آپ کو سامان ریکارڈ حذف کرنے کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied.');
      return;
    }
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  // Snags CRUD
  const addSnag = (snagData: Omit<SnagItem, 'id'>) => {
    const newSnag: SnagItem = {
      ...snagData,
      id: `snag-${Date.now()}`
    };
    setSnags(prev => [newSnag, ...prev]);
  };

  const updateSnagStatus = (id: string, status: SnagItem['status']) => {
    if (!hasPermission('canResolveSnags')) {
      alert(language === 'ur' ? 'آپ کو نقائص حل یا بند کرنے کے اختیارات حاصل نہیں ہیں۔' : 'Permission Denied: Snag resolution rights required.');
      return;
    }
    setSnags(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          resolvedDate: status === 'resolved' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return s;
    }));
  };

  const deleteSnag = (id: string) => {
    if (!isAdmin) {
      alert(language === 'ur' ? 'صرف ایڈمن نقص کا ریکارڈ حذف کر سکتا ہے۔' : 'Only Admin can remove punch list items.');
      return;
    }
    setSnags(prev => prev.filter(s => s.id !== id));
  };

  // Labor Muster Roll Actions
  const addLaborEntry = (entry: Omit<LaborEntry, 'id'>) => {
    const newEntry: LaborEntry = {
      ...entry,
      id: `lab-${Date.now()}`
    };
    setLabor(prev => [newEntry, ...prev]);
  };

  const deleteLaborEntry = (id: string) => {
    if (!isAdmin) {
      alert(language === 'ur' ? 'صرف ایڈمنسٹریٹر کو لیبر انٹری حذف کرنے کا اختیار ہے۔' : 'Only Admin can remove labor entries.');
      return;
    }
    setLabor(prev => prev.filter(l => l.id !== id));
  };

  // Accounts & Voucher Actions
  const addAccountTransaction = (trans: Omit<AccountTransaction, 'id'>) => {
    const newTrans: AccountTransaction = {
      ...trans,
      id: `acc-${Date.now()}`,
      voucherNo: trans.voucherNo || `VOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    };
    setAccounts(prev => [newTrans, ...prev]);
  };

  const updateAccountTransactionStatus = (id: string, status: AccountTransaction['status']) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteAccountTransaction = (id: string) => {
    if (!isAdmin) {
      alert(language === 'ur' ? 'صرف ایڈمنسٹریٹر کو واؤچر یا ٹرانزیکشن حذف کرنے کا اختیار ہے۔' : 'Only Admin can delete financial vouchers.');
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Tax Invoice Actions (FBR & SRB)
  const addTaxInvoice = (invoice: Omit<TaxInvoice, 'id'>) => {
    const newInvoice: TaxInvoice = {
      ...invoice,
      id: `inv-${Date.now()}`
    };
    setTaxInvoices(prev => [newInvoice, ...prev]);
  };

  const updateTaxInvoiceStatus = (id: string, status: TaxInvoice['status']) => {
    setTaxInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const deleteTaxInvoice = (id: string) => {
    if (!isAdmin) {
      alert(language === 'ur' ? 'صرف ایڈمنسٹریٹر کو ٹیکس انوائس حذف کرنے کی اجازت ہے۔' : 'Only Admin can remove tax invoices.');
      return;
    }
    setTaxInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // RFQ Actions
  const addRFQ = (rfq: Omit<RFQDocument, 'id'>) => {
    const newRfq: RFQDocument = {
      ...rfq,
      id: `rfq-${Date.now()}`
    };
    setRfqs(prev => [newRfq, ...prev]);
  };

  const updateRFQStatus = (id: string, status: RFQDocument['status']) => {
    setRfqs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addQuotationToRFQ = (rfqId: string, quote: Omit<import('../types').RFQQuotation, 'id'>) => {
    const newQuote = {
      ...quote,
      id: `quot-${Date.now()}`
    };
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, quotations: [...r.quotations, newQuote] } : r));
  };

  const deleteRFQ = (id: string) => {
    if (!isAdmin) {
      alert(language === 'ur' ? 'صرف ایڈمنسٹریٹر کو RFQ دستاویز حذف کرنے کی اجازت ہے۔' : 'Only Admin can remove RFQ documents.');
      return;
    }
    setRfqs(prev => prev.filter(r => r.id !== id));
  };

  // Export JSON (for git repository backup / local persistence)
  const exportDataJson = () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      projects,
      tasks,
      dailyLogs,
      materials,
      snags,
      labor,
      accounts,
      taxInvoices,
      rfqs,
      users: users.map(u => ({ ...u, password: '•••' })) // mask passwords in export
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isDemoMode
      ? `alasad-demo-backup-${new Date().toISOString().split('T')[0]}.json`
      : `alasad-constructors-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.projects && Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (data.tasks) setTasks(data.tasks);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.materials) setMaterials(data.materials);
        if (data.snags) setSnags(data.snags);
        if (data.labor) setLabor(data.labor);
        if (data.accounts) setAccounts(data.accounts);
        if (data.taxInvoices) setTaxInvoices(data.taxInvoices);
        if (data.rfqs) setRfqs(data.rfqs);
        if (data.users && Array.isArray(data.users)) setUsers(data.users);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse import JSON', e);
      return false;
    }
  };

  const resetToSampleData = () => {
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setDailyLogs(INITIAL_DAILY_LOGS);
    setMaterials(INITIAL_MATERIALS);
    setSnags(INITIAL_SNAGS);
    setLabor(INITIAL_LABOR);
    setAccounts(INITIAL_ACCOUNTS);
    setTaxInvoices(INITIAL_TAX_INVOICES);
    setRfqs(INITIAL_RFQS);
    setUsers(INITIAL_USERS);
    // In demo mode the reset must NOT switch the session to the admin account.
    if (!isDemoMode) setCurrentUser(INITIAL_USERS[0]);
    setReadNotificationIds([]);
    setDismissedNotificationIds([]);
    setActiveProjectId('all');
  };

  // Demo banner action: wipe ONLY the demo namespace keys and re-seed the
  // sample data. Real company storage is never touched.
  const resetDemoData = () => {
    if (!isDemoMode) return;
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem(DEMO_SYNC_QUEUE_KEY);
      localStorage.removeItem(DEMO_LAST_SYNC_KEY);
    } catch (e) {}
    loadNamespaceData(true);
    const demoUser = INITIAL_USERS.find(u => u.id === DEMO_USER_ID);
    if (demoUser) {
      setCurrentUser(demoUser);
      try {
        sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
      } catch (e) {}
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPhaseFilter('all');
    setPriorityFilter('all');
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        tasks,
        dailyLogs,
        materials,
        snags,
        labor,
        accounts,
        taxInvoices,
        rfqs,
        activeProjectId,
        activeProject,
        activeTab,
        taxSection,
        manpowerSection,
        language,
        searchQuery,
        phaseFilter,
        priorityFilter,
        statusFilter,
        setActiveProjectId,
        setActiveTab,
        setTaxSection,
        setManpowerSection,
        setLanguage,
        setSearchQuery,
        setPhaseFilter,
        setPriorityFilter,
        setStatusFilter,
        resetFilters,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleChecklistItem,
        addDailyLog,
        deleteDailyLog,
        addMaterial,
        updateMaterial,
        updateMaterialStatus,
        deleteMaterial,
        receiveMaterialDelivery,
        addSnag,
        updateSnagStatus,
        deleteSnag,
        addLaborEntry,
        deleteLaborEntry,
        addAccountTransaction,
        updateAccountTransactionStatus,
        deleteAccountTransaction,
        addTaxInvoice,
        updateTaxInvoiceStatus,
        deleteTaxInvoice,
        addRFQ,
        updateRFQStatus,
        addQuotationToRFQ,
        deleteRFQ,
        exportDataJson,
        importDataJson,
        resetToSampleData,
        isDemoMode,
        resetDemoData,
        currentUser,
        users,
        isAuthenticated,
        isAdmin,
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        loginAsDemo,
        logout,
        isLogoutPageActive,
        setIsLogoutPageActive,
        lastLoggedOutUser,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        hasPermission,
        notifications,
        unreadNotificationsCount,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearAllNotifications,
        addCustomNotification,
        isOnline,
        isRawOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        pendingSyncQueue,
        pendingSyncCount,
        isSyncing,
        lastSyncTime,
        syncPendingChanges,
        clearSyncedQueue,
        dismissPendingSyncItem,
        isSyncModalOpen,
        setIsSyncModalOpen
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
