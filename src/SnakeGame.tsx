import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';
import { Position, Direction, HighscoreEntry } from './types';
import { loadHighscores, addHighscore, isHighscore, loadHighscoresWithSync } from './highscoreUtils';
import HighscoreBoard from './HighscoreBoard';
import NameInput from './NameInput';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const INITIAL_FOOD: Position = { x: 5, y: 5 };

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [isNewHighscore, setIsNewHighscore] = useState(false);
  
  // Touch/swipe handling state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const generateFood = useCallback((): Position => {
    const isPositionOccupied = (pos: Position) => 
      snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    
    let attempts = 0;
    let newFood: Position;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      attempts++;
    } while (isPositionOccupied(newFood) && attempts < 1000);
    
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y = head.y === 0 ? GRID_SIZE - 1 : head.y - 1;
          break;
        case 'DOWN':
          head.y = head.y === GRID_SIZE - 1 ? 0 : head.y + 1;
          break;
        case 'LEFT':
          head.x = head.x === 0 ? GRID_SIZE - 1 : head.x - 1;
          break;
        case 'RIGHT':
          head.x = head.x === GRID_SIZE - 1 ? 0 : head.x + 1;
          break;
      }

      // Check if snake hits itself
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        // Check if this is a new highscore
        if (isHighscore(score)) {
          setIsNewHighscore(true);
          setShowNameInput(true);
        }
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, generateFood, score]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (showNameInput) {
      // Don't handle game keys while name input is showing
      return;
    }

    if (!gameStarted) {
      if (e.code === 'Space') {
        setGameStarted(true);
      }
      return;
    }

    if (gameOver) {
      if (e.code === 'Space' && !showNameInput) {
        resetGame();
      }
      return;
    }

    // Handle direction changes
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
        break;
    }
  }, [gameStarted, gameOver, showNameInput]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || showNameInput) return;
    
    if (!gameStarted && !gameOver) {
      // In start screen, any swipe starts the game
      setGameStarted(true);
      return;
    }

    if (gameOver && !showNameInput) {
      // In game over screen, any swipe restarts
      resetGame();
      return;
    }

    if (!gameStarted || gameOver) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;
    const isDownSwipe = distanceY < -50;

    // Prioritize the direction with the largest movement
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe) {
        setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
      } else if (isRightSwipe) {
        setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
      }
    } else {
      if (isUpSwipe) {
        setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
      } else if (isDownSwipe) {
        setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
      }
    }
  }, [touchStart, touchEnd, gameStarted, gameOver, showNameInput]);

  // Mobile button handlers
  const handleMobileStart = useCallback(() => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
    } else if (gameOver && !showNameInput) {
      resetGame();
    }
  }, [gameStarted, gameOver, showNameInput]);

  const handleDirectionButton = useCallback((newDirection: Direction) => {
    if (!gameStarted || gameOver || showNameInput) return;
    
    setDirection(prev => {
      switch (newDirection) {
        case 'UP': return prev !== 'DOWN' ? 'UP' : prev;
        case 'DOWN': return prev !== 'UP' ? 'DOWN' : prev;
        case 'LEFT': return prev !== 'RIGHT' ? 'LEFT' : prev;
        case 'RIGHT': return prev !== 'LEFT' ? 'RIGHT' : prev;
        default: return prev;
      }
    });
  }, [gameStarted, gameOver, showNameInput]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    setShowNameInput(false);
    setIsNewHighscore(false);
  };

  const handleNameSubmit = async (name: string) => {
    if (isNewHighscore) {
      await addHighscore(name, score);
      // Reload highscores to get the latest from GitHub
      const updatedHighscores = await loadHighscoresWithSync();
      setHighscores(updatedHighscores);
    }
    setShowNameInput(false);
    setIsNewHighscore(false);
  };

  // Load highscores on component mount
  useEffect(() => {
    const loadInitialHighscores = async () => {
      try {
        const highscores = await loadHighscoresWithSync();
        setHighscores(highscores);
      } catch (error) {
        console.error('Failed to load highscores with sync:', error);
        // Fallback to local storage only
        setHighscores(loadHighscores());
      }
    };
    
    loadInitialHighscores();
  }, []);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 100);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // Key event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Touch event listeners
  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const renderGrid = () => {
    const grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let cellClass = 'cell';
        
        // Check if this cell is part of the snake
        const isSnakeHead = snake[0] && snake[0].x === col && snake[0].y === row;
        const isSnakeBody = snake.some((segment, index) => 
          index > 0 && segment.x === col && segment.y === row
        );
        
        // Check if this cell has food
        const isFood = food.x === col && food.y === row;

        if (isSnakeHead) {
          cellClass += ' snake-head';
        } else if (isSnakeBody) {
          cellClass += ' snake-body';
        } else if (isFood) {
          cellClass += ' food';
        }

        grid.push(
          <div
            key={`${row}-${col}`}
            className={cellClass}
          />
        );
      }
    }
    return grid;
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <h1>Vibe Snake</h1>
        <div className="score">Score: {score}</div>
      </div>
      
      <div className="game-board">
        {renderGrid()}
      </div>

      {!gameStarted && !gameOver && (
        <div className="game-message">
          <p>Press SPACE to start!</p>
          <p>Use Arrow Keys or WASD to control the snake</p>
          <div className="mobile-controls">
            <button className="mobile-start-button" onClick={handleMobileStart}>
              TAP TO START
            </button>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#cccccc' }}>
              Swipe to move • Tap anywhere to start
            </p>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-message">
          <p>Game Over!</p>
          <NameInput 
            isVisible={showNameInput} 
            onSubmit={handleNameSubmit}
          />
          {!showNameInput && (
            <>
              <HighscoreBoard highscores={highscores} />
              <p>Final Score: {score}</p>
              <p>Press SPACE to restart</p>
              <div className="mobile-controls">
                <button className="mobile-start-button" onClick={handleMobileStart}>
                  TAP TO RESTART
                </button>
                <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#cccccc' }}>
                  Swipe anywhere to restart
                </p>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Mobile directional controls - only show during gameplay */}
      {gameStarted && !gameOver && (
        <div className="swipe-controls">
          <button 
            className="control-button control-up"
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('UP'); }}
            onClick={() => handleDirectionButton('UP')}
          >
            ↑
          </button>
          <button 
            className="control-button control-left"
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('LEFT'); }}
            onClick={() => handleDirectionButton('LEFT')}
          >
            ←
          </button>
          <button 
            className="control-button control-right"
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('RIGHT'); }}
            onClick={() => handleDirectionButton('RIGHT')}
          >
            →
          </button>
          <button 
            className="control-button control-down"
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('DOWN'); }}
            onClick={() => handleDirectionButton('DOWN')}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;