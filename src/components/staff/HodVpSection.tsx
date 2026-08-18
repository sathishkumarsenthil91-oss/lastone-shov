import React, { useState, useEffect } from 'react';
import { HodVpPost, Department, DepartmentCode, PhotoAudience } from '../../types';
import { INITIAL_HOD_VP_POSTS, INITIAL_DEPARTMENTS } from '../../data/mockData';
import { fetchHodVpPostsApi, createHodVpPostApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ImageLightbox } from '../common/ImageLightbox';
import { StaffAccountModal } from '../auth/StaffAccountModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon, 
  FileText, 
  Lock, 
  Plus, 
  Heart, 
  Share2, 
  Building2, 
  Send, 
  Maximize2, 
  X, 
  Globe, 
  Users, 
  UserPlus, 
  Layers, 
  Cpu, 
  Database,
  Crown,
  Upload,
  CheckCircle2
} from 'lucide-react';

export const HodVpSection: React.FC = () => {
  const { user, role, addNotification, createNewStaffAccount } = useAuth();
  const [posts, setPosts] = useState<HodVpPost[]>(INITIAL_HOD_VP_POSTS);
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'HOD_DIRECTORY' | 'ACCOUNTS'>('POSTS');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'ALL' | DepartmentCode>('ALL');

  // Modals
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showStaffCreateModal, setShowStaffCreateModal] = useState(false);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    photoUrl: string;
    title: string;
    subtitle?: string;
    badge?: string;
    status?: string;
    details?: { label: string; value: string }[];
  }>({
    isOpen: false,
    photoUrl: '',
    title: ''
  });

  const openLightbox = (
    photoUrl: string, 
    title: string, 
    subtitle?: string, 
    badge?: string, 
    status?: string, 
    details?: { label: string; value: string }[]
  ) => {
    setLightboxData({
      isOpen: true,
      photoUrl,
      title,
      subtitle,
      badge,
      status,
      details
    });
  };

  // New Post Form State (Permission-Based Photo Sharing)
  const [postAuthorName, setPostAuthorName] = useState(user?.name || 'Dr. Elizabeth Montgomery');
  const [postAuthorRole, setPostAuthorRole] = useState<'VICE_PRINCIPAL' | 'HOD' | 'STAFF'>(
    (role === 'VICE_PRINCIPAL' || role === 'HOD' || role === 'STAFF') ? role : 'HOD'
  );
  const [postDepartmentCode, setPostDepartmentCode] = useState<DepartmentCode>('CSE');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<PhotoAudience>('ALL');
  const [postPhotoUrl, setPostPhotoUrl] = useState('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800');
  const [postAttachmentName, setPostAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [role]);

  const loadPosts = async () => {
    const data = await fetchHodVpPostsApi(role, user?.departmentName);
    if (data.length > 0) {
      setPosts(data);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPostPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    setIsSubmitting(true);

    const newPostData: Partial<HodVpPost> = {
      authorName: postAuthorName,
      authorRole: postAuthorRole,
      department: postAuthorRole === 'VICE_PRINCIPAL' ? 'Campus Governance & Academic Affairs' : `${postDepartmentCode} Department`,
      departmentCode: postAuthorRole === 'VICE_PRINCIPAL' ? undefined : postDepartmentCode,
      authorPhotoUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      title: postTitle,
      content: postContent,
      photoUrl: postPhotoUrl,
      attachmentName: postAttachmentName || undefined,
      visibility: postVisibility,
      isConfidential: postVisibility === 'HOD_VP_CONFIDENTIAL',
      likesCount: 1
    };

    const created = await createHodVpPostApi(newPostData);
    setIsSubmitting(false);

    if (created) {
      setPosts(prev => [created, ...prev]);
    } else {
      setPosts(prev => [{
        id: `post-${Date.now()}`,
        authorName: newPostData.authorName!,
        authorRole: newPostData.authorRole!,
        department: newPostData.department,
        departmentCode: newPostData.departmentCode,
        authorPhotoUrl: newPostData.authorPhotoUrl!,
        title: newPostData.title!,
        content: newPostData.content!,
        photoUrl: newPostData.photoUrl,
        attachmentName: newPostData.attachmentName,
        visibility: newPostData.visibility!,
        isConfidential: newPostData.isConfidential,
        likesCount: 1,
        createdAt: new Date().toLocaleString()
      }, ...prev]);
    }

    setShowNewPostModal(false);
    setPostTitle('');
    setPostContent('');
    addNotification('Photo & Circular Broadcasted', `Shared with [${postVisibility}] audience permission.`, 'success');
  };

  const filteredPosts = posts.filter(p => {
    if (selectedDeptFilter === 'ALL') return true;
    return p.departmentCode === selectedDeptFilter || !p.departmentCode;
  });

  const getVisibilityBadge = (vis: PhotoAudience) => {
    switch (vis) {
      case 'ALL':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Globe className="w-3 h-3" /> All Campus
          </span>
        );
      case 'FACULTY_ONLY':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
            <Users className="w-3 h-3" /> Faculty & Staff Only
          </span>
        );
      case 'DEPT_ONLY':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
            <Building2 className="w-3 h-3" /> Department Only
          </span>
        );
      case 'HOD_VP_CONFIDENTIAL':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" /> HOD & VP Confidential
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        photoUrl={lightboxData.photoUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        badge={lightboxData.badge}
        status={lightboxData.status}
        details={lightboxData.details}
      />

      {/* Staff Account Modal */}
      <StaffAccountModal
        isOpen={showStaffCreateModal}
        onClose={() => setShowStaffCreateModal(false)}
        onCreateAccount={createNewStaffAccount}
      />

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>HOD & VICE PRINCIPAL EXECUTIVE SUITE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Photo Sharing & Faculty Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Permission-based institutional photo broadcasting, department updates, and unlimited staff/HOD account governance across IT, CSE, and AIDS.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => setShowStaffCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-sky-400" />
            <span>Create Staff/HOD Account</span>
          </button>

          <button
            onClick={() => {
              setPostAuthorName(user?.name || 'Dr. Elizabeth Montgomery');
              setShowNewPostModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Share Photo Broadcast</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector & Department Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Main Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('POSTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'POSTS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Broadcast Feed ({filteredPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HOD_DIRECTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'HOD_DIRECTORY'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>HOD & VP Directory</span>
          </button>
        </div>

        {/* Department Filter Pills */}
        {activeTab === 'POSTS' && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Filter:</span>
            {(['ALL', 'IT', 'CSE', 'AIDS'] as ('ALL' | DepartmentCode)[]).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDeptFilter(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedDeptFilter === d
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* POSTS FEED TAB */}
      {activeTab === 'POSTS' && (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4"
            >
              {/* Author & Visibility Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openLightbox(post.authorPhotoUrl, post.authorName, post.authorRole, post.department, 'FACULTY SENDER')}
                    className="relative group shrink-0"
                    title="Inspect HD Author Photo"
                  >
                    <img
                      src={post.authorPhotoUrl}
                      alt={post.authorName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all shadow"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">{post.authorName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                        post.authorRole === 'VICE_PRINCIPAL' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30' 
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}>
                        {post.authorRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {post.department || 'Campus Leadership'} • {post.createdAt}
                    </p>
                  </div>
                </div>

                <div>
                  {getVisibilityBadge(post.visibility || 'ALL')}
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{post.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Photo Share Attachment */}
              {post.photoUrl && (
                <div 
                  className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96 shadow-md cursor-pointer group"
                  onClick={() => openLightbox(post.photoUrl!, post.title, `Shared by ${post.authorName} (${post.authorRole})`, post.department, 'CAMPUS BROADCAST')}
                  title="Click to view full screen"
                >
                  <img
                    src={post.photoUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                    <Maximize2 className="w-5 h-5" />
                    <span>Click for High-Resolution View</span>
                  </div>
                </div>
              )}

              {/* Document Attachment */}
              {post.attachmentName && (
                <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{post.attachmentName}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Verified Circular</span>
                </div>
              )}

              {/* Engagement Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-rose-500/20 text-rose-500" />
                  <span className="font-bold">{post.likesCount} Acknowledged</span>
                </button>

                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>Sender: {post.authorName}</span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* DIRECTORY TAB */}
      {activeTab === 'HOD_DIRECTORY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Vice Principal Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/20 via-slate-900 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col items-center text-center space-y-3">
            <button
              onClick={() => openLightbox(
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
                'Dr. Elizabeth Montgomery',
                'Vice Principal & Academic Affairs Dean',
                'EXECUTIVE LEADERSHIP',
                'ACTIVE EXECUTIVE',
                [
                  { label: 'Office', value: 'Executive Block Suite 101' },
                  { label: 'Official Gmail', value: 'vp.academic@shov.college.edu' },
                  { label: 'Office Phone', value: '+91 98765 00010' },
                  { label: 'Jurisdiction', value: 'IT, CSE & AIDS Engineering Oversight' }
                ]
              )}
              className="relative group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
                alt="Dr. Elizabeth Montgomery"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-purple-500/40 shadow-xl group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white">
                <Maximize2 className="w-4 h-4" />
              </div>
            </button>
            <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest border border-purple-500/30 font-mono">
              VICE PRINCIPAL
            </span>
            <h3 className="text-base font-black text-white">Dr. Elizabeth Montgomery</h3>
            <p className="text-xs text-slate-400">Vice Principal & Academic Dean</p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <p className="truncate">vp.academic@shov.college.edu</p>
              <p>+91 98765 00010</p>
            </div>
          </div>

          {/* Department HOD Cards (IT, CSE, AIDS) */}
          {departments.map((dept) => (
            <div key={dept.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center text-center space-y-3">
              <button
                onClick={() => openLightbox(
                  dept.hodPhotoUrl,
                  dept.hodName,
                  `Head of Department - ${dept.name}`,
                  dept.code,
                  'ACTIVE HOD',
                  [
                    { label: 'Department', value: dept.name },
                    { label: 'Official Gmail', value: dept.hodEmail },
                    { label: 'Contact Phone', value: dept.hodPhone },
                    { label: 'Enrolled Students', value: `${dept.studentCount} Active` }
                  ]
                )}
                className="relative group cursor-pointer"
              >
                <img
                  src={dept.hodPhotoUrl}
                  alt={dept.hodName}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-xl group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </button>
              <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest font-mono">
                HOD • {dept.code}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{dept.hodName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dept.name}</p>
              <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
                <p className="truncate">{dept.hodEmail}</p>
                <p>{dept.hodPhone}</p>
                <p className="text-blue-500 font-bold">{dept.studentCount} Registered Students</p>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* PERMISSION-BASED PHOTO SHARING MODAL */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative my-8">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-blue-600">
              <ImageIcon className="w-5 h-5" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Permission-Based Photo Sharing Broadcast
              </h3>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              {/* Sender Details */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sender Name (Included in Post) *
                  </label>
                  <input
                    type="text"
                    value={postAuthorName}
                    onChange={(e) => setPostAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sender Role *
                  </label>
                  <select
                    value={postAuthorRole}
                    onChange={(e) => setPostAuthorRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value="VICE_PRINCIPAL">Vice Principal (VP)</option>
                    <option value="HOD">Head of Department (HOD)</option>
                    <option value="STAFF">Academic / Security Staff</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              {postAuthorRole !== 'VICE_PRINCIPAL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={postDepartmentCode}
                    onChange={(e) => setPostDepartmentCode(e.target.value as DepartmentCode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value="IT">IT - Information Technology</option>
                    <option value="CSE">CSE - Computer Science & Engineering</option>
                    <option value="AIDS">AIDS - Artificial Intelligence & Data Science</option>
                  </select>
                </div>
              )}

              {/* Target Audience Permission Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Audience Permissions *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'ALL', label: '🌐 All Campus (Students + Staff)' },
                    { val: 'FACULTY_ONLY', label: '👥 Faculty & Staff Only' },
                    { val: 'DEPT_ONLY', label: '🏛️ Department Only' },
                    { val: 'HOD_VP_CONFIDENTIAL', label: '🔒 HOD & VP Confidential' }
                  ].map((aud) => (
                    <button
                      type="button"
                      key={aud.val}
                      onClick={() => setPostVisibility(aud.val as PhotoAudience)}
                      className={`p-2 rounded-xl border text-left text-xs font-bold transition-all ${
                        postVisibility === aud.val
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Post Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Computing Lab Infrastructure Unveiling"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message / Circular Content *
                </label>
                <textarea
                  rows={3}
                  placeholder="Details for students and staff..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              {/* Photo Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photo Attachment
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postPhotoUrl}
                    onChange={(e) => setPostPhotoUrl(e.target.value)}
                    placeholder="https://... photo URL"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
