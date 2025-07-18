import { Map } from 'ol';
import VectorSource from 'ol/source/Vector';
import LineString from 'ol/geom/LineString';
import { lineString as turfLineString } from '@turf/helpers';
import booleanIntersects from '@turf/boolean-intersects';
import { toLonLat, fromLonLat } from 'ol/proj';

function getRandomLonLat() {
  const lon = Math.random() * 360 - 180;
  const lat = Math.random() * 180 - 90;
  return [lon, lat];
}

function getRandomZoom(min = 3, max = 13) {
  return Math.random() * (max - min) + min;
}

function getRandomRotation() {
  return Math.random() * 2 * Math.PI;
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
    const intersects = visibleFeatures.some((feature: any) => {
      const geom = feature.getGeometry();
      if (geom.getType() !== 'LineString') return false;
      const turfFeature = olLineStringToTurf(geom);
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
