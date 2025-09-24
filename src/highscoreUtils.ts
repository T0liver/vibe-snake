import { HighscoreEntry } from './types';

export const loadHighscores = (): HighscoreEntry[] => {
  try {
    // In a browser environment, we'll use localStorage instead of file system
    const stored = localStorage.getItem('vibeSnakeHighscores');
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load highscores:', error);
    return [];
  }
};

export const saveHighscores = (highscores: HighscoreEntry[]): void => {
  try {
    localStorage.setItem('vibeSnakeHighscores', JSON.stringify(highscores));
  } catch (error) {
    console.error('Failed to save highscores:', error);
  }
};

export const addHighscore = (name: string, score: number): boolean => {
  const currentHighscores = loadHighscores();
  
  // Check if this score qualifies for top 10
  if (currentHighscores.length < 10 || score > currentHighscores[currentHighscores.length - 1]?.score) {
    const newEntry: HighscoreEntry = {
      name: name.trim() || 'Anonymous',
      score,
      date: new Date().toISOString()
    };
    
    // Add new entry and sort by score (descending)
    currentHighscores.push(newEntry);
    currentHighscores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    const top10 = currentHighscores.slice(0, 10);
    
    saveHighscores(top10);
    return true;
  }
  
  return false;
};

export const isHighscore = (score: number): boolean => {
  const currentHighscores = loadHighscores();
  return currentHighscores.length < 10 || score > (currentHighscores[currentHighscores.length - 1]?.score || 0);
};