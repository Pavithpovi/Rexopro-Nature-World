import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zipPath = 'C:\\Users\\pavith\\Downloads\\Animal dataset.zip';
const destBase = path.resolve('public', 'animals');

async function extractDataset() {
  console.log(`Reading zip file from ${zipPath}...`);
  if (!fs.existsSync(zipPath)) {
    console.error(`Error: Zip file does not exist at ${zipPath}`);
    process.exit(1);
  }

  const data = fs.readFileSync(zipPath);
  console.log("Loading zip archive into JSZip...");
  const zip = await JSZip.loadAsync(data);

  console.log("Processing zip entries...");
  let count = 0;
  
  const entries = Object.keys(zip.files);
  for (const entryPath of entries) {
    const entry = zip.files[entryPath];
    if (entry.dir) continue;

    // We only care about files under animals/animals/
    const matchPrefix = 'animals/animals/';
    if (entryPath.startsWith(matchPrefix)) {
      const relPath = entryPath.slice(matchPrefix.length);
      if (!relPath) continue;

      const destPath = path.join(destBase, relPath);
      const destDir = path.dirname(destPath);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const fileBuffer = await entry.async('nodebuffer');
      fs.writeFileSync(destPath, fileBuffer);
      count++;
      
      if (count % 100 === 0) {
        console.log(`Extracted ${count} files...`);
      }
    }
  }

  console.log(`\nExtraction complete! Successfully extracted ${count} files to ${destBase}`);
}

extractDataset().catch(err => {
  console.error("Error extracting dataset:", err);
});
