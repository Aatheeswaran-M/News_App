import React from 'react';
import useTheme from '../context/useTheme';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function ThemeToggle() {
  const { dark, setDark } = useTheme();

  return (
    <button
      onClick={() => setDark(!dark)}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  );
}
