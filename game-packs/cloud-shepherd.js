/* Cloud Shepherd — steer a rain cloud to revive gardens without flooding mushrooms. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Cloud Shepherd','strategy','🌧️','Move a tiny rain cloud and water thirsty flowers without soaking mushrooms.','Tap a garden lane to move the cloud there. Tap RAIN to water it. Flowers need two drops; mushrooms must stay dry. Save three gardens before the clock runs out.'],
    api => {
      const {base,R,O,L,T}=api.art, U=api.colors;
      const lanes=[48,114,180,246,312];
      const layouts=[
        [1,0,1,0,1],
        [0,1,1,0,1],
        [1,0,0,1,1]
      ];
      const gardenY=294;
      function startGarden(s){
        s.lane=2;
        s.plants=layouts[s.level-1].map(kind=>({kind,water:0}));
        s.note='Tap a flower lane, then RAIN.';
        s.cooldown=0;
      }
      function rain(){
        const s=api.state;
        if(s.ended||s.cooldown>0)return;
        s.cooldown=.45;
        const p=s.plants[s.lane];
        if(!p.kind){
          s.mistakes++;
          api.beep(165);
          s.note='Mushroom soaked! '+(3-s.mistakes)+' mistakes left.';
          if(s.mistakes>=3)api.finish(false,'Too many mushrooms were flooded. Try another route.');
          return;
        }
        if(p.water>=2){
          s.note='That flower is already blooming. Choose another.';
          return;
        }
        p.water++;
        api.addScore(10);
        api.beep(490+p.water*90);
        s.note=p.water===2?'Flower revived! Find the next thirsty one.':'One more drop for this flower.';
        if(s.plants.every(q=>!q.kind||q.water===2)){
          api.addScore(25);
          if(s.level===3){
            api.finish(true,'All three gardens are blooming. You are the cloud keeper!');
          }else{
            s.level++;
            startGarden(s);
            s.note='Garden '+s.level+'/3 — new flowers need rain!';
          }
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=95;s.level=1;s.mistakes=0;
          startGarden(s);
          api.controls([['☂ RAIN','rain',true]]);
        },
        tap(x,y){
          const s=api.state;
          if(s.ended)return;
          if(y<130||y>390)return;
          s.lane=Math.max(0,Math.min(4,Math.round((x-48)/66)));
          s.note=s.plants[s.lane].kind?'Flower selected. Press RAIN.':'Mushroom selected — do not rain!';
        },
        action(name){if(name==='rain')rain();},
        update(dt){const s=api.state;s.cooldown=Math.max(0,s.cooldown-dt);},
        timeout(){api.finish(false,'The dry season arrived before all gardens bloomed.');},
        draw(){
          const s=api.state;
          base('#17273b');
          T('CLOUD SHEPHERD',180,35,22,U.mint);
          T('GARDEN '+s.level+'/3  ·  MISTAKES '+s.mistakes+'/3',180,65,13,U.yellow);
          T('TAP A LANE · PRESS RAIN',180,92,12,U.white);
          R(18,258,324,107,'#365b50',15);
          for(let i=0;i<5;i++){
            const x=lanes[i],p=s.plants[i];
            R(x-28,137,56,229,i===s.lane?'#ffffff19':'#ffffff08',12);
            if(i===s.lane){
              O(x-15,166,21,'#b9d9e8');
              O(x+5,157,25,'#e5f4fa');
              O(x+22,169,18,'#b9d9e8');
              R(x-26,168,52,17,'#d4eaf2',8);
              for(let d=0;d<3;d++)L(x-14+d*14,193,x-18+d*14,207,'#7ac8ff',3);
            }
            R(x-25,gardenY+31,50,13,'#2b4539',7);
            if(p.kind){
              L(x,gardenY+26,x,gardenY-4,'#75c68a',4);
              if(p.water===2){
                for(let a=0;a<5;a++){
                  const rad=a*Math.PI*2/5;
                  O(x+Math.cos(rad)*13,gardenY-13+Math.sin(rad)*13,8,'#ffce79');
                }
                O(x,gardenY-13,8,'#f6a5b7');
              }else{
                O(x,gardenY-9,9,p.water?'#a5d6a2':'#9a8d7b');
                T(p.water+'/2',x,gardenY+49,12,U.white);
              }
            }else{
              R(x-13,gardenY+1,26,21,'#e4d5bd',5);
              O(x,gardenY-4,19,'#d4a4cb');
              O(x-7,gardenY-8,3,'#fff4ef');
              O(x+7,gardenY-3,3,'#fff4ef');
            }
          }
          R(20,386,320,43,'#293e53',10);
          T(s.note,180,407,11,U.white);
          T('BLOOMS '+s.plants.filter(p=>p.kind&&p.water===2).length+'/3  ·  RAIN '+(s.cooldown>0?'RECHARGING':'READY'),180,443,11,U.muted);
        }
      };
    }
  );
})();
