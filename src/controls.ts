import { Map } from 'ol';
import { HEX_SIZE_MAP } from './config/hexSizes';
import { drawHexGrid } from './hexGrid';
import { goToRandomPlace } from './navigation';
import { HEX_GRID } from './constants';
import { DOMHelper, SELECTORS } from './utils/domUtils';
import { SeedManager } from './utils/seedManager';
import { ErrorHandler, ErrorLevel } from './utils/errorHandler';

let currentHexStep = HEX_GRID.DEFAULT_STEP; // Start with "Medium"

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
  SeedManager.initializeFromURL();
}

function updateHexSize() {
  try {
    const hexConfig = HEX_SIZE_MAP[currentHexStep as keyof typeof HEX_SIZE_MAP];

    DOMHelper.setText(SELECTORS.HEX_SIZE_DISPLAY, hexConfig.label);
    drawHexGrid(hexConfig.size);

    // Update button states
    DOMHelper.setButtonDisabled(
      SELECTORS.HEX_DECREASE,
      currentHexStep <= HEX_GRID.STEP_MIN
    );
    DOMHelper.setButtonDisabled(
      SELECTORS.HEX_INCREASE,
      currentHexStep >= HEX_GRID.STEP_MAX
    );
  } catch (error) {
    ErrorHandler.logError(
      ErrorLevel.ERROR,
      'Failed to update hex size display',
      { operation: 'hex_size_update', details: { currentHexStep } },
      error
    );
  }
}

function decreaseHexSize() {
  if (currentHexStep > HEX_GRID.STEP_MIN) {
    currentHexStep--;
    updateHexSize();
  }
}

function increaseHexSize() {
  if (currentHexStep < HEX_GRID.STEP_MAX) {
    currentHexStep++;
    updateHexSize();
  }
}

function handleSeedInput() {
  SeedManager.processSeedInput();
}

async function handleRandomLocationClick(map: Map) {
  try {
    // Setup seed and navigate
    SeedManager.setupSeedForNavigation();

    // Use server-side navigation
    await goToRandomPlace(map);
  } catch (error) {
    ErrorHandler.logError(
      ErrorLevel.ERROR,
      'Failed to handle random location click',
      { operation: 'random_location_click' },
      error
    );
  }
}
