'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SimpleOfferFormProps {
  onSubmit: (data: {
    company: string;
    role: string;
    location: string;
    baseSalary: number;
    equity?: string;
    bonus?: string;
    yearsOfExperience?: number;
  }) => void;
  isProcessing: boolean;
}

export function SimpleOfferForm({ onSubmit, isProcessing }: SimpleOfferFormProps) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    baseSalary: '',
    equity: '',
    bonus: '',
    yearsOfExperience: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmit({
      company: formData.company,
      role: formData.role,
      location: formData.location,
      baseSalary: parseFloat(formData.baseSalary),
      equity: formData.equity || undefined,
      bonus: formData.bonus || undefined,
      yearsOfExperience: formData.yearsOfExperience
        ? parseInt(formData.yearsOfExperience)
        : undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Help Section */}
      <div className="p-4 rounded-lg bg-surface border-l-4 border-primary dark:border-green-400">
        <h4 className="text-sm font-semibold text-primary dark:text-green-400 mb-2 flex items-center gap-2">
          💡 How to Enter Equity
        </h4>
        <p className="text-xs text-text-secondary mb-2">
          Enter the annual value of your equity:
        </p>
        <ul className="text-xs text-text-secondary space-y-1 ml-4 list-disc">
          <li>
            <span className="font-mono bg-primary/10 dark:bg-green-900/30 px-1 rounded text-primary dark:text-green-400">130k/year</span> if your offer states annual value
          </li>
          <li>
            <span className="font-mono bg-primary/10 dark:bg-green-900/30 px-1 rounded text-primary dark:text-green-400">520k over 4 years</span> if it shows total grant (we'll calculate annual)
          </li>
        </ul>
        <p className="text-xs text-text-muted italic mt-2">
          Most offers vest over 4 years, so a $520k grant = $130k/year
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-2">
            Company *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Amazon, Google, Meta"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Role *
          </label>
          <input
            type="text"
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Senior Software Engineer (L5)"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          Location *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          value={formData.location}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Seattle, San Francisco, Remote"
        />
      </div>

      {/* Compensation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="baseSalary" className="block text-sm font-medium mb-2">
            Base Salary * ($)
          </label>
          <input
            type="number"
            id="baseSalary"
            name="baseSalary"
            required
            min="0"
            step="1000"
            value={formData.baseSalary}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="150000"
          />
        </div>

        <div>
          <label htmlFor="equity" className="block text-sm font-medium mb-2">
            Equity (annual value)
          </label>
          <input
            type="text"
            id="equity"
            name="equity"
            value={formData.equity}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="$100k/year or $400k over 4 years"
          />
          <p className="text-xs text-text-muted mt-1">
            Enter annual value or total over X years
          </p>
        </div>

        <div>
          <label htmlFor="bonus" className="block text-sm font-medium mb-2">
            Bonus (annual)
          </label>
          <input
            type="text"
            id="bonus"
            name="bonus"
            value={formData.bonus}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="15% or $25k"
          />
          <p className="text-xs text-text-muted mt-1">
            Percentage of base or dollar amount
          </p>
        </div>
      </div>

      {/* Years of Experience */}
      <div>
        <label htmlFor="yearsOfExperience" className="block text-sm font-medium mb-2">
          Years of Experience (optional)
        </label>
        <input
          type="number"
          id="yearsOfExperience"
          name="yearsOfExperience"
          min="0"
          max="50"
          value={formData.yearsOfExperience}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="6"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button type="submit" variant="primary" size="lg" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Your Offer...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze My Offer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
