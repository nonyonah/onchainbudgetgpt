import { base, mainnet, arbitrum, polygon, optimism } from 'wagmi/chains';

// OnchainKit Configuration
export const onchainConfig = {
  apiKey: process.env.NEXT_PUBLIC_COINBASE_API_KEY || '',
  chains: [mainnet, base, arbitrum, polygon, optimism],
  defaultChain: base,
};

// Supported tokens for balance checking
export const SUPPORTED_TOKENS: Record<number, Array<{
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
}>> = {
  [mainnet.id]: [
    {
      address: '0xA0b86a33E6441b8435b662f0E2d0B8e6c8c8b9f8', // ETH (native)
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isNative: false,
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      isNative: false,
    },
  ],
  [base.id]: [
    {
      address: '0x0000000000000000000000000000000000000000', // ETH (native)
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isNative: false,
    },
  ],
  [arbitrum.id]: [
    {
      address: '0x0000000000000000000000000000000000000000', // ETH (native)
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true,
    },
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isNative: false,
    },
  ],
};

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
  price?: number;
  value?: number;
  change24h?: number;
  isNative: boolean;
}

export interface Portfolio {
  totalValue: number;
  totalChange24h: number;
  tokens: TokenBalance[];
  nfts?: NFTAsset[];
}

export interface NFTAsset {
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  image?: string;
  collection: string;
  floorPrice?: number;
  lastSale?: number;
}

export interface ENSProfile {
  name: string;
  address: string;
  avatar?: string;
  description?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  type: 'send' | 'receive' | 'swap' | 'mint' | 'approve' | 'other';
  tokenTransfers?: {
    from: string;
    to: string;
    token: string;
    amount: string;
    symbol: string;
  }[];
}

// Utility functions for onchain data
export class OnchainService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get token balances for an address
  async getTokenBalances(address: string, chainId: number): Promise<TokenBalance[]> {
    try {
      const tokens = SUPPORTED_TOKENS[chainId] || [];
      const balances: TokenBalance[] = [];

      for (const token of tokens) {
        try {
          let balance = '0';
          
          if (token.isNative) {
            // Get native token balance (ETH)
            const response = await fetch(`/api/onchain/balance/${address}?chainId=${chainId}`);
            if (response.ok) {
              const data = await response.json();
              balance = data.balance;
            }
          } else {
            // Get ERC-20 token balance
            const response = await fetch(`/api/onchain/token-balance/${address}?tokenAddress=${token.address}&chainId=${chainId}`);
            if (response.ok) {
              const data = await response.json();
              balance = data.balance;
            }
          }

          const balanceFormatted = this.formatBalance(balance, token.decimals);
          
          balances.push({
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            balance,
            balanceFormatted,
            decimals: token.decimals,
            isNative: token.isNative,
          });
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
        }
      }

      return balances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  // Get ENS profile for an address
  async getENSProfile(address: string): Promise<ENSProfile | null> {
    try {
      const response = await fetch(`/api/onchain/ens/${address}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.profile || null;
    } catch (error) {
      console.error('Error fetching ENS profile:', error);
      return null;
    }
  }

  // Get transaction history
  async getTransactionHistory(address: string, chainId: number, limit: number = 20): Promise<TransactionData[]> {
    try {
      const response = await fetch(`/api/onchain/transactions/${address}?chainId=${chainId}&limit=${limit}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get portfolio summary
  async getPortfolio(address: string, chainId: number): Promise<Portfolio> {
    try {
      const tokens = await this.getTokenBalances(address, chainId);
      
      // Calculate total value (would need price data in real implementation)
      const totalValue = tokens.reduce((sum, token) => {
        const value = parseFloat(token.balanceFormatted) * (token.price || 0);
        return sum + value;
      }, 0);

      return {
        totalValue,
        totalChange24h: 0, // Would calculate from price changes
        tokens,
        nfts: [], // Would fetch NFTs separately
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return {
        totalValue: 0,
        totalChange24h: 0,
        tokens: [],
        nfts: [],
      };
    }
  }

  // Format balance with proper decimals
  private formatBalance(balance: string, decimals: number): string {
    const balanceNum = parseFloat(balance) / Math.pow(10, decimals);
    return balanceNum.toFixed(6);
  }

  // Categorize transaction type
  categorizeTransaction(tx: any): 'send' | 'receive' | 'swap' | 'mint' | 'approve' | 'other' {
    if (tx.methodId) {
      if (tx.methodId.startsWith('0xa9059cbb')) return 'send'; // transfer
      if (tx.methodId.startsWith('0x095ea7b3')) return 'approve'; // approve
      if (tx.methodId.startsWith('0x7ff36ab5')) return 'swap'; // swap
      if (tx.methodId.startsWith('0x40c10f19')) return 'mint'; // mint
    }
    
    if (tx.value && parseFloat(tx.value) > 0) {
      return tx.from.toLowerCase() === tx.to.toLowerCase() ? 'send' : 'receive';
    }
    
    return 'other';
  }
}

// Export singleton instance
export const onchainService = new OnchainService(onchainConfig.apiKey);