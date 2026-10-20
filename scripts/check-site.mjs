import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = root;
const files = (await readdir(site)).filter(f=>f.endsWith('.html'));
const issues=[];
const pages=[];
let checkedLinks=0;
for(const file of files){
  const html=await readFile(path.join(site,file),'utf8');
  const h1s=[...html.matchAll(/<h1\b/g)].length;
  if(h1s!==1)issues.push(`${file}: expected one H1, found ${h1s}`);
  if(!html.includes('lang="de"'))issues.push(`${file}: missing German language`);
  if(/JARVIS Controller|OSC|Vosk|Whisper|cdn-cgi|cloudflareinsights/.test(html))issues.push(`${file}: stale project copy or injected production script`);
  const assetVersions = [
    html.match(/href="style\.css\?v=([^"]+)"/)?.[1],
    html.match(/href="hud\.css\?v=([^"]+)"/)?.[1],
    html.match(/src="motion\.js\?v=([^"]+)"/)?.[1],
  ];
  if(assetVersions.some(version => !version))issues.push(`${file}: missing cache version for motion assets`);
  else if(new Set(assetVersions).size !== 1)issues.push(`${file}: motion asset cache versions do not match`);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const value=match[1];
    if(/^(https?:|mailto:|tel:|data:)/.test(value))continue;
    const [relativeWithQuery,anchor]=value.split('#');
    const relative=relativeWithQuery.split('?')[0];
    // SVG textPath references are document fragments, checked with normal anchor IDs.
    const target=path.resolve(site,relative||file);
    try{await stat(target);}catch{issues.push(`${file}: missing target ${value}`);continue;}
    if(anchor&&target.endsWith('.html')){
      const destination=target===path.join(site,file)?html:await readFile(target,'utf8');
      if(!destination.includes(`id="${anchor}"`))issues.push(`${file}: missing anchor ${value}`);
    }
    checkedLinks++;
  }
  const response=await fetch(`http://127.0.0.1:4174/${file}`);
  if(response.status!==200)issues.push(`${file}: HTTP ${response.status}`);
  pages.push({file,status:response.status,h1s});
}
const css=await readFile(path.join(site,'style.css'),'utf8');
for(const match of css.matchAll(/url\(["']?([^\)"']+)/g)){
  const value=match[1];if(/^(data:|https?:)/.test(value))continue;
  try{await stat(path.join(site,value));}catch{issues.push(`CSS missing asset: ${value}`);}
}
const result={checkedAt:new Date().toISOString(),pages,checkedLinks,issues};
console.log(JSON.stringify(result,null,2));
if(issues.length)process.exitCode=1;

