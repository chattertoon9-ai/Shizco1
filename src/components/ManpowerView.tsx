import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, formatCurrency } from '../utils/translations';
import { LaborEntry } from '../types';
import { 
  Users, 
  HardHat, 
  Calendar, 
  Clock, 
  DollarSign, 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  Receipt,
  Printer
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

export const ManpowerView: React.FC = () => {
  const { 
    labor, 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    setActiveTab,
    language, 
    isAdmin, 
    hasPermission, 
    addLaborEntry, 
    deleteLaborEntry 
  } = useProject();
  const t = translations[language];

  // Attendance & Salary Sub-view state
  const [subTab, setSubTab] = useState<'all' | 'attendance' | 'salary'>('all');
  const [activeSlip, setActiveSlip] = useState<LaborEntry | null>(null);

  // Filter states
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Labor Form State with complete demographic, allowance and salary fields
  const [newProject, setNewProject] = useState<string>(projects[0]?.id || 'proj-01');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newWorkerName, setNewWorkerName] = useState<string>('Muhammad Tariq');
  const [newDesignation, setNewDesignation] = useState<string>('Senior Mason (Raj Mistri)');
  const [newAge, setNewAge] = useState<number>(36);
  const [newEducation, setNewEducation] = useState<string>('Matric (Vocational Trade Certificate)');
  const [newTrade, setNewTrade] = useState<string>('Masons (Raj Mistri)');
  const [newHeadcount, setNewHeadcount] = useState<number>(1);
  const [newHours, setNewHours] = useState<number>(8);
  const [newDailyRate, setNewDailyRate] = useState<number>(2800); // Per Day Salary
  const [newTransportAllowance, setNewTransportAllowance] = useState<number>(4000);
  const [newFoodAllowance, setNewFoodAllowance] = useState<number>(6000);
  const [newAccommodationAllowance, setNewAccommodationAllowance] = useState<number>(5000);
  const [newAdvanceDeduction, setNewAdvanceDeduction] = useState<number>(5000);
  const [newOtherDeduction, setNewOtherDeduction] = useState<number>(1000);
  const [newContractor, setNewContractor] = useState<string>('Bismillah Civil Builders');
  const [newShift, setNewShift] = useState<'day' | 'night' | 'overtime'>('day');
  const [newStatus, setNewStatus] = useState<'present' | 'half_day' | 'overtime' | 'absent'>('present');
  const [newNotes, setNewNotes] = useState<string>('');

  // Dynamically computed amounts for preview
  const previewTotalAllowances = Number(newTransportAllowance || 0) + Number(newFoodAllowance || 0) + Number(newAccommodationAllowance || 0);
  const previewMonthlyGross = (Number(newDailyRate || 0) * 26) + previewTotalAllowances;
  const previewTotalDeductions = Number(newAdvanceDeduction || 0) + Number(newOtherDeduction || 0);
  const previewNetPayable = previewMonthlyGross - previewTotalDeductions;

  // Filtered Labor
  const filteredLabor = useMemo(() => {
    return labor.filter(entry => {
      const matchProject = activeProjectId === 'all' || entry.projectId === activeProjectId;
      const matchTrade = tradeFilter === 'all' || entry.trade.toLowerCase().includes(tradeFilter.toLowerCase());
      const matchShift = shiftFilter === 'all' || entry.shift === shiftFilter;
      const matchSearch = searchQuery === '' || 
        (entry.workerName && entry.workerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.designation && entry.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.education && entry.education.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProject && matchTrade && matchShift && matchSearch;
    });
  }, [labor, activeProjectId, tradeFilter, shiftFilter, searchQuery]);

  // Summary Metrics with Payroll Allowances & Gross
  const totalHeadcount = filteredLabor.reduce((sum, item) => sum + item.headcount, 0);
  const totalWageBill = filteredLabor.reduce((sum, item) => sum + (item.totalWage || (item.headcount * item.dailyWageRate)), 0);
  
  const totalMonthlyGrossPayroll = filteredLabor.reduce((sum, item) => {
    const gross = item.monthlyGross || ((item.dailyWageRate * 26) + (item.allowances ? (item.allowances.transport + item.allowances.food + item.allowances.accommodation) : 0));
    return sum + gross;
  }, 0);

  const totalAllowancesSum = filteredLabor.reduce((sum, item) => {
    const a = item.allowances ? (item.allowances.transport + item.allowances.food + item.allowances.accommodation) : 0;
    return sum + a;
  }, 0);

  const totalAdvanceDeductionsSum = filteredLabor.reduce((sum, item) => {
    const d = item.deductions ? (item.deductions.advance + (item.deductions.other || 0)) : 0;
    return sum + d;
  }, 0);

  const totalNetSalaryDisbursable = totalMonthlyGrossPayroll - totalAdvanceDeductionsSum;

  const skilledCount = filteredLabor.filter(item => 
    !item.trade.toLowerCase().includes('helper') && !item.trade.toLowerCase().includes('mazdoor')
  ).reduce((sum, item) => sum + item.headcount, 0);

  const unskilledCount = filteredLabor.filter(item => 
    item.trade.toLowerCase().includes('helper') || item.trade.toLowerCase().includes('mazdoor')
  ).reduce((sum, item) => sum + item.headcount, 0);

  const uniqueContractors = Array.from(new Set(filteredLabor.map(i => i.contractor))).length;

  // RECHARTS DATA PREPARATION
  // 1. Trade Distribution Data
  const tradeMap: Record<string, number> = {};
  filteredLabor.forEach(item => {
    let key = item.trade.split('(')[0].trim();
    tradeMap[key] = (tradeMap[key] || 0) + item.headcount;
  });
  const tradeChartData = Object.entries(tradeMap).map(([name, value]) => ({ name, value }));

  // 2. Project-wise Labor Allocation
  const projectLaborData = projects.map(p => {
    const pLabor = labor.filter(l => l.projectId === p.id);
    const count = pLabor.reduce((sum, i) => sum + i.headcount, 0);
    const wage = pLabor.reduce((sum, i) => sum + (i.totalWage || (i.headcount * i.dailyWageRate)), 0);
    return {
      name: p.code,
      fullName: language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name,
      workers: count,
      wages: wage
    };
  });

  // 3. Shifts & Attendance Breakdown
  const shiftData = [
    { name: 'Day Shift', value: filteredLabor.filter(l => l.shift === 'day').reduce((s, i) => s + i.headcount, 0) },
    { name: 'Night Shift', value: filteredLabor.filter(l => l.shift === 'night').reduce((s, i) => s + i.headcount, 0) },
    { name: 'Overtime', value: filteredLabor.filter(l => l.shift === 'overtime').reduce((s, i) => s + i.headcount, 0) },
  ].filter(s => s.value > 0);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  // Handle Form Submit with Full Salary & Allowance Computation
  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(newDailyRate) || 0;
    const count = Number(newHeadcount) || 1;
    const calculatedTotalDailyWage = count * rate;
    const allowancesTotal = Number(newTransportAllowance || 0) + Number(newFoodAllowance || 0) + Number(newAccommodationAllowance || 0);
    const grossMonthly = (rate * 26) + allowancesTotal;
    const deductionsTotal = Number(newAdvanceDeduction || 0) + Number(newOtherDeduction || 0);
    const net = grossMonthly - deductionsTotal;

    addLaborEntry({
      projectId: newProject,
      date: newDate,
      workerName: newWorkerName.trim() || 'Worker',
      designation: newDesignation.trim() || newTrade.trim(),
      age: Number(newAge) || 30,
      education: newEducation.trim() || 'Experienced / Skilled',
      trade: newTrade.trim(),
      headcount: count,
      hoursPerDay: Number(newHours) || 8,
      dailyWageRate: rate,
      allowances: {
        transport: Number(newTransportAllowance) || 0,
        food: Number(newFoodAllowance) || 0,
        accommodation: Number(newAccommodationAllowance) || 0
      },
      monthlyGross: grossMonthly,
      deductions: {
        advance: Number(newAdvanceDeduction) || 0,
        other: Number(newOtherDeduction) || 0
      },
      netPayable: net,
      totalWage: calculatedTotalDailyWage,
      contractor: newContractor.trim() || 'Direct Crew',
      shift: newShift,
      status: newStatus,
      notes: newNotes.trim() || undefined
    });
    setIsAddModalOpen(false);
    setNewNotes('');
  };

  // CSV Export with all demographic, allowance, gross and deduction fields
  const exportCsv = () => {
    const headers = [
      'ID',
      'Date',
      'Worker Name',
      'Designation',
      'Age',
      'Education',
      'Project Code',
      'Trade/Craft',
      'Headcount',
      'Daily Wage Rate (PKR)',
      'Transport Allow. (PKR)',
      'Food Allow. (PKR)',
      'Accomm. Allow. (PKR)',
      'Monthly Gross (PKR)',
      'Advance Deduction (PKR)',
      'Other Deduction (PKR)',
      'Net Monthly Salary (PKR)',
      'Daily Total (PKR)',
      'Shift',
      'Contractor',
      'Status',
      'Notes'
    ];
    const rows = filteredLabor.map(item => {
      const proj = projects.find(p => p.id === item.projectId);
      const trans = item.allowances?.transport || 0;
      const food = item.allowances?.food || 0;
      const accom = item.allowances?.accommodation || 0;
      const gross = item.monthlyGross || ((item.dailyWageRate * 26) + (trans + food + accom));
      const adv = item.deductions?.advance || 0;
      const otherDed = item.deductions?.other || 0;
      const net = item.netPayable || (gross - (adv + otherDed));

      return [
        item.id,
        item.date,
        `"${(item.workerName || 'Worker').replace(/"/g, '""')}"`,
        `"${(item.designation || item.trade).replace(/"/g, '""')}"`,
        item.age || 30,
        `"${(item.education || 'Experienced').replace(/"/g, '""')}"`,
        proj?.code || item.projectId,
        `"${item.trade.replace(/"/g, '""')}"`,
        item.headcount,
        item.dailyWageRate,
        trans,
        food,
        accom,
        gross,
        adv,
        otherDed,
        net,
        item.totalWage,
        item.shift,
        `"${item.contractor.replace(/"/g, '""')}"`,
        item.status,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alasad_manpower_salary_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 pb-12 animate-fadeIn ${activeSlip ? 'print:space-y-0 print:pb-0' : ''}`}>
      <div className={`space-y-6 ${activeSlip ? 'no-print print:hidden' : ''}`}>
        {/* Header with Title and Quick Actions */}
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
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{language === 'ur' ? 'افرادی قوت — حاضری و تنخواہ' : 'Manpower Attendance & Salary'}</span>
              <span className="px-2 py-0.5 text-xs font-mono bg-blue-900/50 text-blue-300 rounded border border-blue-800">
                {totalHeadcount} {language === 'ur' ? 'مزدور' : 'Workers'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {language === 'ur' 
                ? 'روزانہ لیبر حاضری مسٹر رول، ہنر مند کاریگر، یومیہ اجرت و تنخواہ کی ادائیگی' 
                : 'Daily workforce muster roll, trade allocation, biometric headcounts, and daily wage & salary liabilities'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-tabs switch */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSubTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'مکمل جائزہ' : 'Overview'}
            </button>
            <button
              onClick={() => setSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'حاضری مسٹر رول' : 'Attendance Roll'}
            </button>
            <button
              onClick={() => setSubTab('salary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === 'salary' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'تنخواہ و اجرت' : 'Salary & Wages'}
            </button>
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer shadow-sm"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{language === 'ur' ? 'ایکسپورٹ CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ur' ? '+ حاضری درج کریں' : '+ Log Attendance / Crew'}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Workers Today */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'کل افرادی قوت' : 'Total Workforce On-Site'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{totalHeadcount}</span>
              <span className="text-xs text-blue-400 font-mono">Present</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across active job sites</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Skilled Craftsmen */}
        <div className="bg-slate-900/90 border border-emerald-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'ہنر مند کاریگر (مستری/لوہار)' : 'Skilled Craftsmen'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{skilledCount}</span>
              <span className="text-xs text-emerald-500/80 font-mono">
                {totalHeadcount > 0 ? Math.round((skilledCount / totalHeadcount) * 100) : 0}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Masons, Steel, Shuttering</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <HardHat className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Helpers & General Labor */}
        <div className="bg-slate-900/90 border border-amber-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'مزدور و ہیلپرز' : 'General Labor & Helpers'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-400">{unskilledCount}</span>
              <span className="text-xs text-amber-500/80 font-mono">
                {totalHeadcount > 0 ? Math.round((unskilledCount / totalHeadcount) * 100) : 0}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Material handling & support</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Daily Wage Outflow */}
        <div className="bg-slate-900/90 border border-indigo-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'روزانہ اجرت بل (تخمینہ)' : 'Estimated Daily Wage Bill'}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-indigo-300">
                {formatCurrency(totalWageBill, language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{uniqueContractors} Subcontractor crews</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Trade-Wise Labor Distribution (Donut Chart) */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>{language === 'ur' ? 'شعبہ وار افرادی تقسیم' : 'Trade & Skill Distribution'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Headcount by craft and role</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {tradeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tradeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {tradeChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Workers`, 'Crew Size']}
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
              <div className="text-center text-slate-500 text-xs">No manpower records available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Project-wise Crew Allocation (Bar Chart) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ur' ? 'پروجیکٹ کے لحاظ سے مزدوروں کی تقسیم' : 'Workforce Deployment by Project'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Total labor count and daily wage obligation</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Live Sites
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectLaborData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [
                    name === 'workers' ? `${value} Workers` : `PKR ${Number(value).toLocaleString()}`,
                    name === 'workers' ? 'Workforce' : 'Daily Wage Bill'
                  ]}
                />
                <Bar dataKey="workers" name="workers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
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

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Shifts</option>
            <option value="day">Day Shift</option>
            <option value="night">Night Shift</option>
            <option value="overtime">Overtime</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'ur' ? 'ٹھیکیدار، ہنر یا تفصیل تلاش کریں...' : 'Search craft, contractor, notes...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* MUSTER ROLL & SALARY REGISTER TABLE */}
      <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Top Header Bar with Metrics */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{language === 'ur' ? 'لیبر مسٹر رول و ماہانہ تنخواہ رجسٹر' : 'Labor Muster Roll & Salary Register'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  {filteredLabor.length} {language === 'ur' ? 'ملازمین' : 'Workers'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ur' 
                  ? 'مزدور کا نام، عہدہ، عمر، تعلیم، یومیہ دیہاڑی، الاؤنسز، گروس تنخواہ اور ایڈوانس کٹوتی' 
                  : 'Complete roster tracking worker profiles, qualifications, allowances, advance deductions & net salaries'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Monthly Gross Payroll</span>
              <span className="font-bold text-blue-400">PKR {totalMonthlyGrossPayroll.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Total Net Disbursable</span>
              <span className="font-bold text-emerald-400">PKR {totalNetSalaryDisbursable.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Worker & Designation</th>
                <th className="py-3 px-3">Age & Education</th>
                <th className="py-3 px-3">Site / Trade</th>
                <th className="py-3 px-3 text-right">Per Day (PKR)</th>
                <th className="py-3 px-3">Allowances (T / F / A)</th>
                <th className="py-3 px-3 text-right">Monthly Gross (PKR)</th>
                <th className="py-3 px-3 text-right">Deductions (Adv.)</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-400">Net Payable</th>
                <th className="py-3 px-3 text-center">Shift / Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLabor.length > 0 ? (
                filteredLabor.map((item) => {
                  const proj = projects.find(p => p.id === item.projectId);
                  const trans = item.allowances?.transport || 0;
                  const food = item.allowances?.food || 0;
                  const accom = item.allowances?.accommodation || 0;
                  const totalAllow = trans + food + accom;
                  const gross = item.monthlyGross || ((item.dailyWageRate * 26) + totalAllow);
                  const adv = item.deductions?.advance || 0;
                  const otherDed = item.deductions?.other || 0;
                  const totalDed = adv + otherDed;
                  const net = item.netPayable || (gross - totalDed);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* 1. Worker Name & Designation */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-900/40 border border-blue-700/60 flex items-center justify-center text-blue-300 font-bold text-[11px] shrink-0">
                            {(item.workerName || item.trade).charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">
                              {item.workerName || 'Staff Worker'}
                            </div>
                            <div className="text-[11px] text-blue-300 font-medium">
                              {item.designation || item.trade}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Age & Education */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {item.age || 30} yrs
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={item.education}>
                          {item.education || 'Skilled Tradesman'}
                        </div>
                      </td>

                      {/* 3. Site / Trade */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                            {proj?.code || item.projectId}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {item.trade}
                        </div>
                      </td>

                      {/* 4. Per Day Salary */}
                      <td className="py-3 px-3 text-right font-mono text-slate-200 whitespace-nowrap">
                        <div className="font-bold text-white">
                          PKR {item.dailyWageRate.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">/ Day (26 d)</span>
                      </td>

                      {/* 5. Allowances Breakdown (Transport, Food, Accommodation) */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold" title={`Transport: PKR ${trans.toLocaleString()} | Food: PKR ${food.toLocaleString()} | Accomm: PKR ${accom.toLocaleString()}`}>
                            PKR {totalAllow.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span title="Transport">T: {trans > 0 ? (trans / 1000).toFixed(1) + 'k' : '0'}</span>
                          <span>•</span>
                          <span title="Food">F: {food > 0 ? (food / 1000).toFixed(1) + 'k' : '0'}</span>
                          <span>•</span>
                          <span title="Accommodation">A: {accom > 0 ? (accom / 1000).toFixed(1) + 'k' : '0'}</span>
                        </div>
                      </td>

                      {/* 6. Monthly Gross */}
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        <span className="font-bold text-blue-300">
                          PKR {gross.toLocaleString()}
                        </span>
                      </td>

                      {/* 7. Deductions (Advance etc) */}
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        {totalDed > 0 ? (
                          <div>
                            <span className="text-rose-400 font-semibold">
                              - PKR {totalDed.toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              (Adv: {adv.toLocaleString()})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* 8. Net Payable */}
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold text-xs">
                          PKR {net.toLocaleString()}
                        </span>
                      </td>

                      {/* 9. Shift & Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                          item.shift === 'night' 
                            ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                            : item.shift === 'overtime'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.shift}
                        </span>
                        <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                          {item.status || 'Present'}
                        </div>
                      </td>

                      {/* 10. Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveSlip(item)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 border border-emerald-800/40 transition cursor-pointer text-[11px]"
                            title={language === 'ur' ? 'تنخواہ پرچی دیکھیں و پرنٹ کریں' : 'View & Print Salary Slip (A4)'}
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span className="font-sans">Slip</span>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteLaborEntry(item.id)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No workforce records found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD LABOR / WORKER PROFILE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-blue-800/40 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-400" />
                <span>{language === 'ur' ? 'ملازم / کاریگر کا نیا اندراج' : 'Register Worker & Salary Package'}</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLabor} className="space-y-4 pt-4 text-xs">
              {/* Section 1: Basic Worker Demographic & Education */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Worker Profile & Demographics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Worker Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ustad Tariq Mehmood"
                      value={newWorkerName}
                      onChange={(e) => setNewWorkerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Designation / Role *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Mason (Raj Mistri)"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Age (Years) *</label>
                    <input
                      type="number"
                      min="18"
                      max="70"
                      value={newAge}
                      onChange={(e) => setNewAge(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1 font-medium">Education / Qualification *</label>
                    <input
                      type="text"
                      placeholder="e.g. Matric / DAE Civil / TEVTA Trade Certificate"
                      value={newEducation}
                      onChange={(e) => setNewEducation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Project Deployment & Trade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-slate-400 mb-1">Trade / Craft</label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Masons (Raj Mistri)">Masons (Raj Mistri)</option>
                    <option value="Shuttering Carpenters">Shuttering Carpenters</option>
                    <option value="Steel Fixers (Bar Benders)">Steel Fixers (Bar Benders)</option>
                    <option value="Tile & Marble Masons">Tile & Marble Masons</option>
                    <option value="Painters & Wall Polishers">Painters & Wall Polishers</option>
                    <option value="Electricians & Conduit Installers">Electricians & Conduit Installers</option>
                    <option value="Plumbers & Pipe Fitters">Plumbers & Pipe Fitters</option>
                    <option value="Heavy Equipment Operators">Heavy Equipment Operators</option>
                    <option value="General Labor & Helpers (Mazdoor)">General Labor & Helpers (Mazdoor)</option>
                    <option value="Surveyors & Total Station Team">Surveyors & Total Station Team</option>
                  </select>
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

              {/* Section 3: Salary & Daily Wage Rate */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Salary Structure & Daily Wage (26 Billable Days)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Per Day Salary (PKR) *</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={newDailyRate}
                      onChange={(e) => setNewDailyRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">26 Days = PKR {(newDailyRate * 26).toLocaleString()}</span>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Shift</label>
                    <select
                      value={newShift}
                      onChange={(e) => setNewShift(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="overtime">Overtime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="present">Present (مکمل حاضری)</option>
                      <option value="half_day">Half Day (آدھا دن)</option>
                      <option value="overtime">Overtime (اضافی وقت)</option>
                      <option value="absent">Absent (غیر حاضر)</option>
                    </select>
                  </div>
                </div>

                {/* Section 4: Allowances Breakdown */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-slate-300 font-semibold mb-2">
                    Allowances Breakdown (PKR / Month)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Transport</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={newTransportAllowance}
                        onChange={(e) => setNewTransportAllowance(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        placeholder="Transport"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Food / Mess</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={newFoodAllowance}
                        onChange={(e) => setNewFoodAllowance(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        placeholder="Food"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Accommodation</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={newAccommodationAllowance}
                        onChange={(e) => setNewAccommodationAllowance(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        placeholder="Accomm."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Deductions (Advance, Other) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-slate-300 font-semibold mb-2">
                    Deductions (PKR)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] text-rose-300 block mb-1">Advance Salary (پیشگی رقم)</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={newAdvanceDeduction}
                        onChange={(e) => setNewAdvanceDeduction(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-rose-900/50 rounded-lg p-2 text-rose-200 font-mono text-xs focus:outline-none focus:border-rose-500"
                        placeholder="Advance"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Other Deductions / Fines</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={newOtherDeduction}
                        onChange={(e) => setNewOtherDeduction(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-slate-500"
                        placeholder="Other"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Calculation Card */}
              <div className="p-3 bg-gradient-to-r from-blue-950/70 to-emerald-950/50 rounded-xl border border-blue-900/40 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Base Wage (26 Days × PKR {newDailyRate}):</span>
                  <span>PKR {(newDailyRate * 26).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Monthly Allowances:</span>
                  <span className="text-emerald-400">+ PKR {previewTotalAllowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                  <span>Monthly Gross Salary:</span>
                  <span className="text-blue-300">PKR {previewMonthlyGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>Total Deductions (Advance + Other):</span>
                  <span>- PKR {previewTotalDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-300 pt-1 border-t border-emerald-800/60">
                  <span>Net Payable Salary:</span>
                  <span>PKR {previewNetPayable.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contractor / Jamadar Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bismillah Civil Contractors"
                  value={newContractor}
                  onChange={(e) => setNewContractor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Site Activity / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Activity description, grid location, concrete pour details..."
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
                  Save Worker & Salary Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>

      {/* OFFICIAL WAGE & SALARY SLIP MODAL (A4 PRINT READY) */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:block print:overflow-visible">
          <div className="bg-slate-900 border border-emerald-600/40 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 my-8 printable-a4-document a4-print-document print:w-full print:max-w-none print:min-w-full print:p-0 print:m-0 print:rounded-none print:shadow-none print:border-none print:bg-white print:text-slate-900">
            {/* Slip Header */}
            <div className="border-b-2 border-slate-800 print:border-slate-300 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 print:text-emerald-800 font-bold block">
                    SHIZCON BUILDERS & ENGINEERING (PVT) LTD
                  </span>
                  <h2 className="text-xl font-black text-white print:text-slate-950 mt-0.5">
                    {language === 'ur' ? 'لیبر یومیہ اجرت و ماہانہ تنخواہ سلپ' : 'OFFICIAL WORKFORCE WAGE & SALARY PAYSLIP'}
                  </h2>
                  <p className="text-xs text-slate-400 print:text-slate-600 font-mono mt-0.5">
                    REGISTER REF: SC-PAY-{activeSlip.id.slice(-6).toUpperCase()} · DATE: {activeSlip.date}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 print:bg-blue-50 print:text-blue-900 print:border-blue-300 font-mono text-xs font-bold">
                    {projects.find(p => p.id === activeSlip.projectId)?.code || activeSlip.projectId}
                  </span>
                  <span className="block text-[10px] text-slate-400 print:text-slate-600 mt-1 uppercase font-mono">
                    Shift: {activeSlip.shift} ({activeSlip.hoursPerDay} hrs)
                  </span>
                </div>
              </div>
            </div>

            {/* Worker Demographic & Professional Profile Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800/80 print:border-slate-300 text-xs">
              <div className="bg-slate-950/70 print:bg-slate-50 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block uppercase font-mono">Worker Full Name</span>
                <span className="font-bold text-white print:text-slate-950 text-sm block truncate">
                  {activeSlip.workerName || 'Staff Tradesman'}
                </span>
              </div>

              <div className="bg-slate-950/70 print:bg-slate-50 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block uppercase font-mono">Designation / Role</span>
                <span className="font-semibold text-blue-300 print:text-blue-900 block truncate">
                  {activeSlip.designation || activeSlip.trade}
                </span>
              </div>

              <div className="bg-slate-950/70 print:bg-slate-50 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block uppercase font-mono">Age & Qualification</span>
                <span className="font-semibold text-slate-200 print:text-slate-800 block truncate">
                  {activeSlip.age || 32} yrs · {activeSlip.education || 'DAE Civil'}
                </span>
              </div>

              <div className="bg-slate-950/70 print:bg-slate-50 p-2.5 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block uppercase font-mono">Contractor / Jamadar</span>
                <span className="font-semibold text-slate-300 print:text-slate-800 block truncate">
                  {activeSlip.contractor}
                </span>
              </div>
            </div>

            {/* Detailed Salary & Allowance Breakdown Table */}
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings Column */}
                <div className="bg-slate-950/60 print:bg-slate-50 p-3.5 rounded-xl border border-slate-800 print:border-slate-300 text-xs space-y-2">
                  <div className="font-bold text-emerald-400 print:text-emerald-900 uppercase text-[11px] pb-1 border-b border-slate-800 print:border-slate-300 flex justify-between">
                    <span>Earnings & Allowances</span>
                    <span>PKR</span>
                  </div>
                  <div className="flex justify-between text-slate-300 print:text-slate-700 font-mono">
                    <span>Per Day Wage Rate:</span>
                    <span>{activeSlip.dailyWageRate.toLocaleString()} / day</span>
                  </div>
                  <div className="flex justify-between text-slate-300 print:text-slate-700 font-mono">
                    <span>Monthly Base (26 Days):</span>
                    <span>{(activeSlip.dailyWageRate * 26).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 print:text-slate-700 font-mono">
                    <span>Transport Allowance:</span>
                    <span>+ {(activeSlip.allowances?.transport || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 print:text-slate-700 font-mono">
                    <span>Food & Mess Allowance:</span>
                    <span>+ {(activeSlip.allowances?.food || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 print:text-slate-700 font-mono">
                    <span>Accommodation Allowance:</span>
                    <span>+ {(activeSlip.allowances?.accommodation || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white print:text-slate-950 pt-2 border-t border-slate-800 print:border-slate-300 font-mono text-sm">
                    <span>Total Monthly Gross:</span>
                    <span className="text-blue-300 print:text-blue-900">
                      PKR {(activeSlip.monthlyGross || ((activeSlip.dailyWageRate * 26) + (activeSlip.allowances ? (activeSlip.allowances.transport + activeSlip.allowances.food + activeSlip.allowances.accommodation) : 0))).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Deductions & Net Take-home Column */}
                <div className="bg-slate-950/60 print:bg-slate-50 p-3.5 rounded-xl border border-slate-800 print:border-slate-300 text-xs space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-rose-400 print:text-rose-900 uppercase text-[11px] pb-1 border-b border-slate-800 print:border-slate-300 flex justify-between">
                      <span>Deductions & Recoveries</span>
                      <span>PKR</span>
                    </div>
                    <div className="flex justify-between text-slate-300 print:text-slate-700 font-mono mt-2">
                      <span>Advance Salary (پیشگی ادائیگی):</span>
                      <span className="text-rose-400 print:text-rose-800">- {(activeSlip.deductions?.advance || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 print:text-slate-700 font-mono">
                      <span>Other Deductions / Loan:</span>
                      <span className="text-rose-400 print:text-rose-800">- {(activeSlip.deductions?.other || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-rose-300 print:text-rose-900 pt-2 border-t border-slate-800 print:border-slate-300 font-mono">
                      <span>Total Deductions:</span>
                      <span>
                        - PKR {((activeSlip.deductions?.advance || 0) + (activeSlip.deductions?.other || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Net Payable Highlight Box */}
                  <div className="p-3 bg-gradient-to-r from-emerald-950/80 to-slate-900 print:from-emerald-50 print:to-emerald-50 print:bg-emerald-50 border border-emerald-600/60 print:border-emerald-600 rounded-xl mt-3">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 print:text-emerald-900 block tracking-wider">
                      {language === 'ur' ? 'خالص واجب الادا تنخواہ' : 'NET PAYABLE SALARY'}
                    </span>
                    <div className="text-xl font-black text-emerald-300 print:text-emerald-950 font-mono mt-0.5">
                      PKR {(activeSlip.netPayable || ((activeSlip.monthlyGross || ((activeSlip.dailyWageRate * 26) + (activeSlip.allowances ? (activeSlip.allowances.transport + activeSlip.allowances.food + activeSlip.allowances.accommodation) : 0))) - ((activeSlip.deductions?.advance || 0) + (activeSlip.deductions?.other || 0)))).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono block mt-0.5">
                      Daily Wage Equivalent: PKR {(activeSlip.totalWage || (activeSlip.headcount * activeSlip.dailyWageRate)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {activeSlip.notes && (
                <div className="p-2.5 bg-slate-950 print:bg-slate-50 rounded-lg text-[11px] text-slate-400 print:text-slate-700 border border-slate-800 print:border-slate-300">
                  <span className="text-slate-500 print:text-slate-700 font-bold block mb-0.5">Site Location & Deployment Notes:</span>
                  {activeSlip.notes}
                </div>
              )}
            </div>

            {/* Official Signatures & Verification */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 print:border-slate-300 text-[10px] text-slate-400 print:text-slate-600 font-mono text-center print-avoid-break">
              <div>
                <div className="h-10 border-b border-dashed border-slate-700 print:border-slate-400 flex items-end justify-center pb-1 text-slate-500 print:text-slate-600">
                  [Verified on Site]
                </div>
                <span className="block mt-1 font-bold text-slate-300 print:text-slate-900">Resident Engineer</span>
                <span className="text-slate-500 print:text-slate-600 text-[9px]">Site Inspection & Attendance</span>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-700 print:border-slate-400 flex items-end justify-center pb-1 text-slate-500 print:text-slate-600">
                  [Disbursed]
                </div>
                <span className="block mt-1 font-bold text-slate-300 print:text-slate-900">Project Accountant</span>
                <span className="text-slate-500 print:text-slate-600 text-[9px]">Payroll & Advance Clearance</span>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-700 print:border-slate-400 flex items-end justify-center pb-1 text-slate-500 print:text-slate-600">
                  [دستخط / نشان انگوٹھا]
                </div>
                <span className="block mt-1 font-bold text-slate-300 print:text-slate-900">Worker / Thumb Impression</span>
                <span className="text-slate-500 print:text-slate-600 text-[9px]">Receipt Acknowledgement</span>
              </div>
            </div>

            {/* Print Footer Notice */}
            <div className="pt-4 mt-3 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-[10px] text-slate-500 print:text-slate-600 font-mono">
              <span>ShizCon Construction Enterprise ERP · Standard A4 Payslip Document</span>
              <span>copyright @ 2026, ShizCon</span>
            </div>

            {/* Action buttons (hidden on print) */}
            <div className="flex items-center justify-end gap-2.5 pt-4 mt-3 border-t border-slate-800 no-print">
              <button
                type="button"
                onClick={() => setActiveSlip(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 cursor-pointer"
              >
                {language === 'ur' ? 'بند کریں' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'پرنٹ سلپ (A4)' : 'Print Wage Slip (A4)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

