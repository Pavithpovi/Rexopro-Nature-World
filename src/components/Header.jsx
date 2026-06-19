import React, { useState } from 'react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';

export default function Header({ searchQuery, setSearchQuery, totalSpecies, totalPhotos, animalData }) {
  const [downloadingBook, setDownloadingBook] = useState(false);

  const downloadBookCatalog = async () => {
    setDownloadingBook(true);
    try {
      const zip = new JSZip();
      let bookContent = `# Rexopro Animal Book Catalog\nCompiled on: ${new Date().toLocaleDateString()}\n\n`;
      
      const sectors = ['land', 'marine', 'birds'];
      sectors.forEach(sector => {
        bookContent += `## ${sector.toUpperCase()} SECTOR\n\n`;
        animalData[sector].forEach(animal => {
          bookContent += `### ${animal.name} (${animal.scientificName})\n`;
          bookContent += `- **Habitat**: ${animal.habitat}\n`;
          bookContent += `- **Diet**: ${animal.diet}\n`;
          bookContent += `- **Status**: ${animal.conservationStatus}\n`;
          bookContent += `- **Lifespan**: ${animal.stats.lifespan}\n`;
          bookContent += `- **Size**: ${animal.stats.size}\n`;
          bookContent += `- **Weight**: ${animal.stats.weight}\n`;
          bookContent += `- **Speed**: ${animal.stats.speed}\n\n`;
          bookContent += `*Description*: ${animal.description}\n\n---\n\n`;
        });
      });

      zip.file('ANIMAL_CATALOG_BOOK.md', bookContent);
      const content = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'rexopro-animal-catalog-book.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({ particleCount: 70, spread: 50 });
    } catch (err) {
      console.error(err);
      alert('Failed to generate catalog book.');
    } finally {
      setDownloadingBook(false);
    }
  };

  return (
    <header className="app-header">
      <div className="search-section">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          id="input-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search high-resolution animal factsheets and images..." 
          aria-label="Search animal catalog" 
        />
        {searchQuery.length > 0 && (
          <button 
            id="btn-search-clear" 
            className="btn-clear-search" 
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <div className="header-actions">
        <div className="header-stats">
          <span className="stat-badge"><strong>{totalSpecies}</strong> Species</span>
          <span className="stat-badge"><strong>{totalPhotos}</strong> Photos</span>
        </div>
        <button 
          className="btn-download-book" 
          id="btn-download-book-catalog" 
          onClick={downloadBookCatalog}
          disabled={downloadingBook}
          title="Download compiled PDF eBook"
        >
          <span>{downloadingBook ? '⏳' : '📖'}</span> {downloadingBook ? 'Generating...' : 'Download Book'}
        </button>
      </div>
    </header>
  );
}
