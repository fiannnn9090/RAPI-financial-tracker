/* Export PDF laporan transaksi — jsPDF di-import dinamis (lazy chunk),
   tabel digambar manual tanpa dependency tambahan. */

const RP = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

function fitText(doc, value, maxW) {
  let s = String(value ?? '');
  if (!s) return s;
  if (doc.getTextWidth(s) <= maxW) return s;
  while (s.length > 1 && doc.getTextWidth(`${s}…`) > maxW) s = s.slice(0, -1);
  return `${s}…`;
}

export async function exportPdf({ transactions, rangeLabel, fileName }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = 595;
  const M = 40;

  const income = transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const net = income - expense;

  const INK = [20, 20, 20];
  const MUTED = [110, 105, 96];
  const GREEN = [0, 140, 100];
  const RED = [214, 41, 90];

  /* Header brand */
  doc.setFillColor(...INK);
  doc.rect(M, 44, 14, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('rapi.', M + 20, 56);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const generated = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Dibuat ${generated}`, W - M, 54, { align: 'right' });

  /* Subjudul periode */
  let y = 84;
  doc.setDrawColor(...INK);
  doc.line(M, y - 18, W - M, y - 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(`Laporan Transaksi — ${rangeLabel}`, M, y);

  /* Ringkasan */
  y += 16;
  const boxW = (W - M * 2 - 20) / 3;
  const boxes = [
    ['Total Masuk', RP.format(income)],
    ['Total Keluar', RP.format(expense)],
    ['Selisih', `${net < 0 ? '-' : ''}${RP.format(Math.abs(net))}`],
  ];
  boxes.forEach(([label, value], i) => {
    const x = M + i * (boxW + 10);
    doc.setFillColor(255, 249, 239);
    doc.setDrawColor(...INK);
    doc.setLineWidth(1);
    doc.rect(x, y, boxW, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x + 10, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(value, x + 10, y + 38);
  });
  y += 66;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`${transactions.length} transaksi tercatat pada rentang ini`, M, y);

  /* Tabel transaksi */
  y += 24;
  const cols = [
    { label: 'Tanggal', x: 40, w: 62 },
    { label: 'Kategori', x: 102, w: 96 },
    { label: 'Judul', x: 198, w: 205 },
    { label: 'Tipe', x: 403, w: 52 },
  ];
  const nominalRight = W - M;
  const rowH = 20;
  const pageBottom = 780;

  function drawTableHeader() {
    doc.setFillColor(...INK);
    doc.rect(M, y, W - M * 2, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    cols.forEach(({ label, x }) => doc.text(label.toUpperCase(), x + 6, y + 13));
    doc.text('NOMINAL', nominalRight - 6, y + 13, { align: 'right' });
    y += 20;
  }
  drawTableHeader();

  for (let i = 0; i < transactions.length; i++) {
    if (y + rowH > pageBottom) {
      doc.addPage();
      y = 60;
      drawTableHeader();
    }
    const tx = transactions[i];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    cols.forEach(({ x, w }, c) => {
      const raw = c === 3 ? (tx.type === 'income' ? 'Masuk' : 'Keluar') : String(tx[c === 0 ? 'date' : c === 1 ? 'category' : 'title'] ?? '');
      doc.text(fitText(doc, raw, w - 12), x + 6, y + 13);
    });
    const isIncome = tx.type === 'income';
    doc.setTextColor(...(isIncome ? GREEN : RED));
    doc.text(`${isIncome ? '+' : '-'}${RP.format(tx.amount).replace('Rp', 'Rp')}`, nominalRight - 6, y + 13, { align: 'right' });
    doc.setDrawColor(225, 220, 210);
    doc.setLineWidth(0.5);
    doc.line(M, y + rowH, W - M, y + rowH);
    y += rowH;
  }

  /* Footer nomor halaman */
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Halaman ${p} dari ${total} · dibuat dengan rapi ✨`, W / 2, 820, { align: 'center' });
  }

  doc.save(`${fileName}.pdf`);
}
