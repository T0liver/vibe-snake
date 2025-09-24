# GitHub Highscore Integration

This document describes the new GitHub integration feature for Vibe Snake highscores.

## Overview

The game now supports syncing highscores with a GitHub repository using the GitHub API. This allows highscores to be persisted across different devices and shared globally.

## Features

- **Dual Storage**: Highscores are stored both locally (localStorage) and remotely (GitHub repository)
- **Automatic Sync**: On game load, local and remote highscores are merged and synchronized
- **Fallback Support**: If GitHub API is unavailable, the game continues to work with localStorage only
- **Error Handling**: Robust error handling ensures the game remains playable even if GitHub sync fails

## Setup

### API Token Configuration

To enable GitHub sync, you need to set the `REACT_APP_GITHUB_TOKEN` environment variable with a GitHub Personal Access Token that has the following permissions for the repository:

- **Content**: Read and write
- **Metadata**: Read-only

#### Setting the Environment Variable

**For Local Development:**

**Option 1: Using .env.local file (Git-ignored, recommended for local dev)**

Create a `.env.local` file in the project root directory (this file is automatically ignored by Git):

```bash
# .env.local
REACT_APP_GITHUB_TOKEN=your_github_token_here
```

**Option 2: Using .env file**

Create a `.env` file in the project root directory:

```bash
# .env
REACT_APP_GITHUB_TOKEN=your_github_token_here
```

**For Cloud Deployment:**

**Option 3: GitHub Repository Secrets (Recommended for cloud hosting)**

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `REACT_APP_GITHUB_TOKEN`
5. Value: Your GitHub Personal Access Token
6. Configure your deployment workflow to use this secret

Example GitHub Actions workflow:
```yaml
# .github/workflows/deploy.yml
env:
  REACT_APP_GITHUB_TOKEN: ${{ secrets.REACT_APP_GITHUB_TOKEN }}
```

**Option 4: Cloud Platform Environment Variables**

Configure the environment variable in your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment Variables  
- **Heroku**: Settings → Config Vars
- **Render**: Environment → Environment Variables

**Option 5: System environment variable**

Set the environment variable in your shell:

```bash
export REACT_APP_GITHUB_TOKEN=your_github_token_here
npm start
```

**Option 6: Inline with npm commands**

```bash
REACT_APP_GITHUB_TOKEN=your_github_token_here npm start
```

> **Note**: The token must be prefixed with `REACT_APP_` to be accessible in the React application. Without this prefix, Create React App will not include it in the build.

### Repository Configuration

The integration is configured to work with:
- Repository: `T0liver/vibe-snake`
- File path: `public/highscores.json`

## Files Modified

### New Files
- `src/githubApi.ts` - GitHub API integration utilities
- `src/__tests__/githubApi.test.ts` - Tests for GitHub API functionality

### Modified Files
- `src/highscoreUtils.ts` - Enhanced with GitHub sync functionality
- `src/SnakeGame.tsx` - Updated to use async highscore loading/saving
- `public/highscores.json` - Contains persistent highscore data

## API Functions

### `fetchHighscoresFromGitHub()`
Fetches current highscores from the GitHub repository.

### `updateHighscoresInGitHub(highscores)`
Updates the highscores.json file in the GitHub repository.

### `syncHighscoresWithGitHub(localHighscores)`
Merges local and remote highscores, removing duplicates and maintaining top 10.

### Enhanced Highscore Utils
- `loadHighscoresWithSync()` - Loads and syncs highscores from both local and GitHub
- `saveHighscoresWithSync()` - Saves highscores locally and pushes to GitHub
- `addHighscore()` - Now async, automatically syncs with GitHub

## Behavior

1. **Game Start**: Loads highscores from localStorage and syncs with GitHub
2. **New Highscore**: Saves to localStorage immediately, then attempts to update GitHub
3. **No Token**: Functions gracefully degrade to localStorage-only mode
4. **API Failures**: Logged to console but don't prevent game functionality

## Testing

The integration includes comprehensive tests covering:
- Token availability scenarios
- API success and failure cases
- Data merging and deduplication
- Error handling

Run tests with:
```bash
npm test
```

## Security Notes

- The GitHub token is only used for API requests to the configured repository
- No sensitive data is transmitted beyond highscore information (name, score, date)
- Local storage continues to work even if GitHub integration fails