/* Pocket Oddities — dependency-free mobile arcade. All 20 games are original, playable MVPs. */
(()=>{'use strict';
const C=document.getElementById('arena'),ctx=C.getContext('2d');
const $=id=>document.getElementById(id), W=360,H=450,TAU=Math.PI*2;
const U={pink:'#f589ac',mint:'#79efc4',yellow:'#ffe18d',purple:'#aa98ff',blue:'#91baff',white:'#f7f7ff',muted:'#9faecc',red:'#ff7884',bg:'#11182e'};
const clamp=(a,b,c)=>Math.max(b,Math.min(c,a)),rnd=(a,b)=>a+Math.random()*(b-a),irnd=(a,b)=>Math.floor(rnd(a,b+1)),dist=(x,y,a,b)=>Math.hypot(x-a,y-b);
const choose=a=>a[Math.floor(Math.random()*a.length)],shuffle=a=>[...a].sort(()=>Math.random()-.5);
const R=(x,y,w,h,color,rad=0)=>{ctx.fillStyle=color;ctx.beginPath();if(rad)ctx.roundRect(x,y,w,h,rad);else ctx.rect(x,y,w,h);ctx.fill()};
const O=(x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(.01,r),0,TAU);ctx.fill()};
const S=(x,y,r,color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke()};
const L=(x,y,x2,y2,color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()};
function T(txt,x,y,size=18,color=U.white,align='center',bold=true){ctx.fillStyle=color;ctx.font=`${bold?'800':'500'} ${size}px system-ui,-apple-system,sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(txt),x,y,340)}
function wrap(txt,x,y,maxWidth=304,step=24,size=15,color=U.white){ctx.font=`700 ${size}px system-ui`;let words=String(txt).split(' '),line='';for(const word of words){let t=line?line+' '+word:word;if(ctx.measureText(t).width>maxWidth&&line){T(line,x,y,size,color);y+=step;line=word}else line=t}if(line)T(line,x,y,size,color);return y+step}
function base(top=U.bg){R(0,0,W,H,top);for(let i=0;i<18;i++){const x=(i*137+40)%W,y=(i*97+35)%H;O(x,y,(i%3)+.6,'#ffffff10')}}
function panel(x,y,w,h,color='#26314e'){R(x,y,w,h,color,16)}
function meter(label,value,max,x,y,color=U.mint,w=248){T(label,x,y-11,12,U.muted,'left');R(x,y,w,12,'#303b5b',6);R(x,y,Math.max(0,w*clamp(value/max,0,1)),12,color,6)}
function heartBar(n,max=3,y=40){T('♥ '.repeat(Math.max(0,n))+'♡ '.repeat(Math.max(0,max-n)),180,y,24,U.red)}
function controls(arr){const root=$('game-controls');root.replaceChildren();arr.forEach(([label,action,primary])=>{const b=document.createElement('button');b.className='control-btn'+(primary?' primary':'');b.textContent=label;b.addEventListener('click',()=>act(action));root.appendChild(b)})}
function storeGet(k,def){try{return JSON.parse(localStorage.getItem(k))??def}catch{return def}}
function storeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
let highs=storeGet('oddities-highs',{}),beaten=storeGet('oddities-wins',{}),sound=storeGet('oddities-sound',false);
let game=null,idx=-1,m=null,last=performance.now();
let audioCtx=null;
function beep(freq=490){if(!sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();let osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.07,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.09);osc.connect(gain).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.1)}catch{}}
$('sound-toggle').textContent=sound?'♫':'♪';$('sound-toggle').setAttribute('aria-pressed',String(sound));$('sound-toggle').onclick=()=>{sound=!sound;storeSet('oddities-sound',sound);$('sound-toggle').textContent=sound?'♫':'♪';$('sound-toggle').setAttribute('aria-pressed',String(sound));beep(660)};
// Web installation: browsers decide whether native PWA prompting is available.
const installButton=$('install-app');
let pendingInstall=null;
const isNative=!!window.Capacitor?.isNativePlatform?.();
const isInstalled=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone;
const isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if(!isNative&&!isInstalled&&isMobile)installButton.hidden=false;
window.addEventListener('beforeinstallprompt',event=>{
  if(isNative||isInstalled)return;
  event.preventDefault();
  pendingInstall=event;installButton.hidden=false;
});
installButton.addEventListener('click',async()=>{
  if(pendingInstall){
    const prompt=pendingInstall;pendingInstall=null;await prompt.prompt();
    const choice=await prompt.userChoice;
    if(choice?.outcome==='accepted')installButton.hidden=true;
  }else if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){
    alert('To install Pocket Oddities on iPhone: open this website in Safari, tap Share, then Add to Home Screen.');
  }else if(/Android/i.test(navigator.userAgent)){
    alert('Open your browser menu and choose Install app or Add to Home screen.');
  }else alert('Use your browser’s Install app option to add Pocket Oddities.');
});
window.addEventListener('appinstalled',()=>{installButton.hidden=true});
const info=[
['The Button Has Feelings','weird','😳','Keep a very sensitive button emotionally balanced.','Tap, compliment or ignore it.'],
['You Are the Notification','reflex','📨','Sneak notifications past a scrolling finger.','Pick a lane, then time your ping.'],
['The Game Is Lying','puzzle','🤥','Ignore suspicious instructions in trick questions.','Read carefully; the instructions lie.'],
['One Room, 100 Rules','reflex','🚪','Survive a room where the rule changes every few seconds.','Follow each rule before the timer expires.'],
['Shadow Thief','puzzle','🌘','Cross a grid while avoiding pools of light.','Move to neighboring dark tiles.'],
["Don't Wake the Planet",'reflex','🪐','Quietly stop asteroids before the planet wakes.','Tap asteroids, but manage your noise.'],
['Tiny Apocalypse Manager','strategy','☢️','Keep survivors alive for eight chaotic days.','Balance food, walls and morale.'],
['Reverse Hide and Seek','puzzle','👀','Find blinking mimics hiding among ordinary shapes.','Watch for suspicious little blinks.'],
['The Floor Remembers','puzzle','🧠','Remember a safe floor path before it disappears.','Memorize then tap the path in order.'],
['One Finger Orchestra','reflex','🎶','Hit glowing notes exactly when the ring closes.','Tap the note when the ring reaches it.'],
['Pocket Black Hole','reflex','🕳️','Pull in bright stars and reject dangerous debris.','Drag your black hole to eat blue stars.'],
['Wrong Answers Only','weird','🙃','Score points by refusing to give the right answer.','Pick any answer except the correct one.'],
['The Last Light Switch','puzzle','💡','Navigate a dark maze using tiny flashes of light.','Use flashes to spot the walls.'],
['Gravity Is Shy','reflex','🪂','Guide a drifting ball through gravity-bending gates.','Hold to rise, release to fall.'],
['Tiny Traffic God','strategy','🚦','Stop and release tiny cars before they crash.','Tap cars to pause or resume them.'],
['The Clock Is Hungry','reflex','⏰','Feed a clock time snacks before time runs out.','Collect green seconds, avoid red ones.'],
['Unfinished Universe','puzzle','✨','Restore missing stars to make galaxies symmetrical.','Mirror every star across the center line.'],
['The Other Cursor','reflex','🖱️','Collect energy while a delayed ghost chases your finger.','Drag to collect orbs; avoid your echo.'],
['Invisible Maze','puzzle','🫥','Escape a maze whose walls appear only briefly.','Peek, remember, then navigate.'],
['One Minute Villain','strategy','🦹','Create mischief without getting caught.','Build chaos while keeping your heat down.']
];
const games=[];
function define(def){games.push(def)}
// Expansion API: keep existing game indices stable and register new games in separate packs.
const extensionAPI=Object.freeze({
  get state(){return m},
  art:Object.freeze({base,R,O,S,L,T,wrap,panel,meter}),
  helpers:Object.freeze({clamp,rnd,irnd,dist,choose,shuffle}),
  colors:Object.freeze(U),
  controls,addScore,finish,beep,width:W,height:H
});
window.PocketOddities=Object.freeze({
  register(metadata,factory){
    if(!Array.isArray(metadata)||metadata.length!==5||typeof metadata[0]!=='string'||!['reflex','puzzle','strategy','weird'].includes(metadata[1]))throw Error('Invalid mini-game metadata');
    if(info.some(row=>row[0]===metadata[0]))throw Error('Duplicate game name: '+metadata[0]);
    const def=factory(extensionAPI);
    if(!def||typeof def.init!=='function'||typeof def.draw!=='function')throw Error('A mini-game needs init() and draw()');
    info.push(metadata);define(def);renderHome();
    window.dispatchEvent(new CustomEvent('oddities:catalog'));
  },
  get count(){return info.length},
  get catalog(){return info.map(([name,category])=>({name,category}));}
});
function finish(win,message=''){if(!m||m.ended)return;m.ended=true;m.win=win;if(win){beaten[idx]=true;storeSet('oddities-wins',beaten);beep(750)}else beep(170);if(m.score>(highs[idx]||0)){highs[idx]=m.score;storeSet('oddities-highs',highs)}$('overlay-icon').textContent=win?'✦':'☄';$('overlay-title').textContent=win?'You did it!':'Round over';$('overlay-message').textContent=message|| (win?'Another strange victory for your collection.':'Try again — every oddity takes practice.');$('game-overlay').classList.remove('hidden');refreshHud();renderHome();window.dispatchEvent(new CustomEvent('oddities:game-finish',{detail:{name:info[idx]?.[0],category:info[idx]?.[1],index:idx,won:!!win,score:m.score,elapsed:m.elapsed}}))}
function addScore(n=1){m.score+=n;beep(480+Math.min(400,m.score*25))}
function refreshHud(){$('score').textContent=m?m.score:0;$('clock').textContent=m&&m.t!=null?Math.max(0,Math.ceil(m.t))+'s':'—';$('best').textContent=highs[idx]||0;$('level-pill').textContent='ROUND '+String(m?.level||1).padStart(2,'0')}
function openGame(i){idx=i;game=games[i];m={score:0,t:null,level:1,ended:false,elapsed:0};$('home-screen').classList.add('hidden');$('play-screen').classList.remove('hidden');$('game-overlay').classList.add('hidden');$('game-title').textContent=info[i][0];$('game-category').textContent=info[i][1].toUpperCase()+' · MINI GAME '+String(i+1).padStart(2,'0');$('game-description').textContent=info[i][3];$('instruction').textContent=info[i][4];controls([]);game.init();refreshHud();window.scrollTo({top:0,behavior:'instant'});window.dispatchEvent(new CustomEvent('oddities:game-start',{detail:{name:info[i][0],category:info[i][1],index:i}}))}
function showHome(){game=null;m=null;idx=-1;$('play-screen').classList.add('hidden');$('home-screen').classList.remove('hidden');renderHome();window.scrollTo({top:0,behavior:'instant'})}
function act(action){if(!m||m.ended)return;game.action?.(action)}
function point(e){const b=C.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height}}
C.addEventListener('pointerdown',e=>{if(!m||m.ended)return;e.preventDefault();C.setPointerCapture?.(e.pointerId);const p=point(e);game.down?.(p.x,p.y);game.tap?.(p.x,p.y)});
C.addEventListener('pointermove',e=>{if(!m||m.ended||!(e.buttons||e.pointerType==='touch'))return;e.preventDefault();const p=point(e);game.move?.(p.x,p.y)});
C.addEventListener('pointerup',e=>{if(!m||m.ended)return;game.up?.()});C.addEventListener('pointercancel',()=>{game?.up?.()});
window.addEventListener('keydown',e=>{if(!m||m.ended||e.repeat)return;const key={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'go',Enter:'go'}[e.key];if(key){e.preventDefault();act(key)}});
function renderHome(filter='all'){const grid=$('game-grid');const selected=document.querySelector('.filter.active')?.dataset.filter||filter;grid.replaceChildren();info.forEach(([name,category,emoji,desc],i)=>{if(selected!=='all'&&category!==selected)return;const term=$('game-search').value.trim().toLowerCase();if(term&&!(`${name} ${category} ${desc}`).toLowerCase().includes(term))return;const b=document.createElement('button');b.className='game-card';b.innerHTML=`<div class="game-card-top"><span class="card-emoji">${emoji}</span><span class="card-number">${String(i+1).padStart(2,'0')}</span></div><h3>${name}</h3><p>${desc}</p><div class="game-card-bottom"><span>${category}</span><span class="${beaten[i]?'card-beat':''}">${beaten[i]?'★ BEATEN':'PLAY →'}</span></div>`;b.onclick=()=>openGame(i);grid.appendChild(b)});$('completion').textContent=Object.keys(beaten).filter(k=>beaten[k]).length+' / '+info.length+' beaten';
$('game-count-tagline').textContent=info.length+' tiny strange worlds';
$('hero-count').textContent=info.length;
$('hero-game-count').textContent='✦ '+info.length+' playable games';
$('all-filter').textContent='All '+info.length;
document.title='Pocket Oddities · '+info.length+' Mini-Games';
if(!grid.children.length){const p=document.createElement('p');p.className='no-results';p.textContent='No games match your search. Try another name or category.';grid.appendChild(p)}
window.dispatchEvent(new CustomEvent('oddities:catalog-render'));
}
$('game-search').addEventListener('input',()=>renderHome());
$('filter-row').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;document.querySelectorAll('.filter').forEach(f=>f.classList.toggle('active',f===b));renderHome(b.dataset.filter)});
$('back-btn').onclick=$('overlay-home').onclick=showHome;$('restart-btn').onclick=()=>openGame(idx);$('next-btn').onclick=()=>openGame((idx+1)%games.length);

// 01 — Emotional survival. The button gets upset if tapped too much or ignored.
define({init(){m.t=25;m.mood=52;m.calmCD=0;m.taps=0;controls([['💬 COMPLIMENT (3s COOLDOWN)','calm',true]])},action(a){if(a==='calm'&&m.calmCD<=0){m.mood=clamp(m.mood-20,0,100);m.calmCD=3;addScore(1)}},tap(x,y){if(dist(x,y,180,230)<73){m.mood=clamp(m.mood+15,0,110);m.taps++;addScore(1)}},update(dt){m.mood-=dt*1.6;m.calmCD=Math.max(0,m.calmCD-dt);if(m.mood<=0||m.mood>=100)finish(false,m.mood<=0?'You ignored the button for too long.':'The button got overwhelmed!')},timeout(){finish(true,'You managed 25 seconds of emotional diplomacy.')},draw(){base('#20203b');O(180,230,102,'#ffffff0d');const color=m.mood>75?U.red:m.mood<30?U.blue:U.pink;O(180,230,72,color);S(180,230,79,'#ffffff24',5);T(m.mood>75?'ಠ益ಠ':m.mood<30?'ಥ_ಥ':'◕‿◕',180,229,37,'#242038');T('THE BUTTON',180,67,13,U.muted);T('Keep its mood in the safe zone',180,97,15);meter('EMOTIONAL STABILITY',m.mood,100,57,360,color,246);R(57,376,246,14,'#141c33',7);R(131,376,99,14,'#91dfbf',7);T('COMPLIMENT READY: '+(m.calmCD<=0?'YES':Math.ceil(m.calmCD)+'s'),180,418,12,U.muted)}});

// 02 — Fire a notification past the moving swipe/finger.
define({init(){m.t=36;m.lane=1;m.remaining=9;m.active=null;m.scanner=180;controls([['◀ LANE','left'],['PING!','ping',true],['LANE ▶','right']])},action(a){if(a==='left')m.lane=clamp(m.lane-1,0,2);if(a==='right')m.lane=clamp(m.lane+1,0,2);if(a==='ping'&&!m.active&&m.remaining>0){m.remaining--;m.active={x:90+m.lane*90,y:370};beep(510)}},tap(x,y){m.lane=clamp(Math.round((x-90)/90),0,2)},update(dt){m.scanner=180+115*Math.sin(m.elapsed*2.2);if(m.active){m.active.y-=195*dt;if(m.active.y<=125){if(Math.abs(m.active.x-m.scanner)<48){m.active=null;beep(170)}else{addScore(1);m.active=null;if(m.score>=5)finish(true,'Five alerts delivered without getting swiped away!')}}}if(m.remaining===0&&!m.active&&m.score<5)finish(false,'All notifications were used. Try timing the scanner.')},draw(){base('#171f38');panel(44,26,272,402,'#27304e');R(145,35,70,7,'#8993a6',4);T('FICTIONAL PHONE',180,68,11,U.muted);L(48,121,312,121,'#596685',2);O(m.scanner,122,23,U.red);T('☝',m.scanner,121,26,'#2c2343');for(let k=0;k<3;k++){let x=90+90*k;R(x-36,174,72,168,k===m.lane?'#4a507b':'#313b5a',12);T(['SOCIAL','WORK','NEWS'][k],x,195,10,'#d2d9ee');O(x,260,12,k===m.lane?U.mint:'#7a89af');}if(m.active){panel(m.active.x-37,m.active.y-17,74,34,U.mint);T('PING',m.active.x,m.active.y,14,'#13233d')}T('SWIPE ZONE',180,151,12,U.red);T(m.remaining+' alerts left · deliver 5',180,395,13,U.yellow)}});

// 03 — Ten deception riddles.
const lies=[
['Only LEFT will work.',['LEFT','RIGHT'],1],
['Never tap MOON.',['SUN','MOON'],1],
['An even number is forbidden.',['8','7'],0],
['The LARGEST number is safe.',['1','9'],0],
['PURPLE is the wrong color.',['PURPLE','GREEN'],0],
['The FIRST button is a trap.',['FIRST','LAST'],0],
['All three are fruits. Find the impostor.',['APPLE','CHAIR','PEAR'],1],
['Things that fly are safe.',['ROCK','BIRD'],0],
['The MIDDLE is definitely incorrect.',['UP','DOWN','LEFT'],1],
['STOP will cause failure.',['STOP','GO'],0]
];
define({init(){m.level=1;m.lives=3;m.t=null;m.lastFeedback='Every instruction is suspicious.';controls(lies[0][1].map((s,i)=>[s,'c'+i,false]))},action(a){if(!a.startsWith('c'))return;const q=lies[m.level-1],sel=+a.slice(1);if(sel===q[2]){m.lastFeedback='YOU FOUND THE LIE!';addScore(1);m.level++;if(m.level>10){finish(true,'You outsmarted ten deliberately dishonest puzzles.');return}}else{m.lives--;m.lastFeedback='THE GAME TRICKED YOU. TRY AGAIN.';beep(180);if(m.lives<=0){finish(false,'The lies got you. Read the instructions twice.');return}}const ans=lies[m.level-1];controls(ans[1].map((s,i)=>[s,'c'+i,false]))},draw(){base('#22203b');T('RULE #'+m.level,180,48,13,U.mint);heartBar(m.lives,3,90);panel(25,136,310,185,'#323553');wrap(lies[Math.min(m.level-1,9)][0],180,218,270,26,18);T(m.lastFeedback,180,367,13,U.pink);T('Survive ten tricks',180,409,13,U.muted)}});

// 04 — Zone commands, including no-movement and movement commands.
const rules=['STAY LEFT','STAY RIGHT','STAY CENTER','DO NOT MOVE','MOVE AT LEAST ONCE'];
define({init(){m.t=35;m.phase=0;m.phaseTime=7;m.x=180;m.moved=false;controls([['◀ LEFT','left'],['RIGHT ▶','right']])},action(a){let before=m.x;if(a==='left')m.x=clamp(m.x-60,35,325);if(a==='right')m.x=clamp(m.x+60,35,325);if(before!==m.x)m.moved=true},tap(x){if(x!==m.x)m.moved=true;m.x=clamp(x,30,330)},update(dt){m.phaseTime-=dt;if(m.phaseTime<=0){let pass=[m.x<125,m.x>235,m.x>=125&&m.x<=235,!m.moved,m.moved][m.phase];if(!pass){finish(false,'Rule broken: '+rules[m.phase]+'.');return}addScore(1);m.phase++;m.level=m.phase+1;m.phaseTime=7;m.moved=false;if(m.phase>=5)finish(true,'You obeyed every one of the changing room rules!')}},draw(){base('#141e34');T('THE CURRENT RULE',180,55,12,U.muted);panel(24,88,312,83,'#343e5c');T(rules[Math.min(m.phase,4)],180,131,23,U.yellow);R(35,217,88,133,'#34685c',8);R(136,217,88,133,'#4f4b7b',8);R(237,217,88,133,'#68445d',8);T('LEFT',79,235,11);T('CENTER',180,235,11);T('RIGHT',281,235,11);O(m.x,300,18,U.pink);S(m.x,300,24,U.white,2);meter('NEXT RULE',m.phaseTime,7,55,400,U.mint,250)}});

// 05 — Grid puzzle; some tiles are lit. Change light phases to find paths.
define({init(){m.t=55;m.x=0;m.y=5;m.phase=0;m.lives=4;controls([['↻ SHIFT LIGHT','shift',true]])},lit(x,y){return (x+2*y+m.phase)%4===0},action(a){if(a==='shift')m.phase=(m.phase+1)%4},tap(x,y){let col=Math.floor((x-30)/50),row=Math.floor((y-82)/50);if(col<0||col>5||row<0||row>5||Math.abs(col-m.x)+Math.abs(row-m.y)!==1)return;if(this.lit(col,row)){m.lives--;beep(165);if(m.lives<=0)finish(false,'You ran out of cover in the light.')}else{m.x=col;m.y=row;addScore(1);if(m.x===5&&m.y===0)finish(true,'You crossed the gallery without stepping into the light.')}},draw(){base('#111629');T('SHADOW GALLERY',180,41,18,U.purple);for(let y=0;y<6;y++)for(let x=0;x<6;x++){let px=30+x*50,py=82+y*50;R(px+2,py+2,46,46,this.lit(x,y)?'#bdab78':'#283452',7);if(this.lit(x,y))O(px+25,py+25,10,'#f4d78c44')}T('★',304,107,21,U.mint);O(55+m.x*50,107+m.y*50,15,U.pink);T('♥ '.repeat(m.lives),180,412,18,U.red)}});

// 06 — Space hazards, noise budget, tap to deflect.
define({init(){m.t=45;m.noise=12;m.hp=3;m.spawn=.4;m.rocks=[];m.target=10;m.shush=0;controls([['🤫 SHUSH (4s COOLDOWN)','shush',true]])},action(a){if(a==='shush'&&m.shush<=0){m.noise=Math.max(0,m.noise-21);m.shush=4}},tap(x,y){let r=m.rocks.findIndex(a=>dist(x,y,a.x,a.y)<25);if(r>=0){m.rocks.splice(r,1);m.noise+=25;addScore();if(m.score>=m.target)finish(true,'Ten asteroids caught. The planet slept through it.')}},update(dt){m.noise=Math.max(0,m.noise-dt*7);m.shush=Math.max(0,m.shush-dt);if(m.noise>=100){finish(false,'The planet woke up from all the tapping!');return}m.spawn-=dt;if(m.spawn<=0){let a=rnd(0,TAU),r=210;m.rocks.push({x:180+Math.cos(a)*r,y:224+Math.sin(a)*r,s:rnd(22,38)});m.spawn=rnd(.8,1.4)}for(const a of m.rocks){let z=dist(a.x,a.y,180,224);a.x+=(180-a.x)/z*a.s*dt;a.y+=(224-a.y)/z*a.s*dt;if(z<50){a.hit=true;m.hp--}}m.rocks=m.rocks.filter(a=>!a.hit);if(m.hp<=0)finish(false,'The sleepy planet was hit too many times.')},draw(){base('#121a37');for(let i=0;i<3;i++)S(180,224,80+i*48,'#a6baff1d');O(180,224,59,U.purple);T(m.noise>75?'ಠ_ಠ':'－_－',180,220,35,'#26243e');m.rocks.forEach(a=>{O(a.x,a.y,14,'#e3a98e');O(a.x-4,a.y-4,4,'#8d6e76')});meter('NOISE LEVEL',m.noise,100,53,55,m.noise>75?U.red:U.mint,254);T('PLANET HEALTH: '+'♥ '.repeat(m.hp),180,405,13,U.yellow)}});

// 07 — 8-day tiny resource-management survival.
define({init(){m.t=null;m.day=1;m.food=8;m.wall=8;m.morale=8;controls([['🥫 SCAVENGE','food'],['🧱 REPAIR','wall'],['🎉 CHEER','morale']])},action(a){if(a==='food'){m.food+=4;m.wall-=1;m.morale-=1}else if(a==='wall'){m.wall+=4;m.food-=1}else if(a==='morale'){m.morale+=4;m.food-=1}else return;m.food-=1;m.wall-=1;m.morale-=1;m.food=clamp(m.food,0,20);m.wall=clamp(m.wall,0,20);m.morale=clamp(m.morale,0,20);if(Math.min(m.food,m.wall,m.morale)<=0){finish(false,'The shelter fell on day '+m.day+'. Keep all three meters above zero.');return}addScore(1);if(m.day>=8){finish(true,'Your tiny community survived all eight days!');return}m.day++;m.level=m.day},draw(){base('#251c33');T('DAY '+m.day+' OF 8',180,58,25,U.yellow);T('THE UNDERGROUND SHELTER',180,100,12,U.muted);panel(31,136,298,218,'#35334f');meter('FOOD',m.food,20,60,185,U.yellow,238);meter('SHELTER',m.wall,20,60,245,U.blue,238);meter('MORALE',m.morale,20,60,305,U.pink,238);T('Each night drains the supplies.',180,385,12,U.muted);T('All three must stay above 0.',180,408,12,U.muted)}});

// 08 — Mimics blink; find 3 among 12 objects.
define({init(){m.t=32;m.ghosts=shuffle(Array.from({length:12},(_,i)=>i)).slice(0,3);m.found=[];m.errors=0;m.hint=-1;m.hintTime=0;controls([['🔎 HINT (COSTS 1 ERROR)','look',true]])},action(a){if(a==='look'&&m.errors<3){m.errors++;m.hint=m.ghosts.find(i=>!m.found.includes(i));m.hintTime=1.5}},update(dt){m.hintTime=Math.max(0,m.hintTime-dt)},tap(x,y){let col=Math.floor((x-34)/99),row=Math.floor((y-85)/85),id=row*3+col;if(col<0||col>2||row<0||row>3||id<0||id>=12||m.found.includes(id))return;if(m.ghosts.includes(id)){m.found.push(id);addScore();if(m.score===3)finish(true,'You spotted all three mimics in the crowd.')}else{m.errors++;beep(160);if(m.errors>=4)finish(false,'Four innocent shapes falsely accused!')}},draw(){base('#141e35');T('FIND THE 3 MIMICS',180,42,19,U.mint);for(let i=0;i<12;i++){let x=82+i%3*99,y=125+Math.floor(i/3)*85,isM=m.ghosts.includes(i),blink=isM&&Math.sin(m.elapsed*7+i*.7)>.96;R(x-32,y-29,64,60,m.found.includes(i)?'#386958':'#34425f',10);O(x,y,17,['#8fbbdc','#dca8b2','#c1afdf'][i%3]);if(blink||m.found.includes(i)){O(x-6,y-3,2,'#17243e');O(x+6,y-3,2,'#17243e')}if(m.hintTime>0&&m.hint===i)S(x,y,35,U.yellow,4)}T('WRONG PICKS: '+m.errors+'/4',180,423,12,U.yellow)}});

// 09 — Memory path with reveal phase.
const floorPaths=[[[0,4],[1,4],[1,3],[2,3],[2,2],[3,2],[3,1],[4,1],[4,0]],[[0,4],[0,3],[1,3],[1,2],[2,2],[2,1],[3,1],[3,0],[4,0]],[[0,4],[1,4],[2,4],[2,3],[3,3],[3,2],[4,2],[4,1],[4,0]]];
define({init(){m.t=66;m.stage=0;m.step=0;m.preview=4;m.lives=3;controls([['👁 REVEAL 1s','reveal',true]])},action(a){if(a==='reveal'&&m.preview<=0&&m.lives>1){m.preview=1.2;m.lives--}},tap(x,y){if(m.preview>0)return;let col=Math.floor((x-43)/55),row=Math.floor((y-106)/55);let path=floorPaths[m.stage],next=path[m.step+1];if(!next)return;if(next[0]===col&&next[1]===row){m.step++;addScore();if(m.step===path.length-1){m.stage++;m.level=m.stage+1;if(m.stage===3)finish(true,'Three floors mastered using only your memory.');else{m.step=0;m.preview=4}}}else{m.lives--;beep(155);if(m.lives<=0)finish(false,'An unsafe tile caught you. Remember the route.')}},update(dt){m.preview=Math.max(0,m.preview-dt)},draw(){base('#141b34');T(m.preview>0?'MEMORIZE THE PATH':'FOLLOW THE HIDDEN PATH',180,47,17,m.preview>0?U.yellow:U.mint);T('FLOOR '+(m.stage+1)+' / 3',180,79,12,U.muted);const path=floorPaths[Math.min(2,m.stage)];for(let y=0;y<5;y++)for(let x=0;x<5;x++){let safe=path.some(([a,b])=>a===x&&b===y);R(46+x*55,108+y*55,49,49,m.preview>0&&safe?'#62a9a2':'#2a3554',7)}let current=path[m.step];O(70+current[0]*55,132+current[1]*55,15,U.pink);T('★',70+4*55,132,24,U.yellow);T('♥ '.repeat(m.lives)+(m.preview>0?'  ·  '+m.preview.toFixed(1)+'s':''),180,414,15,U.red)}});

// 10 — Rhythm game with original synthesized beeps when sound is enabled.
define({init(){m.t=37;m.note=0;m.beat=0;m.hits=0;m.misses=0;controls([])},tap(x,y){let a=[{x:94,y:195},{x:266,y:195},{x:94,y:316},{x:266,y:316}][m.note%4];if(dist(x,y,a.x,a.y)<40&&m.beat>.85&&m.beat<1.65){addScore();m.hits++;m.beat=0;m.note++;if(m.score>=10)finish(true,'A ten-note pocket symphony — perfectly strange!')}else{m.misses++;m.beat=0;m.note++;beep(180);if(m.misses>=6)finish(false,'Too many notes out of rhythm.')}} ,action(a){if(a==='go'){/* canvas taps are the notes; this button simply reinforces the instruction */}},update(dt){m.beat+=dt;if(m.beat>1.9){m.misses++;m.beat=0;m.note++;if(m.misses>=6)finish(false,'Too many notes slipped away.')}},draw(){base('#1b1a3a');T('TOUCH THE GLOWING NOTE',180,51,16,U.yellow);const positions=[[94,195],[266,195],[94,316],[266,316]];positions.forEach(([x,y],i)=>{O(x,y,32,'#38375d');O(x,y,22,i===m.note%4?U.mint:'#6875a0');T(['♩','♪','♫','♬'][i],x,y,25,'#232c48');if(i===m.note%4)S(x,y,22+Math.abs(1.23-m.beat)*35,U.pink,4)});T('MISSED: '+m.misses+' / 6',180,405,13,U.muted)}});

// 11 — Collect good stars and avoid red antimatter by dragging a black hole.
define({init(){m.t=43;m.x=180;m.y=225;m.errors=0;m.bits=[];m.spawn=0;controls([])},move(x,y){m.x=clamp(x,20,340);m.y=clamp(y,50,405)},tap(x,y){this.move(x,y)},update(dt){m.spawn-=dt;if(m.spawn<=0&&m.bits.length<14){m.bits.push({x:rnd(24,336),y:rnd(77,394),good:Math.random()>.25,vx:rnd(-9,9),vy:rnd(-9,9)});m.spawn=.4}for(let b of m.bits){b.x=clamp(b.x+b.vx*dt,16,344);b.y=clamp(b.y+b.vy*dt,67,410);const d=dist(b.x,b.y,m.x,m.y);if(d<120&&d>2){b.x+=(m.x-b.x)/d*dt*25;b.y+=(m.y-b.y)/d*dt*25}if(d<22){b.gone=true;if(b.good){addScore();if(m.score>=14)finish(true,'Fourteen stars found a new home in your pocket universe.')}else{m.errors++;beep(160);if(m.errors>=4)finish(false,'Too much unstable antimatter!')}}}m.bits=m.bits.filter(b=>!b.gone)},draw(){base('#13132d');m.bits.forEach(b=>{O(b.x,b.y,b.good?8:10,b.good?U.blue:U.red);if(!b.good)T('×',b.x,b.y,12,'#292339')});S(m.x,m.y,36,'#875eb966',5);O(m.x,m.y,23,'#070916');S(m.x,m.y,26,U.purple,3);T('DRAG THE VOID',180,36,16,U.mint);T('BLUE = GOOD     RED = BAD',180,420,13,U.muted);heartBar(4-m.errors,4,67)}});

// 12 — Simple inverted trivia where the obviously correct answer is always wrong.
const wrongQs=[
['What color is a banana?',['Yellow','Invisible','Square'],0],
['How many days in a week?',['17','7','Purple'],1],
['What do bees make?',['Honey','Wi-Fi','Shoes'],0],
['What is 2 + 2?',['4','Banana','22 elephants'],0],
['What falls from rain clouds?',['Music','Rain','Popcorn'],1],
['What do you use to write?',['A spoon','A pencil','A cloud'],1],
['What do cats typically say?',['Meow','Loading...','Honk'],0],
['Where do fish usually live?',['A mailbox','Water','A wardrobe'],1],
['What rises each morning?',['A sandwich','Your taxes','The sun'],2],
['Which animal barks?',['A dog','A carrot','A chair'],0],
['Which season follows spring?',['Summer','Yesterday','Bluetooth'],0]
];
define({init(){m.t=null;m.level=1;m.lives=3;this.configure()},configure(){const q=wrongQs[Math.min(10,m.level-1)];controls(q[1].map((s,i)=>[s,'a'+i,i===0]))},action(a){if(!a.startsWith('a'))return;let q=wrongQs[m.level-1],v=+a.slice(1);if(v!==q[2]){addScore();m.level++;if(m.level>=11){finish(true,'You were spectacularly incorrect ten times.');return}this.configure()}else{m.lives--;beep(180);if(!m.lives)finish(false,'That answer was correct, which is incorrect here.')}},draw(){base('#292037');T('WRONG ANSWERS ONLY',180,61,18,U.pink);heartBar(m.lives,3,110);panel(24,161,312,146,'#403754');wrap(wrongQs[Math.min(m.level-1,10)][0],180,228,270,27,20);T('Choose an answer that is FALSE.',180,370,14,U.yellow);T('QUESTION '+m.level+' / 10',180,411,12,U.muted)}});

// 13 — A dark grid with timed flashlight bursts. Guaranteed safe perimeter routes.
function makeLightMaze(stage){let walls=[];for(let y=0;y<6;y++)for(let x=0;x<6;x++){const safe=stage===0?(y===5||x===5):(x===0||y===0);if(!safe&&Math.random()<.5)walls.push(x+','+y)}return new Set(walls)}
define({init(){m.t=75;m.stage=0;m.x=0;m.y=5;m.walls=makeLightMaze(0);m.flash=2;m.cool=0;m.lives=4;controls([['←','left'],['↑','up'],['↓','down'],['→','right'],['💡 FLASH','flash',true]])},action(a){if(a==='flash'){if(m.cool<=0){m.flash=1.8;m.cool=4.4}return}const d={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[a];if(!d)return;let x=m.x+d[0],y=m.y+d[1];if(x<0||y<0||x>5||y>5)return;if(m.walls.has(x+','+y)){m.lives--;m.flash=Math.max(.35,m.flash);beep(160);if(m.lives<=0)finish(false,'The dark walls got you. Remember the flash!');return}m.x=x;m.y=y;addScore();if(x===5&&y===0){m.stage++;m.level=m.stage+1;if(m.stage===2){finish(true,'Both blacked-out rooms escaped.');return}m.x=0;m.y=5;m.walls=makeLightMaze(1);m.flash=2;m.cool=0}},tap(x,y){let col=Math.floor((x-36)/48),row=Math.floor((y-95)/48),dx=col-m.x,dy=row-m.y;if(Math.abs(dx)+Math.abs(dy)!==1)return;this.action(dx===1?'right':dx===-1?'left':dy===1?'down':'up')},update(dt){m.flash=Math.max(0,m.flash-dt);m.cool=Math.max(0,m.cool-dt)},draw(){base('#0b1120');T('LIGHT ON: '+(m.flash>0?m.flash.toFixed(1)+'s':'OFF'),180,45,16,m.flash>0?U.yellow:U.muted);for(let y=0;y<6;y++)for(let x=0;x<6;x++){R(37+x*48,96+y*48,44,44,m.flash>0&&m.walls.has(x+','+y)?'#c67688':'#1a2840',6);if(m.flash>0&&!m.walls.has(x+','+y))R(43+x*48,102+y*48,32,32,'#445371',4)}T('★',301,118,24,U.yellow);O(59+m.x*48,118+m.y*48,15,U.mint);T('FLASH: '+(m.cool>0?Math.ceil(m.cool)+'s COOLDOWN':'READY'),180,417,12,U.muted);T('♥ '.repeat(m.lives),180,393,13,U.red)}});

// 14 — Press and hold to change gravity; survive scrolling gap obstacles.
define({init(){m.t=47;m.y=220;m.v=0;m.held=false;m.gates=[];m.spawn=.9;m.gateNo=0;controls([['⬆ TAP TO TOGGLE GRAVITY','go',true]])},down(){m.held=true},up(){m.held=false},action(a){if(a==='go')m.held=!m.held},update(dt){m.v=clamp(m.v+(m.held?-390:390)*dt,-155,155);m.y+=m.v*dt;if(m.y<15||m.y>435){finish(false,'Gravity got the better of you. Hold to rise.');return}m.spawn-=dt;if(m.spawn<=0&&m.gateNo<8){let gaps=[220,155,265,190,255,160,225,195];m.gates.push({x:385,gap:gaps[m.gateNo],passed:false});m.gateNo++;m.spawn=3.15}for(let g of m.gates){g.x-=120*dt;if(Math.abs(g.x-75)<30&&Math.abs(m.y-g.gap)>68){finish(false,'A gate caught your ball. Adjust your altitude sooner.');return}if(!g.passed&&g.x<46){g.passed=true;addScore();if(m.score>=8)finish(true,'All eight gravity gates survived!')}}m.gates=m.gates.filter(g=>g.x>-45)},draw(){base('#15213a');L(0,10,360,10,'#f0a1b755',4);L(0,440,360,440,'#f0a1b755',4);m.gates.forEach(g=>{R(g.x-23,0,46,g.gap-70,'#9f7adc',5);R(g.x-23,g.gap+70,46,450-(g.gap+70),'#9f7adc',5)});O(75,m.y,19,U.yellow);S(75,m.y,23,'#fff8c777',3);T('HOLD = RISE    RELEASE = FALL',180,45,12,U.muted);T('GATES: '+m.score+' / 8',180,412,15,U.mint)}});

// 15 — Crossroad traffic; tap cars to pause and avoid collisions.
define({init(){m.t=48;m.spawn=.25;m.cars=[];m.total=0;controls([])},tap(x,y){let a=m.cars.find(c=>dist(x,y,c.axis==='h'?c.pos:180,c.axis==='v'?c.pos:225)<32);if(a){a.brake=a.brake>0?0:2.5;beep(390)}},update(dt){m.spawn-=dt;if(m.spawn<=0&&m.total<16){m.cars.push({axis:'h',pos:-25,brake:0});m.cars.push({axis:'v',pos:-25,brake:0});m.total+=2;m.spawn=4.3}for(let c of m.cars){c.brake=Math.max(0,c.brake-dt);if(c.brake<=0)c.pos+=90*dt}const h=m.cars.find(c=>c.axis==='h'&&Math.abs(c.pos-180)<28),v=m.cars.find(c=>c.axis==='v'&&Math.abs(c.pos-225)<28);if(h&&v)finish(false,'Collision at the intersection! Tap a car to brake.');for(let c of m.cars)if(c.pos>390&&!c.counted){c.counted=true;addScore();if(m.score>=12)finish(true,'Twelve cars crossed safely under your watch.')}m.cars=m.cars.filter(c=>c.pos<410)},draw(){base('#1b2637');R(0,192,360,66,'#47536b');R(147,0,66,450,'#47536b');for(let i=0;i<7;i++){R(i*55,223,26,3,'#ffeca4');R(179,i*75,3,35,'#ffeca4')}m.cars.forEach(c=>{let x=c.axis==='h'?c.pos:180,y=c.axis==='v'?c.pos:225;R(x-20,y-13,40,26,c.brake>0?U.red:c.axis==='h'?U.mint:U.yellow,7);T(c.brake>0?'Ⅱ':'●',x,y,13,'#2b344e')});T('SAFE CROSSINGS: '+m.score+' / 12',180,35,15,U.white);T('TAP A CAR TO STOP OR RELEASE',180,415,12,U.muted)}});

// 16 — Feed a hungry stopwatch with green +3s snacks.
define({init(){m.t=23;m.spawn=.1;m.snacks=[];m.misses=0;controls([])},tap(x,y){let i=m.snacks.findIndex(a=>dist(a.x,a.y,x,y)<24);if(i>=0){const s=m.snacks.splice(i,1)[0];if(s.good){m.t=Math.min(35,m.t+3.3);addScore();if(m.score>=12)finish(true,'The clock is full! You collected twelve time snacks.')}else{m.t=Math.max(0,m.t-4);m.misses++;beep(170)}}},update(dt){m.spawn-=dt;if(m.spawn<=0){m.snacks.push({x:rnd(36,324),y:-20,vy:rnd(65,104),good:Math.random()>.28});m.spawn=.65}for(const s of m.snacks)s.y+=s.vy*dt;m.snacks=m.snacks.filter(s=>s.y<465)},draw(){base('#1a203b');O(180,211,85,'#34425f');S(180,211,92,U.yellow,7);L(180,211,180+55*Math.sin(m.elapsed),211-55*Math.cos(m.elapsed),U.white,5);O(180,211,7,U.pink);m.snacks.forEach(a=>{O(a.x,a.y,18,a.good?U.mint:U.red);T(a.good?'+3':'−4',a.x,a.y,14,'#26344d')});T('FEED ME!',180,50,23,U.yellow);T('GOOD SNACKS: '+m.score+' / 12',180,405,14,U.white)}});

// 17 — Mirror constellations across a center axis.
const constellations=[[[0,0],[2,1],[1,2],[0,4],[2,5]],[[1,0],[0,1],[2,2],[0,3],[1,5]],[[2,0],[1,1],[0,2],[2,4],[0,5]]];
define({init(){m.t=82;m.stage=0;m.placed=new Set();m.mistakes=0;controls([])},tap(x,y){let col=Math.floor((x-40)/40),row=Math.floor((y-102)/43);if(col<4||col>6||row<0||row>5)return;const key=col+','+row;if(m.placed.has(key))return;let expected=constellations[m.stage].some(([a,b])=>6-a===col&&b===row);if(expected){m.placed.add(key);addScore();if(m.placed.size===5){m.stage++;m.level=m.stage+1;if(m.stage===3)finish(true,'All three impossible galaxies are whole again.');else m.placed=new Set()}}else{m.mistakes++;beep(175);if(m.mistakes>=5)finish(false,'Too many misplaced stars. Look at the mirror line.')}},draw(){base('#10142a');T('MIRROR THE CONSTELLATION',180,49,16,U.yellow);L(180,91,180,376,'#f2d994a6',2);for(let r=0;r<6;r++)for(let c=0;c<7;c++){let x=60+c*40,y=124+r*43;O(x,y,2,'#8291b044')}constellations[Math.min(m.stage,2)].forEach(([c,r])=>{let x=60+c*40,y=124+r*43;S(x,y,12,U.blue,2);O(x,y,5,U.white)});for(let key of m.placed){const [col,row]=key.split(',').map(Number);const x=60+col*40,y=124+row*43;S(x,y,12,U.pink,2);O(x,y,5,U.white)}T('LEFT: TEMPLATE     RIGHT: YOUR CANVAS',180,399,11,U.muted);T('MISTAKES: '+m.mistakes+' / 5',180,424,12,U.pink)}});

// 18 — Chase orbs while your ghost follows your movements with a delay.
define({init(){m.t=43;m.x=65;m.y=200;m.ghostX=295;m.ghostY=90;m.hist=[];m.inv=2;m.hp=3;m.orb={x:270,y:300};controls([])},move(x,y){m.x=clamp(x,18,342);m.y=clamp(y,65,411)},tap(x,y){this.move(x,y)},update(dt){m.hist.push({x:m.x,y:m.y,t:m.elapsed});while(m.hist.length>200)m.hist.shift();const trail=m.hist.findLast(p=>p.t<=m.elapsed-1.2);if(trail){m.ghostX+=clamp(trail.x-m.ghostX,-300*dt,300*dt);m.ghostY+=clamp(trail.y-m.ghostY,-300*dt,300*dt)}m.inv=Math.max(0,m.inv-dt);if(dist(m.x,m.y,m.ghostX,m.ghostY)<30&&m.inv<=0){m.hp--;m.inv=2;beep(170);if(!m.hp)finish(false,'Your delayed echo caught up three times.')}if(dist(m.x,m.y,m.orb.x,m.orb.y)<24){addScore();m.orb={x:rnd(35,325),y:rnd(98,393)};if(m.score>=10)finish(true,'Ten orbs claimed. The other cursor never caught you.')}},draw(){base('#181931');m.hist.filter((_,i)=>i%8===0).forEach((p,i)=>O(p.x,p.y,2+i*.05,'#8aa0d24a'));O(m.orb.x,m.orb.y,14,U.mint);S(m.orb.x,m.orb.y,21,'#9cf6d67b',2);O(m.ghostX,m.ghostY,19,U.red);T('☹',m.ghostX,m.ghostY,17,'#34263f');O(m.x,m.y,16,m.inv>0&&Math.floor(m.elapsed*7)%2?U.white:U.blue);T('✦',m.x,m.y,18,'#2b2a50');T('YOUR ECHO IS 1.2s BEHIND',180,38,13,U.pink);T('♥ '.repeat(m.hp)+'  ·  ORBS '+m.score+'/10',180,424,14,U.muted)}});

// 19 — Invisible walls and on-demand peek mechanic.
function makeInvisibleMaze(stage){let walls=new Set();for(let y=0;y<7;y++)for(let x=0;x<7;x++){let safe=stage===0?(y===6||x===6):(x===0||y===0);if(!safe&&Math.random()<.46)walls.add(x+','+y)}return walls}
define({init(){m.t=78;m.stage=0;m.x=0;m.y=6;m.walls=makeInvisibleMaze(0);m.peek=2.8;m.cooldown=0;m.lives=5;controls([['←','left'],['↑','up'],['↓','down'],['→','right'],['👁 PEEK','peek',true]])},action(a){if(a==='peek'){if(m.cooldown<=0){m.peek=1.5;m.cooldown=5}return}const d={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[a];if(!d)return;let x=m.x+d[0],y=m.y+d[1];if(x<0||x>6||y<0||y>6)return;if(m.walls.has(x+','+y)){m.lives--;m.peek=Math.max(.3,m.peek);beep(160);if(!m.lives)finish(false,'Invisible walls took all your hearts.');return}m.x=x;m.y=y;addScore();if(x===6&&y===0){m.stage++;m.level=m.stage+1;if(m.stage===2){finish(true,'Both invisible labyrinths conquered.');return}m.x=0;m.y=6;m.peek=2.5;m.cooldown=0;m.walls=makeInvisibleMaze(1)}},tap(x,y){let c=Math.floor((x-30)/43),r=Math.floor((y-93)/43),dx=c-m.x,dy=r-m.y;if(Math.abs(dx)+Math.abs(dy)!==1)return;this.action(dx===1?'right':dx===-1?'left':dy===1?'down':'up')},update(dt){m.peek=Math.max(0,m.peek-dt);m.cooldown=Math.max(0,m.cooldown-dt)},draw(){base('#12172a');T('WALLS ARE '+(m.peek>0?'VISIBLE':'INVISIBLE'),180,46,16,m.peek>0?U.mint:U.pink);for(let y=0;y<7;y++)for(let x=0;x<7;x++)R(31+x*43,93+y*43,39,39,m.peek>0&&m.walls.has(x+','+y)?'#cd778a':'#26324c',5);O(50+m.x*43,112+m.y*43,13,U.yellow);T('★',50+6*43,112,20,U.mint);T('♥ '.repeat(m.lives)+'  ·  '+(m.cooldown>0?'PEEK '+Math.ceil(m.cooldown)+'s':'PEEK READY'),180,422,13,U.muted)}});

// 20 — 8-turn lighthearted villain strategy; increase chaos without maxing heat.
define({init(){m.t=null;m.turn=1;m.chaos=0;m.heat=12;m.level=1;controls([['🎈 PRANK','prank'],['⚡ GLITCH','glitch'],['🕶 DECOY','decoy'],['🌙 HIDE','hide',true]])},action(a){if(a==='prank'){m.chaos+=16;m.heat+=9}else if(a==='glitch'){m.chaos+=27;m.heat+=23}else if(a==='decoy'){m.chaos+=5;m.heat-=17}else if(a==='hide'){m.chaos=Math.max(0,m.chaos-5);m.heat-=28}else return;m.heat=clamp(m.heat-2,0,110);if(m.heat>=100){finish(false,'The city detectives caught you! Keep HEAT below 100.');return}addScore(1);if(m.chaos>=100){finish(true,'Maximum cartoon chaos achieved without getting caught!');return}if(m.turn>=8){finish(false,'Eight turns are up. Reach 100 chaos while staying stealthy.');return}m.turn++;m.level=m.turn},draw(){base('#241a38');T('EVIL MASTER PLAN',180,45,21,U.pink);T('TURN '+m.turn+' / 8',180,75,12,U.muted);for(let i=0;i<7;i++){let h=50+(i*47)%104;R(12+i*50,268-h,38,h,'#35365d',4);for(let q=0;q<3;q++)R(20+i*50,280-h+q*25,8,12,'#f4d69188',2)}R(0,268,360,7,'#435273');meter('CHAOS (TARGET 100)',m.chaos,100,41,328,U.mint,278);meter('HEAT (STAY UNDER 100)',m.heat,100,41,389,U.red,278);T('Choose your next evil decision below',180,435,11,U.muted)}});

// Lifecycle. Each game uses the shared mobile-friendly canvas and optional tap controls.
function frame(now){let dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(m&&game){if(!m.ended&&!$('cabinet-dialog').open){m.elapsed+=dt;game.update?.(dt);if(!m.ended&&m.t!=null){m.t-=dt;if(m.t<=0){m.t=0;if(game.timeout)game.timeout();else finish(false,'The timer ran out. Give it another go!')}}}try{ctx.clearRect(0,0,W,H);game.draw()}catch(err){console.error('Game rendering error',err);base();T('This round needs a restart.',180,225,16,U.pink)}refreshHud()}requestAnimationFrame(frame)}
renderHome();requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();