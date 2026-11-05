import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ProjectPhase } from '../types';
import { translations, getPhaseName } from '../utils/translations';
import { X, Building2, MapPin, Wallet, Calendar } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, language, isAdmin, setIsLoginModalOpen } = useProject();
  const t = translations[language];

  const [code, setCode] = useState(`SITE-${Math.floor(Math.random() * 900 + 100)}`);
  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [budget, setBudget] = useState(50000000);
  const [phase, setPhase] = useState<ProjectPhase>('foundation');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState('');
  const [description, setDescription] = useState('');

  // Default images to select from
  const bannerOptions = [
    '/src/assets/images/construction_commercial_site_1793460327058.jpg',
    '/src/assets/images/construction_residential_villa_1793460328341.jpg',
    '/src/assets/images/construction_site_plan_1793460328422.jpg',
  ];
  const [selectedBanner, setSelectedBanner] = useState(bannerOptions[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!name.trim()) return;

    addProject({
      code: code.trim() || 'SITE-01',
      name: name.trim(),
      nameUrdu: nameUrdu.trim() || undefined,
      client: client.trim() || 'Direct Client',
      location: location.trim() || 'Karachi, Sindh, Pakistan',
      projectManager: projectManager.trim() || 'Site Resident Engineer',
      status: 'in_progress',
      currentPhase: phase,
      budget: Number(budget) || 10000000,
      spent: 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetEndDate: targetEndDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      bannerImage: selectedBanner,
      description: description.trim() || 'Standard civil and structural construction project.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>{t.newProject}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAdmin && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="text-amber-300">
              <span className="font-bold">{t.adminOnly}:</span> {t.adminOnlyDesc}
            </div>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="px-2.5 py-1 bg-amber-500 text-neutral-950 font-semibold rounded text-[11px] hover:bg-amber-400 shrink-0"
            >
              {t.switchRole}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Project Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-400 font-semibold mb-1">
                Project Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Al-Noor Commercial Tower"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              منصوبے کا نام (اردو)
            </label>
            <input
              type="text"
              placeholder="مثلاً: النور کمرشل ٹاور (جی پلس فور)"
              value={nameUrdu}
              onChange={(e) => setNameUrdu(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Client / Developer
              </label>
              <input
                type="text"
                placeholder="e.g. Hashir Real Estate Holdings"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Site Location
              </label>
              <input
                type="text"
                placeholder="e.g. DHA Phase 8 / Clifton, Karachi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Resident Project Engineer / Manager
              </label>
              <input
                type="text"
                placeholder="e.g. Engr. Asadullah Khan"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Approved Budget (PKR)
              </label>
              <input
                type="number"
                step="500000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Initial Phase
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
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Completion Date
              </label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Banner selection */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1.5">
              Select Site Hero Photo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {bannerOptions.map((banner, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedBanner(banner)}
                  className={`relative h-16 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                    selectedBanner === banner ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={banner} alt={`Option ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Project Scope & Description
            </label>
            <textarea
              rows={2}
              placeholder="Commercial specifications, number of stories, structural engineering notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              disabled={!isAdmin}
              className={`px-5 py-2 font-semibold rounded-lg transition-colors ${
                isAdmin 
                  ? 'text-neutral-950 bg-amber-500 hover:bg-amber-400' 
                  : 'text-neutral-400 bg-neutral-800 cursor-not-allowed border border-neutral-700'
              }`}
            >
              {isAdmin 
                ? (language === 'ur' ? 'منصوبہ شامل کریں' : 'Create Project') 
                : (language === 'ur' ? 'ایڈمن لاگ ان درکار ہے' : 'Admin Login Required')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
