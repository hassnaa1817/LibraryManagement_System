import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Bell,
  Save,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { formatDate, getInitials } from '../../utils/libraryHelpers';

export default function AdminProfilePage({
  adminUser,
  onUpdateProfile,
  onChangePassword,
  onLogout,
}) {
  const [fullName, setFullName] = useState(adminUser.fullName);
  const [email, setEmail] = useState(adminUser.email);
  const [department, setDepartment] = useState(adminUser.department || '');
  const [phone, setPhone] = useState(adminUser.phone || '');
  const [bio, setBio] = useState(adminUser.bio || '');
  const [settings, setSettings] = useState(
    adminUser.settings || {
      dueReminders: true,
      overdueAlerts: true,
      lowStockAlerts: true,
      dailyDigest: true,
    }
  );

  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileError('');
    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileError('Administrator name must be at least 2 characters.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setProfileError('Please provide a valid email address.');
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
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);

    if (currentPassword !== adminUser.password) {
      setPwdError('Current password is incorrect.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    onChangePassword(newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwdSuccess(true);
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Administrator Profile & Settings
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Manage administrator identity, security credentials, and circulation alert rules.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-2 self-start cursor-pointer transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Identity Card */}
        <aside className="space-y-5">
          <div className="card-elevated rounded-2xl overflow-hidden">
            <div className="aurora-hero h-24" />
            <div className="px-6 pb-6 -mt-10 relative">
              <div className="w-20 h-20 rounded-2xl aurora-auth-panel border-4 border-white text-white text-2xl font-semibold flex items-center justify-center shadow-md">
                {getInitials(adminUser.fullName)}
              </div>

              <h2 className="mt-3 text-lg font-semibold text-[#172A3A]">{adminUser.fullName}</h2>
              <p className="text-xs font-medium text-[#214C52]">Role: Administrator</p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D9F0E9] text-[#214C52] text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Full Administrative Access
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7B8794]">Staff ID</span>
                  <span className="font-mono font-semibold text-[#172A3A]">
                    {adminUser.memberId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B8794]">Appointed</span>
                  <span className="font-medium text-[#263442]">
                    {formatDate(adminUser.joinedDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7B8794]">Email</span>
                  <span className="font-medium text-[#263442] truncate max-w-[160px]">
                    {adminUser.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile & Notification Settings */}
          <form onSubmit={handleSaveProfile} className="card-elevated rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-[#172A3A]">
                  Profile & Alert Preferences
                </h3>
                <p className="text-xs text-[#7B8794] mt-0.5">
                  Update administrator contact information and notification triggers.
                </p>
              </div>
              {profileSaved && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9F0E9] text-[#214C52] text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {profileError}
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Department / Office
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#7B8794] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Direct Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7B8794] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                Administrative Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
              />
            </div>

            {/* Settings Toggles */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <p className="text-xs font-semibold text-[#172A3A] flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-[#214C52]" />
                Admin Notification Settings
              </p>

              {[
                {
                  key: 'overdueAlerts',
                  title: 'Overdue Circulation Alerts',
                  desc: 'Highlight overdue loans and pending fines in the notification center.',
                },
                {
                  key: 'lowStockAlerts',
                  title: 'Low Book Availability Alerts',
                  desc: 'Alert when catalog titles drop to 1 or 0 available copies.',
                },
                {
                  key: 'dailyDigest',
                  title: 'Daily Circulation Digest',
                  desc: 'Compile daily borrow, return, and new member registration summaries.',
                },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/70 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#172A3A]">{opt.title}</p>
                    <p className="text-[11px] text-[#7B8794]">{opt.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[opt.key])}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#214C52]"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Profile & Settings
              </button>
            </div>
          </form>

          {/* Change Password Card */}
          <form onSubmit={handlePasswordSubmit} className="card-elevated rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-[#214C52]" />
                <div>
                  <h3 className="text-base font-semibold text-[#172A3A]">Change Password</h3>
                  <p className="text-xs text-[#7B8794]">
                    Update your administrator sign-in credentials.
                  </p>
                </div>
              </div>
              {pwdSuccess && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9F0E9] text-[#214C52] text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Password Updated
                </span>
              )}
            </div>

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pwdError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#263442] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#69B7B0] text-[#172A3A] text-xs font-semibold cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
