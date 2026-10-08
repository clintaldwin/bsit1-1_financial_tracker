import React, { useState, useEffect, useCallback } from 'react';
import {
  initializeStorage,
  getStudents,
  getStatements,
  getSpecifications,
  getPayments,
  createStatement,
  updateStatement,
  deleteStatement,
  saveSpecification,
  addPayment,
  deletePayment,
} from './services/storage';
import { Payment, Statement, StatementStudentSpec, Student } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StatementDetail } from './components/StatementDetail';
import { CreateStatementModal } from './components/CreateStatementModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [specifications, setSpecifications] = useState<StatementStudentSpec[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Navigation
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'statement'>('dashboard');
  const [activeStatementId, setActiveStatementId] = useState<string | null>(null);

  // Modals & Notifications
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const refreshData = useCallback(() => {
    setStudents(getStudents());
    setStatements(getStatements());
    setSpecifications(getSpecifications());
    setPayments(getPayments());
  }, []);

  useEffect(() => {
    initializeStorage();
    refreshData();
  }, [refreshData]);

  // Handlers for Statements
  const handleCreateStatement = (data: { name: string; requiredAmount: number; headerTitle?: string }) => {
    const newStmt = createStatement(data.name, data.requiredAmount, data.headerTitle);
    refreshData();
    setIsCreateModalOpen(false);
    setActiveStatementId(newStmt.id);
    setCurrentTab('statement');
    showToast(`Created statement "${newStmt.name}"!`);
  };

  const handleUpdateStatement = (statementId: string, updates: { name: string; requiredAmount: number; headerTitle?: string }) => {
    const updated = updateStatement(statementId, updates);
    if (updated) {
      refreshData();
      showToast(`Updated "${updated.name}"!`);
    }
  };

  const handleDeleteStatement = (statementId: string) => {
    deleteStatement(statementId);
    refreshData();
    if (activeStatementId === statementId) {
      setActiveStatementId(null);
      setCurrentTab('dashboard');
    }
    showToast('Statement deleted.', 'info');
  };

  // Handlers for Student Row Spec & Payments
  const handleSaveSpecification = (studentId: string, spec: string) => {
    if (!activeStatementId) return;
    saveSpecification(activeStatementId, studentId, spec);
    refreshData();
  };

  const handleRecordPayment = (data: {
    studentId: string;
    amount: number;
    date: string;
    note?: string;
  }) => {
    if (!activeStatementId) return;
    addPayment({
      statementId: activeStatementId,
      studentId: data.studentId,
      amount: data.amount,
      date: data.date,
      note: data.note,
    });
    refreshData();
    showToast(`Payment of ₱${data.amount} recorded!`);
  };

  const handleDeletePayment = (paymentId: string) => {
    const deleted = deletePayment(paymentId);
    if (deleted) {
      refreshData();
      showToast(`Deleted payment of ₱${deleted.amount}.`, 'info');
    }
  };

  const activeStatement = statements.find((s) => s.id === activeStatementId) || null;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in duration-150">
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg shadow-lg text-xs sm:text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-700 text-white border-rose-800'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-slate-300" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        activeStatementId={activeStatementId}
        statements={statements}
        onNavigate={(tab, statementId) => {
          setCurrentTab(tab);
          if (statementId) {
            setActiveStatementId(statementId);
          } else if (tab === 'statement' && !activeStatementId && statements.length > 0) {
            setActiveStatementId(statements[0].id);
          }
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            statements={statements}
            students={students}
            payments={payments}
            specifications={specifications}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenStatement={(id) => {
              setActiveStatementId(id);
              setCurrentTab('statement');
            }}
            onDeleteStatement={handleDeleteStatement}
          />
        )}

        {currentTab === 'statement' && activeStatement && (
          <StatementDetail
            statement={activeStatement}
            students={students}
            payments={payments}
            specifications={specifications}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onRecordPayment={handleRecordPayment}
            onDeletePayment={handleDeletePayment}
            onSaveSpecification={handleSaveSpecification}
            onUpdateStatement={handleUpdateStatement}
            onDeleteStatement={handleDeleteStatement}
          />
        )}

        {currentTab === 'statement' && !activeStatement && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <h2 className="font-bold text-base text-slate-900">No statement selected</h2>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="font-medium text-slate-700">BSIT 1-1 Tracker</span>
          <span className="font-mono text-[11px] text-slate-400">47 Students · Treasurer: Del Socorro, Joland</span>
        </div>
      </footer>

      {/* Create Blank Statement Modal */}
      <CreateStatementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStatement={handleCreateStatement}
      />
    </div>
  );
}
