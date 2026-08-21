'use client';

import { useEffect, useMemo } from 'react';

const CONFETTI_COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#4cc9f0', '#b388eb', '#ff9f1c'];

export default function LevelUpModal({ level, title, xpEarned, onClose }) {
  const confetti = useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    left: Math.random() * 100,
    delay: Math.random() * 1.4,
    duration: 2.4 + Math.random() * 2.2,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: 7 + Math.random() * 7,
    spin: Math.floor(Math.random() * 540) - 180,
    round: Math.random() > 0.5,
  })), []);

  useEffect(() => {
    const timer = setTimeout(onClose, 7000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className="modal-backdrop clay-modal levelup-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal clay-card levelup-modal brutal-card brutal-levelup" role="dialog" aria-modal="true" aria-labelledby="levelup-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((piece, index) => <i
          key={index}
          className={piece.round ? 'round' : ''}
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.round ? piece.size : piece.size * 1.5}px`,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            '--spin': `${piece.spin}deg`,
          }}
        />)}
      </div>
      <span className="levelup-emoji">🎉</span>
      <p className="kicker">LEVEL UP!</p>
      <h2 id="levelup-title">Lv {level} tercapai!</h2>
      <p className="levelup-copy">Gila sih, bestie 😎 Kamu resmi naik gelar jadi <strong>“{title}”</strong>.</p>
      {xpEarned ? <p className="levelup-xp">+{xpEarned} XP dari transaksi terakhirmu ✨</p> : null}
      <button className="primary-button brutal-button" onClick={onClose}>Gass lanjut! <span>→</span></button>
    </section>
  </div>;
}
