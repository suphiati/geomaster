/**
 * Uygulama ikonlarını ve splash görselini üretir (globe/coğrafya teması).
 * SVG → PNG dönüşümü sharp ile yapılır.
 *
 * Kullanım: node scripts/gen-icons.mjs
 * Çıktılar: assets/images/{icon,android-icon-foreground,android-icon-background,
 *           android-icon-monochrome,splash-icon,favicon}.png
 */

import sharp from 'sharp';
import { resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'assets/images');

// Küre üzerindeki meridyen/paralel grid çizgileri (enlem-boylam).
const GRID = (stroke, w, op) => `
  <g clip-path="url(#clip)" stroke="${stroke}" stroke-width="${w}" fill="none" opacity="${op}" stroke-linecap="round">
    <line x1="216" y1="418" x2="808" y2="418"/>
    <line x1="204" y1="512" x2="820" y2="512"/>
    <line x1="216" y1="606" x2="808" y2="606"/>
    <ellipse cx="512" cy="512" rx="112" ry="300"/>
    <ellipse cx="512" cy="512" rx="216" ry="300"/>
  </g>`;

const DEFS = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1B1F30"/><stop offset="1" stop-color="#0F1117"/>
  </linearGradient>
  <radialGradient id="globe" cx="0.38" cy="0.34" r="0.82">
    <stop offset="0" stop-color="#7FF0E6"/><stop offset="0.55" stop-color="#4ECDC4"/><stop offset="1" stop-color="#2E8B84"/>
  </radialGradient>
  <clipPath id="clip"><circle cx="512" cy="512" r="300"/></clipPath>
</defs>`;

const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${DEFS}
  <rect width="1024" height="1024" rx="228" fill="url(#bg)"/>
  <circle cx="512" cy="512" r="300" fill="url(#globe)"/>
  ${GRID('#0C3A36', 11, 0.55)}
  <circle cx="512" cy="512" r="300" fill="none" stroke="#7FF0E6" stroke-width="6" opacity="0.35"/>
</svg>`;

// Adaptive foreground: şeffaf zemin, küre güvenli bölge içinde (r≈292 → çap 584 < 682 safe).
const fgSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${DEFS}
  <circle cx="512" cy="512" r="292" fill="url(#globe)"/>
  ${GRID('#0C3A36', 11, 0.55)}
  <circle cx="512" cy="512" r="292" fill="none" stroke="#7FF0E6" stroke-width="6" opacity="0.35"/>
</svg>`;

// Monochrome (Android 13+ temalı ikon): tek renk silüet, sistem tint uygular.
const monoSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="clip"><circle cx="512" cy="512" r="292"/></clipPath></defs>
  <circle cx="512" cy="512" r="292" fill="#FFFFFF"/>
  <g clip-path="url(#clip)" stroke="#000" stroke-width="12" fill="none" opacity="0.65" stroke-linecap="round">
    <line x1="224" y1="418" x2="800" y2="418"/>
    <line x1="212" y1="512" x2="812" y2="512"/>
    <line x1="224" y1="606" x2="800" y2="606"/>
    <ellipse cx="512" cy="512" rx="110" ry="292"/>
    <ellipse cx="512" cy="512" rx="210" ry="292"/>
  </g>
</svg>`;

const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="#0F1117"/></svg>`;

const jobs = [
  ['icon.png', iconSvg, 1024],
  ['android-icon-foreground.png', fgSvg, 1024],
  ['android-icon-background.png', bgSvg, 1024],
  ['android-icon-monochrome.png', monoSvg, 1024],
  ['splash-icon.png', fgSvg, 1024],
  ['favicon.png', iconSvg, 96],
];

for (const [name, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(resolve(OUT, name));
  console.log('✓', name, `${size}px`);
}
console.log('Tüm ikonlar üretildi.');
