import { NextRequest, NextResponse } from 'next/server';
import { generateBriefPDF } from '@/lib/generators/brief-pdf-generator';
import { InterviewBrief } from '@/types/prepare';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brief, companyName, jobTitle } = body;

    if (!brief) {
      return NextResponse.json(
        { error: 'Interview brief is required' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateBriefPDF(
      brief as InterviewBrief,
      companyName || 'Company',
      jobTitle || 'Position'
    );

    // Create filename
    const sanitizedCompanyName = (companyName || 'company')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const format = brief.format || '30min';
    const finalFileName = `interview-brief-${sanitizedCompanyName}-${format}.pdf`;

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
