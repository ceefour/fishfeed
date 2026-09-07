import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { Food } from "./food.js";

const FLOOR_Y = -3.5;

function makeFood(y = 2) {
  return new Food(new THREE.Vector3(0, y, 0), () => 0.5);
}

describe("Food", () => {
  it("creates a mesh at the spawn position", () => {
    const pellet = makeFood(2);
    expect(pellet.mesh.position.x).toBe(0);
    expect(pellet.mesh.position.y).toBe(2);
    expect(pellet.mesh.position.z).toBe(0);
  });

  it("sinks over time", () => {
    const pellet = makeFood(2);
    pellet.update(0.1, FLOOR_Y);
    expect(pellet.pos.y).toBeLessThan(2);
  });

  it("clamps to the floor", () => {
    const pellet = makeFood(2);
    for (let i = 0; i < 200; i++) pellet.update(0.1, FLOOR_Y);
    expect(pellet.pos.y).toBeCloseTo(FLOOR_Y + 0.15, 5);
  });

  it("is flagged as sunk once resting on the floor", () => {
    const pellet = makeFood(2);
    for (let i = 0; i < 200; i++) pellet.update(0.1, FLOOR_Y);
    expect(pellet.sunk).toBe(true);
  });

  it("expires after its lifetime", () => {
    const pellet = makeFood(2);
    pellet.update(26, FLOOR_Y);
    expect(pellet.eaten).toBe(true);
  });

  it("disposes by removing its mesh from the scene", () => {
    const scene = new THREE.Scene();
    const pellet = makeFood(2);
    scene.add(pellet.mesh);
    expect(scene.children).toContain(pellet.mesh);
    pellet.dispose(scene);
    expect(scene.children).not.toContain(pellet.mesh);
  });
});