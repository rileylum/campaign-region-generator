export function takeScreenshot() {
  const mapContainer = document.getElementById('map-container');
  const hexCanvas = document.getElementById('hex-overlay') as HTMLCanvasElement;

  if (!mapContainer || !hexCanvas) {
    console.error('Map container or hex canvas not found');
    return;
  }

  // Create a new canvas for the composite image
  const compositeCanvas = document.createElement('canvas');
  const rect = mapContainer.getBoundingClientRect();
  compositeCanvas.width = rect.width;
  compositeCanvas.height = rect.height;

  const ctx = compositeCanvas.getContext('2d');
  if (!ctx) return;

  // Use html2canvas-like approach with canvas API
  const mapElement = document.getElementById('map');
  if (mapElement) {
    // First, try to capture the map using canvas if available
    const mapCanvas = mapElement.querySelector('canvas');
    if (mapCanvas) {
      ctx.drawImage(
        mapCanvas,
        0,
        0,
        compositeCanvas.width,
        compositeCanvas.height
      );
    }
  }

  // Draw the hex overlay on top
  ctx.drawImage(hexCanvas, 0, 0);

  // Create download link with transparent background
  compositeCanvas.toBlob(blob => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-region-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
}
