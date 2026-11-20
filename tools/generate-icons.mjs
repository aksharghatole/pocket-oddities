/* Dependency-free PNG generator for installable PWA icons. */
import {deflateSync} from 'node:zlib';
import {writeFile} from 'node:fs/promises';
const colors={bg:[21,27,54],pink:[237,144,186],dark:[40,39,74],mint:[116,242,195],gold:[255,224,140]};
function checksum(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xedb88320:c>>>1}return (c^0xffffffff)>>>0}
function chunk(type,payload){
  const n=Buffer.alloc(4),crc=Buffer.alloc(4),tag=Buffer.from(type);
  n.writeUInt32BE(payload.length);crc.writeUInt32BE(checksum(Buffer.concat([tag,payload])));
  return Buffer.concat([n,tag,payload,crc]);
}
function makeIcon(size){
  const data=Buffer.alloc(size*(size*3+1)),scale=512/size;
  for(let y=0;y<size;y++){
    const line=y*(1+size*3);data[line]=0;
    for(let x=0;x<size;x++){
      const X=(x+.5)*scale,Y=(y+.5)*scale;
      let color=colors.bg;
      if((X-256)**2+(Y-256)**2<171**2){
        color=colors.pink;
        if((X-205)**2+(Y-224)**2<20**2||(X-307)**2+(Y-224)**2<20**2)color=colors.dark;
        const nx=(X-256)/72,ny=(Y-290)/50;
        if(Y>277&&Y<336&&nx*nx+ny*ny>0.55&&nx*nx+ny*ny<1.05&&ny>=0)color=colors.dark;
      }
      const star=(cx,cy,z)=>{
        let dx=Math.abs(X-cx),dy=Math.abs(Y-cy);
        return (dx<z*.18&&dy<z)||(dy<z*.18&&dx<z)||(dx+dy<z*.95&&dx<z*.68&&dy<z*.68);
      };
      if(star(85,120,32))color=colors.mint;
      if(star(420,380,28))color=colors.gold;
      const p=line+1+x*3;
      data[p]=color[0];data[p+1]=color[1];data[p+2]=color[2];
    }
  }
  const hdr=Buffer.alloc(13);
  hdr.writeUInt32BE(size,0);hdr.writeUInt32BE(size,4);hdr[8]=8;hdr[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',deflateSync(data,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
export async function generateIcons(out){
  for(const n of [180,192,512])await writeFile(new URL('assets/icon-'+n+'.png',out),makeIcon(n));
  console.log('Generated installable 180/192/512px PNG arcade icons.');
}
