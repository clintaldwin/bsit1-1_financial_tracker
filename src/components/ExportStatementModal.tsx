import React, { useState, useRef } from 'react';
import { X, Download, Copy, Check, Eye, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toBlob, toPng } from 'html-to-image';
import { Statement, StatementCalculations, StudentStatementSummary } from '../types';
import { formatPeso } from '../utils/currency';
import { formatDate } from '../utils/calculations';

interface ExportStatementModalProps {
  isOpen: boolean;
  statement: Statement;
  studentSummaries: StudentStatementSummary[];
  calculations: StatementCalculations;
  onClose: () => void;
}

export const ExportStatementModal: React.FC<ExportStatementModalProps> = ({
  isOpen,
  statement,
  studentSummaries,
  calculations,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const exportDate = formatDate(new Date().toISOString());

  const handleDownloadPng = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    setExportError(null);

    try {
      // Use pixelRatio: 2 for high density, crystal clear on Retina / Mobile
      const dataUrl = await toPng(reportRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const link = document.createElement('a');
      const filename = `BSIT-1-1-${statement.name.replace(/[^a-zA-Z0-9_-]/g, '_')}-Financial-Statement.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
      setExportError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    setExportError(null);

    try {
      const blob = await toBlob(reportRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      if (!blob) {
        throw new Error('Could not create image blob');
      }

      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Fallback: trigger download
        handleDownloadPng();
      }
    } catch (err) {
      console.warn('Clipboard write failed or unsupported:', err);
      // Fallback: download the file instead
      handleDownloadPng();
    } finally {
      setIsGenerating(false);
    }
  };

  const headerTitle = statement.headerTitle || 'BSIT 1-1 — INTRAMS FINANCIAL DATA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Export Statement as PNG</h2>
              <p className="text-xs text-slate-400">GC-ready image for Messenger and Class Announcements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Previewing full report with all <span className="font-bold text-slate-900">{studentSummaries.length} students</span>.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyToClipboard}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none transition-colors shadow-xs disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image to Clipboard</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {exportError && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {/* Scrollable Container with the Document to Export */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          {/* THE REPORT CONTAINER (Target of html-to-image) */}
          <div
            ref={reportRef}
            className="w-[840px] max-w-full bg-white text-slate-900 p-8 shadow-md border border-slate-300 rounded-none shrink-0"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            {/* School / Section Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                    {headerTitle}
                  </h1>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                    Official Section Financial Report • BSIT 1-1
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded">
                    CLASS TREASURER REPORT
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    Date: <span className="font-semibold text-slate-800">{exportDate}</span>
                  </div>
                </div>
              </div>

              {/* Statement details box */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Statement Name</div>
                  <div className="text-base font-bold text-slate-900 leading-tight mt-0.5">{statement.name}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Required / Student</div>
                  <div className="text-base font-bold font-mono text-slate-900 leading-tight mt-0.5">
                    {formatPeso(statement.requiredAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Roster Total</div>
                  <div className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                    {studentSummaries.length} Students
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Collection Rate</div>
                  <div className="text-base font-bold text-emerald-700 leading-tight mt-0.5">
                    {calculations.percentCollected}%
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5 text-center">
              <div className="p-2.5 bg-slate-100/80 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Target</div>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{formatPeso(calculations.totalRequired)}</div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Collected</div>
                <div className="text-sm font-bold font-mono text-emerald-800 mt-0.5">{formatPeso(calculations.totalCollected)}</div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Outstanding</div>
                <div className="text-sm font-bold font-mono text-amber-800 mt-0.5">{formatPeso(calculations.totalBalance)}</div>
              </div>
              <div className="p-2.5 bg-emerald-100/60 rounded border border-emerald-300">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Paid in Full</div>
                <div className="text-sm font-bold text-emerald-900 mt-0.5">{calculations.paidCount} students</div>
              </div>
              <div className="p-2.5 bg-amber-100/60 rounded border border-amber-300">
                <div className="text-[10px] font-bold text-amber-800 uppercase">Partial Paid</div>
                <div className="text-sm font-bold text-amber-900 mt-0.5">{calculations.partialCount} students</div>
              </div>
              <div className="p-2.5 bg-rose-50 rounded border border-rose-200">
                <div className="text-[10px] font-bold text-rose-700 uppercase">Unpaid</div>
                <div className="text-sm font-bold text-rose-800 mt-0.5">{calculations.unpaidCount} students</div>
              </div>
            </div>

            {/* Students Table */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-2 px-2 text-center w-8 border-r border-slate-700">#</th>
                    <th className="py-2 px-3 border-r border-slate-700">Student Name</th>
                    <th className="py-2 px-3 border-r border-slate-700">Specification</th>
                    <th className="py-2 px-3 text-right border-r border-slate-700">Required</th>
                    <th className="py-2 px-3 text-right border-r border-slate-700">Amount Paid</th>
                    <th className="py-2 px-3 text-right border-r border-slate-700">Balance</th>
                    <th className="py-2 px-2.5 text-center w-20">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {studentSummaries.map((s, idx) => (
                    <tr
                      key={s.student.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                    >
                      <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200">
                        {s.student.studentNumber}
                      </td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                        {s.student.name}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 border-r border-slate-200">
                        {s.specification ? (
                          <span className="font-medium text-slate-800">{s.specification}</span>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                        {formatPeso(s.requiredAmount)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-slate-900 border-r border-slate-200">
                        {formatPeso(s.paidAmount)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold border-r border-slate-200">
                        {s.balance > 0 ? (
                          <span className="text-amber-800">{formatPeso(s.balance)}</span>
                        ) : (
                          <span className="text-emerald-700">₱0</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        {s.status === 'paid' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                            Paid
                          </span>
                        )}
                        {s.status === 'partial' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                            Partial
                          </span>
                        )}
                        {s.status === 'unpaid' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-300 uppercase tracking-wider">
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-xs">
                    <td colSpan={3} className="py-2.5 px-3 text-right text-slate-900 border-r border-slate-300 uppercase">
                      GRAND TOTALS ({studentSummaries.length} Students):
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 border-r border-slate-300">
                      {formatPeso(calculations.totalRequired)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800 border-r border-slate-300">
                      {formatPeso(calculations.totalCollected)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-800 border-r border-slate-300">
                      {formatPeso(calculations.totalBalance)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[10px] font-mono text-slate-600">
                      {calculations.paidCount}P / {calculations.partialCount}Pr / {calculations.unpaidCount}U
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Report Summary Box */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">BSIT 1-1 Financial Management System</p>
                <p className="text-[11px] text-slate-400">Generated for class records, transparency, and audit.</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[11px]">Exported on: <span className="font-medium text-slate-700">{exportDate}</span></p>
                <p className="text-[11px] text-slate-400">Class Treasurer Sign-off</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Tip: You can paste the copied image directly into your Facebook Messenger Group Chat with <kbd className="px-1.5 py-0.5 bg-white border rounded text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white border rounded text-[11px]">V</kbd>.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
