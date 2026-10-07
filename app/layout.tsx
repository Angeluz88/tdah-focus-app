// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

// Inicialización de fuentes
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Focus App | Gestión de Tareas TDAH para Adultos',
  description: 'Aplicación de tareas y enfoque Pomodoro diseñada para reducir la carga cognitiva y potenciar la productividad con TDAH.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617', // slate-950
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <ServiceWorkerRegister />
        <div className="relative flex min-h-screen flex-col bg-slate-950">
          <Navbar />
          <main className="flex-1 bg-slate-950 pb-24 md:pb-12 md:pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}