//  SETUP
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.onresize = resize;

const startBtn = document.getElementById("startBtn");
const modeSel = document.getElementById("mode");
const themeSel = document.getElementById("theme");
const colorSel = document.getElementById("colorMode");
const sensSlider = document.getElementById("sensitivity");
const bassChk = document.getElementById("bassOnly");
const fsBtn = document.getElementById("fsBtn");

themeSel.onchange = () => document.body.className = themeSel.value;

let audioCtx, analyser, dataArray, bufferLength;
let hue = 0;

// AUDIO START 
startBtn.onclick = async () => {
  startBtn.disabled = true;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
  const src = audioCtx.createMediaStreamSource(stream);

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;

  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  src.connect(analyser);
  animate();
};

fsBtn.onclick = () => {
  document.fullscreenElement ? document.exitFullscreen() : canvas.requestFullscreen();
};

COLOR 
function getColor(index, total) {
  if (colorSel.value === "rainbow") {
    const hueVal = (hue + (index / total) * 360) % 360;
    return `hsl(${hueVal},100%,60%)`;
  }
  return getComputedStyle(document.body).getPropertyValue("--accent");
}

//  CORE FIX: AUDIO MAPPING
function getAudioValue(visualIndex, visualCount) {
  if (!bassChk.checked) {
    const mapped = Math.floor((visualIndex / visualCount) * bufferLength);
    return dataArray[Math.min(mapped, bufferLength - 1)];
  }

  const bassRange = Math.floor(bufferLength * 0.25);
  const mapped = Math.floor((visualIndex / visualCount) * bassRange);
  return dataArray[Math.min(mapped, bassRange - 1)];
}

// DRAW LOOP
function animate() {
  requestAnimationFrame(animate);
  analyser.getByteFrequencyData(dataArray);
  hue = (hue + 1) % 360;

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  switch (modeSel.value) {
    case "bars": drawBars(); break;
    case "wave": drawWave(); break;
    case "circle": drawCircle(); break;
    case "mirror": drawMirror(); break;
    case "pulse": drawPulse(); break;
    case "spiral": drawSpiral(); break;
    case "dots": drawDots(); break;
    case "ring": drawRing(); break;
  }
}

//  VISUALIZERS

function drawBars() {
  const bars = 228;
  const w = canvas.width / bars * 6;
  for (let i = 0; i < bars; i++) {
    const v = getAudioValue(i, bars) * sensSlider.value;
    ctx.fillStyle = getColor(i, bars);
    ctx.fillRect(i * w, canvas.height - v, w - 1, v);
  }
}

function drawWave() {
  analyser.getByteTimeDomainData(dataArray);
  ctx.strokeStyle = getColor(0, 1);
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const x = (i / bufferLength) * canvas.width;
    const y = (dataArray[i] / 255) * canvas.height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawCircle() {
  const bins = 251;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const base = Math.min(canvas.width, canvas.height) * 0.15;
  
  ctx.beginPath();
  for (let i = 0; i < bins; i++) {
    const v = getAudioValue(i, bins) * sensSlider.value * 0.8;
    const a = (i / bins) * Math.PI * 2;
    const r = base + v;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = getColor(0, 1);
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawMirror() {
  const bars = 1524;
  const w = canvas.width / bars * 10;
  const mid = canvas.height / 2;
  for (let i = 0; i < bars; i++) {
    const v = getAudioValue(i, bars) * sensSlider.value;
    ctx.fillStyle = getColor(i, bars);
    ctx.fillRect(i * w, mid - v / 2, w - 1, v);
  }
}

function drawPulse() {
  const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
  const radius = 80 + avg * sensSlider.value;
  ctx.strokeStyle = getColor(0, 1);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSpiral() {
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const samples = 256;
  ctx.strokeStyle = getColor(0, 1);
  ctx.beginPath();
  for (let i = 0; i < samples; i++) {
    const v = getAudioValue(i, samples) * sensSlider.value * 0.5;
    const a = i * 0.25;
    const r = 40 + v;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawDots() {
  const cols = 40, rows = 22;
  const cw = canvas.width / cols, ch = canvas.height / rows;
  let idx = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = getAudioValue(idx, cols * rows) * sensSlider.value;
      ctx.fillStyle = getColor(idx, cols * rows);
      ctx.beginPath();
      ctx.arc(x * cw + cw / 2, y * ch + ch / 2, Math.max(2, v / 12), 0, Math.PI * 2);
      ctx.fill();
      idx++;
    }
  }
}

function drawRing() {
  const bins = 256;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const baseRadius = Math.min(canvas.width, canvas.height) * 0.2;
  
  ctx.strokeStyle = getColor(0, 1);
  for (let i = 0; i < bins; i++) {
    const v = getAudioValue(i, bins) * sensSlider.value * 0.6;
    const a = (i / bins) * Math.PI * 2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * baseRadius, cy + Math.sin(a) * baseRadius);
    ctx.lineTo(cx + Math.cos(a) * (baseRadius + v), cy + Math.sin(a) * (baseRadius + v));
    ctx.stroke();
  }
}
