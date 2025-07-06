#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import toIco from 'to-ico';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createIco() {
  try {
    const buildDir = path.join(__dirname, '../build');
    
    // Read PNG files for ICO creation (multiple sizes)
    const sizes = [16, 32, 64, 128, 256];
    const buffers = [];
    
    for (const size of sizes) {
      const pngPath = path.join(buildDir, `icon-${size}.png`);
      if (fs.existsSync(pngPath)) {
        buffers.push(fs.readFileSync(pngPath));
      }
    }
    
    if (buffers.length === 0) {
      throw new Error('No PNG files found. Run generate-icons.js first.');
    }
    
    // Create ICO file
    const ico = await toIco(buffers);
    const icoPath = path.join(buildDir, 'icon.ico');
    fs.writeFileSync(icoPath, ico);
    
    console.log('✅ Generated icon.ico for Windows');
    
  } catch (error) {
    console.error('❌ Error creating ICO file:', error.message);
    process.exit(1);
  }
}

createIco();