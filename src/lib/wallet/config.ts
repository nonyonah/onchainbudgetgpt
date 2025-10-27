/**
 * Wallet configuration for Reown (WalletConnect) integration
 */

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, base, polygon, optimism } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '../config';

// Get projectId from environment
const projectId = config.reown.projectId;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set');
}

// Create a metadata object
const metadata = {
  name: 'OnchainBudget GPT',
  description: 'AI budgeting assistant for onchain and offchain finances',
  url: config.app.url,
  icons: [`${config.app.url}/favicon.ico`],
};

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum, base, polygon, optimism],
  projectId,
  ssr: true,
});

// Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, base, polygon, optimism],
  metadata,
  projectId,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple'],
    emailShowWallets: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#0a0a0a',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#3b82f6',
    '--w3m-border-radius-master': '12px',
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Create query client
export const queryClient = new QueryClient();

// Supported networks for the app
export const supportedNetworks = {
  ethereum: mainnet,
  arbitrum,
  base,
  polygon,
  optimism,
} as const;

export type SupportedNetwork = keyof typeof supportedNetworks;