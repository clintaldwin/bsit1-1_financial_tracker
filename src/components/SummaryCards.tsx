import React from 'react';
import { PhilippinePeso, Wallet, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { StatementCalculations } from '../types';
import { formatPeso } from '../utils/currency';

interface SummaryCardsProps {
  calculations: StatementCalculations;
  totalStudents: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ calculations, totalStudents }) => {
  return (
    <div className="space-y-4">
      {/* 3 Main Currency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Required */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Required
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatPeso(calculations.totalRequired)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Target for {totalStudents} students</span>
            <span className="font-mono text-slate-400">100%</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Total Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 tracking-tight">
              {formatPeso(calculations.totalCollected)}
            </span>
          </div>
          <div className="mt-1 text-xs text-emerald-700 flex items-center justify-between font-medium">
            <span>{calculations.percentCollected}% collected</span>
            {calculations.totalOverpaid > 0 && (
              <span className="text-[11px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                +{formatPeso(calculations.totalOverpaid)} overpaid
              </span>
            )}
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-700 tracking-tight">
              {formatPeso(calculations.totalBalance)}
            </span>
          </div>
          <div className="mt-1 text-xs text-amber-700 flex items-center justify-between">
            <span>Remaining outstanding</span>
            <span className="font-mono text-amber-700 font-medium">
              {Math.max(0, Math.round((100 - calculations.percentCollected) * 10) / 10)}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar & Student Status Breakdown */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Collection Progress
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500">
              ({calculations.percentCollected}%)
            </span>
          </div>

          {/* Status Breakdown Pills */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Paid:</span>
              <span className="font-bold text-slate-900">{calculations.paidCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 font-medium">Partial:</span>
              <span className="font-bold text-slate-900">{calculations.partialCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span className="text-slate-600 font-medium">Unpaid:</span>
              <span className="font-bold text-slate-900">{calculations.unpaidCount}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar with 3 segments */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5">
          {calculations.paidCount > 0 && (
            <div
              style={{ width: `${(calculations.paidCount / totalStudents) * 100}%` }}
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
              title={`Paid: ${calculations.paidCount} students`}
            />
          )}
          {calculations.partialCount > 0 && (
            <div
              style={{ width: `${(calculations.partialCount / totalStudents) * 100}%` }}
              className="h-full bg-amber-400 transition-all duration-300"
              title={`Partial: ${calculations.partialCount} students`}
            />
          )}
          {calculations.unpaidCount > 0 && (
            <div
              style={{ width: `${(calculations.unpaidCount / totalStudents) * 100}%` }}
              className="h-full bg-slate-200 transition-all duration-300"
              title={`Unpaid: ${calculations.unpaidCount} students`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
