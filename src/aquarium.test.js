import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { Aquarium } from "./aquarium.js";

function makeAquarium() {
  return new Aquarium(new THREE.Scene());
}

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