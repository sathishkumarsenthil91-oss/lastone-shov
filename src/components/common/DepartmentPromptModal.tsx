import React, { useState } from 'react';
import { ALL_COLLEGE_DEPARTMENTS } from '../../data/departmentsData';
import { Department } from '../../types';
import { 
  Building2, 
  Search, 
  Check, 
  X, 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface DepartmentPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDepartment: (dept: Department) => void;
  currentSelectedCode?: string;
  title?: string;
  subtitle?: string;
  studentIdOrName?: string;
}

export const DepartmentPromptModal: React.FC<DepartmentPromptModalProps> = ({
  isOpen,
  onClose,
  onSelectDepartment,
  currentSelectedCode,
  title = "Please Select Your Department",
  subtitle = "Choose your collegiate academic branch to verify and bind your identity credentials.",
  studentIdOrName
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredDepartments = ALL_COLLEGE_DEPARTMENTS.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.hodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-black uppercase tracking-widest border border-blue-500/30 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              <span>COLLEGIATE DEPARTMENT VERIFICATION</span>
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            {title}
          </h3>
          
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {subtitle}
          </p>

          {studentIdOrName && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-blue-950/50 border border-blue-800/60 inline-flex items-center gap-2 text-xs text-blue-300">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Identity Record: <strong>{studentIdOrName}</strong></span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by department name, code (e.g. CSE, MECH, ECE), or HOD..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
              autoFocus
            />
          </div>
        </div>

        {/* Department List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredDepartments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p>No matching departments found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredDepartments.map((dept) => {
              const isSelected = currentSelectedCode === dept.code;
              return (
                <button
                  key={dept.code}
                  onClick={() => {
                    onSelectDepartment(dept as any);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/30'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-xs shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors'
                    }`}>
                      {dept.code}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {dept.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        HOD: <span className="font-semibold text-slate-700 dark:text-slate-300">{dept.hodName}</span> • {dept.studentCount} Students
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>All collegiate departments supported</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
