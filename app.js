'use strict';
const $ = id => document.getElementById(id);
const state = {image:null,metrics:null,seed:0,variant:0,svg:null,intention:'',busy:false,loading:false,loadId:0};
function imageMetrics(img){
 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,32,32);
 return analyzePixels(ctx.getImageData(0,0,32,32).data);
}
function draft(){state.svg=null;state.variant=0;$('downloadActions').hidden=true;$('resultIntention').hidden=true;$('previewBadge').textContent='Preview';$('previewBadge').classList.remove('is-ready');$('previewLabel').textContent='YOUR SYMBOL, WAITING TO UNFOLD';$('resultTitle').textContent='From possibility to personal.';$('resultDescription').innerHTML='Add your vision and intention.<br>We’ll weave them into a symbol that’s yours.';$('previewFootnote').textContent='A VISUAL ANCHOR FOR WHAT MATTERS TO YOU';$('generateButton').querySelector('span').textContent='Create my symbol';$('formMessage').textContent='';const m=state.metrics||{brightness:.55,contrast:.45,hash:18272};$('symbolArt').innerHTML=createSymbol(m,$('intention').value||'possibility',selectedStyle());$('symbolArt').classList.add('preview-art');$('symbolArt').setAttribute('aria-label','Preview of a geometric intention symbol');}
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
  state.image=img;state.metrics=metrics;$('visionPreview').src=source;$('imageName').textContent=name;$('uploadEmpty').hidden=true;$('uploadFilled').hidden=false;
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
 const intention=$('intention').value.trim();
 if(!state.image){error('Choose an image or try the dream home to begin.');$('uploadButton').focus();return {error:'An image is required.'};}
 if(!intention){error('Add a few words about what you want to welcome into your life.');$('intention').focus();return {error:'An intention is required.'};}
 state.busy=true;$('generateButton').disabled=true;$('generateButton').querySelector('span').textContent='Weaving your symbol…';$('formMessage').textContent='';
 try{
  const svg=createSymbol(state.metrics,intention,selectedStyle(),state.variant++);
  $('symbolStage').classList.remove('generating');void $('symbolStage').offsetWidth;$('symbolStage').classList.add('generating');
  $('symbolArt').classList.remove('preview-art');$('symbolArt').innerHTML=svg;$('symbolArt').setAttribute('aria-label','Your personal '+selectedStyle()+' intention symbol');
  state.svg=svg;state.intention=intention;
  $('previewLabel').textContent='YOUR INTENTION, IN FORM';$('previewBadge').textContent='Created for you';$('previewBadge').classList.add('is-ready');
  $('resultTitle').textContent='Your vision. Your symbol.';$('resultDescription').textContent='A unique pattern, shaped by your image and words.';$('resultIntention').textContent='“'+intention+'”';$('resultIntention').hidden=false;$('downloadActions').hidden=false;$('previewFootnote').textContent='KEEP IT CLOSE. LET IT REMIND YOU.';
  $('formMessage').textContent='Your symbol is ready. Download it to keep it.';
  if(window.innerWidth<=730)$('previewLabel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  return {status:'created',geometry:selectedStyle(),intention,variant:state.variant};
 }finally{state.busy=false;$('generateButton').disabled=false;$('generateButton').querySelector('span').textContent='Create another symbol';}
}
function saveBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function showToast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$('toast').hidden=true,3500);}
function exportSvg(){if(!state.svg)return;const svg=state.svg.replace('<title>Personal intention symbol</title>','<title>Majik Maker intention symbol</title><rect width="440" height="440" fill="#131d28"/>');saveBlob(new Blob([svg],{type:'image/svg+xml'}),'majikmaker-symbol.svg');showToast('Your SVG download is ready.');}
async function exportPng(){
 if(!state.svg)return;const svg=state.svg;$('downloadPng').disabled=true;
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1600;const ctx=canvas.getContext('2d');ctx.fillStyle='#131d28';ctx.fillRect(0,0,1600,1600);ctx.drawImage(img,0,0,1600,1600);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('export');const file=new File([blob],'majikmaker-symbol.png',{type:'image/png'});if(navigator.maxTouchPoints>0&&navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'My Majik Maker symbol'});return;}catch(e){if(e.name==='AbortError')return;}}saveBlob(blob,'majikmaker-symbol.png');showToast('Your PNG download is ready.');}catch(e){showToast('The image download failed. Try the SVG instead.');}finally{URL.revokeObjectURL(url);$('downloadPng').disabled=false;}
}
$('uploadButton').addEventListener('click',()=>$('imageInput').click());
$('imageInput').addEventListener('change',e=>{acceptFile(e.target.files[0]);e.target.value='';});
for(const event of ['dragenter','dragover'])$('uploadButton').addEventListener(event,e=>{e.preventDefault();$('uploadButton').classList.add('drag-over');});
for(const event of ['dragleave','drop'])$('uploadButton').addEventListener(event,e=>{e.preventDefault();$('uploadButton').classList.remove('drag-over');if(event==='drop')acceptFile(e.dataTransfer.files[0]);});
$('sampleButton').addEventListener('click',async()=>{await loadImage(new URL('sample-home.jpg',location.href).href,'A peaceful place to call home',true);});
$('intention').addEventListener('input',()=>{updateCount();draft();});
document.querySelectorAll('input[name="geometry"]').forEach(el=>el.addEventListener('change',draft));
$('symbolForm').addEventListener('submit',e=>{e.preventDefault();generate();});
$('downloadPng').addEventListener('click',exportPng);$('downloadSvg').addEventListener('click',exportSvg);
function openAbout(){if(!$('aboutDialog').open)$('aboutDialog').showModal();}
$('aboutButton').addEventListener('click',openAbout);$('scienceButton').addEventListener('click',openAbout);$('closeDialog').addEventListener('click',()=>$('aboutDialog').close());$('dialogDone').addEventListener('click',()=>$('aboutDialog').close());
$('aboutDialog').addEventListener('click',e=>{if(e.target===$('aboutDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
draft();
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 const tools=[{name:'configure_intention_symbol',title:'Set the intention and geometry',description:'Update the visible intention and geometry for the currently selected image. Does not generate a finished symbol.',inputSchema:{type:'object',properties:{intention:{type:'string',minLength:1,maxLength:160},geometry:{type:'string',enum:['orbital','resonance','entangled']}},required:['intention','geometry'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input.intention!=='string'||!input.intention.trim()||input.intention.length>160||!['orbital','resonance','entangled'].includes(input.geometry))throw Error('Provide an intention of 1–160 characters and a supported geometry.');$('intention').value=input.intention;document.querySelector(`input[name="geometry"][value="${input.geometry}"]`).checked=true;updateCount();draft();return {status:'configured',intention:input.intention,geometry:input.geometry,imageSelected:!!state.image};}},{name:'generate_intention_symbol',title:'Create an intention symbol',description:'Generate a finished symbol from the selected image, current intention, and geometry. Requires an image and nonempty intention already selected.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).length)throw Error('This tool takes an empty object.');return generate();}}];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch(e){}}
}
