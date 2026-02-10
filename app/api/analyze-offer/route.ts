import { NextRequest, NextResponse } from 'next/server';
import { analyzeAndAdvise } from '@/lib/negotiation/negotiateAnalyzer';
import { OfferInput } from '@/types/offer-advice';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['baseSalary', 'company', 'role', 'location'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate base salary is a number
    if (typeof body.baseSalary !== 'number' || body.baseSalary <= 0) {
      return NextResponse.json(
        { error: 'baseSalary must be a positive number' },
        { status: 400 }
      );
    }

    // Construct input
    const input: OfferInput = {
      baseSalary: body.baseSalary,
      equity: body.equity,
      bonus: body.bonus,
      company: body.company,
      role: body.role,
      location: body.location,
      yearsOfExperience: body.yearsOfExperience,
    };

    // Get negotiation advice
    const advice = await analyzeAndAdvise(input);

    return NextResponse.json({
      success: true,
      advice,
    });
  } catch (error) {
    console.error('Error analyzing offer:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to analyze offer',
      },
      { status: 500 }
    );
  }
}
