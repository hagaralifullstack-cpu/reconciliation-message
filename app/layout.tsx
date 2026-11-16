import type { Metadata } from 'next';
import { Amiri, Readex_Pro } from 'next/font/google';
import './globals.css';

const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-readex',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'رسالة صلح | اعتذار صادق من القلب',
  description: 'رحلة اعتذار وعتاب محترمة وتفاعلية بالعامية المصرية تنتهي بشهادة صلح.',
  openGraph: {
    title: 'رسالة صلح | اعتذار صادق من القلب',
    description: 'رحلة اعتذار وعتاب محترمة وتفاعلية بالعامية المصرية تنتهي بشهادة صلح.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'رسالة صلح | اعتذار صادق من القلب',
    description: 'رحلة اعتذار وعتاب محترمة وتفاعلية بالعامية المصرية تنتهي بشهادة صلح.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${readexPro.variable} ${amiri.variable}`}>
      <body
        suppressHydrationWarning
        className="font-sans-ar bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900"
      >
        {children}
      </body>
    </html>
  );
}
