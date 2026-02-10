import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { email, tags } = await request.json();

    // Validate
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check environment variables
    if (!process.env.MAILCHIMP_API_KEY) {
      console.error('MAILCHIMP_API_KEY not set');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    if (!process.env.MAILCHIMP_AUDIENCE_ID) {
      console.error('MAILCHIMP_AUDIENCE_ID not set');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || 'us15';

    // Prepare Mailchimp data
    const data = {
      email_address: email,
      status: 'subscribed',
      tags: tags || [],
    };

    console.log('Subscribing to Mailchimp:', { email, tags });

    // Call Mailchimp API
    const mailchimpResponse = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await mailchimpResponse.json();

    if (mailchimpResponse.ok) {
      console.log('Mailchimp subscription successful:', responseData);
      return NextResponse.json({
        success: true,
        message:
          'Email added to Mailchimp with beta-tester tag. Welcome email will be sent automatically.',
      });
    } else {
      console.error('Mailchimp error:', responseData);

      // Handle "already subscribed" gracefully
      if (
        responseData.title === 'Member Exists' ||
        responseData.detail?.toLowerCase().includes('already a list member')
      ) {
        return NextResponse.json(
          {
            error: 'This email is already registered. Check your inbox!',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: responseData.detail || responseData.title || 'Subscription failed',
        },
        { status: mailchimpResponse.status }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
