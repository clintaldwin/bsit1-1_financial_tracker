import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Student } from '../types';

interface ClassRosterModalProps {
  isOpen: boolean;
  students: Student[];
  onClose: () => void;
}

export const ClassRosterModal: React.FC<ClassRosterModalProps> = ({
  isOpen,
  students,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentNumber.toString().includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-base text-slate-900 leading-tight">
              Class Roster
            </h2>
            <p className="text-xs text-slate-500">
              BSIT 1-1 · {students.length} Students
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable Student List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No students found
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {student.studentNumber}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {student.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    BSIT 1-1
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
