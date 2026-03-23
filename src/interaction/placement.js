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
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const previewPos = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  let previewInstance = null;
  let previewSource = null;

  // bounding box cache
  const bbox = new THREE.Box3();
  const size = new THREE.Vector3();

  let cachedHeight = 0;
  let lastSelected = null;

  // GRID OCCUPANCY CHECK
  const occupied = new Map(); // key: "x_z"

  function getCellKey(pos) {
    return `${pos.x}_${pos.z}`;
  }

  function isOccupied(pos) {
    return occupied.has(getCellKey(pos));
  }

  function setOccupied(pos, obj) {
    occupied.set(getCellKey(pos), obj);
  }

  // PREVIEW MATERIAL
  const previewMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });

  // GRID SNAP
  function snap(pos) {
    pos.x = Math.round(pos.x / gridSize) * gridSize;
    pos.z = Math.round(pos.z / gridSize) * gridSize;
  }

  // CREATE AND REMOVE GHOST REVIEW
  function createPreview(original) {
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

    previewSource = original;

    scene.add(previewInstance);
  }

  function removePreview() {
    if (!previewInstance) return;

    scene.remove(previewInstance);
    
    //add dispose for optimise
    previewInstance.geometry.dispose();
    previewInstance.material.dispose();
    
    previewInstance = null;
    previewSource = null;
  }

  // UPDATE POSITION
  function updatePreviewPosition(pos, valid) {
    if (!previewInstance) return;

    // change preview color if blocked
    previewMaterial.color.set(valid ? 0x00ff00 : 0xff0000);

    dummy.position.copy(pos);
    dummy.updateMatrix();

    previewInstance.setMatrixAt(0, dummy.matrix);
    previewInstance.instanceMatrix.needsUpdate = true;
  }

  // POINTER MOVE
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

    const hit = raycaster.intersectObject(ground)[0];
    if (!hit) {
      removePreview();
      return;
    }

    previewPos.copy(hit.point);
    snap(previewPos);

    // HEIGHT CACHE
    if (selected !== lastSelected) {
      bbox.setFromObject(selected);
      bbox.getSize(size);
      cachedHeight = size.y;
      lastSelected = selected;
    }

    previewPos.y = hit.point.y + cachedHeight / 2;

    const valid = !isOccupied(previewPos);

    if (!previewInstance || previewSource !== selected) {
      createPreview(selected);
    }

    updatePreviewPosition(previewPos, valid);
  }

  // RIGHT CLICK TO PLACE
  function onRightClick(event) {
    event.preventDefault();

    if (!raycasterSystem.isPlacing()) return;

    const selected = raycasterSystem.getSelected();
    if (!selected) return;

    // block if object detected
    if (isOccupied(previewPos)) {
      console.log('Cell occupied!');
      return;
    }

    selected.position.set(
      previewPos.x,
      previewPos.y - cachedHeight / 2,
      previewPos.z
    );

    // mark occupied
    setOccupied(previewPos, selected);

    removePreview();
    raycasterSystem.clearSelection?.();
  }

  // BIND EVENTS AND DISPOSE
  domElement.addEventListener('pointermove', onPointerMove);
  domElement.addEventListener('contextmenu', onRightClick);

  return {
    dispose() {
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('contextmenu', onRightClick);
      removePreview();
    }
  };
}