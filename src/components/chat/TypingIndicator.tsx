'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
        <Bot size={20} className="text-white" />
      </div>

      {/* Typing Animation */}
      <div className="chat-bubble chat-bubble-assistant flex items-center gap-1">
        <div className="flex gap-1">
          <motion.div
            className="w-2 h-2 bg-[var(--grok-text-muted)] rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-[var(--grok-text-muted)] rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-[var(--grok-text-muted)] rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <span className="text-xs text-[var(--grok-text-muted)] ml-2">
          OnchainBudget is thinking...
        </span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;