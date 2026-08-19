import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  X, 
  Sparkles,
  Layers,
  Cpu,
  Database,
  Crown,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { UserRole, DepartmentCode, StaffAccountPayload } from '../../types';
import { ALL_COLLEGE_DEPARTMENTS } from '../../data/departmentsData';
import { RoleLiveVerifiedBadge, InstagramTickIcon, getRoleVerifiedConfig } from '../common/RoleLiveVerifiedBadge';

interface StaffAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: (payload: StaffAccountPayload) => Promise<{ success: boolean; message?: string }>;
}

export const StaffAccountModal: React.FC<StaffAccountModalProps> = ({
  isOpen,
  onClose,
  onCreateAccount
}) => {
  const [role, setRole] = useState<'STAFF' | 'HOD' | 'VICE_PRINCIPAL'>('HOD');
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode>('CSE');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phoneNumber) {
      setError('Please fill in all mandatory fields (Name, Gmail, Phone).');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: StaffAccountPayload = {
      name,
      email,
      phoneNumber,
      role,
      departmentCode: role === 'VICE_PRINCIPAL' ? undefined : departmentCode,
      designation: designation || (
        role === 'VICE_PRINCIPAL' ? 'Vice Principal & Academic Dean' :
        role === 'HOD' ? `Head of Department (${departmentCode})` :
        'Security & Proctor Staff'
      ),
      avatarUrl
    };

    const res = await onCreateAccount(payload);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } else {
      setError(res.message || 'Failed to create account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
              <UserPlus className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Register Staff, HOD, or VP Account</h2>
                <InstagramTickIcon fillColor={getRoleVerifiedConfig(role).hex} sizeClass="w-4.5 h-4.5" />
              </div>
              <p className="text-xs text-blue-100 font-medium flex items-center gap-1.5 mt-0.5">
                <span>Direct Faculty & Security Registration</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider font-mono">
                  {getRoleVerifiedConfig(role).colorName} Pass
                </span>
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Created Successfully!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The user can now log in via their Gmail address or phone number.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'STAFF', label: 'Staff / Security', icon: <ShieldCheck className="w-3.5 h-3.5" />, hex: '#0095f6' },
                  { r: 'HOD', label: 'Department HOD', icon: <Building2 className="w-3.5 h-3.5" />, hex: '#ef4444' },
                  { r: 'VICE_PRINCIPAL', label: 'Vice Principal', icon: <Crown className="w-3.5 h-3.5" />, hex: '#f59e0b' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.r}
                    onClick={() => setRole(item.r as any)}
                    className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === item.r
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {item.icon}
                      <InstagramTickIcon fillColor={item.hex} sizeClass="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Department Selection (if not VP) */}
            {role !== 'VICE_PRINCIPAL' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Department (All Colleges & Disciplines)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {ALL_COLLEGE_DEPARTMENTS.map((dept) => (
                    <button
                      type="button"
                      key={dept.code}
                      onClick={() => setDepartmentCode(dept.code as DepartmentCode)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        departmentCode === dept.code
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate max-w-full">{dept.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Priya Sundaram"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Gmail and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Gmail / Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@shov.college.edu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Designation / Position
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder={role === 'HOD' ? `Head of Department - ${departmentCode}` : 'Senior Professor / Officer'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Provision Account
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
