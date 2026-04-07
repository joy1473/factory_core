const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '../public');

// Matrix-style Factory Core icon SVG
// Dark background, neon green digital rain, glowing "FC" core
function createIconSvg(size) {
  const s = size;
  const half = s / 2;
  const fontSize = Math.round(s * 0.32);
  const smallFont = Math.round(s * 0.06);
  const coreR = Math.round(s * 0.28);
  const glowR = Math.round(s * 0.32);

  // Generate matrix rain columns
  let matrixRain = '';
  const cols = Math.max(4, Math.round(s / 40));
  const chars = '01アイウエオカキクケコ工場核心';

  for (let c = 0; c < cols; c++) {
    const x = Math.round((c + 0.5) * (s / cols));
    const numChars = Math.round(3 + Math.random() * 5);
    for (let r = 0; r < numChars; r++) {
      const y = Math.round(s * 0.08 + r * (s * 0.1));
      if (y > s * 0.92) continue;
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const opacity = (0.15 + Math.random() * 0.25).toFixed(2);
      matrixRain += `<text x="${x}" y="${y}" font-family="monospace" font-size="${smallFont}" fill="#00ff41" opacity="${opacity}" text-anchor="middle">${ch}</text>\n`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00ff41" stop-opacity="0.4"/>
      <stop offset="60%" stop-color="#00ff41" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#00ff41" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0d1a0d"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${Math.max(1, s * 0.015)}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${Math.round(s * 0.18)}" fill="url(#bgGrad)"/>

  <!-- Border glow -->
  <rect width="${s}" height="${s}" rx="${Math.round(s * 0.18)}" fill="none" stroke="#00ff41" stroke-width="${Math.max(1, s * 0.015)}" opacity="0.3"/>

  <!-- Matrix rain -->
  ${matrixRain}

  <!-- Core glow circle -->
  <circle cx="${half}" cy="${half}" r="${glowR}" fill="url(#coreGlow)"/>

  <!-- Core ring -->
  <circle cx="${half}" cy="${half}" r="${coreR}" fill="none" stroke="#00ff41" stroke-width="${Math.max(1, s * 0.02)}" opacity="0.6" filter="url(#glow)"/>

  <!-- Inner ring -->
  <circle cx="${half}" cy="${half}" r="${Math.round(coreR * 0.75)}" fill="none" stroke="#00d4ff" stroke-width="${Math.max(1, s * 0.01)}" opacity="0.3"/>

  <!-- FC text -->
  <text x="${half}" y="${half}" font-family="'Courier New',monospace" font-size="${fontSize}" font-weight="900" fill="#00ff41" text-anchor="middle" dominant-baseline="central" filter="url(#glow)">FC</text>

  <!-- Corner accents -->
  <line x1="${Math.round(s*0.1)}" y1="${Math.round(s*0.2)}" x2="${Math.round(s*0.1)}" y2="${Math.round(s*0.3)}" stroke="#00ff41" stroke-width="${Math.max(1, s*0.01)}" opacity="0.5"/>
  <line x1="${Math.round(s*0.1)}" y1="${Math.round(s*0.2)}" x2="${Math.round(s*0.2)}" y2="${Math.round(s*0.2)}" stroke="#00ff41" stroke-width="${Math.max(1, s*0.01)}" opacity="0.5"/>
  <line x1="${Math.round(s*0.9)}" y1="${Math.round(s*0.8)}" x2="${Math.round(s*0.9)}" y2="${Math.round(s*0.7)}" stroke="#00ff41" stroke-width="${Math.max(1, s*0.01)}" opacity="0.5"/>
  <line x1="${Math.round(s*0.9)}" y1="${Math.round(s*0.8)}" x2="${Math.round(s*0.8)}" y2="${Math.round(s*0.8)}" stroke="#00ff41" stroke-width="${Math.max(1, s*0.01)}" opacity="0.5"/>
</svg>`;
}

// Apple touch icon - slightly simpler for small sizes
function createAppleSvg(size) {
  const s = size;
  const half = s / 2;
  const fontSize = Math.round(s * 0.35);
  const coreR = Math.round(s * 0.3);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#0a1a0a"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00ff41" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#00ff41" stop-opacity="0"/>
    </radialGradient>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#bg)"/>
  <circle cx="${half}" cy="${half}" r="${coreR}" fill="url(#glow)"/>
  <circle cx="${half}" cy="${half}" r="${coreR}" fill="none" stroke="#00ff41" stroke-width="2" opacity="0.5"/>
  <text x="${half}" y="${half}" font-family="'Courier New',monospace" font-size="${fontSize}" font-weight="900" fill="#00ff41" text-anchor="middle" dominant-baseline="central" filter="url(#textGlow)">FC</text>
</svg>`;
}

async function generate() {
  // Standard sizes needed
  const sizes = [
    { name: 'favicon-16x16.png', size: 16, type: 'icon' },
    { name: 'favicon-32x32.png', size: 32, type: 'icon' },
    { name: 'favicon-96x96.png', size: 96, type: 'icon' },
    { name: 'android-chrome-192x192.png', size: 192, type: 'icon' },
    { name: 'android-chrome-512x512.png', size: 512, type: 'icon' },
    { name: 'apple-touch-icon.png', size: 180, type: 'apple' },
    { name: 'apple-touch-icon-152x152.png', size: 152, type: 'apple' },
    { name: 'apple-touch-icon-120x120.png', size: 120, type: 'apple' },
    { name: 'mstile-150x150.png', size: 150, type: 'icon' },
    { name: 'og-icon.png', size: 1200, type: 'icon' },
  ];

  for (const { name, size, type } of sizes) {
    const svg = type === 'apple' ? createAppleSvg(size) : createIconSvg(size);
    const svgBuffer = Buffer.from(svg);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC, name));

    console.log(`  ✅ ${name} (${size}x${size})`);
  }

  // Generate ICO-compatible favicon (32x32 PNG renamed)
  const ico32Svg = createIconSvg(32);
  await sharp(Buffer.from(ico32Svg))
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC, 'favicon.png'));

  // Save main SVG
  fs.writeFileSync(
    path.join(PUBLIC, 'icon.svg'),
    createIconSvg(512)
  );
  console.log('  ✅ icon.svg (512x512)');

  // Generate site.webmanifest
  const manifest = {
    name: 'Factory Core - 팩토리코어',
    short_name: 'FactoryCore',
    description: '중소제조기업을 위한 Agentic AI 솔루션',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00ff41',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  fs.writeFileSync(
    path.join(PUBLIC, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('  ✅ site.webmanifest');

  // browserconfig.xml (Windows tiles)
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#000000</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  fs.writeFileSync(path.join(PUBLIC, 'browserconfig.xml'), browserconfig);
  console.log('  ✅ browserconfig.xml');

  console.log('\nDone! All icons generated.');
}

generate().catch(console.error);
