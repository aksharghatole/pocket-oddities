/* Rain Ledger — restore garden plots from row and column rain totals. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Rain Ledger','puzzle','🌧️','Reconstruct rain-soaked garden maps from their row and column totals.','Tap squares to mark wet or dry. The numbers at the right and bottom tell how many wet squares belong in each row and column. Match every total and tap CHECK. Solve three gardens; three wrong checks end the forecast.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const gardens=[
        ['101','011','110'],
        ['1100','0110','0011','1001'],
        ['10110','01011','11000','00101','01101']
      ];
      const count = (values) => values.reduce((a,b)=>a+b,0);
      function setup(s) {
        const solution=gardens[s.level-1];
        s.size=solution.length;
        s.rows=solution.map(row=>count([...row].map(Number)));
        s.cols=Array.from({length:s.size},(_,c)=>count(solution.map(row=>Number(row[c]))));
        s.cells=Array.from({length:s.size},()=>Array(s.size).fill(0));
        s.note='Tap plots to mark rain. Match every total.';
      }
      function check() {
        const s=api.state;
        if(s.ended)return;
        const rows=s.cells.map(count);
        const cols=s.cols.map((_,c)=>count(s.cells.map(row=>row[c])));
        if(rows.every((v,i)=>v===s.rows[i])&&cols.every((v,i)=>v===s.cols[i])){
          api.addScore(100+s.size*15+(3-s.errors)*20);
          api.beep(600);
          if(s.level===gardens.length)api.finish(true,'All three rain maps restored. The gardens can bloom again!');
          else {s.level++;setup(s);s.note='Garden restored! The next ledger is larger.';}
        } else {
          s.errors++;
          api.beep(160);
          s.note='Totals do not match. '+(3-s.errors)+' checks left.';
          if(s.errors>=3)api.finish(false,'The forecast was lost after three incorrect checks.');
        }
      }
      function toggle(x,y) {
        const s=api.state;
        if(s.ended)return;
        const step=s.size===5?49:57, left=(360-(s.size+1)*step)/2, top=125;
        const c=Math.floor((x-left)/step),r=Math.floor((y-top)/step);
        if(r<0||c<0||r>=s.size||c>=s.size)return;
        if(x>=left+c*step+step-5||y>=top+r*step+step-5)return;
        s.cells[r][c]^=1;
        api.beep(s.cells[r][c]?420:300);
      }
      return {
        init(){
          const s=api.state;s.t=150;s.level=1;s.errors=0;
          setup(s);
          api.controls([['CHECK TOTALS','check',true],['CLEAR GRID','clear',false]]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='check')check();
          if(name==='clear'){s.cells.forEach(row=>row.fill(0));s.note='Grid cleared. Start again.';}
        },
        tap(x,y){toggle(x,y);},
        timeout(){if(!api.state.ended)api.finish(false,'The rain stopped before the ledger was complete.');},
        draw(){
          const s=api.state;
          base('#13283a');
          T('RAIN LEDGER',180,37,24,U.mint);
          T('GARDEN '+s.level+'/3  ·  WRONG CHECKS '+s.errors+'/3',180,69,13,U.yellow);
          T('Wet squares per row →',180,102,14,U.white);
          const step=s.size===5?49:57,left=(360-(s.size+1)*step)/2,top=125;
          const actualRows=s.cells.map(count);
          const actualCols=s.cols.map((_,c)=>count(s.cells.map(row=>row[c])));
          for(let r=0;r<s.size;r++){
            for(let c=0;c<s.size;c++){
              const x=left+c*step,y=top+r*step;
              R(x,y,step-5,step-5,s.cells[r][c]?'#65c9e8':'#345466',8);
              T(s.cells[r][c]?'●':'·',x+(step-5)/2,y+(step-5)/2+3,22,s.cells[r][c]?'#143248':'#9db4bc');
            }
            T(String(s.rows[r]),left+s.size*step+step/2,top+r*step+step/2,20,actualRows[r]===s.rows[r]?U.mint:U.yellow);
          }
          for(let c=0;c<s.size;c++)
            T(String(s.cols[c]),left+c*step+(step-5)/2,top+s.size*step+step/2,20,actualCols[c]===s.cols[c]?U.mint:U.yellow);
          R(17,410,326,30,'#284658',9);
          T(s.note,180,426,11,U.white);
        }
      };
    }
  );
})();
