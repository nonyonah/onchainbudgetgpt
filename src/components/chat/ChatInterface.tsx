import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletIcon, HistoryIcon, SendIcon, ChevronDownIcon, ArrowCircleUpIcon } from './Icons';
import ChatMessage from './ChatMessage';
import { ChatMessage as ChatMessageType } from '@/types/chat';

const imgNavItemBase = "https://www.figma.com/api/mcp/asset/54f6eec0-959e-4d98-be26-115925121177";

// Default suggestion chips
const defaultSuggestions = [
  "Create Invoice",
  "View Summary", 
  "Send Reminder",
  "Swap"
];

export function ChatInterface() {
  const { isConnected, address, connectWallet, disconnectWallet, getShortAddress } = useWallet();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [suggestions, setSuggestions] = useState(defaultSuggestions);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDisconnect) {
        setShowDisconnect(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDisconnect]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage: ChatMessageType = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Dummy AI response
      setTimeout(() => {
        const assistantMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `This is a dummy response to "${inputValue}"`,
          timestamp: new Date(),
          actions: [
            { id: 'like', label: 'Like', type: 'primary' },
            { id: 'dislike', label: 'Dislike', type: 'secondary' },
            { id: 'refresh', label: 'Refresh', type: 'outline' },
            { id: 'copy', label: 'Copy', type: 'outline' },
          ]
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }, 1000);

      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="bg-white box-border content-stretch flex flex-col items-center overflow-clip relative shrink-0 w-full" data-name="Chat" data-node-id="2421:18356">
      <div className="bg-white content-stretch flex flex-col items-center overflow-clip relative shrink-0 w-full" data-name="Header navigation" data-node-id="2413:13428">
        <div className="box-border content-stretch flex h-[72px] items-center justify-between px-[32px] py-0 relative shrink-0 w-full max-w-screen-xl" data-name="Container" data-node-id="2413:13429">
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Content" data-node-id="2413:13430">
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Navigation" data-node-id="2413:13432">
              <div className="h-[70px] relative rounded-[6px] shrink-0 w-[122px]" data-name="_Nav item base" data-node-id="2413:13433">
                <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[6px] size-full" src={imgNavItemBase} />
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Content" data-node-id="2413:13451">
            <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Actions" data-node-id="2413:13453">
              <div className="bg-white box-border content-stretch flex gap-[105px] items-start overflow-clip p-[10px] relative rounded-[6px] shrink-0" data-name="_Nav item button" data-node-id="2413:13456">
                <div className="overflow-clip relative shrink-0 size-[20px] text-[#414651]" data-name="icon / history" data-node-id="2413:13457">
                  <HistoryIcon />
                </div>
              </div>
            </div>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-white border border-[#d5d7da] border-solid relative rounded-[8px] shrink-0 hover:bg-gray-50 transition-colors"
                data-name="_Button base"
                data-node-id="2467:14596"
              >
                <div className="box-border content-stretch flex gap-[8px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
                  <div className="overflow-clip relative shrink-0 size-[20px] text-[#414651]" data-name="icon / wallet" data-node-id="I2467:14596;1037:34320">
                    <WalletIcon />
                  </div>
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#414651] text-[14px]" data-node-id="I2467:14596;1037:33914">
                    Connect Wallet
                  </p>
                </div>
              </button>
            ) : (
              <div className="relative z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDisconnect(!showDisconnect);
                  }}
                  className="bg-white border border-[#d5d7da] border-solid relative rounded-[8px] shrink-0 hover:bg-gray-50 transition-colors"
                  data-name="_Button base"
                  data-node-id="2467:14596"
                >
                  <div className="box-border content-stretch flex gap-[8px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
                    <div className="overflow-clip relative shrink-0 size-[20px] text-[#414651]" data-name="icon / wallet" data-node-id="I2467:14596;1037:34320">
                      <WalletIcon />
                    </div>
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#414651] text-[14px]" data-node-id="I2467:14596;1037:33914">
                      {getShortAddress()}
                    </p>
                  </div>
                </button>
                {showDisconnect && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-[#d5d7da] rounded-[8px] shadow-lg z-50 min-w-[160px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        disconnectWallet();
                        setShowDisconnect(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[#414651] hover:bg-gray-50 rounded-[8px] text-[14px] whitespace-nowrap"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 w-full max-w-screen-md mx-auto p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-[42px] items-center overflow-clip px-[32px] py-0 relative shrink-0 w-full" data-name="Content" data-node-id="2421:18489">
        <div className="content-stretch flex flex-col gap-[21px] items-center relative shrink-0 w-full" data-name="Container" data-node-id="2470:15832">
          <div className="bg-white border border-[#e9eaeb] border-solid relative rounded-[10px] shrink-0 w-[793px] h-[74px] flex items-center pl-[26px] pr-[21px]" data-name="Chat box" data-node-id="2421:18360">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..." 
              className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic flex-1 text-[18px] text-[#000] placeholder:text-[rgba(0,0,0,0.5)] text-left bg-transparent focus:outline-none border-none"
              data-node-id="2469:14600" 
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={`relative shrink-0 size-[32px] ml-[10px] transition-opacity border-none bg-transparent p-0 ${
                inputValue.trim() 
                  ? 'opacity-100 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              data-name="ArrowCircleUp" 
              data-node-id="2469:14601"
            >
              <ArrowCircleUpIcon />
            </button>
          </div>
          <div className="content-stretch flex gap-[14px] items-center relative shrink-0" data-name="Suggestion" data-node-id="2470:15829">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-white border border-[#e9eaeb] border-solid relative rounded-[20px] shrink-0 hover:bg-gray-50 transition-colors cursor-pointer"
                data-name="Chip"
              >
                <div className="box-border content-stretch flex gap-[8px] items-center justify-center overflow-clip pl-[12px] pr-[8px] py-[6px] relative rounded-[inherit]">
                  <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#414651] text-[14px]">
                    {suggestion}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}