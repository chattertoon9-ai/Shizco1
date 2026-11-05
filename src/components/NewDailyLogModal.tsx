import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { WeatherCondition } from '../types';
import { translations } from '../utils/translations';
import { X, ClipboardList, Plus, Trash2 } from 'lucide-react';

interface NewDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDailyLogModal: React.FC<NewDailyLogModalProps> = ({ isOpen, onClose }) => {
  const { projects, activeProjectId, addDailyLog, language } = useProject();
  const t = translations[language];

  const defaultProjId = activeProjectId !== 'all' ? activeProjectId : (projects[0]?.id || '');

  const [projectId, setProjectId] = useState(defaultProjId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supervisor, setSupervisor] = useState('Sub-Engr. Bilal Aslam');
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [temperatureC, setTemperatureC] = useState(30);
  const [workSummary, setWorkSummary] = useState('');
  const [delaysOrObstacles, setDelaysOrObstacles] = useState('');
  const [safetyIncidentsCount, setSafetyIncidentsCount] = useState(0);

  // Workforce rows
  const [workers, setWorkers] = useState<{ trade: string; count: number }[]>([
    { trade: 'Steel Fixers (سریا والے)', count: 12 },
    { trade: 'Shuttering Carpenters (شٹرنگ مستری)', count: 8 },
    { trade: 'General Labourers (عام مزدور)', count: 16 }
  ]);

  const [newTrade, setNewTrade] = useState('');
  const [newCount, setNewCount] = useState(4);

  // Materials received
  const [materials, setMaterials] = useState<{ material: string; quantity: string; supplier: string }[]>([]);
  const [matName, setMatName] = useState('');
  const [matQty, setMatQty] = useState('');
  const [matSupplier, setMatSupplier] = useState('');

  if (!isOpen) return null;

  const handleAddWorker = () => {
    if (newTrade.trim()) {
      setWorkers(prev => [...prev, { trade: newTrade.trim(), count: Number(newCount) || 1 }]);
      setNewTrade('');
      setNewCount(1);
    }
  };

  const handleRemoveWorker = (index: number) => {
    setWorkers(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMaterial = () => {
    if (matName.trim() && matQty.trim()) {
      setMaterials(prev => [...prev, {
        material: matName.trim(),
        quantity: matQty.trim(),
        supplier: matSupplier.trim() || 'Direct Supplier'
      }]);
      setMatName('');
      setMatQty('');
      setMatSupplier('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workSummary.trim() || !projectId) return;

    addDailyLog({
      projectId,
      date,
      supervisor: supervisor.trim() || 'Site Supervisor',
      weather,
      temperatureC: Number(temperatureC) || 28,
      workersCount: workers,
      workSummary: workSummary.trim(),
      delaysOrObstacles: delaysOrObstacles.trim(),
      safetyIncidentsCount: Number(safetyIncidentsCount) || 0,
      materialsReceived: materials
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span>{t.newDailyLog}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project & Date */}
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
                Log Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Supervisor & Weather */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Supervisor Name
              </label>
              <input
                type="text"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as WeatherCondition)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="sunny">{t.weather_sunny}</option>
                <option value="cloudy">{t.weather_cloudy}</option>
                <option value="rainy">{t.weather_rainy}</option>
                <option value="extreme_heat">{t.weather_extreme_heat}</option>
                <option value="dust_storm">{t.weather_dust_storm}</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={temperatureC}
                onChange={(e) => setTemperatureC(parseInt(e.target.value) || 25)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Workforce Attendance */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="block text-neutral-400 font-semibold">
              Workforce Attendance by Trade (مزدور حاضری)
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {workers.map((w, idx) => (
                <div key={idx} className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800 text-neutral-300">
                  <span>{w.trade}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{w.count}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorker(idx)}
                      className="text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Masons / Plumbers"
                value={newTrade}
                onChange={(e) => setNewTrade(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                type="number"
                min="1"
                placeholder="Count"
                value={newCount}
                onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
                className="w-20 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddWorker}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Work Executed Today */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Work Completed Today (آج کی پیش رفت) *
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Completed rebar tie work on 4th floor slab; poured lean concrete in basement trench..."
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Obstacles & Delays */}
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">
              Site Delays or Obstacles (مسائل و رکاوٹیں)
            </label>
            <input
              type="text"
              placeholder="e.g. Concrete batching truck arrived 1 hour late due to city traffic"
              value={delaysOrObstacles}
              onChange={(e) => setDelaysOrObstacles(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Materials Received */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="block text-neutral-400 font-semibold">
              Materials Received Today (سامان کی ترسیل)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Material (e.g. 200 bags Cement)"
                value={matName}
                onChange={(e) => setMatName(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-white"
              />
              <input
                type="text"
                placeholder="Qty (e.g. 200 Bags)"
                value={matQty}
                onChange={(e) => setMatQty(e.target.value)}
                className="w-28 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-white"
              />
              <input
                type="text"
                placeholder="Supplier"
                value={matSupplier}
                onChange={(e) => setMatSupplier(e.target.value)}
                className="w-32 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-white"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {materials.length > 0 && (
              <ul className="space-y-1">
                {materials.map((m, i) => (
                  <li key={i} className="text-[11px] text-neutral-300 bg-neutral-950 px-2 py-1 rounded flex justify-between">
                    <span>{m.material} ({m.quantity})</span>
                    <span className="text-neutral-500">{m.supplier}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Safety incident */}
          <div className="flex items-center gap-3 pt-2">
            <label className="text-neutral-400 font-semibold">
              Safety Incidents Today:
            </label>
            <input
              type="number"
              min="0"
              value={safetyIncidentsCount}
              onChange={(e) => setSafetyIncidentsCount(parseInt(e.target.value) || 0)}
              className="w-20 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-white font-mono"
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
              {language === 'ur' ? 'روزنامچہ محفوظ کریں' : 'Save Site Log'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
