// Boids シミュレーション
// 各 Boid は (x, y) 位置と (vx, vy) 速度 を 持つ
// 3 つの ルールで 群れの 振る舞いを 作る:
//   1. Separation ── 近すぎる 仲間から 離れる
//   2. Alignment  ── 仲間の 平均速度に 合わせる
//   3. Cohesion   ── 仲間の 重心に 向かう
// 追加で、 マウス カーソル から 逃げる ルールも 加える

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const NUM_BOIDS = 200;
const MAX_SPEED = 100.0;

// パラメータ (UI スライダーで リアルタイムに 変更される)
let separationWeight = 1.5;
let alignmentWeight  = 1.0;
let cohesionWeight   = 1.0;
let mouseWeight      = 5.0;

const SEPARATION_RADIUS = 20;
const PERCEPTION_RADIUS = 50;
const MOUSE_RADIUS      = 80;

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

function predetorAttraction(b) {
  let predetorX = 0, predetorY = 0;
  for (const other of boids) {
    if (other === b) continue;
    const dx = other.x - b.x;
    const dy = other.y - b.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < PERCEPTION_RADIUS) {
      predetorX += dx / dist;
      predetorY += dy / dist;
    }
  }
  return { ax: predetorX * 0.5, ay: predetorY * 0.5 };
}

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

  const predetorForces = predetorAttraction(b);
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

  return {
    ax: sepX * separationWeight
      + aliX * alignmentWeight
      + cohX * cohesionWeight * 0.01
      + mX   * mouseWeight,
    ay: sepY * separationWeight
      + aliY * alignmentWeight
      + cohY * cohesionWeight * 0.01
      + mY   * mouseWeight,
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
  for (const b of boids) drawBoid(b);
  drawMouse();

  requestAnimationFrame(tick);
}

// ── UI と バインディング ──────────────────────────────
function bindSlider(id, valId, setter) {
  const input = document.getElementById(id);
  const val   = document.getElementById(valId);
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

document.getElementById("resetBtn").addEventListener("click", initBoids);

tick();
