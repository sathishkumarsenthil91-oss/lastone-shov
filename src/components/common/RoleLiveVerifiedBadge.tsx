import React from 'react';
import { motion } from 'motion/react';
import { UserRole } from '../../types';

interface RoleLiveVerifiedBadgeProps {
  role: UserRole | 'STUDENT' | 'STAFF' | 'HOD' | 'VICE_PRINCIPAL' | 'PRINCIPAL' | 'ADMIN';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  customLabel?: string;
  className?: string;
  animate?: boolean;
}

// Exact Instagram verified badge SVG rosette path & checkmark
export const InstagramVerifyIcon: React.FC<{
  fillColor: string;
  sizeClass?: string;
  animateTick?: boolean;
}> = ({ fillColor, sizeClass = 'w-4 h-4', animateTick = true }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${sizeClass} shrink-0 drop-shadow-xs`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Official Instagram 16-point scalloped burst badge */}
      <path
        d="M19.998 3.094 14.638 0l-5.972 3.156-5.945-.837-.837 5.945L0 14.638l3.094 5.36L0 25.358l1.884 5.974.837 5.945 5.945-.837 5.972 3.156 5.36-3.094 5.36 3.094 5.972-3.156 5.945.837.837-5.945 1.884-5.974 3.094-5.36-3.094-5.36 1.884-5.974-.837-5.945-5.945.837-5.972-3.156-5.36 3.094Z"
        fill={fillColor}
      />
      {/* Sharp Crisp White Checkmark */}
      {animateTick ? (
        <motion.path
          d="M11.5 19.8 17.2 25.5 28.5 14.2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0.8 }}
          animate={{ pathLength: [0.8, 1, 0.8] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ) : (
        <path
          d="M11.5 19.8 17.2 25.5 28.5 14.2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export const RoleLiveVerifiedBadge: React.FC<RoleLiveVerifiedBadgeProps> = ({
  role,
  size = 'md',
  showLabel = true,
  customLabel,
  className = '',
  animate = true
}) => {
  // Color configuration strictly matching requirements:
  // student -> pink
  // staff -> blue
  // hod -> red
  // vice principal -> golden
  // principal -> green
  const getRoleConfig = () => {
    switch (role) {
      case 'STUDENT':
        return {
          colorName: 'Pink',
          hex: '#ec4899', // Instagram pink
          bgBase: 'bg-pink-500',
          bgLight: 'bg-pink-50 dark:bg-pink-950/40',
          border: 'border-pink-300 dark:border-pink-500/40',
          text: 'text-pink-600 dark:text-pink-400',
          glow: 'shadow-pink-500/30',
          ringColor: 'border-pink-400/60',
          pingColor: 'bg-pink-400',
          label: customLabel || 'Verified Student',
          subLabel: 'Active Enrolled Status'
        };
      case 'STAFF':
        return {
          colorName: 'Blue',
          hex: '#0095f6', // Official Instagram Verified Blue
          bgBase: 'bg-[#0095f6]',
          bgLight: 'bg-sky-50 dark:bg-sky-950/40',
          border: 'border-sky-300 dark:border-sky-500/40',
          text: 'text-sky-600 dark:text-sky-400',
          glow: 'shadow-sky-500/30',
          ringColor: 'border-sky-400/60',
          pingColor: 'bg-[#0095f6]',
          label: customLabel || 'Verified Staff',
          subLabel: 'Faculty & Proctor Clearance'
        };
      case 'HOD':
        return {
          colorName: 'Red',
          hex: '#ef4444', // Instagram red
          bgBase: 'bg-red-600',
          bgLight: 'bg-red-50 dark:bg-red-950/40',
          border: 'border-red-300 dark:border-red-500/40',
          text: 'text-red-600 dark:text-red-400',
          glow: 'shadow-red-500/30',
          ringColor: 'border-red-400/60',
          pingColor: 'bg-red-400',
          label: customLabel || 'Verified HOD',
          subLabel: 'Head of Department Level'
        };
      case 'VICE_PRINCIPAL':
        return {
          colorName: 'Golden',
          hex: '#f59e0b', // Instagram golden
          bgBase: 'bg-amber-500',
          bgLight: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-400 dark:border-amber-500/50',
          text: 'text-amber-600 dark:text-amber-400',
          glow: 'shadow-amber-500/30',
          ringColor: 'border-amber-400/70',
          pingColor: 'bg-amber-400',
          label: customLabel || 'Verified Vice Principal',
          subLabel: 'Executive Institutional Seal'
        };
      case 'PRINCIPAL':
        return {
          colorName: 'Green',
          hex: '#10b981', // Instagram emerald green
          bgBase: 'bg-emerald-600',
          bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-300 dark:border-emerald-500/40',
          text: 'text-emerald-600 dark:text-emerald-400',
          glow: 'shadow-emerald-500/30',
          ringColor: 'border-emerald-400/60',
          pingColor: 'bg-emerald-400',
          label: customLabel || 'Verified Principal',
          subLabel: 'Chief Executive Authority'
        };
      default:
        return {
          colorName: 'Blue',
          hex: '#0095f6',
          bgBase: 'bg-[#0095f6]',
          bgLight: 'bg-sky-50 dark:bg-sky-950/40',
          border: 'border-sky-300 dark:border-sky-500/40',
          text: 'text-sky-600 dark:text-sky-400',
          glow: 'shadow-sky-500/30',
          ringColor: 'border-sky-400/60',
          pingColor: 'bg-[#0095f6]',
          label: customLabel || 'Verified Member',
          subLabel: 'Institutional Pass'
        };
    }
  };

  const config = getRoleConfig();

  // Dimensions based on size
  const iconDimensions = {
    xs: { box: 'w-4 h-4', svg: 'w-3.5 h-3.5', text: 'text-[9px]', sub: 'text-[7px]', padding: 'px-1.5 py-0.5' },
    sm: { box: 'w-5 h-5', svg: 'w-4.5 h-4.5', text: 'text-[10px]', sub: 'text-[8px]', padding: 'px-2 py-0.5' },
    md: { box: 'w-6 h-6', svg: 'w-5.5 h-5.5', text: 'text-xs', sub: 'text-[10px]', padding: 'px-2.5 py-1' },
    lg: { box: 'w-8 h-8', svg: 'w-7 h-7', text: 'text-sm', sub: 'text-xs', padding: 'px-3 py-1.5' },
    xl: { box: 'w-10 h-10', svg: 'w-9 h-9', text: 'text-base', sub: 'text-xs', padding: 'px-3.5 py-2' }
  }[size];

  return (
    <div 
      className={`inline-flex items-center gap-1.5 ${showLabel ? `${config.bgLight} border ${config.border} ${iconDimensions.padding} rounded-full` : ''} ${className}`}
      title={`${config.label} (${config.colorName} Instagram Verified Badge)`}
    >
      {/* Live Animated Instagram Tick Container */}
      <div className={`relative ${iconDimensions.box} flex items-center justify-center shrink-0`}>
        {/* Subtle Live Radar Pulse */}
        {animate && (
          <motion.div
            animate={{ scale: [1, 1.6, 2], opacity: [0.6, 0.2, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            className={`absolute inset-0 rounded-full ${config.pingColor} pointer-events-none`}
          />
        )}

        {/* Instagram Scalloped Rosette + White Checkmark */}
        <div className="relative z-10 flex items-center justify-center">
          <InstagramVerifyIcon 
            fillColor={config.hex} 
            sizeClass={iconDimensions.svg} 
            animateTick={animate} 
          />
        </div>
      </div>

      {/* Label and Live Status */}
      {showLabel && (
        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1 leading-none">
            <span className={`font-black tracking-tight ${config.text} ${iconDimensions.text} font-mono uppercase`}>
              {config.label}
            </span>
            {/* Small live pulsating light */}
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pingColor} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.bgBase}`}></span>
            </span>
          </div>
          {size !== 'xs' && (
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
              {config.subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

