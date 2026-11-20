import {cp,copyFile,mkdir,rm} from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('../www/',import.meta.url);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const f of ['index.html','games.js','styles.css','manifest.webmanifest','sw.js'])await copyFile(new URL(f,root),new URL(f,out));
await cp(new URL('assets/',root),new URL('assets/',out),{recursive:true});
await cp(new URL('game-packs/',root),new URL('game-packs/',out),{recursive:true});
console.log('Created www/ with production web assets for Capacitor.');
