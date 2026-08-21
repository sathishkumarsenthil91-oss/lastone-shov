import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { avsCampusPhoto } from '../../data/mockData';
import { RoleLiveVerifiedBadge, InstagramTickIcon } from '../common/RoleLiveVerifiedBadge';
import { ImageLightbox } from '../common/ImageLightbox';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { uploadToSupabaseStorage } from '../../services/storageService';
import { 
  Crown, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Mail, 
  Phone, 
  Award, 
  FileCheck2, 
  ShieldCheck,
  Scale,
  Landmark,
  BadgeCheck,
  Camera,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';

interface VpDigitalIDCardProps {
  onPhotoUpdated?: (newPhoto: string) => void;
}

export const VpDigitalIDCard: React.FC<VpDigitalIDCardProps> = ({ onPhotoUpdated }) => {
  const { user, addNotification, updateUserAvatar } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const vpName = user?.name || 'Dr. Elizabeth Montgomery';
  const vpId = user?.staffId || 'EXEC-VP-001';
  const designation = 'Vice Principal & Dean of Academic Governance';
  const department = 'Academic Governance & Executive Administration';
  const email = user?.email || 'vp.academic@avsct.edu.in';
  const phone = user?.phoneNumber || '+91 98765 33445';
  const avatarUrl = localPhoto || user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300';
  const chamberRoom = 'Vice Principal Office Suite 102, Admin Tower';
  const validUntil = '31-12-2029';

  const handlePhotoChange = (newUrl: string) => {
    setLocalPhoto(newUrl);
    if (onPhotoUpdated) {
      onPhotoUpdated(newUrl);
    } else {
      updateUserAvatar(newUrl);
    }
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await uploadToSupabaseStorage(file, {
        featureName: 'avatars',
        itemId: vpId,
        fileName: file.name,
        userId: user?.id || vpId
      });
      if (res.signedUrl) {
        handlePhotoChange(res.signedUrl);
        addNotification('Vice Principal Photo Updated', 'Your executive portrait has been uploaded from gallery.', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            handlePhotoChange(reader.result as string);
            addNotification('Vice Principal Photo Updated', 'Your executive portrait has been uploaded from gallery.', 'success');
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

  const handleDownload = () => {
    addNotification('Vice Principal Card Exported', `Official executive credential for ${vpName} saved.`, 'success');
  };

  return (
    <div className="w-full max-w-2xl mx-auto select-none space-y-4">
      
      {/* Hidden File Input for Device Gallery Photo Selection */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleGalleryFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photoUrl={avatarUrl}
        title={vpName}
        subtitle={`VP ID: ${vpId} • ${designation}`}
        badge="AVS College of Technology • Executive Council"
        status="ACTIVE"
        details={[
          { label: 'Executive ID', value: vpId },
          { label: 'Designation', value: designation },
          { label: 'Division', value: department },
          { label: 'Executive Suite', value: chamberRoom },
          { label: 'Executive Email', value: email },
          { label: 'Direct Phone', value: phone },
          { label: 'Institutional Mandate', value: `Valid Until ${validUntil}` }
        ]}
      />

      {/* Top Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <RoleLiveVerifiedBadge role="VICE_PRINCIPAL" size="sm" customLabel="VP VERIFIED" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Upload Photo from Gallery"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Upload Photo</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Save Credential</span>
          </button>
          
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Show Front' : 'Show Back (Executive Seal)'}</span>
          </button>
        </div>
      </div>

      {/* 3D FLIP CONTAINER - STABILIZED WITH CENTER TRANSFORM ORIGIN TO PREVENT DOWNSIDE DRIFT */}
      <div className="relative w-full min-h-[350px] sm:min-h-[360px] h-[350px] sm:h-[360px] perspective-1000 overflow-visible">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0.0, 0.2, 1] }}
          className="w-full h-full relative transform-style-3d shadow-2xl rounded-3xl"
          style={{ transformOrigin: 'center center', transformStyle: 'preserve-3d' }}
        >
          
          {/* ========================================================= */}
          {/* VP CARD FRONT SIDE                                         */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white text-slate-900 border-2 border-purple-800/40 flex flex-col justify-between backface-hidden shadow-2xl p-5 sm:p-6 select-text relative"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            
            {/* Campus Background Texture */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.10] mix-blend-multiply select-none z-0">
              <img
                src={avsCampusPhoto}
                alt="AVS Campus"
                className="w-full h-full object-cover filter contrast-125 saturate-120"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-white/40" />
            </div>

            {/* Top Purple/Gold Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-800 via-amber-500 to-purple-800" />

            {/* 1. Header */}
            <div className="relative z-10 flex items-start justify-between border-b border-slate-200 pb-3 mt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-1.5 flex items-center justify-center shadow-md">
                  <Crown className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black tracking-tight text-purple-950">EXECUTIVE ID</span>
                    <span className="text-[10px] font-extrabold tracking-widest text-purple-700 uppercase">— VICE PRINCIPAL —</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">
                    GOVERNANCE • ACADEMICS • LEADERSHIP
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-sm sm:text-base font-black text-slate-950 tracking-tight uppercase leading-tight">
                  AVS COLLEGE<br className="sm:hidden" /> OF TECHNOLOGY
                </h1>
                <p className="text-[9px] font-bold text-purple-700">
                  Office of Vice Principal & Academic Affairs
                </p>
              </div>
            </div>

            {/* 2. Middle Particulars */}
            <div className="relative z-10 my-auto py-2 grid grid-cols-12 gap-4 items-center">
              
              {/* Photo & Name */}
              <div className="col-span-4 flex flex-col items-center text-center space-y-1.5">
                <div className="relative group">
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden ring-3 ring-purple-900/30 shadow-lg bg-slate-100 cursor-pointer relative"
                  >
                    <img
                      src={avatarUrl}
                      alt={vpName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold gap-1 rounded-2xl">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>HD</span>
                    </div>
                  </div>

                  {/* Dual Photo Controls: Gallery Pick & Live Camera */}
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        galleryInputRef.current?.click();
                      }}
                      className="p-1.5 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer ring-2 ring-white hover:scale-110"
                      title="Upload Photo from Device Gallery"
                    >
                      <ImageIcon className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCameraCaptureOpen(true);
                      }}
                      className="p-1.5 rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-all cursor-pointer ring-2 ring-white hover:scale-110"
                      title="Capture Live Snapshot"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <h2 className="text-xs sm:text-sm font-black text-slate-950 tracking-tight leading-tight">
                      {vpName}
                    </h2>
                    <InstagramTickIcon fillColor="#f59e0b" sizeClass="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-extrabold text-amber-700 block mt-0.5 uppercase">
                    VICE PRINCIPAL & DEAN
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="col-span-8 space-y-1.5">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <div className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <InstagramTickIcon fillColor="#f59e0b" sizeClass="w-3 h-3" />
                    <span>EXECUTIVE PASS</span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-slate-950 font-mono tracking-tight">
                    {vpId}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] sm:text-xs text-slate-800 font-medium">
                  
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Award className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Role</span>
                    <span className="font-bold text-slate-950 truncate">: {designation}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Scale className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Governance</span>
                    <span className="font-bold text-purple-900 truncate">: Inter-Department Academic Council</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Landmark className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Executive Suite</span>
                    <span className="font-bold text-slate-950 truncate">: {chamberRoom}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Mail className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Email</span>
                    <span className="font-bold text-slate-950 truncate font-mono">: {email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Phone</span>
                    <span className="font-bold text-slate-950 font-mono">: {phone}</span>
                  </div>

                </div>
              </div>

            </div>

            {/* 3. Footer */}
            <div className="relative z-10 border-t border-slate-200 pt-2.5 flex items-end justify-between">
              <div className="space-y-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">
                    Institutional Mandate
                  </span>
                  <span className="text-sm font-black text-purple-950 font-mono">
                    VALID UNTIL {validUntil}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5">
                  <RoleLiveVerifiedBadge role="VICE_PRINCIPAL" size="sm" showLabel={false} />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-xs">
                    <Crown className="w-3 h-3 text-slate-950" />
                    <span>EXECUTIVE TIER 1</span>
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex items-stretch rounded-xl border-2 border-purple-950 overflow-hidden shadow-md bg-white">
                <div className="p-1">
                  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
                    <rect x="0" y="0" width="30" height="30" fill="#3b0764" rx="3" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="10" y="10" width="10" height="10" fill="#9333ea" rx="1" />

                    <rect x="70" y="0" width="30" height="30" fill="#3b0764" rx="3" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="80" y="10" width="10" height="10" fill="#9333ea" rx="1" />

                    <rect x="0" y="70" width="30" height="30" fill="#3b0764" rx="3" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="10" y="80" width="10" height="10" fill="#9333ea" rx="1" />

                    <path d="M 35 5 H 45 V 15 H 35 Z M 50 5 H 65 V 15 H 50 Z M 35 20 H 50 V 30 H 35 Z" fill="#3b0764" />
                    <path d="M 5 35 H 15 V 45 H 5 Z M 20 35 H 30 V 45 H 20 Z M 35 35 H 45 V 45 H 35 Z M 50 35 H 60 V 45 H 50 Z M 65 35 H 95 V 45 H 65 Z" fill="#3b0764" />
                    <path d="M 5 50 H 25 V 60 H 5 Z M 30 50 H 40 V 60 H 30 Z M 45 50 H 65 V 60 H 45 Z M 70 50 H 95 V 60 H 70 Z" fill="#3b0764" />
                    <path d="M 35 70 H 45 V 80 H 35 Z M 50 70 H 65 V 80 H 50 Z M 70 70 H 80 V 80 H 70 Z M 85 70 H 95 V 80 H 85 Z" fill="#3b0764" />
                    <path d="M 35 85 H 50 V 95 H 35 Z M 55 85 H 70 V 95 H 55 Z M 75 85 H 95 V 95 H 75 Z" fill="#3b0764" />
                  </svg>
                </div>
                <div className="bg-purple-950 text-white px-1 py-1 flex items-center justify-center">
                  <span className="text-[8px] font-black tracking-widest uppercase [writing-mode:vertical-lr] rotate-180">
                    VICE PRINCIPAL
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* VP CARD BACK SIDE                                         */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-slate-900 text-white border-2 border-purple-800 flex flex-col justify-between backface-hidden shadow-2xl p-5 sm:p-6 select-text"
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            
            {/* Magnetic Stripe Bar */}
            <div className="h-9 -mx-6 -mt-6 bg-slate-950 border-b border-purple-500/20 flex items-center justify-between px-6">
              <span className="text-[9px] font-mono text-purple-400">AVS-EXECUTIVE-GOVERNANCE-ACCESS-KEY</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              </div>
            </div>

            <div className="my-auto space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <FileCheck2 className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider font-mono">
                  VICE PRINCIPAL EXECUTIVE AUTHORITY
                </h3>
              </div>

              <ul className="text-[10px] space-y-1.5 text-slate-300 list-disc pl-4 leading-snug">
                <li>Authorized to grant inter-departmental clearances, approve fine waivers, and review disciplinary appeals.</li>
                <li>Direct governance over all department HODs and examination controller wings.</li>
                <li>Executive signatory for college accreditation, NAAC portfolios, and Anna University audit protocols.</li>
              </ul>

              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">VP Secretarial Desk Direct</span>
                  <span className="font-mono font-bold text-purple-300">+91 (0427) 244-1002</span>
                </div>
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
            </div>

            {/* Signature & Barcode */}
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">
                  EXECUTIVE SEAL CODE
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-400">
                  ||||||| |||| | |||||| |||||
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block">
                  VICE PRINCIPAL SIGNATURE
                </span>
                <span className="text-[11px] font-serif italic text-amber-300">
                  Dr. E. Montgomery
                </span>
              </div>
            </div>

          </div>

        </motion.div>
      </div>

      {/* Live Camera Snapshot Modal for Vice Principal ID */}
      <LiveCameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCapture={(photoData) => {
          handlePhotoChange(photoData);
          addNotification('Live Snapshot Saved', 'Your executive identity photo has been updated from camera.', 'success');
        }}
        studentName={vpName}
      />

    </div>
  );
};
