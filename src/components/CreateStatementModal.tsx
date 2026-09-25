import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { parsePeso, formatPeso } from '../utils/currency';

interface CreateStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStatement: (data: { name: string; requiredAmount: number; headerTitle?: string }) => void;
}

const COMMON_SUGGESTIONS = [
  { name: 'T-Shirt', defaultAmount: 600 },
  { name: 'Intrams Contribution', defaultAmount: 250 },
  { name: 'ID Lace', defaultAmount: 85 },
  { name: 'Uniform', defaultAmount: 850 },
  { name: 'Class Event Registration', defaultAmount: 150 },
  { name: 'Class Fund', defaultAmount: 100 },
];

export const CreateStatementModal: React.FC<CreateStatementModalProps> = ({
  isOpen,
  onClose,
  onCreateStatement,
}) => {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [headerTitle, setHeaderTitle] = useState('BSIT 1-1 — INTRAMS FINANCIAL DATA');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAmountStr('');
      setHeaderTitle('BSIT 1-1 — INTRAMS FINANCIAL DATA');
      setError('');
      setShowAdvanced(false);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a statement name.');
      return;
    }

    const amount = parsePeso(amountStr);
    if (amount < 0 || isNaN(amount)) {
      setError('Required amount must be 0 or greater.');
      return;
    }

    onCreateStatement({
      name: name.trim(),
      requiredAmount: amount,
      headerTitle: headerTitle.trim() || 'BSIT 1-1 — INTRAMS FINANCIAL DATA',
    });
  };

  const applySuggestion = (suggestion: { name: string; defaultAmount: number }) => {
    setName(suggestion.name);
    setAmountStr(suggestion.defaultAmount.toString());
    setError('');
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Create Blank Statement</h2>
              <p className="text-xs text-slate-400">Generates entry sheet for all 45 BSIT 1-1 students</p>
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
            {/* Quick Presets */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Quick Suggestion Presets</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SUGGESTIONS.map((sugg) => (
                  <button
                    key={sugg.name}
                    type="button"
                    onClick={() => applySuggestion(sugg)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg transition-colors"
                  >
                    {sugg.name} ({formatPeso(sugg.defaultAmount)})
                  </button>
                ))}
              </div>
            </div>

            {/* Statement Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Statement Name <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                placeholder="e.g. T-Shirt, Intrams Contribution, ID Lace, Uniform"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
              />
              <p className="mt-1 text-xs text-slate-500">
                Can represent any class requirement, project, event, or fee.
              </p>
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
                  placeholder="600"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-slate-900 text-base font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                45 students × {formatPeso(parsePeso(amountStr))} = Target total {formatPeso(parsePeso(amountStr) * 45)}
              </p>
            </div>

            {/* Advanced toggle for custom header */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2"
              >
                {showAdvanced ? 'Hide Report Header Title' : 'Customize Report Header Title (Optional)'}
              </button>
            </div>

            {showAdvanced && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in">
                <label className="block text-xs font-medium text-slate-700">
                  Document Header Title (Export Banner)
                </label>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  placeholder="BSIT 1-1 — INTRAMS FINANCIAL DATA"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 block">
                  Default: &quot;BSIT 1-1 — INTRAMS FINANCIAL DATA&quot; (Appears at top of statement and exported PNG)
                </span>
              </div>
            )}

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
              <Plus className="w-4 h-4" />
              <span>Create Statement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
