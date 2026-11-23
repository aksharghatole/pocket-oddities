/* Forgery Finder — inspect two stamp sheets and tap the altered mark. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Forgery Finder','puzzle','🔎','Inspect twin stamp sheets and catch the one altered seal.','Compare the LEFT original with the RIGHT suspect sheet. Tap the one different stamp on the RIGHT. Find four forgeries before three mistakes or the clock runs out.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors;
      const {irnd}=api.helpers;
      const symbols=['◆','●','▲','★','✚','♥'];
      const left=20,right=194,top=133,cell=36,n=4;
      function newSheet(s){
        s.original=Array.from({length:16},()=>irnd(0,symbols.length-1));
        s.changed=irnd(0,15);
        s.suspect=s.original.slice();
        s.suspect[s.changed]=(s.original[s.changed]+irnd(1,symbols.length-1))%symbols.length;
        s.note='One seal is different. Inspect the right sheet.';
      }
      function select(x,y){
        const s=api.state;
        if(s.ended)return;
        const col=Math.floor((x-right)/cell),row=Math.floor((y-top)/cell);
        if(col<0||col>=n||row<0||row>=n)return;
        const idx=row*n+col;
        if(idx===s.changed){
          api.addScore(60+s.level*15);
          api.beep(580);
          if(s.level===4){api.finish(true,'All four counterfeit seals uncovered. The museum is safe!');return;}
          s.level++;
          newSheet(s);
          s.note='Forgery found! Inspect sheet '+s.level+'.';
        }else{
          s.mistakes++;
          api.beep(170);
          if(s.mistakes>=3){api.finish(false,'Three false accusations. The forger escaped!');return;}
          s.note='That seal matches. '+(3-s.mistakes)+' chances left.';
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=100;s.level=1;s.mistakes=0;
          newSheet(s);
          api.controls([]);
        },
        tap:select,
        timeout(){if(!api.state.ended)api.finish(false,'Inspection time is over. Try again!');},
        draw(){
          const s=api.state;
          base('#151c30');
          T('FORGERY FINDER',180,39,23,U.yellow);
          T('SHEET '+s.level+'/4   •   ERRORS '+s.mistakes+'/3',180,69,14,U.mint);
          T('FIND THE ALTERED STAMP ON THE RIGHT',180,98,12,U.white);
          [[left,s.original,'ORIGINAL'],[right,s.suspect,'SUSPECT']].forEach(([x,arr,label])=>{
            T(label,x+72,121,13,U.yellow);
            R(x-3,top-3,150,150,'#34405c',9);
            arr.forEach((symbol,i)=>{
              const cx=x+(i%4)*cell+cell/2,cy=top+Math.floor(i/4)*cell+cell/2;
              R(cx-16,cy-16,32,32,(Math.floor(i/4)+i%4)%2?'#e7d8ae':'#f5eacb',4);
              T(symbols[symbol],cx,cy+5,20,'#344263');
            });
          });
          R(22,319,316,92,'#273550',13);
          T('INSPECT THE SHAPES',180,343,15,U.mint);
          T('Only one symbol has been replaced.',180,367,13,U.white);
          T(s.note,180,394,11,U.yellow);
          T('Tap a square in the RIGHT sheet',180,432,12,U.muted);
        }
      };
    }
  );
})();
