import React, { useState, useEffect, useRef } from 'react';
import './NameInput.css';

interface NameInputProps {
  onSubmit: (name: string) => void;
  isVisible: boolean;
}

const NameInput: React.FC<NameInputProps> = ({ onSubmit, isVisible }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name.trim() || 'Anonymous');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="name-input-container">
      <h3>🎉 New High Score! 🎉</h3>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your name"
          maxLength={15}
          className="name-input"
        />
        <button type="submit" className="submit-button">
          Save Score
        </button>
      </form>
    </div>
  );
};

export default NameInput;