import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ProjectPhase, TaskPriority, TaskStatus } from '../types';
import { translations, getPhaseName, getPriorityName } from '../utils/translations';
import { X, Plus, Calendar, Building2, User } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { projects, activeProjectId, addTask, language } = useProject();
  const t = translations[language];

  const defaultProjId = activeProjectId !== 'all' ? activeProjectId : (projects[0]?.id || '');

  const [projectId, setProjectId] = useState(defaultProjId);
  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [phase, setPhase] = useState<ProjectPhase>('structure');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [trade, setTrade] = useState('Civil & Structural');
  const [contractor, setContractor] = useState('');
  const [crewSize, setCrewSize] = useState(6);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(500000);
  const [notes, setNotes] = useState('');
  const [checklistItem, setChecklistItem] = useState('');
  const [checklist, setChecklist] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (checklistItem.trim()) {
      setChecklist(prev => [...prev, checklistItem.trim()]);
      setChecklistItem('');
    }
  };

  const handleRemoveChecklist = (idx: number) => {
    setChecklist(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    addTask({
      projectId,
      title: title.trim(),
      titleUrdu: titleUrdu.trim() || undefined,
      phase,
      status: 'backlog',
      priority,
      contractor: contractor.trim() || 'Direct Site Crew',
      trade: trade.trim() || 'General Civil',
      crewSize: Number(crewSize) || 4,
      progressPercentage: 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      estimatedCost: Number(estimatedCost) || 0,
      checklist: checklist.map((txt, i) => ({ id: `c-${Date.now()}-${i}`, text: txt, completed: false })),
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-bold text-white">
            {t.newTask}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project Selector */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Select Project / Site *
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Task Title (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5th Floor Slab Formwork & Shuttering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                کام کا نام (اردو)
              </label>
              <input
                type="text"
                placeholder="مثلاً: پانچویں منزل سلیب شٹرنگ"
                value={titleUrdu}
                onChange={(e) => setTitleUrdu(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
              />
            </div>
          </div>

          {/* Phase & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Construction Phase
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as ProjectPhase)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="excavation">{getPhaseName('excavation', language)}</option>
                <option value="foundation">{getPhaseName('foundation', language)}</option>
                <option value="structure">{getPhaseName('structure', language)}</option>
                <option value="masonry">{getPhaseName('masonry', language)}</option>
                <option value="mep">{getPhaseName('mep', language)}</option>
                <option value="finishing">{getPhaseName('finishing', language)}</option>
                <option value="handover">{getPhaseName('handover', language)}</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="critical">{getPriorityName('critical', language)}</option>
                <option value="high">{getPriorityName('high', language)}</option>
                <option value="medium">{getPriorityName('medium', language)}</option>
                <option value="low">{getPriorityName('low', language)}</option>
              </select>
            </div>
          </div>

          {/* Contractor & Crew */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Trade / Category
              </label>
              <input
                type="text"
                placeholder="e.g. Steel Fixing / Electrical"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Contractor / Subcontractor
              </label>
              <input
                type="text"
                placeholder="e.g. Al-Madina Steel Fixers"
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Crew Size (Labour)
              </label>
              <input
                type="number"
                min="1"
                value={crewSize}
                onChange={(e) => setCrewSize(parseInt(e.target.value) || 1)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Dates & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Est. Cost (PKR)
              </label>
              <input
                type="number"
                step="1000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="block text-neutral-400 font-semibold">
              Quality Checklist Steps
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Inspect cover blocks and spacing"
                value={checklistItem}
                onChange={(e) => setChecklistItem(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {checklist.length > 0 && (
              <ul className="space-y-1 mt-2">
                {checklist.map((c, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800 text-neutral-300">
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(idx)}
                      className="text-neutral-500 hover:text-rose-400 text-xs px-1"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              {t.notes}
            </label>
            <textarea
              rows={2}
              placeholder="Engineering guidelines or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-300 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
            >
              {language === 'ur' ? 'کام محفوظ کریں' : 'Create Task'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
