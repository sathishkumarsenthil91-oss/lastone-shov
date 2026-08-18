import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboard } from '../student/StudentDashboard';
import { FineManagement } from '../admin/FineManagement';
import { StaffScanner } from '../staff/StaffScanner';
import { AdminDashboard } from '../admin/AdminDashboard';
import { FinePaymentModal } from '../student/FinePaymentModal';
import { INITIAL_FINES, INITIAL_PAYMENTS } from '../../data/mockData';
import { Fine, Payment } from '../../types';
import { 
  fetchFinesFromSupabase, 
  settleFineInSupabase 
} from '../../services/campusSupabaseService';
import { supabase } from '../../services/supabase';
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  Download, 
  Eye, 
  Layers,
  RefreshCw
} from 'lucide-react';

interface DashboardAndFinesSectionProps {
  onOpenDigitalId?: () => void;
  onOpenScanner?: () => void;
  onOpenEmailTemplates?: () => void;
}

export const DashboardAndFinesSection: React.FC<DashboardAndFinesSectionProps> = ({
  onOpenDigitalId,
  onOpenScanner,
  onOpenEmailTemplates
}) => {
  const { user, role, addNotification } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'fines' | 'payments'>('dashboard');
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [selectedFineForPayment, setSelectedFineForPayment] = useState<Fine | null>(null);

  // Load from Supabase on mount and listen to changes
  useEffect(() => {
    let isMounted = true;
    const loadFines = async () => {
      const data = await fetchFinesFromSupabase();
      if (isMounted && data.length > 0) {
        setFines(data);
      }
    };
    loadFines();

    const channel = supabase
      .channel('realtime_student_fines')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_fines' }, (payload) => {
        if (payload.new) {
          const item = payload.new as any;
          const updatedFine: Fine = {
            id: item.id,
            fineNumber: item.fine_number,
            studentId: item.student_id || 'st-001',
            studentName: item.student_name,
            registerNumber: item.register_number,
            amount: Number(item.amount),
            reason: item.reason,
            dueDate: item.due_date,
            status: item.status,
            createdAt: new Date(item.created_at).toISOString().split('T')[0],
            paidAt: item.paid_at
          };

          setFines(prev => {
            const exists = prev.some(f => f.id === updatedFine.id);
            if (exists) {
              return prev.map(f => f.id === updatedFine.id ? updatedFine : f);
            }
            return [updatedFine, ...prev];
          });
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter fines for current student if student role
  const userFines = role === 'STUDENT' && user
    ? fines.filter(f => f.registerNumber.toLowerCase() === user.username.toLowerCase() || f.studentName.toLowerCase() === user.name.toLowerCase())
    : fines;

  const pendingFines = userFines.filter(f => f.status === 'PENDING');
  const totalPendingAmount = pendingFines.reduce((acc, curr) => acc + curr.amount, 0);

  const handleFinePaid = async (fineId: string) => {
    const paymentRef = `pay_${Math.random().toString(36).substring(7)}`;
    await settleFineInSupabase(fineId, paymentRef);

    setFines(prev => prev.map(f => f.id === fineId ? { ...f, status: 'PAID', paidAt: new Date().toISOString() } : f));
    const paidFine = fines.find(f => f.id === fineId);
    if (paidFine) {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        fineId: paidFine.id,
        studentId: paidFine.studentId,
        studentName: paidFine.studentName,
        amount: paidFine.amount,
        gatewayOrderId: `ord_${Math.random().toString(36).substring(7)}`,
        gatewayPaymentId: paymentRef,
        paymentMethod: 'UPI_COLLECT',
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString()
      };
      setPayments(prev => [newPayment, ...prev]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Combined Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              My Dashboards & Fines
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operational console, penalty clearance, and transaction ledger (Supabase Synced)
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fines')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer relative ${
              activeSubTab === 'fines'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Fines & Penalties</span>
            {pendingFines.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold">
                {pendingFines.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'payments'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payment History</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Role Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div>
          {role === 'STUDENT' && <StudentDashboard onOpenDigitalId={onOpenDigitalId} />}
          {(role === 'STAFF') && <StaffScanner />}
          {(role === 'HOD' || role === 'VICE_PRINCIPAL' || role === 'ADMIN') && (
            <AdminDashboard onOpenEmailTemplates={onOpenEmailTemplates} />
          )}
        </div>
      )}

      {/* Sub-tab 2: Fines Management */}
      {activeSubTab === 'fines' && (
        <div className="space-y-6">
          {/* Outstanding Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-black uppercase tracking-widest border border-rose-500/30 flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>DISCIPLINARY FINE SETTLEMENTS</span>
                </span>
              </div>
              <h3 className="text-xl font-black text-white">Disciplinary Fines & Dues</h3>
              <p className="text-xs text-slate-400 max-w-xl mt-1">
                Outstanding charges assessed by campus authorities and library administrators.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Total Pending Dues</span>
              <p className="text-2xl font-black text-white mt-0.5">₹{totalPendingAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Fines List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Fine Ledger</h4>
              <span className="text-xs font-mono text-slate-400">{userFines.length} records</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {userFines.map((fine) => (
                <div key={fine.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{fine.fineNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fine.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : fine.status === 'WAIVED'
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {fine.status}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{fine.reason}</h5>
                    <p className="text-xs text-slate-400">
                      Student: <span className="text-slate-700 dark:text-slate-300 font-semibold">{fine.studentName}</span> ({fine.registerNumber}) • Due Date: {fine.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 dark:text-white">₹{fine.amount}</span>
                      <p className="text-[10px] text-slate-400">Assessment Fee</p>
                    </div>

                    {fine.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedFineForPayment(fine)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                      >
                        Pay Online
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Payment Ledger */}
      {activeSubTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Settled Payments History</h4>
            <span className="text-xs font-mono text-slate-400">{payments.length} transactions</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map(pay => (
              <div key={pay.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white font-mono">{pay.gatewayPaymentId}</h5>
                    <p className="text-[11px] text-slate-400">Paid by {pay.studentName} via {pay.paymentMethod}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{pay.amount}</span>
                  <p className="text-[10px] text-slate-400">{new Date(pay.paidAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fine Payment Modal */}
      {selectedFineForPayment && (
        <FinePaymentModal
          isOpen={Boolean(selectedFineForPayment)}
          onClose={() => setSelectedFineForPayment(null)}
          fine={selectedFineForPayment}
          onSuccess={handleFinePaid}
        />
      )}
    </div>
  );
};
