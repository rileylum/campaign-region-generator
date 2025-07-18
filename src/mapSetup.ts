import { Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

import type { DataSource } from './types';

export function createMap(): Map {
  return new Map({
    target: 'map',
    layers: [],
    view: new View({
      center: [0, 0],
      zoom: 18,
      projection: 'EPSG:3857',
    }),
    controls: [],
  });
}

export function loadLayers(map: Map, theme: DataSource[]): Promise<void> {
  const promises = theme.map(({ url, id, minZoom, maxZoom, style, zOrder }) => {
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
          zIndex: zOrder,
          style: style,
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

export async function loadAllDatasources(
  map: Map,
  datasources: DataSource[][]
): Promise<void> {
  const promises = datasources.map(ds => loadLayers(map, ds));
  await Promise.all(promises);
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
