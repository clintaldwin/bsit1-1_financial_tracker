import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  History,
  Edit2,
  Trash2,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Payment, Statement, StatementStudentSpec, Student, StudentStatementSummary } from '../types';
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

  const headerBannerText = statement.headerTitle || 'BSIT 1-1 — INTRAMS FINANCIAL DATA';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export PNG */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PNG</span>
          </button>

          {/* Payment History */}
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>History ({statementPayments.length})</span>
          </button>

          {/* Edit Statement */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
            title="Edit Statement Name and Required Amount"
          >
            <Edit2 className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete Statement */}
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl shadow-xs transition-colors"
            title="Delete this Statement"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Statement Banner Header as required */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
            {headerBannerText}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Statement: <span className="text-emerald-400">{statement.name}</span></span>
            </h1>
            <div className="text-sm sm:text-base font-medium text-slate-300">
              Required Amount:{' '}
              <span className="text-white font-bold font-mono text-lg">
                {formatPeso(statement.requiredAmount)}
              </span>{' '}
              <span className="text-slate-400 text-xs font-normal">per student</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4 pt-1">
            <span>Roster: <strong className="text-slate-200">45 BSIT 1-1 Students</strong></span>
            <span>•</span>
            <span>Recorded Payments: <strong className="text-slate-200">{statementPayments.length} transactions</strong></span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        calculations={calculations}
        totalStudents={students.length}
      />

      {/* Student Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Student Payment Roster</span>
            <span className="text-xs font-normal text-slate-500">({students.length} students)</span>
          </h2>
          <span className="text-xs text-slate-500">
            Click &quot;Record Payment&quot; on any student to add a payment.
          </span>
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
        title={`Delete Statement "${statement.name}"?`}
        message="Deleting this statement will permanently remove its student payment records, payment history, and specifications. This action cannot be undone."
        confirmText="Yes, Delete Statement"
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
