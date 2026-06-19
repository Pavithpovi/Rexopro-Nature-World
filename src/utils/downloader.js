import confetti from 'canvas-confetti';

/**
 * Upscales a local image to 4K dimensions using HTML5 Canvas with cover-cropping
 */
function upscaleLocalTo4K(imageUrl, targetWidth, targetHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Canvas 2D context not supported"));
        return;
      }

      // cover scaling/cropping logic:
      // Fill the 4K canvas without stretching, centering the crop
      const imgAspect = img.width / img.height;
      const targetAspect = targetWidth / targetHeight;

      let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

      if (imgAspect > targetAspect) {
        // Image is wider than target aspect ratio
        drawHeight = targetHeight;
        drawWidth = targetHeight * imgAspect;
        offsetX = (targetWidth - drawWidth) / 2;
      } else {
        // Image is taller than target aspect ratio
        drawWidth = targetWidth;
        drawHeight = targetWidth / imgAspect;
        offsetY = (targetHeight - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas blob conversion failed"));
        }
      }, 'image/jpeg', 0.96); // export at 96% high JPEG quality
    };

    img.onerror = (err) => {
      reject(err);
    };

    // Prevent cache issues causing CORS block on canvas
    img.src = imageUrl + (imageUrl.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now();
  });
}

/**
 * Downloads the animal image in 4K resolution (either Laptop 16:9 or Mobile 9:16)
 */
export async function download4KImage(imageUrl, animalName, format, photoIndex = 1, setDownloadingState = () => {}) {
  setDownloadingState(true);
  
  const width = format === 'laptop' ? 3840 : 2160;
  const height = format === 'laptop' ? 2160 : 3840;
  const filename = `${animalName.toLowerCase().replace(/ /g, '-')}-${format}-4k-photo-${photoIndex}.jpg`;

  try {
    let downloadUrl = imageUrl;
    
    // 1. If it's a LoremFlickr URL, we request the 4K resolution directly from the server!
    if (imageUrl.startsWith('https://loremflickr.com')) {
      const lockMatch = imageUrl.match(/lock=(\d+)/);
      const lockSeed = lockMatch ? lockMatch[1] : Date.now();
      
      const cleanName = animalName
        .split(' Extra-')[0]
        .split(' Type-')[0]
        .split(' v')[0]
        .toLowerCase()
        .replace(/ /g, ',');
        
      downloadUrl = `https://loremflickr.com/${width}/${height}/animal,wildlife,${cleanName}/all?lock=${lockSeed}`;
    }
    
    let fetchUrl = downloadUrl;
    if (!downloadUrl.startsWith('http')) {
      fetchUrl = new URL(downloadUrl, window.location.href).href;
    }

    let blob;
    if (imageUrl.startsWith('https://loremflickr.com')) {
      // Fetch 4K LoremFlickr directly
      let response;
      try {
        response = await fetch(fetchUrl);
      } catch (err) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`;
        response = await fetch(proxyUrl);
      }
      blob = await response.blob();
    } else if (downloadUrl.startsWith('http')) {
      // Fetch general http links via proxy if direct fails
      let response;
      try {
        response = await fetch(fetchUrl);
      } catch (err) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`;
        response = await fetch(proxyUrl);
      }
      blob = await response.blob();
    } else {
      // Local image path: Load on canvas, upscale, crop and save!
      blob = await upscaleLocalTo4K(fetchUrl, width, height);
    }

    if (!blob) throw new Error("Blob creation failed");

    // Trigger local download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Success Confetti!
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.8 }
    });

  } catch (error) {
    console.error("4K Downloader failed, trying fallback:", error);
    // Fallback: Open in new tab so user can right-click and save
    window.open(imageUrl, '_blank');
  } finally {
    setDownloadingState(false);
  }
}
