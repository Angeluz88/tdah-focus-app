'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer, BarChart3, Gift } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/focus', label: 'Enfoque', icon: Timer },
    { href: '/dashboard', label: 'Récords', icon: BarChart3 },
    { href: '/rewards', label: 'Tienda', icon: Gift },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 p-3 z-50 flex justify-around max-w-md mx-auto rounded-t-2xl md:top-0 md:bottom-auto md:rounded-none md:max-w-none">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col md:flex-row items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-xs md:text-sm transition ${
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
    </nav>
  );
}