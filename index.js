// ── Cross-fades ──────────────────────────────────────────────────────────────

const titleBanner = document.getElementById('title-banner');
const intro       = document.getElementById('introduction');
const phaseOne    = document.getElementById('phase-one');
const sectionTag  = document.getElementById('section-tag');

function clamp(val) { return Math.max(0, Math.min(1, val)); }

function updateCrossfade() {
  const scrollY = window.scrollY;

  // Title-banner → Introduction
  const p1 = clamp((scrollY - 150) / 250);
  titleBanner.style.opacity = 1 - p1;
  intro.style.opacity       = p1 * (1 - clamp((scrollY - 700) / 250));
  intro.style.clipPath      = `inset(${(1 - p1) * 6}%)`;

  // Introduction → Phase-one
  const p2 = clamp((scrollY - 700) / 250);
  phaseOne.style.opacity  = p2;
  phaseOne.style.clipPath = `inset(${(1 - p2) * 6}%)`;

  // Section tag: visible while phase-one is on screen and faded in
  const rect = phaseOne.getBoundingClientRect();
  const phaseOneOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;
  sectionTag.classList.toggle('visible', p2 >= 1 && phaseOneOnScreen);
}

window.addEventListener('scroll', updateCrossfade, { passive: true });
