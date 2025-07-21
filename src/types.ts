/**
 * Type definitions for the D&D mapping application
 */

import type { Style } from 'ol/style';

export interface HexSizeConfig {
  size: number;
  label: string;
}

export interface DataSource {
  url: string;
  id: string;
  minZoom: number;
  maxZoom: number;
  style: Style;
  zOrder?: number;
}

// Re-export commonly used types and configs for backward compatibility
export { HEX_SIZE_MAP } from './config/hexSizes';
export {
  COASTLINE_SOURCES,
  LAND_SOURCES,
  DATASOURCES,
} from './config/dataSources';
