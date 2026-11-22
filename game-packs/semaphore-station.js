/* Semaphore Station — read a short signal and tap its dot/dash rhythm. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Semaphore Station','puzzle','📡','Decode a lighthouse signal using dots and dashes.','Read the illuminated signal. Tap DOT or DASH in order to transmit it. Clear five messages before three errors or the clock runs out.'],
    api => {
      const {base,R,O,T}=api.art, C=api.colors;
      const signals=['.-','--.','..-','-.-.','.-..-'];
      const colors=['#83c5ff','#ffe18d','#8af0c8','#f3a5d0','#a7a5ff'];
      function send(symbol) {
        const s=api.state;
        if(s.ended || s.level>signals.length) return;
        const target=signals[s.level-1];
        if(symbol!==target[s.cursor]){
          s.errors++;s.message='Wrong pulse! Start this message again.';
          s.cursor=0;api.beep(180);
          if(s.errors>=3) api.finish(false,'The lighthouse lost the signal. Try again.');
          return;
        }
        s.cursor++;api.addScore(10);api.beep(symbol==='.'?520:350);
        s.message='Good pulse! '+s.cursor+'/'+target.length;
        if(s.cursor===target.length){
          api.addScore(25);
          if(s.level===signals.length){
            api.finish(true,'All five lighthouse messages delivered!');
            return;
          }
          s.level++;s.cursor=0;s.message='Message delivered. Read the next signal!';
        }
      }
      return {
        init(){
          const s=api.state;s.level=1;s.cursor=0;s.errors=0;s.t=95;s.message='Read the signal and transmit it.';
          api.controls([['● DOT','dot',true],['━ DASH','dash',true]]);
        },
        action(name){if(name==='dot')send('.');if(name==='dash')send('-');},
        tap(x,y){if(y>=270&&y<=372){if(x>=30&&x<177)send('.');else if(x>=183&&x<=330)send('-');}},
        draw(){
          const s=api.state,target=signals[Math.min(s.level-1,signals.length-1)];
          base('#141b35');
          T('SEMAPHORE STATION',180,43,22,C.yellow);
          T('MESSAGE '+s.level+' / '+signals.length+'     ERRORS '+s.errors+'/3',180,76,13,C.white);
          R(30,105,300,130,'#283452',18);
          T('READ THIS SIGNAL',180,132,12,C.muted);
          for(let i=0;i<target.length;i++){
            const x=180+(i-(target.length-1)/2)*49;
            R(x-21,156,42,50,i<s.cursor?'#39765f':colors[(s.level-1)%colors.length],9);
            T(target[i]==='.'?'●':'━',x,181,24,'#162039');
          }
          T('SENT '+s.cursor+'/'+target.length,180,224,13,C.mint);
          R(30,270,147,100,'#65b7ff',15);R(183,270,147,100,'#ffe18d',15);
          T('●',103,310,36,'#18213b');T('DOT',103,348,16,'#18213b');
          T('━',257,310,36,'#18213b');T('DASH',257,348,16,'#18213b');
          T(s.message,180,405,12,C.white);
          T('Tap the pads or use the buttons below',180,431,11,C.muted);
        }
      };
    }
  );
})();
