/* Gravity Post — tilt the postal marble to collect a stamp and reach the mailbox. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Gravity Post','puzzle','📮','Slide a postal marble through three gravity mazes.','Tap a direction to tilt the board. The marble slides until it hits a wall or edge. Collect the glowing stamp before entering the mailbox. Clear all three boards before the clock runs out; each board has a tilt limit.'],
    api => {
      const {base,R,O,L,T}=api.art, C=api.colors;
      const boards=[
        {start:[0,0],stamp:[3,2],goal:[4,4],walls:[[2,0],[2,1],[2,3],[1,3],[3,3]],limit:13},
        {start:[0,4],stamp:[1,3],goal:[4,0],walls:[[1,1],[1,2],[3,1],[3,2],[2,4],[4,2]],limit:11},
        {start:[2,2],stamp:[0,2],goal:[4,4],walls:[[0,1],[1,1],[3,1],[3,3],[1,4],[4,1]],limit:9}
      ];
      const dirs={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
      const gridX=35,gridY=104,cell=58;
      function load(s){
        const b=boards[s.level-1];
        s.x=b.start[0];s.y=b.start[1];s.stamped=false;s.tilts=0;
        s.note='Find the gold stamp, then the pink mailbox.';
      }
      function tilt(name){
        const s=api.state,dir=dirs[name];
        if(s.ended||!dir)return;
        const b=boards[s.level-1];
        const walls=new Set(b.walls.map(p=>p.join(',')));
        let x=s.x,y=s.y;
        while(x+dir[0]>=0&&x+dir[0]<5&&y+dir[1]>=0&&y+dir[1]<5&&!walls.has((x+dir[0])+','+(y+dir[1]))){
          x+=dir[0];y+=dir[1];
        }
        if(x===s.x&&y===s.y){s.note='Blocked! Try another direction.';return;}
        s.x=x;s.y=y;s.tilts++;
        if(!s.stamped&&x===b.stamp[0]&&y===b.stamp[1]){
          s.stamped=true;s.note='Stamp collected! Find the mailbox.';
          api.addScore(30);api.beep(650);
        }else s.note='Tilt '+s.tilts+'/'+b.limit+(s.stamped?' · Mailbox next':' · Stamp first');
        if(s.stamped&&x===b.goal[0]&&y===b.goal[1]){
          api.addScore(70+Math.max(0,b.limit-s.tilts)*10);
          api.beep(820);
          if(s.level===boards.length){
            api.finish(true,'All three letters delivered. The gravity post office is open!');
          }else{s.level++;load(s);}
          return;
        }
        if(s.tilts>=b.limit)api.finish(false,'Out of tilts! Plan a route through the stamp and mailbox.');
      }
      return {
        init(){
          const s=api.state;
          s.t=125;s.level=1;load(s);
          api.controls([['◀ LEFT','left'],['▲ UP','up'],['▼ DOWN','down'],['RIGHT ▶','right',true]]);
        },
        action:tilt,
        tap(x,y){
          if(y<403)return;
          if(x<95)tilt('left');else if(x<180)tilt('up');else if(x<265)tilt('down');else tilt('right');
        },
        timeout(){if(!api.state.ended)api.finish(false,'The post office closed before the last delivery.');},
        draw(){
          const s=api.state,b=boards[s.level-1];
          base('#151d34');
          T('GRAVITY POST',180,31,23,C.mint);
          T('LETTER '+s.level+'/3  ·  TILTS '+s.tilts+'/'+b.limit,180,61,14,C.yellow);
          T(s.stamped?'STAMP SECURED ✓':'COLLECT THE GOLD STAMP',180,83,12,s.stamped?C.mint:C.white);
          const walls=new Set(b.walls.map(p=>p.join(',')));
          for(let y=0;y<5;y++)for(let x=0;x<5;x++){
            const px=gridX+x*cell,py=gridY+y*cell;
            R(px,py,cell-4,cell-4,walls.has(x+','+y)?'#53617c':'#263652',8);
            if(walls.has(x+','+y)){L(px+13,py+13,px+40,py+40,'#7d8aa1',3);continue;}
            if(x===b.goal[0]&&y===b.goal[1]){
              R(px+9,py+12,35,29,C.pink,6);T('✉',px+27,py+26,22,'#243047');
            }
            if(!s.stamped&&x===b.stamp[0]&&y===b.stamp[1]){
              O(px+27,py+27,19,C.yellow);T('★',px+27,py+27,23,'#473b29');
            }
          }
          const mx=gridX+s.x*cell+27,my=gridY+s.y*cell+27;
          O(mx,my,22,'#f7f7ff');O(mx-6,my-5,4,'#243047');O(mx+6,my-5,4,'#243047');
          L(mx-6,my+7,mx+6,my+7,'#243047',2);
          R(17,408,326,31,'#30415c',9);
          T(s.note,180,423,11,C.white);
        }
      };
    }
  );
})();
