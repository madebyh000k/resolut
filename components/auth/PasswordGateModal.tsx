'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const BETA_PASSWORD = 'resolut-beta-2026';

interface PasswordGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordGateModal({ isOpen, onClose, onSuccess }: PasswordGateModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
        <h2>Beta Access Required</h2>
        <p>Enter your beta access code from the welcome email</p>

        <form onSubmit={handleSubmit}>
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

        <p className="help-text">
          Don't have a code?{' '}
          <a href="mailto:hello@resolut.tools">Request access</a>
        </p>
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

        .password-input {
          padding: 14px 16px;
          border: 2px solid #efecea;
          border-radius: 8px;
          font-size: 16px;
          text-align: center;
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
          transition: border-color 0.2s;
        }

        .password-input:focus {
          outline: none;
          border-color: #1b4332;
        }

        .password-modal-content button {
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

        .password-modal-content button:hover {
          background: #14331f;
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

        .help-text a {
          color: #1b4332;
          text-decoration: none;
          font-weight: 500;
        }

        .help-text a:hover {
          text-decoration: underline;
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
