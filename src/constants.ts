/**
 * Application-wide constants to avoid magic numbers and improve maintainability
 */

// Canvas dimensions for hex overlay
export const CANVAS_DIMENSIONS = {
  WIDTH: 600,
  HEIGHT: 520,
} as const;

// Zoom level configuration
export const ZOOM_LEVELS = {
  MIN: 3,
  MAX: 10,
  DEFAULT: 18,
} as const;

// Multi-resolution data zoom thresholds
export const DATA_ZOOM_THRESHOLDS = {
  LOW_TO_MID: 5,
  MID_TO_HIGH: 9,
  MAX_ZOOM: 23,
} as const;

// Hex grid configuration
export const HEX_GRID = {
  STEP_MIN: 1,
  STEP_MAX: 5,
  DEFAULT_STEP: 3,
  DEFAULT_SIZE: 50,
} as const;

// Navigation configuration
export const NAVIGATION = {
  MAX_ATTEMPTS: 100,
  MIN_INTERSECTIONS: 2,
  INSET_RATIO: 0.05,
  DEGREES_PER_256_PIXELS: 360 / 256,
  MAX_SEED_VALUE: 1000000,
} as const;

// Server configuration
export const SERVER = {
  DEFAULT_PORT: 3000,
  CACHE_DURATION: 31536000, // 1 year in seconds
  CHUNK_SIZE: 64 * 1024, // 64KB chunks for streaming
  DEFAULT_CHUNK_SIZE: 64 * 1024,
} as const;

// File validation
export const ALLOWED_FILE_EXTENSIONS = /\.(fgb|geojson|json)$/;

// Coordinate systems
export const PROJECTIONS = {
  WEB_MERCATOR: 'EPSG:3857',
  WGS84: 'EPSG:4326',
} as const;

// Math constants
export const MATH = {
  HEX_ANGLE: Math.PI / 3,
  FULL_CIRCLE: 2 * Math.PI,
  SQRT_3: Math.sqrt(3),
} as const;

// Seeded random number generator constants
export const RANDOM_GENERATOR = {
  MULTIPLIER: 9301,
  INCREMENT: 49297,
  MODULUS: 233280,
} as const;

// Geographic coordinate bounds
export const GEOGRAPHIC_BOUNDS = {
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
} as const;
