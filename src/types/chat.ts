/**
 * Chat-related type definitions for OnchainBudget GPT
 */

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    walletData?: any;
    bankData?: any;
    chartData?: any;
    actionButtons?: ActionButton[];
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
}

export interface ActionButton {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'outline';
  icon?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    walletConnected?: boolean;
    bankConnected?: boolean;
    lastActivity?: Date;
  };
}

export interface TypingIndicatorProps {
  isVisible?: boolean;
}

export interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  isWalletConnected: boolean;
  isBankConnected: boolean;
  connectWallet: () => Promise<void>;
  connectBank: () => Promise<void>;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  connected?: boolean;
  description?: string;
}