import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {APP_FILES} from './static-files.mjs';
const project=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const root=path.resolve(project,process.env.MAJIKMAKER_STATIC_DIRECTORY||'.');
const basePath=process.env.MAJIKMAKER_BASE_PATH||'/';
if(!basePath.startsWith('/')||!basePath.endsWith('/')||basePath.includes('..')||basePath.includes('?')||basePath.includes('#'))throw Error('Invalid app base path');
const publicFiles=new Set(APP_FILES);
const port=Number(process.env.PORT||4173);
const host=process.env.MAJIKMAKER_HOST||'127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith(basePath)){res.writeHead(404).end('Not found');return;}
  const name=pathname.slice(basePath.length)||'index.html';
  if(!publicFiles.has(name)){res.writeHead(404).end('Not found');return;}
  const target=path.resolve(root,name);
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
  if(!(await stat(target)).isFile()){res.writeHead(404).end('Not found');return;}
  const body=await readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:400).end('Not found');}
});
server.listen(port,host,()=>console.log(`Majik Maker: http://${host}:${port}${basePath}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
