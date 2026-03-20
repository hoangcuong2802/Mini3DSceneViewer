let currentPrefab = null;

export function setupObjectUI() {
  const panel = document.getElementById('object-ui');
  const buttons = panel.querySelectorAll('button');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentPrefab = btn.dataset.type;
      console.log("Selected prefab:", currentPrefab);
    });
  });

  function show() {
    panel.classList.remove('hidden');
  }

  function hide() {
    panel.classList.add('hidden');
  }

  function getSelected() {
    return currentPrefab;
  }

  return { show, hide, getSelected };
}