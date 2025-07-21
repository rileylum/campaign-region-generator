/**
 * Utility functions for coastal location finding
 */

import { lineString } from '@turf/helpers';
import booleanIntersects from '@turf/boolean-intersects';
import bbox from '@turf/bbox';
import type { Feature, FeatureCollection, LineString, Geometry } from 'geojson';

// Constants for server-side calculations (matching frontend constants)
const NAVIGATION = {
  MAX_ATTEMPTS: 100,
  MIN_INTERSECTIONS: 2,
  INSET_RATIO: 0.05,
  DEGREES_PER_256_PIXELS: 360 / 256,
} as const;

const CANVAS_DIMENSIONS = {
  WIDTH: 600,
  HEIGHT: 520,
} as const;

const ZOOM_LEVELS = {
  MIN: 3,
  MAX: 10,
} as const;

const RANDOM_GENERATOR = {
  MULTIPLIER: 9301,
  INCREMENT: 49297,
  MODULUS: 233280,
} as const;

// Seeded random number generator
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed =
      (this.seed * RANDOM_GENERATOR.MULTIPLIER + RANDOM_GENERATOR.INCREMENT) %
      RANDOM_GENERATOR.MODULUS;
    return this.seed / RANDOM_GENERATOR.MODULUS;
  }
}

export interface LocationCandidate {
  center: [number, number];
  zoom: number;
  rotation: number;
  viewExtent: [number, number, number, number];
}

export interface CoastalLocation {
  center: [number, number]; // [lon, lat] in EPSG:4326
  zoom: number;
  rotation: number;
  seed: number;
}

/**
 * Generate a random location candidate using seeded RNG
 */
export function generateLocationCandidate(rng: SeededRandom): LocationCandidate {
  const lon = rng.next() * 360 - 180;
  const lat = rng.next() * 180 - 90;
  const zoom = rng.next() * (ZOOM_LEVELS.MAX - ZOOM_LEVELS.MIN) + ZOOM_LEVELS.MIN;
  const rotation = rng.next() * 2 * Math.PI;

  const center: [number, number] = [lon, lat];

  // Calculate view extent for intersection testing
  const degreesPerPixel = NAVIGATION.DEGREES_PER_256_PIXELS / Math.pow(2, zoom);
  const viewWidth = CANVAS_DIMENSIONS.WIDTH * degreesPerPixel;
  const viewHeight = CANVAS_DIMENSIONS.HEIGHT * degreesPerPixel;

  const viewExtent: [number, number, number, number] = [
    lon - viewWidth / 2,
    lat - viewHeight / 2,
    lon + viewWidth / 2,
    lat + viewHeight / 2
  ];

  return {
    center,
    zoom,
    rotation,
    viewExtent
  };
}

/**
 * Create edge lines for view extent intersection testing
 */
export function createViewExtentLines(
  center: [number, number],
  zoom: number,
  insetRatio = NAVIGATION.INSET_RATIO
): Feature<LineString>[] {
  // Approximate degrees per pixel at given zoom level
  const degreesPerPixel = NAVIGATION.DEGREES_PER_256_PIXELS / Math.pow(2, zoom);
  const viewWidth = CANVAS_DIMENSIONS.WIDTH * degreesPerPixel;
  const viewHeight = CANVAS_DIMENSIONS.HEIGHT * degreesPerPixel;

  const [centerLon, centerLat] = center;

  // Calculate extent with inset
  const halfWidth = (viewWidth / 2) * (1 - insetRatio);
  const halfHeight = (viewHeight / 2) * (1 - insetRatio);

  const minX = centerLon - halfWidth;
  const maxX = centerLon + halfWidth;
  const minY = centerLat - halfHeight;
  const maxY = centerLat + halfHeight;

  // Create edge lines (same as frontend logic)
  return [
    lineString([[minX, minY], [maxX, minY]]), // bottom
    lineString([[maxX, minY], [maxX, maxY]]), // right
    lineString([[maxX, maxY], [minX, maxY]]), // top
    lineString([[minX, maxY], [minX, minY]])  // left
  ];
}

/**
 * Filter coastline features within view extent for performance
 */
export function filterCoastlinesInExtent(
  coastlineFeatures: FeatureCollection,
  extent: [number, number, number, number]
): Feature<Geometry>[] {
  const [viewMinX, viewMinY, viewMaxX, viewMaxY] = extent;

  return coastlineFeatures.features.filter((feature) => {
    if (!feature.geometry || feature.geometry.type !== 'LineString') {
      return false;
    }

    // Quick bbox check
    const featureBbox = bbox(feature);
    return !(featureBbox[2] < viewMinX || featureBbox[0] > viewMaxX || 
             featureBbox[3] < viewMinY || featureBbox[1] > viewMaxY);
  }) as Feature<Geometry>[];
}

/**
 * Count intersections between edge lines and coastline features
 */
export function countCoastalIntersections(
  edgeLines: Feature<LineString>[],
  relevantCoastlines: Feature<Geometry>[]
): number {
  let intersectingEdges = 0;

  for (const edge of edgeLines) {
    const hasIntersection = relevantCoastlines.some((coastFeature) => {
      try {
        return booleanIntersects(edge, coastFeature);
      } catch (error) {
        // Skip invalid geometries
        return false;
      }
    });

    if (hasIntersection) {
      intersectingEdges++;
    }
  }

  return intersectingEdges;
}

/**
 * Test if a location candidate is valid (has sufficient coastal intersections)
 */
export function testLocationCandidate(
  candidate: LocationCandidate,
  coastlineData: FeatureCollection,
  minIntersections = NAVIGATION.MIN_INTERSECTIONS
): boolean {
  // Create edge lines for intersection testing
  const edgeLines = createViewExtentLines(candidate.center, candidate.zoom);

  // Filter coastlines within view extent
  const relevantCoastlines = filterCoastlinesInExtent(
    coastlineData,
    candidate.viewExtent
  );

  // Count intersections
  const intersections = countCoastalIntersections(edgeLines, relevantCoastlines);

  return intersections >= minIntersections;
}

/**
 * Create a coastal location result
 */
export function createCoastalLocation(
  candidate: LocationCandidate,
  seed: number,
  intersections?: number
): CoastalLocation {
  console.log(`Valid coastal location found:`, {
    center: candidate.center,
    zoom: candidate.zoom,
    rotation: candidate.rotation,
    intersections,
    seed
  });

  return {
    center: candidate.center,
    zoom: candidate.zoom,
    rotation: candidate.rotation,
    seed
  };
}

/**
 * Create fallback coastal location
 */
export function createFallbackLocation(seed: number): CoastalLocation {
  console.warn(`Using fallback coastal location`);
  return {
    center: [-73.9857, 40.7484], // New York Harbor
    zoom: 8,
    rotation: 0,
    seed
  };
}