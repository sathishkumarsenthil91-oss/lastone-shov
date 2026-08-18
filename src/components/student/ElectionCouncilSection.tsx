import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ElectionMember, StudentInquiry, ElectionCouncilRole } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { fetchElectionMembersApi, fetchInquiriesApi, submitInquiryApi, sendInquiryMessageApi } from '../../services/api';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { 
  Users, 
  Crown, 
  Send, 
  Camera, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  ArrowRight, 
  X, 
  Maximize2,
  AlertCircle,
  HelpCircle,
  FileText,
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ElectionCouncilSection: React.FC = () => {
  const { user, addNotification, switchCouncilMember } = useAuth();

  const [members, setMembers] = useState<ElectionMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<ElectionMember | null>(null);
  const [memberInquiries, setMemberInquiries] = useState<StudentInquiry[]>([]);
  const [activeInquiry, setActiveInquiry] = useState<StudentInquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chat message & live photo states
  const [chatMessage, setChatMessage] = useState('');
  const [chatPhotoUrl, setChatPhotoUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Live Camera Shoot modal
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraPurpose, setCameraPurpose] = useState<'NEW_GRIEVANCE' | 'CHAT_PHOTO'>('CHAT_PHOTO');

  // New Inquiry to Council Member Modal
  const [showNewInquiryModal, setShowNewInquiryModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<'ELECTION_COUNCIL' | 'CAMPUS_FACILITIES' | 'ACADEMIC' | 'HOSTEL_MESS'>('ELECTION_COUNCIL');
  const [isCreatingInquiry, setIsCreatingInquiry] = useState(false);

  // Fullscreen photo preview
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCouncilData();
  }, []);

  const loadCouncilData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchElectionMembersApi();
      setMembers(data);
      if (data.length > 0) {
        setSelectedMember(data[0]);
        loadInquiriesForMember(data[0].id);
      }
    } catch (e) {
      console.warn('Failed to load election members:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInquiriesForMember = async (memberId: string) => {
    try {
      const allInquiries = await fetchInquiriesApi({ targetCouncilMemberId: memberId });
      setMemberInquiries(allInquiries);
      if (allInquiries.length > 0) {
        setActiveInquiry(allInquiries[0]);
      } else {
        setActiveInquiry(null);
      }
    } catch (e) {
      console.warn('Failed to load member inquiries:', e);
    }
  };

  const handleSelectMember = (member: ElectionMember) => {
    setSelectedMember(member);
    loadInquiriesForMember(member.id);
  };

  const handlePhotoCaptured = (dataUrl: string) => {
    if (cameraPurpose === 'NEW_GRIEVANCE') {
      setNewPhotoUrl(dataUrl);
      addNotification('Live Photo Captured', 'Evidence photo attached to council grievance.', 'success');
    } else {
      setChatPhotoUrl(dataUrl);
      addNotification('Live Photo Captured', 'Photo ready to share in chat thread.', 'success');
    }
    setShowCameraModal(false);
  };

  const handleSendChatMessage = async () => {
    if (!activeInquiry && selectedMember) {
      // If no active thread exists yet, automatically create an inquiry thread with this message
      handleCreateInquiryDirect(chatMessage, chatPhotoUrl);
      return;
    }

    if (!activeInquiry || (!chatMessage.trim() && !chatPhotoUrl)) return;

    setIsSending(true);
    try {
      const payload = {
        senderId: user?.id || 'st-001',
        senderName: user?.name || 'Aarav Sharma',
        senderRole: (user?.role === 'STUDENT' ? 'STUDENT' : 'COUNCIL_MEMBER') as any,
        message: chatMessage,
        photoUrl: chatPhotoUrl || undefined
      };

      const result = await sendInquiryMessageApi(activeInquiry.id, payload);
      if (result.success && result.chatMessage) {
        const updated = {
          ...activeInquiry,
          chatThread: [...(activeInquiry.chatThread || []), result.chatMessage]
        };
        setActiveInquiry(updated);
        setMemberInquiries(prev => prev.map(i => i.id === updated.id ? updated : i));
        setChatMessage('');
        setChatPhotoUrl(null);
        addNotification('Message Transmitted', `Message and live photo sent to ${selectedMember?.name}.`, 'success');
      }
    } catch (e) {
      console.error(e);
      addNotification('Error', 'Failed to transmit message.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateInquiryDirect = async (msg: string, photo: string | null) => {
    if (!selectedMember || !msg.trim()) return;

    setIsSending(true);
    try {
      const payload: Partial<StudentInquiry> = {
        studentId: user?.studentId || 'st-001',
        studentName: user?.name || 'Aarav Sharma',
        registerNumber: user?.username?.toUpperCase() || '23CS001',
        department: (user?.departmentName?.includes('IT') ? 'IT' : user?.departmentName?.includes('AIDS') ? 'AIDS' : 'CSE') as any,
        targetAuthority: 'STUDENT_COUNCIL',
        targetCouncilMemberId: selectedMember.id,
        targetCouncilRole: selectedMember.role,
        category: 'ELECTION_COUNCIL',
        subject: `Direct Inquiry to ${selectedMember.designationTitle}`,
        message: msg,
        capturedPhotoUrl: photo || undefined,
        priority: 'MEDIUM'
      };

      const result = await submitInquiryApi(payload);
      if (result.success && result.inquiry) {
        setMemberInquiries(prev => [result.inquiry!, ...prev]);
        setActiveInquiry(result.inquiry);
        setChatMessage('');
        setChatPhotoUrl(null);
        addNotification('Council Inquiry Initiated', `Discussion opened with ${selectedMember.name}.`, 'success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateNewInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !newSubject.trim() || !newMessage.trim()) return;

    setIsCreatingInquiry(true);
    try {
      const payload: Partial<StudentInquiry> = {
        studentId: user?.studentId || 'st-001',
        studentName: user?.name || 'Aarav Sharma',
        registerNumber: user?.username?.toUpperCase() || '23CS001',
        department: (user?.departmentName?.includes('IT') ? 'IT' : user?.departmentName?.includes('AIDS') ? 'AIDS' : 'CSE') as any,
        targetAuthority: 'STUDENT_COUNCIL',
        targetCouncilMemberId: selectedMember.id,
        targetCouncilRole: selectedMember.role,
        category: newCategory as any,
        subject: newSubject,
        message: newMessage,
        capturedPhotoUrl: newPhotoUrl || undefined,
        priority: 'HIGH'
      };

      const result = await submitInquiryApi(payload);
      if (result.success && result.inquiry) {
        setMemberInquiries(prev => [result.inquiry!, ...prev]);
        setActiveInquiry(result.inquiry);
        setShowNewInquiryModal(false);
        setNewSubject('');
        setNewMessage('');
        setNewPhotoUrl(null);
        addNotification('Inquiry Submitted', `Direct inquiry transmitted to ${selectedMember.name}.`, 'success');
      }
    } catch (e) {
      console.error(e);
      addNotification('Error', 'Submission failed.', 'error');
    } finally {
      setIsCreatingInquiry(false);
    }
  };

  // Quick prompt templates
  const quickTemplates = [
    'Proposal: Request for 24-hour campus lab access before semester finals.',
    'Wi-Fi Speed: High packet drop observed in Block-B 3rd floor classrooms.',
    'Hackathon Approval: Inter-college technical symposium date coordination.',
    'Cafeteria Hygiene: Request for regular inspection of hostel mess facilities.'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>SHOV College Student Democratic Senate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Student Election Council & Office Bearers</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Connect directly with your elected student representatives. Chat live, report campus grievances, and transmit <strong>live camera photo evidence</strong> to your council members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'ELECTION_COUNCIL' ? (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Logged in as {user.name} ({user.designation?.replace(/^\d+\s*-\s*/, '') || 'Council'})</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (selectedMember) {
                    const matchedUser = INITIAL_USERS.find(u => u.councilMemberId === selectedMember.id);
                    if (matchedUser) {
                      switchCouncilMember(selectedMember.id);
                    } else {
                      switchCouncilMember('em-1');
                    }
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Log In as {selectedMember ? selectedMember.name.split(' ')[0] : 'Council'}</span>
              </button>
            )}

            <button
              onClick={() => setShowNewInquiryModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Inquire with {selectedMember?.designationTitle || 'Council'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Official Election Members Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>The 6 Elected Council Office Bearers</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">Click any member to open live chat & inquiry ledger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {members.map((member) => {
            const isSelected = selectedMember?.id === member.id;
            return (
              <div
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 shadow-lg ring-2 ring-amber-500/30 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Designation Ribbon */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black tracking-wide uppercase">
                      {member.designationTitle}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${member.status === 'ONLINE' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-amber-500'}`} />
                  </div>

                  {/* Photo & Name */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-slate-200 dark:ring-slate-700">
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        {member.department} • Year {member.year}
                      </p>
                    </div>
                  </div>

                  {/* Manifesto snippet */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic leading-relaxed text-center">
                    "{member.manifesto}"
                  </p>
                </div>

                {/* Footer stats */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Inquiries: <strong className="text-amber-600 dark:text-amber-400">{member.activeInquiriesCount} active</strong></span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Chat →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Member Deep-Dive & Live Interactive Chat / Photo Stream */}
      {selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Elected Member Profile & Office Hours (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md ring-2 ring-amber-500/30"
                />
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">
                    {selectedMember.designationTitle}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {selectedMember.registerNumber} • Dept: {selectedMember.department}
                  </p>
                </div>
              </div>

              {/* Manifesto & Key Agenda */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Electoral Manifesto & Core Agenda</span>
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{selectedMember.manifesto}"
                </p>
              </div>

              {/* Office Hours & Contact */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Office Hours: <strong>{selectedMember.officeHours}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">{selectedMember.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{selectedMember.phone}</span>
                </div>
              </div>

              {/* Committee Badges */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Senate Portfolios</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.badges.map((b, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Inquiry Button */}
              <button
                onClick={() => setShowNewInquiryModal(true)}
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Grievance with Live Photo</span>
              </button>

            </div>

            {/* Quick Templates Box */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>One-Click Council Grievance Starters</span>
              </span>
              <div className="space-y-1.5">
                {quickTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setChatMessage(tmpl)}
                    className="w-full p-2 text-left rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 transition-colors line-clamp-1 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                  >
                    • {tmpl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Chat & Photo Transmission Room (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col h-[640px]">
              
              {/* Chat Room Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={selectedMember.photoUrl} alt={selectedMember.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/20" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Live Direct Channel — {selectedMember.designationTitle}</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {selectedMember.name} • Direct Senate Representation Channel
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCameraPurpose('CHAT_PHOTO');
                      setShowCameraModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snap Photo</span>
                  </button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {/* Welcome Message Card */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Official Student Council Office of {selectedMember.designationTitle}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Hello! I'm {selectedMember.name}. Please share any grievances, proposals, or campus feedback below. You can take a <strong>live camera photo snapshot</strong> using the camera button to send visual proof directly.
                  </p>
                </div>

                {/* Conversation History */}
                {activeInquiry?.chatThread && activeInquiry.chatThread.length > 0 ? (
                  activeInquiry.chatThread.map((msg) => {
                    const isStudent = msg.senderRole === 'STUDENT';
                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isStudent
                            ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 ml-6'
                            : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {msg.senderName}
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${
                              isStudent ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-amber-500 text-slate-950'
                            }`}>
                              {isStudent ? 'Student' : selectedMember.designationTitle}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {msg.message}
                        </p>

                        {msg.photoUrl && (
                          <div className="mt-2.5">
                            <img
                              src={msg.photoUrl}
                              alt="Live evidence"
                              onClick={() => setPreviewPhotoUrl(msg.photoUrl || null)}
                              className="max-h-48 rounded-xl object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="font-bold text-slate-600 dark:text-slate-400">No active thread yet with {selectedMember.name}</p>
                    <p className="text-[11px] text-slate-400">Send your first message or inquiry proposal below to begin.</p>
                  </div>
                )}
              </div>

              {/* Chat Input Capsule with Live Photo Shoot */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                {chatPhotoUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                    <img src={chatPhotoUrl} alt="Attached live photo" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Live Photo Shoot Attached</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">Will be shared in this council thread</p>
                    </div>
                    <button
                      onClick={() => setChatPhotoUrl(null)}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraPurpose('CHAT_PHOTO');
                      setShowCameraModal(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0"
                    title="Shoot live camera photo proof"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${selectedMember.designationTitle} (${selectedMember.name})...`}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    className="flex-1 px-4 py-3 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <button
                    type="button"
                    onClick={handleSendChatMessage}
                    disabled={isSending || (!chatMessage.trim() && !chatPhotoUrl)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUBMIT DIRECT GRIEVANCE TO MEMBER */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showNewInquiryModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Submit Inquiry to {selectedMember.designationTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Representative: <strong>{selectedMember.name}</strong> ({selectedMember.department})
                  </p>
                </div>
                <button
                  onClick={() => setShowNewInquiryModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewInquirySubmit} className="p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Grievance Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="ELECTION_COUNCIL">Student Council Policy & Events</option>
                    <option value="CAMPUS_FACILITIES">Campus Infrastructure & Wi-Fi</option>
                    <option value="ACADEMIC">Academic Labs & Library</option>
                    <option value="HOSTEL_MESS">Hostel & Cafeteria</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Subject / Agenda</label>
                  <input
                    type="text"
                    placeholder="E.g., Request for additional GPU hours in AIDS Lab 2..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Detailed Message</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the issue, requested action, and how the Student Council can assist..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Live Camera Photo Proof */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      <span>Attach Live Photo Proof</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraPurpose('NEW_GRIEVANCE');
                        setShowCameraModal(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-[11px] cursor-pointer"
                    >
                      {newPhotoUrl ? 'Re-take Photo' : 'Take Live Photo'}
                    </button>
                  </div>

                  {newPhotoUrl && (
                    <div className="relative rounded-xl overflow-hidden max-h-36 border border-slate-200 dark:border-slate-700">
                      <img src={newPhotoUrl} alt="Captured photo" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewPhotoUrl(null)}
                        className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewInquiryModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingInquiry}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isCreatingInquiry ? 'Sending...' : 'Transmit to Council'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: LIVE CAMERA CAPTURE */}
      {/* ========================================================= */}
      <LiveCameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handlePhotoCaptured}
        title="Live Council Grievance Camera Photo Shoot"
        subtitle="Capture facility proof, timetable issue, or student ID proof in the frame"
        aspectRatio="wide"
      />

      {/* ========================================================= */}
      {/* MODAL: FULLSCREEN PHOTO PREVIEW */}
      {/* ========================================================= */}
      <AnimatePresence>
        {previewPhotoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center">
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewPhotoUrl}
                alt="Fullscreen evidence view"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
