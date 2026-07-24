import { useState } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';

import { loginParent } from '../lib/api';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] =
    useState(false);

  const submitLogin = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError(
        'Enter the parent email and password.',
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await loginParent(
        cleanEmail,
        password,
      );

      localStorage.setItem(
        'sasa-parent-token',
        result.token,
      );

      localStorage.setItem(
        'sasa-parent-name',
        result.user.display_name,
      );

      onSuccess(
        result.token,
        result.user.display_name,
      );
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Parent login failed.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="parent-login-page">
      <section className="parent-login-card">
        <div className="parent-login-icon">
          <LockKeyhole size={36} />
        </div>

        <h1>Parent Login</h1>

        <p>
          Sign in using your SARA Tube parent
          account.
        </p>

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
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={password}
              autoComplete="current-password"
              placeholder="Enter password"
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitLogin();
                }
              }}
            />

            <button
              type="button"
              className="parent-login-password-toggle"
              onClick={() =>
                setShowPassword(
                  (current) => !current,
                )
              }
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </label>

        {error && (
          <div className="parent-login-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="parent-login-submit"
          disabled={loading}
          onClick={submitLogin}
        >
          {loading
            ? 'Signing in...'
            : 'Sign In'}
        </button>

        <div className="parent-login-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="parent-login-guest"
          disabled={loading}
          onClick={onGuest}
        >
          Continue as Guest
        </button>

        <small>
          Guest mode opens the original SASA kids
          profiles and videos. Create an account later
          to save profiles and settings.
        </small>
      </section>
    </main>
  );
}
