import './style.css';
import * as THREE from 'three';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import animalData from './animals.json';

// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================
let activeSector = 'all'; // Default: Explore All
let searchQuery = '';
let activeTag = 'all'; // Filter tag pill
let sortOrder = 'name-asc';
let currentPage = 1;
const pageSize = 12;

let filteredAnimals = [];
let displayedAnimals = [];
let currentAnimal = null;
let currentImageIndex = 0;

// Load bookmarked animal IDs from localStorage
let bookmarkedAnimals = JSON.parse(localStorage.getItem('rexopro_bookmarks') || '[]');

// ==========================================
// DOM ELEMENTS
// ==========================================
const canvas3D = document.getElementById('canvas-3d');
const inputSearch = document.getElementById('input-search');
const btnSearchClear = document.getElementById('btn-search-clear');
const selectSort = document.getElementById('select-sort');
const currentSectorTitle = document.getElementById('current-sector-title');
const resultCountLabel = document.getElementById('result-count-label');
const animalGrid = document.getElementById('animal-grid');
const emptyState = document.getElementById('empty-state');
const gridSentinel = document.getElementById('grid-sentinel');
const logoSpinner = document.getElementById('logo-spinner');
const btnThemeToggle = document.getElementById('btn-theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const btnDownloadBookCatalog = document.getElementById('btn-download-book-catalog');

// Sidebar items
const sidebarItems = document.querySelectorAll('.sidebar-item');

// Horizontal Tag Carousel items
const tagsCarousel = document.getElementById('tags-carousel');
const tagNavPrev = document.getElementById('tag-nav-prev');
const tagNavNext = document.getElementById('tag-nav-next');

// Modal Elements
const bookModal = document.getElementById('book-modal');
const modalCloseBackdrop = document.getElementById('modal-close-backdrop');
const btnModalClose = document.getElementById('btn-modal-close');
const modalAvatarBg = document.getElementById('modal-avatar-bg');
const modalAvatarChar = document.getElementById('modal-avatar-char');
const modalAnimalSector = document.getElementById('modal-animal-sector');
const modalAnimalName = document.getElementById('modal-animal-name');
const modalAnimalScientific = document.getElementById('modal-animal-scientific');
const modalAnimalDesc = document.getElementById('modal-animal-desc');
const modalCurrentImage = document.getElementById('modal-current-image');
const modalImageIndexLabel = document.getElementById('modal-image-index-label');
const albumImageCard = document.getElementById('album-image-card');
const albumDotsContainer = document.getElementById('album-dots-container');
const btnAlbumPrev = document.getElementById('btn-album-prev');
const btnAlbumNext = document.getElementById('btn-album-next');
const btnDownloadAnimal = document.getElementById('btn-download-animal');
const btnModalLike = document.getElementById('btn-modal-like');

// Modal Factsheet Stats
const modalStatHabitat = document.getElementById('modal-stat-habitat');
const modalStatDiet = document.getElementById('modal-stat-diet');
const modalStatLifespan = document.getElementById('modal-stat-lifespan');
const modalStatSize = document.getElementById('modal-stat-size');
const modalStatWeight = document.getElementById('modal-stat-weight');
const modalStatSpeed = document.getElementById('modal-stat-speed');

// ==========================================
// THREE.JS 3D PARTICLE REALMS
// ==========================================
let scene, camera, renderer;
let landParticles, marineParticles, birdParticles;
let targetCameraY = 0;
let targetCameraX = 0;

function init3DScene() {
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas: canvas3D, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Geometries
  const sphereGeo = new THREE.SphereGeometry(1.8, 32, 32);
  const torusGeo = new THREE.TorusGeometry(1.6, 0.5, 12, 64);
  const ringGeo = new THREE.RingGeometry(1.2, 2.2, 64);

  // Materials
  const landMat = new THREE.PointsMaterial({
    color: 0x10b981,
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const marineMat = new THREE.PointsMaterial({
    color: 0x0ea5e9,
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const birdMat = new THREE.PointsMaterial({
    color: 0xf59e0b,
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  landParticles = new THREE.Points(sphereGeo, landMat);
  marineParticles = new THREE.Points(torusGeo, marineMat);
  birdParticles = new THREE.Points(ringGeo, birdMat);

  scene.add(landParticles);
  scene.add(marineParticles);
  scene.add(birdParticles);

  updateParticlesTransform(true);

  window.addEventListener('mousemove', (e) => {
    targetCameraX = ((e.clientX / window.innerWidth) - 0.5) * 1.5;
    targetCameraY = -((e.clientY / window.innerHeight) - 0.5) * 1.5;
  });

  window.addEventListener('resize', onWindowResize);

  animate();
}

function updateParticlesTransform(immediate = false) {
  const activeScale = 1.3;
  const inactiveScale = 0.35;
  
  const targets = {
    land: { pos: new THREE.Vector3(0, 0, 0), scale: activeScale, opacity: 0.95 },
    marine: { pos: new THREE.Vector3(0, 0, 0), scale: activeScale, opacity: 0.95 },
    birds: { pos: new THREE.Vector3(0, 0, 0), scale: activeScale, opacity: 0.95 }
  };

  if (activeSector === 'land') {
    targets.land = { pos: new THREE.Vector3(0, 0, 0), scale: activeScale, opacity: 0.95 };
    targets.marine = { pos: new THREE.Vector3(5, -2, -3), scale: inactiveScale, opacity: 0.15 };
    targets.birds = { pos: new THREE.Vector3(-5, 2, -3), scale: inactiveScale, opacity: 0.15 };
  } else if (activeSector === 'marine') {
    targets.land = { pos: new THREE.Vector3(-5, -2, -3), scale: inactiveScale, opacity: 0.15 };
    targets.marine = { pos: new THREE.Vector3(0, 0, 0), scale: activeScale, opacity: 0.95 };
    targets.birds = { pos: new THREE.Vector3(5, 2, -3), scale: inactiveScale, opacity: 0.15 };
  } else if (activeSector === 'birds') {
    targets.land = { pos: new THREE.Vector3(5, 2, -3), scale: inactiveScale, opacity: 0.15 };
    targets.marine = { pos: new THREE.Vector3(-5, -2, -3), scale: inactiveScale, opacity: 0.15 };
    targets.birds = { pos: new THREE.Vector3(0, 0, 0), scale: activeScale, opacity: 0.95 };
  } else {
    // 'all' or 'bookmarks' -> Orbiting Triad showcase
    targets.land = { pos: new THREE.Vector3(-3.2, -1.2, -1.5), scale: 0.75, opacity: 0.75 };
    targets.marine = { pos: new THREE.Vector3(3.2, -1.2, -1.5), scale: 0.75, opacity: 0.75 };
    targets.birds = { pos: new THREE.Vector3(0, 2.5, -2), scale: 0.75, opacity: 0.75 };
  }

  const applyVal = (obj, target) => {
    if (immediate) {
      obj.position.copy(target.pos);
      obj.scale.setScalar(target.scale);
      obj.material.opacity = target.opacity;
    } else {
      obj.userData.targetPos = target.pos;
      obj.userData.targetScale = target.scale;
      obj.userData.targetOpacity = target.opacity;
    }
  };

  applyVal(landParticles, targets.land);
  applyVal(marineParticles, targets.marine);
  applyVal(birdParticles, targets.birds);
}

function animate() {
  requestAnimationFrame(animate);

  const lerpFactor = 0.05;

  camera.position.x += (targetCameraX - camera.position.x) * lerpFactor;
  camera.position.y += (targetCameraY - camera.position.y) * lerpFactor;
  camera.lookAt(0, 0, 0);

  // Auto rotation
  landParticles.rotation.y += 0.002;
  landParticles.rotation.x += 0.001;

  marineParticles.rotation.y -= 0.003;
  marineParticles.rotation.z += 0.002;

  birdParticles.rotation.x += 0.002;
  birdParticles.rotation.y += 0.003;

  [landParticles, marineParticles, birdParticles].forEach(obj => {
    if (obj.userData.targetPos) {
      obj.position.lerp(obj.userData.targetPos, lerpFactor);
      
      const currentScale = obj.scale.x;
      const targetScale = obj.userData.targetScale;
      const nextScale = currentScale + (targetScale - currentScale) * lerpFactor;
      obj.scale.setScalar(nextScale);

      obj.material.opacity += (obj.userData.targetOpacity - obj.material.opacity) * lerpFactor;
    }
  });

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// ==========================================
// CORE CATALOG & FILTER LOGIC
// ==========================================

function loadAnimals() {
  currentPage = 1;
  
  // 1. Sector selection data aggregation
  let sectorData = [];
  if (activeSector === 'all') {
    sectorData = [...animalData.land, ...animalData.marine, ...animalData.birds];
  } else if (activeSector === 'bookmarks') {
    const all = [...animalData.land, ...animalData.marine, ...animalData.birds];
    sectorData = all.filter(animal => bookmarkedAnimals.includes(animal.id));
  } else {
    sectorData = animalData[activeSector] || [];
  }
  
  // 2. Tag pills filtering and search query
  filteredAnimals = sectorData.filter(animal => {
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.habitat.toLowerCase().includes(searchQuery.toLowerCase());
      
    let matchesTag = true;
    if (activeTag !== 'all') {
      if (activeTag.startsWith('diet-')) {
        const diet = activeTag.replace('diet-', '');
        matchesTag = animal.diet === diet;
      } else if (activeTag.startsWith('status-')) {
        const status = activeTag.replace('status-', '');
        matchesTag = animal.conservationStatus === status;
      } else if (activeTag === 'layout-landscape') {
        matchesTag = animal.images[0].includes('800/600') || !animal.images[0].includes('600/800');
      } else if (activeTag === 'layout-portrait') {
        matchesTag = animal.images[0].includes('600/800');
      }
    }
    
    return matchesSearch && matchesTag;
  });

  // 3. Sorting
  filteredAnimals.sort((a, b) => {
    if (sortOrder === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  resultCountLabel.innerText = `Showing ${filteredAnimals.length} entries`;
  renderGrid(true);
}

function renderGrid(reset = false) {
  if (reset) {
    animalGrid.innerHTML = '';
    displayedAnimals = [];
  }

  const startIdx = displayedAnimals.length;
  const endIdx = Math.min(startIdx + pageSize, filteredAnimals.length);
  const nextBatch = filteredAnimals.slice(startIdx, endIdx);

  if (filteredAnimals.length === 0) {
    emptyState.style.display = 'block';
    gridSentinel.style.display = 'none';
    return;
  } else {
    emptyState.style.display = 'none';
  }

  nextBatch.forEach(animal => {
    const card = document.createElement('article');
    card.className = 'animal-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${animal.name}, ${animal.scientificName}`);

    const statusClass = animal.conservationStatus.toLowerCase().replace(' ', '-');
    const firstImage = animal.images[0];
    const isLiked = bookmarkedAnimals.includes(animal.id);
    const likeClass = isLiked ? 'btn-card-action btn-like liked' : 'btn-card-action btn-like';

    card.innerHTML = `
      <div class="card-badge-top">
        <span class="badge-pill status-${statusClass}">${animal.conservationStatus}</span>
        <span class="badge-pill diet-pill">${animal.diet}</span>
      </div>
      <div class="card-image-wrapper">
        <img src="${firstImage}" alt="${animal.name}" loading="lazy" />
        <div class="card-vignette"></div>
      </div>
      <div class="card-info">
        <div class="card-info-text">
          <h4>${animal.name}</h4>
          <span class="scientific">${animal.scientificName}</span>
        </div>
        <div class="card-actions-row">
          <button class="${likeClass}" data-id="${animal.id}" title="Bookmark" aria-label="Bookmark">
            ♥
          </button>
          <button class="btn-card-action btn-download" data-id="${animal.id}" title="Download Image" aria-label="Download Image">
            📥
          </button>
        </div>
      </div>
    `;

    // Intercept click events to prevent triggers when clicking internal buttons
    card.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-card-action');
      if (btn) {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (btn.classList.contains('btn-like')) {
          toggleBookmark(id, btn);
        } else if (btn.classList.contains('btn-download')) {
          downloadAnimalImage(animal, btn);
        }
      } else {
        openDetailModal(animal);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetailModal(animal);
      }
    });

    animalGrid.appendChild(card);
    displayedAnimals.push(animal);
  });

  if (displayedAnimals.length < filteredAnimals.length) {
    gridSentinel.style.display = 'flex';
  } else {
    gridSentinel.style.display = 'none';
  }
}

// Sentinel observer for infinite scrolling
function initSentinelObserver() {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && displayedAnimals.length < filteredAnimals.length) {
      currentPage++;
      renderGrid(false);
    }
  }, { rootMargin: '120px' });

  observer.observe(gridSentinel);
}

// Bookmark / Like Actions
function toggleBookmark(id, buttonEl = null) {
  const index = bookmarkedAnimals.indexOf(id);
  let state = false;
  if (index === -1) {
    bookmarkedAnimals.push(id);
    state = true;
  } else {
    bookmarkedAnimals.splice(index, 1);
    state = false;
  }
  
  // Persist to storage
  localStorage.setItem('rexopro_bookmarks', JSON.stringify(bookmarkedAnimals));

  // Update card buttons if rendered
  if (buttonEl) {
    if (state) {
      buttonEl.classList.add('liked');
    } else {
      buttonEl.classList.remove('liked');
    }
  }

  // Update active modal button state if open
  if (currentAnimal && currentAnimal.id === id) {
    const likeBtn = document.getElementById('btn-modal-like');
    if (state) {
      likeBtn.classList.add('active');
      likeBtn.querySelector('.btn-text').innerText = 'Bookmarked';
    } else {
      likeBtn.classList.remove('active');
      likeBtn.querySelector('.btn-text').innerText = 'Bookmark';
    }
  }

  // Trigger grid reload if showing only bookmarks sector
  if (activeSector === 'bookmarks') {
    loadAnimals();
  }
}

// ==========================================
// UNSPLASH DETAIL MODAL CONTROLS
// ==========================================

function openDetailModal(animal) {
  currentAnimal = animal;
  currentImageIndex = 0;

  // Header content setting
  modalAnimalName.innerText = animal.name;
  modalAnimalScientific.innerText = animal.scientificName;
  
  // Avatar setup
  const firstChar = animal.name.charAt(0);
  modalAvatarChar.innerText = firstChar;
  
  // Avatar styling based on active sector
  const colors = { land: '#10b981', marine: '#0ea5e9', birds: '#f59e0b' };
  let sector = 'land';
  if (animalData.marine.some(a => a.id === animal.id)) sector = 'marine';
  else if (animalData.birds.some(a => a.id === animal.id)) sector = 'birds';
  
  modalAvatarBg.style.borderColor = colors[sector];
  modalAnimalSector.innerText = sector.charAt(0).toUpperCase() + sector.slice(1);
  modalAnimalSector.className = 'metric-value text-accent';
  
  // Apply specific colors dynamically
  modalAnimalSector.style.color = colors[sector];

  // Description content
  modalAnimalDesc.innerText = animal.description;

  // Matrix facts
  modalStatHabitat.innerText = animal.habitat;
  modalStatDiet.innerText = animal.diet;
  modalStatLifespan.innerText = animal.stats.lifespan;
  modalStatSize.innerText = animal.stats.size;
  modalStatWeight.innerText = animal.stats.weight;
  modalStatSpeed.innerText = animal.stats.speed;

  // Consistent stats hash simulation
  const hash = animal.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const viewsVal = (hash * 157) + 5240;
  const downloadsVal = Math.floor(viewsVal * 0.12) + 640;
  document.getElementById('metric-views').innerText = viewsVal.toLocaleString();
  document.getElementById('metric-downloads').innerText = downloadsVal.toLocaleString();

  // Like button active check
  const isLiked = bookmarkedAnimals.includes(animal.id);
  if (isLiked) {
    btnModalLike.classList.add('active');
    btnModalLike.querySelector('.btn-text').innerText = 'Bookmarked';
  } else {
    btnModalLike.classList.remove('active');
    btnModalLike.querySelector('.btn-text').innerText = 'Bookmark';
  }

  // Active images
  updateModalImage();
  buildCarouselDots();

  // Reveal Modal
  bookModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  bookModal.style.display = 'none';
  document.body.style.overflow = '';
  currentAnimal = null;
}

function updateModalImage() {
  if (!currentAnimal) return;

  albumImageCard.classList.add('flipping');

  setTimeout(() => {
    modalCurrentImage.src = currentAnimal.images[currentImageIndex];
    modalCurrentImage.alt = `${currentAnimal.name} - Slide ${currentImageIndex + 1}`;
    modalImageIndexLabel.innerText = `${currentImageIndex + 1} / 8`;

    // Specs layout orientation details
    const isEven = currentImageIndex % 2 === 0;
    document.getElementById('spec-dim').innerText = isEven ? '800 x 600 px' : '600 x 800 px';
    document.getElementById('spec-ratio').innerText = isEven ? '4:3' : '3:4';
    document.getElementById('spec-orient').innerText = isEven ? 'Landscape' : 'Portrait';

    const dots = albumDotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.className = idx === currentImageIndex ? 'dot active' : 'dot';
    });
  }, 150);

  setTimeout(() => {
    albumImageCard.classList.remove('flipping');
  }, 400);
}

function buildCarouselDots() {
  albumDotsContainer.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('span');
    dot.className = i === 0 ? 'dot active' : 'dot';
    dot.addEventListener('click', () => {
      if (currentImageIndex !== i) {
        currentImageIndex = i;
        updateModalImage();
      }
    });
    albumDotsContainer.appendChild(dot);
  }
}

// ==========================================
// CLIENT-SIDE EXPORT OPERATIONS
// ==========================================

async function downloadAnimalImage(animalToDownload = null, btnTrigger = null) {
  const animal = animalToDownload || currentAnimal;
  if (!animal) return;

  const activeBtn = btnTrigger || btnDownloadAnimal;
  const originalHtml = activeBtn.innerHTML;

  activeBtn.disabled = true;
  if (activeBtn === btnDownloadAnimal) {
    activeBtn.innerHTML = `⏳ Downloading...`;
  } else {
    activeBtn.innerHTML = `⏳`;
  }

  // Determine which image to download
  // If download is triggered inside modal, download the currently viewed image index, else the first image
  const imageIndex = (animal === currentAnimal && !btnTrigger) ? currentImageIndex : 0;
  const imageUrl = animal.images[imageIndex];
  
  // Format clean filename: e.g. "african-lion-photo-1.jpg"
  const cleanAnimalName = animal.name.toLowerCase().replace(/ /g, '-');
  const filename = `${cleanAnimalName}-photo-${imageIndex + 1}.jpg`;

  try {
    let fetchUrl = imageUrl;
    if (!imageUrl.startsWith('http')) {
      fetchUrl = new URL(imageUrl, window.location.href).href;
    }

    let response;
    try {
      response = await fetch(fetchUrl);
    } catch (directErr) {
      console.warn(`Direct fetch failed, trying proxy for image:`, directErr);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`;
      response = await fetch(proxyUrl);
    }

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const blob = await response.blob();
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Success Confetti
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.8 }
    });

  } catch (error) {
    console.error('Image download error:', error);
    // Fallback: open in new tab
    window.open(imageUrl, '_blank');
  } finally {
    activeBtn.disabled = false;
    activeBtn.innerHTML = originalHtml;
  }
}


// Download Compiled Book Catalog (eBook generator)
async function downloadBookCatalog() {
  const originalHtml = btnDownloadBookCatalog.innerHTML;
  btnDownloadBookCatalog.disabled = true;
  btnDownloadBookCatalog.innerHTML = `<span>⏳</span> Generating...`;

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
    btnDownloadBookCatalog.disabled = false;
    btnDownloadBookCatalog.innerHTML = originalHtml;
  }
}

// ==========================================
// EVENT LISTENERS & INITS
// ==========================================

function setupEventListeners() {
  // 1. Left Sidebar Selection
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const button = e.currentTarget;
      
      // Prevent triggers for actions buttons in sidebar
      if (button.id === 'btn-theme-toggle' || button.id === 'btn-show-bookmarks') {
        return;
      }
      
      sidebarItems.forEach(i => i.classList.remove('active'));
      button.classList.add('active');
      
      activeSector = button.dataset.sector;
      
      // Update showcase titles
      const titles = {
        all: 'Explore All Species',
        land: 'Land Mammals',
        marine: 'Marine Life',
        birds: 'Avian Species'
      };
      currentSectorTitle.innerText = titles[activeSector] || 'Explore';
      
      // Sync spinner highlight color
      const colors = { all: '#10b981', land: '#10b981', marine: '#0ea5e9', birds: '#f59e0b' };
      logoSpinner.style.borderColor = colors[activeSector] || '#10b981';
      logoSpinner.style.borderTopColor = 'transparent';

      // Reset horizontal tag filters on sector swap
      activeTag = 'all';
      const capsules = document.querySelectorAll('.tag-capsule');
      capsules.forEach(c => c.classList.remove('active'));
      document.querySelector('.tag-capsule[data-tag="all"]').classList.add('active');

      updateParticlesTransform();
      loadAnimals();
    });
  });

  // Bookmarks Sidebar Click
  document.getElementById('btn-show-bookmarks').addEventListener('click', (e) => {
    sidebarItems.forEach(i => i.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    activeSector = 'bookmarks';
    currentSectorTitle.innerText = 'My Bookmarked Animals';
    logoSpinner.style.borderColor = '#ef4444';
    logoSpinner.style.borderTopColor = 'transparent';

    activeTag = 'all';
    const capsules = document.querySelectorAll('.tag-capsule');
    capsules.forEach(c => c.classList.remove('active'));
    document.querySelector('.tag-capsule[data-tag="all"]').classList.add('active');

    updateParticlesTransform();
    loadAnimals();
  });

  // 2. Horizontal Scrollable Tags Click
  document.querySelectorAll('.tag-capsule').forEach(capsule => {
    capsule.addEventListener('click', (e) => {
      const capsules = document.querySelectorAll('.tag-capsule');
      capsules.forEach(c => c.classList.remove('active'));
      
      const tagEl = e.currentTarget;
      tagEl.classList.add('active');
      activeTag = tagEl.dataset.tag;
      
      loadAnimals();
    });
  });

  // Horizontal Tags Scrolling arrows
  tagNavPrev.addEventListener('click', () => {
    tagsCarousel.scrollBy({ left: -200, behavior: 'smooth' });
  });
  tagNavNext.addEventListener('click', () => {
    tagsCarousel.scrollBy({ left: 200, behavior: 'smooth' });
  });

  // 3. Search & Clear Typing filter
  inputSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    btnSearchClear.style.display = searchQuery.length > 0 ? 'block' : 'none';
    loadAnimals();
  });

  btnSearchClear.addEventListener('click', () => {
    inputSearch.value = '';
    searchQuery = '';
    btnSearchClear.style.display = 'none';
    loadAnimals();
  });

  // 4. Sort select
  selectSort.addEventListener('change', (e) => {
    sortOrder = e.target.value;
    loadAnimals();
  });

  // 5. Theme toggle
  btnThemeToggle.addEventListener('click', () => {
    const body = document.body;
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      themeIcon.innerText = '🌙';
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      themeIcon.innerText = '☀';
    }
  });

  // 6. Detail Modal Carousel navigations
  btnAlbumPrev.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + 8) % 8;
    updateModalImage();
  });

  btnAlbumNext.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % 8;
    updateModalImage();
  });

  // Modal Like button
  btnModalLike.addEventListener('click', () => {
    if (currentAnimal) {
      toggleBookmark(currentAnimal.id);
    }
  });

  // Modal Close triggers
  btnModalClose.addEventListener('click', closeDetailModal);
  modalCloseBackdrop.addEventListener('click', closeDetailModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookModal.style.display === 'flex') {
      closeDetailModal();
    }
  });

  // 7. General downloads click bindings
  btnDownloadAnimal.addEventListener('click', () => downloadAnimalImage(null));
  btnDownloadBookCatalog.addEventListener('click', downloadBookCatalog);
}

// Initialized Startups
document.addEventListener('DOMContentLoaded', () => {
  init3DScene();
  setupEventListeners();
  loadAnimals();
  initSentinelObserver();
});
