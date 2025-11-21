import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/Topbar';
import NewsCard from '../components/NewsCard';
import { getLatestNews } from '../services/newsAPI';

export default function TopStories(){
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (q = '', append = false) => {
    setLoading(true);
    setError(null);
    
    let finalQuery = ''; // Default to latest news for top stories
    if (typeof q === 'string' && q.trim()) {
      finalQuery = q.trim();
    }
    
    try {
      const res = await getLatestNews(finalQuery);
      if (append) {
        setNews(prev => {
          const existingLinks = new Set(prev.map(a => a.link));
          const newArticles = (res || []).filter(a => a.link && !existingLinks.has(a.link));
          return [...prev, ...newArticles];
        });
      } else {
        setNews(res || []);
      }
      if (!res || res.length === 0) {
        setError('No top stories found. Please try again later.');
      }
    } catch (err) {
      console.error('TopStories: failed to load articles', err);
      setError('Failed to fetch top stories. Please check your connection.');
      if (!append) setNews([]);
    } finally {
      setLoading(false);
    }
  }, []); // Remove news dependency

  useEffect(() => {
    let mounted = true;
    const initLoad = async () => {
      if (mounted) {
        setLoading(true);
        setError(null);
        const randomTopics = ['breaking', 'top news', 'headlines', 'world', 'trending'];
        const finalQuery = randomTopics[Math.floor(Math.random() * randomTopics.length)];
        
        try {
          const res = await getLatestNews(finalQuery);
          if (mounted) {
            setNews(res || []);
            if (!res || res.length === 0) {
              setError('No top stories found. Please try again later.');
            }
          }
        } catch (err) {
          if (mounted) {
            console.error('TopStories: failed to load articles', err);
            setError('Failed to fetch top stories. Please check your connection.');
            setNews([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    };
    initLoad();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="page topstories">
      <Topbar onSearch={load} />
      <section className="news-grid-wrap">
        <h3>Top Stories</h3>
        {loading && <p className="loading-msg">Loading top stories...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && !error && news.length === 0 && (
          <div className="no-results">
            <p>No top stories found. Try a different search.</p>
            <button onClick={() => load()}>Retry</button>
          </div>
        )}
        <div className="news-grid">
          {news.map((a, i) => (
            <NewsCard key={a.link && a.link !== '#' ? a.link : `article-${i}-${a.title?.slice(0, 20)}`} article={a} />
          ))}
        </div>
        {!loading && news.length > 0 && (
          <button className="load-more-btn" onClick={() => load('', true)}>
            Load More Top Stories
          </button>
        )}
      </section>
    </div>
  );
}
