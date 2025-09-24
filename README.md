# vibe-snake
Vibe coded app for VIAUBXAV087-00

A classic Snake game built with React and TypeScript featuring a retro aesthetic with glowing green elements on a dark blue background.

## Features

- 🎮 20x20 grid playground with smooth movement
- 🐍 Green snake with glowing effects
- 🍎 Animated red food with pulsing animation
- 🎯 Score tracking system
- 🎨 Beautiful dark blue background with neon green UI
- ⌨️ Dual control schemes: Arrow keys AND WASD
- 🔄 Game over detection and restart functionality
- 📱 Responsive design that works on different screen sizes

## Game Controls

- **Start Game**: Press `SPACE`
- **Move Up**: `↑` Arrow Key or `W`
- **Move Down**: `↓` Arrow Key or `S`
- **Move Left**: `←` Arrow Key or `A`
- **Move Right**: `→` Arrow Key or `D`
- **Restart**: Press `SPACE` when game over

## Getting Started

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in the interactive watch mode.

## Game Rules

1. Control the snake to eat the red food
2. Each food eaten increases your score by 10 points
3. The snake grows longer each time it eats food
4. Avoid hitting the snake's own body
5. The snake wraps around the edges of the playground
6. Try to achieve the highest score possible!

## Technical Details

Built with:
- React 19.1.1
- TypeScript 4.9.5
- CSS3 with animations and glowing effects
- Modern React hooks (useState, useEffect, useCallback)
- Responsive design principles