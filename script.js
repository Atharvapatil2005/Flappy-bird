/**
 * Flappy Bird - Vanilla JavaScript
 * Renders on HTML5 Canvas. No frameworks. Run by opening index.html.
 */

// ============ DIFFICULTY / TUNING (tweak these) ============
const GRAVITY = 0.35;           // Downward acceleration. Higher = harder.
const JUMP_STRENGTH = -8;       // Upward velocity on jump. More negative = stronger jump.
const PIPE_SPEED = 3;           // Pixels per frame. Higher = faster pipes.
const PIPE_GAP = 140;           // Vertical gap between top and bottom pipe. Smaller = harder.
const PIPE_SPAWN_INTERVAL = 1800; // ms between new pipes. Smaller = more pipes.
const BIRD_RADIUS = 15;         // Collision circle radius.
const GROUND_Y_OFFSET = 80;     // Height of ground strip from bottom.

// ============ DOM & Canvas ============
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");
const scoreBadgeEl = document.getElementById("scoreBadge");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GROUND_Y = CANVAS_HEIGHT - GROUND_Y_OFFSET;

// ============ Game State ============
let gameState = "start"; // "start" | "playing" | "gameover"
let score = 0;
let bird = null;
let pipes = [];
let lastPipeTime = 0;
let animationId = null;

// ============ Sound (Web Audio API - no external files) ============
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, duration, type = "sine", volume = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

function soundJump() {
  playTone(400, 0.08, "square", 0.12);
  setTimeout(() => playTone(520, 0.06, "square", 0.1), 50);
}

function soundScore() {
  playTone(600, 0.1, "sine", 0.15);
  setTimeout(() => playTone(800, 0.1, "sine", 0.12), 80);
}

function soundGameOver() {
  playTone(200, 0.2, "sawtooth", 0.15);
  setTimeout(() => playTone(150, 0.3, "sawtooth", 0.12), 150);
}

// ============ Bird ============
function createBird() {
  return {
    x: CANVAS_WIDTH * 0.3,
    y: CANVAS_HEIGHT / 2,
    velocityY: 0,
    radius: BIRD_RADIUS,
  };
}

function updateBird(dt) {
  if (gameState !== "playing" || !bird) return;
  // Apply gravity: velocity increases downward each frame
  bird.velocityY += GRAVITY;
  bird.y += bird.velocityY;
  // Clamp so bird doesn't go above ceiling (optional)
  if (bird.y - bird.radius < 0) {
    bird.y = bird.radius;
    bird.velocityY = 0;
  }
}

function jumpBird() {
  if (!bird) return;
  bird.velocityY = JUMP_STRENGTH;
  if (gameState === "playing") soundJump();
}

// ============ Pipes ============
const PIPE_WIDTH = 60;
const PIPE_MIN_TOP = 80;
const PIPE_MAX_TOP = GROUND_Y - PIPE_GAP - 80;

function spawnPipe() {
  // Random gap position: top of gap determines where the opening is
  const gapTop = PIPE_MIN_TOP + Math.random() * (PIPE_MAX_TOP - PIPE_MIN_TOP);
  const gapBottom = gapTop + PIPE_GAP;
  pipes.push({
    x: CANVAS_WIDTH,
    width: PIPE_WIDTH,
    gapTop,
    gapBottom,
    scored: false, // true after bird has passed (counted for score)
  });
}

function updatePipes(dt) {
  if (gameState !== "playing") return;
  const now = Date.now();
  if (now - lastPipeTime > PIPE_SPAWN_INTERVAL) {
    spawnPipe();
    lastPipeTime = now;
  }
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED;
    // Score when bird center passes pipe's right edge
    if (!pipe.scored && bird && bird.x - bird.radius > pipe.x + pipe.width) {
      pipe.scored = true;
      score++;
      if (scoreBadgeEl) scoreBadgeEl.textContent = score;
      soundScore();
    }
  }
  pipes = pipes.filter((p) => p.x + p.width > 0);
}

// ============ Collision Detection ============
function circleRect(cx, cy, r, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

function checkCollisions() {
  if (gameState !== "playing" || !bird) return;
  const { x, y, radius } = bird;

  // Ground collision
  if (y + radius >= GROUND_Y) {
    endGame();
    return;
  }

  // Pipe collision: top and bottom rectangles
  for (const pipe of pipes) {
    const topRect = { x: pipe.x, y: 0, w: pipe.width, h: pipe.gapTop };
    const bottomRect = { x: pipe.x, y: pipe.gapBottom, w: pipe.width, h: CANVAS_HEIGHT - pipe.gapBottom };
    if (
      circleRect(x, y, radius, topRect.x, topRect.y, topRect.w, topRect.h) ||
      circleRect(x, y, radius, bottomRect.x, bottomRect.y, bottomRect.w, bottomRect.h)
    ) {
      endGame();
      return;
    }
  }
}

function endGame() {
  gameState = "gameover";
  soundGameOver();
  finalScoreEl.textContent = score;
  if (scoreBadgeEl) scoreBadgeEl.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

// ============ Drawing ============
function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#4ec0ca");
  gradient.addColorStop(0.7, "#87ceeb");
  gradient.addColorStop(1, "#dee8a0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawGround() {
  ctx.fillStyle = "#deb887";
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 6);
}

function drawBird() {
  if (!bird) return;
  ctx.save();
  ctx.fillStyle = "#f1c40f";
  ctx.strokeStyle = "#b7950b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Eye
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(bird.x + 5, bird.y - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPipes() {
  ctx.fillStyle = "#27ae60";
  ctx.strokeStyle = "#1e8449";
  ctx.lineWidth = 2;
  for (const pipe of pipes) {
    // Top pipe
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapTop);
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.gapTop);
    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.gapBottom, pipe.width, CANVAS_HEIGHT - pipe.gapBottom);
    ctx.strokeRect(pipe.x, pipe.gapBottom, pipe.width, CANVAS_HEIGHT - pipe.gapBottom);
  }
}

function drawScore() {
  // Score is shown via the HTML score badge during gameplay
  if (gameState !== "playing") return;
}

// ============ Game Loop ============
function gameLoop(timestamp) {
  if (gameState === "gameover") {
    animationId = null;
    return;
  }
  const dt = 1; // Fixed step for consistent physics
  updateBird(dt);
  updatePipes(dt);
  checkCollisions();

  drawSky();
  drawGround();
  drawPipes();
  drawBird();
  drawScore();

  animationId = requestAnimationFrame(gameLoop);
}

// ============ Start / Restart ============
function startGame() {
  gameState = "playing";
  score = 0;
  bird = createBird();
  pipes = [];
  lastPipeTime = Date.now();
  if (scoreBadgeEl) {
    scoreBadgeEl.textContent = "0";
    scoreBadgeEl.classList.remove("hidden");
  }
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

// ============ Input ============
function onKeyDown(e) {
  if (e.code === "Space") {
    e.preventDefault();
    if (gameState === "start") startGame();
    else if (gameState === "playing") jumpBird();
    else if (gameState === "gameover") startGame();
  }
}

function onClick() {
  if (gameState === "start") startGame();
  else if (gameState === "playing") jumpBird();
  else if (gameState === "gameover") startGame();
}

document.addEventListener("keydown", onKeyDown);
canvas.addEventListener("click", onClick);

// Initial draw (start screen)
drawSky();
drawGround();
bird = createBird();
drawBird();
