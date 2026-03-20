import * as THREE from 'three';

export function setupLighting(scene) {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);

    scene.add(light);
    scene.add(ambient);
}