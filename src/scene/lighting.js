import * as THREE from 'three';

export function setupLighting(scene) {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    // enable shadow
    light.castShadow = true;

    // optimize shadow camera
    light.shadow.mapSize.set(1024, 1024); // có thể tăng 2048 nếu cần
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 50;

    // shadow region
    light.shadow.camera.left = -20;
    light.shadow.camera.right = 20;
    light.shadow.camera.top = 20;
    light.shadow.camera.bottom = -20;

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(light);
    scene.add(ambient);
}