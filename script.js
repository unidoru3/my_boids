// Boids シミュレーション
// 各 Boid は (x, y) 位置と (vx, vy) 速度 を 持つ
// 3 つの ルールで 群れの 振る舞いを 作る:
//   1. Separation ── 近すぎる 仲間から 離れる
//   2. Alignment  ── 仲間の 平均速度に 合わせる
//   3. Cohesion   ── 仲間の 重心に 向かう

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const NUM_BOIDS = 100;
const MAX_SPEED = 3.0;

// パラメータ (後で スライダーで 変えられる ように する)
let separationWeight = 1.5;
let alignmentWeight  = 1.0;
let cohesionWeight   = 1.0;

const SEPARATION_RADIUS = 20;  // この 距離 以内 の 仲間からは 離れる
const PERCEPTION_RADIUS = 50;  // この 距離 以内 の 仲間を 「見える」 とみなす

// Boid 配列を 初期化
const boids = [];
for (let i = 0; i < NUM_BOIDS; i++) {
  const angle = Math.random() * Math.PI * 2;
  boids.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: Math.cos(angle) * MAX_SPEED,
    vy: Math.sin(angle) * MAX_SPEED,
  });
}

// 1 体の Boid に 働く 加速度 (ax, ay) を 計算
function computeForces(b) {
  let sepX = 0, sepY = 0;
  let aliX = 0, aliY = 0, aliCount = 0;
  let cohX = 0, cohY = 0, cohCount = 0;

  for (const other of boids) {
    if (other === b) continue;
    const dx = other.x - b.x;
    const dy = other.y - b.y;
    const dist = Math.hypot(dx, dy);

    // Separation: 近すぎる 仲間 から 離れる
    if (dist > 0 && dist < SEPARATION_RADIUS) {
      sepX -= dx / dist;
      sepY -= dy / dist;
    }
    // Alignment と Cohesion: 知覚範囲 内 の 仲間 を 集計
    if (dist > 0 && dist < PERCEPTION_RADIUS) {
      aliX += other.vx;
      aliY += other.vy;
      aliCount++;
      cohX += other.x;
      cohY += other.y;
      cohCount++;
    }
  }

  // Alignment: 平均速度との 差
  if (aliCount > 0) {
    aliX = aliX / aliCount - b.vx;
    aliY = aliY / aliCount - b.vy;
  }
  // Cohesion: 重心 への 向き
  if (cohCount > 0) {
    cohX = cohX / cohCount - b.x;
    cohY = cohY / cohCount - b.y;
  }

  // 3 つの 力 を 重みづけて 合成
  return {
    ax: sepX * separationWeight + aliX * alignmentWeight + cohX * cohesionWeight * 0.01,
    ay: sepY * separationWeight + aliY * alignmentWeight + cohY * cohesionWeight * 0.01,
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

function tick() {
  // 速度の 更新
  for (const b of boids) {
    const f = computeForces(b);
    b.vx += f.ax;
    b.vy += f.ay;
    // 速度の 上限を 設ける
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > MAX_SPEED) {
      b.vx = b.vx / speed * MAX_SPEED;
      b.vy = b.vy / speed * MAX_SPEED;
    }
  }
  // 位置の 更新
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

  requestAnimationFrame(tick);
}

tick();
