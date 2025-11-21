import React from 'react';

export default function AnalyticsCards({ stats = {} }) {
  const { views = 12456, engagement = 62, popularity = 78 } = stats;

  return (
    <div className="analytics-cards">
      <div className="card">
        <h4>Total Views</h4>
        <p>{views.toLocaleString()}</p>
      </div>
      <div className="card">
        <h4>Engagement</h4>
        <p>{engagement}%</p>
      </div>
      <div className="card">
        <h4>Popularity</h4>
        <p>{popularity}</p>
      </div>
    </div>
  );
}
