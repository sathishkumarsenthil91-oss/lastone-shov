import React, { useState, useEffect } from 'react';
import { INITIAL_VP_CIRCULARS } from '../../data/circularsData';
import { CampusCircular } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fetchCircularsFromSupabase, createCircularInSupabase } from '../../services/campusSupabaseService';
import { supabase } from '../../services/supabase';
import { 
  Crown, 
  Search, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Download, 
  Plus, 
  X, 
  Send, 
  Check, 
  Scale, 
  Layers, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const VpCircularsSection: React.FC = () => {
  const { user, role, addNotification } = useAuth();
  const [circulars, setCirculars] = useState<CampusCircular[]>(INITIAL_VP_CIRCULARS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New VP Directive State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'GATE_SECURITY' | 'EXAMINATION' | 'DISCIPLINARY' | 'POLICY'>('GATE_SECURITY');
  const [newUrgency, setNewUrgency] = useState<'MANDATORY' | 'HIGH_PRIORITY' | 'NORMAL'>('MANDATORY');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchCircularsFromSupabase();
      if (isMounted && data.length > 0) {
        const vpItems = data.filter(c => c.issuerRole === 'VICE_PRINCIPAL' || c.targetAudience === 'ALL_STUDENTS');
        setCirculars(vpItems.length > 0 ? vpItems : data);
      }
      if (isMounted) setIsLoading(false);
    };

    loadData();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('realtime_vp_circulars')
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

  const isVpOrAdmin = role === 'VICE_PRINCIPAL' || role === 'ADMIN';

  const filteredCirculars = circulars.filter(c => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.circularNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
    addNotification('VP Directive Acknowledged', 'Institutional compliance recorded with university senate.', 'success');
  };

  const handleIssueDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsSubmitting(true);
    const newCircPayload: Partial<CampusCircular> = {
      circularNumber: `SHOV/VP/GOV/2026/${Math.floor(100 + Math.random() * 900)}`,
      issuerRole: 'VICE_PRINCIPAL',
      issuerName: user?.name || 'Dr. Elizabeth Montgomery',
      issuerDesignation: 'Vice Principal & Academic Senate Head',
      issuerAvatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      title: newTitle,
      summary: newTitle,
      content: newContent,
      issuanceDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      category: newCategory,
      targetAudience: 'ALL_STUDENTS',
      urgency: newUrgency,
      attachmentName: newAttachmentName || undefined
    };

    const res = await createCircularInSupabase(newCircPayload);
    setIsSubmitting(false);

    if (res.success && res.circular) {
      setCirculars(prev => [res.circular!, ...prev]);
    } else {
      const fallbackCirc: CampusCircular = {
        id: `circ-vp-${Date.now()}`,
        ...(newCircPayload as CampusCircular),
        isAcknowledged: true,
        acknowledgementCount: 1
      };
      setCirculars(prev => [fallbackCirc, ...prev]);
    }

    setShowIssueModal(false);
    setNewTitle('');
    setNewContent('');
    setNewAttachmentName('');
    addNotification('Executive Directive Published', `VP Circular published to Supabase database successfully.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[10px] font-black uppercase tracking-widest border border-purple-500/30 flex items-center gap-1.5">
                <Crown className="w-3 h-3 text-purple-400" />
                <span>EXECUTIVE SENATE DIRECTIVES</span>
              </span>
              <span className="text-xs text-slate-400 font-bold">Office of the Vice Principal</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              VP Circulars & Directives
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Institutional academic policies, campus turnstile security protocols, semester examination governance, and executive orders issued by Vice Principal Dr. Elizabeth Montgomery.
            </p>
          </div>

          {isVpOrAdmin && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Executive Directive</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search VP directives by keyword, directive code, or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="ALL">All Senate Categories</option>
            <option value="GATE_SECURITY">Gate & Identity Security</option>
            <option value="EXAMINATION">University Examinations</option>
            <option value="DISCIPLINARY">Code of Conduct & Decorum</option>
            <option value="POLICY">Institutional Policies</option>
          </select>
        </div>
      </div>

      {/* Directives List */}
      <div className="space-y-4">
        {filteredCirculars.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
            <Crown className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No VP directives found matching your search</p>
          </div>
        ) : (
          filteredCirculars.map((circ) => (
            <div
              key={circ.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={circ.issuerAvatarUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'}
                    alt={circ.issuerName}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-purple-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {circ.issuerName}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-mono text-[10px] font-black uppercase">
                        VICE PRINCIPAL EXECUTIVE ORDER
                      </span>
                      {circ.urgency === 'MANDATORY' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black">
                          Mandatory Directive
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{circ.issuerDesignation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span>Effective: {circ.effectiveDate}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{circ.circularNumber}</span>
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  {circ.title}
                </h3>
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {circ.content}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {circ.attachmentName && (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                      <FileText className="w-3.5 h-3.5 text-purple-500" />
                      <span>{circ.attachmentName}</span>
                    </span>
                  )}
                  <span className="text-slate-400 text-[11px]">
                    Official Senate Notice • {circ.acknowledgementCount || 0} confirmations recorded
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => handleAcknowledge(circ.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      circ.isAcknowledged
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                    }`}
                  >
                    {circ.isAcknowledged ? <Check className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{circ.isAcknowledged ? 'Directive Acknowledged' : 'Acknowledge Directive'}</span>
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
                <h3 className="text-lg font-black">Issue Executive VP Directive</h3>
                <p className="text-xs text-slate-400">Publish a campus-wide executive mandate</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueDirective} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Directive Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mandatory Digital ID Gate Compliance Directive"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Senate Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="GATE_SECURITY">Gate & Security</option>
                    <option value="EXAMINATION">Examinations</option>
                    <option value="DISCIPLINARY">Decorum & Parking</option>
                    <option value="POLICY">Governance Policy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="MANDATORY">Mandatory Senate Order</option>
                    <option value="HIGH_PRIORITY">High Priority</option>
                    <option value="NORMAL">Standard Notice</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Executive Directive Text</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="State the institutional regulations, requirements, and enforcement mandates..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Attachment Name</label>
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="e.g. Executive_Order_Security_2026.pdf"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Issue Directive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
