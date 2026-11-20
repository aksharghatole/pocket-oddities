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
    },
    {
      id: 'lunar-mail', title: 'The Moon’s Unclaimed Mail', glyph: '✉', relic: 'Moonpost',
      story: 'Some letters cross impossible distances without a sender.',
      completion: 'The parcel was sorted, the message was unmasked, and the reply found its rhythm. The Moonpost glow is yours.',
      parts: [
        ['Moon Mail Sorter', 'Deliver the parcel with a star address'],
        ['The Game Is Lying', 'Read the instructions printed on the wrong envelope'],
        ['One Finger Orchestra', 'Send the reply through a perfect rhythm']
      ]
    },
    {
      id: 'buried-signal', title: 'The Buried Signal', glyph: '⌖', relic: 'Fossil Glow',
      story: 'Something beneath the arcade has been trying to send a message.',
      completion: 'The fossil, the moon parcel, and the living circuit reveal the first signal. The Fossil Glow is yours.',
      parts: [
        ['Fossil Forecast', 'A pattern buried before the first broadcast'],
        ['Moon Mail Sorter', 'A parcel with an origin older than the moon'],
        ['Circuit Garden', 'Follow a living path that predates its seed']
      ]
    },
  ];
  const medals = [
    {id:'first-spark', icon:'✦', title:'First Spark', desc:'Beat your first game.', rarity:'Common', unlock:c=>c.uniqueWins.size>=1},
    {id:'curious', icon:'◈', title:'Curious Collector', desc:'Beat five different games.', rarity:'Uncommon', unlock:c=>c.uniqueWins.size>=5},
    {id:'archivist', icon:'✺', title:'Oddity Archivist', desc:'Beat ten different games.', rarity:'Rare', unlock:c=>c.uniqueWins.size>=10},
    {id:'explorer', icon:'◇', title:'Wandering Finger', desc:'Try ten different games.', rarity:'Common', unlock:c=>c.visited>=10},
    {id:'reflex', icon:'⚡', title:'Lightning Hands', desc:'Beat three reflex games.', rarity:'Uncommon', unlock:c=>c.categoryWins.reflex>=3},
    {id:'puzzle', icon:'🗝', title:'Puzzle Whisperer', desc:'Beat three puzzle games.', rarity:'Uncommon', unlock:c=>c.categoryWins.puzzle>=3},
    {id:'strategy', icon:'♟', title:'Tiny Tactician', desc:'Beat two strategy games.', rarity:'Rare', unlock:c=>c.categoryWins.strategy>=2},
    {id:'weird', icon:'☻', title:'Certified Oddity', desc:'Beat two weird games.', rarity:'Rare', unlock:c=>c.categoryWins.weird>=2},
    {id:'return', icon:'↻', title:'One More Round', desc:'Start any game three times.', rarity:'Common', unlock:c=>c.maxAttempts>=3},
    {id:'streak', icon:'✴', title:'Three in a Row', desc:'Win three rounds without losing.', rarity:'Epic', unlock:c=>c.bestStreak>=3},
    {id:'lunar-courier', icon:'📮', title:'Lunar Courier', desc:'Beat Moon Mail Sorter.', rarity:'Uncommon', unlock:c=>c.uniqueWins.has('Moon Mail Sorter')},
    {id:'first-thread', icon:'◐', title:'Thread Collector', desc:'Uncover your first hidden connection.', rarity:'Rare', unlock:c=>c.completeThreads>=1},
    {id:'all-threads', icon:'✳', title:'Keeper of Secrets', desc:'Uncover all five hidden connections.', rarity:'Secret', unlock:c=>c.completeThreads===threads.length},
    {id:'all-games', icon:'♛', title:'The Whole Oddity', desc:'Beat every registered game.', rarity:'Legendary', unlock:c=>c.uniqueWins.size===c.catalog.length}
  ];
  const byTitle = new Map(threads.flatMap(t => t.parts.map(p => [p[0],t])));

  function safeRead(key,fallback) {
    try { const value=JSON.parse(localStorage.getItem(key));return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback; }
    catch {return fallback;}
  }
  const PLAYER_DEFAULT_NAME='Pocket Player';
  const PLAYER_AVATARS=['✳','😈','👽','🐙','🌙','🤖','🦊','🐸'];
  const data = safeRead(KEY,{});
  data.playerName=typeof data.playerName==='string'&&data.playerName.trim()?data.playerName.trim().replace(/\s+/g,' ').slice(0,18):PLAYER_DEFAULT_NAME;
  data.playerAvatar=PLAYER_AVATARS.includes(data.playerAvatar)?data.playerAvatar:PLAYER_AVATARS[0];
  data.plays = data.plays && typeof data.plays==='object' ? data.plays : {};
  data.earned = data.earned && typeof data.earned==='object' ? data.earned : {};
  data.found = data.found && typeof data.found==='object' ? data.found : {};
  data.theme = ['default',...threads.map(t=>t.id)].includes(data.theme)?data.theme:'default';
  data.streak = Math.max(0,Number(data.streak)||0);
  data.bestStreak = Math.max(0,Number(data.bestStreak)||0);
  data.completedRounds = Math.max(0,Number(data.completedRounds)||0);
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}}
  let reducedMotion = false;

  function restoreProgress(){ /* existing implementation remains below in repository */ }
})();