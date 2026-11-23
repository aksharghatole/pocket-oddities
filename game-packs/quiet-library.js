/* Quiet Library — sort a tiny shelf with adjacent swaps. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Quiet Library','puzzle','📚','Put a chaotic little bookshelf back in order.','Tap a book, then a neighboring book to swap them. Or select a book and use the left/right buttons. Sort all books shortest to tallest in three shelves before time runs out. Each shelf has a move budget; three failed shelves end your shift.'],
    api => {
      const {base,R,T,L}=api.art, U=api.colors;
      const shelves=[[3,1,4,2],[4,2,5,1,3],[6,3,1,5,2,4]];
      const shades=['#f5a4b7','#8bd4e4','#e9c57c','#bba4ec','#86d6ad','#f19d81'];
      function inversions(a) {
        let n=0;
        for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])n++;
        return n;
      }
      function load() {
        const s=api.state;
        s.books=shelves[s.level-1].slice();
        s.budget=inversions(s.books)+2;
        s.moves=0;s.selected=-1;
        s.note='Select a book, then its neighbor.';
      }
      function swap(a,b) {
        const s=api.state;
        if(s.ended||a<0||b<0||a>=s.books.length||b>=s.books.length)return;
        if(Math.abs(a-b)!==1){s.selected=b;s.note='Only neighboring books can swap.';return;}
        [s.books[a],s.books[b]]=[s.books[b],s.books[a]];
        s.moves++;s.selected=-1;api.beep(410);
        if(s.books.every((v,i)=>v===i+1)){
          api.addScore(100+20*(s.budget-s.moves)+25*(3-s.strikes));
          if(s.level===shelves.length)api.finish(true,'Every shelf is orderly. The library can finally rest.');
          else{s.level++;load();s.note='Shelf restored! A trickier one awaits.';}
        }else if(s.moves>=s.budget){
          s.strikes++;api.beep(160);
          if(s.strikes>=3)api.finish(false,'Three shelves were left in disarray.');
          else{load();s.note='Out of moves! Shelf reset. '+(3-s.strikes)+' retries left.';}
        }else s.note='Good swap. '+(s.budget-s.moves)+' moves remain.';
      }
      function choose(i){
        const s=api.state;
        if(s.ended||i<0||i>=s.books.length)return;
        if(s.selected===-1){s.selected=i;s.note='Now choose a neighboring book.';}
        else if(s.selected===i){s.selected=-1;s.note='Selection cleared.';}
        else swap(s.selected,i);
      }
      return {
        init(){
          const s=api.state;s.t=125;s.level=1;s.strikes=0;
          load();
          api.controls([['← Swap left','left',true],['Swap right →','right',true],['Clear selection','clear',false]]);
        },
        action(name){
          const s=api.state;
          if(s.ended)return;
          if(name==='clear'){s.selected=-1;s.note='Selection cleared.';return;}
          if(s.selected<0){s.note='Tap a book first.';return;}
          if(name==='left')swap(s.selected,s.selected-1);
          if(name==='right')swap(s.selected,s.selected+1);
        },
        tap(x,y){
          const s=api.state,n=s.books.length;
          if(y<158||y>348||x<18||x>342)return;
          const step=324/n,i=Math.floor((x-18)/step);
          choose(Math.min(n-1,i));
        },
        timeout(){if(!api.state.ended)api.finish(false,'Closing time! The shelves are still a mess.');},
        draw(){
          const s=api.state,n=s.books.length,step=324/n;
          base('#171d33');
          T('QUIET LIBRARY',180,36,24,U.mint);
          T('SHELF '+s.level+'/3  •  FAILED '+s.strikes+'/3',180,70,14,U.yellow);
          T('SORT SHORTEST → TALLEST',180,108,17,U.white);
          T('MOVES '+s.moves+' / '+s.budget,180,134,14,U.muted);
          R(13,350,334,14,'#9a6b50',4);
          s.books.forEach((height,i)=>{
            const x=18+i*step+3,w=step-7,h=64+height*23,y=344-h;
            if(i===s.selected)R(x-3,y-8,w+6,h+13,'#fff3c0',8);
            R(x,y,w,h,shades[(height-1)%shades.length],5);
            R(x+6,y+8,Math.max(3,w-12),4,'#ffffff80',2);
            L(x+5,y+h-18,x+w-5,y+h-18,'#24314b',2);
            T(String(height),x+w/2,y+h/2,22,'#26324a');
          });
          R(20,388,320,46,'#293651',12);
          T(s.note,180,410,12,U.white);
          T('Tap adjacent books to swap',180,445,11,U.muted);
        }
      };
    }
  );
})();