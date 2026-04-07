import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <MdLightMode className="theme-icon" />
      ) : (
        <MdDarkMode className="theme-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;
