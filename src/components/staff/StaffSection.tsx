import React, { useState } from 'react';
import { StaffAttendanceDashboard } from './StaffAttendanceDashboard';
import { StaffScanner } from './StaffScanner';
import { StaffHistory } from './StaffHistory';
import { StaffHodCommunication } from './StaffHodCommunication';
import { StaffDigitalIDCard } from './StaffDigitalIDCard';
import { ClassCoordinatorSection } from '../coordinator/ClassCoordinatorSection';
import { RoleLiveVerifiedBadge } from '../common/RoleLiveVerifiedBadge';
import { ShieldCheck, History, Scan, Building2, UserCheck, QrCode, FileText, CalendarCheck } from 'lucide-react';

export const StaffSection: React.FC = () => {
  const [activeStaffTab, setActiveStaffTab] = useState<'attendance' | 'badge' | 'scanner' | 'history' | 'coordinator-passes' | 'communication'>('attendance');

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SECURITY & PROCTORIAL DESK • AVS COLLEGE OF TECHNOLOGY</span>
              </div>
              <RoleLiveVerifiedBadge role="STAFF" size="sm" customLabel="LIVE VERIFIED STAFF" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Staff & Gate Security Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Student Attendance Management, Biometric Facial Matcher, QR Gate Turnstiles, Gate Pass Approvals & Direct Channel to Department HODs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Scanner State</span>
              <span className="text-xs font-black text-emerald-400 font-mono">● LIVE 60 FPS</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Curfew Cutoff</span>
              <span className="text-xs font-black text-amber-400 font-mono">09:00 PM IST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveStaffTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeStaffTab === 'attendance'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Student Attendance & Roster</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('badge')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeStaffTab === 'badge'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Staff Identity Badge</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('scanner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeStaffTab === 'scanner'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Live Gate Scanner & Biometrics</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('coordinator-passes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeStaffTab === 'coordinator-passes'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Gate Pass Verification Desk</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeStaffTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Turnstile Access Logs</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('communication')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeStaffTab === 'communication'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Communicate with HOD</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeStaffTab === 'attendance' && (
        <StaffAttendanceDashboard />
      )}

      {activeStaffTab === 'badge' && (
        <div className="py-2">
          <StaffDigitalIDCard />
        </div>
      )}

      {activeStaffTab === 'scanner' && (
        <StaffScanner />
      )}

      {activeStaffTab === 'coordinator-passes' && (
        <ClassCoordinatorSection />
      )}

      {activeStaffTab === 'history' && (
        <StaffHistory />
      )}

      {activeStaffTab === 'communication' && (
        <StaffHodCommunication />
      )}

    </div>
  );
};


