import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ConstructionTask } from '../types';
import { translations, getPhaseName } from '../utils/translations';
import { CalendarRange, ChevronLeft, ChevronRight, Layers, AlertCircle, Clock } from 'lucide-react';

interface GanttTimelineProps {
  onSelectTask: (task: ConstructionTask) => void;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({ onSelectTask }) => {
  const { projects, tasks, activeProjectId, setActiveProjectId, language } = useProject();
  const t = translations[language];

  // Base date range for Gantt display (from Oct 1, 2026 to Nov 30, 2026 - 60 days view)
  const baseStartDate = new Date('2026-10-01');
  const totalDays = 60; // 2 months view

  // Filter tasks
  const relevantTasks = activeProjectId === 'all'
    ? tasks
    : tasks.filter(t => t.projectId === activeProjectId);

  // Helper to calculate days offset from baseStartDate
  const getDaysDiff = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffTime = d.getTime() - baseStartDate.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Generate weeks headers
  const weeks: { weekLabel: string; startDay: number; daysCount: number }[] = [];
  for (let d = 0; d < totalDays; d += 7) {
    const wDate = new Date(baseStartDate);
    wDate.setDate(wDate.getDate() + d);
    weeks.push({
      weekLabel: `W${Math.floor(d / 7) + 1} (${wDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      startDay: d,
      daysCount: Math.min(7, totalDays - d)
    });
  }

  // Today indicator (Oct 31, 2026)
  const todayOffset = getDaysDiff('2026-10-31');

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <CalendarRange className="w-4 h-4 text-amber-400" />
            <span>{language === 'ur' ? 'تعمیراتی شیڈول اور ٹائم لائن' : 'Construction Schedule & Critical Path'}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {language === 'ur' ? 'گانٹ چارٹ (Gantt Timeline)' : 'Master Timeline & Gantt View'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">{language === 'ur' ? 'تمام پروجیکٹس کا شیڈول' : 'All Projects Schedule'}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-neutral-400 border-l border-neutral-800 pl-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
              <span>{language === 'ur' ? 'کریٹیکل پاتھ' : 'Critical Path'}</span>
            </span>
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
              <span>{language === 'ur' ? 'معمول کا کام' : 'Standard'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            {/* Header: Months & Weeks Bar */}
            <div className="grid grid-cols-12 bg-neutral-950 border-b border-neutral-800 text-xs font-semibold text-neutral-300">
              {/* Left Column: Task Name info */}
              <div className="col-span-4 p-3 border-r border-neutral-800">
                {language === 'ur' ? 'کام کا نام اور ٹھیکیدار' : 'Construction Task & Trade'}
              </div>

              {/* Right: Timeline Grid Header */}
              <div className="col-span-8 grid grid-cols-8 divide-x divide-neutral-800 text-center font-mono text-[11px] text-neutral-400">
                {weeks.map((w, idx) => (
                  <div key={idx} className="p-2 truncate bg-neutral-950/60">
                    {w.weekLabel}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-neutral-800/60 relative">
              {/* Today line indicator across the grid */}
              {todayOffset >= 0 && todayOffset <= totalDays && (
                <div 
                  className="absolute top-0 bottom-0 z-10 pointer-events-none border-l-2 border-amber-500/80"
                  style={{
                    left: `calc(33.333333% + ${(todayOffset / totalDays) * 66.666667}%)`
                  }}
                >
                  <div className="bg-amber-500 text-neutral-950 text-[10px] font-bold px-1 py-0.5 rounded -translate-x-1/2 whitespace-nowrap shadow">
                    Today (31 Oct)
                  </div>
                </div>
              )}

              {relevantTasks.map((task) => {
                const project = projects.find(p => p.id === task.projectId);
                const startOffset = Math.max(0, getDaysDiff(task.startDate));
                const endOffset = Math.min(totalDays, getDaysDiff(task.dueDate));
                const duration = Math.max(2, endOffset - startOffset);

                const leftPercent = (startOffset / totalDays) * 100;
                const widthPercent = (duration / totalDays) * 100;

                const isCritical = task.priority === 'critical';

                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 items-center hover:bg-neutral-800/40 transition-colors py-2.5 px-3 cursor-pointer group"
                    onClick={() => onSelectTask(task)}
                  >
                    {/* Left: Task Info */}
                    <div className="col-span-4 pr-3 flex flex-col justify-center border-r border-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-amber-400 bg-neutral-950 px-1 rounded border border-neutral-800">
                          {project?.code}
                        </span>
                        <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                          {language === 'ur' && task.titleUrdu ? task.titleUrdu : task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        <span className="truncate">{task.trade}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-neutral-500 text-[10px]">{task.startDate.substring(5)} to {task.dueDate.substring(5)}</span>
                      </div>
                    </div>

                    {/* Right: Gantt Bar Container */}
                    <div className="col-span-8 relative h-9 flex items-center px-2">
                      {/* Background grid lines for weeks */}
                      <div className="absolute inset-0 grid grid-cols-8 divide-x divide-neutral-800/40 pointer-events-none" />

                      {/* Bar */}
                      <div
                        className={`relative h-6 rounded-md shadow flex items-center justify-between px-2 text-[11px] font-semibold transition-all ${
                          isCritical
                            ? 'bg-rose-950/80 border border-rose-500/60 text-rose-200'
                            : 'bg-amber-950/80 border border-amber-500/60 text-amber-200'
                        }`}
                        style={{
                          marginLeft: `${leftPercent}%`,
                          width: `${Math.max(10, widthPercent)}%`
                        }}
                      >
                        {/* Progress Fill inside bar */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 rounded-l-md opacity-40 ${
                            isCritical ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${task.progressPercentage}%` }}
                        />

                        <span className="truncate z-10 text-[10px]">
                          {task.trade}
                        </span>

                        <span className="font-mono text-[10px] z-10 ml-1">
                          {task.progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
