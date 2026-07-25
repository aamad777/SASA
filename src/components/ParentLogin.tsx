import { useState } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';

import {
  loginParent,
  signupParent,
} from '../lib/api';

type ParentLoginProps = {
  onSuccess: (
    token: string,
    parentName: string,
  ) => void;
  onGuest: () => void;
};

type AccountMode = 'login' | 'signup';

export default function ParentLogin({
  onSuccess,
  onGuest,
}: ParentLoginProps) {
  const [mode, setMode] =
    useState<AccountMode>('login');

  const [displayName, setDisplayName] =
    useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] =
    useState(false);

  const clearMessages = () => {
    setError('');
  };

  const completeLogin = async (
    cleanEmail: string,
    accountPassword: string,
  ) => {
    const result = await loginParent(
      cleanEmail,
      accountPassword,
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
  };

  const submit = async () => {
    const cleanEmail = email.trim();
    const cleanName = displayName.trim();

    if (!cleanEmail || !password) {
      setError(
        'Enter your email address and password.',
      );
      return;
    }

    if (mode === 'signup') {
      if (!cleanName) {
        setError('Enter the parent name.');
        return;
      }

      if (password.length < 8) {
        setError(
          'Password must contain at least 8 characters.',
        );
        return;
      }

      if (password !== confirmPassword) {
        setError('The passwords do not match.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await signupParent(
          cleanName,
          cleanEmail,
          password,
        );
      }

      await completeLogin(
        cleanEmail,
        password,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : mode === 'signup'
            ? 'Account registration failed.'
            : 'Parent login failed.',
      );
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (
    nextMode: AccountMode,
  ) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <main className="parent-login-page">
      <section className="parent-login-card">
        <div className="parent-login-icon">
          <LockKeyhole size={36} />
        </div>

        <div className="parent-account-tabs">
          <button
            type="button"
            className={
              mode === 'login' ? 'active' : ''
            }
            onClick={() => changeMode('login')}
          >
            Sign In
          </button>

          <button
            type="button"
            className={
              mode === 'signup' ? 'active' : ''
            }
            onClick={() => changeMode('signup')}
          >
            Create Account
          </button>
        </div>

        <h1>
          {mode === 'signup'
            ? 'Create Parent Account'
            : 'Parent Login'}
        </h1>

        <p>
          {mode === 'signup'
            ? 'Create an account to save children, controls, history, and settings.'
            : 'Sign in using your SARA Tube parent or administrator account.'}
        </p>

        {mode === 'signup' && (
          <label className="parent-login-field">
            <span>Parent name</span>

            <div>
              <LockKeyhole size={20} />

              <input
                type="text"
                value={displayName}
                autoComplete="name"
                placeholder="Your name"
                onChange={(event) => {
                  setDisplayName(
                    event.target.value,
                  );
                  clearMessages();
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
                clearMessages();
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
              autoComplete={
                mode === 'signup'
                  ? 'new-password'
                  : 'current-password'
              }
              placeholder={
                mode === 'signup'
                  ? 'Minimum 8 characters'
                  : 'Enter password'
              }
              onChange={(event) => {
                setPassword(event.target.value);
                clearMessages();
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  mode === 'login'
                ) {
                  submit();
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

        {mode === 'signup' && (
          <label className="parent-login-field">
            <span>Confirm password</span>

            <div>
              <LockKeyhole size={20} />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                autoComplete="new-password"
                placeholder="Repeat password"
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value,
                  );
                  clearMessages();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    submit();
                  }
                }}
              />
            </div>
          </label>
        )}

        {error && (
          <div className="parent-login-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="parent-login-submit"
          disabled={loading}
          onClick={submit}
        >
          {loading
            ? mode === 'signup'
              ? 'Creating account...'
              : 'Signing in...'
            : mode === 'signup'
              ? 'Create Account'
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
          Guest mode opens the original kids profiles
          and videos without a database account.
        </small>
      </section>
    </main>
  );
}
