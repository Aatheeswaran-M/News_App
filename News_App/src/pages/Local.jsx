import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/Topbar';
import NewsCard from '../components/NewsCard';
import { getLatestNews } from '../services/newsAPI';

export default function Local(){
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (q = '', append = false) => {
    setLoading(true);
    setError(null);
    
    let finalQuery = 'india'; // Default to India for local news
    if (typeof q === 'string' && q.trim()) {
      finalQuery = q.trim();
    }
    
    try {
      const res = await getLatestNews(finalQuery);
      if (append) {
        setNews(prev => {
          const existingLinks = new Set(prev.map(a => a.link));
          const newArticles = res.filter(a => a.link && !existingLinks.has(a.link));
          return [...prev, ...newArticles];
        });
      } else {
        setNews(res || []);
      }
      if (!res || res.length === 0) {
        setError('No local news found. Please try again later.');
      }
    } catch (err) {
      setError('Failed to fetch local news. Please check your connection.');
      console.error('Local page load error:', err);
      if (!append) setNews([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const initLoad = async () => {
      if (mounted) {
        setLoading(true);
        setError(null);
        const localTopics = ['india', 'delhi', 'mumbai', 'bangalore', 'chennai', 'local news'];
        const finalQuery = localTopics[Math.floor(Math.random() * localTopics.length)];
        
        try {
          const res = await getLatestNews(finalQuery);
          if (mounted) {
            setNews(res || []);
            if (!res || res.length === 0) {
              setError('No local news found. Please try again later.');
            }
          }
        } catch (err) {
          if (mounted) {
            setError('Failed to fetch local news. Please check your connection.');
            console.error('Local page load error:', err);
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
    <div className="page local">
      <Topbar onSearch={load} />
      <section className="news-grid-wrap">
        <h3>Local News (India)</h3>
        {loading && <p className="loading-msg">Loading local news...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && !error && news.length === 0 && (
          <div className="no-results">
            <p>No local articles found. Try a different search.</p>
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
            Load More Local News
          </button>
        )}
      </section>
    </div>
  );
}
