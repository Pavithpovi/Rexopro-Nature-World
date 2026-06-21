import fs from 'fs';
import path from 'path';
import * as jimpPkg from 'jimp';
const Jimp = jimpPkg.Jimp || jimpPkg.default?.Jimp || jimpPkg.default || jimpPkg;

const srcBase = path.resolve('public', 'animals');
const quarantineBase = path.resolve('quarantine', 'animals');

// Create quarantine directory if it doesn't exist
if (!fs.existsSync(quarantineBase)) {
  fs.mkdirSync(quarantineBase, { recursive: true });
}

// Scans all files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

// Check if pixel color is close to white
function isWhite(color) {
  // Extract components using bitwise unsigned right shift
  const r = (color >>> 24) & 0xff;
  const g = (color >>> 16) & 0xff;
  const b = (color >>> 8) & 0xff;
  return r > 242 && g > 242 && b > 242;
}

async function scanAndFilter() {
  console.log("Gathering list of local images...");
  const allFiles = getAllFiles(srcBase);
  console.log(`Found ${allFiles.length} images to analyze.`);

  let processedCount = 0;
  let quarantinedCount = 0;
  let lowResCount = 0;
  let whiteBgCount = 0;

  for (const filePath of allFiles) {
    processedCount++;
    try {
      const image = await Jimp.read(filePath);
      const width = image.bitmap.width;
      const height = image.bitmap.height;

      let shouldQuarantine = false;
      let reason = "";

      // 1. Check for Low Quality (Low Resolution)
      if (width < 400 || height < 400) {
        shouldQuarantine = true;
        lowResCount++;
        reason = `Low resolution (${width}x${height})`;
      }

      // 2. Check for solid white background by sampling borders
      if (!shouldQuarantine) {
        let whitePixels = 0;
        let totalSamples = 0;

        // Sample 15 points along each edge
        const sampleCount = 15;
        
        // Top and Bottom edges
        for (let x = 0; x < width; x += Math.max(1, Math.floor(width / sampleCount))) {
          totalSamples += 2;
          if (isWhite(image.getPixelColor(x, 0))) whitePixels++;
          if (isWhite(image.getPixelColor(x, height - 1))) whitePixels++;
        }

        // Left and Right edges
        for (let y = 0; y < height; y += Math.max(1, Math.floor(height / sampleCount))) {
          totalSamples += 2;
          if (isWhite(image.getPixelColor(0, y))) whitePixels++;
          if (isWhite(image.getPixelColor(width - 1, y))) whitePixels++;
        }

        const whiteRatio = whitePixels / totalSamples;
        if (whiteRatio > 0.88) { // If >88% of border pixels are white
          shouldQuarantine = true;
          whiteBgCount++;
          reason = `Solid white background (white border ratio: ${(whiteRatio * 100).toFixed(1)}%)`;
        }
      }

      if (shouldQuarantine) {
        quarantinedCount++;
        const relPath = path.relative(srcBase, filePath);
        const quarantinePath = path.join(quarantineBase, relPath);
        const quarantineDir = path.dirname(quarantinePath);

        if (!fs.existsSync(quarantineDir)) {
          fs.mkdirSync(quarantineDir, { recursive: true });
        }

        fs.renameSync(filePath, quarantinePath);
        console.log(`[QUARANTINED] ${relPath} - Reason: ${reason}`);
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err.message);
    }

    if (processedCount % 200 === 0) {
      console.log(`Processed ${processedCount}/${allFiles.length} images...`);
    }
  }

  console.log(`\nScan complete!`);
  console.log(`- Total processed: ${processedCount}`);
  console.log(`- Total quarantined: ${quarantinedCount}`);
  console.log(`  * Low resolution: ${lowResCount}`);
  console.log(`  * White background: ${whiteBgCount}`);
}

scanAndFilter().catch(err => {
  console.error("Critical error in filter script:", err);
});
