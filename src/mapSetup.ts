import { Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill } from 'ol/style';
import { COASTLINE_SOURCES, LAND_SOURCES, OCEAN_SOURCES } from './types';

export function createMap(): Map {
  return new Map({
    target: 'map',
    layers: [],
    view: new View({
      center: [0, 0],
      zoom: 18,
      projection: 'EPSG:3857'
    }),
    controls: [],
  });
}

export function loadCoastlineLayers(map: Map): Promise<void> {
  const promises = COASTLINE_SOURCES.map(({ url, id, minZoom, maxZoom }) => {
    return fetch(url)
      .then(response => response.json())
      .then(geojsonData => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(geojsonData, {
            featureProjection: 'EPSG:3857',
          }),
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            stroke: new Stroke({
              color: '#4682b4',
              width: 2,
            }),
          }),
        });

        vectorLayer.set('id', id);
        vectorLayer.set('minZoom', minZoom);
        vectorLayer.set('maxZoom', maxZoom);

        map.addLayer(vectorLayer);
      })
      .catch(err => {
        console.error(`Failed to load ${url}:`, err);
      });
  });

  return Promise.all(promises).then(() => {});
}

export function loadLandLayers(map: Map): Promise<void> {
  const promises = LAND_SOURCES.map(({ url, id, minZoom, maxZoom }) => {
    return fetch(url)
      .then(response => response.json())
      .then(geojsonData => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(geojsonData, {
            featureProjection: 'EPSG:3857'
          })
        })

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          opacity: 1,
          style: new Style({
            fill: new Fill({
              color: '#a8c686',
            })
          })
        })

        vectorLayer.set('id', id);
        vectorLayer.set('minZoom', minZoom);
        vectorLayer.set('maxZoom', maxZoom);

        map.addLayer(vectorLayer);
      })
      .catch(err => {
        console.error(`Failed to load ${url}:`, err)
      })
  })

  return Promise.all(promises).then(() => {})
}

export function loadOceanLayers(map: Map): Promise<void> {
  const promises = OCEAN_SOURCES.map(({ url, id, minZoom, maxZoom }) => {
    return fetch(url)
      .then(response => response.json())
      .then(geojsonData => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(geojsonData, {
            featureProjection: 'EPSG:3857'
          })
        })

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          opacity: 1,
          style: new Style({
            fill: new Fill({
              color: '#6baed6',
            })
          })
        })

        vectorLayer.set('id', id);
        vectorLayer.set('minZoom', minZoom);
        vectorLayer.set('maxZoom', maxZoom);

        map.addLayer(vectorLayer);
      })
      .catch(err => {
        console.error(`Failed to load ${url}:`, err)
      })
  })

  return Promise.all(promises).then(() => {})
}

export function getActiveCoastlineLayer(
  map: Map
): VectorLayer<VectorSource> | null {
  const currentZoom = map.getView().getZoom() || 0;

  // Determine which coastline layer to use based on zoom level
  let targetId = 'coastline-low';
  if (currentZoom >= 9) {
    targetId = 'coastline-high';
  } else if (currentZoom >= 5) {
    targetId = 'coastline-mid';
  }

  return (
    (map
      .getLayers()
      .getArray()
      .find(
        layer => layer.get('id') === targetId
      ) as VectorLayer<VectorSource>) || null
  );
}
