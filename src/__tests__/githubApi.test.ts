import { fetchHighscoresFromGitHub, updateHighscoresInGitHub, syncHighscoresWithGitHub } from '../githubApi';
import { HighscoreEntry } from '../types';

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock btoa and atob for Node environment
Object.defineProperty(global, 'btoa', {
  value: (str: string) => Buffer.from(str, 'binary').toString('base64')
});

Object.defineProperty(global, 'atob', {
  value: (str: string) => Buffer.from(str, 'base64').toString('binary')
});

describe('GitHub API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env.REACT_APP_GITHUB_TOKEN;
  });

  describe('fetchHighscoresFromGitHub', () => {
    test('returns empty array when no token is available', async () => {
      const result = await fetchHighscoresFromGitHub();
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('fetches highscores from GitHub when token is available', async () => {
      process.env.REACT_APP_GITHUB_TOKEN = 'test-token';
      
      const mockHighscores: HighscoreEntry[] = [
        { name: 'Test Player', score: 100, date: '2024-01-01T00:00:00.000Z' }
      ];
      
      const encodedContent = Buffer.from(JSON.stringify(mockHighscores)).toString('base64');
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          content: encodedContent
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse as any);
      
      const result = await fetchHighscoresFromGitHub();
      
      expect(result).toEqual(mockHighscores);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/T0liver/vibe-snake/contents/public/highscores.json',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token test-token'
          })
        })
      );
    });

    test('handles API errors gracefully', async () => {
      process.env.REACT_APP_GITHUB_TOKEN = 'test-token';
      
      const mockResponse = {
        ok: false,
        statusText: 'Not Found'
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse as any);
      
      const result = await fetchHighscoresFromGitHub();
      
      expect(result).toEqual([]);
    });
  });

  describe('updateHighscoresInGitHub', () => {
    test('returns false when no token is available', async () => {
      const mockHighscores: HighscoreEntry[] = [
        { name: 'Test Player', score: 100, date: '2024-01-01T00:00:00.000Z' }
      ];
      
      const result = await updateHighscoresInGitHub(mockHighscores);
      
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('updates highscores in GitHub when token is available', async () => {
      process.env.REACT_APP_GITHUB_TOKEN = 'test-token';
      
      const mockHighscores: HighscoreEntry[] = [
        { name: 'Test Player', score: 100, date: '2024-01-01T00:00:00.000Z' }
      ];
      
      // Mock the GET request to fetch current file
      const getCurrentResponse = {
        ok: true,
        json: () => Promise.resolve({ sha: 'test-sha' })
      };
      
      // Mock the PUT request to update file
      const updateResponse = {
        ok: true,
        json: () => Promise.resolve({ commit: { sha: 'new-sha' } })
      };
      
      mockFetch
        .mockResolvedValueOnce(getCurrentResponse as any)
        .mockResolvedValueOnce(updateResponse as any);
      
      const result = await updateHighscoresInGitHub(mockHighscores);
      
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('syncHighscoresWithGitHub', () => {
    test('merges local and GitHub highscores correctly', async () => {
      process.env.REACT_APP_GITHUB_TOKEN = 'test-token';
      
      const localHighscores: HighscoreEntry[] = [
        { name: 'Local Player', score: 150, date: '2024-01-02T00:00:00.000Z' }
      ];
      
      const githubHighscores: HighscoreEntry[] = [
        { name: 'GitHub Player', score: 200, date: '2024-01-01T00:00:00.000Z' }
      ];
      
      const encodedContent = Buffer.from(JSON.stringify(githubHighscores)).toString('base64');
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          content: encodedContent
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse as any);
      
      const result = await syncHighscoresWithGitHub(localHighscores);
      
      // Should be sorted by score (descending)
      expect(result).toEqual([
        { name: 'GitHub Player', score: 200, date: '2024-01-01T00:00:00.000Z' },
        { name: 'Local Player', score: 150, date: '2024-01-02T00:00:00.000Z' }
      ]);
    });

    test('removes duplicates when merging', async () => {
      process.env.REACT_APP_GITHUB_TOKEN = 'test-token';
      
      const duplicateEntry = { name: 'Same Player', score: 100, date: '2024-01-01T00:00:00.000Z' };
      
      const localHighscores: HighscoreEntry[] = [duplicateEntry];
      const githubHighscores: HighscoreEntry[] = [duplicateEntry];
      
      const encodedContent = Buffer.from(JSON.stringify(githubHighscores)).toString('base64');
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          content: encodedContent
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse as any);
      
      const result = await syncHighscoresWithGitHub(localHighscores);
      
      expect(result).toEqual([duplicateEntry]);
      expect(result).toHaveLength(1);
    });
  });
});