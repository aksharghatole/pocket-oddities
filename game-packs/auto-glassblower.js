/* Glassblower — hold to inflate molten glass, release inside the target ring. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Glassblower','reflex','🫧','Blow delicate glass ornaments to exactly the right size.','Hold your finger on the furnace (or press BLOW), then release (or press SEAL) while the glowing bubble is inside the green target ring. Make two ornaments in each of three workshops. Three shattered bubbles or running out of time ends the run.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const targets=[44,61,35], tolerance=[11,9,7], rates=[27,34,43];
      function newBubble(){
        const s=api.state;
        s.radius=12;s.blowing=false;
        s.note='Hold to inflate. Release inside the green ring!';
      }
      function shatter(message){
        const s=api.state;
        if(s.ended)return;
        s.blowing=false;s.shattered++;
        api.beep(145);
        if(s.shattered>=3){api.finish(false,'Three glass bubbles shattered. Try a gentler release.');return;}
        newBubble();s.note=message+' Try again ('+s.shattered+'/3 breaks).';
      }
      function seal(){
        const s=api.state;
        if(s.ended||!s.blowing)return;
        s.blowing=false;
        const target=targets[s.level-1], error=Math.abs(s.radius-target);
        if(error>tolerance[s.level-1]){shatter('Too '+(s.radius<target?'small':'large')+'!');return;}
        api.addScore(30+Math.round(40*(1-error/tolerance[s.level-1])));
        api.beep(620);
        s.made++;
        if(s.made===2){
          api.addScore(50*s.level);
          if(s.level===3){api.finish(true,'Six ornaments cooled perfectly. The glass studio glows!');return;}
          s.level++;s.made=0;
        }
        newBubble();
        s.note='Beautiful seal! Workshop '+s.level+'/3 · '+s.made+'/2 ornaments.';
      }
      function blow(){
        const s=api.state;
        if(!s.ended&&!s.blowing){s.blowing=true;s.note='Growing... release inside the green ring!';}
      }
      return {
        init(){
          const s=api.state;
          s.t=105;s.level=1;s.made=0;s.shattered=0;
          newBubble();
          api.controls([['BLOW','blow',true],['SEAL','seal',true]]);
        },
        action(name){if(name==='blow')blow();else if(name==='seal')seal();},
        down(x,y){if(y>=110&&y<=385)blow();},
        up(){seal();},
        update(dt){
          const s=api.state;
          if(s.ended||!s.blowing)return;
          s.radius+=rates[s.level-1]*Math.min(dt,.08);
          if(s.radius>targets[s.level-1]+tolerance[s.level-1]+10)shatter('Overinflated!');
        },
        timeout(){if(!api.state.ended)api.finish(false,'The furnace cooled before all six ornaments were finished.');},
        draw(){
          const s=api.state, target=targets[s.level-1], tol=tolerance[s.level-1];
          base('#201c36');
          T('GLASSBLOWER',180,38,25,U.yellow);
          T('WORKSHOP '+s.level+'/3  ·  ORNAMENT '+(s.made+1)+'/2',180,70,14,U.mint);
          T('SHATTERED '+s.shattered+'/3',180,94,13,U.white);
          R(18,117,324,270,'#302842',22);
          O(180,260,105,'#423047');
          S(180,260,target+tol,'#5be4ac',3);
          S(180,260,target-tol,'#5be4ac',3);
          S(180,260,target,'#9affd1',2);
          L(180,365,180,260+s.radius,'#b6a1b3',7);
          O(180,260,s.radius,'#f3a66e');
          O(174,251,Math.max(3,s.radius*.65),'#ffca9d');
          O(166,242,Math.max(2,s.radius*.17),'#fff0d6');
          T(s.blowing?'RELEASE NOW!':'HOLD TO BLOW',180,409,17,U.yellow);
          T(s.note,180,436,11,U.white);
        }
      };
    }
  );
})();
