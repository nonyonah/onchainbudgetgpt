/**
 * Custom hooks for wallet functionality
 */

import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const [isClient, setIsClient] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: balance } = useBalance({
    address: address,
  });

  const connectWallet = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const getFormattedBalance = () => {
    if (!balance) return '0';
    return parseFloat(formatEther(balance.value)).toFixed(4);
  };

  const getNetworkName = () => {
    if (!chain) return 'Unknown';
    return chain.name;
  };

  const getShortAddress = () => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    // Connection state
    isConnected: isClient ? isConnected : false,
    address,
    chain,
    
    // Balance info
    balance: balance?.value,
    formattedBalance: getFormattedBalance(),
    symbol: balance?.symbol || 'ETH',
    
    // Helper functions
    connectWallet,
    disconnectWallet,
    getNetworkName,
    getShortAddress,
    
    // UI helpers
    isClient,
  };
}

export function useWalletTransactions() {
  const { address, chain } = useAccount();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!address || !chain) return;

    setIsLoading(true);
    try {
      // TODO: Implement transaction fetching using OnchainKit or direct RPC calls
      // For now, return mock data
      const mockTransactions = [
        {
          hash: '0x123...',
          from: address,
          to: '0x456...',
          value: '1000000000000000000', // 1 ETH in wei
          timestamp: new Date().toISOString(),
          type: 'send',
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address && chain) {
      fetchTransactions();
    }
  }, [address, chain]);

  return {
    transactions,
    isLoading,
    refetch: fetchTransactions,
  };
}

export function useWalletAssets() {
  const { address, chain } = useAccount();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssets = async () => {
    if (!address || !chain) return;

    setIsLoading(true);
    try {
      // TODO: Implement asset fetching using OnchainKit
      // For now, return mock data
      const mockAssets = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: '1.5',
          value: '$3,750',
          change24h: '+2.5%',
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '1,000',
          value: '$1,000',
          change24h: '0%',
        },
      ];
      setAssets(mockAssets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address && chain) {
      fetchAssets();
    }
  }, [address, chain]);

  return {
    assets,
    isLoading,
    refetch: fetchAssets,
  };
}