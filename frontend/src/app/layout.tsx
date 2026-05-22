import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Generate high-quality structured school exam question papers and answer keys in seconds using AI.',
  keywords: ['VedaAI', 'AI Assessment Creator', 'Question Paper Generator', 'Exam Maker', 'Teacher Tools']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.className} style={{ colorScheme: 'light' }}>
      <head>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
