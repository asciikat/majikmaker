const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createSymbol,analyzePixels}=require('../symbol.js');
function pixels(r,g,b){return Uint8ClampedArray.from({length:4096},(_,i)=>[r,g,b,255][i%4]);}
test('uniform images produce finite metrics and valid SVG geometry',()=>{
 for(const v of [0,1,30,128,255]){
  const metrics=analyzePixels(pixels(v,v,v));
  assert.ok(Number.isFinite(metrics.contrast));
  for(const style of ['orbital','resonance','entangled']){
   const svg=createSymbol(metrics,'A peaceful home',style);
   assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
   assert.ok(svg.endsWith('</svg>'));
   assert.doesNotMatch(svg,/NaN|Infinity|undefined/);
  }
 }
});
test('image, intention, geometry, and variation each influence the symbol',()=>{
 const m=analyzePixels(pixels(130,80,50));
 const svg=createSymbol(m,'A peaceful home','orbital');
 assert.equal(svg,createSymbol(m,'A peaceful home','orbital'));
 assert.equal(svg,createSymbol(m,'  A   peaceful HOME  ','orbital'));
 assert.notEqual(svg,createSymbol(analyzePixels(pixels(20,100,140)),'A peaceful home','orbital'));
 assert.notEqual(svg,createSymbol(m,'A joyful creative life','orbital'));
 assert.notEqual(svg,createSymbol(m,'A peaceful home','resonance'));
 assert.notEqual(svg,createSymbol(m,'A peaceful home','entangled'));
 assert.notEqual(svg,createSymbol(m,'A peaceful home','orbital',1));
});
test('untrusted intention text does not become executable SVG markup',()=>{
 const svg=createSymbol(analyzePixels(pixels(1,1,1)),'<script>alert(1)</script>','orbital');
 assert.doesNotMatch(svg,/<script|onload=|alert\(/);
 assert.doesNotMatch(svg,/NaN/);
});
test('color balance controls the accent, and empty pixel input fails intentionally',()=>{
 const warm=createSymbol(analyzePixels(pixels(255,30,0)),'Peace','orbital');
 const cool=createSymbol(analyzePixels(pixels(0,30,255)),'Peace','orbital');
 assert.match(warm,/#e9be95/);assert.match(cool,/#c5d8d3/);
 assert.throws(()=>analyzePixels([]),/RGBA/);
});
