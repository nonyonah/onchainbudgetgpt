import { useState, useEffect, useCallback } from 'react';
import { supabaseHelpers } from '@/lib/supabase/client';
import { useWallet } from './useWallet';
import { useBank } from './useBank';
import { useOnchain } from './useOnchain';
import type { ChatMessage } from '@/types/chat';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  isTyping: boolean;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const { address, isConnected } = useWallet();
  const { accounts, transactions, totalBalance } = useBank();
  const { tokenBalances, portfolio, ensProfile, totalPortfolioValue } = useOnchain();

  // Initialize session when wallet connects
  useEffect(() => {
    if (isConnected && address && !sessionId) {
      initializeSession();
    }
  }, [isConnected, address, sessionId]);

  const initializeSession = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      
      // Create new session
      const session = await supabaseHelpers.createUserSession(address, {
        walletAddress: address,
        connectedAt: new Date().toISOString(),
      });

      setSessionId(session.id);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hey there! 👋 I'm OnchainBudget GPT, your AI financial assistant. I can help you track spending across your crypto wallets and traditional bank accounts. What would you like to know about your finances?`,
        timestamp: new Date(),
        actions: [
          { id: 'connect-bank', label: 'Connect Bank Account', type: 'primary' },
          { id: 'view-portfolio', label: 'View Portfolio', type: 'secondary' },
        ],
      };

      setMessages([welcomeMessage]);
      
      // Store welcome message in database
      await supabaseHelpers.storeChatMessage(session.id, {
        type: 'assistant',
        content: welcomeMessage.content,
        metadata: { actions: welcomeMessage.actions },
      });

    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Store user message in database
      await supabaseHelpers.storeChatMessage(sessionId, {
        type: 'user',
        content: userMessage.content,
        metadata: {},
      });

      // Send to Gemini AI for processing
      try {
        // Import Gemini AI dynamically to avoid SSR issues
        const { geminiAI } = await import('@/lib/ai/gemini');
        
        // Get context for AI response
        const context = {
          walletData: address ? { 
            address, 
            isConnected,
            ensProfile: ensProfile ? {
              name: ensProfile.name,
              avatar: ensProfile.avatar,
              description: ensProfile.description
            } : null
          } : null,
          onchainData: tokenBalances.length > 0 ? {
            tokenBalances: tokenBalances.map(token => ({
              symbol: token.symbol,
              name: token.name,
              balance: token.balanceFormatted,
              value: token.value || 0,
              isNative: token.isNative
            })),
            portfolio: portfolio ? {
              totalValue: portfolio.totalValue,
              totalChange24h: portfolio.totalChange24h,
              tokenCount: portfolio.tokens.length
            } : null,
            totalPortfolioValue
          } : null,
          bankData: accounts.length > 0 ? {
            accounts: accounts.map(acc => ({
              id: acc.id,
              name: acc.name,
              bankName: acc.bankName,
              balance: acc.balance,
              currency: acc.currency,
              type: acc.type
            })),
            totalBalance,
            connectedBanks: accounts.length
          } : null,
          transactionHistory: transactions.slice(-20), // Last 20 transactions
          sessionHistory: messages.slice(-5).map(m => `${m.type}: ${m.content}`),
        };

        const aiResult = await geminiAI.generateResponse(content, context);
        
        const aiResponse: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: aiResult.content,
          timestamp: new Date(),
          actions: aiResult.actions,
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);

        // Store AI response in database
        await supabaseHelpers.storeChatMessage(sessionId, {
          type: 'assistant',
          content: aiResponse.content,
          metadata: { actions: aiResult.actions },
        });
      } catch (error) {
        console.error('AI response error:', error);
        
        // Fallback response
        const fallbackResponse: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: "I'm having trouble processing your request right now. Could you try asking again? 🤔",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, fallbackResponse]);
        setIsTyping(false);

        await supabaseHelpers.storeChatMessage(sessionId, {
          type: 'assistant',
          content: fallbackResponse.content,
          metadata: {},
        });
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    if (isConnected && address) {
      initializeSession();
    }
  }, [isConnected, address]);

  // Load chat history when session is established
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  const loadChatHistory = async () => {
    if (!sessionId) return;

    try {
      const history = await supabaseHelpers.getChatHistory(sessionId);
      
      const chatMessages: ChatMessage[] = history.map(msg => ({
        id: msg.id,
        type: msg.message_type,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        actions: (msg.metadata as any)?.actions || undefined,
      }));

      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  return {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearChat,
    isTyping,
  };
}