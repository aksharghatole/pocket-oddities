/* Shadow Stamp — recreate the mirrored half of a tiny pixel print. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Shadow Stamp','puzzle','🪞','Restore three mirrored pixel stamps, one square at a time.','The left four columns are the original. Tap squares on the right to paint their mirror image. Tap again to erase. Match every square before your ink budget or 120-second timer runs out.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const patterns=[
        ['1000','1100','0110','0011','0110','1100'],
        ['1010','1110','0101','1011','0111','0101'],
        ['1101','0111','1010','1111','0011','1101']
      ];
      const budgets=[15,19,23];
      const size=34, ox=44, oy=113, rows=6, half=4;
      function start(s) {
        s.target=patterns[s.level-1].map(row=>row.split('').map(Number));
        s.paint=Array.from({length:rows},()=>Array(half).fill(0));
        s.ink=budgets[s.level-1];
        s.note='Mirror the left stamp on the right.';
      }
      function correct(s) {
        return s.paint.every((row,y)=>row.every((v,x)=>v===s.target[y][half-1-x]));
      }
      function paint(x,y) {
        const s=api.state;
        if(s.ended)return;
        const c=Math.floor((x-ox)/size),r=Math.floor((y-oy)/size);
        if(c<half||c>=half*2||r<0||r>=rows||x<ox||y<oy)return;
        if(s.ink<=0)return;
        s.paint[r][c-half]^=1;s.ink--;
        api.beep(s.paint[r][c-half]?420:270);
        if(correct(s)) {
          api.addScore(100+s.ink*10+s.level*20);
          if(s.level===patterns.length)api.finish(true,'All three shadow stamps restored!');
          else {s.level++;start(s);s.note='Perfect print! Now restore the next stamp.';}
        } else if(s.ink===0)api.finish(false,'Out of ink! The shadow stamp remains unfinished.');
        else s.note=s.ink+' taps of ink remaining.';
      }
      return {
        init(){const s=api.state;s.t=120;s.level=1;start(s);api.controls([]);},
        tap:paint,
        timeout(){if(!api.state.ended)api.finish(false,'The ink dried before the final stamp.');},
        draw(){
          const s=api.state;base('#151b34');
          T('SHADOW STAMP',180,35,23,U.mint);
          T('PRINT '+s.level+'/3  •  INK '+s.ink,180,65,15,U.yellow);
          T('ORIGINAL',110,96,13,U.white);
          T('YOUR MIRROR',249,96,13,U.white);
          for(let r=0;r<rows;r++)for(let c=0;c<half*2;c++){
            const left=c<half;
            const on=left?s.target[r][c]:s.paint[r][c-half];
            const x=ox+c*size,y=oy+r*size;
            R(x+2,y+2,size-4,size-4,on?(left?'#76ddc6':'#ffd17b'):'#293753',5);
          }
          R(177,oy-3,6,rows*size+6,'#627394',3);
          R(20,350,320,82,'#273653',12);
          T('Tap right-side squares to toggle ink.',180,377,14,U.white);
          T('Every painted square must mirror the left.',180,400,12,U.muted);
          T(s.note,180,422,12,U.yellow);
        }
      };
    }
  );
})();
