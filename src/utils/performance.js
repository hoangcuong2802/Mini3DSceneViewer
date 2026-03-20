export function setupPerformance() {
    let lastTime = performance.now();
    let fps = 0;
    let ms = 0;

    function update() {
        const now = performance.now();
        ms = now - lastTime;
        fps = 1000 / ms;
        lastTime = now;
    }

    return {
        update,
        getFPS: () => fps.toFixed(1),
        getMS: () => ms.toFixed(2)
    };
}
