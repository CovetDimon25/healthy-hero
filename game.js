const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const streakEl = document.getElementById('streak');
const startBtn = document.getElementById('startBtn');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

let W = canvas.width, H = canvas.height;
let player = {x:W/2-16, y:H-60, w:32, h:48, vx:0, vy:0, onGround:false};
let gravity = 0.8;
let left=false, right=false;
let items = [];
let score = 0, lives = 3, streak=0;
let running = false;
let spawnTimer = 0;

function resetGame(){
  player.x = W/2-16; player.y = H-60; player.vx=0; player.vy=0; player.onGround=false;
  items = []; score=0; lives=3; streak=0; updateHUD();
  gameOverEl.classList.add('hidden');
}

function startGame(){
  resetGame();
  running = true;
  startBtn.classList.add('hidden');
  loop();
}

function endGame(){
  running = false;
  finalScoreEl.textContent = 'Your score: ' + score;
  gameOverEl.classList.remove('hidden');
  startBtn.classList.remove('hidden');
}

function updateHUD(){
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  streakEl.textContent = streak;
}

function spawn(){
  spawnTimer--;
  if(spawnTimer>0) return;
  spawnTimer = 40 - Math.min(25, Math.floor(score/10));
  let kind = Math.random() < 0.65 ? 'healthy' : 'junk';
  let x = Math.random()*(W-36)+18;
  items.push({x:x, y:-20, vy: 2 + Math.random()*2, kind:kind, w:28, h:28});
}

function handleCollisions(){
  for(let i=items.length-1;i>=0;i--){
    let it = items[i];
    if(it.y + it.h > H-48){
      if(it.kind === 'healthy'){ score += 10; streak += 1; }
      else { lives -= 1; streak = 0; }
      items.splice(i,1);
      updateHUD();
      if(lives<=0) endGame();
    } else if(rectIntersect(it, player)){
      if(it.kind === 'healthy'){ score += 20; streak += 1; }
      else { score = Math.max(0, score-15); lives -= 1; streak = 0; }
      items.splice(i,1);
      updateHUD();
      if(lives<=0) endGame();
    }
  }
}

function rectIntersect(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function update(){
  if(!running) return;
  if(left) player.vx = -3;
  else if(right) player.vx = 3;
  else player.vx *= 0.9;
  player.x += player.vx;
  if(player.x < 0) player.x = 0;
  if(player.x + player.w > W) player.x = W - player.w;
  player.vy += gravity;
  player.y += player.vy;
  if(player.y + player.h >= H-48){
    player.y = H-48 - player.h;
    player.vy = 0;
    player.onGround = true;
  } else player.onGround = false;
  spawn();
  for(let it of items){ it.y += it.vy; it.vy += 0.05; }
  handleCollisions();
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#e8f5e9';
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#a5d6a7';
  ctx.fillRect(0,H-48,W,48);
  ctx.fillStyle = '#33691e';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x+6, player.y+10, 6, 6);
  ctx.fillRect(player.x+20, player.y+10, 6, 6);
  for(let it of items){
    if(it.kind === 'healthy'){
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.ellipse(it.x+it.w/2, it.y+it.h/2, it.w/2, it.h/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(it.x+it.w/2-2, it.y-6, 4, 6);
    } else {
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(it.x, it.y, it.w, it.h);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(it.x+4, it.y+6, it.w-8, 6);
    }
  }
}

function loop(){
  update();
  draw();
  if(running) requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowLeft') left = true;
  if(e.key === 'ArrowRight') right = true;
  if(e.key === 'ArrowUp' && player.onGround){ player.vy = -12; player.onGround=false; }
});
window.addEventListener('keyup', (e)=>{
  if(e.key === 'ArrowLeft') left = false;
  if(e.key === 'ArrowRight') right = false;
});

document.getElementById('leftBtn').addEventListener('pointerdown', ()=> left = true);
document.getElementById('leftBtn').addEventListener('pointerup', ()=> left = false);
document.getElementById('rightBtn').addEventListener('pointerdown', ()=> right = true);
document.getElementById('rightBtn').addEventListener('pointerup', ()=> right = false);
document.getElementById('jumpBtn').addEventListener('pointerdown', ()=>{
  if(player.onGround){ player.vy = -12; player.onGround=false; }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

setInterval(()=>{
  if(running && streak > 0 && streak % 5 === 0){
    score += 15;
    streak += 1;
    updateHUD();
    showTip();
  }
}, 3000);

function showTip(){
  const tips = [
    'Drink water regularly — aim for 8 cups.',
    'Take short walks every hour.',
    'Choose whole fruits over juice.',
    'Sleep 7–9 hours for better focus.',
    'Swap a sugary snack for nuts.'
  ];
  const t = tips[Math.floor(Math.random()*tips.length)];
  const el = document.getElementById('desc');
  el.textContent = 'Tip: ' + t;
  setTimeout(()=> el.textContent = 'Collect healthy items, avoid junk food, and build habits!', 4500);
}

function fit(){
  const scale = Math.min((window.innerWidth-24)/360, (window.innerHeight-80)/640, 1);
  canvas.style.transform = 'scale('+scale+')';
  canvas.style.transformOrigin = 'top left';
}
window.addEventListener('resize', fit);
fit();
