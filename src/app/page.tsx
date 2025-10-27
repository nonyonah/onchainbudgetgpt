'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useWallet } from '@/hooks/useWallet';
import { useBank } from '@/hooks/useBank';
import { useOnchain } from '@/hooks/useOnchain';

export default function Home() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const { connectBank, connectedBanks, isConnecting, error } = useBank();
  const { tokenBalances, portfolio, ensProfile, hasTokens } = useOnchain();

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleConnectBank = async () => {
    try {
      connectBank();
    } catch (error) {
      console.error('Failed to connect bank:', error);
    }
  };

  return (
    <main className="h-screen overflow-hidden">
      <ChatInterface
        onConnectWallet={handleConnectWallet}
        onConnectBank={handleConnectBank}
        isWalletConnected={isConnected}
        isBankConnected={connectedBanks > 0}
      />
    </main>
  );
}
