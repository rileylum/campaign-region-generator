function drawHex(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  const angle = Math.PI / 3;
  ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));

  for (let side = 1; side <= 6; side++) {
    ctx.lineTo(
      x + radius * Math.cos(side * angle),
      y + radius * Math.sin(side * angle)
    );
  }
}

export function drawHexGrid(targetHexSize = 50) {
  const canvas = document.getElementById('hex-overlay') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Fixed canvas size
  canvas.width = 600;
  canvas.height = 520;
  canvas.style.width = 600;
  canvas.style.height = 520;
  ctx.clearRect(0, 0, 600, 520);

  const hexSize = targetHexSize;
  const hexHeight = Math.sqrt(3) * hexSize;
  const horizDist = hexSize * 1.5;
  const vertDist = hexHeight;

  // Calculate grid dimensions for 600x520 canvas
  const fullRowsThatFit = Math.floor(520 / vertDist);
  const targetRows = fullRowsThatFit + 0.5;
  const actualHeightNeeded = targetRows * vertDist;

  const cols = Math.ceil(600 / horizDist) + 1;
  const rows = Math.ceil(targetRows) + 1;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;

  const excessHeight = 520 - actualHeightNeeded;
  const startY = excessHeight / 2 + vertDist / 2 - vertDist;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = col * horizDist;
      const yOffset = (col % 2) * (vertDist / 2);
      const y = startY + row * vertDist + yOffset;

      // Simplified bounds check for 600x520 canvas
      const hexTop = y - (hexSize * Math.sqrt(3)) / 2;
      const hexBottom = y + (hexSize * Math.sqrt(3)) / 2;

      if (
        x >= -hexSize &&
        x <= 600 + hexSize &&
        hexBottom >= 0 &&
        hexTop <= 520
      ) {
        drawHex(ctx, x, y, hexSize);
      }
    }
  }

  ctx.stroke();
  ctx.restore();
}
