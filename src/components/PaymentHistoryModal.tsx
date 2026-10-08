import React, { useState } from 'react';
import { X, Trash2, Calendar, Search, ArrowDownRight } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-base text-slate-900">
                Payment History
              </h2>
              <p className="text-xs text-slate-500">
                {statementName} · {payments.length} payments ({formatPeso(totalHistoryAmount)})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 bg-white border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
              />
            </div>
          </div>

          {/* Payment List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2 sm:p-3">
            {filteredPayments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No payments found
              </div>
            ) : (
              filteredPayments.map((payment) => {
                const student = studentMap.get(payment.studentId);
                return (
                  <div
                    key={payment.id}
                    className="p-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-slate-500">
                          #{student?.studentNumber}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {student?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                        <span>{formatDate(payment.date)}</span>
                        {payment.note && (
                          <span className="font-sans text-slate-600 truncate max-w-xs">
                            · &ldquo;{payment.note}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-sm font-bold text-emerald-800">
                        +{formatPeso(payment.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPaymentToDelete(payment)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete payment"
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
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Payment Confirm Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(paymentToDelete)}
        title="Delete Payment?"
        message={`Delete payment of ${
          paymentToDelete ? formatPeso(paymentToDelete.amount) : ''
        }?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPaymentToDelete(null)}
      />
    </>
  );
};
