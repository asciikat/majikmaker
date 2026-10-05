'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const {chromium}=require('playwright');

(async()=>{
 const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:'4173',MAJIKMAKER_BASE_PATH:'/majikmaker/',MAJIKMAKER_STATIC_DIRECTORY:'dist'},stdio:['ignore','pipe','pipe']});
 let browser;
 try{
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Server startup timed out')),15000);
   server.stdout.on('data',data=>{if(String(data).includes('http://127.0.0.1:4173')){clearTimeout(timer);resolve();}});
   server.on('error',reject);server.on('exit',code=>{if(code)reject(Error('Server exited: '+code));});
  });
  browser=await chromium.launch({headless:true});
  // Model a returning v3 installation whose worker still serves its old plain app.js.
  // Keep this context isolated, and restore the deployment artifact before the main tests.
  const workerPath='dist/sw.js',currentWorker=await fs.readFile(workerPath);
  const returning=await browser.newContext({viewport:{width:1280,height:900}});
  try{
   await fs.writeFile(workerPath,`const cacheName='majikmaker-v3';
const oldApp=new URL('./app.js',self.registration.scope).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(cacheName).then(cache=>cache.put(oldApp,new Response('throw Error("STALE_V3_APP")',{headers:{'Content-Type':'text/javascript'}}))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.url===oldApp)event.respondWith(caches.open(cacheName).then(cache=>cache.match(event.request)));});`);
   const returningPage=await returning.newPage(),returningErrors=[];
   returningPage.on('pageerror',error=>returningErrors.push(error.message));
   await returningPage.goto('http://127.0.0.1:4173/majikmaker/');
   await returningPage.evaluate(async()=>{await navigator.serviceWorker.ready;});
   await returningPage.waitForFunction(()=>!!navigator.serviceWorker.controller);
   assert.match(await returningPage.evaluate(async()=>await (await fetch('app.js')).text()),/STALE_V3_APP/);
   await returningPage.reload();
   assert.match(await returningPage.evaluate(async()=>await (await fetch('app.js')).text()),/STALE_V3_APP/);
   await returningPage.locator('#intention').fill('I can draw my new intention.');
   await returningPage.locator('#generateButton').click();
   await returningPage.locator('#downloadPng').waitFor({state:'visible'});
   assert.equal(await returningPage.locator('#drawingGuide').isVisible(),true);
   assert.deepEqual(returningErrors,[],'Versioned assets must bypass the stale v3 script cache');
  }finally{
   await fs.writeFile(workerPath,currentWorker);
   await returning.close();
  }
  const context=await browser.newContext({viewport:{width:1440,height:1080},acceptDownloads:true});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const chooseMethod=async value=>page.locator(`label:has(input[name="method"][value="${value}"])`).click();
  const openImage=async()=>{if(!await page.locator('details.image-details').evaluate(element=>element.open))await page.locator('details.image-details > summary').click();};
  const generate=async()=>{
   await page.locator('#generateButton').click();
   await page.locator('#downloadPng').waitFor({state:'visible'});
   assert.doesNotMatch(await page.locator('#symbolArt').innerHTML(),/NaN|Infinity|undefined/);
  };
  const settle=async()=>{
   await page.locator('#symbolArt').evaluate(async element=>{await Promise.all(element.getAnimations().map(animation=>animation.finished));});
   await page.locator('#toast').waitFor({state:'hidden'});
  };
  const assertGuide=async()=>{
   assert.equal(await page.locator('#drawingGuide').isVisible(),true);
   const paths=await page.locator('#symbolArt svg path').count();
   assert.ok(paths>=1&&paths<=5,'The default sigil must be simple enough to draw in five strokes');
   assert.equal(await page.locator('#drawingSteps li').count(),paths,'Every path should have a numbered drawing step');
  };

  await page.goto('http://127.0.0.1:4173/majikmaker/');
  assert.equal(await page.title(),'Majik Maker — Intention Studio');
  assert.equal(await page.locator('input[name="method"][value="word"]').isChecked(),true);
  await page.locator('#generateButton').click();
  assert.match(await page.locator('#formMessage').textContent(),/intention/i);
  await page.locator('#intention').fill('東京 ✦ 123');
  await page.locator('#generateButton').click();
  assert.match(await page.locator('#formMessage').textContent(),/Latin|letter|A.?Z/i);
  await page.locator('#intention').fill('I welcome a peaceful home.');
  await generate();
  assert.equal(await page.locator('#uploadFilled').isVisible(),false,'Word sigils must work before choosing an image');
  await assertGuide();
  assert.match(await page.locator('#letterRecipe').textContent(),/I|W|E|L/);
  const word=await page.locator('#symbolArt').innerHTML();
  assert.equal(await page.locator('#inkExport').isChecked(),true);

  const [pngDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadPng').click()]);
  const png=await fs.readFile(await pngDownload.path());
  assert.equal(png.readUInt32BE(16),1600);assert.equal(png.readUInt32BE(20),1600);
  const [svgDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadSvg').click()]);
  const savedSvg=await fs.readFile(await svgDownload.path(),'utf8');
  assert.match(savedSvg,/<svg/);
  const exportIsInk=await page.evaluate(svg=>{
   const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');
   return [...parsed.querySelectorAll('rect')].some(rect=>/^(#fff(?:fff)?|white)$/i.test(rect.getAttribute('fill')||''));
  },savedSvg);
  assert.ok(exportIsInk,'The default export must have a white background for paper drawing');

  while(await page.locator('#libraryMore').isVisible())await page.locator('#libraryMore').click();
  const allSymbols=await page.locator('#libraryResults button[data-use-symbol]').count();
  assert.ok(allSymbols>=20);
  await page.locator('#librarySearch').fill('zzzz-no-historical-mark');
  assert.equal(await page.locator('#libraryResults button[data-use-symbol]').count(),0);
  await page.locator('#librarySearch').fill('Fire');
  const matches=page.locator('#libraryResults button[data-use-symbol]');
  assert.ok(await matches.count()>0);assert.ok(await matches.count()<allSymbols);
  assert.ok(await page.locator('#libraryResults a[href^="https://"]').count()>0,'Each displayed mark needs a historical source');
  const selected=await matches.first().getAttribute('data-use-symbol');
  await matches.first().click();
  assert.equal(await page.locator('input[name="method"][value="historical"]').isChecked(),true);
  assert.equal(await page.locator('#historicalSelect').inputValue(),selected);
  await page.locator('#intention').fill('');await generate();
  const historical=await page.locator('#symbolArt').innerHTML();
  assert.equal(await page.locator('#drawingSteps li').count(),await page.locator('#symbolArt svg path').count());
  await page.locator('#intention').fill('Different words must preserve the historical mark.');
  await generate();assert.equal(await page.locator('#symbolArt').innerHTML(),historical);
  await page.locator('#librarySearch').fill('');
  const filter=page.locator('#libraryFilter');
  const tradition=await filter.locator('option').nth(1).getAttribute('value');
  await filter.selectOption(tradition);
  const filtered=await page.locator('#libraryResults button[data-use-symbol]').count();
  assert.ok(filtered>0&&filtered<allSymbols,'Tradition filtering should narrow the catalog');
  await filter.selectOption({index:0});

  await chooseMethod('word');await page.locator('#intention').fill('I welcome a peaceful home.');
  await openImage();
  await page.locator('#sampleButton').click();
  await page.waitForFunction(()=>!document.querySelector('#uploadFilled').hidden&&!document.querySelector('#generateButton').disabled);
  await generate();await assertGuide();
  assert.notEqual(await page.locator('#symbolArt').innerHTML(),word);
  await page.locator('#imageInput').setInputFiles('icons/icon-192.png');
  await page.waitForFunction(()=>document.querySelector('#imageName').textContent==='icon-192.png'&&!document.querySelector('#generateButton').disabled);
  await generate();await assertGuide();
  const uploadedWord=await page.locator('#symbolArt').innerHTML();
  await page.locator('#removeImage').click();await generate();await assertGuide();
  assert.equal(await page.locator('#uploadFilled').isVisible(),false);
  assert.notEqual(await page.locator('#symbolArt').innerHTML(),uploadedWord,'Clearing the optional image must restore a word-only arrangement');
  await chooseMethod('geometric');
  const geometries=new Set();
  for(const style of ['orbital','resonance','entangled']){
   await page.locator(`label.style-option:has(input[value="${style}"])`).click();
   await generate();geometries.add(await page.locator('#symbolArt').innerHTML());
  }
  assert.equal(geometries.size,3,'The retained geometric styles must remain distinct');

  await page.locator('#aboutButton').click();
  assert.equal(await page.locator('#aboutDialog').evaluate(element=>element.open),true);
  assert.match(await page.locator('#aboutDialog').textContent(),/Crowley/);
  assert.match(await page.locator('#aboutDialog').textContent(),/Spare/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#aboutDialog').evaluate(element=>element.open),false);

  await chooseMethod('word');await page.locator('#intention').fill('I invite more creativity.');await generate();await assertGuide();
  assert.equal(await page.locator('#resultIntention').textContent(),'“I invite more creativity.”');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`Horizontal overflow at ${width}px`);
  }
  await fs.mkdir('artifacts',{recursive:true});
  await page.setViewportSize({width:1440,height:1080});await settle();
  await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await settle();
  await page.screenshot({path:'artifacts/phone.png',fullPage:true});

  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.ready).scope),'http://127.0.0.1:4173/majikmaker/');
  await context.setOffline(true);await page.reload();
  await page.locator('#intention').fill('I practice drawing with confidence.');await generate();await assertGuide();
  await page.locator('#librarySearch').fill('Fire');
  await page.locator('#libraryResults button[data-use-symbol]').first().click();
  await page.locator('#intention').fill('');await generate();
  assert.match(await page.locator('#previewBadge').textContent(),/^\d+ simple strokes?$/);
  await openImage();await page.locator('#sampleButton').click();
  await page.waitForFunction(()=>!document.querySelector('#uploadFilled').hidden&&!document.querySelector('#generateButton').disabled);
  assert.deepEqual(errors,[]);
  console.log('Browser smoke passed: returning-v3 cache upgrade, word-only sigils, drawing guides, historical search/filter/selection, preserved image and geometric modes, paper PNG/SVG exports, responsive phone/desktop layouts, and offline word/history generation.');
 }finally{if(browser)await browser.close();server.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
