import React from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, getPhaseName, getTaskStatusName } from '../utils/translations';
import { 
  Search, 
  X, 
  Filter, 
  RotateCcw, 
  Layers, 
  Building2, 
  Tag
} from 'lucide-react';
import { ProjectPhase, TaskStatus } from '../types';

interface GlobalSearchFilterBarProps {
  currentContext?: 'tasks' | 'materials' | 'global';
  matchingCount?: number;
  totalCount?: number;
}

export const GlobalSearchFilterBar: React.FC<GlobalSearchFilterBarProps> = ({
  currentContext = 'global',
  matchingCount,
  totalCount
}) => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    phaseFilter,
    setPhaseFilter,
    resetFilters,
    language
  } = useProject();

  const t = translations[language];
  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== 'all' || phaseFilter !== 'all');

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              currentContext === 'materials'
                ? (language === 'ur' ? 'تعمیراتی سامان، سپلائر یا انوائس تلاش کریں...' : 'Search material name, supplier, category, or invoice #...')
                : currentContext === 'tasks'
                ? (language === 'ur' ? 'کام، ٹھیکیدار، ٹریڈ یا سائٹ نوٹس تلاش کریں...' : 'Search task title, contractor, trade, or specs...')
                : (language === 'ur' ? 'پورے سسٹم میں تلاش کریں...' : 'Global search across tasks and materials...')
            }
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded"
              title="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:inline" />
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">{language === 'ur' ? 'تمام پروجیکٹس (All Sites)' : 'All Construction Sites'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:inline" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">{language === 'ur' ? 'تمام صورتحال (All Status)' : 'All Statuses'}</option>

              {currentContext === 'materials' ? (
                <>
                  <option value="received">{language === 'ur' ? 'موصول شدہ (Received)' : 'Received on Site'}</option>
                  <option value="ordered">{language === 'ur' ? 'آرڈر شدہ (Ordered)' : 'Pending Delivery'}</option>
                  <option value="consumed">{language === 'ur' ? 'استعمال شدہ (Consumed)' : 'Consumed / Used'}</option>
                </>
              ) : currentContext === 'tasks' ? (
                <>
                  <option value="backlog">{getTaskStatusName('backlog', language)}</option>
                  <option value="in_progress">{getTaskStatusName('in_progress', language)}</option>
                  <option value="inspection">{getTaskStatusName('inspection', language)}</option>
                  <option value="completed">{getTaskStatusName('completed', language)}</option>
                  <option value="delayed">{getTaskStatusName('delayed', language)}</option>
                </>
              ) : (
                <>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                  <option value="received">Material Received</option>
                  <option value="ordered">Material Ordered</option>
                </>
              )}
            </select>
          </div>

          {/* Context-Specific Phase or Category Selector */}
          {currentContext === 'tasks' && (
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:inline" />
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="all">{language === 'ur' ? 'تمام مراحل (Phases)' : 'All Phases'}</option>
                <option value="excavation">{getPhaseName('excavation', language)}</option>
                <option value="foundation">{getPhaseName('foundation', language)}</option>
                <option value="structure">{getPhaseName('structure', language)}</option>
                <option value="masonry">{getPhaseName('masonry', language)}</option>
                <option value="mep">{getPhaseName('mep', language)}</option>
                <option value="finishing">{getPhaseName('finishing', language)}</option>
                <option value="handover">{getPhaseName('handover', language)}</option>
              </select>
            </div>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors whitespace-nowrap"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{language === 'ur' ? 'فلٹرز صاف کریں' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Summary Bar */}
      {(matchingCount !== undefined || hasActiveFilters) && (
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span>
              {matchingCount !== undefined ? (
                <>
                  <strong className="text-white font-mono tabular-nums">{matchingCount}</strong>
                  {totalCount !== undefined ? (
                    <span> of <strong className="text-neutral-300 font-mono tabular-nums">{totalCount}</strong> items match</span>
                  ) : (
                    <span> items match</span>
                  )}
                </>
              ) : (
                <span>Filters Active</span>
              )}
            </span>
            {searchQuery && (
              <span className="text-neutral-500">
                · Keyword: "<span className="text-amber-400">{searchQuery}</span>"
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="text-neutral-500">
                · Status: <span className="text-neutral-200 capitalize">{statusFilter.replace('_', ' ')}</span>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              {language === 'ur' ? 'تمام ریکارڈز دکھائیں' : 'Show All Items'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
