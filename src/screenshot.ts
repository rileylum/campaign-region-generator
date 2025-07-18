import { Map } from 'ol';

export function takeScreenshot(map?: Map) {
  const hexCanvas = document.getElementById('hex-overlay') as HTMLCanvasElement;

  if (!hexCanvas || !map) {
    console.error('Canvas elements or map not found');
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
      finalCanvas.width = hexCanvas.width;
      finalCanvas.height = hexCanvas.height;
      const finalCtx = finalCanvas.getContext('2d');

      if (finalCtx) {
        // Center the rotated map in the final canvas
        const mapX = (hexCanvas.width - diagonal) / 2;
        const mapY = (hexCanvas.height - diagonal) / 2;

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
          }
        }, 'image/png');
      }
    }
  }
}
