import './globals.css';
import './clay.css';

export const metadata = {
  title: 'Rapi | Catatan Keuangan',
  description: 'Catatan keuangan pribadi yang sederhana dan rapi.',
};

export default function RootLayout({ children }) {
  return <html lang="id"><body>{children}</body></html>;
}
