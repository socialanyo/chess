import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PieceColor } from '../types';
import { MessageSquare, Send, Smile } from 'lucide-react';

interface GameChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  playerColor?: PieceColor;
}

const QUICK_EMOJIS = ['👍', 'GG', '🤝', '😮', '🔥', '♟️', 'Good luck!'];

export const GameChat: React.FC<GameChatProps> = ({ messages, onSendMessage, playerColor }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#FAF9F6] border-b border-[#E7E5E4] flex items-center justify-between">
        <span className="font-editorial-heading font-bold text-xs sm:text-sm text-[#1C1917] tracking-wide flex items-center gap-2">
          <MessageSquare size={14} className="text-[#1E3A2F]" />
          <span>Parlour Dialogue</span>
        </span>
        <span className="text-[10px] text-[#78716C] font-mono uppercase tracking-wider font-semibold">Live</span>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 max-h-[140px] sm:max-h-[180px] text-xs">
        {messages.length === 0 ? (
          <div className="text-[#A8A29E] text-center italic py-4 font-editorial-subheading">
            Exchange pleasantries or send a gentlemanly reaction to your opponent...
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderColor === playerColor;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-bold text-[#78716C]">{m.senderName}</span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl max-w-[85%] break-words shadow-xs ${
                    isMe
                      ? 'bg-[#1E3A2F] text-[#FAF9F6] rounded-tr-xs'
                      : 'bg-[#F5F5F4] text-[#1C1917] rounded-tl-xs border border-[#E7E5E4]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] border-t border-[#E7E5E4] overflow-x-auto no-scrollbar">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendMessage(emoji)}
            className="px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#E7E5E4] text-[#44403C] rounded-md text-[11px] font-semibold flex-shrink-0 transition-colors border border-[#E7E5E4] cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="p-2.5 bg-[#FAF9F6] border-t border-[#E7E5E4] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          maxLength={150}
          className="flex-1 px-3 py-2 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1E3A2F] shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-[#1C1917] hover:bg-[#292524] disabled:opacity-30 text-white rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};
