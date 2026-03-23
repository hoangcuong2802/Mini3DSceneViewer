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

  // GROUND (OPTIMIZED TEXTURE)
  const textureLoader = new THREE.TextureLoader();

  // one single texture (cache in Three.js)
  const groundTexture = textureLoader.load(
    './assets/ground-texture.jpg',
    () => console.log('Ground texture loaded'),
    undefined,
    (err) => console.error('Texture error:', err)
  );

  // display optmise
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(10, 10);

  // correct color 
  groundTexture.colorSpace = THREE.SRGBColorSpace;

  // texture quality
  groundTexture.anisotropy = 4;

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    groundMaterial
  );

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  scene.add(ground);

  // grid helper (debug + visual)
  scene.add(new THREE.GridHelper(50, 50));

  // PREFABS
  const loader = new GLTFLoader();
  const prefabs = {};

  function loadPrefab(name, path) {
    loader.load(
      path,
      (gltf) => {
        const root = gltf.scene;

        root.traverse(obj => {
          if (obj.isMesh) {
            obj.userData.isPrefab = true;

            //  precompute bounding for performance (raycast + culling)
            if (!obj.geometry.boundingSphere) {
              obj.geometry.computeBoundingSphere();
            }
          }
        });

        prefabs[name] = root;
        console.log('Loaded prefab:', name);
      },
      undefined,
      (err) => console.error('Load error:', err)
    );
  }

  loadPrefab('block', './assets/block_rock.glb');
  loadPrefab('stair', './assets/stone_stairs.glb');
  loadPrefab('rock', './assets/block_sand_rock.glb');

  // SPAWN OBJECT
  function spawnObject(type) {
    const original = prefabs[type];
    if (!original) {
      console.warn('Prefab not ready:', type);
      return null;
    }

    const instance = original.clone(true);

    instance.position.set(0, 1, 0);

    instance.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true; //obj cast shadow
        obj.receiveShadow = true;  //optional
        obj.userData.isPrefab = true;

        // REMOVE material clone (IMPORTANT for performance)
        // highlight material
        // if (Array.isArray(obj.material)) {
        //   obj.material = obj.material.map(m => m.clone());
        // } else {
        //   obj.material = obj.material.clone();
        // }

        // ensure bounding (safe fallback)
        if (!obj.geometry.boundingSphere) {
          obj.geometry.computeBoundingSphere();
        }

        pickables.push(obj);
      }
    });

    scene.add(instance);

    return instance;
  }

  return { scene, camera, pickables, ground, spawnObject };
}