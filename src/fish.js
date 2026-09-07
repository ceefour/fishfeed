import * as THREE from "three";

const PALETTE = [
  0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff9f1c, 0xc77dff, 0xf72585,
];

export class Fish {
  constructor(tank, random = Math.random, obstacles = []) {
    this.tank = tank;
    this.rng = random;
    this.obstacles = obstacles;
    this.color = PALETTE[Math.floor(random() * PALETTE.length)];

    this.speed = 1.2 + random() * 1.2;
    this.turnSpeed = 1.5 + random() * 1.5;

    this.mesh = this.buildMesh();

    this.pos = new THREE.Vector3(
      (random() * 2 - 1) * tank.width * 0.3,
      (random() * 2 - 1) * tank.height * 0.25,
      (random() * 2 - 1) * tank.depth * 0.3
    );
    this.mesh.position.copy(this.pos);

    const angle = random() * Math.PI * 2;
    this.heading = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();

    this.target = null;
    this.destination = null;
    this.destTimer = 0;
    this.wobble = random() * Math.PI * 2;
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

  desiredDirection(goal) {
    const desired = goal.clone().sub(this.pos);
    if (desired.lengthSq() === 0) desired.set(0, 1, 0);
    desired.normalize();
    for (const ob of this.obstacles) {
      const d = ob.position.distanceTo(this.pos);
      const influence = ob.radius + 2.5;
      if (d < influence && d > 0.001) {
        const away = this.pos.clone().sub(ob.position);
        away.y *= 0.3;
        away.normalize();
        const strength = Math.max(0, (influence - d) / influence) * 4;
        desired.add(away.multiplyScalar(strength));
      }
    }
    return desired.normalize();
  }

  steerToward(desired, dt) {
    const maxStep = this.turnSpeed * dt;
    const angle = this.heading.angleTo(desired);
    if (angle <= maxStep) {
      this.heading.copy(desired);
    } else {
      const axis = new THREE.Vector3().crossVectors(this.heading, desired);
      if (axis.lengthSq() < 1e-8) {
        const fallback = Math.abs(this.heading.y) > 0.99 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
        this.heading.applyAxisAngle(fallback, maxStep);
      } else {
        this.heading.applyAxisAngle(axis.normalize(), maxStep);
      }
    }
  }

  move(dt) {
    this.pos.add(this.heading.clone().multiplyScalar(this.speed * dt));
    this.clampToBounds();
  }

  syncMesh() {
    this.mesh.position.copy(this.pos);
    const angle = Math.atan2(-this.heading.z, this.heading.x);
    this.mesh.rotation.y = angle;
    this.mesh.rotation.z = Math.sin(this.wobble) * 0.2 - Math.asin(this.heading.y) * 0.6;
    this.mesh.rotation.x = Math.sin(this.wobble * 0.5) * 0.12;
  }

  pickDestination() {
    const { width, height, depth } = this.tank;
    for (let i = 0; i < 10; i++) {
      const x = (this.rng() * 2 - 1) * (width / 2 - 0.8);
      const y = -height / 2 + 1.2 + this.rng() * (height - 2.4);
      const z = (this.rng() * 2 - 1) * (depth / 2 - 0.8);
      const p = new THREE.Vector3(x, y, z);
      if (!this.insideObstacle(p)) {
        this.destination = p;
        return;
      }
    }
    this.destination = null;
  }

  insideObstacle(p, margin = 0.7) {
    for (const ob of this.obstacles) {
      if (ob.position.distanceTo(p) < ob.radius + margin) return true;
    }
    return false;
  }

  update(dt) {
    this.wobble += dt * 6;

    if (this.target) {
      if (this.target.eaten) {
        this.target = null;
      } else if (this.pos.distanceTo(this.target.pos) < 0.5) {
        this.target = null;
      } else {
        this.steerToward(this.desiredDirection(this.target.pos), dt);
        this.move(dt);
        this.syncMesh();
        return;
      }
    }

    if (!this.destination || this.destTimer <= 0 || this.pos.distanceTo(this.destination) < 0.8) {
      this.pickDestination();
      this.destTimer = 4 + this.rng() * 4;
    }
    this.destTimer -= dt;

    if (this.destination) {
      this.steerToward(this.desiredDirection(this.destination), dt);
    } else {
      this.steerToward(this.desiredDirection(new THREE.Vector3(0, 0.5, 0)), dt);
    }
    this.move(dt);
    this.syncMesh();
  }

  clampToBounds() {
    const { width, height, depth } = this.tank;
    const m = 0.6;
    let hit = false;
    if (this.pos.x < -width / 2 + m) {
      this.pos.x = -width / 2 + m;
      this.heading.x = Math.abs(this.heading.x);
      hit = true;
    }
    if (this.pos.x > width / 2 - m) {
      this.pos.x = width / 2 - m;
      this.heading.x = -Math.abs(this.heading.x);
      hit = true;
    }
    if (this.pos.y < -height / 2 + m) {
      this.pos.y = -height / 2 + m;
      this.heading.y = Math.abs(this.heading.y);
      hit = true;
    }
    if (this.pos.y > height / 2 - m) {
      this.pos.y = height / 2 - m;
      this.heading.y = -Math.abs(this.heading.y);
      hit = true;
    }
    if (this.pos.z < -depth / 2 + m) {
      this.pos.z = -depth / 2 + m;
      this.heading.z = Math.abs(this.heading.z);
      hit = true;
    }
    if (this.pos.z > depth / 2 - m) {
      this.pos.z = depth / 2 - m;
      this.heading.z = -Math.abs(this.heading.z);
      hit = true;
    }
    if (hit) this.heading.normalize();
  }
}