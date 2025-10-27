import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import type { Database } from './types';

// Create Supabase client
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Helper functions for common operations
export const supabaseHelpers = {
  // User session management
  async createUserSession(walletAddress: string, sessionData: any) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        wallet_address: walletAddress,
        session_data: sessionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSession(sessionId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  },

  // Chat management
  async storeChatMessage(sessionId: string, message: any) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        message_type: message.type,
        content: message.content,
        metadata: message.metadata || {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getChatHistory(sessionId: string, limit = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Transaction data
  async storeTransactionData(sessionId: string, transactions: any[]) {
    const { data, error } = await supabase
      .from('transaction_summaries')
      .insert(
        transactions.map(tx => ({
          session_id: sessionId,
          transaction_hash: tx.hash,
          transaction_type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          category: tx.category,
          metadata: tx.metadata || {},
          created_at: new Date().toISOString(),
        }))
      )
      .select();

    if (error) throw error;
    return data;
  },

  async getTransactionSummary(sessionId: string, filters?: any) {
    let query = supabase
      .from('transaction_summaries')
      .select('*')
      .eq('session_id', sessionId);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // User preferences
  async updateUserPreferences(sessionId: string, preferences: any) {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};