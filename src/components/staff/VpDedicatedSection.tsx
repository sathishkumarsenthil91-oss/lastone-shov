import React, { useState, useEffect } from 'react';
import { HodVpPost, PhotoTransmissionRoute } from '../../types';
import { INITIAL_HOD_VP_POSTS } from '../../data/mockData';
import { ALL_COLLEGE_DEPARTMENTS } from '../../data/departmentsData';
import { useAuth } from '../../context/AuthContext';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { ImageLightbox } from '../common/ImageLightbox';
import { VpDigitalIDCard } from './VpDigitalIDCard';
import { RoleLiveVerifiedBadge } from '../common/RoleLiveVerifiedBadge';
import { 
  fetchBroadcastPhotosFromSupabase, 
  createBroadcastPhotoInSupabase, 
  uploadCampusImageToSupabase 
} from '../../services/campusSupabaseService';
import { supabase } from '../../services/supabase';
import { 
  Crown, 
  Send, 
  Camera, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Maximize2, 
  Heart, 
  Plus, 
  X, 
  FileCheck2, 
  Building2, 
  Scale,
  RefreshCw,
  QrCode,
  Radio
} from 'lucide-react';

export const VpDedicatedSection: React.FC = () => {
  const { user, role, addNotification } = useAuth();
  const [activeTab, setActiveTab] = useState<'id-card' | 'directives'>('id-card');
  const [posts, setPosts] = useState<HodVpPost[]>(INITIAL_HOD_VP_POSTS);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Post State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPhotoUrl, setPostPhotoUrl] = useState('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800');

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
      .channel('realtime_broadcast_photos_vp')
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

  // Photos visible in VP Console:
  const vpFeed = posts.filter(p => p.authorRole === 'VICE_PRINCIPAL' || p.visibility === 'ALL' || p.isConfidential);

  const handleDispatchToHodsOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    setIsSubmitting(true);
    const uploadedUrl = await uploadCampusImageToSupabase(postPhotoUrl, 'broadcasts');

    const postPayload: Partial<HodVpPost> = {
      authorName: user?.name || 'Dr. Elizabeth Montgomery',
      authorRole: 'VICE_PRINCIPAL',
      department: 'Campus Governance & Senate Directives',
      authorPhotoUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      title: postTitle,
      content: postContent,
      photoUrl: uploadedUrl,
      visibility: 'HOD_VP_CONFIDENTIAL',
      transmissionRoute: 'VP_TO_HOD_ONLY',
      routedToSummary: 'Strictly Transmitted to HOD Section Only (Confidential Protocol)',
      isConfidential: true
    };

    const res = await createBroadcastPhotoInSupabase(postPayload);
    setIsSubmitting(false);

    if (res.success && res.post) {
      setPosts(prev => [res.post!, ...prev]);
    } else {
      const fallbackPost: HodVpPost = {
        id: `post-vp-${Date.now()}`,
        ...(postPayload as HodVpPost),
        likesCount: 1,
        createdAt: new Date().toLocaleString()
      };
      setPosts(prev => [fallbackPost, ...prev]);
    }

    setShowDispatchModal(false);
    setPostTitle('');
    setPostContent('');
    addNotification(
      'Photo Routed Strictly to HOD Section',
      'Rule Applied: Photo synced to Supabase and transmitted exclusively to HOD consoles.',
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
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black uppercase tracking-widest border border-amber-500/30 flex items-center gap-1.5">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>OFFICE OF THE VICE PRINCIPAL</span>
              </span>
              <RoleLiveVerifiedBadge role="VICE_PRINCIPAL" size="sm" customLabel="LIVE VERIFIED VP" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              VP Executive Photo & Security Console
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Transmit institutional notices and confidential photos. <strong className="text-purple-300">Rule: Photos transmitted by Vice Principal route strictly into the HOD Section.</strong>
            </p>
          </div>

          <button
            onClick={() => setShowDispatchModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Photo to HODs Only</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('id-card')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'id-card'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>VP Executive Digital ID Card</span>
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'directives'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Executive Directives & Dispatch Feed</span>
        </button>
      </div>

      {/* Tab 1: VP ID Card */}
      {activeTab === 'id-card' && (
        <div className="py-2">
          <VpDigitalIDCard />
        </div>
      )}

      {/* Tab 2: Directives Feed */}
      {activeTab === 'directives' && (
        <div className="space-y-6">
      {/* Protocol Banner */}
      <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          VP
        </div>
        <div className="text-xs">
          <p className="font-bold text-purple-900 dark:text-purple-300">
            Confidential VP-to-HOD Transmission Protocol Active
          </p>
          <p className="text-purple-700 dark:text-purple-400 text-[11px]">
            Any photo directive published from this console bypasses general feeds and delivers exclusively to Department HOD desks.
          </p>
        </div>
      </div>

      {/* VP Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vpFeed.map(post => (
          <div 
            key={post.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            {/* Author Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={post.authorPhotoUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'} 
                  alt={post.authorName}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-purple-500/20" 
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{post.authorName}</span>
                    <Crown className="w-3 h-3 text-purple-500" />
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {post.department}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[9px] font-bold uppercase tracking-wider">
                VP Route
              </span>
            </div>

            {/* Photo preview with Lightbox trigger */}
            {post.photoUrl && (
              <div 
                onClick={() => setLightboxData({
                  isOpen: true,
                  photoUrl: post.photoUrl!,
                  title: post.title,
                  subtitle: post.routedToSummary
                })}
                className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer group"
              >
                <img 
                  src={post.photoUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                  <Maximize2 className="w-4 h-4" />
                  <span>Enlarge Inspection</span>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-purple-400" />
                  <span>HOD Confidential</span>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>{post.createdAt}</span>
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 text-slate-500 hover:text-purple-600 transition"
                >
                  <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500/20" />
                  <span>{post.likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}

      {/* Modal: Dispatch Photo to HODs Only */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dispatch Photo Directive to HODs Only
                </h3>
              </div>
              <button 
                onClick={() => setShowDispatchModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchToHodsOnly} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Executive Directive Title
                </label>
                <input 
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g., Mandatory Gate Enforcement & Lab Review Checklist"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confidential Instructions (for HODs)
                </label>
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={3}
                  placeholder="Instructions for all department heads regarding immediate compliance..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Photo selection with Camera Capture trigger */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photo Attachment
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="url"
                    value={postPhotoUrl}
                    onChange={(e) => setPostPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="px-3 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Camera</span>
                  </button>
                </div>
              </div>

              {postPhotoUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={postPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-[11px] text-purple-700 dark:text-purple-300">
                🔒 <strong>Routing Guarantee:</strong> This post will appear exclusively inside the HOD section and will NOT be viewable by regular staff or students.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isSubmitting ? 'Transmitting...' : 'Dispatch to HOD Section'}</span>
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
        onCapture={(img) => {
          setPostPhotoUrl(img);
          setShowCameraModal(false);
          addNotification('Photo Captured', 'Image ready for executive dispatch.', 'success');
        }}
        title="VP Executive Live Camera Capture"
        subtitle="Capture photo for confidential HOD routing"
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
