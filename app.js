'use strict';
const $ = id => document.getElementById(id);
const state = {image:null,metrics:null,seed:0,variant:0,svg:null,plan:null,intention:'',busy:false,loading:false,loadId:0};
function imageMetrics(img){
 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,32,32);
 return analyzePixels(ctx.getImageData(0,0,32,32).data);
}
function selectedMethod(){return document.querySelector('input[name="method"]:checked').value;}
function selectedMark(){return HISTORICAL_SYMBOLS.find(mark=>mark.id===$('historicalSelect').value)||HISTORICAL_SYMBOLS[0];}
function symbolPlan(text,variant=0){
 if(selectedMethod()==='historical')return createHistoricalSigil(selectedMark());
 if(selectedMethod()==='geometric')return {svg:createSymbol(state.metrics||{brightness:.55,contrast:.45,warmth:0,hash:18272},text,selectedStyle(),variant),strokes:[]};
 return createWordSigil(text,variant,state.metrics?.hash||0);
}
function updateMethod(){
 const method=selectedMethod();$('historicalControls').hidden=method!=='historical';$('geometricControls').hidden=method!=='geometric';
 $('methodNote').textContent={word:'Inspired by Austin Osman Spare’s alphabet sigils. Letters share a few simple shapes.',historical:'Use an existing mark in its historical context. Your intention and image do not change its form.',geometric:'Decorative art inspired by orbits and waves. Choose word mode for a simple drawing.'}[method];
 const mark=selectedMark();$('historicalMeaning').textContent=mark.tradition+' · '+mark.meaning;
}
function draft(){
 state.svg=null;state.plan=null;state.variant=0;updateMethod();$('downloadActions').hidden=true;$('drawingGuide').hidden=true;$('resultIntention').hidden=true;$('previewBadge').textContent='Preview';$('previewBadge').classList.remove('is-ready');$('previewLabel').textContent='A SIMPLE MARK, MADE MEANINGFUL';$('resultTitle').textContent=selectedMethod()==='historical'?selectedMark().name:'Something you can draw.';$('resultDescription').textContent=selectedMethod()==='historical'?selectedMark().meaning:'Begin with an idea. Make it a simple mark.';$('previewFootnote').textContent='DRAW IT. REMEMBER WHAT IT MEANS TO YOU.';$('generateButton').querySelector('span').textContent='Create my symbol';$('formMessage').textContent='';
 const text=uniqueLetters($('intention').value)?$('intention').value:'I welcome peace';$('symbolArt').innerHTML=symbolPlan(text).svg;$('symbolArt').classList.add('preview-art');$('symbolArt').setAttribute('aria-label','Preview of a '+selectedMethod()+' symbol');
}
function drawGuide(plan){
 $('drawingGuide').hidden=!plan.strokes.length;if(!plan.strokes.length)return;
 $('strokeCount').textContent=plan.strokes.length+(plan.strokes.length===1?' pen stroke':' pen strokes');
 $('letterRecipe').textContent=plan.letters?'Your letters, kept once: '+plan.letters.split('').join(' · ')+'. Shared letter shapes overlap to make this personal mark.':selectedMark().name+' · '+selectedMark().tradition+'. This guide follows the selected historical form.';
 const list=$('drawingSteps');list.replaceChildren();
 plan.strokes.forEach((stroke,i)=>{
  const item=document.createElement('li');const art=document.createElement('div');art.className='stroke-art';
  art.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 440" fill="none" aria-hidden="true"><g stroke="#53606c" stroke-width="6">'+plan.strokes.slice(0,i).map(s=>'<path d="'+s.path+'"/>').join('')+'</g><path d="'+stroke.path+'" stroke="#e2c79c" stroke-width="8"/></svg>';
  const caption=document.createElement('p');caption.textContent=(i+1)+'. '+stroke.instruction;item.append(art,caption);
  if(stroke.letters){const letters=document.createElement('small');letters.textContent='From '+stroke.letters.split('').join(', ');item.append(letters);}list.append(item);
 });
}
function selectedStyle(){return document.querySelector('input[name="geometry"]:checked').value;}
function error(message){$('formMessage').textContent=message;}
function updateCount(){$('charCount').textContent=$('intention').value.length+' / 160';}
function beginImageLoad(){const id=++state.loadId;state.loading=true;$('generateButton').disabled=true;$('uploadButton').setAttribute('aria-busy','true');$('formMessage').textContent='Reading your image…';return id;}
async function loadImage(source,name,fillIntention=false,requestId=null){
 const id=requestId??beginImageLoad();if(id!==state.loadId)return;
 try{
  const img=new Image();img.src=source;await img.decode();
  if(id!==state.loadId)return;
  if(!img.naturalWidth||!img.naturalHeight)throw Error('decode');
  const metrics=imageMetrics(img);
  state.image=img;state.metrics=metrics;$('visionPreview').src=source;$('imageName').textContent=name;$('uploadEmpty').hidden=true;$('uploadFilled').hidden=false;$('removeImage').hidden=false;
  if(fillIntention&&!$('intention').value.trim()){$('intention').value='I welcome a peaceful place to call home.';updateCount();}
  draft();
 }catch(e){if(id===state.loadId)error('We couldn’t read that image. Please choose a JPG, PNG, or WEBP file.');}
 finally{if(id===state.loadId){state.loading=false;$('generateButton').disabled=false;$('uploadButton').removeAttribute('aria-busy');}}
}
async function acceptFile(file){
 if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){error('Choose a JPG, PNG, or WEBP image.');return;}
 if(file.size>10*1024*1024){error('That image is too large. Choose one under 10 MB.');return;}
 const id=beginImageLoad();const reader=new FileReader();reader.onload=()=>{if(id===state.loadId)loadImage(reader.result,file.name,false,id);};reader.onerror=()=>{if(id===state.loadId){state.loading=false;$('generateButton').disabled=false;$('uploadButton').removeAttribute('aria-busy');error('We couldn’t open that file. Please try another image.');}};reader.readAsDataURL(file);
}
async function generate(){
 if(state.busy||state.loading)return {error:'Please wait for the image to finish loading.'};
 const intention=$('intention').value.trim(),method=selectedMethod();
 if(!intention&&method!=='historical'){error('Write a few words about your intention to begin.');$('intention').focus();return {error:'An intention is required.'};}
 if(method==='word'&&!uniqueLetters(intention)){error('Word sigils need at least one A–Z letter. Try historical mode for an intention in another script.');$('intention').focus();return {error:'A–Z letters are required.'};}
 state.busy=true;$('generateButton').disabled=true;$('generateButton').querySelector('span').textContent='Making your mark…';$('formMessage').textContent='';
 try{
  const plan=symbolPlan(intention,state.variant++),svg=plan.svg;
  $('symbolStage').classList.remove('generating');void $('symbolStage').offsetWidth;$('symbolStage').classList.add('generating');
  $('symbolArt').classList.remove('preview-art');$('symbolArt').innerHTML=svg;$('symbolArt').setAttribute('aria-label',method==='historical'?selectedMark().name:'Your personal '+method+' intention symbol');
  state.svg=svg;state.plan=plan;state.intention=intention;
  $('previewLabel').textContent='YOUR INTENTION, IN FORM';$('previewBadge').textContent=method==='geometric'?'Created for you':plan.strokes.length+' simple '+(plan.strokes.length===1?'stroke':'strokes');$('previewBadge').classList.add('is-ready');
  $('resultTitle').textContent=method==='historical'?selectedMark().name:method==='word'?'Your words. Your mark.':'Your vision. Your symbol.';
  $('resultDescription').textContent=method==='historical'?selectedMark().meaning:method==='word'?'Simplified letter shapes, combined into a mark you can draw.':'A decorative pattern, shaped by your words and optional image.';
  $('resultIntention').textContent='“'+intention+'”';$('resultIntention').hidden=!intention;$('downloadActions').hidden=false;$('previewFootnote').textContent='KEEP IT CLOSE. LET IT REMIND YOU.';drawGuide(plan);
  $('formMessage').textContent=plan.strokes.length?'Your mark is ready. Follow the drawing guide below.':'Your artwork is ready. Download it to keep it.';
  if(window.innerWidth<=730)$('previewLabel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  return {status:'created',method,geometry:method==='geometric'?selectedStyle():undefined,symbolId:method==='historical'?selectedMark().id:undefined,intention,variant:state.variant,strokeCount:plan.strokes.length};
 }finally{state.busy=false;$('generateButton').disabled=false;$('generateButton').querySelector('span').textContent=method==='historical'?'Use this mark':'Create another symbol';}
}
function exportArtwork(){
 let svg=state.svg;const ink=$('inkExport').checked;
 if(ink)svg=svg.replace(/stroke="#[a-f0-9]{3,8}"/gi,'stroke="#111111"').replace(/fill="#[a-f0-9]{3,8}"/gi,'fill="#111111"');
 return svg.replace('<title>Personal intention symbol</title>','<title>Majik Maker intention symbol</title><rect width="440" height="440" fill="'+(ink?'#ffffff':'#131d28')+'" stroke="none"/>');
}
function saveBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function showToast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$('toast').hidden=true,3500);}
function exportSvg(){if(!state.svg)return;saveBlob(new Blob([exportArtwork()],{type:'image/svg+xml'}),'majikmaker-symbol.svg');showToast('Your SVG download is ready.');}
async function exportPng(){
 if(!state.svg)return;const svg=exportArtwork();$('downloadPng').disabled=true;
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1600;const ctx=canvas.getContext('2d');ctx.fillStyle=$('inkExport').checked?'#ffffff':'#131d28';ctx.fillRect(0,0,1600,1600);ctx.drawImage(img,0,0,1600,1600);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('export');const file=new File([blob],'majikmaker-symbol.png',{type:'image/png'});if(navigator.maxTouchPoints>0&&navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'My Majik Maker symbol'});return;}catch(e){if(e.name==='AbortError')return;}}saveBlob(blob,'majikmaker-symbol.png');showToast('Your PNG download is ready.');}catch(e){showToast('The image download failed. Try the SVG instead.');}finally{URL.revokeObjectURL(url);$('downloadPng').disabled=false;}
}
$('uploadButton').addEventListener('click',()=>$('imageInput').click());
$('imageInput').addEventListener('change',e=>{acceptFile(e.target.files[0]);e.target.value='';});
for(const event of ['dragenter','dragover'])$('uploadButton').addEventListener(event,e=>{e.preventDefault();$('uploadButton').classList.add('drag-over');});
for(const event of ['dragleave','drop'])$('uploadButton').addEventListener(event,e=>{e.preventDefault();$('uploadButton').classList.remove('drag-over');if(event==='drop')acceptFile(e.dataTransfer.files[0]);});
$('sampleButton').addEventListener('click',async()=>{await loadImage(new URL('sample-home.jpg',location.href).href,'A peaceful place to call home',true);});
$('removeImage').addEventListener('click',()=>{++state.loadId;state.image=null;state.metrics=null;state.loading=false;$('generateButton').disabled=false;$('uploadButton').removeAttribute('aria-busy');$('visionPreview').removeAttribute('src');$('uploadEmpty').hidden=false;$('uploadFilled').hidden=true;$('removeImage').hidden=true;draft();});
$('intention').addEventListener('input',()=>{updateCount();draft();});
document.querySelectorAll('input[name="method"],input[name="geometry"]').forEach(el=>el.addEventListener('change',draft));
$('symbolForm').addEventListener('submit',e=>{e.preventDefault();generate();});
$('downloadPng').addEventListener('click',exportPng);$('downloadSvg').addEventListener('click',exportSvg);
function openAbout(){if(!$('aboutDialog').open)$('aboutDialog').showModal();}
$('aboutButton').addEventListener('click',openAbout);$('scienceButton').addEventListener('click',openAbout);$('closeDialog').addEventListener('click',()=>$('aboutDialog').close());$('dialogDone').addEventListener('click',()=>$('aboutDialog').close());
$('aboutDialog').addEventListener('click',e=>{if(e.target===$('aboutDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
let libraryLimit=6;
function useHistoricalMark(id){
 $('historicalSelect').value=id;document.querySelector('input[name="method"][value="historical"]').checked=true;draft();
 $('symbolForm').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});$('historicalSelect').focus({preventScroll:true});showToast('Historical mark selected. Add your intention or create it as it is.');
}
function renderLibrary(){
 const query=$('librarySearch').value.trim().toLowerCase(),filter=$('libraryFilter').value;
 const matches=HISTORICAL_SYMBOLS.filter(m=>(filter==='all'||m.tradition===filter)&&[m.name,m.meaning,m.tradition,m.period].join(' ').toLowerCase().includes(query));
 $('libraryStatus').textContent=matches.length?matches.length+' symbols'+(query?' matching “'+$('librarySearch').value.trim()+'”':' in this collection'):'No symbols match. Try another word or tradition.';
 const grid=$('libraryResults');grid.replaceChildren();
 for(const mark of matches.slice(0,libraryLimit)){
  const card=document.createElement('article');card.className='symbol-card';const art=document.createElement('div');art.className='catalog-art';art.innerHTML=createHistoricalSigil(mark).svg;
  const heading=document.createElement('h3');heading.textContent=mark.name;const meta=document.createElement('p');meta.className='catalog-meta';meta.textContent=mark.tradition+' · '+mark.period;
  const meaning=document.createElement('p');meaning.className='catalog-meaning';meaning.textContent=mark.meaning;
  const bottom=document.createElement('div');bottom.className='catalog-bottom';const use=document.createElement('button');use.type='button';use.dataset.useSymbol=mark.id;use.textContent='Use this mark';use.addEventListener('click',()=>useHistoricalMark(mark.id));
  const source=document.createElement('a');source.href=mark.source.url;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Source ↗';source.setAttribute('aria-label',mark.name+' source: '+mark.source.title);bottom.append(use,source);card.append(art,heading,meta,meaning,bottom);grid.append(card);
 }
 $('libraryMore').hidden=matches.length<=libraryLimit;
}
function initializeLibrary(){
 for(const mark of HISTORICAL_SYMBOLS){const option=document.createElement('option');option.value=mark.id;option.textContent=mark.name+' — '+mark.tradition;$('historicalSelect').append(option);}
 for(const tradition of [...new Set(HISTORICAL_SYMBOLS.map(m=>m.tradition))]){const option=document.createElement('option');option.value=tradition;option.textContent=tradition;$('libraryFilter').append(option);}
 $('libraryCount').textContent=HISTORICAL_SYMBOLS.length+' sourced marks';
 $('historicalSelect').addEventListener('change',draft);
 for(const id of ['librarySearch','libraryFilter'])$(id).addEventListener(id==='librarySearch'?'input':'change',()=>{libraryLimit=6;renderLibrary();});
 $('libraryMore').addEventListener('click',()=>{libraryLimit+=6;renderLibrary();});renderLibrary();
}
initializeLibrary();
draft();
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 const toolList=[{name:'configure_intention_symbol',title:'Set an intention and method',description:'Update the visible words and method. Historical marks keep their form; images are optional.',inputSchema:{type:'object',properties:{intention:{type:'string',maxLength:160},method:{type:'string',enum:['word','historical','geometric']},geometry:{type:'string',enum:['orbital','resonance','entangled']},symbolId:{type:'string',enum:HISTORICAL_SYMBOLS.map(m=>m.id)}},required:['intention','method'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
  if(!input||typeof input.intention!=='string'||input.intention.length>160||!['word','historical','geometric'].includes(input.method)||input.geometry&&!['orbital','resonance','entangled'].includes(input.geometry)||input.symbolId&&!HISTORICAL_SYMBOLS.some(m=>m.id===input.symbolId))throw Error('Provide an intention up to 160 characters and a supported method, geometry, or symbol ID.');
  $('intention').value=input.intention;document.querySelector('input[name="method"][value="'+input.method+'"]').checked=true;if(input.geometry)document.querySelector('input[name="geometry"][value="'+input.geometry+'"]').checked=true;if(input.symbolId)$('historicalSelect').value=input.symbolId;updateCount();draft();return {status:'configured',method:input.method,intention:input.intention,imageSelected:!!state.image};
 }},{name:'generate_intention_symbol',title:'Create an intention symbol',description:'Generate the current symbol. Word mode needs A–Z letters; historical mode needs only the chosen mark. No image required.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).length)throw Error('This tool takes an empty object.');return generate();}}];
 for(const tool of toolList){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch(e){}}
}
