import React from 'react';

export default function TrendingTopics({ topics = [] , onSelect}) {
  const list = topics.length ? topics : ['Sabarimalai','Pilgrimage','Indian Politics','Technology','Sports'];

  return (
    <div className="trending">
      {list.map((t, i) => (
        <button key={i} className="chip" onClick={() => onSelect && onSelect(t)}>{t}</button>
      ))}
    </div>
  );
}
