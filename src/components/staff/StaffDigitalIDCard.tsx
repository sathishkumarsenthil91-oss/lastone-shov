import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { avsCampusPhoto } from '../../data/mockData';
import { RoleLiveVerifiedBadge, InstagramTickIcon } from '../common/RoleLiveVerifiedBadge';
import { 
  ShieldCheck, 
  RotateCw, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Sparkles, 
  Camera, 
  Mail, 
  Phone, 
  User, 
  Award, 
  QrCode, 
  Wifi, 
  Fingerprint, 
  Download, 
  Share2, 
  AlertCircle,
  FileCheck2,
  Lock,
  Radio
} from 'lucide-react';

interface StaffDigitalIDCardProps {
  onPhotoUpdated?: (newPhoto: string) => void;
}

export const StaffDigitalIDCard: React.FC<StaffDigitalIDCardProps> = () => {
  const { user, addNotification } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);

  const staffName = user?.name || 'Officer Marcus Vance';
  const staffId = user?.staffId || (user?.username?.toUpperCase()?.startsWith('STF') ? user.username.toUpperCase() : 'STF-2026-01');
  const designation = user?.designation || 'Chief Security Officer & Gate Proctor';
  const department = user?.departmentName || 'Campus Security & Gate Operations';
  const email = user?.email || 'marcus.vance@avsct.edu.in';
  const phone = user?.phoneNumber || '+91 98765 11223';
  const avatarUrl = user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300';
  const station = 'North Gate Turnstile 1';
  const validUntil = '31-12-2028';

  const handleDownload = () => {
    addNotification('Staff ID Card Exported', `Digital badge for ${staffName} (${staffId}) saved.`, 'success');
  };

  return (
    <div className="w-full max-w-2xl mx-auto select-none space-y-4">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <RoleLiveVerifiedBadge role="STAFF" size="sm" customLabel="STAFF VERIFIED" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Save Badge</span>
          </button>
          
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Show Front' : 'Show Back (Proctor Pass)'}</span>
          </button>
        </div>
      </div>

      {/* 3D FLIP CONTAINER */}
      <div className="relative w-full aspect-[1.58/1] perspective-1000">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="w-full h-full relative transform-style-3d shadow-2xl rounded-3xl"
        >
          
          {/* ========================================================= */}
          {/* STAFF CARD FRONT SIDE                                      */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white text-slate-900 border-2 border-slate-200/90 flex flex-col justify-between backface-hidden shadow-2xl select-text relative">
            
            {/* Subtle Guilloché Geometric Watermark Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-600/5 via-teal-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* 1. Header Bar */}
            <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white px-5 sm:px-6 py-3 flex items-center justify-between border-b-2 border-emerald-400 relative z-10 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-1.5 flex items-center justify-center shadow-md ring-2 ring-white/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black tracking-tight text-white">STAFF ID</span>
                    <span className="text-[9px] font-extrabold tracking-widest text-emerald-300 uppercase">SECURITY DESK</span>
                  </div>
                  <p className="text-[7.5px] font-mono font-bold text-slate-300 tracking-wider uppercase">
                    AUTHORIZE • SCAN • PROTECT
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase leading-tight">
                  AVS COLLEGE OF TECHNOLOGY
                </h1>
                <p className="text-[8px] sm:text-[8.5px] font-bold text-emerald-300">
                  Campus Security & Proctorial Division
                </p>
              </div>
            </div>

            {/* 2. Middle Particulars */}
            <div className="relative z-10 my-auto py-2 grid grid-cols-12 gap-4 items-center">
              
              {/* Photo & Name */}
              <div className="col-span-4 flex flex-col items-center text-center space-y-1.5">
                <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden ring-3 ring-emerald-900/30 shadow-lg bg-slate-100">
                  <img
                    src={avatarUrl}
                    alt={staffName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    <h2 className="text-sm sm:text-base font-black text-slate-950 tracking-tight leading-tight">
                      {staffName}
                    </h2>
                    <InstagramTickIcon fillColor="#0095f6" sizeClass="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold text-sky-700 block mt-0.5">
                    VERIFIED OFFICIAL PROCTOR
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="col-span-8 space-y-1.5">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <div className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <InstagramTickIcon fillColor="#0095f6" sizeClass="w-3 h-3" />
                    <span>STAFF PASS</span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-slate-950 font-mono tracking-tight">
                    {staffId}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] sm:text-xs text-slate-800 font-medium">
                  
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <Award className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Designation</span>
                    <span className="font-bold text-slate-950 truncate">: {designation}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Department</span>
                    <span className="font-bold text-slate-950 truncate">: {department}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <Radio className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Assigned Post</span>
                    <span className="font-bold text-emerald-800">: {station}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <Mail className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Email</span>
                    <span className="font-bold text-slate-950 truncate font-mono">: {email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Phone</span>
                    <span className="font-bold text-slate-950 font-mono">: {phone}</span>
                  </div>

                </div>
              </div>

            </div>

            {/* 3. Footer */}
            <div className="relative z-10 border-t border-slate-200 pt-2.5 flex items-end justify-between">
              <div className="space-y-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">
                    Credential Validity
                  </span>
                  <span className="text-sm font-black text-emerald-950 font-mono">
                    {validUntil}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5">
                  <RoleLiveVerifiedBadge role="STAFF" size="sm" showLabel={false} />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>COMMAND LEVEL 2</span>
                  </span>
                </div>
              </div>

              {/* QR Gate Pass */}
              <div className="flex items-stretch rounded-xl border-2 border-emerald-950 overflow-hidden shadow-md bg-white">
                <div className="p-1">
                  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18">
                    <rect x="0" y="0" width="30" height="30" fill="#064e3b" rx="3" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="10" y="10" width="10" height="10" fill="#047857" rx="1" />

                    <rect x="70" y="0" width="30" height="30" fill="#064e3b" rx="3" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="80" y="10" width="10" height="10" fill="#047857" rx="1" />

                    <rect x="0" y="70" width="30" height="30" fill="#064e3b" rx="3" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="10" y="80" width="10" height="10" fill="#047857" rx="1" />

                    <path d="M 35 5 H 45 V 15 H 35 Z M 50 5 H 65 V 15 H 50 Z M 35 20 H 50 V 30 H 35 Z" fill="#064e3b" />
                    <path d="M 5 35 H 15 V 45 H 5 Z M 20 35 H 30 V 45 H 20 Z M 35 35 H 45 V 45 H 35 Z M 50 35 H 60 V 45 H 50 Z M 65 35 H 95 V 45 H 65 Z" fill="#064e3b" />
                    <path d="M 5 50 H 25 V 60 H 5 Z M 30 50 H 40 V 60 H 30 Z M 45 50 H 65 V 60 H 45 Z M 70 50 H 95 V 60 H 70 Z" fill="#064e3b" />
                    <path d="M 35 70 H 45 V 80 H 35 Z M 50 70 H 65 V 80 H 50 Z M 70 70 H 80 V 80 H 70 Z M 85 70 H 95 V 80 H 85 Z" fill="#064e3b" />
                    <path d="M 35 85 H 50 V 95 H 35 Z M 55 85 H 70 V 95 H 55 Z M 75 85 H 95 V 95 H 75 Z" fill="#064e3b" />
                  </svg>
                </div>
                <div className="bg-emerald-950 text-white px-1 py-1 flex items-center justify-center">
                  <span className="text-[8px] font-black tracking-widest uppercase [writing-mode:vertical-lr] rotate-180">
                    GATE PASS
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* STAFF CARD BACK SIDE                                       */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-slate-900 text-white border-2 border-emerald-800 flex flex-col justify-between [transform:rotateY(180deg)] backface-hidden shadow-2xl p-5 sm:p-6 select-text">
            
            {/* Magnetic Stripe Bar */}
            <div className="h-9 -mx-6 -mt-6 bg-slate-950 border-b border-emerald-500/20 flex items-center justify-between px-6">
              <span className="text-[9px] font-mono text-emerald-400">AVS-SECURITY-NFC-RFID-ENABLED</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="my-auto space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCheck2 className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider font-mono">
                  STAFF & PROCTORIAL REGULATIONS
                </h3>
              </div>

              <ul className="text-[10px] space-y-1.5 text-slate-300 list-disc pl-4 leading-snug">
                <li>This badge confirms authorized security and proctorial powers on campus.</li>
                <li>Officer has authority to verify student ID cards, conduct biometric checks, and enforce 09:00 PM curfew.</li>
                <li>Direct liaison channel to Department HODs for disciplinary logs and access clearances.</li>
                <li>If found, return immediately to the Security Command Station or Principal's Office.</li>
              </ul>

              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Security Emergency Hotline</span>
                  <span className="font-mono font-bold text-emerald-300">+91 (0427) 244-9999</span>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            {/* Signature & Barcode */}
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">
                  BARCODE PASS
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  |||||| | |||| ||||| |||| |||
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block">
                  CHIEF PROCTOR SIGNATURE
                </span>
                <span className="text-[11px] font-serif italic text-white">
                  M. Vance
                </span>
              </div>
            </div>

          </div>

        </motion.div>
      </div>

    </div>
  );
};
