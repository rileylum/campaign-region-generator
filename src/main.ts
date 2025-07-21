import './style.css';
import { createMap, loadAllDatasources } from './mapSetup';
import { DATASOURCES } from './types';
import { initializeControls } from './controls';
import { goToRandomPlace } from './navigation';
import { SeedManager } from './utils/seedManager';
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
    <div class="seed-controls">
      <label for="seed-input">Seed:</label>
      <input type="text" id="seed-input" placeholder="Enter seed (optional)">
      <span class="current-seed">Current: <span id="current-seed-display">-</span></span>
    </div>
  </div>
`;

// Initialize the application
async function initializeApp() {
  const map = createMap();
  await loadAllDatasources(map, DATASOURCES);
  initializeControls(map);

  // Add screenshot button handler
  document.getElementById('screenshot')?.addEventListener('click', () => {
    takeScreenshot(map);
  });

  // Navigate to random place on page load using server-side calculation
  // Initialize seed from URL or generate new one
  const initialSeed = SeedManager.initializeAppSeed();
  SeedManager.updateSeedDisplay(initialSeed);
  SeedManager.updateURLWithSeed(initialSeed);

  // Navigate to the coastal location
  await goToRandomPlace(map);
}

initializeApp();
