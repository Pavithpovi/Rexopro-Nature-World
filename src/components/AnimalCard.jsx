import React, { useState } from 'react';
import { download4KImage } from '../utils/downloader';

export default function AnimalCard({ animal, onCardClick, isLiked, onToggleLike }) {
  const [downloadingLaptop, setDownloadingLaptop] = useState(false);
  const [downloadingMobile, setDownloadingMobile] = useState(false);
  
  const statusClass = animal.conservationStatus.toLowerCase().replace(' ', '-');
  const firstImage = animal.images[0];

  const [imageSrc, setImageSrc] = useState(firstImage);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  React.useEffect(() => {
    setImageSrc(firstImage);
    setFallbackIndex(0);
  }, [firstImage]);

  const handleImageError = () => {
    const nextIndex = fallbackIndex + 1;
    if (animal.images && nextIndex < animal.images.length) {
      setFallbackIndex(nextIndex);
      setImageSrc(animal.images[nextIndex]);
    } else {
      setImageSrc('/nature_bg.png');
    }
  };

  const handleDownload = async (e, format) => {
    e.stopPropagation(); // Prevent opening modal
    const setDownloading = format === 'laptop' ? setDownloadingLaptop : setDownloadingMobile;
    await download4KImage(imageSrc, animal.name, format, fallbackIndex + 1, setDownloading);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation(); // Prevent opening modal
    onToggleLike(animal.id);
  };

  return (
    <article 
      className="animal-card" 
      onClick={() => onCardClick(animal)}
      tabIndex={0}
      aria-label={`${animal.name}, ${animal.scientificName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(animal);
        }
      }}
    >
      <div className="card-badge-top">
        <span className={`badge-pill status-${statusClass}`}>{animal.conservationStatus}</span>
        <span className="badge-pill diet-pill">{animal.diet}</span>
      </div>
      <div className="card-image-wrapper">
        <img 
          src={imageSrc} 
          alt={animal.name} 
          loading="lazy" 
          onError={handleImageError}
        />
        <div className="card-vignette"></div>
      </div>
      <div className="card-info">
        <div className="card-info-text">
          <h4>{animal.name}</h4>
          <span className="scientific">{animal.scientificName}</span>
        </div>
        <div className="card-actions-row">
          <button 
            className={`btn-card-action btn-like ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            title="Bookmark"
            aria-label="Bookmark"
          >
            ♥
          </button>
          
          {/* Laptop 4K download trigger */}
          <button 
            className="btn-card-action btn-download"
            onClick={(e) => handleDownload(e, 'laptop')}
            disabled={downloadingLaptop}
            title="Download Laptop 4K Wallpaper (3840x2160)"
            aria-label="Download Laptop 4K"
          >
            {downloadingLaptop ? '⏳' : '💻'}
          </button>

          {/* Mobile 4K download trigger */}
          <button 
            className="btn-card-action btn-download"
            onClick={(e) => handleDownload(e, 'mobile')}
            disabled={downloadingMobile}
            title="Download Mobile 4K Wallpaper (2160x3840)"
            aria-label="Download Mobile 4K"
          >
            {downloadingMobile ? '⏳' : '📱'}
          </button>
        </div>
      </div>
    </article>
  );
}
