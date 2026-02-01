# Flappy Bird (HTML5 Canvas Game)

A browser-based Flappy Bird–style game built with vanilla HTML5, CSS, and JavaScript. The bird is controlled by jumping through gaps between pipes; the game uses the Canvas API for rendering and the Web Audio API for sound effects—no frameworks or external game engines.

## Features

- **Physics-based bird movement** — Gravity and jump velocity for natural-feeling motion
- **Procedurally generated pipes** — Pipes spawn from the right with random vertical gaps
- **Collision detection** — Game ends when the bird hits a pipe or the ground
- **Scoring system** — Score increases by 1 each time the bird passes a pipe
- **Web Audio API sound effects** — Jump, score, and game-over sounds generated in code (no audio files)
- **Keyboard & mouse controls** — Space or click to jump, start, and restart

## Controls

| Action   | Input              |
|----------|--------------------|
| Jump     | **Space** or **Click** |
| Start    | **Space** or **Click** (on start screen) |
| Restart  | **Space** or **Click** (on game over screen) |

## How It Works

- **Gravity and jumping**  
  Each frame, the bird’s vertical velocity is increased by a gravity constant, then the bird’s position is updated. A jump sets velocity to a negative (upward) value; gravity then slows and reverses it, producing an arc.

- **Collision detection**  
  The bird is treated as a circle. Ground collision: game over when the circle touches or goes below the ground line. Pipe collision: the pipe bodies are rectangles; we use circle–rectangle overlap tests for the top and bottom pipe segments. Any overlap ends the game.

- **Scoring logic**  
  When the bird’s leading edge passes the right side of a pipe, that pipe is marked as “scored” and the score is incremented by 1. Each pipe is counted only once.

- **Sound (Web Audio API)**  
  Tones are generated with oscillators (sine, square, sawtooth) and gain nodes. No external audio files are used; jump, score, and game-over sounds are synthesized in code.

## Difficulty Customization

All tuning constants are at the top of `script.js`. Adjust them to change difficulty:

| Constant               | Default | Effect |
|------------------------|--------|--------|
| `GRAVITY`              | `0.35` | Higher = faster fall, harder control |
| `JUMP_STRENGTH`        | `-8`   | More negative = stronger jump |
| `PIPE_SPEED`           | `3`    | Higher = pipes move faster |
| `PIPE_GAP`             | `140`  | Smaller = narrower gap, harder |
| `PIPE_SPAWN_INTERVAL`  | `1800` (ms) | Smaller = pipes appear more often |
| `BIRD_RADIUS`          | `15`   | Collision circle size (smaller = smaller hitbox) |

## Tech Stack

- **HTML5** — Structure and canvas element
- **CSS3** — Layout, typography, overlays, animations
- **JavaScript** — Canvas API (rendering, game loop), Web Audio API (sound), no frameworks

## How to Run Locally

1. Clone or download the project.
2. Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).
3. No build step or server is required; the game runs entirely in the browser from the file.

## Project Structure

```
flappy-bird/
├── index.html    # Entry point, canvas, overlays
├── style.css     # Layout, canvas, score badge, overlays, typography
├── script.js     # Game logic, physics, collision, scoring, audio
└── README.md     # This file
```

## What I Learned

- **Canvas rendering** — Drawing shapes, gradients, and text in a 2D context with a game loop
- **Game loops** — Using `requestAnimationFrame` for smooth, frame-based updates
- **Collision detection** — Circle–rectangle overlap for game physics
- **Basic game physics** — Gravity, velocity, and position updates over time
- **Audio synthesis** — Using the Web Audio API (oscillators, gain) to generate simple sound effects without audio files

## Future Improvements

- **Mobile touch optimization** — Larger tap targets and touch-friendly controls
- **High-score persistence** — Store best score in `localStorage` and show it on the game over screen
- **Difficulty levels** — Easy / Normal / Hard presets (e.g., different gravity, gap size, pipe speed)
- **Better animations** — Bird flap cycle, pipe entrance/exit, subtle parallax or clouds
- **Sprite-based graphics** — Replace circles and rectangles with sprite sheets for a more polished look

---

*Built with vanilla HTML, CSS, and JavaScript—suitable for portfolios, internships, and academic submissions.*
