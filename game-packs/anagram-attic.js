/* Anagram Attic — restore scrambled labels in the attic. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Anagram Attic','puzzle','🔤','Reassemble curious attic labels, one letter at a time.','Tap letter tiles in order to spell the clue answer. Use UNDO to take back a letter, CLEAR to start over, and CHECK to submit. Solve three labels before three wrong guesses or time runs out.'],
    api => {
      const {base,R,T}=api.art, C=api.colors;
      const rounds=[
        {word:'MOTH',clue:'A night-flying visitor',tiles:'HTOM'},
        {word:'CLOCK',clue:'A machine that tells time',tiles:'KCOLC'},
        {word:'SECRET',clue:'Something kept hidden',tiles:'TCERES'}
      ];
      function setup(s){
        const r=rounds[s.level-1];
        s.picks=[];s.note='Decode the label: '+r.clue;
      }
      function choose(i){
        const s=api.state,r=rounds[s.level-1];
        if(s.ended||s.picks.includes(i)||s.picks.length===r.word.length)return;
        s.picks.push(i);api.beep(360+30*s.picks.length);
      }
      function check(){
        const s=api.state,r=rounds[s.level-1];
        if(s.ended||s.picks.length!==r.word.length)return;
        const guess=s.picks.map(i=>r.tiles[i]).join('');
        if(guess===r.word){
          api.addScore(100+Math.max(0,3-s.mistakes)*25);
          if(s.level===rounds.length){api.finish(true,'Every forgotten label has found its name!');return;}
          s.level++;setup(s);s.note='Correct! Now decode the next label.';
        }else{
          s.mistakes++;s.picks=[];api.beep(150);
          if(s.mistakes>=3){api.finish(false,'Three labels were misread. The attic closes for tonight.');return;}
          s.note='Not quite! '+(3-s.mistakes)+' guesses remain.';
        }
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=110;s.mistakes=0;setup(s);
          api.controls([['UNDO','undo',true],['CLEAR','clear',true],['CHECK','check',true]]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='undo')s.picks.pop();
          if(name==='clear')s.picks=[];
          if(name==='check')check();
        },
        tap(x,y){
          const s=api.state;if(s.ended)return;
          const r=rounds[s.level-1],n=r.word.length;
          const size=n===6?47:56,gap=7,total=n*size+(n-1)*gap,left=(360-total)/2;
          if(y>=233&&y<=233+size){
            const i=Math.floor((x-left)/(size+gap));
            if(i>=0&&i<n&&x>=left+i*(size+gap)&&x<=left+i*(size+gap)+size)choose(i);
          }
          if(y>=348&&y<=408)check();
        },
        timeout(){if(!api.state.ended)api.finish(false,'Time ran out before the last label was restored.');},
        draw(){
          const s=api.state,r=rounds[s.level-1],n=r.word.length;
          base('#1c1a33');
          T('ANAGRAM ATTIC',180,39,23,C.yellow);
          T('LABEL '+s.level+'/3  ·  ERRORS '+s.mistakes+'/3',180,70,13,C.mint);
          R(22,92,316,82,'#30334f',13);
          T('CLUE',180,115,12,C.yellow);
          T(r.clue,180,147,16,C.white);
          const size=n===6?47:56,gap=7,total=n*size+(n-1)*gap,left=(360-total)/2;
          for(let i=0;i<n;i++){
            const x=left+i*(size+gap);
            R(x,185,size,42,'#3e4b68',8);
            T(s.picks[i]===undefined?'_':r.tiles[s.picks[i]],x+size/2,210,22,C.white);
            R(x,233,size,size,s.picks.includes(i)?'#3b4058':'#7193b5',9);
            T(s.picks.includes(i)?'·':r.tiles[i],x+size/2,233+size/2+6,24,C.white);
          }
          T('TAP LETTERS IN THE RIGHT ORDER',180,321,12,C.muted);
          R(70,348,220,60,'#4d937c',12);
          T('CHECK WORD',180,384,20,C.white);
          T(s.note.length>49?s.note.slice(0,49):s.note,180,432,11,C.white);
        }
      };
    }
  );
})();
