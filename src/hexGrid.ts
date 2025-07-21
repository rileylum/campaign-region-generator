import { CANVAS_DIMENSIONS, MATH, HEX_GRID } from './constants';
import { DOMHelper, SELECTORS } from './utils/domUtils';
import { ErrorHandler, ErrorLevel } from './utils/errorHandler';

function drawHex(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));

  for (let side = 1; side <= 6; side++) {
    ctx.lineTo(
      x + radius * Math.cos(side * MATH.HEX_ANGLE),
      y + radius * Math.sin(side * MATH.HEX_ANGLE)
    );
  }
}

export function drawHexGrid(targetHexSize: number = HEX_GRID.DEFAULT_SIZE) {
  try {
    const ctx = DOMHelper.getCanvasContext(SELECTORS.HEX_OVERLAY);

    // Set fixed canvas dimensions
    DOMHelper.setCanvasDimensions(
      SELECTORS.HEX_OVERLAY,
      CANVAS_DIMENSIONS.WIDTH,
      CANVAS_DIMENSIONS.HEIGHT
    );
    ctx.clearRect(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT);

    const hexSize = targetHexSize;
    const hexHeight = MATH.SQRT_3 * hexSize;
    const horizDist = hexSize * 1.5;
    const vertDist = hexHeight;

    // Calculate grid dimensions
    const fullRowsThatFit = Math.floor(CANVAS_DIMENSIONS.HEIGHT / vertDist);
    const targetRows = fullRowsThatFit + 0.5;
    const actualHeightNeeded = targetRows * vertDist;

    const cols = Math.ceil(CANVAS_DIMENSIONS.WIDTH / horizDist) + 1;
    const rows = Math.ceil(targetRows) + 1;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    const excessHeight = CANVAS_DIMENSIONS.HEIGHT - actualHeightNeeded;
    const startY = excessHeight / 2 + vertDist / 2 - vertDist;

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * horizDist;
        const yOffset = (col % 2) * (vertDist / 2);
        const y = startY + row * vertDist + yOffset;

        // Bounds check
        const hexTop = y - (hexSize * MATH.SQRT_3) / 2;
        const hexBottom = y + (hexSize * MATH.SQRT_3) / 2;

        if (
          x >= -hexSize &&
          x <= CANVAS_DIMENSIONS.WIDTH + hexSize &&
          hexBottom >= 0 &&
          hexTop <= CANVAS_DIMENSIONS.HEIGHT
        ) {
          drawHex(ctx, x, y, hexSize);
        }
      }
    }

    ctx.stroke();
    ctx.restore();
  } catch (error) {
    ErrorHandler.logError(
      ErrorLevel.ERROR,
      'Failed to draw hex grid',
      { operation: 'hex_grid_draw', details: { targetHexSize } },
      error
    );
  }
}
