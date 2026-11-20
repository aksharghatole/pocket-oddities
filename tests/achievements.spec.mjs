import {test,expect} from '@playwright/test';

async function openCabinet(page){
  await page.locator('#cabinet-trigger').click();
  await expect(page.locator('#cabinet-dialog')).toBeVisible();
}
async function start(page,title){
  await page.goto('/');
  await page.getByRole('button',{name:new RegExp(title)}).first().click();
}
test('reduced motion setting applies and survives reload',async ({page})=>{
  await page.goto('/');
  await openCabinet(page);
  const toggle=page.locator('#reduced-motion-toggle');
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion','true');
  expect(await page.evaluate(()=>localStorage.getItem('oddities-reduced-motion'))).toBe('true');
  const duration=await page.locator('.game-card').first().evaluate(el=>getComputedStyle(el).transitionDuration);
  expect(duration.split(',').every(value=>parseFloat(value)<=0.001)).toBe(true);
  await page.reload();
  await openCabinet(page);
  await expect(page.locator('#reduced-motion-toggle')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion','true');
});
test('local player name and avatar persist after reload',async ({page})=>{
  await page.goto('/');
  await openCabinet(page);
  await page.locator('#cabinet-player-name-input').fill('  Quick   Fox  ');
  await page.locator('#cabinet-player-name-save').click();
  await expect(page.locator('#cabinet-player-name')).toHaveText('Quick Fox');
  await page.locator('[data-player-avatar="🐙"]').click();
  await expect(page.locator('#cabinet-player-avatar')).toHaveText('🐙');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('oddities-cabinet-v1')));
  expect(saved.playerName).toBe('Quick Fox');
  expect(saved.playerAvatar).toBe('🐙');
  await page.reload();
  await openCabinet(page);
  await expect(page.locator('#cabinet-player-name')).toHaveText('Quick Fox');
  await expect(page.locator('#cabinet-player-name-input')).toHaveValue('Quick Fox');
  await expect(page.locator('#cabinet-player-avatar')).toHaveText('🐙');
});
test('Cabinet shows achievements and five hidden cross-game threads',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#cabinet-count')).toHaveText('0/14');
  await openCabinet(page);
  await expect(page.locator('.cabinet-medal')).toHaveCount(14);
  await expect(page.locator('[data-achievement="first-spark"]')).toContainText('Common');
  await expect(page.locator('[data-achievement="all-games"]')).toContainText('Legendary');
  await expect(page.locator('[data-achievement="all-threads"]')).toContainText('Secret');
  await expect(page.locator('.cabinet-thread')).toHaveCount(5);
  await expect(page.locator('[data-thread="night"] .cabinet-thread-part')).toHaveCount(3);
  await expect(page.locator('#cabinet-theme')).toHaveText('Original arcade glow');
  await expect(page.locator('[data-profile-score]')).toHaveAttribute('data-profile-score','0');
  await expect(page.locator('[data-profile-score]')).toContainText('Level 1');
  await page.locator('#cabinet-close').click();
  await expect(page.locator('#cabinet-dialog')).toBeHidden();
  expect(errors).toEqual([]);
});
test('earning a win awards the first medal and it survives reload',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await start(page,'One Minute Villain');
  const glitch=page.locator('#game-controls button').filter({hasText:'GLITCH'});
  for(let i=0;i<4;i++){
    if(await page.locator('#game-overlay').isVisible())break;
    await glitch.click();
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await openCabinet(page);
  await expect(page.locator('[data-achievement="first-spark"]')).toHaveClass(/earned/);
  await expect(page.locator('#cabinet-count')).toHaveText('1/14');
  await expect(page.locator('#cabinet-stats')).toContainText('Games beaten');
  await expect(page.locator('[data-profile-score]')).toHaveAttribute('data-profile-score','150');
  await expect(page.locator('[data-profile-score]')).toContainText('Level 1');
  await page.reload();
  await openCabinet(page);
  await expect(page.locator('[data-achievement="first-spark"]')).toHaveClass(/earned/);
  await expect(page.locator('#cabinet-count')).toHaveText('1/14');
  expect(errors).toEqual([]);
});
test('existing wins unlock a hidden relic and equipped theme survives reload',async ({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('oddities-wins',JSON.stringify({'4':true,'12':true,'18':true}));
  });
  await page.goto('/');
  await openCabinet(page);
  const night=page.locator('[data-thread="night"]');
  await expect(night).toHaveClass(/completed/);
  await expect(night.locator('.cabinet-thread-part.discovered')).toHaveCount(3);
  await expect(night).toContainText('Nocturne');
  await night.locator('button[data-equip="night"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-oddity-theme','night');
  await page.reload();
  await openCabinet(page);
  await expect(page.locator('html')).toHaveAttribute('data-oddity-theme','night');
  await expect(page.locator('#cabinet-theme')).toContainText('Nocturne');
  await page.locator('#cabinet-default').click();
  await expect(page.locator('html')).toHaveAttribute('data-oddity-theme','default');
});
test('unfound links are riddles until their game is beaten',async ({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('oddities-wins',JSON.stringify({'1':true}));
  });
  await page.goto('/');
  await openCabinet(page);
  const signal=page.locator('[data-thread="signal"]');
  await expect(signal).toContainText('1/3');
  await expect(signal).toContainText('You Are the Notification');
  await expect(signal).not.toContainText('One Finger Orchestra');
  await expect(signal).not.toContainText('Echo Tiles');
  await expect(signal.locator('.cabinet-equip')).toHaveCount(0);
});
test('Cabinet pauses an active game clock',async ({page})=>{
  await start(page,'The Button Has Feelings');
  await expect(page.locator('#clock')).toHaveText(/s$/);
  await openCabinet(page);
  const paused=await page.locator('#clock').textContent();
  await page.waitForTimeout(1450);
  await expect(page.locator('#clock')).toHaveText(paused);
  await page.locator('#cabinet-close').click();
  await page.waitForTimeout(1150);
  const resumed=await page.locator('#clock').textContent();
  expect(parseInt(resumed)).toBeLessThanOrEqual(parseInt(paused));
});

test('The Game Is Lying has a complete fair ten-question victory path',async ({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await start(page,'The Game Is Lying');
  for(const answer of ['RIGHT','MOON','8','1','PURPLE','FIRST','CHAIR','ROCK','DOWN','STOP']){
    await page.locator('#game-controls button').filter({hasText:new RegExp('^'+answer+'$')}).click();
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#score')).toHaveText('10');
  expect(errors).toEqual([]);
});
test('Echo Tiles previews a signal then accepts a memorized sequence',async ({page})=>{
  // Deterministic first signal: the top-left diamond flashes three times.
  await page.addInitScript(()=>{Math.random=()=>0;});
  await start(page,'Echo Tiles');
  await expect(page.locator('#level-pill')).toHaveText('ROUND 01');
  await page.waitForTimeout(3600);
  const canvas=page.locator('#arena');
  await canvas.scrollIntoViewIfNeeded();
  for(let i=0;i<3;i++){
    const b=await canvas.boundingBox();
    await page.touchscreen.tap(b.x+b.width*(103/360),b.y+b.height*(181/450));
  }
  await expect(page.locator('#score')).toHaveText('3');
  await expect(page.locator('#level-pill')).toHaveText('ROUND 02');
});
