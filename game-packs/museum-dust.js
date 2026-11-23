/* Museum Dust — reveal relics without touching their fragile cracks. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Museum Dust','puzzle','🏺','Brush dust off three delicate museum relics.','Drag a finger across dusty tiles to clean them. Avoid the red cracked tiles: three cracks touched end your restoration. Reveal every safe tile in each of three exhibits before the 120-second clock expires.'],
    api => {
      const {base,R,T,O}=api.art, C=api.colors;
      const W=6, H=6, X=30, Y=107, CELL=50;
      const layouts=[
        [7,14,21,28],
        [2,9,16,23,30],
        [4,8,12,17,22,27]
      ];
      const relics=['THE SUN VASE','THE MOON MASK','THE STAR TABLET'];
      const colors=['#e9b36c','#a6d4e6','#c5b3ec'];
      function setup(s) {
        s.cleaned=new Set();
        s.cracked=new Set(layouts[s.level-1]);
        s.safe=W*H-s.cracked.size;
        s.note='Brush the pale tiles. Red cracks are fragile!';
      }
      function brush(x,y) {
        const s=api.state;
        if(s.ended)return;
        const col=Math.floor((x-X)/CELL),row=Math.floor((y-Y)/CELL);
        if(col<0||col>=W||row<0||row>=H)return;
        const id=row*W+col;
        if(s.cleaned.has(id)||s.broken.has(id))return;
        if(s.cracked.has(id)){
          s.broken.add(id);s.damage++;
          s.note='Careful! '+(3-s.damage)+' mistakes left.';
          api.beep(190);
          if(s.damage>=3)api.finish(false,'The relic was too fragile. Try a gentler touch.');
        }else{
          s.cleaned.add(id);api.addScore(5);
          if(s.cleaned.size===s.safe){
            api.addScore(50);
            if(s.level===3){api.finish(true,'All three relics restored. The museum opens!');return;}
            s.level++;setup(s);s.note='Exhibit '+s.level+': a new relic awaits!';
            api.beep(690);
          }
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=120;s.level=1;s.damage=0;s.broken=new Set();s.dragging=false;
          setup(s);api.controls([['BRUSH: DRAG ON THE GRID','hint',true]]);
        },
        action(){},
        down(x,y){api.state.dragging=true;brush(x,y);},
        move(x,y){if(api.state.dragging)brush(x,y);},
        up(){api.state.dragging=false;},
        tap(x,y){brush(x,y);},
        timeout(){if(!api.state.ended)api.finish(false,'Closing time! The restoration is unfinished.');},
        draw(){
          const s=api.state;
          base('#1b2033');
          T('MUSEUM DUST',180,33,24,C.yellow);
          T('EXHIBIT '+s.level+'/3 · '+relics[s.level-1],180,64,13,C.mint);
          T('CLEAN '+s.cleaned.size+'/'+s.safe+'   DAMAGE '+s.damage+'/3',180,88,13,C.white);
          R(X-7,Y-7,314,314,'#46506b',12);
          for(let id=0;id<36;id++){
            const x=X+(id%W)*CELL,y=Y+Math.floor(id/W)*CELL;
            const clean=s.cleaned.has(id),broken=s.broken.has(id),crack=s.cracked.has(id);
            R(x+2,y+2,46,46,clean?colors[s.level-1]:crack?'#884653':'#b0a18a',6);
            if(clean)T(['✦','◈','●'][(id+s.level)%3],x+25,y+25,22,'#3d4260');
            else if(crack){T('⚡',x+25,y+25,21,'#ffe0d9');if(broken)T('✕',x+25,y+25,26,'#fff');}
            else {O(x+17,y+19,3,'#ded2bd');O(x+33,y+31,4,'#d8cbb4');}
          }
          T(s.note,180,432,11,C.white);
        }
      };
    }
  );
})();
