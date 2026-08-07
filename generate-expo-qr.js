#!/usr/bin/env node

/**
 * Generates a QR code for Expo Go app scanning
 * Usage: node generate-expo-qr.js [url]
 * Default: generates for localhost development
 */

import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default to localhost development URL
// Format: exp://ip-address:port or https://url
const expoUrl = process.argv[2] || 'exp://localhost:8081';

console.log(`\n📱 Generating Expo Go QR code for: ${expoUrl}\n`);

// Generate QR code as SVG
QRCode.toFile(
  join(__dirname, 'expo-qr-code.svg'),
  expoUrl,
  {
    type: 'image/svg+xml',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },
  (err) => {
    if (err) {
      console.error('❌ Error generating QR code:', err);
      process.exit(1);
    }
    console.log('✅ QR code generated: expo-qr-code.svg');
    console.log(`\n📲 Scan this QR code with Expo Go to preview the app`);
    console.log(`\nTo start the Expo dev server, run:`);
    console.log(`   npx expo start\n`);
  }
);

// Also generate as PNG
QRCode.toFile(
  join(__dirname, 'expo-qr-code.png'),
  expoUrl,
  {
    type: 'image/png',
    width: 300,
    margin: 2
  },
  (err) => {
    if (err) {
      console.error('❌ Error generating PNG:', err);
      return;
    }
    console.log('✅ PNG version also generated: expo-qr-code.png');
  }
);
