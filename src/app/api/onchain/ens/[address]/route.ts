import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
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

    // For demo purposes, return mock ENS data for some addresses
    // In production, you would use actual ENS resolution
    const mockProfiles: Record<string, any> = {
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': {
        name: 'vitalik.eth',
        address,
        avatar: 'https://metadata.ens.domains/mainnet/avatar/vitalik.eth',
        description: 'Ethereum co-founder',
        twitter: 'VitalikButerin',
        website: 'https://vitalik.ca'
      }
    };

    const profile = mockProfiles[address.toLowerCase()];
    
    if (profile) {
      return NextResponse.json({ profile });
    } else {
      // Check if address might have an ENS name (simplified check)
      const hasEns = Math.random() > 0.8; // 20% chance for demo
      
      if (hasEns) {
        return NextResponse.json({
          profile: {
            name: `user${address.slice(-4)}.eth`,
            address,
            avatar: null,
            description: null
          }
        });
      } else {
        return NextResponse.json({ profile: null });
      }
    }
  } catch (error) {
    console.error('Error fetching ENS profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}