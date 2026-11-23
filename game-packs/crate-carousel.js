/* Crate Carousel — rotate two independent cargo rings to match dock markers. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Crate Carousel','puzzle','📦','Rotate two cargo carousels to dock their glowing parcels.','Use the four large rotation buttons to turn the OUTER or INNER ring left/right. Match both colored parcels on each ring to their outlined docks. Complete three shifts within the move budgets. Three failed shifts end the game.'],
    api => {
      const {base,R,O,S,T,L}=api.art, U=api.colors;
      const rounds=[
        {outer:2,inner:6,limit:8},
        {outer:5,inner:3,limit:9},
        {outer:7,inner:4,limit:10}
      ];
      const parcels=[[0,3],[1,5]];
      const paints=[['#ffca7a','#83e4d4'],['#bca0ff','#ff94b5']];
      const mod=n=>(n%8+8)%8;
      const point=(ring,index)=>{
        const a=-Math.PI/2+index*Math.PI/4;
        const radius=ring===0?139:79;
        return [180+radius*Math.cos(a),225+radius*Math.sin(a)];
      };
      function begin(s){
        const round=rounds[s.level-1];
        s.offsets=[0,0];
        s.targets=[round.outer,round.inner];
        s.moves=0;s.limit=round.limit;
        s.note='Match the outlined docks on both rings.';
      }
      function matched(s,ring){
        return parcels[ring].every(i=>mod(i+s.offsets[ring])===mod(i+s.targets[ring]));
      }
      function rotate(ring,delta){
        const s=api.state;
        if(s.ended)return;
        s.offsets[ring]=mod(s.offsets[ring]+delta);
        s.moves++;
        api.beep(330+ring*110);
        if(matched(s,0)&&matched(s,1)){
          api.addScore(150+Math.max(0,s.limit-s.moves)*20);
          if(s.level===rounds.length){
            api.finish(true,'Every parcel docked. The carousel crew cheers!');
          }else{
            s.level++;
            begin(s);
            s.note='Docked! A new shift begins.';
          }
        }else if(s.moves>=s.limit){
          s.strikes++;
          if(s.strikes>=3)api.finish(false,'Three shifts ran out of moves. Try the routes again!');
          else {begin(s);s.note='Out of moves! Shift restarted ('+s.strikes+'/3 failures).';}
        }else s.note=(s.limit-s.moves)+' moves left. Rotate either ring.';
      }
      return {
        init(){
          const s=api.state;
          s.t=115;s.level=1;s.strikes=0;
          begin(s);
          api.controls([
            ['OUTER ↶','outer-left',true],['OUTER ↷','outer-right',true],
            ['INNER ↶','inner-left',true],['INNER ↷','inner-right',true]
          ]);
        },
        action(name){
          if(name==='outer-left')rotate(0,-1);
          if(name==='outer-right')rotate(0,1);
          if(name==='inner-left')rotate(1,-1);
          if(name==='inner-right')rotate(1,1);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The depot closed before the last parcel was docked.');},
        draw(){
          const s=api.state;
          base('#171e36');
          T('CRATE CAROUSEL',180,33,23,U.yellow);
          T('SHIFT '+s.level+'/3   •   MOVES '+s.moves+'/'+s.limit+'   •   FAILS '+s.strikes+'/3',180,62,12,U.white);
          for(let ring=0;ring<2;ring++){
            S(180,225,ring===0?139:79,'#586580',3);
            for(let i=0;i<8;i++){
              const [x,y]=point(ring,i);
              O(x,y,ring===0?17:14,'#303e5d');
              S(x,y,ring===0?17:14,'#7182a2',1);
            }
            parcels[ring].forEach((start,j)=>{
              const [tx,ty]=point(ring,mod(start+s.targets[ring]));
              S(tx,ty,ring===0?23:20,paints[ring][j],4);
              const [x,y]=point(ring,mod(start+s.offsets[ring]));
              O(x,y,ring===0?15:12,paints[ring][j]);
              T(j===0?'◆':'●',x,y,ring===0?17:14,'#18213a');
            });
          }
          O(180,225,28,'#293650');
          T('↶ ↷',180,225,16,U.white);
          R(16,392,328,43,'#293650',11);
          T('OUTER & INNER: rotate with buttons below',180,406,11,U.mint);
          T(s.note,180,424,10,U.white);
        }
      };
    }
  );
})();
