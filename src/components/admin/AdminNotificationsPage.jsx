import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  BookCopy,
  UserPlus,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../../utils/libraryHelpers';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Notices' },
  { id: 'overdue', label: 'Overdue Books' },
  { id: 'borrowed', label: 'Borrowing Transactions' },
  { id: 'returned', label: 'Returned Books' },
  { id: 'low-stock', label: 'Low Availability' },
  { id: 'member', label: 'New Members' },
];

export default function AdminNotificationsPage({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}) {
  const [filterCat, setFilterCat] = useState('all');

  const filtered = useMemo(() => {
    if (filterCat === 'all') return notifications;
    return notifications.filter((n) => n.category === filterCat);
  }, [notifications, filterCat]);

  const getIcon = (category) => {
    switch (category) {
      case 'overdue':
        return <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />;
      case 'returned':
        return <CheckCircle2 className="w-4.5 h-4.5 text-[#214C52]" />;
      case 'low-stock':
        return <BookCopy className="w-4.5 h-4.5 text-amber-600" />;
      case 'member':
        return <UserPlus className="w-4.5 h-4.5 text-[#8E8ACB]" />;
      default:
        return <BookOpen className="w-4.5 h-4.5 text-[#214C52]" />;
    }
  };

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'overdue':
        return 'bg-amber-100 text-amber-800';
      case 'returned':
        return 'bg-[#D9F0E9] text-[#214C52]';
      case 'low-stock':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'member':
        return 'bg-[#B9B5E8]/35 text-[#172A3A]';
      default:
        return 'bg-slate-100 text-[#263442]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Notification Center
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Real-time alerts for overdue loans, circulation events, low inventory, and new registrations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#69B7B0] text-xs font-semibold text-[#172A3A] inline-flex items-center gap-2 self-start cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#214C52]" />
            Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? notifications.length
              : notifications.filter((n) => n.category === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCat(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2 transition cursor-pointer ${
                filterCat === tab.id
                  ? 'bg-[#172A3A] text-white'
                  : 'bg-white border border-slate-200/80 text-[#263442] hover:border-[#69B7B0]'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterCat === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-[#7B8794]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="card-elevated rounded-2xl overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#172A3A]">No notifications here</h3>
            <p className="text-xs text-[#7B8794] mt-1">
              There are currently no alerts in this category.
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                n.unread ? 'bg-[#D9F0E9]/15' : 'hover:bg-[#F7F8FA]/60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0">
                  {getIcon(n.category)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getBadgeStyle(
                        n.category
                      )}`}
                    >
                      {n.category.replace('-', ' ')}
                    </span>
                    {n.unread && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#214C52]">
                        <span className="w-2 h-2 rounded-full bg-[#69B7B0]" />
                        New
                      </span>
                    )}
                    {n.date && (
                      <span className="text-[11px] text-[#7B8794]">{formatDate(n.date)}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#172A3A] mt-1">{n.title}</h3>
                  <p className="text-xs text-[#7B8794] mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {n.unread && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-[#263442] hover:bg-white cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                {n.targetPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onMarkRead(n.id);
                      onNavigate(n.targetPage);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    Open
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
