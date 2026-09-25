import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Section Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-slate-800 transition-colors">
                ₱
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950 block leading-tight">
                  BSIT 1-1 Tracker
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Class Treasury
                </span>
              </div>
            </button>

            {/* Breadcrumb if inside statement */}
            {currentTab === 'statement' && activeStatement && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pl-2 border-l border-slate-200">
                <span className="truncate max-w-[150px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {activeStatement.name}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Statements quick select if statements exist */}
            {statements.length > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    if (statements.length > 0) {
                      onNavigate('statement', activeStatementId || statements[0].id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentTab === 'statement'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Statements</span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                    {statements.length}
                  </span>
                </button>
              </div>
            )}
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Create Statement</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
