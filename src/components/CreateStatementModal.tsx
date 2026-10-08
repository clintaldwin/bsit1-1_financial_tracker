import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { parsePeso, formatPeso } from '../utils/currency';

interface CreateStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStatement: (data: { name: string; requiredAmount: number; headerTitle?: string }) => void;
}

const COMMON_SUGGESTIONS = [
  { name: 'Intrams', defaultAmount: 250 },
  { name: 'Class Fund', defaultAmount: 100 },
  { name: 'T-Shirt', defaultAmount: 600 },
  { name: 'ID Lace', defaultAmount: 85 },
];

export const CreateStatementModal: React.FC<CreateStatementModalProps> = ({
  isOpen,
  onClose,
  onCreateStatement,
}) => {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAmountStr('');
      setError('');
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter statement name.');
      return;
    }

    const amount = parsePeso(amountStr);
    if (amount < 0 || isNaN(amount)) {
      setError('Amount must be 0 or greater.');
      return;
    }

    onCreateStatement({
      name: name.trim(),
      requiredAmount: amount,
      headerTitle: 'BSIT 1-1 — FINANCIAL DATA',
    });
  };

  const applySuggestion = (suggestion: { name: string; defaultAmount: number }) => {
    setName(suggestion.name);
    setAmountStr(suggestion.defaultAmount.toString());
    setError('');
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
            New Statement
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* Quick Suggestions */}
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block mb-1.5">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SUGGESTIONS.map((sugg) => (
                  <button
                    key={sugg.name}
                    type="button"
                    onClick={() => applySuggestion(sugg)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors"
                  >
                    {sugg.name} (₱{sugg.defaultAmount})
                  </button>
                ))}
              </div>
            </div>

            {/* Statement Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statement Name <span className="text-rose-600">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                placeholder="e.g. Intrams, T-Shirt, Uniform"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-slate-500"
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
                placeholder="250"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono text-base font-semibold focus:outline-hidden focus:border-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500 font-mono">
                47 × {formatPeso(parsePeso(amountStr))} = Total {formatPeso(parsePeso(amountStr) * 47)}
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800">
                {error}
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
