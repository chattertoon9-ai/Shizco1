import React, { useState } from 'react';
import { ConstructionTask, TaskStatus, TaskPriority, ProjectPhase } from '../types';
import { useProject } from '../context/ProjectContext';
import { translations, getPhaseName, getPriorityName, getTaskStatusName, formatCurrency } from '../utils/translations';
import { 
  X, 
  CheckSquare, 
  Square, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Trash2, 
  Save, 
  Plus, 
  Building2,
  Clock
} from 'lucide-react';

interface TaskDetailModalProps {
  task: ConstructionTask | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { 
    projects, 
    updateTask, 
    deleteTask, 
    toggleChecklistItem, 
    language 
  } = useProject();

  if (!task) return null;

  const t = translations[language];
  const project = projects.find(p => p.id === task.projectId);

  const [title, setTitle] = useState(task.title);
  const [titleUrdu, setTitleUrdu] = useState(task.titleUrdu || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [trade, setTrade] = useState(task.trade);
  const [contractor, setContractor] = useState(task.contractor);
  const [crewSize, setCrewSize] = useState(task.crewSize);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [progress, setProgress] = useState(task.progressPercentage);
  const [notes, setNotes] = useState(task.notes || '');
  const [newCheckItem, setNewCheckItem] = useState('');

  const handleSave = () => {
    updateTask(task.id, {
      title,
      titleUrdu,
      status,
      priority,
      trade,
      contractor,
      crewSize,
      dueDate,
      progressPercentage: progress,
      notes
    });
    onClose();
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;

    const newItem = {
      id: `c-${Date.now()}`,
      text: newCheckItem.trim(),
      completed: false
    };

    updateTask(task.id, {
      checklist: [...task.checklist, newItem]
    });
    setNewCheckItem('');
  };

  const handleDelete = () => {
    if (confirm(language === 'ur' ? 'کیا آپ اس کام کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <span className="font-mono text-amber-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                {project?.code || 'SITE'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{project?.name}</span>
              <span aria-hidden="true">·</span>
              <span>{getPhaseName(task.phase, language)}</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {language === 'ur' && task.titleUrdu ? task.titleUrdu : task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Title EN */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Task Title (English)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Title UR */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              کام کا نام (اردو)
            </label>
            <input
              type="text"
              value={titleUrdu}
              onChange={(e) => setTitleUrdu(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right font-medium"
              placeholder="مثلاً: تیسری منزل سلیب کی شٹرنگ"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              {t.status}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="backlog">{getTaskStatusName('backlog', language)}</option>
              <option value="in_progress">{getTaskStatusName('in_progress', language)}</option>
              <option value="inspection">{getTaskStatusName('inspection', language)}</option>
              <option value="completed">{getTaskStatusName('completed', language)}</option>
              <option value="delayed">{getTaskStatusName('delayed', language)}</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              {t.priority}
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

          {/* Trade */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Trade / Specialization
            </label>
            <input
              type="text"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Contractor */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              {t.contractor}
            </label>
            <input
              type="text"
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Crew Size */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              {t.crewSize}
            </label>
            <input
              type="number"
              value={crewSize}
              onChange={(e) => setCrewSize(parseInt(e.target.value) || 0)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-neutral-300 font-semibold">
            <span>{t.progress}</span>
            <span className="font-mono text-amber-400">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Checklist Section */}
        <div className="space-y-3 pt-3 border-t border-neutral-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>{t.checklist} ({task.checklist.filter(c => c.completed).length}/{task.checklist.length})</span>
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {task.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(task.id, item.id)}
                className="flex items-start gap-2.5 p-2 bg-neutral-950 rounded-lg border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors"
              >
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                )}
                <span className={`text-xs ${item.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Add Checklist Step Form */}
          <form onSubmit={handleAddChecklist} className="flex gap-2">
            <input
              type="text"
              placeholder={t.addChecklistItem}
              value={newCheckItem}
              onChange={(e) => setNewCheckItem(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Site Notes */}
        <div className="space-y-1.5 text-xs">
          <label className="block text-neutral-400 font-semibold">
            {t.notes}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
            placeholder="Structural specifications, batch numbers, testing requirements..."
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg border border-rose-900/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.delete}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
