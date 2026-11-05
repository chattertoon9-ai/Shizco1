/**
 * Construction Project & Task Tracker Types
 */

export type ProjectPhase = 
  | 'excavation' 
  | 'foundation' 
  | 'structure' 
  | 'masonry' 
  | 'mep' 
  | 'finishing' 
  | 'handover';

export type ProjectStatus = 'planned' | 'in_progress' | 'on_hold' | 'completed';

export type TaskStatus = 'backlog' | 'in_progress' | 'inspection' | 'completed' | 'delayed';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ConstructionTask {
  id: string;
  projectId: string;
  title: string;
  titleUrdu?: string;
  phase: ProjectPhase;
  status: TaskStatus;
  priority: TaskPriority;
  contractor: string;
  trade: string; // e.g. Civil, Steel Fixing, Plumbing, Electrical, Masonry, HVAC, Painting
  crewSize: number;
  progressPercentage: number;
  startDate: string;
  dueDate: string;
  actualEndDate?: string;
  estimatedCost: number;
  actualCost?: number;
  checklist: TaskChecklistItem[];
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  nameUrdu?: string;
  code: string;
  client: string;
  location: string;
  projectManager: string;
  status: ProjectStatus;
  currentPhase: ProjectPhase;
  budget: number;
  spent: number;
  budgetAlertThreshold?: number; // Alert threshold percentage (e.g. 75%, 80%, 85%, 90%)
  estimatedCostBreakdown?: {
    material: number;
    labor: number;
    subcontractor: number;
    machinery: number;
    fuel: number;
    overheads: number;
  };
  startDate: string;
  targetEndDate: string;
  bannerImage: string;
  description: string;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'extreme_heat' | 'dust_storm';

export interface DailySiteLog {
  id: string;
  projectId: string;
  date: string;
  supervisor: string;
  weather: WeatherCondition;
  temperatureC?: number;
  workersCount: {
    trade: string;
    count: number;
  }[];
  workSummary: string;
  delaysOrObstacles: string;
  safetyIncidentsCount: number;
  materialsReceived: {
    material: string;
    quantity: string;
    supplier: string;
  }[];
}

export interface MaterialLedgerItem {
  id: string;
  projectId: string;
  materialName: string;
  category: 'cement' | 'steel' | 'aggregates' | 'bricks' | 'plumbing' | 'electrical' | 'finishing' | 'hardware';
  quantity: number;
  unit: string;
  ratePerUnit: number;
  totalAmount: number;
  supplier: string;
  invoiceNo?: string;
  date: string;
  status: 'ordered' | 'received' | 'consumed';
  batchNo?: string;
  qrCode?: string;
}

export interface SnagItem {
  id: string;
  projectId: string;
  title: string;
  locationDetails: string;
  severity: 'minor' | 'moderate' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  assignedContractor: string;
  reportedDate: string;
  resolvedDate?: string;
  notes?: string;
}

export interface LaborAllowances {
  transport: number;
  food: number;
  accommodation: number;
  other?: number;
}

export interface LaborDeductions {
  advance: number;
  other?: number;
}

export interface LaborEntry {
  id: string;
  projectId: string;
  date: string;
  workerName?: string; // Worker Full Name (e.g. Ustad Tariq Mehmood)
  designation?: string; // Designation (e.g. Lead Mason, Shuttering Supervisor)
  age?: number; // Age in years
  education?: string; // Qualification (e.g. DAE Civil, Matric, TEVTA Certified)
  trade: string; // e.g. Mason, Steel Fixer, Shuttering Carpenter, Electrician, Plumber, Helper, Surveyor
  headcount: number;
  hoursPerDay: number;
  dailyWageRate: number; // PKR per day salary
  allowances?: LaborAllowances; // Transport, Food, Accommodation allowances
  monthlyGross?: number; // Monthly gross wage (daily * 26 + allowances)
  deductions?: LaborDeductions; // Advance salary, loans, other deductions
  netPayable?: number; // Net take-home salary
  totalWage: number;
  contractor: string;
  shift: 'day' | 'night' | 'overtime';
  status: 'present' | 'half_day' | 'overtime' | 'absent';
  notes?: string;
}

export interface AccountTransaction {
  id: string;
  projectId: string;
  voucherNo: string;
  date: string;
  category: 'material' | 'labor' | 'subcontractor' | 'machinery' | 'fuel' | 'permits' | 'overheads';
  title: string;
  recipientOrVendor: string;
  amount: number;
  paymentMode: 'bank_transfer' | 'cheque' | 'cash' | 'pay_order';
  status: 'paid' | 'pending' | 'cleared';
  invoiceRef?: string;
  notes?: string;
}

export interface TaxInvoiceItem {
  id: string;
  description: string;
  itemType: 'goods' | 'services'; // Goods subject to FBR GST (18%), Services to SRB SST (13%)
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  fbrGstRate: number; // e.g. 18%
  fbrGstAmount: number;
  srbSstRate: number; // e.g. 13%
  srbSstAmount: number;
  whtRate: number; // e.g. 7.5% or 4.5%
  whtAmount: number;
  netAmount: number;
}

export interface TaxInvoice {
  id: string;
  invoiceNumber: string; // e.g. AAC-INV-2026-001
  rfqRef?: string;
  projectId: string;
  date: string;
  dueDate: string;
  clientOrVendorName: string;
  clientNtn: string;
  clientStrn?: string;
  clientSrbNumber?: string;
  companyNtn: string;
  companyStrn: string;
  companySrb: string;
  invoiceType: 'sale' | 'purchase'; // Client billing or Subcontractor billing
  items: TaxInvoiceItem[];
  subtotal: number;
  totalFbrGst: number;
  totalSrbSst: number;
  totalWhtDeduction: number;
  grandTotal: number;
  netPayable: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  notes?: string;
}

export interface RFQLineItem {
  id: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  estimatedRate: number;
  taxCategory: 'fbr_goods_18' | 'srb_services_13' | 'exempt';
}

export interface RFQQuotation {
  id: string;
  vendorName: string;
  vendorNtn?: string;
  isFiler: boolean;
  quotedAmount: number;
  fbrTax: number;
  srbTax: number;
  totalWithTax: number;
  leadTimeDays: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface RFQDocument {
  id: string;
  rfqNumber: string; // e.g. AAC-RFQ-2026-042
  projectId: string;
  title: string;
  category: 'civil_materials' | 'steel_rebar' | 'ready_mix' | 'subcontract_labor' | 'mep' | 'finishes';
  issueDate: string;
  submissionDeadline: string;
  status: 'open' | 'evaluation' | 'awarded' | 'closed';
  lineItems: RFQLineItem[];
  quotations: RFQQuotation[];
  awardedVendor?: string;
  estimatedBudget: number;
  termsAndConditions: string;
}

export type ActiveTab = 
  | 'home'
  | 'projects'
  | 'tasks' 
  | 'manpower'
  | 'accounts'
  | 'tax_compliance'
  | 'invoices_rfq'
  | 'overview' 
  | 'gantt' 
  | 'daily_logs' 
  | 'materials' 
  | 'snags' 
  | 'users'
  | 'github_guide';

export type Language = 'en' | 'ur';

export type UserRole = 'admin' | 'user';

export interface UserPermissions {
  canCreateProjects: boolean;
  canDeleteProjects: boolean;
  canEditBudgets: boolean;
  canManageTasks: boolean;
  canAddDailyLogs: boolean;
  canManageMaterials: boolean;
  canResolveSnags: boolean;
  canManageUsers: boolean;
  canManageManpower?: boolean;
  canManageAccounts?: boolean;
  canManageTax?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  nameUrdu?: string;
  email: string;
  password?: string;
  role: UserRole;
  designation: string;
  avatarColor?: string;
  assignedProjectId?: string; // 'all' or specific project id
  permissions: UserPermissions;
  isActive: boolean;
  createdAt: string;
}

export type NotificationType = 'deadline' | 'snag' | 'system' | 'safety';
export type NotificationSeverity = 'info' | 'warning' | 'urgent';

export interface NotificationItem {
  id: string;
  title: string;
  titleUrdu?: string;
  message: string;
  messageUrdu?: string;
  type: NotificationType;
  severity: NotificationSeverity;
  targetTab?: ActiveTab;
  targetProjectId?: string;
  targetId?: string;
  timestamp: string;
  isRead: boolean;
  isDismissed?: boolean;
}

export type OfflineSyncActionType = 
  | 'TASK_ADD' 
  | 'TASK_UPDATE' 
  | 'TASK_STATUS_MOVE' 
  | 'TASK_CHECKLIST_TOGGLE' 
  | 'TASK_DELETE'
  | 'LOG_ADD'
  | 'LOG_DELETE';

export interface PendingSyncItem {
  id: string;
  actionType: OfflineSyncActionType;
  entityType: 'task' | 'dailyLog';
  entityId?: string;
  projectId?: string;
  summary: string;
  summaryUrdu?: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount?: number;
  errorMessage?: string;
}


