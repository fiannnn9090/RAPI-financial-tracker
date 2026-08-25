'use client';

import { useEffect, useMemo } from 'react';
import { t } from '../lib/i18n';

const CONFETTI_COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#4cc9f0', '#b388eb', '#ff9f1c'];

/* Modal perayaan generik — shell & gaya reuse dari LevelUpModal (dp-card,
   confetti, tombol tutup jelas). Bedanya: TANPA auto-close; user harus
   menutup manual supaya pesan sempat dibaca. */
export default function CelebrateModal({ emoji = '🎉', title, desc, onClose }) {
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
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return <div className="modal-backdrop clay-modal levelup-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal clay-card levelup-modal brutal-card brutal-levelup dp-levelup" role="dialog" aria-modal="true" aria-labelledby="celebrate-title" onMouseDown={(event) => event.stopPropagation()}>
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
      <span className="levelup-emoji" aria-hidden="true">{emoji}</span>
      <p className="kicker">{t('cel.kicker')}</p>
      <h2 id="celebrate-title">{title}</h2>
      {desc ? <p className="levelup-copy">{desc}</p> : null}
      <button className="primary-button brutal-button dp-button" onClick={onClose}>{t('cel.cta')} <span>→</span></button>
    </section>
  </div>;
}
