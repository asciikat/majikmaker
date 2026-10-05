'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {uniqueLetters,createWordSigil,createHistoricalSigil}=require('../symbol.js');
const {HISTORICAL_SYMBOLS}=require('../catalog.js');

function assertDrawable(plan){
 assert.ok(plan.svg.startsWith('<svg '));
 assert.ok(plan.svg.endsWith('</svg>'));
 assert.doesNotMatch(plan.svg,/NaN|Infinity|undefined|<script|onload=/);
 assert.equal((plan.svg.match(/<path\b/g)||[]).length,plan.strokes.length);
 for(const stroke of plan.strokes){
  assert.ok(stroke.instruction.trim(), 'Every pen stroke needs a drawing instruction');
  assert.equal((stroke.path.match(/[Mm]/g)||[]).length,1,'A drawing step must be one continuous pen stroke');
  assert.match(plan.svg,new RegExp('d="'+stroke.path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'"'));
 }
}

test('word preparation preserves first-occurrence letters and normalizes accents and case',()=>{
 assert.equal(uniqueLetters('A peaceful HOME!'),'APECFULHOM');
 assert.equal(uniqueLetters('  a  PEACEFUL home  '),'APECFULHOM');
 assert.equal(uniqueLetters('Café, déjà vu 123'),'CAFEDJVU');
 assert.equal(uniqueLetters('123 — ✦'),'');
 assert.equal(uniqueLetters('東京'),'');
 assert.throws(()=>createWordSigil('東京 ✦ 123'),/A–Z/);
});

test('word sigils reduce short and long intentions to at most five continuous drawable strokes',()=>{
 for(const text of ['I','O','Peace','I welcome a peaceful home.','ABCDEFGHIJKLMNOPQRSTUVWXYZ']){
  const plan=createWordSigil(text);
  assertDrawable(plan);
  assert.equal(plan.letters,uniqueLetters(text));
  assert.ok(plan.strokes.length>=1&&plan.strokes.length<=5);
  assert.ok(plan.strokes.every(stroke=>typeof stroke.kind==='string'&&typeof stroke.letters==='string'));
  const contributions=plan.strokes.map(stroke=>stroke.letters).join('');
  for(const letter of plan.letters)assert.ok(contributions.includes(letter),`Letter ${letter} must contribute to the shared strokes`);
 }
});

test('personal word marks are reproducible while words, variation, and optional image can change the arrangement',()=>{
 const original=createWordSigil('I welcome a peaceful home.',0,0);
 assert.deepEqual(original,createWordSigil('I welcome a peaceful home.',0,0));
 assert.equal(original.svg,createWordSigil('  I WELCOME a PEACEFUL HOME.  ',0,0).svg);
 assert.notEqual(original.svg,createWordSigil('I invite courage and creativity.',0,0).svg);
 assert.notEqual(original.svg,createWordSigil('I welcome a peaceful home.',1,0).svg);
 assert.notEqual(original.svg,createWordSigil('I welcome a peaceful home.',0,123456).svg);
 const untrusted=createWordSigil('<script>alert(1)</script>');
 assertDrawable(untrusted);
 assert.doesNotMatch(untrusted.svg,/alert\(|<script|onerror=/);
});

test('historical catalogue has distinct entries, scoped meanings, drawing instructions, and sources',()=>{
 assert.ok(HISTORICAL_SYMBOLS.length>=20,'The library should cover a useful range of historical marks');
 assert.equal(new Set(HISTORICAL_SYMBOLS.map(mark=>mark.id)).size,HISTORICAL_SYMBOLS.length);
 for(const mark of HISTORICAL_SYMBOLS){
  for(const field of ['id','name','tradition','period','meaning'])assert.ok(typeof mark[field]==='string'&&mark[field].trim(),`${mark.id} lacks ${field}`);
  assert.ok(mark.source.title.trim());
  assert.equal(new URL(mark.source.url).protocol,'https:');
  assert.ok(mark.strokes.length>=1,`${mark.id} lacks drawing steps`);
  assertDrawable(createHistoricalSigil(mark));
 }
});

test('historical renderings preserve the catalogued strokes instead of personalizing the original form',()=>{
 for(const mark of HISTORICAL_SYMBOLS){
  const snapshot=JSON.stringify(mark);
  const plan=createHistoricalSigil(mark);
  assert.deepEqual(plan.strokes.map(stroke=>stroke.path),mark.strokes.map(stroke=>stroke.path));
  assert.equal(plan.svg,createHistoricalSigil(mark,'Different intention',99,999).svg);
  assert.equal(JSON.stringify(mark),snapshot,'Rendering must not mutate the source mark');
 }
});
