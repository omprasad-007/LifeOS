import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/providers/AuthProvider';
import FirebaseInit from '@/components/providers/FirebaseInit';

export const metadata: Metadata = {
  title: 'LifeOS by AnOS — Your AI-Powered Life Assistant',
  description: 'Unify tasks, notes, reminders, and calendar into one intelligent workspace with autonomous AI daily planning. Made by AnOS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-sans antialiased min-h-screen text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-600">
        <AuthProvider>
          <FirebaseInit />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
