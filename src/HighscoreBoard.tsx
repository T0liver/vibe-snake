import React from 'react';
import { HighscoreEntry } from './types';
import './HighscoreBoard.css';

interface HighscoreBoardProps {
  highscores: HighscoreEntry[];
}

const HighscoreBoard: React.FC<HighscoreBoardProps> = ({ highscores }) => {
  if (highscores.length === 0) {
    return (
      <div className="highscore-board">
        <h3>🏆 High Scores 🏆</h3>
        <p className="no-scores">No high scores yet!</p>
      </div>
    );
  }

  return (
    <div className="highscore-board">
      <h3>🏆 High Scores 🏆</h3>
      <div className="highscore-list">
        {highscores.map((entry, index) => (
          <div key={`${entry.name}-${entry.score}-${index}`} className="highscore-entry">
            <span className="rank">#{index + 1}</span>
            <span className="name">{entry.name}</span>
            <span className="score">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighscoreBoard;