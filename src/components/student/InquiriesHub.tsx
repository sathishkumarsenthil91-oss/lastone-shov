import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentInquiry, AuthorityTarget, DepartmentCode, InquiryCategory, ElectionCouncilRole } from '../../types';
import { fetchInquiriesApi, submitInquiryApi, sendInquiryMessageApi, updateInquiryStatusApi } from '../../services/api';
import { fetchInquiriesFromSupabase, createInquiryInSupabase } from '../../services/campusSupabaseService';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { uploadToSupabaseStorage, deleteFileFromStorage } from '../../services/storageService';
import { supabase } from '../../services/supabase';
import { 
  Send, 
  Camera, 
  Paperclip, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Building2, 
  ShieldCheck, 
  Crown, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  User,
  ArrowUpRight,
  Maximize2,
  X,
  RefreshCw,
  FileCheck,
  Upload,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InquiriesHubProps {
  defaultAuthority?: AuthorityTarget;
  defaultCouncilMemberId?: string;
  defaultCouncilRole?: ElectionCouncilRole;
}

export const InquiriesHub: React.FC<InquiriesHubProps> = ({
  defaultAuthority,
  defaultCouncilMemberId,
  defaultCouncilRole
}) => {
  const { user, addNotification } = useAuth();

  const [inquiries, setInquiries] = useState<StudentInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<StudentInquiry | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [authorityFilter, setAuthorityFilter] = useState<string>(defaultAuthority || 'ALL');

  // New Inquiry Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetAuthority, setTargetAuthority] = useState<AuthorityTarget>(defaultAuthority || 'HOD');
  const [targetDepartmentCode, setTargetDepartmentCode] = useState<DepartmentCode>('CSE');
  const [category, setCategory] = useState<InquiryCategory>('ACADEMIC');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Camera Shoot Modals
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraContext, setCameraContext] = useState<'NEW_INQUIRY' | 'CHAT_REPLY'>('NEW_INQUIRY');

  // Thread Reply Message State
  const [replyMessage, setReplyMessage] = useState('');
  const [replyPhotoUrl, setReplyPhotoUrl] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Photo Fullscreen Preview Modal
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Authority Action State (For HOD/VP/Admin)
  const isAuthorityUser = user?.role === 'HOD' || user?.role === 'VICE_PRINCIPAL' || user?.role === 'ADMIN' || user?.role === 'STAFF';
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<'IN_REVIEW' | 'RESOLVED' | 'REJECTED'>('RESOLVED');

  useEffect(() => {
    loadInquiries();
  }, [user]);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (user?.role === 'STUDENT') {
        filters.studentId = user?.studentId || 'st-001';
      } else if (user?.role === 'HOD') {
        filters.targetAuthority = 'HOD';
      } else if (user?.role === 'VICE_PRINCIPAL') {
        filters.targetAuthority = 'VICE_PRINCIPAL';
      }

      // Fetch from Supabase directly
      const dbData = await fetchInquiriesFromSupabase(filters);
      if (dbData && dbData.length > 0) {
        setInquiries(dbData);
        if (!selectedInquiry) {
          setSelectedInquiry(dbData[0]);
        }
      } else {
        const data = await fetchInquiriesApi(filters);
        setInquiries(data);
        if (data.length > 0 && !selectedInquiry) {
          setSelectedInquiry(data[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load inquiries', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoCaptured = async (dataUrl: string) => {
    setShowCameraModal(false);
    if (cameraContext === 'NEW_INQUIRY') {
      const uploadRes = await uploadToSupabaseStorage(dataUrl, {
        featureName: 'inquiries',
        itemId: 'evidence',
        fileName: 'inquiry_proof',
        expiresInSeconds: 60 * 60 * 24 * 7
      });
      setCapturedPhotoUrl(uploadRes.signedUrl || dataUrl);
      addNotification('Live Photo Captured', 'Evidence photo uploaded to private storage.', 'success');
    } else {
      const uploadRes = await uploadToSupabaseStorage(dataUrl, {
        featureName: 'inquiries',
        itemId: selectedInquiry?.id || 'reply',
        fileName: 'reply_proof',
        expiresInSeconds: 60 * 60 * 24 * 7
      });
      setReplyPhotoUrl(uploadRes.signedUrl || dataUrl);
      addNotification('Live Photo Captured', 'Photo uploaded and ready to share.', 'success');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, context: 'NEW_INQUIRY' | 'CHAT_REPLY') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadRes = await uploadToSupabaseStorage(file, {
      featureName: 'inquiries',
      itemId: context === 'NEW_INQUIRY' ? 'evidence' : (selectedInquiry?.id || 'reply'),
      fileName: file.name,
      expiresInSeconds: 60 * 60 * 24 * 7
    });

    if (context === 'NEW_INQUIRY') {
      setCapturedPhotoUrl(uploadRes.signedUrl || '');
      addNotification('File Attached', 'Document / Photo uploaded to Supabase Storage.', 'success');
    } else {
      setReplyPhotoUrl(uploadRes.signedUrl || '');
      addNotification('File Attached', 'Document / Photo ready to send.', 'success');
    }
  };

  const handleDeleteCapturedPhoto = async () => {
    if (capturedPhotoUrl) {
      await deleteFileFromStorage(capturedPhotoUrl);
      setCapturedPhotoUrl(null);
      addNotification('Photo Removed', 'Attachment deleted from private storage.', 'info');
    }
  };

  const handleDeleteReplyPhoto = async () => {
    if (replyPhotoUrl) {
      await deleteFileFromStorage(replyPhotoUrl);
      setReplyPhotoUrl(null);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      addNotification('Missing Information', 'Please provide a subject and detailed message.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhoto = capturedPhotoUrl;
      if (finalPhoto && (finalPhoto.startsWith('data:') || finalPhoto.startsWith('blob:'))) {
        const uploadRes = await uploadToSupabaseStorage(finalPhoto, {
          featureName: 'inquiries',
          itemId: 'evidence',
          fileName: 'proof'
        });
        if (uploadRes.signedUrl) finalPhoto = uploadRes.signedUrl;
      }

      const payload: Partial<StudentInquiry> = {
        studentId: user?.studentId || 'st-001',
        studentName: user?.name || 'Aarav Sharma',
        registerNumber: user?.username?.toUpperCase() || '23CS001',
        department: (user?.departmentName?.includes('IT') ? 'IT' : user?.departmentName?.includes('AIDS') ? 'AIDS' : 'CSE') as DepartmentCode,
        targetAuthority,
        targetDepartmentCode: targetAuthority === 'HOD' ? targetDepartmentCode : undefined,
        targetCouncilMemberId: defaultCouncilMemberId,
        targetCouncilRole: defaultCouncilRole,
        category,
        subject,
        message,
        capturedPhotoUrl: finalPhoto || undefined,
        priority
      };

      // Save to Supabase database
      const dbRes = await createInquiryInSupabase(payload);
      if (dbRes.success && dbRes.inquiry) {
        setInquiries(prev => [dbRes.inquiry!, ...prev]);
        setSelectedInquiry(dbRes.inquiry);
        setShowCreateModal(false);
        setSubject('');
        setMessage('');
        setCapturedPhotoUrl(null);
        addNotification('Inquiry Dispatched', `Your inquiry has been submitted to ${targetAuthority} and saved to Supabase cloud.`, 'success');
        // also notify backend server
        submitInquiryApi(payload).catch(() => {});
      } else {
        const result = await submitInquiryApi(payload);
        if (result.success && result.inquiry) {
          setInquiries(prev => [result.inquiry!, ...prev]);
          setSelectedInquiry(result.inquiry);
          setShowCreateModal(false);
          setSubject('');
          setMessage('');
          setCapturedPhotoUrl(null);
          addNotification('Inquiry Dispatched', `Your inquiry has been submitted to ${targetAuthority} with private storage attachments.`, 'success');
        } else {
          addNotification('Submission Failed', result.error || 'Unable to submit inquiry.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      addNotification('Error', 'An unexpected error occurred during submission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || (!replyMessage.trim() && !replyPhotoUrl)) return;

    setIsSendingReply(true);
    try {
      let finalReplyPhoto = replyPhotoUrl;
      if (finalReplyPhoto && (finalReplyPhoto.startsWith('data:') || finalReplyPhoto.startsWith('blob:'))) {
        const uploadRes = await uploadToSupabaseStorage(finalReplyPhoto, {
          featureName: 'inquiries',
          itemId: selectedInquiry.id,
          fileName: 'reply_attachment'
        });
        if (uploadRes.signedUrl) finalReplyPhoto = uploadRes.signedUrl;
      }

      const payload = {
        senderId: user?.id || 'st-001',
        senderName: user?.name || 'Student',
        senderRole: (user?.role === 'STUDENT' ? 'STUDENT' : user?.role === 'HOD' ? 'HOD' : user?.role === 'VICE_PRINCIPAL' ? 'VICE_PRINCIPAL' : 'ADMIN') as any,
        message: replyMessage,
        photoUrl: finalReplyPhoto || undefined
      };

      const result = await sendInquiryMessageApi(selectedInquiry.id, payload);
      if (result.success && result.chatMessage) {
        const updated = {
          ...selectedInquiry,
          chatThread: [...(selectedInquiry.chatThread || []), result.chatMessage],
          status: user?.role !== 'STUDENT' && selectedInquiry.status === 'PENDING' ? 'IN_REVIEW' as const : selectedInquiry.status
        };
        setSelectedInquiry(updated);
        setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i));
        setReplyMessage('');
        setReplyPhotoUrl(null);
        addNotification('Message Sent', 'Your reply has been added to the inquiry thread.', 'success');
      }
    } catch (e) {
      console.error(e);
      addNotification('Error', 'Could not send message.', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (status: 'IN_REVIEW' | 'RESOLVED' | 'REJECTED') => {
    if (!selectedInquiry) return;
    try {
      const payload = {
        status,
        adminResponse: resolutionNote || `Inquiry marked as ${status} by ${user?.name || 'Authority'}`,
        responderName: user?.name || 'Academic Authority',
        responderRole: user?.role || 'VICE_PRINCIPAL'
      };

      const result = await updateInquiryStatusApi(selectedInquiry.id, payload);
      if (result.success && result.inquiry) {
        setSelectedInquiry(result.inquiry);
        setInquiries(prev => prev.map(i => i.id === result.inquiry!.id ? result.inquiry! : i));
        setResolutionNote('');
        addNotification('Status Updated', `Inquiry status changed to ${status}.`, 'success');
      }
    } catch (e) {
      console.error(e);
      addNotification('Error', 'Failed to update status.', 'error');
    }
  };

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = inq.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inq.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inq.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    const matchesAuth = authorityFilter === 'ALL' || inq.targetAuthority === authorityFilter;
    return matchesSearch && matchesStatus && matchesAuth;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>Official Institutional Inquiries & Grievances</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Direct Inquiry Gateway
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Submit formal inquiries, fine appeals, and academic requests directly to the <strong>Head of Department (HOD)</strong>, <strong>Vice Principal (VP)</strong>, or <strong>Student Election Council</strong> with instant live camera photo proof.
            </p>
          </div>

          {/* New Inquiry Action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Inquiry</span>
            </button>
            <button
              onClick={loadInquiries}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              title="Refresh Inquiries"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Inquiries List & Right Active Discussion Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Filter & Inquiries List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inquiries or students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 w-full no-scrollbar">
                {['ALL', 'PENDING', 'IN_REVIEW', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 w-full no-scrollbar">
                {[
                  { id: 'ALL', label: 'All Targets' },
                  { id: 'HOD', label: 'HOD' },
                  { id: 'VICE_PRINCIPAL', label: 'Vice Principal' },
                  { id: 'STUDENT_COUNCIL', label: 'Student Council' }
                ].map((auth) => (
                  <button
                    key={auth.id}
                    onClick={() => setAuthorityFilter(auth.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                      authorityFilter === auth.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {auth.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Inquiries */}
          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading inquiry records...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Inquiries Found</p>
                <p className="text-[11px] text-slate-400">Click "Create New Inquiry" above to submit a request to HOD, VP, or Council.</p>
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = selectedInquiry?.id === inq.id;
                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          inq.targetAuthority === 'VICE_PRINCIPAL'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : inq.targetAuthority === 'HOD'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}>
                          {inq.targetAuthority === 'VICE_PRINCIPAL' ? 'VP Suite' : inq.targetAuthority === 'HOD' ? `HOD (${inq.targetDepartmentCode || inq.department})` : 'Council'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {inq.category.replace('_', ' ')}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inq.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : inq.status === 'IN_REVIEW'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {inq.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {inq.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {inq.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <span className="font-semibold">{inq.studentName} ({inq.registerNumber})</span>
                      <div className="flex items-center gap-2">
                        {inq.capturedPhotoUrl && (
                          <span className="inline-flex items-center gap-1 text-blue-500 font-bold">
                            <Camera className="w-3 h-3" />
                            <span>Photo</span>
                          </span>
                        )}
                        <span>{inq.createdAt.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Inquiry Thread & Actions (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedInquiry ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Inquiry Header Detail */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      selectedInquiry.targetAuthority === 'VICE_PRINCIPAL'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                        : selectedInquiry.targetAuthority === 'HOD'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      Target: {selectedInquiry.targetAuthority === 'VICE_PRINCIPAL' ? 'Vice Principal Executive Office' : selectedInquiry.targetAuthority === 'HOD' ? `HOD Office (${selectedInquiry.targetDepartmentCode || selectedInquiry.department})` : 'Student Election Council'}
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedInquiry.status === 'RESOLVED'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : selectedInquiry.status === 'IN_REVIEW'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        : 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                    }`}>
                      {selectedInquiry.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    ID: {selectedInquiry.id} • {selectedInquiry.createdAt}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {selectedInquiry.subject}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>Student: <strong>{selectedInquiry.studentName}</strong> ({selectedInquiry.registerNumber})</span>
                  <span>•</span>
                  <span>Dept: <strong>{selectedInquiry.department}</strong></span>
                  <span>•</span>
                  <span>Category: <strong>{selectedInquiry.category.replace('_', ' ')}</strong></span>
                </div>

                {/* Primary Evidence Photo Preview if available */}
                {selectedInquiry.capturedPhotoUrl && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        <span>Live Biometric / Inquiry Photo Shoot Evidence</span>
                      </span>
                      <button
                        onClick={() => setPreviewPhotoUrl(selectedInquiry.capturedPhotoUrl || null)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>View Full Size</span>
                      </button>
                    </div>
                    <div className="relative rounded-xl overflow-hidden max-h-56 bg-slate-950 flex items-center justify-center">
                      <img
                        src={selectedInquiry.capturedPhotoUrl}
                        alt="Inquiry live photo proof"
                        className="object-contain max-h-56 w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewPhotoUrl(selectedInquiry.capturedPhotoUrl || null)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Discussion / Response Messages Thread */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Official Inquiry Message Ledger</span>
                </h3>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {selectedInquiry.chatThread && selectedInquiry.chatThread.length > 0 ? (
                    selectedInquiry.chatThread.map((msg) => {
                      const isStudent = msg.senderRole === 'STUDENT';
                      return (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isStudent
                              ? 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 ml-4 sm:ml-8'
                              : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 mr-4 sm:mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {msg.senderName}
                              </span>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                isStudent ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-blue-600 text-white'
                              }`}>
                                {msg.senderRole.replace('_', ' ')}
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
                                alt="Thread attachment"
                                onClick={() => setPreviewPhotoUrl(msg.photoUrl || null)}
                                className="max-h-40 rounded-xl object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      Initial submission received. Waiting for authority response.
                    </div>
                  )}
                </div>
              </div>

              {/* Authority Resolution Actions Panel (Only for Staff / HOD / VP) */}
              {isAuthorityUser && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Authority Resolution & Status Actions</span>
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      Logged in as {user?.designation || user?.role}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter official resolution note / decision rationale..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Resolve</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('IN_REVIEW')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark Under Review</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline Request</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reply Box with Live Camera Photo Shoot Action */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                {replyPhotoUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <img src={replyPhotoUrl} alt="Reply preview" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-300">Attachment Uploaded</p>
                      <p className="text-[10px] text-blue-700 dark:text-blue-400">Stored in Supabase app-files</p>
                    </div>
                    <button
                      onClick={handleDeleteReplyPhoto}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove attachment from storage"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0"
                    title="Upload File to Supabase Storage"
                  >
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'CHAT_REPLY')} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setCameraContext('CHAT_REPLY');
                      setShowCameraModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0"
                    title="Take Live Camera Photo Proof"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type reply or inquiry follow-up message..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={isSendingReply || (!replyMessage.trim() && !replyPhotoUrl)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Select an Inquiry</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Choose an inquiry from the left panel to inspect the full conversation thread, review live photo shoot evidence, and send replies.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW INQUIRY WITH LIVE CAMERA PHOTO SHOOT */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span>Submit Formal Inquiry & Grievance</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct dispatch to HOD, Vice Principal, or Student Election Council.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInquiry} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                
                {/* Authority Target Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Authority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'HOD', label: 'Head of Department (HOD)', icon: Building2 },
                      { id: 'VICE_PRINCIPAL', label: 'Vice Principal (VP)', icon: Crown },
                      { id: 'STUDENT_COUNCIL', label: 'Student Council', icon: Users }
                    ].map((auth) => {
                      const Icon = auth.icon;
                      return (
                        <button
                          key={auth.id}
                          type="button"
                          onClick={() => setTargetAuthority(auth.id as AuthorityTarget)}
                          className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                            targetAuthority === auth.id
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 font-medium'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px] leading-tight">{auth.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* If HOD selected, pick department */}
                {targetAuthority === 'HOD' && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={targetDepartmentCode}
                      onChange={(e) => setTargetDepartmentCode(e.target.value as DepartmentCode)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="CSE">Computer Science & Engineering (Dr. Aris Thorne)</option>
                      <option value="IT">Information Technology (Dr. Sarah Jenkins)</option>
                      <option value="AIDS">Artificial Intelligence & Data Science (Dr. Vikramaditya Sen)</option>
                    </select>
                  </div>
                )}

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Inquiry Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as InquiryCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="ACADEMIC">Academic & Labs</option>
                      <option value="FINE_APPEAL">Fine Appeal & Gate Waiver</option>
                      <option value="CAMPUS_FACILITIES">Campus Facilities & Wi-Fi</option>
                      <option value="ELECTION_COUNCIL">Student Council Matter</option>
                      <option value="EXAMINATION">University Exams</option>
                      <option value="HOSTEL_MESS">Hostel & Cafeteria</option>
                      <option value="GENERAL">General Request</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium (Standard)</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent / Time Sensitive</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Subject / Title</label>
                  <input
                    type="text"
                    placeholder="Brief summary of your inquiry..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Detailed Message */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Detailed Message</label>
                  <textarea
                    rows={4}
                    placeholder="Provide full details, timestamps, reason for waiver or request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Live Camera Photo Shoot Attachment */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>Evidence & Attachment (Bucket: app-files)</span>
                      </span>
                      <p className="text-[11px] text-slate-500">Take live camera proof or upload evidence document.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-blue-500" />
                        <span>Upload File</span>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'NEW_INQUIRY')} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCameraContext('NEW_INQUIRY');
                          setShowCameraModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{capturedPhotoUrl ? 'Re-take Photo' : 'Take Live Photo'}</span>
                      </button>
                    </div>
                  </div>

                  {capturedPhotoUrl && (
                    <div className="relative mt-2 rounded-xl overflow-hidden max-h-40 border border-slate-200 dark:border-slate-700">
                      <img src={capturedPhotoUrl} alt="Captured evidence" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={handleDeleteCapturedPhoto}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                        title="Remove photo from storage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Transmit Inquiry'}</span>
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
        title={cameraContext === 'NEW_INQUIRY' ? 'Take Live Inquiry Photo Proof' : 'Share Live Photo to Discussion'}
        subtitle="Align your document, bus ticket, ID proof, or facility photo within the viewfinder"
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
