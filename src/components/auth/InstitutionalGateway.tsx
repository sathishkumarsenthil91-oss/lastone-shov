import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { UserRole, DepartmentCode } from '../../types';
import { RoleLiveVerifiedBadge, InstagramTickIcon } from '../common/RoleLiveVerifiedBadge';
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
  CheckCircle2, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  Zap,
  AlertTriangle
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

  // Supabase Auth Error, Success and Loading states
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const roleCards: Array<{
    role: UserRole;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    colorName: string;
    hex: string;
    borderActive: string;
    badgeBg: string;
    defaultId: string;
    defaultPass: string;
    idLabel: string;
    idPlaceholder: string;
  }> = [
    {
      role: 'STUDENT',
      title: 'Student Portal',
      subtitle: 'Digital ID Card, Academic Record, Dues & Grievances',
      icon: <GraduationCap className="w-5 h-5" />,
      colorName: 'Pink',
      hex: '#ec4899',
      borderActive: 'border-pink-500 ring-2 ring-pink-500/20 bg-pink-50/40 dark:bg-pink-950/20',
      badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
      defaultId: '23CS001',
      defaultPass: 'student@2026',
      idLabel: 'Student Register Number / College Email',
      idPlaceholder: 'e.g. 23CS001 or student@avsct.edu.in'
    },
    {
      role: 'STAFF',
      title: 'Staff & Security',
      subtitle: 'Gate Scanner, Biometrics Turnstiles, HOD Messaging',
      icon: <ShieldCheck className="w-5 h-5" />,
      colorName: 'Blue',
      hex: '#0095f6',
      borderActive: 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      defaultId: 'staff.security@avsct.edu.in',
      defaultPass: 'staff@2026',
      idLabel: 'Staff ID / Proctorial Email',
      idPlaceholder: 'e.g. staff.security@avsct.edu.in'
    },
    {
      role: 'HOD',
      title: 'Head of Dept',
      subtitle: 'Student Roster, Circulars, Staff Incidents',
      icon: <Building2 className="w-5 h-5" />,
      colorName: 'Red',
      hex: '#ef4444',
      borderActive: 'border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/20',
      badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      defaultId: 'hod.cse@avsct.edu.in',
      defaultPass: 'hod@2026',
      idLabel: 'HOD Official Email',
      idPlaceholder: 'e.g. hod.cse@avsct.edu.in'
    },
    {
      role: 'VICE_PRINCIPAL',
      title: 'Vice Principal',
      subtitle: 'Academic Governance, Fine Waivers, Directives',
      icon: <Crown className="w-5 h-5" />,
      colorName: 'Golden',
      hex: '#f59e0b',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      defaultId: 'vp.academic@avsct.edu.in',
      defaultPass: 'vp@2026',
      idLabel: 'VP Governance Email',
      idPlaceholder: 'e.g. vp.academic@avsct.edu.in'
    },
    {
      role: 'PRINCIPAL',
      title: 'Principal Desk',
      subtitle: 'Executive Institutional Command & NAAC AICTE',
      icon: <Landmark className="w-5 h-5" />,
      colorName: 'Green',
      hex: '#10b981',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      defaultId: 'principal.office@avsct.edu.in',
      defaultPass: 'principal@2026',
      idLabel: 'Office of Principal Executive Email',
      idPlaceholder: 'e.g. principal.office@avsct.edu.in'
    }
  ];

  const selectedRoleConfig = roleCards.find(r => r.role === selectedRole) || roleCards[0];

  const handleRoleSelect = (roleItem: typeof roleCards[0]) => {
    setSelectedRole(roleItem.role);
    setIdentifier(roleItem.defaultId);
    setPassword(roleItem.defaultPass);
    setAuthError(null);
    setAuthSuccessMessage(null);
  };

  // Sign In using Supabase Auth: supabase.auth.signInWithPassword({ email, password })
  // Only redirect when a real session exists after login.
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    setLoading(true);

    const emailToUse = identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@avsct.edu.in`;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }

      // If no session exists, email is unconfirmed
      if (!data.session) {
        setAuthError("Check your email and confirm your account before logging in.");
        setLoading(false);
        return;
      }

      // Real session exists -> redirect to Dashboard
      switchRole(selectedRole, selectedRole === 'HOD' ? selectedDept : undefined);
      addNotification('Access Granted', `Signed in as ${selectedRoleConfig.title}`, 'success');
      setLoading(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Sign in error.');
      setLoading(false);
    }
  };

  // Sign Up using Supabase Auth: supabase.auth.signUp({ email, password })
  // 1. Do NOT auto-login.
  // 2. Redirect to the Sign In page.
  // 3. Pre-fill the email used for signup in the Sign In form.
  // 4. Show success message on the Sign In page.
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    if (!regName || !regEmail) {
      setAuthError('Please fill in your name and college email.');
      addNotification('Required Information', 'Please fill in your name and college email.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword || 'Member@2026',
        options: {
          data: {
            name: regName,
            role: selectedRole,
            departmentCode: regDept,
            studentId: selectedRole === 'STUDENT' ? (regId || '24CS' + Math.floor(100 + Math.random() * 900)) : undefined,
            staffId: selectedRole === 'STAFF' ? (regId || 'STF-2026-' + Math.floor(10 + Math.random() * 90)) : undefined,
            phone: regPhone,
            designation: regDesignation
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }

      // Record profile data
      await registerMember({
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

      // Pass email to Sign In view, clear password, and switch to Sign In mode
      setIdentifier(regEmail);
      setPassword('');
      setAuthMode('signin');
      setAuthError(null);
      setAuthSuccessMessage("Your account has been created. Please check your email and verify your address before logging in.");
      addNotification('Account Created', 'Please check your email and verify your address before logging in.', 'info');
      setLoading(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Registration error.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-purple-900/40 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AVS COLLEGE OF TECHNOLOGY • UNIFIED MEMBER GATEWAY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Role-Based Institutional Portal & Digital ID System
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Select your verified institutional role to access dedicated dashboards with instant live credential authorization.
          </p>
        </div>
      </div>

      {/* Role Selection Grid (5 Distinct Roles with Exact Specified Colors) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            1. Select Your Institutional Role
          </h2>
          <span className="text-xs text-slate-500">Each role features dedicated verification & tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {roleCards.map((r) => {
            const isSelected = selectedRole === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={`p-4 rounded-3xl text-left transition-all border cursor-pointer relative flex flex-col justify-between group ${
                  isSelected
                    ? `${r.borderActive} shadow-lg shadow-black/5`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                      {r.icon}
                    </div>
                    {/* Official Instagram Scalloped Verified Tick in assigned color */}
                    <InstagramTickIcon
                      fillColor={r.hex}
                      sizeClass="w-5 h-5"
                    />
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {r.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {r.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${r.badgeBg}`}>
                    {r.colorName} Tick
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Authentication Box */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        
        {/* Toggle Mode: Sign In vs Register */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <InstagramTickIcon
              fillColor={selectedRoleConfig.hex}
              sizeClass="w-7 h-7"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedRoleConfig.title} Gateway
                </h3>
                <RoleLiveVerifiedBadge role={selectedRole} size="xs" showLabel={true} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official institutional sign-in with {selectedRoleConfig.colorName} Verified Pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-900 rounded-2xl">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setAuthError(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Registration</span>
            </button>
          </div>
        </div>

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="p-6 sm:p-8 space-y-5">
            
            {/* Success / Email Confirmation Notice Above Form */}
            {authSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-emerald-800 dark:text-emerald-200">Account Created Successfully</p>
                  <p className="text-emerald-700/90 dark:text-emerald-300/90">{authSuccessMessage}</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Quick Test Demo Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Quick Access Demo: Use official pre-configured credentials for testing.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIdentifier(selectedRoleConfig.defaultId);
                  setPassword(selectedRoleConfig.defaultPass);
                  setAuthError(null);
                  addNotification('Loaded', `Filled test credentials for ${selectedRoleConfig.title}`, 'info');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition shrink-0"
              >
                <span>Fill Test Credentials</span>
              </button>
            </div>

            {/* Department Selection for HOD */}
            {selectedRole === 'HOD' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  Assigned Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as DepartmentCode)}
                  className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                  <option value="CIVIL">Civil Engineering (CIVIL)</option>
                  <option value="BME">Biomedical Engineering (BME)</option>
                  <option value="CHEM">Chemical Engineering (CHEM)</option>
                  <option value="MBA">Master of Business Administration (MBA)</option>
                  <option value="MCA">Master of Computer Applications (MCA)</option>
                </select>
              </div>
            )}

            {/* Username / ID / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                {selectedRoleConfig.idLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRoleConfig.idPlaceholder}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Institutional Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sign In Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Authorize & Open ${selectedRoleConfig.title}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <InstagramTickIcon
                  fillColor={selectedRoleConfig.hex}
                  sizeClass="w-7 h-7"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                      Registering as {selectedRoleConfig.title}
                    </p>
                    <RoleLiveVerifiedBadge role={selectedRole} size="xs" showLabel={false} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Generate an official Digital ID card with {selectedRoleConfig.colorName} Verified Pass Credentials.
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono border ${selectedRoleConfig.badgeBg} bg-white dark:bg-slate-800 shrink-0`}>
                {selectedRoleConfig.colorName} Pass
              </span>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Priya Sharma or Dr. M. Sundaram"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@avsct.edu.in"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Dept & Identifier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  Department
                </label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value as DepartmentCode)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="AIDS">AIDS</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="BME">BME</option>
                  <option value="CHEM">CHEM</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                  {selectedRole === 'STUDENT' ? 'Register Number' : 'Staff / ID Code'}
                </label>
                <input
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder={selectedRole === 'STUDENT' ? 'e.g. 24CS501' : 'e.g. STF-2026-99'}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Create Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Error Message Box */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success / Email Confirmation Notice */}
            {authSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Account Created Successfully</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 pl-6">
                  {authSuccessMessage}
                </p>
              </div>
            )}

            {/* Register Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Registering...' : 'Register & Generate Digital Credentials'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
