'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobOffer } from '@/types/negotiate';
import { Briefcase, MapPin, DollarSign, TrendingUp, Users, Edit } from 'lucide-react';

interface OfferSummaryProps {
  offer: JobOffer;
  onEdit: () => void;
}

export function OfferSummary({ offer, onEdit }: OfferSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: offer.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatEquityType = (type: string) => {
    const types = {
      rsu: 'RSU',
      options: 'Stock Options',
      shares: 'Shares',
    };
    return types[type as keyof typeof types] || type;
  };

  const formatRemote = (remote: string) => {
    const remoteTypes = {
      'fully-remote': 'Fully Remote',
      hybrid: 'Hybrid',
      'on-site': 'On-site',
    };
    return remoteTypes[remote as keyof typeof remoteTypes] || remote;
  };

  const formatRoleLevel = (level: string) => {
    const levels = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior',
      staff: 'Staff',
      principal: 'Principal',
      executive: 'Executive',
    };
    return levels[level as keyof typeof levels] || level;
  };

  const totalComp = offer.baseSalary + (offer.bonus || 0) + (offer.equity?.amount || 0);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">{offer.jobTitle}</h2>
          <p className="text-lg text-text-secondary flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            {offer.company}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compensation */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Compensation
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Base Salary</p>
                <p className="text-lg font-semibold">{formatCurrency(offer.baseSalary)}</p>
              </div>
            </div>

            {offer.bonus && (
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Annual Bonus</p>
                  <p className="text-lg font-semibold">{formatCurrency(offer.bonus)}</p>
                </div>
              </div>
            )}

            {offer.equity && (
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">
                    Equity ({formatEquityType(offer.equity.type)})
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(offer.equity.amount)}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-text-muted/20">
              <p className="text-sm text-text-secondary mb-1">Total Compensation</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalComp)}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Details
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Location & Work Model</p>
                <p className="font-medium">{offer.location}</p>
                <p className="text-sm text-text-secondary">{formatRemote(offer.remote)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Role Level</p>
                <p className="font-medium">{formatRoleLevel(offer.roleLevel)}</p>
                <p className="text-sm text-text-secondary">
                  {offer.yearsOfExperience} years experience
                </p>
              </div>
            </div>

            {offer.benefits && offer.benefits.length > 0 && (
              <div>
                <p className="text-sm text-text-secondary mb-2">Benefits</p>
                <div className="flex flex-wrap gap-2">
                  {offer.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
