import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { onchainService, ENSProfile } from '@/lib/onchain/config';
import { TokenBalance, Portfolio } from '@/types/shared';
import type { TokenBalance as OnchainTokenBalance, Portfolio as OnchainPortfolio } from '@/lib/onchain/config';

interface UseOnchainReturn {
  // State
  tokenBalances: TokenBalance[];
  portfolio: Portfolio | null;
  ensProfile: ENSProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshBalances: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  refreshENS: () => Promise<void>;
  
  // Computed
  totalPortfolioValue: number;
  hasTokens: boolean;
}

// Transform onchain types to shared types
const transformTokenBalance = (onchainToken: OnchainTokenBalance): TokenBalance => ({
  symbol: onchainToken.symbol,
  name: onchainToken.name,
  balance: onchainToken.balance,
  balanceFormatted: onchainToken.balanceFormatted,
  value: onchainToken.value || 0,
  isNative: onchainToken.isNative,
  address: onchainToken.address,
  decimals: onchainToken.decimals,
  price: onchainToken.price,
  change24h: onchainToken.change24h,
});

const transformPortfolio = (onchainPortfolio: OnchainPortfolio): Portfolio => ({
  totalValue: onchainPortfolio.totalValue,
  totalChange24h: onchainPortfolio.totalChange24h,
  tokens: onchainPortfolio.tokens.map(transformTokenBalance),
});

export function useOnchain(): UseOnchainReturn {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [ensProfile, setENSProfile] = useState<ENSProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh token balances
  const refreshBalances = useCallback(async () => {
    if (!address || !isConnected) {
      setTokenBalances([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const balances = await onchainService.getTokenBalances(address, chainId);
      setTokenBalances(balances.map(transformTokenBalance));
    } catch (error) {
      console.error('Error refreshing balances:', error);
      setError('Failed to fetch token balances');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, chainId]);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(async () => {
    if (!address || !isConnected) {
      setPortfolio(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const portfolioData = await onchainService.getPortfolio(address, chainId);
      setPortfolio(transformPortfolio(portfolioData));
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
      setError('Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, chainId]);

  // Refresh ENS profile
  const refreshENS = useCallback(async () => {
    if (!address || !isConnected) {
      setENSProfile(null);
      return;
    }

    try {
      const profile = await onchainService.getENSProfile(address);
      setENSProfile(profile);
    } catch (error) {
      console.error('Error refreshing ENS profile:', error);
      // Don't set error for ENS failures as it's not critical
    }
  }, [address, isConnected]);

  // Auto-refresh data when wallet connects or chain changes
  useEffect(() => {
    if (isConnected && address) {
      refreshBalances();
      refreshPortfolio();
      refreshENS();
    } else {
      setTokenBalances([]);
      setPortfolio(null);
      setENSProfile(null);
    }
  }, [isConnected, address, chainId, refreshBalances, refreshPortfolio, refreshENS]);

  // Computed values
  const totalPortfolioValue = portfolio?.totalValue || 0;
  const hasTokens = tokenBalances.some(token => parseFloat(token.balanceFormatted) > 0);

  return {
    // State
    tokenBalances,
    portfolio,
    ensProfile,
    isLoading,
    error,
    
    // Actions
    refreshBalances,
    refreshPortfolio,
    refreshENS,
    
    // Computed
    totalPortfolioValue,
    hasTokens,
  };
}