export interface HexSizeConfig {
  size: number;
  label: string;
}

export interface DataSource {
  url: string;
  id: string;
  minZoom: number;
  maxZoom: number;
}

export const HEX_SIZE_MAP: Record<number, HexSizeConfig> = {
  1: { size: 9.3, label: 'Tiny' },
  2: { size: 22.2, label: 'Small' },
  3: { size: 28.6, label: 'Medium' },
  4: { size: 40, label: 'Large' },
  5: { size: 66.7, label: 'Huge' },
};

export const COASTLINE_SOURCES: CoastlineSource[] = [
  {
    url: '/coast110.geojson',
    id: 'coastline-low',
    minZoom: 0,
    maxZoom: 5,
  },
  {
    url: '/coast50.geojson',
    id: 'coastline-mid',
    minZoom: 5,
    maxZoom: 9,
  },
  {
    url: '/coast10.geojson',
    id: 'coastline-high',
    minZoom: 9,
    maxZoom: 24,
  },
];

export const LAND_SOURCES: DataSource[] = [
  {
    url: '/land110.geojson',
    id: 'land-low',
    minZoom: 0,
    maxZoom: 5,
  },
  {
    url: '/land50.geojson',
    id: 'land-mid',
    minZoom: 5,
    maxZoom: 9,
  },
  {
    url: '/land10.geojson',
    id: 'land-high',
    minZoom: 9,
    maxZoom: 24,
  },
];

export const OCEAN_SOURCES: DataSource[] = [
  {
    url: '/ocean110.geojson',
    id: 'ocean-low',
    minZoom: 0,
    maxZoom: 5,
  },
  {
    url: '/ocean50.geojson',
    id: 'ocean-mid',
    minZoom: 5,
    maxZoom: 9,
  },
  {
    url: '/ocean10.geojson',
    id: 'ocean-high',
    minZoom: 9,
    maxZoom: 24,
  },
];
