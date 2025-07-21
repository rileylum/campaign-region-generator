import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { FeatureCollection } from 'geojson';
import {
  SeededRandom,
  generateLocationCandidate,
  testLocationCandidate,
  createCoastalLocation,
  createFallbackLocation,
  type CoastalLocation
} from './utils/coastalLocationUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for loaded coastline data
let coastlineCache: FeatureCollection | null = null;

async function loadCoastlineData(): Promise<FeatureCollection> {
  if (coastlineCache) {
    return coastlineCache;
  }

  try {
    // Load the medium resolution coastline GeoJSON for server-side calculations
    const coastPath = path.join(__dirname, '../public/coast50.geojson');
    const fileContent = await fs.promises.readFile(coastPath, 'utf-8');
    
    // Parse GeoJSON
    coastlineCache = JSON.parse(fileContent) as FeatureCollection;
    console.log(`Loaded ${coastlineCache.features.length} coastline features for server-side navigation`);
    return coastlineCache;
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error('[ERROR]', {
      timestamp,
      message: 'Failed to load coastline data',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });
    throw error;
  }
}


export async function findValidCoastalLocation(seed: number): Promise<CoastalLocation> {
  const rng = new SeededRandom(seed);
  const coastlineData = await loadCoastlineData();
  
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Generate a location candidate
    const candidate = generateLocationCandidate(rng);
    
    // Test if the candidate is valid
    if (testLocationCandidate(candidate, coastlineData)) {
      return createCoastalLocation(candidate, seed);
    }
  }
  
  // Fallback if no valid location found
  return createFallbackLocation(seed);
}