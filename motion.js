// Conservative graphics detection: unavailable or ambiguous results stay off.
// The renderer string is used only in memory and is never stored or transmitted.
export function detectHardwareAcceleration(createCanvas) {
  let context = null;
  try {
    const options = {
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'low-power',
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    };
    const canvas = createCanvas();
    canvas.width = 1;
    canvas.height = 1;
    context = canvas.getContext('webgl2', options) || canvas.getContext('webgl', options);
    if (!context || context.isContextLost()) return false;
    if (context.getContextAttributes()?.failIfMajorPerformanceCaveat !== true) return false;
    const debug = context.getExtension('WEBGL_debug_renderer_info');
    if (!debug) return false;
    const renderer = String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL) || '');
    if (/swiftshader|llvmpipe|softpipe|software|swrast|lavapipe|microsoft basic|warp\b|gdi generic|virtualbox|vmware|parallels/i.test(renderer)) return false;
    return /nvidia|geforce|quadro|radeon|\bamd\b|\bati\b|intel|apple|adreno|mali|powervr|videocore|vivante|tegra|xclipse/i.test(renderer);
  } catch {
    return false;
  } finally {
    // Release the tiny capability probe immediately; the page renders with CSS.
    try { context?.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
  }
}

export function automaticMotionState({ reducedMotion, hardwareAccelerated, pageVisible = true }) {
  return !reducedMotion && hardwareAccelerated === true && pageVisible ? 'active' : 'paused';
}

export function resolvedMotionState({ manualPreference = 'auto', reducedMotion, hardwareAccelerated, pageVisible = true }) {
  if (!pageVisible) return 'paused';
  if (manualPreference === 'on') return 'active';
  if (manualPreference === 'off') return 'paused';
  return automaticMotionState({ reducedMotion, hardwareAccelerated, pageVisible });
}

export function nextMotionPreference({ currentPreference = 'auto', currentState }) {
  return currentPreference === 'auto'
    ? currentState === 'active' ? 'off' : 'on'
    : 'auto';
}

export function initializeAutomaticMotion(doc, browser) {
  const root = doc.documentElement;
  const preference = browser.matchMedia('(prefers-reduced-motion: reduce)');
  const status = doc.querySelector('.motion-status');
  const label = status?.querySelector('.motion-label');
  const storageKey = 'whitewelpe-motion';
  let hardwareAccelerated = false;
  let revealObserver = null;
  let manualPreference = 'auto';

  try {
    const storedPreference = browser.localStorage?.getItem(storageKey);
    if (storedPreference === 'on' || storedPreference === 'off') manualPreference = storedPreference;
  } catch {}

  const savePreference = () => {
    try {
      if (manualPreference === 'auto') browser.localStorage?.removeItem(storageKey);
      else browser.localStorage?.setItem(storageKey, manualPreference);
    } catch {}
  };

  const update = (recheckGraphics = false) => {
    const visible = doc.visibilityState !== 'hidden';
    if (recheckGraphics && visible && manualPreference === 'auto' && !preference.matches) {
      hardwareAccelerated = detectHardwareAcceleration(() => doc.createElement('canvas'));
    }
    const state = resolvedMotionState({ manualPreference, reducedMotion: preference.matches, hardwareAccelerated, pageVisible: visible });
    root.dataset.motion = state;
    root.dataset.motionMode = manualPreference;
    const modeLabel = manualPreference === 'auto' ? 'automatisch' : 'manuell';
    if (label) label.textContent = `Animationen: ${modeLabel} ${state === 'active' ? 'an' : 'aus'}`;
    if (status) {
      status.dataset.state = state;
      status.dataset.mode = manualPreference;
      status.setAttribute('aria-pressed', String(state === 'active'));
      status.title = !visible
        ? 'Animationen sind pausiert, solange diese Seite im Hintergrund ist.'
        : manualPreference === 'on'
          ? 'Manuell an. Anklicken, um wieder die automatische Einstellung zu verwenden.'
          : manualPreference === 'off'
            ? 'Manuell aus. Anklicken, um wieder die automatische Einstellung zu verwenden.'
            : preference.matches
              ? 'Automatisch aus: reduzierte Bewegung ist eingestellt. Anklicken, um Animationen für diese Website einzuschalten.'
              : state === 'active'
                ? 'Automatisch an. Anklicken, um Animationen für diese Website auszuschalten.'
                : 'Automatisch aus: Hardwarebeschleunigung ist nicht sicher verfügbar. Anklicken, um Animationen für diese Website einzuschalten.';
      status.setAttribute('aria-label', status.title);
    }
    if (state === 'active' && !revealObserver && 'IntersectionObserver' in browser) {
      revealObserver = new browser.IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('has-entered');
          revealObserver.unobserve(entry.target);
        });
      }, {threshold: 0.12});
      doc.querySelectorAll('.work-card,.portfolio-card,.contact-banner,.about-strip-inner').forEach(element => revealObserver.observe(element));
    }
  };

  if (status) {
    status.setAttribute('role', 'button');
    status.tabIndex = 0;
    const toggle = () => {
      manualPreference = nextMotionPreference({ currentPreference: manualPreference, currentState: root.dataset.motion });
      savePreference();
      update(manualPreference === 'auto');
    };
    status.addEventListener('click', toggle);
    status.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggle();
    });
  }
  preference.addEventListener('change', () => update(true));
  doc.addEventListener('visibilitychange', () => update(true));
  browser.addEventListener('pageshow', () => update(true));
  update(true);
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initializeAutomaticMotion(document, window);
}

