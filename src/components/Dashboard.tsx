import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  FolderOpen,
  Trash2,
  Users,
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

  // Compute statistics
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            BSIT 1-1 Financial Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Treasurer: Del Socorro, Joland · {students.length} Students
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRosterModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Class List ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Statement</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold uppercase text-slate-500 block">
            Statements
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {statements.length}
          </div>
        </div>

        <div className="bg-emerald-50/50 p-3 sm:p-4 rounded-xl border border-emerald-200">
          <span className="text-[11px] font-semibold uppercase text-emerald-800 block">
            Collected
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-900 mt-1">
            {formatPeso(totalAllCollected)}
          </div>
        </div>

        <div className="bg-amber-50/50 p-3 sm:p-4 rounded-xl border border-amber-200">
          <span className="text-[11px] font-semibold uppercase text-amber-800 block">
            Balance
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-900 mt-1">
            {formatPeso(totalAllBalance)}
          </div>
        </div>
      </div>

      {/* Statements Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Statements ({statements.length})
          </h2>
        </div>

        {statements.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 sm:p-12 text-center">
            <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">No statements yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create a statement (e.g. Intrams, T-Shirt, Class Fund) to begin.
            </p>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Statement</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {statementSummaries.map(({ statement, calculations }) => (
              <div
                key={statement.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {statement.name}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 shrink-0">
                      {formatPeso(statement.requiredAmount)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-mono font-bold text-slate-900">{calculations.percentCollected}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(calculations.percentCollected, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-800 uppercase font-bold">Collected</span>
                      <div className="font-mono font-bold text-emerald-900 text-sm mt-0.5">
                        {formatPeso(calculations.totalCollected)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-800 uppercase font-bold">Balance</span>
                      <div className="font-mono font-bold text-amber-900 text-sm mt-0.5">
                        {formatPeso(calculations.totalBalance)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenStatement(statement.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteStatement(statement.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
