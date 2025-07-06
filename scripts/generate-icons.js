#!/usr/bin/env node

/**
 * Icon Generation Script for Claude Code History Viewer
 * 
 * This script converts the SVG icon to platform-specific formats.
 * Requires sharp package for image conversion.
 * 
 * Run: node scripts/generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('❌ Sharp not found. Install it with: pnpm add -D sharp');
  console.error('Then run: node scripts/generate-icons.js');
  process.exit(1);
}

const svgPath = path.join(__dirname, '../public/icon.svg');
const buildDir = path.join(__dirname, '../build');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate PNG for Linux (512x512)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(buildDir, 'icon.png'));
    
    console.log('✅ Generated icon.png (512x512) for Linux');
    
    // Generate ICO for Windows (256x256)
    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(buildDir, 'icon-256.png'));
    
    console.log('✅ Generated icon-256.png for Windows ICO conversion');
    
    // Generate ICNS sources for macOS
    const sizes = [16, 32, 64, 128, 256, 512, 1024];
    
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(buildDir, `icon-${size}.png`));
    }
    
    console.log('✅ Generated PNG sources for macOS ICNS conversion');
    
    console.log('\n📋 Next Steps:');
    console.log('1. For Windows: Convert build/icon-256.png to build/icon.ico using online converter');
    console.log('2. For macOS: Use iconutil or png2icns to convert PNGs to build/icon.icns');
    console.log('   - macOS command: iconutil -c icns -o build/icon.icns build/icon.iconset/');
    console.log('   - Or use: png2icns build/icon.icns build/icon-*.png');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIcons();
}

export { generateIcons };