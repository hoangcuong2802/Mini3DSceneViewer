import * as THREE from 'three';

// Performance: 
//  - use emissive highlighting instead of cloning materials globally
//  - apply lazy material cloning only when needed
//  - avoid GPU memory overhead

export function setupRaycaster(camera, pickables, domElement) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let selected = null;
  let placementMode = false;

  // POINTER DOWN EVENT
  function onPointerDown(event) {
    if (event.button !== 0) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(pickables, true);

    // clear old selection
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

  // attach into canvas
  domElement.addEventListener('pointerdown', onPointerDown);

  function dispose() {
    domElement.removeEventListener('pointerdown', onPointerDown);
  }

  function getRootPrefab(obj) {
    while (obj.parent && !obj.userData.isPrefab) {
      obj = obj.parent;
    }
    return obj;
  }

  // HIGHLIGHT (LAZY CLONE)
  function highlight(obj) {
    obj.traverse(child => {
      if (!child.isMesh || !child.material) return;

      // LAZY CLONE MATERIAL (fix shared material)
      if (!child.userData._materialCloned) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(m => m.clone());
        } else {
          child.material = child.material.clone();
        }
        child.userData._materialCloned = true;
      }

      const mat = child.material;

      // store original emissive state
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

  // RESET HIGHLIGHT
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