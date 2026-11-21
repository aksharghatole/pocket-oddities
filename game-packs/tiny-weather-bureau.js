/* Tiny Weather Bureau — infer a forecast from three instruments and priority rules. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Tiny Weather Bureau','strategy','🌦️','Read a tiny weather station and issue the correct forecast.','Read the instruments and apply the rules in order: LOW pressure = STORM; otherwise HIGH humidity = RAIN; otherwise HIGH wind = WIND; otherwise CLEAR. Tap a forecast button. Correctly forecast six days before three errors or the 100-second deadline.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const days=[
        {pressure:'HIGH',humidity:'LOW',wind:'LOW',answer:'clear'},
        {pressure:'HIGH',humidity:'LOW',wind:'HIGH',answer:'wind'},
        {pressure:'HIGH',humidity:'HIGH',wind:'LOW',answer:'rain'},
        {pressure:'LOW',humidity:'HIGH',wind:'HIGH',answer:'storm'},
        {pressure:'HIGH',humidity:'HIGH',wind:'HIGH',answer:'rain'},
        {pressure:'LOW',humidity:'LOW',wind:'LOW',answer:'storm'}
      ];
      const options=[['☀ CLEAR','clear'],['〰 WIND','wind'],['☂ RAIN','rain'],['⚡ STORM','storm']];
      const labels={clear:'CLEAR',wind:'WIND',rain:'RAIN',storm:'STORM'};
      function forecast(name){
        const s=api.state;
        if(s.ended||!labels[name])return;
        const day=days[s.level-1];
        if(name===day.answer){
          api.addScore(100+Math.max(0,3-s.errors)*20);
          api.beep(620);
          if(s.level===days.length){api.finish(true,'All six forecasts filed. The sky trusts your little bureau!');return;}
          s.level++;
          s.note='Correct: '+labels[name]+'. Read the next instruments.';
        }else{
          s.errors++;
          api.beep(180);
          s.note='Incorrect. Check the rules from top to bottom. '+(3-s.errors)+' tries left.';
          if(s.errors>=3)api.finish(false,'Three incorrect forecasts closed the bureau. Try the rules again.');
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=100;s.level=1;s.errors=0;s.note='Forecast day one. Priority matters!';
          api.controls(options.map(([label,name])=>[label,name,true]));
        },
        action(name){forecast(name);},
        tap(x,y){
          if(y>=348&&y<=424){
            const col=x<180?0:1,row=y<386?0:1;
            forecast(options[row*2+col][1]);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The weather bulletin deadline passed. Try again!');},
        draw(){
          const s=api.state,d=days[Math.min(days.length-1,s.level-1)];
          base('#15263a');
          T('TINY WEATHER BUREAU',180,33,21,U.mint);
          T('DAY '+s.level+' / '+days.length+'     ERRORS '+s.errors+' / 3',180,64,14,U.yellow);
          R(17,83,326,75,'#263b51',13);
          T('FORECAST RULES — FIRST MATCH WINS',180,101,12,U.yellow);
          T('LOW pressure → STORM',180,120,13,U.white);
          T('else HIGH humidity → RAIN',180,137,13,U.white);
          T('else HIGH wind → WIND; else CLEAR',180,152,11,U.white);
          const sensors=[['PRESSURE',d.pressure],['HUMIDITY',d.humidity],['WIND',d.wind]];
          sensors.forEach(([label,value],i)=>{
            const y=176+i*53;
            R(24,y,312,45,'#293d56',10);
            O(48,y+22,8,value==='HIGH'?U.yellow:U.blue);
            T(label,70,y+22,15,U.white,'left');
            T(value,311,y+22,17,value==='HIGH'?U.yellow:U.mint,'right');
          });
          T('ISSUE YOUR FORECAST',180,340,14,U.muted);
          options.forEach(([label],i)=>{
            const x=23+(i%2)*162,y=349+Math.floor(i/2)*39;
            R(x,y,152,34,'#3b5473',9);
            T(label,x+76,y+17,14,U.white);
          });
          T(s.note,180,437,11,U.muted);
        }
      };
    }
  );
})();
