/**
 * Generates an ultra-high-resolution 1200x630 score share card SVG string.
 * Retains zero emoji characters, crisp 2x retina typography, dynamic theme glows,
 * and high-contrast gaming aesthetics suitable for social media sharing.
 */
export function getScoreSvgString(
  year: number,
  score: number,
  distance: number,
  _tries: number
): string {
  // Determine dynamic accent colors based on accuracy
  const isPerfect = distance === 0;
  const isGreat = distance <= 5;
  const isGood = distance <= 20;

  const scoreColor = score >= 4500 ? '#10B981' : score >= 2500 ? '#F59E0B' : '#EF4444';
  const distanceColor = isPerfect ? '#F59E0B' : isGreat ? '#10B981' : isGood ? '#3B82F6' : '#EF4444';

  // Performance Rating Badge text (Zero emojis, clean uppercase typography)
  const perfBadgeText = isPerfect
    ? 'NA MOSCA! BULLSEYE!'
    : distance <= 2
    ? 'EXCELENTE'
    : distance <= 10
    ? 'MUITO PERTO'
    : distance <= 30
    ? 'BOM PALPITE'
    : 'CONTINUE TENTANDO';

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <!-- Dynamic Radial Ambient Glows -->
    <radialGradient id="amberGlow" cx="50%" cy="-10%" r="75%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.28"/>
      <stop offset="50%" stop-color="#F59E0B" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="indigoGlow" cx="90%" cy="100%" r="65%">
      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#6366F1" stop-opacity="0"/>
    </radialGradient>

    <!-- Linear Gradient for Main Card Fill -->
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#090E1A" stop-opacity="0.98"/>
    </linearGradient>

    <!-- Linear Gradient for Score Accent Border -->
    <linearGradient id="scoreBorder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#10B981" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.8"/>
    </linearGradient>

    <clipPath id="cardRadius">
      <rect width="1200" height="630" rx="32"/>
    </clipPath>
  </defs>

  <!-- ── BASE CONTAINER & BACKGROUND ────────────────────────── -->
  <rect width="1200" height="630" rx="32" fill="#070A12"/>
  <rect width="1200" height="630" clip-path="url(#cardRadius)" fill="url(#amberGlow)"/>
  <rect width="1200" height="630" clip-path="url(#cardRadius)" fill="url(#indigoGlow)"/>

  <!-- Subtly Textured Grid Lines -->
  <path d="M 0 126 L 1200 126 M 0 566 L 1200 566" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1.5"/>

  <!-- Top Accent Bar -->
  <rect width="1200" height="4" fill="url(#scoreBorder)"/>

  <!-- ── BRAND HEADER ───────────────────────────────────────── -->
  <!-- Sandglass Icon Container (Amber Glass Box) -->
  <rect x="56" y="42" width="56" height="56" rx="16" fill="#F59E0B" fill-opacity="0.14" stroke="#F59E0B" stroke-opacity="0.4" stroke-width="2"/>
  <g transform="translate(70, 56)" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 4 24 L 24 24"/>
    <path d="M 4 4 L 24 4"/>
    <path d="M 20 24 V 18.5 A 2 2 0 0 0 19.4 17.1 L 14 11.7 L 8.6 17.1 A 2 2 0 0 0 8 18.5 V 24"/>
    <path d="M 8 4 V 9.5 A 2 2 0 0 0 8.6 10.9 L 14 16.3 L 19.4 10.9 A 2 2 0 0 0 20 9.5 V 4"/>
  </g>

  <!-- Seamless Brand Logo: Year (White) + Guessr (Amber) -->
  <text x="128" y="77" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="36" font-weight="900" letter-spacing="-1.5">
    <tspan fill="#FFFFFF">Year</tspan><tspan fill="#F59E0B">Guessr</tspan>
  </text>
  <text x="128" y="94" fill="#64748B" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5" font-weight="800" letter-spacing="3.5">HISTORICAL TIME TRAVEL</text>

  <!-- Top-Right Performance Rank Pill -->
  <rect x="880" y="44" width="264" height="52" rx="26" fill="#F59E0B" fill-opacity="0.12" stroke="#F59E0B" stroke-opacity="0.4" stroke-width="1.8"/>
  <text x="1012" y="77" fill="#F59E0B" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="900" letter-spacing="2" text-anchor="middle">${perfBadgeText}</text>

  <!-- Header Divider -->
  <line x1="56" y1="126" x2="1144" y2="126" stroke="#1E293B" stroke-width="1.5"/>

  <!-- ── HERO CENTER CARD (TARGET YEAR & SCORE) ───────────────── -->
  <rect x="56" y="150" width="1088" height="260" rx="24" fill="url(#cardBg)" stroke="#1E293B" stroke-width="2"/>

  <!-- Left Column: Correct Target Year -->
  <text x="360" y="202" fill="#64748B" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="800" text-anchor="middle" letter-spacing="4">ANO CORRETO • TARGET YEAR</text>

  <!-- Large Sharp Year Number -->
  <text x="360" y="325" fill="#FFFFFF" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="115" font-weight="900" text-anchor="middle" letter-spacing="-5">${year}</text>

  <!-- Vertical Divider -->
  <line x1="720" y1="180" x2="720" y2="380" stroke="#1E293B" stroke-width="2"/>

  <!-- Right Column: Score -->
  <text x="932" y="202" fill="#64748B" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="800" text-anchor="middle" letter-spacing="4">PONTUAÇÃO • SCORE</text>
  <text x="932" y="320" fill="${scoreColor}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="92" font-weight="900" text-anchor="middle" letter-spacing="-3">${score}</text>

  <!-- ── STAT FOOTER PANELS ──────────────────────────────────── -->
  <!-- Panel 1: Distance Off -->
  <rect x="56" y="434" width="528" height="106" rx="20" fill="url(#cardBg)" stroke="#1E293B" stroke-width="1.8"/>
  <text x="320" y="474" fill="#64748B" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="13.5" font-weight="800" text-anchor="middle" letter-spacing="3">DISTÂNCIA • DISTANCE OFF</text>
  <text x="320" y="516" fill="${distanceColor}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="-1">${distance} ${distance === 1 ? 'ano' : 'anos'}</text>

  <!-- Panel 2: Game Mode -->
  <rect x="616" y="434" width="528" height="106" rx="20" fill="url(#cardBg)" stroke="#1E293B" stroke-width="1.8"/>
  <text x="880" y="474" fill="#64748B" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="13.5" font-weight="800" text-anchor="middle" letter-spacing="3">MODO DE JOGO • GAME MODE</text>
  <text x="880" y="516" fill="#3B82F6" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="-1">1-GUESS MODE</text>

  <!-- ── FOOTER WATERMARK ────────────────────────────────────── -->
  <line x1="56" y1="566" x2="1144" y2="566" stroke="#1E293B" stroke-width="1"/>
  <text x="600" y="602" fill="#475569" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="800" text-anchor="middle" letter-spacing="4">YEARGUESSR.PLAY</text>
</svg>
  `.trim();
}
