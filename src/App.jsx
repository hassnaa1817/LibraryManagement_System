import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  INITIAL_BOOKS,
  INITIAL_USERS,
  INITIAL_BORROW_RECORDS,
} from './data/libraryData';
import {
  MAX_BORROW_LIMIT,
  evaluateLoanStatus,
  getRelativeISODate,
  formatDate,
  formatCurrency,
} from './utils/libraryHelpers';
import AuthPages from './components/AuthPages';
import AppShell from './components/AppShell';
import DashboardPage from './components/DashboardPage';
import BrowseBooksPage from './components/BrowseBooksPage';
import BookDetailsPage from './components/BookDetailsPage';
import BorrowingHistoryPage from './components/BorrowingHistoryPage';
import ReturnBookPage, { ReturnConfirmationModal } from './components/ReturnBookPage';
import ProfilePage from './components/ProfilePage';

// Admin Portal Components
import AdminShell from './components/admin/AdminShell';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import AdminBooksPage from './components/admin/AdminBooksPage';
import AdminMembersPage from './components/admin/AdminMembersPage';
import AdminBorrowingsPage from './components/admin/AdminBorrowingsPage';
import AdminReturnsPage, { AdminReturnModal } from './components/admin/AdminReturnsPage';
import AdminReportsPage from './components/admin/AdminReportsPage';
import AdminNotificationsPage from './components/admin/AdminNotificationsPage';
import AdminProfilePage from './components/admin/AdminProfilePage';

const STORAGE_KEY = 'aurora_lms_state_v2';

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.books) && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed data
  }
  return {
    books: INITIAL_BOOKS,
    users: INITIAL_USERS,
    records: INITIAL_BORROW_RECORDS,
    currentUserId: null,
  };
}

export default function App() {
  const [state, setState] = useState(loadInitialState);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [returnModalRecord, setReturnModalRecord] = useState(null);
  const [lastReturnConfirmation, setLastReturnConfirmation] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [dismissedNotifIds, setDismissedNotifIds] = useState([]);

  // Admin-specific UI coordination state
  const [adminPage, setAdminPage] = useState('admin-dashboard');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminSelectedMemberId, setAdminSelectedMemberId] = useState(null);
  const [adminBorrowingFilterQuery, setAdminBorrowingFilterQuery] = useState('');
  const [adminAddBookTrigger, setAdminAddBookTrigger] = useState(0);
  const [adminAddMemberTrigger, setAdminAddMemberTrigger] = useState(0);
  const [adminReturnModalRecord, setAdminReturnModalRecord] = useState(null);
  const [adminLastReturn, setAdminLastReturn] = useState(null);
  const [adminReadNotifIds, setAdminReadNotifIds] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3400 ? null : prev));
    }, 3500);
  };

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) || null,
    [state.users, state.currentUserId]
  );

  // Member-only list (exclude admin accounts from Member Management & member metrics)
  const memberUsers = useMemo(
    () => state.users.filter((u) => !u.isAdmin),
    [state.users]
  );

  const userRecords = useMemo(() => {
    if (!currentUser) return [];
    return state.records.filter((r) => r.userId === currentUser.id);
  }, [state.records, currentUser]);

  const activeRecords = useMemo(
    () => userRecords.filter((r) => !r.returnDate),
    [userRecords]
  );

  const overdueRecords = useMemo(
    () => activeRecords.filter((r) => evaluateLoanStatus(r).isOverdue),
    [activeRecords]
  );

  const returnedRecords = useMemo(
    () => userRecords.filter((r) => Boolean(r.returnDate)),
    [userRecords]
  );

  // Member Notifications
  const notifications = useMemo(() => {
    if (!currentUser || currentUser.isAdmin) return [];
    const booksById = Object.fromEntries(state.books.map((b) => [b.id, b]));
    const items = [];

    overdueRecords.forEach((rec) => {
      const book = booksById[rec.bookId];
      const loan = evaluateLoanStatus(rec);
      items.push({
        id: `overdue-${rec.id}`,
        type: 'warning',
        title: 'Overdue Book Reminder',
        message: `"${book?.title}" is ${loan.daysOverdue} ${
          loan.daysOverdue === 1 ? 'day' : 'days'
        } overdue. Current fine: ${formatCurrency(loan.fineAmount)}.`,
      });
    });

    activeRecords
      .filter((r) => !evaluateLoanStatus(r).isOverdue)
      .forEach((rec) => {
        const book = booksById[rec.bookId];
        items.push({
          id: `active-${rec.id}`,
          type: 'info',
          title: 'Active Loan Due Date',
          message: `"${book?.title}" is due on ${formatDate(rec.dueDate)}.`,
        });
      });

    if (activeRecords.length >= MAX_BORROW_LIMIT) {
      items.push({
        id: `limit-${currentUser.id}`,
        type: 'warning',
        title: 'Borrowing Limit Reached',
        message: `You have ${activeRecords.length} of ${MAX_BORROW_LIMIT} books borrowed.`,
      });
    }

    return items.filter((n) => !dismissedNotifIds.includes(n.id));
  }, [currentUser, state.books, activeRecords, overdueRecords, dismissedNotifIds]);

  // Admin Notifications (Overdue, Borrowing, Returned, Low Stock, New Members)
  const adminNotifications = useMemo(() => {
    const booksById = Object.fromEntries(state.books.map((b) => [b.id, b]));
    const usersById = Object.fromEntries(state.users.map((u) => [u.id, u]));
    const items = [];

    state.records.forEach((rec) => {
      const book = booksById[rec.bookId];
      const member = usersById[rec.userId];
      const loan = evaluateLoanStatus(rec);

      if (!rec.returnDate && loan.isOverdue) {
        items.push({
          id: `adm-ovd-${rec.id}`,
          category: 'overdue',
          title: `Overdue: ${book?.title || 'Volume'}`,
          message: `${member?.fullName || 'Member'} is ${loan.daysOverdue} ${
            loan.daysOverdue === 1 ? 'day' : 'days'
          } overdue (${formatCurrency(loan.fineAmount)} fine accrued).`,
          date: rec.dueDate,
          targetPage: 'admin-returns',
          unread: !adminReadNotifIds.includes(`adm-ovd-${rec.id}`),
        });
      } else if (rec.returnDate) {
        items.push({
          id: `adm-ret-${rec.id}`,
          category: 'returned',
          title: `Book Returned: ${book?.title || 'Volume'}`,
          message: `${member?.fullName || 'Member'} returned this volume${
            rec.finePaid > 0 ? ` with ${formatCurrency(rec.finePaid)} fine settled.` : ' on time.'
          }`,
          date: rec.returnDate,
          targetPage: 'admin-borrowings',
          unread: !adminReadNotifIds.includes(`adm-ret-${rec.id}`),
        });
      } else {
        items.push({
          id: `adm-bor-${rec.id}`,
          category: 'borrowed',
          title: `Active Loan: ${book?.title || 'Volume'}`,
          message: `Checked out by ${member?.fullName || 'Member'} · Due ${formatDate(rec.dueDate)}.`,
          date: rec.borrowDate,
          targetPage: 'admin-borrowings',
          unread: !adminReadNotifIds.includes(`adm-bor-${rec.id}`),
        });
      }
    });

    state.books.forEach((b) => {
      const avail = b.availableCopies ?? (b.status === 'Available' ? 1 : 0);
      if (avail <= 1) {
        items.push({
          id: `adm-low-${b.id}`,
          category: 'low-stock',
          title: `Low Availability: ${b.title}`,
          message:
            avail === 0
              ? `All ${b.totalCopies ?? 1} copies are currently checked out.`
              : `Only 1 copy of ${b.totalCopies ?? 1} remaining on shelf ${b.shelf}.`,
          date: getRelativeISODate(0),
          targetPage: 'admin-books',
          unread: !adminReadNotifIds.includes(`adm-low-${b.id}`),
        });
      }
    });

    memberUsers.slice(0, 3).forEach((m) => {
      items.push({
        id: `adm-mem-${m.id}`,
        category: 'member',
        title: `Member Registered: ${m.fullName}`,
        message: `${m.role} (${m.memberId}) joined ${m.department || 'Aurora Library'}.`,
        date: m.joinedDate,
        targetPage: 'admin-members',
        unread: !adminReadNotifIds.includes(`adm-mem-${m.id}`),
      });
    });

    return items;
  }, [state.books, state.users, state.records, memberUsers, adminReadNotifIds]);

  const adminUnreadCount = adminNotifications.filter((n) => n.unread).length;
  const adminAllActiveLoans = useMemo(
    () => state.records.filter((r) => !r.returnDate),
    [state.records]
  );
  const adminOverdueCount = useMemo(
    () => adminAllActiveLoans.filter((r) => evaluateLoanStatus(r).isOverdue).length,
    [adminAllActiveLoans]
  );

  // Auth Handlers
  const handleLogin = ({ email, password }) => {
    const matched = state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!matched) {
      return { ok: false, message: 'Invalid email or password. Please verify your credentials.' };
    }
    if (matched.accountStatus === 'Suspended') {
      return {
        ok: false,
        message: 'Your member account is currently suspended. Please contact a library administrator.',
      };
    }

    setState((prev) => ({ ...prev, currentUserId: matched.id }));
    if (matched.isAdmin) {
      setAdminPage('admin-dashboard');
      setAdminSelectedMemberId(null);
      setAdminLastReturn(null);
    } else {
      setCurrentPage('dashboard');
      setSelectedBookId(null);
      setLastReturnConfirmation(null);
      setDismissedNotifIds([]);
    }
    showToast(`Welcome back, ${matched.fullName}`);
    return { ok: true };
  };

  const handleRegister = ({ fullName, email, password }) => {
    const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { ok: false, message: 'An account with this email already exists.' };
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      password,
      memberId: `AUR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      department: 'General Academic Membership',
      role: 'Library Member',
      isAdmin: false,
      accountStatus: 'Active',
      phone: '',
      joinedDate: getRelativeISODate(0),
      bio: '',
      settings: {
        dueReminders: true,
        overdueAlerts: true,
        newsletter: false,
        defaultCatalogView: 'grid',
      },
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    return { ok: true, user: newUser };
  };

  // Member Portal Handlers
  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'book-details') {
      setSelectedBookId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = (bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage('book-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearchSubmit = (query) => {
    setGlobalSearch(query);
    setCurrentPage('browse');
    setSelectedBookId(null);
  };

  const handleConfirmBorrow = (bookId, borrowDate, dueDate) => {
    if (!currentUser) return { ok: false };
    const book = state.books.find((b) => b.id === bookId);
    const avail = book ? (book.availableCopies ?? (book.status === 'Available' ? 1 : 0)) : 0;
    if (!book || book.status !== 'Available' || avail <= 0) {
      showToast('This book is currently unavailable.', 'error');
      return { ok: false };
    }
    if (activeRecords.length >= MAX_BORROW_LIMIT) {
      showToast('Borrowing limit of 2 books reached.', 'error');
      return { ok: false };
    }

    const newRecord = {
      id: `rec-${Date.now().toString().slice(-5)}`,
      userId: currentUser.id,
      bookId,
      borrowDate,
      dueDate,
      returnDate: null,
      finePaid: 0,
      receiptNo: null,
    };

    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) => {
        if (b.id !== bookId) return b;
        const nextAvail = Math.max(0, (b.availableCopies ?? 1) - 1);
        return {
          ...b,
          availableCopies: nextAvail,
          status: nextAvail > 0 ? 'Available' : 'Borrowed',
          borrowedByUserId: currentUser.id,
        };
      }),
      records: [newRecord, ...prev.records],
    }));

    showToast(`Borrowed "${book.title}". Due ${formatDate(dueDate)}.`);
    return { ok: true, record: newRecord };
  };

  const handleConfirmReturn = (record, { returnDate, finePaid, receiptNo }) => {
    const targetBook = state.books.find((b) => b.id === record.bookId);

    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) => {
        if (b.id !== record.bookId) return b;
        const total = b.totalCopies ?? 1;
        const nextAvail = Math.min(total, (b.availableCopies ?? 0) + 1);
        return {
          ...b,
          availableCopies: nextAvail,
          status: nextAvail > 0 ? 'Available' : 'Borrowed',
          borrowedByUserId: null,
        };
      }),
      records: prev.records.map((r) =>
        r.id === record.id ? { ...r, returnDate, finePaid, receiptNo } : r
      ),
    }));

    setReturnModalRecord(null);
    setLastReturnConfirmation({
      bookTitle: targetBook?.title || 'Book',
      returnDate,
      finePaid,
      receiptNo,
    });
    setCurrentPage('return');
    showToast(
      finePaid > 0
        ? `Returned "${targetBook?.title}" with ${formatCurrency(finePaid)} fine receipt.`
        : `Returned "${targetBook?.title}" on time — No Fine.`
    );
  };

  const handleUpdateProfile = (updates) => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id ? { ...u, ...updates } : u
      ),
    }));
    showToast('Profile and preferences updated.');
  };

  // Admin Handlers
  const handleAdminNavigate = (page) => {
    setAdminPage(page);
    if (page !== 'admin-members' && page !== 'admin-member-details') {
      setAdminSelectedMemberId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminGlobalSearch = (q) => {
    setAdminSearch(q);
    setAdminPage('admin-books');
  };

  const handleAdminAddBook = (bookData) => {
    const newBook = {
      id: `bk-${Date.now().toString().slice(-4)}`,
      ...bookData,
      availableCopies: bookData.totalCopies,
      status: 'Available',
      borrowedByUserId: null,
      featured: false,
      coverMotif: 'nodes',
    };
    setState((prev) => ({
      ...prev,
      books: [newBook, ...prev.books],
    }));
    showToast(`Added "${newBook.title}" to catalog.`);
  };

  const handleAdminEditBook = (bookId, updates) => {
    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) => {
        if (b.id !== bookId) return b;
        const checkedOut = prev.records.filter((r) => r.bookId === bookId && !r.returnDate).length;
        const nextAvail = Math.max(0, updates.totalCopies - checkedOut);
        return {
          ...b,
          ...updates,
          availableCopies: nextAvail,
          status: nextAvail > 0 ? 'Available' : 'Borrowed',
        };
      }),
    }));
    showToast(`Updated "${updates.title}".`);
  };

  const handleAdminDeleteBook = (bookId) => {
    const target = state.books.find((b) => b.id === bookId);
    setState((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== bookId),
    }));
    showToast(`Removed "${target?.title || 'book'}" from catalog.`);
  };

  const handleAdminAddMember = (memberData) => {
    const newMember = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      ...memberData,
      password: 'password123',
      memberId: `AUR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      isAdmin: false,
      joinedDate: getRelativeISODate(0),
      bio: '',
      settings: {
        dueReminders: true,
        overdueAlerts: true,
        newsletter: false,
        defaultCatalogView: 'grid',
      },
    };
    setState((prev) => ({
      ...prev,
      users: [newMember, ...prev.users],
    }));
    showToast(`Registered new member ${newMember.fullName}.`);
  };

  const handleAdminEditMember = (memberId, updates) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === memberId ? { ...u, ...updates } : u)),
    }));
    showToast(`Updated profile for ${updates.fullName}.`);
  };

  const handleAdminToggleMemberStatus = (memberId) => {
    const target = state.users.find((u) => u.id === memberId);
    const nextStatus = target?.accountStatus === 'Suspended' ? 'Active' : 'Suspended';
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === memberId ? { ...u, accountStatus: nextStatus } : u
      ),
    }));
    showToast(`${target?.fullName} is now ${nextStatus}.`);
  };

  const handleAdminDeleteMember = (memberId) => {
    const target = state.users.find((u) => u.id === memberId);
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== memberId),
    }));
    if (adminSelectedMemberId === memberId) setAdminSelectedMemberId(null);
    showToast(`Deleted member account ${target?.fullName || ''}.`);
  };

  const handleAdminConfirmReturn = (record, { returnDate, finePaid, receiptNo }) => {
    const targetBook = state.books.find((b) => b.id === record.bookId);
    const targetMember = state.users.find((u) => u.id === record.userId);

    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) => {
        if (b.id !== record.bookId) return b;
        const total = b.totalCopies ?? 1;
        const nextAvail = Math.min(total, (b.availableCopies ?? 0) + 1);
        return {
          ...b,
          availableCopies: nextAvail,
          status: nextAvail > 0 ? 'Available' : 'Borrowed',
          borrowedByUserId: null,
        };
      }),
      records: prev.records.map((r) =>
        r.id === record.id ? { ...r, returnDate, finePaid, receiptNo } : r
      ),
    }));

    setAdminReturnModalRecord(null);
    setAdminLastReturn({
      bookTitle: targetBook?.title || 'Volume',
      memberName: targetMember?.fullName || 'Member',
      returnDate,
      finePaid,
      receiptNo,
    });
    setAdminPage('admin-returns');
    showToast(
      finePaid > 0
        ? `Processed return for ${targetMember?.fullName} (${formatCurrency(finePaid)} fine receipt).`
        : `Processed on-time return for ${targetMember?.fullName} — No Fine.`
    );
  };

  const handleAdminChangePassword = (newPassword) => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id ? { ...u, password: newPassword } : u
      ),
    }));
    showToast('Administrator password updated.');
  };

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    setState((prev) => ({ ...prev, currentUserId: null }));
    setCurrentPage('dashboard');
    setAdminPage('admin-dashboard');
    setSelectedBookId(null);
    setAdminSelectedMemberId(null);
    setGlobalSearch('');
    setLastReturnConfirmation(null);
    setAdminLastReturn(null);
  };

  const handleResetDemo = () => {
    const fresh = {
      books: INITIAL_BOOKS,
      users: INITIAL_USERS,
      records: INITIAL_BORROW_RECORDS,
      currentUserId: state.currentUserId,
    };
    setState(fresh);
    setLastReturnConfirmation(null);
    setAdminLastReturn(null);
    setDismissedNotifIds([]);
    setAdminReadNotifIds([]);
    showToast('Demo library data restored to initial state.');
  };

  if (!currentUser) {
    return (
      <AuthPages
        users={state.users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  const sharedOverlays = (
    <>
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/45 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in">
            <h3 className="text-lg font-semibold text-[#172A3A]">
              {currentUser.isAdmin ? 'Sign out of Admin Console?' : 'Sign out of Aurora Library?'}
            </h3>
            <p className="mt-1.5 text-xs text-[#7B8794] leading-relaxed">
              Your records and profile changes are saved. You can sign back in anytime.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
              >
                Continue Session
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-modal-in">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-medium ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-[#172A3A] border-[#214C52] text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#69B7B0] shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  /* ===================== ADMIN PORTAL ===================== */
  if (currentUser.isAdmin) {
    const modalBook = adminReturnModalRecord
      ? state.books.find((b) => b.id === adminReturnModalRecord.bookId)
      : null;
    const modalMember = adminReturnModalRecord
      ? state.users.find((u) => u.id === adminReturnModalRecord.userId)
      : null;

    return (
      <>
        <AdminShell
          currentPage={adminSelectedMemberId ? 'admin-member-details' : adminPage}
          onNavigate={handleAdminNavigate}
          adminUser={currentUser}
          overdueCount={adminOverdueCount}
          pendingReturnCount={adminAllActiveLoans.length}
          notifications={adminNotifications}
          unreadNotifCount={adminUnreadCount}
          globalSearch={adminSearch}
          onGlobalSearchSubmit={handleAdminGlobalSearch}
          onMarkAllRead={() => setAdminReadNotifIds(adminNotifications.map((n) => n.id))}
          onLogout={() => setLogoutModalOpen(true)}
          onResetDemo={handleResetDemo}
        >
          {adminPage === 'admin-dashboard' && (
            <AdminDashboardPage
              books={state.books}
              members={memberUsers}
              records={state.records}
              onNavigate={handleAdminNavigate}
              onOpenAddBook={() => {
                setAdminPage('admin-books');
                setAdminAddBookTrigger((c) => c + 1);
              }}
              onOpenAddMember={() => {
                setAdminPage('admin-members');
                setAdminSelectedMemberId(null);
                setAdminAddMemberTrigger((c) => c + 1);
              }}
            />
          )}

          {adminPage === 'admin-books' && (
            <AdminBooksPage
              books={state.books}
              initialSearch={adminSearch}
              openAddTrigger={adminAddBookTrigger}
              onAddBook={handleAdminAddBook}
              onEditBook={handleAdminEditBook}
              onDeleteBook={handleAdminDeleteBook}
            />
          )}

          {adminPage === 'admin-members' && (
            <AdminMembersPage
              members={memberUsers}
              books={state.books}
              records={state.records}
              openAddTrigger={adminAddMemberTrigger}
              selectedMemberId={adminSelectedMemberId}
              onSelectMember={(id) => setAdminSelectedMemberId(id)}
              onAddMember={handleAdminAddMember}
              onEditMember={handleAdminEditMember}
              onToggleMemberStatus={handleAdminToggleMemberStatus}
              onDeleteMember={handleAdminDeleteMember}
              onViewMemberBorrowings={(memberName) => {
                setAdminBorrowingFilterQuery(memberName);
                setAdminSelectedMemberId(null);
                setAdminPage('admin-borrowings');
              }}
            />
          )}

          {adminPage === 'admin-borrowings' && (
            <AdminBorrowingsPage
              records={state.records}
              books={state.books}
              members={memberUsers}
              initialQuery={adminBorrowingFilterQuery}
              onOpenReturnModal={(rec) => setAdminReturnModalRecord(rec)}
            />
          )}

          {adminPage === 'admin-returns' && (
            <AdminReturnsPage
              records={state.records}
              books={state.books}
              members={memberUsers}
              lastReturnConfirmation={adminLastReturn}
              onClearLastReturnConfirmation={() => setAdminLastReturn(null)}
              onOpenReturnModal={(rec) => setAdminReturnModalRecord(rec)}
            />
          )}

          {adminPage === 'admin-reports' && (
            <AdminReportsPage
              books={state.books}
              members={memberUsers}
              records={state.records}
            />
          )}

          {adminPage === 'admin-notifications' && (
            <AdminNotificationsPage
              notifications={adminNotifications}
              unreadCount={adminUnreadCount}
              onMarkRead={(id) =>
                setAdminReadNotifIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
              }
              onMarkAllRead={() =>
                setAdminReadNotifIds(adminNotifications.map((n) => n.id))
              }
              onNavigate={handleAdminNavigate}
            />
          )}

          {adminPage === 'admin-profile' && (
            <AdminProfilePage
              adminUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleAdminChangePassword}
              onLogout={() => setLogoutModalOpen(true)}
            />
          )}
        </AdminShell>

        {adminReturnModalRecord && modalBook && (
          <AdminReturnModal
            record={adminReturnModalRecord}
            book={modalBook}
            member={modalMember}
            onCancel={() => setAdminReturnModalRecord(null)}
            onConfirm={handleAdminConfirmReturn}
          />
        )}

        {sharedOverlays}
      </>
    );
  }

  /* ===================== MEMBER PORTAL ===================== */
  const selectedBook = state.books.find((b) => b.id === selectedBookId) || null;
  const modalBook = returnModalRecord
    ? state.books.find((b) => b.id === returnModalRecord.bookId)
    : null;

  return (
    <>
      <AppShell
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={currentUser}
        activeBorrowCount={activeRecords.length}
        overdueCount={overdueRecords.length}
        notifications={notifications}
        onClearNotifications={() =>
          setDismissedNotifIds((prev) => [
            ...prev,
            ...notifications.map((n) => n.id),
          ])
        }
        globalSearch={globalSearch}
        onGlobalSearchSubmit={handleGlobalSearchSubmit}
        onLogout={() => setLogoutModalOpen(true)}
        onResetDemo={handleResetDemo}
      >
        {currentPage === 'dashboard' && (
          <DashboardPage
            user={currentUser}
            books={state.books}
            userRecords={userRecords}
            onNavigate={handleNavigate}
            onSelectBook={handleSelectBook}
            onOpenReturnModal={(rec) => setReturnModalRecord(rec)}
          />
        )}

        {currentPage === 'browse' && (
          <BrowseBooksPage
            books={state.books}
            initialQuery={globalSearch}
            defaultView={currentUser.settings?.defaultCatalogView || 'grid'}
            onSelectBook={handleSelectBook}
            onClearGlobalSearch={() => setGlobalSearch('')}
          />
        )}

        {currentPage === 'book-details' && (
          <BookDetailsPage
            book={selectedBook}
            userId={currentUser.id}
            activeBorrowCount={activeRecords.length}
            onBackToCatalog={() => handleNavigate('browse')}
            onConfirmBorrow={handleConfirmBorrow}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'history' && (
          <BorrowingHistoryPage
            books={state.books}
            userRecords={userRecords}
            onNavigate={handleNavigate}
            onSelectBook={handleSelectBook}
            onOpenReturnModal={(rec) => setReturnModalRecord(rec)}
          />
        )}

        {currentPage === 'return' && (
          <ReturnBookPage
            books={state.books}
            userRecords={userRecords}
            lastReturnConfirmation={lastReturnConfirmation}
            onClearLastReturnConfirmation={() => setLastReturnConfirmation(null)}
            onOpenReturnModal={(rec) => setReturnModalRecord(rec)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            user={currentUser}
            activeBorrowCount={activeRecords.length}
            totalReturnedCount={returnedRecords.length}
            onUpdateProfile={handleUpdateProfile}
            onLogout={() => setLogoutModalOpen(true)}
          />
        )}
      </AppShell>

      {returnModalRecord && modalBook && (
        <ReturnConfirmationModal
          record={returnModalRecord}
          book={modalBook}
          onCancel={() => setReturnModalRecord(null)}
          onConfirm={handleConfirmReturn}
        />
      )}

      {sharedOverlays}
    </>
  );
}
