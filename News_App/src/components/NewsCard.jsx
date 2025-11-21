import React, { useState } from 'react';
import { FaBookmark } from 'react-icons/fa';

export default function NewsCard({ article, small }) {
  const { title, description, image_url, link, source, pubDate } = article || {};
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const bookmark = () => {
    try {
      const list = JSON.parse(localStorage.getItem('newsapp-bookmarks') || '[]');
      if (!list.find((i) => i.link === link)) {
        list.unshift(article);
        localStorage.setItem('newsapp-bookmarks', JSON.stringify(list));
        window.dispatchEvent(new Event('bookmarks-updated'));
      }
    } catch (error) {
      console.error('Failed to bookmark article:', error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <article className={"news-card" + (small ? ' small' : '')}>
      {image_url && !imageError && (
        <img 
          src={image_url} 
          alt={title || 'news image'} 
          onError={handleImageError}
        />
      )}
      <div className="news-body">
        <h3 title={title}>{title || 'Untitled Article'}</h3>
        {source && <small className="news-source">{source}</small>}
        {!small && (
          <>
            <p className={expanded ? 'expanded' : 'clamped'}>{description || ''}</p>
            {pubDate && <small className="news-date">{formatDate(pubDate)}</small>}
            <div className="news-actions">
              <div className="left-actions">
                <a 
                  href={link && link !== '#' && link !== 'sample-1' && link !== 'sample-2' ? link : '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!link || link === '#' || link === 'sample-1' || link === 'sample-2') {
                      e.preventDefault();
                    }
                  }}
                >
                  {link && link !== '#' && link !== 'sample-1' && link !== 'sample-2' ? 'Read More' : 'No Link Available'}
                </a>
                {description && description.length > 220 && (
                  <button className="read-more" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
              <button 
                onClick={bookmark} 
                title="Bookmark" 
                disabled={!link || link === '#' || link === 'sample-1' || link === 'sample-2'}
              >
                <FaBookmark />
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
