import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const srcBase = path.resolve('public', 'animals');
const quarantineBase = path.resolve('quarantine', 'duplicates');

if (!fs.existsSync(quarantineBase)) {
  fs.mkdirSync(quarantineBase, { recursive: true });
}

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

function getMD5(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

async function removeDuplicates() {
  console.log("Scanning local images for exact duplicates...");
  const allFiles = getAllFiles(srcBase);
  console.log(`Found ${allFiles.length} files to scan.`);

  const seenHashes = new Set();
  let duplicateCount = 0;

  for (const filePath of allFiles) {
    try {
      const hash = getMD5(filePath);
      if (seenHashes.has(hash)) {
        duplicateCount++;
        const relPath = path.relative(srcBase, filePath);
        const quarantinePath = path.join(quarantineBase, relPath);
        const quarantineDir = path.dirname(quarantinePath);

        if (!fs.existsSync(quarantineDir)) {
          fs.mkdirSync(quarantineDir, { recursive: true });
        }

        fs.renameSync(filePath, quarantinePath);
        console.log(`[DUPLICATE QUARANTINED] ${relPath}`);
      } else {
        seenHashes.add(hash);
      }
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  }

  console.log(`\nScan complete!`);
  console.log(`- Total files scanned: ${allFiles.length}`);
  console.log(`- Duplicate files quarantined: ${duplicateCount}`);
  console.log(`- Unique files remaining: ${allFiles.length - duplicateCount}`);
}

removeDuplicates().catch(err => {
  console.error("Critical error in duplicates script:", err);
});
