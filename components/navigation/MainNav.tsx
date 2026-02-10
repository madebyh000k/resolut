'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { FileText, Briefcase, TrendingUp } from 'lucide-react';

const navItems = [
  { href: '/optimize', label: 'Optimize', icon: FileText, disabled: false },
  { href: '/prepare', label: 'Prepare', icon: Briefcase, disabled: false },
  { href: '/negotiate', label: 'Negotiate', icon: TrendingUp, disabled: true, comingSoon: true },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.disabled) {
          return (
            <div
              key={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full font-medium',
                'opacity-50 cursor-not-allowed text-text-secondary'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
              {item.comingSoon && (
                <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md ml-1">
                  SOON
                </span>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
