'use strict';
function hashText(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function randomFrom(seed){return ()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const f=n=>Number(n.toFixed(3));
function createSymbol(metrics,text,style,variant=0){
 const normalized=text.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
 const seed=hashText(normalized+'|'+metrics.hash+'|'+style+'|'+variant),rnd=randomFrom(seed);
 const n=5+Math.floor(rnd()*4),phase=rnd()*Math.PI*2,cx=220,cy=220;
 const gold=metrics.warmth>0.12?'#e9be95':metrics.warmth<-.12?'#c5d8d3':'#e2c79c',ivory='#e8e3d5';let art='';
 const point=(r,a)=>[f(cx+r*Math.cos(a)),f(cy+r*Math.sin(a))];
 const circle=(r,width,opacity,color=gold)=>`<circle cx="220" cy="220" r="${f(r)}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
 const line=(a,b,width=1,opacity=.8,color=gold)=>`<path d="M${a.join(' ')}L${b.join(' ')}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
 const polygon=(r,k,rotation)=>Array.from({length:k},(_,i)=>point(r,rotation+i*Math.PI*2/k).join(',')).join(' ');
 art+=circle(177,.7,.33)+circle(162,1,.7)+circle(155,.4,.5);
 for(let i=0;i<60;i++){const a=i*Math.PI*2/60+phase;art+=line(point(i%5===0?168:173,a),point(177,a),i%5===0?.8:.5,i%5===0?.65:.32);}
 for(let i=0;i<n;i++){
  const a=phase+i*Math.PI*2/n,p=point(162,a);
  art+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.1" fill="${gold}" stroke="${gold}"/>`;
  art+=line(point(145,a),point(151,a),.8,.7);
 }
 const centralRadius=69+metrics.contrast*20;
 if(style==='orbital'){
  const rx=119+metrics.brightness*13,ry=45+metrics.contrast*26;
  for(let i=0;i<3;i++){art+=`<ellipse cx="220" cy="220" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f((phase*180/Math.PI)+i*60)} 220 220)" stroke="${i===1?ivory:gold}" stroke-width="${i===1?1.2:.8}" opacity=".8"/>`;}
  art+=`<polygon points="${polygon(95,3,phase-Math.PI/2)}" stroke="${gold}" stroke-width="1" opacity=".6"/>`;
 }else if(style==='resonance'){
  for(let j=0;j<3;j++){
   const base=79+j*20,depth=12+metrics.contrast*15-j*2;const points=[];
   for(let i=0;i<=360;i++){const a=phase+i*Math.PI/180,r=base+depth*Math.cos(n*a+phase)+depth*.16*Math.cos(2*n*a);points.push(point(r,a));}
   art+=`<path d="M${points.map(p=>p.join(' ')).join('L')}Z" stroke="${j===1?ivory:gold}" stroke-width="${j===1?1.15:.7}" opacity="${.8-j*.15}"/>`;
  }
 }else{
  for(let j=0;j<2;j++){const pts=[];for(let i=0;i<=400;i++){const t=i*Math.PI*2/400;pts.push([f(cx+122*Math.sin(2*t+phase+j*.7)),f(cy+116*Math.sin(3*t+j*.7))]);}art+=`<path d="M${pts.map(p=>p.join(' ')).join('L')}Z" stroke="${j?ivory:gold}" stroke-width="${j?.8:1.1}" opacity="${j?.45:.85}"/>`;}
  art+=circle(104,.5,.4);
 }
 art+=circle(centralRadius,.75,.55,ivory);
 const shape=3+Math.floor(rnd()*3),rotation=phase-Math.PI/2;
 art+=`<polygon points="${polygon(centralRadius,shape,rotation)}" stroke="${gold}" stroke-width="1.4" opacity=".94"/>`;
 art+=`<polygon points="${polygon(centralRadius*.66,shape,rotation+Math.PI)}" stroke="${ivory}" stroke-width=".8" opacity=".6"/>`;
 const mid=34+metrics.brightness*10;
 art+=line(point(mid,rotation),point(mid,rotation+Math.PI),1.4,.9,ivory);
 art+=line(point(mid*.7,rotation+Math.PI/2),point(mid*.7,rotation-Math.PI/2),1.2,.9,ivory);
 art+=`<polygon points="${polygon(13,4,rotation)}" stroke="${gold}" stroke-width="1.3" fill="#172632"/>`;
 art+=`<circle cx="220" cy="220" r="3" fill="${gold}" stroke="none"/>`;
 for(let i=0;i<4;i++){const a=i*Math.PI/2,p=point(194,a);art+=line([p[0]-4,p[1]],[p[0]+4,p[1]],.7,.7);art+=line([p[0],p[1]-4],[p[0],p[1]+4],.7,.7);}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 440" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Personal geometric intention symbol"><title>Personal intention symbol</title>${art}</svg>`;
}

function analyzePixels(pixels){
 if(!pixels||!pixels.length||pixels.length%4)throw Error('Expected RGBA image pixels.');
 const count=pixels.length/4;let sum=0,square=0,h=2166136261,warm=0;
 for(let i=0;i<pixels.length;i+=4){
  const luminance=(pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722)/255;
  sum+=luminance;square+=luminance*luminance;warm+=(pixels[i]-pixels[i+2])/255;
  for(let j=0;j<4;j++){h^=pixels[i+j];h=Math.imul(h,16777619);}
 }
 const brightness=sum/count;
 return {brightness,contrast:Math.min(1,Math.sqrt(Math.max(0,square/count-brightness*brightness))*3),warmth:warm/count,hash:h>>>0};
}
// A contemporary drawing recipe inspired by Spare's simplified alphabet sigils.
// Deduplication and this five-shape alphabet are design choices of this app.
const LETTER_STROKES={A:'angle bar',B:'stem curve',C:'curve',D:'stem curve',E:'stem bar',F:'stem bar',G:'curve bar',H:'stem bar',I:'stem',J:'stem curve',K:'stem angle',L:'stem bar',M:'stem angle',N:'stem angle',O:'loop',P:'stem curve',Q:'loop angle',R:'stem curve angle',S:'curve',T:'stem bar',U:'curve',V:'angle',W:'angle',X:'angle',Y:'stem angle',Z:'angle bar'};
function uniqueLetters(text){return [...new Set(String(text).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,''))].join('');}
function strokeSvg(strokes,label='Personal intention symbol'){
 const safeLabel=label.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 440" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${safeLabel}"><title>Personal intention symbol</title><g stroke="#e2c79c" stroke-width="7">${strokes.map(s=>`<path d="${s.path}"/>`).join('')}</g></svg>`;
}
function createWordSigil(text,variant=0,imageHash=0){
 const letters=uniqueLetters(text);if(!letters)throw Error('Use at least one letter from A–Z for a word sigil.');
 const rnd=randomFrom(hashText(letters+'|'+variant+'|'+imageHash));
 const lean=Math.floor(rnd()*3-1)*25,barY=200+Math.floor(rnd()*3)*25,up=rnd()>.5,left=rnd()>.5,loopY=195+Math.floor(rnd()*3)*25;
 const recipes={
  stem:{path:`M${220-lean} 105L${220+lean} 335`,instruction:lean?'Draw one long, slightly slanted line from top to bottom.':'Draw one long vertical line from top to bottom.'},
  angle:{path:up?'M120 300L220 120L320 300':'M120 140L220 320L320 140',instruction:up?'Draw an open triangle: lower left, top, then lower right.':'Draw a V: upper left, bottom, then upper right.'},
  bar:{path:`M140 ${barY}L300 ${barY}`,instruction:'Draw a short horizontal line across the middle.'},
  curve:{path:left?'M140 140C330 105 330 335 140 300':'M300 140C110 105 110 335 300 300',instruction:left?'Draw one rounded curve, open on the left.':'Draw one rounded curve, open on the right.'},
  loop:{path:`M285 ${loopY}A65 65 0 1 1 155 ${loopY}A65 65 0 1 1 285 ${loopY}`,instruction:'Draw one small closed circle around the middle.'}
 };
 const strokes=Object.entries(recipes).flatMap(([kind,shape])=>{const contributors=[...letters].filter(letter=>LETTER_STROKES[letter].split(' ').includes(kind)).join('');return contributors?[{kind,...shape,letters:contributors}]:[];});
 return {svg:strokeSvg(strokes),letters,strokes};
}
function createHistoricalSigil(mark){
 if(!mark?.strokes?.length)throw Error('Choose a historical mark.');
 const strokes=mark.strokes.map(s=>({...s}));return {svg:strokeSvg(strokes,mark.name),strokes};
}
if(typeof module !== 'undefined') module.exports={hashText,randomFrom,createSymbol,analyzePixels,uniqueLetters,createWordSigil,createHistoricalSigil};
