import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, DepartmentCode } from '../../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  Building2, 
  Crown, 
  Landmark, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  KeyRound, 
  ShieldAlert, 
  UserPlus, 
  LogIn, 
  Layers,
  FileCheck
} from 'lucide-react';

interface InstitutionalGatewayProps {
  onOpenOnboarding?: () => void;
}

export const InstitutionalGateway: React.FC<InstitutionalGatewayProps> = () => {
  const { switchRole, registerMember, addNotification } = useAuth();
  
  // Tab: Sign In vs New Member Registration
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  
  // Selected Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  
  // Sign-in fields
  const [selectedDept, setSelectedDept] = useState<DepartmentCode>('CSE');
  const [identifier, setIdentifier] = useState('23CS001');
  const [password, setPassword] = useState('student@2026');

  // New Member Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regId, setRegId] = useState('');
  const [regDept, setRegDept] = useState<DepartmentCode>('CSE');
  const [regYear, setRegYear] = useState<number>(3);
  const [regDesignation, setRegDesignation] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const roleCards: Array<{
    role: UserRole;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bgHover: string;
    borderActive: string;
    badge: string;
    defaultId: string;
    defaultPass: string;
  }> = [
    {
      role: 'STUDENT',
      title: 'Student Portal',
      subtitle: 'Digital ID Card, Academic Record, Dues & Grievances',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgHover: 'hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
      borderActive: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/30',
      badge: 'Enrolled Students',
      defaultId: '23CS001',
      defaultPass: 'student@2026'
    },
    {
      role: 'STAFF',
      title: 'Staff & Security',
      subtitle: 'Gate Scanner, Biometrics Turnstiles, HOD Messaging',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgHover: 'hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
      borderActive: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/30',
      badge: 'Security / Proctorial',
      defaultId: 'staff.security@avsct.edu.in',
      defaultPass: 'staff@2026'
    },
    {
      role: 'HOD',
      title: 'Head of Dept',
      subtitle: 'Student Roster, Circulars, Staff Incidents',
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-sky-600 dark:text-sky-400',
      bgHover: 'hover:border-sky-500/50 hover:bg-sky-50/50 dark:hover:bg-sky-950/20',
      borderActive: 'border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/30',
      badge: 'Department Heads',
      defaultId: 'hod.cse@avsct.edu.in',
      defaultPass: 'hod@2026'
    },
    {
      role: 'VICE_PRINCIPAL',
      title: 'Vice Principal',
      subtitle: 'Academic Governance, Fine Waivers, Directives',
      icon: <Crown className="w-5 h-5" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgHover: 'hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20',
      borderActive: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/40 dark:bg-purple-950/30',
      badge: 'Governance Wing',
      defaultId: 'vp.academic@avsct.edu.in',
      defaultPass: 'vp@2026'
    },
    {
      role: 'PRINCIPAL',
      title: 'Principal Desk',
      subtitle: 'Executive Institutional Command & NAAC AICTE',
      icon: <Landmark className="w-5 h-5" />,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgHover: 'hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20',
      borderActive: 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30',
      badge: 'Head of Institution',
      defaultId: 'principal.office@avsct.edu.in',
      defaultPass: 'principal@2026'
    }
  ];

  const handleRoleSelect = (roleItem: typeof roleCards[0]) => {
    setSelectedRole(roleItem.role);
    setIdentifier(roleItem.defaultId);
    setPassword(roleItem.defaultPass);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(selectedRole, selectedRole === 'HOD' ? selectedDept : undefined);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      addNotification('Missing Information', 'Please provide your full name and official email.', 'warning');
      return;
    }

    const res = await registerMember({
      role: selectedRole,
      name: regName,
      email: regEmail,
      phone: regPhone || '+91 98765 00000',
      studentId: selectedRole === 'STUDENT' ? (regId || '24CS' + Math.floor(100 + Math.random() * 900)) : undefined,
      registerNumber: selectedRole === 'STUDENT' ? (regId || '24CS' + Math.floor(100 + Math.random() * 900)) : undefined,
      staffId: selectedRole === 'STAFF' ? (regId || 'STF-2026-' + Math.floor(10 + Math.random() * 90)) : undefined,
      departmentCode: regDept,
      year: regYear,
      designation: regDesignation || undefined,
      password: regPassword || 'Member@2026'
    });

    if (res.success) {
      // Clear inputs
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegId('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-in fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-600/20 text-xs font-black uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>AVS COLLEGE OF TECHNOLOGY • ROLE AUTHENTICATION GATEWAY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Institutional Access & Member Onboarding
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sign in to your protected role portal or register a new member account. Once authenticated, your workspace is strictly customized with zero cross-role clutter.
        </p>

        {/* Dual Mode Switcher: Sign In vs New Registration */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner mt-2">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              authMode === 'signin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Existing Account</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              authMode === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Member Registration / Sign Up</span>
          </button>
        </div>
      </div>

      {/* 5 Portal Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {roleCards.map((c) => {
          const isSelected = selectedRole === c.role;
          return (
            <button
              key={c.role}
              type="button"
              onClick={() => handleRoleSelect(c)}
              className={`p-4 rounded-3xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer relative ${
                isSelected
                  ? c.borderActive + ' shadow-lg'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ' + c.bgHover
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 ${c.color}`}>
                    {c.icon}
                  </div>
                  {isSelected && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-500/20" />
                  )}
                </div>
                <div className="mt-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {c.badge}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {c.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {c.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>{isSelected ? (authMode === 'signin' ? 'Sign In Selected' : 'Register Selected') : 'Select Role'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Authentication Form (Sign In OR Register) */}
      <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl">
        
        {/* Card Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            {selectedRole === 'STUDENT' && <GraduationCap className="w-6 h-6" />}
            {selectedRole === 'STAFF' && <ShieldCheck className="w-6 h-6" />}
            {selectedRole === 'HOD' && <Building2 className="w-6 h-6" />}
            {selectedRole === 'VICE_PRINCIPAL' && <Crown className="w-6 h-6" />}
            {selectedRole === 'PRINCIPAL' && <Landmark className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              {authMode === 'signin' ? 'EXISTING MEMBER AUTHENTICATION' : 'NEW MEMBER REGISTRATION'}
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {authMode === 'signin' 
                ? `${selectedRole.replace(/_/g, ' ')} Sign In` 
                : `Register New ${selectedRole.replace(/_/g, ' ')} Account`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {authMode === 'signin'
                ? 'Sign in to launch your role-isolated educational workspace.'
                : 'Fill in member details to issue your credentials and access the portal.'}
            </p>
          </div>
        </div>

        {/* 1. SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4">
            
            {/* Department Select if HOD */}
            {selectedRole === 'HOD' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Department Assignment
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as DepartmentCode)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                </select>
              </div>
            )}

            {/* Identifier Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedRole === 'STUDENT' ? 'Student Register Number / Email' : 'Institutional Email / Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full p-3.5 pl-11 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedRole === 'STUDENT' ? 'Date of Birth (PIN) / Password' : 'Institutional Access Passkey'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3.5 pl-11 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Sign In as {selectedRole.replace(/_/g, ' ')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* 1-Click Demo Notice */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                💡 Credentials pre-loaded for demo. Click <strong>Sign In</strong> to immediately enter the workspace.
              </p>
            </div>

          </form>
        )}

        {/* 2. NEW MEMBER REGISTRATION FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Rohit Kumar, Dr. Priya Nair"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full p-3 pl-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder={selectedRole === 'STUDENT' ? 'student.name@student.avsct.edu.in' : 'faculty.name@avsct.edu.in'}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full p-3 pl-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Role-Specific ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedRole === 'STUDENT' ? 'Register Number' : 'Staff / Faculty ID'}
                </label>
                <input
                  type="text"
                  placeholder={selectedRole === 'STUDENT' ? '24CS088' : 'STF-2026-10'}
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full p-3 pl-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Department Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value as DepartmentCode)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="CSE">CSE - Computer Science</option>
                  <option value="IT">IT - Information Technology</option>
                  <option value="AIDS">AIDS - Artificial Intelligence</option>
                  <option value="ECE">ECE - Electronics & Comm</option>
                  <option value="EEE">EEE - Electrical & Electronics</option>
                  <option value="MECH">MECH - Mechanical Engg</option>
                </select>
              </div>

              {selectedRole === 'STUDENT' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Academic Year
                  </label>
                  <select
                    value={regYear}
                    onChange={(e) => setRegYear(Number(e.target.value))}
                    className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder={selectedRole === 'STAFF' ? 'Gate Proctor / Security' : 'Professor / Dean'}
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Create Account Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="w-full p-3 pl-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <FileCheck className="w-4 h-4" />
              <span>Complete Registration & Launch {selectedRole.replace(/_/g, ' ')} Portal</span>
            </button>

          </form>
        )}

      </div>

    </div>
  );
};
