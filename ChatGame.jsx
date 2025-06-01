import React, { useState, useEffect, useRef } from 'react';

const gameTypes = {
  TRIVIA_BATTLE: {
    name: 'Trivia Battle',
    description: 'Answer trivia questions as fast as you can!',
    points: 10, // Points per correct question
    timeLimit: 30,
    questions: [
      {
        question: "Which programming language is widely used for developing Android mobile applications?",
        options: ["Python", "Kotlin", "Swift", "JavaScript"],
        answer: "Kotlin",
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        answer: "Mars",
      },
      {
        question: "Who is the leader of 'BTS'?",
        options: ["RM(Kim Namjoon)", "Jin(Kim Seokjin)", "Suga(Min Yoongi)", "J-Hope(Jung Hoseok)"],
        answer: "RM(Kim Namjoon)",
      },
    ],
  },

  WORD_CHAIN: {
    name: 'Word Chain',
    description: 'Guess the hidden word by guessing letters.',
    points: 15, // Points for guessing the word
    timeLimit: 60,
    maxGuesses: 6,
    levels: {
      Easy: {
        category: 'Animals',
        wordList: ["CAT", "DOG", "BIRD", "FISH", "LION"],
      },
      Medium: {
        category: 'Countries',
        wordList: ["INDIA", "CHINA", "JAPAN", "CANADA", "BRAZIL"],
      },
      Hard: {
        category: 'Programming',
        wordList: ["REACT", "JAVASCRIPT", "COMPONENT", "FUNCTION", "ALGORITHM"],
      },
    },
  },

  EMOJI_PICTO: {
    name: 'Emoji Pictionary',
    description: 'Guess the phrase represented by the emojis.',
    points: 20, // Points per correct phrase
    timeLimit: 45,
    phrases: [
      { emoji: "🌧️☔🌈", answer: "Rainbow" },
      { emoji: "🍎📱", answer: "Apple iPhone" },
      { emoji: "🐱🐶", answer: "Cats and Dogs" },
      { emoji: "🎬🍿", answer: "Movie Night" },
    ],
  },
};

function ChatGame({ onClose }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const [correctWord, setCorrectWord] = useState(null);
  const [showStartButton, setShowStartButton] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const selectGame = (gameType) => {
    setSelectedGame(gameType);
    setShowStartButton(true);
    setGameState(null);
    setPoints(0);
    setIsGameOver(false);
    setGameWon(false);
    setTimeLeft(0);
    setCorrectWord(null);
    setSelectedLevel(null);
  };

  const handleLevelChange = (event) => {
    setSelectedLevel(event.target.value);
  };

  const startGame = () => {
    if (!selectedGame) return;

    const gameConfig = gameTypes[selectedGame];
    let initialState;
    let wordToSet = null;

    if (selectedGame === "WORD_CHAIN") {
      if (!selectedLevel || !gameConfig.levels[selectedLevel]) {
        alert("Please select a level for Word Chain.");
        return;
      }
      const selectedWordList = gameConfig.levels[selectedLevel].wordList;
      const randomWord = selectedWordList[Math.floor(Math.random() * selectedWordList.length)];
      initialState = {
        ...gameConfig, // Include base game settings like timeLimit, points
        ...gameConfig.levels[selectedLevel], // Override with level-specific settings
        currentWord: randomWord,
        guessedLetters: [],
      };
      wordToSet = randomWord;
    } else if (selectedGame === "TRIVIA_BATTLE") {
      initialState = { ...gameConfig, questions: [...gameConfig.questions] };
    } else if (selectedGame === "EMOJI_PICTO") {
      initialState = { ...gameConfig, phrases: [...gameConfig.phrases] };
    }

    setGameState(initialState);
    setPoints(0);
    setIsGameOver(false);
    setGameWon(false); // Crucial reset
    setTimeLeft(gameConfig.timeLimit);
    setCorrectWord(wordToSet);
    setShowStartButton(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setIsGameOver(true);
          // gameWon remains false if timer runs out, unless already won
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answer) => {
    if (isGameOver || !gameState?.questions?.length) return;

    const gameConfig = gameTypes[selectedGame];
    const { questions, points: pointsPerQuestion } = gameState; // pointsPerQuestion is from gameConfig via initialState
    const currentQuestion = questions[0];

    let updatedPlayerScore = points;

    if (answer === currentQuestion.answer) {
      updatedPlayerScore += pointsPerQuestion;
      setPoints(updatedPlayerScore);
    }

    const remainingQuestions = questions.slice(1);

    if (remainingQuestions.length === 0) { // Last question was just answered
      clearInterval(timerRef.current);
      setIsGameOver(true);

      // Stricter win condition for Trivia Battle:
      // Win only if all questions were answered correctly (perfect score).
      const totalPossiblePoints = gameConfig.questions.length * gameConfig.points;
      if (updatedPlayerScore === totalPossiblePoints) {
        setGameWon(true);
      } else {
        setGameWon(false); // Explicitly set to false if not a perfect score
      }
    }
    // If not the last question, game continues. isGameOver and gameWon are not changed here.
    // gameWon remains false (its initial state) unless a win condition is met.

    setGameState((prev) => ({
      ...prev,
      questions: remainingQuestions,
    }));
  };

  const handleGuess = (letter) => {
    if (isGameOver || !gameState || selectedGame !== "WORD_CHAIN") return;

    const { currentWord, guessedLetters, maxGuesses, points: gamePoints } = gameState;

    if (guessedLetters.includes(letter)) return;

    const newGuessed = [...guessedLetters, letter];
    const incorrectGuesses = newGuessed.filter(l => !currentWord.includes(l)).length;

    setGameState((prev) => ({
      ...prev,
      guessedLetters: newGuessed,
    }));

    const allLettersGuessed = currentWord
      .split("")
      .every((l) => newGuessed.includes(l));

    if (allLettersGuessed) {
      setPoints((prev) => prev + gamePoints); // gamePoints is total for word
      clearInterval(timerRef.current);
      setIsGameOver(true);
      setGameWon(true);
    } else if (incorrectGuesses >= maxGuesses) {
      clearInterval(timerRef.current);
      setIsGameOver(true);
      setGameWon(false); // Lost due to max guesses
    }
  };

  const handleEmojiGuess = (guess) => {
    if (!gameState || isGameOver || selectedGame !== "EMOJI_PICTO") return;

    const currentPhraseObject = gameState.phrases[0];
    if (!currentPhraseObject) return;
    const correctAnswer = currentPhraseObject.answer;
    const pointsPerPhrase = gameTypes.EMOJI_PICTO.points;

    const isCorrect = guess.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setPoints((prev) => prev + pointsPerPhrase);
      const remainingPhrases = gameState.phrases.slice(1);
      setGameState((prev) => ({
        ...prev,
        phrases: remainingPhrases,
      }));
      if (remainingPhrases.length === 0) {
        clearInterval(timerRef.current);
        setIsGameOver(true);
        setGameWon(true); // Won by guessing all phrases
      }
    } else {
      alert('Try again!');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const restartGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const gameToRestart = selectedGame;
    const levelToRestart = selectedLevel;

    // Reset common states
    setGameState(null);
    setIsGameOver(false);
    setGameWon(false);
    setPoints(0);
    setTimeLeft(0);
    setCorrectWord(null);
    
    // Keep selectedGame and selectedLevel to restart the same configuration
    setSelectedGame(gameToRestart); 
    if (gameToRestart === "WORD_CHAIN") {
        setSelectedLevel(levelToRestart);
    }
    
    // If level is required and not set (e.g. cleared somehow), show start button to re-select.
    // Otherwise, directly start.
    if (gameToRestart === "WORD_CHAIN" && !levelToRestart) {
        setShowStartButton(true); 
    } else {
        setShowStartButton(false); // Will be set false by startGame anyway, but good for clarity
        startGame();
    }
  };

  const backToGames = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSelectedGame(null);
    setGameState(null);
    setIsGameOver(false);
    setGameWon(false);
    setPoints(0);
    setTimeLeft(0);
    setCorrectWord(null);
    setShowStartButton(false);
    setSelectedLevel(null);
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onClose();
  };

  return (
    <div className="chat-game bg-gray-100 p-4 rounded-lg shadow-md max-w-lg mx-auto">
      <div className="game-header flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {selectedGame ? gameTypes[selectedGame].name : "Choose a Game"}
        </h2>
        <button
          onClick={handleClose}
          className="close-btn text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      {!selectedGame ? (
        <div className="game-selection space-y-4">
          {Object.entries(gameTypes).map(([type, game]) => (
            <button
              key={type}
              onClick={() => selectGame(type)}
              className="game-btn bg-blue-500 text-white rounded-lg p-4 hover:bg-blue-600 transition-colors w-full text-left"
            >
              <h3 className="text-lg font-semibold">{game.name}</h3>
              <p className="text-sm text-blue-100">{game.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="game-details mb-4">
            <div className="bg-indigo-600 text-white rounded-lg p-4">
              <h3 className="text-lg font-bold mb-1">{gameTypes[selectedGame].name}</h3>
              <p className="text-sm text-indigo-100 mb-2">{gameTypes[selectedGame].description}</p>
              {selectedGame === "WORD_CHAIN" && gameState && gameState.category && !showStartButton && (
                 <p className="text-xs text-indigo-200 mb-1">Category: {gameState.category}</p>
              )}
              {selectedGame === "WORD_CHAIN" && showStartButton && (
                <div className="mb-2">
                  <label htmlFor="level" className="text-indigo-200 mr-2 text-sm">Level:</label>
                  <select
                    id="level"
                    className="bg-white text-gray-700 rounded-md py-1 px-2 focus:outline-none text-sm"
                    onChange={handleLevelChange}
                    value={selectedLevel || ''}
                  >
                    <option value="" disabled>Select Level</option>
                    {Object.keys(gameTypes.WORD_CHAIN.levels).map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-between text-xs text-indigo-200">
                <p>Points per correct: {gameTypes[selectedGame].points}</p>
                <p>Time: {gameTypes[selectedGame].timeLimit}s</p>
                {selectedGame === "WORD_CHAIN" && (
                  <p>Max Guesses: {gameTypes.WORD_CHAIN.maxGuesses}</p>
                )}
              </div>
            </div>
          </div>

          {showStartButton && (
            <div className="flex justify-center mb-4">
              <button
                onClick={startGame}
                disabled={selectedGame === "WORD_CHAIN" && !selectedLevel}
                className={`bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors ${
                  (selectedGame === "WORD_CHAIN" && !selectedLevel) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Start Game
              </button>
            </div>
          )}

          {!showStartButton && gameState && (
            <div className="game-content bg-white rounded-lg p-4 shadow">
              <div className="game-info flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 text-sm">
                    <p>Points: {points}</p>
                  </div>
                  <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm">
                    <p>Time Left: {timeLeft}s</p>
                  </div>
                  {selectedGame === "WORD_CHAIN" && gameState && typeof gameState.maxGuesses === 'number' && (
                    <div className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 text-sm">
                        Guesses left: {gameState.maxGuesses - (gameState.guessedLetters?.filter(l => !gameState.currentWord.includes(l)).length || 0)}
                    </div>
                  )}
                </div>
              </div>

              {isGameOver ? (
                <div className="game-over text-center py-4">
                  {gameWon ? (
                    <h3 className="text-2xl font-bold text-green-600 mb-3">Congratulations, You won!</h3>
                  ) : points > 0 ? (
                    <h3 className="text-2xl font-bold text-yellow-500 mb-3">You can do it, keep it up!</h3>
                  ) : (
                    <h3 className="text-2xl font-bold text-red-600 mb-3">No worries, best of luck for next time!</h3>
                  )}
                  <p className="text-lg text-gray-700 mb-2">Total Points: {points}</p>
                  {selectedGame === "WORD_CHAIN" && correctWord && !gameWon && (
                    <p className="text-md text-gray-600 mb-4">
                      The correct word was: <span className="font-bold text-blue-600">{correctWord}</span>
                    </p>
                  )}
                  <div className="flex justify-center gap-3 mt-4">
                    <button
                      onClick={restartGame}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={backToGames}
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Back to Games
                    </button>
                  </div>
                </div>
              ) : (
                <div className="game-play">
                  {selectedGame === "TRIVIA_BATTLE" && gameState && gameState.questions && gameState.questions.length > 0 && (
                    <div className="trivia">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">{gameState.questions[0]?.question}</h3>
                      <div className="options grid grid-cols-1 md:grid-cols-2 gap-3">
                        {gameState.questions[0]?.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="option-btn bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors w-full"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedGame === "WORD_CHAIN" && gameState && gameState.currentWord && (
                    <div className="word-chain text-center">
                      <div className="word-display flex justify-center gap-2 mb-6">
                        {gameState.currentWord.split('').map((letter, idx) => (
                          <span
                            key={idx}
                            className={`letter w-10 h-10 flex items-center justify-center rounded text-xl font-bold ${
                              gameState.guessedLetters.includes(letter)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {gameState.guessedLetters.includes(letter) ? letter : '_'}
                          </span>
                        ))}
                      </div>
                      <div className="keyboard grid grid-cols-7 sm:grid-cols-9 gap-1 max-w-md mx-auto">
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map((letter) => (
                          <button
                            key={letter}
                            onClick={() => handleGuess(letter)}
                            disabled={gameState.guessedLetters.includes(letter)}
                            className={`key p-2 rounded text-sm font-semibold transition-colors ${
                              gameState.guessedLetters.includes(letter)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedGame === "EMOJI_PICTO" && gameState && gameState.phrases && gameState.phrases.length > 0 && (
                    <div className="emoji-picto">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Guess the Phrase from Emojis:</h3>
                      <div className="emoji-display text-4xl mb-4 text-center py-3 bg-gray-100 rounded-md">
                        {gameState.phrases[0]?.emoji}
                      </div>
                      <div className="flex flex-col gap-3 items-center">
                        <input
                          type="text"
                          ref={inputRef}
                          className="answer-input w-full max-w-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your guess..."
                          onKeyPress={(e) => e.key === 'Enter' && handleEmojiGuess(inputRef.current?.value || '')}
                        />
                        <button
                          onClick={() => handleEmojiGuess(inputRef.current?.value || '')}
                          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
           {!showStartButton && !gameState && selectedGame && (
             <div className="text-center p-4">
                <p className="text-gray-600">Select your options and click "Start Game".</p>
            </div>
           )}
        </div>
      )}
    </div>
  );
}

export default ChatGame;