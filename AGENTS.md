# AGENTS.md

This project is governed by the Agentic Engineering Protocol (AEP), the
latest canonical version.

The canonical protocol document is referenced by this project's `opencode.json`
`instructions` and lives at:

- `/Users/ceefour/project/agentic-engineering-protocol/agentic-engineering-protocol.md`

The AEP defines 11 primary modes (ORIENT, RESEARCH, PLAN, IMPLEMENT, DEBUG,
REVIEW, VERIFY, REFACTOR, DOCUMENT, ALIGN, RECOVER) and 8 cross-cutting
systems (AMTS, AEP-DM, DCI, ETAT, Test Strategy & Evidence, Git & Version
Control Management, Intent & Requirement Change Management, Human Delegation &
Collaboration). It must be followed for all engineering work in this project.

## Durable Context

- `PRD.md` — product requirements (authoritative intent)
- `docs/ARCHITECTURE.md` — architecture
- This file — agent instructions and conventions

## Project Conventions

- Stack: Three.js + Vite, vanilla ES modules (no framework).
- Entities own a Three.js Group/Mesh; simulation state (`pos`/`vel`) is
  decoupled from `mesh.position`.
- Disposed objects call `dispose()` and are removed from the scene.
- Randomness is injected via a `random` param (default `Math.random`) for
  testability.
- Verify with `npm run build`; run locally with `npm run dev`.
