# Mic Audio Visualizer Ultimate

A fully interactive microphone-based audio visualizer built using pure HTML, CSS, and JavaScript.  
This project captures live audio input from the microphone and renders multiple real-time visualizations on a canvas using the Web Audio API.

No external libraries or frameworks are used.

---

## Features

- Live microphone audio input
- Multiple visualization modes:
  - Bars
  - Waveform
  - Circle
  - Mirror Bars
  - Radial Pulse
  - Spiral
  - Dot Field
  - Energy Ring
- Theme switching (Neon, Ocean, Fire, Dark)
- Solid and rainbow color modes
- Adjustable sensitivity
- Bass-only frequency mode
- Fullscreen support
- Responsive canvas rendering
- Desktop and mobile touch support

---

## Preview

Open `index.html` in a modern browser and allow microphone access to see the visualizer in action.

---

## Project Structure

mic-audio-visualizer/

-index.html
-README.md


---

---

## Getting Started

### Run Locally

1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. Click **Start** and allow microphone access
4. Select visualization mode, theme, and settings from the control panel

No server or build tools are required.

---

## Built With

- HTML5
- CSS3
- JavaScript (Vanilla)
- Web Audio API
- Canvas API

---

## Controls

- Start button initializes microphone capture
- Mode selector switches visualization type
- Theme selector changes UI colors
- Color mode toggles between solid and rainbow colors
- Sensitivity slider adjusts audio response strength
- Bass Only option limits visuals to low frequencies
- Fullscreen button toggles fullscreen canvas mode

---

## How It Works

- Audio is captured using `navigator.mediaDevices.getUserMedia`
- An `AnalyserNode` processes frequency and time-domain data
- Audio data is mapped dynamically to visual elements
- Canvas is continuously updated using `requestAnimationFrame`

Special care is taken to correctly map frequency bins to visual elements, ensuring consistent behavior across all visualizer modes.

---

## Customization

### Change Theme Colors
Themes are defined using CSS variables:
```css
.theme-neon { --bg:#050505; --fg:#00ff99; --accent:#00ffaa; }
```
Adjust Sensitivity

Modify the sensitivity multiplier in JavaScript:

```html getAudioValue(i, count) * sensSlider.value ```

##Add New Visualizers

Create a new draw function and add it to the switch statement in the animation loop.

---
##Mic Permission

Microphone access requires HTTPS or localhost in some browsers.

---

##Learning Purpose

###This project demonstrates:

-Real-time audio processing with Web Audio API
-Canvas-based rendering techniques
-Frequency and waveform visualization
-UI controls without external libraries
-Performance-friendly animation loops

---

##License

This project is open-source and free to use for educational and personal projects.
