import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  BookCopy,
  ClipboardList,
  RotateCcw,
  AlertTriangle,
  Users,
  Calendar,
} from 'lucide-react';
import { BOOK_CATEGORIES } from '../../data/libraryData';
import {
  evaluateLoanStatus,
  formatDate,
  formatCurrency,
  exportToCSV,
  MAX_BORROW_LIMIT,
} from '../../utils/libraryHelpers';

const REPORT_TABS = [
  { id: 'inventory', label: 'Book Inventory Report', icon: BookCopy },
  { id: 'borrowing', label: 'Borrowing Report', icon: ClipboardList },
  { id: 'return', label: 'Return Report', icon: RotateCcw },
  { id: 'overdue', label: 'Overdue Report', icon: AlertTriangle },
  { id: 'member', label: 'Member Activity Report', icon: Users },
];

export default function AdminReportsPage({ books, members, records }) {
  const [activeTab, setActiveTab] = useState('inventory');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const booksById = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);
  const usersById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  const dateFilteredRecords = useMemo(() => {
    return records.filter((r) => {
      const targetDate = activeTab === 'return' ? r.returnDate || r.borrowDate : r.borrowDate;
      if (dateFrom && targetDate < dateFrom) return false;
      if (dateTo && targetDate > dateTo) return false;
      return true;
    });
  }, [records, activeTab, dateFrom, dateTo]);

  // Report datasets
  const inventoryRows = useMemo(() => {
    return books.filter((b) => categoryFilter === 'All' || b.category === categoryFilter);
  }, [books, categoryFilter]);

  const borrowingRows = useMemo(() => {
    return dateFilteredRecords.map((r) => ({
      ...r,
      book: booksById[r.bookId],
      member: usersById[r.userId],
      loan: evaluateLoanStatus(r),
    }));
  }, [dateFilteredRecords, booksById, usersById]);

  const returnRows = useMemo(() => {
    return borrowingRows.filter((r) => Boolean(r.returnDate));
  }, [borrowingRows]);

  const overdueRows = useMemo(() => {
    return borrowingRows.filter((r) => !r.returnDate && r.loan.isOverdue);
  }, [borrowingRows]);

  const memberActivityRows = useMemo(() => {
    return members.map((m) => {
      const mRecs = dateFilteredRecords.filter((r) => r.userId === m.id);
      const active = mRecs.filter((r) => !r.returnDate);
      const overdue = active.filter((r) => evaluateLoanStatus(r).isOverdue);
      const fines = mRecs.reduce((sum, r) => sum + evaluateLoanStatus(r).fineAmount, 0);
      return {
        member: m,
        totalLoans: mRecs.length,
        activeLoans: active.length,
        overdueLoans: overdue.length,
        fines,
      };
    });
  }, [members, dateFilteredRecords]);

  // Chart data derived per report tab
  const chartBars = useMemo(() => {
    if (activeTab === 'inventory') {
      const cats = BOOK_CATEGORIES.filter((c) => c !== 'All');
      return cats.map((cat) => {
        const subset = books.filter((b) => b.category === cat);
        const copies = subset.reduce((s, b) => s + (b.totalCopies ?? 1), 0);
        const avail = subset.reduce((s, b) => s + (b.availableCopies ?? (b.status === 'Available' ? 1 : 0)), 0);
        return { label: cat.split(' & ')[0], primary: copies, secondary: avail };
      });
    }
    if (activeTab === 'member') {
      return memberActivityRows.map((row) => ({
        label: row.member.fullName.split(' ')[0],
        primary: row.totalLoans,
        secondary: row.activeLoans,
      }));
    }
    const cats = BOOK_CATEGORIES.filter((c) => c !== 'All');
    return cats.map((cat) => {
      const source =
        activeTab === 'return'
          ? returnRows
          : activeTab === 'overdue'
          ? overdueRows
          : borrowingRows;
      const count = source.filter((r) => r.book?.category === cat).length;
      return { label: cat.split(' & ')[0], primary: count, secondary: 0 };
    });
  }, [activeTab, books, memberActivityRows, borrowingRows, returnRows, overdueRows]);

  const maxChartVal = Math.max(...chartBars.map((b) => b.primary), 1);

  const handleExportCSV = () => {
    if (activeTab === 'inventory') {
      exportToCSV(
        'aurora-book-inventory-report.csv',
        ['Book ID', 'Title', 'Author', 'ISBN', 'Category', 'Total Copies', 'Available Copies', 'Status'],
        inventoryRows.map((b) => [
          b.id,
          b.title,
          b.author,
          b.isbn,
          b.category,
          b.totalCopies ?? 1,
          b.availableCopies ?? (b.status === 'Available' ? 1 : 0),
          b.status,
        ])
      );
      return;
    }

    if (activeTab === 'member') {
      exportToCSV(
        'aurora-member-activity-report.csv',
        ['Member ID', 'Name', 'Email', 'Account Status', 'Total Loans', 'Active Loans', 'Overdue Loans', 'Total Fines'],
        memberActivityRows.map((row) => [
          row.member.memberId,
          row.member.fullName,
          row.member.email,
          row.member.accountStatus || 'Active',
          row.totalLoans,
          row.activeLoans,
          row.overdueLoans,
          formatCurrency(row.fines),
        ])
      );
      return;
    }

    const source =
      activeTab === 'return'
        ? returnRows
        : activeTab === 'overdue'
        ? overdueRows
        : borrowingRows;

    exportToCSV(
      `aurora-${activeTab}-report.csv`,
      ['Record ID', 'Member', 'Book Title', 'Borrow Date', 'Due Date', 'Return Date', 'Status', 'Fine'],
      source.map((r) => [
        r.id,
        r.member?.fullName || '',
        r.book?.title || '',
        r.borrowDate,
        r.dueDate,
        r.returnDate || '',
        r.loan.status,
        formatCurrency(r.loan.fineAmount),
      ])
    );
  };

  // Summary strip per report
  const summaryStats = useMemo(() => {
    if (activeTab === 'inventory') {
      const totalCopies = inventoryRows.reduce((s, b) => s + (b.totalCopies ?? 1), 0);
      const availCopies = inventoryRows.reduce((s, b) => s + (b.availableCopies ?? (b.status === 'Available' ? 1 : 0)), 0);
      return [
        { label: 'Catalog Titles', value: inventoryRows.length },
        { label: 'Total Copies', value: totalCopies },
        { label: 'Available Copies', value: availCopies },
        { label: 'Checked Out Copies', value: totalCopies - availCopies },
      ];
    }
    if (activeTab === 'return') {
      const onTime = returnRows.filter((r) => r.loan.daysOverdue === 0).length;
      const fines = returnRows.reduce((s, r) => s + r.loan.fineAmount, 0);
      return [
        { label: 'Total Returns', value: returnRows.length },
        { label: 'Returned On Time', value: onTime },
        { label: 'Returned Late', value: returnRows.length - onTime },
        { label: 'Fines Collected', value: formatCurrency(fines) },
      ];
    }
    if (activeTab === 'overdue') {
      const fines = overdueRows.reduce((s, r) => s + r.loan.fineAmount, 0);
      const avgDays =
        overdueRows.length > 0
          ? (
              overdueRows.reduce((s, r) => s + r.loan.daysOverdue, 0) /
              overdueRows.length
            ).toFixed(1)
          : 0;
      return [
        { label: 'Overdue Books', value: overdueRows.length },
        { label: 'Avg. Days Overdue', value: `${avgDays} d` },
        { label: 'Accrued Fines', value: formatCurrency(fines) },
        { label: 'Affected Members', value: new Set(overdueRows.map((r) => r.userId)).size },
      ];
    }
    if (activeTab === 'member') {
      const activeMembers = members.filter((m) => m.accountStatus !== 'Suspended').length;
      return [
        { label: 'Total Members', value: members.length },
        { label: 'Active Standing', value: activeMembers },
        { label: 'Suspended', value: members.length - activeMembers },
        { label: 'Max Loan Quota', value: `${MAX_BORROW_LIMIT} books` },
      ];
    }
    const active = borrowingRows.filter((r) => !r.returnDate).length;
    return [
      { label: 'Total Transactions', value: borrowingRows.length },
      { label: 'Active Loans', value: active },
      { label: 'Completed Returns', value: borrowingRows.length - active },
      {
        label: 'Overdue Rate',
        value: `${
          borrowingRows.length > 0
            ? Math.round((overdueRows.length / borrowingRows.length) * 100)
            : 0
        }%`,
      },
    ];
  }, [activeTab, inventoryRows, returnRows, overdueRows, borrowingRows, members]);

  return (
    <div className="space-y-6">
      {/* Header & Exports */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Library Reports & Analytics
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Analyze inventory health, circulation trends, overdue fines, and member activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#69B7B0]" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#69B7B0] text-[#172A3A] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Export PDF / Print
          </button>
        </div>
      </div>

      {/* Report Category Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2 transition cursor-pointer ${
                active
                  ? 'aurora-hero text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-[#263442] hover:border-[#69B7B0]'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#D9F0E9]' : 'text-[#7B8794]'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[#7B8794]">
            <Calendar className="w-4 h-4" />
            <span className="font-medium text-[#263442]">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-[#F7F8FA] text-[#263442]"
          />
          <span className="text-[#7B8794]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-[#F7F8FA] text-[#263442]"
          />
        </div>

        {activeTab === 'inventory' && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-[#263442] font-medium"
          >
            {BOOK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        )}

        {(dateFrom || dateTo || categoryFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setCategoryFilter('All');
            }}
            className="text-[#214C52] font-semibold hover:underline cursor-pointer"
          >
            Reset Report Filters
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="card-elevated rounded-2xl p-4 sm:p-5">
            <p className="text-xs text-[#7B8794] font-medium">{stat.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-[#172A3A]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Visual Chart Strip */}
      <div className="card-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#172A3A]">
              {REPORT_TABS.find((t) => t.id === activeTab)?.label} Visualization
            </h2>
            <p className="text-xs text-[#7B8794] mt-0.5">
              Distribution breakdown across categories or active patrons
            </p>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 sm:gap-5 px-2 pt-4 pb-1 border-b border-slate-100">
          {chartBars.map((bar) => {
            const h1 = Math.max(8, Math.round((bar.primary / maxChartVal) * 125));
            const h2 = bar.secondary ? Math.max(6, Math.round((bar.secondary / maxChartVal) * 125)) : 0;
            return (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="flex items-end gap-1 h-34">
                  <div
                    className="w-5 sm:w-7 rounded-t-lg bg-[#214C52]"
                    style={{ height: `${h1}px` }}
                    title={`${bar.label}: ${bar.primary}`}
                  />
                  {bar.secondary > 0 && (
                    <div
                      className="w-5 sm:w-7 rounded-t-lg bg-[#69B7B0]"
                      style={{ height: `${h2}px` }}
                      title={`${bar.label} available/active: ${bar.secondary}`}
                    />
                  )}
                </div>
                <span className="text-[11px] text-[#7B8794] truncate max-w-full">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Data Table */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'inventory' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F7F8FA]/85 text-[11px] uppercase tracking-wider text-[#7B8794]">
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4 text-center">Total Qty</th>
                  <th className="py-3.5 px-4 text-center">Available</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryRows.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F7F8FA]/60">
                    <td className="py-3 px-5 font-semibold text-[#172A3A]">{b.title}</td>
                    <td className="py-3 px-4 text-[#263442]">{b.author}</td>
                    <td className="py-3 px-4 text-[#7B8794]">{b.category}</td>
                    <td className="py-3 px-4 font-mono text-[#7B8794]">{b.isbn}</td>
                    <td className="py-3 px-4 text-center font-mono">{b.totalCopies ?? 1}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-[#214C52]">
                      {b.availableCopies ?? (b.status === 'Available' ? 1 : 0)}
                    </td>
                    <td className="py-3 px-5 text-right font-semibold text-[#172A3A]">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'member' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F7F8FA]/85 text-[11px] uppercase tracking-wider text-[#7B8794]">
                  <th className="py-3.5 px-5">Member</th>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Standing</th>
                  <th className="py-3.5 px-4 text-center">Total Loans</th>
                  <th className="py-3.5 px-4 text-center">Active</th>
                  <th className="py-3.5 px-4 text-center">Overdue</th>
                  <th className="py-3.5 px-5 text-right">Fines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberActivityRows.map((row) => (
                  <tr key={row.member.id} className="hover:bg-[#F7F8FA]/60">
                    <td className="py-3 px-5 font-semibold text-[#172A3A]">
                      {row.member.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#7B8794]">{row.member.memberId}</td>
                    <td className="py-3 px-4">{row.member.accountStatus || 'Active'}</td>
                    <td className="py-3 px-4 text-center font-mono">{row.totalLoans}</td>
                    <td className="py-3 px-4 text-center font-mono">{row.activeLoans}</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-700">
                      {row.overdueLoans}
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-semibold">
                      {formatCurrency(row.fines)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F7F8FA]/85 text-[11px] uppercase tracking-wider text-[#7B8794]">
                  <th className="py-3.5 px-5">Record ID</th>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Borrowed</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Returned</th>
                  <th className="py-3.5 px-5 text-right">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'return'
                  ? returnRows
                  : activeTab === 'overdue'
                  ? overdueRows
                  : borrowingRows
                ).map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7F8FA]/60">
                    <td className="py-3 px-5 font-mono text-[#7B8794]">#{r.id.toUpperCase()}</td>
                    <td className="py-3 px-4 font-semibold text-[#172A3A]">
                      {r.member?.fullName}
                    </td>
                    <td className="py-3 px-4 text-[#263442]">{r.book?.title}</td>
                    <td className="py-3 px-4 text-[#7B8794]">{formatDate(r.borrowDate)}</td>
                    <td className="py-3 px-4 text-[#172A3A]">{formatDate(r.dueDate)}</td>
                    <td className="py-3 px-4 text-[#7B8794]">
                      {r.returnDate ? formatDate(r.returnDate) : '—'}
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-semibold">
                      {r.loan.fineAmount > 0 ? formatCurrency(r.loan.fineAmount) : '$0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
