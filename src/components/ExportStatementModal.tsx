import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, Loader2, AlertCircle, Share2, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  if (!isOpen) return null;

  const exportDate = formatDate(new Date().toISOString());
  const treasurerName = 'Del Socorro, Joland';

  // Always use the required title "BSIT 1-1 — FINANCIAL DATA"
  const rawTitle = statement.headerTitle?.trim();
  const headerTitle =
    !rawTitle || rawTitle === 'BSIT 1-1 — INTRAMS FINANCIAL DATA'
      ? 'BSIT 1-1 — FINANCIAL DATA'
      : rawTitle;

  const getExportFilename = (): string => {
    const sanitizedName = statement.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `BSIT-1-1-${sanitizedName}-Financial-Statement.png`;
  };

  const getExportBlob = async (): Promise<Blob> => {
    const node = exportTargetRef.current;
    if (!node) {
      throw new Error('Report document is not ready yet. Please try again.');
    }

    const width = 1080;
    const height = node.scrollHeight || node.offsetHeight || 2600;

    const blob = await toBlob(node, {
      quality: 1.0,
      pixelRatio: 3,
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
            text: `BSIT 1-1 Official Financial Statement: ${statement.name} | Class Treasurer: ${treasurerName} | Required: ${formatPeso(statement.requiredAmount)}/student`,
          });
          return;
        } catch (shareErr: unknown) {
          if (
            shareErr instanceof DOMException &&
            (shareErr.name === 'AbortError' || shareErr.message?.toLowerCase().includes('abort'))
          ) {
            return;
          }
          console.warn('Native file share failed, falling back to download:', shareErr);
        }
      }

      downloadBlobAsFile(generatedBlob, filename);
      setNoticeMessage('Native sharing was unavailable on this browser. Full statement was downloaded as a high-res PNG.');
    } catch (err: unknown) {
      console.error('Failed in share statement flow:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate statement image.';
      setExportError(msg);
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

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

  /**
   * High-Fidelity Official Class Report Layout
   * - Title: BSIT 1-1 — FINANCIAL DATA
   * - Removed the "Outstanding" UI box from the metrics bar
   * - Refactored grid & metrics for crystal-clear visual hierarchy
   */
  const renderFullReportContent = () => (
    <div
      className="w-[1080px] bg-white text-slate-900 p-10 shadow-sm border border-slate-300 font-sans antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* Official Header Section */}
      <div className="border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>Official Section Treasury Record</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
              {headerTitle}
            </h1>
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mt-0.5">
              Official Section Financial Report • BSIT 1-1
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs">
              CLASS TREASURER REPORT
            </div>
            <div className="text-xs text-slate-500 mt-1.5 font-mono">
              Date: <span className="font-semibold text-slate-800">{exportDate}</span>
            </div>
          </div>
        </div>

        {/* Statement Details Banner Box */}
        <div className="mt-5 grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Statement Name</div>
            <div className="text-base font-extrabold text-slate-900 leading-tight mt-1">{statement.name}</div>
          </div>
          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required / Student</div>
            <div className="text-base font-bold font-mono text-slate-900 leading-tight mt-1">
              {formatPeso(statement.requiredAmount)}
            </div>
          </div>
          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Roster Total</div>
            <div className="text-base font-bold text-slate-900 leading-tight mt-1">
              {studentSummaries.length} Students
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection Rate</div>
            <div className="text-base font-extrabold text-emerald-700 leading-tight mt-1">
              {calculations.percentCollected}%
            </div>
          </div>
        </div>
      </div>

      {/*
        Clean 5-Card Metrics Bar (Outstanding card removed as requested)
        Well-organized, distinct color coding & high contrast
      */}
      <div className="grid grid-cols-5 gap-3 mb-6 text-center">
        {/* Total Target */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Target</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">{formatPeso(calculations.totalRequired)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{studentSummaries.length} students required</div>
        </div>

        {/* Total Collected */}
        <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Collected</div>
          <div className="text-base font-bold font-mono text-emerald-800 mt-1">{formatPeso(calculations.totalCollected)}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">{calculations.percentCollected}% received</div>
        </div>

        {/* Paid in Full */}
        <div className="p-3.5 bg-emerald-100/70 rounded-xl border border-emerald-300 shadow-2xs">
          <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Paid in Full</div>
          <div className="text-base font-bold text-emerald-950 mt-1">{calculations.paidCount} students</div>
          <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">Completed payment</div>
        </div>

        {/* Partial Paid */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 shadow-2xs">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Partial Paid</div>
          <div className="text-base font-bold text-amber-900 mt-1">{calculations.partialCount} students</div>
          <div className="text-[10px] text-amber-700 mt-0.5 font-medium">With partial deposit</div>
        </div>

        {/* Unpaid */}
        <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 shadow-2xs">
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Unpaid</div>
          <div className="text-base font-bold text-rose-900 mt-1">{calculations.unpaidCount} students</div>
          <div className="text-[10px] text-rose-600 mt-0.5 font-medium">Pending collection</div>
        </div>
      </div>

      {/* Complete Students Table */}
      <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="py-2.5 px-3 text-center w-12 border-r border-slate-700">#</th>
              <th className="py-2.5 px-4 border-r border-slate-700">Student Name</th>
              <th className="py-2.5 px-3.5 border-r border-slate-700">Specification</th>
              <th className="py-2.5 px-4 text-right border-r border-slate-700">Required</th>
              <th className="py-2.5 px-4 text-right border-r border-slate-700">Amount Paid</th>
              <th className="py-2.5 px-4 text-right border-r border-slate-700">Balance</th>
              <th className="py-2.5 px-3 text-center w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {studentSummaries.map((s, idx) => (
              <tr
                key={s.student.id}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
              >
                <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200">
                  {s.student.studentNumber}
                </td>
                <td className="py-2 px-4 font-bold text-slate-900 border-r border-slate-200">
                  {s.student.name}
                </td>
                <td className="py-2 px-3.5 text-slate-700 border-r border-slate-200">
                  {s.specification ? (
                    <span className="font-semibold text-slate-800">{s.specification}</span>
                  ) : (
                    <span className="text-slate-300 italic">—</span>
                  )}
                </td>
                <td className="py-2 px-4 text-right font-mono text-slate-700 border-r border-slate-200">
                  {formatPeso(s.requiredAmount)}
                </td>
                <td className="py-2 px-4 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                  {formatPeso(s.paidAmount)}
                </td>
                <td className="py-2 px-4 text-right font-mono font-bold border-r border-slate-200">
                  {s.balance > 0 ? (
                    <span className="text-amber-800">{formatPeso(s.balance)}</span>
                  ) : (
                    <span className="text-emerald-700">₱0</span>
                  )}
                </td>
                <td className="py-2 px-3 text-center">
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
              <td colSpan={3} className="py-3.5 px-4 text-right text-slate-900 border-r border-slate-300 uppercase tracking-wider">
                Total ({studentSummaries.length} Students):
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-slate-900 border-r border-slate-300">
                {formatPeso(calculations.totalRequired)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-emerald-800 border-r border-slate-300">
                {formatPeso(calculations.totalCollected)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-amber-800 border-r border-slate-300">
                {formatPeso(calculations.totalBalance)}
              </td>
              <td className="py-3.5 px-2 text-center text-[10px] font-mono text-slate-700">
                {calculations.paidCount}P / {calculations.partialCount}Pr / {calculations.unpaidCount}U
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Official Sign-off and Authentication Footer */}
      <div className="mt-6 pt-5 border-t-2 border-slate-300 grid grid-cols-2 gap-6 items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="font-extrabold text-slate-900 text-sm tracking-tight">BSIT 1-1 Financial Management System</p>
          </div>
          <p className="text-[11px] text-slate-500">Official section financial record and audit statement.</p>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Export Date &amp; Time: <span className="font-medium text-slate-700">{exportDate}</span>
          </p>
        </div>

        {/* Official Class Treasurer Signature Block */}
        <div className="flex flex-col items-end text-right">
          <div className="inline-block text-center border-t-2 border-slate-900 pt-2 px-6 min-w-[220px]">
            <div className="text-sm font-black text-slate-950 uppercase tracking-wide">
              {treasurerName}
            </div>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>Official Class Treasurer</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              BSIT Section 1-1
            </div>
          </div>
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
              <p className="text-xs text-slate-400">Class GC &amp; Messenger Ready • {statement.name}</p>
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
          <div className="text-xs text-slate-600 flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Certified by <strong className="text-slate-900">{treasurerName}</strong> (Official Class Treasurer)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Desktop secondary: Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              disabled={isGenerating}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none transition-colors shadow-xs disabled:opacity-50"
              title="Copy high-res image to clipboard"
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
              title="Download high-res PNG file"
            >
              {isGenerating && generatingAction === 'download' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Generating HD PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download HD PNG</span>
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
                  <span>Rendering Ultra HD PNG...</span>
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
          <div className="w-full max-w-[1080px] overflow-x-auto shadow-md rounded-lg">
            {renderFullReportContent()}
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Click the &quot;Share Statement&quot; lang to send the statement sa GC
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* OFF-SCREEN ULTRA-HD EXPORT NODE */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '1080px',
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
