# Architecture

> Status: ESTABLISHED — playable MVP architecture implemented (v0.1).

## Overview

A browser-based single-page 3D game. Vanilla ES modules + Three.js, bundled
with Vite. No framework, no backend. State lives in-memory for a single
session.

## Components

| File | Responsibility |
| --- | --- |
| `index.html` | App shell, canvas, HUD markup |
| `src/main.js` | Bootstrap: scene/camera/renderer, game loop, input, scoring |
| `src/aquarium.js` | Tank geometry, lighting, water tint, decor, bounds helper |
| `src/fish.js` | Fish entity: mesh, wander/swim AI, steering toward food, bounds clamp |
| `src/food.js` | Food pellet entity: spawn, sinking physics, lifetime, disposal |

## Runtime Flow

1. `main.js` creates the Three.js scene, camera, and renderer with
   `OrbitControls` for the player's view.
2. An `Aquarium` builds the tank, lights, and decor; exposes `tank`
   dimensions used for bounds checks.
3. A fixed school of `Fish` entities is added to the scene.
4. On pointer-down, the game raycasts onto a horizontal plane and spawns a
   `Food` pellet.
5. Each frame: fish update steering/wander, clamp to bounds; pellets sink;
   pellets within eat radius of a chasing fish are consumed and increment
   the score.

## Conventions

- Every entity owns a Three.js `Group`/`Mesh` attached to the shared scene.
- Simulation is decoupled from render: entities store `pos`/`vel` and copy to
  `mesh.position`.
- Food and eaten objects are disposed (`dispose()` + scene removal) to avoid
  leaks; fish use a fixed pool.
- `dt` is clamped to avoid large-frame jumps.
- Deterministic-ish random injected via `random` param (default `Math.random`)
  to permit testing.