'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resume, CustomizedResume } from '@/types/resume';
import { JobDescription } from '@/types/job';

interface ResumeStore {
  // State
  originalResume: Resume | null;
  jobDescription: JobDescription | null;
  customizedResume: CustomizedResume | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  uploadResume: (file: File) => Promise<void>;
  setJobDescription: (url: string) => Promise<void>;
  customizeResume: () => Promise<void>;
  downloadPDF: () => Promise<void>;
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
          const response = await fetch('/api/customize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeId: originalResume.id,
              resumeText: originalResume.originalText,
              jobDescription: jobDescription.description,
              keywords: jobDescription.keywords,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to customize resume');
          }

          const { customizedResume } = await response.json();
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

      // Reset all state
      reset: () => {
        set({
          originalResume: null,
          jobDescription: null,
          customizedResume: null,
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
        // Only persist resume and job description, not processing state
        originalResume: state.originalResume,
        jobDescription: state.jobDescription,
      }),
    }
  )
);
