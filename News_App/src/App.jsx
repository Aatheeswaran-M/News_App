import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TopStories from './pages/TopStories';
import Technology from './pages/Technology';
import Sports from './pages/Sports';
import Politics from './pages/Politics';
import Bookmarks from './pages/Bookmarks';
import Local from './pages/Local';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import './App.css';

export default function App(){
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="app-root">
            <Sidebar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Dashboard/>} />
                <Route path="/top-stories" element={<TopStories/>} />
                <Route path="/technology" element={<Technology/>} />
                <Route path="/sports" element={<Sports/>} />
                <Route path="/politics" element={<Politics/>} />
                <Route path="/bookmarks" element={<Bookmarks/>} />
                <Route path="/local" element={<Local/>} />
                <Route path="/settings" element={<Settings/>} />
                <Route path="*" element={<Dashboard/>} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}