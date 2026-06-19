import React from 'react';

export default function Sidebar({ activeSector, setActiveSector, theme, toggleTheme }) {
  return (
    <aside className="left-sidebar" aria-label="Sidebar Navigation">
      <div className="sidebar-top">
        <div className="sidebar-logo" title="Rexopro Animal Book" onClick={() => setActiveSector('all')}>
          <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor">
            <path d="M10 2v6h12V2h4v12H6V2h4zm12 16H10v12h12V18zm4-2v16h-4V20H6v12H2V16h24z"/>
          </svg>
        </div>
      </div>
      
      <nav className="sidebar-menu">
        <button 
          className={`sidebar-item ${activeSector === 'all' ? 'active' : ''}`} 
          onClick={() => setActiveSector('all')} 
          title="Explore All Species"
        >
          <span className="icon">🧭</span>
          <span className="label">Explore</span>
        </button>
        <button 
          className={`sidebar-item ${activeSector === 'land' ? 'active' : ''}`} 
          onClick={() => setActiveSector('land')} 
          title="Land Mammals"
        >
          <span className="icon">🌳</span>
          <span className="label">Land</span>
        </button>
        <button 
          className={`sidebar-item ${activeSector === 'marine' ? 'active' : ''}`} 
          onClick={() => setActiveSector('marine')} 
          title="Marine Life"
        >
          <span className="icon">🌊</span>
          <span className="label">Marine</span>
        </button>
        <button 
          className={`sidebar-item ${activeSector === 'birds' ? 'active' : ''}`} 
          onClick={() => setActiveSector('birds')} 
          title="Avian Species"
        >
          <span className="icon">🦅</span>
          <span className="label">Birds</span>
        </button>
        <button 
          className={`sidebar-item ${activeSector === 'bookmarks' ? 'active' : ''}`} 
          onClick={() => setActiveSector('bookmarks')} 
          title="My Bookmarked Animals"
        >
          <span className="icon">♥</span>
          <span className="label">Bookmarks</span>
        </button>
      </nav>
      
      <div className="sidebar-bottom">
        <button 
          id="btn-theme-toggle" 
          className="sidebar-item" 
          onClick={toggleTheme} 
          title="Toggle Theme Mode"
        >
          <span className="icon" id="theme-icon">{theme === 'dark' ? '☀' : '🌙'}</span>
        </button>
        <div className="user-avatar" title="Rexopro Curator">
          <div className="avatar-inner">R</div>
        </div>
      </div>
    </aside>
  );
}
