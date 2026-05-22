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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
