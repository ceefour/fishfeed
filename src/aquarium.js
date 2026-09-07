import * as THREE from "three";

export class Aquarium {
  constructor(scene) {
    this.scene = scene;
    this.tank = { width: 12, height: 7, depth: 8 };

    this.buildLighting();
    this.buildTank();
    this.buildDecor();
  }

  buildLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(6, 12, 8);
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x88ccff, 0.4);
    fill.position.set(-6, 4, -8);
    this.scene.add(fill);
  }

  buildTank() {
    const { width, height, depth } = this.tank;

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshPhysicalMaterial({
        color: 0x9fd8ff,
        transparent: true,
        opacity: 0.16,
        roughness: 0.1,
        metalness: 0,
        side: THREE.BackSide,
      })
    );
    this.scene.add(glass);

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2c4a3a,
      roughness: 0.9,
    });
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -height / 2;
    this.scene.add(floor);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth)),
      new THREE.LineBasicMaterial({ color: 0x2a3b4a, transparent: true, opacity: 0.5 })
    );
    this.scene.add(edges);
  }

  buildDecor() {
    const { width, depth } = this.tank;

    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.7, 1),
      new THREE.MeshStandardMaterial({ color: 0x6a6f6a, roughness: 1, flatShading: true })
    );
    stone.position.set(-width / 2 + 1.6, -this.tank.height / 2 + 0.5, -depth / 2 + 1.2);
    stone.scale.set(1.4, 0.8, 1);
    this.scene.add(stone);

    const plant = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x2e7d4f })
    );
    stem.position.y = 0.8;
    plant.add(stem);
    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x3e9b62, flatShading: true })
      );
      leaf.position.set((i - 1) * 0.35, 1.5 + (i % 2) * 0.2, 0);
      leaf.scale.y = 0.7;
      plant.add(leaf);
    }
    plant.position.set(width / 2 - 1.8, -this.tank.height / 2, depth / 2 - 1.4);
    this.scene.add(plant);
  }

  inBounds(x, y, z, margin = 0.4) {
    const { width, height, depth } = this.tank;
    return (
      x > -width / 2 + margin &&
      x < width / 2 - margin &&
      y > -height / 2 + margin &&
      y < height / 2 - margin &&
      z > -depth / 2 + margin &&
      z < depth / 2 - margin
    );
  }

  clampToBounds(point, margin = 0.5) {
    const { width, height, depth } = this.tank;
    point.x = Math.max(-width / 2 + margin, Math.min(width / 2 - margin, point.x));
    point.y = Math.max(-height / 2 + margin, Math.min(height / 2 - margin, point.y));
    point.z = Math.max(-depth / 2 + margin, Math.min(depth / 2 - margin, point.z));
    return point;
  }
}
