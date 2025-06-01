import express from "express";
const router = express.Router();

// Enhanced emotion analysis endpoint
router.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    
    // Enhanced text-based emotion detection
    const textLower = text.toLowerCase();
    const emotions = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0.1
    };

    // Emotion patterns
    const patterns = {
      happy: [
        'happy', 'good', 'great', 'awesome', 'wonderful', 'fantastic', 'excited',
        'joy', 'delighted', '😊', '😄', '😃', '🙂', '😁', '🥰', '❤️', 'love',
        'blessed', 'grateful', 'thank'
      ],
      sad: [
        'sad', 'bad', 'upset', 'depressed', 'unhappy', 'miserable', 'disappointed',
        'sorry', 'miss', 'lost', 'crying', '😢', '😞', '😔', '😥', '💔', 'hurt',
        'alone', 'lonely', 'regret'
      ],
      angry: [
        'angry', 'mad', 'annoyed', 'frustrated', 'hate', 'furious', 'irritated',
        'rage', 'upset', 'terrible', '😠', '😡', '🤬', '💢', 'stupid', 'worst',
        'unfair', 'wrong', 'never'
      ],
      surprised: [
        'wow', 'omg', 'surprised', 'shocked', 'amazing', 'unbelievable', 'unexpected',
        'incredible', 'can\'t believe', '😮', '😲', '😱', '🤯', 'what?!', 'really',
        'seriously', 'no way', 'oh my'
      ]
    };

    // Calculate emotion scores
    Object.entries(patterns).forEach(([emotion, words]) => {
      words.forEach(word => {
        if (textLower.includes(word)) emotions[emotion] += 0.3;
      });
    });

    // Context-based analysis
    const words = textLower.split(' ');
    let prevWord = '';
    words.forEach(word => {
      if (prevWord.includes('not') || prevWord.includes('n\'t')) {
        Object.keys(emotions).forEach(emotion => {
          if (emotions[emotion] > 0) {
            emotions[emotion] = Math.max(0, emotions[emotion] - 0.2);
          }
        });
      }
      prevWord = word;
    });

    // Normalize scores
    const total = Object.values(emotions).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(emotions).forEach(emotion => {
        emotions[emotion] = emotions[emotion] / total;
      });
    }

    // Generate suggestions based on emotion
    const suggestedResponses = {
      happy: [
        "That's wonderful! Your happiness is contagious! 😊",
        "I'm thrilled to see you're in such great spirits! What's making you especially happy?",
        "Your positive energy is amazing! Keep spreading that joy! ✨"
      ],
      sad: [
        "I'm here for you and I'm listening. Would you like to talk more about what's troubling you? 🤗",
        "It's okay to feel this way. Sometimes sharing our feelings helps lighten the load. How can I support you?",
        "I hear you, and your feelings are valid. Would you like to explore what might help you feel better? 💙"
      ],
      angry: [
        "I can sense you're frustrated. Let's take a moment to understand what's bothering you. Would you like to discuss it?",
        "Your feelings are valid. Sometimes taking a deep breath helps. Would you like to talk about what triggered this?",
        "I understand you're upset. Let's work through this together and find a constructive way forward. 🤝"
      ],
      surprised: [
        "Wow, that's quite unexpected! I'd love to hear more about what surprised you! 😮",
        "Sometimes life's surprises can be overwhelming. Would you like to process this together?",
        "That's quite a revelation! How are you processing this unexpected news? 🌟"
      ],
      neutral: [
        "I appreciate you sharing that. Would you like to explore your thoughts on this further?",
        "Sometimes it helps to talk things through. What aspects would you like to discuss more?",
        "I'm interested in your perspective. Would you like to elaborate on your thoughts? 💭"
      ]
    };

    // Determine the dominant emotion
    const dominantEmotion = Object.entries(emotions).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    // Return the analysis and suggestions
    res.json({
      emotions,
      dominantEmotion,
      suggestions: suggestedResponses[dominantEmotion]
    });
  } catch (error) {
    console.error('Error in emotion analysis:', error);
    res.status(500).json({ error: 'Failed to analyze message' });
  }
});

export default router;
