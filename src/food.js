import * as THREE from "three";

export class Food {
  constructor(position, random = Math.random) {
    this.rng = random;
    this.eaten = false;
    this.sunk = false;

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe0a33a, roughness: 0.6 })
    );
    this.mesh.position.copy(position);
    this.pos = position.clone();
    this.vel = new THREE.Vector3(
      (this.rng() * 2 - 1) * 0.4,
      -0.6,
      (this.rng() * 2 - 1) * 0.4
    );
    this.life = 0;
  }

  update(dt, floorY) {
    this.life += dt;
    this.vel.y -= 0.25 * dt;
    this.pos.add(this.vel.clone().multiplyScalar(dt));
    this.pos.y = Math.max(this.pos.y, floorY + 0.15);
    this.mesh.position.copy(this.pos);
    this.mesh.rotation.x += dt * 1.5;
    this.mesh.rotation.y += dt * 1.2;

    this.sunk = this.pos.y <= floorY + 0.2;
    if (this.life > 25) this.eaten = true;
  }

  dispose(scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
