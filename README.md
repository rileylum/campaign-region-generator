# Campaign Region

A D&D mapping tool that generates random coastal regions with hexagonal grid overlays for tabletop gaming.

## Features

- **Random coastal navigation** - Generates views of interesting coastal areas using seeded randomization
- **Multi-resolution maps** - Displays geographic features at appropriate detail levels based on zoom
- **Hexagonal grid overlay** - Configurable hex grid for measuring distances and movement
- **Screenshot capture** - Export map views with hex overlays for use in campaigns
- **Reproducible results** - Share specific views using seed values in URLs

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and click "Generate!" to explore random coastal regions.

## Controls

- **Generate Button** - Navigate to a new random coastal location
- **Hex Size Controls** - Adjust grid size from Tiny to Huge
- **Seed Input** - Enter specific seeds for reproducible results
- **Screenshot Button** - Download the current view with hex overlay

## Geographic Data

The application displays coastlines, land masses, rivers, lakes, and populated places at three resolution levels:
- High detail (10m) for close-up views
- Medium detail (50m) for regional views  
- Low detail (110m) for continental overviews

## TODO

- Toggle hex overlay on and off
- Increase resolution of screenshots
- Toggle land and ocean
- Add places
- User created features
- Terrain generation (both elevation and terrain types)
- Stocking using popular methods

## Data Attribution

Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com.

## Development

- `npm run build` - Build for production
- `npm run lint` - Check code style
- `npm run format` - Format code with Prettier
