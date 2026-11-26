import assert from 'node:assert/strict';
import {cp,copyFile,mkdir,readFile,rm,stat,writeFile} from 'node:fs/promises';
import {generateIcons} from './generate-icons.mjs';
import {expandAutoPacks,readAutoPacks} from './auto-packs.mjs';
const root=new URL('../',import.meta.url),out=new URL('../www/',import.meta.url);
const config=JSON.parse(await readFile(new URL('capacitor.config.json',root),'utf8'));
assert.equal(config.webDir,'www','Capacitor webDir must match the generated bundle');

await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const f of ['games.js','achievements.js','styles.css','manifest.webmanifest'])await copyFile(new URL(f,root),new URL(f,out));
await cp(new URL('assets/',root),new URL('assets/',out),{recursive:true});
await cp(new URL('game-packs/',root),new URL('game-packs/',out),{recursive:true});
await generateIcons(out);
const readOutput=file=>readFile(new URL(file,out),'utf8');
const [sourceHtml,manifestText,sourceWorker]=await Promise.all([
  readFile(new URL('index.html',root),'utf8'),
  readOutput('manifest.webmanifest'),
  readFile(new URL('sw.js',root),'utf8')
]);
const {html,worker}=expandAutoPacks(sourceHtml,sourceWorker,readAutoPacks(root));
await Promise.all([writeFile(new URL('index.html',out),html),writeFile(new URL('sw.js',out),worker)]);
const manifest=JSON.parse(manifestText);
const launcherAssets=[...html.matchAll(/\s(?:src|href)=["'](\.\/[^"']+)["']/g)].map(match=>match[1]);
const precache=worker.match(/const PRECACHE=\[([^\]]*)\];/);
assert.ok(precache,'Missing service worker precache list');
const offlineAssets=[...precache[1].matchAll(/['"]([^'"]+)['"]/g)].map(match=>match[1]);
const references=new Set([...launcherAssets,manifest.start_url,...manifest.icons.map(icon=>icon.src),...offlineAssets]);
for(const reference of references){
  const asset=new URL(reference,out);
  assert.ok(asset.href.startsWith(out.href),'Web asset must be inside www/: '+reference);
  if(asset.href===out.href)continue;
  const file=await stat(asset).catch(error=>{
    if(error.code!=='ENOENT')throw error;
    throw new Error('Missing web asset in www/: '+reference,{cause:error});
  });
  assert.ok(file.isFile(),'Web asset must be a file: '+reference);
}

console.log('Created www/ with production web assets for Capacitor.');
