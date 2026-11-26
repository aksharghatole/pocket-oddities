/* Fraction Foundry — cast exact one-unit ingots from fractional scraps. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Fraction Foundry','puzzle','⚖️','Combine fractional metal scraps into perfectly balanced ingots.','Tap scraps to add them to the furnace. Reach exactly 1 whole ingot to advance. Tap a selected scrap again to remove it. Overfilling costs one of three safety seals. Forge three ingots before the 135-second shift ends.'],
    api => {
      const {base,R,T,L}=api.art, U=api.colors;
      const recipes=[
        [4,2,2,1,1,1],
        [3,3,2,2,1,1],
        [4,3,2,2,1,1,1]
      ]; // Each number is eighths; every recipe has a solution.
      const colors=['#9dd7e7','#e8b1d4','#f0d28b','#a6dfbd','#c3b2f1','#f3ac98','#a5c5f0'];
      function total(s){return s.selected.reduce((n,i)=>n+s.pieces[i],0);}
      function startRound(){
        const s=api.state;
        s.pieces=recipes[s.level-1].slice();s.selected=[];
        s.note='Choose scraps totaling 8/8.';
      }
      function choose(i){
        const s=api.state;
        if(s.ended||i<0||i>=s.pieces.length)return;
        const index=s.selected.indexOf(i);
        if(index>=0)s.selected.splice(index,1);
        else s.selected.push(i);
        const sum=total(s);
        if(sum>8){
          s.seals--;s.selected=[];api.beep(150);
          s.note='Furnace overflow! Safety seal lost.';
          if(s.seals<=0)api.finish(false,'The furnace ran out of safety seals.');
        }else if(sum===8){
          api.addScore(100+20*s.level+15*s.seals);api.beep(700);
          if(s.level===3)api.finish(true,'Three perfect ingots! The foundry is yours.');
          else{s.level++;startRound();s.note='Perfect cast! Forge the next ingot.';}
        }else{
          s.note=sum===0?'Choose scraps totaling 8/8.':'Furnace at '+sum+'/8. Keep balancing.';
          api.beep(350);
        }
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=135;s.seals=3;
          startRound();
          api.controls([['Empty furnace','clear',true]]);
        },
        action(name){
          if(name==='clear'&&!api.state.ended){
            api.state.selected=[];api.state.note='Furnace emptied. Try another combination.';
          }
        },
        tap(x,y){
          const s=api.state;
          if(y<151||y>347||x<18||x>342)return;
          const col=Math.floor((x-18)/108),row=Math.floor((y-151)/100);
          choose(row*3+col);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The foundry shift ended before the final cast.');},
        draw(){
          const s=api.state, sum=total(s);
          base('#1c2634');
          T('FRACTION FOUNDRY',180,35,23,U.yellow);
          T('INGOT '+s.level+'/3  •  SEALS '+s.seals+'/3',180,66,14,U.mint);
          R(28,86,304,42,'#394b5c',12);
          R(32,90,296*sum/8,34,sum===8?'#9ce6b7':'#e9b47c',9);
          T('FURNACE '+sum+'/8  →  8/8',180,113,16,'#152336');
          s.pieces.forEach((value,i)=>{
            const col=i%3,row=Math.floor(i/3),x=20+col*108,y=151+row*100;
            const active=s.selected.includes(i);
            R(x,y,100,88,active?'#f7e5a8':colors[i],13);
            T(value+'/8',x+50,y+38,25,'#233148');
            T(active?'✓ LOADED':'TAP TO ADD',x+50,y+68,11,'#34465c');
          });
          L(30,362,330,362,'#617184',2);
          T('Exact total: 8/8 = one whole',180,387,15,U.white);
          T(s.note,180,418,12,U.mint);
          T('Tap a loaded scrap to remove it',180,443,11,U.muted);
        }
      };
    }
  );
})();
