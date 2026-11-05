import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, formatCurrency } from '../utils/translations';
import { AccountTransaction, Project, ConstructionTask } from '../types';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Building2,
  FileSpreadsheet,
  PieChart as PieIcon,
  Tag,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Sliders,
  Settings,
  Scale,
  Printer,
  ChevronRight,
  Info,
  Check,
  Percent,
  Layers,
  ArrowLeft,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const AccountsView: React.FC = () => {
  const { 
    accounts, 
    projects, 
    tasks,
    activeProjectId, 
    setActiveProjectId, 
    setActiveTab,
    language, 
    isAdmin, 
    hasPermission,
    addAccountTransaction, 
    updateAccountTransactionStatus, 
    deleteAccountTransaction,
    updateProject
  } = useProject();
  const t = translations[language];

  // Sub-tabs: 'costing' (Project Costing & Budget Control), 'ledger' (Vouchers & General Ledger), 'tasks' (Task-Level Costing)
  const [activeSubTab, setActiveSubTab] = useState<'costing' | 'ledger' | 'tasks'>('costing');

  // Dismissed alert banner state for current session
  const [isAlertBannerDismissed, setIsAlertBannerDismissed] = useState(false);

  // Admin Budget Revision & Threshold Modal State
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [editBudgetAmount, setEditBudgetAmount] = useState<number>(0);
  const [editThresholdPct, setEditThresholdPct] = useState<number>(80);
  const [editMaterialEst, setEditMaterialEst] = useState<number>(0);
  const [editLaborEst, setEditLaborEst] = useState<number>(0);
  const [editSubcontractorEst, setEditSubcontractorEst] = useState<number>(0);
  const [editMachineryEst, setEditMachineryEst] = useState<number>(0);
  const [editFuelEst, setEditFuelEst] = useState<number>(0);
  const [editOverheadsEst, setEditOverheadsEst] = useState<number>(0);
  const [editRevisionMemo, setEditRevisionMemo] = useState<string>('');

  // Printable Costing Report Modal State (A4 format)
  const [selectedProjectForPrint, setSelectedProjectForPrint] = useState<Project | null>(null);

  // Ledger Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Voucher Form State
  const [newProject, setNewProject] = useState<string>(projects[0]?.id || 'proj-01');
  const [newVoucherNo, setNewVoucherNo] = useState<string>(`VOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState<AccountTransaction['category']>('material');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newVendor, setNewVendor] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(50000);
  const [newPaymentMode, setNewPaymentMode] = useState<AccountTransaction['paymentMode']>('bank_transfer');
  const [newStatus, setNewStatus] = useState<AccountTransaction['status']>('paid');
  const [newInvoiceRef, setNewInvoiceRef] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // -------------------------------------------------------------
  // PROJECT COSTING CALCULATIONS & THRESHOLD AUDIT
  // -------------------------------------------------------------
  const relevantProjects = activeProjectId === 'all' 
    ? projects 
    : projects.filter(p => p.id === activeProjectId);

  // Detailed costing data per project
  const projectCostingList = useMemo(() => {
    return projects.map(proj => {
      const projAccounts = accounts.filter(a => a.projectId === proj.id);
      const paidVouchers = projAccounts
        .filter(a => a.status === 'paid' || a.status === 'cleared')
        .reduce((sum, a) => sum + a.amount, 0);
      const pendingVouchers = projAccounts
        .filter(a => a.status === 'pending')
        .reduce((sum, a) => sum + a.amount, 0);

      // Cumulative spent (uses project.spent or paidVouchers whichever reflects current ledger)
      const actualSpent = Math.max(proj.spent, paidVouchers);
      const committedTotal = actualSpent + pendingVouchers;
      const budget = proj.budget;
      const threshold = proj.budgetAlertThreshold ?? 80;

      const spentPct = budget > 0 ? (actualSpent / budget) * 100 : 0;
      const committedPct = budget > 0 ? (committedTotal / budget) * 100 : 0;
      const variance = budget - committedTotal; // Positive = Under Budget, Negative = Over Budget
      const variancePct = budget > 0 ? ((budget - committedTotal) / budget) * 100 : 0;

      // Status determination
      let status: 'safe' | 'warning' | 'threshold_breached' | 'over_budget' = 'safe';
      if (committedPct >= 100) {
        status = 'over_budget';
      } else if (committedPct >= threshold) {
        status = 'threshold_breached';
      } else if (committedPct >= threshold - 5) {
        status = 'warning';
      }

      // Cost Performance Index (CPI) = Budget / Committed Cost
      const cpi = committedTotal > 0 ? budget / committedTotal : 1.0;

      // Category breakdown (Estimated vs Actual)
      const catEst = proj.estimatedCostBreakdown || {
        material: Math.round(budget * 0.48),
        labor: Math.round(budget * 0.22),
        subcontractor: Math.round(budget * 0.16),
        machinery: Math.round(budget * 0.06),
        fuel: Math.round(budget * 0.04),
        overheads: Math.round(budget * 0.04)
      };

      const categories = [
        { key: 'material', label: 'Materials & Aggregates', est: catEst.material },
        { key: 'labor', label: 'Labor & Tradesmen Wages', est: catEst.labor },
        { key: 'subcontractor', label: 'Subcontractors & Specialist', est: catEst.subcontractor },
        { key: 'machinery', label: 'Machinery & Equipment Rental', est: catEst.machinery },
        { key: 'fuel', label: 'Fuel & Generators', est: catEst.fuel },
        { key: 'overheads', label: 'Site Overheads & Permits', est: catEst.overheads },
      ].map(c => {
        const catPaid = projAccounts
          .filter(a => a.category === c.key && (a.status === 'paid' || a.status === 'cleared'))
          .reduce((sum, a) => sum + a.amount, 0);
        const catPending = projAccounts
          .filter(a => a.category === c.key && a.status === 'pending')
          .reduce((sum, a) => sum + a.amount, 0);
        const catActual = catPaid + catPending;
        const catVariance = c.est - catActual;
        const catConsumedPct = c.est > 0 ? (catActual / c.est) * 100 : 0;
        return {
          ...c,
          actual: catActual,
          paid: catPaid,
          pending: catPending,
          variance: catVariance,
          consumedPct: catConsumedPct,
          isOver: catActual > c.est
        };
      });

      return {
        project: proj,
        budget,
        actualSpent,
        pendingVouchers,
        committedTotal,
        threshold,
        spentPct,
        committedPct,
        variance,
        variancePct,
        status,
        cpi,
        categories
      };
    });
  }, [projects, accounts]);

  // Projects exceeding threshold
  const projectsExceedingThreshold = useMemo(() => {
    return projectCostingList.filter(p => p.status === 'threshold_breached' || p.status === 'over_budget');
  }, [projectCostingList]);

  // Overall Financial & Costing Totals for filtered projects
  const filteredProjectCosting = useMemo(() => {
    if (activeProjectId === 'all') return projectCostingList;
    return projectCostingList.filter(p => p.project.id === activeProjectId);
  }, [projectCostingList, activeProjectId]);

  const totalSanctionedBudget = filteredProjectCosting.reduce((sum, p) => sum + p.budget, 0);
  const totalActualExpenditure = filteredProjectCosting.reduce((sum, p) => sum + p.actualSpent, 0);
  const totalCommittedLiabilities = filteredProjectCosting.reduce((sum, p) => sum + p.pendingVouchers, 0);
  const totalOverallCommitted = totalActualExpenditure + totalCommittedLiabilities;
  const totalNetCostVariance = totalSanctionedBudget - totalOverallCommitted;
  const overallConsumedPct = totalSanctionedBudget > 0 ? (totalOverallCommitted / totalSanctionedBudget) * 100 : 0;

  // Filtered Accounts for Ledger
  const filteredAccounts = useMemo(() => {
    return accounts.filter(item => {
      const matchProject = activeProjectId === 'all' || item.projectId === activeProjectId;
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchMode = paymentModeFilter === 'all' || item.paymentMode === paymentModeFilter;
      const matchSearch = searchQuery === '' ||
        item.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recipientOrVendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.invoiceRef && item.invoiceRef.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProject && matchCategory && matchStatus && matchMode && matchSearch;
    });
  }, [accounts, activeProjectId, categoryFilter, statusFilter, paymentModeFilter, searchQuery]);

  // Task-level Costing List
  const filteredTasksCosting = useMemo(() => {
    return tasks
      .filter(t => activeProjectId === 'all' || t.projectId === activeProjectId)
      .map(task => {
        const est = task.estimatedCost || 0;
        const act = task.actualCost !== undefined 
          ? task.actualCost 
          : (task.progressPercentage > 0 ? Math.round(est * (task.progressPercentage / 100)) : 0);
        const variance = est - act;
        const variancePct = est > 0 ? ((est - act) / est) * 100 : 0;
        return {
          task,
          est,
          act,
          variance,
          variancePct,
          isOverrun: act > est
        };
      });
  }, [tasks, activeProjectId]);

  // -------------------------------------------------------------
  // RECHARTS VISUALIZATION PREPARATION
  // -------------------------------------------------------------
  // 1. Project-wise Actual vs Estimated (Grouped Bar Chart in Millions PKR)
  const projectComparisonData = useMemo(() => {
    return projectCostingList.map(item => ({
      name: item.project.code,
      fullName: language === 'ur' && item.project.nameUrdu ? item.project.nameUrdu : item.project.name,
      estimated: Math.round(item.budget / 1000000), // In Millions
      actual: Math.round(item.actualSpent / 1000000),
      committed: Math.round(item.committedTotal / 1000000),
      thresholdVal: Math.round((item.budget * (item.threshold / 100)) / 1000000),
      thresholdPct: item.threshold,
      consumedPct: Math.round(item.committedPct)
    }));
  }, [projectCostingList, language]);

  // 2. Category Variance across active project (or all projects)
  const categoryVarianceData = useMemo(() => {
    const agg: Record<string, { est: number; actual: number }> = {};
    filteredProjectCosting.forEach(p => {
      p.categories.forEach(c => {
        if (!agg[c.label]) agg[c.label] = { est: 0, actual: 0 };
        agg[c.label].est += c.est;
        agg[c.label].actual += c.actual;
      });
    });
    return Object.entries(agg).map(([name, val]) => ({
      name,
      shortName: name.split('&')[0].trim(),
      Estimated: Math.round(val.est / 1000000),
      Actual: Math.round(val.actual / 1000000),
      Variance: Math.round((val.est - val.actual) / 1000000)
    }));
  }, [filteredProjectCosting]);

  // 3. Ledger Category Distribution Pie Chart
  const categoryMap: Record<string, number> = {};
  filteredAccounts.forEach(item => {
    const catName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    categoryMap[catName] = (categoryMap[catName] || 0) + item.amount;
  });
  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  // Open Admin Revision Modal
  const openRevisionModal = (proj: Project) => {
    setSelectedProjectForEdit(proj);
    setEditBudgetAmount(proj.budget);
    setEditThresholdPct(proj.budgetAlertThreshold ?? 80);
    const catEst = proj.estimatedCostBreakdown || {
      material: Math.round(proj.budget * 0.48),
      labor: Math.round(proj.budget * 0.22),
      subcontractor: Math.round(proj.budget * 0.16),
      machinery: Math.round(proj.budget * 0.06),
      fuel: Math.round(proj.budget * 0.04),
      overheads: Math.round(proj.budget * 0.04)
    };
    setEditMaterialEst(catEst.material);
    setEditLaborEst(catEst.labor);
    setEditSubcontractorEst(catEst.subcontractor);
    setEditMachineryEst(catEst.machinery);
    setEditFuelEst(catEst.fuel);
    setEditOverheadsEst(catEst.overheads);
    setEditRevisionMemo(`Admin budget adjustment and threshold calibration for ${proj.code}`);
    setIsThresholdModalOpen(true);
  };

  // Save Admin Budget & Threshold Revision
  const handleSaveBudgetRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForEdit) return;

    updateProject(selectedProjectForEdit.id, {
      budget: Number(editBudgetAmount) || selectedProjectForEdit.budget,
      budgetAlertThreshold: Number(editThresholdPct) || 80,
      estimatedCostBreakdown: {
        material: Number(editMaterialEst) || 0,
        labor: Number(editLaborEst) || 0,
        subcontractor: Number(editSubcontractorEst) || 0,
        machinery: Number(editMachineryEst) || 0,
        fuel: Number(editFuelEst) || 0,
        overheads: Number(editOverheadsEst) || 0
      }
    });

    setIsThresholdModalOpen(false);
    setSelectedProjectForEdit(null);
  };

  // Quick Threshold Update for Admin directly from card
  const handleQuickThresholdChange = (projId: string, newThreshold: number) => {
    if (!isAdmin && !hasPermission('canEditBudgets')) {
      alert(language === 'ur' ? 'صرف ایڈمن بجٹ حد کو تبدیل کر سکتا ہے۔' : 'Permission Denied: Only Admins can modify budget alert thresholds.');
      return;
    }
    updateProject(projId, { budgetAlertThreshold: newThreshold });
  };

  // Add Voucher Submit
  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVendor.trim()) return;

    addAccountTransaction({
      projectId: newProject,
      voucherNo: newVoucherNo.trim(),
      date: newDate,
      category: newCategory,
      title: newTitle.trim(),
      recipientOrVendor: newVendor.trim(),
      amount: Number(newAmount) || 0,
      paymentMode: newPaymentMode,
      status: newStatus,
      invoiceRef: newInvoiceRef.trim() || undefined,
      notes: newNotes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewVendor('');
    setNewInvoiceRef('');
    setNewNotes('');
    setNewVoucherNo(`VOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  };

  // CSV Export for Project Costing Audit
  const exportCostingCsv = () => {
    const headers = [
      'Project Code',
      'Project Name',
      'Phase',
      'Sanctioned Budget (PKR)',
      'Actual Incurred (PKR)',
      'Pending Liabilities (PKR)',
      'Total Committed (PKR)',
      'Budget Threshold (%)',
      'Consumption (%)',
      'Cost Variance (PKR)',
      'Variance Status',
      'CPI'
    ];
    const rows = filteredProjectCosting.map(item => [
      item.project.code,
      `"${item.project.name.replace(/"/g, '""')}"`,
      item.project.currentPhase,
      item.budget,
      item.actualSpent,
      item.pendingVouchers,
      item.committedTotal,
      `${item.threshold}%`,
      `${item.committedPct.toFixed(1)}%`,
      item.variance,
      item.status.toUpperCase(),
      item.cpi.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shizcon_project_costing_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Ledger
  const exportLedgerCsv = () => {
    const headers = ['Voucher No', 'Date', 'Project Code', 'Category', 'Description/Title', 'Paid To / Vendor', 'Amount (PKR)', 'Payment Mode', 'Status', 'Invoice Ref', 'Notes'];
    const rows = filteredAccounts.map(item => {
      const proj = projects.find(p => p.id === item.projectId);
      return [
        item.voucherNo,
        item.date,
        proj?.code || item.projectId,
        item.category,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.recipientOrVendor.replace(/"/g, '""')}"`,
        item.amount,
        item.paymentMode,
        item.status,
        `"${(item.invoiceRef || '').replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shizcon_accounts_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* ------------------------------------------------------------- */}
      {/* 1. ADMIN CRITICAL BUDGET THRESHOLD ALERT BANNER               */}
      {/* ------------------------------------------------------------- */}
      {!isAlertBannerDismissed && projectsExceedingThreshold.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-rose-950/95 via-red-900/90 to-amber-950/95 border-2 border-rose-500/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-rose-950/50 animate-pulse-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-600/30 border border-rose-400 flex items-center justify-center text-rose-300 shrink-0 shadow-inner">
                <AlertOctagon className="w-7 h-7 text-rose-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-rose-500 text-white shadow-sm">
                    {language === 'ur' ? 'ایڈمن الرٹ' : 'ADMIN CRITICAL ALERT'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {language === 'ur' 
                      ? `${projectsExceedingThreshold.length} منصوبے بجٹ الرٹ حد سے تجاوز کر گئے!` 
                      : `${projectsExceedingThreshold.length} Project(s) Exceeded Budget Alert Threshold!`}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-rose-200 mt-1 max-w-2xl leading-relaxed">
                  {language === 'ur'
                    ? 'منصوبے کے اخراجات منظور شدہ فیصد حد عبور کر چکے ہیں۔ ایڈمنسٹریٹر کو فوری طور پر اضافی بجٹ منظوری یا اخراجات پر کنٹرول کا فیصلہ کرنا ہوگا۔'
                    : 'Actual project expenditures have breached the designated financial alert threshold. Immediate admin intervention required to review cost drivers or sanction supplementary allocation.'}
                </p>

                {/* Breached project tags */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {projectsExceedingThreshold.map(item => (
                    <div 
                      key={item.project.id}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-rose-400/50 text-xs font-mono"
                    >
                      <span className="font-bold text-white">{item.project.code}</span>
                      <span className="text-rose-300">
                        {item.committedPct.toFixed(1)}% spent (Threshold: {item.threshold}%)
                      </span>
                      <span className="text-[10px] text-slate-300">
                        [PKR {(item.committedTotal / 1000000).toFixed(1)}M / {(item.budget / 1000000).toFixed(1)}M]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              {isAdmin && (
                <button
                  onClick={() => openRevisionModal(projectsExceedingThreshold[0].project)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-rose-950 font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-rose-700" />
                  <span>{language === 'ur' ? 'بجٹ ریویژن کریں' : 'Revise Budget / Threshold'}</span>
                </button>
              )}
              <button
                onClick={() => setIsAlertBannerDismissed(true)}
                className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-rose-300 hover:text-white transition cursor-pointer text-xs"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. HEADER WITH SUB-TABS & GLOBAL CONTROLS                     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-5 rounded-2xl border border-blue-900/30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            title={language === 'ur' ? 'تمام ٹیبس پر واپس جائیں' : 'Back to All Modules Hub'}
          >
            <ArrowLeft className="w-5 h-5 text-blue-400" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <Scale className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{language === 'ur' ? 'پروجیکٹ کاسٹنگ و مالیاتی کنٹرول' : 'Project Costing & Accounts'}</span>
              <span className={`px-2 py-0.5 text-xs font-mono rounded border ${
                projectsExceedingThreshold.length > 0 
                  ? 'bg-rose-950 text-rose-300 border-rose-800' 
                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
              }`}>
                {projectsExceedingThreshold.length > 0 
                  ? `${projectsExceedingThreshold.length} Over Threshold` 
                  : 'All Budgets On Track'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {language === 'ur' 
                ? 'اصل بمقابلہ تخمینہ لاگت، بجٹ الرٹ تھریش ہولڈز، مانیٹرنگ اور واؤچر لیجر' 
                : 'Actual vs. estimated expenditure tracking, admin budget threshold alerts, and financial disbursements'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-Tabs Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('costing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeSubTab === 'costing' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'پروجیکٹ کاسٹنگ' : 'Project Costing'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeSubTab === 'ledger' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'واؤچرز لیجر' : 'Voucher Ledger'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeSubTab === 'tasks' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'کام کی لاگت' : 'Task Costing'}</span>
            </button>
          </div>

          {/* Quick Actions */}
          {activeSubTab === 'costing' ? (
            <button
              onClick={exportCostingCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer shadow-sm"
              title="Download Costing Audit CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{language === 'ur' ? 'ایکسپورٹ کاسٹنگ' : 'Export Costing CSV'}</span>
            </button>
          ) : (
            <button
              onClick={exportLedgerCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer shadow-sm"
              title="Download Ledger CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{language === 'ur' ? 'ایکسپورٹ لیجر' : 'Export Ledger CSV'}</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ur' ? '+ واؤچر درج کریں' : '+ Record Voucher'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SUB-TAB 1: PROJECT COSTING (ACTUAL VS ESTIMATED)           */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'costing' && (
        <div className="space-y-6">
          {/* TOP COSTING SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Estimated Sanctioned Budget */}
            <div className="bg-slate-900/90 border border-blue-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {language === 'ur' ? 'کل منظور شدہ تخمینہ بجٹ' : 'Sanctioned Budget (Estimated)'}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {formatCurrency(totalSanctionedBudget, language)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {filteredProjectCosting.length} Construction Sites
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Actual Spent Outflow */}
            <div className="bg-slate-900/90 border border-emerald-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {language === 'ur' ? 'اصل ادا شدہ اخراجات' : 'Actual Expenditures (Paid)'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                    {formatCurrency(totalActualExpenditure, language)}
                  </span>
                  <span className="text-xs text-emerald-500 font-mono">
                    {totalSanctionedBudget > 0 ? ((totalActualExpenditure / totalSanctionedBudget) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Directly disbursed to date</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Total Committed (Actual + Pending Liabilities) */}
            <div className={`bg-slate-900/90 border rounded-xl p-4 shadow-md flex items-center justify-between ${
              overallConsumedPct >= 80 ? 'border-amber-900/40' : 'border-indigo-900/30'
            }`}>
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {language === 'ur' ? 'کل واجبات و وعدہ شدہ لاگت' : 'Committed Cost (Actual + Pending)'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-indigo-300">
                    {formatCurrency(totalOverallCommitted, language)}
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    overallConsumedPct >= 90 ? 'text-rose-400' : overallConsumedPct >= 80 ? 'text-amber-400' : 'text-indigo-400'
                  }`}>
                    {overallConsumedPct.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Includes {formatCurrency(totalCommittedLiabilities, language)} pending
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Net Cost Variance */}
            <div className={`bg-slate-900/90 border rounded-xl p-4 shadow-md flex items-center justify-between ${
              totalNetCostVariance >= 0 ? 'border-emerald-900/30' : 'border-rose-900/50'
            }`}>
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {language === 'ur' ? 'خالص لاگت فرق (بجٹ بیلنس)' : 'Net Cost Variance (CV)'}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    totalNetCostVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {totalNetCostVariance >= 0 ? '+' : ''}{formatCurrency(totalNetCostVariance, language)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {totalNetCostVariance >= 0 ? 'Favorable (Under Budget)' : 'Unfavorable Overrun!'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                totalNetCostVariance >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {totalNetCostVariance >= 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* PROJECT FILTER SWITCHER BAR */}
          <div className="bg-slate-900/80 border border-blue-900/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">Filter Project Site:</span>
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{language === 'ur' ? 'تمام منصوبے (All Projects)' : 'All Projects (Portfolio View)'}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe (&lt;Threshold)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning (Near Limit)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Threshold Breached
              </span>
            </div>
          </div>

          {/* PROJECT-BY-PROJECT COSTING & THRESHOLD AUDIT CARDS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>{language === 'ur' ? 'پروجیکٹ وار لاگت و تھریش ہولڈ الرٹ نگرانی' : 'Project Costing & Threshold Monitoring Cards'}</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {filteredProjectCosting.length} Projects Analyzed
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {filteredProjectCosting.map(item => {
                const isBreached = item.status === 'threshold_breached' || item.status === 'over_budget';
                return (
                  <div
                    key={item.project.id}
                    className={`bg-slate-900/90 rounded-2xl p-5 shadow-xl border flex flex-col justify-between transition-all ${
                      item.status === 'over_budget' 
                        ? 'border-red-500 bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-900' 
                        : item.status === 'threshold_breached'
                        ? 'border-rose-500/80 bg-gradient-to-b from-rose-950/30 via-slate-900 to-slate-900'
                        : item.status === 'warning'
                        ? 'border-amber-500/60'
                        : 'border-blue-900/30 hover:border-blue-700/50'
                    }`}
                  >
                    <div>
                      {/* Card Top: Code, Name & Status Pill */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                              {item.project.code}
                            </span>
                            <span className="text-[11px] text-slate-400 capitalize font-mono">
                              Phase: {item.project.currentPhase}
                            </span>
                          </div>
                          <h3 className="font-bold text-white text-sm mt-1 leading-snug">
                            {language === 'ur' && item.project.nameUrdu ? item.project.nameUrdu : item.project.name}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {item.status === 'over_budget' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-lg animate-pulse">
                              <AlertOctagon className="w-3 h-3" /> Over Budget
                            </span>
                          ) : item.status === 'threshold_breached' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-600/90 text-white shadow animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Threshold Breached
                            </span>
                          ) : item.status === 'warning' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Clock className="w-3 h-3" /> Near Limit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" /> Safe
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial Key Numbers */}
                      <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 my-3 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Sanctioned Budget:</span>
                          <span className="font-bold text-white text-sm">
                            PKR {(item.budget / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Actual Spent:</span>
                          <span className="font-bold text-emerald-400 text-sm">
                            PKR {(item.actualSpent / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Pending Liabilities:</span>
                          <span className="text-amber-300">
                            PKR {(item.pendingVouchers / 1000).toLocaleString()}k
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Cost Variance (CV):</span>
                          <span className={`font-bold ${item.variance >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
                            {item.variance >= 0 ? '+' : ''}PKR {(item.variance / 1000000).toFixed(2)}M
                          </span>
                        </div>
                      </div>

                      {/* Threshold & Consumption Progress Bar */}
                      <div className="space-y-1.5 my-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-semibold">
                            Consumed: <strong className={isBreached ? 'text-rose-400' : 'text-white'}>{item.committedPct.toFixed(1)}%</strong>
                          </span>
                          <span className="text-amber-400 text-[11px] flex items-center gap-1">
                            <span>Alert Threshold:</span>
                            <strong>{item.threshold}%</strong>
                          </span>
                        </div>

                        {/* Progress track with threshold line */}
                        <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          {/* Colored bar */}
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                              item.status === 'over_budget'
                                ? 'bg-gradient-to-r from-red-600 to-rose-600'
                                : item.status === 'threshold_breached'
                                ? 'bg-gradient-to-r from-rose-500 to-red-500'
                                : item.status === 'warning'
                                ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                                : 'bg-gradient-to-r from-blue-600 to-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, item.committedPct)}%` }}
                          />
                          {/* Threshold marker vertical line */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xs z-10"
                            style={{ left: `${Math.min(99, item.threshold)}%` }}
                            title={`Threshold marker: ${item.threshold}%`}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>0% Start</span>
                          <span>Threshold Marker: {item.threshold}%</span>
                          <span>100% Budget</span>
                        </div>
                      </div>

                      {/* Admin Quick Threshold Selector */}
                      {isAdmin && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Settings className="w-3 h-3 text-slate-400" />
                              <span>Admin Alert Threshold:</span>
                            </span>
                            <span className="text-[11px] font-mono font-bold text-blue-400">{item.threshold}%</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {[70, 75, 80, 85, 90, 95].map(threshVal => (
                              <button
                                key={threshVal}
                                onClick={() => handleQuickThresholdChange(item.project.id, threshVal)}
                                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                                  item.threshold === threshVal
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                              >
                                {threshVal}%
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions: Revise Budget & Print Audit */}
                    <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedProjectForPrint(item.project)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                        title="Print A4 Costing Report"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        <span>Audit Slip</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => openRevisionModal(item.project)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold transition cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Revise Budget</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CATEGORY-WISE ACTUAL VS ESTIMATED EXPENDITURE BREAKDOWN       */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{language === 'ur' ? 'شعبہ وار اصل بمقابلہ تخمینہ لاگت کا موازنہ' : 'Category-Wise Actual vs. Estimated Expenditure Matrix'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Materials, labor, subcontractors, machinery, fuel, and overhead allocations
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Cost Category</th>
                    <th className="py-3 px-4 text-right">Estimated Budget (PKR)</th>
                    <th className="py-3 px-4 text-right">Actual Spent (PKR)</th>
                    <th className="py-3 px-4 text-right">Pending Liabilities</th>
                    <th className="py-3 px-4 text-right">Total Committed</th>
                    <th className="py-3 px-4 text-right">Variance (PKR)</th>
                    <th className="py-3 px-4">Burn Progress</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {categoryVarianceData.map((cat, idx) => {
                    const est = cat.Estimated * 1000000;
                    const act = cat.Actual * 1000000;
                    const variance = est - act;
                    const burnPct = est > 0 ? (act / est) * 100 : 0;
                    const isOver = act > est;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span>{cat.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-200 whitespace-nowrap">
                          PKR {est.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                          PKR {act.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-300 whitespace-nowrap">
                          PKR 0
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                          PKR {act.toLocaleString()}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                          variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {variance >= 0 ? '+' : ''}PKR {variance.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div 
                                className={`h-full rounded-full ${
                                  burnPct >= 100 ? 'bg-rose-500' : burnPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, burnPct)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono font-semibold text-slate-300">
                              {burnPct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isOver ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              Cost Overrun
                            </span>
                          ) : burnPct >= 80 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              Near Limit
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Under Budget
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COSTING CHARTS SECTION                                        */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Project Actual vs Estimated Comparison */}
            <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>{language === 'ur' ? 'پروجیکٹ بجٹ بمقابلہ اصل اخراجات' : 'Actual vs. Estimated Expenditures (Million PKR)'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Direct comparison across civil projects</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span> Estimated
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Actual
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="M" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                      formatter={(value: any, name: any) => [
                        `PKR ${value} Million`,
                        name === 'estimated' ? 'Sanctioned Budget' : 'Actual Spent'
                      ]}
                    />
                    <Bar dataKey="estimated" name="estimated" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Cost Variance Breakdown */}
            <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'ur' ? 'شعبہ وار اخراجات کی تقسیم' : 'Category Cost Consumption (Million PKR)'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Estimated budget vs actual absorption</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryVarianceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="shortName" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="M" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                      formatter={(value: any, name: any) => [`PKR ${value} Million`, name]}
                    />
                    <Bar dataKey="Estimated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. SUB-TAB 2: GENERAL LEDGER & VOUCHERS                       */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          {/* LEDGER FILTER & SEARCH BAR */}
          <div className="bg-slate-900/80 border border-blue-900/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Project Switcher */}
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{language === 'ur' ? 'تمام منصوبے' : 'All Projects'}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="material">Materials</option>
                <option value="labor">Labor Wages</option>
                <option value="subcontractor">Subcontractor</option>
                <option value="machinery">Machinery & Plant</option>
                <option value="fuel">Fuel & Generators</option>
                <option value="overheads">Site Overheads</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cleared">Cleared</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'ur' ? 'واؤچر نمبر، وینڈر یا عنوان تلاش کریں...' : 'Search voucher #, vendor, title...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* ACCOUNTS VOUCHER LEDGER TABLE */}
          <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === 'ur' ? 'اکاؤنٹس واؤچر و کیش بک لیجر' : 'Accounts Voucher & Cash Disbursement Ledger'}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Showing {filteredAccounts.length} transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Voucher #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Title / Description</th>
                    <th className="py-3 px-4">Vendor / Recipient</th>
                    <th className="py-3 px-4 text-right">Amount (PKR)</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((item) => {
                      const proj = projects.find(p => p.id === item.projectId);
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                            {item.voucherNo}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                              {proj?.code || item.projectId}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-white max-w-xs truncate" title={item.title}>
                            {item.title}
                            {item.invoiceRef && (
                              <span className="block text-[10px] text-slate-400 font-mono">
                                Ref: {item.invoiceRef}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                            {item.recipientOrVendor}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                            {item.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 uppercase text-[10px] font-mono text-slate-400 whitespace-nowrap">
                            {item.paymentMode.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              item.status === 'paid' || item.status === 'cleared'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {isAdmin && (
                              <div className="flex items-center justify-center gap-1.5">
                                {item.status === 'pending' && (
                                  <button
                                    onClick={() => updateAccountTransactionStatus(item.id, 'paid')}
                                    className="px-2 py-0.5 rounded text-[10px] bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                                    title="Mark as Paid"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteAccountTransaction(item.id)}
                                  className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                                  title="Delete Voucher"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No financial vouchers match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. SUB-TAB 3: TASK-LEVEL COSTING (WBS BREAKDOWN)              */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'ur' ? 'کام اور سرگرمیوں کے لحاظ سے لاگت موازنہ' : 'Task & Activity Level Costing (WBS Breakdown)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Estimated vs. actual cost per construction task and work package
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredTasksCosting.length} Construction Tasks
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Task & Work Package</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Phase</th>
                    <th className="py-3 px-4">Contractor</th>
                    <th className="py-3 px-4 text-right">Estimated Cost (PKR)</th>
                    <th className="py-3 px-4 text-right">Actual Incurred (PKR)</th>
                    <th className="py-3 px-4 text-right">Cost Variance</th>
                    <th className="py-3 px-4 text-center">Progress</th>
                    <th className="py-3 px-4 text-center">Cost Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTasksCosting.length > 0 ? (
                    filteredTasksCosting.map((item, idx) => {
                      const proj = projects.find(p => p.id === item.task.projectId);
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-medium text-white max-w-xs">
                            <div className="truncate font-bold" title={item.task.title}>
                              {item.task.title}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{item.task.trade}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                              {proj?.code || item.task.projectId}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap capitalize text-slate-300">
                            {item.task.phase}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                            {item.task.contractor}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-200 whitespace-nowrap">
                            PKR {item.est.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                            PKR {item.act.toLocaleString()}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                            item.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {item.variance >= 0 ? '+' : ''}PKR {item.variance.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {item.task.progressPercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {item.isOverrun ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                Overrun
                              </span>
                            ) : item.task.progressPercentage === 100 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                On Budget
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No construction tasks found for this project filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. ADMIN BUDGET REVISION & THRESHOLD MODAL                    */}
      {/* ------------------------------------------------------------- */}
      {isThresholdModalOpen && selectedProjectForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-blue-800/40 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <span>Budget Revision & Alert Threshold Settings</span>
              </h3>
              <button 
                onClick={() => setIsThresholdModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudgetRevision} className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Active Project:</span>
                  <span className="font-bold text-white text-sm">{selectedProjectForEdit.code} - {selectedProjectForEdit.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block">Current Spent:</span>
                  <span className="text-emerald-400 font-bold">PKR {(selectedProjectForEdit.spent / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              {/* Sanctioned Budget and Alert Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Sanctioned Project Budget (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1000000"
                    step="500000"
                    value={editBudgetAmount}
                    onChange={(e) => setEditBudgetAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-emerald-400 font-bold text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Equivalent: PKR {(editBudgetAmount / 1000000).toFixed(2)} Million
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Admin Alert Threshold (%) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={editThresholdPct}
                      onChange={(e) => setEditThresholdPct(Number(e.target.value))}
                      className="w-24 bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-amber-400 font-bold text-sm focus:outline-none focus:border-amber-500"
                      required
                    />
                    <div className="flex-1 flex gap-1">
                      {[70, 75, 80, 85, 90].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setEditThresholdPct(v)}
                          className={`flex-1 py-2 rounded text-[10px] font-mono font-bold ${
                            editThresholdPct === v ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Alert triggers at: PKR {((editBudgetAmount * (editThresholdPct / 100)) / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>

              {/* Category Breakdown Estimates */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block text-xs">
                  Estimated Expenditure Allocation by Category (PKR)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Material & Concrete</span>
                    <input
                      type="number"
                      value={editMaterialEst}
                      onChange={(e) => setEditMaterialEst(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Labor Wages</span>
                    <input
                      type="number"
                      value={editLaborEst}
                      onChange={(e) => setEditLaborEst(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Subcontractor</span>
                    <input
                      type="number"
                      value={editSubcontractorEst}
                      onChange={(e) => setEditSubcontractorEst(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Machinery Rental</span>
                    <input
                      type="number"
                      value={editMachineryEst}
                      onChange={(e) => setEditMachineryEst(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Fuel & Power</span>
                    <input
                      type="number"
                      value={editFuelEst}
                      onChange={(e) => setEditFuelEst(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Site Overheads</span>
                    <input
                      type="number"
                      value={editOverheadsEst}
                      onChange={(e) => setEditOverheadsEst(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Approval Memo / Variation Order Ref</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Supplementary budget approved by Board for façade specification upgrade..."
                  value={editRevisionMemo}
                  onChange={(e) => setEditRevisionMemo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsThresholdModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Save & Apply Budget Controls
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. PRINTABLE A4 PROJECT COSTING AUDIT SLIP MODAL              */}
      {/* ------------------------------------------------------------- */}
      {selectedProjectForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:block print:overflow-visible">
          <div className="bg-slate-900 border border-blue-700/50 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 my-8 printable-a4-document a4-print-document print:w-full print:max-w-none print:min-w-full print:p-0 print:m-0 print:rounded-none print:shadow-none print:border-none print:bg-white print:text-slate-900">
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                    SHIZCON BUILDERS & ENGINEERING (PVT) LTD
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    PROJECT COSTING & BUDGET AUDIT REPORT
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    REF: SC-COST-{selectedProjectForPrint.code}-{new Date().getFullYear()} · DATE: {new Date().toISOString().split('T')[0]}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-xs font-bold">
                    {selectedProjectForPrint.code}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1 uppercase font-mono">
                    Phase: {selectedProjectForPrint.currentPhase}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800/80 text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Project Name</span>
                <span className="font-bold text-white text-sm block truncate">{selectedProjectForPrint.name}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Client Organization</span>
                <span className="font-semibold text-slate-200 block truncate">{selectedProjectForPrint.client}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Project Manager</span>
                <span className="font-semibold text-blue-300 block truncate">{selectedProjectForPrint.projectManager}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Alert Threshold</span>
                <span className="font-semibold text-amber-300 block font-mono">
                  {selectedProjectForPrint.budgetAlertThreshold ?? 80}% Cap
                </span>
              </div>
            </div>

            {/* Financial Costing Summary Grid */}
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Sanctioned Estimate</span>
                  <span className="font-bold text-white text-base block mt-0.5">
                    PKR {selectedProjectForPrint.budget.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Actual Disbursed</span>
                  <span className="font-bold text-emerald-400 text-base block mt-0.5">
                    PKR {selectedProjectForPrint.spent.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Cost Variance (CV)</span>
                  <span className={`font-bold text-base block mt-0.5 ${
                    selectedProjectForPrint.budget - selectedProjectForPrint.spent >= 0 ? 'text-blue-300' : 'text-rose-400'
                  }`}>
                    PKR {(selectedProjectForPrint.budget - selectedProjectForPrint.spent).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-300">Budget Consumption Audit:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {((selectedProjectForPrint.spent / selectedProjectForPrint.budget) * 100).toFixed(1)}% Consumed
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {((selectedProjectForPrint.spent / selectedProjectForPrint.budget) * 100) >= (selectedProjectForPrint.budgetAlertThreshold ?? 80)
                    ? '⚠️ WARNING: Project expenditures have exceeded the configured alert threshold. Supplementary budget allocation or site cost rationalization has been initiated.'
                    : '✅ Project expenditures remain within safe sanctioned variance parameters.'}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-[10px] text-slate-400 font-mono text-center">
              <div>
                <div className="h-10 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-500">
                  [Verified on Site]
                </div>
                <span className="block mt-1 font-bold text-slate-300">Resident Engineer</span>
                <span className="text-slate-500 text-[9px]">Quantity Surveyor & Inspection</span>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-500">
                  [Audited]
                </div>
                <span className="block mt-1 font-bold text-slate-300">Chief Accountant</span>
                <span className="text-slate-500 text-[9px]">Budget Clearance & Accounts</span>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-500">
                  [Approved]
                </div>
                <span className="block mt-1 font-bold text-slate-300">Project Director</span>
                <span className="text-slate-500 text-[9px]">Executive Financial Sanction</span>
              </div>
            </div>

            {/* Print Footer */}
            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>ShizCon Construction Enterprise ERP · Project Costing Audit Report</span>
              <span>copyright @ 2026, ShizCon</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 mt-3 border-t border-slate-800 no-print">
              <button
                type="button"
                onClick={() => setSelectedProjectForPrint(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report (A4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. RECORD EXPENSE VOUCHER MODAL                               */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-blue-800/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <span>{language === 'ur' ? 'نیا واؤچر درج کریں' : 'Record Financial Voucher'}</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVoucher} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Voucher #</label>
                  <input
                    type="text"
                    value={newVoucherNo}
                    onChange={(e) => setNewVoucherNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Project Site</label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Expense Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="material">Materials</option>
                    <option value="labor">Labor Wages</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="machinery">Machinery & Plant</option>
                    <option value="fuel">Fuel & Generator</option>
                    <option value="overheads">Overheads & Utilities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Bags OPC Cement Delivery or Shuttering Crew Wages"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Paid To / Vendor / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucky Cement Depot / Bismillah Builders"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Payment Mode</label>
                  <select
                    value={newPaymentMode}
                    onChange={(e) => setNewPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="pay_order">Pay Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Payment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Invoice / Bill Ref #</label>
                  <input
                    type="text"
                    placeholder="INV-9921"
                    value={newInvoiceRef}
                    onChange={(e) => setNewInvoiceRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Audit Notes / Approval</label>
                <textarea
                  rows={2}
                  placeholder="Quality inspection passed, consultant stamp, delivery note..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
