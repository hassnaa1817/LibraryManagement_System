import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Hash,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
  RotateCcw,
  History,
  Library,
  X,
} from 'lucide-react';
import BookCover from './BookCover';
import {
  MAX_BORROW_LIMIT,
  LOAN_DURATION_DAYS,
  getRelativeISODate,
  addDaysToISODate,
  formatDate,
} from '../utils/libraryHelpers';

export default function BookDetailsPage({
  book,
  userId,
  activeBorrowCount,
  onBackToCatalog,
  onConfirmBorrow,
  onNavigate,
}) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [borrowReceipt, setBorrowReceipt] = useState(null);

  if (!book) {
    return (
      <div className="card-elevated rounded-2xl p-10 text-center">
        <p className="text-sm text-[#7B8794]">Book not found in catalog.</p>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="mt-4 px-4 py-2 rounded-xl bg-[#172A3A] text-white text-xs font-semibold cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isAvailable = book.status === 'Available';
  const isBorrowedByMe = book.borrowedByUserId === userId;
  const isAtLimit = activeBorrowCount >= MAX_BORROW_LIMIT;

  const todayIso = getRelativeISODate(0);
  const calculatedDueDate = addDaysToISODate(todayIso, LOAN_DURATION_DAYS);

  const handleConfirmBorrowAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = onConfirmBorrow(book.id, todayIso, calculatedDueDate);
      setIsProcessing(false);
      setConfirmModalOpen(false);
      if (result.ok) {
        setBorrowReceipt({
          borrowDate: todayIso,
          dueDate: calculatedDueDate,
          recordId: result.record.id,
        });
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBackToCatalog}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#7B8794] hover:text-[#172A3A] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library Catalog
      </button>

      {/* Main Details Card */}
      <div className="card-elevated rounded-2xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Cover Column */}
          <div className="flex flex-col items-center lg:items-start shrink-0">
            <BookCover book={book} size="lg" />
            <div className="mt-4 w-56 sm:w-64 p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#7B8794]">Shelf Location</span>
                <span className="font-mono font-medium text-[#172A3A]">{book.shelf}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7B8794]">Loan Duration</span>
                <span className="font-medium text-[#172A3A]">{LOAN_DURATION_DAYS} Days</span>
              </div>
            </div>
          </div>

          {/* Right Metadata & Borrow Flow Column */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-[#263442]">
                {book.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                  isAvailable
                    ? 'bg-[#D9F0E9] text-[#214C52]'
                    : 'bg-[#B9B5E8]/35 text-[#172A3A]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-[#214C52]' : 'bg-[#8E8ACB]'
                  }`}
                />
                {isAvailable ? 'Available for Borrowing' : 'Currently Borrowed'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#172A3A] leading-tight">
              {book.title}
            </h1>
            <p className="mt-2 text-base text-[#7B8794]">
              by <span className="font-semibold text-[#263442]">{book.author}</span>
            </p>

            {/* Metadata Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[11px] text-[#7B8794]">
                  <Hash className="w-3.5 h-3.5" />
                  ISBN-13
                </div>
                <div className="mt-1 text-xs font-mono font-medium text-[#172A3A] truncate">
                  {book.isbn}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[11px] text-[#7B8794]">
                  <Calendar className="w-3.5 h-3.5" />
                  Published
                </div>
                <div className="mt-1 text-xs font-semibold text-[#172A3A]">{book.year}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[11px] text-[#7B8794]">
                  <BookOpen className="w-3.5 h-3.5" />
                  Length
                </div>
                <div className="mt-1 text-xs font-semibold text-[#172A3A]">{book.pages} pages</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[11px] text-[#7B8794]">
                  <Clock className="w-3.5 h-3.5" />
                  Borrowing Term
                </div>
                <div className="mt-1 text-xs font-semibold text-[#172A3A]">
                  {LOAN_DURATION_DAYS} days
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7B8794] mb-2">
                Synopsis
              </h2>
              <p className="text-sm text-[#263442] leading-relaxed">{book.synopsis}</p>
              <p className="mt-2 text-xs text-[#7B8794]">
                Publisher: <span className="text-[#263442] font-medium">{book.publisher}</span> ·{' '}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {book.shelf}
                </span>
              </p>
            </div>

            {/* Borrowing Quota Indicator */}
            <div className="mt-6 p-4 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#172A3A]">
                  Your Borrowing Allowance: {activeBorrowCount} of {MAX_BORROW_LIMIT} books borrowed
                </p>
                <p className="text-xs text-[#7B8794] mt-0.5">
                  Members may hold up to {MAX_BORROW_LIMIT} active books simultaneously.
                </p>
              </div>
              <div className="w-32 h-2 rounded-full bg-slate-200 overflow-hidden shrink-0">
                <div
                  className="h-full aurora-progress rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (activeBorrowCount / MAX_BORROW_LIMIT) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Activity Diagram Decision Feedback & Action Area */}
            <div className="mt-6 space-y-4">
              {borrowReceipt ? (
                /* Step 8: Borrowing Success Confirmation */
                <div className="p-5 rounded-2xl bg-[#D9F0E9]/60 border border-[#69B7B0]/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#214C52] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-semibold text-[#172A3A]">
                        Book Borrowed Successfully
                      </h3>
                      <p className="text-sm text-[#214C52] mt-1">
                        Your borrowing record has been created and the book status is now updated to{' '}
                        <strong>Borrowed</strong>.
                      </p>
                      <div className="mt-3 inline-flex flex-wrap gap-4 text-xs bg-white/80 px-3.5 py-2.5 rounded-xl border border-[#69B7B0]/30">
                        <div>
                          <span className="text-[#7B8794]">Borrow Date: </span>
                          <strong className="text-[#172A3A]">
                            {formatDate(borrowReceipt.borrowDate)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#7B8794]">Due Date: </span>
                          <strong className="text-[#214C52]">
                            {formatDate(borrowReceipt.dueDate)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('browse')}
                      className="px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Library className="w-3.5 h-3.5" />
                      Browse More Books
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('history')}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#172A3A] hover:border-[#69B7B0] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      View Borrowing History
                    </button>
                  </div>
                </div>
              ) : !isAvailable ? (
                /* Step 3: Book Unavailable -> Return to Search/Catalog */
                <div className="p-5 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#263442] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-[#172A3A]">
                        {isBorrowedByMe
                          ? 'You currently have this book borrowed'
                          : 'This book is currently unavailable'}
                      </h3>
                      <p className="text-xs text-[#7B8794] mt-1">
                        {isBorrowedByMe
                          ? 'This volume is checked out under your active loans. You can return it from the Return Book page.'
                          : 'Another library member currently has this volume checked out. Please choose another available book from the catalog.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={onBackToCatalog}
                      className="px-4 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
                    >
                      <Library className="w-4 h-4" />
                      Return to Search / Catalog
                    </button>
                    {isBorrowedByMe && (
                      <button
                        type="button"
                        onClick={() => onNavigate('return')}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[#172A3A] hover:border-[#69B7B0] text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Go to Return Book
                      </button>
                    )}
                  </div>
                </div>
              ) : isAtLimit ? (
                /* Step 4: Borrowing Limit Reached (2 of 2 books) */
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#B9B5E8]/20 border border-[#8E8ACB]/45">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-[#172A3A] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-[#172A3A]">
                          Borrowing Limit Reached (2 of 2 books borrowed)
                        </h3>
                        <p className="text-xs text-[#263442] mt-1 leading-relaxed">
                          You have reached your borrowing limit of 2 books. Please return a book before borrowing another.
                        </p>
                        <div className="mt-3.5 flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => onNavigate('return')}
                            className="px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Return a Book
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('history')}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#172A3A] hover:border-[#8E8ACB] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                            View Borrowing History
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="px-6 py-3 rounded-xl bg-slate-200 text-slate-500 text-sm font-semibold cursor-not-allowed inline-flex items-center gap-2"
                  >
                    Borrow Book (Limit Reached)
                  </button>
                </div>
              ) : (
                /* Eligible to Borrow */
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#69B7B0]" />
                    Borrow Book
                  </button>
                  <button
                    type="button"
                    onClick={onBackToCatalog}
                    className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-[#263442] hover:bg-slate-50 transition cursor-pointer"
                  >
                    Keep Browsing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Confirmation Dialog */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/45 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9F0E9] text-[#214C52]">
                  Confirm Loan
                </span>
                <h3 className="mt-2 text-lg font-semibold text-[#172A3A]">
                  Confirm Book Borrowing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isProcessing && setConfirmModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex items-center gap-3.5">
              <BookCover book={book} size="xs" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#172A3A] truncate">{book.title}</p>
                <p className="text-xs text-[#7B8794] truncate">{book.author}</p>
                <p className="text-[11px] font-mono text-[#7B8794] mt-0.5">{book.isbn}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs border-y border-slate-100 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[#7B8794]">Borrowing Date</span>
                <span className="font-medium text-[#172A3A]">{formatDate(todayIso)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7B8794]">Determined Due Date ({LOAN_DURATION_DAYS} days)</span>
                <span className="font-semibold text-[#214C52]">
                  {formatDate(calculatedDueDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7B8794]">Quota After Borrow</span>
                <span className="font-mono font-semibold text-[#172A3A]">
                  {activeBorrowCount + 1} of {MAX_BORROW_LIMIT} books
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmBorrowAction}
                className="px-5 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Borrow'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
