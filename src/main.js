import { setupScene } from './scene/setupScene.js';
import { createRenderer } from './scene/renderer.js';
import { setupLighting } from './scene/lighting.js';
import { setupCameraControls } from './controls/cameraControls.js';
import { setupRaycaster } from './interaction/raycaster.js';
import { setupPlacement } from './interaction/placement.js';
import { setupGUI } from './ui/gui.js';
import { setupPerformance } from './utils/performance.js';

async function init() {
  const { scene, camera, pickables, ground } = setupScene();

  const renderer = createRenderer();
  setupLighting(scene);

  const controls = setupCameraControls(camera, renderer.domElement);
  document.body.appendChild(renderer.domElement);

  // 🔥 pass domElement vào system
  const raycasterSystem = setupRaycaster(
    camera,
    pickables,
    renderer.domElement
  );

  const placement = setupPlacement(
    scene,
    camera,
    ground,
    raycasterSystem,
    renderer.domElement
  );

  const perf = setupPerformance();
  const gui = setupGUI(scene, renderer, perf, raycasterSystem);

  // =========================
  // RESIZE (OPTIONAL: debounce nếu muốn)
  // =========================
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // =========================
  // LOOP
  // =========================
  function animate() {
    requestAnimationFrame(animate);

    controls.update();
    perf.update();
    gui.update();

    renderer.render(scene, camera);
  }

  animate();

  // =========================
  // CLEANUP (PRO LEVEL)
  // =========================
  window.addEventListener('beforeunload', () => {
    raycasterSystem.dispose?.();
    placement.dispose?.();
  });
}

init();
