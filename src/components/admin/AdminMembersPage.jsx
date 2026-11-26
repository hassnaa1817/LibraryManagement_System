import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  History,
  ShieldBan,
  ShieldCheck,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import BookCover from '../BookCover';
import {
  MAX_BORROW_LIMIT,
  evaluateLoanStatus,
  formatDate,
  formatCurrency,
  getInitials,
} from '../../utils/libraryHelpers';

const PAGE_SIZE = 5;

const EMPTY_MEMBER_FORM = {
  fullName: '',
  email: '',
  department: '',
  role: 'Undergraduate Member',
  phone: '',
  accountStatus: 'Active',
};

export default function AdminMembersPage({
  members,
  books,
  records,
  openAddTrigger = 0,
  selectedMemberId,
  onSelectMember,
  onAddMember,
  onEditMember,
  onToggleMemberStatus,
  onDeleteMember,
  onViewMemberBorrowings,
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState({ key: 'fullName', dir: 'asc' });
  const [page, setPage] = useState(1);

  const [formModal, setFormModal] = useState({ open: false, mode: 'add', member: null });
  const [formState, setFormState] = useState(EMPTY_MEMBER_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (openAddTrigger > 0) {
      openAddModal();
    }
  }, [openAddTrigger]);

  const booksById = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);

  const memberStats = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      const mRecs = records.filter((r) => r.userId === m.id);
      const active = mRecs.filter((r) => !r.returnDate);
      const overdue = active.filter((r) => evaluateLoanStatus(r).isOverdue);
      map[m.id] = {
        totalRecords: mRecs.length,
        activeCount: active.length,
        overdueCount: overdue.length,
        records: mRecs,
        activeRecords: active,
        overdueRecords: overdue,
      };
    });
    return map;
  }, [members, records]);

  const openAddModal = () => {
    setFormState(EMPTY_MEMBER_FORM);
    setFormErrors({});
    setFormModal({ open: true, mode: 'add', member: null });
  };

  const openEditModal = (member) => {
    setFormState({
      fullName: member.fullName || '',
      email: member.email || '',
      department: member.department || '',
      role: member.role || 'Library Member',
      phone: member.phone || '',
      accountStatus: member.accountStatus || 'Active',
    });
    setFormErrors({});
    setFormModal({ open: true, mode: 'edit', member });
  };

  const handleSort = (key) => {
    setSortBy((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = members.filter((m) => {
      const st = m.accountStatus || 'Active';
      const matchesQ =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || st === statusFilter;
      return matchesQ && matchesStatus;
    });

    list.sort((a, b) => {
      const dir = sortBy.dir === 'asc' ? 1 : -1;
      if (sortBy.key === 'activeCount') {
        return ((memberStats[a.id]?.activeCount || 0) - (memberStats[b.id]?.activeCount || 0)) * dir;
      }
      if (sortBy.key === 'totalRecords') {
        return ((memberStats[a.id]?.totalRecords || 0) - (memberStats[b.id]?.totalRecords || 0)) * dir;
      }
      const valA = String(a[sortBy.key] || '').toLowerCase();
      const valB = String(b[sortBy.key] || '').toLowerCase();
      return valA.localeCompare(valB) * dir;
    });

    return list;
  }, [members, query, statusFilter, sortBy, memberStats]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedMembers = filteredMembers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSaveMember = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formState.fullName.trim() || formState.fullName.trim().length < 2) {
      errs.fullName = 'Full name is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email.trim())) {
      errs.email = 'Valid email address is required.';
    } else if (
      members.some(
        (m) =>
          m.email.toLowerCase() === formState.email.trim().toLowerCase() &&
          m.id !== formModal.member?.id
      )
    ) {
      errs.email = 'Another member already uses this email.';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (formModal.mode === 'add') {
      onAddMember({
        ...formState,
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        department: formState.department.trim() || 'General Academic Studies',
        phone: formState.phone.trim(),
      });
    } else if (formModal.member) {
      onEditMember(formModal.member.id, {
        ...formState,
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        department: formState.department.trim(),
        phone: formState.phone.trim(),
      });
    }

    setFormModal({ open: false, mode: 'add', member: null });
  };

  /* Member Details View */
  const selectedMember = selectedMemberId
    ? members.find((m) => m.id === selectedMemberId)
    : null;

  if (selectedMember) {
    const st = memberStats[selectedMember.id] || {
      activeCount: 0,
      overdueCount: 0,
      totalRecords: 0,
      records: [],
      activeRecords: [],
      overdueRecords: [],
    };
    const isSuspended = selectedMember.accountStatus === 'Suspended';

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onSelectMember(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7B8794] hover:text-[#172A3A] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Member Management
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openEditModal(selectedMember)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#172A3A] hover:border-[#69B7B0] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Member
            </button>
            <button
              type="button"
              onClick={() => onToggleMemberStatus(selectedMember.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                isSuspended
                  ? 'bg-[#214C52] text-white hover:bg-[#172A3A]'
                  : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {isSuspended ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Activate Account
                </>
              ) : (
                <>
                  <ShieldBan className="w-3.5 h-3.5" />
                  Suspend Account
                </>
              )}
            </button>
          </div>
        </div>

        {/* Member Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-elevated rounded-2xl overflow-hidden">
            <div className="aurora-hero h-20" />
            <div className="px-6 pb-6 -mt-9">
              <div className="w-18 h-18 rounded-2xl aurora-auth-panel border-4 border-white text-white text-xl font-semibold flex items-center justify-center shadow-md">
                {getInitials(selectedMember.fullName)}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-[#172A3A]">
                  {selectedMember.fullName}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    isSuspended
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-[#D9F0E9] text-[#214C52]'
                  }`}
                >
                  {selectedMember.accountStatus || 'Active'}
                </span>
              </div>
              <p className="text-xs text-[#7B8794]">{selectedMember.role}</p>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-[#263442]">
                  <Mail className="w-4 h-4 text-[#7B8794] shrink-0" />
                  <span className="truncate">{selectedMember.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#263442]">
                  <Phone className="w-4 h-4 text-[#7B8794] shrink-0" />
                  <span>{selectedMember.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#263442]">
                  <Building2 className="w-4 h-4 text-[#7B8794] shrink-0" />
                  <span>{selectedMember.department || 'General'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#263442]">
                  <Calendar className="w-4 h-4 text-[#7B8794] shrink-0" />
                  <span>Registered {formatDate(selectedMember.joinedDate)}</span>
                </div>
              </div>

              {/* Borrowing Limit Status */}
              <div className="mt-5 p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
                <div className="flex justify-between text-xs font-semibold text-[#172A3A]">
                  <span>Borrowing Limit</span>
                  <span className="font-mono text-[#214C52]">
                    {st.activeCount} / {MAX_BORROW_LIMIT} books
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full aurora-progress rounded-full"
                    style={{
                      width: `${Math.min(100, (st.activeCount / MAX_BORROW_LIMIT) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#7B8794]">
                  Member ID: <span className="font-mono">{selectedMember.memberId}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Overdue Alert Banner if applicable */}
            {st.overdueRecords.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-900">
                    {st.overdueRecords.length} Overdue{' '}
                    {st.overdueRecords.length === 1 ? 'Record' : 'Records'} Detected
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    This member has overdue volumes accruing daily late fees.
                  </p>
                </div>
              </div>
            )}

            {/* Currently Borrowed Books */}
            <div className="card-elevated rounded-2xl p-6">
              <h3 className="text-base font-semibold text-[#172A3A] mb-4">
                Currently Borrowed Books ({st.activeRecords.length})
              </h3>
              {st.activeRecords.length === 0 ? (
                <p className="text-xs text-[#7B8794] py-4">
                  This member has no books currently checked out.
                </p>
              ) : (
                <div className="space-y-3">
                  {st.activeRecords.map((rec) => {
                    const book = booksById[rec.bookId];
                    const loan = evaluateLoanStatus(rec);
                    return (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <BookCover book={book} size="xs" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#172A3A] truncate">
                              {book?.title}
                            </p>
                            <p className="text-xs text-[#7B8794]">
                              Borrowed {formatDate(rec.borrowDate)} · Due {formatDate(rec.dueDate)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                            loan.isOverdue
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#D9F0E9] text-[#214C52]'
                          }`}
                        >
                          {loan.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Borrowing History Table */}
            <div className="card-elevated rounded-2xl p-6">
              <h3 className="text-base font-semibold text-[#172A3A] mb-4">
                Borrowing History ({st.records.length})
              </h3>
              {st.records.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#7B8794]">
                  <BookOpen className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  No borrowing records found for this member.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-[#7B8794]">
                        <th className="py-2.5 pr-4">Record</th>
                        <th className="py-2.5 px-3">Book</th>
                        <th className="py-2.5 px-3">Borrowed</th>
                        <th className="py-2.5 px-3">Due / Returned</th>
                        <th className="py-2.5 pl-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {st.records.map((rec) => {
                        const book = booksById[rec.bookId];
                        const loan = evaluateLoanStatus(rec);
                        return (
                          <tr key={rec.id}>
                            <td className="py-3 pr-4 font-mono text-[#7B8794]">
                              #{rec.id.toUpperCase()}
                            </td>
                            <td className="py-3 px-3 font-medium text-[#172A3A]">
                              {book?.title}
                            </td>
                            <td className="py-3 px-3 text-[#7B8794]">
                              {formatDate(rec.borrowDate)}
                            </td>
                            <td className="py-3 px-3 text-[#263442]">
                              {rec.returnDate
                                ? `Ret. ${formatDate(rec.returnDate)}`
                                : `Due ${formatDate(rec.dueDate)}`}
                            </td>
                            <td className="py-3 pl-3 text-right">
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
                                {loan.fineAmount > 0 ? ` (${formatCurrency(loan.fineAmount)})` : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Member Management
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Manage registered library members, borrowing quotas, and account standing.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition self-start cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#69B7B0]" />
          Add New Member
        </button>
      </div>

      {/* Filters */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by member name, email, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-[#F7F8FA]/60 focus:bg-white focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
          />
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[#F7F8FA] border border-slate-200/80 self-start">
          {['All', 'Active', 'Suspended'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
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

      {/* Member Table */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        {pagedMembers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#172A3A]">No matching members found</p>
            <p className="text-xs text-[#7B8794] mt-1">
              Try clearing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F7F8FA]/85 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                    <th className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => handleSort('fullName')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Member
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Member ID</th>
                    <th className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSort('activeCount')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Borrowed
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSort('totalRecords')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Records
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('joinedDate')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Registered
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pagedMembers.map((member) => {
                    const st = memberStats[member.id] || { activeCount: 0, totalRecords: 0 };
                    const isSuspended = member.accountStatus === 'Suspended';
                    return (
                      <tr key={member.id} className="hover:bg-[#F7F8FA]/65 transition">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3 min-w-[210px]">
                            <div className="w-9 h-9 rounded-xl aurora-hero text-white text-xs font-semibold flex items-center justify-center shrink-0">
                              {getInitials(member.fullName)}
                            </div>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => onSelectMember(member.id)}
                                className="text-sm font-semibold text-[#172A3A] hover:text-[#214C52] truncate block cursor-pointer"
                              >
                                {member.fullName}
                              </button>
                              <p className="text-[11px] text-[#7B8794] truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#7B8794] whitespace-nowrap">
                          {member.memberId}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#172A3A]">
                          {st.activeCount} / {MAX_BORROW_LIMIT}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[#263442]">
                          {st.totalRecords}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isSuspended
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-[#D9F0E9] text-[#214C52]'
                            }`}
                          >
                            {member.accountStatus || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#7B8794] whitespace-nowrap">
                          {formatDate(member.joinedDate)}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectMember(member.id)}
                              title="View Member Details"
                              className="p-1.5 rounded-lg border border-slate-200 text-[#263442] hover:border-[#69B7B0] cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(member)}
                              title="Edit Member"
                              className="p-1.5 rounded-lg border border-slate-200 text-[#263442] hover:border-[#69B7B0] cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onViewMemberBorrowings(member.fullName)}
                              title="View Borrowing History"
                              className="p-1.5 rounded-lg border border-slate-200 text-[#263442] hover:border-[#69B7B0] cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleMemberStatus(member.id)}
                              title={isSuspended ? 'Activate Account' : 'Suspend Account'}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                isSuspended
                                  ? 'border-[#69B7B0] text-[#214C52] hover:bg-[#D9F0E9]/50'
                                  : 'border-slate-200 text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              {isSuspended ? (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldBan className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(member)}
                              title="Delete Member"
                              className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#7B8794]">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length} members
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

      {/* Add / Edit Member Modal */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#172A3A]">
                  {formModal.mode === 'add' ? 'Register New Member' : 'Edit Member Profile'}
                </h3>
                <p className="text-xs text-[#7B8794] mt-0.5">
                  {formModal.mode === 'add'
                    ? 'Create an academic library member account.'
                    : `Updating ${formModal.member?.fullName}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormModal({ open: false, mode: 'add', member: null })}
                className="p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) => setFormState((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formState.department}
                    onChange={(e) => setFormState((p) => ({ ...p, department: e.target.value }))}
                    placeholder="School of Computing"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Membership Tier
                  </label>
                  <select
                    value={formState.role}
                    onChange={(e) => setFormState((p) => ({ ...p, role: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Undergraduate Member">Undergraduate Member</option>
                    <option value="Graduate Library Member">Graduate Library Member</option>
                    <option value="Doctoral Fellow">Doctoral Fellow</option>
                    <option value="Faculty Member">Faculty Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Account Status
                  </label>
                  <select
                    value={formState.accountStatus}
                    onChange={(e) => setFormState((p) => ({ ...p, accountStatus: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormModal({ open: false, mode: 'add', member: null })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold cursor-pointer"
                >
                  {formModal.mode === 'add' ? 'Create Member' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#172A3A]">Delete Member Account?</h3>
                <p className="text-xs text-[#7B8794] mt-1 leading-relaxed">
                  Are you sure you want to delete <strong>{deleteTarget.fullName}</strong> (
                  {deleteTarget.memberId})? This will remove the member from active rosters.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMember(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
