/* Morse Moths — translate blinking lantern patterns using two big touch keys. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Morse Moths','weird','🦋','Send tiny dot-and-dash signals to guide moths home.','Read the lantern code shown above. Tap DOT or DASH in the same order. Clear three messages; three errors or running out of time ends the flight. Use Reset Signal to retry the current message.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const messages=['.-.','--..','.-..-'];
      const names=['GARDEN','ROOFTOP','MOON'];
      function start(s){
        s.sequence=messages[s.level-1];
        s.entered='';
        s.note='Copy the signal from left to right.';
      }
      function send(mark){
        const s=api.state;
        if(s.ended)return;
        const expected=s.sequence[s.entered.length];
        if(mark!==expected){
          s.errors++;
          s.entered='';
          s.note='Signal scrambled! Start this message again.';
          api.beep(170);
          if(s.errors>=3)api.finish(false,'The moths lost the signal. Try another flight.');
          return;
        }
        s.entered+=mark;
        api.addScore(10);
        api.beep(mark==='.'?480:300);
        s.note='Nice! '+s.entered.length+'/'+s.sequence.length+' symbols sent.';
        if(s.entered.length===s.sequence.length){
          api.addScore(40+s.level*20);
          if(s.level===messages.length){
            api.finish(true,'All three moth colonies found their way home!');
          }else{
            s.level++;
            start(s);
            s.note='Message delivered! Copy the next signal.';
          }
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=100;s.level=1;s.errors=0;
          start(s);
          api.controls([['DOT ·','dot',true],['DASH —','dash',true],['Reset Signal','reset',false]]);
        },
        action(name){
          if(api.state.ended)return;
          if(name==='dot')send('.');
          else if(name==='dash')send('-');
          else if(name==='reset'){
            api.state.entered='';
            api.state.note='Signal reset. Copy from the first symbol.';
          }
        },
        tap(x,y){
          if(y>=270&&y<=360){
            if(x>=22&&x<=171)send('.');
            else if(x>=189&&x<=338)send('-');
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'Dawn arrived before the last signal.');},
        draw(){
          const s=api.state;
          base('#121b30');
          T('MORSE MOTHS',180,35,25,U.mint);
          T('MESSAGE '+s.level+'/3  •  ERRORS '+s.errors+'/3',180,65,14,U.yellow);
          T('DESTINATION: '+names[s.level-1],180,97,15,U.white);
          R(22,118,316,100,'#27364f',14);
          T('LANTERN SIGNAL',180,138,12,U.muted);
          const n=s.sequence.length,step=Math.min(55,285/n);
          for(let i=0;i<n;i++){
            const x=180+(i-(n-1)/2)*step;
            if(s.sequence[i]==='.')O(x,177,8,'#ffe29c');
            else R(x-17,170,34,14,'#ffe29c',7);
          }
          T('SENT '+s.entered.length+'/'+s.sequence.length,180,245,14,U.mint);
          R(22,270,149,90,'#255b69',14);
          R(189,270,149,90,'#624b7b',14);
          T('·',96,311,42,U.white);
          T('—',263,311,42,U.white);
          T('DOT',96,343,13,U.white);
          T('DASH',263,343,13,U.white);
          R(18,380,324,56,'#25314a',12);
          T(s.note,180,406,12,U.white);
          T('Tap either key or use the buttons below.',180,425,10,U.muted);
        }
      };
    }
  );
})();
