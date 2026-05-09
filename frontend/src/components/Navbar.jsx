import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('parkUser') || 'null');

  const logout = () => {
    localStorage.removeItem('parkUser');
    navigate('/');
  };

  const isAdmin = user?.role === 'ADMIN';
  const links = isAdmin
    ? [
        { path: '/admin', label: '📊 Dashboard' },
        { path: '/admin/monitor', label: '🔍 Monitor' },
        { path: '/admin/lots', label: '🏢 Manage Lots' },
      ]
    : [
        { path: '/dashboard', label: '🏠 Dashboard' },
        { path: '/find-parking', label: '📍 Find Parking' },
        { path: '/history', label: '📋 History' },
      ];

  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">🅿️ SmartPark</a>
      <div className="navbar-nav">
        {links.map(l => (
          <a key={l.path} href={l.path}
            className={`nav-link${location.pathname === l.path ? ' active' : ''}`}
            onClick={e => { e.preventDefault(); navigate(l.path); }}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="navbar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <span style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
          <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--text-primary)' }}>{user?.name}</span>
          <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{isAdmin ? '🛡️ Admin' : '👤 User'}</span>
        </span>
        <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
