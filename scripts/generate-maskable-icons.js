const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const inputFile = process.argv[2] || './src/assets/logo.webp';
const outputDir = './public/icons';

async function generateMaskableIcons() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputBuffer = fs.readFileSync(inputFile);
  const metadata = await sharp(inputBuffer).metadata();
  
  // Create maskable versions with 10% padding (safe area)
  for (const size of sizes) {
    const padding = Math.floor(size * 0.15); // 15% padding for safe area
    const logoSize = size - (padding * 2);
    
    const outputPath = path.join(outputDir, `icon-maskable-${size}x${size}.png`);
    
    // Create SVG with logo centered and proper padding
    const svgBuffer = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
      </svg>
    `);
    
    // Resize logo to fit within safe area
    const resizedLogo = await sharp(inputBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();
    
    // Composite logo onto background
    await sharp(svgBuffer)
      .composite([{
        input: resizedLogo,
        gravity: 'center'
      }])
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log(`Generated: ${outputPath}`);
  }
  
  console.log('\n✅ Maskable icons generated!');
}

generateMaskableIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
