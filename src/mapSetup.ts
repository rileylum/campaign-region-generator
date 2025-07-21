import { Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import LayerGroup from 'ol/layer/Group';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import createLoader from './createLoader';
import type { DataSource } from './types';
import { DATA_ZOOM_THRESHOLDS, ZOOM_LEVELS } from './constants';

export function createMap(): Map {
  return new Map({
    target: 'map',
    layers: [],
    view: new View({
      center: [0, 0],
      zoom: ZOOM_LEVELS.DEFAULT,
      projection: 'EPSG:3857',
    }),
    controls: [],
  });
}

function createLayerFromDataSource(
  dataSource: DataSource
): VectorLayer<VectorSource> {
  const { url, id, minZoom, maxZoom, style } = dataSource;

  // Create vector source with spatial loading strategy
  const vectorSource = new VectorSource({
    strategy: bboxStrategy,
  });

  // Create FlatGeobuf loader
  const loader = createLoader(
    vectorSource,
    url,
    'EPSG:4326',
    bboxStrategy,
    false
  );
  vectorSource.setLoader(loader);

  // Add event listeners for debugging
  vectorSource.on('featuresloadstart', () => {
    console.log(`Loading features from ${url}`);
  });

  vectorSource.on('featuresloadend', () => {
    console.log(`Finished loading features from ${url}`);
  });

  vectorSource.on('featuresloaderror', error => {
    console.error(`Error loading features from ${url}:`, error);
  });

  // Create vector layer with automatic zoom-based visibility
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: style,
    minZoom: minZoom,
    maxZoom: maxZoom,
  });

  vectorLayer.set('id', id);
  return vectorLayer;
}

function createLayerGroup(dataSources: DataSource[]): LayerGroup {
  const layers = dataSources.map(dataSource =>
    createLayerFromDataSource(dataSource)
  );

  const layerGroup = new LayerGroup({
    layers: layers,
  });

  // Set properties for identification and z-ordering
  if (dataSources.length > 0) {
    const layerType = dataSources[0].id.split('-')[0]; // e.g., 'coastline' from 'coastline-low'
    layerGroup.set('layerType', layerType);
    layerGroup.setZIndex(dataSources[0].zOrder ?? 0);
  }

  return layerGroup;
}

export async function loadAllDatasources(
  map: Map,
  datasources: DataSource[][]
): Promise<void> {
  // Create layer groups for each data source theme
  datasources.forEach(dataSourceGroup => {
    const layerGroup = createLayerGroup(dataSourceGroup);
    map.addLayer(layerGroup);
  });
}

export function getActiveCoastlineLayer(
  map: Map
): VectorLayer<VectorSource> | null {
  const currentZoom = map.getView().getZoom() || 0;

  // Find the coastline layer group
  const coastlineGroup = map
    .getLayers()
    .getArray()
    .find(
      layer =>
        layer instanceof LayerGroup && layer.get('layerType') === 'coastline'
    ) as LayerGroup;

  if (!coastlineGroup) {
    return null;
  }

  // Determine which coastline layer to use based on zoom level
  let targetId = 'coastline-low';
  if (currentZoom >= DATA_ZOOM_THRESHOLDS.MID_TO_HIGH) {
    targetId = 'coastline-high';
  } else if (currentZoom >= DATA_ZOOM_THRESHOLDS.LOW_TO_MID) {
    targetId = 'coastline-mid';
  }

  // Find the specific layer within the group
  return (
    (coastlineGroup
      .getLayers()
      .getArray()
      .find(
        layer => layer.get('id') === targetId
      ) as VectorLayer<VectorSource>) || null
  );
}
