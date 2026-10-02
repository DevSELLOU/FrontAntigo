const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = process.argv[2] || './src/assets/logo.webp';
const outputDir = './public/icons';

async function generateIcons() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputBuffer = fs.readFileSync(inputFile);
  
  // Get original dimensions
  const metadata = await sharp(inputBuffer).metadata();
  console.log(`Input image: ${metadata.width}x${metadata.height}`);

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ 
        quality: 100,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
    
    console.log(`Generated: ${outputPath}`);
  }
  
  console.log('\n✅ All icons generated successfully!');
  console.log('\nTo use maskable icons (better for Android), create a maskable version:');
  console.log('1. Add padding around your logo (at least 10% on each side)');
  console.log('2. Or use: https://maskable.app/ to create maskable icons');
}

generateIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
