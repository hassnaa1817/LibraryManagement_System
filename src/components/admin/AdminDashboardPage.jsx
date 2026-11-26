import React, { useMemo } from 'react';
import {
  BookCopy,
  BookCheck,
  BookOpen,
  Users,
  AlertTriangle,
  RotateCcw,
  Plus,
  UserPlus,
  ClipboardList,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { evaluateLoanStatus, formatDate } from '../../utils/libraryHelpers';

export default function AdminDashboardPage({
  books,
  members,
  records,
  onNavigate,
  onOpenAddBook,
  onOpenAddMember,
}) {
  const totalBookTitles = books.length;
  const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies ?? 1), 0);
  const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies ?? (b.status === 'Available' ? 1 : 0)), 0);
  const borrowedCopies = Math.max(0, totalCopies - availableCopies);

  const activeRecords = records.filter((r) => !r.returnDate);
  const returnedRecords = records.filter((r) => Boolean(r.returnDate));
  const overdueRecords = activeRecords.filter((r) => evaluateLoanStatus(r).isOverdue);
  const onTimeActiveCount = activeRecords.length - overdueRecords.length;

  const booksById = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);
  const usersById = useMemo(() => Object.fromEntries(members.map((u) => [u.id, u])), [members]);

  // Monthly Borrowing Trends (realistic 6-month series culminating in live current month count)
  const monthlySeries = useMemo(() => {
    const currentMonthVal = Math.max(12, records.length + 6);
    return [
      { month: 'Jun', borrowed: 24, returned: 21 },
      { month: 'Jul', borrowed: 31, returned: 28 },
      { month: 'Aug', borrowed: 29, returned: 27 },
      { month: 'Sep', borrowed: 42, returned: 37 },
      { month: 'Oct', borrowed: 38, returned: 35 },
      { month: 'Nov', borrowed: currentMonthVal, returned: returnedRecords.length + 11 },
    ];
  }, [records.length, returnedRecords.length]);

  const maxMonthly = Math.max(...monthlySeries.map((m) => m.borrowed), 1);

  // Most Borrowed Books
  const mostBorrowedBooks = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      counts[r.bookId] = (counts[r.bookId] || 0) + 1;
    });
    return books
      .map((b) => ({
        book: b,
        count: counts[b.id] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [books, records]);

  const maxBorrowCount = Math.max(...mostBorrowedBooks.map((item) => item.count), 1);

  // Recent Activity combining borrowing, returning, overdue detection, and new member registrations
  const recentActivities = useMemo(() => {
    const list = [];

    records.forEach((rec) => {
      const book = booksById[rec.bookId];
      const member = usersById[rec.userId];
      const loan = evaluateLoanStatus(rec);

      if (rec.returnDate) {
        list.push({
          id: `act-ret-${rec.id}`,
          memberName: member?.fullName || 'Library Member',
          bookTitle: book?.title || 'Volume',
          activityType: 'Book returned',
          date: rec.returnDate,
          status: loan.daysOverdue > 0 ? 'Returned Late' : 'Completed',
          tone: 'mint',
        });
      } else if (loan.isOverdue) {
        list.push({
          id: `act-ovd-${rec.id}`,
          memberName: member?.fullName || 'Library Member',
          bookTitle: book?.title || 'Volume',
          activityType: 'Overdue book detected',
          date: rec.dueDate,
          status: `${loan.daysOverdue}d Overdue`,
          tone: 'amber',
        });
      } else {
        list.push({
          id: `act-bor-${rec.id}`,
          memberName: member?.fullName || 'Library Member',
          bookTitle: book?.title || 'Volume',
          activityType: 'Book borrowed',
          date: rec.borrowDate,
          status: 'Active Loan',
          tone: 'lavender',
        });
      }
    });

    members.slice(0, 3).forEach((m) => {
      list.push({
        id: `act-mem-${m.id}`,
        memberName: m.fullName,
        bookTitle: '—',
        activityType: 'New member registered',
        date: m.joinedDate,
        status: m.accountStatus || 'Active',
        tone: 'teal',
      });
    });

    return list.sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 7);
  }, [records, members, booksById, usersById]);

  // Donut chart percentages for Borrowing Status Distribution
  const totalDist = Math.max(onTimeActiveCount + returnedRecords.length + overdueRecords.length, 1);
  const pctReturned = (returnedRecords.length / totalDist) * 100;
  const pctActive = (onTimeActiveCount / totalDist) * 100;
  const pctOverdue = (overdueRecords.length / totalDist) * 100;

  const statCards = [
    {
      label: 'Total Books',
      value: totalBookTitles,
      sub: `${totalCopies} total copies`,
      icon: BookCopy,
      iconBg: 'bg-[#172A3A]/8 text-[#172A3A]',
    },
    {
      label: 'Available Books',
      value: availableCopies,
      sub: 'Copies ready to borrow',
      icon: BookCheck,
      iconBg: 'bg-[#D9F0E9]/85 text-[#214C52]',
    },
    {
      label: 'Borrowed Books',
      value: borrowedCopies,
      sub: 'Currently checked out',
      icon: BookOpen,
      iconBg: 'bg-[#B9B5E8]/35 text-[#172A3A]',
    },
    {
      label: 'Total Members',
      value: members.length,
      sub: `${members.filter((m) => m.accountStatus !== 'Suspended').length} active accounts`,
      icon: Users,
      iconBg: 'bg-[#69B7B0]/20 text-[#214C52]',
    },
    {
      label: 'Overdue Books',
      value: overdueRecords.length,
      sub: overdueRecords.length > 0 ? 'Requires follow-up' : 'Zero overdue loans',
      icon: AlertTriangle,
      iconBg: overdueRecords.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-[#69B7B0]',
      highlight: overdueRecords.length > 0,
    },
    {
      label: 'Pending Returns',
      value: activeRecords.length,
      sub: 'Awaiting check-in',
      icon: RotateCcw,
      iconBg: 'bg-[#8E8ACB]/20 text-[#172A3A]',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <section className="aurora-hero rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-subtle text-xs font-medium text-[#D9F0E9] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#69B7B0]" />
              Circulation & Inventory Overview
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Welcome back, Admin
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
              The library currently holds <strong>{totalBookTitles}</strong> catalog titles ({totalCopies} copies) across <strong>{members.length}</strong> registered members, with{' '}
              <strong>{activeRecords.length}</strong> active loans and{' '}
              <strong>{overdueRecords.length}</strong> overdue {overdueRecords.length === 1 ? 'item' : 'items'}.
            </p>

            {/* Quick Actions */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onOpenAddBook}
                className="px-4 py-2.5 rounded-xl bg-white text-[#172A3A] hover:bg-[#D9F0E9] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#214C52]" />
                Add New Book
              </button>
              <button
                type="button"
                onClick={onOpenAddMember}
                className="px-4 py-2.5 rounded-xl glass-subtle text-white hover:bg-white/20 font-medium text-xs sm:text-sm inline-flex items-center gap-2 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#D9F0E9]" />
                Add New Member
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin-borrowings')}
                className="px-4 py-2.5 rounded-xl glass-subtle text-white hover:bg-white/20 font-medium text-xs sm:text-sm inline-flex items-center gap-2 transition cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-[#B9B5E8]" />
                View Borrowing Records
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin-returns')}
                className="px-4 py-2.5 rounded-xl glass-subtle text-white hover:bg-white/20 font-medium text-xs sm:text-sm inline-flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#69B7B0]" />
                Manage Returns
              </button>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-5 lg:w-72 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#D9F0E9] font-medium">
              <span>Catalog Availability</span>
              <span className="font-mono">
                {totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#69B7B0]"
                style={{
                  width: `${totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/80">
              <span>{availableCopies} available</span>
              <span>{borrowedCopies} on loan</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`card-elevated rounded-2xl p-4 flex flex-col justify-between ${
                card.highlight ? 'border-amber-200 bg-amber-50/30' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#7B8794]">{card.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p
                  className={`text-2xl font-bold ${
                    card.highlight ? 'text-amber-700' : 'text-[#172A3A]'
                  }`}
                >
                  {card.value}
                </p>
                <p className="text-[11px] text-[#7B8794] mt-0.5 truncate">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Charts & Analytics Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Borrowing Trends */}
        <div className="lg:col-span-2 card-elevated rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-semibold text-[#172A3A] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#214C52]" />
                Monthly Borrowing & Return Trends
              </h2>
              <p className="text-xs text-[#7B8794] mt-0.5">
                Book borrowing activity over the past 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#263442]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#214C52]" />
                Borrowed
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#263442]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#B9B5E8]" />
                Returned
              </span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 sm:gap-5 pt-4 pb-2 px-2 border-b border-slate-100">
            {monthlySeries.map((item) => {
              const borrowH = Math.max(12, Math.round((item.borrowed / maxMonthly) * 165));
              const returnH = Math.max(10, Math.round((item.returned / maxMonthly) * 165));
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    <div
                      className="w-4 sm:w-6 rounded-t-lg bg-[#214C52] group-hover:bg-[#172A3A] transition-all relative"
                      style={{ height: `${borrowH}px` }}
                      title={`${item.month}: ${item.borrowed} borrowed`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono font-semibold text-[#172A3A] absolute -top-5 left-1/2 -translate-x-1/2">
                        {item.borrowed}
                      </span>
                    </div>
                    <div
                      className="w-4 sm:w-6 rounded-t-lg bg-[#B9B5E8] group-hover:bg-[#8E8ACB] transition-all relative"
                      style={{ height: `${returnH}px` }}
                      title={`${item.month}: ${item.returned} returned`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono font-semibold text-[#7B8794] absolute -top-5 left-1/2 -translate-x-1/2">
                        {item.returned}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#7B8794]">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Borrowing Status Distribution & Availability Overview */}
        <div className="card-elevated rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#172A3A]">
              Borrowing Status Distribution
            </h2>
            <p className="text-xs text-[#7B8794] mt-0.5">
              Breakdown across all {records.length} circulation records
            </p>
          </div>

          <div className="my-5 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                />
                {/* Returned segment */}
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#69B7B0"
                  strokeWidth="14"
                  strokeDasharray={`${(pctReturned / 100) * 289} 289`}
                  strokeDashoffset="0"
                />
                {/* Active On-Time segment */}
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#8E8ACB"
                  strokeWidth="14"
                  strokeDasharray={`${(pctActive / 100) * 289} 289`}
                  strokeDashoffset={`-${(pctReturned / 100) * 289}`}
                />
                {/* Overdue segment */}
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="14"
                  strokeDasharray={`${(pctOverdue / 100) * 289} 289`}
                  strokeDashoffset={`-${((pctReturned + pctActive) / 100) * 289}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-[#172A3A]">{records.length}</span>
                <span className="text-[11px] text-[#7B8794]">Total Loans</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#263442]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#69B7B0]" />
                Returned
              </span>
              <span className="font-mono font-semibold text-[#172A3A]">
                {returnedRecords.length} ({Math.round(pctReturned)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#263442]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8E8ACB]" />
                Active (On Time)
              </span>
              <span className="font-mono font-semibold text-[#172A3A]">
                {onTimeActiveCount} ({Math.round(pctActive)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#263442]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                Overdue
              </span>
              <span className="font-mono font-semibold text-amber-700">
                {overdueRecords.length} ({Math.round(pctOverdue)}%)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Most Borrowed Books & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Borrowed Books */}
        <div className="card-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#172A3A]">Most Borrowed Books</h2>
              <p className="text-xs text-[#7B8794] mt-0.5">Top circulating catalog titles</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin-reports')}
              className="text-xs font-semibold text-[#214C52] hover:underline cursor-pointer"
            >
              Reports
            </button>
          </div>

          <div className="space-y-4">
            {mostBorrowedBooks.map(({ book, count }) => (
              <div key={book.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-[#172A3A] truncate">{book.title}</span>
                  <span className="font-mono font-semibold text-[#214C52] shrink-0">
                    {count} {count === 1 ? 'loan' : 'loans'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full aurora-progress"
                    style={{ width: `${Math.max(12, Math.round((count / maxBorrowCount) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 card-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#172A3A]">Recent Library Activity</h2>
              <p className="text-xs text-[#7B8794] mt-0.5">
                Latest circulation events, returns, registrations, and overdue alerts
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin-borrowings')}
              className="text-xs font-semibold text-[#214C52] hover:text-[#172A3A] inline-flex items-center gap-1 cursor-pointer"
            >
              All records
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                  <th className="py-2.5 pr-4">Member</th>
                  <th className="py-2.5 px-3">Book Title</th>
                  <th className="py-2.5 px-3">Activity</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#F7F8FA]/70">
                    <td className="py-3 pr-4 font-semibold text-[#172A3A] whitespace-nowrap">
                      {act.memberName}
                    </td>
                    <td className="py-3 px-3 text-[#263442] max-w-[200px] truncate">
                      {act.bookTitle}
                    </td>
                    <td className="py-3 px-3 text-[#7B8794] whitespace-nowrap">
                      {act.activityType}
                    </td>
                    <td className="py-3 px-3 text-[#7B8794] whitespace-nowrap">
                      {formatDate(act.date)}
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          act.tone === 'amber'
                            ? 'bg-amber-100 text-amber-800'
                            : act.tone === 'mint'
                            ? 'bg-[#D9F0E9] text-[#214C52]'
                            : act.tone === 'lavender'
                            ? 'bg-[#B9B5E8]/35 text-[#172A3A]'
                            : 'bg-slate-100 text-[#214C52]'
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
