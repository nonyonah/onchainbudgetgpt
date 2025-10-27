'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Wallet, CreditCard, Settings, MessageCircle, BarChart3, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { FinancialDashboard } from '@/components/dashboard/FinancialDashboard';
import { useChat } from '@/hooks/useChat';
import { useWallet } from '@/hooks/useWallet';
import { useBank } from '@/hooks/useBank';
import { useOnchain } from '@/hooks/useOnchain';

interface ChatInterfaceProps {
  onConnectWallet: () => void;
  onConnectBank: () => void;
  isWalletConnected: boolean;
  isBankConnected: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onConnectWallet,
  onConnectBank,
  isWalletConnected,
  isBankConnected,
}) => {
  const { messages, sendMessage, isTyping, clearChat } = useChat();
  const { address } = useWallet();
  const { transactions } = useBank();
  const { tokenBalances, portfolio } = useOnchain();
  const [inputValue, setInputValue] = useState('');
  const [currentView, setCurrentView] = useState<'chat' | 'dashboard'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'connect-wallet':
        onConnectWallet();
        break;
      case 'connect-bank':
        onConnectBank();
        break;
      case 'view-portfolio':
        setCurrentView('dashboard');
        break;
      case 'view-dashboard':
        setCurrentView('dashboard');
        break;
      default:
        console.log('Action clicked:', actionId);
    }
  };

  const quickActions = [
    {
      icon: Wallet,
      label: isWalletConnected ? 'Wallet Connected' : 'Connect Wallet',
      action: onConnectWallet,
      connected: isWalletConnected,
    },
    {
      icon: CreditCard,
      label: isBankConnected ? 'Bank Connected' : 'Connect Bank',
      action: onConnectBank,
      connected: isBankConnected,
    },
    {
      icon: BarChart3,
      label: 'Financial Dashboard',
      action: () => setCurrentView('dashboard'),
      connected: false,
    },
  ];

  const placeholderTexts = [
    "Ask me anything about your money...",
    "How much did I spend on food this week?",
    "Show my crypto portfolio breakdown",
    "What's my biggest expense category?",
    "Compare my spending to last month",
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[var(--grok-bg)]">
      {/* Sidebar */}
      <div className="w-64 bg-[var(--grok-surface)] border-r border-[var(--grok-border)] flex flex-col">
        <div className="p-4 border-b border-[var(--grok-border)]">
          <h1 className="text-xl font-bold text-[var(--grok-text)] flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OB</span>
            </div>
            OnchainBudget
          </h1>
        </div>

        <div className="flex-1 p-4">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--grok-accent)] text-white hover:bg-[var(--grok-accent-hover)] transition-colors">
            <Plus size={20} />
            New Chat
          </button>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-[var(--grok-text-muted)] mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    action.connected
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[var(--grok-border)] text-[var(--grok-text-muted)] hover:bg-[var(--grok-border)]/80'
                  }`}
                >
                  <action.icon size={18} />
                  <span className="text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--grok-border)]">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg text-[var(--grok-text-muted)] hover:bg-[var(--grok-border)] transition-colors">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* View Toggle */}
        <div className="p-4 border-b border-[var(--grok-border)]">
          <div className="flex space-x-2 bg-[var(--grok-surface)] p-1 rounded-lg">
            <button
              onClick={() => setCurrentView('chat')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'chat'
                  ? 'bg-[var(--grok-accent)] text-white'
                  : 'text-[var(--grok-text-muted)] hover:text-[var(--grok-text)]'
              }`}
            >
              <MessageCircle size={16} className="inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[var(--grok-accent)] text-white'
                  : 'text-[var(--grok-text-muted)] hover:text-[var(--grok-text)]'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Dashboard
            </button>
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'chat' ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    onActionClick={handleActionClick}
                  />
                ))}
              </AnimatePresence>
              
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <FinancialDashboard 
              transactions={transactions}
              tokenBalances={tokenBalances}
              portfolio={portfolio}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-[var(--grok-border)]">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholderTexts[currentPlaceholder]}
              className="w-full bg-[var(--grok-surface)] border border-[var(--grok-border)] rounded-2xl px-6 py-4 pr-14 text-[var(--grok-text)] placeholder-[var(--grok-text-muted)] focus:outline-none glow-border transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-xl bg-[var(--grok-accent)] text-white hover:bg-[var(--grok-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          
          <p className="text-xs text-[var(--grok-text-muted)] mt-2 text-center">
            OnchainBudget GPT can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;