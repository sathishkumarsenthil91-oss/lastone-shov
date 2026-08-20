import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Student, DepartmentCode } from '../../types';
import { RoleLiveVerifiedBadge, InstagramTickIcon } from '../common/RoleLiveVerifiedBadge';
import { 
  ShieldCheck, 
  Clock, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  QrCode, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  ChevronRight, 
  Lock,
  Sparkles,
  Info,
  Check,
  X
} from 'lucide-react';

export interface GatePassRequest {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  departmentCode: DepartmentCode;
  studentEmail: string;
  phoneNumber: string;
  curfewTime: string; // e.g. "06:30 PM (Return before 08:30 PM)"
  outTime: string;
  expectedReturnTime: string;
  reason: 'EMERGENCY' | 'MEDICAL' | 'DAY_OUTING' | 'PROJECT_FIELDWORK' | 'HOME_VISIT' | 'ACADEMIC_COMPETITION';
  reasonText: string;
  note: string;
  assignedCoordinatorName: string;
  assignedCoordinatorEmail: string;
  status: 'PENDING_CC_APPROVAL' | 'APPROVED' | 'REJECTED';
  ccRemark?: string;
  approvedAt?: string;
  rejectedAt?: string;
  passToken?: string;
  createdAt: string;
}

const DEFAULT_COORDINATORS = [
  { name: 'Prof. R. Swaminathan', dept: 'CSE', email: 'swaminathan.cc.cse@avsct.edu.in', designation: 'Class Coordinator (3rd Year CSE)' },
  { name: 'Dr. S. Kavitha', dept: 'IT', email: 'kavitha.cc.it@avsct.edu.in', designation: 'Class Coordinator (3rd Year IT)' },
  { name: 'Dr. M. Anand', dept: 'AIDS', email: 'anand.cc.aids@avsct.edu.in', designation: 'Class Coordinator (3rd Year AIDS)' },
  { name: 'Prof. K. Venkatesh', dept: 'ECE', email: 'venkatesh.cc.ece@avsct.edu.in', designation: 'Class Coordinator (3rd Year ECE)' },
  { name: 'Dr. P. Balaji', dept: 'MECH', email: 'balaji.cc.mech@avsct.edu.in', designation: 'Class Coordinator (3rd Year MECH)' },
];

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
  }
];

interface CampusGatePassSectionProps {
  student: Student;
}

export const CampusGatePassSection: React.FC<CampusGatePassSectionProps> = ({ student }) => {
  const { addNotification } = useAuth();

  // Load from local storage or initial state
  const [gatePasses, setGatePasses] = useState<GatePassRequest[]>(() => {
    try {
      const saved = localStorage.getItem('avs_gate_passes');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_GATE_PASSES;
  });

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem('avs_gate_passes', JSON.stringify(gatePasses));
    } catch {
      // ignore
    }
  }, [gatePasses]);

  // Pass Request Form State
  const [curfewReturnTime, setCurfewReturnTime] = useState('08:30 PM');
  const [outTime, setOutTime] = useState('04:30 PM');
  const [reason, setReason] = useState<GatePassRequest['reason']>('PROJECT_FIELDWORK');
  const [reasonDetails, setReasonDetails] = useState('');
  const [note, setNote] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(student.phoneNumber || '+91 98765 43210');
  const [studentEmail, setStudentEmail] = useState(student.collegeEmail || 'student@avsct.edu.in');
  
  // Coordinator selection
  const deptCoordinators = DEFAULT_COORDINATORS.filter(c => c.dept === (student.departmentCode || 'CSE'));
  const selectedCoordinator = deptCoordinators[0] || DEFAULT_COORDINATORS[0];
  const [coordinatorEmail, setCoordinatorEmail] = useState(selectedCoordinator.email);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRModal, setShowQRModal] = useState<GatePassRequest | null>(null);

  // Filter student passes
  const myPasses = gatePasses.filter(
    p => p.studentId === student.id || 
         p.registerNumber.toLowerCase() === student.registerNumber.toLowerCase() ||
         p.studentEmail.toLowerCase() === student.collegeEmail?.toLowerCase()
  );

  const activePass = myPasses.find(p => p.status === 'APPROVED' || p.status === 'PENDING_CC_APPROVAL');

  const handleSubmitPassRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      addNotification('Missing Information', 'Please provide a detailed note / parent consent details.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const assignedCC = DEFAULT_COORDINATORS.find(c => c.email === coordinatorEmail) || selectedCoordinator;

    setTimeout(() => {
      const newPass: GatePassRequest = {
        id: `GP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: student.id,
        studentName: student.name,
        registerNumber: student.registerNumber,
        department: student.department || student.departmentName || 'Computer Science and Engineering',
        departmentCode: (student.departmentCode as DepartmentCode) || 'CSE',
        studentEmail: studentEmail || student.collegeEmail,
        phoneNumber: phoneNumber || student.phoneNumber,
        curfewTime: `${curfewReturnTime} IST`,
        outTime: outTime,
        expectedReturnTime: curfewReturnTime,
        reason: reason,
        reasonText: reasonDetails || getReasonLabel(reason),
        note: note,
        assignedCoordinatorName: assignedCC.name,
        assignedCoordinatorEmail: assignedCC.email,
        status: 'PENDING_CC_APPROVAL',
        createdAt: 'Just now'
      };

      setGatePasses(prev => [newPass, ...prev]);
      setIsSubmitting(false);
      setNote('');
      setReasonDetails('');
      addNotification(
        'Gate Pass Request Dispatched',
        `Note & request sent to Class Coordinator (${assignedCC.name}) for approval.`,
        'success'
      );
    }, 600);
  };

  const getReasonLabel = (r: GatePassRequest['reason']) => {
    switch (r) {
      case 'PROJECT_FIELDWORK': return 'Project Fieldwork & Technical Competition';
      case 'MEDICAL': return 'Medical Appointment / Clinic Visit';
      case 'EMERGENCY': return 'Urgent Family / Personal Emergency';
      case 'DAY_OUTING': return 'Approved Day Outing';
      case 'HOME_VISIT': return 'Weekend Home Visit';
      case 'ACADEMIC_COMPETITION': return 'Inter-College Symposium / Hackathon';
      default: return r;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO BANNER */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-black uppercase tracking-wider font-mono border border-blue-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CAMPUS GATE-ACCESS CONTROL</span>
              </span>
              <RoleLiveVerifiedBadge role="STUDENT" size="sm" customLabel="CLASS COORDINATOR VERIFIED" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Student Gate Access & Out-Pass Workflow
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Requests are sent directly to your assigned <strong>Class Coordinator (CC)</strong>. Upon verification, an encrypted biometric Gate QR code is issued for turnstile scanner clearance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center shrink-0">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Campus Curfew Cutoff</span>
            <span className="text-xl font-black text-amber-400 font-mono">08:30 PM</span>
            <span className="text-[9px] text-slate-300 block">Strict Gate Return Time</span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE GATE PASS BANNER IF EXISTS */}
      {activePass && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-3xl border shadow-lg ${
            activePass.status === 'APPROVED'
              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
              : 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 text-amber-900 dark:text-amber-100'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                activePass.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {activePass.status === 'APPROVED' ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7 animate-pulse" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    activePass.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950 font-bold'
                  }`}>
                    {activePass.status === 'APPROVED' ? 'GATE PASS APPROVED & ACTIVE' : 'PENDING CC VERIFICATION'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {activePass.id}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {getReasonLabel(activePass.reason)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Curfew Return: <strong className="text-slate-900 dark:text-white font-mono">{activePass.curfewTime}</strong> • Assigned CC: <strong>{activePass.assignedCoordinatorName}</strong>
                </p>
                {activePass.ccRemark && (
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/30 text-xs mt-2">
                    <strong className="text-emerald-700 dark:text-emerald-400">Coordinator Remark:</strong> {activePass.ccRemark}
                  </div>
                )}
              </div>
            </div>

            {activePass.status === 'APPROVED' && (
              <button
                onClick={() => setShowQRModal(activePass)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer shrink-0 hover:scale-105 active:scale-95 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Show Turnstile Gate QR</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 3. MAIN GRID: REQUEST FORM + REQUEST HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pass Request Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Request Campus Gate Access Pass</span>
              </h3>
              <p className="text-xs text-slate-500">
                Direct transmission to Class Coordinator (CC) inbox
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
              {student.registerNumber}
            </span>
          </div>

          <form onSubmit={handleSubmitPassRequest} className="space-y-4 text-xs">
            
            {/* Student Identification Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Student Name</label>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.name}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Department & Year</label>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.departmentCode || 'CSE'} • Year {student.year || 3}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Registered Student Email</label>
                <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 pb-0.5 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Contact Phone Number</label>
                <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 pb-0.5 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Curfew Time & Timing Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Expected Campus Exit (Out Time)
                </label>
                <input
                  type="text"
                  required
                  value={outTime}
                  onChange={(e) => setOutTime(e.target.value)}
                  placeholder="e.g. 04:30 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mandatory Return Curfew Time
                </label>
                <input
                  type="text"
                  required
                  value={curfewReturnTime}
                  onChange={(e) => setCurfewReturnTime(e.target.value)}
                  placeholder="e.g. 08:30 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>

            {/* Reason Selector */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for Campus Leave
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as GatePassRequest['reason'])}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="PROJECT_FIELDWORK">Project Fieldwork & Technical Competition</option>
                <option value="MEDICAL">Medical Appointment / Clinic Visit</option>
                <option value="EMERGENCY">Urgent Family / Personal Emergency</option>
                <option value="DAY_OUTING">Approved Day Outing (Local Market / Bank)</option>
                <option value="HOME_VISIT">Weekend Home Visit</option>
                <option value="ACADEMIC_COMPETITION">Inter-College Symposium / Hackathon</option>
              </select>
            </div>

            {/* Reason Details */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Destination / Specific Purpose
              </label>
              <input
                type="text"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="e.g. Salem Tech Hardware Market / Apollo Clinic Salem"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Note to Coordinator & Parent Consent */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Note & Parent Consent Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Include parent contact number, parent acknowledgement details, and any travel specifics..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Assigned Class Coordinator Selection */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Class Coordinator (CC)
              </label>
              <select
                value={coordinatorEmail}
                onChange={(e) => setCoordinatorEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {DEFAULT_COORDINATORS.map((cc) => (
                  <option key={cc.email} value={cc.email}>
                    {cc.name} • {cc.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting to Class Coordinator...' : 'Submit Gate Pass Request to Class Coordinator'}</span>
            </button>
          </form>
        </div>

        {/* Previous Passes History */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Gate Pass Audit History</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {myPasses.length} Record{myPasses.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {myPasses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No previous gate pass requests found.</p>
              </div>
            ) : (
              myPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {pass.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                      pass.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : pass.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {pass.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {getReasonLabel(pass.reason)}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                    <div>
                      <span className="block text-[10px] text-slate-400">Curfew Time</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{pass.curfewTime}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Coordinator</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{pass.assignedCoordinatorName}</span>
                    </div>
                  </div>

                  {pass.note && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{pass.note}"
                    </p>
                  )}

                  {pass.status === 'APPROVED' && (
                    <button
                      onClick={() => setShowQRModal(pass)}
                      className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Approved Gate QR</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. APPROVED GATE PASS QR LIGHTBOX MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-wider">OFFICIAL GATE PASS CLEARANCE</span>
              </div>
              <button
                onClick={() => setShowQRModal(null)}
                className="p-1 rounded-lg text-white hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Content */}
            <div className="p-6 text-center space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {showQRModal.studentName}
                </h4>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {showQRModal.registerNumber} • {showQRModal.departmentCode}
                </p>
                <p className="text-[11px] text-slate-500">
                  Authorized Curfew Return: <strong className="text-slate-900 dark:text-white font-mono">{showQRModal.curfewTime}</strong>
                </p>
              </div>

              {/* QR Code Container with Animation */}
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md inline-block relative">
                <svg viewBox="0 0 100 100" className="w-44 h-44">
                  <rect x="2" y="2" width="28" height="28" rx="4" fill="#0f172a" />
                  <rect x="6" y="6" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="10" y="10" width="12" height="12" rx="2" fill="#10b981" />

                  <rect x="70" y="2" width="28" height="28" rx="4" fill="#0f172a" />
                  <rect x="74" y="6" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="78" y="10" width="12" height="12" rx="2" fill="#10b981" />

                  <rect x="2" y="70" width="28" height="28" rx="4" fill="#0f172a" />
                  <rect x="6" y="74" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="10" y="78" width="12" height="12" rx="2" fill="#10b981" />

                  <path d="M 36 6 H 44 V 14 H 36 Z M 48 6 H 64 V 14 H 48 Z M 36 20 H 48 V 28 H 36 Z M 52 20 H 64 V 28 H 52 Z" fill="#0f172a" />
                  <path d="M 6 36 H 14 V 44 H 6 Z M 20 36 H 28 V 44 H 20 Z M 34 36 H 46 V 44 H 34 Z M 52 36 H 62 V 44 H 52 Z M 68 36 H 94 V 44 H 68 Z" fill="#0f172a" />
                  <path d="M 6 50 H 24 V 58 H 6 Z M 30 50 H 40 V 58 H 30 Z M 46 50 H 64 V 58 H 46 Z M 70 50 H 94 V 58 H 70 Z" fill="#0f172a" />
                  <path d="M 36 70 H 44 V 78 H 36 Z M 50 70 H 64 V 78 H 50 Z M 70 70 H 80 V 78 H 70 Z M 86 70 H 94 V 78 H 86 Z" fill="#0f172a" />
                  <path d="M 36 86 H 50 V 94 H 36 Z M 56 86 H 68 V 94 H 56 Z M 74 86 H 94 V 94 H 74 Z" fill="#0f172a" />
                  
                  <circle cx="50" cy="50" r="8" fill="#10b981" />
                  <circle cx="50" cy="50" r="6" fill="#ffffff" />
                  <path d="M 47 50 L 49 52 L 53 48" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">Class Coordinator Digital Seal:</p>
                <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{showQRModal.assignedCoordinatorName}</p>
                <p className="text-[10px] text-slate-400">Scan at Gate Turnstile 1 / 2</p>
              </div>

              <button
                onClick={() => setShowQRModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Pass Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
