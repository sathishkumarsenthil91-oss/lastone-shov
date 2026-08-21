import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Property, StudentInquiry } from '../../types';
import { 
  getUserLikedProperties, 
  getUserListedProperties, 
  removeSavedPropertyFromSupabase, 
  deletePropertyFromSupabase 
} from '../../services/propertyService';
import { uploadToSupabaseStorage } from '../../services/storageService';
import { fetchInquiriesApi } from '../../services/api';
import { PropertyListModal } from '../properties/PropertyListModal';
import { 
  User as UserIcon, 
  Heart, 
  Building2, 
  MessageSquare, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Trash2, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Lock, 
  LogIn, 
  Sparkles, 
  Mail, 
  Phone, 
  AlertCircle,
  Database,
  ArrowRight,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface UserProfilePageProps {
  onOpenLoginModal: (mode?: 'otp' | 'login' | 'signup' | 'quick') => void;
  onNavigateToProperties: () => void;
  onNavigateToInquiries: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onOpenLoginModal,
  onNavigateToProperties,
  onNavigateToInquiries
}) => {
  const { user, role, isAuthenticated, addNotification, updateUserAvatar } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'liked' | 'listed' | 'inquiries'>('liked');
  const [likedProperties, setLikedProperties] = useState<Property[]>([]);
  const [listedProperties, setListedProperties] = useState<Property[]>([]);
  const [userInquiries, setUserInquiries] = useState<StudentInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPhoto(true);
    try {
      const res = await uploadToSupabaseStorage(file, {
        featureName: 'avatars',
        itemId: user.id,
        fileName: file.name,
        userId: user.id
      });
      if (res.signedUrl) {
        await updateUserAvatar(res.signedUrl);
      } else {
        const reader = new FileReader();
        reader.onload = async () => {
          if (typeof reader.result === 'string') {
            await updateUserAvatar(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Gallery upload fallback:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  // Load user data
  const loadUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [liked, listed, inqList] = await Promise.all([
        getUserLikedProperties(user.id),
        getUserListedProperties(user.id),
        fetchInquiriesApi()
      ]);

      setLikedProperties(liked);
      setListedProperties(listed);

      if (Array.isArray(inqList)) {
        // Filter inquiries belonging to current student/user
        const myInqs = inqList.filter(
          (inq: StudentInquiry) => inq.studentId === user.id || inq.studentName.toLowerCase() === user.name.toLowerCase()
        );
        setUserInquiries(myInqs.length > 0 ? myInqs : inqList.slice(0, 3));
      }
    } catch (err) {
      console.warn('Error loading user profile properties:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  // Handle unlike
  const handleUnlike = async (propertyId: string, propertyTitle: string) => {
    if (!user) return;
    setLikedProperties(prev => prev.filter(p => p.id !== propertyId));
    await removeSavedPropertyFromSupabase(user.id, propertyId);
    addNotification('Removed from Saved', `"${propertyTitle}" was removed from your liked properties.`, 'info');
  };

  // Handle delete listing
  const handleDeleteListing = async (propertyId: string, propertyTitle: string) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete listing "${propertyTitle}"?`)) return;

    setListedProperties(prev => prev.filter(p => p.id !== propertyId));
    await deletePropertyFromSupabase(propertyId, user.id);
    addNotification('Listing Deleted', `"${propertyTitle}" was removed from the database.`, 'success');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            User Profile & Saved Properties
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Please log in with Supabase to view your liked properties, managed listings, and institutional inquiries.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onOpenLoginModal('signup')}
              className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Sign Up Free
            </button>
            <button
              onClick={() => onOpenLoginModal('login')}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Log In (Supabase)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in">
      
      {/* Hidden File Input for Profile Avatar */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleGalleryFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative group">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'}
              alt={user.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-md"
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
              title="Change Profile Photo from Gallery"
            >
              <ImageIcon className="w-5 h-5 text-sky-300" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer ring-2 ring-white dark:ring-slate-900 transition hover:scale-110"
              title="Upload Photo from Gallery"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {role}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.email}</span>
            </p>

            {user.departmentName && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                {user.departmentName} {user.studentId ? `• Reg ID: ${user.studentId}` : ''}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                <Database className="w-3 h-3" />
                <span>Supabase UID: {user.id.slice(0, 16)}...</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowListModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>List New Property</span>
          </button>

          <button
            onClick={onNavigateToProperties}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Browse Market</span>
          </button>
        </div>

      </div>

      {/* Profile Section Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
        
        <button
          onClick={() => setActiveSubTab('liked')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'liked'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeSubTab === 'liked' ? 'fill-current' : ''}`} />
          <span>Properties I Liked</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400">
            {likedProperties.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('listed')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'listed'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Properties I Listed</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400">
            {listedProperties.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('inquiries')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'inquiries'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Inquiries & Grievances</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {userInquiries.length}
          </span>
        </button>

      </div>

      {/* TAB 1: PROPERTIES I LIKED */}
      {activeSubTab === 'liked' && (
        <div className="space-y-6">
          {likedProperties.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No saved properties yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you browse student housing and click the heart icon, they will be saved here in Supabase linked to your account.
              </p>
              <button
                onClick={onNavigateToProperties}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5"
              >
                <span>Browse Student Housing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedProperties.map(property => (
                <div
                  key={property.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-black uppercase">
                        {property.propertyType}
                      </div>

                      {/* Unlike Button */}
                      <button
                        onClick={() => handleUnlike(property.id, property.title)}
                        title="Remove from saved"
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md active:scale-75"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-blue-600 dark:text-blue-400 text-xs font-black shadow-md">
                        ₹{property.price.toLocaleString()}/{property.pricePeriod || 'mo'}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </p>

                      <div className="grid grid-cols-3 gap-1 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                        <span>{property.bedrooms} Bed</span>
                        <span>{property.bathrooms} Bath</span>
                        <span>{property.areaSqft} sqft</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${property.ownerEmail}?subject=Saved Property Inquiry: ${encodeURIComponent(property.title)}`}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center"
                    >
                      Contact Lister
                    </a>
                    <button
                      onClick={() => handleUnlike(property.id, property.title)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROPERTIES I LISTED */}
      {activeSubTab === 'listed' && (
        <div className="space-y-6">
          {listedProperties.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                You haven't listed any properties yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                List your campus apartment, student PG room, or research studio to reach students and faculty.
              </p>
              <button
                onClick={() => setShowListModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>List a Property</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listedProperties.map(property => (
                <div
                  key={property.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase shadow-md">
                        Active Listing
                      </div>

                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-blue-600 dark:text-blue-400 text-xs font-black shadow-md">
                        ₹{property.price.toLocaleString()}/{property.pricePeriod || 'mo'}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-semibold">{property.propertyType}</span>
                        <span className="font-bold text-rose-500 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{property.likesCount || 0} saves</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      ID: {property.id}
                    </span>
                    <button
                      onClick={() => handleDeleteListing(property.id, property.title)}
                      className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Listing</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY INQUIRIES & GRIEVANCES (Retains inquiry table continuity) */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Submitted Student Inquiries to HOD, VP & Council
            </h3>
            <button
              onClick={onNavigateToInquiries}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Open Inquiries Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {userInquiries.map(inq => (
              <div
                key={inq.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      inq.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                      inq.status === 'IN_REVIEW' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}>
                      {inq.status}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Target: {inq.targetAuthority}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {inq.subject}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {inq.message}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">{inq.createdAt}</span>
                  <button
                    onClick={onNavigateToInquiries}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100"
                  >
                    View Thread
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property List Modal */}
      {showListModal && (
        <PropertyListModal
          isOpen={showListModal}
          onClose={() => setShowListModal(false)}
          onSuccess={(newProp) => {
            setListedProperties(prev => [newProp, ...prev]);
            setActiveSubTab('listed');
          }}
          onRequireLogin={() => onOpenLoginModal('login')}
        />
      )}

    </div>
  );
};
