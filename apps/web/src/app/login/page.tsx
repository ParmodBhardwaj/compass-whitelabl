'use client';
import { useState } from 'react';
import { setTokens } from '@/lib/auth';
import { BRAND, copyrightLine } from '@/lib/brand';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/v2/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message ?? 'Invalid credentials. Please try again.');
        return;
      }
      const data = await res.json();
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      window.location.href = '/portal';
    } catch {
      setError('Unable to connect. Please check your network and try again.');
    } finally {
      setBusy(false);
    }
  }

  // Inline CSS rendered via dangerouslySetInnerHTML so SSR and CSR emit
  // identical bytes — otherwise React escapes ' and " to &#x27; and &quot;
  // server-side, but the client preserves them raw, causing a hydration
  // mismatch error. See: https://nextjs.org/docs/messages/react-hydration-error
  const loginPageStyles = `
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; height: 100%; }

        .login-page {
          min-height: 100vh;
          background:
            linear-gradient(135deg, #1f2a44 0%, #2c3e50 50%, #34495e 100%);
          display: flex;
          flex-direction: column;
          font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        }

        .login-body {
          flex: 1;
          display: flex;
          align-items: stretch;
        }

        /* ── Left branding panel ── */
        .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          text-align: center;
        }
        .login-left img {
          height: 100px;
          margin-bottom: 16px;
          object-fit: contain;
        }
        .login-tagline {
          font-size: 22px;
          font-weight: 700;
          color: #222;
          margin: 0;
          letter-spacing: 0.3px;
        }
        .login-tagline span { color: #e2231a; }

        /* Vertical divider */
        .login-divider {
          width: 1px;
          background: rgba(0,0,0,0.15);
          margin: 48px 0;
          flex-shrink: 0;
        }

        /* ── Right form panel ── */
        .login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 360px;
        }

        /* Pill inputs */
        .login-input-wrap {
          position: relative;
          margin-bottom: 14px;
        }
        .login-input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 14px;
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          height: 46px;
          border-radius: 23px;
          border: 1px solid #ccc;
          background: #fff;
          padding: 0 20px 0 44px;
          font-size: 14px;
          color: #333;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input::placeholder { color: #aaa; }
        .login-input:focus {
          border-color: #bbb;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }

        /* Buttons */
        .login-btn-signin {
          display: block;
          width: 100%;
          height: 46px;
          border-radius: 23px;
          border: none;
          background: #222;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          margin-bottom: 12px;
          transition: background 0.2s;
        }
        .login-btn-signin:hover:not(:disabled) { background: #111; }
        .login-btn-signin:disabled { opacity: 0.7; cursor: not-allowed; }

        .login-btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 46px;
          border-radius: 23px;
          border: none;
          background: #c0392b;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .login-btn-google:hover { background: #a93226; color: #fff; }

        /* Error */
        .login-error {
          background: #fff3f3;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 8px 14px;
          font-size: 12px;
          color: #721c24;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Footer */
        .login-footer {
          padding: 10px 20px;
          font-size: 11px;
          color: #666;
          font-weight: 600;
        }
      `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: loginPageStyles }} />

      <div className="login-page">
        <div className="login-body">

          {/* ── Left: branding ─────────────────────────────────────────────── */}
          <div className="login-left">
            <img
              src={BRAND.logoUrl}
              alt={BRAND.name}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p className="login-tagline">
              {BRAND.welcomeMessage} to {BRAND.name} <span>Family!</span>
            </p>
          </div>

          {/* ── Vertical rule ───────────────────────────────────────────────── */}
          <div className="login-divider" />

          {/* ── Right: form ─────────────────────────────────────────────────── */}
          <div className="login-right">
            <div className="login-form-wrap">
              <form onSubmit={onSubmit} autoComplete="on">

                {/* Email / username */}
                <div className="login-input-wrap">
                  <i className="fa fa-user login-input-icon" />
                  <input
                    className="login-input"
                    type="text"
                    placeholder="Email"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="login-input-wrap">
                  <i className="fa fa-key login-input-icon" />
                  <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="login-error">
                    <i className="fa fa-exclamation-circle" />
                    {error}
                  </div>
                )}

                {/* Sign In */}
                <button
                  type="submit"
                  className="login-btn-signin"
                  disabled={busy}
                >
                  {busy
                    ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Signing in…</>
                    : 'SIGN IN'
                  }
                </button>

                {/* Google SSO */}
                <a href="/api/v2/auth/google" className="login-btn-google">
                  <span style={{ fontWeight: 700, fontSize: 15 }}>G+</span>
                  Sign In with Google
                </a>

              </form>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="login-footer">
          {copyrightLine()}
        </div>
      </div>
    </>
  );
}
