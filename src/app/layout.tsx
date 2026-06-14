import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BIW - Back Office Tracking System',
  description: 'Premium real-time task manager and schedule planner for back office coordination and owner inspection.',
};

export default function RootLayout({
  children,
  
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/WhatsApp Image 2026-06-14 at 13.09.38.jpeg" />
        <link rel="apple-touch-icon" href="/WhatsApp Image 2026-06-14 at 13.09.38.jpeg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
