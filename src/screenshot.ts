import { Map } from 'ol';
import { CANVAS_DIMENSIONS } from './constants';
import { DOMHelper, SELECTORS } from './utils/domUtils';
import { ErrorHandler, ErrorLevel } from './utils/errorHandler';

export function takeScreenshot(map?: Map) {
  try {
    const hexCanvas = DOMHelper.getElement<HTMLCanvasElement>(
      SELECTORS.HEX_OVERLAY
    );

    if (!map) {
      ErrorHandler.logError(
        ErrorLevel.ERROR,
        'Map or canvas elements not available for screenshot',
        { operation: 'screenshot_elements_check' }
      );
      return;
    }

    // Get the map canvas and apply rotation manually
    const mapCanvas = document.querySelector(
      '.ol-layer canvas'
    ) as HTMLCanvasElement;
    if (mapCanvas) {
      const rotation = map.getView().getRotation();

      // Create a larger canvas for the rotated map to prevent clipping
      const diagonal = Math.sqrt(
        mapCanvas.width * mapCanvas.width + mapCanvas.height * mapCanvas.height
      );
      const rotatedCanvas = document.createElement('canvas');
      rotatedCanvas.width = diagonal;
      rotatedCanvas.height = diagonal;

      const ctx = rotatedCanvas.getContext('2d');
      if (ctx) {
        // Apply rotation with proper centering
        const centerX = diagonal / 2;
        const centerY = diagonal / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.translate(-mapCanvas.width / 2, -mapCanvas.height / 2);
        ctx.drawImage(mapCanvas, 0, 0);
        ctx.restore();

        // Create final canvas using hex overlay dimensions
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = CANVAS_DIMENSIONS.WIDTH;
        finalCanvas.height = CANVAS_DIMENSIONS.HEIGHT;
        const finalCtx = finalCanvas.getContext('2d');

        if (finalCtx) {
          // Center the rotated map in the final canvas
          const mapX = (CANVAS_DIMENSIONS.WIDTH - diagonal) / 2;
          const mapY = (CANVAS_DIMENSIONS.HEIGHT - diagonal) / 2;

          // Draw the rotated map
          finalCtx.drawImage(rotatedCanvas, mapX, mapY);

          // Draw the hex overlay on top
          finalCtx.drawImage(hexCanvas, 0, 0);

          finalCanvas.toBlob(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `final-screenshot-${Date.now()}.png`;
              a.click();
              URL.revokeObjectURL(url);

              ErrorHandler.logError(
                ErrorLevel.INFO,
                'Screenshot saved successfully',
                { operation: 'screenshot_save' }
              );
            } else {
              ErrorHandler.logError(
                ErrorLevel.ERROR,
                'Failed to create screenshot blob',
                { operation: 'screenshot_blob_creation' }
              );
            }
          }, 'image/png');
        } else {
          ErrorHandler.logError(
            ErrorLevel.ERROR,
            'Failed to get canvas context for final screenshot',
            { operation: 'screenshot_final_context' }
          );
        }
      } else {
        ErrorHandler.logError(
          ErrorLevel.ERROR,
          'Failed to get canvas context for rotation',
          { operation: 'screenshot_rotation_context' }
        );
      }
    } else {
      ErrorHandler.logError(
        ErrorLevel.ERROR,
        'Map canvas not found for screenshot',
        { operation: 'screenshot_map_canvas' }
      );
    }
  } catch (error) {
    ErrorHandler.logError(
      ErrorLevel.ERROR,
      'Failed to take screenshot',
      { operation: 'screenshot_take' },
      error
    );
  }
}
