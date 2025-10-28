import { useState, useEffect, useCallback } from 'react';
import { MonoConnectService, BankAccount, MonoAuthData, defaultMonoConfig } from '@/lib/mono/config';
import type { Transaction as MonoTransaction } from '@/lib/mono/config';
import { Transaction } from '@/types/shared';
import { supabase } from '@/lib/supabase/client';
import { useWallet } from './useWallet';

// Transform mono transaction to shared transaction format
const transformTransaction = (monoTx: MonoTransaction): Transaction => ({
  id: monoTx.id,
  accountId: monoTx.accountId,
  amount: Math.abs(monoTx.amount),
  category: monoTx.category,
  date: monoTx.date,
  description: monoTx.description,
  type: monoTx.type === 'credit' ? 'income' : 'expense',
});

interface UseBankReturn {
  // State
  accounts: BankAccount[];
  transactions: Transaction[];
  isConnecting: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  connectBank: () => void;
  disconnectBank: (accountId: string) => void;
  refreshTransactions: (accountId: string) => Promise<void>;
  getSpendingSummary: (accountId: string, days?: number) => Promise<Record<string, number>>;
  
  // Computed
  totalBalance: number;
  connectedBanks: number;
}

export function useBank(): UseBankReturn {
  const { address } = useWallet();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monoService, setMonoService] = useState<MonoConnectService | null>(null);

  const refreshTransactions = useCallback(async (accountId: string) => {
    if (!monoService) return;

    try {
      setIsLoading(true);
      
      // Fetch last 30 days of transactions
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const newTransactions = await monoService.getTransactions(
        accountId,
        startDate,
        endDate,
        100
      );

      // Update transactions state
      setTransactions(prev => {
        // Remove existing transactions for this account
        const filtered = prev.filter(tx => tx.accountId !== accountId);
        return [...filtered, ...newTransactions.map(transformTransaction)];
      });

    } catch (error) {
      console.error('Error refreshing transactions:', error);
      setError('Failed to refresh transactions');
    } finally {
      setIsLoading(false);
    }
  }, [monoService]);

  const loadSavedAccounts = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      
      // Load accounts from Supabase
      const { data: sessionData } = await supabase
        .from('user_sessions')
        .select('session_data')
        .eq('wallet_address', address)
        .single();

      if (sessionData?.session_data && typeof sessionData.session_data === 'object') {
        const sessionObj = sessionData.session_data as any;
        if (sessionObj.bank_accounts) {
          const savedAccounts = sessionObj.bank_accounts;
          setAccounts(savedAccounts);
          
          // Load recent transactions for each account
          for (const account of savedAccounts) {
            await refreshTransactions(account.id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved accounts:', error);
      setError('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  }, [address, refreshTransactions]);

  // Initialize Mono Connect service
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY) {
      setError('Mono public key not configured');
      return;
    }

    const handleMonoSuccess = async (data: MonoAuthData) => {
      try {
        setIsConnecting(true);
        setError(null);

        if (!monoService) {
          throw new Error('Mono service not initialized');
        }

        // Fetch account information
        const accountInfo = await monoService.getAccountInfo(data.accountId);
        
        if (!accountInfo) {
          throw new Error('Failed to fetch account information');
        }

        // Add to accounts list
        const updatedAccounts = [...accounts, accountInfo];
        setAccounts(updatedAccounts);

        // Save to Supabase
         if (address) {
           await supabase
             .from('user_sessions')
             .upsert({
               wallet_address: address,
               session_data: { bank_accounts: updatedAccounts } as any,
               updated_at: new Date().toISOString()
             });
         }

        // Fetch initial transactions
        await refreshTransactions(accountInfo.id);

      } catch (error) {
        console.error('Error handling Mono success:', error);
        setError('Failed to connect bank account');
      } finally {
        setIsConnecting(false);
      }
    };

    const handleMonoError = (error: any) => {
      console.error('Mono Connect error:', error);
      setError('Failed to connect to bank');
      setIsConnecting(false);
    };

    const handleMonoClose = () => {
      setIsConnecting(false);
    };

    const service = new MonoConnectService({
      publicKey: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY,
      ...defaultMonoConfig,
      onSuccess: handleMonoSuccess,
      onError: handleMonoError,
      onClose: handleMonoClose,
    } as any);

    setMonoService(service);
  }, [accounts, address, refreshTransactions]);

  // Load saved accounts on wallet connection
  useEffect(() => {
    if (address) {
      loadSavedAccounts();
    } else {
      setAccounts([]);
      setTransactions([]);
    }
  }, [address, loadSavedAccounts]);

  const connectBank = useCallback(() => {
    if (!monoService) {
      setError('Bank connection service not available');
      return;
    }

    setIsConnecting(true);
    setError(null);
    monoService.open();
  }, [monoService]);

  const disconnectBank = useCallback(async (accountId: string) => {
    try {
      // Remove from local state
      const updatedAccounts = accounts.filter(account => account.id !== accountId);
      setAccounts(updatedAccounts);

      // Remove transactions for this account
      setTransactions(prev => prev.filter(tx => tx.accountId !== accountId));

      // Update Supabase
      if (address) {
        await supabase
          .from('user_sessions')
          .upsert({
            wallet_address: address,
            session_data: { bank_accounts: updatedAccounts } as any,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error disconnecting bank:', error);
      setError('Failed to disconnect bank account');
    }
  }, [accounts, address]);

  const getSpendingSummary = useCallback(async (
    accountId: string, 
    days: number = 30
  ): Promise<Record<string, number>> => {
    if (!monoService) return {};

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await monoService.getSpendingSummary(accountId, startDate, endDate);
    } catch (error) {
      console.error('Error getting spending summary:', error);
      return {};
    }
  }, [monoService]);

  // Computed values
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const connectedBanks = accounts.length;

  return {
    // State
    accounts,
    transactions,
    isConnecting,
    isLoading,
    error,
    
    // Actions
    connectBank,
    disconnectBank,
    refreshTransactions,
    getSpendingSummary,
    
    // Computed
    totalBalance,
    connectedBanks,
  };
}