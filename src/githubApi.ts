import { HighscoreEntry } from './types';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'T0liver';
const REPO_NAME = 'vibe-snake';
const HIGHSCORES_PATH = 'public/highscores.json';

// Get GitHub API token from environment or return null if not available
const getGitHubToken = (): string | null => {
  // In production, this would typically come from environment variables
  // For now, we'll try to get it from process.env if available
  return process.env.REACT_APP_GITHUB_TOKEN || null;
};

// Fetch current highscores from GitHub repository
export const fetchHighscoresFromGitHub = async (): Promise<HighscoreEntry[]> => {
  try {
    const token = getGitHubToken();
    if (!token) {
      console.log('No GitHub token available, using localStorage only');
      return [];
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHSCORES_PATH}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch highscores: ${response.statusText}`);
    }

    const data = await response.json();
    const content = atob(data.content.replace(/\s/g, ''));
    return JSON.parse(content) as HighscoreEntry[];
  } catch (error) {
    console.error('Error fetching highscores from GitHub:', error);
    return [];
  }
};

// Update highscores in GitHub repository
export const updateHighscoresInGitHub = async (highscores: HighscoreEntry[]): Promise<boolean> => {
  try {
    const token = getGitHubToken();
    if (!token) {
      console.log('No GitHub token available, skipping GitHub update');
      return false;
    }

    // First, get the current file to obtain its SHA
    const getCurrentFileResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHSCORES_PATH}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let sha = '';
    if (getCurrentFileResponse.ok) {
      const currentData = await getCurrentFileResponse.json();
      sha = currentData.sha;
    }

    // Prepare the new content
    const content = btoa(JSON.stringify(highscores, null, 2));
    
    // Update the file
    const updateResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHSCORES_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update highscores from Vibe Snake game',
          content,
          sha: sha || undefined,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update highscores: ${updateResponse.statusText}`);
    }

    console.log('Successfully updated highscores in GitHub');
    return true;
  } catch (error) {
    console.error('Error updating highscores in GitHub:', error);
    return false;
  }
};

// Sync highscores with GitHub (fetch and merge with local)
export const syncHighscoresWithGitHub = async (localHighscores: HighscoreEntry[]): Promise<HighscoreEntry[]> => {
  try {
    const githubHighscores = await fetchHighscoresFromGitHub();
    
    if (githubHighscores.length === 0) {
      return localHighscores;
    }

    // Merge and sort all highscores
    const allHighscores = [...localHighscores, ...githubHighscores];
    const uniqueHighscores = allHighscores.filter((entry, index, array) => {
      return index === array.findIndex(e => 
        e.name === entry.name && 
        e.score === entry.score && 
        e.date === entry.date
      );
    });

    // Sort by score (descending) and keep top 10
    uniqueHighscores.sort((a, b) => b.score - a.score);
    return uniqueHighscores.slice(0, 10);
  } catch (error) {
    console.error('Error syncing highscores with GitHub:', error);
    return localHighscores;
  }
};