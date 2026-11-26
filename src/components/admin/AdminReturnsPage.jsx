import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Receipt,
  Printer,
  X,
  Loader2,
  Search,
} from 'lucide-react';
import BookCover from '../BookCover';
import {
  DAILY_FINE_RATE,
  evaluateLoanStatus,
  formatDate,
  formatCurrency,
  getRelativeISODate,
  generateReceiptNumber,
} from '../../utils/libraryHelpers';

export function AdminReturnModal({ record, book, member, onCancel, onConfirm }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!record || !book) return null;

  const todayIso = getRelativeISODate(0);
  const loan = evaluateLoanStatus(record, todayIso);
  const receiptNo = generateReceiptNumber(record.id);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(record, {
        returnDate: todayIso,
        finePaid: loan.fineAmount,
        receiptNo: loan.isOverdue ? receiptNo : null,
        daysOverdue: loan.daysOverdue,
      });
      setIsProcessing(false);
    }, 450);
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
                  Late Return · Fine Required
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  On-Time Return · No Fine
                </>
              )}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-[#172A3A]">
              Confirm Circulation Return
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

        {/* Member Information */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
            Member Information
          </p>
          <p className="text-sm font-semibold text-[#172A3A] mt-0.5">
            {member?.fullName || 'Library Member'}
          </p>
          <p className="text-xs text-[#7B8794]">
            {member?.email} · {member?.memberId}
          </p>
        </div>

        {/* Book Information */}
        <div className="mt-3 p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex items-center gap-3.5">
          <BookCover book={book} size="xs" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
              Book Information
            </p>
            <p className="text-sm font-semibold text-[#172A3A] truncate mt-0.5">
              {book.title}
            </p>
            <p className="text-xs text-[#7B8794] truncate">
              {book.author} · ISBN {book.isbn}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 space-y-2 text-xs border-y border-slate-100 py-3.5">
          <div className="flex justify-between">
            <span className="text-[#7B8794]">Borrowing Date</span>
            <span className="font-medium text-[#263442]">{formatDate(record.borrowDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7B8794]">Due Date</span>
            <span className="font-medium text-[#172A3A]">{formatDate(record.dueDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7B8794]">Actual Return Date</span>
            <span className="font-semibold text-[#172A3A]">{formatDate(todayIso)}</span>
          </div>
        </div>

        {/* Fine Receipt or No Fine */}
        {loan.isOverdue ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/55 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#172A3A]">
                <Receipt className="w-4 h-4 text-amber-700" />
                Official Fine Receipt
              </span>
              <span className="text-[11px] font-mono text-amber-900">{receiptNo}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#263442]">Days Overdue</span>
                <span className="font-mono font-medium">
                  {loan.daysOverdue} {loan.daysOverdue === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#263442]">Late Fee Rate</span>
                <span className="font-mono">{formatCurrency(DAILY_FINE_RATE)} / day</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-amber-200/80 text-sm font-bold text-[#172A3A]">
                <span>Total Fine Amount</span>
                <span className="font-mono text-amber-800">{formatCurrency(loan.fineAmount)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#69B7B0]/40 bg-[#D9F0E9]/45 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#214C52]">No Fine</p>
              <p className="text-[11px] text-[#214C52]/80 mt-0.5">
                Returned within the authorized borrowing period.
              </p>
            </div>
            <span className="text-base font-mono font-bold text-[#214C52]">$0.00</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2.5">
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
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-70 ${
              loan.isOverdue
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-[#172A3A] hover:bg-[#214C52]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing Return...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {loan.isOverdue ? 'Confirm Return & Issue Receipt' : 'Confirm Return'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReturnsPage({
  records,
  books,
  members,
  lastReturnConfirmation,
  onClearLastReturnConfirmation,
  onOpenReturnModal,
}) {
  const [filterTab, setFilterTab] = useState('All'); // All | Overdue | On Time
  const [searchQuery, setSearchQuery] = useState('');

  const booksById = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);
  const usersById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  const activeLoans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records
      .filter((r) => !r.returnDate)
      .map((rec) => {
        const book = booksById[rec.bookId];
        const member = usersById[rec.userId];
        const loan = evaluateLoanStatus(rec);
        return { ...rec, book, member, loan };
      })
      .filter((item) => {
        const matchesTab =
          filterTab === 'All' ||
          (filterTab === 'Overdue' && item.loan.isOverdue) ||
          (filterTab === 'On Time' && !item.loan.isOverdue);
        const matchesQ =
          !q ||
          (item.member?.fullName || '').toLowerCase().includes(q) ||
          (item.book?.title || '').toLowerCase().includes(q);
        return matchesTab && matchesQ;
      })
      .sort((a, b) => (b.loan.daysOverdue - a.loan.daysOverdue));
  }, [records, booksById, usersById, filterTab, searchQuery]);

  const overdueCount = records.filter((r) => !r.returnDate && evaluateLoanStatus(r).isOverdue).length;
  const totalActive = records.filter((r) => !r.returnDate).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
          Return Management
        </h1>
        <p className="text-sm text-[#7B8794] mt-1">
          Verify due dates, assess late return fees, issue fine receipts, and check volumes back into stock.
        </p>
      </div>

      {/* Completed Return Receipt Banner */}
      {lastReturnConfirmation && (
        <div className="card-elevated rounded-2xl p-6 border-[#69B7B0]/50 bg-gradient-to-br from-[#D9F0E9]/45 via-white to-[#B9B5E8]/15 animate-modal-in">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#D9F0E9] text-[#214C52] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#172A3A]">
                  Return Processed & Inventory Updated
                </h2>
                <p className="text-xs text-[#263442] mt-1">
                  <strong>{lastReturnConfirmation.bookTitle}</strong> returned by{' '}
                  <strong>{lastReturnConfirmation.memberName}</strong> on{' '}
                  <strong>{formatDate(lastReturnConfirmation.returnDate)}</strong>.
                </p>

                <div className="mt-3 flex flex-wrap gap-2.5 text-xs">
                  <span
                    className={`px-3 py-1 rounded-lg border font-semibold ${
                      lastReturnConfirmation.finePaid > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-[#D9F0E9]/70 border-[#69B7B0]/40 text-[#214C52]'
                    }`}
                  >
                    {lastReturnConfirmation.finePaid > 0
                      ? `Fine Receipt ${lastReturnConfirmation.receiptNo}: ${formatCurrency(
                          lastReturnConfirmation.finePaid
                        )}`
                      : 'Return Status: No Fine ($0.00)'}
                  </span>
                  {lastReturnConfirmation.finePaid > 0 && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[#172A3A] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Fine Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearLastReturnConfirmation}
              className="p-1.5 rounded-lg text-[#7B8794] hover:bg-white cursor-pointer self-start"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-[#F7F8FA] border border-slate-200/80 self-start">
          {[
            { id: 'All', label: `All Pending (${totalActive})` },
            { id: 'Overdue', label: `Overdue (${overdueCount})` },
            { id: 'On Time', label: `On Time (${totalActive - overdueCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-white text-[#172A3A] shadow-2xs border border-slate-200/70'
                  : 'text-[#7B8794] hover:text-[#263442]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by member or book..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-[#F7F8FA]/60 focus:bg-white focus:outline-none focus:border-[#69B7B0]"
          />
        </div>
      </div>

      {/* Pending Returns Table */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        {activeLoans.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#69B7B0] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#172A3A]">No pending returns</h3>
            <p className="text-xs text-[#7B8794] mt-1">
              All matching loans have been returned and checked in.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F7F8FA]/85 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                  <th className="py-3.5 px-5">Member</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Borrowed</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Days Overdue</th>
                  <th className="py-3.5 px-4">Return Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activeLoans.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition ${
                      item.loan.isOverdue ? 'bg-amber-50/25 hover:bg-amber-50/45' : 'hover:bg-[#F7F8FA]/70'
                    }`}
                  >
                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-semibold text-[#172A3A]">{item.member?.fullName}</p>
                      <p className="text-[11px] text-[#7B8794]">{item.member?.memberId}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <BookCover book={item.book} size="xs" />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#172A3A] truncate max-w-[210px]">
                            {item.book?.title}
                          </p>
                          <p className="text-[11px] text-[#7B8794]">{item.book?.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#7B8794] whitespace-nowrap">
                      {formatDate(item.borrowDate)}
                    </td>
                    <td className="py-4 px-4 font-medium text-[#172A3A] whitespace-nowrap">
                      {formatDate(item.dueDate)}
                    </td>
                    <td className="py-4 px-4 font-mono whitespace-nowrap">
                      {item.loan.isOverdue ? (
                        <span className="font-semibold text-amber-700">
                          {item.loan.daysOverdue} {item.loan.daysOverdue === 1 ? 'day' : 'days'} (
                          {formatCurrency(item.loan.fineAmount)})
                        </span>
                      ) : (
                        <span className="text-[#7B8794]">0 days</span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.loan.isOverdue
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#D9F0E9] text-[#214C52]'
                        }`}
                      >
                        {item.loan.isOverdue ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Overdue · Fine Due
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            On Time · No Fine
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenReturnModal(item)}
                        className={`px-3.5 py-2 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                          item.loan.isOverdue
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-[#172A3A] hover:bg-[#214C52]'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Process Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
