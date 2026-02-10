'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { JobOffer } from '@/types/negotiate';
import { Sparkles } from 'lucide-react';

interface OfferInputFormProps {
  onSubmit: (offer: JobOffer) => void;
  existingOffer?: JobOffer | null;
}

export function OfferInputForm({ onSubmit, existingOffer }: OfferInputFormProps) {
  const [formData, setFormData] = useState({
    company: existingOffer?.company || '',
    jobTitle: existingOffer?.jobTitle || '',
    baseSalary: existingOffer?.baseSalary?.toString() || '',
    currency: existingOffer?.currency || 'USD',
    bonus: existingOffer?.bonus?.toString() || '',
    equityAmount: existingOffer?.equity?.amount?.toString() || '',
    equityType: existingOffer?.equity?.type || 'rsu',
    benefits: existingOffer?.benefits?.join(', ') || '',
    location: existingOffer?.location || '',
    remote: existingOffer?.remote || 'hybrid',
    yearsOfExperience: existingOffer?.yearsOfExperience?.toString() || '',
    roleLevel: existingOffer?.roleLevel || 'mid',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const offer: JobOffer = {
      id: existingOffer?.id || `offer-${Date.now()}`,
      company: formData.company,
      jobTitle: formData.jobTitle,
      baseSalary: parseFloat(formData.baseSalary),
      currency: formData.currency as JobOffer['currency'],
      bonus: formData.bonus ? parseFloat(formData.bonus) : undefined,
      equity: formData.equityAmount
        ? {
            amount: parseFloat(formData.equityAmount),
            type: formData.equityType as 'shares' | 'options' | 'rsu',
          }
        : undefined,
      benefits: formData.benefits
        ? formData.benefits.split(',').map((b) => b.trim()).filter(Boolean)
        : undefined,
      location: formData.location,
      remote: formData.remote as JobOffer['remote'],
      yearsOfExperience: parseInt(formData.yearsOfExperience),
      roleLevel: formData.roleLevel as JobOffer['roleLevel'],
      createdAt: existingOffer?.createdAt || new Date(),
    };

    onSubmit(offer);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 ml-10">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Anthropic"
          />
        </div>

        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            required
            value={formData.jobTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
      </div>

      {/* Compensation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="baseSalary" className="block text-sm font-medium mb-2">
            Base Salary *
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
          <label htmlFor="currency" className="block text-sm font-medium mb-2">
            Currency *
          </label>
          <select
            id="currency"
            name="currency"
            required
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>

      {/* Bonus */}
      <div>
        <label htmlFor="bonus" className="block text-sm font-medium mb-2">
          Annual Bonus (Optional)
        </label>
        <input
          type="number"
          id="bonus"
          name="bonus"
          min="0"
          step="1000"
          value={formData.bonus}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="20000"
        />
      </div>

      {/* Equity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="equityAmount" className="block text-sm font-medium mb-2">
            Equity Amount (Optional)
          </label>
          <input
            type="number"
            id="equityAmount"
            name="equityAmount"
            min="0"
            step="1000"
            value={formData.equityAmount}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="50000"
          />
        </div>

        <div>
          <label htmlFor="equityType" className="block text-sm font-medium mb-2">
            Equity Type
          </label>
          <select
            id="equityType"
            name="equityType"
            value={formData.equityType}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="rsu">RSU (Restricted Stock Units)</option>
            <option value="options">Stock Options</option>
            <option value="shares">Shares</option>
          </select>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <label htmlFor="benefits" className="block text-sm font-medium mb-2">
          Benefits (Optional)
        </label>
        <textarea
          id="benefits"
          name="benefits"
          rows={3}
          value={formData.benefits}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="e.g., Health insurance, 401k match, unlimited PTO, gym membership (comma-separated)"
        />
      </div>

      {/* Location & Remote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        <div>
          <label htmlFor="remote" className="block text-sm font-medium mb-2">
            Work Model *
          </label>
          <select
            id="remote"
            name="remote"
            required
            value={formData.remote}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="fully-remote">Fully Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on-site">On-site</option>
          </select>
        </div>
      </div>

      {/* Experience & Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            required
            min="0"
            max="50"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="5"
          />
        </div>

        <div>
          <label htmlFor="roleLevel" className="block text-sm font-medium mb-2">
            Role Level *
          </label>
          <select
            id="roleLevel"
            name="roleLevel"
            required
            value={formData.roleLevel}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-text-muted/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior</option>
            <option value="staff">Staff</option>
            <option value="principal">Principal</option>
            <option value="executive">Executive</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" size="lg">
          <Sparkles className="h-5 w-5 mr-2" />
          {existingOffer ? 'Update Offer' : 'Save Offer'}
        </Button>
      </div>
    </form>
  );
}
