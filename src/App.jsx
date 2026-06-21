import React, { useState, useEffect, useMemo } from 'react';
import Background3D from './components/Background3D';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TagsCarousel from './components/TagsCarousel';
import MasonryGrid from './components/MasonryGrid';
import DetailModal from './components/DetailModal';
import SplashIntro from './components/SplashIntro';
import animalData from './animals.json';

export default function App() {
  // State Initialization
  const [showSplash, setShowSplash] = useState(true);
  const [activeSector, setActiveSector] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [theme, setTheme] = useState('dark');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  
  const [bookmarkedAnimals, setBookmarkedAnimals] = useState(() => {
    return JSON.parse(localStorage.getItem('rexopro_bookmarks') || '[]');
  });

  // Sync Body Classes for Theme Changes
  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
  }, [theme]);

  // Sync theme toggle function
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // High-performance search & tag filters calculations
  const filteredAnimals = useMemo(() => {
    let sectorData = [];
    
    if (activeSector === 'all') {
      sectorData = [...animalData.land, ...animalData.marine, ...animalData.birds];
    } else if (activeSector === 'bookmarks') {
      const all = [...animalData.land, ...animalData.marine, ...animalData.birds];
      sectorData = all.filter(animal => bookmarkedAnimals.includes(animal.id));
    } else {
      sectorData = animalData[activeSector] || [];
    }

    return sectorData.filter(animal => {
      // 1. Search Query Match
      const matchesSearch = 
        animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.habitat.toLowerCase().includes(searchQuery.toLowerCase());
        
      // 2. Capsule Tags Match
      let matchesTag = true;
      if (activeTag !== 'all') {
        if (activeTag.startsWith('diet-')) {
          const diet = activeTag.replace('diet-', '');
          matchesTag = animal.diet === diet;
        } else if (activeTag.startsWith('status-')) {
          const status = activeTag.replace('status-', '');
          matchesTag = animal.conservationStatus === status;
        } else if (activeTag === 'layout-landscape') {
          // Heuristic: LoremFlickr 800/600, or local default
          matchesTag = animal.images[0].includes('800/600') || !animal.images[0].includes('600/800');
        } else if (activeTag === 'layout-portrait') {
          // Heuristic: LoremFlickr 600/800
          matchesTag = animal.images[0].includes('600/800');
        }
      }

      return matchesSearch && matchesTag;
    });
  }, [activeSector, searchQuery, activeTag, bookmarkedAnimals]);

  // Bookmark Toggle logic
  const handleToggleLike = (id) => {
    setBookmarkedAnimals(prev => {
      const exists = prev.includes(id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item !== id);
      } else {
        updated = [...prev, id];
      }
      localStorage.setItem('rexopro_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // Sector Header Title Mapper
  const getSectorTitle = () => {
    const titles = {
      all: 'Explore All Species',
      land: 'Land Mammals',
      marine: 'Marine Life',
      birds: 'Avian Species',
      bookmarks: 'My Bookmarked Animals'
    };
    return titles[activeSector] || 'Explore';
  };

  // Spinning Logo Highlights
  const getSpinnerColor = () => {
    const colors = { all: '#10b981', land: '#10b981', marine: '#0ea5e9', birds: '#f59e0b', bookmarks: '#ef4444' };
    return colors[activeSector] || '#10b981';
  };

  // Dynamic counters computed from dataset
  const totalSpecies = useMemo(() => {
    return animalData.land.length + animalData.marine.length + animalData.birds.length;
  }, []);

  const totalPhotos = useMemo(() => {
    let count = 0;
    ['land', 'marine', 'birds'].forEach(sector => {
      if (animalData[sector]) {
        animalData[sector].forEach(animal => {
          count += animal.images.length;
        });
      }
    });
    return count;
  }, []);

  return (
    <>
      {/* 3D Parallax Nature Image Background */}
      <Background3D />

      {/* Vertical Sidebar Dashboard */}
      <Sidebar 
        activeSector={activeSector} 
        setActiveSector={setActiveSector} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      {/* Main UI Layout */}
      <div id="app" className={!showSplash ? 'reveal-entrance' : ''}>
        {/* Sticky Header with Search */}
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          totalSpecies={totalSpecies} 
          totalPhotos={totalPhotos} 
          animalData={animalData}
        />

        {/* Main Catalog View */}
        <main className="catalog-container">
          <section className="showcase-header">
            <div className="showcase-title-row">
              <h2>{getSectorTitle()}</h2>
              <div 
                className="logo-spinner-mini" 
                style={{ 
                  borderLeftColor: getSpinnerColor(), 
                  borderRightColor: getSpinnerColor(), 
                  borderBottomColor: getSpinnerColor(), 
                  borderTopColor: 'transparent' 
                }}
              ></div>
            </div>

            {/* Tags Filters Row */}
            <TagsCarousel activeTag={activeTag} setActiveTag={setActiveTag} />
          </section>

          {/* Catalog Masonry Grid */}
          <MasonryGrid 
            animals={filteredAnimals} 
            onCardClick={setSelectedAnimal}
            bookmarkedAnimals={bookmarkedAnimals}
            onToggleLike={handleToggleLike}
          />
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 Rexopro Animal Book. All photographs sourced from Unsplash / LoremFlickr.</p>
        </footer>
      </div>

      {/* Detailed Overlay Modal Card */}
      {selectedAnimal && (
        <DetailModal 
          animal={selectedAnimal} 
          onClose={() => setSelectedAnimal(null)}
          isLiked={bookmarkedAnimals.includes(selectedAnimal.id)}
          onToggleLike={handleToggleLike}
        />
      )}

      {/* Fullscreen 3D Welcome Splash Screen */}
      {showSplash && (
        <SplashIntro 
          totalSpecies={totalSpecies} 
          totalPhotos={totalPhotos} 
          onGetInfo={() => setShowSplash(false)} 
        />
      )}
    </>
  );
}
