/**
 * Native Canvas 2D API Score Card Generator.
 * Renders a crisp 1200x630 Retina HD share card natively on HTML5 Canvas.
 * Supports Light / Dark theme mode dynamically and displays the challenge theme/title.
 */
export function generateScoreCardBlob(
  year: number,
  score: number,
  distance: number,
  challengeTitle?: string,
  categoryLabel?: string,
  isDark: boolean = true
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    // Performance badge text & dynamic colors
    const isPerfect = distance === 0;
    const isGreat = distance <= 5;
    const isGood = distance <= 20;

    const scoreColor = score >= 4500 ? '#10B981' : score >= 2500 ? '#F59E0B' : '#EF4444';
    const distanceColor = isPerfect ? '#F59E0B' : isGreat ? '#10B981' : isGood ? '#3B82F6' : '#EF4444';

    const perfBadgeText = isPerfect
      ? 'NA MOSCA!'
      : distance <= 2
      ? 'EXCELENTE'
      : distance <= 10
      ? 'MUITO PERTO'
      : distance <= 30
      ? 'BOM PALPITE'
      : 'CONTINUE TENTANDO';

    // Theme Color Tokens
    const bgFill = isDark ? '#080C14' : '#F8FAFC';
    const cardFill = isDark ? '#0F172A' : '#FFFFFF';
    const cardBorder = isDark ? '#1E293B' : '#E2E8F0';
    const textPrimary = isDark ? '#FFFFFF' : '#0F172A';
    const textSecondary = isDark ? '#94A3B8' : '#64748B';
    const yearText = isDark ? '#FFFFFF' : '#0F172A';

    // 1. BASE BACKGROUND
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, 1200, 630);

    // Subtle Radial Glow Top
    const glowColor = isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.12)';
    const topGlow = ctx.createRadialGradient(600, -50, 10, 600, -50, 600);
    topGlow.addColorStop(0, glowColor);
    topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, 1200, 630);

    // Top Accent Bar (Gradient Amber -> Emerald -> Blue)
    const barGrad = ctx.createLinearGradient(0, 0, 1200, 0);
    barGrad.addColorStop(0, '#F59E0B');
    barGrad.addColorStop(0.5, '#10B981');
    barGrad.addColorStop(1, '#3B82F6');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, 1200, 5);

    // 2. BRAND HEADER (Pure Typography)
    ctx.font = '900 38px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    ctx.fillStyle = yearText;
    ctx.fillText('Year', 50, 72);

    const yearW = ctx.measureText('Year').width;
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('Guessr', 50 + yearW, 72);

    // Subtitle
    ctx.font = '800 11px monospace, "Courier New", Courier';
    ctx.fillStyle = textSecondary;
    ctx.fillText('HISTORICAL TIME TRAVEL GUESS', 50, 92);

    // Right Performance Badge
    ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(920, 40, 230, 46, 23);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 14px monospace, "Courier New", Courier';
    ctx.fillStyle = '#F59E0B';
    ctx.textAlign = 'center';
    ctx.fillText(perfBadgeText, 920 + 115, 69);
    ctx.textAlign = 'left';

    // Header Divider
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 108);
    ctx.lineTo(1150, 108);
    ctx.stroke();

    // 3. CHALLENGE THEME / TITLE BANNER (IF PROVIDED)
    let heroTop = 130;
    if (challengeTitle) {
      ctx.fillStyle = cardFill;
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(50, 126, 1100, 78, 16);
      ctx.fill();
      ctx.stroke();

      // Category Pill
      const catText = (categoryLabel || 'DESAFIO').toUpperCase();
      ctx.font = '900 11px monospace, "Courier New", Courier';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText(`• ${catText}`, 74, 152);

      // Challenge Title
      ctx.font = '900 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = textPrimary;
      
      // Truncate title if too long
      let displayTitle = challengeTitle;
      if (ctx.measureText(displayTitle).width > 1020) {
        while (displayTitle.length > 5 && ctx.measureText(displayTitle + '...').width > 1020) {
          displayTitle = displayTitle.slice(0, -1);
        }
        displayTitle += '...';
      }
      ctx.fillText(displayTitle, 74, 184);

      heroTop = 220;
    }

    // 4. MAIN SCORE HERO CARD (TARGET YEAR & SCORE)
    const heroHeight = challengeTitle ? 250 : 330;
    ctx.fillStyle = cardFill;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, heroTop, 1100, heroHeight, 22);
    ctx.fill();
    ctx.stroke();

    // Left Column: Target Year
    const yearCenterY = heroTop + Math.floor(heroHeight / 2);

    ctx.font = '800 14px monospace, "Courier New", Courier';
    ctx.fillStyle = textSecondary;
    ctx.textAlign = 'center';
    ctx.fillText('ANO CORRETO • TARGET YEAR', 330, heroTop + 45);

    ctx.font = `900 ${challengeTitle ? '100px' : '120px'} system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = textPrimary;
    ctx.fillText(String(year), 330, yearCenterY + (challengeTitle ? 36 : 42));

    // Divider inside hero card
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(660, heroTop + 30);
    ctx.lineTo(660, heroTop + heroHeight - 30);
    ctx.stroke();

    // Right Column: Score
    ctx.font = '800 14px monospace, "Courier New", Courier';
    ctx.fillStyle = textSecondary;
    ctx.fillText('PONTUAÇÃO • SCORE', 905, heroTop + 45);

    ctx.font = `900 ${challengeTitle ? '85px' : '100px'} system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = scoreColor;
    ctx.fillText(String(score), 905, yearCenterY + (challengeTitle ? 30 : 36));

    // 5. STAT FOOTER PANELS
    const footerPanelsTop = heroTop + heroHeight + 16;
    const footerPanelsHeight = 630 - footerPanelsTop - 50;

    // Left Panel: Distance
    ctx.fillStyle = cardFill;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(50, footerPanelsTop, 534, footerPanelsHeight, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 12.5px monospace, "Courier New", Courier';
    ctx.fillStyle = textSecondary;
    ctx.textAlign = 'center';
    ctx.fillText('DISTÂNCIA • DISTANCE OFF', 317, footerPanelsTop + 32);

    ctx.font = '900 32px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = distanceColor;
    ctx.fillText(`${distance} ${distance === 1 ? 'ano' : 'anos'}`, 317, footerPanelsTop + 68);

    // Right Panel: Game Mode
    ctx.beginPath();
    ctx.roundRect(616, footerPanelsTop, 534, footerPanelsHeight, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 12.5px monospace, "Courier New", Courier';
    ctx.fillStyle = textSecondary;
    ctx.fillText('MODO DE JOGO • GAME MODE', 883, footerPanelsTop + 32);

    ctx.font = '900 32px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('1-GUESS MODE', 883, footerPanelsTop + 68);

    // 6. FOOTER WATERMARK
    ctx.font = '800 14px monospace, "Courier New", Courier';
    ctx.fillStyle = textSecondary;
    ctx.textAlign = 'center';
    ctx.fillText('YEARGUESSR.PLAY', 600, 614);

    // Convert canvas to PNG Blob
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}
