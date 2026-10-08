import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  History,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Payment,
  Statement,
  StatementStudentSpec,
  Student,
  StudentStatementSummary,
} from '../types';
import { calculateStatementSummary } from '../utils/calculations';
import { formatPeso } from '../utils/currency';
import { SummaryCards } from './SummaryCards';
import { StudentTable } from './StudentTable';
import { RecordPaymentModal } from './RecordPaymentModal';
import { PaymentHistoryModal } from './PaymentHistoryModal';
import { ExportStatementModal } from './ExportStatementModal';
import { EditStatementModal } from './EditStatementModal';
import { ConfirmationDialog } from './ConfirmationDialog';

interface StatementDetailProps {
  statement: Statement;
  students: Student[];
  payments: Payment[];
  specifications: StatementStudentSpec[];
  onBackToDashboard: () => void;
  onRecordPayment: (data: { studentId: string; amount: number; date: string; note?: string }) => void;
  onDeletePayment: (paymentId: string) => void;
  onSaveSpecification: (studentId: string, spec: string) => void;
  onUpdateStatement: (statementId: string, updates: { name: string; requiredAmount: number; headerTitle?: string }) => void;
  onDeleteStatement: (statementId: string) => void;
}

export const StatementDetail: React.FC<StatementDetailProps> = ({
  statement,
  students,
  payments,
  specifications,
  onBackToDashboard,
  onRecordPayment,
  onDeletePayment,
  onSaveSpecification,
  onUpdateStatement,
  onDeleteStatement,
}) => {
  // Modal states
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<StudentStatementSummary | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Compute calculated statement summaries
  const { studentSummaries, calculations } = calculateStatementSummary(
    statement,
    students,
    payments,
    specifications
  );

  const statementPayments = payments.filter((p) => p.statementId === statement.id);

  const handleRecordPaymentSave = (data: {
    studentId: string;
    amount: number;
    date: string;
    note?: string;
  }) => {
    onRecordPayment({
      ...data,
    });
    setSelectedStudentForPayment(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Mobile-Friendly Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>Dashboard</span>
        </button>

        {/* Action Buttons Toolbar */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
          {/* Export / Share PNG (Emerald CTA) */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="col-span-3 sm:col-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share & Export PNG</span>
          </button>

          {/* Payment History */}
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>History ({statementPayments.length})</span>
          </button>

          {/* Edit Statement */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </button>

          {/* Delete Statement */}
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Statement Banner Header - Clean & Simple */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              BSIT 1-1 Statement
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {statement.name}
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Required: <strong className="text-slate-800 font-mono">{formatPeso(statement.requiredAmount)}</strong> / student · {students.length} Students
            </div>
          </div>

          <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Target Total</span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
              {formatPeso(calculations.totalRequired)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards Strip */}
      <SummaryCards
        calculations={calculations}
        totalStudents={students.length}
      />

      {/* Student Table Roster */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Student Roster ({students.length})
          </h2>
        </div>

        <StudentTable
          studentSummaries={studentSummaries}
          onRecordPayment={(summary) => setSelectedStudentForPayment(summary)}
          onSaveSpecification={(studentId, spec) => onSaveSpecification(studentId, spec)}
          onViewStudentHistory={() => setIsHistoryModalOpen(true)}
        />
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={Boolean(selectedStudentForPayment)}
        studentSummary={selectedStudentForPayment}
        statementName={statement.name}
        onClose={() => setSelectedStudentForPayment(null)}
        onSavePayment={handleRecordPaymentSave}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        statementName={statement.name}
        payments={statementPayments}
        students={students}
        onClose={() => setIsHistoryModalOpen(false)}
        onDeletePayment={onDeletePayment}
      />

      {/* Export Statement Modal */}
      <ExportStatementModal
        isOpen={isExportModalOpen}
        statement={statement}
        studentSummaries={studentSummaries}
        calculations={calculations}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Edit Statement Modal */}
      <EditStatementModal
        isOpen={isEditModalOpen}
        statement={statement}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateStatement={onUpdateStatement}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        title={`Delete "${statement.name}"?`}
        message="This will delete all records and payments for this statement."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          onDeleteStatement(statement.id);
          setIsDeleteConfirmOpen(false);
          onBackToDashboard();
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
