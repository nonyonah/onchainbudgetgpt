'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, ThumbsUp, ThumbsDown, RefreshCw, Copy } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';

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
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-black' : 'bg-gray-200'}`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-gray-700" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          </div>

          {/* Action Buttons (for assistant messages) */}
          {isAssistant && message.actions && message.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {message.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onActionClick?.(action.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${action.type === 'primary' ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
