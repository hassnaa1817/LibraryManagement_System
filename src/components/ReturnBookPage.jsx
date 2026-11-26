import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Receipt,
  BookOpen,
  Library,
  LayoutDashboard,
  Loader2,
  X,
  Printer,
} from 'lucide-react';
import BookCover from './BookCover';
import {
  DAILY_FINE_RATE,
  evaluateLoanStatus,
  formatDate,
  formatCurrency,
  getRelativeISODate,
  generateReceiptNumber,
} from '../utils/libraryHelpers';

export function ReturnConfirmationModal({
  record,
  book,
  onCancel,
  onConfirm,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!record || !book) return null;

  const todayIso = getRelativeISODate(0);
  const loan = evaluateLoanStatus(record, todayIso);
  const receiptNo = generateReceiptNumber(record.id);

  const handleConfirmClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(record, {
        returnDate: todayIso,
        finePaid: loan.fineAmount,
        receiptNo: loan.isOverdue ? receiptNo : null,
        daysOverdue: loan.daysOverdue,
      });
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                loan.isOverdue
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-[#D9F0E9] text-[#214C52]'
              }`}
            >
              {loan.isOverdue ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  Late Return · Fine Applicable
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  On-Time Return · No Fine
                </>
              )}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-[#172A3A]">
              Confirm Book Return
            </h3>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Book Info */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex items-center gap-3.5">
          <BookCover book={book} size="xs" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#172A3A] truncate">{book.title}</p>
            <p className="text-xs text-[#7B8794] truncate">{book.author}</p>
            <p className="text-[11px] font-mono text-[#7B8794] mt-0.5">ISBN {book.isbn}</p>
          </div>
        </div>

        {/* Due Date Check Summary */}
        <div className="mt-4 space-y-2.5 text-xs border-y border-slate-100 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[#7B8794]">Borrowing Date</span>
            <span className="font-medium text-[#263442]">{formatDate(record.borrowDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#7B8794]">Due Date</span>
            <span className="font-medium text-[#172A3A]">{formatDate(record.dueDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#7B8794]">Return Date (Today)</span>
            <span className="font-semibold text-[#172A3A]">{formatDate(todayIso)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#7B8794]">Return Status</span>
            <span
              className={`font-semibold ${
                loan.isOverdue ? 'text-amber-700' : 'text-[#214C52]'
              }`}
            >
              {loan.isOverdue
                ? `Late Return (${loan.daysOverdue} ${
                    loan.daysOverdue === 1 ? 'day' : 'days'
                  } overdue)`
                : 'Returned on Time — No Fine'}
            </span>
          </div>
        </div>

        {/* Fine Receipt or No Fine Banner */}
        {loan.isOverdue ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#172A3A]">
                <Receipt className="w-4 h-4 text-amber-700" />
                Library Fine Bill / Receipt
              </div>
              <span className="text-[11px] font-mono text-amber-800">{receiptNo}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#263442]">
                <span>Overdue Duration</span>
                <span className="font-mono">
                  {loan.daysOverdue} {loan.daysOverdue === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="flex justify-between text-[#263442]">
                <span>Daily Late Fee Rate</span>
                <span className="font-mono">{formatCurrency(DAILY_FINE_RATE)} / day</span>
              </div>
              <div className="flex justify-between text-[#263442]">
                <span>Processing Fee</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex justify-between items-center text-sm font-bold text-[#172A3A]">
                <span>Total Fine Amount</span>
                <span className="font-mono text-amber-800">
                  {formatCurrency(loan.fineAmount)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#69B7B0]/40 bg-[#D9F0E9]/45 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#214C52]">No Fine Assessed</p>
              <p className="text-[11px] text-[#214C52]/80 mt-0.5">
                Returned within the 14-day borrowing window.
              </p>
            </div>
            <span className="text-base font-mono font-bold text-[#214C52]">$0.00</span>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmClick}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-70 ${
              loan.isOverdue
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-[#172A3A] hover:bg-[#214C52]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Updating Status...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {loan.isOverdue ? 'Confirm Return & Settle Fine' : 'Confirm Return'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReturnBookPage({
  books,
  userRecords,
  lastReturnConfirmation,
  onClearLastReturnConfirmation,
  onOpenReturnModal,
  onNavigate,
}) {
  const booksById = Object.fromEntries(books.map((b) => [b.id, b]));
  const activeRecords = userRecords.filter((r) => !r.returnDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Return Book
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Select a currently borrowed book to verify its due date and complete the return.
          </p>
        </div>
      </div>

      {/* Return Confirmation Receipt Banner (Shown after a return completes) */}
      {lastReturnConfirmation && (
        <div className="card-elevated rounded-2xl p-6 border-[#69B7B0]/50 bg-gradient-to-br from-[#D9F0E9]/45 via-white to-[#B9B5E8]/15 animate-modal-in">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#D9F0E9] text-[#214C52] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#172A3A]">
                  Book Returned Successfully
                </h2>
                <p className="text-xs text-[#263442] mt-1">
                  <strong>{lastReturnConfirmation.bookTitle}</strong> has been marked as{' '}
                  <strong>Returned</strong> and is now available in the catalog.
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[#263442]">
                    Return Date: <strong>{formatDate(lastReturnConfirmation.returnDate)}</strong>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg border font-semibold ${
                      lastReturnConfirmation.finePaid > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-[#D9F0E9]/70 border-[#69B7B0]/40 text-[#214C52]'
                    }`}
                  >
                    {lastReturnConfirmation.finePaid > 0
                      ? `Fine Paid: ${formatCurrency(lastReturnConfirmation.finePaid)} (${
                          lastReturnConfirmation.receiptNo
                        })`
                      : 'Status: No Fine ($0.00)'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('browse')}
                    className="px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Library className="w-3.5 h-3.5" />
                    Browse Books
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#172A3A] hover:border-[#69B7B0] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Back to Dashboard
                  </button>
                  {lastReturnConfirmation.finePaid > 0 && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#263442] hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearLastReturnConfirmation}
              className="p-1.5 rounded-lg text-[#7B8794] hover:bg-white cursor-pointer self-start"
              aria-label="Dismiss confirmation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active Borrowed Books List */}
      {activeRecords.length === 0 ? (
        <div className="card-elevated rounded-2xl p-12 text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#D9F0E9]/70 text-[#214C52] mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#172A3A]">
            You have no books to return
          </h2>
          <p className="text-sm text-[#7B8794] mt-1.5 max-w-md mx-auto">
            All your library slots are currently available (0 of 2 books borrowed). Browse the catalog whenever you’re ready for your next loan.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('browse')}
              className="px-4 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Library className="w-4 h-4" />
              Browse Books
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[#263442] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeRecords.map((record) => {
            const book = booksById[record.bookId];
            if (!book) return null;
            const loan = evaluateLoanStatus(record);

            return (
              <div
                key={record.id}
                className={`card-elevated rounded-2xl p-5 flex flex-col justify-between gap-5 ${
                  loan.isOverdue ? 'border-amber-200/90' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <BookCover book={book} size="sm" />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1.5 ${
                        loan.isOverdue
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#D9F0E9] text-[#214C52]'
                      }`}
                    >
                      {loan.isOverdue ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {loan.label}
                    </span>
                    <h3 className="text-base font-semibold text-[#172A3A] leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#7B8794] mt-0.5">{book.author}</p>
                    <p className="text-[11px] font-mono text-[#7B8794] mt-1">
                      ISBN {book.isbn}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7B8794]">Borrowed On</span>
                    <span className="font-medium text-[#263442]">
                      {formatDate(record.borrowDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7B8794]">Due Date</span>
                    <span className="font-semibold text-[#172A3A]">
                      {formatDate(record.dueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200/70">
                    <span className="text-[#7B8794]">Estimated Fine</span>
                    <span
                      className={`font-mono font-semibold ${
                        loan.isOverdue ? 'text-amber-700' : 'text-[#214C52]'
                      }`}
                    >
                      {loan.isOverdue
                        ? `${formatCurrency(loan.fineAmount)} (${loan.daysOverdue}d × ${formatCurrency(
                            DAILY_FINE_RATE
                          )})`
                        : 'No Fine ($0.00)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenReturnModal(record)}
                  className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer ${
                    loan.isOverdue
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#172A3A] hover:bg-[#214C52]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {loan.isOverdue ? 'Review Fine & Return Book' : 'Return This Book'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
