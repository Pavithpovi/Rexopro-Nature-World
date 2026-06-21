import React, { useState, useEffect } from 'react';
import { download4KImage } from '../utils/downloader';
import { getImageUrl } from '../utils/resolveAsset';

const EMERGENCY_FALLBACKS = {
  land: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80', // Lion
  marine: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // Dolphin
  birds: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80' // Bird
};

export default function DetailModal({ animal, onClose, isLiked, onToggleLike }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeState, setFadeState] = useState('in'); // 'in', 'out'
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [downloadingLaptop, setDownloadingLaptop] = useState(false);
  const [downloadingMobile, setDownloadingMobile] = useState(false);

  // Reset index when animal changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setDropdownOpen(false);
    setFadeState('in');
  }, [animal]);

  if (!animal) return null;

  // Active sector / category color accents mapping
  const getSectorAndAccent = () => {
    const colors = { land: '#10b981', marine: '#0ea5e9', birds: '#f59e0b' };
    
    // Check which category this animal belongs to
    let sector = 'land';
    if (animal.id.startsWith('marine')) sector = 'marine';
    else if (animal.id.startsWith('birds')) sector = 'birds';

    return { sector, color: colors[sector] };
  };

  const { sector, color } = getSectorAndAccent();

  // Consistent stats hash simulation
  const hash = animal.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const viewsVal = (hash * 157) + 5240;
  const downloadsVal = Math.floor(viewsVal * 0.12) + 640;

  // Specifications calculation
  const isEven = currentImageIndex % 2 === 0;
  const dimensionStr = isEven ? '800 x 600 px' : '600 x 800 px';
  const ratioStr = isEven ? '4:3' : '3:4';
  const orientStr = isEven ? 'Landscape' : 'Portrait';

  const changeSlide = (newIndex) => {
    setFadeState('out');
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setFadeState('in');
    }, 150);
  };

  const handlePrevSlide = () => {
    const len = animal.images.length;
    const newIndex = (currentImageIndex - 1 + len) % len;
    changeSlide(newIndex);
  };

  const handleNextSlide = () => {
    const len = animal.images.length;
    const newIndex = (currentImageIndex + 1) % len;
    changeSlide(newIndex);
  };

  const triggerDownload = async (format) => {
    setDropdownOpen(false);
    const setDownloading = format === 'laptop' ? setDownloadingLaptop : setDownloadingMobile;
    const activeImage = animal.images[currentImageIndex];
    await download4KImage(activeImage, animal.name, format, currentImageIndex + 1, setDownloading);
  };

  const isDownloading = downloadingLaptop || downloadingMobile;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-animal-name">
      <div className="modal-backdrop" onClick={onClose}></div>
      
      <div className="modal-body-wrapper">
        <button className="btn-close-modal" onClick={onClose} aria-label="Close detailed view">✕</button>

        <article className="unsplash-modal-card">
          {/* Modal Header */}
          <header className="modal-card-header">
            <div className="modal-user-block">
              <div className="modal-user-avatar" style={{ borderColor: color }}>
                <span>{animal.name.charAt(0)}</span>
              </div>
              <div className="modal-user-text">
                <h2 id="modal-animal-name" className="modal-headline">{animal.name}</h2>
                <h3 className="modal-scientific-name">{animal.scientificName}</h3>
              </div>
            </div>
            
            <div className="modal-header-actions">
              <button 
                id="btn-modal-like" 
                className={`btn-modal-secondary ${isLiked ? 'active' : ''}`}
                onClick={() => onToggleLike(animal.id)}
              >
                <span className="icon">♥</span> 
                <span className="btn-text">{isLiked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              {/* 4K Download Dropdown Container */}
              <div className="download-dropdown-wrap" style={{ position: 'relative' }}>
                <button 
                  className="btn-modal-primary"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  disabled={isDownloading}
                >
                  <span>{isDownloading ? '⏳' : '📥'}</span> 
                  <span>{isDownloading ? 'Downloading...' : 'Download Free (4K)'}</span>
                  <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu-box glass-panel">
                    <button onClick={() => triggerDownload('laptop')}>
                      💻 Laptop Wallpaper <span className="spec-sub">3840 x 2160 (16:9)</span>
                    </button>
                    <button onClick={() => triggerDownload('mobile')}>
                      📱 Mobile Wallpaper <span className="spec-sub">2160 x 3840 (9:16)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Modal Center Image Viewport */}
          <div className="modal-card-media">
            <div className="album-viewport">
              <div id="album-image-card" className="album-image-card">
                <img 
                  src={getImageUrl(animal.images[currentImageIndex])} 
                  alt={`${animal.name} slide`} 
                  className={fadeState === 'out' ? 'fade-out' : ''}
                  onError={(e) => { 
                    e.target.onerror = null; // Prevent infinite loop on fallback
                    const activeImage = animal.images[currentImageIndex];
                    if (activeImage && !activeImage.startsWith('http')) {
                      const cleanName = animal.name
                        .split(' Extra-')[0]
                        .split(' Type-')[0]
                        .split(' v')[0]
                        .toLowerCase()
                        .replace(/ /g, '-');
                      
                      let tag = cleanName;
                      if (animal.id.startsWith('marine') && !cleanName.includes('fish') && !cleanName.includes('whale') && !cleanName.includes('shark')) {
                        tag = `${cleanName},marine-life`;
                      } else if (animal.id.startsWith('birds') && !cleanName.includes('bird') && !cleanName.includes('owl') && !cleanName.includes('eagle')) {
                        tag = `${cleanName},bird`;
                      }
                      
                      const seed = animal.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + currentImageIndex + 25000;
                      const width = currentImageIndex % 2 === 0 ? 3840 : 2160;
                      const height = currentImageIndex % 2 === 0 ? 2160 : 3840;
                      e.target.src = `https://loremflickr.com/${width}/${height}/${tag}?lock=${seed}`;
                    } else {
                      e.target.src = EMERGENCY_FALLBACKS[sector] || EMERGENCY_FALLBACKS.land;
                    }
                  }}
                />
                <div className="image-overlay-index">
                  <span>{currentImageIndex + 1} / {animal.images.length}</span>
                </div>
              </div>
              
              <button className="btn-nav nav-prev" onClick={handlePrevSlide} aria-label="Previous photo">◀</button>
              <button className="btn-nav nav-next" onClick={handleNextSlide} aria-label="Next photo">▶</button>
            </div>
            
            <div className="album-dots">
              {Array.from({ length: animal.images.length }).map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                ></span>
              ))}
            </div>
          </div>

          {/* Modal Details & Technical Specs Grid */}
          <div className="modal-card-details">
            <div className="details-left">
              <div className="metrics-row">
                <div className="metric-block">
                  <span className="metric-label">Views</span>
                  <span className="metric-value">{viewsVal.toLocaleString()}</span>
                </div>
                <div className="metric-block">
                  <span className="metric-label">Downloads</span>
                  <span className="metric-value">{downloadsVal.toLocaleString()}</span>
                </div>
                <div className="metric-block">
                  <span className="metric-label">Featured In</span>
                  <span className="metric-value text-accent" style={{ color: color }}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="description-block">
                <p className="animal-brief-description">{animal.description}</p>
              </div>
            </div>

            <div className="details-right">
              <div className="facts-matrix">
                <div className="fact-cell">
                  <span className="fact-label">Habitat</span>
                  <span className="fact-value">{animal.habitat}</span>
                </div>
                <div className="fact-cell">
                  <span className="fact-label">Diet Type</span>
                  <span className="fact-value">{animal.diet}</span>
                </div>
                <div className="fact-cell">
                  <span className="fact-label">Lifespan</span>
                  <span className="fact-value">{animal.stats.lifespan}</span>
                </div>
                <div className="fact-cell">
                  <span className="fact-label">Typical Size</span>
                  <span className="fact-value">{animal.stats.size}</span>
                </div>
                <div className="fact-cell">
                  <span className="fact-label">Avg Weight</span>
                  <span className="fact-value">{animal.stats.weight}</span>
                </div>
                <div className="fact-cell">
                  <span className="fact-label">Top Speed</span>
                  <span className="fact-value">{animal.stats.speed}</span>
                </div>
              </div>

              <div className="image-specs-box">
                <div className="spec-capsule">
                  <span className="spec-label">Dimension</span>
                  <span className="spec-value">{dimensionStr}</span>
                </div>
                <div className="spec-capsule">
                  <span className="spec-label">Ratio</span>
                  <span className="spec-value">{ratioStr}</span>
                </div>
                <div className="spec-capsule">
                  <span className="spec-label">Orientation</span>
                  <span className="spec-value">{orientStr}</span>
                </div>
                <div className="spec-capsule">
                  <span className="spec-label">Format</span>
                  <span className="spec-value">JPEG</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
