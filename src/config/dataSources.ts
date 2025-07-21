/**
 * Data source configurations for different map layers
 */

import type { DataSource } from '../types';
import { MAP_STYLES, DRAW_ORDER } from './mapStyles';
import { DATA_ZOOM_THRESHOLDS } from '../constants';

function getBaseUrl(): string {
  return import.meta.env.BASE_URL || '/';
}

export const COASTLINE_SOURCES: DataSource[] = [
  {
    url: `${getBaseUrl()}coast110.fgb`,
    id: 'coastline-low',
    minZoom: 0,
    maxZoom: DATA_ZOOM_THRESHOLDS.LOW_TO_MID,
    style: MAP_STYLES.coast,
    zOrder: DRAW_ORDER.coast,
  },
  {
    url: `${getBaseUrl()}coast50.fgb`,
    id: 'coastline-mid',
    minZoom: DATA_ZOOM_THRESHOLDS.LOW_TO_MID,
    maxZoom: DATA_ZOOM_THRESHOLDS.MID_TO_HIGH,
    style: MAP_STYLES.coast,
    zOrder: DRAW_ORDER.coast,
  },
  {
    url: `${getBaseUrl()}coast10.fgb`,
    id: 'coastline-high',
    minZoom: DATA_ZOOM_THRESHOLDS.MID_TO_HIGH,
    maxZoom: DATA_ZOOM_THRESHOLDS.MAX_ZOOM,
    style: MAP_STYLES.coast,
    zOrder: DRAW_ORDER.coast,
  },
];

export const LAND_SOURCES: DataSource[] = [
  {
    url: `${getBaseUrl()}land110.fgb`,
    id: 'land-low',
    minZoom: 0,
    maxZoom: DATA_ZOOM_THRESHOLDS.LOW_TO_MID,
    style: MAP_STYLES.land,
    zOrder: DRAW_ORDER.land,
  },
  {
    url: `${getBaseUrl()}land50.fgb`,
    id: 'land-mid',
    minZoom: DATA_ZOOM_THRESHOLDS.LOW_TO_MID,
    maxZoom: DATA_ZOOM_THRESHOLDS.MID_TO_HIGH,
    style: MAP_STYLES.land,
    zOrder: DRAW_ORDER.land,
  },
  {
    url: `${getBaseUrl()}land10.fgb`,
    id: 'land-high',
    minZoom: DATA_ZOOM_THRESHOLDS.MID_TO_HIGH,
    maxZoom: DATA_ZOOM_THRESHOLDS.MAX_ZOOM,
    style: MAP_STYLES.land,
    zOrder: DRAW_ORDER.land,
  },
];

export const DATASOURCES: DataSource[][] = [LAND_SOURCES, COASTLINE_SOURCES];
