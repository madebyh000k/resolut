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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowSignupForm(false);
      setSignupSuccess(false);
      setSignupError('');
      setSubmitting(false);
    }
  }, [isOpen]);

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
      // Send to Mailchimp with 'beta-tester' tag
      // This triggers the Mailchimp automation that sends welcome email
      const response = await fetch('/api/mailchimp/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          tags: ['beta-tester'], // This triggers the welcome email automation
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Mailchimp will send the welcome email
        setSignupSuccess(true);
        setShowSignupForm(false);
      } else {
        // Handle error (email already exists, invalid email, etc.)
        if (data.error && data.error.toLowerCase().includes('already a list member')) {
          setSignupError('This email is already registered. Check your inbox for your access code.');
        } else {
          setSignupError(data.error || 'Something went wrong. Please try again or email hello@resolut.tools');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setSignupError('Connection error. Please check your internet and try again.');
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
        {/* Success State */}
        {signupSuccess && (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>Check Your Email!</h2>
            <p>We just sent your beta access code to your inbox. It should arrive within 1-2 minutes.</p>
            <button onClick={() => onClose()} className="close-button" type="button">
              Close
            </button>
          </div>
        )}

        {/* Password Form */}
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
              <button type="submit">Access Beta</button>
            </form>

            {error && <p className="error-message">{error}</p>}

            <div className="help-text">
              Don't have a code?{' '}
              <button
                onClick={() => setShowSignupForm(true)}
                className="link-button"
                type="button"
              >
                Request access
              </button>
            </div>
          </>
        )}

        {/* Email Signup Form */}
        {showSignupForm && !signupSuccess && (
          <div className="signup-form-section">
            <button
              onClick={() => setShowSignupForm(false)}
              className="back-button"
              type="button"
            >
              ← Back
            </button>

            <h2>Request Beta Access</h2>
            <p>We'll email you an access code instantly.</p>

            <form onSubmit={handleSignupSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="email-input"
                autoFocus
              />
              <button type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Request Access Code'}
              </button>
            </form>

            {signupError && <p className="error-message">{signupError}</p>}
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

        .password-modal-content > p,
        .signup-form-section > p,
        .success-state > p {
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
          padding: 14px 16px;
          border: 2px solid #efecea;
          border-radius: 8px;
          font-size: 16px;
          text-align: center;
          transition: border-color 0.2s;
        }

        .password-input {
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }

        .email-input {
          font-family: inherit;
        }

        .password-input:focus,
        .email-input:focus {
          outline: none;
          border-color: #1b4332;
        }

        .password-modal-content button[type='submit'],
        .close-button {
          padding: 14px;
          background: #1b4332;
          color: #faf9f6;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .password-modal-content button[type='submit']:hover,
        .close-button:hover {
          background: #14331f;
        }

        .password-modal-content button[type='submit']:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc2626;
          font-size: 14px;
          margin: 0;
          padding: 12px;
          background-color: rgba(220, 38, 38, 0.1);
          border-radius: 6px;
          border-left: 3px solid #dc2626;
        }

        .help-text {
          font-size: 13px;
          color: #999999;
          margin: 0;
        }

        .link-button {
          color: #1b4332;
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .link-button:hover {
          text-decoration: underline;
        }

        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          background: none;
          border: none;
          color: #1b4332;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px;
          transition: opacity 0.2s;
        }

        .back-button:hover {
          opacity: 0.7;
        }

        .signup-form-section {
          animation: slideUp 0.3s ease;
        }

        .signup-form-section h2 {
          margin-top: 20px;
        }

        .success-state {
          animation: slideUp 0.3s ease;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-weight: bold;
        }

        .success-state h2 {
          color: #10b981;
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

          .back-button {
            top: 16px;
            left: 16px;
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
