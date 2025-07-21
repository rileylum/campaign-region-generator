/**
 * Map styling configuration
 */

import { Style, Stroke, Fill } from 'ol/style';

export const MAP_STYLES = {
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
} as const;

export const DRAW_ORDER = {
  land: 0,
  coast: 1,
} as const;
