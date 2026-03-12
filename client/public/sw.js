// Service Worker for caching images and videos
const CACHE_NAME = 'vote-cache-v1';
const STATIC_CACHE = 'vote-static-v1';

// Assets to cache on install
const CACHE_ASSETS = [
  '/bilder/assets_task_01jr7m94hseeqad46rhaa8vhrq_img_0.webp',
  '/bilder/smart_gnome.png',
  '/bilder/images/siu.png',
  '/bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp',
  '/bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp',
  '/bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp',
  '/bilder/GnomeSitting.png',
  '/bilder/Villiage.png',
  '/bilder/Nøkken.png',
  '/bilder/Troll.png',
  '/bilder/HorseAndGirl.png',
  '/bilder/Pesta.png',
  '/bilder/1.webp',
  '/bilder/3.webp',
  '/images/Vote_V.png',
  '/images/Vote_O.png',
  '/car.glb',
  '/vr_headset.glb',
  '/weta_cave_troll_william (1).glb'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(CACHE_ASSETS);
      })
  );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Only cache GET requests
  if (request.method !== 'GET') return;
  
  // Check if it's an image, video, or 3D model
  const isMedia = request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|glb|gltf)$/i);
  
  if (isMedia) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          // Return cached version if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network and cache
          return fetch(request).then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
            
            return response;
          });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
