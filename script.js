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
const barWidthSlider = document.getElementById("barWidth");
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

// COLOR
function getColor(index, total) {
  if (colorSel.value === "rainbow") {
    const hueVal = (hue + (index / total) * 360) % 360;
    return `hsl(${hueVal},100%,60%)`;
  }
  return getComputedStyle(document.body).getPropertyValue("--accent");
}

function clearCanvas() {
  const bg = getComputedStyle(document.body).getPropertyValue("--bg").trim() || "#000";
  ctx.fillStyle = bg;
  ctx.globalAlpha = 0.24;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
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

function getAudioValueInRange(visualIndex, visualCount, frequencyRange) {
  const range = bassChk.checked ? 0.25 : frequencyRange;
  const usableBins = Math.max(1, Math.floor(bufferLength * range));
  const mapped = Math.floor((visualIndex / visualCount) * usableBins);
  return dataArray[Math.min(mapped, usableBins - 1)];
}

// DRAW LOOP
function animate() {
  requestAnimationFrame(animate);
  analyser.getByteFrequencyData(dataArray);
  hue = (hue + 1) % 360;

  clearCanvas();

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
  const slot = canvas.width / bars;
  const barWidth = Math.max(1, slot * Number(barWidthSlider.value));
  const offset = (slot - barWidth) / 2;

  for (let i = 0; i < bars; i++) {
    const v = getAudioValueInRange(i, bars, 0.17) * sensSlider.value;
    ctx.fillStyle = getColor(i, bars);
    ctx.fillRect(i * slot + offset, canvas.height - v, barWidth, v);
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
  const bars = 360;
  const slot = canvas.width / bars;
  const barWidth = Math.max(1, slot * Number(barWidthSlider.value));
  const offset = (slot - barWidth) / 2;
  const mid = canvas.height / 2;

  for (let i = 0; i < bars; i++) {
    const v = getAudioValueInRange(i, bars, 0.12) * sensSlider.value;
    ctx.fillStyle = getColor(i, bars);
    ctx.fillRect(i * slot + offset, mid - v / 2, barWidth, v);
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
  const total = cols * rows;
  const centerX = (cols - 1) / 2;
  const centerY = (rows - 1) / 2;
  const maxDist = Math.hypot(centerX, centerY);
  let idx = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dist = Math.hypot(x - centerX, y - centerY);
      const audioIndex = Math.floor((dist / maxDist) * (total - 1));
      const v = getAudioValue(audioIndex, total) * sensSlider.value;
      const radius = Math.min(Math.max(1.5, v / 28), Math.min(cw, ch) * 0.32);

      ctx.fillStyle = getColor(idx, total);
      ctx.beginPath();
      ctx.arc(x * cw + cw / 2, y * ch + ch / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      idx++;
    }
  }
}

function drawRing() {
  const bins = 256;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const baseRadius = Math.min(canvas.width, canvas.height) * 0.2;
  const ringEnergy = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
  const lowBins = bassChk.checked ? Math.floor(bufferLength * 0.25) : bufferLength;

  for (let i = 0; i < bins; i++) {
    const phase = (i / bins) * Math.PI * 2;
    const bandIndex = Math.floor((Math.sin(phase * 3 + hue * 0.035) * 0.5 + 0.5) * (lowBins - 1));
    const bandEnergy = dataArray[Math.max(0, Math.min(bandIndex, lowBins - 1))];
    const v = (ringEnergy * 0.45 + bandEnergy * 0.55) * sensSlider.value * 0.34;
    const a = (i / bins) * Math.PI * 2 - Math.PI / 2;
    const innerRadius = Math.max(10, baseRadius - v * 0.45);
    const outerRadius = baseRadius + v;

    ctx.strokeStyle = getColor(i, bins);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * innerRadius, cy + Math.sin(a) * innerRadius);
    ctx.lineTo(cx + Math.cos(a) * outerRadius, cy + Math.sin(a) * outerRadius);
    ctx.stroke();
  }
}
