// ── Cross-fades ──────────────────────────────────────────────────────────────

const titleBanner = document.getElementById('title-banner');
const intro       = document.getElementById('introduction');
const phaseOne    = document.getElementById('phase-one');
const phaseTwo    = document.getElementById('phase-two');
const phaseThree         = document.getElementById('phase-three');
const writingInCuneiform = document.getElementById('writing-in-cuneiform');
const sectionTag    = document.getElementById('section-tag');
const sectionTagTwo   = document.getElementById('section-tag-two');
const sectionTagThree = document.getElementById('section-tag-three');

function clamp(val) { return Math.max(0, Math.min(1, val)); }

let p3Start = 9999;
let p4Start = 9999;
let p5Start = 9999;
const phaseOneInner   = phaseOne.querySelector('.phase-one-inner');
const phaseThreeInner = phaseThree.querySelector('.phase-three-inner');

function updateLayout() {
  const innerH = phaseOneInner.offsetHeight;
  if (innerH === 0) return;
  const scrollRangeOne   = Math.max(0, innerH - window.innerHeight);
  const scrollRangeThree = Math.max(0, phaseThreeInner.offsetHeight - window.innerHeight);
  p3Start = 950 + scrollRangeOne;
  p4Start = p3Start + 500;
  p5Start = p4Start + 250 + scrollRangeThree + 500;
  document.getElementById('crossfade-wrapper').style.minHeight =
    `${p5Start + 250 + window.innerHeight}px`;
}

new ResizeObserver(updateLayout).observe(phaseOneInner);
new ResizeObserver(updateLayout).observe(phaseThreeInner);
updateLayout();

function updateCrossfade() {
  const scrollY = window.scrollY;

  // Title-banner → Introduction
  const p1 = clamp((scrollY - 150) / 250);
  titleBanner.style.opacity = 1 - p1;
  intro.style.opacity       = p1 * (1 - clamp((scrollY - 700) / 250));
  intro.style.clipPath      = `inset(${(1 - p1) * 6}%)`;

  // Introduction → Phase-one
  const p2 = clamp((scrollY - 700) / 250);
  const p3 = clamp((scrollY - p3Start) / 250);
  phaseOne.style.opacity  = p2 * (1 - p3);
  phaseOne.style.clipPath = `inset(${(1 - p2) * 6}%)`;

  // Scroll phase-one's content upward as user scrolls through it
  const scrollRange = Math.max(0, phaseOneInner.offsetHeight - window.innerHeight);
  const scrollThrough = scrollRange > 0 ? clamp((scrollY - 950) / scrollRange) : 0;
  phaseOneInner.style.transform = `translateY(${-scrollThrough * scrollRange}px)`;

  // Phase-one → Phase-two
  const p4 = clamp((scrollY - p4Start) / 250);
  phaseTwo.style.opacity  = p3 * (1 - p4);
  phaseTwo.style.clipPath = `inset(${(1 - p3) * 6}%)`;

  // Phase-two → Phase-three
  const p5 = clamp((scrollY - p5Start) / 250);
  phaseThree.style.opacity  = p4 * (1 - p5);
  phaseThree.style.clipPath = `inset(${(1 - p4) * 6}%)`;

  // Phase-three → Writing in Cuneiform
  writingInCuneiform.style.opacity  = p5;
  writingInCuneiform.style.clipPath = `inset(${(1 - p5) * 6}%)`;

  // Scroll phase-three's content upward as user scrolls through it
  const scrollRangeThree = Math.max(0, phaseThreeInner.offsetHeight - window.innerHeight);
  const scrollThroughThree = scrollRangeThree > 0 ? clamp((scrollY - (p4Start + 250)) / scrollRangeThree) : 0;
  phaseThreeInner.style.transform = `translateY(${-scrollThroughThree * scrollRangeThree}px)`;

  // Section tag: visible while phase-one is on screen and faded in
  const rect = phaseOne.getBoundingClientRect();
  const phaseOneOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;
  sectionTag.classList.toggle('visible', p2 >= 1 && p3 < 1 && phaseOneOnScreen);

  // Section tag two: visible while phase-two is on screen
  sectionTagTwo.classList.toggle('visible', p3 >= 1 && p4 < 1);

  // Section tag three: visible while phase-three is on screen
  sectionTagThree.classList.toggle('visible', p4 >= 1 && p5 < 1);
}

window.addEventListener('scroll', updateCrossfade, { passive: true });

// ── Cuneiform Interactive ─────────────────────────────────────────────────────

(function () {
  const canvas         = document.getElementById('clay-tablet');
  const ctx            = canvas.getContext('2d');
  const stampPreview   = document.getElementById('stamp-preview');
  const rotateCCW      = document.getElementById('rotate-ccw');
  const rotateCW       = document.getElementById('rotate-cw');
  const clearBtn       = document.getElementById('clear-tablet');
  const shapeButtons   = document.querySelectorAll('.shape-btn');
  const SHAPES = {
    corner: 'cuneiform-assets/corner-wedge-cuneiform.png',
    short:  'cuneiform-assets/short-cuneiform-glyph.png',
    long:   'cuneiform-assets/long-cuneiform-glyph.png',
  };

  const STAMP_SIZE = {
    corner: { w: 34, h: 46 },
    short:  { w: 31, h: 43 },
    long:   { w: 46, h: 46 },
  };

  let currentShape = 'corner';
  let rotation     = 0;
  let isDrawing    = false;
  let lastPos      = null;
  const MIN_DIST   = 16;

  const imgs = {};
  Object.entries(SHAPES).forEach(([k, src]) => {
    imgs[k] = new Image();
    imgs[k].onload = updateCursor;
    imgs[k].src = src;
  });

  function updateCursor() {
    const img = imgs[currentShape];
    if (!img.complete || !img.naturalWidth) return;
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const cx = c.getContext('2d');
    cx.translate(size / 2, size / 2);
    cx.rotate(rotation * Math.PI / 180);
    const { w, h } = STAMP_SIZE[currentShape];
    cx.drawImage(img, -w / 2, -h / 2, w, h);
    canvas.style.cursor = `url(${c.toDataURL()}) ${size / 2} ${size / 2}, none`;
  }

  function initCanvas() {
    canvas.width  = 600;
    canvas.height = 580;
    drawBackground();
  }

  function drawBackground() {
    ctx.fillStyle = '#C8A46A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - rect.left) * (canvas.width  / rect.width),
      y: (cy - rect.top)  * (canvas.height / rect.height),
    };
  }

  function stamp(x, y) {
    const img = imgs[currentShape];
    if (!img.complete || !img.naturalWidth) return;
    const { w, h } = STAMP_SIZE[currentShape];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function tryStamp(pos) {
    if (lastPos) {
      const d = Math.hypot(pos.x - lastPos.x, pos.y - lastPos.y);
      if (d < MIN_DIST) return;
    }
    stamp(pos.x, pos.y);
    lastPos = pos;
  }

  canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    lastPos = null;
    const pos = canvasPos(e);
    stamp(pos.x, pos.y);
    lastPos = pos;
  });
  canvas.addEventListener('mousemove',  e => { if (isDrawing) tryStamp(canvasPos(e)); });
  canvas.addEventListener('mouseup',    () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });

  shapeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentShape = btn.dataset.shape;
      stampPreview.src = SHAPES[currentShape];
      stampPreview.style.transform = `rotate(${rotation}deg)`;
      updateCursor();
    });
  });

  rotateCCW.addEventListener('click', () => {
    rotation = (rotation - 45 + 360) % 360;
    stampPreview.style.transform = `rotate(${rotation}deg)`;
    updateCursor();
  });

  rotateCW.addEventListener('click', () => {
    rotation = (rotation + 45) % 360;
    stampPreview.style.transform = `rotate(${rotation}deg)`;
    updateCursor();
  });

  clearBtn.addEventListener('click', drawBackground);

  new ResizeObserver(() => {
    const h = Math.round(canvas.getBoundingClientRect().height);
    if (h > 0 && h !== canvas.height) {
      canvas.height = h;
      drawBackground();
    }
  }).observe(canvas);

  initCanvas();
  updateCursor();
})();

// ── Carousel ──────────────────────────────────────────────────────────────────

(function () {
  const slides  = document.querySelectorAll('.carousel-slide');
  const dots    = document.querySelectorAll('.carousel-dot');
  const btnPrev = document.querySelector('.carousel-prev');
  const btnNext = document.querySelector('.carousel-next');
  let current = 0;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
})();
