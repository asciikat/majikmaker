const base=new URL(process.env.MAJIKMAKER_LIVE_URL);
if(base.protocol!=='https:'||base.hostname!=='asciikat.github.io'||base.pathname!=='/majikmaker/')throw Error('Unexpected Pages URL');
let lastError;
for(let attempt=0;attempt<12;attempt++){
 try{
  const version='pages-check='+Date.now();
  const response=await fetch(new URL('?'+version,base),{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
  if(!response.ok)throw Error('App returned HTTP '+response.status);
  const html=await response.text();
  if(!html.includes('id="symbolForm"')||!html.includes('<title>Majik Maker — Intention Studio</title>'))throw Error('Pages served a document instead of the app');
  if(!html.includes('id="historyLibrary"')||!html.includes('id="drawingGuide"'))throw Error('Pages is serving the app before the historical sigil update');
  const checks=await Promise.all(['styles.css','symbol.js','catalog.js','app.js','install.js','manifest.webmanifest','sw.js','sample-home.jpg','icons/icon-192.png'].map(async file=>{
   const result=await fetch(new URL(file+'?'+version,base),{signal:AbortSignal.timeout(15000)});
   if(!result.ok)throw Error(file+' returned HTTP '+result.status);
   if(file==='sw.js'&&!(await result.text()).includes('majikmaker-v4'))throw Error('Pages is serving an older service worker');
   if(file==='catalog.js'&&!(await result.text()).includes('HISTORICAL_SYMBOLS'))throw Error('Pages is serving an incomplete historical catalogue');
   if(file==='symbol.js'&&!(await result.text()).includes('function createWordSigil'))throw Error('Pages is serving the older geometric-only generator');
   if(file==='app.js'&&!(await result.text()).includes('function renderLibrary'))throw Error('Pages is serving the older app controls');
   if(file==='manifest.webmanifest'){const manifest=await result.json();if(manifest.start_url!=='./'||manifest.scope!=='./')throw Error('Manifest is outside the Pages app path');}
   return file;
  }));
  console.log('Live GitHub Pages app verified: '+base.href+' ('+checks.length+' assets)');lastError=null;break;
 }catch(error){lastError=error;console.log('Waiting for Pages content: '+error.message);if(attempt<11)await new Promise(resolve=>setTimeout(resolve,6000));}
}
if(lastError)throw lastError;
