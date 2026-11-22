/* Firefly Orchard — catch drifting fireflies only inside the lantern's glow. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Firefly Orchard','reflex','🪲','Catch glowing fireflies as they pass through a lantern.','Tap a firefly only while it is inside the golden lantern circle. Catch 4 per night for 3 nights. Three escapes or wrong taps end your watch.'],
    api => {
      const {base,R,O,S,T}=api.art, C=api.colors;
      const goal=4, radius=72;
      function spawn(s) {
        const lane=s.spawnIndex%3;
        const left=s.spawnIndex%2===0;
        s.fly={x:left?-24:384,y:185+lane*62,dir:left?1:-1,speed:78+(s.level-1)*21,phase:s.spawnIndex*1.3};
        s.spawnIndex++;
      }
      function fail(s,message) {
        s.misses++;
        s.note=message;
        api.beep(180);
        if(s.misses>=3)api.finish(false,'Three fireflies escaped or were disturbed. The orchard sleeps.');
        else spawn(s);
      }
      function catchFly(x,y) {
        const s=api.state;
        if(s.ended||!s.fly)return;
        const f=s.fly;
        const fy=f.y+Math.sin(f.phase)*9;
        if(Math.hypot(x-f.x,y-fy)>27)return;
        if(Math.hypot(f.x-180,fy-254)>radius) {
          fail(s,'Too early! Wait for the lantern glow.');
          return;
        }
        s.caught++;
        api.addScore(15+Math.max(0,3-s.misses)*5);
        api.beep(660);
        if(s.caught===goal) {
          if(s.level===3) {
            api.finish(true,'All twelve fireflies are safe in the lantern orchard!');
            return;
          }
          s.level++;
          s.caught=0;
          s.note='Night '+s.level+': the fireflies move faster!';
        } else s.note='Lovely catch! '+s.caught+'/'+goal+' this night.';
        spawn(s);
      }
      return {
        init() {
          const s=api.state;
          s.t=110;s.level=1;s.caught=0;s.misses=0;s.spawnIndex=0;
          s.note='Wait for a firefly to enter the golden circle.';
          spawn(s);
          api.controls([['TAP THE GLOWING FIREFLY','hint',true]]);
        },
        action(name) {
          if(name==='hint'&&!api.state.ended)api.state.note='Tap the moving dot inside the lantern circle.';
        },
        tap(x,y) {catchFly(x,y);},
        update(dt) {
          const s=api.state;
          if(s.ended||!s.fly)return;
          const f=s.fly;
          f.x+=f.dir*f.speed*dt;
          f.phase+=dt*4;
          if(f.x>390||f.x< -30)fail(s,'A firefly slipped past the lantern!');
        },
        timeout() {
          if(!api.state.ended)api.finish(false,'Dawn arrived before all the fireflies were gathered.');
        },
        draw() {
          const s=api.state;
          base('#101c2a');
          T('FIREFLY ORCHARD',180,36,23,C.mint);
          T('NIGHT '+s.level+'/3   •   CAUGHT '+s.caught+'/'+goal,180,70,14,C.white);
          T('MISSES '+s.misses+'/3',180,97,13,C.pink);
          R(12,123,336,262,'#1c3040',18);
          O(180,254,radius+12,'#4b412e');
          O(180,254,radius,'#b99a43');
          O(180,254,radius-7,'#d6b95b');
          O(180,254,48,'#e8cf78');
          S(180,254,radius,'#fff0a3',3);
          T('LANTERN',180,254,13,'#58451f');
          if(s.fly) {
            const f=s.fly, fy=f.y+Math.sin(f.phase)*9;
            O(f.x,fy,23,'#a2ffb044');
            O(f.x,fy,13,'#dcffd2');
            O(f.x,fy,6,'#ffffff');
          }
          R(14,399,332,38,'#2b3e50',10);
          T(s.note,180,418,11,C.white);
        }
      };
    }
  );
})();