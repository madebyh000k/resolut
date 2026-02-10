'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { MainNav } from '@/components/navigation/MainNav';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { originalResume, jobDescription, customizedResume, reset } = useResumeStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasData = originalResume || jobDescription || customizedResume;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-text-muted/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start">
              <Link href="/" className="cursor-pointer">
                {mounted ? (
                  <Image
                    src={theme === 'dark' ? '/resolut-light.svg' : '/resolut.svg'}
                    alt="Resolut"
                    width={120}
                    height={40}
                    className="sm:w-[150px] sm:h-[50px]"
                    priority
                  />
                ) : (
                  <Image
                    src="/resolut.svg"
                    alt="Resolut"
                    width={120}
                    height={40}
                    className="sm:w-[150px] sm:h-[50px]"
                    priority
                  />
                )}
              </Link>
              {/* Mobile: Start Over + Theme Toggle */}
              <div className="sm:hidden flex items-center gap-2">
                {hasData && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={reset}
                    className="text-xs px-3 rounded-full"
                  >
                    <RotateCcw className="h-3 w-3 mr-1.5" />
                    Start Over
                  </Button>
                )}
                <ThemeToggle />
              </div>
            </div>

            {/* Desktop: Nav in center-left */}
            <div className="hidden sm:flex items-center">
              <MainNav />
            </div>

            {/* Right: Start Over + Theme Toggle */}
            <div className="hidden sm:flex items-center gap-4">
              {hasData && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={reset}
                  className="rounded-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden mt-3 flex justify-center">
            <MainNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-text-muted/20 py-6 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 sm:px-6 text-center text-sm text-text-secondary">
          <p>Powered by Claude AI • Built with Next.js</p>
        </div>
      </footer>
    </div>
  );
}
