import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DigitalIDCard } from '../student/DigitalIDCard';
import { StaffDigitalIDCard } from '../staff/StaffDigitalIDCard';
import { HodDigitalIDCard } from '../staff/HodDigitalIDCard';
import { VpDigitalIDCard } from '../staff/VpDigitalIDCard';
import { StaffScanner } from '../staff/StaffScanner';
import { DepartmentPromptModal } from '../common/DepartmentPromptModal';
import { Department } from '../../types';
import { 
  QrCode, 
  Scan, 
  CreditCard, 
  Camera, 
  ShieldCheck, 
  Building2, 
  Search, 
  UserCheck, 
  Layers,
  Sparkles
} from 'lucide-react';

export const QrAndIdSection: React.FC = () => {
  const { user, role, addNotification } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'id-card' | 'scanner'>(
    role === 'STUDENT' ? 'id-card' : 'scanner'
  );
  const [showDeptPrompt, setShowDeptPrompt] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>(user?.departmentName || 'Computer Science & Engineering');

  const handleDeptSelected = (dept: Department) => {
    setSelectedDept(dept.name);
    addNotification('Department Linked', `Your identity is bound to ${dept.name} (${dept.code}).`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              QR and Digital ID Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biometric digital identity, dynamic QR security tokens, and live gate scanners
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowDeptPrompt(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer hover:bg-blue-100"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Select Department</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveSubTab('id-card')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'id-card'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Digital ID Card</span>
            </button>

            <button
              onClick={() => setActiveSubTab('scanner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'scanner'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Gate QR Scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Digital ID Card */}
      {activeSubTab === 'id-card' && (
        <div className="space-y-4">
          {role === 'STAFF' ? (
            <StaffDigitalIDCard />
          ) : role === 'HOD' ? (
            <HodDigitalIDCard />
          ) : role === 'VICE_PRINCIPAL' ? (
            <VpDigitalIDCard />
          ) : (
            <DigitalIDCard 
              onOpenDepartmentPrompt={() => setShowDeptPrompt(true)}
              customDepartmentName={selectedDept}
            />
          )}
        </div>
      )}

      {/* Sub-tab 2: Live QR Scanner */}
      {activeSubTab === 'scanner' && (
        <div className="space-y-4">
          <StaffScanner />
        </div>
      )}

      {/* Department Prompt Modal */}
      <DepartmentPromptModal
        isOpen={showDeptPrompt}
        onClose={() => setShowDeptPrompt(false)}
        onSelectDepartment={handleDeptSelected}
        studentIdOrName={user?.name || user?.username}
      />

    </div>
  );
};
