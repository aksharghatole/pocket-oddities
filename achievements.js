/* Pocket Oddities Cabinet — earned medals, story threads and collectible visual relics.
   Works offline; all progress stays on the device. No accounts or telemetry. */
(() => {
  'use strict';
  const KEY = 'oddities-cabinet-v1';
  const $ = id => document.getElementById(id);
  const api = window.PocketOddities;
  if (!api || !$('cabinet-dialog')) return;

  const threads = [
    {
      id: 'night', title: 'The Night Circuit', glyph: '☾', relic: 'Nocturne',
      story: 'The lights went out, yet something still remembers the way.',
      completion: 'The shadows were three parts of the same map. You can now wear the Nocturne glow.',
      parts: [
        ['Shadow Thief', 'Follow the path that fears the sun'],
        ['The Last Light Switch', 'A spark behind one final switch'],
        ['Invisible Maze', 'A wall you only see when you forget']
      ]
    },
    {
      id: 'cosmos', title: 'A Borrowed Galaxy', glyph: '✧', relic: 'Stardust',
      story: 'Something in the sky has been collecting stray light.',
      completion: 'Every star is a letter. Together they spell a hidden sky. Stardust is yours.',
      parts: [
        ["Don't Wake the Planet", 'Let the sleeping giant dream'],
        ['Pocket Black Hole', 'What disappears may still shine'],
        ['Unfinished Universe', 'Restore the other half of heaven']
      ]
    },
    {
      id: 'signal', title: 'The Lost Frequency', glyph: '⌁', relic: 'Afterglow',
      story: 'Three tiny sounds want to become one impossible broadcast.',
      completion: 'The quiet notification, the perfect note, and the remembered echo made a signal.',
      parts: [
        ['You Are the Notification', 'Send the message nobody asked for'],
        ['One Finger Orchestra', 'Listen where the ring meets the beat'],
        ['Echo Tiles', 'Repeat a voice with no owner']
      ]
    },
    {
      id: 'time', title: 'The Unlikely Clock', glyph: '⧖', relic: 'Daybreak',
      story: 'A clock, a falling thought, and a worried button have a secret.',
      completion: 'Time is not a line here. Sometimes it is an emotion. Daybreak is yours.',
      parts: [
        ['The Clock Is Hungry', 'Feed an hour that has no mouth'],
        ['Gravity Is Shy', 'Let gravity change its mind'],
        ['The Button Has Feelings', 'Be kind to the thing that starts it all']
      ]
    }
  ];
  const medals = [
    {id:'first-spark', icon:'✦', title:'First Spark', desc:'Beat your first game.', unlock:c=>c.uniqueWins.size>=1},
    {id:'curious', icon:'◈', title:'Curious Collector', desc:'Beat five different games.', unlock:c=>c.uniqueWins.size>=5},
    {id:'archivist', icon:'✺', title:'Oddity Archivist', desc:'Beat ten different games.', unlock:c=>c.uniqueWins.size>=10},
    {id:'explorer', icon:'◇', title:'Wandering Finger', desc:'Try ten different games.', unlock:c=>c.visited>=10},
    {id:'reflex', icon:'⚡', title:'Lightning Hands', desc:'Beat three reflex games.', unlock:c=>c.categoryWins.reflex>=3},
    {id:'puzzle', icon:'🗝', title:'Puzzle Whisperer', desc:'Beat three puzzle games.', unlock:c=>c.categoryWins.puzzle>=3},
    {id:'strategy', icon:'♟', title:'Tiny Tactician', desc:'Beat two strategy games.', unlock:c=>c.categoryWins.strategy>=2},
    {id:'weird', icon:'☻', title:'Certified Oddity', desc:'Beat two weird games.', unlock:c=>c.categoryWins.weird>=2},
    {id:'return', icon:'↻', title:'One More Round', desc:'Start any game three times.', unlock:c=>c.maxAttempts>=3},
    {id:'streak', icon:'✴', title:'Three in a Row', desc:'Win three rounds without losing.', unlock:c=>c.bestStreak>=3},
    {id:'first-thread', icon:'◐', title:'Thread Collector', desc:'Uncover your first hidden connection.', unlock:c=>c.completeThreads>=1},
    {id:'all-threads', icon:'✳', title:'Keeper of Secrets', desc:'Uncover all four hidden connections.', unlock:c=>c.completeThreads===threads.length}
  ];
  const byTitle = new Map(threads.flatMap(t => t.parts.map(p => [p[0],t])));

  function safeRead(key,fallback) {
    try { const value=JSON.parse(localStorage.getItem(key));return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback; }
    catch {return fallback;}
  }
  const data = safeRead(KEY,{});
  data.plays = data.plays && typeof data.plays==='object' ? data.plays : {};
  data.earned = data.earned && typeof data.earned==='object' ? data.earned : {};
  data.found = data.found && typeof data.found==='object' ? data.found : {};
  data.theme = ['default',...threads.map(t=>t.id)].includes(data.theme)?data.theme:'default';
  data.streak = Math.max(0,Number(data.streak)||0);
  data.bestStreak = Math.max(0,Number(data.bestStreak)||0);
  data.completedRounds = Math.max(0,Number(data.completedRounds)||0);
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}}

  function context(){
    const catalog = api.catalog;
    const wins = safeRead('oddities-wins',{});
    const uniqueWins = new Set();
    const categoryWins={reflex:0,puzzle:0,strategy:0,weird:0};
    catalog.forEach(({name,category},index)=>{
      if(!wins[index])return;
      if(uniqueWins.has(name))return;
      uniqueWins.add(name);
      if(Object.hasOwn(categoryWins,category))categoryWins[category]++;
    });
    const visited=Object.values(data.plays).filter(n=>Number(n)>0).length;
    const maxAttempts=Math.max(0,...Object.values(data.plays).map(n=>Number(n)||0));
    const completeThreads=threads.filter(t=>t.parts.every(([name])=>uniqueWins.has(name))).length;
    const medalCount=medals.filter(medal=>data.earned[medal.id]).length;
    const dailyRecords=safeRead('oddities-daily-records',{});
    const completedDailyRuns=Object.values(dailyRecords).filter(record=>record?.completed).length;
    const rushTimes=Object.values(dailyRecords).filter(record=>record?.completed&&Number.isFinite(Number(record.seconds))).map(record=>Number(record.seconds));
    const fastestRush=rushTimes.length?Math.min(...rushTimes):null;
    // Rewards are one-time milestones: unique wins, medals, hidden threads, and one daily clear per UTC date.
    const oddityScore=uniqueWins.size*100+medalCount*50+completeThreads*100+completedDailyRuns*25;
    const level=Math.floor(oddityScore/500)+1;
    return {catalog,uniqueWins,categoryWins,visited,maxAttempts,bestStreak:data.bestStreak,completeThreads,medalCount,completedDailyRuns,fastestRush,oddityScore,level};
  }
  let toastTimer;
  function notify(message){
    const el=$('oddities-toast');
    clearTimeout(toastTimer);
    el.textContent=message;
    el.classList.add('show');
    toastTimer=setTimeout(()=>el.classList.remove('show'),4300);
  }
  function sync({quiet=true,finishedName=null,won=false}={}){
    const c=context(), newlyMedals=[],newlyThreads=[];
    const now=Date.now();
    for(const thread of threads){
      if(thread.parts.every(([name])=>c.uniqueWins.has(name))&&!data.found[thread.id]){
        data.found[thread.id]=now;newlyThreads.push(thread);
      }
    }
    for(const medal of medals){
      if(medal.unlock(c)&&!data.earned[medal.id]){data.earned[medal.id]=now;newlyMedals.push(medal);}
    }
    if(data.theme!=='default'&&!data.found[data.theme])data.theme='default';
    persist();
    applyTheme();
    const updated=context();
    draw(updated);
    if(!quiet){
      if(newlyThreads.length)notify('◈ Hidden thread complete! '+newlyThreads[0].title+' — open the Cabinet.');
      else if(finishedName&&won&&byTitle.has(finishedName)){
        const thread=byTitle.get(finishedName);
        notify('◈ A strange connection: '+thread.parts.filter(([name])=>updated.uniqueWins.has(name)).length+'/3 echoes found in '+thread.title+'.');
      }else if(newlyMedals.length)notify('✦ Achievement unlocked: '+newlyMedals[0].title);
    }
  }
  function applyTheme(){
    document.documentElement.dataset.oddityTheme=data.theme;
    $('cabinet-theme').textContent=data.theme==='default'?'Original arcade glow':threads.find(t=>t.id===data.theme).relic+' glow';
  }
  function el(tag,className,text){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  }
  function draw(c){
    const count=medals.filter(m=>data.earned[m.id]).length;
    $('cabinet-count').textContent=count+'/'+medals.length;
    $('cabinet-subtitle').textContent=c.oddityScore+' Oddity Score · Level '+c.level+' · '+count+' / '+medals.length+' achievements · '+c.completeThreads+' / '+threads.length+' threads connected';
    const stats=$('cabinet-stats');
    stats.replaceChildren();
    const profileScore=el('div','cabinet-stat cabinet-stat-score');
    profileScore.dataset.profileScore=String(c.oddityScore);
    profileScore.setAttribute('aria-label','Oddity Score '+c.oddityScore+', Level '+c.level);
    profileScore.append(el('strong',null,String(c.oddityScore)),el('small',null,'Oddity Score'));
    profileScore.append(el('span','cabinet-stat-level','Level '+c.level));
    stats.append(profileScore);
    const fastestRush=c.fastestRush===null?'—':(c.fastestRush<60?c.fastestRush.toFixed(1)+'s':Math.floor(c.fastestRush/60)+'m '+Math.round(c.fastestRush%60)+'s');
    for(const [number,title] of [[String(c.uniqueWins.size),'Games beaten'],[String(c.visited),'Games tried'],[String(data.completedRounds),'Rounds played'],[String(c.completedDailyRuns),'Daily Rushes'],[fastestRush,'Fastest Rush'],[String(data.bestStreak),'Best win streak']]){
      const item=el('div','cabinet-stat');
      item.append(el('strong',null,number),el('small',null,title));stats.append(item);
    }
    const badges=$('cabinet-medals');
    badges.replaceChildren();
    for(const medal of medals){
      const earned=Boolean(data.earned[medal.id]);
      const badge=el('article','cabinet-medal'+(earned?' earned':' locked'));
      badge.dataset.achievement=medal.id;
      badge.append(el('span','cabinet-medal-icon',earned?medal.icon:'?'));
      const content=el('div','cabinet-medal-copy');
      content.append(el('strong',null,medal.title),el('small',null,medal.desc));
      badge.append(content,el('span','cabinet-medal-status',earned?'✓':'◇'));
      badges.append(badge);
    }
    const threadList=$('cabinet-threads');
    threadList.replaceChildren();
    for(const thread of threads){
      const owned=Boolean(data.found[thread.id]);
      const found=thread.parts.filter(([title])=>c.uniqueWins.has(title)).length;
      const card=el('article','cabinet-thread'+(owned?' completed':''));
      card.dataset.thread=thread.id;
      const header=el('div','cabinet-thread-head');
      header.append(el('span','cabinet-thread-glyph',thread.glyph));
      const info=el('div','cabinet-thread-copy');
      info.append(el('strong',null,thread.title),el('small',null,thread.story));
      header.append(info,el('span','cabinet-thread-count',found+'/3'));
      card.append(header);
      const steps=el('div','cabinet-thread-parts');
      for(const [title,hint] of thread.parts){
        const discovered=c.uniqueWins.has(title);
        const part=el('div','cabinet-thread-part'+(discovered?' discovered':''));
        part.append(el('span','cabinet-part-symbol',discovered?'✦':'◇'),el('span',null,discovered?title:hint));
        steps.append(part);
      }
      card.append(steps);
      const foot=el('div','cabinet-thread-footer');
      if(owned){
        foot.append(el('span','cabinet-thread-reveal','Unlocked: '+thread.relic+' · '+thread.completion));
        const button=el('button','cabinet-equip',data.theme===thread.id?'Equipped ✓':'Equip glow');
        button.type='button';button.dataset.equip=thread.id;
        foot.append(button);
      }else foot.append(el('span','cabinet-thread-locked',found===0?'A hidden relic awaits…':'Find '+(3-found)+' more echo'+(3-found===1?'':'es')+' to unlock a relic.'));
      card.append(foot);threadList.append(card);
    }
    decorateCards(c);
  }
  function decorateCards(c){
    document.querySelectorAll('#game-grid .game-card').forEach(card=>{
      const title=card.querySelector('h3')?.textContent;
      const thread=byTitle.get(title);
      let symbol=card.querySelector('.cabinet-card-thread');
      if(!thread){symbol?.remove();return;}
      if(!symbol){symbol=el('span','cabinet-card-thread');card.append(symbol);}
      const discovered=c.uniqueWins.has(title);
      symbol.textContent=discovered?'✦':'◇';
      symbol.classList.toggle('discovered',discovered);
      symbol.title=discovered?'A hidden connection has been found':'This oddity hides a connection';
    });
  }

  $('cabinet-trigger').addEventListener('click',()=>{
    sync();$('cabinet-dialog').showModal();
  });
  $('cabinet-close').addEventListener('click',()=>$('cabinet-dialog').close());
  $('cabinet-dialog').addEventListener('click',event=>{
    if(event.target===$('cabinet-dialog'))$('cabinet-dialog').close();
    const button=event.target.closest('[data-equip]');
    if(button&&!button.disabled){
      const id=button.dataset.equip;
      if(data.found[id]){data.theme=id;sync();notify('✦ '+threads.find(t=>t.id===id).relic+' glow equipped.');}
    }
  });
  $('cabinet-default').addEventListener('click',()=>{data.theme='default';sync();notify('✦ Original arcade glow restored.');});
  window.addEventListener('oddities:game-start',event=>{
    const title=event.detail?.name;
    if(!title)return;
    data.plays[title]=Math.max(0,Number(data.plays[title])||0)+1;
    sync();
  });
  window.addEventListener('oddities:game-finish',event=>{
    const won=Boolean(event.detail?.won);
    data.completedRounds++;
    data.streak=won?data.streak+1:0;
    data.bestStreak=Math.max(data.bestStreak,data.streak);
    sync({quiet:false,finishedName:event.detail?.name,won});
  });
  window.addEventListener('oddities:catalog-render',()=>decorateCards(context()));
  window.addEventListener('oddities:catalog',()=>sync());
  sync();
})();
