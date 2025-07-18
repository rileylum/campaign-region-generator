import {
  Style,
  Stroke,
  Fill,
  Circle as CircleStyle,
  RegularShape,
} from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import type { StyleFunction } from 'ol/style/Style';

export interface HexSizeConfig {
  size: number;
  label: string;
}

export interface DataSource {
  url: string;
  id: string;
  minZoom: number;
  maxZoom: number;
  style: Style | StyleFunction;
  zOrder?: number;
}

export const HEX_SIZE_MAP: Record<number, HexSizeConfig> = {
  1: { size: 9.3, label: 'Tiny' },
  2: { size: 22.2, label: 'Small' },
  3: { size: 28.6, label: 'Medium' },
  4: { size: 40, label: 'Large' },
  5: { size: 66.7, label: 'Huge' },
};

function createRandomSymbol() {
  const index = Math.floor(Math.random() * 4); // 0–3
  const color = '#000';

  switch (index) {
    case 0: // Dot
      return new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color }),
        }),
      });

    case 1: // Dot with ring
      return new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color }),
          stroke: new Stroke({ color, width: 2 }),
        }),
      });

    case 2: // Star
      return new Style({
        image: new RegularShape({
          points: 5,
          radius: 6,
          radius2: 3,
          angle: 0,
          fill: new Fill({ color }),
          stroke: new Stroke({ color, width: 1 }),
        }),
      });

    case 3: // Square
      return new Style({
        image: new RegularShape({
          points: 4,
          radius: 5,
          angle: Math.PI / 4, // diamond/square
          fill: new Fill({ color }),
          stroke: new Stroke({ color, width: 1 }),
        }),
      });

    default:
      return new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color }),
        }),
      });
  }
}
function randomPlaceStyle(feature: FeatureLike): Style {
  // cache first assigned style
  if ('get' in feature && feature.get('symbolStyle')) {
    return feature.get('symbolStyle');
  }

  const symbolStyle = createRandomSymbol();
  if ('set' in feature) {
    feature.set('symbolStyle', symbolStyle);
  }
  return symbolStyle;
}

const STYLES = {
  coast: new Style({
    stroke: new Stroke({
      color: '#4682b4',
      width: 2,
    }),
  }),
  land: new Style({
    fill: new Fill({
      color: '#a8c686',
    }),
  }),
  ocean: new Style({
    fill: new Fill({
      color: '#6baed6',
    }),
  }),
  river: new Style({
    stroke: new Stroke({
      color: '#8fd3e5',
      width: 2,
    }),
  }),
  lake: new Style({
    fill: new Fill({
      color: '#8fd3e5',
    }),
  }),
  place: randomPlaceStyle,
};

const DRAWORDER = {
  ocean: 0,
  land: 1,
  river: 2,
  lake: 3,
  coast: 4,
  place: 5,
};

export const COASTLINE_SOURCES: DataSource[] = [
  {
    url: '/coast110.geojson',
    id: 'coastline-low',
    minZoom: 0,
    maxZoom: 5,
    style: STYLES.coast,
    zOrder: DRAWORDER.coast,
  },
  {
    url: '/coast50.geojson',
    id: 'coastline-mid',
    minZoom: 5,
    maxZoom: 9,
    style: STYLES.coast,
    zOrder: DRAWORDER.coast,
  },
  {
    url: '/coast10.geojson',
    id: 'coastline-high',
    minZoom: 9,
    maxZoom: 24,
    style: STYLES.coast,
    zOrder: DRAWORDER.coast,
  },
];

export const LAND_SOURCES: DataSource[] = [
  {
    url: '/land110.geojson',
    id: 'land-low',
    minZoom: 0,
    maxZoom: 5,
    style: STYLES.land,
    zOrder: DRAWORDER.land,
  },
  {
    url: '/land50.geojson',
    id: 'land-mid',
    minZoom: 5,
    maxZoom: 9,
    style: STYLES.land,
    zOrder: DRAWORDER.land,
  },
  {
    url: '/land10.geojson',
    id: 'land-high',
    minZoom: 9,
    maxZoom: 24,
    style: STYLES.land,
    zOrder: DRAWORDER.land,
  },
];

export const OCEAN_SOURCES: DataSource[] = [
  {
    url: '/ocean110.geojson',
    id: 'ocean-low',
    minZoom: 0,
    maxZoom: 5,
    style: STYLES.ocean,
    zOrder: DRAWORDER.ocean,
  },
  {
    url: '/ocean50.geojson',
    id: 'ocean-mid',
    minZoom: 5,
    maxZoom: 9,
    style: STYLES.ocean,
    zOrder: DRAWORDER.ocean,
  },
  {
    url: '/ocean10.geojson',
    id: 'ocean-high',
    minZoom: 9,
    maxZoom: 24,
    style: STYLES.ocean,
    zOrder: DRAWORDER.ocean,
  },
];

export const RIVER_SOURCES: DataSource[] = [
  {
    url: '/river110.geojson',
    id: 'river-low',
    minZoom: 0,
    maxZoom: 5,
    style: STYLES.river,
    zOrder: DRAWORDER.river,
  },
  {
    url: '/river50.geojson',
    id: 'river-mid',
    minZoom: 5,
    maxZoom: 9,
    style: STYLES.river,
    zOrder: DRAWORDER.river,
  },
  {
    url: '/river10.geojson',
    id: 'river-high',
    minZoom: 9,
    maxZoom: 24,
    style: STYLES.river,
    zOrder: DRAWORDER.river,
  },
];

export const LAKE_SOURCES: DataSource[] = [
  {
    url: '/lake110.geojson',
    id: 'lake-low',
    minZoom: 0,
    maxZoom: 5,
    style: STYLES.lake,
    zOrder: DRAWORDER.lake,
  },
  {
    url: '/lake50.geojson',
    id: 'lake-mid',
    minZoom: 5,
    maxZoom: 9,
    style: STYLES.lake,
    zOrder: DRAWORDER.lake,
  },
  {
    url: '/lake10.geojson',
    id: 'lake-high',
    minZoom: 9,
    maxZoom: 24,
    style: STYLES.lake,
    zOrder: DRAWORDER.lake,
  },
];

export const PLACE_SOURCES: DataSource[] = [
  {
    url: '/place110.geojson',
    id: 'place-low',
    minZoom: 0,
    maxZoom: 5,
    style: STYLES.place,
    zOrder: DRAWORDER.place,
  },
  {
    url: '/place50.geojson',
    id: 'place-mid',
    minZoom: 5,
    maxZoom: 9,
    style: STYLES.place,
    zOrder: DRAWORDER.place,
  },
  {
    url: '/place10.geojson',
    id: 'place-high',
    minZoom: 9,
    maxZoom: 24,
    style: STYLES.place,
    zOrder: DRAWORDER.place,
  },
];

export const DATASOURCES: DataSource[][] = [
  LAND_SOURCES,
  OCEAN_SOURCES,
  LAKE_SOURCES,
  RIVER_SOURCES,
  COASTLINE_SOURCES,
  // PLACE_SOURCES,
];
