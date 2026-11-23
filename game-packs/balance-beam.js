/* Balance Beam — keep a marble on a tilting beam against shifting wind. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Balance Beam','strategy','⚖️','Steady a marble on a windy, tilting beam.','Tap the left or right half of the arena (or use the large LEFT / RIGHT buttons) to tilt the beam. Keep the marble away from both ends for 8 seconds in each of three rounds. Three falls or the 100-second timer ends the run.'],
    api => {
      const {base,R,O,L,T,meter}=api.art, U=api.colors;
      function begin(s) {
        s.x=0;s.v=0;s.tilt=0;s.safe=0;s.windPhase=0;
        s.note='Balance for 8 seconds to advance.';
      }
      function steer(direction) {
        const s=api.state;
        if(s.ended)return;
        s.tilt=Math.max(-1,Math.min(1,s.tilt+direction*.23));
        api.beep(direction<0?260:350);
      }
      return {
        init() {
          const s=api.state;
          s.t=100;s.level=1;s.falls=0;s.score=0;
          begin(s);
          api.controls([['◀ TILT LEFT','left',true],['TILT RIGHT ▶','right',true]]);
        },
        action(name) {
          if(name==='left')steer(-1);
          if(name==='right')steer(1);
        },
        tap(x,y) {
          if(y<95||y>390)return;
          steer(x<180?-1:1);
        },
        update(dt) {
          const s=api.state;
          if(s.ended)return;
          // Bound large background-tab frame gaps to keep the simulation stable.
          const step=Math.min(dt,.05);
          s.windPhase+=step;
          const wind=Math.sin(s.windPhase*(1.2+s.level*.24)+s.level*1.7)*(.21+s.level*.12);
          s.v+=(s.tilt*1.7+wind)*step;
          s.v*=Math.exp(-.6*step);
          s.x+=s.v*step;
          s.tilt*=Math.exp(-1.1*step);
          if(Math.abs(s.x)>1) {
            s.falls++;
            if(s.falls>=3) {
              api.finish(false,'The marble fell three times. Use gentle counter-tilts to steady it.');
              return;
            }
            begin(s);
            s.note='Marble slipped! '+(3-s.falls)+' chances remain.';
            api.beep(140);
            return;
          }
          s.safe+=step;
          if(s.safe>=8) {
            api.addScore(Math.round(100+Math.max(0,1-Math.abs(s.x))*60));
            if(s.level===3) {
              api.finish(true,'Three windy beams mastered. Perfectly balanced!');
              return;
            }
            s.level++;
            begin(s);
            s.note='Wind stronger! Round '+s.level+' of 3.';
          }
        },
        timeout() {
          if(!api.state.ended)api.finish(false,'Time ran out before the final beam was steadied.');
        },
        draw() {
          const s=api.state;
          base('#172138');
          T('BALANCE BEAM',180,38,25,U.yellow);
          T('ROUND '+s.level+'/3   •   FALLS '+s.falls+'/3',180,70,14,U.mint);
          T('TAP LEFT OR RIGHT TO COUNTER-TILT',180,96,11,U.muted);
          const centerY=244, half=137, slope=s.tilt*32;
          L(180-half,centerY+slope,180+half,centerY-slope,'#e3b783',13);
          O(180,centerY+15,11,'#64748b');
          const ballX=180+s.x*half, ballY=centerY-s.tilt*32*s.x-16;
          O(ballX,ballY,15,'#8be5f5');
          O(ballX-5,ballY-5,5,'#ffffff');
          R(29,306,302,32,'#283750',10);
          R(34,311,292*Math.min(1,s.safe/8),22,U.mint,8);
          T('STEADY '+s.safe.toFixed(1)+' / 8.0s',180,322,13,'#ffffff');
          T('◀ LEFT',93,379,18,U.yellow);
          T('RIGHT ▶',267,379,18,U.yellow);
          T(s.note,180,424,12,U.white);
        }
      };
    }
  );
})();
