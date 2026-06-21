import React, { useState } from 'react';
import { download4KImage } from '../utils/downloader';
import { getImageUrl, getSafeAnimalTag } from '../utils/resolveAsset';

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

  const EMERGENCY_FALLBACKS = {
    land: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80', // Lion
    marine: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // Dolphin
    birds: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80' // Bird
  };

  const getSector = () => {
    if (animal.id.startsWith('marine')) return 'marine';
    if (animal.id.startsWith('birds')) return 'birds';
    return 'land';
  };

  const getThumbnailUrl = (url) => {
    if (!url) return '';
    let resolvedUrl = url;
    if (url.includes('loremflickr.com')) {
      resolvedUrl = url
        .replace('/3840/2160/', '/800/600/')
        .replace('/2160/3840/', '/600/800/');
    }
    return getImageUrl(resolvedUrl);
  };

  const handleImageError = (e) => {
    // If it's a local image path, fall back to a dynamic LoremFlickr image for this specific animal!
    if (imageSrc && !imageSrc.startsWith('http')) {
      const tag = getSafeAnimalTag(animal.name, getSector());

      const seed = animal.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + fallbackIndex + 25000;
      const width = fallbackIndex % 2 === 0 ? 3840 : 2160;
      const height = fallbackIndex % 2 === 0 ? 2160 : 3840;
      const fallbackUrl = `https://loremflickr.com/${width}/${height}/${tag}?lock=${seed}`;
      
      setImageSrc(fallbackUrl);
      return;
    }

    // If it's already an online URL and it fails, load the emergency sector fallback
    if (e && e.target) {
      e.target.onerror = null; // Prevent infinite loop
    }
    setImageSrc(EMERGENCY_FALLBACKS[getSector()]);
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
          src={getThumbnailUrl(imageSrc)} 
          alt={animal.name} 
          loading="lazy" 
          decoding="async"
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
