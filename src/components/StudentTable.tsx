import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PaymentStatus, StudentStatementSummary } from '../types';
import { StudentRow } from './StudentRow';

interface StudentTableProps {
  studentSummaries: StudentStatementSummary[];
  onRecordPayment: (summary: StudentStatementSummary) => void;
  onSaveSpecification: (studentId: string, spec: string) => void;
  onViewStudentHistory?: (summary: StudentStatementSummary) => void;
}

type FilterOption = 'all' | PaymentStatus;
type SortOption = 'number' | 'name' | 'balance-desc' | 'paid-desc';

export const StudentTable: React.FC<StudentTableProps> = ({
  studentSummaries,
  onRecordPayment,
  onSaveSpecification,
  onViewStudentHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('number');

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    return studentSummaries
      .filter((item) => {
        // Status filter
        if (statusFilter !== 'all' && item.status !== statusFilter) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = item.student.name.toLowerCase().includes(q);
          const matchesSpec = item.specification.toLowerCase().includes(q);
          const matchesNumber = item.student.studentNumber.toString() === q;
          return matchesName || matchesSpec || matchesNumber;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'name':
            return a.student.name.localeCompare(b.student.name);
          case 'balance-desc':
            return b.balance - a.balance;
          case 'paid-desc':
            return b.paidAmount - a.paidAmount;
          case 'number':
          default:
            return a.student.studentNumber - b.student.studentNumber;
        }
      });
  }, [studentSummaries, statusFilter, searchQuery, sortOption]);

  const counts = useMemo(() => {
    let paid = 0;
    let partial = 0;
    let unpaid = 0;
    for (const s of studentSummaries) {
      if (s.status === 'paid') paid++;
      else if (s.status === 'partial') partial++;
      else unpaid++;
    }
    return { all: studentSummaries.length, paid, partial, unpaid };
  }, [studentSummaries]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student by name or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="number">Roster Order (#1-45)</option>
              <option value="name">Name (A-Z)</option>
              <option value="balance-desc">Highest Balance First</option>
              <option value="paid-desc">Highest Paid First</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Students</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Paid</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'paid' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200/70 text-emerald-800'}`}>
              {counts.paid}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('partial')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'partial'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Partial</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'partial' ? 'bg-amber-600 text-amber-100' : 'bg-amber-200/70 text-amber-800'}`}>
              {counts.partial}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'unpaid'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Unpaid</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'unpaid' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
              {counts.unpaid}
            </span>
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-3 min-w-[180px]">Specification</th>
              <th className="py-3 px-3 text-right">Required</th>
              <th className="py-3 px-3 text-right">Amount Paid</th>
              <th className="py-3 px-3 text-right">Balance</th>
              <th className="py-3 px-3 text-center w-28">Status</th>
              <th className="py-3 px-4 text-right w-36">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No students match your filter or search</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search box or selecting &quot;All Students&quot;.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((summary) => (
                <StudentRow
                  key={summary.student.id}
                  summary={summary}
                  onRecordPayment={onRecordPayment}
                  onSaveSpecification={onSaveSpecification}
                  onViewStudentHistory={onViewStudentHistory}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
        {filteredAndSorted.length === 0 ? (
          <div className="py-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No students match your search</p>
            <p className="text-xs text-slate-400 mt-1">Clear filters to view students</p>
          </div>
        ) : (
          filteredAndSorted.map((summary) => (
            <StudentRow
              key={summary.student.id}
              summary={summary}
              onRecordPayment={onRecordPayment}
              onSaveSpecification={onSaveSpecification}
              onViewStudentHistory={onViewStudentHistory}
            />
          ))
        )}
      </div>

      {/* Table Footer info */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <span className="font-semibold text-slate-800">{filteredAndSorted.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{studentSummaries.length}</span> students
        </span>
        <span className="hidden sm:inline">
          Tip: You can edit the specification column directly without opening a modal.
        </span>
      </div>
    </div>
  );
};
