/* Carousel Mosaic — slide entire rows and columns to restore three color bands. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Carousel Mosaic','puzzle','🎠','Slide a tiny mosaic by rotating entire rows and columns.','Tap a row to slide it right, or tap a column arrow below the board to slide that column down. Restore three solid horizontal color bands in each of three galleries before the move budget runs out.'],
    api => {
      const {base,R,T,S}=api.art, U=api.colors;
      const colors=['#f39b8c','#77d7bd','#a7a1ff'];
      const scrambles=[
        [['c',0],['r',1],['c',2],['r',0]],
        [['r',2],['c',1],['r',0],['c',2],['r',1],['c',0]],
        [['c',2],['r',1],['c',0],['r',2],['c',1],['r',0],['c',2],['r',1]]
      ];
      const limits=[12,18,24];
      function shift(board,axis,index,reverse=false){
        const positions=axis==='r'?[0,1,2].map(c=>index*3+c):[0,1,2].map(r=>r*3+index);
        const values=positions.map(p=>board[p]);
        positions.forEach((p,i)=>{board[p]=values[(i+(reverse?1:2))%3];});
      }
      function solved(board){
        return [0,1,2].every(r=>board[r*3]===board[r*3+1]&&board[r*3+1]===board[r*3+2]);
      }
      function setup(s){
        s.board=[0,0,0,1,1,1,2,2,2];
        scrambles[s.level-1].forEach(([axis,index])=>shift(s.board,axis,index));
        s.moves=0;s.limit=limits[s.level-1];
        s.note='Restore the three horizontal color bands.';
      }
      function play(axis,index){
        const s=api.state;
        if(s.ended||index<0||index>2)return;
        shift(s.board,axis,index);
        s.moves++;api.beep(330+index*70);
        if(solved(s.board)){
          api.addScore(100+Math.max(0,s.limit-s.moves)*15);
          if(s.level===3)api.finish(true,'All three mosaics restored. The carousel glows!');
          else {s.level++;setup(s);s.note='Gallery cleared! A harder mosaic awaits.';}
        }else if(s.moves>=s.limit)api.finish(false,'The mosaic jammed. Try a new arrangement!');
        else s.note=(s.limit-s.moves)+' slides left. Align each horizontal band.';
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=150;
          setup(s);
          api.controls([
            ['Row 1 →','r0',true],['Row 2 →','r1',true],['Row 3 →','r2',true],
            ['Col 1 ↓','c0',false],['Col 2 ↓','c1',false],['Col 3 ↓','c2',false]
          ]);
        },
        action(name){
          if(/^[rc][012]$/.test(name))play(name[0],Number(name[1]));
        },
        tap(x,y){
          if(x>=35&&x<=325&&y>=113&&y<389)play('r',Math.floor((y-113)/92));
          else if(y>=392&&y<=446&&x>=35&&x<=325)play('c',Math.floor((x-35)/97));
        },
        timeout(){if(!api.state.ended)api.finish(false,'The gallery closed before the mosaic was restored.');},
        draw(){
          const s=api.state;
          base('#151c34');
          T('CAROUSEL MOSAIC',180,34,22,U.mint);
          T('GALLERY '+s.level+'/3   •   SLIDES '+s.moves+'/'+s.limit,180,63,14,U.yellow);
          T('Tap a row to slide right →',180,93,14,U.white);
          for(let r=0;r<3;r++)for(let c=0;c<3;c++){
            const x=36+c*97,y=113+r*92;
            R(x,y,91,85,colors[s.board[r*3+c]],12);
            S(x+45,y+42,18,'#ffffff',2);
          }
          for(let c=0;c<3;c++){
            R(36+c*97,393,91,48,'#334361',10);
            T('↓ '+(c+1),81+c*97,423,20,U.white);
          }
          T(s.note,180,105,11,U.muted);
        }
      };
    }
  );
})();
