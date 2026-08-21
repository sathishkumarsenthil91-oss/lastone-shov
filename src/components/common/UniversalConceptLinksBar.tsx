import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  QrCode, 
  BookOpen, 
  GraduationCap, 
  DoorOpen, 
  CreditCard, 
  MessageSquare, 
  Home, 
  Scan, 
  History, 
  Building2, 
  Crown, 
  Landmark, 
  Bell, 
  User, 
  Link2, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Layers,
  Search,
  X,
  ChevronRight
} from 'lucide-react';

export interface ConceptLinkItem {
  id: string;
  hash: string;
  title: string;
  category: 'Student' | 'Staff' | 'Executive' | 'Campus Utilities';
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  badge?: string;
  roleRequired?: string[];
}

export const CONCEPT_LINKS: ConceptLinkItem[] = [
  {
    id: 'id-card',
    hash: '#id-card',
    title: '3D Digital ID Card',
    category: 'Student',
    description: 'Official Anna University approved biometric identity card with 3D horizontal flip.',
    icon: <QrCode className="w-4 h-4 text-blue-500" />,
    accentColor: 'border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    badge: 'LIVE QR'
  },
  {
    id: 'notes',
    hash: '#notes',
    title: 'Total Notes & Repository',
    category: 'Student',
    description: 'Real-time Supabase study notes, lecture manuals, and exam materials repository.',
    icon: <BookOpen className="w-4 h-4 text-sky-500" />,
    accentColor: 'border-sky-500/30 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    badge: 'SUPABASE'
  },
  {
    id: 'academic',
    hash: '#academic',
    title: 'Academic Record',
    category: 'Student',
    description: 'Student registration particulars, department roster, and semester records.',
    icon: <GraduationCap className="w-4 h-4 text-indigo-500" />,
    accentColor: 'border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'gate-pass',
    hash: '#gate-pass',
    title: 'Campus Gate Pass',
    category: 'Student',
    description: 'Automated turnstile gate out-pass clearance, parental verification, and curfew status.',
    icon: <DoorOpen className="w-4 h-4 text-emerald-500" />,
    accentColor: 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    badge: 'AUTO PASS'
  },
  {
    id: 'fines',
    hash: '#fines',
    title: 'Fines & Fee Clearance',
    category: 'Student',
    description: 'Instant disciplinary and late fee settlement via Razorpay and UPI gateway.',
    icon: <CreditCard className="w-4 h-4 text-rose-500" />,
    accentColor: 'border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400'
  },
  {
    id: 'inquiries',
    hash: '#inquiries',
    title: 'Grievances & Inquiries',
    category: 'Student',
    description: 'Direct student inquiry tracking, proctor liaison, and academic grievance resolution.',
    icon: <MessageSquare className="w-4 h-4 text-violet-500" />,
    accentColor: 'border-violet-500/30 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400'
  },
  {
    id: 'properties',
    hash: '#properties',
    title: 'Off-Campus Housing',
    category: 'Campus Utilities',
    description: 'Verified student hostels, PGs, and rental rooms with direct owner contacts.',
    icon: <Home className="w-4 h-4 text-amber-500" />,
    accentColor: 'border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    badge: 'ACCOMMODATION'
  },
  {
    id: 'scanner',
    hash: '#scanner',
    title: 'Turnstile Gate Scanner',
    category: 'Staff',
    description: 'Real-time camera barcode and QR scanner for security staff and gate proctors.',
    icon: <Scan className="w-4 h-4 text-teal-500" />,
    accentColor: 'border-teal-500/30 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400',
    badge: 'STAFF DESK'
  },
  {
    id: 'history',
    hash: '#history',
    title: 'Turnstile Audit Logs',
    category: 'Staff',
    description: 'Live entry and exit logging records with granted, denied, and flagged history.',
    icon: <History className="w-4 h-4 text-slate-500" />,
    accentColor: 'border-slate-500/30 hover:bg-slate-500/10 text-slate-600 dark:text-slate-400'
  },
  {
    id: 'hod',
    hash: '#hod',
    title: 'Head of Department Suite',
    category: 'Executive',
    description: 'Departmental leave approvals, faculty rosters, and curriculum circulars.',
    icon: <Building2 className="w-4 h-4 text-sky-500" />,
    accentColor: 'border-sky-500/30 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    badge: 'HOD CHAIR'
  },
  {
    id: 'vp',
    hash: '#vp',
    title: 'Vice Principal Governance',
    category: 'Executive',
    description: 'Inter-departmental academic council, emergency pass escalation, and policy audits.',
    icon: <Crown className="w-4 h-4 text-purple-500" />,
    accentColor: 'border-purple-500/30 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    badge: 'TIER 1'
  },
  {
    id: 'principal',
    hash: '#principal',
    title: 'Principal Executive Command',
    category: 'Executive',
    description: 'Supreme institutional governance, academic accreditation, and executive directives.',
    icon: <Landmark className="w-4 h-4 text-indigo-500" />,
    accentColor: 'border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    badge: 'EXECUTIVE'
  },
  {
    id: 'circulars',
    hash: '#circulars',
    title: 'Campus Circulars Hub',
    category: 'Campus Utilities',
    description: 'Official college notifications, examination schedules, and institutional announcements.',
    icon: <Bell className="w-4 h-4 text-orange-500" />,
    accentColor: 'border-orange-500/30 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400'
  },
  {
    id: 'profile',
    hash: '#profile',
    title: 'User Profile & Identity',
    category: 'Campus Utilities',
    description: 'Profile avatar configuration, live camera capture, and saved properties manager.',
    icon: <User className="w-4 h-4 text-blue-500" />,
    accentColor: 'border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400'
  }
];

interface UniversalConceptLinksBarProps {
  onNavigate?: (hash: string) => void;
  activeHash?: string;
  compact?: boolean;
}

export const UniversalConceptLinksBar: React.FC<UniversalConceptLinksBarProps> = ({
  onNavigate,
  activeHash = '#id-card',
  compact = false
}) => {
  const { role, addNotification } = useAuth();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectLink = (item: ConceptLinkItem) => {
    window.location.hash = item.hash;
    if (onNavigate) {
      onNavigate(item.hash);
    }
    setIsOpenModal(false);
    addNotification('Section Linked', `Navigated to ${item.title}`, 'info');
  };

  const handleCopyLink = (e: React.MouseEvent, item: ConceptLinkItem) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}${item.hash}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    addNotification('Link Copied', `Direct shareable URL for ${item.title} copied to clipboard.`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredLinks = CONCEPT_LINKS.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Inline Quick-Links Concept Bar */}
      <div className="w-full rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-2.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          
          {/* Label */}
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Link2 className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Quick Concept Links
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Direct URL deep-links to all campus sections & tools
              </span>
            </div>
          </div>

          {/* Quick Concept Badges / Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {CONCEPT_LINKS.slice(0, compact ? 5 : 8).map(item => {
              const isActive = activeHash === item.hash || window.location.hash === item.hash;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectLink(item)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                  title={`${item.title} (${item.hash})`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsOpenModal(true)}
              className="px-3 py-1 rounded-xl text-[11px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Concept Links ({CONCEPT_LINKS.length})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Full Modal: All Concepts & Shareable Deep Links Directory */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                    <span>Campus Sections & Concept Directory</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black border border-blue-500/30">
                      {CONCEPT_LINKS.length} DEEP-LINKS
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any concept to jump directly or copy its permanent shareable URL
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpenModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search concepts, modules, or deep links (e.g. #notes, #id-card, #fines, #scanner)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Links Grid */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredLinks.map(item => {
                  const isCopied = copiedId === item.id;
                  const isActive = activeHash === item.hash || window.location.hash === item.hash;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectLink(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isActive
                          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-white dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700">
                              {item.icon}
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[9px] font-bold">
                            {item.hash}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(e, item)}
                            className="px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Copy shareable direct URL link"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredLinks.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No concept found matching "{searchQuery}".
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
              <span>AVS College of Technology • Universal Concept Navigation</span>
              <button
                onClick={() => setIsOpenModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
