import * as THREE from 'three';

// Performance:
// - InstancedMesh preview (1 draw call)
// - No cloning scene graph
// - Auto height via bounding box (no hardcoded offset)
// - Cache bounding box to avoid recalculation
// - Scoped events + cleanup

export function setupPlacement(
  scene,
  camera,
  ground,
  raycasterSystem,
  domElement,
  gridSize = 1
) {
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const previewPos = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  let previewInstance = null;
  let previewSource = null;

  // 🔥 bounding box cache
  const bbox = new THREE.Box3();
  const size = new THREE.Vector3();

  let cachedHeight = 0;
  let lastSelected = null;

  const previewMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });

  // =========================
  // GRID SNAP
  // =========================
  function snap(pos) {
    pos.x = Math.round(pos.x / gridSize) * gridSize;
    pos.z = Math.round(pos.z / gridSize) * gridSize;
  }

  // =========================
  // CREATE PREVIEW
  // =========================
  function createPreview(original) {
    if (!original) return;

    let mesh = null;
    original.traverse(obj => {
      if (obj.isMesh && !mesh) mesh = obj;
    });

    if (!mesh) return;

    removePreview();

    previewInstance = new THREE.InstancedMesh(
      mesh.geometry,
      previewMaterial,
      1
    );

    previewInstance.castShadow = false;
    previewInstance.receiveShadow = false;

    previewSource = original;

    scene.add(previewInstance);
  }

  // =========================
  // REMOVE PREVIEW
  // =========================
  function removePreview() {
    if (!previewInstance) return;

    scene.remove(previewInstance);
    previewInstance = null;
    previewSource = null;
  }

  // =========================
  // UPDATE POSITION
  // =========================
  function updatePreviewPosition(pos) {
    if (!previewInstance) return;

    dummy.position.copy(pos);
    dummy.updateMatrix();

    previewInstance.setMatrixAt(0, dummy.matrix);
    previewInstance.instanceMatrix.needsUpdate = true;
  }

  // =========================
  // POINTER MOVE
  // =========================
  function onPointerMove(event) {
    if (!raycasterSystem.isPlacing()) {
      removePreview();
      return;
    }

    const selected = raycasterSystem.getSelected();
    if (!selected) {
      removePreview();
      return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObject(ground);
    if (!hits.length) {
      removePreview();
      return;
    }

    previewPos.copy(hits[0].point);

    snap(previewPos);

    // 🔥 chỉ tính bounding box khi đổi object
    if (selected !== lastSelected) {
      bbox.setFromObject(selected);
      bbox.getSize(size);

      cachedHeight = size.y;
      lastSelected = selected;
    }

    // 🔥 align đúng mặt đất (không cần offset cứng)
    previewPos.y = hits[0].point.y + cachedHeight / 2;

    if (!previewInstance || previewSource !== selected) {
      createPreview(selected);
    }

    updatePreviewPosition(previewPos);
  }

  // =========================
  // RIGHT CLICK → PLACE
  // =========================
  function onRightClick(event) {
    event.preventDefault();

    if (!raycasterSystem.isPlacing()) return;

    const selected = raycasterSystem.getSelected();
    if (!selected) {
      removePreview();
      return;
    }

    // 🔥 dùng đúng previewPos (không snap lại)
    selected.position.set(previewPos.x, previewPos.y - cachedHeight / 2, previewPos.z);
    //selected.position.copy(previewPos);

    removePreview();
    raycasterSystem.clearSelection?.();
  }

  // =========================
  // CLEAN CLICK
  // =========================
  function onPointerDown(event) {
    if (event.button !== 0) return;

    if (!raycasterSystem.isPlacing()) {
      removePreview();
    }
  }

  // =========================
  // ESC CANCEL
  // =========================
  function onKeyDown(event) {
    if (event.key === 'Escape') {
      removePreview();
    }
  }

  // =========================
  // BIND EVENTS
  // =========================
  domElement.addEventListener('pointermove', onPointerMove);
  domElement.addEventListener('contextmenu', onRightClick);
  domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);

  // =========================
  // CLEANUP
  // =========================
  function dispose() {
    domElement.removeEventListener('pointermove', onPointerMove);
    domElement.removeEventListener('contextmenu', onRightClick);
    domElement.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('keydown', onKeyDown);

    removePreview();
  }

  return { dispose };
}
