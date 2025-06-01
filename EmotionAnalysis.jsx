import React, { useState } from 'react';
import { FaRegSmile, FaRegSadTear, FaRegAngry, FaRegSurprise, FaRegMeh, FaSearch, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const EmotionAnalysis = ({ message, onSendSuggestion }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeMessage = async () => {
    if (!message?.trim()) {
      toast.error('No message to analyze');
      return;
    }

    setLoading(true);
    setShowAnalysis(true);

    try {
      const response = await fetch('http://localhost:5001/api/emotion/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      const data = await response.json();
      console.log('Response:', response);
      console.log('Data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to analyze message. Status: ${response.status}, Data: ${JSON.stringify(data)}`);
      }

      setAnalysis(data);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze message');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy':
        return <FaRegSmile className="text-yellow-400" />;
      case 'sad':
        return <FaRegSadTear className="text-blue-400" />;
      case 'angry':
        return <FaRegAngry className="text-red-400" />;
      case 'surprised':
        return <FaRegSurprise className="text-purple-400" />;
      default:
        return <FaRegMeh className="text-gray-400" />;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (onSendSuggestion) {
      onSendSuggestion(suggestion);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={analyzeMessage}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
        disabled={loading}
      >
        {loading ? (
          <>
            <FaSearch className="animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <FaSearch />
            <span>Analyze Emotion</span>
          </>
        )}
      </button>

      {showAnalysis && analysis && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">{getEmotionIcon(analysis.dominantEmotion)}</div>
            <div>
              <h3 className="text-lg font-semibold">Dominant Emotion: {analysis.dominantEmotion}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-400">
                {Object.entries(analysis.emotions).map(([emotion, score]) => (
                  <span key={emotion} className="bg-gray-700 px-2 py-1 rounded">
                    {emotion}: {Math.round(score * 100)}%
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Suggested Responses:</h4>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded text-green-300 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <FaCheck className="text-green-400" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionAnalysis;
