/* River Rules — three tiny logic crossings with a one-seat ferry. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['River Rules','strategy','⛵','Ferry strange cargo across a river without leaving dangerous pairs alone.','Tap a cargo card on the boat shore to load or unload it, then tap SAIL. The boat holds one item. Never leave either forbidden pair together without the ferryman. Complete three crossings; three unsafe trips or the timer ending loses.'],
    api => {
      const {base,R,O,L,T}=api.art, C=api.colors;
      const puzzles=[
        {items:['Fox','Hen','Grain'],bad:[[0,1],[1,2]],hint:'Fox + Hen  /  Hen + Grain'},
        {items:['Spark','Paper','Water'],bad:[[0,1],[1,2]],hint:'Spark + Paper  /  Paper + Water'},
        {items:['Moth','Lantern','Silk'],bad:[[0,1],[1,2]],hint:'Moth + Lantern  /  Lantern + Silk'}
      ];
      function setup(s){
        s.boat=0;s.pos=[0,0,0];s.cargo=-1;s.trips=0;
        s.note='Load one item, then sail.';
      }
      function select(i){
        const s=api.state;
        if(s.ended||i<0||i>2)return;
        if(s.cargo===i){s.cargo=-1;s.note='Cargo unloaded.';return;}
        if(s.pos[i]!==s.boat){s.note='That item is on the other shore.';return;}
        s.cargo=i;s.note=puzzles[s.level-1].items[i]+' aboard. Tap SAIL.';
        api.beep(440);
      }
      function unsafe(s){
        const p=puzzles[s.level-1];
        return p.bad.some(([a,b])=>s.pos[a]===s.pos[b]&&s.pos[a]!==s.boat);
      }
      function sail(){
        const s=api.state;
        if(s.ended)return;
        s.boat=1-s.boat;
        if(s.cargo>=0)s.pos[s.cargo]=s.boat;
        s.cargo=-1;s.trips++;
        if(unsafe(s)){
          s.mistakes++;api.beep(160);
          if(s.mistakes>=3){api.finish(false,'Three unsafe crossings! The river has won.');return;}
          setup(s);s.note='Unsafe pair left alone! Crossing reset. '+(3-s.mistakes)+' chances remain.';
          return;
        }
        api.addScore(10);api.beep(610);
        if(s.pos.every(p=>p===1)){
          api.addScore(Math.max(20,100-s.trips*5));
          if(s.level===puzzles.length){
            api.finish(true,'Every strange passenger reached the far bank safely!');
          }else{
            s.level++;setup(s);s.note='Safe delivery! A new river awaits.';
          }
          return;
        }
        s.note='Safe crossing. Plan the next trip.';
      }
      return {
        init(){
          const s=api.state;s.t=210;s.level=1;s.mistakes=0;setup(s);
          api.controls([['ITEM 1','item0'],['ITEM 2','item1'],['ITEM 3','item2'],['SAIL ⛵','sail',true]]);
        },
        action(name){
          if(name==='sail')sail();
          else if(/^item[0-2]$/.test(name))select(Number(name.slice(-1)));
        },
        tap(x,y){
          if(y>=324&&y<=385){sail();return;}
          if(y<137||y>304)return;
          const s=api.state,shore=s.boat===0?75:285;
          if(Math.abs(x-shore)>65)return;
          const i=Math.round((y-169)/55);
          if(i>=0&&i<3&&Math.abs(y-(169+i*55))<=23)select(i);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The ferry closed before all three deliveries.');},
        draw(){
          const s=api.state,p=puzzles[s.level-1];
          base('#122438');
          T('RIVER RULES',180,33,24,C.mint);
          T('CROSSING '+s.level+'/3  ·  ERRORS '+s.mistakes+'/3',180,64,13,C.yellow);
          T('Never leave these pairs alone:',180,91,12,C.white);
          T(p.hint,180,111,11,C.yellow);
          R(130,128,100,191,'#27678d',14);
          for(let i=0;i<5;i++)L(141,145+i*36,218,145+i*36,'#65b5c4',2);
          T('START',72,137,12,C.muted);T('SAFE',288,137,12,C.muted);
          p.items.forEach((name,i)=>{
            const x=s.pos[i]===0?75:285,y=169+i*55;
            R(x-53,y-22,106,44,s.cargo===i?'#ffdc85':'#354861',10);
            T(name,x,y+5,15,s.cargo===i?'#202b39':C.white);
          });
          R(s.boat===0?116:211,277,33,36,'#c68d56',8);
          T('⛵',s.boat===0?132:228,302,24,C.white);
          R(65,324,230,61,'#4cbea5',15);
          T('SAIL  '+(s.boat===0?'→':'←'),180,362,24,'#102a35');
          T('BOAT: '+(s.cargo<0?'EMPTY':p.items[s.cargo])+'  ·  TRIPS '+s.trips,180,405,12,C.yellow);
          T(s.note,180,428,11,C.white);
        }
      };
    }
  );
})();
