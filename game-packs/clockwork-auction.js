/* Clockwork Auction — spend a shared purse to win three strange artifacts. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Clockwork Auction','strategy','⚖️','Outbid the automaton without wasting your limited coins.','You have 14 coins for three lots. Tap a bid from 1 to 6 coins. Each rival bid is hidden, but the clue gives its possible range. Win all three lots by bidding strictly more than the rival. Lose a lot, run out of coins, or run out of time and the auction ends.'],
    api => {
      const {base,R,O,T}=api.art, C=api.colors;
      const lots=[
        {name:'MOON KEY',icon:'☾',range:'1–3',bid:2},
        {name:'CLOCKWORK PEARL',icon:'✧',range:'2–4',bid:3},
        {name:'GLASS COMET',icon:'✦',range:'3–5',bid:4}
      ];
      function buttons(){
        api.controls(Array.from({length:6},(_,i)=>[(i+1)+' COIN'+(i?'S':''),'bid-'+(i+1)]));
      }
      return {
        init(){
          const s=api.state;
          s.t=100;s.level=1;s.coins=14;s.won=0;s.note='Pick a bid. The highest offer wins.';
          buttons();
        },
        action(name){
          const s=api.state;
          if(s.ended||!/^bid-[1-6]$/.test(name))return;
          const bid=Number(name.slice(4)),lot=lots[s.level-1];
          if(bid>s.coins){s.note='Only '+s.coins+' coins remain. Choose a smaller bid.';api.beep(170);return;}
          s.coins-=bid;
          if(bid<=lot.bid){
            api.finish(false,'The automaton bid '+lot.bid+' coins for the '+lot.name+'. Your bid of '+bid+' lost. Try again!');
            return;
          }
          s.won++;
          api.addScore(100+(6-bid)*15);
          api.beep(650);
          if(s.won===3){api.addScore(s.coins*20);api.finish(true,'All three artifacts are yours! '+s.coins+' coins left in your purse.');return;}
          s.level++;
          if(s.coins<=lots[s.level-1].bid){
            api.finish(false,'You won the lot but have too few coins to outbid the next rival. Budget carefully!');
            return;
          }
          s.note='Won '+lot.name+' for '+bid+' coins! Next lot awaits.';
        },
        timeout(){if(!api.state.ended)api.finish(false,'The auction bell rang. No more bids!');},
        draw(){
          const s=api.state,lot=lots[Math.min(2,s.level-1)];
          base('#181b34');
          T('CLOCKWORK AUCTION',180,40,23,C.yellow);
          T('LOT '+s.level+'/3    •    WON '+s.won+'/3',180,72,15,C.mint);
          R(29,97,302,234,'#29334e',18);
          O(180,177,66,'#455174');
          T(lot.icon,180,180,72,'#ffe19a');
          T(lot.name,180,265,20,C.white);
          T('RIVAL BID: '+lot.range+' COINS',180,299,15,C.pink);
          T('YOUR PURSE: '+s.coins+' / 14 COINS',180,360,18,C.yellow);
          T('CHOOSE A BID BELOW (1–6 COINS)',180,391,12,C.mint);
          R(20,410,320,30,'#29334e',9);
          T(s.note,180,425,11,C.white);
        }
      };
    }
  );
})();
