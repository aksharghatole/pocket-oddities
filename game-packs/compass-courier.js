/* Compass Courier — translate relative route cards into compass directions. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Compass Courier','puzzle','🧭','Deliver tiny parcels by following turns relative to your current heading.','Read the route card: FORWARD, LEFT, or RIGHT means relative to the arrow pointing where you face. Tap the correct compass direction. Finish three deliveries; three wrong turns or running out of time ends the route.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const labels=['N','E','S','W'];
      const cards=[
        ['FORWARD','RIGHT','FORWARD','LEFT'],
        ['LEFT','FORWARD','RIGHT','RIGHT','FORWARD'],
        ['RIGHT','RIGHT','LEFT','FORWARD','LEFT','FORWARD']
      ];
      const spots=[[180,169],[264,250],[180,331],[96,250]];
      function setup(s){
        s.heading=(s.level+2)%4;
        s.step=0;
        s.note='Read the card, then choose a direction.';
      }
      function expected(s){
        const card=cards[s.level-1][s.step];
        return (s.heading+(card==='RIGHT'?1:card==='LEFT'?3:0))%4;
      }
      function choose(direction){
        const s=api.state;
        if(s.ended || direction<0 || direction>3)return;
        if(direction!==expected(s)){
          s.errors++;s.note='Wrong turn! '+(3-s.errors)+' chances left.';
          api.beep(165);
          if(s.errors>=3)api.finish(false,'The courier got lost. Try the route again.');
          return;
        }
        s.heading=direction;s.step++;api.addScore(20+s.level*5);
        api.beep(440);
        if(s.step===cards[s.level-1].length){
          api.addScore(60);
          if(s.level===cards.length){
            api.finish(true,'All three parcels delivered! The compass never lied.');
          }else{
            s.level++;setup(s);s.note='Parcel delivered! A new route begins.';
          }
        }else s.note='Nice turn. Follow the next card.';
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=100;s.errors=0;
          setup(s);api.controls([]);
        },
        tap(x,y){
          for(let i=0;i<spots.length;i++){
            if(Math.hypot(x-spots[i][0],y-spots[i][1])<=39){choose(i);return;}
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The delivery window closed.');},
        draw(){
          const s=api.state;
          base('#111d31');
          T('COMPASS COURIER',180,34,22,U.mint);
          T('PARCEL '+s.level+'/3  •  WRONG '+s.errors+'/3',180,60,13,U.yellow);
          R(35,78,290,57,'#2b3b56',12);
          T('ROUTE CARD '+(s.step+1)+'/'+cards[s.level-1].length,180,98,12,U.white);
          T(cards[s.level-1][s.step]||'DELIVERED',180,122,21,U.yellow);
          O(180,250,99,'#263851');S(180,250,99,U.muted,2);
          L(180,250,spots[s.heading][0],spots[s.heading][1],U.mint,6);
          O(180,250,13,U.mint);
          spots.forEach(([x,y],i)=>{
            O(x,y,35,'#456080');S(x,y,35,U.white,2);
            T(labels[i],x,y+7,23,U.white);
          });
          T('FACING '+labels[s.heading]+'  •  TAP YOUR NEXT HEADING',180,371,13,U.yellow);
          R(22,391,316,44,'#263851',10);
          T(s.note,180,418,12,U.white);
        }
      };
    }
  );
})();
