import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Statement } from '../types';
import { parsePeso } from '../utils/currency';

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
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && statement) {
      setName(statement.name);
      setAmountStr(statement.requiredAmount.toString());
      setError('');
    }
  }, [isOpen, statement]);

  if (!isOpen || !statement) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    const amount = parsePeso(amountStr);
    if (amount < 0 || isNaN(amount)) {
      setError('Amount must be 0 or greater.');
      return;
    }

    onUpdateStatement(statement.id, {
      name: name.trim(),
      requiredAmount: amount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-base text-slate-900">
            Edit Statement
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
            {/* Statement Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statement Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-slate-500 font-medium"
              />
            </div>

            {/* Required Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Amount Per Student (₱) <span className="text-rose-600">*</span>
              </label>
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono text-base font-semibold focus:outline-hidden focus:border-slate-500"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
