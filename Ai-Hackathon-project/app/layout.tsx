import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daymark | Your world, clearly delivered.',
  description: 'A personalized digital morning newspaper inspired by modern editorial broadsheets, curated from premier global news sources.',
  keywords: ['Daymark', 'personalized newspaper', 'morning dispatch', 'news broadsheet', 'NaSCon 26'],
  authors: [{ name: 'Daymark Editorial Board' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-ivory-100 text-charcoal-900 selection:bg-forest-100 selection:text-forest-900">
        {children}
      </body>
    </html>
  );
}
