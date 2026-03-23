import { setupScene } from './scene/setupScene.js';
import { createRenderer } from './scene/renderer.js';
import { setupLighting } from './scene/lighting.js';
import { setupCameraControls } from './controls/cameraControls.js';
import { setupRaycaster } from './interaction/raycaster.js';
import { setupPlacement } from './interaction/placement.js';
import { setupGUI } from './ui/gui.js';
import { setupPerformance } from './utils/performance.js';
import { setupObjectUI } from './ui/objectUI.js';
import { setupFrustumCulling } from './utils/frustumCulling.js';

function init() {
  const { scene, camera, pickables, ground, spawnObject } = setupScene();

  const renderer = createRenderer();
  setupLighting(scene);

  const controls = setupCameraControls(camera, renderer.domElement);

  const raycasterSystem = setupRaycaster(
    camera,
    pickables,
    renderer.domElement
  );

  setupPlacement(
    scene,
    camera,
    ground,
    raycasterSystem,
    renderer.domElement
  );

  setupObjectUI(spawnObject);

  const perf = setupPerformance();
  const gui = setupGUI(scene, renderer, perf, raycasterSystem);
  
  const frustumSystem = setupFrustumCulling(camera, scene);

  function animate() {
    requestAnimationFrame(animate);

    controls.update();
    perf.update();
    gui.update();
    frustumSystem.update(); 

    renderer.render(scene, camera);
  }

  animate();
}

window.addEventListener('DOMContentLoaded', init);