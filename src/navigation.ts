import { Map } from 'ol';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import LineString from 'ol/geom/LineString';
import { lineString as turfLineString } from '@turf/helpers';
import booleanIntersects from '@turf/boolean-intersects';
import { toLonLat, fromLonLat } from 'ol/proj';
import { NAVIGATION, ZOOM_LEVELS } from './constants';
import { ErrorHandler, ErrorLevel } from './utils/errorHandler';
import { SeedManager } from './utils/seedManager';
import { SeededRandom } from './utils/seededRandom';

let rng: SeededRandom | null = null;

function setSeedForNavigation(seed: number) {
  rng = new SeededRandom(seed);
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

function getRandomZoom(min = ZOOM_LEVELS.MIN, max = ZOOM_LEVELS.MAX) {
  return seededRandom() * (max - min) + min;
}

function getRandomRotation() {
  return seededRandom() * 2 * Math.PI;
}

function getViewEdgeLines(
  extent: number[],
  insetRatio = NAVIGATION.INSET_RATIO
) {
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

// Interface for server response
interface CoastalLocation {
  center: [number, number]; // [lon, lat] in EPSG:4326
  zoom: number;
  rotation: number;
  seed: number;
}

export async function goToRandomPlace(map: Map, vectorSource?: VectorSource) {
  const view = map.getView();

  const currentSeed = SeedManager.getCurrentSeed();
  if (!currentSeed) {
    ErrorHandler.logError(ErrorLevel.WARN, 'No seed available for navigation', {
      operation: 'navigation_seed_check',
    });
    return;
  }

  try {
    // Get coastal location from server
    const response = await fetch(`/api/coastal-location/${currentSeed}`);

    if (!response.ok) {
      ErrorHandler.handleAPIError(
        `/api/coastal-location/${currentSeed}`,
        response.status,
        new Error(`HTTP ${response.status}`)
      );
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const location: CoastalLocation = await response.json();

    // Convert coordinates and apply to map
    const center = fromLonLat(location.center);

    ErrorHandler.logError(
      ErrorLevel.INFO,
      'Navigating to server-calculated coastal location',
      {
        operation: 'server_navigation',
        details: {
          center: location.center,
          zoom: location.zoom,
          rotation: location.rotation,
          seed: location.seed,
        },
      }
    );

    view.setCenter(center);
    view.setZoom(location.zoom);
    view.setRotation(location.rotation);
  } catch (error) {
    ErrorHandler.logError(
      ErrorLevel.ERROR,
      'Failed to get coastal location from server',
      { operation: 'server_navigation' },
      error
    );

    // Fallback to client-side logic if server fails and data is available
    if (vectorSource && vectorSource.getFeatures().length > 0) {
      ErrorHandler.logError(
        ErrorLevel.INFO,
        'Falling back to client-side navigation',
        { operation: 'client_fallback' }
      );
      setSeedForNavigation(currentSeed);
      goToRandomPlaceClientSide(map, vectorSource);
    } else {
      // Ultimate fallback to a fixed location
      ErrorHandler.logError(ErrorLevel.WARN, 'Using fallback location', {
        operation: 'fallback_location',
      });
      const center = fromLonLat([-73.9857, 40.7484]); // New York Harbor
      view.setCenter(center);
      view.setZoom(8);
      view.setRotation(0);
    }
  }
}

// Keep the original client-side logic as a fallback
function goToRandomPlaceClientSide(map: Map, vectorSource: VectorSource) {
  const view = map.getView();
  const size = map.getSize();
  if (!size) return;
  let attempts = 0;

  function tryView() {
    if (++attempts > NAVIGATION.MAX_ATTEMPTS) {
      ErrorHandler.logError(
        ErrorLevel.WARN,
        'No valid coastal view found after maximum attempts',
        { operation: 'client_navigation', details: { attempts } }
      );
      return;
    }

    const [lon, lat] = getRandomLonLat();
    const center = fromLonLat([lon, lat]);
    const zoom = getRandomZoom(ZOOM_LEVELS.MIN, ZOOM_LEVELS.MAX);
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

    if (intersecting >= NAVIGATION.MIN_INTERSECTIONS) {
      const rotation = getRandomRotation();
      ErrorHandler.logError(ErrorLevel.INFO, 'Valid coastal location found', {
        operation: 'client_navigation',
        details: { center: toLonLat(center), zoom, rotation, attempts },
      });
      view.setCenter(center);
      view.setZoom(zoom);
      view.setRotation(rotation);
    } else {
      requestAnimationFrame(tryView);
    }
  }

  tryView();
}
