'use client';

import { useState } from 'react';
import { AlertCircle, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CompanyNameInputProps {
  detectedCompany: string;
  confidence: 'high' | 'medium' | 'low';
  needsManual: boolean;
  onCompanyConfirmed: (companyName: string) => void;
}

export function CompanyNameInput({
  detectedCompany,
  confidence,
  needsManual,
  onCompanyConfirmed,
}: CompanyNameInputProps) {
  const [isEditing, setIsEditing] = useState(needsManual);
  const [companyName, setCompanyName] = useState(detectedCompany);
  const [confirmed, setConfirmed] = useState(!needsManual && confidence === 'high');

  const handleConfirm = () => {
    if (companyName.trim()) {
      setConfirmed(true);
      setIsEditing(false);
      onCompanyConfirmed(companyName.trim());
    }
  };

  const handleEdit = () => {
    setConfirmed(false);
    setIsEditing(true);
  };

  // If high confidence and not manually edited, show success state
  if (confirmed && !needsManual) {
    return (
      <Card className="p-4 bg-primary/10 dark:bg-green-900/20 border-primary/30 dark:border-green-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-primary dark:text-green-400" />
            <div>
              <p className="font-medium text-primary dark:text-green-400">Company detected: {companyName}</p>
              <p className="text-sm text-text-secondary">Auto-detected from job posting</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleEdit} className="text-xs">
            Edit
          </Button>
        </div>
      </Card>
    );
  }

  // If needs manual input or editing
  if (isEditing || needsManual) {
    return (
      <Card className={`p-4 ${needsManual ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-surface border-text-muted/20'}`}>
        <div className="flex items-start gap-3">
          {needsManual ? (
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Building2 className="h-5 w-5 text-text-secondary flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium mb-2">
              {needsManual
                ? 'Company name could not be auto-detected'
                : 'Confirm company name'}
            </p>
            <p className="text-sm text-text-secondary mb-3">
              {needsManual
                ? 'Please enter the company name to get more specific resume recommendations'
                : 'We detected this company name. You can edit it if needed.'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                className="flex-1 px-3 py-2 rounded-lg border-2 border-text-muted/30 bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirm}
                disabled={!companyName.trim()}
              >
                Confirm
              </Button>
            </div>
            {!needsManual && (
              <p className="text-xs text-text-secondary mt-2">
                Or click "Confirm" to keep the detected name
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Confirmed state after manual input
  return (
    <Card className="p-4 bg-primary/10 dark:bg-green-900/20 border-primary/30 dark:border-green-400/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Check className="h-5 w-5 text-primary dark:text-green-400" />
          <div>
            <p className="font-medium text-primary dark:text-green-400">Company confirmed: {companyName}</p>
            <p className="text-sm text-text-secondary">Ready to optimize your resume</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleEdit} className="text-xs">
          Edit
        </Button>
      </div>
    </Card>
  );
}
