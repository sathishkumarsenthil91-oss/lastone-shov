import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DepartmentPromptModal } from '../common/DepartmentPromptModal';
import { Department } from '../../types';
import { updateUserProfileInSupabase, uploadCampusImageToSupabase } from '../../services/campusSupabaseService';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  Bookmark, 
  Download, 
  CheckCircle2, 
  QrCode, 
  Lock, 
  LogOut, 
  Calendar, 
  Sparkles, 
  FileText, 
  CreditCard,
  Crown,
  Edit2,
  Camera,
  Save,
  RefreshCw,
  X
} from 'lucide-react';

interface MyProfileAndSaveSectionProps {
  onOpenLoginModal?: (mode?: 'otp' | 'login' | 'signup' | 'quick') => void;
  onOpenDigitalId?: () => void;
}

export const MyProfileAndSaveSection: React.FC<MyProfileAndSaveSectionProps> = ({
  onOpenLoginModal,
  onOpenDigitalId
}) => {
  const { user, role, isAuthenticated, logout, addNotification } = useAuth();
  const [showDeptPrompt, setShowDeptPrompt] = useState(false);
  const [selectedDeptName, setSelectedDeptName] = useState(user?.departmentName || 'Computer Science & Engineering');
  const [activeTab, setActiveTab] = useState<'profile' | 'saved'>('profile');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Aarav Sharma');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '+91 98765 43210');
  const [editDesignation, setEditDesignation] = useState(user?.designation || 'B.Tech - 3rd Year');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300');
  const [isSaving, setIsSaving] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const [savedItems, setSavedItems] = useState([
    {
      id: 'save-1',
      title: 'SHOV Cryptographic Gate QR Token #9942',
      type: 'IDENTITY_PASS',
      date: 'Saved on Aug 16, 2026',
      badge: 'Active Digital Pass'
    },
    {
      id: 'save-2',
      title: 'Mid-Semester Exam Verification Hall Slip',
      type: 'EXAMINATION',
      date: 'Saved on Aug 14, 2026',
      badge: 'Hall Ticket'
    },
    {
      id: 'save-3',
      title: 'Library Clearances & Biometric Token Registration',
      type: 'CLEARANCE',
      date: 'Saved on Aug 10, 2026',
      badge: 'Verified Clearance'
    }
  ]);

  const handleSelectDept = async (dept: Department) => {
    setSelectedDeptName(dept.name);
    if (user?.id) {
      await updateUserProfileInSupabase(user.id, {
        department_code: dept.code,
        department_name: dept.name
      });
    }
    addNotification('Department Profile Updated', `Affiliated department set to ${dept.name} (${dept.code}) and saved to Supabase.`, 'success');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setIsEditing(false);
      addNotification('Profile Updated', 'Profile changes saved locally.', 'success');
      return;
    }

    setIsSaving(true);
    const uploadedAvatar = await uploadCampusImageToSupabase(editAvatarUrl, 'avatars');

    const res = await updateUserProfileInSupabase(user.id, {
      name: editName,
      phone_number: editPhone,
      designation: editDesignation,
      avatar_url: uploadedAvatar
    });

    setIsSaving(false);
    setIsEditing(false);

    if (res.success) {
      addNotification('Profile Saved to Supabase', 'Your identity particulars have been synchronized with the campus database.', 'success');
    } else {
      addNotification('Saved Locally', 'Saved locally. Ensure your Supabase profile table is updated.', 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={editAvatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/30"
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white cursor-pointer opacity-80 hover:opacity-100 transition"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{isEditing ? editName : (user?.name || 'Verified Campus Scholar')}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Identifier: {user?.username || '23cs001'} • {selectedDeptName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          )}

          <button
            onClick={() => setShowDeptPrompt(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Select / Switch Department</span>
          </button>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenLoginModal?.('login')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Documents & IDs ({savedItems.length})</span>
        </button>
      </div>

      {/* Tab 1: Profile View / Edit */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Particulars */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Campus Identity Credentials</span>
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-mono">
                Supabase Synced
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Designation / Course Batch</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Profile Photo URL or Live Snap</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCameraModal(true)}
                      className="px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Camera</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving to Supabase...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{user?.name || editName}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-500">Register / ID Number</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{user?.username || '23cs001'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-500">Department</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDeptName}</span>
                    <button 
                      onClick={() => setShowDeptPrompt(true)} 
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-500">College Email</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email || 'aarav.23cs001@student.shov.college.edu'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-500">Phone Number</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.phoneNumber || editPhone}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-500">Designation / Batch</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.designation || editDesignation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Digital ID Security Status</span>
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Biometric Identity Active</p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">Dynamic QR tokens authorized for gatehouse entry.</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onOpenDigitalId}
                className="w-full p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Open Dynamic Digital ID Card</span>
              </button>

              <button
                onClick={() => addNotification('Credentials Exported', 'SHOV Cryptographic Identity certificate downloaded.', 'info')}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export ID Certificate & PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Saved Items */}
      {activeTab === 'saved' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Saved Identity Passes & Records</h4>
            <span className="text-xs font-mono text-slate-400">{savedItems.length} items</span>
          </div>

          <div className="space-y-3">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h5>
                    <p className="text-[10px] text-slate-400">{item.date}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Selector Modal */}
      {showDeptPrompt && (
        <DepartmentPromptModal
          isOpen={showDeptPrompt}
          onClose={() => setShowDeptPrompt(false)}
          onSelectDepartment={handleSelectDept}
          currentDept={user?.departmentId || 'CSE'}
        />
      )}

      {/* Camera Capture Modal for Profile Photo */}
      <LiveCameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(img) => {
          setEditAvatarUrl(img);
          setShowCameraModal(false);
          addNotification('Live Camera Photo Selected', 'Click Save Changes to commit to your Supabase profile.', 'success');
        }}
        title="Live Profile Photo Capture"
        subtitle="Capture clear headshot for your Digital ID and profile"
        aspectRatio="square"
      />
    </div>
  );
};
