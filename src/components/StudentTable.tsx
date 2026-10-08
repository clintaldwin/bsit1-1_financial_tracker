import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Users } from 'lucide-react';
import { PaymentStatus, StudentStatementSummary } from '../types';
import { StudentTableRow, StudentMobileCard } from './StudentRow';

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
        if (statusFilter !== 'all' && item.status !== statusFilter) {
          return false;
        }

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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Search & Filter Toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 space-y-2.5 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="number">Roster (#1-47)</option>
              <option value="name">Name (A-Z)</option>
              <option value="balance-desc">Balance (High to Low)</option>
              <option value="paid-desc">Paid (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'paid'
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            Paid ({counts.paid})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('partial')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'partial'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            Partial ({counts.partial})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('unpaid')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'unpaid'
                ? 'bg-slate-700 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unpaid ({counts.unpaid})
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-2.5 px-3 text-center w-12">#</th>
              <th className="py-2.5 px-3">Student Name</th>
              <th className="py-2.5 px-2 min-w-[140px]">Specification</th>
              <th className="py-2.5 px-3 text-right">Required</th>
              <th className="py-2.5 px-3 text-right">Paid</th>
              <th className="py-2.5 px-3 text-right">Balance</th>
              <th className="py-2.5 px-2 text-center w-24">Status</th>
              <th className="py-2.5 px-3 text-right w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  <p className="text-sm font-medium text-slate-600">No matching students</p>
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((summary) => (
                <StudentTableRow
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
      <div className="md:hidden p-2.5 space-y-2 bg-slate-50/50">
        {filteredAndSorted.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-white rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-600">No matching students</p>
          </div>
        ) : (
          filteredAndSorted.map((summary) => (
            <StudentMobileCard
              key={summary.student.id}
              summary={summary}
              onRecordPayment={onRecordPayment}
              onSaveSpecification={onSaveSpecification}
              onViewStudentHistory={onViewStudentHistory}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <span className="font-bold text-slate-800">{filteredAndSorted.length}</span> of {studentSummaries.length}
        </span>
      </div>
    </div>
  );
};
