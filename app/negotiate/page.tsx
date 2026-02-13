'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { SimpleOfferForm } from '@/components/negotiate/SimpleOfferForm';
import { AdviceDisplay } from '@/components/negotiate/AdviceDisplay';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { NegotiationAdvice } from '@/types/offer-advice';

export default function NegotiatePage() {
  const [advice, setAdvice] = useState<NegotiationAdvice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (offerData: {
    company: string;
    role: string;
    location: string;
    baseSalary: number;
    equity?: string;
    bonus?: string;
    yearsOfExperience?: number;
  }) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze offer');
      }

      const data = await response.json();
      setAdvice(data.advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze offer');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Salary Negotiation</h1>
        <p className="text-text-secondary">
          Get AI-powered analysis and negotiation strategies for your job offer
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-error font-medium">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-error hover:text-error/80 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      {!advice ? (
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Enter Your Offer Details</h2>
            <p className="text-text-secondary">
              Provide your offer information and we'll analyze it against market data to help you
              negotiate effectively.
            </p>
          </div>

          <SimpleOfferForm onSubmit={handleSubmit} isProcessing={isProcessing} />
        </Card>
      ) : (
        <AdviceDisplay advice={advice} />
      )}
    </AppLayout>
  );
}
