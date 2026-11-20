/* Pocket Elevator — tiny dispatch strategy with impatient passengers. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Pocket Elevator','strategy','🛗','Run a three-floor elevator for tiny impatient commuters.','Tap floor 1, 2 or 3 to move. Pick up waiting passengers, then take them to the numbered destination shown inside the elevator. Deliver 8 passengers before time runs out; 3 abandoned passengers end your shift.'],
    api => {
      const {base,R,O,L,T}=api.art, C=api.colors, {irnd}=api.helpers;
      const floorY=f=>350-(f-1)*103;
      const buttons=[{floor:3,y:145},{floor:2,y:248},{floor:1,y:351}];
      const goal=8;
      function spawn(s) {
        if(s.waiting.length>=3)return;
        const from=irnd(1,3);
        let to=irnd(1,2);
        if(to>=from)to++;
        s.waiting.push({id:s.nextId++,from,to,patience:19});
      }
      function arrive(s) {
        s.floor=s.target;
        s.moving=0;
        if(s.rider&&s.rider.to===s.floor) {
          s.delivered++;
          api.addScore(20+Math.max(0,Math.ceil(s.rider.patience)));
          s.note='Delivered to floor '+s.floor+'!';
          s.rider=null;
          api.beep(740);
          if(s.delivered>=goal) {
            api.finish(true,'Eight commuters delivered! Your tiny elevator earned its golden bell.');
            return;
          }
        }
        if(!s.rider) {
          const i=s.waiting.findIndex(p=>p.from===s.floor);
          if(i>=0) {
            s.rider=s.waiting.splice(i,1)[0];
            s.note='Passenger aboard: go to floor '+s.rider.to+'.';
            api.beep(540);
          }
        }
        if(!s.rider&&s.waiting.length===0)spawn(s);
      }
      function select(floor) {
        const s=api.state;
        if(s.ended||s.moving>0||floor===s.floor)return;
        s.target=floor;
        s.moving=Math.abs(s.floor-floor)*0.85;
        s.travel=s.moving;
        s.note='Travelling to floor '+floor+'…';
      }
      return {
        init() {
          const s=api.state;
          s.t=100;s.level=1;s.floor=1;s.target=1;s.moving=0;s.travel=0;
          s.delivered=0;s.missed=0;s.nextId=1;s.waiting=[];s.rider=null;
          s.spawnTimer=5;s.note='Tap a floor to collect your first passenger.';
          spawn(s);spawn(s);
          api.controls([['Floor 1','floor1',false],['Floor 2','floor2',false],['Floor 3','floor3',true]]);
          arrive(s);
        },
        action(name) {
          const f=Number(name.replace('floor',''));
          if(Number.isInteger(f)&&f>=1&&f<=3)select(f);
        },
        tap(x,y) {
          if(x<255||x>348)return;
          for(const b of buttons)if(Math.abs(y-b.y)<=38){select(b.floor);return;}
        },
        update(dt) {
          const s=api.state;
          if(s.ended)return;
          if(s.moving>0) {
            s.moving=Math.max(0,s.moving-dt);
            if(s.moving===0){arrive(s);if(s.ended)return;}
          }
          s.spawnTimer-=dt;
          if(s.spawnTimer<=0){s.spawnTimer+=7;spawn(s);}
          for(let i=s.waiting.length-1;i>=0;i--) {
            const p=s.waiting[i];p.patience-=dt;
            if(p.patience<=0) {
              s.waiting.splice(i,1);s.missed++;
              s.note='A commuter gave up! '+(3-s.missed)+' chances left.';
              api.beep(180);
              if(s.missed>=3){api.finish(false,'Three commuters walked away. Your shift is over.');return;}
            }
          }
          s.level=1+Math.floor(s.delivered/2);
        },
        timeout(){if(!api.state.ended)api.finish(false,'Closing time! Deliver all eight commuters to win.');},
        draw() {
          const s=api.state;
          base('#141c31');
          T('POCKET ELEVATOR',180,27,22,C.mint);
          T('DELIVERED '+s.delivered+'/'+goal+'   •   LOST '+s.missed+'/3',180,57,13,C.yellow);
          T(s.rider?'ON BOARD → FLOOR '+s.rider.to:'EMPTY CAB · COLLECT A RIDER',180,84,13,C.white);
          for(let floor=1;floor<=3;floor++) {
            const y=floorY(floor);
            R(14,y-43,234,88,'#283751',9);
            R(17,y+38,228,5,'#61718d',2);
            T(String(floor),34,y,25,C.muted);
            const queue=s.waiting.filter(p=>p.from===floor);
            queue.forEach((p,i)=>{
              const px=86+i*53;
              O(px,y-5,15,'#f6bb83');
              R(px-13,y+12,26,22,'#87d3b6',7);
              T('→'+p.to,px,y+26,12,'#18243a');
              R(px-21,y-34,42,5,'#45536a',2);
              R(px-21,y-34,42*Math.max(0,p.patience/19),5,p.patience<6?C.red:C.mint,2);
            });
          }
          const progress=s.travel>0?s.moving/s.travel:0;
          const carY=s.moving>0?floorY(s.target)+(floorY(s.floor)-floorY(s.target))*progress:floorY(s.floor);
          R(194,101,48,295,'#10182b',6);
          R(197,carY-34,42,67,'#91baff',8);
          R(202,carY-29,32,56,'#263e64',5);
          if(s.rider){O(218,carY-10,11,'#f6bb83');R(208,carY+2,20,18,'#f589ac',5);}
          else T('↕',218,carY,23,C.white);
          for(const b of buttons) {
            R(258,b.y-33,87,66,s.target===b.floor?C.mint:'#374763',12);
            T('FLOOR',301,b.y-12,11,s.target===b.floor?'#17283a':C.muted);
            T(b.floor,301,b.y+12,25,s.target===b.floor?'#17283a':C.white);
          }
          R(15,405,330,34,'#2c3954',9);
          T(s.note,180,422,11,C.white);
        }
      };
    }
  );
})();
