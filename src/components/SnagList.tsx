import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { SnagItem } from '../types';
import { translations } from '../utils/translations';
import { AlertCircle, Plus, CheckCircle2, Clock, Trash2, ShieldAlert } from 'lucide-react';

interface SnagListProps {
  onOpenNewSnag: () => void;
}

export const SnagList: React.FC<SnagListProps> = ({ onOpenNewSnag }) => {
  const { 
    projects, 
    snags, 
    activeProjectId, 
    setActiveProjectId, 
    updateSnagStatus, 
    deleteSnag, 
    language 
  } = useProject();

  const t = translations[language];
  const [statusFilter, setStatusFilter] = useState('all');

  const relevantSnags = snags.filter(s => {
    if (activeProjectId !== 'all' && s.projectId !== activeProjectId) {
      return false;
    }
    if (statusFilter !== 'all' && s.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getSeverityBadge = (severity: SnagItem['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
            {language === 'ur' ? 'سنگین نقص (Critical)' : 'Critical Defect'}
          </span>
        );
      case 'moderate':
        return (
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            {language === 'ur' ? 'درمیانہ (Moderate)' : 'Moderate'}
          </span>
        );
      case 'minor':
        return (
          <span className="text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">
            {language === 'ur' ? 'معمولی (Minor)' : 'Minor Snag'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{language === 'ur' ? 'کوالٹی انسپیکشن اور اسنیگ لسٹ' : 'Quality Control & Punch List (Snagging)'}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {language === 'ur' ? 'سائٹ کے نقائص و اصلاحی اقدامات' : 'Defect Rectification & Handover Snags'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">{language === 'ur' ? 'تمام سائٹس' : 'All Projects'}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewSnag}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.newSnag}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg w-fit text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            statusFilter === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {language === 'ur' ? 'تمام نقائص' : 'All Snags'} ({relevantSnags.length})
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            statusFilter === 'open' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {language === 'ur' ? 'کھلے نقائص (Open)' : 'Open'}
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            statusFilter === 'in_progress' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {language === 'ur' ? 'اصلاح جاری (Fixing)' : 'In Progress'}
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            statusFilter === 'resolved' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {language === 'ur' ? 'حل شدہ (Resolved)' : 'Resolved'}
        </button>
      </div>

      {/* Snag Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relevantSnags.length === 0 ? (
          <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
            {language === 'ur' ? 'کوئی خرابی یا نقص درج نہیں ہے' : 'No snags found for selected filters'}
          </div>
        ) : (
          relevantSnags.map(snag => {
            const proj = projects.find(p => p.id === snag.projectId);
            return (
              <div
                key={snag.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {proj?.code} · {snag.locationDetails}
                    </span>
                    {getSeverityBadge(snag.severity)}
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {snag.title}
                  </h3>

                  {snag.notes && (
                    <p className="text-xs text-neutral-400 mt-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 leading-relaxed">
                      {snag.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-neutral-400 text-[11px]">
                    <span>Contractor: <strong className="text-neutral-200">{snag.assignedContractor}</strong></span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>Reported: {snag.reportedDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={snag.status}
                      onChange={(e) => updateSnagStatus(snag.id, e.target.value as any)}
                      className={`text-xs font-semibold rounded px-2.5 py-1 focus:outline-none border ${
                        snag.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : snag.status === 'in_progress'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => deleteSnag(snag.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                      title="Delete snag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
