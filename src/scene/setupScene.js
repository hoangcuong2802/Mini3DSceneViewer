import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(10, 10, 10);

  const pickables = [];

  // 👉 prefab reference (KHÔNG đổi tên object)
  let prefab = null;

  // =========================
  // GROUND (GRID)
  // =========================
  const size = 50;
  const divisions = 50;
  const textureLoader = new THREE.TextureLoader();
  const groundTexture = textureLoader.load('./assets/ground-texture-soil.jpg'); // texture đất

  const groundGeo = new THREE.PlaneGeometry(size, size);
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTexture,
    side: THREE.DoubleSide,
  });

  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0,0,0)
  ground.receiveShadow = true;

  scene.add(ground);

  const grid = new THREE.GridHelper(size, divisions);
  scene.add(grid);

  // =========================
  // LOAD MODEL
  // =========================
  const loader = new GLTFLoader();

  loader.load('./assets/block_rock.glb', (gltf) => {
    prefab = gltf.scene; // 👉 giữ nguyên object

    prefab.position.set(0, 1, 0);
    prefab.scale.set(1,1,1);
    prefab.traverse(obj => {
      if (obj.isMesh) {
        obj.userData.isPrefab = true; // tag để detect
        pickables.push(obj);
      }
    });

    scene.add(prefab);
  });

  // 👉 getter để dùng bên ngoài (placement clone)
  function getPrefab() {
    return prefab;
  }

  return {
    scene,
    camera,
    pickables,
    ground,
    getPrefab
  };
}