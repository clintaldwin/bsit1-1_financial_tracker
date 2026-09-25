import React, { useState, useEffect } from 'react';
import { X, Edit2, AlertCircle, Info } from 'lucide-react';
import { Statement } from '../types';
import { parsePeso, formatPeso } from '../utils/currency';

interface EditStatementModalProps {
  isOpen: boolean;
  statement: Statement | null;
  onClose: () => void;
  onUpdateStatement: (statementId: string, updates: { name: string; requiredAmount: number; headerTitle?: string }) => void;
}

export const EditStatementModal: React.FC<EditStatementModalProps> = ({
  isOpen,
  statement,
  onClose,
  onUpdateStatement,
}) => {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && statement) {
      setName(statement.name);
      setAmountStr(statement.requiredAmount.toString());
      setHeaderTitle(statement.headerTitle || 'BSIT 1-1 — INTRAMS FINANCIAL DATA');
      setError('');
    }
  }, [isOpen, statement]);

  if (!isOpen || !statement) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Statement name cannot be empty.');
      return;
    }

    const amount = parsePeso(amountStr);
    if (amount < 0 || isNaN(amount)) {
      setError('Required amount must be zero or greater.');
      return;
    }

    onUpdateStatement(statement.id, {
      name: name.trim(),
      requiredAmount: amount,
      headerTitle: headerTitle.trim() || 'BSIT 1-1 — INTRAMS FINANCIAL DATA',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Edit Statement Details</h2>
              <p className="text-xs text-slate-400">{statement.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Existing payments are preserved! When you change the required amount, every student&apos;s balance will be automatically recalculated.
              </span>
            </div>

            {/* Statement Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Statement Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-medium"
              />
            </div>

            {/* Required Amount */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Required Amount Per Student (PHP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-semibold">
                  ₱
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-slate-900 text-base font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            {/* Report Header Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Document Header Title (Export Banner)
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                placeholder="BSIT 1-1 — INTRAMS FINANCIAL DATA"
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/30 shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
