/* Pebble Skipper — stop the moving power needle inside the lake's sweet spot. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Pebble Skipper','reflex','🪨','Time each stone toss to skim the lake.','Tap the lake or press THROW when the moving needle is inside the green target zone. Land three perfect skips per pond across three ponds. Three misses or the timer ending loses the run.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;

      const bands=[{center:.5,width:.24,speed:.65},{center:.34,width:.18,speed:.9},{center:.7,width:.13,speed:1.15}];
      function pond(){
          const s=api.state;
        s.hits=0;s.needle=0;s.direction=1;s.flash=0;s.note='Wait for the green zone, then throw!';
      }
      function throwStone(){
          const s=api.state;
        if(s.ended)return;
        const b=bands[s.level-1],difference=Math.abs(s.needle-b.center);
        const good=difference<=b.width/2;
        s.flash=.42;
        if(good){
          s.hits++;
          api.addScore(25+Math.round(25*(1-difference/(b.width/2))));
          api.beep(570);
          s.note='Clean skip! '+s.hits+'/3 stones landed.';
          if(s.hits===3){
            api.addScore(50*s.level);
            if(s.level===3){api.finish(true,'Nine perfect skims! You mastered all three ponds.');return;}
            s.level++;pond();s.note='New pond. The needle moves faster!';
          }
        }else{
          s.misses++;api.beep(150);
          s.note='Splash! '+(3-s.misses)+' chances remain.';
          if(s.misses>=3)api.finish(false,'Three stones sank. Try timing the green zone.');
        }
      }
      return {
        init(){
          const s=api.state;
          s.level=1;s.t=95;s.misses=0;pond();
          api.controls([['THROW STONE','throw',true]]);
        },
        action(name){if(name==='throw')throwStone();},
        tap(){throwStone();},
        update(dt){
          const s=api.state;
          if(s.ended)return;
          const b=bands[s.level-1];
          s.needle+=s.direction*b.speed*Math.min(dt,.05);
          if(s.needle>=1){s.needle=2-s.needle;s.direction=-1;}
          if(s.needle<=0){s.needle=-s.needle;s.direction=1;}
          s.flash=Math.max(0,s.flash-dt);
        },
        timeout(){
          const s=api.state;if(!s.ended)api.finish(false,'The sun set before your final skip.');},
        draw(){
          const s=api.state;
          const b=bands[s.level-1];
          base('#14283c');
          T('PEBBLE SKIPPER',180,40,24,U.yellow);
          T('POND '+s.level+'/3   •   SKIPS '+s.hits+'/3',180,71,14,U.mint);
          T('MISSES '+s.misses+'/3',180,95,12,U.white);
          R(25,126,310,191,'#1d6074',38);
          for(let i=0;i<5;i++)S(180,218,24+i*24,'#64b8c655',2);
          if(s.flash>0)O(180,218,19+s.flash*65,'#d8f9ff66');
          T(s.flash>0?'SPLASH!':'~ ~ ~',180,223,24,'#b7f3e6');
          T('TIME YOUR THROW',180,343,14,U.white);
          R(30,365,300,23,'#34435b',11);
          R(30+300*(b.center-b.width/2),365,300*b.width,23,'#77e7a4',8);
          L(30+300*s.needle,358,30+300*s.needle,396,'#ffe58a',5);
          T('TAP ANYWHERE OR USE THROW',180,413,12,U.muted);
          T(s.note,180,438,12,U.white);
        }
      };
    }
  );
})();
