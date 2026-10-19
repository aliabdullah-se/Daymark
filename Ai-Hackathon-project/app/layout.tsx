import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'DAYMARK | Your world, clearly delivered.',
  description: 'A personalized digital morning newspaper inspired by modern editorial broadsheets, curated from premier global news sources.',
  keywords: ['DAYMARK', 'personalized newspaper', 'morning newspaper', 'news broadsheet', 'editorial curation'],
  authors: [{ name: 'DAYMARK Editorial Board' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
