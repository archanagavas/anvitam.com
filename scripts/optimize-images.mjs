import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');

async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') return;
  if (filePath.endsWith('.webp')) return;

  const stat = fs.statSync(filePath);
  if (stat.size < 50000) return; // Skip small icons under 50KB

  const webpPath = filePath.substring(0, filePath.lastIndexOf('.')) + '.webp';

  console.log(`Optimizing: ${path.relative(publicDir, filePath)} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);

  try {
    let pipeline = sharp(filePath);
    const metadata = await pipeline.metadata();

    // If wider than 1920px, scale down to 1920px max for web
    if (metadata.width && metadata.width > 1920) {
      pipeline = pipeline.resize({ width: 1920, fit: 'inside', withoutEnlargement: true });
    }

    await pipeline
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);

    const newStat = fs.statSync(webpPath);
    console.log(`  -> Saved ${path.relative(publicDir, webpPath)} (${(newStat.size / 1024).toFixed(1)} KB) - ${((1 - newStat.size / stat.size) * 100).toFixed(1)}% reduction!`);
  } catch (err) {
    console.error(`  Error processing ${filePath}:`, err.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processImage(fullPath);
    }
  }
}

console.log('Starting image optimization...');
walkDir(publicDir);
console.log('Done optimizing images!');
