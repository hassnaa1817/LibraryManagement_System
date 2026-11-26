import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Save,
  Bell,
  Sliders,
} from 'lucide-react';
import { MAX_BORROW_LIMIT, formatDate, getInitials } from '../utils/libraryHelpers';

export default function ProfilePage({
  user,
  activeBorrowCount,
  totalReturnedCount,
  onUpdateProfile,
  onLogout,
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [department, setDepartment] = useState(user.department || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [settings, setSettings] = useState(
    user.settings || {
      dueReminders: true,
      overdueAlerts: true,
      newsletter: false,
      defaultCatalogView: 'grid',
    }
  );

  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    onUpdateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      department: department.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      settings,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Manage your member details, notification preferences, and account settings.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-2 self-start cursor-pointer transition"
        >
          <LogOut className="w-4 h-4" />
          Logout of Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Member Identity Card */}
        <aside className="space-y-5">
          <div className="card-elevated rounded-2xl overflow-hidden">
            <div className="aurora-hero h-24 relative" />
            <div className="px-6 pb-6 -mt-10 relative">
              <div className="w-20 h-20 rounded-2xl aurora-auth-panel border-4 border-white text-white text-2xl font-semibold flex items-center justify-center shadow-md">
                {getInitials(user.fullName)}
              </div>

              <h2 className="mt-3 text-lg font-semibold text-[#172A3A]">{user.fullName}</h2>
              <p className="text-xs text-[#7B8794]">{user.role || 'Library Member'}</p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D9F0E9] text-[#214C52] text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Member · Good Standing
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7B8794]">Member ID</span>
                  <span className="font-mono font-semibold text-[#172A3A]">{user.memberId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B8794]">Member Since</span>
                  <span className="font-medium text-[#263442]">{formatDate(user.joinedDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B8794]">Current Loans</span>
                  <span className="font-mono font-semibold text-[#214C52]">
                    {activeBorrowCount} / {MAX_BORROW_LIMIT}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B8794]">Completed Returns</span>
                  <span className="font-semibold text-[#172A3A]">{totalReturnedCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated rounded-2xl p-5 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-[#172A3A] font-semibold">
              <Calendar className="w-4 h-4 text-[#69B7B0]" />
              Borrowing Policy Summary
            </div>
            <p className="text-[#7B8794] leading-relaxed">
              Members may borrow up to <strong>2 books</strong> simultaneously for a <strong>14-day</strong> loan period. Late returns accrue $1.50/day.
            </p>
          </div>
        </aside>

        {/* Right Edit Profile & Account Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="card-elevated rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-[#172A3A]">Member Information</h3>
                <p className="text-xs text-[#7B8794] mt-0.5">
                  Update your contact and academic profile details.
                </p>
              </div>
              {savedNotice && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9F0E9] text-[#214C52] text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Changes Saved
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7B8794] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7B8794] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Department / Faculty
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#7B8794] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., School of Computing"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7B8794] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                Academic Bio / Research Interests
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your field of study or reading interests..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
              />
            </div>

            {/* Account Settings */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#172A3A]">
                <Sliders className="w-4 h-4 text-[#214C52]" />
                Account & Notification Settings
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-[#69B7B0] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#172A3A]">
                        Due Date Email Reminders
                      </p>
                      <p className="text-[11px] text-[#7B8794]">
                        Receive a gentle reminder 2 days before a borrowed book is due.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dueReminders}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, dueReminders: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#214C52] focus:ring-[#69B7B0]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-[#8E8ACB] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#172A3A]">
                        Overdue & Fine Alerts
                      </p>
                      <p className="text-[11px] text-[#7B8794]">
                        Notify immediately if a loan passes its scheduled due date.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.overdueAlerts}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, overdueAlerts: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#214C52] focus:ring-[#69B7B0]"
                  />
                </label>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70">
                  <div>
                    <p className="text-xs font-semibold text-[#172A3A]">
                      Default Catalog Layout
                    </p>
                    <p className="text-[11px] text-[#7B8794]">
                      Preferred view when opening Browse Books.
                    </p>
                  </div>
                  <select
                    value={settings.defaultCatalogView}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, defaultCatalogView: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-[#172A3A]"
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Profile & Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
