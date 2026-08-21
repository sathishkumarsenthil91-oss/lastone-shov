import React, { useState, useRef } from 'react';
import { Student } from '../../types';
import { ImageLightbox } from '../common/ImageLightbox';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { RoleLiveVerifiedBadge, InstagramTickIcon } from '../common/RoleLiveVerifiedBadge';
import { motion, AnimatePresence } from 'motion/react';
import { rohitKumarPhoto, avsCampusPhoto, INITIAL_STUDENTS } from '../../data/mockData';
import { uploadToSupabaseStorage } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  RotateCw, 
  CheckCircle2, 
  Building2,
  Calendar,
  Sparkles,
  Maximize2,
  Camera,
  Mail,
  Phone,
  User,
  GraduationCap,
  Cake,
  AlertTriangle,
  QrCode,
  Wifi,
  Fingerprint,
  PhoneCall,
  Globe,
  Scan,
  Check,
  X,
  Lock,
  Cpu,
  BadgeCheck,
  Activity,
  Layers,
  Copy,
  Pencil,
  Image as ImageIcon
} from 'lucide-react';

interface DigitalIDCardProps {
  student?: Student;
  onReportLost?: () => void;
  onPhotoUpdated?: (newPhotoUrl: string) => void;
  onOpenDepartmentPrompt?: () => void;
  onOpenEditModal?: () => void;
  customDepartmentName?: string;
}

export const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ 
  student = INITIAL_STUDENTS[0], 
  onReportLost, 
  onPhotoUpdated,
  onOpenDepartmentPrompt,
  onOpenEditModal,
  customDepartmentName
}) => {
  const { updateUserAvatar, addNotification } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCampusLightboxOpen, setIsCampusLightboxOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [qrType, setQrType] = useState<'turnstile' | 'biometric' | 'iso'>('turnstile');
  const [copiedToken, setCopiedToken] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const displayDept = customDepartmentName || student.departmentName || student.department || 'Computer Science & Engineering';
  const photoToUse = localPhoto || student.photoUrl || rohitKumarPhoto;

  const handlePhotoChange = (newUrl: string) => {
    setLocalPhoto(newUrl);
    if (onPhotoUpdated) {
      onPhotoUpdated(newUrl);
    } else {
      updateUserAvatar(newUrl);
    }
  };

  const qrPayload = `AVSCT://STUDENT/VERIFY?reg=${student.registerNumber}&id=${student.studentIdNumber || 'STU-10001'}&type=${qrType}&ts=${Date.now()}`;

  const handleCopyToken = () => {
    navigator.clipboard?.writeText?.(qrPayload);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await uploadToSupabaseStorage(file, {
        featureName: 'avatars',
        itemId: student.id || student.registerNumber,
        fileName: file.name,
        userId: student.id || student.registerNumber
      });
      if (res.signedUrl) {
        handlePhotoChange(res.signedUrl);
        addNotification('Gallery Photo Attached', 'Your ID card profile picture has been updated.', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            handlePhotoChange(reader.result as string);
            addNotification('Gallery Photo Attached', 'Your ID card profile picture has been updated.', 'success');
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

  return (
    <div className="w-full max-w-2xl mx-auto select-none space-y-4">
      
      {/* Lightbox Modal for Student Photo */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photoUrl={photoToUse}
        title={student.name}
        subtitle={`REG: ${student.registerNumber} | ID: ${student.studentIdNumber || 'STU-10001'}`}
        badge="AVS College of Technology"
        status={student.status}
        details={[
          { label: 'Register Number', value: student.registerNumber },
          { label: 'Department', value: displayDept },
          { label: 'Course & Year', value: `${student.course || 'B.E. Computer Science'} (${student.year || 3}rd Year)` },
          { label: 'Date of Birth', value: student.dateOfBirth || '15-06-2004' },
          { label: 'College Email', value: student.collegeEmail || 'rohit.kumar@avsct.edu.in' },
          { label: 'Phone', value: student.phoneNumber || '98765 43210' },
          { label: 'Valid Until', value: student.validUntil || '31-05-2027' }
        ]}
      />

      {/* Lightbox Modal for Campus Photo */}
      <ImageLightbox
        isOpen={isCampusLightboxOpen}
        onClose={() => setIsCampusLightboxOpen(false)}
        photoUrl={avsCampusPhoto}
        title="AVS College of Technology"
        subtitle="Main Academic Campus & Administrative Block"
        badge="Approved by AICTE • Anna University Affiliated"
        status="ACTIVE"
        details={[
          { label: 'Campus Name', value: 'AVS College of Technology' },
          { label: 'Counselling Code', value: '6107' },
          { label: 'Location', value: 'Salem, Tamil Nadu, India' },
          { label: 'Affiliation', value: 'Anna University, Chennai' },
          { label: 'Accreditation', value: 'AICTE Approved | NAAC Grade A+' }
        ]}
      />

      {/* Live Camera Snapshot Modal */}
      <LiveCameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCapture={(newPhoto) => {
          onPhotoUpdated?.(newPhoto);
        }}
        title="Student Photo Capture"
        subtitle={`Update biometric photo for ${student.name} (${student.registerNumber})`}
      />

      {/* Instant Live Verification Modal */}
      <AnimatePresence>
        {isVerifyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Scan className="w-5 h-5 text-sky-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <span>Live Student Verification Scan</span>
                      <InstagramTickIcon fillColor="#38bdf8" sizeClass="w-4 h-4" />
                    </h3>
                    <p className="text-[11px] text-sky-200/80">AVS Institutional Digital Trust Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="p-2 rounded-xl text-sky-200 hover:text-white hover:bg-white/10 cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                
                {/* Result Card */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                        100% MATCH • VERIFIED ACTIVE
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                        {student.registerNumber}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {student.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {displayDept} • Year {student.year || 3}
                    </p>
                  </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Biometric Facial Match</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>99.8% Match Confirmed</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Gate Turnstile Security</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Clearance Granted</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Fines & Dues Status</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>No Pending Dues</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Card Validity</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      Valid Until {student.validUntil || '31-05-2027'}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Hash Token */}
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-slate-400">QR Payload: </span>
                    <span className="font-semibold">{qrPayload}</span>
                  </div>
                  <button
                    onClick={handleCopyToken}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer transition shrink-0"
                    title="Copy QR Payload"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end">
                <button
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Bar Controls with Staggered Fade-in */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex items-center justify-between px-1 sm:px-2 flex-wrap gap-2"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <RoleLiveVerifiedBadge role="STUDENT" size="sm" customLabel="STUDENT ID" />
          <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] sm:text-[11px] font-bold border border-blue-200 dark:border-blue-800">
            Card Type: <strong>Student ID ({isFlipped ? 'Back' : 'Front'})</strong>
          </span>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold">
            {student.registerNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Edit Identity Details Button */}
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              title="Edit student particulars, photo and contact details"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-950" />
              <span className="text-[11px] sm:text-xs">Edit Identity</span>
            </button>
          )}

          {/* Quick Scan to Verify Button */}
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            title="Scan and verify student credentials instantly"
          >
            <Scan className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[11px] sm:text-xs">Verify</span>
          </button>

          {/* View Campus Button */}
          <button
            onClick={() => setIsCampusLightboxOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            title="View AVS Campus Building Photo"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline text-xs">Campus Photo</span>
          </button>

          {/* 3D Flip Card Button (Front vs Back) */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">{isFlipped ? 'Show Front Side' : 'Show Back Side'}</span>
          </button>
        </div>
      </motion.div>

      {/* 3D FLIP CONTAINER - STABILIZED WITH FIXED DIMS & PURE 3D ROTATION WITHOUT DOWNSIDE DRIFT */}
      {/* Hidden Gallery Input for ID Card */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleGalleryFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full relative min-h-[350px] sm:min-h-[360px] h-[350px] sm:h-[360px] perspective-1000">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0.0, 0.2, 1] }}
          className="w-full h-full relative transform-style-3d shadow-2xl rounded-3xl"
          style={{ transformOrigin: 'center center' }}
        >
          
          {/* ========================================================= */}
          {/* CARD FRONT SIDE (Ultra Clean Institutional White Design)  */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white text-slate-900 border-2 border-slate-200/90 flex flex-col justify-between backface-hidden shadow-2xl select-text"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            
            {/* Holographic Entry Light Sheen Sweep */}
            <motion.div
              initial={{ x: '-150%', opacity: 0.9 }}
              animate={{ x: '250%', opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.6, delay: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none z-30"
            />
            
            {/* Subtle Guilloché Geometric Watermark Lines for Anti-Counterfeit Look */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-600/5 via-sky-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* 1. CARD TOP INSTITUTIONAL HEADER BAR */}
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white px-5 sm:px-6 py-3 flex items-center justify-between border-b-2 border-amber-400 relative z-10 shadow-sm">
              {/* Left Brand: SHOV Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-1.5 flex items-center justify-center shadow-md ring-2 ring-white/20">
                  <ShieldCheck className="w-5 h-5 text-sky-200" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black tracking-tight text-white">SHOV</span>
                    <span className="text-[9px] font-extrabold tracking-widest text-sky-300 uppercase">SECURE PASS</span>
                  </div>
                  <p className="text-[7.5px] font-mono font-bold text-slate-300 tracking-wider uppercase">
                    OFFICIAL DIGITAL IDENTITY
                  </p>
                </div>
              </div>

              {/* Right: College Name & Accreditations */}
              <div className="text-right">
                <h1 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase leading-tight">
                  AVS COLLEGE OF TECHNOLOGY
                </h1>
                <p className="text-[8px] sm:text-[8.5px] font-medium text-amber-300 tracking-tight">
                  AICTE Approved • Anna University Affiliated • Code: 6107
                </p>
              </div>
            </div>

            {/* 2. CARD MIDDLE PARTICULARS & PHOTO (ALTERED CRISP GRID) */}
            <div className="relative z-10 my-auto px-5 sm:px-6 py-2 grid grid-cols-12 gap-4 sm:gap-5 items-center">
              
              {/* Left Column: Photo & Name & Verified Tag */}
              <div className="col-span-4 flex flex-col items-center text-center space-y-1.5">
                <div className="relative group">
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden ring-3 ring-blue-900/20 shadow-lg cursor-pointer transition-all group-hover:scale-105 bg-white relative"
                  >
                    <img
                      src={photoToUse}
                      alt={student.name}
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
                      className="p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer ring-2 ring-white hover:scale-110"
                      title="Capture Live Snapshot / Open Camera Modal"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight">
                    {student.name || 'Rohit Kumar'}
                  </h2>
                  <InstagramTickIcon fillColor="#3b82f6" sizeClass="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Right Column: Structured Information Grid */}
              <div className="col-span-8 space-y-1.5">
                
                {/* Header ID Pill with Verified Status */}
                <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-slate-100">
                  <div className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                    <InstagramTickIcon fillColor="#3b82f6" sizeClass="w-3 h-3" />
                    <span>AUTHENTICATED STUDENT</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 font-mono tracking-tight">
                    {student.studentIdNumber || 'STU-10001'}
                  </span>
                </div>

                {/* 2-Column Responsive Information Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[10.5px] sm:text-[11px] text-slate-800 font-medium">
                  
                  {/* Register Number */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[8px]">
                      <User className="w-2 h-2" />
                    </span>
                    <span className="text-slate-500 font-semibold w-16">Reg No:</span>
                    <span className="font-bold text-slate-900 font-mono">{student.registerNumber || '23CS001'}</span>
                  </div>

                  {/* Course & Year */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[8px]">
                      <GraduationCap className="w-2 h-2" />
                    </span>
                    <span className="text-slate-500 font-semibold w-16">Year:</span>
                    <span className="font-bold text-slate-900">Year {student.year || 3} (Junior)</span>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[8px]">
                      <Building2 className="w-2 h-2" />
                    </span>
                    <span className="text-slate-500 font-semibold w-16">Dept:</span>
                    <span 
                      onClick={onOpenDepartmentPrompt}
                      className={`font-bold text-slate-900 truncate ${onOpenDepartmentPrompt ? 'cursor-pointer hover:underline text-blue-600' : ''}`}
                    >
                      {displayDept}
                    </span>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[8px]">
                      <Cake className="w-2 h-2" />
                    </span>
                    <span className="text-slate-500 font-semibold w-16">DOB:</span>
                    <span className="font-bold text-slate-900 font-mono">{student.dateOfBirth || '15-06-2004'}</span>
                  </div>

                  {/* Blood Group */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-[8px]">
                      <Activity className="w-2 h-2" />
                    </span>
                    <span className="text-slate-500 font-semibold w-16">Blood:</span>
                    <span className="font-bold text-red-600 font-mono">{student.bloodGroup || 'O+ Positive'}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-1.5 sm:col-span-2 truncate">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[8px]">
                      <Mail className="w-2 h-2" />
                    </span>
                    <span className="text-slate-500 font-semibold w-16">Email:</span>
                    <span className="font-bold text-slate-900 truncate font-mono text-[10px]">
                      {student.collegeEmail || 'rohit.kumar@avsct.edu.in'}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[8px]">
                      <Phone className="w-2 h-2" />
                    </span>
                    <span className="text-slate-500 font-semibold w-16">Phone:</span>
                    <span className="font-bold text-slate-900 font-mono">{student.phoneNumber || '+91 98765 43210'}</span>
                  </div>

                </div>

              </div>

            </div>

            {/* 3. CARD FOOTER: SECURITY TOKEN, BARCODE & VALIDITY */}
            <div className="bg-slate-50 px-5 sm:px-6 py-2.5 border-t border-slate-200 flex items-center justify-between relative z-10">
              
              {/* Left Validity */}
              <div>
                <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider block">
                  Valid Period
                </span>
                <span className="text-xs font-black text-slate-900 font-mono">
                  {student.validityYear || '2023 - 2027'} (Until {student.validUntil || '31-05-2027'})
                </span>
              </div>

              {/* Middle Barcode Simulation */}
              <div className="hidden sm:flex flex-col items-center">
                <div className="flex items-center gap-[2px] h-5">
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2].map((w, i) => (
                    <span key={i} className={`h-full bg-slate-900`} style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[7.5px] font-mono tracking-widest text-slate-500 uppercase">
                  {student.registerNumber}
                </span>
              </div>

              {/* Right Status Badge */}
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{student.status || 'ACTIVE'}</span>
                </span>
              </div>

            </div>

          </div>

          {/* ========================================================= */}
          {/* CARD BACK SIDE (Enhanced Dynamic QR & Verification Engine) */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white text-slate-900 border-2 border-slate-200/90 flex flex-col justify-between transform-rotateY-180 backface-hidden shadow-2xl select-text relative"
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            
            {/* Subtle Geometric Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Top Brand Header */}
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white px-5 sm:px-6 py-2.5 flex items-center justify-between border-b-2 border-blue-500 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-sky-200" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight">AVS COLLEGE OF TECHNOLOGY</span>
                  <p className="text-[7.5px] font-mono text-sky-300 uppercase tracking-wider">
                    SECURE CREDENTIAL VERIFICATION BACKPLANE
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono text-slate-300">
                <Wifi className="w-3 h-3 text-sky-400 animate-pulse" />
                <span>NFC ENABLED</span>
              </div>
            </div>

            {/* Middle Section: Instructions & Dynamic Interactive QR Engine */}
            <div className="relative z-10 my-auto px-5 sm:px-6 py-2 grid grid-cols-12 gap-4 sm:gap-5 items-center">
              
              {/* Left Column: Official Rules & Principal Signature */}
              <div className="col-span-6 sm:col-span-7 space-y-2 text-left">
                <div>
                  <h3 className="text-[10px] font-black text-slate-900 tracking-wider uppercase border-b border-slate-200 pb-0.5">
                    CARD USAGE RULES & REGULATIONS
                  </h3>
                  <ul className="mt-1 space-y-0.5 text-[9px] sm:text-[10px] text-slate-600 font-medium leading-tight">
                    <li className="flex items-start gap-1">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Property of <strong className="text-slate-900">AVS College of Technology</strong>.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Must be worn and displayed inside campus at all times.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Non-transferable; subject to immediate proctorial audit.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>If found, return to Administration Office (Salem, TN).</span>
                    </li>
                  </ul>
                </div>

                {/* Principal Signature & Emergency Row */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <div>
                    <div className="h-5 flex items-end">
                      <span className="font-serif italic font-bold text-blue-950 text-xs tracking-wide transform -rotate-6 block">
                        J. Davis
                      </span>
                    </div>
                    <div className="border-t border-slate-400 w-24 pt-0.5">
                      <p className="text-[8px] font-black text-slate-900">Principal</p>
                    </div>
                  </div>

                  <div className="px-2 py-1 rounded-xl bg-slate-100 text-slate-800 text-[8.5px] font-mono">
                    <p className="font-bold text-slate-900">Emergency: +91 12345 67890</p>
                    <p className="text-slate-500">info@avsct.edu.in</p>
                  </div>
                </div>

              </div>

              {/* Right Column: DYNAMIC MULTI-TYPE QR CODE WITH SCAN BEAM ANIMATION */}
              <div className="col-span-6 sm:col-span-5 flex flex-col items-center justify-center space-y-1.5">
                
                {/* QR Type Selector Pills */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setQrType('turnstile')}
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase transition cursor-pointer ${
                      qrType === 'turnstile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Gate QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrType('biometric')}
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase transition cursor-pointer ${
                      qrType === 'biometric' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Biometric
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrType('iso')}
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase transition cursor-pointer ${
                      qrType === 'iso' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Encrypted
                  </button>
                </div>

                {/* High-Contrast Crisp QR Code Card with Live Laser Sweep */}
                <div 
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="relative p-2 rounded-2xl bg-white border-2 border-slate-900 shadow-md cursor-pointer group hover:border-blue-600 transition-all overflow-hidden"
                  title="Click to simulate live gate scanner verification"
                >
                  {/* Laser Scan Beam Animation */}
                  <motion.div
                    animate={{ y: [0, 80, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] z-20 pointer-events-none"
                  />

                  {/* SVG QR Code Pattern */}
                  <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24">
                    {/* Corner 1 */}
                    <rect x="2" y="2" width="28" height="28" rx="4" fill="#0f172a" />
                    <rect x="6" y="6" width="20" height="20" rx="2" fill="#ffffff" />
                    <rect x="10" y="10" width="12" height="12" rx="2" fill={qrType === 'biometric' ? '#10b981' : '#1e3a8a'} />

                    {/* Corner 2 */}
                    <rect x="70" y="2" width="28" height="28" rx="4" fill="#0f172a" />
                    <rect x="74" y="6" width="20" height="20" rx="2" fill="#ffffff" />
                    <rect x="78" y="10" width="12" height="12" rx="2" fill={qrType === 'biometric' ? '#10b981' : '#1e3a8a'} />

                    {/* Corner 3 */}
                    <rect x="2" y="70" width="28" height="28" rx="4" fill="#0f172a" />
                    <rect x="6" y="74" width="20" height="20" rx="2" fill="#ffffff" />
                    <rect x="10" y="78" width="12" height="12" rx="2" fill={qrType === 'biometric' ? '#10b981' : '#1e3a8a'} />

                    {/* Dynamic QR Modules */}
                    <path d="M 36 6 H 44 V 14 H 36 Z M 48 6 H 64 V 14 H 48 Z M 36 20 H 48 V 28 H 36 Z M 52 20 H 64 V 28 H 52 Z" fill="#0f172a" />
                    <path d="M 6 36 H 14 V 44 H 6 Z M 20 36 H 28 V 44 H 20 Z M 34 36 H 46 V 44 H 34 Z M 52 36 H 62 V 44 H 52 Z M 68 36 H 94 V 44 H 68 Z" fill="#0f172a" />
                    <path d="M 6 50 H 24 V 58 H 6 Z M 30 50 H 40 V 58 H 30 Z M 46 50 H 64 V 58 H 46 Z M 70 50 H 94 V 58 H 70 Z" fill="#0f172a" />
                    <path d="M 36 70 H 44 V 78 H 36 Z M 50 70 H 64 V 78 H 50 Z M 70 70 H 80 V 78 H 70 Z M 86 70 H 94 V 78 H 86 Z" fill="#0f172a" />
                    <path d="M 36 86 H 50 V 94 H 36 Z M 56 86 H 68 V 94 H 56 Z M 74 86 H 94 V 94 H 74 Z" fill="#0f172a" />

                    {/* Center Institutional Badge */}
                    <circle cx="50" cy="50" r="8" fill="#1e3a8a" />
                    <circle cx="50" cy="50" r="6.5" fill="#ffffff" />
                    <path d="M 47 50 L 49 52 L 53 48" stroke="#1e3a8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>

                  {/* Click to Verify Hint */}
                  <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8.5px] font-black rounded-xl gap-0.5">
                    <Scan className="w-4 h-4 text-sky-300 animate-pulse" />
                    <span>CLICK TO SCAN</span>
                  </div>
                </div>

                {/* Instant Verification Trigger Prompt */}
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="text-[9px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <BadgeCheck className="w-3 h-3 text-emerald-500" />
                  <span>Verify Pass Integrity</span>
                </button>

              </div>

            </div>

            {/* Back Bottom Blue Ribbon with Website */}
            <div className="bg-slate-950 text-white px-5 sm:px-6 py-2 flex items-center justify-between text-[9px] sm:text-[9.5px] font-mono relative z-10 border-t border-slate-800">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Authorized Identity Token • 2048-Bit Signed</span>
              </span>
              <span className="text-sky-300 font-bold">www.avsct.edu.in</span>
            </div>

          </div>

        </motion.div>
      </div>

      {/* Live Camera Snapshot Modal for Student ID */}
      <LiveCameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCapture={(photoData) => {
          handlePhotoChange(photoData);
          addNotification('Live Snapshot Saved', 'Your student identity photo has been updated from camera.', 'success');
        }}
        studentName={student.name}
      />
    </div>
  );
};
