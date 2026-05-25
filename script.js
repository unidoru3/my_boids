// Boids シミュレーション
// 各 Boid は (x, y) 位置と (vx, vy) 速度 を 持つ
// 3 つの ルールで 群れの 振る舞いを 作る:
//   1. Separation ── 近すぎる 仲間から 離れる
//   2. Alignment  ── 仲間の 平均速度に 合わせる
//   3. Cohesion    ── 仲間の 重心に 向かう
// 追加で、 マウス カーソル から 逃げる ルールも 加える
// 追加で、 障害物（壁）から 逃げる ルールも 加える ★追加

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const NUM_BOIDS = 200;
const MAX_SPEED = 100.0;

// パラメータ (UI スライダーで リアルタイムに 変更される)
let separationWeight = 1.5;
let alignmentWeight  = 1.0;
let cohesionWeight   = 1.0;
let mouseWeight      = 5.0;
let obstacleWeight   = 8.0; // ★障害物から逃げる重み（強めに設定）

const SEPARATION_RADIUS = 20;
const PERCEPTION_RADIUS = 50;
const MOUSE_RADIUS      = 80;
const OBSTACLE_RADIUS   = 60; // ★障害物の影響半径（障害物自身の半径 + 避けるゆとり）

// ★障害物の配置（例として画面中央付近に3つ設置）
const obstacles = [
  { x: 200, y: 200, r: 30 },
  { x: 400, y: 300, r: 40 },
  { x: 600, y: 200, r: 25 }
];

// マウス 状態
const mouse = { x: 0, y: 0, active: false };
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  mouse.x = (e.clientX - rect.left) * scaleX;
  mouse.y = (e.clientY - rect.top)  * scaleY;
  mouse.active = true;
});
canvas.addEventListener("mouseleave", () => { mouse.active = false; });

// Boid 配列を 初期化する 関数 (Reset ボタンでも 呼ぶ)
let boids = [];
function initBoids() {
  boids = [];
  for (let i = 0; i < NUM_BOIDS; i++) {
    const angle = Math.random() * Math.PI * 2;
    boids.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: Math.cos(angle) * MAX_SPEED,
      vy: Math.sin(angle) * MAX_SPEED,
    });
  }
}
initBoids();



function computeForces(b) {
  let sepX = 0, sepY = 0;
  let aliX = 0, aliY = 0, aliCount = 0;
  let cohX = 0, cohY = 0, cohCount = 0;

  for (const other of boids) {
    if (other === b) continue;
    const dx = other.x - b.x;
    const dy = other.y - b.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0 && dist < SEPARATION_RADIUS) {
      sepX -= dx / dist;
      sepY -= dy / dist;
    }
    if (dist > 0 && dist < PERCEPTION_RADIUS) {
      aliX += other.vx;
      aliY += other.vy;
      aliCount++;
      cohX += other.x;
      cohY += other.y;
      cohCount++;
    }
  }
  if (aliCount > 0) {
    aliX = aliX / aliCount - b.vx;
    aliY = aliY / aliCount - b.vy;
  }
  if (cohCount > 0) {
    cohX = cohX / cohCount - b.x;
    cohY = cohY / cohCount - b.y;
  }

  let mX = 0, mY = 0;
  if (mouse.active) {
    const dx = b.x - mouse.x;
    const dy = b.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < MOUSE_RADIUS) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      mX = (dx / dist) * force;
      mY = (dy / dist) * force;
    }
  }

  // ★障害物を避けるルールの追加
  let obsX = 0, obsY = 0;
  for (const obs of obstacles) {
    const dx = b.x - obs.x;
    const dy = b.y - obs.y;
    const dist = Math.hypot(dx, dy);
    
    // 障害物の半径 + ゆとり分（OBSTACLE_RADIUS）の範囲に突入したら避ける
    const avoidRadius = obs.r + OBSTACLE_RADIUS;
    if (dist > 0 && dist < avoidRadius) {
      // 近づくほど強い力で反発させる
      const force = (avoidRadius - dist) / avoidRadius;
      obsX += (dx / dist) * force;
      obsY += (dy / dist) * force;
    }
  }

  return {
    ax: sepX * separationWeight
      + aliX * alignmentWeight
      + cohX * cohesionWeight * 0.01
      + mX   * mouseWeight
      + obsX * obstacleWeight, // ★障害物の力を合算
    ay: sepY * separationWeight
      + aliY * alignmentWeight
      + cohY * cohesionWeight * 0.01
      + mY   * mouseWeight
      + obsY * obstacleWeight, // ★障害物の力を合算
  };
}

function drawBoid(b) {
  const angle = Math.atan2(b.vy, b.vx);
  const size = 6;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size, -size * 0.6);
  ctx.lineTo(-size, size * 0.6);
  ctx.closePath();
  ctx.fillStyle = "#7aa2f7";
  ctx.fill();
  ctx.restore();
}

function drawMouse() {
  if (!mouse.active) return;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(247, 118, 142, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ★障害物を描画する関数を追加
function drawObstacles() {
  for (const obs of obstacles) {
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
    ctx.fillStyle = "#f7768e"; // 少し目立つ赤系の色
    ctx.fill();
    
    // 影響範囲（うっすらとした外枠）
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.r + OBSTACLE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(247, 118, 142, 0.1)";
    ctx.stroke();
  }
}

function tick() {
  for (const b of boids) {
    const f = computeForces(b);
    b.vx += f.ax;
    b.vy += f.ay;
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > MAX_SPEED) {
      b.vx = b.vx / speed * MAX_SPEED;
      b.vy = b.vy / speed * MAX_SPEED;
    }
  }
  for (const b of boids) {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < 0) b.x += canvas.width;
    if (b.x > canvas.width) b.x -= canvas.width;
    if (b.y < 0) b.y += canvas.height;
    if (b.y > canvas.height) b.y -= canvas.height;
  }

  ctx.fillStyle = "rgba(13, 17, 23, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawObstacles(); // ★障害物を描画
  for (const b of boids) drawBoid(b);
  drawMouse();

  requestAnimationFrame(tick);
}

// ── UI と バインディング ──────────────────────────────
function bindSlider(id, valId, setter) {
  const input = document.getElementById(id);
  const val   = document.getElementById(valId);
  if (!input || !val) return; // エレメントがない場合の安全対策
  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    setter(v);
    val.textContent = v.toFixed(1);
  });
}
bindSlider("sep", "sepVal", (v) => { separationWeight = v; });
bindSlider("ali", "aliVal", (v) => { alignmentWeight  = v; });
bindSlider("coh", "cohVal", (v) => { cohesionWeight   = v; });
bindSlider("mou", "mouVal", (v) => { mouseWeight      = v; });
// もしHTML側に障害物用のスライダー（id="obs", id="obsVal"）を追加する場合は以下を有効にしてください
// bindSlider("obs", "obsVal", (v) => { obstacleWeight   = v; });

document.getElementById("resetBtn").addEventListener("click", initBoids);

tick();