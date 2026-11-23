/* Anagram Atelier — restore scrambled words in a tiny letterpress. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Anagram Atelier','puzzle','🔤','Reassemble curious words from jumbled letter tiles.','Read the clue, then tap the letter tiles in spelling order. Finish all three words before time expires. Three incorrect taps end your run.'],
    api => {
      const {base,R,T}=api.art, C=api.colors;
      const rounds=[
        {word:'MOTH',clue:'A night-flying insect',tiles:['T','M','H','O']},
        {word:'LAMP',clue:'A portable source of light',tiles:['P','A','M','L']},
        {word:'BRICK',clue:'A block used to build walls',tiles:['K','I','B','C','R']}
      ];
      const left=24,top=190,cell=62,gap=7;
      function current(){return rounds[api.state.level-1];}
      function select(i){
        const s=api.state,round=current();
        if(s.ended||i<0||i>=round.tiles.length||s.used.includes(i))return;
        const letter=round.tiles[i];
        if(letter!==round.word[s.spelled.length]){
          s.errors++;s.note='Wrong letter. '+(3-s.errors)+' mistakes left.';
          api.beep(160);
          if(s.errors>=3)api.finish(false,'The letterpress jammed. Try again!');
          return;
        }
        s.used.push(i);s.spelled+=letter;api.addScore(15);api.beep(520);
        if(s.spelled===round.word){
          api.addScore(40+s.level*10);
          if(s.level===rounds.length){
            api.finish(true,'All three words restored! The atelier is open.');
          }else{
            s.level++;s.spelled='';s.used=[];s.note='A new clue awaits.';
          }
        }else s.note='Good! Keep spelling.';
      }
      return {
        init(){
          const s=api.state;
          s.t=100;s.level=1;s.spelled='';s.used=[];s.errors=0;
          s.note='Tap the tiles in the correct order.';
          api.controls([]);
        },
        tap(x,y){
          const s=api.state;
          if(s.ended)return;
          const round=current(),count=round.tiles.length;
          const width=count*cell+(count-1)*gap;
          const start=(360-width)/2;
          const col=Math.floor((x-start)/(cell+gap));
          if(y>=top&&y<top+cell&&col>=0&&col<count&&x>=start+col*(cell+gap)&&x<start+col*(cell+gap)+cell)select(col);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The atelier closed before the words were restored.');},
        draw(){
          const s=api.state,round=current(),count=round.tiles.length;
          base('#19182f');
          T('ANAGRAM ATELIER',180,36,23,C.yellow);
          T('WORD '+s.level+'/3   •   ERRORS '+s.errors+'/3',180,68,14,C.mint);
          T('CLUE: '+round.clue,180,111,15,C.white);
          R(26,130,308,42,'#30314e',12);
          T(s.spelled.padEnd(round.word.length,'_').split('').join(' '),180,151,24,C.yellow);
          const width=count*cell+(count-1)*gap,start=(360-width)/2;
          round.tiles.forEach((letter,i)=>{
            const x=start+i*(cell+gap),used=s.used.includes(i);
            R(x,top,cell,cell,used?'#292a3d':'#526080',12);
            T(used?'✓':letter,x+cell/2,top+32,27,used?C.muted:C.white);
          });
          T('TAP LETTERS TO SPELL THE ANSWER',180,291,12,C.muted);
          R(22,373,316,48,'#30314e',10);
          T(s.note,180,396,12,C.white);
        }
      };
    }
  );
})();
