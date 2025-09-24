import { addHighscore, loadHighscores, isHighscore } from '../highscoreUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Highscore Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('loadHighscores returns empty array when no scores exist', () => {
    const scores = loadHighscores();
    expect(scores).toEqual([]);
  });

  test('addHighscore adds a new score and returns true', () => {
    const result = addHighscore('TestPlayer', 100);
    expect(result).toBe(true);
    
    const scores = loadHighscores();
    expect(scores).toHaveLength(1);
    expect(scores[0].name).toBe('TestPlayer');
    expect(scores[0].score).toBe(100);
  });

  test('isHighscore returns true for first 10 scores', () => {
    // Add 5 scores
    for (let i = 1; i <= 5; i++) {
      addHighscore(`Player${i}`, i * 10);
    }
    
    // Should accept new score since we have less than 10
    expect(isHighscore(1)).toBe(true);
  });

  test('isHighscore returns false for low scores when top 10 is full', () => {
    // Add 10 scores (10, 20, 30, ..., 100)
    for (let i = 1; i <= 10; i++) {
      addHighscore(`Player${i}`, i * 10);
    }
    
    // Should reject score of 5 (lower than lowest score of 10)
    expect(isHighscore(5)).toBe(false);
    
    // Should accept score of 50 (higher than some existing scores)
    expect(isHighscore(50)).toBe(true);
  });

  test('maintains only top 10 scores', () => {
    // Add 12 scores
    for (let i = 1; i <= 12; i++) {
      addHighscore(`Player${i}`, i * 10);
    }
    
    const scores = loadHighscores();
    expect(scores).toHaveLength(10);
    
    // Should be sorted by score descending
    expect(scores[0].score).toBe(120);
    expect(scores[9].score).toBe(30);
  });

  test('handles anonymous players', () => {
    const result = addHighscore('', 100);
    expect(result).toBe(true);
    
    const scores = loadHighscores();
    expect(scores[0].name).toBe('Anonymous');
  });
});