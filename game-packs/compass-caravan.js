/* Compass Caravan — steer a clockwork rover through three tiny mazes. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Compass Caravan','strategy','🧭','Steer a tiny rover by turning and stepping through strange maps.','Use Turn Left, Forward and Turn Right to collect every golden compass star, then reach the green exit. Rocks block movement. Clear three maps; three crashes, running out of moves or time ends the expedition.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const maps=[
        {start:[0,0,1],goal:[4,0],stars:[[2,0]],rocks:[[1,2],[2,2],[3,2]],limit:15},
        {start:[0,4,0],goal:[4,0],stars:[[0,2],[2,0]],rocks:[[1,3],[2,3],[3,3],[2,2]],limit:22},
        {start:[0,0,1],goal:[4,4],stars:[[3,0],[4,2]],rocks:[[1,1],[2,1],[3,1],[1,3],[2,3]],limit:25}
      ];
      const directions=[[0,-1],[1,0],[0,1],[-1,0]],arrows=['▲','▶','▼','◀'];
      const same=(a,x,y)=>a[0]===x&&a[1]===y;
      function setup(s){
        const m=maps[s.level-1];
        s.x=m.start[0];s.y=m.start[1];s.dir=m.start[2];
        s.stars=m.stars.map(p=>p.slice());s.moves=0;s.crashes=0;
        s.note='Collect stars, then reach the exit.';
      }
      function act(name){
        const s=api.state;if(s.ended)return;
        const m=maps[s.level-1];
        if(!['left','right','forward'].includes(name))return;
        s.moves++;
        if(name==='left')s.dir=(s.dir+3)%4;
        if(name==='right')s.dir=(s.dir+1)%4;
        if(name==='forward'){
          const nx=s.x+directions[s.dir][0],ny=s.y+directions[s.dir][1];
          if(nx<0||nx>4||ny<0||ny>4||m.rocks.some(p=>same(p,nx,ny))){
            s.crashes++;s.note='Bonk! '+(3-s.crashes)+' crashes left.';api.beep(160);
            if(s.crashes>=3){api.finish(false,'The rover broke down after three crashes.');return;}
          }else{
            s.x=nx;s.y=ny;
            const before=s.stars.length;
            s.stars=s.stars.filter(p=>!same(p,nx,ny));
            if(s.stars.length<before){api.addScore(30);api.beep(650);s.note='Star collected!';}
            else s.note='Keep exploring.';
          }
        }
        if(s.x===m.goal[0]&&s.y===m.goal[1]&&!s.stars.length){
          api.addScore(100+Math.max(0,m.limit-s.moves)*5);
          if(s.level===3){api.finish(true,'Three maps explored! Your compass has found its way home.');return;}
          s.level++;setup(s);api.beep(800);return;
        }
        if(s.moves>=m.limit)api.finish(false,'The clockwork rover ran out of moves.');
      }
      return {
        init(){const s=api.state;s.t=150;s.level=1;api.controls([['↶ Left','left',true],['↑ Forward','forward',true],['Right ↷','right',true]]);setup(s);},
        action:act,
        tap(x,y){if(y>=374&&y<=435){const i=Math.floor((x-18)/108);if(i>=0&&i<3)act(['left','forward','right'][i]);}},
        timeout(){if(!api.state.ended)api.finish(false,'The expedition clock ran out.');},
        draw(){
          const s=api.state,m=maps[s.level-1],size=59,left=32,top=72;
          base('#151c33');
          T('COMPASS CARAVAN',180,28,22,U.mint);
          T('MAP '+s.level+'/3  •  MOVES '+s.moves+'/'+m.limit+'  •  BONKS '+s.crashes+'/3',180,51,12,U.yellow);
          for(let y=0;y<5;y++)for(let x=0;x<5;x++){
            const px=left+x*size,py=top+y*size;
            R(px+2,py+2,size-4,size-4,'#2b3753',8);
            if(m.rocks.some(p=>same(p,x,y)))T('◆',px+size/2,py+size/2,29,'#7887a1');
            if(m.goal[0]===x&&m.goal[1]===y){R(px+7,py+7,size-14,size-14,'#216d5a',8);T('⌂',px+size/2,py+size/2,30,'#b2ffe3');}
            if(s.stars.some(p=>same(p,x,y)))T('★',px+size/2,py+size/2,31,U.yellow);
            if(s.x===x&&s.y===y){O(px+size/2,py+size/2,23,'#6ce4f0');T(arrows[s.dir],px+size/2,py+size/2,28,'#17243b');}
          }
          T('★ collect all   •   ⌂ reach exit   •   ◆ avoid',180,386,12,U.muted);
          R(21,401,318,35,'#27354f',9);
          T(s.note,180,418,12,U.white);
        }
      };
    }
  );
})();
