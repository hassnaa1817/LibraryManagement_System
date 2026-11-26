import React, { useState, useMemo } from 'react';
import {
  Search,
  History,
  Library,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RotateCcw,
  X,
  Receipt,
} from 'lucide-react';
import BookCover from './BookCover';
import {
  evaluateLoanStatus,
  formatDate,
  formatCurrency,
  generateReceiptNumber,
} from '../utils/libraryHelpers';

export default function BorrowingHistoryPage({
  books,
  userRecords,
  onNavigate,
  onSelectBook,
  onOpenReturnModal,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Returned' | 'Overdue'
  const [selectedRecord, setSelectedRecord] = useState(null);

  const booksById = useMemo(
    () => Object.fromEntries(books.map((b) => [b.id, b])),
    [books]
  );

  const enrichedRecords = useMemo(() => {
    return [...userRecords]
      .sort((a, b) => (b.borrowDate > a.borrowDate ? 1 : -1))
      .map((rec) => {
        const book = booksById[rec.bookId];
        const loan = evaluateLoanStatus(rec);
        return { ...rec, book, loan };
      });
  }, [userRecords, booksById]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedRecords.filter((item) => {
      const matchesQuery =
        !q ||
        item.book?.title.toLowerCase().includes(q) ||
        item.book?.author.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'All' || item.loan.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [enrichedRecords, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    return {
      All: enrichedRecords.length,
      Active: enrichedRecords.filter((r) => r.loan.status === 'Active').length,
      Returned: enrichedRecords.filter((r) => r.loan.status === 'Returned').length,
      Overdue: enrichedRecords.filter((r) => r.loan.status === 'Overdue').length,
    };
  }, [enrichedRecords]);

  /* Activity Diagram Branch: Any Borrowing Records? -> No -> Display No Borrowing History */
  if (userRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Borrowing History
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            View your past and active library loans.
          </p>
        </div>

        <div className="card-elevated rounded-2xl p-12 sm:p-16 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl aurora-hero text-[#D9F0E9] mx-auto flex items-center justify-center mb-5 shadow-md">
            <History className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-medium text-[#172A3A]">
            No Borrowing History Yet
          </h2>
          <p className="text-sm text-[#7B8794] mt-2 max-w-md mx-auto leading-relaxed">
            You haven’t borrowed any volumes from Aurora Library yet. Explore our academic collection and check out your first book—you can borrow up to 2 books at a time.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('browse')}
            className="mt-6 px-5 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-sm font-semibold inline-flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Library className="w-4 h-4 text-[#69B7B0]" />
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Borrowing History
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Complete record of your active loans, returned volumes, and overdue notices.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Active', 'Returned', 'Overdue'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#172A3A] text-white'
                  : 'bg-[#F7F8FA] text-[#263442] border border-slate-200/80 hover:border-[#69B7B0]'
              }`}
            >
              {tab}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/70 text-[#7B8794]'
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search book title or author..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-[#F7F8FA]/60 focus:bg-white focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
          />
        </div>
      </div>

      {/* History Table / Cards */}
      {filteredRecords.length === 0 ? (
        <div className="card-elevated rounded-2xl p-10 text-center">
          <p className="text-sm font-medium text-[#172A3A]">
            No borrowing records match this filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-semibold text-[#214C52] hover:underline cursor-pointer"
          >
            Show all records
          </button>
        </div>
      ) : (
        <div className="card-elevated rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F7F8FA]/80 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                  <th className="py-3.5 px-5">Book</th>
                  <th className="py-3.5 px-4">Borrowed</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Returned</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRecords.map((item) => {
                  const { book, loan } = item;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F7F8FA]/60 transition cursor-pointer"
                      onClick={() => setSelectedRecord(item)}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5 min-w-[220px]">
                          <BookCover book={book} size="xs" />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#172A3A] truncate max-w-[240px]">
                              {book?.title || 'Unknown Title'}
                            </p>
                            <p className="text-xs text-[#7B8794] truncate">
                              {book?.author}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#263442] whitespace-nowrap">
                        {formatDate(item.borrowDate)}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-[#172A3A] whitespace-nowrap">
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#7B8794] whitespace-nowrap">
                        {item.returnDate ? formatDate(item.returnDate) : '—'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              loan.status === 'Overdue'
                                ? 'bg-amber-100 text-amber-800'
                                : loan.status === 'Active'
                                ? 'bg-[#B9B5E8]/35 text-[#172A3A]'
                                : 'bg-[#D9F0E9] text-[#214C52]'
                            }`}
                          >
                            {loan.status === 'Overdue' ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : loan.status === 'Active' ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {loan.status}
                          </span>
                          {(loan.isOverdue || loan.daysOverdue > 0) && (
                            <span className="text-[11px] text-amber-700 font-medium">
                              {loan.label}
                              {loan.fineAmount > 0 ? ` · ${formatCurrency(loan.fineAmount)}` : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="py-4 px-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(item)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-[#263442] hover:border-[#69B7B0] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>
                          {!item.returnDate && (
                            <button
                              type="button"
                              onClick={() => onOpenReturnModal(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Borrowing Details Modal (Activity Diagram: Borrowing Details) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/45 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7B8794]">
                  Record #{selectedRecord.id.toUpperCase()}
                </span>
                <h3 className="text-lg font-semibold text-[#172A3A] mt-0.5">
                  Borrowing Record Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex items-center gap-4">
              <BookCover book={selectedRecord.book} size="sm" />
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    const bId = selectedRecord.book?.id;
                    setSelectedRecord(null);
                    if (bId) onSelectBook(bId);
                  }}
                  className="text-sm font-semibold text-[#172A3A] hover:text-[#214C52] text-left cursor-pointer"
                >
                  {selectedRecord.book?.title}
                </button>
                <p className="text-xs text-[#7B8794] mt-0.5">{selectedRecord.book?.author}</p>
                <p className="text-[11px] font-mono text-[#7B8794] mt-1">
                  ISBN {selectedRecord.book?.isbn}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs border-y border-slate-100 py-4">
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Borrowing Status</span>
                <span className="font-semibold text-[#172A3A]">{selectedRecord.loan.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Borrowing Date</span>
                <span className="font-medium text-[#263442]">
                  {formatDate(selectedRecord.borrowDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Due Date</span>
                <span className="font-medium text-[#263442]">
                  {formatDate(selectedRecord.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Return Date</span>
                <span className="font-medium text-[#263442]">
                  {selectedRecord.returnDate ? formatDate(selectedRecord.returnDate) : 'Not returned yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Late / Fine Status</span>
                <span
                  className={`font-semibold ${
                    selectedRecord.loan.fineAmount > 0 ? 'text-amber-700' : 'text-[#214C52]'
                  }`}
                >
                  {selectedRecord.loan.fineAmount > 0
                    ? `${selectedRecord.loan.daysOverdue}d late · ${formatCurrency(
                        selectedRecord.loan.fineAmount
                      )}`
                    : 'No Fine'}
                </span>
              </div>
              {selectedRecord.receiptNo && (
                <div className="flex justify-between">
                  <span className="text-[#7B8794] inline-flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    Receipt Reference
                  </span>
                  <span className="font-mono text-[#172A3A]">
                    {selectedRecord.receiptNo || generateReceiptNumber(selectedRecord.id)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              {!selectedRecord.returnDate && (
                <button
                  type="button"
                  onClick={() => {
                    const rec = selectedRecord;
                    setSelectedRecord(null);
                    onOpenReturnModal(rec);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Return This Book
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
