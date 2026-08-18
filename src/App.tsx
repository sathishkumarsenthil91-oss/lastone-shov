import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { LoginModal } from './components/auth/LoginModal';
import { StudentOnboardingModal } from './components/auth/StudentOnboardingModal';
import { StaffAccountModal } from './components/auth/StaffAccountModal';
import { StudentSection } from './components/student/StudentSection';
import { StaffSection } from './components/staff/StaffSection';
import { HodDedicatedSection } from './components/staff/HodDedicatedSection';
import { VpDedicatedSection } from './components/staff/VpDedicatedSection';
import { PrincipalDedicatedSection } from './components/principal/PrincipalDedicatedSection';
import { InstitutionalGateway } from './components/auth/InstitutionalGateway';
import { DepartmentPromptModal } from './components/common/DepartmentPromptModal';
import { Department } from './types';
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  Crown, 
  Landmark, 
  Sparkles,
  Layers,
  KeyRound
} from 'lucide-react';

function AppContent() {
  const { user, role, isAuthenticated, completeStudentOnboarding, createNewStaffAccount, addNotification } = useAuth();
  
  const [loginModalMode, setLoginModalMode] = useState<'otp' | 'login' | 'signup' | 'council' | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showStaffCreateModal, setShowStaffCreateModal] = useState(false);
  const [showDepartmentPrompt, setShowDepartmentPrompt] = useState(false);

  // App Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('student-id');

  const handleDepartmentSelected = (dept: Department) => {
    setShowDepartmentPrompt(false);
    addNotification('Department Configured', `Active department updated to ${dept.name} (${dept.code}).`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      
      {/* Dynamic Top Navbar - Restricted strictly to the authenticated persona only */}
      <Header
        onOpenLoginModal={(mode) => setLoginModalMode(mode || 'login')}
        onOpenOnboardingModal={() => setShowOnboardingModal(true)}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t)}
      />

      {/* When Authenticated: Subtle Role Context Bar with NO other role tabs exposed */}
      {isAuthenticated && user && (
        <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-20 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between overflow-x-auto gap-4">
            
            {/* Active User Institutional Context */}
            <div className="flex items-center gap-2.5 text-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {role === 'STUDENT' && `Student Session: ${user.name} • ${user.designation || 'B.E. Computer Science'}`}
                {role === 'STAFF' && `Security & Proctor Desk: ${user.name} • Gate Turnstile 1`}
                {role === 'HOD' && `Department Head: ${user.name} • ${user.departmentName || 'Computer Science & Engineering'}`}
                {role === 'VICE_PRINCIPAL' && `Vice Principal: ${user.name} • Governance & Academic Affairs`}
                {role === 'PRINCIPAL' && `Office of the Principal: ${user.name} • Institutional Command`}
              </span>
            </div>

            {/* Right Context Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {role === 'STUDENT' && (
                <button
                  onClick={() => setShowDepartmentPrompt(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 cursor-pointer"
                >
                  <Building2 className="w-3 h-3" />
                  <span>{user.departmentId?.replace('dept-', '').toUpperCase() || 'CSE'}</span>
                </button>
              )}

              <button
                onClick={() => setLoginModalMode('login')}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                title="Switch Account or Login with Another Role"
              >
                <KeyRound className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Switch Account</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          
          {/* If Logged In: Strictly render ONLY the active persona's workspace */}
          {isAuthenticated && user ? (
            <>
              {role === 'STUDENT' && <StudentSection />}
              {role === 'STAFF' && <StaffSection />}
              {role === 'HOD' && <HodDedicatedSection />}
              {role === 'VICE_PRINCIPAL' && <VpDedicatedSection />}
              {role === 'PRINCIPAL' && <PrincipalDedicatedSection />}
              {role === 'ADMIN' && <PrincipalDedicatedSection />}
            </>
          ) : (
            /* If Logged Out: Show full institutional login gateway */
            <InstitutionalGateway
              onOpenOnboarding={() => setShowOnboardingModal(true)}
            />
          )}

        </div>
      </main>

      {/* Login Modal Popup */}
      <LoginModal
        isOpen={!!loginModalMode}
        initialMode={loginModalMode || 'login'}
        onClose={() => setLoginModalMode(null)}
        onOpenOnboarding={() => {
          setShowOnboardingModal(true);
          setShowDepartmentPrompt(true);
        }}
        onOpenStaffCreate={() => setShowStaffCreateModal(true)}
        onOpenEmailTemplates={() => {
          setActiveTab('principal-executive');
        }}
      />

      {/* Student Onboarding Modal */}
      <StudentOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={(st) => {
          completeStudentOnboarding(st);
          setShowDepartmentPrompt(true);
        }}
      />

      {/* Staff Account Modal */}
      <StaffAccountModal
        isOpen={showStaffCreateModal}
        onClose={() => setShowStaffCreateModal(false)}
        onCreateAccount={createNewStaffAccount}
      />

      {/* Department Prompt Modal */}
      <DepartmentPromptModal
        isOpen={showDepartmentPrompt}
        onClose={() => setShowDepartmentPrompt(false)}
        onSelectDepartment={handleDepartmentSelected}
        studentIdOrName={user?.name || user?.username}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AVS College of Technology • Secure Role-Isolated Educational Portal</p>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Role-Based Data Isolation Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
