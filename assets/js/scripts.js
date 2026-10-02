(() => {
  const menu = document.querySelector('.nav-menu');
  const button = document.querySelector('.menu-icon');
  const close = () => { menu.classList.remove('menu-active'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Open navigation'); };
  button.addEventListener('click', () => { const open = !menu.classList.contains('menu-active'); menu.classList.toggle('menu-active', open); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('click', event => { if (!event.target.closest('nav')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('menu-active')) { close(); button.focus(); } });
  document.querySelectorAll('.details-toggle').forEach(toggle => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    panel.hidden = true; toggle.setAttribute('aria-expanded', 'false');
    panel.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; img.decoding = 'async'; });
    toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
  });
})();
