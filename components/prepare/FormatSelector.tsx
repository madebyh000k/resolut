'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FormatSelectorProps {
  selectedFormat: '30min' | '60min';
  onFormatChange: (format: '30min' | '60min') => void;
  disabled?: boolean;
}

export function FormatSelector({
  selectedFormat,
  onFormatChange,
  disabled = false,
}: FormatSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onFormatChange('30min')}
        disabled={disabled}
        className={cn(
          'flex-1 p-4 rounded-lg border-2 transition-all',
          'flex items-center gap-3',
          selectedFormat === '30min'
            ? 'border-primary bg-primary/10'
            : 'border-text-muted/30 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Clock className="h-5 w-5" />
        <div className="text-left">
          <div className="font-semibold">30-Minute Interview</div>
          <div className="text-sm text-text-secondary">Quick essentials</div>
        </div>
      </button>

      <button
        onClick={() => onFormatChange('60min')}
        disabled={disabled}
        className={cn(
          'flex-1 p-4 rounded-lg border-2 transition-all',
          'flex items-center gap-3',
          selectedFormat === '60min'
            ? 'border-primary bg-primary/10'
            : 'border-text-muted/30 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Clock className="h-5 w-5" />
        <div className="text-left">
          <div className="font-semibold">60-Minute Interview</div>
          <div className="text-sm text-text-secondary">Comprehensive prep</div>
        </div>
      </button>
    </div>
  );
}
