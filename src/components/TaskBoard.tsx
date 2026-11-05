import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ConstructionTask, TaskStatus, TaskPriority, ProjectPhase } from '../types';
import { 
  translations, 
  getPhaseName, 
  getTaskStatusName, 
  getPriorityName 
} from '../utils/translations';
import { 
  Search, 
  Filter, 
  Kanban, 
  Table as TableIcon, 
  Plus, 
  CheckSquare, 
  Clock, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Layers,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { exportTasksToCSV } from '../utils/csvExport';
import { GlobalSearchFilterBar } from './GlobalSearchFilterBar';

interface TaskBoardProps {
  onOpenNewTask: () => void;
  onSelectTask: (task: ConstructionTask) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ onOpenNewTask, onSelectTask }) => {
  const { 
    projects, 
    tasks, 
    activeProjectId, 
    setActiveProjectId, 
    moveTaskStatus, 
    language,
    searchQuery,
    statusFilter,
    phaseFilter,
    priorityFilter,
    setPriorityFilter
  } = useProject();

  const t = translations[language];

  // Local view mode
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filter tasks using global search and status filter
  const filteredTasks = tasks.filter(task => {
    // Project filter
    if (activeProjectId !== 'all' && task.projectId !== activeProjectId) {
      return false;
    }
    // Phase filter
    if (phaseFilter !== 'all' && task.phase !== phaseFilter) {
      return false;
    }
    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    // Global Keyword Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchUrdu = task.titleUrdu?.toLowerCase().includes(q) || false;
      const matchContractor = task.contractor.toLowerCase().includes(q);
      const matchTrade = task.trade.toLowerCase().includes(q);
      const matchNotes = task.notes?.toLowerCase().includes(q) || false;
      return matchTitle || matchUrdu || matchContractor || matchTrade || matchNotes;
    }
    return true;
  });

  const columns: { status: TaskStatus; label: string; count: number }[] = [
    { 
      status: 'backlog', 
      label: t.colBacklog, 
      count: filteredTasks.filter(t => t.status === 'backlog').length 
    },
    { 
      status: 'in_progress', 
      label: t.colInProgress, 
      count: filteredTasks.filter(t => t.status === 'in_progress').length 
    },
    { 
      status: 'inspection', 
      label: t.colInspection, 
      count: filteredTasks.filter(t => t.status === 'inspection').length 
    },
    { 
      status: 'completed', 
      label: t.colCompleted, 
      count: filteredTasks.filter(t => t.status === 'completed').length 
    },
    { 
      status: 'delayed', 
      label: t.colDelayed, 
      count: filteredTasks.filter(t => t.status === 'delayed').length 
    },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
            {getPriorityName('critical', language)}
          </span>
        );
      case 'high':
        return (
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            {getPriorityName('high', language)}
          </span>
        );
      case 'medium':
        return (
          <span className="text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">
            {getPriorityName('medium', language)}
          </span>
        );
      case 'low':
        return (
          <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
            {getPriorityName('low', language)}
          </span>
        );
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'backlog') return 'in_progress';
    if (current === 'in_progress') return 'inspection';
    if (current === 'inspection') return 'completed';
    if (current === 'delayed') return 'in_progress';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'completed') return 'inspection';
    if (current === 'inspection') return 'in_progress';
    if (current === 'in_progress') return 'backlog';
    if (current === 'delayed') return 'in_progress';
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Global Search and Filter Bar */}
      <GlobalSearchFilterBar
        currentContext="tasks"
        matchingCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      {/* View Switcher, Priority & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl">
        {/* Left: Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">
            {language === 'ur' ? 'ترجیح (Priority):' : 'Priority:'}
          </span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">{language === 'ur' ? 'تمام ترجیحات' : 'All Priorities'}</option>
            <option value="critical">{getPriorityName('critical', language)}</option>
            <option value="high">{getPriorityName('high', language)}</option>
            <option value="medium">{getPriorityName('medium', language)}</option>
            <option value="low">{getPriorityName('low', language)}</option>
          </select>
        </div>

        {/* Right: View Switcher, Export CSV, and New Task */}
        <div className="flex items-center gap-2.5">
          {/* Segmented View Switcher */}
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={() => exportTasksToCSV(filteredTasks, projects, language)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap"
            title="Download Tasks as CSV for Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ur' ? 'ایکسپورٹ CSV' : 'Export CSV'}</span>
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.newTask}</span>
          </button>
        </div>
      </div>

      {/* View Mode: Kanban */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            
            return (
              <div 
                key={col.status} 
                className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs">
                  <span className="font-bold text-neutral-200">
                    {col.label}
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400">
                    {col.count}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center text-neutral-500 text-xs p-4 text-center">
                      <span>{language === 'ur' ? 'اس مرحلے میں کوئی کام نہیں' : 'No tasks in this lane'}</span>
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const project = projects.find(p => p.id === task.projectId);
                      const completedChecks = task.checklist.filter(c => c.completed).length;
                      const totalChecks = task.checklist.length;
                      const nextSt = getNextStatus(task.status);
                      const prevSt = getPrevStatus(task.status);

                      return (
                        <div
                          key={task.id}
                          className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg p-3.5 transition-all shadow-sm group space-y-3 cursor-pointer"
                          onClick={() => onSelectTask(task)}
                        >
                          {/* Top Tag & Priority */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-semibold text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                              {project?.code || 'SITE'}
                            </span>
                            {getPriorityBadge(task.priority)}
                          </div>

                          {/* Task Title */}
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                              {language === 'ur' && task.titleUrdu ? task.titleUrdu : task.title}
                            </h4>
                            <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5">
                              <span>{task.trade}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-neutral-500 truncate max-w-[120px]">{task.contractor}</span>
                            </div>
                          </div>

                          {/* Progress Bar & Checklist Count */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                              <span className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3 text-amber-500/80" />
                                <span>{completedChecks}/{totalChecks}</span>
                              </span>
                              <span>{task.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                              <div
                                className={`h-1 rounded-full ${
                                  task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${task.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer: Crew & Date */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-900">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-neutral-500" />
                              <span className="tabular-nums">{task.crewSize}</span>
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-500">
                              <Clock className="w-3 h-3" />
                              <span>{task.dueDate.substring(5)}</span>
                            </span>
                          </div>

                          {/* Action Buttons to move column */}
                          <div 
                            className="flex items-center justify-between pt-1 gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {prevSt ? (
                              <button
                                onClick={() => moveTaskStatus(task.id, prevSt)}
                                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded text-[11px] flex items-center gap-0.5"
                                title="Move back"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            ) : <div />}

                            {task.status !== 'delayed' && task.status !== 'completed' && (
                              <button
                                onClick={() => moveTaskStatus(task.id, 'delayed')}
                                className="px-1.5 py-0.5 text-[10px] text-rose-400 hover:bg-rose-950/40 rounded"
                                title="Mark delayed"
                              >
                                {language === 'ur' ? 'تاخیر' : 'Delayed'}
                              </button>
                            )}

                            {nextSt && (
                              <button
                                onClick={() => moveTaskStatus(task.id, nextSt)}
                                className="p-1 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded text-[11px] flex items-center gap-0.5 ml-auto"
                                title="Move forward"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode: High-Density Table List */
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Task & Project</th>
                  <th className="py-3 px-4">Phase</th>
                  <th className="py-3 px-4">Trade / Contractor</th>
                  <th className="py-3 px-4 text-center">Crew</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Progress</th>
                  <th className="py-3 px-4 text-right">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-neutral-500">
                      {language === 'ur' ? 'کوئی کام نہیں ملا' : 'No tasks match criteria'}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <tr 
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="hover:bg-neutral-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">
                            {language === 'ur' && task.titleUrdu ? task.titleUrdu : task.title}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-amber-400">{project?.code}</span>
                            <span aria-hidden="true">·</span>
                            <span>{project?.name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-neutral-300">
                            {getPhaseName(task.phase, language)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-neutral-200 font-medium">{task.trade}</div>
                          <div className="text-[11px] text-neutral-400">{task.contractor}</div>
                        </td>

                        <td className="py-3 px-4 text-center tabular-nums font-mono text-neutral-300">
                          {task.crewSize}
                        </td>

                        <td className="py-3 px-4">
                          {getPriorityBadge(task.priority)}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium ${
                            task.status === 'completed' 
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' 
                              : task.status === 'in_progress'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                              : task.status === 'delayed'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            {getTaskStatusName(task.status, language)}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                          {task.progressPercentage}%
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-neutral-400 tabular-nums">
                          {task.dueDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
