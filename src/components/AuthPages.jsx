import React, { useState } from 'react';
import {
  BookOpen,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

function AuroraLibraryIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto my-6">
      <svg viewBox="0 0 420 260" className="w-full h-auto drop-shadow-lg" fill="none">
        {/* Soft aurora glow rings */}
        <circle cx="210" cy="128" r="108" fill="url(#auroraGlow)" fillOpacity="0.35" />
        <circle cx="210" cy="128" r="88" stroke="#69B7B0" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="5 5" />

        {/* Minimal architectural shelf base */}
        <rect x="78" y="196" width="264" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.2" />

        {/* Stack / row of academic books */}
        <rect x="104" y="92" width="32" height="104" rx="5" fill="#69B7B0" fillOpacity="0.82" />
        <rect x="112" y="106" width="16" height="3" rx="1.5" fill="#172A3A" fillOpacity="0.45" />
        <rect x="112" y="114" width="10" height="3" rx="1.5" fill="#172A3A" fillOpacity="0.45" />

        <rect x="142" y="74" width="36" height="122" rx="5" fill="#D9F0E9" fillOpacity="0.92" />
        <rect x="150" y="92" width="20" height="4" rx="2" fill="#214C52" fillOpacity="0.65" />
        <rect x="150" y="170" width="20" height="8" rx="2" fill="#69B7B0" fillOpacity="0.6" />

        <rect x="184" y="102" width="30" height="94" rx="5" fill="#8E8ACB" fillOpacity="0.88" />
        <rect x="191" y="118" width="16" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.55" />

        {/* Tilted book */}
        <g transform="rotate(-11 236 146)">
          <rect x="220" y="88" width="34" height="108" rx="5" fill="#B9B5E8" fillOpacity="0.9" />
          <rect x="228" y="104" width="18" height="3" rx="1.5" fill="#172A3A" fillOpacity="0.45" />
          <circle cx="237" cy="145" r="7" stroke="#172A3A" strokeOpacity="0.35" strokeWidth="2" />
        </g>

        {/* Floating open book emblem */}
        <g transform="translate(268, 96)">
          <rect x="0" y="18" width="54" height="82" rx="6" fill="#FFFFFF" fillOpacity="0.14" stroke="#FFFFFF" strokeOpacity="0.28" />
          <path d="M12 38 H42 M12 49 H38 M12 60 H34" stroke="#D9F0E9" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="27" cy="80" r="7" fill="#69B7B0" fillOpacity="0.85" />
        </g>

        <defs>
          <radialGradient id="auroraGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(210 128) rotate(90) scale(108)">
            <stop stopColor="#69B7B0" />
            <stop offset="0.55" stopColor="#8E8ACB" stopOpacity="0.45" />
            <stop offset="1" stopColor="#172A3A" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function AuthPages({
  initialMode = 'login',
  users,
  onLogin,
  onRegister,
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('elena.vance@aurora.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setFieldErrors({});
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errs = {};
    if (!email.trim()) errs.email = 'Please enter your university or member email.';
    if (!password) errs.password = 'Please enter your password.';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setTimeout(() => {
      const result = onLogin({ email: email.trim(), password, rememberMe });
      setIsLoading(false);
      if (!result.ok) {
        setErrorMsg(result.message);
      }
    }, 450);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errs = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      errs.regEmail = 'Please enter a valid email address.';
    } else if (users.some((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      errs.regEmail = 'An account with this email already exists.';
    }
    if (regPassword.length < 6) {
      errs.regPassword = 'Password must be at least 6 characters long.';
    }
    if (confirmPassword !== regPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setTimeout(() => {
      const created = onRegister({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      setIsLoading(false);
      if (created.ok) {
        setRegisterSuccess(true);
        setEmail(regEmail.trim());
        setPassword('');
        setFullName('');
        setRegEmail('');
        setRegPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setMode('login');
        }, 1200);
      } else {
        setErrorMsg(created.message);
      }
    }, 550);
  };

  const quickFillAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMsg('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F8FA]">
      {/* Left Aurora Branding & Illustration Panel */}
      <div className="aurora-auth-panel lg:w-[46%] xl:w-[48%] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#69B7B0]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#8E8ACB]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#D9F0E9]" />
          </div>
          <div>
            <span className="font-semibold tracking-tight text-lg text-white">Aurora Library</span>
            <p className="text-xs text-[#D9F0E9]/80">Academic Member Portal</p>
          </div>
        </div>

        <div className="relative z-10 my-8 lg:my-0">
          <AuroraLibraryIllustration />
          <div className="max-w-md mx-auto text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-subtle text-xs text-[#D9F0E9] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#69B7B0]" />
              Quiet, focused scholarly access
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-white">
              Your gateway to curated academic collections.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 leading-relaxed">
              Browse curated monographs, reserve and borrow up to two active volumes, track due dates, and manage returns effortlessly.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/60 border-t border-white/10 pt-5">
          <span>Aurora University Library System</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#69B7B0]" />
            Verified Member Access
          </span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          {/* Mode Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200/80 shadow-xs mb-7">
            <button
              type="button"
              onClick={() => {
                setRegisterSuccess(false);
                switchMode('login');
              }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#172A3A] text-white shadow-xs'
                  : 'text-[#7B8794] hover:text-[#263442]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterSuccess(false);
                switchMode('register');
              }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#172A3A] text-white shadow-xs'
                  : 'text-[#7B8794] hover:text-[#263442]'
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === 'login' ? (
            <div className="card-elevated rounded-2xl p-7 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#172A3A] tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-[#7B8794]">
                  Sign in to access your library dashboard and active loans.
                </p>
              </div>

              {registerSuccess && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#D9F0E9]/70 border border-[#69B7B0]/40 flex items-start gap-2.5 text-sm text-[#214C52]">
                  <CheckCircle2 className="w-5 h-5 text-[#214C52] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Account created successfully</p>
                    <p className="text-xs text-[#214C52]/85 mt-0.5">
                      Please sign in with your new credentials to open the Dashboard.
                    </p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-sm text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-[#263442] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@aurora.edu"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition ${
                      fieldErrors.email
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#69B7B0] focus:ring-[#D9F0E9]'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-[#263442]">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full pl-3.5 pr-11 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition ${
                        fieldErrors.password
                          ? 'border-rose-300 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-[#69B7B0] focus:ring-[#D9F0E9]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B8794] hover:text-[#263442] p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 text-sm text-[#263442] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#214C52] focus:ring-[#69B7B0]"
                    />
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Login to Library
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-[#7B8794]">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-[#214C52] hover:text-[#172A3A] underline underline-offset-4 cursor-pointer"
                >
                  Register
                </button>
              </p>

              {/* Presentation Demo Accounts */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B8794] mb-2.5">
                  Demo Presets (Password: password123)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => quickFillAccount('elena.vance@aurora.edu')}
                    className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      email === 'elena.vance@aurora.edu'
                        ? 'border-[#69B7B0] bg-[#D9F0E9]/35'
                        : 'border-slate-200 hover:border-slate-300 bg-[#F7F8FA]'
                    }`}
                  >
                    <div className="font-semibold text-[#172A3A]">Elena Vance</div>
                    <div className="text-[#7B8794] text-[11px] mt-0.5">Member · 2/2 loans</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFillAccount('marcus.chen@aurora.edu')}
                    className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      email === 'marcus.chen@aurora.edu'
                        ? 'border-[#69B7B0] bg-[#D9F0E9]/35'
                        : 'border-slate-200 hover:border-slate-300 bg-[#F7F8FA]'
                    }`}
                  >
                    <div className="font-semibold text-[#172A3A]">Marcus Chen</div>
                    <div className="text-[#7B8794] text-[11px] mt-0.5">Member · 0/2 loans</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFillAccount('admin@aurora.edu')}
                    className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      email === 'admin@aurora.edu'
                        ? 'border-[#8E8ACB] bg-[#B9B5E8]/25'
                        : 'border-slate-200 hover:border-slate-300 bg-[#F7F8FA]'
                    }`}
                  >
                    <div className="font-semibold text-[#172A3A]">Admin Portal</div>
                    <div className="text-[#7B8794] text-[11px] mt-0.5">Administrator</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-elevated rounded-2xl p-7 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#172A3A] tracking-tight">
                  Member Registration
                </h2>
                <p className="mt-1 text-sm text-[#7B8794]">
                  Create your library account to start borrowing volumes.
                </p>
              </div>

              {registerSuccess && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#D9F0E9]/80 border border-[#69B7B0]/40 flex items-start gap-2.5 text-sm text-[#214C52]">
                  <CheckCircle2 className="w-5 h-5 text-[#214C52] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Account Created!</p>
                    <p className="text-xs mt-0.5">Redirecting you to the Login page...</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-sm text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-[#263442] mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Clara Lindqvist"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition ${
                      fieldErrors.fullName
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#69B7B0] focus:ring-[#D9F0E9]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#263442] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="clara.lindqvist@aurora.edu"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition ${
                      fieldErrors.regEmail
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#69B7B0] focus:ring-[#D9F0E9]'
                    }`}
                  />
                  {fieldErrors.regEmail && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.regEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#263442] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`w-full pl-3.5 pr-11 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition ${
                        fieldErrors.regPassword
                          ? 'border-rose-300 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-[#69B7B0] focus:ring-[#D9F0E9]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B8794] hover:text-[#263442] p-1 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.regPassword && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.regPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#263442] mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#69B7B0] focus:ring-[#D9F0E9]'
                    }`}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || registerSuccess}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Register Member Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-[#7B8794]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#214C52] hover:text-[#172A3A] underline underline-offset-4 cursor-pointer"
                >
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
