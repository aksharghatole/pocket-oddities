/* Postcard Glider — aim a paper glider with angle and launch power. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Postcard Glider','strategy','🛩️','Land a tiny paper glider on three distant mail docks.','Adjust ANGLE and POWER, then LAUNCH. The dotted landing estimate includes wind. Land inside the glowing dock in each of three stages. Three misses in one stage end the delivery.'],
    api => {
      const {base,R,O,L,T}=api.art, U=api.colors;
      const stages=[
        {x:240,w:74,wind:0},
        {x:279,w:62,wind:-18},
        {x:303,w:56,wind:22}
      ];
      const ground=335,gravity=185,startX=35,startY=ground;
      function velocity(s) {
        const a=s.angle*Math.PI/180;
        return {vx:s.power*Math.cos(a),vy:-s.power*Math.sin(a)};
      }
      function landing(s) {
        const v=velocity(s);
        const time=-2*v.vy/gravity;
        return startX+v.vx*time+.5*stages[s.level-1].wind*time*time;
      }
      function setup(s) {
        s.angle=45;s.power=205;s.misses=0;s.flying=false;s.flight=0;
        s.note='Tune your flight, then launch.';
      }
      function land(s) {
        const dock=stages[s.level-1];
        const success=Math.abs(s.x-dock.x)<=dock.w/2;
        s.flying=false;
        if(success) {
          api.addScore(150+Math.round((3-s.misses)*30)+Math.max(0,Math.round(25-Math.abs(s.x-dock.x))));
          api.beep(670);
          if(s.level===stages.length) {
            api.finish(true,'All three postcards delivered safely!');
          } else {
            s.level++;setup(s);s.note='Delivered! New dock, new wind.';
          }
        } else {
          s.misses++;api.beep(180);
          if(s.misses>=3)api.finish(false,'The glider missed three times. Try a different angle and power.');
          else s.note='Missed dock by '+Math.round(Math.max(0,Math.abs(s.x-dock.x)-dock.w/2))+' units. Adjust and retry.';
        }
      }
      return {
        init() {
          const s=api.state;s.t=150;s.level=1;setup(s);
          api.controls([['ANGLE −','angle-down'],['ANGLE +','angle-up'],['POWER −','power-down'],['POWER +','power-up'],['LAUNCH 🛩','launch',true]]);
        },
        action(name) {
          const s=api.state;if(s.ended||s.flying)return;
          if(name==='angle-down')s.angle=Math.max(20,s.angle-5);
          if(name==='angle-up')s.angle=Math.min(70,s.angle+5);
          if(name==='power-down')s.power=Math.max(130,s.power-10);
          if(name==='power-up')s.power=Math.min(270,s.power+10);
          if(name==='launch') {
            const v=velocity(s);
            s.x=startX;s.y=startY;s.vx=v.vx;s.vy=v.vy;s.flight=0;s.flying=true;
            s.note='In flight — watch the landing!';
            api.beep(420);
          }
        },
        update(dt) {
          const s=api.state;if(!s.flying||s.ended)return;
          // Fixed small steps prevent tunneling past the ground on a slow device.
          let remaining=Math.min(dt,.15);
          while(remaining>0&&s.flying) {
            const step=Math.min(remaining,1/120);
            const oldY=s.y,oldX=s.x;
            s.x+=s.vx*step+.5*stages[s.level-1].wind*step*step;
            s.y+=s.vy*step+.5*gravity*step*step;
            s.vx+=stages[s.level-1].wind*step;
            s.vy+=gravity*step;s.flight+=step;
            if(s.vy>0&&oldY<=ground&&s.y>=ground) {
              const ratio=(ground-oldY)/(s.y-oldY||1);
              s.x=oldX+(s.x-oldX)*Math.max(0,Math.min(1,ratio));
              s.y=ground;land(s);
            }
            remaining-=step;
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The post office closed before the last delivery.');},
        draw() {
          const s=api.state,d=stages[s.level-1],prediction=landing(s);
          base('#17233d');
          T('POSTCARD GLIDER',180,34,23,U.mint);
          T('DOCK '+s.level+'/3  ·  MISSES '+s.misses+'/3',180,66,13,U.yellow);
          T('WIND '+(d.wind>0?'→':d.wind<0?'←':'—')+' '+Math.abs(d.wind),180,91,13,U.white);
          for(let i=0;i<5;i++)L(22,130+i*32,338,130+i*32,'#ffffff0e',1);
          R(0,ground+12,360,103,'#263f4b');
          R(d.x-d.w/2,ground+4,d.w,12,'#ffe18d',5);
          R(d.x-d.w/2+5,ground+17,d.w-10,14,'#779c97',4);
          T('MAIL',d.x,ground+37,11,U.yellow);
          O(startX,ground,7,U.mint);
          if(s.flying) {
            L(s.x-11,s.y+6,s.x+13,s.y,'#fff1c1',4);
            L(s.x+13,s.y,s.x-5,s.y-8,'#fff1c1',3);
            O(s.x,s.y,3,U.pink);
          } else {
            // A forecast marker gives a fair, understandable skill challenge.
            const marker=Math.max(9,Math.min(351,prediction));
            L(marker,ground-29,marker,ground-8,U.pink,3);
            T('▼',marker,ground-34,15,U.pink);
            T('PREDICTED LANDING '+Math.round(prediction),180,163,12,U.muted);
            T('ANGLE '+s.angle+'°     POWER '+s.power,180,206,20,U.white);
            T('AIM FOR THE YELLOW DOCK',180,240,13,U.yellow);
          }
          R(16,389,328,45,'#30405c',11);
          T(s.note,180,411,12,U.white);
          T('Adjust with the buttons below the arena',180,445,11,U.muted);
        }
      };
    }
  );
})();
