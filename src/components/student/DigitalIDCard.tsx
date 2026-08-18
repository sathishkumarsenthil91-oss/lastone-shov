import React, { useState } from 'react';
import { Student } from '../../types';
import { ImageLightbox } from '../common/ImageLightbox';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { RoleLiveVerifiedBadge } from '../common/RoleLiveVerifiedBadge';
import { motion } from 'motion/react';
import { rohitKumarPhoto, avsCampusPhoto, INITIAL_STUDENTS } from '../../data/mockData';
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
  Globe
} from 'lucide-react';

interface DigitalIDCardProps {
  student?: Student;
  onReportLost?: () => void;
  onPhotoUpdated?: (newPhotoUrl: string) => void;
  onOpenDepartmentPrompt?: () => void;
  customDepartmentName?: string;
}

export const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ 
  student = INITIAL_STUDENTS[0], 
  onReportLost, 
  onPhotoUpdated,
  onOpenDepartmentPrompt,
  customDepartmentName
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCampusLightboxOpen, setIsCampusLightboxOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);

  const displayDept = customDepartmentName || student.departmentName || 'Computer Science';
  const photoToUse = student.photoUrl || rohitKumarPhoto;

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

      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <RoleLiveVerifiedBadge role="STUDENT" size="sm" customLabel="STUDENT VERIFIED" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCampusLightboxOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="View AVS Campus Building Photo"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">View Campus</span>
          </button>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Show Front' : 'Show Back (Instructions & QR)'}</span>
          </button>
        </div>
      </div>

      {/* 3D FLIP CONTAINER */}
      <div className="relative w-full aspect-[1.58/1] perspective-1000">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="w-full h-full relative transform-style-3d shadow-2xl rounded-3xl"
        >
          
          {/* ========================================================= */}
          {/* CARD FRONT SIDE (With AVS College Campus Background)       */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white text-slate-900 border-2 border-slate-200/90 flex flex-col justify-between backface-hidden shadow-2xl p-5 sm:p-6 select-text relative">
            
            {/* AVS Campus Building Background Texture & Watermark */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.14] mix-blend-multiply select-none z-0">
              <img
                src={avsCampusPhoto}
                alt="AVS College Campus Background"
                className="w-full h-full object-cover filter contrast-125 saturate-120"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-white/40" />
            </div>

            {/* 1. CARD TOP HEADER */}
            <div className="relative z-10 flex items-start justify-between border-b border-slate-200/80 pb-3">
              {/* Left Brand: SHOV Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-1.5 flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-6 h-6 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black tracking-tight text-blue-950">SHOV</span>
                    <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">— DIGITAL ID —</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">
                    VERIFY • IDENTIFY • SECURE
                  </p>
                </div>
              </div>

              {/* Right: College Name & Accreditations */}
              <div className="text-right">
                <h1 className="text-sm sm:text-base font-black text-blue-950 tracking-tight uppercase leading-tight">
                  AVS COLLEGE<br className="sm:hidden" /> OF TECHNOLOGY
                </h1>
                <p className="text-[9px] font-semibold text-slate-500">
                  Approved by AICTE | Affiliated to Anna University
                </p>
              </div>
            </div>

            {/* 2. CARD MIDDLE PARTICULARS & PHOTO */}
            <div className="relative z-10 my-auto py-2 grid grid-cols-12 gap-4 items-center">
              
              {/* Left Column: Photo & Name */}
              <div className="col-span-4 flex flex-col items-center text-center space-y-1.5">
                <div className="relative group">
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden ring-3 ring-blue-950/20 shadow-lg cursor-pointer transition-transform group-hover:scale-105 bg-white"
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

                  {onPhotoUpdated && (
                    <button
                      onClick={() => setIsCameraCaptureOpen(true)}
                      className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                      title="Update Live Photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <h2 className="text-sm sm:text-base font-black text-blue-950 tracking-tight leading-tight">
                  {student.name || 'Rohit Kumar'}
                </h2>
              </div>

              {/* Middle/Right Column: Metadata Table */}
              <div className="col-span-8 space-y-1.5">
                
                {/* Student ID Badge */}
                <div className="flex items-center justify-end gap-2 mb-1">
                  <div className="px-3 py-0.5 rounded-md bg-blue-950 text-white text-[10px] font-black uppercase tracking-wider">
                    STUDENT ID
                  </div>
                  <span className="text-sm sm:text-base font-black text-blue-950 font-mono tracking-tight">
                    {student.studentIdNumber || 'STU-10001'}
                  </span>
                </div>

                {/* Particulars with blue circle bullet icons */}
                <div className="space-y-1 text-[11px] sm:text-xs text-slate-800 font-medium">
                  
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <User className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Register No</span>
                    <span className="font-bold text-blue-950 font-mono">: {student.registerNumber || '23CS001'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Department</span>
                    <span 
                      onClick={onOpenDepartmentPrompt}
                      className={`font-bold text-blue-950 truncate ${onOpenDepartmentPrompt ? 'cursor-pointer hover:underline' : ''}`}
                    >
                      : {displayDept}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <GraduationCap className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Course & Year</span>
                    <span className="font-bold text-blue-950">: {student.course || 'B.E. Computer Science'} ({student.year || 3}rd Year)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Cake className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Date of Birth</span>
                    <span className="font-bold text-blue-950 font-mono">: {student.dateOfBirth || '15-06-2004'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Mail className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Email</span>
                    <span className="font-bold text-blue-950 truncate font-mono">: {student.collegeEmail || 'rohit.kumar@avsct.edu.in'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-2.5 h-2.5" />
                    </span>
                    <span className="w-24 text-slate-600 font-semibold">Phone</span>
                    <span className="font-bold text-blue-950 font-mono">: {student.phoneNumber || '98765 43210'}</span>
                  </div>

                </div>

              </div>

            </div>

            {/* 3. CARD FOOTER: VALID UNTIL, STATUS & QR CODE */}
            <div className="relative z-10 border-t border-slate-200/80 pt-2.5 flex items-end justify-between">
              
              {/* Left Validity & Status */}
              <div className="space-y-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">
                    Valid Until
                  </span>
                  <span className="text-sm font-black text-blue-950 font-mono">
                    {student.validUntil || '31-05-2027'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5">
                  <RoleLiveVerifiedBadge role="STUDENT" size="sm" showLabel={false} />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{student.status || 'ACTIVE'}</span>
                  </span>
                </div>
              </div>

              {/* Right: QR Code with SHOV SECURE ID Vertical Ribbon */}
              <div className="flex items-stretch rounded-xl border-2 border-blue-950 overflow-hidden shadow-md bg-white">
                {/* SVG QR Code Pattern */}
                <div className="p-1">
                  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18">
                    {/* Position detection corners */}
                    <rect x="0" y="0" width="30" height="30" fill="#0f172a" rx="3" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="10" y="10" width="10" height="10" fill="#1e3a8a" rx="1" />

                    <rect x="70" y="0" width="30" height="30" fill="#0f172a" rx="3" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="80" y="10" width="10" height="10" fill="#1e3a8a" rx="1" />

                    <rect x="0" y="70" width="30" height="30" fill="#0f172a" rx="3" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" rx="1.5" />
                    <rect x="10" y="80" width="10" height="10" fill="#1e3a8a" rx="1" />

                    {/* QR Matrix Elements */}
                    <path d="M 35 5 H 45 V 15 H 35 Z M 50 5 H 65 V 15 H 50 Z M 35 20 H 50 V 30 H 35 Z" fill="#0f172a" />
                    <path d="M 5 35 H 15 V 45 H 5 Z M 20 35 H 30 V 45 H 20 Z M 35 35 H 45 V 45 H 35 Z M 50 35 H 60 V 45 H 50 Z M 65 35 H 95 V 45 H 65 Z" fill="#0f172a" />
                    <path d="M 5 50 H 25 V 60 H 5 Z M 30 50 H 40 V 60 H 30 Z M 45 50 H 65 V 60 H 45 Z M 70 50 H 95 V 60 H 70 Z" fill="#0f172a" />
                    <path d="M 35 70 H 45 V 80 H 35 Z M 50 70 H 65 V 80 H 50 Z M 70 70 H 80 V 80 H 70 Z M 85 70 H 95 V 80 H 85 Z" fill="#0f172a" />
                    <path d="M 35 85 H 50 V 95 H 35 Z M 55 85 H 70 V 95 H 55 Z M 75 85 H 95 V 95 H 75 Z" fill="#0f172a" />
                  </svg>
                </div>

                {/* Vertical Blue Strip */}
                <div className="bg-blue-900 text-white px-1 py-1 flex items-center justify-center">
                  <span className="text-[8px] font-black tracking-widest uppercase [writing-mode:vertical-lr] rotate-180">
                    SHOV SECURE ID
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================= */}
          {/* CARD BACK SIDE (With AVS College Campus Image & Watermark) */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white text-slate-900 border-2 border-slate-200/90 flex flex-col justify-between transform-rotateY-180 backface-hidden shadow-2xl p-5 sm:p-6 relative">
            
            {/* AVS Campus Building Background Texture & Watermark */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.12] mix-blend-multiply select-none z-0">
              <img
                src={avsCampusPhoto}
                alt="AVS College Campus Background"
                className="w-full h-full object-cover filter contrast-125 saturate-120"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-white/40" />
            </div>

            {/* Top Brand Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-950 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <span className="text-base font-black text-blue-950 tracking-tight">SHOV</span>
                  <span className="text-[9px] font-bold text-slate-500 ml-1.5 uppercase">— DIGITAL ID —</span>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
                    VERIFY • IDENTIFY • SECURE
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black text-blue-950 uppercase">AVS College of Technology</p>
                <p className="text-[8px] text-slate-500">Official Student Identity Document</p>
              </div>
            </div>

            {/* Back Middle Section: Instructions & Campus Photo */}
            <div className="relative z-10 my-auto py-2 grid grid-cols-12 gap-4 items-center">
              
              {/* Left Column: Instructions & Emergency Box */}
              <div className="col-span-7 space-y-3 text-left">
                <div>
                  <h3 className="text-xs font-black text-blue-950 tracking-wider uppercase border-b border-slate-200 pb-1">
                    INSTRUCTIONS
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-[10px] sm:text-[11px] text-slate-700 font-medium leading-tight">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-950 font-bold">•</span>
                      <span>This ID card is the property of <strong className="text-blue-950">AVS College of Technology</strong>.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-950 font-bold">•</span>
                      <span>This card is non-transferable.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-950 font-bold">•</span>
                      <span>Use of this card is governed by the rules and regulations of the college.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-950 font-bold">•</span>
                      <span>If found, please return to the college office.</span>
                    </li>
                  </ul>
                </div>

                {/* Principal Signature */}
                <div className="pt-1 flex items-center justify-between">
                  <div>
                    <div className="h-6 flex items-end">
                      <span className="font-serif italic font-bold text-blue-900 text-sm tracking-wide transform -rotate-6 block">
                        J. Davis
                      </span>
                    </div>
                    <div className="border-t border-slate-400 w-28 pt-0.5">
                      <p className="text-[9px] font-black text-blue-950">Principal</p>
                      <p className="text-[8px] text-slate-500 font-medium">AVS College of Technology</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Dark Navy Box */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-950 text-white space-y-0.5 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-wider text-sky-300">
                    EMERGENCY CONTACT
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-white">
                    <PhoneCall className="w-3 h-3 text-sky-400" />
                    <span>+91 12345 67890</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-300">
                    <Mail className="w-3 h-3 text-sky-400" />
                    <span>info@avsct.edu.in</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Campus Image & RFID/NFC Fingerprint Sensor */}
              <div className="col-span-5 flex flex-col items-center justify-between h-full space-y-2">
                
                {/* Campus Image Frame */}
                <div 
                  onClick={() => setIsCampusLightboxOpen(true)}
                  className="w-full rounded-2xl overflow-hidden shadow-md border-2 border-slate-200 relative group cursor-pointer"
                  title="Click to zoom AVS College Campus Photo"
                >
                  <div className="absolute top-1 left-1.5 z-10 px-2 py-0.5 rounded-md bg-blue-950/80 backdrop-blur-xs text-white text-[8px] font-black uppercase">
                    AVS Campus
                  </div>
                  <img
                    src={avsCampusPhoto}
                    alt="AVS College of Technology Campus"
                    className="w-full h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-bold gap-1 rounded-2xl">
                    <Maximize2 className="w-3 h-3" />
                    <span>Enlarge</span>
                  </div>
                </div>

                {/* Biometric Sensor Icon Box */}
                <div className="w-full py-2 px-3 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-blue-300 flex items-center justify-center text-blue-900 shadow-xs">
                    <Fingerprint className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-blue-950 uppercase">RFID / NFC CHIP</p>
                    <p className="text-[8px] text-slate-500 font-mono">ENCRYPTED TOKEN</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Back Bottom Blue Ribbon with Website */}
            <div className="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6 bg-blue-950 text-white py-2 px-4 flex items-center justify-between text-[10px] font-mono relative z-10">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Authorized Identity Card</span>
              </span>
              <span className="text-sky-300 font-bold">www.avsct.edu.in</span>
            </div>

          </div>

        </motion.div>
      </div>

    </div>
  );
};
