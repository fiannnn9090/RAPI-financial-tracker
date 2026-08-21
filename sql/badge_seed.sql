-- Seed badge_defs untuk Fase 5b — jalankan manual di Supabase SQL Editor.
-- Idempoten: aman dijalankan berulang.

insert into badge_defs (code, title, icon, note, rarity) values
  ('first_step',    'Langkah pertama',   '🌱', 'Mulai mencatat!',                    'common'),
  ('first_income',  'Cuan masuk',        '💸', 'Pemasukan pertama',                  'common'),
  ('five_logged',   'Rajin mencatat',    '🔥', '5 transaksi tercatat',               'rare'),
  ('logged_25',     'Kolektor momen',    '💎', '25 transaksi tercatat',              'rare'),
  ('consistent_3d', 'Konsisten',         '⚡', 'Catat di 3 hari berbeda',            'epic'),
  ('wishlist_done', 'Wishlist tercapai', '🏆', 'Satu impian berhasil diwujudkan',    'epic'),
  ('streak_7',      'Setia datang',      '📅', 'Streak 7 hari beruntun',             'epic'),
  ('level_6',       'Jagoan Anggaran',   '🚀', 'Capai level 6',                      'legendary')
on conflict (code) do nothing;
