/**
 * Configuration file for OnchainBudget GPT
 * Manages all environment variables and app settings
 */

export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Gemini AI Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
  },

  // Reown (WalletConnect) Configuration
  reown: {
    projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
  },

  // Mono Connect Configuration
  mono: {
    publicKey: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY!,
    secretKey: process.env.MONO_SECRET_KEY!,
  },

  // Coinbase OnchainKit Configuration
  coinbase: {
    apiKey: process.env.NEXT_PUBLIC_COINBASE_API_KEY!,
  },

  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'OnchainBudget GPT',
    description: 'AI budgeting assistant for onchain and offchain finances',
  },

  // NextAuth Configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // Development Configuration
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;

// Validation function to check if all required environment variables are set
export function validateConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_REOWN_PROJECT_ID',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Supported blockchain networks
export const SUPPORTED_CHAINS = {
  ethereum: 1,
  base: 8453,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
} as const;

// Supported currencies
export const SUPPORTED_CURRENCIES = {
  USD: 'USD',
  NGN: 'NGN',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;

export type SupportedChain = keyof typeof SUPPORTED_CHAINS;
export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;