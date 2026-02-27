'use client';

import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface UsageBannerProps {
  remaining: number;
  limit: number;
  resetsAt: Date | string;
  feature: string;
  variant?: 'success' | 'warning' | 'error';
}

export function UsageBanner({ remaining, limit, resetsAt, feature, variant = 'success' }: UsageBannerProps) {
  // Determine variant based on remaining count if not explicitly set
  let effectiveVariant = variant;
  if (variant === 'success') {
    if (remaining === 0) {
      effectiveVariant = 'error';
    } else if (remaining === 1) {
      effectiveVariant = 'warning';
    }
  }

  // Format reset time
  const resetDate = typeof resetsAt === 'string' ? new Date(resetsAt) : resetsAt;
  const now = new Date();
  const diff = resetDate.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let resetText = '';
  if (hours > 0) {
    resetText = `in ${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    resetText = `in ${minutes}m`;
  } else {
    resetText = 'soon';
  }

  // Styles based on variant
  const styles = {
    success: {
      bg: 'bg-primary/10 dark:bg-green-900/20',
      border: 'border-primary/30 dark:border-green-400/30',
      text: 'text-primary dark:text-green-400',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-600 dark:text-yellow-500',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-600 dark:text-red-500',
      icon: AlertCircle,
    },
  };

  const style = styles[effectiveVariant];
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border ${style.border} ${style.bg} p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${style.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`font-medium ${style.text} mb-1`}>
            {remaining > 0
              ? `You have ${remaining} ${feature} use${remaining !== 1 ? 's' : ''} remaining today`
              : `Daily limit reached for ${feature}`}
          </p>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            <span>
              {remaining > 0 ? 'Resets' : 'Resets'} {resetText} • {limit} uses per day
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
