import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import useTheme from '../context/useTheme';
import { FaTrash, FaSync, FaBell, FaGlobe, FaMoon, FaSun } from 'react-icons/fa';

export default function Settings() {
  const { dark, setDark } = useTheme();
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('newsapp-notifications') === 'true';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('newsapp-language') || 'en';
  });
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('newsapp-bookmarks') || '[]');
    setBookmarkCount(bookmarks.length);
  }, []);

  const clearBookmarks = () => {
    if (window.confirm('Are you sure you want to clear all bookmarks?')) {
      localStorage.removeItem('newsapp-bookmarks');
      setBookmarkCount(0);
      window.dispatchEvent(new Event('bookmarks-updated'));
      alert('Bookmarks cleared successfully!');
    }
  };

  const clearCache = () => {
    if (window.confirm('Clear app cache? This will reload the page.')) {
      localStorage.removeItem('newsapp-theme');
      localStorage.removeItem('newsapp-notifications');
      localStorage.removeItem('newsapp-language');
      alert('Cache cleared! Page will reload.');
      window.location.reload();
    }
  };

  const toggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('newsapp-notifications', newValue);
  };

  const changeLanguage = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('newsapp-language', newLang);
  };

  return (
    <div className="page settings">
      <Topbar onSearch={() => {}} />
      <div className="settings-container">
        <h2>Settings</h2>
        
        <section className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <div className="setting-info">
              {dark ? <FaMoon /> : <FaSun />}
              <div>
                <h4>Theme</h4>
                <p>Switch between light and dark mode</p>
              </div>
            </div>
            <button className="toggle-btn" onClick={() => setDark(!dark)}>
              {dark ? 'Dark' : 'Light'}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>Notifications</h3>
          <div className="setting-item">
            <div className="setting-info">
              <FaBell />
              <div>
                <h4>Push Notifications</h4>
                <p>Get notified about breaking news</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notifications} onChange={toggleNotifications} />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h3>Language</h3>
          <div className="setting-item">
            <div className="setting-info">
              <FaGlobe />
              <div>
                <h4>Preferred Language</h4>
                <p>Select your news language</p>
              </div>
            </div>
            <select value={language} onChange={changeLanguage} className="lang-select">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="ml">Malayalam</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h3>Data Management</h3>
          <div className="setting-item">
            <div className="setting-info">
              <FaTrash />
              <div>
                <h4>Clear Bookmarks</h4>
                <p>Remove all saved articles ({bookmarkCount} items)</p>
              </div>
            </div>
            <button className="danger-btn" onClick={clearBookmarks}>
              Clear All
            </button>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <FaSync />
              <div>
                <h4>Clear Cache</h4>
                <p>Reset all app data and preferences</p>
              </div>
            </div>
            <button className="danger-btn" onClick={clearCache}>
              Clear Cache
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>About</h3>
          <div className="about-info">
            <p><strong>NewsApp</strong></p>
            <p>Version 1.0.0</p>
            <p>A modern news dashboard built with React</p>
          </div>
        </section>
      </div>
    </div>
  );
}
