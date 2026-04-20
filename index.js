const scripts = [
  { text: "Evolution of Script",              label: "English" },
  { text: "التطور الكتابي المبكر",            label: "Arabic" },
  { text: "早期文字的演变",                    label: "Chinese" },
  { text: "初期文字の進化",                    label: "Japanese" },
  { text: "초기 문자의 진화",                  label: "Korean" },
  { text: "ప్రారంభ లిపి పరిణామం",            label: "Telugu" },
  { text: "ஆரம்பகால எழுத்தின் பரிணாமம்",     label: "Tamil" },
  { text: "ആദ്യകാല ലിപിയുടെ പരിണാമം",        label: "Malayalam" },
  { text: "ಆರಂಭಿಕ ಲಿಪಿಯ ವಿಕಾಸ",              label: "Kannada" },
];

const target = document.getElementById("typed-title");
const label  = document.getElementById("script-label");

let current   = 0;
let i         = 0;
let deleting  = false;
let timeoutId = null;

function restart() {
  clearTimeout(timeoutId);
  current  = 0;
  i        = 0;
  deleting = false;
  target.textContent = "";
  label.textContent  = scripts[0].label;
  tick();
}

document.querySelector("h1").addEventListener("click", restart);

function tick() {
  const { text } = scripts[current];

  if (!deleting) {
    i++;
    target.textContent = text.slice(0, i);
    if (i === text.length) {
      timeoutId = setTimeout(() => { deleting = true; tick(); }, 2200);
    } else {
      timeoutId = setTimeout(tick, 80);
    }
  } else {
    i--;
    target.textContent = text.slice(0, i);
    if (i === 0) {
      deleting = false;
      current  = (current + 1) % scripts.length;
      label.textContent = scripts[current].label;
      timeoutId = setTimeout(tick, 400);
    } else {
      timeoutId = setTimeout(tick, 40);
    }
  }
}

tick();

// ── Clay tablet canvas ─────────────────────────────────────────────────────

const clayCanvas      = document.getElementById('clay-tablet');
const ctx             = clayCanvas.getContext('2d');
const previewImg      = document.getElementById('stamp-preview');
const wedgeIndicator  = document.getElementById('wedge-indicator');

// Right-end of each red line in SVG coords (viewBox 1208×2010),
// scaled to display size: 460px tall → factor 0.2289
const wedgePositions = {
  short:  { left: 165, top: 138 },
  corner: { left: 155, top: 108 },
  long:   { left: 173, top: 175 },
};

function updateWedgeIndicator() {
  const pos = wedgePositions[selectedShape];
  wedgeIndicator.style.left = pos.left + 'px';
  wedgeIndicator.style.top  = pos.top  + 'px';
}

const shapeSrcs = {
  short:  'cuneiform-assets/short-cuneiform-glyph.png',
  long:   'cuneiform-assets/long-cuneiform-glyph.png',
  corner: 'cuneiform-assets/corner-wedge-cuneiform.png',
};

const shapeImgs = {};
Object.entries(shapeSrcs).forEach(([key, src]) => {
  const img = new Image();
  img.src = src;
  shapeImgs[key] = img;
});

let selectedShape    = 'corner';
let stampRotationDeg = 0;

function initCanvas() {
  clayCanvas.width  = clayCanvas.offsetWidth || 560;
  clayCanvas.height = 300;
  fillClay();
}

function fillClay() {
  ctx.fillStyle = '#B8895A';
  ctx.fillRect(0, 0, clayCanvas.width, clayCanvas.height);

  // Subtle surface texture
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * clayCanvas.width;
    const y = Math.random() * clayCanvas.height;
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '60,30,5' : '220,170,100'},${(Math.random() * 0.07).toFixed(3)})`;
    ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 2 + 1);
  }
}

function updatePreview() {
  previewImg.src = shapeSrcs[selectedShape];
  previewImg.style.transform = `rotate(${stampRotationDeg}deg)`;
}

function stamp(x, y) {
  const img = shapeImgs[selectedShape];
  if (!img.complete || img.naturalWidth === 0) return;

  const size = 48;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(stampRotationDeg * Math.PI / 180);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
}

// Shape selection
document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedShape = btn.dataset.shape;
    updatePreview();
    updateWedgeIndicator();
  });
});

// Rotation (45° steps)
document.getElementById('rotate-ccw').addEventListener('click', () => {
  stampRotationDeg = (stampRotationDeg - 45 + 360) % 360;
  updatePreview();
});
document.getElementById('rotate-cw').addEventListener('click', () => {
  stampRotationDeg = (stampRotationDeg + 45) % 360;
  updatePreview();
});

// Clear
document.getElementById('clear-tablet').addEventListener('click', fillClay);

// Click-to-stamp (with scale correction for CSS vs canvas pixels)
clayCanvas.addEventListener('click', e => {
  const rect   = clayCanvas.getBoundingClientRect();
  const scaleX = clayCanvas.width  / rect.width;
  const scaleY = clayCanvas.height / rect.height;
  stamp((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
});

window.addEventListener('load', () => { initCanvas(); updatePreview(); updateWedgeIndicator(); });
