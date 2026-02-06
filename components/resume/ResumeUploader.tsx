'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { Card } from '@/components/ui/card';

export function ResumeUploader() {
  const { originalResume, isProcessing, uploadResume } = useResumeStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadResume(acceptedFiles[0]);
      }
    },
    [uploadResume]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isProcessing,
  });

  if (originalResume && !isProcessing) {
    return (
      <Card className="p-6 border-2 border-success">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <FileText className="h-12 w-12 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{originalResume.fileName}</h3>
            <p className="text-text-secondary text-sm">
              {originalResume.fileType.toUpperCase()} • Uploaded successfully
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      {...getRootProps()}
      className={`p-12 border-2 border-dashed cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-text-muted hover:border-primary hover:bg-surface'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {isProcessing ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div>
              <p className="text-lg font-medium">Processing your resume...</p>
              <p className="text-sm text-text-secondary mt-1">This may take a few moments</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Drag & drop or click to browse • PDF or DOCX • Max 5MB
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
