# PRD — Product Requirements

Authoritative source of intent for the `fishfeed` project.

> Status: ESTABLISHED — playable MVP defined and implemented (v0.1).

## Overview

`fishfeed` is a web-based 3D fish feeding game. The player looks into a 3D
aquarium and drops food pellets into the water; fish swim to the food and eat
it, earning points.

## Goals

- Provide a relaxing, interactive 3D aquarium experience in the browser.
- Core loop: drop food → fish swim toward and eat it → score increases.
- Zero-dependency gameplay (no account, no backend) for the MVP.

## Non-Goals (MVP)

- No persistence, multiplayer, or backend services.
- No fish breeding, growth, or health simulation.
- No audio, mobile touch-specific UX, or gamepad support (desktop mouse first).

## Requirements

- Render a 3D aquarium scene (tank, water tint, substrate, lighting, decor).
- A small school of procedurally animated fish that swim within tank bounds.
- Clicking/tapping the tank drops a food pellet that sinks to the floor.
- Fish steer toward nearby food and eat it; eating increments the score.
- On-screen HUD shows the current score and a reset control.

## Acceptance Criteria

1. The game loads in a modern desktop browser with no console errors.
2. Fish are visible and continuously swim without leaving the tank.
3. Clicking inside the tank spawns a visible sinking food pellet.
4. Fish near a pellet move toward it; the pellet disappears when eaten.
5. Each pellet eaten increments the score by 1 in the HUD.
6. Reset returns the score to 0.

## Technical Decisions

- Stack: Three.js + Vite (ES modules), no framework.
- Interaction: pointer + raycast to a horizontal plane at food-drop depth.
- Scope of this version: playable MVP only (see Non-Goals).

## Future Ideas (not committed)

- Fish species variety, feeding frenzy events, growth.
- Sound effects and particles for eating.
- Persistent high score (localStorage).