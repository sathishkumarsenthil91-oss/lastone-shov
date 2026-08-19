import React from 'react';
import { UserRole } from '../../types';

export interface InstagramVerifyProps {
  role: UserRole | 'STUDENT' | 'STAFF' | 'HOD' | 'VICE_PRINCIPAL' | 'PRINCIPAL' | 'ADMIN' | 'ELECTION_COUNCIL';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  customLabel?: string;
  className?: string;
  animate?: boolean;
  variant?: 'circle' | 'rosette';
}

export const getRoleVerifiedConfig = (role: UserRole | string) => {
  switch (role) {
    case 'STUDENT':
      return {
        role: 'STUDENT',
        colorName: 'Pink',
        hex: '#ec4899', // Pink
        bgBase: 'bg-pink-500',
        bgLight: 'bg-pink-50 dark:bg-pink-950/40',
        border: 'border-pink-300 dark:border-pink-500/40',
        text: 'text-pink-600 dark:text-pink-400',
        glow: 'shadow-pink-500/30',
        ringColor: 'ring-pink-400/50',
        pingColor: 'bg-pink-400',
        label: 'Verified Student',
        subLabel: 'Enrolled Academic Pass',
        badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
      };
    case 'STAFF':
      return {
        role: 'STAFF',
        colorName: 'Blue',
        hex: '#0095f6', // Official Instagram Blue
        bgBase: 'bg-[#0095f6]',
        bgLight: 'bg-sky-50 dark:bg-sky-950/40',
        border: 'border-sky-300 dark:border-sky-500/40',
        text: 'text-sky-600 dark:text-sky-400',
        glow: 'shadow-sky-500/30',
        ringColor: 'ring-sky-400/50',
        pingColor: 'bg-[#0095f6]',
        label: 'Verified Staff',
        subLabel: 'Faculty & Gate Clearance',
        badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
      };
    case 'HOD':
      return {
        role: 'HOD',
        colorName: 'Red',
        hex: '#ef4444', // Red
        bgBase: 'bg-red-600',
        bgLight: 'bg-red-50 dark:bg-red-950/40',
        border: 'border-red-300 dark:border-red-500/40',
        text: 'text-red-600 dark:text-red-400',
        glow: 'shadow-red-500/30',
        ringColor: 'ring-red-400/50',
        pingColor: 'bg-red-500',
        label: 'Verified HOD',
        subLabel: 'Department Head Clearance',
        badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
      };
    case 'VICE_PRINCIPAL':
      return {
        role: 'VICE_PRINCIPAL',
        colorName: 'Golden',
        hex: '#f59e0b', // Golden Amber
        bgBase: 'bg-amber-500',
        bgLight: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-400 dark:border-amber-500/50',
        text: 'text-amber-600 dark:text-amber-400',
        glow: 'shadow-amber-500/30',
        ringColor: 'ring-amber-400/50',
        pingColor: 'bg-amber-400',
        label: 'Verified Vice Principal',
        subLabel: 'Executive Institutional Seal',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      };
    case 'PRINCIPAL':
    case 'ADMIN':
    default:
      return {
        role: 'PRINCIPAL',
        colorName: 'Green',
        hex: '#10b981', // Emerald Green
        bgBase: 'bg-emerald-600',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-300 dark:border-emerald-500/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        glow: 'shadow-emerald-500/30',
        ringColor: 'ring-emerald-400/50',
        pingColor: 'bg-emerald-400',
        label: 'Verified Principal',
        subLabel: 'Chief Executive Authority',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      };
  }
};

// Clean Circular & Rosette Instagram Verified Tick
export const InstagramTickIcon: React.FC<{
  fillColor: string;
  className?: string;
  sizeClass?: string;
  variant?: 'circle' | 'rosette';
}> = ({ fillColor, className = '', sizeClass = 'w-4 h-4', variant = 'circle' }) => {
  if (variant === 'rosette') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`${sizeClass} shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 1.5l2.4 2.1 3.2-.3 1.5 2.8 3.1 1-.3 3.2 2.1 2.4-1.6 2.8.9 3.1-3 1.2-.8 3.1-3.2.1-1.9 2.6-2.7-1.7-2.7 1.7-1.9-2.6-3.2-.1-.8-3.1-3-1.2.9-3.1-1.6-2.8 2.1-2.4-.3-3.2 3.1-1 1.5-2.8 3.2.3L12 1.5z"
          fill={fillColor}
        />
        <path
          d="M7.5 12.2l3 3 6-6"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Smooth circular Instagram verified badge with perfectly balanced checkmark
  return (
    <svg
      viewBox="0 0 20 20"
      className={`${sizeClass} shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle base with smooth fill */}
      <circle cx="10" cy="10" r="9.5" fill={fillColor} />
      {/* Perfectly centered crisp white checkmark */}
      <path
        d="M6 10.3l2.8 2.8 5.4-5.4"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const RoleLiveVerifiedBadge: React.FC<InstagramVerifyProps> = ({
  role,
  size = 'md',
  showLabel = true,
  customLabel,
  className = '',
  animate = true,
  variant = 'circle'
}) => {
  const config = getRoleVerifiedConfig(role);

  // Dimensions based on size
  const iconDimensions = {
    xs: { icon: 'w-3.5 h-3.5', text: 'text-[9px]', sub: 'text-[7px]', padding: 'px-1.5 py-0.5' },
    sm: { icon: 'w-4 h-4', text: 'text-[10px]', sub: 'text-[8px]', padding: 'px-2 py-0.5' },
    md: { icon: 'w-4.5 h-4.5', text: 'text-xs', sub: 'text-[10px]', padding: 'px-2.5 py-1' },
    lg: { icon: 'w-5.5 h-5.5', text: 'text-sm', sub: 'text-xs', padding: 'px-3 py-1.5' },
    xl: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-xs', padding: 'px-3.5 py-2' }
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none ${
        showLabel
          ? `${config.bgLight} border ${config.border} ${iconDimensions.padding} rounded-full transition-colors`
          : ''
      } ${className}`}
      title={`${customLabel || config.label} (${config.colorName} Verified Circle Badge)`}
    >
      {/* Live Animated Instagram Verified Icon */}
      <div className="relative inline-flex items-center justify-center shrink-0">
        {animate && (
          <span
            className={`absolute -inset-0.5 rounded-full ${config.pingColor} opacity-40 animate-ping pointer-events-none`}
            style={{ animationDuration: '3s' }}
          />
        )}
        <InstagramTickIcon
          fillColor={config.hex}
          sizeClass={iconDimensions.icon}
          variant={variant}
          className="relative z-10 transition-transform duration-200 hover:scale-110"
        />
      </div>

      {/* Label and Live Status */}
      {showLabel && (
        <div className="flex flex-col pr-1 text-left">
          <div className="flex items-center gap-1 leading-none">
            <span className={`font-black tracking-tight ${config.text} ${iconDimensions.text} font-mono uppercase`}>
              {customLabel || config.label}
            </span>
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
