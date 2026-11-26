import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Library,
  History,
  RotateCcw,
  UserCircle,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  BookOpen,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { MAX_BORROW_LIMIT, getInitials } from '../utils/libraryHelpers';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'browse', label: 'Browse Books', icon: Library },
  { id: 'history', label: 'Borrowing History', icon: History },
  { id: 'return', label: 'Return Book', icon: RotateCcw },
  { id: 'profile', label: 'My Profile', icon: UserCircle },
];

export default function AppShell({
  currentPage,
  onNavigate,
  user,
  activeBorrowCount,
  overdueCount,
  notifications,
  onClearNotifications,
  globalSearch,
  onGlobalSearchSubmit,
  onLogout,
  onResetDemo,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState(globalSearch || '');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setSearchText(globalSearch || '');
  }, [globalSearch]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchForm = (e) => {
    e.preventDefault();
    onGlobalSearchSubmit(searchText);
  };

  const quotaPct = Math.min(100, (activeBorrowCount / MAX_BORROW_LIMIT) * 100);
  const isAtLimit = activeBorrowCount >= MAX_BORROW_LIMIT;

  const isNavActive = (id) => {
    if (id === 'browse' && currentPage === 'book-details') return true;
    return currentPage === id;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-slate-100">
        <button
          type="button"
          onClick={() => {
            onNavigate('dashboard');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl aurora-hero flex items-center justify-center shadow-xs">
            <BookOpen className="w-4.5 h-4.5 text-[#D9F0E9]" />
          </div>
          <div>
            <div className="font-semibold text-[#172A3A] text-sm tracking-tight">Aurora Library</div>
            <div className="text-[11px] text-[#7B8794]">Member Workspace</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto" aria-label="Primary Navigation">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
          Library Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                active
                  ? 'aurora-nav-active text-[#172A3A] border border-[#69B7B0]/35 shadow-2xs'
                  : 'text-[#263442]/80 hover:bg-slate-100/80 hover:text-[#172A3A] border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 ${
                    active ? 'text-[#214C52]' : 'text-[#7B8794]'
                  }`}
                />
                {item.label}
              </span>
              {item.id === 'return' && activeBorrowCount > 0 && (
                <span
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                    overdueCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#D9F0E9] text-[#214C52]'
                  }`}
                >
                  {activeBorrowCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Borrowing Quota Card */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div
          className={`p-3.5 rounded-xl border ${
            isAtLimit
              ? 'bg-[#B9B5E8]/15 border-[#8E8ACB]/35'
              : 'bg-[#F7F8FA] border-slate-200/70'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#172A3A]">
            <span>Borrowing Limit</span>
            <span className="font-mono text-[#214C52]">
              {activeBorrowCount} / {MAX_BORROW_LIMIT}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
            <div
              className="h-full rounded-full aurora-progress transition-all duration-300"
              style={{ width: `${quotaPct}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#7B8794] leading-snug">
            {isAtLimit
              ? 'Limit reached. Return a book to borrow another.'
              : `${MAX_BORROW_LIMIT - activeBorrowCount} borrowing ${
                  MAX_BORROW_LIMIT - activeBorrowCount === 1 ? 'slot' : 'slots'
                } available.`}
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#7B8794] hover:text-rose-700 hover:bg-rose-50/70 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-[#263442]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-66 shrink-0 bg-white border-r border-slate-200/75 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#172A3A]/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 glass-light border-b border-slate-200/75 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-[#263442] hover:bg-slate-50 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearchForm} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search books, authors, ISBN..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200/90 text-sm text-[#263442] placeholder:text-[#7B8794] focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70 transition"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                className="relative p-2.5 rounded-xl bg-white border border-slate-200/80 text-[#263442] hover:border-[#69B7B0] transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#69B7B0] ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-40 overflow-hidden animate-modal-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#172A3A]">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={onClearNotifications}
                        className="text-xs text-[#214C52] hover:underline cursor-pointer"
                      >
                        Clear read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-[#7B8794]">
                        You’re all caught up. No new library notices.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3.5 flex items-start gap-3 hover:bg-[#F7F8FA]/70">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              n.type === 'warning'
                                ? 'bg-amber-50 text-amber-600'
                                : n.type === 'success'
                                ? 'bg-[#D9F0E9] text-[#214C52]'
                                : 'bg-[#B9B5E8]/25 text-[#172A3A]'
                            }`}
                          >
                            {n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : n.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#172A3A]">{n.title}</p>
                            <p className="text-xs text-[#7B8794] mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:border-[#69B7B0] transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg aurora-hero text-white text-xs font-semibold flex items-center justify-center">
                  {getInitials(user.fullName)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-[#172A3A] leading-tight max-w-[130px] truncate">
                    {user.fullName}
                  </div>
                  <div className="text-[11px] text-[#7B8794] leading-tight">
                    {user.memberId}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#7B8794]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-40 py-2 animate-modal-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-[#172A3A] truncate">{user.fullName}</p>
                    <p className="text-xs text-[#7B8794] truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#263442] hover:bg-[#F7F8FA] flex items-center gap-2.5 cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-[#7B8794]" />
                    My Profile & Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onResetDemo();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#263442] hover:bg-[#F7F8FA] flex items-center gap-2.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-[#7B8794]" />
                    Reset Demo Data
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Direct Logout button on desktop top bar */}
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-medium text-[#263442] hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50/50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
