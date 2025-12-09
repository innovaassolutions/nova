import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nova CRM',
  description: 'LinkedIn-first CRM for INNOVAAS sales team',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
