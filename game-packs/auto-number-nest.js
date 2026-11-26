/* Number Nest — merge neighboring equal eggs into a single larger egg. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Number Nest','puzzle','🥚','Hatch bigger numbers by merging matching neighbors.','Tap one numbered egg, then an adjacent egg of the same value. The second egg doubles and the first disappears. Hatch the golden target in each of three nests. Three wasted taps or time running out ends the game.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const stages=[
        {values:[2,2,4,8],row:0,target:16},
        {values:[4,4,8,16],row:1,target:32},
        {values:[8,8,16,32],row:2,target:64}
      ];
      function setup(){
        const s=api.state,stage=stages[s.level-1];
        s.eggs=Array(16).fill(0);
        stage.values.forEach((v,i)=>{s.eggs[stage.row*4+i]=v;});
        s.selected=-1;s.moves=0;s.note='Choose two neighboring matching eggs.';
      }
      function choose(index){
        const s=api.state;
        if(s.ended||!s.eggs[index])return;
        if(s.selected===-1){s.selected=index;s.note='Now tap an adjacent matching egg.';return;}
        if(s.selected===index){s.selected=-1;s.note='Selection cleared.';return;}
        const a=s.selected,b=index;
        const adjacent=(Math.floor(a/4)===Math.floor(b/4)&&Math.abs(a-b)===1)||Math.abs(a-b)===4;
        if(adjacent&&s.eggs[a]===s.eggs[b]){
          s.eggs[b]*=2;s.eggs[a]=0;s.selected=-1;s.moves++;
          api.addScore(s.eggs[b]*5);
          api.beep(500);
          if(s.eggs[b]===stages[s.level-1].target){
            api.addScore(100);
            if(s.level===3){api.finish(true,'All three golden eggs hatched!');return;}
            s.level++;setup();s.note='New nest! Hatch an even bigger egg.';
          }else s.note='Great merge! Keep doubling.';
        }else{
          s.selected=b;s.mistakes++;api.beep(160);
          s.note='Not a match. '+(3-s.mistakes)+' mistakes left.';
          if(s.mistakes>=3)api.finish(false,'The nest grew quiet. Match equal neighbors.');
        }
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=120;s.mistakes=0;setup();
          api.controls([['CLEAR SELECTION','clear',true]]);
        },
        action(name){if(name==='clear'){api.state.selected=-1;api.state.note='Choose an egg to merge.';}},
        tap(x,y){
          const col=Math.floor((x-34)/73),row=Math.floor((y-134)/69);
          if(col<0||col>3||row<0||row>3)return;
          if(x>34+col*73+65||y>134+row*69+62)return;
          choose(row*4+col);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The nest clock ran out. Try again!');},
        draw(){
          const s=api.state,stage=stages[s.level-1];
          base('#1c2435');
          T('NUMBER NEST',180,43,25,U.yellow);
          T('NEST '+s.level+'/3  •  HATCH '+stage.target,180,76,16,U.mint);
          T('MISTAKES '+s.mistakes+'/3  •  MERGES '+s.moves,180,103,12,U.white);
          for(let i=0;i<16;i++){
            const x=34+(i%4)*73,y=134+Math.floor(i/4)*69;
            R(x,y,65,62,i===s.selected?'#657f9e':'#344156',12);
            if(s.eggs[i]){
              O(x+32,y+30,25,i===s.selected?'#ffe2a0':'#d5ecdc');
              T(String(s.eggs[i]),x+32,y+36,19,'#243446');
            }else T('·',x+32,y+35,21,'#788ba1');
          }
          T('TAP MATCHING NEIGHBORS',180,427,12,U.mint);
          T(s.note,180,445,11,U.white);
        }
      };
    }
  );
})();
