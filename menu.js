const burger = document.querySelector('.burger');
const navigation = document.querySelector('.nav-links');
const year = document.querySelector('[data-current-year]');
if (year) year.textContent = new Date().getFullYear();
if (burger && navigation) {
  const closeMenu = (restoreFocus = false) => {
    const wasOpen = burger.getAttribute('aria-expanded') === 'true';
    navigation.classList.remove('nav-active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Navigation öffnen');
    if (restoreFocus && wasOpen) burger.focus();
  };
  burger.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('nav-active');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Navigation schließen' : 'Navigation öffnen');
  });
  navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!navigation.contains(e.target) && !burger.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
  window.matchMedia('(min-width: 981px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
}

// Direct page shortcuts; no search or filtering.
const quickDialog = document.querySelector('#quick-navigation');
const quickOpen = document.querySelector('.quick-open');
const quickClose = document.querySelector('.quick-close');
const quickLinks = [...document.querySelectorAll('.quick-results a')];
let previousFocus = null;

if (quickDialog && quickOpen && quickClose) {
  const openQuickNavigation = () => {
    if (quickDialog.open) return;
    previousFocus = document.activeElement;
    quickDialog.showModal();
    document.body.classList.add('dialog-open');
    quickLinks[0]?.focus();
  };
  quickOpen.addEventListener('click', openQuickNavigation);
  quickClose.addEventListener('click', () => quickDialog.close());
  quickDialog.addEventListener('click', event => {
    if (event.target !== quickDialog) return;
    const rect = quickDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) quickDialog.close();
  });
  quickDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (previousFocus?.isConnected) previousFocus.focus();
  });
  quickDialog.addEventListener('keydown', event => {
    const links = quickLinks;
    const index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && links.length) {
      event.preventDefault();
      links[(index + 1) % links.length].focus();
    } else if (event.key === 'ArrowUp' && links.length) {
      event.preventDefault();
      links[index <= 0 ? links.length - 1 : index - 1].focus();
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (quickDialog.open) quickDialog.close(); else openQuickNavigation();
    }
  });
}
