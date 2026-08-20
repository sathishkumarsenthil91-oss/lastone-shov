import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DepartmentCode } from '../../types';
import { RoleLiveVerifiedBadge, InstagramTickIcon } from '../common/RoleLiveVerifiedBadge';
import { GatePassRequest } from '../student/CampusGatePassSection';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Building2, 
  User, 
  Calendar, 
  FileText, 
  Check, 
  X, 
  AlertTriangle,
  QrCode,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const INITIAL_GATE_PASSES: GatePassRequest[] = [
  {
    id: 'GP-2026-0891',
    studentId: 'STU-10001',
    studentName: 'Rohit Kumar',
    registerNumber: '23CS101',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    studentEmail: 'rohit.kumar@avsct.edu.in',
    phoneNumber: '+91 98765 43210',
    curfewTime: '08:30 PM IST',
    outTime: '04:30 PM',
    expectedReturnTime: '08:30 PM',
    reason: 'PROJECT_FIELDWORK',
    reasonText: 'Hardware component procurement for Smart India Hackathon IoT prototype',
    note: 'Parent notified: Mr. Kumar (+91 98765 00112). Granted approval for local hardware market visit.',
    assignedCoordinatorName: 'Prof. R. Swaminathan',
    assignedCoordinatorEmail: 'swaminathan.cc.cse@avsct.edu.in',
    status: 'APPROVED',
    ccRemark: 'Approved for Salem electronics hub visit. Must return strictly before 08:30 PM curfew.',
    approvedAt: 'Today, 03:45 PM',
    passToken: 'AVSCT-GP-SECURE-99482-PASS',
    createdAt: 'Today, 02:15 PM'
  },
  {
    id: 'GP-2026-0894',
    studentId: 'STU-10002',
    studentName: 'Priya Dharshini',
    registerNumber: '23CS102',
    department: 'Computer Science and Engineering',
    departmentCode: 'CSE',
    studentEmail: 'priya.24cs@avsct.edu.in',
    phoneNumber: '+91 98765 43211',
    curfewTime: '07:30 PM IST',
    outTime: '03:00 PM',
    expectedReturnTime: '07:30 PM',
    reason: 'MEDICAL',
    reasonText: 'Routine dental consultation and checkup at Salem Town Clinic',
    note: 'Parent acknowledged by phone (+91 98765 11223). Expected return before 07:30 PM.',
    assignedCoordinatorName: 'Prof. R. Swaminathan',
    assignedCoordinatorEmail: 'swaminathan.cc.cse@avsct.edu.in',
    status: 'PENDING_CC_APPROVAL',
    createdAt: '15 mins ago'
  }
];

export const ClassCoordinatorSection: React.FC = () => {
  const { user, addNotification } = useAuth();

  const [passes, setPasses] = useState<GatePassRequest[]>(() => {
    try {
      const saved = localStorage.getItem('avs_gate_passes');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_GATE_PASSES;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('avs_gate_passes', JSON.stringify(passes));
    } catch {
      // ignore
    }
  }, [passes]);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_CC_APPROVAL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPass, setSelectedPass] = useState<GatePassRequest | null>(null);
  const [remarkInput, setRemarkInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredPasses = passes.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesQuery = !searchQuery || 
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const pendingCount = passes.filter(p => p.status === 'PENDING_CC_APPROVAL').length;
  const approvedCount = passes.filter(p => p.status === 'APPROVED').length;

  const handleApprove = (pass: GatePassRequest) => {
    setIsProcessing(true);
    const remark = remarkInput.trim() || 'Approved by Class Coordinator. Please adhere to campus curfew time.';
    
    setTimeout(() => {
      setPasses(prev => prev.map(p => {
        if (p.id === pass.id) {
          return {
            ...p,
            status: 'APPROVED',
            ccRemark: remark,
            approvedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            passToken: `AVSCT-GP-${Math.floor(10000 + Math.random() * 90000)}`
          };
        }
        return p;
      }));
      setIsProcessing(false);
      setSelectedPass(null);
      setRemarkInput('');
      addNotification('Pass Approved', `Gate access pass ${pass.id} approved for ${pass.studentName}.`, 'success');
    }, 400);
  };

  const handleReject = (pass: GatePassRequest) => {
    if (!remarkInput.trim()) {
      addNotification('Remark Required', 'Please provide a reason for rejecting this pass.', 'warning');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setPasses(prev => prev.map(p => {
        if (p.id === pass.id) {
          return {
            ...p,
            status: 'REJECTED',
            ccRemark: remarkInput.trim(),
            rejectedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return p;
      }));
      setIsProcessing(false);
      setSelectedPass(null);
      setRemarkInput('');
      addNotification('Pass Rejected', `Gate pass request ${pass.id} declined with note.`, 'info');
    }, 400);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. COORDINATOR HERO HEADER */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CLASS COORDINATOR (CC) DESK • AVS COLLEGE OF TECHNOLOGY</span>
              </span>
              <RoleLiveVerifiedBadge role="STAFF" size="sm" customLabel="COORDINATOR VERIFIED" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Gate Pass & Curfew Authorization
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Review and authorize student leave requests, curfew return times, parent consent notes, and issue cryptographically signed turnstile QR passes.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Pending Requests</span>
              <span className="text-xl font-black text-amber-400 font-mono">{pendingCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Approved Active</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{approvedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR: SEARCH & STATUS FILTER */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, register number, ID or department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Passes ({passes.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING_CC_APPROVAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'PENDING_CC_APPROVAL' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pending CC Review ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved ({approvedCount})</span>
          </button>
        </div>
      </div>

      {/* 3. REQUEST LIST & DETAIL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPasses.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <FileText className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-xs font-bold">No gate pass requests match the selected filter.</p>
          </div>
        ) : (
          filteredPasses.map((pass) => (
            <div
              key={pass.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                pass.status === 'PENDING_CC_APPROVAL'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-md'
                  : pass.status === 'APPROVED'
                  ? 'bg-white dark:bg-slate-900 border-emerald-300/60 dark:border-emerald-800/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                    {pass.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                    pass.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : pass.status === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500 text-slate-950 font-black animate-pulse'
                  }`}>
                    {pass.status === 'PENDING_CC_APPROVAL' ? 'NEEDS CC APPROVAL' : pass.status}
                  </span>
                </div>

                {/* Student Info */}
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {pass.studentName}
                  </h3>
                  <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    Reg: {pass.registerNumber} • Dept: {pass.departmentCode}
                  </p>
                </div>

                {/* Detailed Request Particulars */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Reason:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{pass.reason.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Out Time:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{pass.outTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Curfew Return:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{pass.curfewTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student Phone:</span>
                    <a href={`tel:${pass.phoneNumber}`} className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{pass.phoneNumber}</span>
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student Email:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{pass.studentEmail}</span>
                  </div>
                </div>

                {/* Student Note & Parent Consent */}
                {pass.note && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Note & Parent Details:</span>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      "{pass.note}"
                    </p>
                  </div>
                )}

                {/* CC Remarks if present */}
                {pass.ccRemark && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Coordinator Remark:</span>
                    <p className="text-emerald-800 dark:text-emerald-200">
                      {pass.ccRemark}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {pass.status === 'PENDING_CC_APPROVAL' ? (
                  <button
                    onClick={() => {
                      setSelectedPass(pass);
                      setRemarkInput('Approved for requested leave. Must strictly return before curfew.');
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Review & Authorize Pass</span>
                  </button>
                ) : pass.status === 'APPROVED' ? (
                  <div className="w-full flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    <span className="flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Gate Turnstile Token Issued</span>
                    </span>
                    <span className="text-[10px] font-mono">{pass.approvedAt}</span>
                  </div>
                ) : (
                  <div className="w-full text-center text-xs text-rose-600 dark:text-rose-400 font-bold py-1">
                    Pass Request Declined
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. MODAL: AUTHORIZE / REJECT GATE PASS */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 p-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Authorize Campus Gate Pass
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedPass.id} • {selectedPass.studentName} ({selectedPass.registerNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Particulars Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
              <p><strong className="text-slate-900 dark:text-white">Department:</strong> {selectedPass.department}</p>
              <p><strong className="text-slate-900 dark:text-white">Curfew Return:</strong> <span className="font-mono text-rose-600 font-bold">{selectedPass.curfewTime}</span></p>
              <p><strong className="text-slate-900 dark:text-white">Student Contact:</strong> <span className="font-mono">{selectedPass.phoneNumber}</span></p>
              <p><strong className="text-slate-900 dark:text-white">Reason:</strong> {selectedPass.reason.replace(/_/g, ' ')}</p>
              {selectedPass.note && <p><strong className="text-slate-900 dark:text-white">Parent Note:</strong> <em>"{selectedPass.note}"</em></p>}
            </div>

            {/* Coordinator Remark */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Coordinator Remark / Disciplinary Condition
              </label>
              <textarea
                rows={3}
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="Enter remarks for the student & gate turnstile proctors..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleReject(selectedPass)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                Reject Request
              </button>
              
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleApprove(selectedPass)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? 'Issuing...' : 'Approve & Issue Gate QR'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
