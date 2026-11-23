/* Postage Panic — make exact postage with a strict stamp budget. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Postage Panic','strategy','📮','Build exact postage before the mail train leaves.','Tap 2, 5 or 7-unit stamps to reach the target using no more than the allowed stamps. Undo a stamp if needed. Clear three letters; three failed letters or the timer ends the run.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const levels=[
        {target:10,limit:2},
        {target:14,limit:2},
        {target:19,limit:3}
      ];
      const stamps=[2,5,7];
      function begin(s){
        const stage=levels[s.level-1];
        s.target=stage.target;s.limit=stage.limit;s.used=[];s.total=0;
        s.note='Choose stamps for exactly '+s.target+' units.';
      }
      function fail(s){
        s.errors++;
        api.beep(175);
        if(s.errors>=3){api.finish(false,'The mail train departed after three failed letters.');return;}
        begin(s);
        s.note='Letter returned! '+(3-s.errors)+' attempts left.';
      }
      function add(value){
        const s=api.state;
        if(s.ended||!stamps.includes(value))return;
        s.used.push(value);s.total+=value;
        if(s.total>s.target||(s.used.length===s.limit&&s.total!==s.target)){fail(s);return;}
        if(s.total===s.target){
          api.addScore(100+s.level*40+(s.limit-s.used.length)*20);
          api.beep(620);
          if(s.level===levels.length){api.finish(true,'All three letters delivered with exact postage!');return;}
          s.level++;begin(s);s.note='Delivered! Prepare the next letter.';
        }else{
          api.addScore(5);
          s.note='Need '+(s.target-s.total)+' more. '+(s.limit-s.used.length)+' slots left.';
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=105;s.level=1;s.errors=0;
          begin(s);
          api.controls([['+2 STAMP','two'],['+5 STAMP','five'],['+7 STAMP','seven'],['UNDO','undo']]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='undo'){
            if(s.used.length){s.total-=s.used.pop();s.note='Stamp removed. '+(s.limit-s.used.length)+' slots left.';}
            return;
          }
          const value={two:2,five:5,seven:7}[name];
          if(value)add(value);
        },
        tap(x,y){
          if(y>=220&&y<=324){
            const i=Math.floor((x-24)/106);
            if(i>=0&&i<3&&x>=24+i*106&&x<=118+i*106)add(stamps[i]);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The last mail train left before the postage was ready.');},
        draw(){
          const s=api.state;
          base('#17243b');
          T('POSTAGE PANIC',180,38,23,U.mint);
          T('LETTER '+s.level+'/3  ·  RETURNS '+s.errors+'/3',180,70,13,U.yellow);
          R(34,99,292,99,'#f2e8d2',12);
          T('POSTAGE REQUIRED',180,123,13,'#45506a');
          T(s.total+' / '+s.target,180,163,32,'#26344d');
          R(34,204,292,7,'#3d4c67',4);
          R(34,204,292*Math.min(1,s.total/s.target),7,U.mint,4);
          stamps.forEach((v,i)=>{
            const x=24+i*106;
            R(x,225,98,100,'#33476b',11);
            R(x+8,234,82,82,'#f9df9d',6);
            T(String(v),x+49,267,31,'#293955');
            T('UNITS',x+49,294,11,'#293955');
          });
          T('YOUR ENVELOPE',180,352,14,U.white);
          for(let i=0;i<s.limit;i++){
            const x=180-(s.limit-1)*36+i*72;
            O(x,384,26,i<s.used.length?U.yellow:'#34425f');
            T(i<s.used.length?String(s.used[i]):'·',x,389,22,i<s.used.length?'#25344e':U.white);
          }
          T('Slots '+s.used.length+'/'+s.limit,180,423,13,U.mint);
          T(s.note,180,442,11,U.white);
        }
      };
    }
  );
})();
