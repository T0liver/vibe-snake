import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders snake game', () => {
  render(<App />);
  const gameTitle = screen.getByText(/vibe snake/i);
  expect(gameTitle).toBeInTheDocument();
});

test('renders game instructions', () => {
  render(<App />);
  const instructions = screen.getByText(/press space to start/i);
  expect(instructions).toBeInTheDocument();
});
