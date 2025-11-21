import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/Topbar';
import FeaturedNews from '../components/FeaturedNews';
import AnalyticsCards from '../components/AnalyticsCards';
import TrendingTopics from '../components/TrendingTopics';
import NewsCard from '../components/NewsCard';
import { getLatestNews } from '../services/newsAPI';

export default function Dashboard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (q = '', append = false) => {
    setLoading(true);
    setError(null);
    
    // Improved query handling - for dashboard, default to latest news
    let finalQuery = '';
    if (typeof q === 'string' && q.trim()) {
      finalQuery = q.trim();
    } else if (typeof q === 'object' && q.q) {
      finalQuery = q.q.trim();
    }
    // For dashboard, don't use random topics - get latest news
    
    try {
      const res = await getLatestNews(finalQuery);
      if (append) {
        // Filter out duplicates by checking article links
        setNews(prev => {
          const existingLinks = new Set(prev.map(a => a.link));
          const newArticles = res.filter(a => a.link && !existingLinks.has(a.link));
          return [...prev, ...newArticles];
        });
      } else {
        setNews(res || []);
      }
      if (!res || res.length === 0) {
        setError('No articles found. The API might be rate-limited or the query returned no results.');
      }
    } catch (err) {
      setError('Failed to fetch news. Please check your connection and try again.');
      console.error('Dashboard load error:', err);
      // Set empty array to prevent undefined errors
      if (!append) setNews([]);
    }
    setLoading(false);
  }, []); // Remove news dependency to prevent infinite re-renders

  useEffect(() => { 
    let mounted = true;
    const initLoad = async () => {
      if (mounted) {
        setLoading(true);
        setError(null);
        const randomTopics = ['world', 'india', 'technology', 'business', 'sports', 'entertainment', 'health', 'science'];
        const finalQuery = randomTopics[Math.floor(Math.random() * randomTopics.length)];
        
        try {
          const res = await getLatestNews(finalQuery);
          if (mounted) {
            setNews(res || []);
            if (!res || res.length === 0) {
              setError('No articles found. The API might be rate-limited or the query returned no results.');
            }
          }
        } catch (err) {
          if (mounted) {
            setError('Failed to fetch news. Please check your connection and try again.');
            console.error('Dashboard load error:', err);
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
    <div className="page dashboard">
      <Topbar onSearch={load} />
      <div className="dashboard-content">
        <FeaturedNews articles={news} />
        <AnalyticsCards />
        <div className="dashboard-main">
          <section className="latest">
            <h3>Latest News</h3>
            {loading && <p className="loading-msg">Loading news...</p>}
            {error && <p className="error-msg">{error}</p>}
            {!loading && !error && news.length === 0 && (
              <div className="no-results">
                <p>No articles found. Try a different search.</p>
                <button onClick={() => load()}>Retry</button>
              </div>
            )}
            <div className="news-grid">
              {news.map((a, i) => <NewsCard key={a.link && a.link !== '#' ? a.link : `article-${i}-${a.title?.slice(0, 20)}`} article={a} />)}
            </div>
            {!loading && news.length > 0 && (
              <button className="load-more-btn" onClick={() => load('', true)}>
                Load More News
              </button>
            )}
          </section>
          <aside className="sidebar-right">
            <h3>Trending Topics</h3>
            <TrendingTopics onSelect={load} />
          </aside>
        </div>
      </div>
    </div>
  );
}
