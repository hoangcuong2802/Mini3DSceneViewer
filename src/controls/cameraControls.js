import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupCameraControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);

  // =========================
  // KEYBOARD CONTROL
  // =========================
  controls.enableKeys = true;

  controls.keys = {
    LEFT: 37,   // ArrowLeft
    UP: 38,     // ArrowUp
    RIGHT: 39,  // ArrowRight
    BOTTOM: 40  // ArrowDown
  };

  // tốc độ pan bằng keyboard
  controls.keyPanSpeed = 50;

  // =========================
  // SMOOTH MOVEMENT
  // =========================
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  return controls;
}
