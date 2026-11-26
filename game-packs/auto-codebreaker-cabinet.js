/* Codebreaker Cabinet — three compact deduction locks. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Codebreaker Cabinet','strategy','🔐','Crack three antique combination locks using exact and misplaced clues.','Each lock hides three DIFFERENT digits from 1–5. Tap digits to enter a guess; no digit repeats. CHECK reveals how many digits are in the right slot (●) and how many are correct but in another slot (◇). Solve each lock within seven guesses. CLEAR erases your entry.'],
    api => {
      const {base,R,O,T}=api.art, C=api.colors;
      const secrets=[[2,5,1],[4,1,3],[5,2,4]];
      function load() {
        const s=api.state;
        s.entry=[];s.history=[];s.note='Choose three different digits.';
      }
      function submit() {
        const s=api.state;
        if(s.ended)return;
        if(s.entry.length!==3){s.note='Enter three digits before checking.';return;}
        const secret=secrets[s.level-1],guess=s.entry.slice();
        const exact=guess.filter((v,i)=>v===secret[i]).length;
        const present=guess.filter(v=>secret.includes(v)).length;
        s.history.push({guess,exact,misplaced:present-exact});
        s.entry=[];
        if(exact===3){
          api.addScore(120+(7-s.history.length)*25);
          api.beep(670);
          if(s.level===3)api.finish(true,'All three cabinets unlocked. The secret collection is yours!');
          else{s.level++;load();s.note='Unlocked! The next cabinet awaits.';}
        }else if(s.history.length===7)api.finish(false,'Seven guesses used. The cabinet stays locked. Try again!');
        else{s.note=exact+' exact, '+(present-exact)+' misplaced. '+(7-s.history.length)+' guesses left.';api.beep(280);}
      }
      return {
        init(){
          const s=api.state;s.t=180;s.level=1;load();
          api.controls([['1','1',true],['2','2',true],['3','3',true],['4','4',true],['5','5',true],['⌫ Undo','undo'],['Clear','clear'],['CHECK','check',true]]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='check'){submit();return;}
          if(name==='clear'){s.entry=[];s.note='Entry cleared.';return;}
          if(name==='undo'){s.entry.pop();return;}
          const digit=Number(name);
          if(!Number.isInteger(digit)||digit<1||digit>5)return;
          if(s.entry.includes(digit)){s.note='Each digit can appear only once.';return;}
          if(s.entry.length<3){s.entry.push(digit);api.beep(400);}
          else s.note='Three digits filled. Check or undo.';
        },
        tap(x,y){
          if(y>=113&&y<=183&&x>=42&&x<=318){
            const i=Math.floor((x-42)/92);
            if(i>=0&&i<3&&api.state.entry.length>i)api.state.entry.splice(i,1);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The museum closed before the locks were opened.');},
        draw(){
          const s=api.state;
          base('#161b30');
          T('CODEBREAKER CABINET',180,32,21,C.yellow);
          T('LOCK '+s.level+'/3  •  GUESS '+(s.history.length+1)+'/7',180,63,14,C.mint);
          T('● exact slot     ◇ wrong slot',180,91,13,C.white);
          for(let i=0;i<3;i++){
            const x=44+i*92;
            R(x,114,86,68,'#344461',12);
            T(s.entry[i]===undefined?'?':String(s.entry[i]),x+43,150,31,s.entry[i]===undefined?C.muted:C.yellow);
          }
          T('Tap a filled slot to remove it',180,199,11,C.muted);
          R(25,214,310,170,'#222d47',12);
          T('PREVIOUS GUESSES',180,234,12,C.mint);
          s.history.forEach((h,i)=>{
            const y=256+i*19;
            T((i+1)+'.  '+h.guess.join('  ')+'       ● '+h.exact+'    ◇ '+h.misplaced,180,y,14,C.white);
          });
          R(17,397,326,42,'#303b57',9);
          T(s.note,180,418,11,C.white);
        }
      };
    }
  );
})();
