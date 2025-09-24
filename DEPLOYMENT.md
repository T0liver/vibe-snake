# Cloud Deployment Guide

This guide explains how to deploy Vibe Snake to various cloud platforms with GitHub highscore synchronization enabled.

## Prerequisites

1. A GitHub Personal Access Token with the following permissions for this repository:
   - **Content**: Read and write
   - **Metadata**: Read-only

## Deployment Options

### 1. GitHub Pages (Recommended)

GitHub Pages deployment is automated via GitHub Actions workflow.

#### Setup Steps:

1. **Create Repository Secret:**
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `REACT_APP_GITHUB_TOKEN`
   - Value: Your GitHub Personal Access Token

2. **Enable GitHub Pages:**
   - Go to repository → **Settings** → **Pages**
   - Source: **GitHub Actions**

3. **Deploy:**
   - Push to main branch or manually trigger the workflow
   - The workflow will build and deploy automatically
   - Your app will be available at `https://yourusername.github.io/vibe-snake`

### 2. Vercel

#### Setup Steps:

1. **Connect Repository:**
   - Connect your GitHub repository to Vercel
   - Import the project

2. **Configure Environment Variable:**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add: `REACT_APP_GITHUB_TOKEN` = `your_github_token_here`
   - Apply to: **Production**, **Preview**, and **Development**

3. **Deploy:**
   - Vercel will automatically deploy on git pushes
   - Your app will be available at your Vercel domain

### 3. Netlify

#### Setup Steps:

1. **Connect Repository:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`

2. **Configure Environment Variable:**
   - In Netlify dashboard → Site Settings → Build & Deploy → Environment Variables
   - Add: `REACT_APP_GITHUB_TOKEN` = `your_github_token_here`

3. **Deploy:**
   - Netlify will automatically deploy on git pushes
   - Your app will be available at your Netlify domain

### 4. Heroku

#### Setup Steps:

1. **Create Heroku App:**
   ```bash
   heroku create your-app-name
   ```

2. **Add Buildpack:**
   ```bash
   heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git
   ```

3. **Configure Environment Variable:**
   ```bash
   heroku config:set REACT_APP_GITHUB_TOKEN=your_github_token_here
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### 5. Render

#### Setup Steps:

1. **Connect Repository:**
   - Connect your GitHub repository to Render
   - Create a **Static Site**

2. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Publish Directory: `build`

3. **Configure Environment Variable:**
   - In Render dashboard → Environment
   - Add: `REACT_APP_GITHUB_TOKEN` = `your_github_token_here`

4. **Deploy:**
   - Render will automatically deploy on git pushes

## Security Notes

- **Never commit your GitHub token to the repository**
- Use repository secrets or platform environment variables
- The token is only used for updating highscores.json
- The app works without the token (localStorage only)

## Troubleshooting

### Token Not Working
- Verify the token has correct permissions
- Check the environment variable name is exactly `REACT_APP_GITHUB_TOKEN`
- Ensure the token is set in the deployment environment

### Build Failures
- Check that all environment variables are properly set
- Verify the build command is `npm run build`
- Check build logs for specific error messages

### Highscores Not Syncing
- Check browser console for API errors
- Verify the token has write permissions to the repository
- Test locally with the same token

## GitHub Actions Workflow

The included `.github/workflows/deploy.yml` file provides:
- Automated building with environment variables
- GitHub Pages deployment
- Proper permissions and security

You can customize this workflow for other deployment targets by changing the deployment step.