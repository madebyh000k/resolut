'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/resolut.svg"
            alt="Resolut"
            width={200}
            height={67}
            priority
          />
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-text-muted/20 rounded-lg p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-2 text-center">Beta Access</h1>
          <p className="text-text-secondary text-center mb-6">
            Enter your beta password to access Resolut
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-text-muted/30 bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter beta password"
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !password}
              className="w-full"
            >
              {isLoading ? 'Authenticating...' : 'Access Resolut'}
            </Button>
          </form>

          <p className="text-xs text-text-secondary text-center mt-6">
            Don't have access? Contact the administrator for a beta password.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-secondary mt-8">
          Powered by Claude AI • Built with Next.js
        </p>
      </div>
    </div>
  );
}
