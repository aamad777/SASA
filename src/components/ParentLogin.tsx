import { useState } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

import { loginParent, registerParent } from '../lib/api';

type ParentLoginProps = {
  onSuccess: (
    token: string,
    parentName: string,
  ) => void;
  onGuest: () => void;
};

export default function ParentLogin({
  onSuccess,
  onGuest,
}: ParentLoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (mode === 'register' && !cleanName) {
      setError('Please enter your parent name.');
      return;
    }

    if (!cleanEmail || !password) {
      setError('Enter your parent email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'register') {
        result = await registerParent(cleanName, cleanEmail, password);
      } else {
        result = await loginParent(cleanEmail, password);
      }

      localStorage.setItem('sasa-parent-token', result.token);
      localStorage.setItem('sasa-parent-name', result.user.display_name);

      onSuccess(result.token, result.user.display_name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === 'register'
          ? 'Parent registration failed.'
          : 'Parent login failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="parent-login-page">
      <section className="parent-login-card max-w-md w-full">
        <div className="parent-login-icon bg-purple-100 text-purple-700 p-3 rounded-full inline-flex">
          <ShieldCheck size={36} />
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl my-4 w-full border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
              mode === 'login'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={14} />
            <span>Register Parent</span>
          </button>
        </div>

        <h1 className="text-xl font-black text-slate-800">
          {mode === 'register' ? 'Register Parent Account' : 'Parent Login'}
        </h1>

        <p className="text-xs text-slate-500 mb-4">
          {mode === 'register'
            ? "Create a parent account to set up and manage your kids' custom profiles."
            : 'Sign in using your SARA Tube parent account.'}
        </p>

        {mode === 'register' && (
          <label className="parent-login-field">
            <span>Parent Name</span>
            <div>
              <User size={20} />
              <input
                type="text"
                value={name}
                autoComplete="name"
                placeholder="e.g. Sarah Connor"
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
              />
            </div>
          </label>
        )}

        <label className="parent-login-field">
          <span>Email address</span>
          <div>
            <Mail size={20} />
            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder="parent@example.com"
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
            />
          </div>
        </label>

        <label className="parent-login-field">
          <span>Password</span>
          <div>
            <LockKeyhole size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              placeholder="Enter password"
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />

            <button
              type="button"
              className="parent-login-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </label>

        {error && <div className="parent-login-error">{error}</div>}

        <button
          type="button"
          className="parent-login-submit cursor-pointer"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? mode === 'register'
              ? 'Creating Parent Account...'
              : 'Signing in...'
            : mode === 'register'
            ? 'Create Parent Account'
            : 'Sign In'}
        </button>

        <div className="parent-login-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="parent-login-guest cursor-pointer"
          disabled={loading}
          onClick={onGuest}
        >
          Continue as Guest
        </button>

        <small className="text-[11px] text-slate-400 mt-3 block">
          Guest mode lets kids jump straight into watching safe videos without an account. Registering a parent account enables multi-profile setup and time limits.
        </small>
      </section>
    </main>
  );
}

