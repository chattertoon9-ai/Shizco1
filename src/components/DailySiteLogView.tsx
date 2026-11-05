import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { DailySiteLog, WeatherCondition } from '../types';
import { translations } from '../utils/translations';
import { 
  ClipboardList, 
  Plus, 
  Sun, 
  CloudRain, 
  CloudSun, 
  Flame, 
  Wind, 
  Users, 
  ShieldCheck, 
  Truck, 
  AlertCircle,
  Calendar,
  Building2,
  Trash2
} from 'lucide-react';

interface DailySiteLogViewProps {
  onOpenNewLog: () => void;
}

export const DailySiteLogView: React.FC<DailySiteLogViewProps> = ({ onOpenNewLog }) => {
  const { 
    projects, 
    dailyLogs, 
    activeProjectId, 
    setActiveProjectId, 
    deleteDailyLog, 
    language 
  } = useProject();

  const t = translations[language];

  const relevantLogs = activeProjectId === 'all'
    ? dailyLogs
    : dailyLogs.filter(l => l.projectId === activeProjectId);

  const [selectedLogId, setSelectedLogId] = useState<string>(
    relevantLogs[0]?.id || ''
  );

  const currentLog = relevantLogs.find(l => l.id === selectedLogId) || relevantLogs[0];
  const project = projects.find(p => p.id === currentLog?.projectId);

  const getWeatherIcon = (w: WeatherCondition) => {
    switch (w) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'cloudy':
        return <CloudSun className="w-5 h-5 text-neutral-300" />;
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'extreme_heat':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'dust_storm':
        return <Wind className="w-5 h-5 text-amber-600" />;
    }
  };

  const getWeatherLabel = (w: WeatherCondition) => {
    return t[`weather_${w}` as keyof typeof t] || w;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <ClipboardList className="w-4 h-4 text-amber-400" />
            <span>{language === 'ur' ? 'سائٹ روزنامچہ و روزانہ رپورٹ' : 'Daily Construction Site Diary (Roznamcha)'}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {language === 'ur' ? 'سائٹ لاگ و ورک فورس ریکارڈ' : 'Daily Site Logs & Workforce Records'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">{language === 'ur' ? 'تمام سائٹس کے روزنامچے' : 'All Sites Daily Logs'}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewLog}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.newDailyLog}</span>
          </button>
        </div>
      </div>

      {relevantLogs.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-400 space-y-3">
          <ClipboardList className="w-10 h-10 mx-auto text-neutral-600" />
          <h3 className="text-base font-bold text-white">
            {language === 'ur' ? 'کوئی سائٹ روزنامچہ درج نہیں' : 'No Site Logs Recorded Yet'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {language === 'ur' ? 'روزانہ کی مزدور حاضری، موسم، موصول شدہ سامان اور کام کی پیش رفت ریکارڈ کرنے کے لیے بٹن دبائیں۔' : 'Log daily attendance, weather impact on concrete curing, and material deliveries.'}
          </p>
          <button
            onClick={onOpenNewLog}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 rounded-lg hover:bg-amber-400"
          >
            {t.newDailyLog}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Log Date Selector List */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
              {language === 'ur' ? 'تاریخ وار فہرست' : 'Select Date & Site'}
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {relevantLogs.map(log => {
                const logProj = projects.find(p => p.id === log.projectId);
                const totalWorkers = log.workersCount.reduce((a, b) => a + b.count, 0);
                const isSelected = (currentLog?.id === log.id);

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                      isSelected 
                        ? 'bg-neutral-800 border-amber-500/80 shadow' 
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{log.date}</span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {logProj?.code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-400 mt-2 text-[11px]">
                      <span>Supervisor: {log.supervisor}</span>
                      <span className="font-mono text-amber-400">{totalWorkers} workers</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Log Card */}
          {currentLog && (
            <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              {/* Log Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="font-mono text-amber-400 font-bold">{project?.code}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-white font-semibold">{project?.name}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {language === 'ur' ? `سائٹ روزنامچہ: ${currentLog.date}` : `Site Shift Log: ${currentLog.date}`}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Weather display */}
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs">
                    {getWeatherIcon(currentLog.weather)}
                    <div>
                      <div className="font-medium text-neutral-200">{getWeatherLabel(currentLog.weather)}</div>
                      {currentLog.temperatureC && (
                        <div className="text-[10px] text-neutral-500 font-mono">{currentLog.temperatureC}°C ambient</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDailyLog(currentLog.id)}
                    className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Workforce On Site Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>{language === 'ur' ? 'حاضر عملہ اور مزدور (Workforce on Site)' : 'Workforce & Trades on Site'}</span>
                  </span>
                  <span className="font-mono text-amber-400">
                    {currentLog.workersCount.reduce((a, b) => a + b.count, 0)} {language === 'ur' ? 'کل حاضر' : 'Total Persons'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentLog.workersCount.map((w, idx) => (
                    <div key={idx} className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-xs flex justify-between items-center">
                      <span className="text-neutral-400 truncate pr-2">{w.trade}</span>
                      <span className="font-bold font-mono text-white text-sm tabular-nums">{w.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Completed Summary */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-neutral-300">
                  {language === 'ur' ? 'آج انجام پانے والا کام (Work Summary):' : 'Work Executed Today:'}
                </span>
                <p className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-lg text-neutral-300 leading-relaxed">
                  {currentLog.workSummary}
                </p>
              </div>

              {/* Delays & Obstacles */}
              {currentLog.delaysOrObstacles && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>{language === 'ur' ? 'رکاوٹ یا تاخیر کی وجوہات (Issues/Delays):' : 'Site Delays & Obstacles:'}</span>
                  </span>
                  <p className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg text-rose-200 leading-relaxed">
                    {currentLog.delaysOrObstacles}
                  </p>
                </div>
              )}

              {/* Materials Delivered Today */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-400" />
                  <span>{language === 'ur' ? 'آج موصول ہونے والا سامان (Materials Received):' : 'Materials Received on Site:'}</span>
                </span>

                {currentLog.materialsReceived.length === 0 ? (
                  <p className="text-neutral-500 italic">{language === 'ur' ? 'آج کوئی ترسیل نہیں ہوئی' : 'No material deliveries today'}</p>
                ) : (
                  <div className="divide-y divide-neutral-800/80 bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
                    {currentLog.materialsReceived.map((m, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-white">{m.material}</span>
                          <span className="text-neutral-500 text-[11px] ml-2">from {m.supplier}</span>
                        </div>
                        <span className="font-mono text-amber-400 font-semibold">{m.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Safety Record */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${currentLog.safetyIncidentsCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <span className="text-neutral-300 font-medium">
                    {language === 'ur' ? 'سائٹ سیفٹی ریکارڈ:' : 'Safety Incidents:'}
                  </span>
                  <span className={`font-bold font-mono ${currentLog.safetyIncidentsCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentLog.safetyIncidentsCount === 0 ? (language === 'ur' ? '0 حادثات (محفوظ دن)' : '0 Incidents (Zero Harm)') : `${currentLog.safetyIncidentsCount} reported`}
                  </span>
                </div>

                <span className="text-neutral-500 text-[11px]">
                  Logged by: <strong className="text-neutral-300">{currentLog.supervisor}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
