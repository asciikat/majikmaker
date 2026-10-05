const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
function setup(){
 const handlers={},scope='https://example.test/majikmaker/',stored=new Map(),cacheNames=['other-app-v1','majikmaker-v0',source.match(/CACHE_NAME='([^']+)'/)[1]],deleted=[];
 const key=x=>new URL(typeof x==='string'?x:x.url,scope).href;
 const cache={async addAll(paths){for(const p of paths)stored.set(key(p),new Response(p));},async match(req){return stored.get(key(req))?.clone();},async put(req,res){stored.set(key(req),res.clone());}};
 let network=true,requests=0,skipped=false,claimed=false;
 const context={URL,Response,Set,Promise,caches:{open:async()=>cache,keys:async()=>cacheNames,delete:async name=>{deleted.push(name);return true;}},fetch:async req=>{requests++;if(!network)throw Error('offline');return new Response('network response');},self:{registration:{scope},location:{origin:'https://example.test'},addEventListener(name,fn){handlers[name]=fn;},skipWaiting(){skipped=true;},clients:{claim(){claimed=true;}}}};
 vm.runInNewContext(source,context);
 async function lifecycle(name){let done;handlers[name]({waitUntil(p){done=p;}});await done;}
 async function fetch(url,mode='cors',method='GET'){let response;handlers.fetch({request:{url:new URL(url,scope).href,mode,method},respondWith(p){response=p;}});return response===undefined?undefined:await response;}
 return {lifecycle,fetch,stored,deleted,get requests(){return requests;},set offline(v){network=!v;},get skipped(){return skipped;},get claimed(){return claimed;}};
}
test('installation precaches all app assets; activation only removes its older caches',async()=>{
 const s=setup();await s.lifecycle('install');await s.lifecycle('activate');
 assert.ok(s.skipped);assert.ok(s.claimed);assert.deepEqual(s.deleted,['majikmaker-v0']);
 assert.ok(s.stored.has('https://example.test/majikmaker/index.html'));
 for(const url of s.stored.keys())assert.ok(fs.existsSync(path.join(__dirname,'..',new URL(url).pathname.replace('/majikmaker/',''))),`Missing ${url}`);
});
test('offline navigation at a project subpath opens the cached app shell',async()=>{
 const s=setup();await s.lifecycle('install');s.offline=true;
 const response=await s.fetch('./','navigate');assert.equal(response.status,200);assert.equal(await response.text(),'./index.html');
 const script=await s.fetch('symbol.js?v=4');assert.equal(await script.text(),'./symbol.js?v=4');
});
test('service worker leaves external, out-of-scope, and non-GET requests alone',async()=>{
 const s=setup();
 assert.equal(await s.fetch('https://elsewhere.test/photo.jpg'),undefined);
 assert.equal(await s.fetch('https://example.test/another-app/','navigate'),undefined);
 assert.equal(await s.fetch('index.html','cors','POST'),undefined);
 assert.equal(s.requests,0);
});
test('first-ever offline opening returns a clear 503 rather than a broken shell',async()=>{
 const s=setup();s.offline=true;const response=await s.fetch('./','navigate');assert.equal(response.status,503);assert.match(await response.text(),/successful online visit/);
});
test('manifest uses portable relative paths and supplied icon dimensions',()=>{
 const root=path.join(__dirname,'..');const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');
 for(const icon of manifest.icons){const data=fs.readFileSync(path.join(root,icon.src));const [w,h]=icon.sizes.split('x').map(Number);assert.equal(data.readUInt32BE(16),w);assert.equal(data.readUInt32BE(20),h);}
});
