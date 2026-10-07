// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Timer, BarChart3, Gift, CheckSquare, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Ocultar Navbar en la pantalla de login
  if (pathname === '/login') return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const links = [
    { href: '/focus', label: 'Enfoque', icon: Timer },
    { href: '/dashboard/tasks', label: 'Tareas', icon: CheckSquare },
    { href: '/dashboard', label: 'Récords', icon: BarChart3 },
    { href: '/rewards', label: 'Tienda', icon: Gift },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 p-3 z-50 flex justify-around items-center max-w-md mx-auto rounded-t-2xl md:top-0 md:bottom-auto md:rounded-none md:max-w-none md:border-b md:border-t-0">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col md:flex-row items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl font-medium text-xs md:text-sm transition ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={handleSignOut}
        className="flex flex-col md:flex-row items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl font-medium text-xs md:text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
        title="Cerrar sesión"
      >
        <LogOut className="w-5 h-5" />
        <span>Salir</span>
      </button>
    </nav>
  );
}