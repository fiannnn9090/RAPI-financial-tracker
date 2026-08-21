const W = 1080;
const H = 1350;

const TIER_ACCENT = {
  legendary: { ring: 'rgba(255, 209, 102, .95)', glow: 'rgba(255, 209, 102, .50)' },
  epic: { ring: 'rgba(154, 108, 240, .90)', glow: 'rgba(154, 108, 240, .48)' },
  rare: { ring: 'rgba(184, 146, 255, .85)', glow: 'rgba(184, 146, 255, .42)' },
  common: { ring: 'rgba(240, 100, 140, .80)', glow: 'rgba(240, 100, 140, .40)' },
};

const BALANCE_BLOCKS = '\u2589\u258A\u258B\u258A\u2589\u258B\u258A\u2589\u258B';

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function blob(ctx, x, y, radius, rgb, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export async function drawProfileCard({ username, level, levelTitle, streak, badgesUnlocked, badgesTotal, tier = 'common' }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {}

  const accent = TIER_ACCENT[tier] ?? TIER_ACCENT.common;

  const background = ctx.createLinearGradient(0, 0, W * .35, H);
  background.addColorStop(0, '#503c68');
  background.addColorStop(.55, '#38294e');
  background.addColorStop(1, '#2b1f3d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, W, H);

  blob(ctx, 130, 190, 340, '255,143,171', .17);
  blob(ctx, 960, 1180, 420, '116,214,174', .14);
  blob(ctx, 900, 320, 380, '184,146,255', .16);

  const glow = ctx.createRadialGradient(W - 150, 170, 30, W - 150, 170, 330);
  glow.addColorStop(0, accent.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(W - 520, 0, 520, 540);

  ctx.strokeStyle = accent.ring;
  ctx.lineWidth = 3;
  roundRectPath(ctx, 26, 26, W - 52, H - 52, 44);
  ctx.stroke();

  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(84, 96, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffdf9';
  ctx.font = '700 44px "DM Sans", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('rapi', 122, 98);

  ctx.textAlign = 'center';
  ctx.font = '500 27px "DM Mono", monospace';
  ctx.fillText('K A R T U   P E N G C A P A I A N   \u2728', W / 2, 300);

  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  ctx.font = 'italic 700 96px "Playfair Display", serif';
  ctx.fillStyle = '#fffdf9';
  ctx.fillText(displayName, W / 2, 400);

  ctx.font = '600 34px "DM Sans", sans-serif';
  const pillText = `Lv ${level} \u00B7 ${levelTitle}`;
  const pillWidth = ctx.measureText(pillText).width + 76;
  ctx.fillStyle = 'rgba(255, 255, 255, .20)';
  roundRectPath(ctx, (W - pillWidth) / 2, 470, pillWidth, 74, 37);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, .35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fffdf9';
  ctx.textBaseline = 'middle';
  ctx.fillText(pillText, W / 2, 509);

  ctx.textAlign = 'left';
  ctx.font = '600 36px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, .93)';
  ctx.fillText(`\uD83D\uDD25  ${streak} hari beruntun`, 120, 650);
  ctx.fillText(`\uD83C\uDFC5  ${badgesUnlocked}/${badgesTotal} badge terkumpul`, 120, 720);

  ctx.font = '500 26px "DM Mono", monospace';
  ctx.fillStyle = 'rgba(255, 253, 249, .62)';
  ctx.fillText('SALDO', 120, 850);

  ctx.save();
  ctx.font = '700 52px "DM Mono", monospace';
  ctx.fillStyle = 'rgba(255, 253, 249, .92)';
  ctx.fillText(`Rp ${BALANCE_BLOCKS}`, 120, 930);
  ctx.filter = 'blur(5px)';
  ctx.fillText(`Rp ${BALANCE_BLOCKS}`, 120, 930);
  ctx.restore();

  ctx.font = '400 22px "DM Mono", monospace';
  ctx.fillStyle = 'rgba(255, 253, 249, .55)';
  ctx.fillText('\u2022 disamarkan demi privasi \u2022', 122, 990);

  ctx.textAlign = 'center';
  ctx.font = '500 26px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 253, 249, .70)';
  ctx.fillText('dibuat dengan rapi \u2728', W / 2, H - 84);

  return canvas;
}
