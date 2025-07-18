import './style.css';
import {
  createMap,
  loadCoastlineLayers,
  loadLandLayers,
  loadOceanLayers,
  getActiveCoastlineLayer,
} from './mapSetup';
import { initializeControls } from './controls';
import { goToRandomPlace } from './navigation';
import { takeScreenshot } from './screenshot';

// Set up the HTML structure
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Campaign Region</h1>
    <div id="map-container">
      <div id="map"></div>
      <canvas id="hex-overlay"></canvas>
    </div>
    <div class="controls">
      <label>Hex Size:</label>
      <button id="hex-decrease">-</button>
      <span id="hex-size-display" class="hex-size-display">Medium</span>
      <button id="hex-increase">+</button>
      <button id="btn" class="generate-button">Generate!</button>
      <button id="screenshot" class="screenshot-button">Screenshot</button>
    </div>
  </div>
`;

// Initialize the application
async function initializeApp() {
  const map = createMap();
  await loadCoastlineLayers(map);
  await loadLandLayers(map);
  await loadOceanLayers(map);
  initializeControls(map);

  // Add screenshot button handler
  document.getElementById('screenshot')?.addEventListener('click', () => {
    takeScreenshot();
  });

  // Navigate to random place on page load after coastlines are loaded
  const vectorLayer = getActiveCoastlineLayer(map);
  const vectorSource = vectorLayer?.getSource();
  if (vectorSource) {
    goToRandomPlace(map, vectorSource);
  }
}

initializeApp();
