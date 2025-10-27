import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId') || '1';
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // For demo purposes, return mock data
    // In production, you would use actual RPC calls or OnchainKit APIs
    const mockBalance = Math.random() * 10; // Random balance between 0-10 ETH
    
    return NextResponse.json({
      address,
      chainId: parseInt(chainId),
      balance: (mockBalance * Math.pow(10, 18)).toString(), // Convert to wei
      balanceFormatted: mockBalance.toFixed(6),
      symbol: 'ETH',
      decimals: 18
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}