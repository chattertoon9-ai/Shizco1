import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { AuthUser, UserPermissions, UserRole } from '../types';
import { translations } from '../utils/translations';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  HardHat, 
  Sparkles, 
  Shield, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  Copy
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus, 
    projects, 
    language,
    isAdmin,
    hasPermission 
  } = useProject();

  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [designation, setDesignation] = useState('Site Operations Engineer');
  const [assignedProjectId, setAssignedProjectId] = useState<string>('all');
  const [permissions, setPermissions] = useState<UserPermissions>({
    canCreateProjects: false,
    canDeleteProjects: false,
    canEditBudgets: false,
    canManageTasks: true,
    canAddDailyLogs: true,
    canManageMaterials: true,
    canResolveSnags: true,
    canManageUsers: false,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Password visibility toggle
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopyPassword = (userId: string, pass?: string) => {
    if (!pass) return;
    navigator.clipboard.writeText(pass);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open modal for creating new user
  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setName('');
    setNameUrdu('');
    setEmail('');
    setPassword(generateRandomPassword());
    setRole('user');
    setDesignation('Site Operations Engineer');
    setAssignedProjectId('all');
    setPermissions({
      canCreateProjects: false,
      canDeleteProjects: false,
      canEditBudgets: false,
      canManageTasks: true,
      canAddDailyLogs: true,
      canManageMaterials: true,
      canResolveSnags: true,
      canManageUsers: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing existing user
  const handleOpenEditModal = (user: AuthUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setNameUrdu(user.nameUrdu || '');
    setEmail(user.email);
    setPassword(user.password || '');
    setRole(user.role);
    setDesignation(user.designation);
    setAssignedProjectId(user.assignedProjectId || 'all');
    setPermissions(user.permissions || {
      canCreateProjects: user.role === 'admin',
      canDeleteProjects: user.role === 'admin',
      canEditBudgets: user.role === 'admin',
      canManageTasks: true,
      canAddDailyLogs: true,
      canManageMaterials: true,
      canResolveSnags: true,
      canManageUsers: user.role === 'admin',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Generate a friendly 8-char secure password for civil site sub-users
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'Asad@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  // Apply Quick Preset Roles
  const applyPreset = (presetType: 'site_eng' | 'inventory' | 'qa' | 'admin') => {
    switch (presetType) {
      case 'site_eng':
        setRole('user');
        setDesignation('Site Operations Engineer');
        setPermissions({
          canCreateProjects: false,
          canDeleteProjects: false,
          canEditBudgets: false,
          canManageTasks: true,
          canAddDailyLogs: true,
          canManageMaterials: false,
          canResolveSnags: true,
          canManageUsers: false,
        });
        break;
      case 'inventory':
        setRole('user');
        setDesignation('Materials & Procurement Officer');
        setPermissions({
          canCreateProjects: false,
          canDeleteProjects: false,
          canEditBudgets: true,
          canManageTasks: true,
          canAddDailyLogs: true,
          canManageMaterials: true,
          canResolveSnags: false,
          canManageUsers: false,
        });
        break;
      case 'qa':
        setRole('user');
        setDesignation('QA / QC & Safety Inspector');
        setPermissions({
          canCreateProjects: false,
          canDeleteProjects: false,
          canEditBudgets: false,
          canManageTasks: true,
          canAddDailyLogs: true,
          canManageMaterials: false,
          canResolveSnags: true,
          canManageUsers: false,
        });
        break;
      case 'admin':
        setRole('admin');
        setDesignation('Project Director (Full Control)');
        setPermissions({
          canCreateProjects: true,
          canDeleteProjects: true,
          canEditBudgets: true,
          canManageTasks: true,
          canAddDailyLogs: true,
          canManageMaterials: true,
          canResolveSnags: true,
          canManageUsers: true,
        });
        break;
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError(language === 'ur' ? 'برائے مہربانی مکمل نام درج کریں۔' : 'Full name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError(language === 'ur' ? 'برائے مہربانی درست ای میل ایڈریس درج کریں۔' : 'Valid email is required.');
      return;
    }

    if (!password.trim()) {
      setFormError(language === 'ur' ? 'برائے مہربانی پاس ورڈ درج کریں۔' : 'Password is required.');
      return;
    }

    // Check duplicate email when creating
    if (!editingUserId) {
      const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        setFormError(language === 'ur' ? 'یہ ای میل پہلے سے موجود ہے۔' : 'A user with this email already exists.');
        return;
      }
    }

    if (editingUserId) {
      updateUser(editingUserId, {
        name: name.trim(),
        nameUrdu: nameUrdu.trim() || undefined,
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        designation: designation.trim(),
        assignedProjectId,
        permissions,
      });
    } else {
      createUser({
        name: name.trim(),
        nameUrdu: nameUrdu.trim() || undefined,
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        designation: designation.trim(),
        assignedProjectId,
        permissions,
        isActive: true,
        avatarColor: role === 'admin' ? 'bg-gradient-to-tr from-blue-700 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
      });
    }

    setIsModalOpen(false);
  };

  // Filtered users list
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nameUrdu && user.nameUrdu.includes(searchQuery));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (!isAdmin) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/40">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {language === 'ur' ? 'صرف ایڈمنسٹریٹر کے لیے مخصوص ہے' : 'Administrator Access Required'}
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {language === 'ur' 
            ? 'یوزرز اور رسائی کی ترتیبات دیکھنے یا ان میں ترمیم کرنے کے تمام اختیارات صرف ایڈمن کے لیے مخصوص ہیں۔'
            : 'User accounts and access rights management are strictly restricted to administrators.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40 border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {language === 'ur' ? 'یوزر و اختیارات کا انتظام (Admin Control)' : 'User Accounts & Access Rights'}
                </h1>
                <span className="px-2 py-0.5 text-xs font-bold font-mono tracking-wider bg-blue-600 text-white rounded">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {language === 'ur' 
                  ? 'ایڈمن پینل: نئے سب یوزرز بنائیں، پاس ورڈ مقرر کریں اور سائٹ کے مخصوص اختیارات (Rights) تفویض کریں۔'
                  : 'Create sub-user accounts, configure individual passwords, and assign granular permissions for site engineers and managers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ur' ? '+ نیا سب یوزر بنائیں' : '+ Create Sub-User'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{language === 'ur' ? 'کل یوزر اکاؤنٹس' : 'Total Accounts'}</span>
            <span className="text-lg font-bold text-white font-mono">{users.length}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{language === 'ur' ? 'فعال یوزرز' : 'Active Users'}</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {users.filter(u => u.isActive).length}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{language === 'ur' ? 'ایڈمنسٹریٹرز' : 'Administrators'}</span>
            <span className="text-lg font-bold text-blue-400 font-mono">
              {users.filter(u => u.role === 'admin').length}
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{language === 'ur' ? 'سائٹ انجینئرز / یوزرز' : 'Site Engineers / Users'}</span>
            <span className="text-lg font-bold text-indigo-400 font-mono">
              {users.filter(u => u.role === 'user').length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={language === 'ur' ? 'نام، ای میل یا عہدہ تلاش کریں...' : 'Search by name, email, or designation...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-slate-500 hidden sm:inline">{language === 'ur' ? 'فلٹر رول:' : 'Role Filter:'}</span>
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                roleFilter === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ur' ? 'تمام' : 'All'}
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                roleFilter === 'admin' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                roleFilter === 'user' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              User
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isCurrentUser = currentUser?.id === user.id;
          const isVisible = visiblePasswords[user.id] || false;
          const assignedProj = projects.find(p => p.id === user.assignedProjectId);

          return (
            <div
              key={user.id}
              className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                !user.isActive 
                  ? 'border-slate-800 opacity-60 bg-slate-950/50' 
                  : user.role === 'admin' 
                    ? 'border-blue-700/50 hover:border-blue-500/80 shadow-md shadow-blue-950/20' 
                    : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* User Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${user.role === 'admin' ? 'bg-gradient-to-tr from-blue-700 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-500'} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
                      {user.role === 'admin' ? 'A' : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {language === 'ur' && user.nameUrdu ? user.nameUrdu : user.name}
                        </h3>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                            {language === 'ur' ? 'آپ' : 'YOU'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user.designation}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    user.role === 'admin' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>

                {/* Account Credentials Box */}
                <div className="mt-4 p-3 bg-slate-950/90 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  {/* Email / Username */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'ur' ? 'ای میل' : 'Email'}:</span>
                    </span>
                    <span className="font-mono text-slate-200 select-all font-medium">
                      {user.email}
                    </span>
                  </div>

                  {/* Password with View / Copy */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'ur' ? 'پاس ورڈ' : 'Password'}:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-blue-300 font-bold bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/40">
                        {isVisible ? (user.password || '••••••••') : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isVisible ? 'Hide password' : 'Show password'}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyPassword(user.id, user.password)}
                        className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy password to share with user"
                      >
                        {copiedId === user.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Project Scope */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'ur' ? 'پروجیکٹ' : 'Project'}:</span>
                    </span>
                    <span className="text-emerald-400 font-medium truncate max-w-[150px]">
                      {assignedProj ? assignedProj.name : (language === 'ur' ? 'تمام منصوبے (All)' : 'All Projects')}
                    </span>
                  </div>
                </div>

                {/* Granular Permissions Chips */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {language === 'ur' ? 'تفویض شدہ اختیارات (Granted Rights):' : 'Granted Permissions:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.permissions?.canCreateProjects && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-950/50 text-blue-300 border border-blue-800/50 rounded">
                        + Projects
                      </span>
                    )}
                    {user.permissions?.canDeleteProjects && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-rose-950/40 text-rose-300 border border-rose-800/50 rounded">
                        Del Projects
                      </span>
                    )}
                    {user.permissions?.canEditBudgets && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 rounded">
                        Budgets
                      </span>
                    )}
                    {user.permissions?.canManageTasks && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 rounded">
                        Tasks
                      </span>
                    )}
                    {user.permissions?.canAddDailyLogs && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 border border-slate-700 rounded">
                        Daily Logs
                      </span>
                    )}
                    {user.permissions?.canManageMaterials && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-amber-950/40 text-amber-300 border border-amber-800/50 rounded">
                        Materials
                      </span>
                    )}
                    {user.permissions?.canResolveSnags && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-teal-950/40 text-teal-300 border border-teal-800/50 rounded">
                        Snags / Punch List
                      </span>
                    )}
                    {user.permissions?.canManageUsers && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/50 rounded font-bold">
                        User Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {/* Active / Inactive switch */}
                <button
                  type="button"
                  onClick={() => toggleUserStatus(user.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    user.isActive 
                      ? 'text-emerald-400 hover:bg-emerald-950/30' 
                      : 'text-rose-400 hover:bg-rose-950/30'
                  }`}
                  title={user.isActive ? 'Deactivate account' : 'Activate account'}
                >
                  {user.isActive ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'فعال' : 'Active'}</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'غیر فعال' : 'Inactive'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(user)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit user rights and password"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {user.id !== 'user-admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(language === 'ur' ? `کیا آپ واقعی ${user.name} کو حذف کرنا چاہتے ہیں؟` : `Delete sub-user account ${user.name}?`)) {
                          deleteUser(user.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete sub-user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-950 border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-700/50 text-blue-400 shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {editingUserId 
                      ? (language === 'ur' ? 'سب یوزر کے اختیارات میں ترمیم' : 'Edit Sub-User & Access Rights')
                      : (language === 'ur' ? 'نیا سب یوزر بنائیں اور اختیارات تفویض کریں' : 'Create Sub-User & Grant Rights')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ur' ? 'اکاؤنٹ، پاس ورڈ اور کام کرنے کے اختیارات' : 'Credentials, job designation, and role permissions'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="px-6 pt-4 pb-2 bg-slate-950/60 border-b border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                {language === 'ur' ? 'تیز رفتار پروفائل ٹیمپلیٹ (Quick Presets):' : 'Apply Role Template (Auto-configures Rights):'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('site_eng')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-blue-400">Site Engineer</div>
                  <div className="text-[10px] text-slate-500">Tasks & Logs</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('inventory')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-amber-400">Materials Clerk</div>
                  <div className="text-[10px] text-slate-500">Ledger & Invoices</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('qa')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-teal-400">QA / QC Inspector</div>
                  <div className="text-[10px] text-slate-500">Snags & Quality</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('admin')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-indigo-400">Administrator</div>
                  <div className="text-[10px] text-slate-500">Full Rights</div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Name & Urdu Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {language === 'ur' ? 'مکمل نام (English)' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sub-Engr. Bilal Aslam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {language === 'ur' ? 'نام (اردو میں اختیاری)' : 'Name in Urdu (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: سب انجینئر بلال اسلم"
                    value={nameUrdu}
                    onChange={(e) => setNameUrdu(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-urdu focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {language === 'ur' ? 'ای میل یا لاگ ان یوزر نیم *' : 'Email Address / Username *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. engineer@alasad.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">
                      {language === 'ur' ? 'پاس ورڈ (Password) *' : 'Account Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateRandomPassword())}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                    >
                      Generate New
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Designation & Project Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {language === 'ur' ? 'عہدہ / ڈیزینیشن' : 'Job Title / Designation'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Site Operations Engineer"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {language === 'ur' ? 'تفویض شدہ پروجیکٹ' : 'Assigned Project Scope'}
                  </label>
                  <select
                    value={assignedProjectId}
                    onChange={(e) => setAssignedProjectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">
                      {language === 'ur' ? 'تمام منصوبے (All Projects)' : 'All Projects (Full Scope)'}
                    </option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Granular Rights Checkbox Grid */}
              <div className="pt-2">
                <label className="block text-slate-300 font-bold mb-2">
                  {language === 'ur' ? 'ذیلی یوزر کے مخصوص اختیارات (Granular User Rights):' : 'Granular Permission Settings:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canCreateProjects}
                      onChange={(e) => setPermissions(p => ({ ...p, canCreateProjects: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">Create Projects</span>
                      <span className="text-[10px] text-slate-500">نئے منصوبے شروع کرنا</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canDeleteProjects}
                      onChange={(e) => setPermissions(p => ({ ...p, canDeleteProjects: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">Delete Projects</span>
                      <span className="text-[10px] text-slate-500">پروجیکٹ ڈیٹا حذف کرنا</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canEditBudgets}
                      onChange={(e) => setPermissions(p => ({ ...p, canEditBudgets: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">Manage Budgets</span>
                      <span className="text-[10px] text-slate-500">مالی بجٹ میں ترمیم</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageTasks}
                      onChange={(e) => setPermissions(p => ({ ...p, canManageTasks: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">Manage Tasks</span>
                      <span className="text-[10px] text-slate-500">کام بنانا اور اپڈیٹ کرنا</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canAddDailyLogs}
                      onChange={(e) => setPermissions(p => ({ ...p, canAddDailyLogs: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">Site Daily Logs</span>
                      <span className="text-[10px] text-slate-500">روزنامچہ و حاضری درج کرنا</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageMaterials}
                      onChange={(e) => setPermissions(p => ({ ...p, canManageMaterials: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">Materials Ledger</span>
                      <span className="text-[10px] text-slate-500">سامان و بلنگ ریکارڈ</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canResolveSnags}
                      onChange={(e) => setPermissions(p => ({ ...p, canResolveSnags: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">Resolve Snags</span>
                      <span className="text-[10px] text-slate-500">نقائص کی جانچ و بندش</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageUsers}
                      onChange={(e) => setPermissions(p => ({ ...p, canManageUsers: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-purple-300 block leading-tight">User Admin Rights</span>
                      <span className="text-[10px] text-slate-500">دیگر یوزرز اور پاس ورڈز بنانا</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  {editingUserId 
                    ? (language === 'ur' ? 'تبدیلیاں محفوظ کریں' : 'Save Changes')
                    : (language === 'ur' ? 'نیا سب یوزر بنائیں' : 'Create Sub-User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
