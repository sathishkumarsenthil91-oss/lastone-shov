import React, { useState } from 'react';
import { StaffHodMessage, DepartmentCode } from '../../types';
import { INITIAL_STAFF_HOD_MESSAGES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  User, 
  FileText,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

export const StaffHodCommunication: React.FC = () => {
  const { user, addNotification } = useAuth();
  const [messages, setMessages] = useState<StaffHodMessage[]>(INITIAL_STAFF_HOD_MESSAGES);
  
  // Compose message state
  const [targetDept, setTargetDept] = useState<DepartmentCode>('CSE');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [incidentType, setIncidentType] = useState<StaffHodMessage['incidentType']>('GATE_ENTRY_FLAG');
  const [selectedFilterDept, setSelectedFilterDept] = useState<string>('ALL');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageText.trim()) return;

    const newMessage: StaffHodMessage = {
      id: `shm-${Date.now()}`,
      senderStaffId: user?.id || 'u-staff-1',
      senderStaffName: user?.name || 'Security Staff Officer',
      senderRole: 'Main Gate Security & Turnstile Desk',
      targetDepartmentCode: targetDept,
      subject: subject.trim(),
      message: messageText.trim(),
      studentRegisterNo: studentRegNo.trim() || undefined,
      studentName: studentName.trim() || undefined,
      incidentType,
      timestamp: 'Just now',
      status: 'PENDING_HOD_REVIEW'
    };

    setMessages([newMessage, ...messages]);
    setSubject('');
    setMessageText('');
    setStudentRegNo('');
    setStudentName('');
    addNotification('Dispatched to HOD', `Report sent to Head of Department (${targetDept}).`, 'success');
  };

  const filteredMessages = selectedFilterDept === 'ALL' 
    ? messages 
    : messages.filter(m => m.targetDepartmentCode === selectedFilterDept);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-wider font-mono">
            <Building2 className="w-3.5 h-3.5" />
            <span>STAFF ⇄ HOD DIRECT DESK</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Security & Staff Direct Channel to Department Heads
          </h2>
          <p className="text-xs text-slate-400">
            Transmit gate entry incidents, late arrival alerts, emergency pass approvals, and lab access clearances directly to HODs.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[120px] shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Inquiries</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            {messages.filter(m => m.status === 'PENDING_HOD_REVIEW').length} Pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Compose Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Dispatch Notice / Flag to HOD
            </h3>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
            {/* Target Department */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Department HOD <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value as DepartmentCode)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="CSE">Computer Science & Engineering (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                <option value="ECE">Electronics & Communication (ECE)</option>
                <option value="EEE">Electrical & Electronics (EEE)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
                <option value="CIVIL">Civil Engineering (CIVIL)</option>
              </select>
            </div>

            {/* Incident Type */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Category
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="GATE_ENTRY_FLAG">Gate Entry Flag / No Physical ID</option>
                <option value="UNAUTHORIZED_ABSENCE">Late Arrival / Curfew Violation</option>
                <option value="GATE_PASS_VERIFICATION">Outpass / Bus Departure Verification</option>
                <option value="DISCIPLINE_ISSUE">Campus Disciplinary Matter</option>
                <option value="GENERAL_INQUIRY">General Department Coordination</option>
              </select>
            </div>

            {/* Student Particulars (Optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Reg No</label>
                <input
                  type="text"
                  placeholder="e.g. 23CS001"
                  value={studentRegNo}
                  onChange={(e) => setStudentRegNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Subject Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Brief summary of gate event..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Detailed Message */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Report & Specific Request <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Provide turnstile location, biometric verification status, and reason..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Official Dispatch to HOD</span>
            </button>
          </form>
        </div>

        {/* Right Column: Communications Thread & HOD Responses */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Dispatched Reports & HOD Responses ({filteredMessages.length})</span>
            </h3>

            {/* Filter by Department */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedFilterDept}
                onChange={(e) => setSelectedFilterDept(e.target.value)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Depts</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="AIDS">AIDS</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No communication logs found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-black text-[10px]">
                          DEPT: {msg.targetDepartmentCode}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          msg.status === 'REVIEWED' || msg.status === 'ACTION_TAKEN'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}>
                          {msg.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {msg.timestamp}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white pt-0.5">
                        {msg.subject}
                      </h4>
                    </div>

                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl shrink-0">
                      {msg.incidentType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {msg.message}
                  </p>

                  {/* Student Tag if present */}
                  {msg.studentRegisterNo && (
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-blue-600 dark:text-blue-400">Target Student:</span>
                      <span>{msg.studentName || 'Student'} ({msg.studentRegisterNo})</span>
                    </div>
                  )}

                  {/* HOD Reply Box */}
                  {msg.hodReply ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          HOD Response ({msg.targetDepartmentCode})
                        </span>
                        <span className="text-[10px] text-emerald-600 font-mono">{msg.hodRepliedAt}</span>
                      </div>
                      <p className="text-xs text-emerald-900 dark:text-emerald-100 font-medium">
                        "{msg.hodReply}"
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium pt-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Awaiting response & clearance from HOD {msg.targetDepartmentCode}...</span>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
