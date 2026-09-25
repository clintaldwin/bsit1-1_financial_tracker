import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, PhilippinePeso, Calendar, FileText, User } from 'lucide-react';
import { StudentStatementSummary } from '../types';
import { formatPeso, parsePeso } from '../utils/currency';
import { getTodayDateInputValue } from '../utils/calculations';

interface RecordPaymentModalProps {
  isOpen: boolean;
  studentSummary: StudentStatementSummary | null;
  statementName: string;
  onClose: () => void;
  onSavePayment: (data: {
    studentId: string;
    amount: number;
    date: string;
    note?: string;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  studentSummary,
  statementName,
  onClose,
  onSavePayment,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateInputValue());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && studentSummary) {
      // Default to remaining balance if > 0, otherwise empty
      if (studentSummary.balance > 0) {
        setAmountStr(studentSummary.balance.toString());
      } else {
        setAmountStr('');
      }
      setDate(getTodayDateInputValue());
      setNote('');
      setError('');

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, studentSummary]);

  if (!isOpen || !studentSummary) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parsePeso(amountStr);

    if (parsedAmount <= 0) {
      setError('Please enter an amount greater than ₱0');
      return;
    }

    onSavePayment({
      studentId: studentSummary.student.id,
      amount: parsedAmount,
      date: date || getTodayDateInputValue(),
      note: note.trim() || undefined,
    });
  };

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
    setError('');
  };

  const remainingBalance = studentSummary.balance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
              ₱
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Record Payment</h2>
              <p className="text-xs text-slate-400">Statement: {statementName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Student Info Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
                  #{studentSummary.student.studentNumber}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span>Student Name (Read-only)</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {studentSummary.student.name}
                  </div>
                  {studentSummary.specification && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      Spec: <span className="font-medium text-slate-700">{studentSummary.specification}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Remaining Balance</div>
                <div className={`text-base font-bold font-mono ${remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatPeso(remainingBalance)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Paid so far: <span className="font-semibold text-slate-700">{formatPeso(studentSummary.paidAmount)}</span>
                </div>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Payment Amount (PHP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-medium">
                  ₱
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    if (error) setError('');
                  }}
                  className={`block w-full rounded-xl border pl-8 pr-4 py-2.5 text-slate-900 text-lg font-mono font-semibold focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
                  }`}
                />
              </div>

              {/* Quick Amount Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {remainingBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(remainingBalance)}
                    className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                  >
                    Exact Balance ({formatPeso(remainingBalance)})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleQuickAmount(100)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                >
                  ₱100
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(200)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                >
                  ₱200
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(500)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                >
                  ₱500
                </button>
                {studentSummary.requiredAmount > 0 && studentSummary.requiredAmount !== remainingBalance && (
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(studentSummary.requiredAmount)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                  >
                    Full Requirement ({formatPeso(studentSummary.requiredAmount)})
                  </button>
                )}
              </div>

              {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
            </div>

            {/* Date input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Payment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Optional Note / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. GCash Ref #1234, Cash on hand, Installment 1..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
