import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  FolderOpen,
  Trash2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Payment, Statement, StatementStudentSpec, Student } from '../types';
import { calculateStatementSummary } from '../utils/calculations';
import { formatPeso } from '../utils/currency';
import { ClassRosterModal } from './ClassRosterModal';

interface DashboardProps {
  statements: Statement[];
  students: Student[];
  payments: Payment[];
  specifications: StatementStudentSpec[];
  onOpenCreateModal: () => void;
  onOpenStatement: (statementId: string) => void;
  onDeleteStatement: (statementId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  statements,
  students,
  payments,
  specifications,
  onOpenCreateModal,
  onOpenStatement,
  onDeleteStatement,
}) => {
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  // Compute overall statistics across all statements
  const statementSummaries = statements.map((stmt) => {
    const summary = calculateStatementSummary(stmt, students, payments, specifications);
    return {
      statement: stmt,
      ...summary,
    };
  });

  const totalAllCollected = statementSummaries.reduce(
    (sum, item) => sum + item.calculations.totalCollected,
    0
  );
  const totalAllBalance = statementSummaries.reduce(
    (sum, item) => sum + item.calculations.totalBalance,
    0
  );

  return (
    <div className="space-y-8">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider mb-1.5">
            BSIT 1-1 Official Portal • Treasurer: Del Socorro, Joland
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            BSIT 1-1 Financial Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Class contribution and financial statement manager (Gawing Easy ang Life &lt;3)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsRosterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>View Class List ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Create Blank Statement</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Active Statements</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{statements.length}</div>
          <span className="text-[11px] text-slate-400">Class projects & requirements</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs bg-emerald-50/20">
          <span className="text-xs font-semibold uppercase text-emerald-800">Total Collected</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{formatPeso(totalAllCollected)}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Across all statements</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs bg-amber-50/20">
          <span className="text-xs font-semibold uppercase text-amber-800">Total Outstanding</span>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{formatPeso(totalAllBalance)}</div>
          <span className="text-[11px] text-amber-600 font-medium">Remaining balance</span>
        </div>

        {/* CLICKABLE FIXED ROSTER STAT CARD */}
        <button
          type="button"
          onClick={() => setIsRosterModalOpen(true)}
          className="group text-left bg-white hover:bg-indigo-50/40 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-xs transition-all cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          title="Click to view the complete BSIT 1-1 class roster"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 group-hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fixed Roster</span>
            </span>
            <span className="text-[10px] font-bold text-indigo-600 opacity-80 group-hover:opacity-100 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-0.5">
              <span>View List</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 group-hover:text-indigo-950 mt-1 transition-colors">
            {students.length}
          </div>
          <span className="text-[11px] text-indigo-600/80 font-medium block mt-0.5">
            Click to view all {students.length} students &rarr;
          </span>
        </button>
      </div>

      {/* Statements Grid or Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Financial Statements
          </h2>
          {statements.length > 0 && (
            <span className="text-xs text-slate-500">
              Showing {statements.length} statement{statements.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {statements.length === 0 ? (
          /* Attractive Empty State */
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 sm:p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              No financial statements yet.
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Create your first statement to begin recording class contributions.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Create Blank Statement</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors w-full sm:w-auto justify-center"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>View Class List ({students.length})</span>
              </button>
            </div>
          </div>
        ) : (
          /* Statement Cards List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {statementSummaries.map(({ statement, calculations }) => {
              return (
                <div
                  key={statement.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-1 space-y-4">
                    {/* Card Header */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Financial Statement
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                        {statement.name}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1">
                        Target per student:{' '}
                        <span className="font-semibold text-slate-800 font-mono">
                          {formatPeso(statement.requiredAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Collection Progress</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {calculations.percentCollected}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(calculations.percentCollected, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial Figures */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                        <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
                          Collected
                        </span>
                        <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                          {formatPeso(calculations.totalCollected)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                        <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider">
                          Balance
                        </span>
                        <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                          {formatPeso(calculations.totalBalance)}
                        </div>
                      </div>
                    </div>

                    {/* Student Breakdown Pills */}
                    <div className="pt-1">
                      <div className="text-[11px] text-slate-400 font-medium mb-1.5">Status breakdown:</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          {calculations.paidCount} Paid
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                          {calculations.partialCount} Partial
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {calculations.unpaidCount} Unpaid
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenStatement(statement.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 hover:text-white bg-white hover:bg-slate-900 border border-slate-300 hover:border-slate-900 rounded-xl transition-all shadow-xs"
                    >
                      <span>Open Statement</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteStatement(statement.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Statement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Class Roster Modal */}
      <ClassRosterModal
        isOpen={isRosterModalOpen}
        students={students}
        onClose={() => setIsRosterModalOpen(false)}
      />
    </div>
  );
};
