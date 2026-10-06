
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registrado correctamente:', reg.scope))
        .catch((err) => console.error('Error al registrar Service Worker:', err));
    }
  }, []);

  return null;
}