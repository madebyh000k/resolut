import { NextRequest, NextResponse } from 'next/server';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us15';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tags } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
      console.error('Mailchimp configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const data = {
      email_address: email,
      status: 'subscribed',
      tags: tags || [],
    };

    console.log('Subscribing to Mailchimp:', { email, tags });

    const response = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    if (response.ok) {
      console.log('Mailchimp subscription successful:', responseData);
      return NextResponse.json(
        {
          success: true,
          message:
            'Email added to Mailchimp with beta-tester tag. Welcome email will be sent automatically.',
        },
        { status: 200 }
      );
    } else {
      console.error('Mailchimp API error:', responseData);
      // Return Mailchimp error details
      return NextResponse.json(
        {
          error: responseData.detail || responseData.title || 'Failed to subscribe',
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Mailchimp API error:', error);
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
