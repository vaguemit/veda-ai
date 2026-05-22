import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
