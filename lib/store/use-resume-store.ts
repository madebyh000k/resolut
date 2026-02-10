'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resume, CustomizedResume } from '@/types/resume';
import { JobDescription } from '@/types/job';
import { CompanyNews, InterviewBrief } from '@/types/prepare';
import { JobOffer, NegotiationStrategy } from '@/types/negotiate';
import type { ResumeAnalysis } from '@/types/resume-analysis';

interface ResumeStore {
  // State
  originalResume: Resume | null;
  jobDescription: JobDescription | null;
  customizedResume: CustomizedResume | null;
  companyNews: CompanyNews | null;
  interviewBrief: InterviewBrief | null;
  briefFormat: '30min' | '60min';
  jobOffer: JobOffer | null;
  negotiationStrategy: NegotiationStrategy | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  uploadResume: (file: File) => Promise<void>;
  setJobDescription: (url: string) => Promise<void>;
  customizeResume: () => Promise<void>;
  downloadPDF: () => Promise<void>;
  fetchCompanyNews: (company: string) => Promise<void>;
  generateInterviewBrief: (format: '30min' | '60min') => Promise<void>;
  downloadBriefPDF: () => Promise<void>;
  setBriefFormat: (format: '30min' | '60min') => void;
  setJobOffer: (offer: JobOffer) => void;
  generateNegotiationStrategy: () => Promise<void>;
  downloadNegotiationPDF: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      originalResume: null,
      jobDescription: null,
      customizedResume: null,
      companyNews: null,
      interviewBrief: null,
      briefFormat: '30min',
      jobOffer: null,
      negotiationStrategy: null,
      isProcessing: false,
      error: null,

      // Upload and parse resume
      uploadResume: async (file: File) => {
        set({ isProcessing: true, error: null });

        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/parse', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to parse resume');
          }

          const { resume } = await response.json();
          set({ originalResume: resume, isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to upload resume',
            isProcessing: false,
          });
        }
      },

      // Fetch and parse job description
      setJobDescription: async (url: string) => {
        set({ isProcessing: true, error: null });

        try {
          const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch job description');
          }

          const { jobDescription } = await response.json();
          set({ jobDescription, isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch job description',
            isProcessing: false,
          });
        }
      },

      // Customize resume
      customizeResume: async () => {
        const { originalResume, jobDescription } = get();

        if (!originalResume || !jobDescription) {
          set({ error: 'Please upload a resume and add a job description first' });
          return;
        }

        set({ isProcessing: true, error: null });

        try {
          const response = await fetch('/api/analyze-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeText: originalResume.originalText,
              jobDescription: jobDescription.description,
              companyName: jobDescription.company,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to analyze resume');
          }

          const { analysis } = await response.json();

          // Create customized resume object with analysis
          const customizedResume: CustomizedResume = {
            id: `${originalResume.id}-customized-${Date.now()}`,
            originalResumeId: originalResume.id,
            customizedText: analysis.customizedResume,
            structure: originalResume.structure,
            keywordsAdded: analysis.keywordsPresent
              ? analysis.keywordsPresent.split(',').map(k => k.trim()).filter(Boolean)
              : [],
            analysis,
            customizedAt: new Date(),
          };

          set({ customizedResume, isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to customize resume',
            isProcessing: false,
          });
        }
      },

      // Download customized resume as PDF
      downloadPDF: async () => {
        const { customizedResume, originalResume } = get();

        if (!customizedResume) {
          set({ error: 'No customized resume to download' });
          return;
        }

        set({ isProcessing: true, error: null });

        try {
          const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeText: customizedResume.customizedText,
              structure: customizedResume.structure,
              fileName: originalResume?.fileName || 'resume',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }

          // Download the PDF
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${originalResume?.fileName.replace(/\.[^/.]+$/, '') || 'resume'}_customized.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          set({ isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to download PDF',
            isProcessing: false,
          });
        }
      },

      // Fetch company news
      fetchCompanyNews: async (company: string) => {
        const { jobDescription } = get();
        set({ isProcessing: true, error: null });

        try {
          const response = await fetch('/api/company-news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company,
              website: jobDescription?.url ? new URL(jobDescription.url).origin : undefined,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch company news');
          }

          const { companyNews } = await response.json();
          set({ companyNews, isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch company news',
            isProcessing: false,
          });
        }
      },

      // Generate interview brief
      generateInterviewBrief: async (format: '30min' | '60min') => {
        const { originalResume, customizedResume, jobDescription, companyNews } = get();

        // Use customized resume if available, otherwise use original
        const resumeText = customizedResume?.customizedText || originalResume?.originalText;

        if (!resumeText || !jobDescription) {
          set({ error: 'Resume and job description are required' });
          return;
        }

        set({ isProcessing: true, error: null, briefFormat: format });

        try {
          const response = await fetch('/api/generate-brief', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeText,
              jobDescription: jobDescription.description,
              companyName: jobDescription.company,
              companyNews: companyNews?.articles || [],
              format,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate interview brief');
          }

          const { interviewBrief } = await response.json();
          set({ interviewBrief, isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to generate interview brief',
            isProcessing: false,
          });
        }
      },

      // Download interview brief as PDF
      downloadBriefPDF: async () => {
        const { interviewBrief, jobDescription } = get();

        if (!interviewBrief) {
          set({ error: 'No interview brief to download' });
          return;
        }

        set({ isProcessing: true, error: null });

        try {
          const response = await fetch('/api/generate-brief-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brief: interviewBrief,
              companyName: jobDescription?.company || 'Company',
              jobTitle: jobDescription?.title || 'Position',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }

          // Download the PDF
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `interview-brief-${jobDescription?.company || 'company'}-${interviewBrief.format}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          set({ isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to download PDF',
            isProcessing: false,
          });
        }
      },

      // Set brief format
      setBriefFormat: (format: '30min' | '60min') => {
        set({ briefFormat: format });
      },

      // Set job offer
      setJobOffer: (offer: JobOffer) => {
        set({ jobOffer: offer });
      },

      // Generate negotiation strategy
      generateNegotiationStrategy: async () => {
        const { jobOffer, originalResume, customizedResume, jobDescription } = get();

        if (!jobOffer) {
          set({ error: 'Please enter your job offer details first' });
          return;
        }

        // Use customized resume if available
        const resumeText = customizedResume?.customizedText || originalResume?.originalText;

        set({ isProcessing: true, error: null });

        try {
          const response = await fetch('/api/negotiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobOffer,
              resumeText,
              jobDescription: jobDescription?.description,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate negotiation strategy');
          }

          const { negotiationStrategy } = await response.json();
          set({ negotiationStrategy, isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to generate negotiation strategy',
            isProcessing: false,
          });
        }
      },

      // Download negotiation strategy as PDF
      downloadNegotiationPDF: async () => {
        const { negotiationStrategy, jobOffer } = get();

        if (!negotiationStrategy) {
          set({ error: 'No negotiation strategy to download' });
          return;
        }

        set({ isProcessing: true, error: null });

        try {
          const response = await fetch('/api/generate-negotiation-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              strategy: negotiationStrategy,
              company: jobOffer?.company || 'Company',
              jobTitle: jobOffer?.jobTitle || 'Position',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }

          // Download the PDF
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `negotiation-strategy-${jobOffer?.company || 'offer'}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          set({ isProcessing: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to download PDF',
            isProcessing: false,
          });
        }
      },

      // Reset all state
      reset: () => {
        set({
          originalResume: null,
          jobDescription: null,
          customizedResume: null,
          companyNews: null,
          interviewBrief: null,
          briefFormat: '30min',
          jobOffer: null,
          negotiationStrategy: null,
          isProcessing: false,
          error: null,
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'resume-storage',
      partialize: (state) => ({
        // Persist resume, job description, company news, interview brief, and negotiate data
        originalResume: state.originalResume,
        jobDescription: state.jobDescription,
        companyNews: state.companyNews,
        interviewBrief: state.interviewBrief,
        briefFormat: state.briefFormat,
        jobOffer: state.jobOffer,
        negotiationStrategy: state.negotiationStrategy,
      }),
    }
  )
);
