
const CACHE_NAME = 'nikah-connect-v1.0.0';
const STATIC_CACHE = 'nikah-connect-static-v1.0.0';
const DYNAMIC_CACHE = 'nikah-connect-dynamic-v1.0.0';
const API_CACHE = 'nikah-connect-api-v1.0.0';

// Ressources critiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/src/main.tsx',
  '/src/index.css'
];

// URLs d'API à mettre en cache
const API_URLS = [
  'https://huozosbrlxayjkvakptu.supabase.co/rest/v1/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ne pas intercepter les requêtes WebSocket
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }
  
  // Stratégie pour les assets statiques
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Stratégie pour les APIs
  if (API_URLS.some(apiUrl => request.url.includes(apiUrl))) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // Stratégie pour les images
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }
  
  // Stratégie par défaut
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Stratégie Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Mettre à jour en arrière-plan
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {});
      
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First Error:', error);
    return await caches.match('/offline.html');
  }
}

// Stratégie Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache...');
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return await caches.match('/offline.html');
  }
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage({ type: 'CACHE_STATS', data: stats });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCache(event.data.cacheName).then(success => {
      event.ports[0].postMessage({ type: 'CACHE_CLEARED', success });
    });
  }
});

// Statistiques du cache
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}

// Nettoyage du cache
async function clearCache(cacheName) {
  try {
    if (cacheName) {
      return await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return true;
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
}

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
  // Synchroniser les données en attente
  try {
    // Logique de synchronisation
    await syncPendingData();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncPendingData() {
  // Récupérer les données en attente depuis IndexedDB
  // Envoyer vers l'API
  // Nettoyer les données synchronisées
}
