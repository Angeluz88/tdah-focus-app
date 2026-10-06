// public/sw.js - Service Worker para Notificaciones Push Anti-Olvido

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Manejo de eventos Push entrantes del servidor
self.addEventListener('push', (event) => {
  let data = {
    title: '⏰ Recordatorio de Enfoque',
    body: 'Es hora de retomar tu micro-paso.',
    taskId: null,
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100], // Patrón háptico suave de aviso
    tag: data.taskId ? `task-${data.taskId}` : 'adhd-notification',
    renotify: true,
    data: {
      taskId: data.taskId,
      url: data.taskId ? `/focus?taskId=${data.taskId}` : '/focus',
    },
    actions: [
      { action: 'start', title: '▶ Empezar Bloque' },
      { action: 'snooze', title: '⏳ +10 Minutos' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejo de clics en la notificación o sus botones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { taskId, url } = event.notification.data || {};

  if (event.action === 'start') {
    // Abre directamente el modo enfoque con inicio automático
    event.waitUntil(
      clients.openWindow(`/focus?taskId=${taskId || ''}&autoStart=true`)
    );
  } else if (event.action === 'snooze') {
    // Notifica al endpoint para posponer la alerta 10 minutos
    event.waitUntil(
      fetch(`/api/tasks/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
    );
  } else {
    // Clic en el cuerpo de la notificación
    event.waitUntil(clients.openWindow(url || '/focus'));
  }
});