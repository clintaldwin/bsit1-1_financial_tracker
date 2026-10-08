import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-base text-slate-900">
              Record Payment
            </h2>
            <p className="text-xs text-slate-500">{statementName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
            {/* Student Info Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-mono block">
                  #{studentSummary.student.studentNumber} Student
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  {studentSummary.student.name}
                </span>
                {studentSummary.specification && (
                  <span className="text-xs text-slate-600 block mt-0.5">
                    Spec: {studentSummary.specification}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                  Balance
                </span>
                <span className={`text-base font-bold font-mono ${remainingBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                  {formatPeso(remainingBalance)}
                </span>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (PHP) <span className="text-rose-600">*</span>
              </label>
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 text-base font-mono font-bold focus:outline-hidden focus:border-slate-500"
              />

              {/* Quick Fill Buttons */}
              {remainingBalance > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(remainingBalance)}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono rounded"
                  >
                    Exact ({formatPeso(remainingBalance)})
                  </button>
                  {remainingBalance >= 100 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(100)}
                      className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono rounded"
                    >
                      ₱100
                    </button>
                  )}
                  {remainingBalance >= 200 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(200)}
                      className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono rounded"
                    >
                      ₱200
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden font-mono"
              />
            </div>

            {/* Note / Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cash, GCash ref #"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
