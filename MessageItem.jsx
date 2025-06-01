import { useState } from "react";
import EmotionAnalysis from "./EmotionAnalysis";
import toast from 'react-hot-toast';
import { FaRegSmile, FaRegSadTear, FaRegAngry, FaRegSurprise, FaRegMeh } from 'react-icons/fa';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const MessageItem = ({ message, fromSelf, selectedUser }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { sendMessage } = useChatStore();
  const { authUser } = useAuthStore();
  // Remove this line since we're now getting selectedUser from props
  // const { selectedUser } = useAuthStore();

  const handleSendSuggestion = async (suggestion) => {
    console.log('Selected user:', selectedUser);
    console.log('Auth user:', authUser);
    
    if (authUser && selectedUser) {
      try {
        const messageData = { text: suggestion };
        console.log('Sending message:', messageData);
        await sendMessage(messageData);
        toast.success('Suggestion sent successfully!');
      } catch (error) {
        console.error('Error sending suggestion:', error);
        toast.error('Failed to send suggestion. Please try again.');
      }
    } else {
      console.log('Missing user info:', { authUser, selectedUser });
      toast.error('Please select a user to chat with');
    }
  };

  return (
    <div className={`flex flex-col ${fromSelf ? "items-end" : "items-start"} mb-2`}>
      <div className={`p-2 rounded-lg ${fromSelf ? "bg-gray-700" : "bg-black"} text-white max-w-xs`}>
        {message}
      </div>

      {!fromSelf && (
        <div className="flex items-center mt-1">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="text-sm text-blue-400 hover:underline"
          >
            {showAnalysis ? "Hide Analysis" : "Analyze Tone"}
          </button>
        </div>
      )}

      {!fromSelf && showAnalysis && (
        <div className="mt-2">
          <EmotionAnalysis 
            message={message}
            onSendSuggestion={handleSendSuggestion}
          />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
