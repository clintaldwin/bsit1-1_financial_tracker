import React from 'react';
import {
  Plus,
  BookOpen,
} from 'lucide-react';
import { Statement } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'statement';
  activeStatementId: string | null;
  statements: Statement[];
  onNavigate: (tab: 'dashboard' | 'statement', statementId?: string) => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeStatementId,
  statements,
  onNavigate,
  onOpenCreateModal,
}) => {
  const activeStatement = statements.find((s) => s.id === activeStatementId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 text-left group focus:outline-hidden rounded-lg p-0.5"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
                ₱
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm sm:text-base text-slate-900 block leading-tight">
                  BSIT 1-1
                </span>
                <span className="text-[10px] text-slate-500 font-medium block leading-none">
                  Treasury
                </span>
              </div>
            </button>

            {/* Active Statement indicator */}
            {currentTab === 'statement' && activeStatement && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-2.5 border-l border-slate-200">
                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[180px]">
                  {activeStatement.name}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {statements.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('statement', activeStatementId || statements[0].id);
                }}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  currentTab === 'statement'
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Ledger</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    currentTab === 'statement'
                      ? 'bg-emerald-900 text-emerald-100'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {statements.length}
                </span>
              </button>
            )}

            {/* New Statement Action */}
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors ml-1"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Statement</span>
              <span className="sm:hidden">New</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
