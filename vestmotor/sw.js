const CACHE = 'vestmotor-v1';
const ASSETS = [
  '/vestmotor/index.html',
  '/vestmotor/cars.html',
  '/vestmotor/car.html',
  '/vestmotor/services.html',
  '/vestmotor/about.html',
  '/vestmotor/contact.html',
  '/vestmotor/assets/css/main.css',
  '/vestmotor/assets/js/main.js',
  '/vestmotor/assets/js/data/cars.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(request, copy));
      return resp;
    }).catch(()=>cached))
  );
});
