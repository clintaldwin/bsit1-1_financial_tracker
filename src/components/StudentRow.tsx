import React, { useState, useEffect } from 'react';
import { PhilippinePeso, PlusCircle, Check, History, ChevronRight } from 'lucide-react';
import { StudentStatementSummary } from '../types';
import { formatPeso } from '../utils/currency';

interface StudentRowProps {
  summary: StudentStatementSummary;
  onRecordPayment: (summary: StudentStatementSummary) => void;
  onSaveSpecification: (studentId: string, spec: string) => void;
  onViewStudentHistory?: (summary: StudentStatementSummary) => void;
}

export const StudentRow: React.FC<StudentRowProps> = ({
  summary,
  onRecordPayment,
  onSaveSpecification,
  onViewStudentHistory,
}) => {
  const [specValue, setSpecValue] = useState(summary.specification || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    setSpecValue(summary.specification || '');
  }, [summary.specification]);

  const handleBlur = () => {
    if (specValue !== summary.specification) {
      onSaveSpecification(summary.student.id, specValue);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Status Badge Rendering
  const renderStatusBadge = () => {
    switch (summary.status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Paid
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Partial
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Unpaid
          </span>
        );
    }
  };

  return (
    <>
      {/* DESKTOP TABLE ROW */}
      <tr className="hidden md:table-row hover:bg-slate-50/80 transition-colors border-b border-slate-100">
        {/* Number */}
        <td className="py-3 px-3 text-center text-xs font-mono text-slate-400">
          {summary.student.studentNumber}
        </td>

        {/* Student Name */}
        <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
          <div className="flex items-center gap-2">
            <span>{summary.student.name}</span>
            {summary.payments.length > 0 && onViewStudentHistory && (
              <button
                type="button"
                onClick={() => onViewStudentHistory(summary)}
                className="text-[11px] font-normal text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-0.5"
                title={`${summary.payments.length} payment(s) recorded`}
              >
                ({summary.payments.length})
              </button>
            )}
          </div>
        </td>

        {/* Specification (Generic, placeholder "Add specification...") */}
        <td className="py-2.5 px-3 min-w-[180px]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Add specification..."
              className="w-full text-xs bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            {isSavedRecently && (
              <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-2 pointer-events-none animate-in fade-in" />
            )}
          </div>
        </td>

        {/* Required */}
        <td className="py-3 px-3 text-right font-mono text-xs text-slate-600">
          {formatPeso(summary.requiredAmount)}
        </td>

        {/* Amount Paid */}
        <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-slate-900">
          {formatPeso(summary.paidAmount)}
        </td>

        {/* Balance */}
        <td className="py-3 px-3 text-right font-mono text-xs">
          {summary.balance > 0 ? (
            <span className="font-semibold text-amber-700">{formatPeso(summary.balance)}</span>
          ) : (
            <div className="flex flex-col items-end">
              <span className="font-semibold text-emerald-700">₱0</span>
              {summary.overpaid > 0 && (
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1 rounded font-semibold mt-0.5">
                  +{formatPeso(summary.overpaid)} overpaid
                </span>
              )}
            </div>
          )}
        </td>

        {/* Status */}
        <td className="py-3 px-3 text-center">
          {renderStatusBadge()}
        </td>

        {/* Action */}
        <td className="py-3 px-4 text-right">
          <button
            type="button"
            onClick={() => onRecordPayment(summary)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Payment</span>
          </button>
        </td>
      </tr>

      {/* MOBILE CARD ROW */}
      <div className="md:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-bold">
              #{summary.student.studentNumber}
            </span>
            <span className="font-bold text-slate-900 text-sm leading-tight">
              {summary.student.name}
            </span>
          </div>
          <div>{renderStatusBadge()}</div>
        </div>

        {/* Specification field */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Specification
          </label>
          <div className="relative">
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Add specification..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
            />
            {isSavedRecently && (
              <Check className="w-3.5 h-3.5 text-emerald-500 absolute right-2 top-2 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Financial Numbers Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Required</div>
            <div className="font-mono text-xs text-slate-700 font-medium mt-0.5">
              {formatPeso(summary.requiredAmount)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Paid</div>
            <div className="font-mono text-xs text-slate-900 font-bold mt-0.5">
              {formatPeso(summary.paidAmount)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Balance</div>
            <div className={`font-mono text-xs font-bold mt-0.5 ${summary.balance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {summary.balance > 0 ? formatPeso(summary.balance) : '₱0'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          {summary.payments.length > 0 && onViewStudentHistory ? (
            <button
              type="button"
              onClick={() => onViewStudentHistory(summary)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>{summary.payments.length} payment(s)</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">No payments yet</span>
          )}

          <button
            type="button"
            onClick={() => onRecordPayment(summary)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>
    </>
  );
};
