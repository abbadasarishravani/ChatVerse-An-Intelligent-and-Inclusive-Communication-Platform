import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import MessageItem from './MessageItem';
import ChatGame from './ChatGame';

const Chat = () => {
  const { messages, selectedUser } = useChatStore();
  const [currentUserId] = useState('user1'); // Replace with actual user ID
  const [showGamePanel, setShowGamePanel] = useState(false);
  
  const toggleGamePanel = () => {
    setShowGamePanel(!showGamePanel);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Game Button - Fixed at top right */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleGamePanel}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg ${
            showGamePanel 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform hover:scale-105'
          }`}
        >
          <span className="text-2xl">🎮</span>
          <span className="text-lg">{showGamePanel ? 'Close' : 'Games'}</span>
        </button>
      </div>
      
      {/* Spacer to prevent content from being hidden behind fixed button */}
      <div className="h-20"></div>
      
      {/* Game Panel - Conditionally rendered */}
      {showGamePanel && (
        <div className="fixed top-24 right-4 z-40 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-400 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <ChatGame onClose={() => setShowGamePanel(false)} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <MessageItem
            key={idx}
            message={msg.text}
            fromSelf={msg.senderId === currentUserId}
          />
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <MessageInput />
      </div>
    </div>
  );
};

export default Chat;
