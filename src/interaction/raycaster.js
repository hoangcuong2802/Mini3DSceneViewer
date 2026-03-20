import * as THREE from 'three';

// Performance: use emissive highlighting instead of cloning materials
// to avoid GPU memory overhead.

export function setupRaycaster(camera, pickables, domElement) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let selected = null;
  let placementMode = false;

  function onPointerDown(event) {
    if (event.button !== 0) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(pickables, true);

    if (selected) {
      resetHighlight(selected);
      selected = null;
      placementMode = false;
    }

    if (hits.length > 0) {
      selected = getRootPrefab(hits[0].object);
      highlight(selected);

      if (selected.userData.isPrefab) {
        placementMode = true;
      }
    }
  }

  // 👉 attach vào canvas
  domElement.addEventListener('pointerdown', onPointerDown);

  // =========================
  // CLEANUP
  // =========================
  function dispose() {
    domElement.removeEventListener('pointerdown', onPointerDown);
  }

  // =========================
  // (giữ nguyên helper functions)
  // =========================

  function getRootPrefab(obj) {
    while (obj.parent && !obj.userData.isPrefab) {
      obj = obj.parent;
    }
    return obj;
  }

  function highlight(obj) {
    obj.traverse(child => {
      if (!child.isMesh || !child.material) return;

      const mat = child.material;

      if (!child.userData._stored) {
        child.userData._stored = true;
        child.userData._emissive = mat.emissive?.clone?.() || null;
        child.userData._emissiveIntensity = mat.emissiveIntensity ?? 1;
      }

      if (mat.emissive) {
        mat.emissive.setHex(0x00ff00);
        mat.emissiveIntensity = 0.25;
      }
    });
  }

  function resetHighlight(obj) {
    obj.traverse(child => {
      if (!child.isMesh || !child.material) return;

      const mat = child.material;

      if (child.userData._stored) {
        if (mat.emissive && child.userData._emissive) {
          mat.emissive.copy(child.userData._emissive);
          mat.emissiveIntensity = child.userData._emissiveIntensity;
        }

        delete child.userData._stored;
        delete child.userData._emissive;
        delete child.userData._emissiveIntensity;
      }
    });
  }

  return {
    raycaster,
    isPlacing: () => placementMode,
    getSelected: () => selected,
    clearSelection: () => {
      if (selected) resetHighlight(selected);
      selected = null;
      placementMode = false;
    },
    dispose
  };
}

