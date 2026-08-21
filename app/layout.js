import './globals.css';
import './clay.css';

export const metadata = {
  title: 'Rapi | Catatan Keuangan',
  description: 'Catatan keuangan pribadi yang sederhana dan rapi.',
};

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return <html lang="id"><body>{children}</body></html>;
}
