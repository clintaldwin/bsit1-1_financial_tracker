import React, { useState, useEffect } from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { StudentStatementSummary } from '../types';
import { formatPeso } from '../utils/currency';

interface StudentTableRowProps {
  summary: StudentStatementSummary;
  onRecordPayment: (summary: StudentStatementSummary) => void;
  onSaveSpecification: (studentId: string, spec: string) => void;
  onViewStudentHistory?: (summary: StudentStatementSummary) => void;
}

interface StudentMobileCardProps {
  summary: StudentStatementSummary;
  onRecordPayment: (summary: StudentStatementSummary) => void;
  onSaveSpecification: (studentId: string, spec: string) => void;
  onViewStudentHistory?: (summary: StudentStatementSummary) => void;
}

export const renderStatusBadge = (status: StudentStatementSummary['status']) => {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
          Paid
        </span>
      );
    case 'partial':
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200">
          Partial
        </span>
      );
    case 'unpaid':
    default:
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200">
          Unpaid
        </span>
      );
  }
};

/**
 * Desktop table row component
 */
export const StudentTableRow: React.FC<StudentTableRowProps> = ({
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
      setTimeout(() => setIsSavedRecently(false), 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
      {/* Index Number */}
      <td className="py-2 px-3 text-center text-xs font-mono text-slate-500">
        {summary.student.studentNumber}
      </td>

      {/* Student Name */}
      <td className="py-2 px-3 font-semibold text-slate-900 text-sm">
        <div className="flex items-center gap-1.5">
          <span>{summary.student.name}</span>
          {summary.payments.length > 0 && onViewStudentHistory && (
            <button
              type="button"
              onClick={() => onViewStudentHistory(summary)}
              className="text-[11px] text-emerald-700 hover:underline font-mono"
              title={`${summary.payments.length} payment(s)`}
            >
              ({summary.payments.length})
            </button>
          )}
        </div>
      </td>

      {/* Specification */}
      <td className="py-1.5 px-2 min-w-[140px]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={specValue}
            onChange={(e) => setSpecValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Add note..."
            className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400"
          />
          {isSavedRecently && (
            <Check className="w-3.5 h-3.5 text-emerald-600 absolute right-2 pointer-events-none" />
          )}
        </div>
      </td>

      {/* Required */}
      <td className="py-2 px-3 text-right font-mono text-xs text-slate-600">
        {formatPeso(summary.requiredAmount)}
      </td>

      {/* Paid */}
      <td className="py-2 px-3 text-right font-mono text-xs font-bold text-emerald-900">
        {formatPeso(summary.paidAmount)}
      </td>

      {/* Balance */}
      <td className="py-2 px-3 text-right font-mono text-xs">
        {summary.balance > 0 ? (
          <span className="font-bold text-amber-800">{formatPeso(summary.balance)}</span>
        ) : (
          <span className="font-bold text-emerald-700">₱0</span>
        )}
      </td>

      {/* Status */}
      <td className="py-2 px-2 text-center">
        {renderStatusBadge(summary.status)}
      </td>

      {/* Action */}
      <td className="py-2 px-3 text-right">
        <button
          type="button"
          onClick={() => onRecordPayment(summary)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-700 rounded transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Pay</span>
        </button>
      </td>
    </tr>
  );
};

/**
 * Mobile Card View (optimized for narrow smartphone displays)
 */
export const StudentMobileCard: React.FC<StudentMobileCardProps> = ({
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
      setTimeout(() => setIsSavedRecently(false), 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
      {/* Top Name + Status Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
            {summary.student.studentNumber}
          </span>
          <span className="font-bold text-slate-900 text-sm truncate">
            {summary.student.name}
          </span>
        </div>
        <div>{renderStatusBadge(summary.status)}</div>
      </div>

      {/* 3-Column Financial Stat Strip */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 text-center text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">Required</span>
          <span className="text-slate-700 font-medium">{formatPeso(summary.requiredAmount)}</span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-700 block font-sans font-bold">Paid</span>
          <span className="text-emerald-900 font-bold">{formatPeso(summary.paidAmount)}</span>
        </div>
        <div>
          <span className="text-[10px] text-amber-700 block font-sans font-bold">Balance</span>
          <span className={`font-bold ${summary.balance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
            {summary.balance > 0 ? formatPeso(summary.balance) : '₱0'}
          </span>
        </div>
      </div>

      {/* Compact Input + Action in One Single Row */}
      <div className="flex items-center gap-2 pt-0.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={specValue}
            onChange={(e) => setSpecValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Specification / Note..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-slate-400"
          />
          {isSavedRecently && (
            <Check className="w-3.5 h-3.5 text-emerald-600 absolute right-2 top-2 pointer-events-none" />
          )}
        </div>

        {summary.payments.length > 0 && onViewStudentHistory && (
          <button
            type="button"
            onClick={() => onViewStudentHistory(summary)}
            className="px-2 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-medium shrink-0"
          >
            History ({summary.payments.length})
          </button>
        )}

        <button
          type="button"
          onClick={() => onRecordPayment(summary)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-700 rounded transition-colors shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Pay</span>
        </button>
      </div>
    </div>
  );
};
