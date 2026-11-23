/* Tide Pools — claim a changing mosaic by flooding from its top-left pool. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Tide Pools','strategy','🌊','Recolor a connected tide pool until the whole shore matches.','Tap one of the four colors below the grid. Your connected pool starts at the top-left corner; every recolor absorbs neighboring cells of that color. Flood the entire shore in three rounds before time runs out.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const colors=['#65c9ee','#f3aa7b','#a9e08e','#d0a6ed'];
      const names=['BLUE','CORAL','MINT','LILAC'];
      const layouts=[
        ['0120','1123','2303','2201'],
        ['01230','11203','23013','20112','33021'],
        ['012301','112033','230132','201123','330210','123002']
      ];
      const limits=[18,29,42];
      function load(){
        const s=api.state, rows=layouts[s.level-1];
        s.size=rows.length;s.cells=rows.join('').split('').map(Number);
        s.moves=0;s.limit=limits[s.level-1];s.note='Pick a color to grow the top-left pool.';
        floodMask();
      }
      function floodMask(){
        const s=api.state,n=s.size,seen=new Set([0]),queue=[0],color=s.cells[0];
        while(queue.length){
          const i=queue.shift(),x=i%n,y=Math.floor(i/n);
          const neighbors=[];
          if(x>0)neighbors.push(i-1);
          if(x<n-1)neighbors.push(i+1);
          if(y>0)neighbors.push(i-n);
          if(y<n-1)neighbors.push(i+n);
          for(const j of neighbors)if(!seen.has(j)&&s.cells[j]===color){seen.add(j);queue.push(j);}
        }
        s.pool=seen;
      }
      function select(color){
        const s=api.state;
        if(s.ended||color===s.cells[0])return;
        for(const i of s.pool)s.cells[i]=color;
        s.moves++;floodMask();api.beep(340+color*90);
        if(s.pool.size===s.cells.length){
          api.addScore(100+Math.max(0,s.limit-s.moves)*12);
          if(s.level===3)api.finish(true,'All three shores are one beautiful tide pool!');
          else{s.level++;load();s.note='Shore cleared! A larger coast awaits.';}
        }else if(s.moves>=s.limit){
          api.finish(false,'The tide receded before you flooded the shore.');
        }else{
          s.note=s.pool.size+'/'+s.cells.length+' cells joined. '+(s.limit-s.moves)+' moves left.';
        }
      }
      return {
        init(){
          const s=api.state;s.t=180;s.level=1;load();
          api.controls(names.map((name,i)=>[name,String(i),true]));
        },
        action(name){if(/^[0-3]$/.test(name))select(Number(name));},
        tap(x,y){
          if(y>=370&&y<=430&&x>=18&&x<=342){
            select(Math.min(3,Math.floor((x-18)/81)));
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'High tide passed. Try again!');},
        draw(){
          const s=api.state,n=s.size,cell=Math.floor(300/n),left=Math.floor((360-cell*n)/2),top=91;
          base('#14243b');
          T('TIDE POOLS',180,35,25,U.mint);
          T('SHORE '+s.level+'/3   ·   MOVES '+s.moves+'/'+s.limit,180,65,14,U.yellow);
          s.cells.forEach((v,i)=>{
            const x=left+(i%n)*cell,y=top+Math.floor(i/n)*cell;
            R(x+2,y+2,cell-4,cell-4,colors[v],7);
            if(s.pool.has(i))R(x+cell/2-4,y+cell/2-4,8,8,'#fff9df',4);
          });
          T('TOP-LEFT POOL GROWS INTO MATCHING NEIGHBORS',180,top+cell*n+23,10,U.white);
          names.forEach((name,i)=>{
            const x=18+i*81;
            R(x,370,76,58,colors[i],12);
            T(String(i+1),x+38,388,13,'#182339');
            T(name,x+38,411,11,'#182339');
          });
          T(s.note,180,447,11,U.muted);
        }
      };
    }
  );
})();
