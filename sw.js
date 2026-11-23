const CACHE_PREFIX='pocket-oddities-v';
const CACHE=CACHE_PREFIX+'18';
const PRECACHE=['./','./index.html','./styles.css','./games.js','./achievements.js','./game-packs/echo-tiles.js','./game-packs/circuit-garden.js','./game-packs/moon-mail-sorter.js','./game-packs/fossil-forecast.js','./game-packs/orbit-locksmith.js','./game-packs/fossil-field.js','./game-packs/ghost-gallery.js','./game-packs/lantern-logic.js','./game-packs/cloud-shepherd.js','./game-packs/ink-tide.js','./game-packs/potion-scale.js','./game-packs/pocket-elevator.js','./game-packs/star-cartographer.js','./game-packs/clockwork-crossing.js','./game-packs/mirror-courier.js','./game-packs/glyph-census.js','./game-packs/paper-fold-postcards.js','./game-packs/meteor-gate.js','./game-packs/river-rules.js','./game-packs/counterweight-courier.js','./game-packs/clockwork-auction.js','./game-packs/compass-caravan.js','./game-packs/museum-restoration.js','./game-packs/raincatcher-radio.js','./game-packs/tidal-switchboard.js','./game-packs/knot-garden.js','./game-packs/tiny-weather-bureau.js','./game-packs/bubble-wrap-relay.js','./game-packs/mirror-moth.js','./game-packs/parcel-parity.js','./game-packs/prime-parade.js','./game-packs/color-customs.js','./game-packs/compass-courier.js','./game-packs/quiet-quarry.js','./game-packs/morse-moths.js','./game-packs/pulse-post.js','./game-packs/orbit-salvage.js','./game-packs/crate-carousel.js','./game-packs/thread-needle.js','./game-packs/balance-beam.js','./game-packs/ferry-fiasco.js','./game-packs/paper-bridge.js','./game-packs/clockwork-queue.js','./game-packs/moonphase-studio.js','./game-packs/postage-panic.js','./game-packs/parcel-pathways.js','./game-packs/semaphore-station.js','./game-packs/gravity-post.js','./game-packs/firefly-orchard.js','./game-packs/anagram-atelier.js','./game-packs/pebble-skipper.js','./game-packs/forgery-finder.js','./game-packs/archive-alibi.js','./game-packs/tea-timer-trio.js','./game-packs/static-safari.js','./game-packs/puddle-painter.js','./game-packs/lantern-switchboard.js','./game-packs/queue-curator.js','./game-packs/clockwork-compass.js','./game-packs/firefly-census.js','./game-packs/carousel-mosaic.js','./game-packs/shadow-stamp.js','./game-packs/parcel-parity-manifests.js','./game-packs/umbrella-parade.js','./game-packs/switchyard-signals.js','./game-packs/pocket-thermostat.js','./game-packs/orbit-harvest.js','./game-packs/postcard-glider.js','./game-packs/gravity-mail-maze.js','./game-packs/telescope-focus.js','./game-packs/museum-dust.js','./game-packs/anagram-attic.js','./game-packs/constellation-stitch.js','./game-packs/quiet-library.js','./game-packs/rain-ledger.js','./game-packs/magnet-orchard.js','./manifest.webmanifest','./assets/icon.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(PRECACHE);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    const obsolete=keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE);
    await Promise.all(obsolete.map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
// Network first means freshly published games and fixes are visible without a
// manual cache bump. Any successfully fetched new game pack is saved offline.
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request);
      if(response.ok){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));
      }
      return response;
    }catch{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(event.request);
      if(cached)return cached;
      if(event.request.mode==='navigate'){
        const home=await cache.match('./index.html');
        if(home)return home;
      }
      return new Response('You are offline. This game has not been downloaded yet.',{status:503,headers:{'Content-Type':'text/plain'}});
    }
  })());
});
