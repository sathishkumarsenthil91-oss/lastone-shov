import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { RoleLiveVerifiedBadge, InstagramTickIcon, getRoleVerifiedConfig } from '../common/RoleLiveVerifiedBadge';
import { 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  X, 
  Crown,
  Building2,
  Landmark,
  GraduationCap,
  Info,
  UserPlus,
  LogIn,
  User,
  Phone,
  CheckCircle2,
  Zap,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { UserRole, DepartmentCode } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding?: () => void;
  onOpenStaffCreate?: () => void;
  onOpenEmailTemplates?: () => void;
  initialMode?: 'otp' | 'login' | 'signup' | 'council';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { 
    switchRole, 
    registerMember,
    addNotification 
  } = useAuth();
  
  // Dual Auth Mode
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(initialMode === 'signup' ? 'register' : 'signin');

  // 5 Role Login Tabs
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('STUDENT');

  // Sign-in Input states
  const [identifier, setIdentifier] = useState('23CS001');
  const [password, setPassword] = useState('student@2026');
  const [selectedDept, setSelectedDept] = useState<DepartmentCode>('CSE');

  // Register Input states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regId, setRegId] = useState('');
  const [regDept, setRegDept] = useState<DepartmentCode>('CSE');
  const [regYear, setRegYear] = useState<number>(3);
  const [regDesignation, setRegDesignation] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Supabase Auth Error & Loading State
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const roleTabDetails: Array<{
    role: UserRole;
    label: string;
    icon: React.ReactNode;
    colorName: string;
    hex: string;
    activeBorder: string;
    activeBg: string;
    textClass: string;
    defaultId: string;
    defaultPass: string;
    idPlaceholder: string;
    idLabel: string;
  }> = [
    {
      role: 'STUDENT',
      label: 'Student',
      icon: <GraduationCap className="w-4 h-4" />,
      colorName: 'Pink',
      hex: '#ec4899',
      activeBorder: 'border-pink-500',
      activeBg: 'bg-pink-500 text-white shadow-lg shadow-pink-500/20',
      textClass: 'text-pink-600 dark:text-pink-400',
      defaultId: '23CS001',
      defaultPass: 'student@2026',
      idPlaceholder: 'e.g. 23CS001 / student@avsct.edu.in',
      idLabel: 'Student Register Number / College Email'
    },
    {
      role: 'STAFF',
      label: 'Staff',
      icon: <ShieldCheck className="w-4 h-4" />,
      colorName: 'Blue',
      hex: '#0095f6',
      activeBorder: 'border-sky-500',
      activeBg: 'bg-[#0095f6] text-white shadow-lg shadow-sky-500/20',
      textClass: 'text-sky-600 dark:text-sky-400',
      defaultId: 'staff.security@avsct.edu.in',
      defaultPass: 'staff@2026',
      idPlaceholder: 'e.g. STF-2026-01 / staff@avsct.edu.in',
      idLabel: 'Staff ID / Proctorial Email'
    },
    {
      role: 'HOD',
      label: 'HOD',
      icon: <Building2 className="w-4 h-4" />,
      colorName: 'Red',
      hex: '#ef4444',
      activeBorder: 'border-red-500',
      activeBg: 'bg-red-600 text-white shadow-lg shadow-red-500/20',
      textClass: 'text-red-600 dark:text-red-400',
      defaultId: 'hod.cse@avsct.edu.in',
      defaultPass: 'hod@2026',
      idPlaceholder: 'e.g. hod.cse@avsct.edu.in',
      idLabel: 'Head of Department Official Email'
    },
    {
      role: 'VICE_PRINCIPAL',
      label: 'Vice Principal',
      icon: <Crown className="w-4 h-4" />,
      colorName: 'Golden',
      hex: '#f59e0b',
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black',
      textClass: 'text-amber-600 dark:text-amber-400',
      defaultId: 'vp.academic@avsct.edu.in',
      defaultPass: 'vp@2026',
      idPlaceholder: 'e.g. vp.academic@avsct.edu.in',
      idLabel: 'VP Governance Clearance Email'
    },
    {
      role: 'PRINCIPAL',
      label: 'Principal',
      icon: <Landmark className="w-4 h-4" />,
      colorName: 'Green',
      hex: '#10b981',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      defaultId: 'principal.office@avsct.edu.in',
      defaultPass: 'principal@2026',
      idPlaceholder: 'e.g. principal.office@avsct.edu.in',
      idLabel: 'Office of Principal Executive Email'
    }
  ];

  const currentRoleTab = roleTabDetails.find(r => r.role === selectedRoleTab) || roleTabDetails[0];

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRoleTab(role);
    setAuthError(null);
    setAuthSuccessMessage(null);
    const target = roleTabDetails.find(r => r.role === role);
    if (target) {
      setIdentifier(target.defaultId);
      setPassword(target.defaultPass);
    }
  };

  // Sign In using Supabase Auth: supabase.auth.signInWithPassword({ email, password })
  // Only redirect when a real session exists after login.
  const handleLoginSubmit = async (e: React.FormEvent) => {
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

      // If no session exists, account is not confirmed
      if (!data.session) {
        setAuthError("Check your email and confirm your account before logging in.");
        setLoading(false);
        return;
      }

      // Only redirect when a real session exists after login
      switchRole(selectedRoleTab, selectedRoleTab === 'HOD' ? selectedDept : undefined);
      addNotification('Access Granted', `Authenticated as ${selectedRoleTab.replace(/_/g, ' ')} (${identifier})`, 'success');
      setLoading(false);
      onClose();
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error.');
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
      setAuthError('Please provide your full name and official email.');
      addNotification('Missing Information', 'Please provide your full name and official email.', 'warning');
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
            role: selectedRoleTab,
            departmentCode: regDept,
            studentId: selectedRoleTab === 'STUDENT' ? (regId || '24CS' + Math.floor(100 + Math.random() * 900)) : undefined,
            staffId: selectedRoleTab === 'STAFF' ? (regId || 'STF-2026-' + Math.floor(10 + Math.random() * 90)) : undefined,
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
        role: selectedRoleTab,
        name: regName,
        email: regEmail,
        phone: regPhone || '+91 98765 00000',
        studentId: selectedRoleTab === 'STUDENT' ? (regId || '24CS' + Math.floor(100 + Math.random() * 900)) : undefined,
        registerNumber: selectedRoleTab === 'STUDENT' ? (regId || '24CS' + Math.floor(100 + Math.random() * 900)) : undefined,
        staffId: selectedRoleTab === 'STAFF' ? (regId || 'STF-2026-' + Math.floor(10 + Math.random() * 90)) : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white relative flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3" />
              <span>AVS COLLEGE OF TECHNOLOGY • AUTHENTICATION</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
              <span>Institutional Member Portal</span>
              <InstagramTickIcon fillColor={currentRoleTab.hex} sizeClass="w-5 h-5" />
            </h2>
            <p className="text-xs text-slate-400">
              Official verified multi-role login & member registration.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Mode Tab: Sign In vs Register */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200 dark:bg-slate-900 rounded-2xl w-full max-w-md">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setAuthError(null); }}
              className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Role Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
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

        {/* 5 Distinct Role Tabs with Dedicated Instagram Verified Ticks */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-5 gap-1.5">
            {roleTabDetails.map((tab) => {
              const isSelected = selectedRoleTab === tab.role;
              return (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => handleRoleTabChange(tab.role)}
                  className={`p-2 rounded-2xl text-center transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                    isSelected
                      ? `${tab.activeBg} border-transparent`
                      : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {tab.icon}
                    <InstagramTickIcon
                      fillColor={tab.hex}
                      sizeClass="w-3.5 h-3.5"
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-tight whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            
            {/* Success / Email Verification Banner Above Form */}
            {authSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-800 dark:text-emerald-200">Account Created Successfully</p>
                  <p className="text-emerald-700/90 dark:text-emerald-300/90">{authSuccessMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Role Verified Status Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <InstagramTickIcon
                  fillColor={currentRoleTab.hex}
                  sizeClass="w-6 h-6"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      {currentRoleTab.label} Authentication
                    </p>
                    <RoleLiveVerifiedBadge role={selectedRoleTab} size="xs" showLabel={false} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Live Institutional Security Clearance • Color Tag: <span className="font-bold">{currentRoleTab.colorName}</span>
                  </p>
                </div>
              </div>

              {/* Quick Fill Test Demo Account */}
              <button
                type="button"
                onClick={() => {
                  setIdentifier(currentRoleTab.defaultId);
                  setPassword(currentRoleTab.defaultPass);
                  setAuthError(null);
                  addNotification('Credentials Loaded', `Pre-filled official test account for ${currentRoleTab.label}`, 'info');
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[10px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition shrink-0"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Fill Test</span>
              </button>
            </div>

            {/* Department Selection for HOD */}
            {selectedRoleTab === 'HOD' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as DepartmentCode)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
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
                  <option value="AERO">Aeronautical Engineering (AERO)</option>
                  <option value="MBA">Master of Business Administration (MBA)</option>
                  <option value="MCA">Master of Computer Applications (MCA)</option>
                </select>
              </div>
            )}

            {/* Identity / Identifier */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {currentRoleTab.idLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={currentRoleTab.idPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Authorize & Enter ${currentRoleTab.label} Workspace`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Switch Hint */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                Don't have an institutional profile?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Create new member account
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
            
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <InstagramTickIcon
                  fillColor={currentRoleTab.hex}
                  sizeClass="w-6 h-6"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      New {currentRoleTab.label} Registration
                    </p>
                    <RoleLiveVerifiedBadge role={selectedRoleTab} size="xs" showLabel={false} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Direct issuance with {currentRoleTab.colorName} Verified Pass Credentials
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono border ${currentRoleTab.activeBorder} ${currentRoleTab.textClass} bg-white dark:bg-slate-800`}>
                {currentRoleTab.colorName} Pass
              </span>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. K. Ramesh or Priya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official College Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@avsct.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Department & ID Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value as DepartmentCode)}
                  className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedRoleTab === 'STUDENT' ? 'Register Number' : 'Employee ID'}
                </label>
                <input
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder={selectedRoleTab === 'STUDENT' ? 'e.g. 24CS102' : 'e.g. STF-2026-88'}
                  className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Create Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Error Message Box */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success / Email Confirmation Box */}
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

            {/* Submit Registration */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Registering...' : 'Register & Issue Digital Credentials'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold"
              >
                Already registered? Switch to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
