import React, { useState, useEffect, useRef } from 'react';
import AnimalCard from './AnimalCard';

export default function MasonryGrid({ animals, onCardClick, bookmarkedAnimals, onToggleLike }) {
  const [displayedCount, setDisplayedCount] = useState(12);
  const sentinelRef = useRef(null);

  // Reset pagination when the filtered list of animals changes
  useEffect(() => {
    setDisplayedCount(12);
  }, [animals]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayedCount < animals.length) {
        setDisplayedCount(prev => Math.min(prev + 12, animals.length));
      }
    }, { rootMargin: '150px' });

    observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [displayedCount, animals.length]);

  const displayedAnimals = animals.slice(0, displayedCount);

  return (
    <section className="grid-panel" aria-label="Animal Cards Grid">
      {animals.length === 0 ? (
        <div id="empty-state" className="empty-state">
          <span className="empty-icon" aria-hidden="true">🐾</span>
          <h4>No Animals Found</h4>
          <p>Try adjusting your search terms or filters to explore other species.</p>
        </div>
      ) : (
        <div id="animal-grid" className="animal-grid">
          {displayedAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onCardClick={onCardClick}
              isLiked={bookmarkedAnimals.includes(animal.id)}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}

      {/* Sentinel loader for scroll paginations */}
      {displayedCount < animals.length && (
        <div ref={sentinelRef} id="grid-sentinel" className="grid-sentinel" aria-hidden="true">
          <div className="spinner"></div>
        </div>
      )}
    </section>
  );
}
