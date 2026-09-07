import * as THREE from "three";

export class Food {
  constructor(position, random = Math.random, tank = null, landAt = null) {
    this.rng = random;
    this.eaten = false;
    this.sunk = false;
    this.tank = tank;
    this.landAt = landAt;

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe0a33a, roughness: 0.6 })
    );
    this.mesh.position.copy(position);
    this.pos = position.clone();

    const fallTime = landAt ? this.estimateFallTime(position.y, landAt.y) : 1;
    this.vel = new THREE.Vector3(
      landAt ? (landAt.x - position.x) / fallTime : (this.rng() * 2 - 1) * 0.4,
      -0.6,
      landAt ? (landAt.z - position.z) / fallTime : (this.rng() * 2 - 1) * 0.4
    );
    this.life = 0;
  }

  estimateFallTime(fromY, toY) {
    const a = 0.125;
    const b = 0.6;
    const c = toY - fromY;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return 1;
    return (-b + Math.sqrt(disc)) / (2 * a);
  }

  update(dt, floorY) {
    this.life += dt;
    this.vel.y -= 0.25 * dt;
    this.pos.add(this.vel.clone().multiplyScalar(dt));
    this.pos.y = Math.max(this.pos.y, floorY + 0.15);
    if (this.tank) {
      const m = 0.15;
      this.pos.x = Math.max(-this.tank.width / 2 + m, Math.min(this.tank.width / 2 - m, this.pos.x));
      this.pos.z = Math.max(-this.tank.depth / 2 + m, Math.min(this.tank.depth / 2 - m, this.pos.z));
    }
    if (this.landAt) {
      const dx = this.landAt.x - this.pos.x;
      const dz = this.landAt.z - this.pos.z;
      if (Math.hypot(dx, dz) < 0.05) {
        this.pos.x = this.landAt.x;
        this.pos.z = this.landAt.z;
        this.vel.x = 0;
        this.vel.z = 0;
      }
    }
    this.mesh.position.copy(this.pos);
    this.mesh.rotation.x += dt * 1.5;
    this.mesh.rotation.y += dt * 1.2;

    this.sunk = this.pos.y <= floorY + 0.2;
    if (this.sunk && this.landAt) {
      this.pos.x = this.landAt.x;
      this.pos.z = this.landAt.z;
      this.vel.x = 0;
      this.vel.z = 0;
    }
    if (this.life > 25) this.eaten = true;
  }

  dispose(scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
