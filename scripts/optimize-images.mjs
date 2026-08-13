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

  // Await the full conversion pipeline and propagate failures
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
}

// Collect all image paths, then process concurrently and await all
function collectImages(dir) {
  const results = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...collectImages(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  console.log('Starting image optimization...');
  const images = collectImages(publicDir);

  const results = await Promise.allSettled(images.map(f => processImage(f)));

  let failures = 0;
  for (const r of results) {
    if (r.status === 'rejected') {
      console.error('  [ERROR] Conversion failed:', r.reason?.message || r.reason);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\nDone with ${failures} failure(s). Check errors above.`);
    process.exit(1); // Non-zero exit so CI/CD pipelines catch failures
  } else {
    console.log('Done optimizing images — all conversions succeeded!');
  }
}

main().catch(err => {
  console.error('Fatal error in optimize-images:', err);
  process.exit(1);
});
