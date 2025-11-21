import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFire, FaMapMarkerAlt, FaLandmark, FaLaptop, FaFutbol, FaBookmark, FaCog } from 'react-icons/fa';

const items = [
  { to: '/', label: 'Dashboard', icon: <FaHome /> },
  { to: '/top-stories', label: 'Top Stories', icon: <FaFire /> },
  { to: '/local', label: 'Local News', icon: <FaMapMarkerAlt /> },
  { to: '/politics', label: 'Politics', icon: <FaLandmark /> },
  { to: '/technology', label: 'Technology', icon: <FaLaptop /> },
  { to: '/sports', label: 'Sports', icon: <FaFutbol /> },
  { to: '/bookmarks', label: 'Bookmarks', icon: <FaBookmark /> },
  { to: '/settings', label: 'Settings', icon: <FaCog /> }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">NewsApp</div>
      <nav>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} className={({isActive})=> isActive ? 'nav-item active' : 'nav-item'}>
            <span className="icon">{it.icon}</span>
            <span className="label">{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
