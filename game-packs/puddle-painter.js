/* Puddle Painter — reclaim a flooded mosaic, one colour at a time. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Puddle Painter','puzzle','🎨','Turn a patchwork puddle into one colour using clever floods.','Tap a colour below the grid. The top-left connected region changes to that colour and absorbs matching neighbours. Fill the whole board within the move limit. Clear three mosaics to win; running out of moves ends the run.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const inks=['#f58bab','#79efc4','#ffe18d','#91baff'];
      const stages=[
        {size:4,limit:6,grid:(x,y)=>x},
        {size:5,limit:7,grid:(x,y)=>y%4},
        {size:6,limit:8,grid:(x,y)=>Math.min(x,y,5-x,5-y)%4}
      ];
      function setup(s){
        const stage=stages[s.level-1];
        s.size=stage.size;s.remaining=stage.limit;
        s.cells=Array.from({length:s.size*s.size},(_,i)=>stage.grid(i%s.size,Math.floor(i/s.size)));
        s.note='Flood from the top-left corner.';
      }
      function region(s){
        const seen=new Set([0]),queue=[0],color=s.cells[0],n=s.size;
        for(let k=0;k<queue.length;k++){
          const i=queue[k],x=i%n,y=Math.floor(i/n);
          const neighbors=[];
          if(x>0)neighbors.push(i-1);
          if(x<n-1)neighbors.push(i+1);
          if(y>0)neighbors.push(i-n);
          if(y<n-1)neighbors.push(i+n);
          for(const j of neighbors)if(!seen.has(j)&&s.cells[j]===color){seen.add(j);queue.push(j);}
        }
        return seen;
      }
      function flood(ink){
        const s=api.state;
        if(s.ended||ink===s.cells[0]||s.remaining<=0)return;
        const connected=region(s);
        for(const i of connected)s.cells[i]=ink;
        s.remaining--;api.beep(330+ink*90);
        const owned=region(s).size,total=s.cells.length;
        if(owned===total){
          api.addScore(100+s.remaining*25+s.level*20);
          if(s.level===stages.length)api.finish(true,'Every puddle became a masterpiece!');
          else{s.level++;setup(s);s.note='Mosaic cleared! A new canvas awaits.';}
        }else if(s.remaining===0){
          s.note='No brushes left.';
          api.finish(false,'The puddle stayed patchy. Try a new route!');
        }else s.note=owned+'/'+total+' tiles connected. '+s.remaining+' moves left.';
      }
      return {
        init(){const s=api.state;s.t=150;s.level=1;setup(s);
          api.controls(inks.map((_,i)=>[['Pink','Mint','Gold','Blue'][i],'ink'+i,i===0]));
        },
        action(name){if(/^ink[0-3]$/.test(name))flood(Number(name[3]));},
        tap(x,y){if(y>=352&&y<=418&&x>=20&&x<340)flood(Math.floor((x-20)/80));},
        timeout(){if(!api.state.ended)api.finish(false,'The paint dried before the last mosaic was finished.');},
        draw(){
          const s=api.state,n=s.size,side=240/n,top=88,left=60;
          base('#111a31');
          T('PUDDLE PAINTER',180,32,23,U.mint);
          T('MOSAIC '+s.level+'/3   •   MOVES '+s.remaining,180,62,15,U.yellow);
          const connected=region(s);
          for(let i=0;i<s.cells.length;i++){
            const x=i%n,y=Math.floor(i/n);
            R(left+x*side+2,top+y*side+2,side-4,side-4,inks[s.cells[i]],7);
            if(connected.has(i))R(left+x*side+side/2-3,top+y*side+side/2-3,6,6,'#15213c',3);
          }
          T('TAP A COLOUR TO FLOOD',180,333,14,U.white);
          inks.forEach((ink,i)=>{
            R(20+i*80,353,73,65,ink,12);
            T(['PINK','MINT','GOLD','BLUE'][i],56+i*80,389,12,'#142039');
          });
          T(s.note,180,437,12,U.white);
        }
      };
    }
  );
})();