import React from 'react';
import { StatementCalculations } from '../types';
import { formatPeso } from '../utils/currency';

interface SummaryCardsProps {
  calculations: StatementCalculations;
  totalStudents: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ calculations, totalStudents }) => {
  return (
    <div className="space-y-3">
      {/* 3 Main Currency Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Total Target */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-500 block truncate">
            Target
          </span>
          <div className="mt-1 font-mono text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatPeso(calculations.totalRequired)}
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 block truncate">
            {totalStudents} students
          </span>
        </div>

        {/* Total Collected */}
        <div className="bg-emerald-50/60 p-3 sm:p-4 rounded-xl border border-emerald-200">
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-emerald-800 block truncate">
            Collected
          </span>
          <div className="mt-1 font-mono text-base sm:text-2xl font-bold text-emerald-900 tracking-tight">
            {formatPeso(calculations.totalCollected)}
          </div>
          <span className="text-[10px] sm:text-xs text-emerald-700 font-semibold mt-0.5 block truncate">
            {calculations.percentCollected}%
          </span>
        </div>

        {/* Total Balance */}
        <div className="bg-amber-50/60 p-3 sm:p-4 rounded-xl border border-amber-200">
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-amber-800 block truncate">
            Balance
          </span>
          <div className="mt-1 font-mono text-base sm:text-2xl font-bold text-amber-900 tracking-tight">
            {formatPeso(calculations.totalBalance)}
          </div>
          <span className="text-[10px] sm:text-xs text-amber-700 font-medium mt-0.5 block truncate">
            {calculations.unpaidCount + calculations.partialCount} pending
          </span>
        </div>
      </div>

      {/* Clean Collection Progress Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700">Progress: {calculations.percentCollected}%</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-700 font-semibold">{calculations.paidCount} Paid</span>
            <span className="text-amber-700 font-semibold">{calculations.partialCount} Partial</span>
            <span className="text-slate-500 font-medium">{calculations.unpaidCount} Unpaid</span>
          </div>
        </div>

        <div className="w-full h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          {calculations.paidCount > 0 && (
            <div
              style={{ width: `${(calculations.paidCount / totalStudents) * 100}%` }}
              className="h-full bg-emerald-600 rounded-full transition-all"
            />
          )}
          {calculations.partialCount > 0 && (
            <div
              style={{ width: `${(calculations.partialCount / totalStudents) * 100}%` }}
              className="h-full bg-amber-500 transition-all mx-0.5 rounded-full"
            />
          )}
          {calculations.unpaidCount > 0 && (
            <div
              style={{ width: `${(calculations.unpaidCount / totalStudents) * 100}%` }}
              className="h-full bg-slate-200 transition-all rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};
