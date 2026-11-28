/* Sunbeam Surveyor — rotate mirror tiles to guide a beam into the receiver. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Sunbeam Surveyor','puzzle','🔆','Turn a handful of mirrors and guide a sunbeam across the survey grid.','Tap mirrors to flip them between / and \\. Then fire the beam. Reach the gold receiver in each of three surveys before you run out of shots.'],
    api => {
      const {base,R,O,L,T}=api.art;
      const X=54,Y=123,C=50,N=5;
      const surveys=[
        {source:1,target:3,mirrors:[
          {r:1,c:1,v:'/',goal:'\\'},
          {r:3,c:1,v:'\\',goal:'\\'},
          {r:0,c:3,v:'/',goal:'/'},
          {r:4,c:3,v:'\\',goal:'\\'}
        ]},
        {source:0,target:4,mirrors:[
          {r:0,c:2,v:'/',goal:'\\'},
          {r:4,c:2,v:'/',goal:'\\'},
          {r:1,c:4,v:'\\',goal:'\\'},
          {r:3,c:4,v:'/',goal:'/'}
        ]},
        {source:4,target:1,mirrors:[
          {r:4,c:1,v:'\\',goal:'/'},
          {r:1,c:1,v:'\\',goal:'/'},
          {r:0,c:4,v:'/',goal:'/'},
          {r:3,c:4,v:'\\',goal:'\\'}
        ]}
      ];
      function reset(s){
        const p=surveys[s.level-1];
        s.mirrors=p.mirrors.map(m=>({...m}));
        s.shots=3;s.beam=[];s.note='Turn the mirrors, then fire.';
      }
      function trace(s){
        const p=surveys[s.level-1], map=new Map(s.mirrors.map(m=>[m.r+','+m.c,m]));
        const points=[{r:p.source,c:-1}],seen=new Set();
        let r=p.source,c=-1,d=0;
        for(let i=0;i<100;i++){
          r+=d===1?1:d===3?-1:0;
          c+=d===0?1:d===2?-1:0;
          if(r<0||r>=N||c<0||c>=N){
            points.push({r,c});
            return {points,won:d===0&&c===N&&r===p.target};
          }
          const key=r+','+c+','+d;
          if(seen.has(key))return {points,won:false};
          seen.add(key);points.push({r,c});
          const m=map.get(r+','+c);
          if(m)d=m.v==='/'?[3,2,1,0][d]:[1,0,3,2][d];
        }
        return {points,won:false};
      }
      function fire(){
        const s=api.state;
        if(s.ended||s.pending)return;
        const result=trace(s);s.beam=result.points;
        api.beep(result.won?760:300);
        if(result.won){
          s.pending=true;api.addScore(100+s.shots*35);
          if(s.level===surveys.length){
            setTimeout(()=>{if(api.state===s&&!s.ended&&s.pending)api.finish(true,'Every survey carried sunlight to its receiver!');},180);
          }else{
            s.level++;reset(s);s.note='Receiver found! A new survey is ready.';
          }
          return;
        }
        s.shots--;s.note='The beam missed the receiver. '+s.shots+' shots left.';
        if(s.shots===0)api.finish(false,'The survey ran out of shots. Rotate the mirrors and try again.');
      }
      return {
        init(){const s=api.state;s.level=1;s.t=150;s.pending=false;reset(s);api.controls([['FIRE BEAM','fire']]);},
        action(name){if(name==='fire')fire();},
        tap(x,y){
          const s=api.state;
          if(s.ended||s.pending)return;
          const c=Math.floor((x-X)/C),r=Math.floor((y-Y)/C);
          if(r<0||r>=N||c<0||c>=N)return;
          const m=s.mirrors.find(item=>item.r===r&&item.c===c);
          if(!m)return;
          m.v=m.v==='/'?'\\':'/';
          s.beam=[];s.note='Mirror turned. Fire when the path looks right.';
          api.beep(420);
        },
        timeout(){const s=api.state;if(!s.ended&&!s.pending)api.finish(false,'The sun set before the survey was complete.');},
        draw(){
          const s=api.state,p=surveys[s.level-1];
          base('#111d34');
          T('SUNBEAM SURVEYOR',180,29,22,'#fff0b5');
          T('SURVEY '+s.level+'/3 · '+s.shots+' SHOTS',180,59,13,'#9fdcf2');
          T('Turn mirrors to guide the light',180,83,12,'#d5def5');
          for(let r=0;r<N;r++)for(let c=0;c<N;c++){
            const x=X+c*C,y=Y+r*C;
            R(x+2,y+2,C-4,C-4,'#1b2b49',7);
            L(x+7,y+C-7,x+C-7,y+C-7,'#2b3d5d',1);
            L(x+C-7,y+7,x+C-7,y+C-7,'#2b3d5d',1);
          }
          const centers=pt=>({x:X+pt.c*C+C/2,y:Y+pt.r*C+C/2});
          if(s.beam.length>1){
            for(let i=1;i<s.beam.length;i++){
              const a=centers(s.beam[i-1]),b=centers(s.beam[i]);
              L(a.x,a.y,b.x,b.y,'#ffdf80',4);
              O(b.x,b.y,3,'#fff2bd');
            }
          }
          for(const m of s.mirrors){
            const x=X+m.c*C,y=Y+m.r*C;
            R(x+8,y+8,C-16,C-16,'#35476a',9);
            L(x+17,m.v==='/'?y+C-17:y+17,x+C-17,m.v==='/'?y+17:y+C-17,'#8de7e3',5);
            T('✦',x+C-8,y+10,9,'#fff0b5');
          }
          O(21,Y+p.source*C+C/2,9,'#ffdf80');
          L(28,Y+p.source*C+C/2,X,Y+p.source*C+C/2,'#ffdf80',4);
          O(339,Y+p.target*C+C/2,12,'#ffdf80');
          O(339,Y+p.target*C+C/2,5,'#fff8d8');
          T('SOURCE',24,Y+p.source*C+C/2-15,8,'#9fdcf2');
          T('RECEIVER',337,Y+p.target*C+C/2+23,8,'#9fdcf2');
          T(s.note,180,399,11,'#ffffff');
          T('TAP A MIRROR TO FLIP ITS ANGLE',180,426,10,'#a9bad7');
        }
      };
    }
  );
})();
