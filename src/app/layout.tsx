import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jurnal - Back Office Daily Task Manager & Dashboard',
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
      </head>
      <body>{children}</body>
    </html>
  );
}
