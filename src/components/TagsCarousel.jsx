import React, { useRef } from 'react';

export default function TagsCarousel({ activeTag, setActiveTag }) {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollOffset = direction === 'left' ? -200 : 200;
      carouselRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const tags = [
    { label: 'All Species', value: 'all' },
    { label: 'Carnivores', value: 'diet-Carnivore' },
    { label: 'Herbivores', value: 'diet-Herbivore' },
    { label: 'Omnivores', value: 'diet-Omnivore' },
    { label: 'Least Concern', value: 'status-Least Concern' },
    { label: 'Vulnerable', value: 'status-Vulnerable' },
    { label: 'Endangered', value: 'status-Endangered' },
    { label: 'Landscape Format', value: 'layout-landscape' },
    { label: 'Portrait Format', value: 'layout-portrait' },
  ];

  return (
    <div className="tags-carousel-container">
      <button 
        className="tag-nav-btn prev" 
        onClick={() => scroll('left')} 
        aria-label="Scroll left"
      >
        ◀
      </button>
      <div className="tags-carousel" ref={carouselRef}>
        {tags.map((tag) => (
          <button
            key={tag.value}
            className={`tag-capsule ${activeTag === tag.value ? 'active' : ''}`}
            onClick={() => setActiveTag(tag.value)}
          >
            {tag.label}
          </button>
        ))}
      </div>
      <button 
        className="tag-nav-btn next" 
        onClick={() => scroll('right')} 
        aria-label="Scroll right"
      >
        ▶
      </button>
    </div>
  );
}
