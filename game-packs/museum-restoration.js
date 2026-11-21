/* Museum Restoration — reveal old mosaics without touching fragile cracks. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Museum Restoration','weird','🖌️','Brush dust off three ancient mosaics without cracking them.','Tap dusty squares to restore each mosaic. Avoid the clearly marked red cracked tiles. Clear all dusty squares on three mosaics before time runs out. Three cracked tiles end the restoration.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const patterns=[
        {cracks:[2,12,22],dust:[0,1,3,5,6,8,10,14,16,18]},
        {cracks:[1,7,13,19],dust:[0,2,4,5,6,8,10,11,12,15,17,20]},
        {cracks:[3,9,15,21,23],dust:[0,1,2,4,5,6,7,8,10,11,12,13,14,16]}
      ];
      const left=35,top=110,cell=58;
      function load(s){
        const p=patterns[s.level-1];
        s.cracks=new Set(p.cracks);
        s.dust=new Set(p.dust);
        s.total=p.dust.length;
        s.note='Brush the brown tiles. Avoid red cracks!';
      }
      function clean(x,y){
        const s=api.state;
        if(s.ended)return;
        const col=Math.floor((x-left)/cell),row=Math.floor((y-top)/cell);
        if(col<0||col>=5||row<0||row>=5)return;
        const i=row*5+col;
        if(s.cracks.has(i)){
          if(s.hit.has(i))return;
          s.hit.add(i);s.strikes++;s.streak=0;
          api.beep(155);
          if(s.strikes>=3){api.finish(false,'Too many fragile tiles cracked. The museum closes for repairs.');return;}
          s.note='Careful! '+(3-s.strikes)+' safe chances left.';
          return;
        }
        if(!s.dust.delete(i))return;
        s.streak++;
        api.addScore(10+Math.min(5,s.streak)*2);
        api.beep(440);
        if(s.dust.size===0){
          api.addScore(75);
          if(s.level===3){api.finish(true,'All three mosaics restored! The museum shines again.');return;}
          s.level++;s.streak=0;load(s);
        }else s.note=s.dust.size+' dusty squares left on this mosaic.';
      }
      return {
        init(){
          const s=api.state;
          s.t=120;s.level=1;s.strikes=0;s.streak=0;s.hit=new Set();
          load(s);api.controls([]);
        },
        tap:clean,
        timeout(){if(!api.state.ended)api.finish(false,'The museum closed before the last mosaic was cleaned.');},
        draw(){
          const s=api.state;
          base('#1a2034');
          T('MUSEUM RESTORATION',180,34,21,U.yellow);
          T('MOSAIC '+s.level+'/3   •   CRACKS '+s.strikes+'/3',180,65,14,U.mint);
          T('BRUSH BROWN • AVOID RED',180,88,12,U.white);
          for(let i=0;i<25;i++){
            const x=left+(i%5)*cell,y=top+Math.floor(i/5)*cell;
            const cracked=s.cracks.has(i),dusty=s.dust.has(i);
            R(x+2,y+2,cell-4,cell-4,dusty?'#84634e':cracked?'#793f4d':'#3e7e83',8);
            if(dusty){
              O(x+19,y+19,6,'#b59474');O(x+37,y+35,8,'#6e4f3f');
              T('·',x+cell/2,y+cell/2,20,'#e8c8a4');
            }else if(cracked){
              T(s.hit.has(i)?'✕':'⚡',x+cell/2,y+cell/2,25,s.hit.has(i)?U.white:U.red);
            }else{
              T(['◆','✦','◈','●','✳'][i%5],x+cell/2,y+cell/2,27,U.mint);
            }
          }
          R(24,413,312,29,'#29344e',10);
          T('CLEAN '+(s.total-s.dust.size)+'/'+s.total+'  •  '+s.note,180,427,11,U.white);
        }
      };
    }
  );
})();
