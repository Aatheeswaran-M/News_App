import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

export default function Topbar({ onSearch }) {
  const [q, setQ] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only set debounced query if it's not empty and has meaningful content
      const trimmedQuery = q.trim();
      if (trimmedQuery.length >= 2) {
        setDebouncedQuery(trimmedQuery);
      } else {
        setDebouncedQuery('');
      }
    }, 800); // Increased debounce time for better UX

    return () => clearTimeout(timer);
  }, [q]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2 && onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const submit = useCallback((e) => {
    e && e.preventDefault();
    const trimmedQuery = q.trim();
    if (trimmedQuery.length >= 2 && onSearch) {
      onSearch(trimmedQuery);
    } else if (trimmedQuery === '' && onSearch) {
      // If empty search, trigger default news load
      onSearch('');
    }
  }, [q, onSearch]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    // Basic input sanitization
    const sanitizedValue = value.replace(/[<>"']/g, '').slice(0, 100); // Limit to 100 chars
    setQ(sanitizedValue);
  }, []);

  return (
    <header className="topbar">
      <form className="search" onSubmit={submit}>
        <FaSearch className="search-icon" />
        <input
          placeholder="Search news... (min 2 characters)"
          value={q}
          onChange={handleInputChange}
          maxLength={100}
        />
        <button 
          type="submit" 
          className="search-btn"
          disabled={q.trim().length < 2 && q.trim().length > 0}
        >
          Search
        </button>
      </form>
      <div className="top-actions">
        <FaBell className="action-icon" />
        <ThemeToggle />
      </div>
    </header>
  );
}
