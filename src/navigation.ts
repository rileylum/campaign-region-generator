import { Map } from 'ol';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import LineString from 'ol/geom/LineString';
import { lineString as turfLineString } from '@turf/helpers';
import booleanIntersects from '@turf/boolean-intersects';
import { toLonLat, fromLonLat } from 'ol/proj';

// Seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

let currentSeed: number | null = null;
let rng: SeededRandom | null = null;

export function setSeed(seed: number | null) {
  currentSeed = seed;
  if (seed !== null) {
    rng = new SeededRandom(seed);
  } else {
    rng = null;
  }
}

export function getCurrentSeed(): number | null {
  return currentSeed;
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

export function getSeedFromURL(): number | null {
  const urlParams = new URLSearchParams(window.location.search);
  const seedParam = urlParams.get('seed');
  if (seedParam) {
    const seed = parseInt(seedParam, 10);
    return isNaN(seed) ? null : seed;
  }
  return null;
}

export function updateURLWithSeed(seed: number | null) {
  const url = new URL(window.location.href);
  if (seed !== null) {
    url.searchParams.set('seed', seed.toString());
  } else {
    url.searchParams.delete('seed');
  }
  window.history.replaceState({}, '', url.toString());
}

function seededRandom(): number {
  if (rng) {
    return rng.next();
  }
  return Math.random();
}

function getRandomLonLat() {
  const lon = seededRandom() * 360 - 180;
  const lat = seededRandom() * 180 - 90;
  return [lon, lat];
}

function getRandomZoom(min = 5, max = 12) {
  return seededRandom() * (max - min) + min;
}

function getRandomRotation() {
  return seededRandom() * 2 * Math.PI;
}

function getViewEdgeLines(extent: number[], insetRatio = 0.05) {
  let [minX, minY, maxX, maxY] = extent;

  const width = maxX - minX;
  const height = maxY - minY;

  const xInset = width * insetRatio;
  const yInset = height * insetRatio;

  minX += xInset;
  maxX -= xInset;
  minY += yInset;
  maxY -= yInset;

  return [
    new LineString([
      [minX, minY],
      [maxX, minY],
    ]), //bottom
    new LineString([
      [maxX, minY],
      [maxX, maxY],
    ]), //right
    new LineString([
      [maxX, maxY],
      [minX, maxY],
    ]), //top
    new LineString([
      [minX, maxY],
      [minX, minY],
    ]), //left
  ];
}

function olLineStringToTurf(lineGeom: LineString) {
  const coords3857 = lineGeom.getCoordinates();
  const coords4326 = coords3857.map((coord: number[]) => toLonLat(coord));
  return turfLineString(coords4326);
}

function countEdgeIntersections(
  edgeLines: LineString[],
  vectorSource: VectorSource,
  extent: number[]
) {
  const visibleFeatures = vectorSource.getFeaturesInExtent(extent);
  let intersectingEdges = 0;

  for (const edge of edgeLines) {
    const turfEdge = olLineStringToTurf(edge);
    const intersects = visibleFeatures.some((feature: Feature) => {
      const geom = feature.getGeometry();
      if (!geom || geom.getType() !== 'LineString') return false;
      const turfFeature = olLineStringToTurf(geom as LineString);
      return booleanIntersects(turfEdge, turfFeature);
    });

    if (intersects) intersectingEdges++;
  }
  return intersectingEdges;
}

export function goToRandomPlace(map: Map, vectorSource: VectorSource) {
  const view = map.getView();
  const size = map.getSize();
  if (!size) return;
  let attempts = 0;

  function tryView() {
    if (++attempts > 100) {
      console.warn('No valid view found.');
      return;
    }

    const [lon, lat] = getRandomLonLat();
    const center = fromLonLat([lon, lat]);
    const zoom = getRandomZoom(3, 10);
    const resolution = view.getResolutionForZoom(zoom);
    const width = size![0] * resolution;
    const height = size![1] * resolution;

    const extent = [
      center[0] - width / 2,
      center[1] - height / 2,
      center[0] + width / 2,
      center[1] + height / 2,
    ];

    const edgeLines = getViewEdgeLines(extent);
    const intersecting = countEdgeIntersections(
      edgeLines,
      vectorSource,
      extent
    );

    if (intersecting >= 2) {
      const rotation = getRandomRotation();
      console.log(toLonLat(center), zoom, rotation);
      view.setCenter(center);
      view.setZoom(zoom);
      view.setRotation(rotation);
    } else {
      requestAnimationFrame(tryView);
    }
  }

  tryView();
}
