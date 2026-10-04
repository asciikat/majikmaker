import {cp,mkdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {APP_FILES} from './static-files.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const output=path.join(root,'dist');
await rm(output,{recursive:true,force:true});
for(const file of APP_FILES){const destination=path.join(output,file);await mkdir(path.dirname(destination),{recursive:true});await cp(path.join(root,file),destination);}
console.log('Built Majik Maker into dist/');
