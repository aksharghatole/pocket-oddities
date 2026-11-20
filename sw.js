const CACHE='pocket-oddities-v16';
const PRECACHE=['./','./index.html','./styles.css','./games.js','./achievements.js','./game-packs/echo-tiles.js','./game-packs/circuit-garden.js','./game-packs/moon-mail-sorter.js','./game-packs/fossil-forecast.js','./game-packs/orbit-locksmith.js','./game-packs/fossil-field.js','./game-packs/ghost-gallery.js','./game-packs/lantern-logic.js','./game-packs/cloud-shepherd.js','./game-packs/ink-tide.js','./game-packs/potion-scale.js','./game-packs/pocket-elevator.js','./game-packs/star-cartographer.js','./game-packs/glyph-census.js','./manifest.webmanifest','./assets/icon.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
// Network first means freshly published games and fixes are visible without a
// manual cache bump. Any successfully fetched new game pack is saved offline.
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request);
      if(response.ok){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));
      }
      return response;
    }catch{
      const cached=await caches.match(event.request);
      if(cached)return cached;
      if(event.request.mode==='navigate'){
        const home=await caches.match('./index.html');
        if(home)return home;
      }
      return new Response('You are offline. This game has not been downloaded yet.',{status:503,headers:{'Content-Type':'text/plain'}});
    }
  })());
});
