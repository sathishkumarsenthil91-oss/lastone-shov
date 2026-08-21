import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Camera, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  X, 
  Sparkles,
  Layers,
  Cpu,
  Database,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';
import { DepartmentCode, StudentOnboardingPayload } from '../../types';
import { RoleLiveVerifiedBadge, InstagramTickIcon } from '../common/RoleLiveVerifiedBadge';
import { uploadToSupabaseStorage, deleteFileFromStorage } from '../../services/storageService';

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (payload: StudentOnboardingPayload) => Promise<{ success: boolean; message?: string }>;
  initialGoogleData?: { name?: string; email?: string };
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialGoogleData
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialGoogleData?.name || '');
  const [registerNumber, setRegisterNumber] = useState('');
  const [collegeEmail, setCollegeEmail] = useState(initialGoogleData?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');

  // Academic State
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode>('CSE');
  const [year, setYear] = useState<number>(1);
  const [course, setCourse] = useState('B.Tech - Computer Science');

  // Photo & Physical ID State
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
  );
  const [physicalIdCardUrl, setPhysicalIdCardUrl] = useState<string>(
    'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=600'
  );

  // Camera Live Capture state
  const [isCapturingPassport, setIsCapturingPassport] = useState(false);
  const [isCapturingIdCard, setIsCapturingIdCard] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const departmentsList: { code: DepartmentCode; name: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      code: 'IT',
      name: 'Information Technology',
      icon: <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      color: 'border-sky-500 bg-sky-500/5 hover:border-sky-600',
      desc: 'Cloud Computing, DevOps, Full-Stack & Cybersecurity'
    },
    {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      icon: <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: 'border-blue-500 bg-blue-500/5 hover:border-blue-600',
      desc: 'Algorithms, Distributed Systems, Compilers & Networks'
    },
    {
      code: 'AIDS',
      name: 'Artificial Intelligence & Data Science',
      icon: <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      color: 'border-indigo-500 bg-indigo-500/5 hover:border-indigo-600',
      desc: 'Deep Learning, Neural Models, Computer Vision & NLP'
    }
  ];

  const startCamera = async (type: 'passport' | 'idCard') => {
    setError(null);
    try {
      if (type === 'passport') setIsCapturingPassport(true);
      if (type === 'idCard') setIsCapturingIdCard(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setError('Could not access live camera. You can upload a photo or use the sample badge.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturingPassport(false);
    setIsCapturingIdCard(false);
  };

  const capturePhoto = async (type: 'passport' | 'idCard') => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();

      // Upload to Supabase Storage 'app-files'
      const uploadRes = await uploadToSupabaseStorage(dataUrl, {
        featureName: 'onboarding',
        itemId: type === 'passport' ? 'passport' : 'id-card',
        fileName: `${type}_photo`,
        expiresInSeconds: 60 * 60 * 24 * 7
      });

      const finalUrl = uploadRes.signedUrl || dataUrl;
      if (type === 'passport') {
        setPassportPhotoUrl(finalUrl);
      } else {
        setPhysicalIdCardUrl(finalUrl);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'idCard') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload directly to Supabase Storage 'app-files'
    const uploadRes = await uploadToSupabaseStorage(file, {
      featureName: 'onboarding',
      itemId: type === 'passport' ? 'passport' : 'id-card',
      fileName: file.name,
      expiresInSeconds: 60 * 60 * 24 * 7
    });

    if (uploadRes.signedUrl) {
      if (type === 'passport') setPassportPhotoUrl(uploadRes.signedUrl);
      else setPhysicalIdCardUrl(uploadRes.signedUrl);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (type === 'passport') setPassportPhotoUrl(reader.result);
          else setPhysicalIdCardUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = async (type: 'passport' | 'idCard') => {
    const targetUrl = type === 'passport' ? passportPhotoUrl : physicalIdCardUrl;
    if (targetUrl) {
      await deleteFileFromStorage(targetUrl);
    }
    if (type === 'passport') {
      setPassportPhotoUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400');
    } else {
      setPhysicalIdCardUrl('https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=600');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    let finalPassport = passportPhotoUrl;
    let finalIdCard = physicalIdCardUrl;

    // Ensure any data URLs are persisted into Supabase Storage
    if (finalPassport.startsWith('data:')) {
      const res = await uploadToSupabaseStorage(finalPassport, {
        featureName: 'onboarding',
        itemId: 'passport',
        fileName: 'passport_photo'
      });
      if (res.signedUrl) finalPassport = res.signedUrl;
    }
    if (finalIdCard.startsWith('data:')) {
      const res = await uploadToSupabaseStorage(finalIdCard, {
        featureName: 'onboarding',
        itemId: 'id-card',
        fileName: 'id_card_photo'
      });
      if (res.signedUrl) finalIdCard = res.signedUrl;
    }

    const payload: StudentOnboardingPayload = {
      name,
      registerNumber,
      departmentCode,
      course,
      year,
      collegeEmail,
      phoneNumber,
      passportPhotoUrl: finalPassport,
      physicalIdCardUrl: finalIdCard,
      bloodGroup,
      guardianPhone,
      address
    };

    const res = await onComplete(payload);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Onboarding failed. Please review your details.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">SHOV Student Onboarding & Registration</h2>
                <InstagramTickIcon fillColor="#ec4899" sizeClass="w-5 h-5" />
              </div>
              <p className="text-xs text-blue-100 font-medium flex items-center gap-1.5 mt-0.5">
                <span>Google Verified Identity & Cryptographic ID Minting</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/30 text-white text-[10px] font-black uppercase tracking-wider font-mono">
                  Pink Student Pass
                </span>
              </p>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center justify-between mt-6 max-w-md mx-auto">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step === s
                      ? 'bg-white text-blue-700 ring-4 ring-white/30 shadow-md'
                      : step > s
                      ? 'bg-blue-300/40 text-white'
                      : 'bg-blue-800/60 text-blue-300'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-8 sm:w-12 h-1 mx-1 rounded-full ${
                      step > s ? 'bg-white/80' : 'bg-blue-800/40'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step 1: Student Identity & Contact</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Auto-linked with your Google account. Verify institutional credentials.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Student Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. Aarav Sharma"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Institutional Register Number *
                    </label>
                    <input
                      type="text"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      placeholder="e.g. 24CS104"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Official College Gmail *
                    </label>
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="student@shov.college.edu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="+91 98765 00000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Guardian / Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="+91 98111 22334"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Residency / Home Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Hostel Block, Room No or Residential Street"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: Department Selection (IT, CSE, AIDS) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step 2: Department & Academic Year</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your designated engineering department: IT, CSE, or AIDS.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {departmentsList.map((dept) => {
                    const isSelected = departmentCode === dept.code;
                    return (
                      <button
                        type="button"
                        key={dept.code}
                        onClick={() => {
                          setDepartmentCode(dept.code);
                          setCourse(`B.Tech - ${dept.name}`);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                            {dept.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md font-mono">
                                {dept.code}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {dept.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              {dept.desc}
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value={1}>1st Year (Freshman)</option>
                      <option value={2}>2nd Year (Sophomore)</option>
                      <option value={3}>3rd Year (Junior)</option>
                      <option value={4}>4th Year (Senior)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Degree Program
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="B.Tech"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Passport Photo Capture */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step 3: Official Passport Photograph</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    High-resolution frontal portrait for biometric gate match and dynamic ID card.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  {/* Photo Preview / Live Camera Viewfinder */}
                  <div className="relative w-40 h-48 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-blue-400 shadow-inner flex items-center justify-center">
                    {isCapturingPassport ? (
                      <div className="relative w-full h-full">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        {/* Oval Alignment Guide */}
                        <div className="absolute inset-2 border-2 border-blue-400 rounded-full opacity-60 pointer-events-none" />
                      </div>
                    ) : (
                      <img
                        src={passportPhotoUrl}
                        alt="Passport Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      PASSPORT
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Capture with live camera or upload photo file:
                    </p>
                    
                    {isCapturingPassport ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => capturePhoto('passport')}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                        >
                          <Camera className="w-4 h-4" />
                          Snap Photo
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera('passport')}
                          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                        >
                          <Camera className="w-4 h-4" />
                          Live Webcam Snap
                        </button>

                        <label className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm">
                          <Upload className="w-4 h-4 text-blue-500" />
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'passport')}
                            className="hidden"
                          />
                        </label>

                        {passportPhotoUrl && !passportPhotoUrl.includes('unsplash.com') && (
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto('passport')}
                            className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                            title="Delete file from storage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400">
                      💡 Tip: Face forward in a well-lit area with a neutral background.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Physical ID Card Image Capture */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step 4: Physical College ID Card Image</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload or snap a photograph of your physical printed institutional badge for cross-verification.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  {/* Card Preview / Live Viewfinder */}
                  <div className="relative w-56 h-36 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-sky-400 shadow-inner flex items-center justify-center">
                    {isCapturingIdCard ? (
                      <div className="relative w-full h-full">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-1 border border-sky-400 rounded-lg pointer-events-none opacity-70" />
                      </div>
                    ) : (
                      <img
                        src={physicalIdCardUrl}
                        alt="Physical ID Card"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-1 left-1 bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      PHYSICAL ID SCAN
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Scan physical badge via webcam or upload image:
                    </p>

                    {isCapturingIdCard ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => capturePhoto('idCard')}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                        >
                          <Camera className="w-4 h-4" />
                          Snap Card
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera('idCard')}
                          className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                        >
                          <Camera className="w-4 h-4" />
                          Scan Physical Badge
                        </button>

                        <label className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm">
                          <Upload className="w-4 h-4 text-sky-500" />
                          Upload Card File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'idCard')}
                            className="hidden"
                          />
                        </label>

                        {physicalIdCardUrl && !physicalIdCardUrl.includes('unsplash.com') && (
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto('idCard')}
                            className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                            title="Delete file from storage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400">
                      🔒 Verified by Department HOD and Vice Principal Proctorate.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Final Review & Dynamic Digital ID Minting */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step 5: Review & Issue SHOV Digital ID</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your cryptographic token and dynamic rotating QR are ready for instant minting.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ready to Mint
                  </span>
                </div>

                {/* Digital Card Preview */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-sky-900 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={passportPhotoUrl}
                        alt={name}
                        className="w-14 h-16 rounded-xl object-cover ring-2 ring-white/50 shadow"
                      />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
                          {departmentCode} DEPARTMENT
                        </span>
                        <h4 className="text-base font-black mt-1">{name}</h4>
                        <p className="text-xs text-blue-200 font-mono">{registerNumber}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white text-slate-900 flex flex-col items-center">
                      <QrCode className="w-10 h-10 text-blue-700" />
                      <span className="text-[8px] font-bold font-mono">DYNAMIC QR</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-[11px]">
                    <div>
                      <span className="text-blue-300 text-[9px] uppercase font-bold block">Course</span>
                      <span className="font-semibold">{course}</span>
                    </div>
                    <div>
                      <span className="text-blue-300 text-[9px] uppercase font-bold block">Year</span>
                      <span className="font-semibold">{year}st / {year}th Year</span>
                    </div>
                    <div>
                      <span className="text-blue-300 text-[9px] uppercase font-bold block">Status</span>
                      <span className="font-bold text-emerald-300">ACTIVE ID</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    By clicking <strong>"Issue Digital ID & Finish"</strong>, you certify that all academic credentials and uploaded ID images are authentic.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setStep((prev) => (prev - 1) as any);
              }}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setStep((prev) => (prev + 1) as any);
              }}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-black shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Minting Digital ID...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Issue Digital ID & Finish
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
