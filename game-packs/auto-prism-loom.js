/* Prism Loom — reconstruct a woven pattern from row and column phases. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Prism Loom','puzzle','🧵','Weave a target mosaic using intersecting three-phase threads.','Tap a row spool or column spool to cycle its phase: circle, diamond, triangle. Each crossing combines both phases (0 + 1 + 2, wrapping at 3). Match every square to its small target symbol. Complete three patterns within the move budgets.'],
    api => {
      const {base,R,O,S,L,T}=api.art;
      const ink=['#6edac8','#ffc979','#b8a0ff'], glyph=['●','◆','▲'];
      const patterns=[
        {r:[1,0,1,0],c:[0,1,0,1],limit:9},
        {r:[2,0,1,2],c:[1,2,0,1],limit:14},
        {r:[2,1,2,0],c:[2,0,1,2],limit:15}
      ];
      const X=76,Y=190,D=54;
      const phase=(r,c)=>(r+c)%3;
      function target(s,r,c){const p=patterns[s.level-1];return phase(p.r[r],p.c[c]);}
      function matches(s){let n=0;for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(phase(s.rows[r],s.cols[c])===target(s,r,c))n++;return n;}
      function reset(s){s.rows=[0,0,0,0];s.cols=[0,0,0,0];s.moves=0;s.flash=0;s.axis='';s.index=-1;s.note='Cycle the spools to match each small symbol.';}
      function finishLater(s,won,message){
        s.pending=true;
        // Let the synthetic touch click settle before displaying the overlay.
        setTimeout(()=>{if(api.state===s&&!s.ended&&s.pending)api.finish(won,message);},180);
      }
      function cycle(axis,i){
        const s=api.state;
        if(s.ended||s.pending||i<0||i>=4)return;
        const a=axis==='row'?s.rows:s.cols;
        a[i]=(a[i]+1)%3;s.moves++;s.axis=axis;s.index=i;s.flash=1;
        const n=matches(s),left=patterns[s.level-1].limit-s.moves;
        api.beep(300+80*a[i]+n*12);
        if(n===16){
          api.addScore(160+left*15);api.beep(780);
          if(s.level===patterns.length){s.note='All patterns woven!';finishLater(s,true,'Three prism patterns woven perfectly!');return;}
          s.level++;reset(s);s.note='Pattern complete! A new weave awaits.';return;
        }
        if(left===0){s.note='No moves left.';finishLater(s,false,'The loom ran out of moves. Try a different weave.');return;}
        s.note=n+'/16 matched · '+left+' moves left';
      }
      function spool(x,y,v){
        R(x,y,46,46,'#303b52',10);R(x+4,y+4,38,38,'#192435',8);
        T(glyph[v],x+23,y+23,23,ink[v]);
      }
      return {
        init(){const s=api.state;s.t=180;s.level=1;s.pending=false;reset(s);api.controls([]);},
        tap(x,y){
          if(x>=X&&x<X+4*D&&y>=136&&y<184)cycle('col',Math.floor((x-X)/D));
          else if(x>=20&&x<70&&y>=Y&&y<Y+4*D)cycle('row',Math.floor((y-Y)/D));
        },
        update(dt){const s=api.state;s.flash=Math.max(0,s.flash-dt*3);},
        timeout(){const s=api.state;if(!s.ended&&!s.pending)api.finish(false,'The workshop closed before the patterns were woven.');},
        draw(){
          const s=api.state,p=patterns[s.level-1],n=matches(s);
          base('#142034');
          T('PRISM LOOM',180,28,26,'#d9f5ef');
          T('PATTERN '+s.level+'/3  ·  '+(p.limit-s.moves)+' MOVES LEFT',180,59,14,'#ffc979');
          R(20,76,320,37,'#26364b',9);
          R(27,83,Math.max(0,306*n/16),23,'#245b59',7);
          T(n+'/16 CROSSINGS MATCHED',180,95,13,'#ffffff');
          T('COLUMN SPOOLS',184,125,11,'#a4b7d0');
          for(let i=0;i<4;i++){
            spool(X+i*D+4,137,s.cols[i]);spool(22,Y+i*D+4,s.rows[i]);
            L(X+i*D+27,183,X+i*D+27,406,ink[s.cols[i]],2);
            L(68,Y+i*D+27,292,Y+i*D+27,ink[s.rows[i]],2);
          }
          for(let r=0;r<4;r++)for(let c=0;c<4;c++){
            const v=phase(s.rows[r],s.cols[c]),goal=target(s,r,c),ok=v===goal;
            const x=X+c*D+3,y=Y+r*D+3;
            R(x,y,48,48,ok?'#244b49':'#30384b',8);
            if(s.flash>0&&((s.axis==='row'&&s.index===r)||(s.axis==='col'&&s.index===c)))S(x+24,y+24,21,'#9cbad0',1);
            T(glyph[v],x+21,y+20,24,ink[v]);
            T(glyph[goal],x+36,y+36,13,ink[goal]);
            if(ok)T('✓',x+9,y+37,10,'#a5f1d5');
          }
          T('LARGE = WOVEN   ·   SMALL = TARGET',180,419,11,'#a4b7d0');
          T(s.note,180,439,11,'#ffffff');
        }
      };
    }
  );
})();
