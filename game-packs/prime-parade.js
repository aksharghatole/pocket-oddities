/* Prime Parade — tap prime-number lanterns, leave composite decoys alone. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Prime Parade','puzzle','🔢','Find the prime lanterns before the parade passes.','Tap each prime number (greater than 1, divisible only by 1 and itself). Leave composites and 1 untouched. Clear three boards; three wrong taps or running out of time ends the parade.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const boards=[
        [2,4,5,9,11,1,8,7,6],
        [15,13,17,21,19,25,23,27,29],
        [31,33,37,39,41,43,49,47,51]
      ];
      const prime=n=>n>1&&Array.from({length:Math.floor(Math.sqrt(n))-1},(_,i)=>i+2).every(d=>n%d!==0);
      function load(s){
        s.numbers=boards[s.level-1];s.found=new Set();
        s.total=s.numbers.filter(prime).length;
        s.note='Find all '+s.total+' prime lanterns.';
      }
      function choose(i){
        const s=api.state;
        if(s.ended||i<0||i>=9||s.found.has(i))return;
        const n=s.numbers[i];
        if(prime(n)){
          s.found.add(i);api.addScore(10+Math.max(0,3-s.errors)*2);api.beep(520);
          s.note=n+' is prime! '+s.found.size+'/'+s.total+' found.';
          if(s.found.size===s.total){
            if(s.level===boards.length)api.finish(true,'All three prime parades safely counted!');
            else {s.level++;load(s);api.beep(720);}
          }
        }else{
          s.errors++;s.note=n+' is not prime. '+(3-s.errors)+' chances remain.';
          api.beep(170);
          if(s.errors>=3)api.finish(false,'Three false alarms stopped the parade.');
        }
      }
      return {
        init(){
          const s=api.state;s.t=105;s.level=1;s.errors=0;load(s);
          api.controls([['Restart board','reset',false]]);
        },
        action(name){
          if(name==='reset'&&!api.state.ended){
            const s=api.state;s.found=new Set();s.note='Board restarted; your mistakes remain.';
          }
        },
        tap(x,y){
          if(x<21||x>=339||y<119||y>=383)return;
          const col=Math.floor((x-21)/106),row=Math.floor((y-119)/88);
          if(col<3&&row<3)choose(row*3+col);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The prime parade passed before you finished.');},
        draw(){
          const s=api.state;base('#17233a');
          T('PRIME PARADE',180,39,25,U.mint);
          T('BOARD '+s.level+'/3   •   ERRORS '+s.errors+'/3',180,73,15,U.yellow);
          T('Tap primes only · 1 is not prime',180,101,14,U.white);
          s.numbers.forEach((n,i)=>{
            const x=21+(i%3)*106,y=119+Math.floor(i/3)*88;
            const hit=s.found.has(i);
            R(x,y,98,80,hit?'#317b68':'#344968',13);
            O(x+49,y+31,23,hit?'#78e8ba':'#567eaa');
            T(String(n),x+49,y+33,25,hit?'#143e37':U.white);
            T(hit?'FOUND':'TAP',x+49,y+65,11,hit?'#d0ffe9':U.muted);
          });
          R(20,395,320,45,'#293c56',10);
          T('FOUND '+s.found.size+'/'+s.total,180,409,12,U.yellow);
          T(s.note,180,427,11,U.white);
        }
      };
    }
  );
})();