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
        <link rel="icon" href="/biw-logo.jpeg" />
        <link rel="apple-touch-icon" href="/biw-logo.jpeg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
