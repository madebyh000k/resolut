'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Briefcase, TrendingUp, FileText, MessageSquare, ArrowRight } from 'lucide-react';
import { PasswordGateModal } from '@/components/auth/PasswordGateModal';

export default function LandingPage() {
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const checkBetaAccess = (route: string) => {
    const hasAccess = typeof window !== 'undefined' && localStorage.getItem('resolut_beta_access') === 'true';

    if (!hasAccess) {
      setPendingRoute(route);
      setShowPasswordModal(true);
      return false;
    }

    router.push(route);
    return true;
  };

  const handlePasswordSuccess = () => {
    if (pendingRoute) {
      router.push(pendingRoute);
      setPendingRoute(null);
    }
  };

  return (
    <AppLayout>
      {/* Password Gate Modal */}
      <PasswordGateModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Hero Section */}
      <section className="text-center py-12 sm:py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-xl">🔒</span>
          <span className="text-sm font-medium text-primary">Private Beta</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Land your dream job,
          <br />
          <span className="text-primary">with AI-powered preparation</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          Transform your resume for ATS systems, prepare for interviews, and negotiate with confidence.
          Resolut helps you stand out in every stage of the job search.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => checkBetaAccess('/optimize')}
            className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
          >
            <Sparkles className="h-6 w-6 mr-3" />
            Get Started Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const howItWorks = document.getElementById('how-it-works');
              howItWorks?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
          >
            See How It Works
          </Button>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-12 sm:py-16 border-t border-text-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Value Prop 1 */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">ATS-Optimized Resumes</h3>
            <p className="text-text-secondary">
              Get past applicant tracking systems with AI-powered keyword optimization while preserving your unique voice and authenticity.
            </p>
          </div>

          {/* Value Prop 2 */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Interview Preparation</h3>
            <p className="text-text-secondary">
              Get personalized interview briefs with company research, talking points, and strategic questions tailored to your background.
            </p>
          </div>

          {/* Value Prop 3 */}
          <div className="text-center opacity-60">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 opacity-50">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <h3 className="text-xl font-semibold">Smart Negotiations</h3>
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wide">
                Coming Soon
              </span>
            </div>
            <p className="text-text-secondary">
              Analyze your offer and get data-driven negotiation strategies with market insights, email templates, and pushback responses.
            </p>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-16 sm:py-24 bg-surface border-t border-text-muted/20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get Early Access</h2>
          <p className="text-lg text-text-secondary mb-8">
            Join the waitlist and be first to try Resolut when we launch. Optimize and Prepare features available now. Negotiate coming this week.
          </p>

          {/* Mailchimp Form */}
          <form
            action="https://tools.us15.list-manage.com/subscribe/post?u=b4a4e83bc62b08f39a2be6939&id=2ff1ffe83b&f_id=0082c2e1f0"
            method="post"
            target="_blank"
            className="max-w-md mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                name="EMAIL"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-full border-2 border-text-muted/30 bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="sm:w-auto whitespace-nowrap"
              >
                Join Waitlist
              </Button>
            </div>

            {/* Mailchimp required hidden field */}
            <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
              <input type="text" name="b_b4a4e83bc62b08f39a2be6939_2ff1ffe83b" tabIndex={-1} value="" readOnly />
            </div>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 border-t border-text-muted/20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Resolut Works For You</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Three powerful tools to take you from application to offer
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1: Customize Resume */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-3 flex items-center gap-3 justify-center md:justify-start">
                <FileText className="h-6 w-6 text-primary" />
                Optimize Your Resume
              </h3>
              <p className="text-text-secondary mb-4">
                Upload your resume and paste any job URL. Resolut analyzes your writing style and the job requirements, then optimizes your resume for ATS systems while keeping your authentic voice intact.
              </p>
              <Button
                variant="primary"
                onClick={() => checkBetaAccess('/optimize')}
                className="group"
              >
                Start Optimizing
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="flex-1 bg-surface rounded-lg p-8 border border-text-muted/20">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Upload PDF or DOCX resume</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Paste job posting URL</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Get ATS-optimized resume in seconds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Prepare for Interview */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-3 flex items-center gap-3 justify-center md:justify-start">
                <Briefcase className="h-6 w-6 text-primary" />
                Prepare for Your Interview
              </h3>
              <p className="text-text-secondary mb-4">
                Generate personalized interview briefs with company news, strategic talking points, and questions to ask. Choose between 30-minute or 60-minute interview formats.
              </p>
              <Button
                variant="primary"
                onClick={() => checkBetaAccess('/prepare')}
                className="group"
              >
                Start Preparing
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="flex-1 bg-surface rounded-lg p-8 border border-text-muted/20">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Recent company news & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Personalized talking points</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Strategic questions to ask</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Negotiate Your Offer */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 opacity-60">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold mb-4 opacity-50">
                3
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">Negotiate Your Offer</h3>
                <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wide">
                  Coming Soon
                </span>
              </div>
              <p className="text-text-secondary mb-4">
                Analyze your offer and get data-driven negotiation strategies with market insights, personalized email templates, and responses to common pushback scenarios.
              </p>
              <Button
                variant="outline"
                disabled
                className="group opacity-50 cursor-not-allowed"
              >
                Start Negotiating
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="flex-1 bg-surface rounded-lg p-8 border border-text-muted/20">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Market position analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Email templates & scripts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Pushback response strategies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 text-center border-t border-text-muted/20">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
        <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
          Join professionals who are getting more interviews and better offers with Resolut
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => checkBetaAccess('/optimize')}
          className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg"
        >
          <Sparkles className="h-6 w-6 mr-3" />
          Get Started Free
        </Button>
      </section>
    </AppLayout>
  );
}
