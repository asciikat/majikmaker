const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
test('branch publishing and built Pages output both open the app directly',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/id="symbolForm"/);assert.match(html,/<title>Majik Maker — Intention Studio<\/title>/);
 assert.ok(fs.existsSync(path.join(root,'.nojekyll')));
 assert.equal(fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),html);
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const ref=match[1].split('?')[0];if(ref==='./'||ref.startsWith('data:')||/^https?:/.test(ref))continue;
  assert.ok(fs.existsSync(path.join(root,ref)),`Missing branch asset ${ref}`);
  assert.deepEqual(fs.readFileSync(path.join(root,'dist',ref)),fs.readFileSync(path.join(root,ref)),`Built asset differs: ${ref}`);
 }
 assert.ok(fs.existsSync(path.join(root,'dist/.nojekyll')));
 for(const forbidden of ['README.md','package.json','scripts','tests'])assert.ok(!fs.existsSync(path.join(root,'dist',forbidden)),`Development file published: ${forbidden}`);
});
