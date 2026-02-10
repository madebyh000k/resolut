'use client';

import { useState, useEffect, FormEvent } from 'react';

const BETA_PASSWORD = 'resolut-beta-2026';

interface PasswordGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordGateModal({ isOpen, onClose, onSuccess }: PasswordGateModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowSignupForm(false);
      setSignupSuccess(false);
      setSignupError('');
      setSubmitting(false);
      setCountdown(5);
    }
  }, [isOpen]);

  // Auto-close countdown for success state
  useEffect(() => {
    if (signupSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (signupSuccess && countdown === 0) {
      onClose();
    }
  }, [signupSuccess, countdown, onClose]);

  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedPassword = password.trim();

    if (trimmedPassword === BETA_PASSWORD) {
      // Correct password
      localStorage.setItem('resolut_beta_access', 'true');
      setError('');
      onSuccess();
      onClose();
    } else {
      // Wrong password
      setError('Invalid code. Check your email for the correct code.');
    }
  };

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSignupError('');

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim();

    try {
      const response = await fetch('/api/mailchimp/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          tags: ['beta-tester'],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSignupSuccess(true);
        setShowSignupForm(false);
        setCountdown(5); // Reset countdown
      } else {
        if (data.error && data.error.toLowerCase().includes('already a list member')) {
          setSignupError('This email is already registered. Check your inbox!');
        } else {
          setSignupError(data.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setSignupError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="password-modal-overlay" onClick={handleOverlayClick}>
      <div className="password-modal-content" onClick={handleContentClick}>
        {/* STATE 1: Password Entry */}
        {!showSignupForm && !signupSuccess && (
          <>
            <h2>Beta Access Required</h2>
            <p>Enter your beta access code from the welcome email</p>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="text"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter code"
                className="password-input"
                autoFocus
                autoComplete="off"
              />
              <button type="submit" className="primary-button">
                Access Beta
              </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            <p className="help-text">
              Don't have a code?{' '}
              <button
                onClick={() => {
                  setShowSignupForm(true);
                  setError('');
                }}
                className="link-button"
                type="button"
              >
                Request access
              </button>
            </p>
          </>
        )}

        {/* STATE 2: Email Signup */}
        {showSignupForm && !signupSuccess && (
          <>
            <button
              onClick={() => {
                setShowSignupForm(false);
                setSignupError('');
              }}
              className="back-button"
              type="button"
            >
              ← Back
            </button>

            <h2>Request Beta Access</h2>
            <p>Enter your email and we'll send you an access code instantly.</p>

            <form onSubmit={handleSignupSubmit}>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="email-input"
                autoFocus
              />
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? 'Sending...' : 'Request Access Code'}
              </button>
            </form>

            {signupError && <p className="error-message">{signupError}</p>}
          </>
        )}

        {/* STATE 3: Success */}
        {signupSuccess && (
          <div className="success-state">
            <div className="success-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M9 16L14 21L23 11"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2>Beta Access Sent! 🚀</h2>
            <p className="success-message">
              Check your inbox! We just sent your access code. It should arrive within 1-2
              minutes.
            </p>

            <p className="success-hint">Don't see it? Check your spam folder.</p>

            <button onClick={onClose} className="secondary-button" type="button">
              Close
            </button>

            <p className="auto-close-text">Closing automatically in {countdown} seconds...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .password-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .password-modal-content {
          background: #faf9f6;
          padding: 48px;
          border-radius: 16px;
          max-width: 450px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
          position: relative;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .password-modal-content h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #1a1a1a;
        }

        .password-modal-content > p {
          color: #737373;
          margin: 0 0 24px 0;
          font-size: 15px;
          line-height: 22px;
        }

        .password-modal-content form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .password-input,
        .email-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #efecea;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .password-input {
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
          text-align: center;
        }

        .email-input {
          font-family: inherit;
          text-align: left;
        }

        .password-input:focus,
        .email-input:focus {
          outline: none;
          border-color: #1b4332;
        }

        .primary-button {
          width: 100%;
          padding: 14px;
          background: #1b4332;
          color: #faf9f6;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .primary-button:hover:not(:disabled) {
          background: #14331f;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-button {
          padding: 12px 32px;
          background: #f5f3ef;
          color: #1a1a1a;
          border: 1px solid #efecea;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-button:hover {
          background: #efecea;
        }

        .error-message {
          color: #dc2626;
          font-size: 14px;
          margin: 0 0 16px 0;
          padding: 12px;
          background-color: rgba(220, 38, 38, 0.1);
          border-radius: 6px;
          border-left: 3px solid #dc2626;
          text-align: left;
        }

        .help-text {
          font-size: 13px;
          color: #999999;
          margin: 16px 0 0 0;
          text-align: center;
        }

        .link-button {
          background: none;
          border: none;
          color: #1b4332;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          font-size: inherit;
          text-decoration: none;
        }

        .link-button:hover {
          text-decoration: underline;
        }

        .back-button {
          background: none;
          border: none;
          color: #737373;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 20px;
          display: block;
          transition: color 0.2s;
          text-align: left;
        }

        .back-button:hover {
          color: #1b4332;
        }

        /* Success State */
        .success-state {
          text-align: center;
          padding: 20px 0;
          animation: slideUp 0.3s ease;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-state h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #1a1a1a;
        }

        .success-message {
          font-size: 15px;
          line-height: 22px;
          color: #4a4a4a;
          margin: 0 0 16px 0;
        }

        .success-hint {
          font-size: 13px;
          color: #999999;
          margin: 0 0 24px 0;
        }

        .auto-close-text {
          font-size: 12px;
          color: #cccccc;
          margin: 16px 0 0 0;
          font-style: italic;
        }

        /* Mobile responsive */
        @media (max-width: 600px) {
          .password-modal-content {
            padding: 32px 24px;
            margin: 20px;
          }

          .password-modal-content h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}

// Hook to check beta access
export function useBetaAccess() {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem('resolut_beta_access') === 'true';
    setHasAccess(access);
  }, []);

  const checkAccess = () => {
    return localStorage.getItem('resolut_beta_access') === 'true';
  };

  return { hasAccess, checkAccess };
}
