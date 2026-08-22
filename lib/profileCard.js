const W = 1080;
const H = 1350;

/* Semua teks canvas bilingual via tl(lang, ...) — lang dioper caller. */
import { tl } from './i18n';

/* Tier → bingkai solid + ketebalan eskalatif (makin tinggi makin tebal) */
const TIER_FRAME = {
  legendary: { color: '#FFB020', width: 16 },
  epic: { color: '#FF5D73', width: 14 },
  rare: { color: '#9B5DE5', width: 12 },
  common: { color: '#5A544C', width: 10 },
};

const INK = '#141414';
const MUTED = '#5A544C';
const SURFACE = '#FFFFFF';
const BG = '#FFF9EF';
const YELLOW = '#FFD23F';

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

export async function drawProfileCard({ username, level, levelTitle, streak, badgesUnlocked, badgesTotal, tier = 'common', lang = 'id' }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {}

  const frame = TIER_FRAME[tier] ?? TIER_FRAME.common;

  /* Background flat — tanpa gradient/blob */
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  /* Bingkai tier: solid tebal di sekeliling kartu */
  ctx.lineJoin = 'round';
  ctx.strokeStyle = frame.color;
  ctx.lineWidth = frame.width;
  roundRectPath(ctx, frame.width / 2, frame.width / 2, W - frame.width, H - frame.width, 28);
  ctx.stroke();

  /* Brand row */
  const bx = 96;
  const by = 84;
  const bs = 64;
  ctx.fillStyle = INK;
  roundRectPath(ctx, bx + 6, by + 6, bs, bs, 16);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  roundRectPath(ctx, bx, by, bs, bs, 16);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  roundRectPath(ctx, bx, by, bs, bs, 16);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = '800 40px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('r', bx + bs / 2, by + bs / 2 + 2);

  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = '800 46px "DM Sans", sans-serif';
  ctx.fillText('rapi', bx + bs + 22, by + bs / 2 + 2);

  /* Kicker */
  ctx.textAlign = 'center';
  ctx.font = '700 30px "DM Mono", monospace';
  ctx.fillStyle = MUTED;
  ctx.fillText(tl(lang, 'pc.kicker'), W / 2, 300);

  /* Username — besar & berani */
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  ctx.font = '900 104px "DM Sans", sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText(displayName, W / 2, 400);

  /* Level pill — surface bordered + hard shadow */
  ctx.font = '800 34px "DM Sans", sans-serif';
  const pillText = `Lv ${level} \u00B7 ${levelTitle}`;
  const pillWidth = ctx.measureText(pillText).width + 80;
  const px = (W - pillWidth) / 2;
  const py = 470;
  ctx.fillStyle = INK;
  roundRectPath(ctx, px + 7, py + 7, pillWidth, 76, 38);
  ctx.fill();
  ctx.fillStyle = SURFACE;
  roundRectPath(ctx, px, py, pillWidth, 76, 38);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  roundRectPath(ctx, px, py, pillWidth, 76, 38);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textBaseline = 'middle';
  ctx.fillText(pillText, W / 2, py + 39);

  /* Stats */
  ctx.textAlign = 'left';
  ctx.font = '700 36px "DM Sans", sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText(`\uD83D\uDD25  ${tl(lang, 'pc.statsStreak', { n: streak })}`, 120, 650);
  ctx.fillText(`\uD83C\uDFC5  ${tl(lang, 'pc.statsBadge', { a: badgesUnlocked, b: badgesTotal })}`, 120, 720);

  /* Saldo disamarkan */
  ctx.font = '700 26px "DM Mono", monospace';
  ctx.fillStyle = MUTED;
  ctx.fillText(tl(lang, 'pc.balanceLabel'), 120, 850);

  ctx.save();
  ctx.font = '700 52px "DM Mono", monospace';
  ctx.fillStyle = 'rgba(20, 20, 20, .85)';
  ctx.fillText(`Rp ${BALANCE_BLOCKS}`, 120, 930);
  ctx.filter = 'blur(5px)';
  ctx.fillText(`Rp ${BALANCE_BLOCKS}`, 120, 930);
  ctx.restore();

  ctx.font = '400 22px "DM Mono", monospace';
  ctx.fillStyle = MUTED;
  ctx.fillText(tl(lang, 'pc.maskedNote'), 122, 990);

  /* Footer */
  ctx.textAlign = 'center';
  ctx.font = '700 26px "DM Sans", sans-serif';
  ctx.fillStyle = MUTED;
  ctx.fillText(tl(lang, 'pc.footer'), W / 2, H - 84);

  return canvas;
}
