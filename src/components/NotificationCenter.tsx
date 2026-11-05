import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { NotificationType, NotificationSeverity, NotificationItem } from '../types';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Calendar, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ExternalLink, 
  Trash2, 
  ShieldAlert,
  Clock,
  Sparkles,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationRead, 
    markAllNotificationsRead, 
    dismissNotification, 
    clearAllNotifications,
    setActiveTab,
    setActiveProjectId,
    projects,
    language
  } = useProject();

  const [activeFilter, setActiveFilter] = useState<'all' | 'deadline' | 'snag'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationRead(item.id);
    if (item.targetProjectId) {
      setActiveProjectId(item.targetProjectId);
    }
    if (item.targetTab) {
      setActiveTab(item.targetTab);
    }
    onClose();
  };

  const getSeverityBadge = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            {language === 'ur' ? 'فوری توجہ' : 'Urgent Action'}
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5" />
            {language === 'ur' ? 'توجہ طلب' : 'Attention'}
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Info className="w-2.5 h-2.5" />
            {language === 'ur' ? 'اطلاع' : 'Information'}
          </span>
        );
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'snag':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Building2 className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-[#070b14] border-l border-blue-900/40 shadow-2xl flex flex-col text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-blue-950/70 border border-blue-700/50 text-blue-400 shadow-md">
              <Bell className="w-5 h-5 text-blue-400" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {language === 'ur' ? 'نوٹیفیکیشن و الرٹ سینٹر' : 'Notification Center'}
                </h3>
                {unreadNotificationsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-600/30 text-blue-300 rounded border border-blue-500/30">
                    {unreadNotificationsCount} {language === 'ur' ? 'نئے' : 'new'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ur' 
                  ? 'منصوبوں کی ڈیڈلائنز اور زیر التواء نقائص کی فوری اطلاعات' 
                  : 'Project deadlines & pending snag resolutions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'all' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {language === 'ur' ? 'تمام' : 'All'} ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('deadline')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'deadline' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {language === 'ur' ? 'ڈیڈلائنز' : 'Deadlines'} ({notifications.filter(n => n.type === 'deadline').length})
            </button>
            <button
              onClick={() => setActiveFilter('snag')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'snag' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {language === 'ur' ? 'نقائص' : 'Snags'} ({notifications.filter(n => n.type === 'snag').length})
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-950/50 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'ur' ? 'سب پڑھ لیں' : 'Read all'}</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear all alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300">
                  {language === 'ur' ? 'کوئی نیا الرٹ نہیں ہے' : 'All Clear — No Pending Alerts'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  {language === 'ur' 
                    ? 'تمام منصوبے شیڈول پر ہیں اور کوئی ہنگامی نقص زیر التواء نہیں ہے۔'
                    : 'All job-site tasks, project handover dates, and punch lists are operating normally.'}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const project = projects.find(p => p.id === item.targetProjectId);
              return (
                <div
                  key={item.id}
                  className={`relative p-3.5 rounded-xl border transition-all ${
                    item.isRead
                      ? 'bg-slate-900/50 border-slate-800/80 opacity-80 hover:opacity-100 hover:border-slate-700'
                      : item.severity === 'urgent'
                        ? 'bg-rose-950/25 border-rose-600/40 shadow-sm shadow-rose-950/30'
                        : item.severity === 'warning'
                          ? 'bg-amber-950/20 border-amber-600/40'
                          : 'bg-blue-950/20 border-blue-600/30'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!item.isRead && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/80" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      {/* Badge row */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {getSeverityBadge(item.severity)}
                        {project && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {project.code}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {language === 'ur' && item.titleUrdu ? item.titleUrdu : item.title}
                      </h4>

                      {/* Message Body */}
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'ur' && item.messageUrdu ? item.messageUrdu : item.message}
                      </p>

                      {/* Action Row */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/60 text-xs">
                        <button
                          onClick={() => handleNotificationClick(item)}
                          className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-[11px]"
                        >
                          <span>{language === 'ur' ? 'سائٹ پر جائیں' : 'Resolve on Site'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-2">
                          {!item.isRead && (
                            <button
                              onClick={() => markNotificationRead(item.id)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            >
                              {language === 'ur' ? 'پڑھا گیا' : 'Mark read'}
                            </button>
                          )}
                          <button
                            onClick={() => dismissNotification(item.id)}
                            className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Dismiss"
                          >
                            {language === 'ur' ? 'خارج' : 'Dismiss'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with Al Asad Constructors info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/95 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">
              {language === 'ur' ? 'الاسد کنسٹرکٹرز مانیٹرنگ' : 'Al Asad Live Site Alerts'}
            </span>
          </span>
          <span className="font-mono text-slate-400">
            {notifications.length} {language === 'ur' ? 'کل اطلاعات' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
};
