/* Parcel Pathways — navigate three delivery grids with limited steps. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Parcel Pathways','strategy','📦','Deliver a parcel through tiny streets without stepping into puddles.','Use the four direction buttons or tap the on-screen arrows to walk one block at a time. Reach the green mailbox within the move budget. Walls block movement; puddles cost a strike and reset the delivery. Complete three streets to win. Three strikes or 120 seconds ends the route.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      // Each map is five columns by five rows. # = wall, ~ = puddle, S = start, G = goal.
      const streets=[
        ['S....','.##..','..~..','.##..','....G'],
        ['S.#..','..#..','.....','..##.','~...G'],
        ['S....','.#.#.','...#.','.#...','...~G']
      ];
      const budgets=[10,12,14];
      const arrows=[
        {name:'up',x:180,y:325,label:'▲'},
        {name:'left',x:115,y:385,label:'◀'},
        {name:'down',x:180,y:385,label:'▼'},
        {name:'right',x:245,y:385,label:'▶'}
      ];
      const directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
      function load(s) {
        s.map=streets[s.level-1];s.x=0;s.y=0;s.moves=0;
        s.note='Find the green mailbox.';
      }
      function walk(name) {
        const s=api.state;
        if(s.ended||!directions[name])return;
        const [dx,dy]=directions[name],nx=s.x+dx,ny=s.y+dy;
        if(nx<0||nx>4||ny<0||ny>4||s.map[ny][nx]==='#') {
          s.note='Blocked street. Try another way.';api.beep(180);return;
        }
        s.moves++;
        if(s.map[ny][nx]==='~') {
          s.strikes++;api.beep(140);
          if(s.strikes>=3) {api.finish(false,'Three soggy parcels ended the route.');return;}
          load(s);s.note='Puddle! Parcel returned to start. '+(3-s.strikes)+' chances left.';return;
        }
        s.x=nx;s.y=ny;
        if(s.map[ny][nx]==='G') {
          api.addScore(100+Math.max(0,budgets[s.level-1]-s.moves)*15);
          if(s.level===streets.length)api.finish(true,'All three parcels delivered dry and on time!');
          else {s.level++;load(s);s.note='Delivered! A new neighborhood awaits.';}
          return;
        }
        if(s.moves>=budgets[s.level-1]) {
          s.strikes++;api.beep(140);
          if(s.strikes>=3)api.finish(false,'Three routes ran out of steps.');
          else {load(s);s.note='Out of steps! Try a shorter route. '+(3-s.strikes)+' chances left.';}
        } else s.note=(budgets[s.level-1]-s.moves)+' steps left.';
      }
      return {
        init(){
          const s=api.state;s.t=120;s.level=1;s.strikes=0;load(s);
          api.controls([['↑ Up','up',true],['← Left','left',true],['↓ Down','down',true],['→ Right','right',true]]);
        },
        action(name){walk(name);},
        tap(x,y){
          for(const a of arrows)if(Math.abs(x-a.x)<=27&&Math.abs(y-a.y)<=25){walk(a.name);return;}
        },
        timeout(){if(!api.state.ended)api.finish(false,'The delivery shift ended before all parcels arrived.');},
        draw(){
          const s=api.state;
          base('#171e35');
          T('PARCEL PATHWAYS',180,32,22,U.mint);
          T('STREET '+s.level+'/3   ·   STRIKES '+s.strikes+'/3',180,59,13,U.yellow);
          T('STEPS '+s.moves+'/'+budgets[s.level-1],180,82,14,U.white);
          const size=51,ox=52,oy=98;
          for(let row=0;row<5;row++)for(let col=0;col<5;col++){
            const tile=s.map[row][col],px=ox+col*size,py=oy+row*size;
            R(px,py,size-4,size-4,tile==='#'?'#39445c':tile==='~'?'#426c9c':tile==='G'?'#327d66':'#273651',8);
            if(tile==='#')T('▥',px+23,py+24,23,U.muted);
            if(tile==='~')T('≈',px+23,py+24,28,'#c4eaff');
            if(tile==='G')T('✉',px+23,py+24,27,'#d9ffdf');
          }
          const cx=ox+s.x*size+23,cy=oy+s.y*size+23;
          O(cx,cy,19,'#ffdf85');T('📦',cx,cy+1,22,'#1b2540');
          for(const a of arrows){
            R(a.x-26,a.y-24,52,48,'#3c5276',12);
            T(a.label,a.x,a.y,23,U.white);
          }
          R(17,420,326,26,'#283754',8);
          T(s.note,180,433,11,U.white);
        }
      };
    }
  );
})();
