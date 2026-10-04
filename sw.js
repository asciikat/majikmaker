'use strict';
const CACHE_NAME='majikmaker-v3';
const ASSETS=['./index.html','./styles.css','./symbol.js','./app.js','./install.js','./sample-home.jpg','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'];
const assetUrls=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('majikmaker-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   try{
    const response=await fetch(request);
    if(response.ok&&!response.redirected&&response.type==='basic')await cache.put(new URL('./index.html',self.registration.scope).href,response.clone());
    return response;
   }catch(error){
    const cached=await cache.match(new URL('./index.html',self.registration.scope).href);
    if(cached)return cached;
    return new Response('Majik Maker needs one successful online visit before it can open offline.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
   }
  })());
  return;
 }
 if(!assetUrls.has(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok&&!response.redirected)await cache.put(request,response.clone());
  return response;
 })());
});
