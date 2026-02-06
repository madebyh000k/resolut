import { ResumeStructure } from '@/lib/utils/structure-analyzer';

export interface Resume {
  id: string;
  fileName: string;
  originalText: string;
  structure: ResumeStructure;
  fileType: 'pdf' | 'docx';
  uploadedAt: Date;
}

export interface CustomizedResume {
  id: string;
  originalResumeId: string;
  customizedText: string;
  structure: ResumeStructure;
  keywordsAdded: string[];
  toneProfile?: ToneProfile;
  customizedAt: Date;
}

export interface ToneProfile {
  formality: 'casual' | 'professional' | 'formal';
  voice: 'active' | 'passive' | 'mixed';
  personality: string[];
  commonPatterns: string[];
  vocabulary: 'technical' | 'business' | 'creative' | 'mixed';
}
