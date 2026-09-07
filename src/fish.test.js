import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { Fish } from "./fish.js";
import { Food } from "./food.js";

const TANK = { width: 12, height: 7, depth: 8 };

function makeFish(x = 0, y = 0, z = 0) {
  const f = new Fish(TANK, () => 0.5);
  f.pos.set(x, y, z);
  f.mesh.position.copy(f.pos);
  return f;
}

function makePellet(x = 0, y = 0, z = 0) {
  return new Food(new THREE.Vector3(x, y, z), () => 0.5);
}

describe("Fish", () => {
  it("creates a visible mesh group", () => {
    const f = makeFish();
    expect(f.mesh).toBeInstanceOf(THREE.Group);
    expect(f.mesh.children.length).toBeGreaterThan(0);
  });

  it("acquires the nearest uneaten pellet within range", () => {
    const f = makeFish();
    const near = makePellet(1, 0, 0);
    const far = makePellet(4, 0, 0);
    f.acquireTarget([near, far], 5);
    expect(f.target).toBe(near);
  });

  it("ignores pellets outside the detection range", () => {
    const f = makeFish();
    f.acquireTarget([makePellet(10, 0, 0)], 5);
    expect(f.target).toBeNull();
  });

  it("ignores eaten pellets", () => {
    const f = makeFish();
    const eaten = makePellet(1, 0, 0);
    eaten.eaten = true;
    const live = makePellet(2, 0, 0);
    f.acquireTarget([eaten, live], 5);
    expect(f.target).toBe(live);
  });

  it("steers toward an acquired pellet", () => {
    const f = makeFish(0, 0, 0);
    const pellet = makePellet(6, 0, 0);
    f.acquireTarget([pellet], 10);
    const before = f.pos.distanceTo(pellet.pos);
    for (let i = 0; i < 30; i++) f.update(0.1);
    const after = f.pos.distanceTo(pellet.pos);
    expect(after).toBeLessThan(before);
  });

  it("clears target when the pellet is eaten", () => {
    const f = makeFish(1, 0, 0);
    const pellet = makePellet(2, 0, 0);
    f.acquireTarget([pellet], 5);
    pellet.eaten = true;
    f.update(0.1);
    expect(f.target).toBeNull();
  });

  it("clears target when it reaches the pellet", () => {
    const f = makeFish(0, 0, 0);
    const pellet = makePellet(0.3, 0, 0);
    f.acquireTarget([pellet], 5);
    f.update(0.1);
    expect(f.target).toBeNull();
  });

  it("stays within tank bounds over time", () => {
    const f = makeFish();
    const m = 0.6;
    for (let i = 0; i < 2000; i++) f.update(0.016);
    expect(f.pos.x).toBeGreaterThanOrEqual(-TANK.width / 2 + m);
    expect(f.pos.x).toBeLessThanOrEqual(TANK.width / 2 - m);
    expect(f.pos.y).toBeGreaterThanOrEqual(-TANK.height / 2 + m);
    expect(f.pos.y).toBeLessThanOrEqual(TANK.height / 2 - m);
    expect(f.pos.z).toBeGreaterThanOrEqual(-TANK.depth / 2 + m);
    expect(f.pos.z).toBeLessThanOrEqual(TANK.depth / 2 - m);
  });

  it("eats a pellet within radius", () => {
    const f = makeFish(0, 0, 0);
    const pellet = makePellet(0.5, 0, 0);
    expect(f.tryEat(pellet)).toBe(true);
    expect(pellet.eaten).toBe(true);
  });

  it("does not eat a pellet out of radius", () => {
    const f = makeFish(0, 0, 0);
    const pellet = makePellet(3, 0, 0);
    expect(f.tryEat(pellet)).toBe(false);
    expect(pellet.eaten).toBe(false);
  });

  it("does not eat an already-eaten pellet", () => {
    const f = makeFish(0, 0, 0);
    const pellet = makePellet(0.5, 0, 0);
    pellet.eaten = true;
    expect(f.tryEat(pellet)).toBe(false);
  });

  it("swims forward toward a destination when idle", () => {
    const f = makeFish(0, 0, 0);
    f.heading.set(0, 0, 1);
    f.destination = new THREE.Vector3(4, 0, 0);
    f.destTimer = 100;
    for (let i = 0; i < 20; i++) f.update(0.1);
    expect(f.pos.x).toBeGreaterThan(1);
  });

  it("rotates its body toward the destination", () => {
    const f = makeFish(0, 0, 0);
    f.heading.set(0, 0, 1);
    f.destination = new THREE.Vector3(4, 0, 0);
    for (let i = 0; i < 30; i++) f.update(0.016);
    expect(f.heading.x).toBeGreaterThan(0.5);
  });

  it("swims constantly when idle instead of spinning in place", () => {
    const f = makeFish(0, 0, 0);
    let moved = 0;
    let prev = f.pos.clone();
    for (let i = 0; i < 300; i++) {
      f.update(0.016);
      moved += f.pos.distanceTo(prev);
      prev.copy(f.pos);
    }
    expect(moved).toBeGreaterThan(5);
  });

  it("avoids obstacles while swimming", () => {
    const rock = { position: new THREE.Vector3(0, 0, 0), radius: 1.0 };
    const f = new Fish(TANK, () => 0.5, [rock]);
    f.pos.set(2, 0, 0);
    f.mesh.position.copy(f.pos);
    f.heading.set(-1, 0, 0);
    f.destination = new THREE.Vector3(-4, 0, 0);
    let minDist = Infinity;
    for (let i = 0; i < 300; i++) {
      f.update(0.016);
      minDist = Math.min(minDist, f.pos.distanceTo(rock.position));
    }
    expect(minDist).toBeGreaterThan(0.8);
  });
});