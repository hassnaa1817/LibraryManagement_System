import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Eye,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  X,
} from 'lucide-react';
import BookCover from '../BookCover';
import {
  DAILY_FINE_RATE,
  evaluateLoanStatus,
  formatDate,
  formatCurrency,
  generateReceiptNumber,
} from '../../utils/libraryHelpers';

const PAGE_SIZE = 7;

export default function AdminBorrowingsPage({
  records,
  books,
  members,
  initialQuery = '',
  onOpenReturnModal,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('All'); // All | Borrowed | Returned | Overdue
  const [memberFilter, setMemberFilter] = useState('All');
  const [bookFilter, setBookFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'borrowDate', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [detailRecord, setDetailRecord] = useState(null);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
      setPage(1);
    }
  }, [initialQuery]);

  const booksById = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);
  const usersById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  const enriched = useMemo(() => {
    return records.map((rec) => {
      const book = booksById[rec.bookId];
      const member = usersById[rec.userId];
      const loan = evaluateLoanStatus(rec);
      const displayStatus = loan.status === 'Active' ? 'Borrowed' : loan.status;
      return { ...rec, book, member, loan, displayStatus };
    });
  }, [records, booksById, usersById]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = enriched.filter((item) => {
      const matchesQ =
        !q ||
        item.id.toLowerCase().includes(q) ||
        (item.member?.fullName || '').toLowerCase().includes(q) ||
        (item.book?.title || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || item.displayStatus === statusFilter;
      const matchesMember = memberFilter === 'All' || item.userId === memberFilter;
      const matchesBook = bookFilter === 'All' || item.bookId === bookFilter;
      const matchesFrom = !dateFrom || item.borrowDate >= dateFrom;
      const matchesTo = !dateTo || item.borrowDate <= dateTo;
      return (
        matchesQ &&
        matchesStatus &&
        matchesMember &&
        matchesBook &&
        matchesFrom &&
        matchesTo
      );
    });

    list.sort((a, b) => {
      const dir = sortBy.dir === 'asc' ? 1 : -1;
      if (sortBy.key === 'memberName') {
        return (a.member?.fullName || '').localeCompare(b.member?.fullName || '') * dir;
      }
      if (sortBy.key === 'bookTitle') {
        return (a.book?.title || '').localeCompare(b.book?.title || '') * dir;
      }
      const valA = String(a[sortBy.key] || '');
      const valB = String(b[sortBy.key] || '');
      return valA.localeCompare(valB) * dir;
    });

    return list;
  }, [enriched, query, statusFilter, memberFilter, bookFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key) => {
    setSortBy((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('All');
    setMemberFilter('All');
    setBookFilter('All');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
          Borrowing Management
        </h1>
        <p className="text-sm text-[#7B8794] mt-1">
          Monitor every circulation transaction, due date, return record, and overdue status.
        </p>
      </div>

      {/* Search & Multi-Filters */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search record ID, member name, or book title..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-[#F7F8FA]/60 focus:bg-white focus:outline-none focus:border-[#69B7B0]"
            />
          </div>

          <div className="inline-flex p-1 rounded-xl bg-[#F7F8FA] border border-slate-200/80 self-start">
            {['All', 'Borrowed', 'Returned', 'Overdue'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-[#172A3A] shadow-2xs border border-slate-200/70'
                    : 'text-[#7B8794] hover:text-[#263442]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <select
            value={memberFilter}
            onChange={(e) => {
              setMemberFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#263442]"
          >
            <option value="All">All Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName}
              </option>
            ))}
          </select>

          <select
            value={bookFilter}
            onChange={(e) => {
              setBookFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#263442]"
          >
            <option value="All">All Books</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-[#7B8794] shrink-0">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#263442]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#7B8794] shrink-0">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#263442]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        {paged.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#172A3A]">No borrowing records found</p>
            <p className="text-xs text-[#7B8794] mt-1">
              Try adjusting your status, member, book, or date filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#172A3A] text-white text-xs font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F7F8FA]/85 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                    <th className="py-3.5 px-5">Record ID</th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('memberName')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Member
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('bookTitle')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Book Title
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('borrowDate')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Borrowed
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Return Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paged.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setDetailRecord(item)}
                      className="hover:bg-[#F7F8FA]/65 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-5 font-mono font-semibold text-[#172A3A] whitespace-nowrap">
                        #{item.id.toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#172A3A]">
                          {item.member?.fullName || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-[#7B8794]">
                          {item.member?.memberId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[230px]">
                        <p className="font-medium text-[#263442] truncate">{item.book?.title}</p>
                        <p className="text-[11px] text-[#7B8794] truncate">{item.book?.author}</p>
                      </td>
                      <td className="py-3.5 px-4 text-[#7B8794] whitespace-nowrap">
                        {formatDate(item.borrowDate)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#172A3A] whitespace-nowrap">
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-[#7B8794] whitespace-nowrap">
                        {item.returnDate ? formatDate(item.returnDate) : '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.displayStatus === 'Overdue'
                              ? 'bg-amber-100 text-amber-800'
                              : item.displayStatus === 'Borrowed'
                              ? 'bg-[#B9B5E8]/35 text-[#172A3A]'
                              : 'bg-[#D9F0E9] text-[#214C52]'
                          }`}
                        >
                          {item.displayStatus === 'Overdue' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : item.displayStatus === 'Borrowed' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {item.displayStatus}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailRecord(item)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#263442] hover:border-[#69B7B0] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>
                          {!item.returnDate && (
                            <button
                              type="button"
                              onClick={() => onOpenReturnModal(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#172A3A] hover:bg-[#214C52] text-white inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#7B8794]">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} records
              </span>
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#263442] disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 font-medium text-[#172A3A]">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#263442] disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Borrowing Details Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7B8794]">
                  Borrowing Record #{detailRecord.id.toUpperCase()}
                </span>
                <h3 className="text-lg font-semibold text-[#172A3A] mt-0.5">
                  Borrowing Transaction Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                className="p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Member & Book Summary */}
            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                  Member Details
                </p>
                <p className="text-sm font-semibold text-[#172A3A] mt-1">
                  {detailRecord.member?.fullName}
                </p>
                <p className="text-xs text-[#7B8794]">
                  {detailRecord.member?.email} · {detailRecord.member?.memberId}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70 flex items-center gap-3.5">
                <BookCover book={detailRecord.book} size="xs" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                    Book Details
                  </p>
                  <p className="text-sm font-semibold text-[#172A3A] truncate mt-0.5">
                    {detailRecord.book?.title}
                  </p>
                  <p className="text-xs text-[#7B8794]">
                    {detailRecord.book?.author} · ISBN {detailRecord.book?.isbn}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates & Status */}
            <div className="mt-4 space-y-2.5 text-xs border-y border-slate-100 py-4">
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Borrowing Date</span>
                <span className="font-medium text-[#263442]">
                  {formatDate(detailRecord.borrowDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Due Date</span>
                <span className="font-semibold text-[#172A3A]">
                  {formatDate(detailRecord.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Return Date</span>
                <span className="font-medium text-[#263442]">
                  {detailRecord.returnDate ? formatDate(detailRecord.returnDate) : 'Pending return'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B8794]">Current Status</span>
                <span className="font-semibold text-[#172A3A]">
                  {detailRecord.displayStatus}
                </span>
              </div>
            </div>

            {/* Fine Details */}
            {detailRecord.loan.fineAmount > 0 ? (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-amber-900">
                  <span className="inline-flex items-center gap-1.5">
                    <Receipt className="w-4 h-4" />
                    Fine Breakdown
                  </span>
                  <span className="font-mono">
                    {detailRecord.receiptNo || generateReceiptNumber(detailRecord.id)}
                  </span>
                </div>
                <div className="flex justify-between text-[#263442]">
                  <span>
                    {detailRecord.loan.daysOverdue} overdue{' '}
                    {detailRecord.loan.daysOverdue === 1 ? 'day' : 'days'} ×{' '}
                    {formatCurrency(DAILY_FINE_RATE)}/day
                  </span>
                  <span className="font-mono font-bold text-amber-800">
                    {formatCurrency(detailRecord.loan.fineAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-xl bg-[#D9F0E9]/45 border border-[#69B7B0]/35 flex justify-between items-center text-xs">
                <span className="font-medium text-[#214C52]">Fine Status</span>
                <span className="font-semibold text-[#214C52]">No Fine ($0.00)</span>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] cursor-pointer"
              >
                Close
              </button>
              {!detailRecord.returnDate && (
                <button
                  type="button"
                  onClick={() => {
                    const rec = detailRecord;
                    setDetailRecord(null);
                    onOpenReturnModal(rec);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Process Return
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
