import GUI from 'lil-gui';
import * as THREE from 'three';

// Performance: bounding box is applied only to selected object
// to avoid full scene traversal.

export function setupGUI(scene, renderer, perf, raycasterSystem) {
  const gui = new GUI();

  const params = {
    wireframe: false,
    showBoundingBox: false
  };

  // =========================
  // SAFE GET SELECTED
  // =========================
  function getSelectedSafe() {
    return raycasterSystem &&
      typeof raycasterSystem.getSelected === 'function'
      ? raycasterSystem.getSelected()
      : null;
  }

  // =========================
  // WIREFRAME TOGGLE
  // =========================
  gui.add(params, 'wireframe').onChange(val => {
    scene.traverse(obj => {
      if (obj.isMesh && obj.material) {
        obj.material.wireframe = val;
      }
    });
  });

  // =========================
  // BOUNDING BOX (OPTIMIZED + SAFE)
  // =========================
  let boxHelper = null;

  gui.add(params, 'showBoundingBox').onChange(val => {
    // remove box cũ
    if (boxHelper) {
      scene.remove(boxHelper);
      boxHelper = null;
    }

    if (!val) return;

    const selected = getSelectedSafe();
    if (!selected) return;

    boxHelper = new THREE.BoxHelper(selected, 0xffff00);
    scene.add(boxHelper);
  });

  // =========================
  // PERFORMANCE STATS
  // =========================
  const stats = {
    fps: 0,
    ms: 0
  };

  gui.add(stats, 'fps').listen();
  gui.add(stats, 'ms').name('frameTime(ms)').listen();

  let acc = 0;
  let smoothFPS = 0;
  let smoothMS = 0;

  // =========================
  // UPDATE LOOP
  // =========================
  return {
    update(delta) {
      if (!delta) delta = 0.016;

      acc += delta;

      // smoothing EMA
      smoothFPS = smoothFPS * 0.9 + parseFloat(perf.getFPS()) * 0.1;
      smoothMS = smoothMS * 0.9 + parseFloat(perf.getMS()) * 0.1;

      // throttle update UI
      if (acc > 0.5) {
        stats.fps = smoothFPS.toFixed(1);
        stats.ms = smoothMS.toFixed(2);
        acc = 0;
      }

      // =========================
      // UPDATE BOUNDING BOX (SAFE)
      // =========================
      if (params.showBoundingBox) {
        const selected = getSelectedSafe();

        // nếu mất selection → remove box
        if (!selected && boxHelper) {
          scene.remove(boxHelper);
          boxHelper = null;
        }

        // nếu có selection nhưng chưa có box → tạo
        if (selected && !boxHelper) {
          boxHelper = new THREE.BoxHelper(selected, 0xffff00);
          scene.add(boxHelper);
        }

        // update vị trí box
        if (selected && boxHelper) {
          boxHelper.setFromObject(selected);
        }
      }
    }
  };
}
