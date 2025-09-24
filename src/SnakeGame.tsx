import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 100;
const INITIAL_SNAKE: Position[] = [{ x: 50, y: 50 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const INITIAL_FOOD: Position = { x: 25, y: 25 };

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

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
  }, [direction, food, gameOver, gameStarted, generateFood]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameStarted) {
      if (e.code === 'Space') {
        setGameStarted(true);
      }
      return;
    }

    if (gameOver) {
      if (e.code === 'Space') {
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
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  };

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
        </div>
      )}

      {gameOver && (
        <div className="game-message">
          <p>Game Over!</p>
          <p>Final Score: {score}</p>
          <p>Press SPACE to restart</p>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;