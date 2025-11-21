import React from 'react';
import NewsCard from './NewsCard';

export default function FeaturedNews({ articles = [] }) {
  const main = articles[0];
  const side = articles.slice(1, 5);

  return (
    <section className="featured">
      <div className="featured-main">
        {main ? (
          <div className="main-card">
            {main.image_url && <img src={main.image_url} alt={main.title || 'Featured news'} />}
            <div className="main-content">
              <h2>{main.title}</h2>
              <p>{main.description}</p>
            </div>
          </div>
        ) : (
          <div className="main-card placeholder">No featured news</div>
        )}
      </div>
      <div className="featured-side">
        {side.map((a, idx) => (
          <NewsCard key={idx} article={a} small />
        ))}
      </div>
    </section>
  );
}
