/* Archive Alibi — spot the single false testimony using the evidence ledger. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Archive Alibi','puzzle','🗃️','Find the one false witness note in each museum case.','Read the evidence at the top. Two witness cards match the evidence; one is false. Tap the false card, or choose Witness A, B, or C below. Solve four cases before three mistakes or the clock runs out.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const cases=[
        {evidence:['The vault opened at 8.','The key was brass.'],notes:['The key was brass.','The vault opened at 9.','The vault opened at 8.'],liar:1},
        {evidence:['The crate weighed 6 kg.','The label was blue.'],notes:['The label was red.','The crate weighed 6 kg.','The label was blue.'],liar:0},
        {evidence:['The bell rang twice.','The door faced east.'],notes:['The door faced east.','The bell rang twice.','The bell rang three times.'],liar:2},
        {evidence:['The painting had 5 stars.','The frame was silver.'],notes:['The frame was silver.','The painting had 4 stars.','The painting had 5 stars.'],liar:1}
      ];
      function choose(i){
        const s=api.state;
        if(s.ended||i<0||i>2)return;
        const c=cases[s.level-1];
        if(i===c.liar){
          api.addScore(100+Math.max(0,3-s.mistakes)*25);
          api.beep(560);
          if(s.level===cases.length){api.finish(true,'All four false reports uncovered. The archive is safe!');return;}
          s.level++;s.note='Correct! A new case has arrived.';
        }else{
          s.mistakes++;api.beep(170);
          if(s.mistakes>=3){api.finish(false,'Too many false accusations. The case is closed.');return;}
          s.note='That note matches the evidence. '+(3-s.mistakes)+' chances left.';
        }
      }
      return {
        init(){
          const s=api.state;s.t=110;s.level=1;s.mistakes=0;s.note='Find the ONE false report.';
          api.controls([['Witness A','a',true],['Witness B','b',true],['Witness C','c',true]]);
        },
        action(name){choose(['a','b','c'].indexOf(name));},
        tap(x,y){
          if(x>=22&&x<=338&&y>=199&&y<388)choose(Math.floor((y-199)/63));
        },
        timeout(){if(!api.state.ended)api.finish(false,'The archive closed before the investigation was complete.');},
        draw(){
          const s=api.state,c=cases[s.level-1];
          base('#171d35');
          T('ARCHIVE ALIBI',180,37,24,U.mint);
          T('CASE '+s.level+'/4  ·  MISTAKES '+s.mistakes+'/3',180,69,14,U.yellow);
          R(20,88,320,100,'#293752',13);
          T('EVIDENCE LEDGER',180,111,15,U.mint);
          c.evidence.forEach((line,i)=>T(line,180,139+i*24,15,U.white));
          T('TAP THE FALSE WITNESS NOTE',180,194,13,U.yellow);
          c.notes.forEach((line,i)=>{
            const y=202+i*63;
            R(22,y,316,56,'#334461',11);
            R(29,y+9,37,38,'#526d8b',8);
            T('ABC'[i],47,y+34,18,U.white);
            T(line,200,y+33,15,U.white);
          });
          R(22,400,316,39,'#283550',10);
          T(s.note,180,422,12,U.white);
        }
      };
    }
  );
})();
