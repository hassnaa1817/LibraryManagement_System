import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  BookCopy,
  Users,
  ClipboardList,
  RotateCcw,
  BarChart3,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  BookOpen,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { getInitials } from '../../utils/libraryHelpers';

const ADMIN_NAV_ITEMS = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'admin-books', label: 'Book Management', icon: BookCopy },
  { id: 'admin-members', label: 'Member Management', icon: Users },
  { id: 'admin-borrowings', label: 'Borrowing Management', icon: ClipboardList },
  { id: 'admin-returns', label: 'Return Management', icon: RotateCcw },
  { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
  { id: 'admin-profile', label: 'Profile / Settings', icon: Settings },
];

const PAGE_LABELS = {
  'admin-dashboard': 'Dashboard',
  'admin-books': 'Book Management',
  'admin-members': 'Member Management',
  'admin-member-details': 'Member Details',
  'admin-borrowings': 'Borrowing Management',
  'admin-returns': 'Return Management',
  'admin-reports': 'Reports & Analytics',
  'admin-notifications': 'Notification Center',
  'admin-profile': 'Profile & Settings',
};

export default function AdminShell({
  currentPage,
  onNavigate,
  adminUser,
  overdueCount,
  pendingReturnCount,
  notifications,
  unreadNotifCount,
  globalSearch,
  onGlobalSearchSubmit,
  onMarkAllRead,
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
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isNavActive = (id) => {
    if (id === 'admin-members' && currentPage === 'admin-member-details') return true;
    return currentPage === id;
  };

  const handleSearchForm = (e) => {
    e.preventDefault();
    onGlobalSearchSubmit(searchText);
  };

  const pageTitle = PAGE_LABELS[currentPage] || 'Admin Dashboard';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-slate-100">
        <button
          type="button"
          onClick={() => {
            onNavigate('admin-dashboard');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl aurora-hero flex items-center justify-center shadow-xs">
            <BookOpen className="w-4.5 h-4.5 text-[#D9F0E9]" />
          </div>
          <div>
            <div className="font-semibold text-[#172A3A] text-sm tracking-tight">Aurora Library</div>
            <div className="text-[11px] font-medium text-[#214C52]">Admin Console</div>
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
      <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
          Administration
        </p>
        {ADMIN_NAV_ITEMS.map((item) => {
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
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#214C52]' : 'text-[#7B8794]'}`} />
                {item.label}
              </span>
              {item.id === 'admin-returns' && pendingReturnCount > 0 && (
                <span
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                    overdueCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#D9F0E9] text-[#214C52]'
                  }`}
                >
                  {pendingReturnCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Subtle Circulation Status Card & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70">
          <div className="flex items-center justify-between text-xs font-semibold text-[#172A3A]">
            <span>Circulation Desk</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                overdueCount > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-[#D9F0E9] text-[#214C52]'
              }`}
            >
              {overdueCount > 0 ? `${overdueCount} overdue` : 'Healthy'}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#7B8794] leading-snug">
            {pendingReturnCount} active {pendingReturnCount === 1 ? 'loan' : 'loans'} currently in circulation.
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
      <aside className="hidden lg:block w-68 shrink-0 bg-white border-r border-slate-200/75 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
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
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-[#263442] hover:bg-slate-50 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#7B8794] truncate">
              <button
                type="button"
                onClick={() => onNavigate('admin-dashboard')}
                className="hover:text-[#172A3A] font-medium cursor-pointer"
              >
                Aurora Admin
              </button>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold text-[#172A3A] truncate">{pageTitle}</span>
            </div>
            <span className="sm:hidden font-semibold text-sm text-[#172A3A] truncate">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-2xl">
            <form onSubmit={handleSearchForm} className="relative hidden md:block flex-1 max-w-xs">
              <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search catalog, ISBN, member..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-[#263442] placeholder:text-[#7B8794] focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70 transition"
              />
            </form>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                className="relative p-2.5 rounded-xl bg-white border border-slate-200/80 text-[#263442] hover:border-[#69B7B0] transition cursor-pointer"
                aria-label="Admin Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#214C52] text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-40 overflow-hidden animate-modal-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#172A3A]">
                      Admin Notifications
                    </span>
                    <div className="flex items-center gap-3">
                      {unreadNotifCount > 0 && (
                        <button
                          type="button"
                          onClick={onMarkAllRead}
                          className="text-xs text-[#214C52] hover:underline cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifOpen(false);
                          if (n.targetPage) onNavigate(n.targetPage);
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-[#F7F8FA] cursor-pointer ${
                          n.unread ? 'bg-[#D9F0E9]/15' : ''
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            n.category === 'overdue' || n.category === 'low-stock'
                              ? 'bg-amber-50 text-amber-600'
                              : n.category === 'returned'
                              ? 'bg-[#D9F0E9] text-[#214C52]'
                              : n.category === 'member'
                              ? 'bg-[#B9B5E8]/30 text-[#172A3A]'
                              : 'bg-slate-100 text-[#214C52]'
                          }`}
                        >
                          {n.category === 'overdue' || n.category === 'low-stock' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : n.category === 'returned' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : n.category === 'member' ? (
                            <UserPlus className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[#172A3A] truncate">
                              {n.title}
                            </p>
                            {n.unread && (
                              <span className="w-2 h-2 rounded-full bg-[#69B7B0] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#7B8794] mt-0.5 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigate('admin-notifications');
                    }}
                    className="w-full px-4 py-2.5 bg-[#F7F8FA] border-t border-slate-100 text-xs font-semibold text-[#214C52] hover:bg-[#D9F0E9]/40 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Notification Center
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Admin Profile Menu */}
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
                  {getInitials(adminUser.fullName)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-[#172A3A] leading-tight max-w-[130px] truncate">
                    {adminUser.fullName}
                  </div>
                  <div className="text-[11px] text-[#214C52] font-medium leading-tight">
                    Administrator
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#7B8794]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-40 py-2 animate-modal-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-[#172A3A] truncate">
                      {adminUser.fullName}
                    </p>
                    <p className="text-xs text-[#7B8794] truncate">{adminUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('admin-profile');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#263442] hover:bg-[#F7F8FA] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#7B8794]" />
                    Profile & Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('admin-notifications');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#263442] hover:bg-[#F7F8FA] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#7B8794]" />
                    Notification Center
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
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
