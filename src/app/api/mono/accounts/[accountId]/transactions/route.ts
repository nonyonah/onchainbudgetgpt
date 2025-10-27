import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;
    const { searchParams } = new URL(request.url);
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Extract query parameters
    const limit = searchParams.get('limit') || '50';
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Build query parameters for Mono API
    const queryParams = new URLSearchParams({
      limit,
      ...(start && { start }),
      ...(end && { end })
    });

    // Make request to Mono API
    const response = await fetch(
      `https://api.withmono.com/accounts/${accountId}/transactions?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'mono-sec-key': process.env.MONO_SECRET_KEY || '',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch transactions', details: errorData },
        { status: response.status }
      );
    }

    const transactionData = await response.json();
    
    return NextResponse.json(transactionData);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}