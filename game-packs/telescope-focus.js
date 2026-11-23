/* Telescope Focus — coupled dial puzzle with guaranteed-solvable targets. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Telescope Focus','puzzle','🔭','Align two linked telescope dials to discover three hidden skies.','Tap OUTER +/− to turn both dials together; INNER +/− turns the aim forward and focus backward. Match both glowing targets. Each sky has a move budget; three failed calibrations or time running out ends the night.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const mod=n=>(n+6)%6;
      const stages=[{moves:7,steps:['outer+','inner+','outer+']},{moves:9,steps:['inner-','outer+','inner+','outer-','inner+']},{moves:11,steps:['outer-','inner-','outer+','inner+','outer+','inner-']}];
      const moves=[['OUTER +','outer+'],['OUTER −','outer-'],['INNER +','inner+'],['INNER −','inner-']];
      function turn(pair,name) {
        const dir=name.endsWith('+')?1:-1;
        if(name.startsWith('outer'))return [mod(pair[0]+dir),mod(pair[1]+dir)];
        return [mod(pair[0]+dir),mod(pair[1]-dir)];
      }
      function setup(s) {
        const stage=stages[s.level-1];
        s.aim=0;s.focus=0;s.target=stage.steps.reduce(turn,[0,0]);
        s.moves=stage.moves;s.used=0;
        s.note='Match both golden markers.';
      }
      function act(name) {
        const s=api.state;
        if(s.ended||!moves.some(m=>m[1]===name))return;
        [s.aim,s.focus]=turn([s.aim,s.focus],name);
        s.used++;
        api.beep(350+s.aim*55);
        if(s.aim===s.target[0]&&s.focus===s.target[1]){
          api.addScore(100+15*(s.moves-s.used)+20*s.level);
          if(s.level===3){api.finish(true,'All three skies revealed. The observatory is yours!');return;}
          s.level++;setup(s);s.note='Sky found! Calibrate the next lens.';
          return;
        }
        if(s.used>=s.moves){
          s.failures++;
          if(s.failures>=3){api.finish(false,'Three failed calibrations. The stars have set.');return;}
          setup(s);s.note='Out of turns! New attempt ('+(3-s.failures)+' left).';
        }else s.note=(s.moves-s.used)+' turns remain.';
      }
      return {
        init(){
          const s=api.state;s.t=130;s.level=1;s.failures=0;setup(s);
          api.controls(moves.map(([label,name])=>[label,name,true]));
        },
        action:act,
        tap(x,y){
          if(y<306||y>397)return;
          const col=x<180?0:1,row=y<351?0:1;
          act(moves[row*2+col][1]);
        },
        timeout(){if(!api.state.ended)api.finish(false,'Dawn arrived before the lenses aligned.');},
        draw(){
          const s=api.state;base('#111b31');
          T('TELESCOPE FOCUS',180,31,23,C.mint);
          T('SKY '+s.level+'/3  •  FAILED '+s.failures+'/3  •  MOVES '+s.used+'/'+s.moves,180,62,12,C.yellow);
          const dial=(cx,cy,value,target,label)=>{
            O(cx,181,78,'#293b57');S(cx,181,69,'#61718b',3);
            for(let i=0;i<6;i++){
              const a=-Math.PI/2+i*Math.PI/3;
              const px=cx+56*Math.cos(a),py=181+56*Math.sin(a);
              O(px,py,13,i===target?C.yellow:'#435774');
              T(String(i+1),px,py+4,12,i===target?'#17213a':C.white);
            }
            const a=-Math.PI/2+value*Math.PI/3;
            L(cx,181,cx+40*Math.cos(a),181+40*Math.sin(a),C.mint,5);
            O(cx,181,11,C.mint);
            T(label,cx,278,13,C.white);
            T('NOW '+(value+1)+'  →  GOAL '+(target+1),cx,296,11,C.yellow);
          };
          dial(93,181,s.aim,s.target[0],'AIM');
          dial(267,181,s.focus,s.target[1],'FOCUS');
          moves.forEach(([label],i)=>{
            const x=18+(i%2)*165,y=312+Math.floor(i/2)*47;
            R(x,y,159,41,'#375579',9);
            T(label,x+79,y+26,15,C.white);
          });
          R(15,412,330,29,'#283a55',8);
          T(s.note,180,431,12,C.white);
        }
      };
    }
  );
})();
