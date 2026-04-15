const scripts = [
  { text: "Evolution of Script",              label: "English" },
  { text: "Εξέλιξη Αρχαίας Γραφής",          label: "Ancient Greek" },
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

let current  = 0;
let i        = 0;
let deleting = false;

function tick() {
  const { text } = scripts[current];

  if (!deleting) {
    i++;
    target.textContent = text.slice(0, i);
    if (i === text.length) {
      setTimeout(() => { deleting = true; tick(); }, 2200);
    } else {
      setTimeout(tick, 80);
    }
  } else {
    i--;
    target.textContent = text.slice(0, i);
    if (i === 0) {
      deleting = false;
      current  = (current + 1) % scripts.length;
      label.textContent = scripts[current].label;
      setTimeout(tick, 400);
    } else {
      setTimeout(tick, 40);
    }
  }
}

tick();
