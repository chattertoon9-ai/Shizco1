import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, formatCurrency, getPhaseName } from '../utils/translations';
import { ProjectPhase } from '../types';
import { 
  Building2, 
  MapPin, 
  Users, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus, 
  Calendar,
  CloudSun,
  BarChart3,
  Layers,
  Package,
  ShieldCheck,
  Trash2,
  Sparkles,
  Bot,
  Compass,
  HardHat,
  Activity,
  Wind,
  ThermometerSun,
  FileSpreadsheet,
  Bell,
  Clock,
  Briefcase,
  Receipt,
  PieChart as PieIcon,
  Scale,
  Kanban,
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle,
  Truck,
  LogOut,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export interface ActivityFeedItem {
  id: string;
  type: 'task' | 'material' | 'project' | 'log' | 'finance';
  title: string;
  description: string;
  projectName: string;
  projectCode: string;
  timestamp: string;
  rawDate: string;
  user: string;
  userRole: string;
  badgeText: string;
  badgeColor: string;
  targetTab: import('../types').ActiveTab;
  metric?: string;
}

interface ProjectOverviewProps {
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
  onOpenSiteAssistant?: (initialPrompt?: string) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ 
  onOpenNewProject, 
  onOpenNewTask,
  onOpenSiteAssistant
}) => {
  const { 
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
    setActiveProjectId, 
    setActiveTab, 
    language,
    isAdmin,
    hasPermission,
    deleteProject,
    setIsLoginModalOpen,
    notifications,
    unreadNotificationsCount,
    setIsNotificationCenterOpen,
    logout
  } = useProject();

  const t = translations[language];

  // Chart view switches
  const [taskChartMode, setTaskChartMode] = useState<'project' | 'phase'>('project');

  // Aggregated calculations
  const filteredProjects = activeProjectId === 'all' 
    ? projects 
    : projects.filter(p => p.id === activeProjectId);

  const relevantTasks = activeProjectId === 'all' 
    ? tasks 
    : tasks.filter(t => t.projectId === activeProjectId);

  const completedTasksCount = relevantTasks.filter(t => t.status === 'completed').length;
  const inProgressTasksCount = relevantTasks.filter(t => t.status === 'in_progress').length;
  const delayedTasksCount = relevantTasks.filter(t => t.status === 'delayed').length;
  const backlogTasksCount = relevantTasks.filter(t => t.status === 'backlog' || t.status === 'inspection').length;
  const totalTasksCount = relevantTasks.length;
  const overallTaskPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Per-project completion breakdown based on completed tasks
  const projectsCompletionBreakdown = useMemo(() => {
    return filteredProjects.map(proj => {
      const projTasks = tasks.filter(t => t.projectId === proj.id);
      const done = projTasks.filter(t => t.status === 'completed').length;
      const inProg = projTasks.filter(t => t.status === 'in_progress').length;
      const delayed = projTasks.filter(t => t.status === 'delayed').length;
      const backlog = projTasks.filter(t => t.status === 'backlog' || t.status === 'inspection').length;
      const total = projTasks.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        id: proj.id,
        name: proj.name,
        nameUrdu: proj.nameUrdu,
        code: proj.code,
        currentPhase: proj.currentPhase,
        totalTasks: total,
        completedTasks: done,
        inProgressTasks: inProg,
        delayedTasks: delayed,
        backlogTasks: backlog,
        percentage: pct,
        status: proj.status
      };
    });
  }, [filteredProjects, tasks]);

  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Calculate today's on-site workers across relevant projects
  const recentLogs = dailyLogs.filter(l => 
    activeProjectId === 'all' ? true : l.projectId === activeProjectId
  );
  const latestLog = recentLogs[0];
  
  const totalWorkersToday = latestLog 
    ? latestLog.workersCount.reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  const relevantSnags = snags.filter(s => 
    activeProjectId === 'all' ? true : s.projectId === activeProjectId
  );
  const openSnagsCount = relevantSnags.filter(s => s.status !== 'resolved').length;
  const criticalSnagsCount = relevantSnags.filter(s => s.status !== 'resolved' && s.severity === 'critical').length;

  // RECHARTS DATA PREPARATION
  // 1. Task Completion Data
  const taskProjectData = projects.map(p => {
    const pTasks = tasks.filter(t => t.projectId === p.id);
    const completed = pTasks.filter(t => t.status === 'completed').length;
    const inProgress = pTasks.filter(t => t.status === 'in_progress').length;
    const delayed = pTasks.filter(t => t.status === 'delayed').length;
    const total = pTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      name: p.code,
      fullName: language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name,
      rate,
      completed,
      inProgress,
      delayed,
      total
    };
  });

  const phasesList: ProjectPhase[] = ['excavation', 'foundation', 'structure', 'masonry', 'mep', 'finishing'];
  const taskPhaseData = phasesList.map(phase => {
    const phaseTasks = relevantTasks.filter(t => t.phase === phase);
    const completed = phaseTasks.filter(t => t.status === 'completed').length;
    const inProgress = phaseTasks.filter(t => t.status === 'in_progress').length;
    const delayed = phaseTasks.filter(t => t.status === 'delayed').length;
    const total = phaseTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      name: getPhaseName(phase, language).split('(')[0].trim(),
      rate,
      completed,
      inProgress,
      delayed,
      total
    };
  }).filter(p => p.total > 0);

  // 2. Material Spend & Volume Data
  const categoriesList = ['steel', 'cement', 'aggregates', 'bricks', 'finishing', 'plumbing', 'electrical'] as const;
  const materialData = categoriesList.map(cat => {
    const catItems = (activeProjectId === 'all' ? materials : materials.filter(m => m.projectId === activeProjectId))
      .filter(m => m.category === cat);
    
    const totalSpend = catItems.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalQty = catItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const unit = catItems[0]?.unit || 'Units';

    const categoryNames: Record<string, string> = {
      steel: language === 'ur' ? 'سریا (Steel)' : 'Steel Rebar',
      cement: language === 'ur' ? 'سیمنٹ (Cement)' : 'Cement',
      aggregates: language === 'ur' ? 'ریت و بجری' : 'Aggregates',
      bricks: language === 'ur' ? 'اینٹیں' : 'Bricks',
      finishing: language === 'ur' ? 'فنشنگ' : 'Finishing',
      plumbing: language === 'ur' ? 'پلمبنگ' : 'Plumbing',
      electrical: language === 'ur' ? 'بجلی' : 'Electrical',
    };

    return {
      name: categoryNames[cat] || cat,
      spendInLakhs: Math.round((totalSpend / 100000) * 10) / 10,
      actualSpend: totalSpend,
      quantity: totalQty,
      unit,
      receivedCount: catItems.filter(i => i.status === 'received').length,
      itemCount: catItems.length
    };
  }).filter(item => item.actualSpend > 0);

  // 3. Manpower Chart Data
  const filteredLabor = activeProjectId === 'all' ? labor : labor.filter(l => l.projectId === activeProjectId);
  const tradeMap: Record<string, number> = {};
  filteredLabor.forEach(item => {
    const key = item.trade.split('(')[0].trim();
    tradeMap[key] = (tradeMap[key] || 0) + item.headcount;
  });
  const homeTradeChartData = Object.entries(tradeMap).map(([name, value]) => ({ name, value }));
  const totalHomeLaborCount = filteredLabor.reduce((sum, item) => sum + item.headcount, 0);
  const totalDailyWageBill = filteredLabor.reduce((sum, item) => sum + (item.totalWage || (item.headcount * item.dailyWageRate)), 0);

  // 4. Accounts Category Data
  const filteredAccounts = activeProjectId === 'all' ? accounts : accounts.filter(a => a.projectId === activeProjectId);
  const accountCategoryMap: Record<string, number> = {};
  filteredAccounts.forEach(item => {
    const cat = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    accountCategoryMap[cat] = (accountCategoryMap[cat] || 0) + item.amount;
  });
  const homeAccountChartData = Object.entries(accountCategoryMap).map(([name, value]) => ({ name, value }));
  const totalAccountsDisbursed = filteredAccounts
    .filter(a => a.status === 'paid' || a.status === 'cleared')
    .reduce((sum, a) => sum + a.amount, 0);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  // Custom Dark Recharts Tooltip for Tasks
  const CustomTaskTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-blue-900/60 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
          <div className="font-bold text-white border-b border-slate-800 pb-1">
            {data.fullName || label}
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span className="text-blue-400 font-semibold">{language === 'ur' ? 'تکمیل کی شرح:' : 'Completion Rate:'}</span>
            <span className="font-mono font-bold text-white tabular-nums">{data.rate}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span>{language === 'ur' ? 'مکمل کام:' : 'Completed:'}</span>
            <span className="font-mono text-emerald-400 tabular-nums">{data.completed}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span>{language === 'ur' ? 'جاری کام:' : 'In Progress:'}</span>
            <span className="font-mono text-blue-400 tabular-nums">{data.inProgress}</span>
          </div>
          {data.delayed > 0 && (
            <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
              <span>{language === 'ur' ? 'تاخیر:' : 'Delayed:'}</span>
              <span className="font-mono text-rose-400 tabular-nums">{data.delayed}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px] pt-1 border-t border-slate-800">
            <span>{language === 'ur' ? 'کل کام:' : 'Total Tasks:'}</span>
            <span className="font-mono text-white tabular-nums">{data.total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dark Recharts Tooltip for Materials
  const CustomMaterialTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-emerald-900/60 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
          <div className="font-bold text-white border-b border-slate-800 pb-1">
            {data.name}
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span className="text-emerald-400 font-semibold">{language === 'ur' ? 'کل خرچ:' : 'Total Expenditure:'}</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {formatCurrency(data.actualSpend, language)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span>{language === 'ur' ? 'مقدار (Quantity):' : 'Volume / Qty:'}</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {data.quantity.toLocaleString()} {data.unit}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span>{language === 'ur' ? 'رجسٹرڈ بلز/انوائسز:' : 'Ledger Invoices:'}</span>
            <span className="font-mono text-slate-300 tabular-nums">{data.itemCount}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Recent Activity Feed State
  const [activityCategory, setActivityCategory] = useState<'all' | 'task' | 'material' | 'project' | 'log'>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);

  // Generate Timestamped Recent Activity Feed (Tasks, Materials, Projects, Logs)
  const recentActivities = useMemo<ActivityFeedItem[]>(() => {
    const list: ActivityFeedItem[] = [];

    // 1. Task Updates & New Tasks
    relevantTasks.forEach(task => {
      const proj = projects.find(p => p.id === task.projectId);
      const projName = proj ? (language === 'ur' && proj.nameUrdu ? proj.nameUrdu : proj.name) : 'Site Project';
      const projCode = proj?.code || 'SITE';

      if (task.status === 'completed') {
        list.push({
          id: `act-task-${task.id}`,
          type: 'task',
          title: language === 'ur' ? `کام مکمل: ${task.titleUrdu || task.title}` : `Task Completed: ${task.title}`,
          description: language === 'ur' 
            ? `${task.trade} کام 100% مکمل کیا گیا۔ کنٹریکٹر: ${task.contractor}۔ کریو: ${task.crewSize} افراد`
            : `${task.trade} milestone 100% completed by ${task.contractor}. Final crew: ${task.crewSize} personnel.`,
          projectName: projName,
          projectCode: projCode,
          timestamp: task.actualEndDate || task.dueDate,
          rawDate: task.actualEndDate || task.dueDate,
          user: task.contractor,
          userRole: 'Contractor Lead',
          badgeText: language === 'ur' ? 'مکمل شدہ' : 'Completed',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          targetTab: 'tasks',
          metric: `${task.progressPercentage}% Progress`
        });
      } else if (task.status === 'in_progress') {
        list.push({
          id: `act-task-${task.id}`,
          type: 'task',
          title: language === 'ur' ? `کام جاری: ${task.titleUrdu || task.title}` : `Task In Progress: ${task.title}`,
          description: language === 'ur'
            ? `${task.trade} فیز ${task.phase} میں فعال ہے۔ پیش رفت: ${task.progressPercentage}%۔ کنٹریکٹر: ${task.contractor}`
            : `${task.trade} active in ${task.phase} phase. Burndown: ${task.progressPercentage}%. Managed by ${task.contractor}.`,
          projectName: projName,
          projectCode: projCode,
          timestamp: task.startDate,
          rawDate: task.startDate,
          user: task.contractor,
          userRole: 'Trade Supervisor',
          badgeText: language === 'ur' ? 'جاری کام' : 'Active',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          targetTab: 'tasks',
          metric: `${task.progressPercentage}% Done`
        });
      } else if (task.status === 'delayed') {
        list.push({
          id: `act-task-${task.id}`,
          type: 'task',
          title: language === 'ur' ? `تاخیر کا شکار ٹاسک: ${task.titleUrdu || task.title}` : `Milestone Delayed: ${task.title}`,
          description: language === 'ur'
            ? `ڈیڈلائن ${task.dueDate} سے تاخیر ہو چکی ہے۔ فوری معائنہ مطلوب ہے۔`
            : `Overdue milestone since ${task.dueDate}. Priority escalation required for ${task.trade}.`,
          projectName: projName,
          projectCode: projCode,
          timestamp: task.dueDate,
          rawDate: task.dueDate,
          user: 'QA Team',
          userRole: 'Inspector',
          badgeText: language === 'ur' ? 'تاخیر' : 'Delayed',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          targetTab: 'tasks',
          metric: 'Attention'
        });
      } else {
        list.push({
          id: `act-task-${task.id}`,
          type: 'task',
          title: language === 'ur' ? `نیا ٹاسک شیڈول: ${task.titleUrdu || task.title}` : `Task Scheduled: ${task.title}`,
          description: language === 'ur'
            ? `فیز ${task.phase} کے لیے نیا ٹاسک درج کیا گیا۔ مقررہ تاریخ: ${task.dueDate}`
            : `Scheduled under ${task.phase} phase. Target completion: ${task.dueDate} (${task.priority.toUpperCase()} priority).`,
          projectName: projName,
          projectCode: projCode,
          timestamp: task.startDate,
          rawDate: task.startDate,
          user: 'Site Engineer',
          userRole: 'Planning',
          badgeText: language === 'ur' ? 'شیڈول' : 'Planned',
          badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600',
          targetTab: 'tasks',
          metric: task.priority.toUpperCase()
        });
      }
    });

    // 2. Materials Usage & Deliveries
    const relevantMaterials = activeProjectId === 'all' 
      ? materials 
      : materials.filter(m => m.projectId === activeProjectId);

    relevantMaterials.forEach(mat => {
      const proj = projects.find(p => p.id === mat.projectId);
      const projName = proj ? (language === 'ur' && proj.nameUrdu ? proj.nameUrdu : proj.name) : 'Site Project';
      const projCode = proj?.code || 'SITE';

      if (mat.status === 'received') {
        list.push({
          id: `act-mat-${mat.id}`,
          type: 'material',
          title: language === 'ur' ? `مٹیریل ڈیلیوری موصول: ${mat.materialName}` : `Material Received: ${mat.materialName}`,
          description: language === 'ur'
            ? `سپلائر: ${mat.supplier}۔ انوائس نمبر: ${mat.invoiceNo || 'N/A'}۔ کل مالیت: PKR ${mat.totalAmount.toLocaleString()}`
            : `Received from ${mat.supplier}. Invoice #${mat.invoiceNo || 'N/A'}. Value: PKR ${mat.totalAmount.toLocaleString()}.`,
          projectName: projName,
          projectCode: projCode,
          timestamp: mat.date,
          rawDate: mat.date,
          user: mat.supplier,
          userRole: 'Verified Supplier',
          badgeText: language === 'ur' ? 'موصول شدہ' : 'Received',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          targetTab: 'materials',
          metric: `${mat.quantity} ${mat.unit}`
        });
      } else if (mat.status === 'consumed') {
        list.push({
          id: `act-mat-${mat.id}`,
          type: 'material',
          title: language === 'ur' ? `مٹیریل استعمال (Consumed): ${mat.materialName}` : `Material Consumed On-Site: ${mat.materialName}`,
          description: language === 'ur'
            ? `تعمیراتی سائٹ پر ${mat.quantity} ${mat.unit} کھپت ریکارڈ کی گئی۔ مالیت: PKR ${mat.totalAmount.toLocaleString()}`
            : `${mat.quantity} ${mat.unit} consumed in structural construction operations on site.`,
          projectName: projName,
          projectCode: projCode,
          timestamp: mat.date,
          rawDate: mat.date,
          user: 'Store In-Charge',
          userRole: 'Inventory',
          badgeText: language === 'ur' ? 'استعمال شدہ' : 'Consumed',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          targetTab: 'materials',
          metric: `${mat.quantity} ${mat.unit}`
        });
      } else {
        list.push({
          id: `act-mat-${mat.id}`,
          type: 'material',
          title: language === 'ur' ? `مٹیریل آرڈر جاری: ${mat.materialName}` : `Material Purchase Order: ${mat.materialName}`,
          description: language === 'ur'
            ? `سپلائر ${mat.supplier} کے پاس ${mat.quantity} ${mat.unit} کا آرڈر دیا گیا۔ مالیت: PKR ${mat.totalAmount.toLocaleString()}`
            : `Purchase order placed with ${mat.supplier} for ${mat.quantity} ${mat.unit}. Total: PKR ${mat.totalAmount.toLocaleString()}.`,
          projectName: projName,
          projectCode: projCode,
          timestamp: mat.date,
          rawDate: mat.date,
          user: 'Procurement Officer',
          userRole: 'Purchasing',
          badgeText: language === 'ur' ? 'آرڈر شدہ' : 'Ordered',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          targetTab: 'materials',
          metric: `${mat.quantity} ${mat.unit}`
        });
      }
    });

    // 3. Project Updates
    filteredProjects.forEach(p => {
      const spendPercent = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
      list.push({
        id: `act-proj-${p.id}`,
        type: 'project',
        title: language === 'ur' ? `پروجیکٹ اپ ڈیٹ: ${p.nameUrdu || p.name}` : `Project Milestone: ${p.name}`,
        description: language === 'ur'
          ? `پروجیکٹ فیز: ${p.currentPhase.toUpperCase()}۔ کل خرچ: PKR ${p.spent.toLocaleString()} (${spendPercent}%)۔ پراجیکٹ مینیجر: ${p.projectManager}`
          : `Active phase: ${p.currentPhase.toUpperCase()}. Spent: PKR ${p.spent.toLocaleString()} (${spendPercent}% of budget). Target: ${p.targetEndDate}. PM: ${p.projectManager}.`,
        projectName: language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name,
        projectCode: p.code,
        timestamp: p.startDate,
        rawDate: p.startDate,
        user: p.projectManager,
        userRole: 'Project Manager',
        badgeText: p.currentPhase.toUpperCase(),
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        targetTab: 'projects',
        metric: `${spendPercent}% Budget`
      });
    });

    // 4. Daily Site Logs
    recentLogs.forEach(log => {
      const proj = projects.find(p => p.id === log.projectId);
      const projName = proj ? (language === 'ur' && proj.nameUrdu ? proj.nameUrdu : proj.name) : 'Site Project';
      const projCode = proj?.code || 'SITE';
      const totalWorkers = log.workersCount.reduce((acc, c) => acc + c.count, 0);

      list.push({
        id: `act-log-${log.id}`,
        type: 'log',
        title: language === 'ur' ? `روزنامچہ سائٹ رپورٹ: ${log.date}` : `Daily Site Log Filed: ${log.date}`,
        description: language === 'ur'
          ? `سپروائزر: ${log.supervisor}۔ کل عملہ: ${totalWorkers} افراد۔ رپورٹ: ${log.workSummary.slice(0, 100)}...`
          : `Supervisor ${log.supervisor} logged: "${log.workSummary.slice(0, 95)}...". On-site labor: ${totalWorkers} workers (${log.temperatureC}°C).`,
        projectName: projName,
        projectCode: projCode,
        timestamp: log.date,
        rawDate: log.date,
        user: log.supervisor,
        userRole: 'Site Supervisor',
        badgeText: `${totalWorkers} Workers`,
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        targetTab: 'daily_logs',
        metric: `${log.temperatureC}°C`
      });
    });

    // Sort by rawDate descending
    list.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    return list;
  }, [relevantTasks, materials, filteredProjects, recentLogs, projects, activeProjectId, language]);

  // Filtered by category and search
  const filteredActivities = useMemo<ActivityFeedItem[]>(() => {
    return recentActivities.filter((item: ActivityFeedItem) => {
      const matchesCategory = activityCategory === 'all' ? true : item.type === activityCategory;
      const q = activitySearch.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.projectCode.toLowerCase().includes(q) ||
        item.user.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [recentActivities, activityCategory, activitySearch]);

  // Formal Project Report PDF Generation using jsPDF
  const downloadProjectReportPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const selectedProj = activeProjectId === 'all' 
        ? null 
        : projects.find(p => p.id === activeProjectId);

      const reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const reportRef = `AAC-PR-${selectedProj ? selectedProj.code : 'ALL'}-${Date.now().toString().slice(-6)}`;

      // Header Banner (Slate-900 with Al Asad Blue Accent)
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 38, 'F');
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 36, 210, 2, 'F');

      // Brand Title & Description
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('AL ASAD CONSTRUCTORS (PVT) LTD', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Civil Engineering, High-Rise & Infrastructure Contractors', 14, 21);
      doc.text('Executive Project Telemetry, Active Tasks & Materials Audit Report', 14, 26);

      // Report Reference Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(59, 130, 246);
      doc.text(`DOC REF: ${reportRef}`, 142, 15);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${reportDate}`, 142, 21);
      doc.text(`Classification: Executive / Confidential`, 142, 26);

      // Section 1: Project Scope & Financial Summary
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. PROJECT SCOPE & FINANCIAL METRICS', 14, 46);

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 49, 182, 34, 2, 2, 'F');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);

      const projTitle = selectedProj ? `${selectedProj.name} (${selectedProj.code})` : 'All Active Construction Sites Combined';
      const clientName = selectedProj ? selectedProj.client : 'Multiple Commercial & Institutional Clients';
      const locationName = selectedProj ? selectedProj.location : 'Karachi, Bahria Town, DHA & Gwadar Port';
      const currentPhaseStr = selectedProj ? selectedProj.currentPhase.toUpperCase() : 'MULTI-PHASE ACTIVE';

      doc.text(`Project Name: ${projTitle}`, 18, 56);
      doc.text(`Client Authority: ${clientName}`, 18, 62);
      doc.text(`Site Location: ${locationName}`, 18, 68);
      doc.text(`Current Phase: ${currentPhaseStr}`, 18, 74);

      doc.text(`Total Budget: ${formatCurrency(totalBudget)}`, 110, 56);
      doc.text(`Expenditure: ${formatCurrency(totalSpent)} (${budgetUtilization}%)`, 110, 62);
      doc.text(`Budget Balance: ${formatCurrency(totalBudget - totalSpent)}`, 110, 68);
      doc.text(`Task Progress: ${overallTaskPercentage}% (${completedTasksCount}/${totalTasksCount} done)`, 110, 74);

      // Section 2: Active Tasks Breakdown Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. ACTIVE TASKS & WORK BREAKDOWN', 14, 91);

      // Table Header
      doc.setFillColor(30, 41, 59);
      doc.rect(14, 94, 182, 6.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Task Title', 16, 98.5);
      doc.text('Phase', 78, 98.5);
      doc.text('Contractor', 106, 98.5);
      doc.text('Status', 148, 98.5);
      doc.text('Progress', 174, 98.5);

      let currentY = 105;
      const tasksToPrint = relevantTasks.slice(0, 10);
      tasksToPrint.forEach((task, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, currentY - 4, 182, 5.5, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);

        const shortTitle = task.title.length > 36 ? task.title.slice(0, 34) + '...' : task.title;
        doc.text(shortTitle, 16, currentY);
        doc.text(task.phase.toUpperCase(), 78, currentY);
        doc.text(task.contractor.slice(0, 22), 106, currentY);

        if (task.status === 'completed') doc.setTextColor(16, 185, 129);
        else if (task.status === 'delayed') doc.setTextColor(225, 29, 72);
        else doc.setTextColor(37, 99, 235);
        doc.text(task.status.toUpperCase(), 148, currentY);

        doc.setTextColor(30, 41, 59);
        doc.text(`${task.progressPercentage}%`, 176, currentY);

        currentY += 5.5;
      });

      // Section 3: Material Usage Ledger Table
      currentY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('3. MATERIAL USAGE & INVENTORY CONSUMPTION', 14, currentY);
      currentY += 3.5;

      // Table Header
      doc.setFillColor(30, 41, 59);
      doc.rect(14, currentY, 182, 6.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Material Description', 16, currentY + 4.5);
      doc.text('Category', 82, currentY + 4.5);
      doc.text('Quantity / Unit', 118, currentY + 4.5);
      doc.text('Total Cost (PKR)', 158, currentY + 4.5);
      currentY += 10;

      const materialsToPrint = (activeProjectId === 'all' 
        ? materials 
        : materials.filter(m => m.projectId === activeProjectId)
      ).slice(0, 7);

      materialsToPrint.forEach((mat, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, currentY - 4, 182, 5.5, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);

        doc.text(mat.materialName.slice(0, 36), 16, currentY);
        doc.text(mat.category.toUpperCase(), 82, currentY);
        doc.text(`${mat.quantity.toLocaleString()} ${mat.unit}`, 118, currentY);
        doc.text(formatCurrency(mat.totalAmount), 158, currentY);

        currentY += 5.5;
      });

      // Section 4: Formal Certification Sign-off Block
      currentY += 6;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, currentY, 182, 22, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);

      doc.text('PREPARED BY: Planning & Project Controls Engineer', 18, currentY + 8);
      doc.text('VERIFIED BY: Chief Resident Engineer (PEC Registered)', 18, currentY + 16);
      doc.text('APPROVED BY: Director Projects & Contracts', 110, currentY + 8);
      doc.text('OFFICIAL STAMP: ___________________________', 110, currentY + 16);

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated via Al Asad Construction Intelligence System • copyright @ 2026, ShizCon', 14, 287);
      doc.text(`Page 1 of 1 · ${reportRef}`, 160, 287);

      doc.save(`AlAsad_Project_Report_${selectedProj ? selectedProj.code : 'ALL'}_${reportDate.replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate project report PDF:', err);
      alert(language === 'ur' ? 'پی ڈی ایف رپورٹ بنانے میں خرابی پیش آگئی' : 'Failed to generate PDF project report');
    }
  };

  return (
    <div className="space-y-8 pb-14 animate-fadeIn">
      {/* Executive Command Header - Al Asad Royal Blue & Emerald Aesthetic */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/80 border border-blue-900/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                {language === 'ur' ? 'لائیو کمانڈ سنٹر' : 'Executive Command Center'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {new Date().toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <Activity className="w-3.5 h-3.5" />
                {filteredProjects.length} {language === 'ur' ? 'سائٹس فعال' : 'Active Sites Online'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{language === 'ur' ? 'الاسد کنسٹرکٹرز — ایگزیکٹو ڈیش بورڈ' : 'Al Asad Constructors — Operations Hub'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {language === 'ur' 
                ? 'ہائی ڈینسٹی پروجیکٹ ٹریکنگ، سول انجینئرنگ کیلکولیشنز، میٹریل لیجر، اور گوگل میپس گراؤنڈنگ انٹیلیجنس برائے تعمیراتی سائٹس۔'
                : 'Enterprise civil project telemetry, structural milestones, inventory burndown, and Gemini-powered geospatial site intelligence.'}
            </p>
          </div>

          {/* Action Hub & Gemini Site Intelligence Launcher */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Site AI Assistant Trigger */}
            <button
              onClick={() => onOpenSiteAssistant?.()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{language === 'ur' ? 'الاسد سائٹ اے آئی' : 'Site AI Intelligence'}</span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-blue-900/80 text-blue-200 rounded uppercase">
                Maps
              </span>
            </button>

            {/* Project Filter Dropdown */}
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
            >
              <option value="all">{language === 'ur' ? 'تمام تعمیراتی سائٹس (All Sites)' : 'All Construction Sites'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name}
                </option>
              ))}
            </select>

            {/* Download Project Report via jsPDF */}
            <button
              onClick={downloadProjectReportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
              title={language === 'ur' ? 'رسمی پروجیکٹ رپورٹ ڈاؤن لوڈ کریں (PDF)' : 'Download Executive Project Report (PDF)'}
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ur' ? 'رپورٹ PDF ڈاؤن لوڈ' : 'Download Report'}</span>
            </button>

            {/* New Project CTA */}
            <button
              onClick={() => {
                if (!hasPermission('canCreateProjects')) {
                  setIsLoginModalOpen(true);
                  return;
                }
                onOpenNewProject();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
              title={!hasPermission('canCreateProjects') ? (language === 'ur' ? 'نیا پروجیکٹ بنانے کے لیے ایڈمن لاگ ان درکار ہے' : 'Create project permission required') : undefined}
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>{t.newProject}</span>
              {!hasPermission('canCreateProjects') && (
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono uppercase tracking-wider">
                  Admin
                </span>
              )}
            </button>

            {/* Home Page Direct Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
              title={language === 'ur' ? 'اکاؤنٹ سے لاگ آؤٹ کریں' : 'Log out of account'}
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Live Weather & Geospatial Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Site Climate</span>
              <span className="font-semibold text-white">26°C · Sunny & Dry</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <ThermometerSun className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Concrete Curing</span>
              <span className="font-semibold text-emerald-400">Optimal Condition</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Wind className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Tower Crane Wind</span>
              <span className="font-semibold text-white">11 km/h (Safe Limits)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">HSE Safety Record</span>
              <span className="font-semibold text-emerald-300">248 Days LTI Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live In-App Alerts Banner for Deadlines & Pending Snag Resolutions */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 border border-blue-900/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-700/50 text-blue-400 relative shrink-0">
              <Bell className="w-5 h-5 text-blue-400" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 ring-2 ring-slate-950 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {language === 'ur' ? 'سائٹ مانیٹرنگ الرٹس' : 'Active Site Alerts & Deadlines'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  {notifications.filter(n => n.type === 'deadline').length} {language === 'ur' ? 'ڈیڈلائنز' : 'Deadlines'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  {notifications.filter(n => n.type === 'snag').length} {language === 'ur' ? 'نقائص' : 'Snags Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ur'
                  ? 'منصوبوں کی آخری تاریخیں اور غیر حل شدہ نقائص زیر غور ہیں۔'
                  : `${unreadNotificationsCount} unread alert(s) regarding upcoming target milestones and pending snag resolutions.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'الرٹ سینٹر کھولیں' : 'View All in Notification Center'}</span>
          </button>
        </div>
      )}

      {/* HIGH-FIDELITY PROJECT PROGRESS VISUAL INDICATOR (PERCENTAGE BAR) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-blue-900/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header Row: Title, active site indicator & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {language === 'ur' ? 'پروجیکٹ کی مجموعی پیش رفت' : 'Project Progress & Completion Status'}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {activeProjectId === 'all' 
                      ? (language === 'ur' ? 'تمام سائٹس' : 'All Sites Combined') 
                      : (filteredProjects[0]?.code || 'Site')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ur'
                    ? `مکمل شدہ ٹاسکس کی بنیاد پر اصل پیش رفت: ${completedTasksCount} از ${totalTasksCount} کام مکمل`
                    : `Task-driven completion status: ${completedTasksCount} of ${totalTasksCount} milestone tasks completed.`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Open Tasks Board"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'ٹاسک بورڈ کھولیں' : 'View Task Board'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Visual Percentage Indicator & Multi-Segment Progress Bar */}
        <div className="space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums font-mono">
                {overallTaskPercentage}%
              </span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-300 block">
                  {language === 'ur' ? 'مجموعی تکمیل کی شرح' : 'Overall Completion Rate'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {completedTasksCount} / {totalTasksCount} {language === 'ur' ? 'کام مکمل' : 'milestones finalized'}
                </span>
              </div>
            </div>

            {/* Health / Pace Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                overallTaskPercentage >= 75
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : overallTaskPercentage >= 40
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  overallTaskPercentage >= 75 ? 'bg-emerald-400 animate-pulse' : overallTaskPercentage >= 40 ? 'bg-blue-400' : 'bg-amber-400'
                }`} />
                <span>
                  {overallTaskPercentage >= 75 
                    ? (language === 'ur' ? 'منصوبہ اختتامی مراحل میں ہے' : 'Advanced Completion Stage')
                    : overallTaskPercentage >= 40
                    ? (language === 'ur' ? 'منصوبہ بر وقت جاری ہے' : 'Steady Execution on Schedule')
                    : (language === 'ur' ? 'ابتدائی / فاؤنڈیشن فیز' : 'Early Phase Execution')}
                </span>
              </span>
            </div>
          </div>

          {/* Primary High-Impact Percentage Progress Bar */}
          <div className="relative">
            <div className="w-full bg-slate-950/90 rounded-2xl h-5 sm:h-6 p-1 border border-slate-800 shadow-inner overflow-hidden flex relative">
              {/* Completed tasks segment */}
              {totalTasksCount > 0 && completedTasksCount > 0 && (
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-xl transition-all duration-700 relative group/bar flex items-center justify-end pr-1 shadow-sm shadow-emerald-500/30"
                  style={{ width: `${(completedTasksCount / totalTasksCount) * 100}%` }}
                  title={`Completed: ${completedTasksCount} tasks (${overallTaskPercentage}%)`}
                >
                  {((completedTasksCount / totalTasksCount) * 100) > 12 && (
                    <span className="text-[10px] font-mono font-bold text-slate-950 tracking-tight select-none">
                      {Math.round((completedTasksCount / totalTasksCount) * 100)}%
                    </span>
                  )}
                </div>
              )}

              {/* In Progress tasks segment */}
              {totalTasksCount > 0 && inProgressTasksCount > 0 && (
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-xl transition-all duration-700 relative group/bar flex items-center justify-end pr-1 shadow-sm shadow-blue-500/30"
                  style={{ width: `${(inProgressTasksCount / totalTasksCount) * 100}%` }}
                  title={`In Progress: ${inProgressTasksCount} tasks (${Math.round((inProgressTasksCount / totalTasksCount) * 100)}%)`}
                >
                  {((inProgressTasksCount / totalTasksCount) * 100) > 12 && (
                    <span className="text-[10px] font-mono font-bold text-white tracking-tight select-none">
                      {Math.round((inProgressTasksCount / totalTasksCount) * 100)}%
                    </span>
                  )}
                </div>
              )}

              {/* Delayed tasks segment */}
              {totalTasksCount > 0 && delayedTasksCount > 0 && (
                <div 
                  className="bg-gradient-to-r from-rose-600 to-rose-500 h-full rounded-xl transition-all duration-700 relative group/bar flex items-center justify-end pr-1 shadow-sm shadow-rose-500/30"
                  style={{ width: `${(delayedTasksCount / totalTasksCount) * 100}%` }}
                  title={`Delayed: ${delayedTasksCount} tasks (${Math.round((delayedTasksCount / totalTasksCount) * 100)}%)`}
                >
                  {((delayedTasksCount / totalTasksCount) * 100) > 10 && (
                    <span className="text-[10px] font-mono font-bold text-white tracking-tight select-none">
                      !
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Percentage Scale Markers (0%, 25%, 50%, 75%, 100%) */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-1">
              <span>0%</span>
              <span className="hidden sm:inline">25% (Quarters)</span>
              <span>50% (Midway)</span>
              <span className="hidden sm:inline">75% (Finishing)</span>
              <span>100% (Delivery)</span>
            </div>
          </div>

          {/* Metric Status Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block truncate">
                  {language === 'ur' ? 'مکمل شدہ کام' : 'Completed Tasks'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                  {completedTasksCount} <span className="text-[10px] text-slate-400">({overallTaskPercentage}%)</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block truncate">
                  {language === 'ur' ? 'جاری کام' : 'In Progress'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-blue-400 font-mono">
                  {inProgressTasksCount} <span className="text-[10px] text-slate-400">({totalTasksCount > 0 ? Math.round((inProgressTasksCount / totalTasksCount) * 100) : 0}%)</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block truncate">
                  {language === 'ur' ? 'تاخیر کے شکار' : 'Delayed / Attention'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-rose-400 font-mono">
                  {delayedTasksCount} <span className="text-[10px] text-slate-400">({totalTasksCount > 0 ? Math.round((delayedTasksCount / totalTasksCount) * 100) : 0}%)</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block truncate">
                  {language === 'ur' ? 'بیک لاگ و معائنہ' : 'Backlog & QA'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-300 font-mono">
                  {backlogTasksCount} <span className="text-[10px] text-slate-400">({totalTasksCount > 0 ? Math.round((backlogTasksCount / totalTasksCount) * 100) : 0}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-Site Individual Progress Bars (Shows breakdown across active sites) */}
        {projectsCompletionBreakdown.length > 1 && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'ur' ? 'تمام سائٹس کی الگ الگ پیش رفت' : 'Individual Project Progress Telemetry'}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {projectsCompletionBreakdown.length} {language === 'ur' ? 'منصوبے زیر نگرانی' : 'Sites Monitored'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projectsCompletionBreakdown.map(proj => (
                <div 
                  key={proj.id}
                  onClick={() => {
                    setActiveProjectId(proj.id);
                  }}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 shrink-0">
                        {proj.code}
                      </span>
                      <span className="font-bold text-slate-200 truncate group-hover:text-blue-300 transition-colors">
                        {language === 'ur' && proj.nameUrdu ? proj.nameUrdu : proj.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs shrink-0">
                      {proj.percentage}%
                    </span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Phase: <strong className="text-slate-300 font-normal">{proj.currentPhase}</strong></span>
                    <span>{proj.completedTasks} of {proj.totalTasks} done</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4 CORE EXECUTIVE PILLARS - HOME, PROJECT, TASK, MANPOWER, ACCOUNTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {language === 'ur' ? 'ایگزیکٹو خلاصہ اور مرکزی شعبہ جات (Core Summary & Modules)' : 'Executive Summary & Core Management Modules'}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Al Asad Construction Command
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Projects */}
          <div 
            onClick={() => setActiveTab('projects')}
            className="group cursor-pointer bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-blue-900/40 hover:border-blue-500/60 p-4.5 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {filteredProjects.length} Sites
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
              <span>{language === 'ur' ? 'پروجیکٹس سمری' : 'Projects Summary'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {formatCurrency(totalBudget, language)} Budget
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">
                {filteredProjects.filter(p => p.status === 'in_progress').length} In Progress
              </span>
              <span className="text-slate-500">View Details →</span>
            </div>
          </div>

          {/* Pillar 2: Tasks & Kanban */}
          <div 
            onClick={() => setActiveTab('tasks')}
            className="group cursor-pointer bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/40 hover:border-indigo-500/60 p-4.5 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {overallTaskPercentage}% Complete
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
              <span>{language === 'ur' ? 'ٹاسکس سمری' : 'Tasks Summary'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {completedTasksCount} of {totalTasksCount} milestones done
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-blue-400 font-medium">
                {inProgressTasksCount} Active / {delayedTasksCount} Delayed
              </span>
              <span className="text-slate-500">Kanban Board →</span>
            </div>
          </div>

          {/* Pillar 3: Manpower */}
          <div 
            onClick={() => setActiveTab('manpower')}
            className="group cursor-pointer bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-900/40 hover:border-emerald-500/60 p-4.5 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <HardHat className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {totalHomeLaborCount} Present
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              <span>{language === 'ur' ? 'افرادی قوت سمری' : 'Manpower Summary'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Est. {formatCurrency(totalDailyWageBill, language)} daily wages
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">
                Masons, Steel, Carpenters
              </span>
              <span className="text-slate-500">Muster Roll →</span>
            </div>
          </div>

          {/* Pillar 4: Accounts */}
          <div 
            onClick={() => setActiveTab('accounts')}
            className="group cursor-pointer bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-900/40 hover:border-amber-500/60 p-4.5 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {budgetUtilization}% Spent
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
              <span>{language === 'ur' ? 'اکاؤنٹس سمری' : 'Accounts Summary'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {formatCurrency(totalSpent, language)} Actual Outflow
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-medium">
                {formatCurrency(Math.max(0, totalBudget - totalSpent), language)} Bal.
              </span>
              <span className="text-slate-500">Cash Ledger →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Executive Feature: FBR & SRB Tax Invoices & RFQ Hub */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-blue-800/40 rounded-2xl p-4.5 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-900/30">
              <Scale className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {language === 'ur' ? 'صرف ایڈمنسٹریٹر' : 'Admin Exclusive'}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-mono text-emerald-400">NTN: 7492104-7 · STRN & SRB Active</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {language === 'ur' 
                  ? 'ٹیکس و آر ایف کیو مینجمنٹ (FBR 18% GST / SRB 13% SST)' 
                  : 'FBR & SRB Tax Compliance, Invoicing & RFQ Tenders'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ur'
                  ? `کل ٹیکس انوائسز: ${taxInvoices.length} | فعال ٹینڈرز / RFQs: ${rfqs.length} | کراچی سندھ پاکستان کمپلائنس`
                  : `Active Invoices: ${taxInvoices.length} | Open RFQ Tenders: ${rfqs.length} | WHT Section 153 & Sindh Sales Tax Engine`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('tax_compliance')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>{language === 'ur' ? 'ٹیکس و آر ایف کیو پورٹل کھولیں' : 'Open Tax & RFQ Portal'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PRO LEVEL KPI METRIC STRIP - 5 Cards (Logo Royal Blue, Emerald, Obsidian) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Critical Path Milestone Rate */}
        <div className="bg-slate-900/90 border border-blue-900/40 hover:border-blue-500/50 rounded-2xl p-4.5 shadow-lg relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.overallProgress}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
            {overallTaskPercentage}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-emerald-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${overallTaskPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span className="text-slate-200 font-semibold">{completedTasksCount} / {totalTasksCount}</span>
            <span>{language === 'ur' ? 'کام مکمل' : 'Tasks Done'}</span>
          </div>
        </div>

        {/* Card 2: Portfolio Approved Budget */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4.5 shadow-lg relative overflow-hidden transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.totalBudget}</span>
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums truncate tracking-tight">
            {formatCurrency(totalBudget, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
            <span>{filteredProjects.length} {language === 'ur' ? 'پروجیکٹس' : 'Active Projects'}</span>
            <span className="text-blue-400 font-mono text-[10px] uppercase">Approved</span>
          </div>
        </div>

        {/* Card 3: Actual Spent & Financial Burn */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4.5 shadow-lg relative overflow-hidden transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.totalSpent}</span>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {budgetUtilization}%
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums truncate tracking-tight">
            {formatCurrency(totalSpent, language)}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full ${budgetUtilization > 90 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{totalBudget - totalSpent >= 0 ? t.underBudget : t.overBudget}</span>
            <span className="text-slate-300 font-mono text-[10px]">
              {formatCurrency(totalBudget - totalSpent, language)} Rem.
            </span>
          </div>
        </div>

        {/* Card 4: Workforce On-Site Today */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4.5 shadow-lg relative overflow-hidden transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.workersOnSiteToday}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
            {totalWorkersToday}
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">Trades & Labor</span>
            <span className="text-[10px] text-slate-500 font-mono">Shift 01 (Day)</span>
          </div>
        </div>

        {/* Card 5: Snag Triage & Zero Incident Safety */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4.5 shadow-lg relative overflow-hidden transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.openSnags}</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${openSnagsCount > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight ${openSnagsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {openSnagsCount}
            </span>
            {criticalSnagsCount > 0 && (
              <span className="text-xs font-mono font-bold text-rose-400">
                ({criticalSnagsCount} crit.)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
            <span>{openSnagsCount === 0 ? 'Zero Defects' : 'Resolution Pending'}</span>
            <button
              onClick={() => setActiveTab('snags')}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              Open Log →
            </button>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL RECHARTS INTEGRATION - Executive Blue & Emerald Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Task Completion Rates */}
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold mb-0.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'کام کی تکمیل کا تقابل' : 'Milestone Execution Analytics'}</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'ur' ? 'کام کی تکمیل کی شرح (Task Completion %)' : 'Task Completion Rates (%)'}
              </h3>
            </div>

            {/* Segmented Mode Control */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs self-start sm:self-auto">
              <button
                onClick={() => setTaskChartMode('project')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  taskChartMode === 'project'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ur' ? 'پروجیکٹس' : 'By Project'}
              </button>
              <button
                onClick={() => setTaskChartMode('phase')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  taskChartMode === 'phase'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ur' ? 'مراحل (Phases)' : 'By Phase'}
              </button>
            </div>
          </div>

          {/* Recharts Bar Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taskChartMode === 'project' ? taskProjectData : taskPhaseData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barBlueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.85}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTaskTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} />
                <Bar 
                  dataKey="rate" 
                  name="Completion Rate (%)" 
                  fill="url(#barBlueGradient)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {language === 'ur' 
                ? `مجموعی مکمل شدہ: ${completedTasksCount} / ${totalTasksCount} کام` 
                : `Active Tasks: ${completedTasksCount} done, ${inProgressTasksCount} ongoing, ${delayedTasksCount} delayed`}
            </span>
            <span className="font-mono text-blue-400 font-bold">{overallTaskPercentage}% overall</span>
          </div>
        </div>

        {/* Chart 2: Material Usage & Spend Trends */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-0.5">
                <Package className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'سامان و انوینٹری اخراجات' : 'Material Spend & Procurement'}</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'ur' ? 'میٹریل کے رجحانات اور اخراجات' : 'Material Usage Trends & Expenditure'}
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => onOpenSiteAssistant?.('Analyze current material consumption, steel & cement stockout risk, and price trends.')}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer"
                title="Ask AI to analyze material rates"
              >
                <Bot className="w-3 h-3 text-emerald-400" />
                <span>AI Material Audit</span>
              </button>
              <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span>PKR (Lakhs)</span>
              </div>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={materialData}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="materialGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomMaterialTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="spendInLakhs" 
                  name="Spend (Lakhs)" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#materialGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {language === 'ur' ? 'سب سے زیادہ لاگت: گریڈ 60 سریا اور سیمنٹ' : 'Primary Assets: ASTM A615 Grade 60 Rebar & OPC Cement'}
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {formatCurrency(materials.reduce((s, m) => s + m.totalAmount, 0), language)}
            </span>
          </div>
        </div>

        {/* Chart 3: Manpower & Labor Trade Distribution */}
        <div className="bg-slate-900/90 border border-indigo-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-0.5">
                <HardHat className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'افرادی قوت و کاریگروں کی تقسیم' : 'Workforce & Trade Deployment'}</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'ur' ? 'سائٹ پر مزدوروں اور مستریوں کا تناسب' : 'Active Craftsmen & Labor on Site Today'}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('manpower')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Full Roster →
            </button>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {homeTradeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={homeTradeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {homeTradeChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Workers`, 'On-Site Headcount']}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-xs">No manpower entries available</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total On-Site: {totalHomeLaborCount} Workers</span>
            <span className="font-mono text-indigo-400 font-bold">
              Est. {formatCurrency(totalDailyWageBill, language)} Wages
            </span>
          </div>
        </div>

        {/* Chart 4: Accounts Outflow & Category Spend */}
        <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-0.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'مالیاتی کھاتے و کیش اخراجات' : 'Cash Outflow & Voucher Disbursements'}</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'ur' ? 'شعبہ جاتی اخراجات کا بریک ڈاؤن' : 'Expense Category Distribution'}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Accounts Ledger →
            </button>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {homeAccountChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={homeAccountChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {homeAccountChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Disbursed']}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-xs">No account disbursements recorded</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Disbursed Vouchers: {filteredAccounts.length}</span>
            <span className="font-mono text-emerald-400 font-bold">
              {formatCurrency(totalAccountsDisbursed, language)}
            </span>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY & SITE AUDIT FEED */}
      <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <History className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>{language === 'ur' ? 'حالیہ سرگرمیاں اور سائٹ اپ ڈیٹس' : 'Recent Activity & Team Audit Feed'}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {filteredActivities.length} {language === 'ur' ? 'اپ ڈیٹس' : 'Updates'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ur'
                ? 'پروجیکٹ اپ ڈیٹس، نئے شامل کردہ ٹاسکس، اور مٹیریلز کے استعمال کی لائیو ٹائم اسٹیمپ لاگ'
                : 'Timestamped log of project updates, newly added/completed tasks, and materials usage to enhance team visibility.'}
            </p>
          </div>

          {/* Filter Pills and Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder={language === 'ur' ? 'سرگرمی تلاش کریں...' : 'Filter activity by keyword...'}
                className="w-44 sm:w-56 bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => setActivityCategory('all')}
                className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${activityCategory === 'all' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {language === 'ur' ? 'سب' : 'All'}
              </button>
              <button
                onClick={() => setActivityCategory('task')}
                className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${activityCategory === 'task' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Kanban className="w-3 h-3" />
                <span>{language === 'ur' ? 'ٹاسکس' : 'Tasks'}</span>
              </button>
              <button
                onClick={() => setActivityCategory('material')}
                className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${activityCategory === 'material' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Package className="w-3 h-3" />
                <span>{language === 'ur' ? 'مٹیریلز' : 'Materials'}</span>
              </button>
              <button
                onClick={() => setActivityCategory('project')}
                className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${activityCategory === 'project' ? 'bg-purple-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Briefcase className="w-3 h-3" />
                <span>{language === 'ur' ? 'پروجیکٹس' : 'Projects'}</span>
              </button>
              <button
                onClick={() => setActivityCategory('log')}
                className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${activityCategory === 'log' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ClipboardList className="w-3 h-3" />
                <span>{language === 'ur' ? 'روزنامچہ' : 'Site Logs'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Activities List */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              {language === 'ur' ? 'کوئی سرگرمی نہیں ملی۔' : 'No activity records match your current filters.'}
            </div>
          ) : (
            (isActivityExpanded ? filteredActivities : filteredActivities.slice(0, 6)).map((act: ActivityFeedItem) => {
              const iconMap: Record<ActivityFeedItem['type'], React.ReactNode> = {
                task: <Kanban className="w-4 h-4 text-blue-400" />,
                material: <Package className="w-4 h-4 text-emerald-400" />,
                project: <Briefcase className="w-4 h-4 text-purple-400" />,
                log: <ClipboardList className="w-4 h-4 text-indigo-400" />,
                finance: <Receipt className="w-4 h-4 text-amber-400" />
              };

              const borderGlow: Record<ActivityFeedItem['type'], string> = {
                task: 'hover:border-blue-500/50',
                material: 'hover:border-emerald-500/50',
                project: 'hover:border-purple-500/50',
                log: 'hover:border-indigo-500/50',
                finance: 'hover:border-amber-500/50'
              };

              return (
                <div
                  key={act.id}
                  onClick={() => setActiveTab(act.targetTab)}
                  className={`group p-3.5 sm:p-4 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 ${borderGlow} transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {iconMap[act.type]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                          {act.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {act.projectCode}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono font-bold border ${act.badgeColor}`}>
                          {act.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                        {act.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{act.timestamp}</span>
                        </span>
                        <span>·</span>
                        <span className="text-slate-400">
                          By: <strong className="text-slate-300 font-normal">{act.user}</strong> ({act.userRole})
                        </span>
                        <span>·</span>
                        <span className="text-slate-400">{act.projectName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Metric & Navigation CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                    {act.metric && (
                      <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/40">
                        {act.metric}
                      </span>
                    )}
                    <span className="text-xs text-blue-400 group-hover:text-blue-300 font-semibold flex items-center gap-1">
                      <span className="hidden sm:inline text-[11px]">{language === 'ur' ? 'تفصیل' : 'View'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Expand / Collapse Button */}
        {filteredActivities.length > 6 && (
          <div className="text-center pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setIsActivityExpanded(!isActivityExpanded)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition cursor-pointer font-medium"
            >
              <span>
                {isActivityExpanded 
                  ? (language === 'ur' ? 'کم سرگرمیاں دکھائیں' : 'Show Fewer Activities') 
                  : (language === 'ur' ? `تمام ${filteredActivities.length} سرگرمیاں دیکھیں` : `Show All ${filteredActivities.length} Activities`)}
              </span>
              {isActivityExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* ACTIVE JOB SITES GEOSPATIAL SHOWCASE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>{language === 'ur' ? 'تعمیراتی منصوبوں کی تفصیل' : 'Active Construction Job Sites'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ur' ? 'لائیو پروجیکٹ پیش رفت، لوکیشن، اور بجٹ کا اسٹیٹس' : 'Real-time telemetry, location coordinates, and budget utilization'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {filteredProjects.length} {language === 'ur' ? 'منصوبے' : 'Sites Listed'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const doneTasks = projectTasks.filter(t => t.status === 'completed').length;
            const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
            const spentPct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

            return (
              <div
                key={project.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-900/20 transition-all flex flex-col justify-between group"
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={project.bannerImage}
                    alt={project.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  {/* Code & Phase badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-950/90 text-blue-300 rounded-lg border border-blue-500/40 backdrop-blur-md">
                      {project.code}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/80 text-white rounded-md backdrop-blur-md">
                      {getPhaseName(project.currentPhase, language)}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                    <span className="text-slate-300 font-mono text-[11px] bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
                      {project.startDate} → {project.targetEndDate}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                      {language === 'ur' && project.nameUrdu ? project.nameUrdu : project.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  </div>

                  {/* Progress & Financials */}
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                    {/* Task Progress */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{language === 'ur' ? 'کام کی تکمیل' : 'Work Progress'}</span>
                        <span className="text-slate-200 font-bold tabular-nums">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Budget Spent */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{language === 'ur' ? 'بجٹ خرچ' : 'Spent vs Budget'}</span>
                        <span className="text-slate-200 font-mono tabular-nums">{spentPct}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px] font-mono">
                        <span className="text-blue-400 font-semibold">{formatCurrency(project.spent, language)}</span>
                        <span>{formatCurrency(project.budget, language)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Card Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setActiveTab('tasks');
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <span>{language === 'ur' ? 'کام دیکھیں' : 'View Tasks'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onOpenSiteAssistant?.(`Tell me about construction logistics, nearest ready-mix plants, and material supplies for project ${project.name} located at ${project.location}.`);
                      }}
                      className="p-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/40 rounded-xl border border-emerald-500/30 transition-colors cursor-pointer"
                      title="Ask Site AI about this project"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setActiveTab('daily_logs');
                      }}
                      className="py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      title="View Roznamcha / Daily Log"
                    >
                      <span>{language === 'ur' ? 'روزنامچہ' : 'Site Log'}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const confirmMsg = language === 'ur' 
                            ? `کیا آپ واقعی اس پروجیکٹ (${project.name}) کو حذف کرنا چاہتے ہیں؟`
                            : `Are you sure you want to delete project "${project.name}"? This cannot be undone.`;
                          if (window.confirm(confirmMsg)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="py-2 px-2.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 rounded-xl border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                        title={language === 'ur' ? 'پروجیکٹ حذف کریں (ایڈمن)' : 'Delete Project (Admin only)'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LATEST SITE REPORT (ROZNAMCHA) HIGHLIGHT */}
      {latestLog && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {language === 'ur' ? 'تازہ ترین سائٹ روزنامچہ (Daily Site Log)' : 'Latest Daily Site Log (Roznamcha)'}
                </h4>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{latestLog.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>Supervisor: {latestLog.supervisor}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold">{latestLog.temperatureC}°C</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('daily_logs')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>{language === 'ur' ? 'مکمل روزنامچہ دیکھیں' : 'View Full Logs'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2 space-y-1">
              <span className="font-semibold text-slate-300">
                {language === 'ur' ? 'آج کی پیش رفت:' : 'Work Completed Today:'}
              </span>
              <p className="text-slate-400 leading-relaxed">
                {latestLog.workSummary}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300">
                {language === 'ur' ? 'حاضر عملہ (Labor Count):' : 'Workforce On-Site:'}
              </span>
              <div className="space-y-0.5 text-slate-400 font-mono text-[11px]">
                {latestLog.workersCount.slice(0, 4).map((w, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{w.trade}</span>
                    <span className="text-white font-bold">{w.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
