import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  selectedUser: null,
  isMessagesLoading: false,
  score: 0,
  level: 1,
  activeGame: null,
  streak: 0,
  badges: [],

  // Game-related actions
  setScore: (points) => set((state) => ({
    score: state.score + points,
    streak: state.streak + 1
  })),

  setActiveGame: (game) => set({ activeGame: game }),

  addBadge: (badge) => set((state) => ({
    badges: [...state.badges, badge]
  })),

  resetGame: () => set({
    activeGame: null,
    streak: 0
  }),

  // Chat-related actions
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setSelectedUser: (user) => set({ selectedUser: user }),

  setIsMessagesLoading: (loading) => set({ isMessagesLoading: loading }),

  // Game progress tracking
  checkGameProgress: (gameType, message) => {
    const gameTypes = {
      QUICK_CHAT: {
        target: 5,
        points: 10
      },
      EMOJI_MASTER: {
        target: 3,
        emojiCount: 3,
        points: 15
      },
      LONG_MESSAGE: {
        target: 100,
        points: 20
      }
    };

    const recentMessages = state.messages
      .filter(msg => msg.senderId === state.selectedUser._id)
      .slice(-10);

    switch (gameType) {
      case 'QUICK_CHAT':
        if (recentMessages.length >= gameTypes.QUICK_CHAT.target) {
          setScore(gameTypes.QUICK_CHAT.points);
          addBadge('QUICK_CHAT');
          resetGame();
        }
        break;
      case 'EMOJI_MASTER':
        const emojiCount = recentMessages.reduce((count, msg) => {
          return count + (msg.text.match(/\p{Emoji}/gu) || []).length;
        }, 0);
        if (emojiCount >= gameTypes.EMOJI_MASTER.emojiCount) {
          setScore(gameTypes.EMOJI_MASTER.points);
          addBadge('EMOJI_MASTER');
          resetGame();
        }
        break;
      case 'LONG_MESSAGE':
        if (message.text.length >= gameTypes.LONG_MESSAGE.target) {
          setScore(gameTypes.LONG_MESSAGE.points);
          addBadge('LONG_MESSAGE');
          resetGame();
        }
        break;
    }
  }
}));

export default useChatStore;
