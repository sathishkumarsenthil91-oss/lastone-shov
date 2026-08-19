import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEPARTMENTS, INITIAL_STUDENTS, INITIAL_USERS } from '../../data/mockData';
import { RoleLiveVerifiedBadge } from '../common/RoleLiveVerifiedBadge';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  FileText, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Sparkles, 
  Filter, 
  Download,
  Landmark,
  Crown,
  Lock,
  Radio,
  Search,
  Check
} from 'lucide-react';

interface PrincipalBroadcast {
  id: string;
  circularNo: string;
  title: string;
  category: 'ACADEMIC' | 'INSTITUTIONAL' | 'REGULATORY' | 'HOLIDAY' | 'EMERGENCY';
  targetAudience: 'ALL_CAMPUS' | 'ALL_FACULTY' | 'ALL_STUDENTS' | 'HODS_AND_VPS';
  content: string;
  date: string;
  signatory: string;
  isUrgent?: boolean;
}

const INITIAL_PRINCIPAL_BROADCASTS: PrincipalBroadcast[] = [
  {
    id: 'pb-1',
    circularNo: 'AVSCT/PRIN/2026/042',
    title: 'Autonomous Accreditation & Anna University Compliance Verification',
    category: 'REGULATORY',
    targetAudience: 'ALL_CAMPUS',
    content: 'All departments (CSE, IT, AIDS) are required to finalize syllabus restructuring for the upcoming academic cycle. Anna University inspection team visit scheduled.',
    date: '18 Aug 2026',
    signatory: 'Dr. J. Davis, Principal',
    isUrgent: false
  },
  {
    id: 'pb-2',
    circularNo: 'AVSCT/PRIN/2026/041',
    title: 'Mandatory Digital ID Card Verification at Central Gate Turnstiles',
    category: 'INSTITUTIONAL',
    targetAudience: 'ALL_STUDENTS',
    content: 'Effective immediately, all students and faculty must display the SHOV Digital ID card at gatehouse checkpoints. Security officers are authorized for biometric verification.',
    date: '16 Aug 2026',
    signatory: 'Dr. J. Davis, Principal',
    isUrgent: true
  },
  {
    id: 'pb-3',
    circularNo: 'AVSCT/PRIN/2026/040',
    title: 'Annual Tech Symposium "TECH-PULSE 2026" Approval',
    category: 'ACADEMIC',
    targetAudience: 'ALL_CAMPUS',
    content: 'Approval granted for inter-college technical hackathon with cash prize pool of ₹2,50,000. Department HODs to coordinate student council leads.',
    date: '12 Aug 2026',
    signatory: 'Dr. J. Davis, Principal',
    isUrgent: false
  }
];

export const PrincipalDedicatedSection: React.FC = () => {
  const { user, addNotification } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'broadcasts' | 'departments' | 'faculty' | 'accreditation'>('overview');
  const [broadcasts, setBroadcasts] = useState<PrincipalBroadcast[]>(INITIAL_PRINCIPAL_BROADCASTS);
  
  // New Broadcast Modal Form
  const [showNewBroadcast, setShowNewBroadcast] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'ACADEMIC' | 'INSTITUTIONAL' | 'REGULATORY' | 'HOLIDAY' | 'EMERGENCY'>('INSTITUTIONAL');
  const [newTarget, setNewTarget] = useState<'ALL_CAMPUS' | 'ALL_FACULTY' | 'ALL_STUDENTS' | 'HODS_AND_VPS'>('ALL_CAMPUS');
  const [newContent, setNewContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Institutional metrics
  const totalStudents = INITIAL_STUDENTS.length + 1150;
  const totalDepartments = INITIAL_DEPARTMENTS.length;
  const activeStaff = INITIAL_USERS.filter(u => u.role === 'STAFF' || u.role === 'HOD' || u.role === 'VICE_PRINCIPAL').length + 45;

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      addNotification('Missing Information', 'Please provide a title and notice content.', 'warning');
      return;
    }

    const newBroadcast: PrincipalBroadcast = {
      id: `pb-${Date.now()}`,
      circularNo: `AVSCT/PRIN/2026/${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      category: newCategory,
      targetAudience: newTarget,
      content: newContent,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      signatory: 'Dr. J. Davis, Principal',
      isUrgent
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setNewTitle('');
    setNewContent('');
    setIsUrgent(false);
    setShowNewBroadcast(false);
    addNotification('Principal Notice Published', `Circular ${newBroadcast.circularNo} broadcasted to ${newTarget}.`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. PRINCIPAL COMMAND BANNER */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider font-mono">
                <Landmark className="w-3.5 h-3.5" />
                <span>OFFICE OF THE PRINCIPAL • EXECUTIVE DESK</span>
              </div>
              <RoleLiveVerifiedBadge role="PRINCIPAL" size="sm" customLabel="LIVE VERIFIED PRINCIPAL" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AVS College of Technology
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai. Institutional Command, Departmental Governance & Autonomous Policy Execution.
            </p>
            <div className="pt-1 flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Principal: Dr. J. Davis, M.E., Ph.D.
              </span>
              <span>•</span>
              <span>Campus Code: 6107</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> NAAC 'A+' Accredited
              </span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowNewBroadcast(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Executive Circular</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-mono text-center">
              Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLS */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Campus Executive Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'broadcasts'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Principal Circulars & Orders ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Departments Oversight ({totalDepartments})</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'faculty'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Faculty & Staff Register</span>
        </button>

        <button
          onClick={() => setActiveTab('accreditation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'accreditation'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Accreditation & AICTE</span>
        </button>
      </div>

      {/* 3. TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">Total Enrolled</span>
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● Active Student Bodies</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">Faculty & Staff</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{activeStaff}</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">● HODs, Deans & Security</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">Departments</span>
                <Building2 className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">CSE, IT, AIDS</p>
              <p className="text-[10px] text-slate-500 font-medium">B.E. & B.Tech Degrees</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">Gate Compliance</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">99.4%</p>
              <p className="text-[10px] text-slate-500 font-medium">Digital ID Verification Rate</p>
            </div>
          </div>

          {/* Department Breakdown & Institutional Directives */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Department Summaries */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Departmental Performance & HOD Leadership</span>
                </h2>
              </div>

              <div className="space-y-3">
                {INITIAL_DEPARTMENTS.map((dept) => (
                  <div key={dept.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 font-mono text-sm">
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          HOD: <strong className="text-slate-800 dark:text-slate-200">{dept.hodName}</strong> ({dept.hodEmail})
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                        {dept.studentCount} Students
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-bold">● Active Status</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Principal Directives & Quick Controls */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Executive Protocols & Gatehouse Security</span>
              </h2>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase">Campus Digital Turnstiles</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">ONLINE</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Live RFID & Biometric scanner gates active at Main Gatehouse & Academic Block A.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Curfew & Late Entry Rule</span>
                    <span className="text-xs font-bold text-amber-600">9:00 PM</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Late entries flagged automatically to Chief Proctor & Proctorial Board.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      addNotification('Gate Pass Verification Requested', 'Live sync with turnstile logs completed.', 'info');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Run Gate Sync Audit</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. TAB 2: BROADCASTS & CIRCULARS */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Official Orders & Principal Circulars ({broadcasts.length})
            </h2>
            <button
              onClick={() => setShowNewBroadcast(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Draft New Circular</span>
            </button>
          </div>

          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-950 text-white text-[10px] font-black font-mono">
                      {b.circularNo}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Issued: {b.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider">
                        HIGH PRIORITY
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      Audience: {b.targetAudience.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.title}</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{b.content}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100 dark:border-slate-800/60">
                  <span>Signatory: <strong className="text-slate-800 dark:text-slate-200">{b.signatory}</strong></span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Official Seal Attached
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: DEPARTMENTS OVERSIGHT */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Academic Departments Directory & Accreditation Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INITIAL_DEPARTMENTS.map((d) => (
              <div key={d.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs font-mono">
                    DEPT OF {d.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">NBA Accredited</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{d.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{d.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Head of Department:</p>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold">{d.hodName}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{d.hodEmail}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{d.hodPhone}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Student Strength:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{d.studentCount} Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: FACULTY & STAFF REGISTER */}
      {activeTab === 'faculty' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Institutional Leadership & Faculty Directory
            </h2>
            <span className="text-xs font-bold text-slate-500">AVS College of Technology</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_USERS.filter(u => u.role !== 'STUDENT' && u.role !== 'ELECTION_COUNCIL').map((member) => (
              <div key={member.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                <img
                  src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={member.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <div className="space-y-0.5 overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">{member.designation || member.role}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 5: ACCREDITATION & AICTE */}
      {activeTab === 'accreditation' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Accreditation, Affiliation & Statutory Clearances</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-950 text-white text-[10px] font-black uppercase">AICTE APPROVAL</span>
                <p className="text-sm font-bold text-blue-950 dark:text-blue-100">All India Council for Technical Education</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Order Ref: F.No. Southern/1-93184/2026/EOA</p>
                <p className="text-[11px] text-emerald-600 font-bold">● Valid through 2027 Academic Year</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1.5">
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-white text-[10px] font-black uppercase">ANNA UNIVERSITY</span>
                <p className="text-sm font-bold text-purple-950 dark:text-purple-100">Affiliation & Degree Granting</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Affiliation Code: 6107 (Zone 8)</p>
                <p className="text-[11px] text-emerald-600 font-bold">● Permanent Affiliation for CSE, IT, AIDS</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-white text-[10px] font-black uppercase">NAAC ACCREDITATION</span>
                <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">National Assessment and Accreditation Council</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Grade: A+ (CGPA 3.52 / 4.00)</p>
                <p className="text-[11px] text-emerald-600 font-bold">● Valid Cycle: 2024–2029</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: DRAFT PRINCIPAL CIRCULAR */}
      {showNewBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-950 text-white flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Issue Principal Circular</h3>
                  <p className="text-[10px] text-slate-500">AVS College of Technology • Official Institutional Directive</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewBroadcast(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Circular Title / Subject</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule for Anna University Semester Practicals"
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="INSTITUTIONAL">Institutional</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="REGULATORY">Regulatory / AICTE</option>
                    <option value="HOLIDAY">Holiday Notice</option>
                    <option value="EMERGENCY">Emergency Order</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="ALL_CAMPUS">Entire College (Faculty & Students)</option>
                    <option value="ALL_STUDENTS">All Students Only</option>
                    <option value="ALL_FACULTY">All Faculty & Staff</option>
                    <option value="HODS_AND_VPS">HODs & Vice Principal Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Enter official executive directive text to be circulated across AVS College..."
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="urgentCheck" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Flag as Mandatory & Urgent Action Item
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewBroadcast(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Circular</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
