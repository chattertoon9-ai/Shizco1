import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { SnagItem } from '../types';
import { translations } from '../utils/translations';
import { X, AlertCircle } from 'lucide-react';

interface NewSnagModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewSnagModal: React.FC<NewSnagModalProps> = ({ isOpen, onClose }) => {
  const { projects, activeProjectId, addSnag, language } = useProject();
  const t = translations[language];

  const defaultProjId = activeProjectId !== 'all' ? activeProjectId : (projects[0]?.id || '');

  const [projectId, setProjectId] = useState(defaultProjId);
  const [title, setTitle] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [severity, setSeverity] = useState<SnagItem['severity']>('moderate');
  const [assignedContractor, setAssignedContractor] = useState('');
  const [notes, setNotes] = useState('');
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    addSnag({
      projectId,
      title: title.trim(),
      locationDetails: locationDetails.trim() || 'General Site Area',
      severity,
      status: 'open',
      assignedContractor: assignedContractor.trim() || 'Site Supervisor',
      reportedDate,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>{t.newSnag}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Site / Project *
              </label>
              <select
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

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="critical">Critical Defect (فوری اصلاح ضروری)</option>
                <option value="moderate">Moderate (درمیانہ نقص)</option>
                <option value="minor">Minor Snag (معمولی)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Defect / Snag Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Honeycombing on column C-04 base or misalignment in bathroom tile line"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Location & Contractor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Exact Location on Site
              </label>
              <input
                type="text"
                placeholder="e.g. 2nd Floor, Master Bed Ceiling"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Responsible Contractor / Subcontractor
              </label>
              <input
                type="text"
                placeholder="e.g. Bismillah Civil or Smart Electricians"
                value={assignedContractor}
                onChange={(e) => setAssignedContractor(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Rectification Instructions & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Apply Sika non-shrink structural repair grout before plastering..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Buttons */}
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
              {language === 'ur' ? 'نقص درج کریں' : 'Record Snag'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
