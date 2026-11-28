/* Window Wash — wipe the fog from a rooftop conservatory before sunrise. */
(()=>{'use strict';window.PocketOddities.register(
['Window Wash','weird','🪟','Clear five foggy greenhouse panes with quick, deliberate swipes before sunrise.','Swipe across the glass to clear it. Each pane takes three good wipes. Tap WIPE for an accessible sweep. Clear all five before time runs out.'],
api=>{const{base,R,O,L,T}=api.art,panes=[{x:53,y:132,w:112,h:88},{x:195,y:132,w:112,h:88},{x:53,y:247,w:112,h:88},{x:195,y:247,w:112,h:88},{x:124,y:355,w:112,h:62}];
function wipe(){const s=api.state;if(s.ended||s.index>=panes.length)return;s.wipes++;s.note=['A clear streak!','Sunlight is coming through.','Nearly crystal clear!'][Math.min(2,s.wipes-1)];api.beep(360+s.wipes*55);if(s.wipes>=3){s.index++;s.wipes=0;api.addScore(10);if(s.index>=panes.length){api.finish(true,'The conservatory glows in the morning sun!');return;}s.note='Pane '+(s.index+1)+' is fogged up.';}}
return{init(){const s=api.state;s.t=65;s.index=0;s.wipes=0;s.drag=null;s.note='Swipe across the glass to start.';api.controls([['WIPE','wipe',true]]);},
action(n){if(n==='wipe')wipe();},
down(x,y){const p=panes[api.state.index];if(p&&x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h)api.state.drag={x,y,lastX:x,lastY:y};},
move(x,y){const d=api.state.drag;if(d){d.lastX=x;d.lastY=y;}},
up(){const s=api.state,p=panes[s.index],d=s.drag;s.drag=null;if(!p||!d)return;const distance=Math.hypot(d.lastX-d.x,d.lastY-d.y);if(distance>=38&&d.lastX>=p.x-10&&d.lastX<=p.x+p.w+10&&d.lastY>=p.y-10&&d.lastY<=p.y+p.h+10)wipe();},
tap(x,y){const p=panes[api.state.index];if(p&&x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h)wipe();},
timeout(){if(!api.state.ended)api.finish(false,'The morning bell rang. Try quicker wipes to clear all five panes.');},
draw(){const s=api.state;base('#172b3a');T('WINDOW WASH',180,30,23,'#fff1c5');T('SUNRISE IN '+Math.ceil(s.t)+'s',180,58,13,'#b9e4dd');R(28,83,304,344,'#28475a',18);
for(let i=0;i<panes.length;i++){const p=panes[i],done=i<s.index,current=i===s.index;R(p.x,p.y,p.w,p.h,done?'#f8d988':'#92c8d0',8);R(p.x+5,p.y+5,p.w-10,p.h-10,done?'#ffe9ae':'#b7e2e0',5);L(p.x+p.w/2,p.y+6,p.x+p.w/2,p.y+p.h-6,'#527d84',3);L(p.x+6,p.y+p.h/2,p.x+p.w-6,p.y+p.h/2,'#527d84',3);if(current){for(let n=0;n<3-s.wipes;n++){const cx=p.x+21+n*32,cy=p.y+20+(n%2)*24;O(cx,cy,11,'#eaf4ed');O(cx+7,cy+5,8,'#d7ece9');}T('WIPES '+s.wipes+'/3',p.x+p.w/2,p.y+p.h+15,9,'#ffffff');}else if(done)T('☀',p.x+p.w/2,p.y+p.h/2+6,22,'#e7a742');}T(s.note,180,433,11,'#ffffff');}};});})();