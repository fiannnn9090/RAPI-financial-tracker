'use client';

import { useEffect, useMemo, useState } from 'react';
import supabase from '../lib/supabase';
import { hitungXpEarned, levelFromXp, levelProgress, titleForLevel } from '../lib/xp';
import LevelUpModal from './LevelUpModal';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const today = new Date().toISOString().slice(0, 10);

const initialData = { users: [], transactions: {}, goals: {}, achievements: {}, budgets: {}, activeUserId: null };
const CATEGORY_EMOJI = { 'Makan & Minum': '🍜', Transportasi: '🛵', Belanja: '🛍️', Tagihan: '🧾', Hiburan: '🎮', Gaji: '💼', Bonus: '🎉', Usaha: '🏪', Investasi: '📈', Lainnya: '✨' };
const BUDGET_CATEGORIES = ['Makan & Minum', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan'];

function mapTransaction(row) {
  return { id: row.id, type: row.type, title: row.title, amount: Number(row.amount), category: row.category, date: row.date, xp_earned: row.xp_earned ?? 0 };
}

async function loadData(userId) {
  const [trx, goal, ach, bud] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle(),
    supabase.from('achievements').select('*').eq('user_id', userId),
    supabase.from('budgets').select('*').eq('user_id', userId),
  ]);
  return {
    transactions: (trx.data ?? []).map(mapTransaction),
    goal: goal.data ? { name: goal.data.name, amount: Number(goal.data.amount) } : null,
    achievements: (ach.data ?? []).map((row) => ({ id: row.id, name: row.goal_name, amount: Number(row.goal_amount), completedAt: row.completed_at })),
    budgets: Object.fromEntries((bud.data ?? []).map((row) => [row.category, Number(row.monthly_limit)])),
  };
}

export default function Home() {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);

  async function enterApp(authUser, fallbackName) {
    let profile = (await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()).data;
    if (!profile) {
      const username = fallbackName || authUser.email.replace(/@rapi\.local$/, '');
      profile = (await supabase.from('profiles').insert({ id: authUser.id, username }).select().single()).data
        ?? { id: authUser.id, username, xp: 0, level: 1 };
    }
    const snapshot = await loadData(authUser.id);
    const account = { id: authUser.id, username: profile.username, xp: profile.xp ?? 0, level: profile.level ?? 1 };
    setData((current) => ({
      ...current,
      users: current.users.some((user) => user.id === authUser.id)
        ? current.users.map((user) => (user.id === authUser.id ? account : user))
        : [...current.users, account],
      transactions: { ...current.transactions, [authUser.id]: snapshot.transactions },
      goals: { ...current.goals, [authUser.id]: snapshot.goal },
      achievements: { ...current.achievements, [authUser.id]: snapshot.achievements },
      budgets: { ...current.budgets, [authUser.id]: snapshot.budgets },
      activeUserId: authUser.id,
    }));
    setReady(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await enterApp(session.user);
      else setReady(true);
    });
  }, []);

  const activeUser = data.users.find((user) => user.id === data.activeUserId) ?? null;
  if (!ready) return <div className="loading"><span className="loading-dot" />Memuat catatan Anda…</div>;

  return activeUser
    ? <Dashboard user={activeUser} data={data} setData={setData} />
    : <Auth onEnter={enterApp} />;
}

function ClayBlobs() { return <div className="clay-blobs" aria-hidden="true"><span /><span /><span /><span /></div>; }

function Auth({ onEnter }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    const cleanName = username.trim();
    if (cleanName.length < 3) return setMessage('Nama pengguna minimal 3 karakter.');
    if (password.length < 6) return setMessage('Kata sandi minimal 6 karakter.');

    const email = `${cleanName.toLowerCase()}@rapi.local`;
    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const { data: authData, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (/already registered|already exists/i.test(error.message)) setMessage('Nama pengguna sudah digunakan. Coba nama lain.');
          else if (error.code === 'weak_password' || /weak password|at least \d+ characters/i.test(error.message)) setMessage('Kata sandi terlalu lemah, gunakan minimal 6 karakter.');
          else if (error.code === 'over_request_rate_limit' || /rate limit/i.test(error.message)) setMessage('Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi ya.');
          else setMessage(`Pendaftaran gagal: ${error.message}`);
          return;
        }
        if (!authData.session) return setMessage('Akun berhasil dibuat. Silakan masuk.');
        onEnter(authData.user, cleanName);
        return;
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !authData.user) return setMessage('Nama pengguna atau kata sandi belum tepat.');
      onEnter(authData.user);
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(next) {
    setMode(next); setMessage(''); setUsername(''); setPassword('');
  }

  return <main className="auth-page clay-auth">
    <section className="auth-intro">
      <a className="brand" href="#top"><span>r</span> rapi</a>
      <div className="intro-copy">
        <p className="kicker">Rekap Arus Pengeluaran dan Income</p>
        <h1>Uang lebih tenang,<br /><em>hidup lebih lega.</em></h1>
        <p>Catat setiap pemasukan dan pengeluaran dengan cara yang sederhana, aman, dan sepenuhnya milik Anda.</p>
      </div>
      <div className="feature-note"><span>✦</span><div><strong>Pribadi di perangkat Anda</strong><small>Data tersimpan di browser ini saja.</small></div></div>
    </section>
    <section className="auth-panel" id="top">
      <ClayBlobs />
      <div className="form-wrap clay-card">
        <p className="welcome">{mode === 'login' ? 'Selamat datang kembali' : 'Mulai catatan baru'}</p>
        <h2>{mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun gratis'}</h2>
        <p className="form-description">{mode === 'login' ? 'Masukkan akun Anda untuk melanjutkan.' : 'Tidak perlu email, hanya butuh nama pengguna dan kata sandi.'}</p>
        <form onSubmit={submit}>
          <label>Nama pengguna<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" /></label>
          <label>Kata sandi<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {message && <p className="form-message" role="alert">{message}</p>}
          <button className="primary-button clay-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat akun'}{!isSubmitting && <span>→</span>}</button>
        </form>
        <p className="switch-form">{mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'} <button onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Buat akun' : 'Masuk'}</button></p>
        <p className="privacy">Untuk aplikasi demo, akun dan data disimpan lokal di perangkat ini.</p>
      </div>
    </section>
  </main>;
}

function Dashboard({ user, data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [levelUp, setLevelUp] = useState(null);
  const transactions = data.transactions[user.id] ?? [];
  const sortedTransactions = useMemo(() => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)), [transactions]);
  const visibleTransactions = filter === 'all' ? sortedTransactions : sortedTransactions.filter((item) => item.type === filter);
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;
  const goal = data.goals?.[user.id] ?? null;
  const achievements = data.achievements?.[user.id] ?? [];
  const goalReached = Boolean(goal && balance >= goal.amount);
  const budgets = data.budgets?.[user.id] ?? {};
  const monthKey = today.slice(0, 7);
  const monthExpenses = transactions.filter((item) => item.type === 'expense' && item.date.startsWith(monthKey));
  const budgetEntries = Object.entries(budgets);
  const spendingFor = (category) => monthExpenses.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0);
  const categorySummary = BUDGET_CATEGORIES.map((category) => ({ category, amount: spendingFor(category) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const topSpending = categorySummary[0];
  const chartMax = topSpending?.amount || 1;
  const uniqueDays = new Set(transactions.map((item) => item.date)).size;
  const badges = [
    transactions.length >= 1 && { icon: '🌱', title: 'Langkah pertama', note: 'Mulai mencatat!' },
    transactions.length >= 5 && { icon: '🔥', title: 'Rajin mencatat', note: '5 transaksi tercatat' },
    income > 0 && { icon: '💸', title: 'Cuan masuk', note: 'Pemasukan pertama' },
    uniqueDays >= 3 && { icon: '⚡', title: 'Konsisten', note: 'Catat di 3 hari berbeda' },
    achievements.length >= 1 && { icon: '🏆', title: 'Wishlist tercapai', note: `${achievements.length} impian berhasil` },
  ].filter(Boolean);

  async function addTransaction(transaction) {
    const xpEarned = hitungXpEarned(transaction, transactions, budgets);
    const previousLevel = user.level ?? 1;
    const totalXp = (user.xp ?? 0) + xpEarned;
    const newLevel = levelFromXp(totalXp);
    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, type: transaction.type, title: transaction.title, amount: transaction.amount, category: transaction.category, date: transaction.date, xp_earned: xpEarned })
      .select()
      .single();
    if (error || !inserted) return false;
    setData((current) => ({
      ...current,
      transactions: { ...current.transactions, [user.id]: [mapTransaction(inserted), ...(current.transactions[user.id] ?? [])] },
      users: current.users.map((item) => (item.id === user.id ? { ...item, xp: totalXp, level: newLevel } : item)),
    }));
    setShowForm(false);
    if (newLevel > previousLevel) setLevelUp({ level: newLevel, title: titleForLevel(newLevel), xpEarned });
    return true;
  }
  async function removeTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return;
    setData((current) => ({ ...current, transactions: { ...current.transactions, [user.id]: (current.transactions[user.id] ?? []).filter((item) => item.id !== id) } }));
  }
  async function logout() {
    await supabase.auth.signOut();
    setData((current) => ({ ...current, activeUserId: null }));
  }
  async function setGoal() {
    const name = window.prompt('Target apa yang ingin kamu capai?', goal?.name || 'Dana impian');
    if (!name?.trim()) return;
    const amount = Number(window.prompt('Berapa nominal targetnya? (contoh: 5000000)', goal?.amount || ''));
    if (!Number.isFinite(amount) || amount <= 0) return window.alert('Masukkan nominal target yang benar.');
    const existing = await supabase.from('goals').select('id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
    if (existing.data) await supabase.from('goals').update({ name: name.trim(), amount }).eq('id', existing.data.id);
    else await supabase.from('goals').insert({ user_id: user.id, name: name.trim(), amount });
    setData((current) => ({ ...current, goals: { ...current.goals, [user.id]: { name: name.trim(), amount } } }));
  }
  async function setBudget() {
    const category = window.prompt(`Pilih kategori: ${BUDGET_CATEGORIES.join(', ')}`);
    if (!category || !BUDGET_CATEGORIES.includes(category.trim())) return window.alert('Pilih kategori sesuai daftar yang tersedia.');
    const amount = Number(window.prompt(`Batas ${category.trim()} bulan ini?`, budgets[category.trim()] || ''));
    if (!Number.isFinite(amount) || amount <= 0) return window.alert('Masukkan nominal anggaran yang benar.');
    const { error } = await supabase.from('budgets').upsert({ user_id: user.id, category: category.trim(), monthly_limit: amount });
    if (error) return window.alert('Budget gagal disimpan. Coba lagi ya.');
    setData((current) => ({ ...current, budgets: { ...current.budgets, [user.id]: { ...(current.budgets?.[user.id] ?? {}), [category.trim()]: amount } } }));
  }
  async function claimGoal() {
    if (!goalReached || !window.confirm(`Klaim pencapaian “${goal.name}”? Kamu bisa membuat wishlist baru setelahnya.`)) return;
    await supabase.from('achievements').insert({ user_id: user.id, goal_name: goal.name, goal_amount: goal.amount, completed_at: today });
    await supabase.from('goals').update({ is_active: false }).eq('user_id', user.id).eq('is_active', true);
    setData((current) => ({ ...current, goals: { ...current.goals, [user.id]: null }, achievements: { ...current.achievements, [user.id]: [...(current.achievements?.[user.id] ?? []), { ...goal, id: crypto.randomUUID(), completedAt: today }] } }));
  }
  async function deleteAccount() {
    if (!window.confirm(`Hapus akun ${user.username} beserta seluruh catatan keuangannya? Tindakan ini tidak dapat dibatalkan.`)) return;
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    setData((current) => {
      const nextTransactions = { ...current.transactions };
      delete nextTransactions[user.id];
      const nextGoals = { ...current.goals }; delete nextGoals[user.id];
      const nextAchievements = { ...current.achievements }; delete nextAchievements[user.id];
      const nextBudgets = { ...current.budgets }; delete nextBudgets[user.id];
      return { users: current.users.filter((item) => item.id !== user.id), transactions: nextTransactions, goals: nextGoals, achievements: nextAchievements, budgets: nextBudgets, activeUserId: null };
    });
  }

  return <main className="dashboard-page">
    <ClayBlobs />
    <header className="topbar clay-topbar">
      <a className="brand dark" href="#dashboard"><span>r</span> rapi</a>
      <div className="account-menu"><span className="avatar">{user.username.slice(0, 1).toUpperCase()}</span><div><strong>{user.username}</strong><button className="logout-button clay-button" onClick={logout}>Keluar</button></div></div>
    </header>
    <div className="dashboard" id="dashboard">
      <section className="dashboard-heading clay-heading">
        <div><p className="kicker">RINGKASAN KEUANGAN</p><h1>Halo, {user.username}. <em>Bagaimana harimu?</em></h1><p className="subline">Semua catatanmu ada di satu tempat.</p></div>
        <button className="clay-button" onClick={() => setShowForm(true)}><span>+</span> Catat transaksi</button>
      </section>
      <section className="summary-grid">
        <BalanceCard balance={balance} xp={user.xp ?? 0} />
        <StatCard label="Pemasukan" amount={income} icon="↓" variant="income" />
        <StatCard label="Pengeluaran" amount={expense} icon="↑" variant="expense" />
      </section>
      <section className="playful-grid">
        <article className={`goal-card clay-card clay-goal ${goalReached ? 'goal-reached' : ''}`}><div><p className="kicker">{goalReached ? 'WISHLIST TERCAPAI! 🎉' : 'TARGET TABUNGAN'}</p><h2>{goal ? goal.name : 'Punya wishlist?'}</h2>{goal ? <><div className="goal-progress"><span style={{ width: `${Math.min(100, Math.max(0, balance / goal.amount * 100))}%` }} /></div><p className="goal-caption"><strong>{rupiah.format(Math.max(0, balance))}</strong> dari {rupiah.format(goal.amount)}</p></> : <p className="goal-caption">Buat target kecil agar menabung terasa lebih seru.</p>}</div>{goalReached ? <button className="claim-goal clay-button" onClick={claimGoal}>Klaim badge 🏆</button> : <button className="goal-button clay-button" onClick={setGoal}>{goal ? 'Ubah target' : '+ Buat target'}</button>}</article>
        <article className="badge-card clay-card clay-badge"><div className="badge-heading"><div><p className="kicker">KOLEKSI BADGE</p><h2>Good job, bestie! ✨</h2></div><span>{badges.length}/4</span></div><div className="badges">{badges.length ? badges.map((badge) => <div className="badge" key={badge.title}><span>{badge.icon}</span><div><strong>{badge.title}</strong><small>{badge.note}</small></div></div>) : <p className="badge-empty">Catat transaksi pertamamu untuk membuka badge.</p>}</div></article>
      </section>
      <section className="insight-section clay-insight"><div className="section-header"><div><h2>Money check-in</h2><p>Snapshot bulan ini, bestie 💫</p></div></div><div className="insight-grid"><article className="insight-card clay-card"><span>💡</span><div><p className="kicker">{topSpending ? 'Paling banyak di sini' : 'Money check-in'}</p><strong>{topSpending ? `${CATEGORY_EMOJI[topSpending.category]} ${topSpending.category}` : 'Belum ada pengeluaran'}</strong>{topSpending && <span className="insight-amount">{rupiah.format(topSpending.amount)}</span>}<p className="insight-caption">{topSpending ? 'Terpakai untuk kategori ini sejauh ini.' : 'Mulai catat transaksi untuk melihat insight personal.'}</p></div></article><article className="chart-card clay-card"><div className="chart-title"><strong>Pengeluaran per kategori</strong><span>Bulan ini</span></div>{categorySummary.length ? <div className="chart-bars">{categorySummary.map((item) => <div className="chart-row" key={item.category}><span>{CATEGORY_EMOJI[item.category]}</span><div><div><strong>{item.category}</strong><b>{rupiah.format(item.amount)}</b></div><i><em style={{ width: `${item.amount / chartMax * 100}%` }} /></i></div></div>)}</div> : <p className="chart-empty">Grafik akan muncul setelah ada pengeluaran.</p>}</article></div></section>
      <section className="budget-section clay-budget"><div className="section-header"><div><h2>Budget bulan ini</h2><p>Jaga pengeluaran tetap on track ✨</p></div><button className="budget-add clay-button" onClick={setBudget}>+ Atur budget</button></div>{budgetEntries.length ? <div className="budget-grid">{budgetEntries.map(([category, limit]) => { const spent = spendingFor(category); const ratio = spent / limit; const state = ratio >= 1 ? 'over' : ratio >= .8 ? 'near' : 'safe'; return <article className="budget-item clay-card" key={category}><div><span>{CATEGORY_EMOJI[category]}</span><strong>{category}</strong><button onClick={setBudget} aria-label={`Ubah budget ${category}`}>⋯</button></div><div className="budget-bar"><span className={state} style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div><p><b>{rupiah.format(spent)}</b> / {rupiah.format(limit)} <em>{state === 'over' ? 'Kelebihan!' : state === 'near' ? 'Hampir habis' : 'Aman'}</em></p></article>; })}</div> : <div className="budget-empty"><span>🪄</span><div><strong>Belum ada budget</strong><p>Tentukan batas pengeluaran untuk kategori favoritmu.</p></div><button className="clay-button" onClick={setBudget}>Buat budget</button></div>}</section>
      <section className="transactions-section clay-transactions">
        <div className="section-header"><div><h2>Riwayat transaksi</h2><p>{transactions.length} transaksi tercatat</p></div><div className="filters">{[['all', 'Semua'], ['income', 'Masuk'], ['expense', 'Keluar']].map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div></div>
        <div className="transaction-list">
          {visibleTransactions.length ? visibleTransactions.map((item) => <Transaction key={item.id} item={item} onDelete={removeTransaction} />) : <EmptyState filter={filter} onAdd={() => setShowForm(true)} />}
        </div>
      </section>
      <section className="danger-zone clay-danger"><div><strong>Hapus akun</strong><p>Seluruh transaksi pada akun ini akan dihapus permanen dari perangkat.</p></div><button className="danger-button clay-button" onClick={deleteAccount}>Hapus akun</button></section>
    </div>
    {showForm && <TransactionForm onClose={() => setShowForm(false)} onSubmit={addTransaction} />}
    {levelUp && <LevelUpModal {...levelUp} onClose={() => setLevelUp(null)} />}
  </main>;
}

function BalanceCard({ balance, xp }) {
  const info = levelProgress(xp);
  return <article className="balance-card clay-card"><div><p>Saldo saat ini</p><strong>{rupiah.format(balance)}</strong><small>{balance >= 0 ? 'Keuanganmu terlihat terjaga.' : 'Pengeluaran melebihi pemasukan.'}</small><div className="level-strip"><div className="level-chip"><b>Lv {info.level}</b><span>{info.title}</span></div><div className="level-bar" role="progressbar" aria-valuenow={info.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress XP menuju level ${info.level + 1}`}><span style={{ width: `${info.percent}%` }} /></div><small>{info.xpIntoLevel}/{info.xpForNextLevel} XP menuju Lv {info.level + 1}</small></div></div><div className="balance-mark">Rp</div></article>;
}
function StatCard({ label, amount, icon, variant }) { return <article className={`stat-card clay-card ${variant}`}><span className={`stat-icon ${variant}`}>{icon}</span><div><p>{label}</p><strong>{rupiah.format(amount)}</strong><small>{variant === 'income' ? 'Total uang masuk' : 'Total uang keluar'}</small></div></article>; }

function Transaction({ item, onDelete }) {
  const income = item.type === 'income';
  return <article className="transaction clay-card"><span className={`transaction-icon ${income ? 'income' : 'expense'}`}>{CATEGORY_EMOJI[item.category] || '✨'}</span><div className="transaction-info"><strong>{item.title}</strong><span>{item.category} <i>•</i> {dateFormatter.format(new Date(`${item.date}T00:00:00`))}</span></div><strong className={income ? 'amount income-text' : 'amount expense-text'}>{income ? '+' : '−'} {rupiah.format(item.amount)}</strong><button className="delete-transaction" aria-label={`Hapus ${item.title}`} onClick={() => onDelete(item.id)}>×</button></article>;
}

function EmptyState({ filter, onAdd }) { return <div className="empty"><span>⌁</span><h3>{filter === 'all' ? 'Belum ada transaksi' : 'Tidak ada transaksi di kategori ini'}</h3><p>{filter === 'all' ? 'Mulai catat pemasukan atau pengeluaran pertamamu.' : 'Coba pilih filter lain atau tambahkan transaksi baru.'}</p>{filter === 'all' && <button className="empty-button clay-button" onClick={onAdd}>Catat transaksi</button>}</div>; }

function TransactionForm({ onClose, onSubmit }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(today);
  const [message, setMessage] = useState('');
  const categories = type === 'income' ? ['Gaji', 'Bonus', 'Usaha', 'Investasi', 'Lainnya'] : ['Makan & Minum', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya'];
  async function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim() || !category || !date || !Number.isFinite(numericAmount) || numericAmount <= 0) return setMessage('Lengkapi semua data transaksi dengan benar.');
    const saved = await onSubmit({ title: title.trim(), amount: numericAmount, category, date, type });
    if (!saved) setMessage('Transaksi gagal tersimpan. Coba lagi ya.');
  }
  return <div className="modal-backdrop clay-modal" role="presentation" onMouseDown={onClose}><section className="modal clay-card" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label="Tutup">×</button><p className="kicker">TRANSAKSI BARU</p><h2 id="form-title">Catat aktivitas keuangan</h2><form onSubmit={submit}><div className="type-switch"><button type="button" className={type === 'expense' ? 'selected expense' : ''} onClick={() => { setType('expense'); setCategory(''); }}>Pengeluaran</button><button type="button" className={type === 'income' ? 'selected income' : ''} onClick={() => { setType('income'); setCategory(''); }}>Pemasukan</button></div><label>Nama transaksi<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'income' ? 'Contoh: Gaji bulanan' : 'Contoh: Makan siang'} /></label><label>Nominal<input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Contoh: 50000" /></label><div className="form-pair"><label>Kategori<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Pilih kategori</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Tanggal<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="ghost-button clay-button" type="button" onClick={onClose}>Batal</button><button className="primary-button clay-button" type="submit">Simpan transaksi <span>→</span></button></div></form></section></div>;
}
