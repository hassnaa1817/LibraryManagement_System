import React from 'react';
import {
  BookOpen,
  BookCheck,
  AlertTriangle,
  Library,
  History,
  RotateCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import BookCover from './BookCover';
import {
  MAX_BORROW_LIMIT,
  evaluateLoanStatus,
  formatDate,
  formatCurrency,
} from '../utils/libraryHelpers';

export default function DashboardPage({
  user,
  books,
  userRecords,
  onNavigate,
  onSelectBook,
  onOpenReturnModal,
}) {
  const activeRecords = userRecords.filter((r) => !r.returnDate);
  const returnedRecords = userRecords.filter((r) => Boolean(r.returnDate));
  const overdueRecords = activeRecords.filter((r) => evaluateLoanStatus(r).isOverdue);

  const activeCount = activeRecords.length;
  const remainingSlots = Math.max(0, MAX_BORROW_LIMIT - activeCount);
  const isAtLimit = activeCount >= MAX_BORROW_LIMIT;

  const booksById = Object.fromEntries(books.map((b) => [b.id, b]));
  const featuredBooks = books.filter((b) => b.featured).slice(0, 4);
  const recentRecords = [...userRecords]
    .sort((a, b) => (b.borrowDate > a.borrowDate ? 1 : -1))
    .slice(0, 4);

  const firstName = user.fullName.split(' ')[0];

  return (
    <div className="space-y-7">
      {/* Aurora Welcome Hero */}
      <section className="aurora-hero rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-subtle text-xs font-medium text-[#D9F0E9] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#69B7B0]" />
              {activeCount} of {MAX_BORROW_LIMIT} books borrowed
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              {overdueRecords.length > 0
                ? `You have ${overdueRecords.length} overdue ${
                    overdueRecords.length === 1 ? 'volume' : 'volumes'
                  } requiring return. Return it promptly to restore your borrowing allowance.`
                : activeCount === 0
                ? 'Your borrowing allowance is open. Explore our curated catalog to borrow up to 2 books at a time.'
                : `You currently have ${activeCount} active ${
                    activeCount === 1 ? 'loan' : 'loans'
                  } and ${remainingSlots} ${
                    remainingSlots === 1 ? 'slot' : 'slots'
                  } remaining in your borrowing allowance.`}
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('browse')}
                className="px-4 py-2.5 rounded-xl bg-white text-[#172A3A] hover:bg-[#D9F0E9] font-semibold text-sm inline-flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Library className="w-4 h-4 text-[#214C52]" />
                Browse Books
              </button>
              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="px-4 py-2.5 rounded-xl glass-subtle text-white hover:bg-white/20 font-medium text-sm inline-flex items-center gap-2 transition cursor-pointer"
              >
                <History className="w-4 h-4 text-[#D9F0E9]" />
                Borrowing History
              </button>
              <button
                type="button"
                onClick={() => onNavigate('return')}
                className="px-4 py-2.5 rounded-xl glass-subtle text-white hover:bg-white/20 font-medium text-sm inline-flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#B9B5E8]" />
                Return Book
              </button>
            </div>
          </div>

          {/* Glass Borrowing Quota Summary Card */}
          <div className="glass-subtle rounded-2xl p-5 lg:w-72 shrink-0">
            <div className="flex items-center justify-between text-xs text-[#D9F0E9] font-medium">
              <span>Member Borrowing Quota</span>
              <span className="font-mono">Max {MAX_BORROW_LIMIT}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{activeCount}</span>
              <span className="text-sm text-white/70">of {MAX_BORROW_LIMIT} books borrowed</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#69B7B0] transition-all duration-300"
                style={{ width: `${Math.min(100, (activeCount / MAX_BORROW_LIMIT) * 100)}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-white/75">
              {isAtLimit
                ? 'Limit reached — return a book before borrowing another.'
                : '14-day standard loan duration per volume.'}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-elevated rounded-2xl p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#7B8794]">Currently Borrowed</p>
            <p className="mt-1.5 text-2xl font-bold text-[#172A3A]">
              {activeCount} <span className="text-sm font-normal text-[#7B8794]">/ {MAX_BORROW_LIMIT}</span>
            </p>
            <p className="mt-1 text-xs text-[#214C52]">
              {activeCount === 0 ? 'No active loans' : 'Active member loans'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D9F0E9]/80 text-[#214C52] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#7B8794]">Borrowing Limit</p>
            <p className="mt-1.5 text-2xl font-bold text-[#172A3A]">
              {MAX_BORROW_LIMIT} Books
            </p>
            <p className="mt-1 text-xs text-[#7B8794]">
              {isAtLimit ? '0 slots remaining' : `${remainingSlots} ${remainingSlots === 1 ? 'slot' : 'slots'} available`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#B9B5E8]/30 text-[#172A3A] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-[#8E8ACB]" />
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#7B8794]">Books Returned</p>
            <p className="mt-1.5 text-2xl font-bold text-[#172A3A]">
              {returnedRecords.length}
            </p>
            <p className="mt-1 text-xs text-[#7B8794]">
              Completed library loans
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D9F0E9]/60 text-[#214C52] flex items-center justify-center">
            <BookCheck className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`card-elevated rounded-2xl p-5 flex items-start justify-between ${
            overdueRecords.length > 0 ? 'border-amber-200/90 bg-amber-50/30' : ''
          }`}
        >
          <div>
            <p className="text-xs font-medium text-[#7B8794]">Overdue Books</p>
            <p
              className={`mt-1.5 text-2xl font-bold ${
                overdueRecords.length > 0 ? 'text-amber-700' : 'text-[#172A3A]'
              }`}
            >
              {overdueRecords.length}
            </p>
            <p className="mt-1 text-xs text-[#7B8794]">
              {overdueRecords.length > 0
                ? 'Late fee accrues daily'
                : 'All loans in good standing'}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              overdueRecords.length > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-[#69B7B0]'
            }`}
          >
            {overdueRecords.length > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>
      </section>

      {/* Main Two-Column Section: Currently Borrowed & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Borrowed Books */}
        <section className="lg:col-span-2 card-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-[#172A3A]">Currently Borrowed Books</h2>
              <p className="text-xs text-[#7B8794] mt-0.5">
                Track due dates and initiate returns directly.
              </p>
            </div>
            {activeRecords.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('return')}
                className="text-xs font-semibold text-[#214C52] hover:text-[#172A3A] inline-flex items-center gap-1 cursor-pointer"
              >
                Manage returns
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-[#F7F8FA]/60 p-8 text-center">
              <div className="w-11 h-11 rounded-xl bg-[#D9F0E9]/70 text-[#214C52] mx-auto flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#172A3A]">No books currently borrowed</h3>
              <p className="text-xs text-[#7B8794] mt-1 max-w-sm mx-auto">
                You have {MAX_BORROW_LIMIT} borrowing slots open. Browse the catalog to check out your next read.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('browse')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                Explore Library Catalog
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activeRecords.map((record) => {
                const book = booksById[record.bookId];
                if (!book) return null;
                const loan = evaluateLoanStatus(record);
                return (
                  <div
                    key={record.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      loan.isOverdue
                        ? 'border-amber-200 bg-amber-50/40'
                        : 'border-slate-200/80 bg-[#F7F8FA]/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectBook(book.id)}
                        className="shrink-0 cursor-pointer hover:opacity-90 transition"
                      >
                        <BookCover book={book} size="sm" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
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
                          {loan.isOverdue && (
                            <span className="text-[11px] font-mono font-medium text-amber-800">
                              Est. fine: {formatCurrency(loan.fineAmount)}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectBook(book.id)}
                          className="text-sm font-semibold text-[#172A3A] hover:text-[#214C52] text-left truncate block max-w-full cursor-pointer"
                        >
                          {book.title}
                        </button>
                        <p className="text-xs text-[#7B8794] truncate">{book.author}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#7B8794]">
                          <span>Borrowed: {formatDate(record.borrowDate)}</span>
                          <span className="font-medium text-[#263442]">
                            Due: {formatDate(record.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenReturnModal(record)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer ${
                          loan.isOverdue
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-[#172A3A] hover:bg-[#214C52] text-white'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Return Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Borrowing Activity */}
        <section className="card-elevated rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-[#172A3A]">Recent Activity</h2>
              <p className="text-xs text-[#7B8794] mt-0.5">Latest loan events</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-[#214C52] hover:text-[#172A3A] cursor-pointer"
            >
              View all
            </button>
          </div>

          {recentRecords.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <History className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-[#263442]">No activity yet</p>
              <p className="text-xs text-[#7B8794] mt-1">
                Your borrowed and returned books will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRecords.map((rec) => {
                const book = booksById[rec.bookId];
                const loan = evaluateLoanStatus(rec);
                return (
                  <div key={rec.id} className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                        rec.returnDate
                          ? 'bg-[#69B7B0]'
                          : loan.isOverdue
                          ? 'bg-amber-500'
                          : 'bg-[#8E8ACB]'
                      }`}
                    />
                    <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-none last:pb-0">
                      <p className="text-xs font-semibold text-[#172A3A] truncate">
                        {book?.title || 'Library Volume'}
                      </p>
                      <p className="text-[11px] text-[#7B8794] mt-0.5">
                        {rec.returnDate
                          ? `Returned on ${formatDate(rec.returnDate)}`
                          : `Borrowed ${formatDate(rec.borrowDate)} · Due ${formatDate(rec.dueDate)}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Recommended / Featured Books */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#172A3A]">Recommended Collection</h2>
            <p className="text-xs text-[#7B8794]">Curated academic titles selected for you</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            className="text-xs font-semibold text-[#214C52] hover:text-[#172A3A] inline-flex items-center gap-1 cursor-pointer"
          >
            Full catalog
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredBooks.map((book) => {
            const isAvailable = book.status === 'Available';
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBook(book.id);
                  }
                }}
                className="card-elevated card-interactive rounded-2xl p-4 flex flex-col cursor-pointer"
              >
                <BookCover book={book} size="md" />
                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#7B8794] truncate">
                    {book.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                      isAvailable
                        ? 'bg-[#D9F0E9] text-[#214C52]'
                        : 'bg-[#B9B5E8]/35 text-[#172A3A]'
                    }`}
                  >
                    {book.status}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-[#172A3A] line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-xs text-[#7B8794] truncate mt-0.5">{book.author}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
