'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const {chromium}=require('playwright');
(async()=>{
 const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:'4173'},stdio:['ignore','pipe','pipe']});
 let browser;
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timed out')),15000);server.stdout.on('data',data=>{if(String(data).includes('http://127.0.0.1:4173')){clearTimeout(timer);resolve();}});server.on('error',reject);server.on('exit',code=>{if(code)reject(Error('Server exited: '+code));});});
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1080},acceptDownloads:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  assert.equal(await page.title(),'Majik Maker — Intention Studio');
  await page.locator('#generateButton').click();assert.match(await page.locator('#formMessage').textContent(),/Choose an image/);
  await page.locator('#sampleButton').click();await page.waitForFunction(()=>document.querySelector('#uploadFilled').hidden===false&&!document.querySelector('#generateButton').disabled);
  await page.locator('#intention').fill('I welcome a peaceful home.');await page.locator('#generateButton').click();
  await page.locator('#downloadPng').waitFor({state:'visible'});await fs.mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/desktop.png',fullPage:true});const orbital=await page.locator('#symbolArt').innerHTML();assert.doesNotMatch(orbital,/NaN|Infinity/);
  const [pngDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadPng').click()]);
  const png=await fs.readFile(await pngDownload.path());assert.equal(png.readUInt32BE(16),1600);assert.equal(png.readUInt32BE(20),1600);
  const [svgDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadSvg').click()]);assert.match(await fs.readFile(await svgDownload.path(),'utf8'),/<svg/);
  await page.locator('label.style-option').filter({has:page.locator('input[value="resonance"]')}).click();await page.locator('#generateButton').click();assert.notEqual(await page.locator('#symbolArt').innerHTML(),orbital);
  await page.locator('#aboutButton').click();assert.equal(await page.locator('#aboutDialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#aboutDialog').evaluate(e=>e.open),false);
  await page.locator('#imageInput').setInputFiles('app/icons/icon-192.png');await page.waitForFunction(()=>document.querySelector('#imageName').textContent==='icon-192.png'&&!document.querySelector('#generateButton').disabled);await page.locator('#generateButton').click();assert.doesNotMatch(await page.locator('#symbolArt').innerHTML(),/NaN|Infinity/);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`Horizontal overflow at ${width}px`);}
  await page.setViewportSize({width:390,height:844});await page.locator('#intention').fill('I invite more creativity.');await page.locator('#generateButton').click();assert.equal(await page.locator('#resultIntention').textContent(),'“I invite more creativity.”');
  await page.screenshot({path:'artifacts/phone.png',fullPage:true});await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);await page.reload();await page.locator('#sampleButton').click();await page.waitForFunction(()=>!document.querySelector('#uploadFilled').hidden&&!document.querySelector('#generateButton').disabled);await page.locator('#generateButton').click();assert.equal(await page.locator('#previewBadge').textContent(),'Created for you');
  assert.deepEqual(errors,[]);console.log('Browser smoke passed: desktop + phone layouts, image upload, all core actions, PNG/SVG exports, and offline reload/generation.');
 }finally{if(browser)await browser.close();server.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
