/* Counterweight Courier — balance a bridge with touch-placed weights. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Counterweight Courier','puzzle','⚖️','Balance a tiny delivery bridge using counterweights.','Choose a 1, 2, or 3-unit weight, then tap one of the three right-hand hooks. Each hook can hold one weight. Match the left-side torque exactly in at most three placements. Balance three bridges to win; overshooting or using all three hooks without balancing ends the delivery.'],
    api => {
      const {base,R,O,L,T}=api.art, C=api.colors;
      const goals=[4,7,9], hooks=[1,2,3];
      function start(s) {
        s.weights=[0,0,0];s.selected=1;s.moves=0;
        s.note='Select a weight, then tap an empty hook.';
      }
      function place(index) {
        const s=api.state;
        if(s.ended||index<0||index>2||s.weights[index])return;
        s.weights[index]=s.selected;s.moves++;
        const total=s.weights.reduce((sum,w,i)=>sum+w*hooks[i],0);
        const target=goals[s.level-1];
        if(total===target) {
          api.addScore(100+(3-s.moves)*25);
          api.beep(720);
          if(s.level===3) {
            api.finish(true,'All three bridges balanced! The courier crosses safely.');
          } else {
            s.level++;start(s);s.note='Bridge '+s.level+' is ready. Balance it!';
          }
        } else if(total>target||s.moves===3) {
          api.beep(160);
          api.finish(false,total>target?'Too much torque! The bridge tipped.':'No hooks left. The bridge stayed unbalanced.');
        } else {
          s.note='Right torque '+total+' / '+target+'. Keep balancing.';
          api.beep(430);
        }
      }
      return {
        init() {
          const s=api.state;
          s.t=120;s.level=1;start(s);
          api.controls([['1 unit','weight1',false],['2 units','weight2',false],['3 units','weight3',true]]);
        },
        action(name) {
          const s=api.state;
          if(s.ended)return;
          const weight=Number(name.replace('weight',''));
          if(/^weight[123]$/.test(name)){s.selected=weight;s.note='Selected '+weight+' unit'+(weight===1?'':'s')+'. Tap an empty hook.';}
        },
        tap(x,y) {
          if(y<180||y>365||x<190||x>350)return;
          const index=Math.round((x-222)/55);
          if(index>=0&&index<3&&Math.abs(x-(222+55*index))<=24)place(index);
        },
        update(dt) {
          const s=api.state;
          if(s.ended)return;
          s.t=Math.max(0,s.t-dt);
          if(s.t<=0)api.finish(false,'Delivery time ran out before the bridges were balanced.');
        },
        timeout(){if(!api.state.ended)api.finish(false,'The courier ran out of time.');},
        draw() {
          const s=api.state,target=goals[s.level-1];
          const total=s.weights.reduce((sum,w,i)=>sum+w*hooks[i],0);
          base('#182239');
          T('COUNTERWEIGHT COURIER',180,31,20,C.mint);
          T('BRIDGE '+s.level+'/3  ·  PLACEMENTS '+s.moves+'/3',180,63,13,C.yellow);
          T('LEFT TORQUE '+target+'   RIGHT TORQUE '+total,180,94,13,C.white);
          R(25,122,310,48,'#283650',10);
          T('Selected: '+s.selected+' unit'+(s.selected===1?'':'s')+'  ·  choose below',180,146,15,C.mint);
          L(30,268,330,268,'#d2b18a',9);
          R(167,270,26,70,'#778ba8',7);
          T('▲',180,253,32,C.yellow);
          O(180,268,11,C.white);
          R(42,211,70,45,'#a57c64',9);
          T(String(target),77,235,25,C.white);
          T('FIXED LOAD',77,194,11,C.muted);
          for(let i=0;i<3;i++){
            const x=222+i*55,w=s.weights[i];
            L(x,271,x,302,'#8aa4be',3);
            O(x,307,7,C.yellow);
            R(x-22,316,44,44,w?'#6cb99c':'#344561',9);
            T(w?String(w):'+',x,339,25,w?'#122c2b':C.white);
            T('×'+hooks[i],x,383,13,C.yellow);
          }
          T('Tap a right hook to place the selected weight',180,406,12,C.white);
          T(s.note,180,432,11,C.mint);
        }
      };
    }
  );
})();
