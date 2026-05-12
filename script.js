// Boids シミュレーション
// 各 Boid は (x, y) 位置と (vx, vy) 速度 を 持つ

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const NUM_BOIDS = 100;
const MAX_SPEED = 3.0;

// Boid 配列を 初期化 (ランダムな 位置 ・ 向き)
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

// 1 体の Boid を 三角形で 描く (進行方向 に 頂点)
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

// 毎フレーム: 位置を 進めて 描き直す
function tick() {
  for (const b of boids) {
    b.x += b.vx;
    b.y += b.vy;
    // 画面端で 反対側に ワープ (トーラス トポロジー)
    if (b.x < 0) b.x += canvas.width;
    if (b.x > canvas.width) b.x -= canvas.width;
    if (b.y < 0) b.y += canvas.height;
    if (b.y > canvas.height) b.y -= canvas.height;
  }

  // 軌跡を 残すため、 黒で 半透明に 塗りつぶす
  ctx.fillStyle = "rgba(13, 17, 23, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const b of boids) {
    drawBoid(b);
  }

  requestAnimationFrame(tick);
}

tick();
