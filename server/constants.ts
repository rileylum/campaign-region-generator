/**
 * Server-side constants
 */

// File validation
export const ALLOWED_FILE_EXTENSIONS = /\.(fgb|geojson|json)$/;

// Server configuration
export const SERVER = {
  DEFAULT_PORT: 3000,
  CACHE_DURATION: 31536000, // 1 year in seconds
  CHUNK_SIZE: 64 * 1024, // 64KB chunks for streaming
} as const;