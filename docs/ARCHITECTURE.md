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
| `src/aquarium.js` | Tank geometry, lighting, water tint, decor, obstacles, spawn/bounds helpers |
| `src/fish.js` | Fish entity: mesh, destination-based steering, food chasing, obstacle avoidance, wall reflection |
| `src/food.js` | Food pellet entity: spawn, sinking physics, tank clamping, lifetime, disposal |

## Runtime Flow

1. `main.js` creates the Three.js scene, camera, and renderer with
   `OrbitControls` for the player's view.
2. An `Aquarium` builds the tank, lights, and decor; exposes `tank`
   dimensions and `obstacles` (rock, plant) used for bounds and avoidance.
3. A fixed school of `Fish` entities is added to the scene.
4. On pointer-down, the game computes a surface spawn point and a floor
   landing point from the click ray (`Aquarium.spawnPointForRay`) and spawns
   a `Food` pellet that appears at the cursor and homes toward the clicked
   floor spot.
5. Each frame: fish steer their body heading toward their current goal
   (nearest food pellet or a roaming destination) with a limited turn rate,
   avoid obstacles, and reflect off tank walls; pellets sink within tank
   bounds; pellets within eat radius of a fish are consumed and increment
   the score.

## Conventions

- Every entity owns a Three.js `Group`/`Mesh` attached to the shared scene.
- Simulation is decoupled from render: entities store `pos`/`heading` and copy
  to `mesh.position`.
- Fish use destination-based steering: the body heading rotates toward the
  goal at a limited turn rate, then the fish swims forward along the heading.
- Obstacles are circles (`{ position, radius }`) blended into the desired
  steering direction; wall contact reflects the heading instead of negating
  velocity.
- Food and eaten objects are disposed (`dispose()` + scene removal) to avoid
  leaks; fish use a fixed pool.
- `dt` is clamped to avoid large-frame jumps.
- Deterministic-ish random injected via `random` param (default `Math.random`)
  to permit testing.

## Testing

- Unit tests via Vitest (`npm test`): `src/fish.test.js`, `src/food.test.js`,
  `src/aquarium.test.js`.
- Tests cover fish target acquisition, destination steering, body rotation,
  constant idle swimming, obstacle avoidance, bounds, eating; food sinking,
  floor clamping, lifetime, disposal; aquarium spawn-point and clamp helpers.
- The eat interaction is a pure method (`Fish.tryEat`) so it is testable
  without a DOM/canvas; browser rendering is verified manually via `npm run dev`.