import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Morning Chronicle | Your Personalized Digital Broadsheet',
  description: 'An AI-ranked, editorial morning newspaper tailored to your personal interests, curated from leading global publications.',
  keywords: ['personalized newspaper', 'morning edition', 'news aggregator', 'editorial broadsheet', 'NaSCon 26'],
  authors: [{ name: 'Morning Chronicle Editorial Board' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-amber-200 selection:text-ink-900">
        {children}
      </body>
    </html>
  );
}
