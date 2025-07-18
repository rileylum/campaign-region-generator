import { Map } from 'ol';
import { HEX_SIZE_MAP } from './types';
import { drawHexGrid } from './hexGrid';
import { getActiveCoastlineLayer } from './mapSetup';
import {
  goToRandomPlace,
  setSeed,
  generateRandomSeed,
  getSeedFromURL,
  updateURLWithSeed,
} from './navigation';

let currentHexStep = 3; // Start with "Medium"

export function initializeControls(map: Map) {
  // Initialize hex size display and draw initial grid
  updateHexSize();

  // Initialize seed from URL if present
  initializeSeedFromURL();

  // Set up event listeners
  document
    .querySelector<HTMLButtonElement>('#btn')!
    .addEventListener('click', () => handleRandomLocationClick(map));

  document
    .querySelector<HTMLButtonElement>('#hex-decrease')!
    .addEventListener('click', decreaseHexSize);

  document
    .querySelector<HTMLButtonElement>('#hex-increase')!
    .addEventListener('click', increaseHexSize);

  // Set up seed input listener
  const seedInput = document.querySelector<HTMLInputElement>('#seed-input')!;
  seedInput.addEventListener('input', handleSeedInput);
  seedInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      handleRandomLocationClick(map);
    }
  });
}

function initializeSeedFromURL() {
  const urlSeed = getSeedFromURL();
  if (urlSeed !== null) {
    const seedInput = document.querySelector<HTMLInputElement>('#seed-input')!;
    seedInput.value = urlSeed.toString();
    setSeed(urlSeed);
    updateSeedDisplay(urlSeed);
  }
}

function updateHexSize() {
  const display = document.querySelector<HTMLSpanElement>('#hex-size-display')!;
  const hexConfig = HEX_SIZE_MAP[currentHexStep as keyof typeof HEX_SIZE_MAP];

  display.textContent = hexConfig.label;
  drawHexGrid(hexConfig.size);

  // Update button states
  const decreaseBtn =
    document.querySelector<HTMLButtonElement>('#hex-decrease')!;
  const increaseBtn =
    document.querySelector<HTMLButtonElement>('#hex-increase')!;

  decreaseBtn.disabled = currentHexStep <= 1;
  increaseBtn.disabled = currentHexStep >= 5;
}

function decreaseHexSize() {
  if (currentHexStep > 1) {
    currentHexStep--;
    updateHexSize();
  }
}

function increaseHexSize() {
  if (currentHexStep < 5) {
    currentHexStep++;
    updateHexSize();
  }
}

function handleSeedInput() {
  const seedInput = document.querySelector<HTMLInputElement>('#seed-input')!;
  const inputValue = seedInput.value.trim();

  if (inputValue === '') {
    setSeed(null);
    updateURLWithSeed(null);
  } else {
    const seedNumber = parseInt(inputValue, 10);
    if (!isNaN(seedNumber)) {
      setSeed(seedNumber);
      updateURLWithSeed(seedNumber);
    }
  }
}

function updateSeedDisplay(seed: number) {
  const display = document.querySelector<HTMLSpanElement>(
    '#current-seed-display'
  )!;
  display.textContent = seed.toString();
}

function handleRandomLocationClick(map: Map) {
  // Get seed from input or generate a new one
  const seedInput = document.querySelector<HTMLInputElement>('#seed-input')!;
  const inputValue = seedInput.value.trim();

  let seed: number;
  if (inputValue === '') {
    // Generate new random seed
    seed = generateRandomSeed();
  } else {
    seed = parseInt(inputValue, 10);
    if (isNaN(seed)) {
      // If invalid input, generate new seed
      seed = generateRandomSeed();
    }
    // Clear the input after using the seed
    seedInput.value = '';
  }

  setSeed(seed);
  updateSeedDisplay(seed);
  updateURLWithSeed(seed);

  const vectorLayer = getActiveCoastlineLayer(map);
  const vectorSource = vectorLayer?.getSource();
  if (vectorSource) {
    goToRandomPlace(map, vectorSource);
  }
}
