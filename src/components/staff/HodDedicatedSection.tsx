import React, { useState, useEffect } from 'react';
import { HodVpPost, Department, DepartmentCode, PhotoTransmissionRoute } from '../../types';
import { INITIAL_HOD_VP_POSTS } from '../../data/mockData';
import { ALL_COLLEGE_DEPARTMENTS } from '../../data/departmentsData';
import { useAuth } from '../../context/AuthContext';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { ImageLightbox } from '../common/ImageLightbox';
import { HodDigitalIDCard } from './HodDigitalIDCard';
import { RoleLiveVerifiedBadge } from '../common/RoleLiveVerifiedBadge';
import { 
  fetchBroadcastPhotosFromSupabase, 
  createBroadcastPhotoInSupabase, 
  uploadCampusImageToSupabase 
} from '../../services/campusSupabaseService';
import { supabase } from '../../services/supabase';
import { 
  Building2, 
  Send, 
  Camera, 
  Upload, 
  ShieldCheck, 
  Users, 
  Share2, 
  CheckCircle2, 
  Eye, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  X, 
  Maximize2, 
  Heart,
  Crown,
  Layers,
  Sparkles,
  Lock,
  RefreshCw,
  QrCode,
  Radio
} from 'lucide-react';

export const HodDedicatedSection: React.FC = () => {
  const { user, role, addNotification } = useAuth();
  const [activeTab, setActiveTab] = useState<'id-card' | 'broadcasts'>('id-card');
  const [posts, setPosts] = useState<HodVpPost[]>(INITIAL_HOD_VP_POSTS);
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(user?.departmentId ? 'CSE' : 'ALL');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Post State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPhotoUrl, setPostPhotoUrl] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800');
  const [postDeptCode, setPostDeptCode] = useState<string>('CSE');

  // Lightbox
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    photoUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    photoUrl: '',
    title: ''
  });

  // Load from Supabase and listen to Realtime broadcasts
  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      const data = await fetchBroadcastPhotosFromSupabase();
      if (isMounted && data.length > 0) {
        setPosts(data);
      }
    };
    loadPosts();

    const channel = supabase
      .channel('realtime_broadcast_photos_hod')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcast_photos' }, (payload) => {
        if (payload.new) {
          const item = payload.new as any;
          const newPost: HodVpPost = {
            id: item.id,
            authorName: item.author_name,
            authorRole: item.author_role,
            authorPhotoUrl: item.author_photo_url,
            department: item.department_name || item.department_code || 'Academic Division',
            departmentCode: item.department_code,
            title: item.title,
            content: item.content,
            photoUrl: item.photo_url,
            visibility: item.visibility,
            transmissionRoute: item.transmission_route,
            routedToSummary: item.routed_to_summary,
            isConfidential: item.is_confidential,
            likesCount: item.likes_count || 0,
            createdAt: new Date(item.created_at).toLocaleString()
          };
          setPosts(prev => [newPost, ...prev.filter(p => p.id !== newPost.id)]);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Photo Transmission Rule Filter for HOD Section:
  const visibleHodFeed = posts.filter(p => {
    if (selectedDeptCode !== 'ALL' && p.departmentCode && p.departmentCode !== selectedDeptCode) {
      return false;
    }
    return true;
  });

  const handleBroadcastPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    setIsSubmitting(true);
    const uploadedUrl = await uploadCampusImageToSupabase(postPhotoUrl, 'broadcasts');
    const deptObj = ALL_COLLEGE_DEPARTMENTS.find(d => d.code === postDeptCode);
    
    const postPayload: Partial<HodVpPost> = {
      authorName: user?.name || deptObj?.hodName || 'Dr. Aris Thorne (HOD)',
      authorRole: 'HOD',
      department: `${deptObj?.name || 'Department'} (HOD Console)`,
      departmentCode: postDeptCode,
      authorPhotoUrl: user?.avatarUrl || deptObj?.hodPhotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
      title: postTitle,
      content: postContent,
      photoUrl: uploadedUrl,
      visibility: 'ALL',
      transmissionRoute: 'HOD_TO_ALL_STAFF',
      routedToSummary: 'Broadcasted from HOD → Transmitted to All Staff & Security Consoles',
      isConfidential: false
    };

    const res = await createBroadcastPhotoInSupabase(postPayload);
    setIsSubmitting(false);

    if (res.success && res.post) {
      setPosts(prev => [res.post!, ...prev]);
    } else {
      const fallbackPost: HodVpPost = {
        id: `post-hod-${Date.now()}`,
        ...(postPayload as HodVpPost),
        likesCount: 1,
        createdAt: new Date().toLocaleString()
      };
      setPosts(prev => [fallbackPost, ...prev]);
    }

    setShowBroadcastModal(false);
    setPostTitle('');
    setPostContent('');
    addNotification(
      'Photo Dispatched via Supabase Realtime',
      'Rule Applied: Photo synced and routed live to all Staff & Security consoles.',
      'success'
    );
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[10px] font-black uppercase tracking-widest border border-red-500/30 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-red-400" />
                <span>HEAD OF DEPARTMENT CONSOLE</span>
              </span>
              <RoleLiveVerifiedBadge role="HOD" size="sm" customLabel="LIVE VERIFIED HOD" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              HOD Academic Console
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Faculty leadership, laboratory monitoring, and institutional photo broadcasts. 
              <strong className="text-blue-300 ml-1">Photo Routing Protocol:</strong> Photos transmitted by HOD are automatically dispatched to all staff sections.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Photo to Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('id-card')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'id-card'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Official Faculty ID Card</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'broadcasts'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Photo Broadcasts & Dispatches</span>
        </button>
      </div>

      {/* Tab 1: Faculty ID Card */}
      {activeTab === 'id-card' && (
        <div className="py-2">
          <HodDigitalIDCard />
        </div>
      )}

      {activeTab === 'broadcasts' && (
        <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-900 dark:text-blue-200">
            HOD Photo Transmission Routing Protocol:
          </p>
          <ul className="text-blue-800 dark:text-blue-300/90 text-[11px] list-disc list-inside space-y-0.5">
            <li><strong>When HOD sends a photo:</strong> It is routed immediately to <strong>all staff & security consoles</strong>.</li>
            <li><strong>When VP sends a photo:</strong> It is routed <strong>strictly to the HOD section only</strong>.</li>
            <li><strong>When Staff sends a photo:</strong> It is routed to <strong>all staff sections and escalated here to HOD</strong>.</li>
          </ul>
        </div>
      </div>

      {/* Department Selector Filter */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">Filter Department Feed:</span>
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedDeptCode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDeptCode === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Departments
          </button>
          {ALL_COLLEGE_DEPARTMENTS.slice(0, 6).map(d => (
            <button
              key={d.code}
              onClick={() => setSelectedDeptCode(d.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDeptCode === d.code
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d.code}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleHodFeed.map((post) => {
          const isFromVp = post.authorRole === 'VICE_PRINCIPAL';
          const isFromHod = post.authorRole === 'HOD';
          const isFromStaff = post.authorRole === 'STAFF';

          return (
            <div
              key={post.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-4 transition-all ${
                isFromVp 
                  ? 'border-purple-300 dark:border-purple-800 ring-1 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorPhotoUrl}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{post.authorName}</h4>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-black uppercase ${
                        isFromVp 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : isFromHod
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {post.authorRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{post.department || 'Academic Division'}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400">{post.createdAt}</span>
              </div>

              {/* Transmission Route Badge */}
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-mono">
                <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">
                  {post.routedToSummary || (
                    isFromVp 
                      ? 'VP Directive → Routed Strictly to HOD Section Only'
                      : isFromHod
                      ? 'HOD Transmission → Routed to All Staff & Security'
                      : 'Staff Field Photo → Routed to All Staff & Escalated to HOD'
                  )}
                </span>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{post.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{post.content}</p>
              </div>

              {/* Photo */}
              {post.photoUrl && (
                <div 
                  className="relative rounded-2xl overflow-hidden cursor-pointer group border border-slate-200/80 dark:border-slate-800"
                  onClick={() => setLightboxData({
                    isOpen: true,
                    photoUrl: post.photoUrl!,
                    title: post.title,
                    subtitle: `${post.authorName} • ${post.authorRole}`
                  })}
                >
                  <img
                    src={post.photoUrl}
                    alt={post.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-6 h-6 drop-shadow-md" />
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 font-bold transition cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-rose-500/20" />
                  <span>{post.likesCount} Confirmations</span>
                </button>

                <span className="text-[11px] text-slate-400 font-mono">
                  Verified HOD Protocol
                </span>
              </div>

            </div>
          );
        })}
      </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">HOD Photo & Directive Broadcast</h3>
                <p className="text-xs text-blue-300">Rule: Dispatches to ALL Staff & Security consoles</p>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastPhoto} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>This photo and message will be visible across all staff consoles campus-wide.</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                <select
                  value={postDeptCode}
                  onChange={(e) => setPostDeptCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  {ALL_COLLEGE_DEPARTMENTS.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Lab Equipment Arrival & Verification"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Instructions / Notes</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={3}
                  placeholder="Notes for faculty, laboratory staff, and gate marshals..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  required
                />
              </div>

              {/* Photo Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Photo Evidence</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="flex-1 py-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Shoot Live Camera Photo</span>
                  </button>
                </div>

                {postPhotoUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-32">
                    <img src={postPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to Staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      <LiveCameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(photo) => {
          setPostPhotoUrl(photo);
          setShowCameraModal(false);
          addNotification('Live Camera Photo Captured', 'Evidence attached to HOD broadcast.', 'info');
        }}
        title="Shoot Department Evidence Photo"
        subtitle="Capture live lab or department photo evidence to broadcast to staff."
      />

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        photoUrl={lightboxData.photoUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
      />

    </div>
  );
};
