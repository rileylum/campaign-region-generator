import './style.css'
import {Map,View} from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import LineString from 'ol/geom/LineString'
import {lineString as turfLineString} from '@turf/helpers'
import booleanIntersects from '@turf/boolean-intersects'
import {toLonLat, fromLonLat} from 'ol/proj'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Campaign Region</h1>
    <div id="map"></div>
    <button id="btn">Click Me!</div>
  </div>
`

const map = new Map({
  target: 'map',
  layers: [
    // new TileLayer({
    //   source: new OSM()
    // })
  ],
  view: new View({
    center: [0,0],
    zoom: 2.5
  }),
  controls: [],
})

fetch('/data110.geojson')
  .then(response => response.json())
  .then(geojsonData => {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        featureProjection: 'EPSG:3857'
      })
    })

    const vectorLayer = new VectorLayer({
      source: vectorSource
    })
    vectorLayer.set('id', 'coastline');
    map.addLayer(vectorLayer)
  })
  .catch(err => {
    console.error('Failed to load GeoJSON:', err)
  })

function getRandomLonLat() {
  const lon = Math.random() * 360 - 180;
  const lat = Math.random() * 180 - 90;
  return [lon, lat];
}

function getRandomZoom(min=2,max=18) {
  return Math.random() * (max - min) + min;
}

function getRandomRotation() {
  return Math.random() * 2 * Math.PI;
}

function getViewEdgeLines(extent) {
  const [minX, minY, maxX, maxY] = extent;

  return [
    new LineString([[minX,minY], [maxX,minY]]), //bottom
    new LineString([[maxX,minY], [maxX,maxY]]), //right
    new LineString([[maxX,maxY], [minX,maxY]]), //top
    new LineString([[minX,maxY], [minX,minY]]) //left
  ]
}

function olLineStringToTurf(lineGeom) {
  const coords3857 = lineGeom.getCoordinates()
  const coords4326 = coords3857.map(coord => toLonLat(coord))
  return turfLineString(coords4326)
}

function countEdgeIntersections(edgeLines, vectorSource, extent) {
  const visibleFeatures = vectorSource.getFeaturesInExtent(extent);
  let intersectingEdges = 0;

  for (const edge of edgeLines) {
    const turfEdge = olLineStringToTurf(edge);
    const intersects = visibleFeatures.some(feature => {
      const geom = feature.getGeometry();
      if (geom.getType() !== 'LineString') {
        console.log(geom.getType())
        return false
      }
      const turfFeature = olLineStringToTurf(geom);
      return booleanIntersects(turfEdge,turfFeature);
    })

    if (intersects) {
      console.log('found intersect')
      intersectingEdges++;
    }
  }
  console.log(`found ${intersectingEdges} intersections`)
  return intersectingEdges;
}

function goToRandomPlace(vectorSource) {
  const view = map.getView();
  const size = map.getSize();
  let attempts = 0;

  function tryView() {
    if (++attempts > 100) {
      console.warn('No valid view found.');
      return
    }

    const [lon, lat] = getRandomLonLat();
    const center = fromLonLat([lon, lat]);
    const zoom = getRandomZoom();
    const resolution = view.getResolutionForZoom(zoom);
    const width = size[0] * resolution;
    const height = size[1] * resolution;
    
    const extent = [
      center[0] - width/2,
      center[1] - height/2,
      center[0] + width/2,
      center[1] + height/2
    ]

    const edgeLines = getViewEdgeLines(extent);
    const intersecting = countEdgeIntersections(edgeLines, vectorSource, extent);

    if (intersecting >= 2) {

      const rotation = 
      view.animate({
        center,
        zoom,
        rotation: getRandomRotation(),
        duration: 0,
      });
    } else {
      requestAnimationFrame(tryView)
    }
  }

  tryView();
}

function handleClick() {
  const vectorLayer = map.getLayers().getArray().find(layer => layer.get('id') === 'coastline');
  const vectorSource = vectorLayer?.getSource();
  goToRandomPlace(vectorSource);
}

document.querySelector<HTMLButtonElement>('#btn')!.addEventListener("click", handleClick)
