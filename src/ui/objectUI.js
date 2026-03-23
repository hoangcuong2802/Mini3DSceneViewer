export function setupObjectUI(spawnObject) {
  const panel = document.getElementById('object-ui');

  if (!panel) {
    console.warn('object-ui not found');
    return;
  }

  const buttons = panel.querySelectorAll('button');

  let activeBtn = null;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;

      const obj = spawnObject(type);

      if (obj) {
        console.log('Spawned:', type);
      }

      // UI highlight
      if (activeBtn) activeBtn.classList.remove('active');
      btn.classList.add('active');
      activeBtn = btn;
    });
  });
}