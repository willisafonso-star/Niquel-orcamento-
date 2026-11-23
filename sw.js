// Cache simples: o app abre mesmo sem internet.
// Com internet, o app sempre busca a versão mais recente; o cache só entra quando está offline.
var CACHE='orcamento-v1';
var FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r&&(r.ok||r.type==='opaque')){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp)})}
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){return m||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error())});
    })
  );
});
