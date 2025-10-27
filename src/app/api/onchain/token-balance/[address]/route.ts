import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const chainId = searchParams.get('chainId') || '1';
    
    if (!address || !tokenAddress) {
      return NextResponse.json(
        { error: 'Address and tokenAddress are required' },
        { status: 400 }
      );
    }

    // Validate address formats
    if (!/^0x[a-fA-F0-9]{40}$/.test(address) || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // For demo purposes, return mock data
    // In production, you would use actual contract calls or OnchainKit APIs
    const mockBalance = Math.random() * 1000; // Random balance between 0-1000 tokens
    const decimals = tokenAddress.toLowerCase().includes('usdc') ? 6 : 18;
    
    return NextResponse.json({
      address,
      tokenAddress,
      chainId: parseInt(chainId),
      balance: (mockBalance * Math.pow(10, decimals)).toString(),
      balanceFormatted: mockBalance.toFixed(decimals === 6 ? 2 : 6),
      decimals
    });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}