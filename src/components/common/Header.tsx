import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShovLogo } from './ShovLogo';
import { RoleLiveVerifiedBadge, InstagramTickIcon, getRoleVerifiedConfig } from './RoleLiveVerifiedBadge';
import { UserRole } from '../../types';
import { 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  ShieldAlert, 
  LogOut, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  X, 
  Crown, 
  Building2, 
  Landmark, 
  LogIn, 
  QrCode,
  GraduationCap,
  CreditCard,
  MessageSquare,
  Scan,
  History,
  Send,
  Award,
  KeyRound
} from 'lucide-react';

interface HeaderProps {
  onOpenLoginModal?: (mode?: 'otp' | 'login' | 'signup' | 'council') => void;
  onOpenOnboardingModal?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenLoginModal, 
  onOpenOnboardingModal,
  activeTab = 'student-id', 
  setActiveTab 
}) => {
  const { 
    user, 
    role, 
    isAuthenticated, 
    darkMode, 
    toggleDarkMode, 
    logout, 
    notifications,
    removeNotification 
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleConfigs: Record<UserRole, { label: string; badgeColor: string; icon: React.ReactNode }> = {
    STUDENT: { 
      label: 'Student Portal', 
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', 
      icon: <GraduationCap className="w-3.5 h-3.5" /> 
    },
    STAFF: { 
      label: 'Staff & Security', 
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', 
      icon: <ShieldCheck className="w-3.5 h-3.5" /> 
    },
    HOD: { 
      label: 'Head of Department', 
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30', 
      icon: <Building2 className="w-3.5 h-3.5" /> 
    },
    VICE_PRINCIPAL: { 
      label: 'Vice Principal Suite', 
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', 
      icon: <Crown className="w-3.5 h-3.5" /> 
    },
    PRINCIPAL: { 
      label: 'Principal Executive', 
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30', 
      icon: <Landmark className="w-3.5 h-3.5" /> 
    },
    ADMIN: { 
      label: 'Administrator', 
      badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30', 
      icon: <ShieldAlert className="w-3.5 h-3.5" /> 
    },
    ELECTION_COUNCIL: { 
      label: 'Election Council', 
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', 
      icon: <Crown className="w-3.5 h-3.5" /> 
    },
  };

  // Render navigation links STRICTLY restricted to the logged-in role only
  const renderRoleNavigationLinks = () => {
    switch (role) {
      case 'STUDENT':
        return (
          <>
            <button
              onClick={() => setActiveTab?.('student-id')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'student-id' || activeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Digital ID Card</span>
            </button>
            <button
              onClick={() => setActiveTab?.('student-academic')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'student-academic'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Record</span>
            </button>
            <button
              onClick={() => setActiveTab?.('student-fines')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'student-fines'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fines & Fee Clearance</span>
            </button>
            <button
              onClick={() => setActiveTab?.('student-inquiries')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'student-inquiries'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Grievances Hub</span>
            </button>
          </>
        );

      case 'STAFF':
        return (
          <>
            <button
              onClick={() => setActiveTab?.('staff-scanner')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'staff-scanner' || activeTab === 'staff'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Gate Biometrics Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab?.('staff-logs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'staff-logs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Turnstile Access Logs</span>
            </button>
            <button
              onClick={() => setActiveTab?.('staff-hod-comm')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'staff-hod-comm'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Communicate with HOD</span>
            </button>
          </>
        );

      case 'HOD':
        return (
          <>
            <button
              onClick={() => setActiveTab?.('hod-roster')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'hod-roster' || activeTab === 'hod'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Department Student Roster</span>
            </button>
            <button
              onClick={() => setActiveTab?.('hod-circulars')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'hod-circulars'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Department Circulars</span>
            </button>
            <button
              onClick={() => setActiveTab?.('hod-inquiries')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'hod-inquiries'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Staff Incident Requests</span>
            </button>
          </>
        );

      case 'VICE_PRINCIPAL':
        return (
          <>
            <button
              onClick={() => setActiveTab?.('vp-governance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'vp-governance' || activeTab === 'vice_principal'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Academic Governance</span>
            </button>
            <button
              onClick={() => setActiveTab?.('vp-fines')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'vp-fines'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fines Review & Waivers</span>
            </button>
            <button
              onClick={() => setActiveTab?.('vp-circulars')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'vp-circulars'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inter-Dept Circulars</span>
            </button>
          </>
        );

      case 'PRINCIPAL':
      default:
        return (
          <>
            <button
              onClick={() => setActiveTab?.('principal-executive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'principal-executive' || activeTab === 'principal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Executive Campus Command</span>
            </button>
            <button
              onClick={() => setActiveTab?.('principal-circulars')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'principal-circulars'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Executive Orders</span>
            </button>
            <button
              onClick={() => setActiveTab?.('principal-departments')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'principal-departments'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Departments Oversight</span>
            </button>
            <button
              onClick={() => setActiveTab?.('principal-accreditation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'principal-accreditation'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Accreditation Center</span>
            </button>
          </>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Zone 1: Branding & Institution */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center">
            <ShovLogo size="sm" showTagline={false} lightText={darkMode} />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-900 dark:text-white font-mono leading-tight whitespace-nowrap">
              AVS COLLEGE OF TECHNOLOGY
            </span>
            {isAuthenticated && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                {roleConfigs[role]?.icon}
                <span>{roleConfigs[role]?.label}</span>
              </span>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links — Strictly for the authenticated role only */}
        {isAuthenticated ? (
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            {renderRoleNavigationLinks()}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Official Institutional Portal</span>
          </div>
        )}

        {/* Zone 3: Actions — Dark Mode, Notifications & Role Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Clean White Mode" : "Switch to Dark Mode"}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-800 relative group cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-800 relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Notifications</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                    {notifications.length} New
                  </span>
                </div>

                <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-center text-slate-500 py-6">No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                        <button
                          onClick={() => removeNotification(n.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Sign-In Trigger with Instagram Verified Badge */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-slate-200/60 dark:border-slate-800 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500/50 transition-all"
                  />
                  {/* Floating Instagram Verified Badge on Avatar */}
                  <div className="absolute -bottom-1 -right-1 z-10">
                    <InstagramTickIcon
                      fillColor={getRoleVerifiedConfig(role).hex}
                      sizeClass="w-4 h-4"
                    />
                  </div>
                </div>

                <div className="hidden md:block text-left pl-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{user.name}</p>
                    <InstagramTickIcon
                      fillColor={getRoleVerifiedConfig(role).hex}
                      sizeClass="w-3.5 h-3.5"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <span className={getRoleVerifiedConfig(role).text}>{roleConfigs[role]?.label || role}</span>
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{user.name}</p>
                        <InstagramTickIcon
                          fillColor={getRoleVerifiedConfig(role).hex}
                          sizeClass="w-4 h-4"
                        />
                      </div>
                      <RoleLiveVerifiedBadge role={role} size="xs" showLabel={false} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">{user.email}</p>
                    
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <RoleLiveVerifiedBadge role={role} size="xs" showLabel={true} />
                      {user.departmentName && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {user.departmentName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Register Option */}
                  <div className="p-1 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenLoginModal?.('signup');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Register New Member</span>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLoginModal?.('login')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenLoginModal?.('signup')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>New Register</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
