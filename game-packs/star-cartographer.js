/* Star Cartographer — connect numbered stars in order before the night fades. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Star Cartographer','puzzle','🌌','Trace three secret constellations by connecting stars in order.','Tap stars in ascending number order, starting at 1. Complete three star maps before time runs out. Three wrong stars end the voyage.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const maps=[
        [[76,164],[176,113],[284,170],[243,289],[106,314]],
        [[83,123],[247,119],[295,216],[201,312],[75,279],[157,208]],
        [[64,157],[155,103],[273,136],[293,253],[198,329],[91,317],[180,215]]
      ];
      function startMap(s) {
        s.points=maps[s.level-1].map(([x,y],i)=>({x,y,n:i+1}));
        s.next=1;s.note='Find star 1 to begin the trail.';
      }
      function choose(x,y) {
        const s=api.state;
        if(s.ended)return;
        const hit=s.points.find(p=>Math.hypot(p.x-x,p.y-y)<=27);
        if(!hit)return;
        if(hit.n<s.next)return;
        if(hit.n!==s.next){
          s.mistakes++;s.note='Wrong star! '+(3-s.mistakes)+' chances remain.';
          api.beep(160);
          if(s.mistakes>=3)api.finish(false,'The star chart was lost. Try another voyage.');
          return;
        }
        s.next++;api.addScore(20+s.level*5);api.beep(360+hit.n*45);
        if(s.next>s.points.length){
          api.addScore(75);
          if(s.level===maps.length){
            api.finish(true,'All three constellations mapped. The sky remembers your route!');
          }else{
            s.level++;startMap(s);
            s.note='New sky discovered! Begin again at star 1.';
          }
        }else s.note='Great! Find star '+s.next+'.';
      }
      return {
        init(){
          const s=api.state;s.t=95;s.level=1;s.mistakes=0;
          startMap(s);api.controls([]);
        },
        tap:choose,
        timeout(){if(!api.state.ended)api.finish(false,'Dawn arrived before the final constellation.');},
        draw(){
          const s=api.state;
          base('#0e1831');
          for(let i=0;i<34;i++){
            const x=(i*83+31)%354+3,y=(i*137+61)%350+58;
            O(x,y,i%4===0?2:1,'#7184b1');
          }
          T('STAR CARTOGRAPHER',180,36,22,U.mint);
          T('SKY '+s.level+'/3  •  ERRORS '+s.mistakes+'/3',180,65,14,U.yellow);
          for(let i=1;i<s.next-1;i++){
            const a=s.points[i-1],b=s.points[i];
            L(a.x,a.y,b.x,b.y,U.mint,4);
          }
          s.points.forEach(p=>{
            const done=p.n<s.next,active=p.n===s.next;
            if(active)S(p.x,p.y,27,U.yellow,2);
            O(p.x,p.y,21,done?'#3b9e91':'#3c4f80');
            S(p.x,p.y,21,done?U.mint:U.white,2);
            T(String(p.n),p.x,p.y+5,17,U.white);
          });
          R(22,377,316,59,'#273653',12);
          T('CONNECTED '+(s.next-1)+'/'+s.points.length,180,398,15,U.yellow);
          T(s.note,180,421,12,U.white);
        }
      };
    }
  );
})();
