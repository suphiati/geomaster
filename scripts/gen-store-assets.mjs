/**
 * Google Play + App Store mağaza görsellerini üretir (SVG → PNG, sharp).
 * İki dilli: TR ve EN başlık/mockup metinleriyle ayrı ekran görüntüsü setleri.
 *
 * Çıktılar (store-assets/):
 *   - play-icon-512.png / appstore-icon-1024.png       (dilsiz ikonlar)
 *   - feature-graphic.png / feature-graphic-en.png     (Play özellik grafiği 1024×500)
 *   - screenshot-1..5.png        (TR tanıtım ekranları 1242×2688)
 *   - screenshot-en-1..5.png     (EN tanıtım ekranları 1242×2688)
 *
 * Kullanım: node scripts/gen-store-assets.mjs
 */

import sharp from 'sharp';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const OUT = resolve(process.cwd(), 'store-assets');
mkdirSync(OUT, { recursive: true });

const C = {
  bgDark1: '#171A28', bgDark2: '#0B0D13',
  teal: '#4ECDC4', tealDark: '#2E8B84', tealLight: '#7FF0E6',
  ink: '#1A1D27', muted: '#636882', cardLight: '#FFFFFF', screenBg: '#F5F6FA',
  accent: '#FFE66D', coral: '#FF6B6B', indigo: '#667EEA', success: '#2ED573',
};
const FONT = 'Segoe UI, Arial, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ─── Dil metinleri ───
const L = {
  tr: {
    featSub: 'Dünyayı keşfet — 245 ülke, 6 quiz modu',
    featTags: 'Bayrak · Başkent · Komşular · Günlük Challenge',
    shots: [
      ['Dünyayı Avucunda Keşfet', '245 ülke, tek uygulamada'],
      ['6 Eğlenceli Quiz Modu', 'Klasik, Bayrak, Hız Turu ve daha fazlası'],
      ['Bilgini Test Et', 'Anında geri bildirim, XP ve rozetler'],
      ['Zengin Ülke Ansiklopedisi', 'Bayrak, başkent, komşular, para birimi'],
      ['Seviye Atla, Rozet Topla', 'İlerlemeni takip et, motive kal'],
    ],
    home: { welcome: 'HOŞ GELDİN', level: 'SEVİYE 5', title: 'Kaşif', qs: 'Hızlı Başlat',
      qsDesc: 'Klasik mod ile bilgini test et', streak: 'STREAK', quiz: 'QUIZ',
      enc: 'Ülke Ansiklopedisi', encDesc: '245 ülkenin verisi' },
    quiz: { title: 'Quiz Modları', sub: 'Bir mod seç ve teste başla',
      modes: ['Klasik', 'Bayrak', 'Komşu Zinciri', 'Hız Turu', 'Doğru/Yanlış', 'Günlük'] },
    play: { title: 'Klasik Quiz', q1: "Almanya'nın", q2: 'başkenti nedir?',
      a: ['Münih', 'Berlin', 'Hamburg', 'Frankfurt'] },
    explore: { title: 'Keşfet', count: '245 ülke', search: 'Ülke veya başkent ara...',
      chips: ['Tümü', 'Avrupa', 'Asya'],
      rows: [['Afganistan', 'Kabul', 'Asya'], ['Almanya', 'Berlin', 'Avrupa'],
        ['Arjantin', 'Buenos Aires', 'G. Amerika'], ['Avustralya', 'Canberra', 'Okyanusya']] },
    profile: { title: 'Profil', level: 'SEVİYE 5', name: 'Kaşif', badges: 'Rozetler',
      badgeNames: ['İlk Doğru', 'İlk Quiz', '100 Doğru', '3 Gün', 'Avrupa', 'Asya'] },
  },
  en: {
    featSub: 'Explore the world — 245 countries, 6 quiz modes',
    featTags: 'Flags · Capitals · Neighbors · Daily Challenge',
    shots: [
      ['Explore the World', '245 countries, one app'],
      ['6 Fun Quiz Modes', 'Classic, Flags, Speed Round and more'],
      ['Test Your Knowledge', 'Instant feedback, XP and badges'],
      ['Rich Country Encyclopedia', 'Flags, capitals, neighbors, currencies'],
      ['Level Up, Earn Badges', 'Track your progress, stay motivated'],
    ],
    home: { welcome: 'WELCOME', level: 'LEVEL 5', title: 'Explorer', qs: 'Quick Start',
      qsDesc: 'Test your knowledge with classic mode', streak: 'STREAK', quiz: 'QUIZ',
      enc: 'Country Encyclopedia', encDesc: 'Browse all country data' },
    quiz: { title: 'Quiz Modes', sub: 'Pick a mode and start',
      modes: ['Classic', 'Flag Match', 'Neighbor Chain', 'Speed Round', 'True/False', 'Daily'] },
    play: { title: 'Classic Quiz', q1: 'What is the', q2: 'capital of Germany?',
      a: ['Munich', 'Berlin', 'Hamburg', 'Frankfurt'] },
    explore: { title: 'Explore', count: '245 countries', search: 'Search country or capital...',
      chips: ['All', 'Europe', 'Asia'],
      rows: [['Afghanistan', 'Kabul', 'Asia'], ['Germany', 'Berlin', 'Europe'],
        ['Argentina', 'Buenos Aires', 'S. America'], ['Australia', 'Canberra', 'Oceania']] },
    profile: { title: 'Profile', level: 'LEVEL 5', name: 'Explorer', badges: 'Badges',
      badgeNames: ['First Correct', 'First Quiz', '100 Correct', '3 Days', 'Europe', 'Asia'] },
  },
};

// ─── Globe / ikon / feature ───
const globe = (cx, cy, r, gradId) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${gradId})"/>
  <g clip-path="url(#clip-${gradId})" stroke="#0C3A36" stroke-width="${r * 0.037}" fill="none" opacity="0.5" stroke-linecap="round">
    <line x1="${cx - r * 0.95}" y1="${cy - r * 0.3}" x2="${cx + r * 0.95}" y2="${cy - r * 0.3}"/>
    <line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}"/>
    <line x1="${cx - r * 0.95}" y1="${cy + r * 0.3}" x2="${cx + r * 0.95}" y2="${cy + r * 0.3}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.37}" ry="${r}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.72}" ry="${r}"/>
  </g>`;
const globeDefs = (id) => `
  <radialGradient id="${id}" cx="0.38" cy="0.34" r="0.82">
    <stop offset="0" stop-color="${C.tealLight}"/><stop offset="0.55" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.tealDark}"/>
  </radialGradient>
  <clipPath id="clip-${id}"><circle cx="256" cy="256" r="150"/></clipPath>`;

const iconSvg = (size, rounded) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="ibg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bgDark1}"/><stop offset="1" stop-color="#0F1117"/></linearGradient>${globeDefs('ig')}</defs>
  <rect width="512" height="512" rx="${rounded ? 114 : 0}" fill="url(#ibg)"/>
  ${globe(256, 256, 150, 'ig')}
  <circle cx="256" cy="256" r="150" fill="none" stroke="${C.tealLight}" stroke-width="3" opacity="0.35"/>
</svg>`;

const featureSvg = (loc) => `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bgDark1}"/><stop offset="1" stop-color="${C.bgDark2}"/></linearGradient>
    <radialGradient id="fg" cx="0.38" cy="0.34" r="0.82"><stop offset="0" stop-color="${C.tealLight}"/><stop offset="0.55" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.tealDark}"/></radialGradient>
    <clipPath id="clip-fg"><circle cx="255" cy="250" r="150"/></clipPath>
  </defs>
  <rect width="1024" height="500" fill="url(#fbg)"/>
  <circle cx="255" cy="250" r="150" fill="url(#fg)"/>
  <g clip-path="url(#clip-fg)" stroke="#0C3A36" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round">
    <line x1="107" y1="205" x2="403" y2="205"/><line x1="99" y1="250" x2="411" y2="250"/><line x1="107" y1="295" x2="403" y2="295"/>
    <ellipse cx="255" cy="250" rx="56" ry="150"/><ellipse cx="255" cy="250" rx="108" ry="150"/>
  </g>
  <circle cx="255" cy="250" r="150" fill="none" stroke="${C.tealLight}" stroke-width="4" opacity="0.35"/>
  <text x="470" y="238" font-family="${FONT}" font-size="86" font-weight="800" fill="#FFFFFF" letter-spacing="-1">GeoMaster</text>
  <text x="474" y="298" font-family="${FONT}" font-size="27" font-weight="400" fill="#9AA3B8">${esc(loc.featSub)}</text>
  <text x="474" y="362" font-family="${FONT}" font-size="24" font-weight="600" fill="${C.teal}">${esc(loc.featTags)}</text>
</svg>`;

// ─── Ekran görüntüsü çerçevesi ───
const W = 1242, H = 2688;
const PX = 150, PY = 640;
const PW = W - PX * 2, PH = H - PY - 120;
const SX = PX + 26, SY = PY + 26, SW = PW - 52, SH = PH - 52;
const CW = SW;

const card = (x, y, w, h, fill = C.cardLight, r = 28) => `<rect x="${SX + x}" y="${SY + y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const txt = (x, y, s, size, weight, fill, anchor = 'start') => `<text x="${SX + x}" y="${SY + y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const pill = (x, y, w, h, fill) => `<rect x="${SX + x}" y="${SY + y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`;

const screenshot = (title, subtitle, inner) => `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sbg" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="${C.bgDark1}"/><stop offset="1" stop-color="${C.bgDark2}"/></linearGradient>
    <linearGradient id="phone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A2E3D"/><stop offset="1" stop-color="#15171F"/></linearGradient>
    <clipPath id="screenClip"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="44"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sbg)"/>
  <g opacity="0.08"><circle cx="${W - 120}" cy="180" r="220" fill="${C.teal}"/></g>
  <text x="${W / 2}" y="300" text-anchor="middle" font-family="${FONT}" font-size="76" font-weight="800" fill="#FFFFFF" letter-spacing="-1">${esc(title)}</text>
  <text x="${W / 2}" y="380" text-anchor="middle" font-family="${FONT}" font-size="40" font-weight="500" fill="${C.tealLight}">${esc(subtitle)}</text>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="70" fill="url(#phone)"/>
  <rect x="${PX + 12}" y="${PY + 12}" width="${PW - 24}" height="${PH - 24}" rx="58" fill="#000"/>
  <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="44" fill="${C.screenBg}"/>
  <g clip-path="url(#screenClip)">
    <rect x="${SX}" y="${SY}" width="${SW}" height="60" fill="${C.screenBg}"/>
    <text x="${SX + 34}" y="${SY + 40}" font-family="${FONT}" font-size="26" font-weight="600" fill="${C.ink}">9:41</text>
    <text x="${SX + SW - 90}" y="${SY + 40}" font-family="${FONT}" font-size="24" fill="${C.ink}">▲ ▲ ▮</text>
    ${inner}
  </g>
  <rect x="${W / 2 - 120}" y="${PY + 22}" width="240" height="38" rx="19" fill="#000"/>
</svg>`;

// ─── Ekran içerikleri (dil parametreli) ───
const homeInner = (h) => `
  ${txt(40, 150, h.welcome, 26, 600, C.muted)}
  ${txt(40, 205, 'GeoMaster', 58, 800, C.ink)}
  ${card(40, 250, CW - 80, 190)}
  <circle cx="${SX + 120}" cy="${SY + 345}" r="48" fill="${C.accent}"/>
  ${txt(200, 320, h.level, 26, 700, C.muted)}
  ${txt(200, 370, h.title, 46, 800, C.ink)}
  ${txt(CW - 70, 355, '1.035', 44, 800, C.teal, 'end')}
  ${pill(200, 395, CW - 280, 16, '#E6E8F0')}
  ${pill(200, 395, (CW - 280) * 0.85, 16, C.teal)}
  ${card(40, 470, CW - 80, 150, C.teal + '22')}
  <circle cx="${SX + 115}" cy="${SY + 545}" r="42" fill="${C.teal}"/>
  ${txt(185, 530, h.qs, 40, 800, C.ink)}
  ${txt(185, 580, h.qsDesc, 26, 400, C.muted)}
  ${card(40, 650, (CW - 100) / 2, 170)}
  ${txt(70, 710, h.streak, 24, 600, C.muted)}
  ${txt(70, 775, '🔥 7', 52, 800, C.ink)}
  ${card(60 + (CW - 100) / 2, 650, (CW - 100) / 2, 170)}
  ${txt(90 + (CW - 100) / 2, 710, h.quiz, 24, 600, C.muted)}
  ${txt(90 + (CW - 100) / 2, 775, '12', 52, 800, C.ink)}
  ${card(40, 850, CW - 80, 120)}
  <circle cx="${SX + 100}" cy="${SY + 910}" r="34" fill="${C.indigo}"/>
  ${txt(160, 900, h.enc, 34, 700, C.ink)}
  ${txt(160, 945, h.encDesc, 26, 400, C.muted)}`;

const modeCard = (i, name, color) => {
  const col = i % 2, row = Math.floor(i / 2);
  const w = (CW - 100) / 2, x = 40 + col * (w + 20), y = 240 + row * 250;
  return `${card(x, y, w, 230)}
    <circle cx="${SX + x + 55}" cy="${SY + y + 60}" r="34" fill="${color}33"/>
    <circle cx="${SX + x + 55}" cy="${SY + y + 60}" r="16" fill="${color}"/>
    ${txt(x + 30, y + 150, name, 32, 800, C.ink)}
    ${pill(x + 30, y + 175, w - 90, 12, '#E6E8F0')}
    ${pill(x + 30, y + 200, w - 130, 12, '#E6E8F0')}`;
};
const quizInner = (q) => {
  const colors = [C.teal, C.coral, C.indigo, C.accent, C.success, C.coral];
  return `${txt(40, 165, q.title, 56, 800, C.ink)}
    ${txt(40, 215, q.sub, 28, 400, C.muted)}
    ${q.modes.map((m, i) => modeCard(i, m, colors[i])).join('')}`;
};

const answer = (y, letter, label, state) => {
  const fill = state === 'correct' ? C.success + '22' : C.cardLight;
  const bd = state === 'correct' ? C.success : '#E6E8F0';
  return `<rect x="${SX + 40}" y="${SY + y}" width="${CW - 80}" height="110" rx="24" fill="${fill}" stroke="${bd}" stroke-width="3"/>
    <circle cx="${SX + 95}" cy="${SY + y + 55}" r="26" fill="${bd}22"/>
    ${txt(85, y + 65, letter, 30, 700, state === 'correct' ? C.success : C.muted)}
    ${txt(150, y + 65, label, 34, 600, C.ink)}`;
};
const playInner = (p) => `
  ${txt(40, 150, p.title, 40, 800, C.ink)}
  ${txt(CW - 40, 150, '4 / 10  ❤❤🤍', 30, 700, C.muted, 'end')}
  ${pill(40, 185, CW - 80, 16, '#E6E8F0')}
  ${pill(40, 185, (CW - 80) * 0.4, 16, C.teal)}
  ${card(40, 240, CW - 80, 260)}
  ${txt(CW / 2 - 40, 355, p.q1, 46, 700, C.ink, 'middle')}
  ${txt(CW / 2 - 40, 415, p.q2, 46, 700, C.ink, 'middle')}
  ${answer(560, 'A', p.a[0], 'default')}
  ${answer(690, 'B', p.a[1], 'correct')}
  ${answer(820, 'C', p.a[2], 'default')}
  ${answer(950, 'D', p.a[3], 'default')}`;

const countryRow = (y, flag, name, cap, cont, color) => `
  ${card(40, y, CW - 80, 130)}
  <rect x="${SX + 70}" y="${SY + y + 35}" width="80" height="58" rx="8" fill="${flag}"/>
  ${txt(180, y + 65, name, 38, 700, C.ink)}
  ${txt(180, y + 105, cap, 28, 400, C.muted)}
  ${pill(CW - 260, y + 42, 195, 46, color + '22')}
  ${txt(CW - 162, y + 73, cont, 24, 600, color, 'middle')}`;
const exploreInner = (e) => {
  const flags = ['#000', C.indigo, C.coral, C.success];
  const contColors = [C.teal, C.indigo, '#4FACFE', C.success];
  return `${txt(40, 160, e.title, 56, 800, C.ink)}
    ${txt(40, 205, e.count, 28, 400, C.muted)}
    ${card(40, 240, CW - 80, 90, C.cardLight, 20)}
    ${txt(75, 295, '🔍  ' + e.search, 30, 400, C.muted)}
    ${pill(40, 360, 130, 60, C.teal)}
    ${txt(105, 398, e.chips[0], 28, 700, '#fff', 'middle')}
    ${pill(185, 360, 175, 60, C.cardLight)}
    ${txt(272, 398, e.chips[1], 28, 600, C.ink, 'middle')}
    ${pill(375, 360, 140, 60, C.cardLight)}
    ${txt(445, 398, e.chips[2], 28, 600, C.ink, 'middle')}
    ${e.rows.map((r, i) => countryRow(450 + i * 150, flags[i], r[0], r[1], r[2], contColors[i])).join('')}`;
};

const badge = (i, name, earned) => {
  const col = i % 3, row = Math.floor(i / 3);
  const w = (CW - 120) / 3, x = 40 + col * (w + 20), y = 480 + row * 250;
  const color = earned ? C.accent : '#C7CBD8';
  return `${card(x, y, w, 220, C.cardLight, 24)}
    <circle cx="${SX + x + w / 2}" cy="${SY + y + 70}" r="42" fill="${color}33"/>
    <circle cx="${SX + x + w / 2}" cy="${SY + y + 70}" r="20" fill="${color}"/>
    ${txt(x + w / 2, y + 150, name, 22, 700, C.ink, 'middle')}
    ${pill(x + 25, y + 175, w - 50, 10, '#E6E8F0')}`;
};
const profileInner = (p) => `
  ${txt(40, 160, p.title, 56, 800, C.ink)}
  ${card(40, 200, CW - 80, 200)}
  <circle cx="${SX + 120}" cy="${SY + 300}" r="55" fill="${C.accent}"/>
  ${txt(210, 275, p.level, 26, 700, C.muted)}
  ${txt(210, 325, p.name, 50, 800, C.ink)}
  ${txt(CW - 70, 310, '1.035', 46, 800, C.teal, 'end')}
  ${pill(210, 350, CW - 300, 16, '#E6E8F0')}
  ${pill(210, 350, (CW - 300) * 0.85, 16, C.teal)}
  ${txt(40, 460, p.badges, 40, 800, C.ink)}
  ${p.badgeNames.map((n, i) => badge(i, n, i < 2)).join('')}`;

// ─── Üretim ───
const jobs = [
  ['play-icon-512.png', iconSvg(512, true), 512, 512],
  ['appstore-icon-1024.png', iconSvg(1024, false), 1024, 1024],
];

for (const lang of ['tr', 'en']) {
  const loc = L[lang];
  const suffix = lang === 'en' ? '-en' : '';
  jobs.push([`feature-graphic${suffix}.png`, featureSvg(loc), 1024, 500]);
  const inners = [homeInner(loc.home), quizInner(loc.quiz), playInner(loc.play), exploreInner(loc.explore), profileInner(loc.profile)];
  loc.shots.forEach((s, i) => {
    jobs.push([`screenshot${suffix}-${i + 1}.png`.replace('--', '-'), screenshot(s[0], s[1], inners[i]), W, H]);
  });
}

for (const [name, svg, w, h] of jobs) {
  await sharp(Buffer.from(svg)).resize(w, h).png().toFile(resolve(OUT, name));
  console.log('✓', name, `${w}×${h}`);
}
console.log('Tüm mağaza görselleri üretildi:', OUT);
