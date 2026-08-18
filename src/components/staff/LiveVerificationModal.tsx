import React from 'react';
import { Student, IDStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { rohitKumarPhoto, avsCampusPhoto } from '../../data/mockData';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Zap, 
  QrCode, 
  ShieldCheck, 
  ShieldAlert,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';

interface LiveVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Partial<Student> | null;
  isValid: boolean;
  status: IDStatus | 'INVALID_TOKEN';
  verifiedAt?: string;
  verifiedBy?: string;
  onScanAnother?: () => void;
}

export const LiveVerificationModal: React.FC<LiveVerificationModalProps> = ({
  isOpen,
  onClose,
  student,
  isValid,
  status,
  verifiedAt = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
  verifiedBy = 'Security Staff',
  onScanAnother
}) => {
  if (!isOpen) return null;

  const isBanned = status === 'BANNED' || status === 'SUSPENDED' || !isValid;
  const photo = student?.photoUrl || rohitKumarPhoto;
  const name = student?.name || 'Rohit Kumar';
  const regNo = student?.registerNumber || '23CS001';
  const stuId = student?.studentIdNumber || 'STU-10001';
  const dept = student?.departmentName || 'Computer Science';
  const course = student?.course || 'B.E. Computer Science';
  const validUntil = student?.validUntil || '31-05-2027';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col relative"
      >
        {/* Subtle Campus Watermark Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-multiply overflow-hidden select-none">
          <img
            src={avsCampusPhoto}
            alt="AVS Campus"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Top App Bar with back button and flash */}
        <div className="relative z-10 px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Live Verification</span>
          </button>

          <div className="p-1.5 rounded-full text-slate-600 dark:text-slate-300">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
        </div>

        {/* Verification Status Icon & Badge */}
        <div className="pt-6 pb-2 px-6 flex flex-col items-center text-center">
          
          {/* Big Circle Icon (Green Checkmark for Valid, Red Cross for Invalid) */}
          <div className="relative mb-3">
            {!isBanned ? (
              <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-500/20">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 ring-8 ring-rose-500/20">
                <X className="w-10 h-10 stroke-[3]" />
              </div>
            )}
          </div>

          <h2 className={`text-base font-black uppercase tracking-wider ${
            !isBanned ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {!isBanned ? 'VALID ID' : 'INVALID ID'}
          </h2>

          {/* Student Profile Photo */}
          <div className="mt-4 mb-2">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-slate-200 dark:ring-slate-700 shadow-md mx-auto">
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Student Name & Core Credentials */}
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
            {name}
          </h3>
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {regNo} | {stuId}
          </p>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
            {dept}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {course}
          </p>

          {/* Status Pill Badge */}
          <div className="mt-3">
            <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              !isBanned 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}>
              {!isBanned ? 'ACTIVE' : (status === 'SUSPENDED' ? 'SUSPENDED' : 'BANNED')}
            </span>
          </div>

          {/* Verification Meta Key-Values */}
          <div className="w-full mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-left">
            {!isBanned && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Valid Until</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">: {validUntil}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Verified At</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">: {verifiedAt}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Verified By</span>
              <span className="font-bold text-slate-900 dark:text-white">: {verifiedBy}</span>
            </div>
          </div>

        </div>

        {/* Footer Action Button */}
        <div className="p-5 pt-3">
          <button
            onClick={() => {
              if (onScanAnother) {
                onScanAnother();
              } else {
                onClose();
              }
            }}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Another</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
