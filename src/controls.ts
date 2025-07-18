import { Map } from 'ol';
import { HEX_SIZE_MAP } from './types';
import { drawHexGrid } from './hexGrid';
import { getActiveCoastlineLayer } from './mapSetup';
import { goToRandomPlace } from './navigation';

let currentHexStep = 3; // Start with "Medium"

export function initializeControls(map: Map) {
  // Initialize hex size display and draw initial grid
  updateHexSize();

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

function handleRandomLocationClick(map: Map) {
  const vectorLayer = getActiveCoastlineLayer(map);
  const vectorSource = vectorLayer?.getSource();
  if (vectorSource) {
    goToRandomPlace(map, vectorSource);
  }
}
