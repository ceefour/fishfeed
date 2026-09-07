import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Aquarium } from "./aquarium.js";
import { Fish } from "./fish.js";
import { Food } from "./food.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1520);
scene.fog = new THREE.Fog(0x0a1520, 20, 40);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(9, 6, 12);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("scene"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 1, 0);

const aquarium = new Aquarium(scene);

const fish = [];
for (let i = 0; i < 8; i++) {
  const f = new Fish(aquarium.tank, undefined, aquarium.obstacles);
  fish.push(f);
  scene.add(f.mesh);
}

const food = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let score = 0;
let running = true;

const scoreEl = document.getElementById("score");

function updateScore() {
  scoreEl.textContent = score;
}

let tapStart = null;

function dropFoodAt(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const { spawn, land } = aquarium.spawnPointForRay(raycaster.ray);
  spawnFood(spawn, land);
}

function spawnFood(position, landAt) {
  const f = new Food(position, undefined, aquarium.tank, landAt);
  food.push(f);
  scene.add(f.mesh);
}

function eatIfClose(f, pellet) {
  if (f.tryEat(pellet)) {
    score += 1;
    updateScore();
  }
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  fish.forEach((f) => {
    if (!f.target || f.target.eaten) {
      f.acquireTarget(food);
    }
    f.update(dt);
    food.forEach((pellet) => eatIfClose(f, pellet));
  });

  const floorY = -aquarium.tank.height / 2;
  for (let i = food.length - 1; i >= 0; i--) {
    const pellet = food[i];
    pellet.update(dt, floorY);
    if (pellet.eaten) {
      pellet.dispose(scene);
      food.splice(i, 1);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  tapStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
});

renderer.domElement.addEventListener("pointerup", (event) => {
  if (!tapStart || tapStart.id !== event.pointerId) return;
  const dx = event.clientX - tapStart.x;
  const dy = event.clientY - tapStart.y;
  if (Math.hypot(dx, dy) < 10 && running) {
    dropFoodAt(event);
  }
  tapStart = null;
});

renderer.domElement.addEventListener("pointercancel", () => {
  tapStart = null;
});

document.getElementById("feed").addEventListener("click", () => {
  if (!running) return;
  const { spawn, land } = aquarium.randomSpawnPoint();
  spawnFood(spawn, land);
});

document.getElementById("reset").addEventListener("click", () => {
  score = 0;
  updateScore();
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
