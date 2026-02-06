import { NextRequest, NextResponse } from 'next/server';
import { parseDOCX } from '@/lib/parsers/docx-parser';
import { analyzeResumeStructure } from '@/lib/utils/structure-analyzer';
import { Resume } from '@/types/resume';

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'); // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isPDF = fileName.endsWith('.pdf');
    const isDOCX = fileName.endsWith('.docx');

    if (!isPDF && !isDOCX) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX files are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse based on file type
    let parsedText: string;

    if (isPDF) {
      // Use unpdf library which is designed for modern Next.js
      // unpdf expects Uint8Array, not Buffer
      const { extractText } = await import('unpdf');
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfData = await extractText(uint8Array);
      // unpdf returns an array of strings (one per page), join them
      parsedText = pdfData.text.join('\n\n');
    } else {
      const buffer = Buffer.from(arrayBuffer);
      const docxData = await parseDOCX(buffer);
      parsedText = docxData.text;
    }

    // Analyze structure
    const structure = analyzeResumeStructure(parsedText);

    // Create resume object
    const resume: Resume = {
      id: crypto.randomUUID(),
      fileName: file.name,
      originalText: parsedText,
      structure,
      fileType: isPDF ? 'pdf' : 'docx',
      uploadedAt: new Date(),
    };

    return NextResponse.json({ resume }, { status: 200 });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      {
        error: `Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
