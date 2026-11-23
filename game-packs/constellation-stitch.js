(() => {
'use strict';
window.PocketOddities.register(
['Constellation Stitch','puzzle','🪡','Connect numbered stars into a glowing trail.','Tap stars in numerical order. Finish three skies before time runs out. Three wrong taps end the game.'],
api => {
const {base,R,O,S,L,T}=api.art,U=api.colors;
const skies=[
[[55,150],[130,115],[212,155],[290,115],[290,235],[205,265]],
[[60,115],[145,135],[245,95],[295,175],[240,250],[145,235],[60,295]],
[[50,120],[125,90],[210,125],[300,95],[300,190],[220,210],[275,295],[175,325],[80,275]]
];
function setup(s){s.points=skies[s.level-1];s.next=0;s.note='Tap star 1 to begin.';}
function choose(i){
const s=api.state;if(s.ended)return;
if(i!==s.next){
s.errors++;s.note='Wrong star! '+(3-s.errors)+' chances left.';api.beep(170);
if(s.errors>=3)api.finish(false,'Three wrong stitches tangled the sky.');
return;
}
s.next++;api.addScore(20);api.beep(350+i*35);
if(s.next===s.points.length){
api.addScore(100+30*(3-s.errors));
if(s.level===3)api.finish(true,'All three constellations stitched!');
else {s.level++;setup(s);s.note='Sky complete! Begin the next trail.';}
}else s.note='Now tap star '+(s.next+1)+'.';
}
return {
init(){const s=api.state;s.t=125;s.level=1;s.errors=0;setup(s);api.controls([]);},
tap(x,y){const s=api.state;if(s.ended)return;const i=s.points.findIndex(([px,py])=>Math.hypot(px-x,py-y)<=24);if(i>=0)choose(i);},
timeout(){if(!api.state.ended)api.finish(false,'The stars faded before you finished.');},
draw(){
const s=api.state;base('#111a36');
T('CONSTELLATION STITCH',180,36,21,U.mint);
T('SKY '+s.level+'/3   •   ERRORS '+s.errors+'/3',180,66,13,U.yellow);
R(18,82,324,285,'#1d2948',18);
for(let i=1;i<s.next;i++)L(s.points[i-1][0],s.points[i-1][1],s.points[i][0],s.points[i][1],U.mint,4);
s.points.forEach(([x,y],i)=>{const done=i<s.next;O(x,y,22,done?'#7ae5cb':'#435d88');S(x,y,22,done?'#e0fff5':'#a4b8dd',2);T(String(i+1),x,y+1,17,done?'#12233b':'#ffffff');});
R(20,382,320,54,'#293552',12);T(s.note,180,408,12,U.white);T('Tap the next numbered star',180,448,11,U.muted);
}
};
});
})();