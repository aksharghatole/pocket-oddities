/* Potion Scale — combine measured drops without overflowing the recipe. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Potion Scale','puzzle','⚗️','Mix precise magical recipes using three measured droppers.','Tap the 1, 3, or 5-drop vial to reach the target exactly. You have a limited number of pours per recipe. Undo your last pour or reset the flask. Complete three recipes; three spills end the shift.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors;
      const recipes=[{target:7,limit:3},{target:11,limit:3},{target:14,limit:4}];
      const vials=[1,3,5];
      function setup(s){
        const recipe=recipes[s.level-1];
        s.target=recipe.target;s.limit=recipe.limit;s.amount=0;s.pours=[];
        s.note='Measure '+s.target+' drops in '+s.limit+' pours.';
      }
      function pour(value){
        const s=api.state;
        if(s.ended)return;
        if(s.amount+value>s.target){
          s.spills++;s.note='Overflow! '+(3-s.spills)+' spills left.';
          api.beep(150);
          if(s.spills>=3)api.finish(false,'Three spills ruined the potion. Try again!');
          return;
        }
        if(s.pours.length>=s.limit)return;
        s.pours.push(value);s.amount+=value;
        api.beep(360+value*80);
        if(s.amount===s.target){
          api.addScore(100+20*(s.limit-s.pours.length)+10*(3-s.spills));
          if(s.level===recipes.length){
            api.finish(true,'All three potions brewed to perfection!');
          }else{
            s.level++;setup(s);s.note='Perfect! Next recipe: '+s.target+' drops.';
          }
        }else if(s.pours.length>=s.limit){
          s.spills++;s.note='Out of pours! Flask reset. '+(3-s.spills)+' spills left.';
          api.beep(150);
          if(s.spills>=3)api.finish(false,'Three failed recipes ended your shift.');
          else {s.amount=0;s.pours=[];}
        }else s.note=s.amount+' / '+s.target+' drops. '+(s.limit-s.pours.length)+' pours left.';
      }
      return {
        init(){
          const s=api.state;s.t=120;s.level=1;s.spills=0;
          setup(s);
          api.controls([['+1 drop','one',true],['+3 drops','three',true],['+5 drops','five',true],['Undo','undo',false],['Reset flask','reset',false]]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='one')pour(1);
          if(name==='three')pour(3);
          if(name==='five')pour(5);
          if(name==='undo'&&s.pours.length){
            s.amount-=s.pours.pop();s.note='Last pour undone.';
          }
          if(name==='reset'){s.amount=0;s.pours=[];s.note='Flask emptied. Try another combination.';}
        },
        tap(x,y){
          if(y>=285&&y<=383){
            const i=Math.floor((x-24)/104);
            if(i>=0&&i<3)pour(vials[i]);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The apothecary closed before all potions were finished.');},
        draw(){
          const s=api.state;
          base('#171d35');
          T('POTION SCALE',180,35,24,U.mint);
          T('RECIPE '+s.level+'/3   •   SPILLS '+s.spills+'/3',180,66,14,U.yellow);
          T('TARGET: '+s.target+' DROPS',180,101,20,U.white);
          R(87,119,186,145,'#34405c',20);
          R(97,129,166,125,'#1c2743',14);
          const height=112*s.amount/s.target;
          if(height>0)R(102,249-height,156,height,'#7ae5cb',9);
          T(s.amount+' / '+s.target,180,186,30,s.amount>0?'#101e33':U.white);
          T('POURS '+s.pours.length+'/'+s.limit,180,278,14,U.muted);
          vials.forEach((v,i)=>{
            const x=24+i*104;
            R(x,297,96,79,['#507ca8','#785eac','#a26a83'][i],13);
            T('+'+v,x+48,327,26,U.white);
            T('DROPS',x+48,355,12,U.white);
          });
          R(20,394,320,44,'#293552',11);
          T(s.note,180,416,12,U.white);
        }
      };
    }
  );
})();
