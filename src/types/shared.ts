// Shared types used across the application

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  value: number;
  isNative: boolean;
  address?: string;
  decimals?: number;
  price?: number;
  change24h?: number;
}

export interface Portfolio {
  totalValue: number;
  totalChange24h: number;
  tokens: TokenBalance[];
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  category: string;
  date: string | Date;
  description: string;
  type: 'income' | 'expense';
}