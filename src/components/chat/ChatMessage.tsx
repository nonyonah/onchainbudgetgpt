'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  onActionClick?: (actionId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-[var(--grok-accent)]' 
          : 'bg-gradient-to-br from-purple-500 to-blue-600'
      }`}>
        {isUser ? (
          <User size={20} className="text-white" />
        ) : (
          <Bot size={20} className="text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {/* Message Bubble */}
        <div className={`chat-bubble ${
          isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'
        }`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-[var(--grok-text-muted)] mt-1 px-2">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>

        {/* Action Buttons (for assistant messages) */}
        {isAssistant && message.actions && message.actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {message.actions.map((action) => (
              <button
                key={action.id}
                onClick={() => onActionClick?.(action.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action.type === 'primary'
                    ? 'bg-[var(--grok-accent)] text-white hover:bg-[var(--grok-accent-hover)]'
                    : action.type === 'secondary'
                    ? 'bg-[var(--grok-surface)] text-[var(--grok-text)] border border-[var(--grok-border)] hover:bg-[var(--grok-border)]'
                    : 'text-[var(--grok-accent)] hover:text-[var(--grok-accent-hover)] hover:bg-[var(--grok-accent)]/10'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Message Actions (for assistant messages) */}
        {isAssistant && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-xs text-[var(--grok-text-muted)] hover:text-[var(--grok-text)] transition-colors">
              Copy
            </button>
            <button className="text-xs text-[var(--grok-text-muted)] hover:text-[var(--grok-text)] transition-colors">
              Regenerate
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;