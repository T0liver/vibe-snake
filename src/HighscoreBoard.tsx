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
      {highscores.map((entry, index) => (
        <p key={`${entry.name}-${entry.score}-${index}`} className={`highscore-entry rank-${index + 1}`}>
          #{index + 1} {entry.name} - {entry.score}
        </p>
      ))}
    </div>
  );
};

export default HighscoreBoard;