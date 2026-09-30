import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, Loader2, AlertCircle, Share2, Info } from 'lucide-react';
import { toBlob } from 'html-to-image';
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
  const [generatingAction, setGeneratingAction] = useState<'share' | 'download' | 'copy' | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);

  // Hidden off-screen container ref used STRICTLY for 100% full-resolution generation
  const exportTargetRef = useRef<HTMLDivElement>(null);

  // Check Web Share API capability
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  if (!isOpen) return null;

  const exportDate = formatDate(new Date().toISOString());

  // Generate standardized filename for the statement
  const getExportFilename = (): string => {
    const sanitizedName = statement.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `BSIT-1-1-${sanitizedName}-Financial-Statement.png`;
  };

  /**
   * Generates the PNG Blob from the full 1000px off-screen exportTarget element.
   * This guarantees that ALL 45 students, grand totals, headers, and footer sign-offs
   * are captured in full, regardless of mobile screen height or user scroll position.
   */
  const getExportBlob = async (): Promise<Blob> => {
    const node = exportTargetRef.current;
    if (!node) {
      throw new Error('Report document is not ready yet. Please try again.');
    }

    // Measure the exact unconstrained scroll dimensions
    const width = 1000;
    const height = node.scrollHeight || node.offsetHeight || 2400;

    const blob = await toBlob(node, {
      quality: 0.98,
      pixelRatio: 2,
      width,
      height,
      backgroundColor: '#ffffff',
      cacheBust: true,
      fontEmbedCSS: '',
      skipFonts: true,
      style: {
        transform: 'none',
        left: '0px',
        top: '0px',
        position: 'static',
        visibility: 'visible',
      },
    });

    if (!blob) {
      throw new Error('Failed to generate image data. Please try again.');
    }

    return blob;
  };

  /**
   * Trigger a client-side file download given a blob and filename.
   */
  const downloadBlobAsFile = (blob: Blob, filename: string): void => {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = objectUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    }
  };

  /**
   * Primary action: Native Share flow (mobile-first for Android / Messenger).
   * Automatically falls back to direct PNG download if file sharing is unsupported.
   */
  const handleShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratingAction('share');
    setExportError(null);
    setNoticeMessage(null);

    let generatedBlob: Blob | null = null;
    const filename = getExportFilename();

    try {
      generatedBlob = await getExportBlob();
      const file = new File([generatedBlob], filename, { type: 'image/png' });

      const hasShareApi = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
      let canShareFiles = false;

      if (hasShareApi) {
        if (typeof navigator.canShare === 'function') {
          try {
            canShareFiles = navigator.canShare({ files: [file] });
          } catch {
            canShareFiles = false;
          }
        } else {
          canShareFiles = true;
        }
      }

      if (hasShareApi && canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            title: `BSIT 1-1 Financial Statement - ${statement.name}`,
            text: `BSIT 1-1 Financial Statement: ${statement.name} (Required: ${formatPeso(statement.requiredAmount)}/student)`,
          });
          return;
        } catch (shareErr: unknown) {
          // Normal user cancellation on Android share sheet
          if (
            shareErr instanceof DOMException &&
            (shareErr.name === 'AbortError' || shareErr.message?.toLowerCase().includes('abort'))
          ) {
            return;
          }
          console.warn('Native file share failed, falling back to download:', shareErr);
        }
      }

      // Graceful fallback: direct download
      downloadBlobAsFile(generatedBlob, filename);
      setNoticeMessage('Native sharing was unavailable on this browser. Full statement was downloaded as a PNG.');
    } catch (err: unknown) {
      console.error('Failed in share statement flow:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate statement image.';
      setExportError(msg);
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  /**
   * Direct download option
   */
  const handleDownloadPng = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratingAction('download');
    setExportError(null);
    setNoticeMessage(null);

    try {
      const blob = await getExportBlob();
      const filename = getExportFilename();
      downloadBlobAsFile(blob, filename);
    } catch (err: unknown) {
      console.error('Failed to export PNG:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate PNG image. Please try again.';
      setExportError(msg);
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  /**
   * Desktop option: Copy image directly to clipboard
   */
  const handleCopyToClipboard = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratingAction('copy');
    setExportError(null);
    setNoticeMessage(null);

    try {
      const blob = await getExportBlob();

      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === 'function' &&
        typeof ClipboardItem !== 'undefined'
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
          return;
        } catch (clipErr) {
          console.warn('navigator.clipboard.write failed:', clipErr);
          setExportError('Could not copy image to clipboard. Use "Share Statement" or "Download" instead.');
        }
      } else {
        setExportError('Clipboard image copying is not supported in this browser. Please use "Share" or "Download".');
      }
    } catch (err: unknown) {
      console.error('Failed copying image blob:', err);
      const msg = err instanceof Error ? err.message : 'Could not generate image.';
      setExportError(msg);
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  const headerTitle = statement.headerTitle || 'BSIT 1-1 — INTRAMS FINANCIAL DATA';

  /**
   * Reusable full-report layout renderer.
   * Shared between the interactive user preview and the hidden 1000px off-screen render target.
   */
  const renderFullReportContent = () => (
    <div
      className="w-[1000px] bg-white text-slate-900 p-8 shadow-sm border border-slate-300 font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* School / Section Header */}
      <div className="border-b-2 border-slate-900 pb-5 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              {headerTitle}
            </h1>
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mt-0.5">
              Official Section Financial Report • BSIT 1-1
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded">
              CLASS TREASURER REPORT
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Date: <span className="font-semibold text-slate-800">{exportDate}</span>
            </div>
          </div>
        </div>

        {/* Statement Details Banner Box */}
        <div className="mt-4 grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statement Name</div>
            <div className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">{statement.name}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Required / Student</div>
            <div className="text-base font-bold font-mono text-slate-900 leading-tight mt-0.5">
              {formatPeso(statement.requiredAmount)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Roster Total</div>
            <div className="text-base font-bold text-slate-900 leading-tight mt-0.5">
              {studentSummaries.length} Students
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Collection Rate</div>
            <div className="text-base font-extrabold text-emerald-700 leading-tight mt-0.5">
              {calculations.percentCollected}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-6 gap-2.5 mb-5 text-center">
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Target</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{formatPeso(calculations.totalRequired)}</div>
        </div>
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Collected</div>
          <div className="text-sm font-bold font-mono text-emerald-800 mt-0.5">{formatPeso(calculations.totalCollected)}</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Outstanding</div>
          <div className="text-sm font-bold font-mono text-amber-800 mt-0.5">{formatPeso(calculations.totalBalance)}</div>
        </div>
        <div className="p-3 bg-emerald-100/70 rounded-lg border border-emerald-300">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Paid in Full</div>
          <div className="text-sm font-bold text-emerald-900 mt-0.5">{calculations.paidCount} students</div>
        </div>
        <div className="p-3 bg-amber-100/70 rounded-lg border border-amber-300">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Partial Paid</div>
          <div className="text-sm font-bold text-amber-900 mt-0.5">{calculations.partialCount} students</div>
        </div>
        <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Unpaid</div>
          <div className="text-sm font-bold text-rose-800 mt-0.5">{calculations.unpaidCount} students</div>
        </div>
      </div>

      {/* Complete Students Table (All 45 students rendered without truncation) */}
      <div className="border border-slate-300 rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="py-2 px-2.5 text-center w-10 border-r border-slate-700">#</th>
              <th className="py-2 px-3 border-r border-slate-700">Student Name</th>
              <th className="py-2 px-3 border-r border-slate-700">Specification</th>
              <th className="py-2 px-3 text-right border-r border-slate-700">Required</th>
              <th className="py-2 px-3 text-right border-r border-slate-700">Amount Paid</th>
              <th className="py-2 px-3 text-right border-r border-slate-700">Balance</th>
              <th className="py-2 px-3 text-center w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {studentSummaries.map((s, idx) => (
              <tr
                key={s.student.id}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
              >
                <td className="py-1.5 px-2.5 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200">
                  {s.student.studentNumber}
                </td>
                <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                  {s.student.name}
                </td>
                <td className="py-1.5 px-3 text-slate-700 border-r border-slate-200">
                  {s.specification ? (
                    <span className="font-medium text-slate-800">{s.specification}</span>
                  ) : (
                    <span className="text-slate-300 italic">—</span>
                  )}
                </td>
                <td className="py-1.5 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                  {formatPeso(s.requiredAmount)}
                </td>
                <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  {formatPeso(s.paidAmount)}
                </td>
                <td className="py-1.5 px-3 text-right font-mono font-bold border-r border-slate-200">
                  {s.balance > 0 ? (
                    <span className="text-amber-800">{formatPeso(s.balance)}</span>
                  ) : (
                    <span className="text-emerald-700">₱0</span>
                  )}
                </td>
                <td className="py-1.5 px-3 text-center">
                  {s.status === 'paid' && (
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                      Paid
                    </span>
                  )}
                  {s.status === 'partial' && (
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                      Partial
                    </span>
                  )}
                  {s.status === 'unpaid' && (
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-300 uppercase tracking-wider">
                      Unpaid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-900 text-xs">
              <td colSpan={3} className="py-3 px-3 text-right text-slate-900 border-r border-slate-300 uppercase tracking-wider">
                GRAND TOTALS ({studentSummaries.length} Students):
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-900 border-r border-slate-300">
                {formatPeso(calculations.totalRequired)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-800 border-r border-slate-300">
                {formatPeso(calculations.totalCollected)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-amber-800 border-r border-slate-300">
                {formatPeso(calculations.totalBalance)}
              </td>
              <td className="py-3 px-2 text-center text-[10px] font-mono text-slate-700">
                {calculations.paidCount}P / {calculations.partialCount}Pr / {calculations.unpaidCount}U
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom Report Summary Box */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          <p className="font-bold text-slate-800 text-sm">BSIT 1-1 Financial Management System</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Generated for class records, transparency, and audit.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px]">Exported on: <span className="font-semibold text-slate-800">{exportDate}</span></p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Class Treasurer Sign-off</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">Export &amp; Share Full Statement</h2>
              <p className="text-xs text-slate-400">Captures all {studentSummaries.length} students in a single PNG</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 hidden sm:block">
            Full document will be generated as a high-resolution PNG ({studentSummaries.length} students).
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Desktop secondary: Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              disabled={isGenerating}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none transition-colors shadow-xs disabled:opacity-50"
              title="Copy full image to paste with Ctrl + V"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : isGenerating && generatingAction === 'copy' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Copying...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {/* Direct download fallback */}
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none transition-colors shadow-xs disabled:opacity-50"
              title="Download image file directly"
            >
              {isGenerating && generatingAction === 'download' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download PNG</span>
                </>
              )}
            </button>

            {/* PRIMARY CTA: SHARE FULL STATEMENT */}
            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all shadow-xs disabled:opacity-60"
            >
              {isGenerating && generatingAction === 'share' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Full Statement...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-white" />
                  <span>Share Statement</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notices */}
        {noticeMessage && (
          <div className="mx-3 sm:mx-6 mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-medium text-indigo-800 flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {exportError && (
          <div className="mx-3 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {/* User Interactive Preview (Scrollable view) */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-slate-100 flex justify-center">
          <div className="w-full max-w-[1000px] overflow-x-auto shadow-md rounded-lg">
            {renderFullReportContent()}
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            On mobile, tap <strong className="text-slate-800">Share Statement</strong> to send the complete image to your Messenger class GC.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/*
        OFF-SCREEN FULL-RESOLUTION EXPORT NODE
        Fixed 1000px width and auto height with all 45 students.
        Positioned off-screen so html-to-image captures 100% of the statement,
        completely unaffected by mobile browser viewport or modal scrollbar.
      */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '1000px',
          zIndex: -1,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div ref={exportTargetRef}>
          {renderFullReportContent()}
        </div>
      </div>
    </div>
  );
};
