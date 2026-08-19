import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { DigitalIDCard } from './DigitalIDCard';
import { FinePaymentModal } from './FinePaymentModal';
import { InquiriesHub } from './InquiriesHub';
import { RoleLiveVerifiedBadge } from '../common/RoleLiveVerifiedBadge';
import { Student, Fine, Payment } from '../../types';
import { INITIAL_STUDENTS, INITIAL_FINES, INITIAL_PAYMENTS } from '../../data/mockData';
import { fetchFinesApi } from '../../services/api';
import { 
  GraduationCap, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Download, 
  Share2, 
  ShieldAlert, 
  Sparkles,
  PhoneCall,
  MapPin,
  Mail,
  Receipt,
  FileText,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  RefreshCw,
  Award,
  Edit3,
  Users,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';

export const StudentSection: React.FC = () => {
  const { user, addNotification } = useAuth();

  // Active sub-tab inside Student Section
  const [studentTab, setStudentTab] = useState<'id-card' | 'academic' | 'fines' | 'inquiries'>('id-card');

  // Selected student (defaults to matched logged-in student or Rohit Kumar)
  const [student, setStudent] = useState<Student>(() => {
    return INITIAL_STUDENTS.find(
      s => s.registerNumber.toLowerCase() === user?.username?.toLowerCase() || 
           s.id === user?.studentId ||
           s.collegeEmail?.toLowerCase() === user?.email?.toLowerCase() ||
           s.name.toLowerCase() === user?.name?.toLowerCase()
    ) || {
      id: user?.studentId || user?.id || 'STU-10001',
      studentIdNumber: user?.studentId || 'STU-10001',
      name: user?.name || 'Rohit Kumar',
      registerNumber: user?.username?.toUpperCase() || '23CS101',
      department: user?.departmentName || 'Computer Science and Engineering',
      departmentName: user?.departmentName || 'Computer Science and Engineering',
      departmentCode: 'CSE',
      course: 'B.E. Computer Science & Engineering',
      year: 3,
      dateOfBirth: '14-08-2004',
      bloodGroup: 'O+ Positive',
      photoUrl: user?.avatarUrl || INITIAL_STUDENTS[0].photoUrl,
      collegeEmail: user?.email || 'rohit.kumar@avsct.edu.in',
      phoneNumber: '+91 98765 43210',
      validUntil: '31-05-2027',
      validityYear: '2023 - 2027',
      emergencyContact: '+91 98765 00112',
      address: 'Hostel Block B, Room 304, AVS College Campus, Salem - 636106',
      status: 'ACTIVE',
      fines: []
    };
  });

  // Sync state whenever authenticated user changes
  useEffect(() => {
    if (!user) return;
    const existing = INITIAL_STUDENTS.find(
      s => s.registerNumber.toLowerCase() === user?.username?.toLowerCase() || 
           s.id === user?.studentId ||
           s.collegeEmail?.toLowerCase() === user?.email?.toLowerCase() ||
           s.name.toLowerCase() === user?.name?.toLowerCase()
    );

    if (existing) {
      setStudent(prev => ({
        ...existing,
        name: user.name || existing.name,
        photoUrl: user.avatarUrl || existing.photoUrl,
        collegeEmail: user.email || existing.collegeEmail,
        department: user.departmentName || existing.department || existing.departmentName,
        departmentName: user.departmentName || existing.departmentName || existing.department,
      }));
    } else {
      const deptFullName = user.departmentName || 'Computer Science & Engineering';
      setStudent({
        id: user.studentId || user.id || 'STU-NEW',
        studentIdNumber: user.studentId || 'STU-' + (user.username?.toUpperCase() || '2026'),
        name: user.name || 'Enrolled Student',
        registerNumber: user.username?.toUpperCase() || user.studentId || '24CS099',
        department: deptFullName,
        departmentName: deptFullName,
        departmentCode: 'CSE',
        course: `B.E. ${deptFullName}`,
        year: 3,
        dateOfBirth: '15-06-2004',
        bloodGroup: 'O+ Positive',
        photoUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        collegeEmail: user.email || 'student@avsct.edu.in',
        phoneNumber: user.phoneNumber || '+91 98765 00000',
        validUntil: '31-05-2027',
        validityYear: '2023 - 2027',
        emergencyContact: '+91 98765 11000',
        address: 'AVS College Campus Hostel, Salem - 636106',
        status: 'ACTIVE',
        fines: []
      });
    }
  }, [user]);

  const [fines, setFines] = useState<Fine[]>([]);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [selectedFineToPay, setSelectedFineToPay] = useState<Fine | null>(null);
  const [showReportLostModal, setShowReportLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Card Form State
  const [editForm, setEditForm] = useState({
    name: student.name,
    registerNumber: student.registerNumber,
    department: student.department || student.departmentName,
    course: student.course || 'B.E. Computer Science & Engineering',
    year: student.year || 3,
    bloodGroup: student.bloodGroup || 'O+ Positive',
    dateOfBirth: student.dateOfBirth || '14-08-2004',
    phoneNumber: student.phoneNumber || '+91 98765 43210',
    emergencyContact: student.emergencyContact || '+91 98765 00112',
    address: student.address || 'Hostel Block B, Room 304, AVS College Campus',
    photoUrl: student.photoUrl || INITIAL_STUDENTS[0].photoUrl,
    validUntil: student.validUntil || '31-05-2027'
  });

  useEffect(() => {
    setEditForm({
      name: student.name,
      registerNumber: student.registerNumber,
      department: student.department || student.departmentName,
      course: student.course || 'B.E. Computer Science & Engineering',
      year: student.year || 3,
      bloodGroup: student.bloodGroup || 'O+ Positive',
      dateOfBirth: student.dateOfBirth || '14-08-2004',
      phoneNumber: student.phoneNumber || '+91 98765 43210',
      emergencyContact: student.emergencyContact || '+91 98765 00112',
      address: student.address || 'Hostel Block B, Room 304, AVS College Campus',
      photoUrl: student.photoUrl || INITIAL_STUDENTS[0].photoUrl,
      validUntil: student.validUntil || '31-05-2027'
    });
  }, [student]);

  useEffect(() => {
    loadStudentFines();
  }, [student.id]);

  const loadStudentFines = async () => {
    const data = await fetchFinesApi(student.id);
    if (data.length > 0) {
      setFines(data);
    } else {
      setFines(INITIAL_FINES.filter(f => f.studentId === student.id));
    }
  };

  const pendingFines = fines.filter(f => f.status === 'PENDING');
  const totalPendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);

  const handlePaymentSuccess = (paymentRecord: Payment) => {
    setPayments(prev => [paymentRecord, ...prev]);
    setFines(prev => prev.map(f => f.id === paymentRecord.fineId ? { ...f, status: 'PAID' } : f));
    addNotification('Fine Settled', `Payment of ₹${paymentRecord.amount} processed successfully.`, 'success');
  };

  const handleReportLostSubmit = () => {
    if (!lostReason) return;
    setStudent(prev => ({ ...prev, status: 'SUSPENDED' }));
    setShowReportLostModal(false);
    addNotification('Lost ID Reported', 'Your digital card status has been set to SUSPENDED. Admin & Security notified.', 'warning');
  };

  const handleSaveCardDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStudent(prev => ({
      ...prev,
      name: editForm.name,
      registerNumber: editForm.registerNumber,
      department: editForm.department,
      departmentName: editForm.department,
      course: editForm.course,
      year: Number(editForm.year),
      bloodGroup: editForm.bloodGroup,
      dateOfBirth: editForm.dateOfBirth,
      phoneNumber: editForm.phoneNumber,
      emergencyContact: editForm.emergencyContact,
      address: editForm.address,
      photoUrl: editForm.photoUrl,
      validUntil: editForm.validUntil
    }));
    setShowEditModal(false);
    addNotification('Digital ID Updated', 'Student identification card information saved successfully.', 'success');
  };

  const handleSelectStudentPreset = (preset: Student) => {
    setStudent(preset);
    addNotification('Member Connected', `Switched active ID to ${preset.name} (${preset.registerNumber}).`, 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. STUDENT HEADER HERO WITH ENTRANCE MOTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-900/40 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider font-mono">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>STUDENT PORTAL • AVS COLLEGE OF TECHNOLOGY</span>
              </div>
              <RoleLiveVerifiedBadge role="STUDENT" size="sm" customLabel="LIVE VERIFIED STUDENT" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{student.name}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/40 font-mono font-bold">
                {student.status}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Reg No: <strong className="text-white font-mono">{student.registerNumber}</strong> • Dept: <strong className="text-white">{student.department}</strong> • Batch: <strong className="text-white">{student.validityYear}</strong>
            </p>
          </div>

          {/* Quick Stats Pill & Edit Button */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              title="Edit your Student ID Card Particulars & Information"
            >
              <Edit3 className="w-4 h-4 text-slate-950" />
              <span>Edit Identity Info</span>
            </button>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Attendance</span>
              <span className="text-lg font-black text-emerald-400">94.2%</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Pending Fines</span>
              <span className={`text-lg font-black ${totalPendingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ₹{totalPendingAmount}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setStudentTab('id-card')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            studentTab === 'id-card'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Official 3D Digital ID Card</span>
        </button>

        <button
          onClick={() => setStudentTab('academic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            studentTab === 'academic'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic & Student Profile</span>
        </button>

        <button
          onClick={() => setStudentTab('fines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            studentTab === 'fines'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Fines & Fee Clearance {pendingFines.length > 0 && `(${pendingFines.length})`}</span>
        </button>

        <button
          onClick={() => setStudentTab('inquiries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            studentTab === 'inquiries'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Grievances & Inquiries</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {studentTab === 'id-card' && (
        <div className="space-y-6">
          
          {/* Easy ID Card Management & Member Switcher Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Connected Member: {student.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-mono text-[10px] font-bold">
                    {student.registerNumber}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {student.department} • Year {student.year}
                </p>
              </div>
            </div>

            {/* Quick Switch & Edit Controls */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Connect Member:</span>
                {INITIAL_STUDENTS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectStudentPreset(preset)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      student.id === preset.id || student.registerNumber === preset.registerNumber
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {preset.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto md:ml-2 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit ID Card Info</span>
              </button>
            </div>
          </div>

          <DigitalIDCard 
            student={student} 
            onOpenEditModal={() => setShowEditModal(true)}
            onReportLost={() => setShowReportLostModal(true)} 
            onPhotoUpdated={(newPhoto) => {
              setStudent(prev => ({ ...prev, photoUrl: newPhoto }));
              addNotification('Photo Updated', 'Digital ID card picture changed successfully.', 'success');
            }}
          />
        </div>
      )}

      {studentTab === 'academic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Profile Overview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Student Academic Record</span>
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Register Number</span>
                <span className="font-bold font-mono text-blue-600 dark:text-blue-400">{student.registerNumber}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">{student.department}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Current Year / Semester</span>
                <span className="font-bold text-slate-900 dark:text-white">{student.year} Year / Sem VI</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Date of Birth</span>
                <span className="font-bold text-slate-900 dark:text-white">{student.dateOfBirth || '14-08-2004'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-1">Blood Group</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{student.bloodGroup}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Institution: <strong>AVS College of Technology</strong></span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ID Active
              </span>
            </div>
          </div>

          {/* Gate Access & Security Pass */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Campus Gate Access Pass</span>
            </h2>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">GATE PASS CLEARANCE: GRANTED</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">VALID</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Authorized for entry through Main Gate Turnstiles, Library RFID checkpoint, and Department Labs.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Curfew Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">09:00 PM</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Emergency Phone:</span>
                <span className="font-bold font-mono text-blue-600 dark:text-blue-400">{student.emergencyContact}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Student Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{student.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {studentTab === 'fines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Disciplinary & Library Fines</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Auto-synced with Accounts Department</span>
          </div>

          {fines.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">No Pending Fines</p>
              <p className="text-xs text-slate-500">Your disciplinary and library fee record is 100% clear.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fines.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{f.reason}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        f.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {f.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Issued on {f.issuedAt} by {f.issuedBy}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">₹{f.amount}</span>
                    {f.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedFineToPay(f)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        Pay Online
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {studentTab === 'inquiries' && (
        <div className="space-y-4">
          <InquiriesHub />
        </div>
      )}

      {/* MODAL: Pay Fine */}
      {selectedFineToPay && (
        <FinePaymentModal
          isOpen={!!selectedFineToPay}
          fine={selectedFineToPay}
          onClose={() => setSelectedFineToPay(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* MODAL: Edit ID Card Details */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Student Digital ID Card</h3>
                  <p className="text-[11px] text-slate-500">Changes reflect instantly on your 3D digital pass</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCardDetails} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Register Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.registerNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, registerNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editForm.department}
                    onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course & Branch</label>
                  <input
                    type="text"
                    required
                    value={editForm.course}
                    onChange={(e) => setEditForm(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">DOB</label>
                  <input
                    type="text"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    placeholder="DD-MM-YYYY"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={editForm.photoUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hostel / Residential Address</label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save ID Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Report Lost ID */}
      {showReportLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Report Lost Physical ID Card</h3>
                <p className="text-xs text-slate-500">This will temporarily suspend your physical card RFID</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">Incident Details & Place of Loss</label>
              <textarea
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Describe where and when the card was misplaced..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReportLostModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReportLostSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Submit Report & Suspend Card
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
