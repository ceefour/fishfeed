import * as THREE from "three";

const PALETTE = [
  0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff9f1c, 0xc77dff, 0xf72585,
];

export class Fish {
  constructor(tank, random = Math.random) {
    this.tank = tank;
    this.rng = random;
    this.color = PALETTE[Math.floor(random() * PALETTE.length)];

    this.speed = 1.2 + random() * 1.2;
    this.turnSpeed = 1.5 + random() * 1.0;

    this.mesh = this.buildMesh();

    this.pos = new THREE.Vector3(
      (random() * 2 - 1) * tank.width * 0.3,
      (random() * 2 - 1) * tank.height * 0.25,
      (random() * 2 - 1) * tank.depth * 0.3
    );
    this.mesh.position.copy(this.pos);

    const angle = random() * Math.PI * 2;
    this.vel = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(this.speed);

    this.target = null;
    this.wobble = random() * Math.PI * 2;
    this.flip = random() < 0.5 ? -1 : 1;
  }

  buildMesh() {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.55, 4, 10),
      new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.4 })
    );
    body.rotation.z = Math.PI / 2;
    body.scale.set(1, 0.75, 0.6);
    group.add(body);

    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.5, 4),
      new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.5 })
    );
    tail.rotation.z = -Math.PI / 2;
    tail.position.x = -0.75;
    group.add(tail);

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.07),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    eye.position.set(0.72, 0.18, 0.16);
    group.add(eye);

    const eye2 = eye.clone();
    eye2.position.z = -0.16;
    group.add(eye2);

    group.scale.setScalar(0.9 + this.rng() * 0.6);
    return group;
  }

  acquireTarget(food, range = 5) {
    this.target = null;
    let nearestDist = range;
    for (const pellet of food) {
      if (pellet.eaten) continue;
      const d = this.pos.distanceTo(pellet.pos);
      if (d < nearestDist) {
        nearestDist = d;
        this.target = pellet;
      }
    }
  }

  tryEat(pellet, radius = 1.0) {
    if (pellet.eaten) return false;
    const dist = this.pos.distanceTo(pellet.pos);
    if (dist < radius) {
      pellet.eaten = true;
      return true;
    }
    return false;
  }

  update(dt) {
    this.wobble += dt * 6;

    if (this.target && this.target.eaten) {
      this.target = null;
    }

    if (this.target) {
      const toTarget = this.target.pos.clone().sub(this.pos);
      const dist = toTarget.length();
      if (dist < 0.5) {
        this.target = null;
      } else {
        const desired = toTarget.normalize().multiplyScalar(this.speed * 1.6);
        this.vel.lerp(desired, Math.min(1, this.turnSpeed * dt));
      }
    } else {
      const wander = new THREE.Vector3(
        Math.sin(this.wobble * 0.5 + this.pos.y * 0.1),
        Math.sin(this.wobble * 0.7 + this.pos.x * 0.2) * 0.6,
        Math.cos(this.wobble * 0.4)
      );
      this.vel.lerp(wander.normalize().multiplyScalar(this.speed), Math.min(1, 0.5 * dt));
    }

    this.pos.add(this.vel.clone().multiplyScalar(dt));
    this.clampToBounds();
    this.mesh.position.copy(this.pos);

    const forward = this.vel.clone().setY(0).normalize();
    const angle = Math.atan2(forward.x, forward.z);
    this.mesh.rotation.y = angle;
    this.mesh.rotation.z = Math.sin(this.wobble) * 0.2;
    this.mesh.rotation.x = Math.sin(this.wobble * 0.5) * 0.15;

    const flip = forward.x >= 0 ? 1 : -1;
    this.mesh.scale.x = Math.abs(this.mesh.scale.x) * flip;
  }

  clampToBounds() {
    const { width, height, depth } = this.tank;
    const m = 0.6;
    this.pos.x = Math.max(-width / 2 + m, Math.min(width / 2 - m, this.pos.x));
    this.pos.y = Math.max(-height / 2 + m, Math.min(height / 2 - m, this.pos.y));
    this.pos.z = Math.max(-depth / 2 + m, Math.min(depth / 2 - m, this.pos.z));

    if (this.pos.x <= -width / 2 + m + 0.01 || this.pos.x >= width / 2 - m - 0.01) this.vel.x *= -1;
    if (this.pos.z <= -depth / 2 + m + 0.01 || this.pos.z >= depth / 2 - m - 0.01) this.vel.z *= -1;
    if (this.pos.y <= -height / 2 + m + 0.01 || this.pos.y >= height / 2 - m - 0.01) this.vel.y *= -1;
  }
}
