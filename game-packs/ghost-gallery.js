/* Ghost Gallery — photograph friendly ghosts, never the museum's living visitors. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Ghost Gallery','reflex','👻','Photograph wandering ghosts during a midnight museum shift.','Tap the glowing ghost in the nine museum rooms before it vanishes. Avoid the visitor (🧍). Photograph 10 ghosts to win; four mistakes or the clock running out end your shift.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors, {irnd}=api.helpers;
      const left=30,top=111,size=100,gap=0,goal=10;
      function newExhibit(s){
        s.target=irnd(0,8);
        s.visitor=irnd(0,7);
        if(s.visitor>=s.target)s.visitor++;
        s.age=0;
        s.window=Math.max(0.88,2.3-(s.caught*0.105));
        s.note='Find the ghost. Leave the visitor alone!';
      }
      function mistake(s,message){
        s.mistakes++;
        s.note=message+'  '+Math.max(0,4-s.mistakes)+' chances left.';
        api.beep(170);
        if(s.mistakes>=4)api.finish(false,'The museum closed after four mistakes. Try another night!');
        else newExhibit(s);
      }
      return {
        init(){
          const s=api.state;
          s.t=80;s.level=1;s.caught=0;s.mistakes=0;s.age=0;
          s.note='Tap the ghost, not the visitor.';
          api.controls([]);
          newExhibit(s);
        },
        tap(x,y){
          const s=api.state;
          if(s.ended)return;
          const col=Math.floor((x-left)/size),row=Math.floor((y-top)/size);
          if(col<0||col>=3||row<0||row>=3)return;
          const cell=row*3+col;
          if(cell===s.target){
            s.caught++;
            api.addScore(10+Math.max(0,Math.ceil((s.window-s.age)*5)));
            s.level=1+Math.floor(s.caught/3);
            api.beep(640);
            if(s.caught>=goal){api.finish(true,'Ten ghost portraits captured! The museum has a new midnight collection.');return}
            newExhibit(s);
          }else if(cell===s.visitor)mistake(s,'Oops! You photographed a visitor.');
          else mistake(s,'Empty room! Wait for a ghost.');
        },
        update(dt){
          const s=api.state;
          if(s.ended)return;
          s.age+=dt;
          if(s.age>=s.window)mistake(s,'The ghost escaped!');
        },
        timeout(){if(!api.state.ended)api.finish(false,'Your shift ended before you captured all ten ghosts.');},
        draw(){
          const s=api.state;
          base('#171b33');
          T('GHOST GALLERY',180,31,23,U.mint);
          T('PORTRAITS '+s.caught+'/'+goal+'   •   MISSES '+s.mistakes+'/4',180,64,13,U.yellow);
          T('TAP THE GHOST  ·  NOT THE VISITOR',180,88,12,U.muted);
          for(let i=0;i<9;i++){
            const col=i%3,row=Math.floor(i/3),x=left+col*size,y=top+row*size;
            R(x+3,y+3,94,94,'#2b3555',11);
            R(x+10,y+10,80,80,'#202943',8);
            R(x+20,y+17,60,64,'#405071',7);
            if(i===s.target){
              O(x+50,y+49,31,'#8bf6d33a');
              T('👻',x+50,y+51,43,U.white);
              R(x+16,y+86,68*Math.max(0,1-s.age/s.window),4,U.mint,2);
            }else if(i===s.visitor){
              T('🧍',x+50,y+51,36,U.white);
            }else{
              T(['✦','◇','☾'][i%3],x+50,y+52,25,'#7785a9');
            }
          }
          R(23,421,314,24,'#29344f',9);
          T(s.note,180,433,11,U.white);
        }
      };
    }
  );
})();
