import React from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Kanban, 
  ClipboardList, 
  Trash2, 
  X, 
  AlertTriangle,
  HardHat,
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const OfflineSyncModal: React.FC = () => {
  const { 
    isOnline, 
    isRawOnline,
    isSimulatedOffline, 
    toggleSimulatedOffline,
    pendingSyncQueue, 
    pendingSyncCount,
    isSyncing, 
    lastSyncTime, 
    syncPendingChanges, 
    clearSyncedQueue,
    dismissPendingSyncItem,
    isSyncModalOpen, 
    setIsSyncModalOpen,
    language 
  } = useProject();

  if (!isSyncModalOpen) return null;

  const handleManualSync = async () => {
    await syncPendingChanges();
  };

  const syncedCount = pendingSyncQueue.filter(i => i.status === 'synced').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-blue-800/40 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
              isOnline ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {language === 'ur' ? 'آف لائن کیشے و کلاؤڈ سنکرونائزیشن' : 'Offline Access & Cloud Sync Center'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  isOnline 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                }`}>
                  {isOnline ? 'Online' : 'Offline Field Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ur' 
                  ? 'سائٹ پر انٹرنیٹ نہ ہونے کی صورت میں ٹاسک اور لاگز خودکار طور پر کیشے ہوتے ہیں' 
                  : 'Local cache keeps app accessible offline; pending tasks & site logs auto-sync on reconnect'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsSyncModalOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Sync KPI Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Connection</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-bold text-white text-xs">{isOnline ? 'Connected' : 'Offline'}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
              {isSimulatedOffline ? 'Simulated Field Mode' : (isRawOnline ? 'Live Network' : 'No Internet')}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Pending Sync</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-lg font-bold font-mono ${pendingSyncCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {pendingSyncCount}
              </span>
              <span className="text-[10px] text-slate-400">changes</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Stored in LocalStorage</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Synced Items</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold font-mono text-emerald-400">{syncedCount}</span>
              <span className="text-[10px] text-slate-400">actions</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Reconciled with state</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Last Synchronized</span>
            <span className="font-bold text-blue-300 text-xs block mt-1 truncate">
              {lastSyncTime || 'Pending First Sync'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Auto on reconnect</span>
          </div>
        </div>

        {/* Sync Controls Toolbar */}
        <div className="p-3 bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-900 rounded-xl border border-blue-900/40 flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing || (!isOnline && pendingSyncCount === 0)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                isSyncing 
                  ? 'bg-blue-700 text-slate-200' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (language === 'ur' ? 'ہم آہنگ ہو رہا ہے...' : 'Syncing...') : (language === 'ur' ? 'ابھی ہم آہنگ کریں (Sync Now)' : 'Sync Now')}</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={toggleSimulatedOffline}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isSimulatedOffline 
                  ? 'bg-amber-950/70 text-amber-300 border-amber-600/60 hover:bg-amber-900/60' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle simulated disconnected state to test offline task creation and auto-sync"
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isSimulatedOffline ? (language === 'ur' ? 'آن لائن موڈ پر واپس جائیں' : 'Disable Offline Simulation') : (language === 'ur' ? 'آف لائن موڈ کا تجربہ کریں' : 'Simulate Offline Mode')}</span>
            </button>
          </div>

          {syncedCount > 0 && (
            <button
              onClick={clearSyncedQueue}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-[11px] transition cursor-pointer"
              title="Clear synced history items"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Offline Technical Explanation */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5 mb-4">
          <Database className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-200">How Offline Architecture Works: </span>
            The application registers a Progressive Web App (PWA) Service Worker caching all static assets and the core application shell. In addition, all Construction Tasks, Daily Site Logs, and financial ledgers are continuously mirrored in localStorage. When working on a remote site with no internet, updates are applied optimistically to the interface and queued in the offline journal. As soon as connectivity returns, changes are reconciled back into the persistent project state.
          </div>
        </div>

        {/* Pending & Synchronized Actions Journal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Offline Changes Queue ({pendingSyncQueue.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Auto-persisted to LocalStorage
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {pendingSyncQueue.length > 0 ? (
              pendingSyncQueue.map((item) => (
                <div 
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    item.status === 'pending'
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      item.entityType === 'task' 
                        ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' 
                        : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
                    }`}>
                      {item.entityType === 'task' ? <Kanban className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700">
                          {item.actionType.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-white truncate text-xs">
                          {language === 'ur' && item.summaryUrdu ? item.summaryUrdu : item.summary}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'pending' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-900/40 text-amber-300 border border-amber-700/60">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/40 text-emerald-300 border border-emerald-700/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Synced</span>
                      </span>
                    )}

                    <button
                      onClick={() => dismissPendingSyncItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                      title="Remove entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                <ShieldCheck className="w-6 h-6 text-emerald-500/60 mx-auto mb-1.5" />
                <span>All local changes are fully synchronized with the state.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
          <span className="text-[10px] font-mono text-slate-500">
            ShizCon Offline Field Engine · v2.4 PWA
          </span>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
