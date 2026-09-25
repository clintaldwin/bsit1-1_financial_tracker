import React, { useState } from 'react';
import { X, Trash2, Calendar, FileText, Search, User, ArrowDownRight, History } from 'lucide-react';
import { Payment, Student } from '../types';
import { formatPeso } from '../utils/currency';
import { formatDate } from '../utils/calculations';
import { ConfirmationDialog } from './ConfirmationDialog';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  statementName: string;
  payments: Payment[];
  students: Student[];
  onClose: () => void;
  onDeletePayment: (paymentId: string) => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  statementName,
  payments,
  students,
  onClose,
  onDeletePayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  if (!isOpen) return null;

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  // Sort payments by date / creation desc
  const sortedPayments = [...payments].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    if (timeB !== timeA) return timeB - timeA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredPayments = sortedPayments.filter((p) => {
    const student = studentMap.get(p.studentId);
    const name = student?.name.toLowerCase() || '';
    const note = p.note?.toLowerCase() || '';
    const query = searchQuery.toLowerCase().trim();
    return name.includes(query) || note.includes(query) || p.amount.toString().includes(query);
  });

  const totalHistoryAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleDeleteConfirmed = () => {
    if (paymentToDelete) {
      onDeletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Payment History Log</h2>
                <p className="text-xs text-slate-400">Statement: {statementName} • {payments.length} total entries</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Toolbar & Search */}
          <div className="p-4 bg-slate-50 border-b border-slate-200/80 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
              />
            </div>
            <div className="text-right text-xs text-slate-500 shrink-0">
              Showing <span className="font-semibold text-slate-800">{filteredPayments.length}</span> entries ({formatPeso(totalHistoryAmount)})
            </div>
          </div>

          {/* Payment List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2 sm:p-4">
            {filteredPayments.length === 0 ? (
              <div className="py-12 text-center">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">No payment transactions found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? 'Try matching a different student name or clear the search.' : 'Payments recorded for this statement will appear here.'}
                </p>
              </div>
            ) : (
              filteredPayments.map((payment) => {
                const student = studentMap.get(payment.studentId);
                return (
                  <div
                    key={payment.id}
                    className="p-3.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 border border-emerald-100">
                        <ArrowDownRight className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {student?.name || 'Unknown Student'}
                          </span>
                          {student?.studentNumber && (
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{student.studentNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(payment.date)}</span>
                          </div>
                          {payment.note && (
                            <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] italic">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[200px]">{payment.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-bold font-mono text-emerald-600">
                          +{formatPeso(payment.amount)}
                        </span>
                      </div>
                      <button
                        onClick={() => setPaymentToDelete(payment)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete mistaken payment"
                        aria-label="Delete payment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              Need to correct a recorded amount? Delete it here and record the corrected amount.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation for deleting payment */}
      <ConfirmationDialog
        isOpen={Boolean(paymentToDelete)}
        title="Delete Payment Entry?"
        message={`Are you sure you want to delete this payment of ${paymentToDelete ? formatPeso(paymentToDelete.amount) : ''} for ${
          paymentToDelete ? studentMap.get(paymentToDelete.studentId)?.name : ''
        }? This will immediately update the student's balance and statement totals.`}
        confirmText="Delete Payment"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPaymentToDelete(null)}
      />
    </>
  );
};
