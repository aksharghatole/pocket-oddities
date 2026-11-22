/* Clockwork Compass — navigate a shifting compass with four touch buttons. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Clockwork Compass','puzzle','🧭','Cross three clockwork maps while north keeps turning.','Tap a compass direction to move one square. After EVERY move, the compass rotates clockwise: N becomes E, E becomes S, and so on. Reach the golden star in each map before your steps run out. Three wall bumps or a timeout end the journey.'],
    api => {
      const {base,R,O,T,L}=api.art, C=api.colors;
      const maps=[
        {start:[0,2],goal:[4,2],limit:10},
        {start:[0,0],goal:[4,4],limit:14},
        {start:[4,0],goal:[0,4],limit:14}
      ];
      const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
      const names=['N','E','S','W'];
      function setup(s){
        const m=maps[s.level-1];
        s.x=m.start[0];s.y=m.start[1];s.goal=m.goal;
        s.remaining=m.limit;s.rotation=0;
        s.note='The compass turns after every step.';
      }
      function step(which){
        const s=api.state;
        if(s.ended)return;
        const actual=(which+s.rotation)%4;
        const nx=s.x+dirs[actual][0],ny=s.y+dirs[actual][1];
        if(nx<0||nx>4||ny<0||ny>4){
          s.bumps++;s.note='Wall! '+(3-s.bumps)+' bumps left.';
          api.beep(170);
          if(s.bumps>=3)api.finish(false,'The clockwork walls stopped your expedition.');
          return;
        }
        s.x=nx;s.y=ny;s.remaining--;s.rotation=(s.rotation+1)%4;
        api.beep(380);
        if(s.x===s.goal[0]&&s.y===s.goal[1]){
          api.addScore(100+s.remaining*10+(3-s.bumps)*15);
          if(s.level===maps.length)api.finish(true,'All three compass chambers conquered!');
          else{s.level++;setup(s);s.note='Chamber cleared! The compass resets.';}
        }else if(s.remaining===0){
          api.finish(false,'Out of steps! Find a shorter route next time.');
        }else s.note='Compass turned clockwise. Watch the arrows!';
      }
      return {
        init(){
          const s=api.state;s.t=135;s.level=1;s.bumps=0;
          setup(s);
          api.controls([['N','n',true],['E','e',true],['S','s',true],['W','w',true]]);
        },
        action(name){
          const i=['n','e','s','w'].indexOf(name);
          if(i>=0)step(i);
        },
        tap(x,y){
          if(y>=356&&y<424){
            const i=Math.floor((x-20)/81);
            if(i>=0&&i<4)step(i);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'Time ran out in the clockwork maze.');},
        draw(){
          const s=api.state;
          base('#182139');
          T('CLOCKWORK COMPASS',180,34,23,C.mint);
          T('CHAMBER '+s.level+'/3  •  STEPS '+s.remaining+'  •  BUMPS '+s.bumps+'/3',180,65,13,C.yellow);
          T('DIRECTION BUTTONS NOW POINT:',180,91,12,C.white);
          T(names.map((n,i)=>n+'→'+names[(i+s.rotation)%4]).join('   '),180,116,15,C.mint);
          for(let row=0;row<5;row++)for(let col=0;col<5;col++){
            const px=42+col*56,py=139+row*41;
            R(px,py,51,37,'#31425e',6);
            if(col===s.goal[0]&&row===s.goal[1])T('★',px+25,py+19,27,C.yellow);
            if(col===s.x&&row===s.y){O(px+25,py+19,14,C.mint);T('●',px+25,py+18,18,'#1b2540');}
          }
          T('Tap a heading; the compass turns after moving.',180,345,11,C.white);
          for(let i=0;i<4;i++){
            const x=20+i*81;
            R(x,361,76,62,'#466488',11);
            T(names[i],x+38,382,21,C.white);
            T('→'+names[(i+s.rotation)%4],x+38,406,13,C.yellow);
          }
          T(s.note,180,442,11,C.muted);
        }
      };
    }
  );
})();
