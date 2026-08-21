import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Fingerprint, 
  KeyRound, 
  QrCode, 
  Radio, 
  ChevronRight,
  Zap
} from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const stages = [
    { label: 'INITIALIZING SHOV SECURE KERNEL', detail: 'Mounting AES-256 GCM Keystone', icon: Cpu, progress: 24 },
    { label: 'ESTABLISHING INSTITUTIONAL GATEWAY', detail: 'Syncing AVS Autonomous Directory', icon: Radio, progress: 52 },
    { label: 'DECRYPTING BIOMETRIC TOKEN VAULT', detail: 'ISO/IEC 27001 Identity Protocol Active', icon: Fingerprint, progress: 84 },
    { label: 'DIGITAL ID SYSTEM AUTHENTICATED', detail: 'Zero-Trust Verification Granted', icon: CheckCircle2, progress: 100 }
  ];

  // Mouse parallax motion for ultra luxury feel
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 15, y: y * 15 });
  };

  useEffect(() => {
    // Stage 1
    const t1 = setTimeout(() => {
      setProgress(24);
      setActiveStageIndex(0);
    }, 250);

    // Stage 2
    const t2 = setTimeout(() => {
      setProgress(58);
      setActiveStageIndex(1);
    }, 750);

    // Stage 3
    const t3 = setTimeout(() => {
      setProgress(86);
      setActiveStageIndex(2);
    }, 1300);

    // Stage 4 Final
    const t4 = setTimeout(() => {
      setProgress(100);
      setActiveStageIndex(3);
      setIsCompleted(true);
    }, 1850);

    // Fade out & enter app
    const t5 = setTimeout(() => {
      onComplete();
    }, 2400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const CurrentIcon = stages[activeStageIndex]?.icon || ShieldCheck;

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.08, 
        filter: 'blur(16px)', 
        transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] } 
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white overflow-hidden select-none cursor-pointer p-6 sm:p-10"
      onClick={onComplete}
    >
      {/* 1. FUTURISTIC BACKGROUND GRID & ENERGY ORBS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Deep Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.07] animate-cyber-grid pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)', 
            backgroundSize: '48px 48px' 
          }}
        />

        {/* Ambient Radial Glowing Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/15 blur-[110px] pointer-events-none" />

        {/* Holographic Radar Concentric Waves */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-sky-500/10 animate-radar-ping pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-blue-500/20 pointer-events-none" />
      </div>

      {/* 2. TOP HUD STATUS BAR */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-[11px] font-mono tracking-widest text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
          </span>
          <span className="font-bold text-sky-400 uppercase tracking-wider">SHOV KERNEL v2.8</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-500 hidden sm:inline">AVS DIGITAL IDENTITY MESH</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 font-semibold shadow-sm">
            <Lock className="w-3 h-3 text-sky-400" />
            <span className="text-[10px]">TLS 1.3 / E2EE</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px] hidden md:inline">NODE://avs-tn-01</span>
        </div>
      </div>

      {/* 3. CENTER HERO: THE UNIQUE SHOV LOGO WITH LASER-DRAW & HOLOGRAPHIC IGNITION */}
      <motion.div 
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-2xl px-4"
      >
        {/* Holographic Backing Flare */}
        <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/25 via-sky-400/20 to-indigo-600/25 blur-2xl rounded-full opacity-70 animate-pulse pointer-events-none" />

        {/* The Animated SHOV Master Logo SVG */}
        <div className="relative w-full max-w-[540px] sm:max-w-[620px] aspect-[720/230] flex items-center justify-center">
          
          {/* Vertical Laser Scan Beam that sweeps across the logo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_15px_#38bdf8] opacity-80 animate-laser-sweep" />
          </div>

          <svg
            viewBox="0 0 720 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-[0_0_35px_rgba(56,189,248,0.45)]"
          >
            <defs>
              <linearGradient id="shovLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              <linearGradient id="shovCoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>

              <linearGradient id="shieldFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>

              <filter id="ultraGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- SECTION 1: SHIELD & BIOMETRIC EMBLEM (LEFT) --- */}
            <g transform="translate(10, 0)">
              {/* Outer Shield with Animated Laser Tracing Path */}
              <motion.path
                d="M80 20 L150 45 C150 120 120 160 80 180 C40 160 10 120 10 45 L80 20 Z"
                fill="url(#shieldFillGrad)"
                stroke="url(#shovLaserGrad)"
                strokeWidth="7"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* Glowing Shield Edge Accent */}
              <motion.path
                d="M80 32 L138 53 C138 115 112 150 80 168 C48 150 22 115 22 53 L80 32 Z"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                opacity="0.85"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.2 }}
              />

              {/* Graduation Cap at Shield Crest */}
              <motion.g
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <path d="M80 48 L116 64 L80 80 L44 64 Z" fill="url(#shovLaserGrad)" />
                <path d="M116 64 L116 80" stroke="#38bdf8" strokeWidth="3" />
                <path d="M58 72 L58 88 C58 97 102 97 102 88 L102 72" fill="none" stroke="url(#shovLaserGrad)" strokeWidth="3" />
              </motion.g>

              {/* Biometric Student Silhouette */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <circle cx="58" cy="118" r="10" fill="#60a5fa" />
                <path d="M44 142 C44 130 50 132 58 132 C66 132 72 130 72 142 Z" fill="#60a5fa" />

                {/* Encrypted Data Stripes */}
                <rect x="80" y="112" width="28" height="4" rx="2" fill="#38bdf8" />
                <rect x="80" y="122" width="20" height="4" rx="2" fill="#818cf8" />
              </motion.g>

              {/* Holographic Mini QR Scanner Module */}
              <motion.g
                transform="translate(80, 132)"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <rect x="0" y="0" width="24" height="24" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <rect x="3" y="3" width="6" height="6" fill="#38bdf8" />
                <rect x="15" y="3" width="6" height="6" fill="#38bdf8" />
                <rect x="3" y="15" width="6" height="6" fill="#38bdf8" />
                <rect x="12" y="12" width="8" height="8" fill="#60a5fa" />
                {/* Active QR laser indicator */}
                <line x1="0" y1="3" x2="24" y2="3" stroke="#38bdf8" strokeWidth="2" className="animate-dash-flow" filter="url(#ultraGlow)" />
              </motion.g>
            </g>

            {/* --- SECTION 2: LETTERS "S - H - O - V" TYPOGRAPHIC IGNITION --- */}

            {/* LETTER S */}
            <g transform="translate(160, 25)">
              <motion.path
                d="M 65 30 C 65 10 10 10 10 40 C 10 75 70 60 70 95 C 70 125 10 125 10 100"
                fill="none"
                stroke="url(#shovLaserGrad)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              />
              {/* Electric Neon Accent Swoosh Through S */}
              <motion.path
                d="M -5 70 C 25 50 55 40 85 25"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                filter="url(#ultraGlow)"
              />
            </g>

            {/* LETTER H */}
            <g transform="translate(260, 25)">
              <motion.rect
                x="10"
                y="20"
                width="22"
                height="100"
                rx="4"
                fill="#ffffff"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
              <motion.rect
                x="58"
                y="20"
                width="22"
                height="100"
                rx="4"
                fill="#ffffff"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
              <motion.rect
                x="25"
                y="58"
                width="40"
                height="22"
                rx="2"
                fill="url(#shovLaserGrad)"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
            </g>

            {/* LETTER O (WITH BIOMETRIC PULSING CORE & KEY VAULT) */}
            <g transform="translate(370, 25)">
              {/* Outer O Circle */}
              <motion.circle
                cx="55"
                cy="70"
                r="48"
                fill="none"
                stroke="url(#shovLaserGrad)"
                strokeWidth="18"
                initial={{ pathLength: 0, rotate: -90, opacity: 0 }}
                animate={{ pathLength: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              />

              {/* Fingerprint Biometric Arcs */}
              <g transform="translate(55, 60)" className="animate-fp-scan">
                <path d="M-22 10 A 22 22 0 0 1 22 10" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M-15 3 A 15 15 0 0 1 15 3" fill="none" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M-8 -4 A 8 8 0 0 1 8 -4" fill="none" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* Cryptographic Vault Lock Badge */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8, type: 'spring' }}
              >
                <rect x="44" y="80" width="22" height="18" rx="3" fill="#1e3a8a" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M49 80 L49 74 C49 70 61 70 61 74 L61 80" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                <circle cx="55" cy="88" r="2.5" fill="#ffffff" />
              </motion.g>
            </g>

            {/* LETTER V (WITH CHECKMARK IDENTITY APEX) */}
            <g transform="translate(500, 25)">
              <motion.path
                d="M 10 20 L 50 120 L 120 -5"
                fill="none"
                stroke="url(#shovLaserGrad)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.4, ease: "easeInOut" }}
              />
              {/* Electric Verified Apex Check Flare */}
              <motion.path
                d="M 45 115 L 125 -10"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="7"
                strokeLinecap="round"
                filter="url(#ultraGlow)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              />
            </g>

            {/* --- SECTION 3: SUBTITLE "DIGITAL ID" WITH CYBER TICK LINES --- */}
            <g transform="translate(180, 168)">
              {/* Left Laser Divider */}
              <motion.line
                x1="0"
                y1="12"
                x2="110"
                y2="12"
                stroke="url(#shovLaserGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              />

              <motion.text
                x="230"
                y="20"
                fill="#f8fafc"
                fontSize="24"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
                letterSpacing="10"
                textAnchor="middle"
                initial={{ opacity: 0, letterSpacing: '4px' }}
                animate={{ opacity: 1, letterSpacing: '10px' }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                DIGITAL ID
              </motion.text>

              {/* Right Laser Divider */}
              <motion.line
                x1="350"
                y1="12"
                x2="460"
                y2="12"
                stroke="url(#shovLaserGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              />
            </g>
          </svg>
        </div>

        {/* 4. SECURITY CAPABILITY BADGES HUD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 text-[10px] sm:text-xs font-bold tracking-widest text-slate-300 uppercase"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-sky-400">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>VERIFY</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-blue-400">
            <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
            <span>IDENTIFY</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-indigo-400">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>SECURE</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400">
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>TURNSTILE QR</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 5. BOTTOM DIAGNOSTIC CONSOLE & HIGH-TECH PROGRESS HUD */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-4">
        
        {/* Stage Status Display */}
        <div className="w-full flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-sky-400 border border-blue-500/30'} transition-colors`}>
              <CurrentIcon className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className={`font-mono font-bold tracking-wider text-[11px] sm:text-xs ${isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>
                {stages[activeStageIndex]?.label}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {stages[activeStageIndex]?.detail}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-lg font-black text-sky-400">{progress}</span>
            <span className="text-xs text-sky-600 font-bold">%</span>
          </div>
        </div>

        {/* Segmented Cyber Progress Bar */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-full h-3 p-0.5 overflow-hidden shadow-2xl relative">
          <motion.div
            className={`h-full rounded-full ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_#10b981]' : 'bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 shadow-[0_0_20px_#38bdf8]'} transition-all duration-300 relative overflow-hidden`}
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer energy sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Skip / Enter Action Pill */}
        <button
          onClick={onComplete}
          className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-sky-300 text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
          <span>Click anywhere or tap [Space] to enter</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
