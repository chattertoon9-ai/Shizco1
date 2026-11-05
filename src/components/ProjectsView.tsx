import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, formatCurrency, getPhaseName } from '../utils/translations';
import { Project, ProjectPhase, ProjectStatus } from '../types';
import { 
  Building2, 
  MapPin, 
  Users, 
  Wallet, 
  TrendingUp, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Trash2, 
  Layers, 
  Sparkles,
  ArrowUpRight
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
  Legend
} from 'recharts';

interface ProjectsViewProps {
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
  onOpenSiteAssistant?: (prompt?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenNewProject,
  onOpenNewTask,
  onOpenSiteAssistant
}) => {
  const { 
    projects, 
    tasks, 
    activeProjectId, 
    setActiveProjectId, 
    setActiveTab, 
    language, 
    isAdmin, 
    hasPermission, 
    deleteProject 
  } = useProject();
  const t = translations[language];

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [projects, statusFilter, searchQuery]);

  // Overall calculations
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const overallUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const activeCount = projects.filter(p => p.status === 'in_progress').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  // RECHARTS DATA PREPARATION
  // 1. Project Budget vs Spent (in Millions PKR)
  const budgetChartData = projects.map(p => ({
    name: p.code,
    fullName: language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name,
    budget: Math.round(p.budget / 1000000),
    spent: Math.round(p.spent / 1000000),
  }));

  // 2. Phase Distribution
  const phaseCounts: Record<string, number> = {};
  projects.forEach(p => {
    const phaseLabel = getPhaseName(p.currentPhase, language);
    phaseCounts[phaseLabel] = (phaseCounts[phaseLabel] || 0) + 1;
  });
  const phaseChartData = Object.entries(phaseCounts).map(([name, value]) => ({ name, value }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const handleDeleteProject = (id: string, name: string) => {
    if (!isAdmin) {
      alert(language === 'ur' ? 'صرف ایڈمنسٹریٹر پروجیکٹ حذف کر سکتا ہے۔' : 'Only Administrator can delete projects.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${name}"? All associated tasks will remain.`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-5 rounded-2xl border border-blue-900/30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{language === 'ur' ? 'تعمیراتی منصوبے (پروجیکٹس)' : 'Civil Engineering Projects'}</span>
              <span className="px-2 py-0.5 text-xs font-mono bg-blue-900/50 text-blue-300 rounded border border-blue-800">
                {projects.length} {language === 'ur' ? 'سائٹس' : 'Active Sites'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {language === 'ur' 
                ? 'پروجیکٹ کی پیش رفت، بجٹ کا استعمال، انجینئرنگ مراحل اور سائٹ سپروائزن' 
                : 'Project milestone tracking, budget burn rate, civil phases, and site leadership'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {hasPermission('canCreateProjects') ? (
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ur' ? '+ نیا پروجیکٹ بنائیں' : '+ New Project'}</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Admin rights required to create projects
            </span>
          )}
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'کل منصوبے' : 'Total Projects'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{projects.length}</span>
              <span className="text-xs text-emerald-400 font-mono">{activeCount} Running</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{completedCount} Handed over</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Portfolio Budget */}
        <div className="bg-slate-900/90 border border-emerald-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'کل پورٹ فولیو بجٹ' : 'Portfolio Sanctioned Budget'}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                {formatCurrency(totalBudget, language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across all live contracts</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Actual Spent Outflow */}
        <div className="bg-slate-900/90 border border-amber-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'اصل خرچ' : 'Actual Expenditures'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-amber-300">
                {formatCurrency(totalSpent, language)}
              </span>
              <span className="text-xs text-amber-400 font-mono">{overallUtilization}%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Budget burn rate</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Remaining Liquidity */}
        <div className="bg-slate-900/90 border border-indigo-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'باقی ماندہ فنڈز' : 'Unspent Balance'}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-indigo-300">
                {formatCurrency(Math.max(0, totalBudget - totalSpent), language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Allocated to remaining milestones</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Phase Distribution */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{language === 'ur' ? 'مراحل وار پروجیکٹس' : 'Active Phase Distribution'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Civil stages of all projects</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {phaseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={phaseChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {phaseChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Projects`, 'Sites in Phase']}
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
              <div className="text-center text-slate-500 text-xs">No project phase data</div>
            )}
          </div>
        </div>

        {/* Chart 2: Project Budget vs Spent (Millions PKR) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ur' ? 'بجٹ اور اخراجات کا تقابل' : 'Project Budget vs Expenditure (Million PKR)'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Comparison per civil engineering site</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span> Budget
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Spent
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="M" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [
                    `PKR ${value} Million`,
                    name === 'budget' ? 'Sanctioned Budget' : 'Actual Spent'
                  ]}
                />
                <Bar dataKey="budget" name="budget" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900/80 border border-blue-900/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'ur' ? 'پروجیکٹ کوڈ، نام یا لوکیشن تلاش کریں...' : 'Search project, code, location, client...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* PROJECT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
          const totalTasks = projectTasks.length;
          const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const budgetPercentage = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

          return (
            <div
              key={project.id}
              className="bg-slate-900/90 border border-blue-900/30 rounded-2xl overflow-hidden shadow-xl hover:border-blue-500/50 transition-all flex flex-col group"
            >
              {/* Banner Image */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img
                  src={project.bannerImage || '/logo.jpg'}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                
                {/* Code badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-950/90 text-blue-300 border border-blue-700/60 backdrop-blur-xs shadow-md">
                    {project.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                    project.status === 'in_progress' ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/60' :
                    project.status === 'completed' ? 'bg-blue-950/90 text-blue-300 border border-blue-700/60' :
                    'bg-amber-950/90 text-amber-300 border border-amber-700/60'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Phase badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-slate-200 border border-slate-700 backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {getPhaseName(project.currentPhase, language)}
                  </span>
                </div>

                {/* Admin Delete */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-rose-300 border border-red-800/60 transition cursor-pointer shadow-md"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {language === 'ur' && project.nameUrdu ? project.nameUrdu : project.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Client: {project.client}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Progress & Budget Progress */}
                <div className="space-y-3 pt-2 border-t border-slate-800/70 text-xs">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Task Completion</span>
                      <span className="font-mono font-bold text-white">{progressPercentage}% ({completedTasks}/{totalTasks})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Budget Spent</span>
                      <span className="font-mono font-bold text-slate-200">
                        {budgetPercentage}% ({formatCurrency(project.spent, language)})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          budgetPercentage > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, budgetPercentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>PM: {project.projectManager}</span>
                    <span className="font-mono">{project.targetEndDate}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveProjectId(project.id);
                      setActiveTab('tasks');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>View Tasks ({totalTasks})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenSiteAssistant?.(`Analyze site progress and safety schedule for ${project.name} (${project.location}).`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                    title="AI Analysis"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
