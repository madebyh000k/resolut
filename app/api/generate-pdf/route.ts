import { NextRequest, NextResponse } from 'next/server';
import { generateResumePDF } from '@/lib/generators/pdf-generator';
import { ResumeStructure } from '@/lib/utils/structure-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, structure, fileName } = body;

    if (!resumeText || !structure) {
      return NextResponse.json(
        { error: 'Resume text and structure are required' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateResumePDF(
      resumeText,
      structure as ResumeStructure
    );

    // Create filename
    const sanitizedFileName = (fileName || 'resume')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const finalFileName = `${sanitizedFileName}_customized.pdf`;

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${finalFileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
