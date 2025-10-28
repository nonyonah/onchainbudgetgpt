'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient } from '@/lib/wallet/config';

interface WalletProviderProps {
  children: ReactNode;
}

// Error fallback component
function WalletErrorFallback({ children }: { children: ReactNode }) {
  console.warn('Wallet provider failed to initialize, continuing without wallet functionality');
  return <>{children}</>;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  try {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  } catch (error) {
    console.error('Failed to initialize wallet provider:', error);
    return <WalletErrorFallback>{children}</WalletErrorFallback>;
  }
}