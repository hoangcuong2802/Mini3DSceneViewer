import * as THREE from 'three';

export function setupFrustumCulling(camera, scene) {
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();

  function update() {
    camera.updateMatrixWorld();

    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );

    frustum.setFromProjectionMatrix(projScreenMatrix);

    scene.traverse(obj => {
      if (!obj.isMesh) return;

      if (!obj.geometry.boundingSphere) {
        obj.geometry.computeBoundingSphere();
      }

      const visible = frustum.intersectsObject(obj);

      obj.visible = visible;
    });
  }

  return { update };
}