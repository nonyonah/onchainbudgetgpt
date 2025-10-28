// Import the connect function from mono package
let MonoConnect: any;
try {
  // The mono package exports a connect function, not a MonoConnect class
  const monoPackage = require('@mono.co/connect.js');
  MonoConnect = monoPackage.connect || monoPackage.default || monoPackage;
} catch (error) {
  console.warn('Mono connect could not be imported:', error);
  MonoConnect = null;
}

export interface MonoConfig {
  publicKey: string;
  environment: 'production' | 'sandbox';
  scope: string[];
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  accountNumber: string;
  bankName: string;
  isConnected: boolean;
  lastSynced?: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: Date;
  type: 'debit' | 'credit';
  balance: number;
  reference?: string;
  location?: string;
}

export interface MonoAuthData {
  code: string;
  accountId: string;
  accountName: string;
  bankName: string;
  bankCode: string;
}

export class MonoConnectService {
  private monoConnect: any;
  private config: MonoConfig;

  constructor(config: MonoConfig) {
    this.config = config;
    this.initializeMonoConnect();
  }

  private initializeMonoConnect() {
    if (!MonoConnect) {
      console.warn('Mono connect is not available');
      return;
    }

    try {
      const options = {
        key: this.config.publicKey,
        // Spread config first, then override specific properties
        ...this.config,
        onSuccess: this.config.onSuccess,
        onClose: this.config.onClose,
        onError: this.config.onError
      };

      // The mono connect function can be called as a function or constructor
      if (typeof MonoConnect === 'function') {
        this.monoConnect = MonoConnect(options);
      } else {
        console.warn('Mono connect is not a function');
      }
    } catch (error) {
      console.error('Failed to initialize Mono connect:', error);
      this.monoConnect = null;
    }
  }

  public open() {
    if (this.monoConnect && typeof this.monoConnect.setup === 'function') {
      this.monoConnect.setup();
    } else {
      console.warn('Mono connect is not available or setup method is not accessible');
    }
  }

  public close() {
    if (this.monoConnect && typeof this.monoConnect.close === 'function') {
      this.monoConnect.close();
    } else {
      console.warn('Mono connect is not available or close method is not accessible');
    }
  }

  // Fetch account information
  public async getAccountInfo(accountId: string): Promise<BankAccount | null> {
    try {
      const response = await fetch(`/api/mono/accounts/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch account info');
      }

      const data = await response.json();
      return {
        id: data.account.id,
        name: data.account.name,
        type: data.account.type,
        balance: data.account.balance,
        currency: data.account.currency,
        accountNumber: data.account.accountNumber,
        bankName: data.account.institution.name,
        isConnected: true,
        lastSynced: new Date()
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      return null;
    }
  }

  // Fetch transactions for an account
  public async getTransactions(
    accountId: string, 
    startDate?: Date, 
    endDate?: Date,
    limit: number = 50
  ): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(startDate && { start: startDate.toISOString().split('T')[0] }),
        ...(endDate && { end: endDate.toISOString().split('T')[0] })
      });

      const response = await fetch(`/api/mono/accounts/${accountId}/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      return data.data.map((tx: any) => ({
        id: tx.id,
        accountId: accountId,
        amount: Math.abs(tx.amount),
        currency: tx.currency,
        description: tx.narration,
        category: this.categorizeTransaction(tx.narration),
        date: new Date(tx.date),
        type: tx.type === 'debit' ? 'debit' : 'credit',
        balance: tx.balance,
        reference: tx.reference,
        location: tx.location
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // Simple transaction categorization
  private categorizeTransaction(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('transfer') || desc.includes('send')) return 'Transfer';
    if (desc.includes('atm') || desc.includes('withdrawal')) return 'Cash Withdrawal';
    if (desc.includes('grocery') || desc.includes('supermarket')) return 'Groceries';
    if (desc.includes('fuel') || desc.includes('gas') || desc.includes('petrol')) return 'Transportation';
    if (desc.includes('restaurant') || desc.includes('food') || desc.includes('dining')) return 'Food & Dining';
    if (desc.includes('subscription') || desc.includes('netflix') || desc.includes('spotify')) return 'Subscriptions';
    if (desc.includes('salary') || desc.includes('payroll')) return 'Income';
    if (desc.includes('bill') || desc.includes('utility') || desc.includes('electricity')) return 'Bills & Utilities';
    if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('store')) return 'Shopping';
    if (desc.includes('medical') || desc.includes('hospital') || desc.includes('pharmacy')) return 'Healthcare';
    
    return 'Other';
  }

  // Get spending summary by category
  public async getSpendingSummary(
    accountId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Record<string, number>> {
    const transactions = await this.getTransactions(accountId, startDate, endDate);
    const summary: Record<string, number> = {};

    transactions
      .filter(tx => tx.type === 'debit')
      .forEach(tx => {
        summary[tx.category] = (summary[tx.category] || 0) + tx.amount;
      });

    return summary;
  }
}

// Default configuration
export const defaultMonoConfig: Partial<MonoConfig> = {
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  scope: ['auth', 'transactions', 'identity'],
};