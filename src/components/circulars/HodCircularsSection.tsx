import React, { useState, useEffect } from 'react';
import { INITIAL_HOD_CIRCULARS } from '../../data/circularsData';
import { ALL_COLLEGE_DEPARTMENTS } from '../../data/departmentsData';
import { CampusCircular, DepartmentCode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fetchCircularsFromSupabase, createCircularInSupabase } from '../../services/campusSupabaseService';
import { supabase } from '../../services/supabase';
import { 
  FileText, 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Download, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Plus, 
  X, 
  Send, 
  Check, 
  Users, 
  ShieldCheck,
  Tag,
  Eye,
  RefreshCw
} from 'lucide-react';

export const HodCircularsSection: React.FC = () => {
  const { user, role, addNotification } = useAuth();
  const [circulars, setCirculars] = useState<CampusCircular[]>(INITIAL_HOD_CIRCULARS);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Circular Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDepartmentCode, setNewDepartmentCode] = useState<string>(user?.departmentId ? 'CSE' : 'CSE');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'ACADEMIC' | 'FACILITY' | 'EXAMINATION' | 'EVENT'>('ACADEMIC');
  const [newUrgency, setNewUrgency] = useState<'NORMAL' | 'HIGH_PRIORITY' | 'MANDATORY'>('NORMAL');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Load from Supabase on mount and listen to realtime updates
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchCircularsFromSupabase();
      if (isMounted && data.length > 0) {
        // Filter HOD relevant ones or all
        const hodItems = data.filter(c => c.issuerRole === 'HOD' || c.targetAudience === 'DEPT_SPECIFIC' || c.departmentCode);
        setCirculars(hodItems.length > 0 ? hodItems : data);
      }
      if (isMounted) setIsLoading(false);
    };

    loadData();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('realtime_hod_circulars')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'circulars' }, (payload) => {
        if (payload.new) {
          const item = payload.new as any;
          const newCirc: CampusCircular = {
            id: item.id,
            circularNumber: item.circular_number,
            issuerRole: item.issuer_role,
            issuerName: item.issuer_name,
            issuerDesignation: item.issuer_designation,
            issuerAvatarUrl: item.issuer_avatar_url,
            departmentCode: item.department_code,
            departmentName: item.department_name,
            title: item.title,
            summary: item.summary,
            content: item.content,
            issuanceDate: item.issuance_date,
            effectiveDate: item.effective_date,
            category: item.category,
            targetAudience: item.target_audience,
            urgency: item.urgency,
            attachmentName: item.attachment_name,
            isAcknowledged: false,
            acknowledgementCount: item.acknowledgement_count || 1
          };
          setCirculars(prev => [newCirc, ...prev.filter(c => c.id !== newCirc.id)]);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const isHodOrAdmin = role === 'HOD' || role === 'ADMIN' || role === 'VICE_PRINCIPAL';

  const filteredCirculars = circulars.filter(c => {
    const matchesDept = selectedDept === 'ALL' || c.departmentCode === selectedDept;
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.circularNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesCategory && matchesSearch;
  });

  const handleAcknowledge = (id: string) => {
    setCirculars(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.isAcknowledged;
        const diff = nextState ? 1 : -1;
        return {
          ...c,
          isAcknowledged: nextState,
          acknowledgementCount: (c.acknowledgementCount || 0) + diff
        };
      }
      return c;
    }));
    addNotification('Circular Acknowledged', 'Your acknowledgement has been recorded in the institutional register.', 'success');
  };

  const handleIssueCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsSubmitting(true);
    const deptObj = ALL_COLLEGE_DEPARTMENTS.find(d => d.code === newDepartmentCode);
    const newCircPayload: Partial<CampusCircular> = {
      circularNumber: `SHOV/HOD/${newDepartmentCode}/2026/${Math.floor(100 + Math.random() * 900)}`,
      issuerRole: 'HOD',
      issuerName: user?.name || deptObj?.hodName || 'Head of Department',
      issuerDesignation: `Head of Department (${deptObj?.name || 'Academic'})`,
      issuerAvatarUrl: user?.avatarUrl || deptObj?.hodPhotoUrl,
      departmentCode: newDepartmentCode,
      departmentName: deptObj?.name,
      title: newTitle,
      summary: newSummary || newTitle,
      content: newContent,
      issuanceDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      category: newCategory,
      targetAudience: 'DEPT_SPECIFIC',
      urgency: newUrgency,
      attachmentName: newAttachmentName || undefined
    };

    const res = await createCircularInSupabase(newCircPayload);
    setIsSubmitting(false);

    if (res.success && res.circular) {
      setCirculars(prev => [res.circular!, ...prev]);
    } else {
      const fallbackCirc: CampusCircular = {
        id: `circ-hod-${Date.now()}`,
        ...(newCircPayload as CampusCircular),
        isAcknowledged: false,
        acknowledgementCount: 1
      };
      setCirculars(prev => [fallbackCirc, ...prev]);
    }

    setShowIssueModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewAttachmentName('');
    addNotification('HOD Circular Issued', `Official circular published to Supabase successfully.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-black uppercase tracking-widest border border-blue-500/30 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>OFFICIAL HOD DIRECTIVES</span>
              </span>
              <span className="text-xs text-slate-400 font-bold">All Academic Departments</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              HOD Circulars & Notices
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Official academic notices, laboratory review schedules, internal assessment announcements, and department directives issued by Heads of Departments.
            </p>
          </div>

          {isHodOrAdmin && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Department Circular</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars by title, reference number, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-bold">Dept:</span>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Departments ({ALL_COLLEGE_DEPARTMENTS.length})</option>
            {ALL_COLLEGE_DEPARTMENTS.map(d => (
              <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic & Syllabus</option>
            <option value="FACILITY">Laboratory & Computing</option>
            <option value="EXAMINATION">Internal Assessments</option>
            <option value="EVENT">Symposiums & Events</option>
          </select>
        </div>

      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No circulars match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting a different department or clear the search keyword.</p>
          </div>
        ) : (
          filteredCirculars.map((circ) => (
            <div
              key={circ.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={circ.issuerAvatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
                    alt={circ.issuerName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {circ.issuerName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-[10px] font-bold uppercase">
                        HOD • {circ.departmentCode}
                      </span>
                      {circ.urgency === 'HIGH_PRIORITY' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{circ.issuerDesignation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Issued: {circ.issuanceDate}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{circ.circularNumber}</span>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  {circ.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {circ.content}
                </p>
              </div>

              {/* Footer actions & attachments */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {circ.attachmentName && (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>{circ.attachmentName}</span>
                    </span>
                  )}
                  <span className="text-slate-400 text-[11px]">
                    Acknowledged by {circ.acknowledgementCount || 0} students & faculty
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcknowledge(circ.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      circ.isAcknowledged
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {circ.isAcknowledged ? <Check className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{circ.isAcknowledged ? 'Acknowledged' : 'Mark as Acknowledged'}</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Issue Department Circular</h3>
                <p className="text-xs text-slate-400">Publish an official HOD notice for students and faculty</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueCircular} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                <select
                  value={newDepartmentCode}
                  onChange={(e) => setNewDepartmentCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  {ALL_COLLEGE_DEPARTMENTS.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Circular Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule for Phase-II Laboratory Reviews"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="FACILITY">Facility & Lab</option>
                    <option value="EXAMINATION">Examinations</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH_PRIORITY">High Priority</option>
                    <option value="MANDATORY">Mandatory</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Content / Instructions</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Detail the instructions, deadlines, and guidelines for students..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Attachment Name (Optional)</label>
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="e.g. Phase2_Review_Slots.pdf"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
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
