import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { Aquarium } from "./aquarium.js";

function makeAquarium() {
  return new Aquarium(new THREE.Scene());
}

describe("Aquarium.randomSpawnPoint", () => {
  it("returns spawn and landing points inside the tank footprint", () => {
    const aq = makeAquarium();
    const { spawn, land } = aq.randomSpawnPoint(() => 0.5);
    expect(spawn.y).toBe(aq.tank.height / 2 - 0.5);
    expect(land.y).toBe(-aq.tank.height / 2);
    expect(Math.abs(spawn.x)).toBeLessThanOrEqual(aq.tank.width / 2 - 0.8);
    expect(Math.abs(spawn.z)).toBeLessThanOrEqual(aq.tank.depth / 2 - 0.8);
    expect(spawn.x).toBe(land.x);
    expect(spawn.z).toBe(land.z);
  });
});

describe("Aquarium.clampToBounds", () => {
  it("clamps points beyond the tank width", () => {
    const aq = makeAquarium();
    const p = aq.clampToBounds(new THREE.Vector3(50, 0, 0));
    expect(p.x).toBeLessThanOrEqual(aq.tank.width / 2 - 0.5);
    expect(p.x).toBeGreaterThanOrEqual(-aq.tank.width / 2 + 0.5);
  });

  it("clamps points beyond the tank depth", () => {
    const aq = makeAquarium();
    const p = aq.clampToBounds(new THREE.Vector3(0, 0, -50));
    expect(p.z).toBeLessThanOrEqual(aq.tank.depth / 2 - 0.5);
    expect(p.z).toBeGreaterThanOrEqual(-aq.tank.depth / 2 + 0.5);
  });

  it("clamps points beyond the tank height", () => {
    const aq = makeAquarium();
    const p = aq.clampToBounds(new THREE.Vector3(0, 50, 0));
    expect(p.y).toBeLessThanOrEqual(aq.tank.height / 2 - 0.5);
    expect(p.y).toBeGreaterThanOrEqual(-aq.tank.height / 2 + 0.5);
  });

  it("leaves interior points unchanged", () => {
    const aq = makeAquarium();
    const p = aq.clampToBounds(new THREE.Vector3(1, 0, 1));
    expect(p.x).toBe(1);
    expect(p.y).toBe(0);
    expect(p.z).toBe(1);
  });
});

describe("Aquarium.spawnPointForRay", () => {
  it("returns a surface spawn point and floor landing point on the ray", () => {
    const aq = makeAquarium();
    const ray = new THREE.Ray(new THREE.Vector3(2, 5, 3), new THREE.Vector3(0, -1, 0));
    const { spawn, land } = aq.spawnPointForRay(ray);
    expect(spawn.x).toBe(2);
    expect(spawn.z).toBe(3);
    expect(spawn.y).toBe(aq.tank.height / 2 - 0.5);
    expect(land.x).toBe(2);
    expect(land.z).toBe(3);
    expect(land.y).toBe(-aq.tank.height / 2);
  });

  it("clamps both spawn and landing points to the tank footprint", () => {
    const aq = makeAquarium();
    const ray = new THREE.Ray(new THREE.Vector3(50, 5, 0), new THREE.Vector3(0, -1, 0));
    const { spawn, land } = aq.spawnPointForRay(ray);
    expect(spawn.x).toBe(aq.tank.width / 2 - 0.5);
    expect(land.x).toBe(aq.tank.width / 2 - 0.5);
    expect(spawn.y).toBe(aq.tank.height / 2 - 0.5);
  });

  it("falls back to center when the ray misses both planes", () => {
    const aq = makeAquarium();
    const ray = new THREE.Ray(new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, 0, -1));
    const { spawn, land } = aq.spawnPointForRay(ray);
    expect(spawn.x).toBe(0);
    expect(spawn.z).toBe(0);
    expect(spawn.y).toBe(aq.tank.height / 2 - 0.5);
    expect(land.x).toBe(0);
    expect(land.z).toBe(0);
  });
});